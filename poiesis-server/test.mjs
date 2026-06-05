// 실제 서버를 띄우고 HTTP로 호출해 "진짜 동작"을 검증
import { DatabaseSync } from 'node:sqlite';
const BASE = 'http://localhost:4555';
let pass=0, fail=0; const ok=(c,m)=>{ c?pass++:(fail++,console.log('  X',m)); };
function jar(){ let c=''; return {
  headers(extra={}){ return c?{...extra,cookie:c}:extra; },
  capture(res){ const sc=res.headers.get('set-cookie'); if(sc) c=sc.split(';')[0]; },
};}
async function req(method,path,body,j){
  const res=await fetch(BASE+path,{method,headers:j.headers(body?{'content-type':'application/json'}:{}),body:body?JSON.stringify(body):undefined});
  if(j) j.capture(res);
  let data=null; try{data=await res.json()}catch(e){}
  return {status:res.status,data};
}
const A=jar(), B=jar();

let r=await req('POST','/api/auth/signup',{name:'제임스',email:'james@test.com',password:'secret1'},A);
ok(r.status===200 && r.data.user.email==='james@test.com','회원가입 성공');

const rdb=new DatabaseSync(process.env.DB_PATH);
const row=rdb.prepare('SELECT pw_hash FROM users WHERE email=?').get('james@test.com');
ok(row && /^\$2[aby]\$/.test(row.pw_hash) && !row.pw_hash.includes('secret1'),'비밀번호 bcrypt 해시 저장(평문 아님)');

r=await req('GET','/api/auth/me',null,A);
ok(r.data.user && r.data.user.name==='제임스','세션 로그인 상태 유지');

r=await req('POST','/api/auth/signup',{name:'또제임스',email:'james@test.com',password:'secret1'},B);
ok(r.status===409,'중복 이메일 가입 거부');

r=await req('POST','/api/auth/login',{email:'james@test.com',password:'wrong'},B);
ok(r.status===401,'틀린 비밀번호 거부');
r=await req('POST','/api/auth/login',{email:'james@test.com',password:'secret1'},B);
ok(r.status===200,'올바른 비밀번호 로그인 성공');

r=await req('GET','/api/products',null,A);
const dos=r.data.products.find(p=>p.id==='dostoevsky');
ok(dos.remaining===12,'도스토옙스키 남은 12권 [' +dos.remaining+ ']');

const shipping={name:'제임스',phone:'010-1234-5678',email:'james@test.com',address:'서울 강남구'};
r=await req('POST','/api/orders',{items:[{id:'dostoevsky',color:'Cognac',qty:2}],shipping,payMethod:'card'},A);
ok(r.status===200 && r.data.order.editions[0].from===22 && r.data.order.editions[0].to===23,'에디션 No.22~23 발급');
r=await req('GET','/api/products',null,A);
ok(r.data.products.find(p=>p.id==='dostoevsky').remaining===10,'주문 후 남은 10권 차감');

r=await req('POST','/api/orders',{items:[{id:'dostoevsky',color:'Cognac',qty:1}],shipping,payMethod:'card'},A);
ok(r.status===409 && r.data.code==='LIMIT','1인 2권 초과 거부');

for(let i=0;i<40;i++){
  const rr=await req('POST','/api/orders',{items:[{id:'origin',color:'Cognac',qty:2}],shipping,payMethod:'card'},jar());
  if(rr.status!==200 && rr.data.code==='SOLD_OUT') break;
}
r=await req('GET','/api/products',null,A);
let ori=r.data.products.find(p=>p.id==='origin');
ok(ori.sold<=33,'재고가 33 절대 초과 안 함 [sold='+ori.sold+']');
const last=await req('POST','/api/orders',{items:[{id:'origin',color:'Cognac',qty:1}],shipping,payMethod:'card'},jar());
r=await req('GET','/api/products',null,A);
ori=r.data.products.find(p=>p.id==='origin');
ok(last.status===200 && ori.sold===33 && ori.remaining===0,'마지막 1권까지 정확히 33권 마감 [sold='+ori.sold+']');
const over=await req('POST','/api/orders',{items:[{id:'origin',color:'Cognac',qty:1}],shipping,payMethod:'card'},jar());
ok(over.status===409 && over.data.code==='SOLD_OUT','33권 소진 후 SOLD_OUT 거부');

r=await req('GET','/api/orders',null,A);
ok(r.status===200 && r.data.orders.length>=1 && r.data.orders[0].items[0].edition_from===22,'내 주문 내역+에디션 넘버 조회');

console.log(`\nRESULT: ${pass} passed, ${fail} failed`);
process.exit(fail?1:0);
