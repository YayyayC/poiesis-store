/* ============================================================
   POIESIS — store front (vanilla JS SPA)
   ============================================================ */
'use strict';

/* ---------------- DATA ---------------- */
const FREE_SHIP = 150000;
const SHIP_FEE  = 3500;
const EDITION   = 33;   // 에디션당 한정 수량
const BUY_LIMIT = 2;    // 1인 구매 제한(한정판 공정 분배)

const PRODUCTS = [
  {
    id:'vinci',
    name:'Vinci',
    kr:'다빈치 에디션',
    price:168000,
    badge:'PRE-ORDER',
    available:false,
    sold0:19,
    tagline:'관찰하는 자의 노트',
    short:'끝없는 호기심으로 세계를 해부한 만능인. 비트루비안의 비율과 필사본의 결을 표지에 새깁니다.',
    images:['assets/img/vinci-cover.svg','assets/img/cover-poster.svg'],
    colors:[{name:'Noir',hex:'#15120d'},{name:'Cognac',hex:'#6b4a2f'}],
    desc:[
      '레오나르도 다 빈치는 화가이자 해부학자였고, 공학자이자 음악가였습니다. 그의 노트는 분야의 경계를 모른 채 흘러갔습니다 — 물의 소용돌이 옆에 새의 날개가, 인체의 비율 옆에 비행 기계의 스케치가 함께 놓였습니다.',
      'Vinci 에디션의 표지에는 비트루비안적 비율과 거울 글씨로 쓰인 필사본의 결이 골드 포일로 각인됩니다. 한 권 안에서 여러 분야를 넘나드는 당신의 사고를 위해 설계되었습니다.',
      '※ 현재 제작 준비 중인 에디션으로, 사전 예약을 받고 있습니다. 표지 이미지는 디자인 콘셉트이며 실제 제품과 다를 수 있습니다.'
    ]
  },
  {
    id:'dostoevsky',
    name:'Dostoevsky',
    kr:'도스토옙스키 에디션',
    price:168000,
    badge:'SIGNATURE',
    available:true,
    sold0:21,
    tagline:'심연을 응시하는 자의 노트',
    short:'정교회 십자가와 작가의 초상, 그리고 빼곡한 필사본의 결. 인간의 가장 깊은 질문을 담기 위한 한 권.',
    images:[
      'assets/img/dostoevsky-hero.jpg',
      'assets/img/dostoevsky-cover.jpg',
      'assets/img/dostoevsky-strap.jpg',
      'assets/img/dostoevsky-pair.jpg',
      'assets/img/dostoevsky-detail.jpg',
      'assets/img/cover-poster.svg'
    ],
    colors:[{name:'Cognac',hex:'#6b4a2f'},{name:'Espresso',hex:'#2e2017'}],
    desc:[
      '표도르 도스토옙스키는 인간 영혼의 가장 어두운 골짜기까지 내려가, 그곳에서 신앙과 자유, 죄와 구원을 길어 올렸습니다. 그의 문장은 늘 심연의 가장자리에서 쓰였습니다.',
      'Dostoevsky 에디션은 실제로 제작된 시그니처 시제품입니다. 풀그레인 가죽 위에 정교회 십자가와 작가의 초상, 그리고 그의 육필을 떠올리게 하는 필사본의 결을 레이저로 새겼습니다. 뒷면에는 POIESIS의 엠보싱 마크가 조용히 자리합니다.',
      '깊은 사유를 멈추지 않으려는 사람, 자신의 내면을 끝까지 따라가려는 사람을 위한 노트입니다.'
    ]
  },
  {
    id:'origin',
    name:'Origin',
    kr:'오리진',
    price:148000,
    badge:null,
    available:true,
    sold0:8,
    tagline:'아직 쓰이지 않은 노트',
    short:'어떤 각인도 없는 순수한 풀그레인 가죽. POIESIS의 엠보싱 마크 하나만을 남긴, 가장 본질적인 한 권.',
    images:['assets/img/origin-emboss.jpg','assets/img/cover-poster.svg'],
    colors:[{name:'Cognac',hex:'#6b4a2f'},{name:'Espresso',hex:'#2e2017'}],
    desc:[
      '어떤 대가의 흔적도 새기지 않은, 가장 정직한 형태의 POIESIS입니다. 표지에는 오직 작은 엠보싱 마크 하나만이 남아 있습니다.',
      '창조는 빈 페이지에서 시작됩니다. Origin은 그 시작 자체를 위한 노트입니다 — 당신의 손이 닿기 전까지는 아무것도 정해지지 않은, 순수한 가능성의 한 권.',
      'Vinci와 Dostoevsky 에디션과 동일한 가죽·제본·구성을 공유하며, 표지의 각인만을 덜어냈습니다.'
    ]
  }
];

const SPECS = [
  ['사이즈','A5 · 148 × 210 mm'],
  ['페이지','192p · 100gsm 도트 그리드'],
  ['가죽','이탈리아산 베지터블 풀그레인'],
  ['제본','라이플랫 양장 + 가죽 밴드'],
  ['구성','노트 · 전용 펜 · 밴드 · 기프트 박스'],
  ['제작','소량 핸드메이드 · Seoul']
];

const PAYMENTS = [
  {id:'card',name:'신용 · 체크카드',desc:'국내 모든 카드 결제 가능'},
  {id:'bank',name:'무통장 입금',desc:'주문 후 24시간 내 입금'},
  {id:'kakao',name:'카카오페이',desc:'간편결제'},
  {id:'naver',name:'네이버페이',desc:'간편결제'}
];

/* ---------------- HELPERS ---------------- */
const $  = (s,el=document)=>el.querySelector(s);
const $$ = (s,el=document)=>[...el.querySelectorAll(s)];
const won = n => '₩' + Number(n).toLocaleString('ko-KR');
const getProduct = id => PRODUCTS.find(p=>p.id===id);
const esc = s => String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const signalSVG = (w=120)=>`<svg width="${w}" viewBox="0 0 200 14" fill="currentColor" aria-hidden="true" style="display:inline-block;vertical-align:middle"><rect x="0" y="5" width="30" height="4"/><circle cx="48" cy="7" r="4.5"/><rect x="62" y="5" width="138" height="4"/></svg>`;

/* ============================================================
   API CLIENT — 백엔드 서버가 있으면 실제 연동, 없으면(파일로 열면) 데모 모드
   ============================================================ */
const SERVER = { mode:false, config:{}, products:{}, user:null };
async function api(path, opts={}){
  const res = await fetch(path, { headers:{'Content-Type':'application/json'}, credentials:'same-origin', ...opts });
  let data=null; try{ data=await res.json(); }catch(e){}
  return { ok:res.ok, status:res.status, data };
}
async function bootstrap(){
  try{
    const r = await fetch('/api/products', { credentials:'same-origin' });
    if(!r.ok) throw new Error('no-api');
    const pd = await r.json();
    SERVER.mode = true;
    (pd.products||[]).forEach(p=>{ SERVER.products[p.id] = p; });
    const cfg = await api('/api/config'); if(cfg.ok) SERVER.config = cfg.data;
    const me  = await api('/api/auth/me'); if(me.ok) SERVER.user = me.data.user;
  }catch(e){ SERVER.mode = false; }   // 서버 미존재 → 데모 모드 유지
}
async function refreshProducts(){
  if(!SERVER.mode) return;
  const r = await api('/api/products');
  if(r.ok){ SERVER.products = {}; r.data.products.forEach(p=>{ SERVER.products[p.id]=p; }); }
}

/* ---------------- CART (localStorage) ---------------- */
const CART_KEY = 'poiesis_cart_v1';
function getCart(){
  try{ return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
  catch(e){ return []; }
}
function saveCart(c){
  try{ localStorage.setItem(CART_KEY, JSON.stringify(c)); }catch(e){}
  updateCartCount();
}
function cartKey(id,color){ return id+'::'+color; }
function addToCart(id,color,qty){
  const rem = remaining(id);
  const already = inCartQty(id);
  const maxAdd = Math.max(0, Math.min(rem - already, BUY_LIMIT - already));
  if(maxAdd <= 0){
    toast(rem - already <= 0 ? '이 에디션은 모두 소진되었습니다.' : `한정판은 1인 ${BUY_LIMIT}권까지 구매할 수 있습니다.`);
    return false;
  }
  qty = Math.max(1, Math.min(qty, maxAdd));
  const cart = getCart();
  const k = cartKey(id,color);
  const found = cart.find(i=>i.key===k);
  if(found) found.qty += qty;
  else cart.push({key:k,id,color,qty});
  saveCart(cart);
  return true;
}
function setQty(key,qty){
  let cart = getCart();
  const it = cart.find(i=>i.key===key);
  if(!it) return;
  const cap = Math.min(BUY_LIMIT, remaining(it.id));
  qty = Math.max(1, Math.min(qty, cap));
  it.qty = qty;
  saveCart(cart);
}
function removeItem(key){
  saveCart(getCart().filter(i=>i.key!==key));
}
function cartCount(){ return getCart().reduce((s,i)=>s+i.qty,0); }
function cartSubtotal(){
  return getCart().reduce((s,i)=>{
    const p = getProduct(i.id); return s + (p ? p.price*i.qty : 0);
  },0);
}
function updateCartCount(){
  const el = $('#cartCount'); if(!el) return;
  const n = cartCount();
  el.textContent = n;
  el.classList.toggle('show', n>0);
}

/* ---------------- STOCK (limited edition, 33 each) ---------------- */
const STOCK_KEY = 'poiesis_stock_v1';
function getStock(){ try{ return JSON.parse(localStorage.getItem(STOCK_KEY))||{}; }catch(e){ return {}; } }
function soldCount(id){
  if(SERVER.mode && SERVER.products[id]) return SERVER.products[id].sold;
  const s = getStock();
  if(id in s) return s[id];
  const p = getProduct(id); return p ? (p.sold0||0) : 0;
}
function remaining(id){ return Math.max(0, EDITION - soldCount(id)); }
function inCartQty(id){ return getCart().filter(i=>i.id===id).reduce((s,i)=>s+i.qty,0); }
function addSold(id,n){
  const s = getStock();
  s[id] = soldCount(id) + n;
  try{ localStorage.setItem(STOCK_KEY, JSON.stringify(s)); }catch(e){}
}

/* ---------------- AUTH (localStorage demo) ---------------- */
const SESSION_KEY = 'poiesis_session_v1';
const USERS_KEY   = 'poiesis_users_v1';
function getUser(){
  if(SERVER.mode) return SERVER.user;
  try{ return JSON.parse(localStorage.getItem(SESSION_KEY))||null; }catch(e){ return null; }
}
function setUser(u){ try{ localStorage.setItem(SESSION_KEY, JSON.stringify(u)); }catch(e){} updateAuthUI(); }
function logout(){ try{ localStorage.removeItem(SESSION_KEY); }catch(e){} updateAuthUI(); }
function getUsers(){ try{ return JSON.parse(localStorage.getItem(USERS_KEY))||[]; }catch(e){ return []; } }
function saveUsers(list){ try{ localStorage.setItem(USERS_KEY, JSON.stringify(list)); }catch(e){} }
function findUser(email){ return getUsers().find(u=>u.email.toLowerCase()===email.toLowerCase()); }
function registerUser(name,email,password){
  const list = getUsers();
  list.push({name,email,password,joined:new Date().toISOString()});
  saveUsers(list);
}
function updateAuthUI(){
  const link = $('#acctLink'); if(!link) return;
  const u = getUser();
  if(u){
    const nm = u.name || u.email.split('@')[0];
    link.textContent = nm;
    link.setAttribute('href','#/account');
    link.dataset.auth='in';
  } else {
    link.textContent = '로그인';
    link.setAttribute('href','#/login');
    link.dataset.auth='out';
  }
}

/* ---------------- TOAST ---------------- */
function toast(msg){
  const wrap = $('#toastWrap');
  const t = document.createElement('div');
  t.className='toast';
  t.innerHTML = `<span class="ic">✦</span><span>${esc(msg)}</span>`;
  wrap.appendChild(t);
  requestAnimationFrame(()=>t.classList.add('show'));
  setTimeout(()=>{ t.classList.remove('show'); setTimeout(()=>t.remove(),500); }, 2600);
}

/* ============================================================
   VIEWS
   ============================================================ */

function viewHome(){
  const feat = getProduct('dostoevsky');
  return `
  <section class="hero">
    <img class="hero-figure" src="assets/img/vinci-cover.svg" alt="">
    <div class="hero-inner reveal">
      <div class="mark" style="color:var(--gold);margin-bottom:24px">${signalSVG(120)}</div>
      <div class="scarcity"><span class="dotpulse"></span>에디션당 단 ${EDITION}권 · 핸드메이드 한정 제작</div>
      <h1>창조하는 손을 위한<br><em>한 권의 가죽 노트</em></h1>
      <p class="lede">Create, act, and sincerely listen to your inner signal. Follow it, and go on.</p>
      <div class="cta-row">
        <a href="#/products" class="btn btn-solid btn-lg">한정 컬렉션 보기</a>
        <a href="#/about" class="btn btn-lg">브랜드 이야기</a>
      </div>
    </div>
    <div class="scroll-hint"><span>Scroll</span><span class="bar"></span></div>
  </section>

  <section style="padding:0">
    <div class="container" style="padding-top:64px;padding-bottom:64px">
      <div class="trust-row reveal">
        <div class="t"><div class="ic">✦</div><div class="tl">에디션당 33권</div><div class="ts">고유 넘버 정품 보증</div></div>
        <div class="t"><div class="ic">⤳</div><div class="tl">무료 배송</div><div class="ts">15만 원 이상 구매 시</div></div>
        <div class="t"><div class="ic">↺</div><div class="tl">14일 교환·반품</div><div class="ts">미사용 시 안심 반품</div></div>
        <div class="t"><div class="ic">⌘</div><div class="tl">전용 펜·기프트 박스</div><div class="ts">모든 에디션 기본 포함</div></div>
      </div>
    </div>
  </section>

  <section class="philosophy section">
    <div class="container reveal">
      <p class="quote">창조의 영혼은 사라지지 않습니다. 다만 <span>위대한 손들</span>을 통해 다시 깨어날 뿐입니다.</p>
      <div class="attribution">— The POIESIS Manifesto</div>
    </div>
  </section>

  <section class="section" id="collection">
    <div class="container">
      <div class="section-head center reveal">
        <span class="eyebrow">The Collection</span>
        <div class="divider"></div>
        <h2>세 명의 대가, 세 권의 노트</h2>
        <p>각 에디션은 한 사람의 창조 정신을 표지에 새깁니다. 같은 가죽, 같은 제본 — 다른 영혼.</p>
      </div>
      <div class="product-grid">
        ${PRODUCTS.map(cardHTML).join('')}
      </div>
    </div>
  </section>

  <section class="section" style="padding-top:0">
    <div class="container">
      <div class="section-head center reveal">
        <span class="eyebrow">Why POIESIS</span>
        <div class="divider"></div>
        <h2>분위기만이 아닙니다</h2>
        <p>매일 손에 닿는 물건의 기준을 다시 씁니다. 감성과 실용을 모두 갖춘 한 권.</p>
      </div>
      <div class="benefit-grid reveal">
        <div class="benefit"><div class="ic">✦</div><h4>이탈리아산 풀그레인 가죽</h4><p>보급형 가죽이 아닌, 한 장씩 손으로 고른 베지터블 풀그레인. 쓸수록 깊어지는 파티나가 시간을 기록합니다.</p></div>
        <div class="benefit"><div class="ic">▤</div><h4>180도 펼쳐지는 라이플랫 제본</h4><p>어느 페이지에서도 책이 닫히지 않습니다. 100gsm 도트 그리드 192p — 만년필 번짐이 적은 지질.</p></div>
        <div class="benefit"><div class="ic">№</div><h4>고유 넘버 정품 보증</h4><p>에디션당 33권. 모든 노트에 No.○○/33 시리얼과 정품 보증서가 동봉되어, 단 하나뿐인 소장 가치를 더합니다.</p></div>
        <div class="benefit"><div class="ic">❏</div><h4>선물 그대로, 완성된 구성</h4><p>전용 펜·가죽 밴드·기프트 박스가 기본 포함. 받는 순간 그 자체로 완결된 선물이 됩니다.</p></div>
      </div>
    </div>
  </section>

  <section class="section" style="padding-top:0">
    <div class="container">
      <div class="feature reverse">
        <div class="feature-media reveal"><img src="assets/img/dostoevsky-detail.jpg" alt="가죽 표지 각인 디테일"></div>
        <div class="feature-body reveal">
          <span class="eyebrow">Craftsmanship</span>
          <h2>한 장의 가죽, 하나의 이야기</h2>
          <p>이탈리아산 베지터블 풀그레인 가죽을 한 장씩 손으로 골라, 결과 흠집까지 그대로 살립니다. 시간이 지날수록 손의 온기를 머금고 깊어지는 가죽입니다.</p>
          <p>표지의 초상과 필사본의 결은 레이저로 한 권씩 새기며, 뒷면에는 POIESIS의 엠보싱 마크가 조용히 자리합니다.</p>
          <ul class="spec-list">
            ${SPECS.slice(0,4).map(([k,v])=>`<li><span>${k}</span><span>${v}</span></li>`).join('')}
          </ul>
        </div>
      </div>
    </div>
  </section>

  <section class="section" style="padding-top:0">
    <div class="container">
      <div class="values">
        <div class="value reveal"><div class="num">01</div><h4>Poiesis — 만들어 냄</h4><p>‘포이에시스’는 없던 것을 세상에 불러내는 그리스어입니다. 시(poetry)의 어원이기도 합니다.</p></div>
        <div class="value reveal"><div class="num">02</div><h4>대가들의 정신</h4><p>다작이면서도 창조적이었던 대가들의 태도를, 매일 펼치는 노트 위에서 다시 마주합니다.</p></div>
        <div class="value reveal"><div class="num">03</div><h4>당신의 신호</h4><p>노트는 도구가 아니라 약속입니다 — 내면의 신호에 귀 기울이고, 그것을 따라가겠다는 약속.</p></div>
      </div>
    </div>
  </section>

  <section class="section" style="padding-top:0">
    <div class="container">
      <div class="section-head center reveal">
        <span class="eyebrow">Reviews</span>
        <div class="divider"></div>
        <h2>먼저 받아본 사람들</h2>
        <p>평점 4.9 / 5.0 · 초기 에디션 구매자 후기</p>
      </div>
      <div class="reviews">
        <div class="review reveal"><div class="stars">★★★★★</div><div class="body">“다이어리라기보다 작은 작품을 받은 기분. 넘버가 새겨진 보증서까지 보고 선물한 친구가 정말 좋아했어요.”</div><div class="who"><b>김＊은</b> · Dostoevsky Edition <span class="vbadge">✓ 구매 확인</span></div></div>
        <div class="review reveal"><div class="stars">★★★★★</div><div class="body">“가죽 질감이 사진보다 훨씬 좋아요. 180도로 펼쳐져서 필기할 때 손목이 편하고, 만년필도 안 번집니다.”</div><div class="who"><b>이＊호</b> · Origin <span class="vbadge">✓ 구매 확인</span></div></div>
        <div class="review reveal"><div class="stars">★★★★★</div><div class="body">“33권 한정이라는 점이 마음에 들었어요. 흔한 노트가 아니라 ‘내 번호’가 있다는 느낌. 다음 에디션도 기다립니다.”</div><div class="who"><b>정＊아</b> · Dostoevsky Edition <span class="vbadge">✓ 구매 확인</span></div></div>
      </div>
    </div>
  </section>

  <section class="cta-band section">
    <div class="container reveal">
      <span class="eyebrow">Newsletter</span>
      <h2 style="margin-top:16px">먼저 만나보세요</h2>
      <p>새로운 에디션과 한정 제작 소식을 가장 먼저 전해드립니다. Vinci 에디션 사전 예약 알림도 함께.</p>
      <form class="subscribe" id="subForm">
        <input type="email" id="subEmail" placeholder="이메일 주소" required>
        <button type="submit">구독</button>
      </form>
      <div class="sub-msg" id="subMsg"></div>
    </div>
  </section>`;
}

function cardHTML(p){
  const rem = remaining(p.id);
  const out = rem<=0;
  const badge = out ? 'SOLD OUT' : p.badge;
  const badgeCls = out ? 'badge sold' : 'badge';
  const stockText = p.available
    ? (out ? '이번 에디션 품절' : `${EDITION}권 한정 · 남은 ${rem}권`)
    : (out ? '예약 마감' : `${EDITION}권 한정 · 예약 가능 ${rem}권`);
  return `
  <a class="product-card" href="#/product/${p.id}">
    <div class="media">
      ${badge?`<span class="${badgeCls}">${badge}</span>`:''}
      <img src="${p.images[0]}" alt="${esc(p.kr)}" loading="lazy">
    </div>
    <div class="body">
      <div class="kr">${esc(p.kr)}</div>
      <h3>${p.name}</h3>
      <p class="desc">${esc(p.short)}</p>
      <div class="edition-chip" style="margin-bottom:16px">— ${stockText}</div>
      <div class="foot">
        <span class="price">${won(p.price)}</span>
        <span class="arrow">${out?'대기 신청 →':'자세히 →'}</span>
      </div>
    </div>
  </a>`;
}

function viewProducts(){
  return `
  <section class="page">
    <div class="container">
      <div class="section-head reveal">
        <span class="eyebrow">The Collection</span>
        <div class="divider"></div>
        <h1 class="page-title">컬렉션</h1>
        <p class="page-sub">위대한 대가들의 창조 정신을 담은 세 가지 에디션.</p>
      </div>
      <div class="product-grid">
        ${PRODUCTS.map(cardHTML).join('')}
      </div>
    </div>
  </section>`;
}

function viewProduct(id){
  const p = getProduct(id);
  if(!p) return viewNotFound();
  const multi = p.images.length>1;
  const rem = remaining(p.id);
  const out = rem<=0;
  const sold = soldCount(p.id);
  const pct = Math.round(sold/EDITION*100);
  const low = !out && rem<=10;
  const stockBlock = `
    <div class="stock${low?' stock-low':''}">
      <div class="stock-meta">
        <span class="left">${out?'이번 에디션 소진':`남은 ${rem}권`} <span style="color:var(--muted);font-weight:400;font-size:.85rem">/ ${EDITION}권 한정</span></span>
        <span>${p.available?`<b>${sold}권</b> 판매됨`:`<b>${sold}권</b> 예약됨`}</span>
      </div>
      <div class="stock-bar"><i style="width:${Math.max(pct,4)}%"></i></div>
      ${low?`<div style="margin-top:8px;font-size:.8rem;color:var(--danger)">⚠ 마지막 ${rem}권 — 이 에디션은 곧 마감됩니다.</div>`:''}
    </div>`;
  return `
  <section class="pd">
    <div class="container">
      <div class="crumb reveal">
        <a href="#/products">Collection</a> <span>/</span> <span>${esc(p.kr)}</span>
      </div>
      <div class="pd-grid">
        <div class="pd-gallery reveal">
          <div class="pd-main"><img id="pdMain" src="${p.images[0]}" alt="${esc(p.kr)}"></div>
          ${multi?`<div class="pd-thumbs">${p.images.map((src,i)=>`
            <div class="pd-thumb${i===0?' active':''}" data-img="${src}"><img src="${src}" alt=""></div>`).join('')}</div>`:''}
        </div>
        <div class="pd-info reveal">
          <div class="kr">${esc(p.kr)}</div>
          <h1>${p.name}</h1>
          <p class="tagline">${esc(p.tagline)}</p>
          <div class="pd-price">${won(p.price)} <small>· 무이자 할부 가능 · 에디션당 ${EDITION}권 한정</small></div>
          ${stockBlock}
          ${!p.available?`<div class="notice"><span>✦</span><span>현재 사전 예약 중인 에디션입니다. 결제 시 예약 주문으로 접수되며, 제작 완료 후 예약 순서대로 배송됩니다.</span></div>`:''}
          <div class="pd-desc">${p.desc.map(d=>`<p>${esc(d)}</p>`).join('')}</div>

          <div class="opt-group">
            <div class="opt-label">가죽 컬러 <b id="colorName">${esc(p.colors[0].name)}</b></div>
            <div class="swatches" id="swatches">
              ${p.colors.map((c,i)=>`<button class="swatch${i===0?' active':''}" data-color="${esc(c.name)}">
                <span class="dot" style="background:${c.hex}"></span>${esc(c.name)}</button>`).join('')}
            </div>
          </div>

          <div class="opt-group">
            <div class="opt-label">수량 <b>1인 ${BUY_LIMIT}권 한정</b></div>
            <div class="qty" data-qty>
              <button type="button" data-step="-1">−</button>
              <input id="qtyInput" type="text" value="1" inputmode="numeric" aria-label="수량">
              <button type="button" data-step="1">+</button>
            </div>
          </div>

          <div class="pd-actions">
          ${out
            ? `<button class="btn btn-solid btn-block" id="waitBtn">품절 · 다음 에디션 알림 신청</button>`
            : `<button class="btn btn-solid" id="addBtn" data-id="${p.id}">${p.available?'장바구니에 담기':'사전 예약하기'}</button>
               <button class="btn" id="buyNow" data-id="${p.id}">${p.available?'바로 구매':'바로 예약'}</button>`}
          </div>

          <div class="pd-meta">
            <div><span class="ic">✦</span><span>15만원 이상 구매 시 무료 배송 · 3–5 영업일 내 출고</span></div>
            <div><span class="ic">✦</span><span>전용 펜 · 가죽 밴드 · 기프트 박스 기본 포함</span></div>
            <div><span class="ic">✦</span><span>수령 후 14일 이내 교환 · 반품 가능</span></div>
          </div>
        </div>
      </div>

      <div class="pd-specs reveal">
        <div>
          <h3>Specification</h3>
          <ul class="spec-list">
            ${SPECS.map(([k,v])=>`<li><span>${k}</span><span>${v}</span></li>`).join('')}
          </ul>
        </div>
        <div>
          <h3>Care</h3>
          <p style="color:var(--muted)">천연 가죽은 사용할수록 고유의 색과 광택(파티나)이 깊어집니다. 물기는 마른 천으로 가볍게 닦아내고, 직사광선과 장시간의 습기는 피해 주세요. 가끔 무색 가죽 왁스를 얇게 발라 주면 오래도록 결을 유지할 수 있습니다.</p>
          <p style="color:var(--muted);margin-top:14px">각인된 표지의 미세한 결과 색 편차는 천연 가죽과 수작업의 특성으로, 모든 노트가 단 하나뿐인 이유입니다.</p>
        </div>
      </div>
    </div>
  </section>`;
}

function viewCart(){
  const cart = getCart();
  if(!cart.length){
    return `<section class="page"><div class="container"><div class="empty reveal">
      <div class="icon">✦</div>
      <h3>장바구니가 비어 있습니다</h3>
      <p>아직 담긴 노트가 없습니다. 세 명의 대가를 만나보세요.</p>
      <a href="#/products" class="btn btn-solid">컬렉션 보기</a>
    </div></div></section>`;
  }
  const subtotal = cartSubtotal();
  const ship = subtotal>=FREE_SHIP?0:SHIP_FEE;
  return `
  <section class="page">
    <div class="container">
      <div class="section-head reveal"><h1 class="page-title">장바구니</h1>
        <p class="page-sub">${cartCount()}개의 노트가 담겨 있습니다.</p></div>
      <div class="cart-grid">
        <div class="reveal">
          ${cart.map(cartLineHTML).join('')}
          <a href="#/products" style="display:inline-block;margin-top:26px;color:var(--gold);font-size:.85rem;letter-spacing:.1em">← 쇼핑 계속하기</a>
        </div>
        <aside class="summary reveal">
          <h3>주문 요약</h3>
          <div class="row"><span>상품 합계</span><span>${won(subtotal)}</span></div>
          <div class="row"><span>배송비</span><span>${ship===0?'무료':won(ship)}</span></div>
          ${ship!==0?`<div class="row" style="color:var(--gold-deep);font-size:.8rem"><span>${won(FREE_SHIP-subtotal)} 더 담으면 무료 배송</span><span></span></div>`:''}
          <div class="row total"><span>결제 예정 금액</span><b>${won(subtotal+ship)}</b></div>
          <a href="#/checkout" class="btn btn-solid btn-block">주문하기</a>
          <p class="note">결제 단계에서 배송지와 결제 수단을 입력합니다.<br>모든 거래는 안전하게 보호됩니다.</p>
        </aside>
      </div>
    </div>
  </section>`;
}

function cartLineHTML(it){
  const p = getProduct(it.id); if(!p) return '';
  return `
  <div class="cart-line" data-key="${it.key}">
    <a class="thumb" href="#/product/${p.id}" style="grid-area:thumb"><img src="${p.images[0]}" alt=""></a>
    <div style="grid-area:info">
      <div class="ttl">${p.name} <span style="font-size:.9rem;color:var(--muted)">· ${esc(p.kr)}</span></div>
      <div class="opt">컬러: ${esc(it.color)}</div>
      <div class="qty" data-cartqty data-key="${it.key}">
        <button type="button" data-step="-1">−</button>
        <input type="text" value="${it.qty}" inputmode="numeric" aria-label="수량">
        <button type="button" data-step="1">+</button>
      </div>
      <button class="remove" data-remove="${it.key}">삭제</button>
    </div>
    <div class="ln-price" style="grid-area:price">${won(p.price*it.qty)}</div>
  </div>`;
}

function viewCheckout(){
  const cart = getCart();
  if(!cart.length) { location.hash='#/cart'; return viewCart(); }
  const subtotal = cartSubtotal();
  const ship = subtotal>=FREE_SHIP?0:SHIP_FEE;
  const u = getUser() || {};
  return `
  <section class="page">
    <div class="container">
      <div class="crumb reveal"><a href="#/cart">Cart</a> <span>/</span> <span>Checkout</span></div>
      <div class="section-head reveal"><h1 class="page-title">주문 · 결제</h1>
        ${u.email?`<p class="page-sub" style="margin-bottom:0">${esc(u.name||'회원')} 님으로 로그인 중 · 배송 정보가 자동 입력되었습니다.</p>`:`<p class="page-sub" style="margin-bottom:0"><a href="#/login" style="color:var(--gold)">로그인</a>하면 정보가 자동 입력됩니다.</p>`}</div>
      <form id="checkoutForm" class="checkout-grid" novalidate>
        <div class="reveal">
          <fieldset>
            <legend>배송 정보</legend>
            <div class="field">
              <label>받는 분 <span class="req">*</span></label>
              <input name="name" type="text" placeholder="이름" value="${esc(u.name||'')}">
              <div class="err">이름을 입력해 주세요.</div>
            </div>
            <div class="field-row">
              <div class="field">
                <label>휴대폰 <span class="req">*</span></label>
                <input name="phone" type="tel" placeholder="010-1234-5678">
                <div class="err">올바른 연락처를 입력해 주세요.</div>
              </div>
              <div class="field">
                <label>이메일 <span class="req">*</span></label>
                <input name="email" type="email" placeholder="you@email.com" value="${esc(u.email||'')}">
                <div class="err">올바른 이메일을 입력해 주세요.</div>
              </div>
            </div>
            <div class="field">
              <label>우편번호 <span class="req">*</span></label>
              <div style="display:flex;gap:12px"><input name="postal" type="text" placeholder="00000" style="max-width:200px"><button type="button" class="btn" id="zipBtn" style="padding:0 22px">주소 찾기</button></div>
              <div class="err">우편번호를 입력해 주세요.</div>
            </div>
            <div class="field">
              <label>주소 <span class="req">*</span></label>
              <input name="address" type="text" placeholder="기본 주소">
              <div class="err">주소를 입력해 주세요.</div>
            </div>
            <div class="field">
              <label>상세 주소</label>
              <input name="address2" type="text" placeholder="동 · 호수 등 상세 주소">
            </div>
            <div class="field">
              <label>배송 메모</label>
              <textarea name="memo" rows="2" placeholder="예: 부재 시 문 앞에 놓아 주세요"></textarea>
            </div>
          </fieldset>

          <fieldset>
            <legend>결제 수단</legend>
            <div class="pay-methods" id="payMethods">
              ${PAYMENTS.map((m,i)=>`
              <label class="pay-opt${i===0?' active':''}">
                <input type="radio" name="pay" value="${m.id}" ${i===0?'checked':''}>
                <span><span class="pm-name">${m.name}</span><br><span class="pm-desc">${m.desc}</span></span>
              </label>`).join('')}
            </div>
          </fieldset>
        </div>

        <aside class="summary reveal">
          <h3>주문 요약</h3>
          <div class="co-items">
            ${cart.map(it=>{const p=getProduct(it.id);return `
            <div class="co-item">
              <div class="thumb"><img src="${p.images[0]}" alt=""></div>
              <div class="meta"><div class="nm">${p.name}</div><div class="q">${esc(it.color)} · 수량 ${it.qty}</div></div>
              <div class="pr">${won(p.price*it.qty)}</div>
            </div>`;}).join('')}
          </div>
          <div class="row"><span>상품 합계</span><span>${won(subtotal)}</span></div>
          <div class="row"><span>배송비</span><span>${ship===0?'무료':won(ship)}</span></div>
          <div class="row total"><span>총 결제 금액</span><b>${won(subtotal+ship)}</b></div>
          <button type="submit" class="btn btn-solid btn-block">${won(subtotal+ship)} 결제하기</button>
          <p class="note">${SERVER.mode ? (SERVER.config.tossEnabled ? '카드 결제는 토스페이먼츠로 안전하게 처리됩니다.' : '주문이 서버에 실제로 접수됩니다. (카드 실결제는 결제 연동 후 활성화)') : '실제 결제는 이루어지지 않는 데모 주문입니다.'}</p>
        </aside>
      </form>
    </div>
  </section>`;
}

function viewComplete(order){
  if(!order){ location.hash='#/'; return viewHome(); }
  return `
  <section class="page">
    <div class="container">
      <div class="complete">
        <div class="check">✓</div>
        <h1>주문이 접수되었습니다</h1>
        <p>${esc(order.name)} 님, 감사합니다. 주문 확인 메일을 ${esc(order.email)} 로 보내드렸습니다.</p>
        <div class="order-box">
          <div class="row"><span>주문번호</span><span class="ono">${order.no}</span></div>
          <div class="row"><span>주문일시</span><b>${order.date}</b></div>
          <div class="row"><span>받는 분</span><b>${esc(order.name)}</b></div>
          <div class="row"><span>배송지</span><b>${esc(order.address)}</b></div>
          <div class="row"><span>결제 수단</span><b>${esc(order.payName)}</b></div>
          ${order.editions&&order.editions.length?`<div class="row" style="border-top:1px solid var(--line);margin-top:10px;padding-top:16px"><span>에디션 넘버</span><b style="text-align:right">${order.editions.map(e=>`${esc(e.name)} ${e.nums.map(n=>'No.'+n).join(', ')} / ${EDITION}`).join('<br>')}</b></div>`:''}
          <div class="row" style="border-top:1px solid var(--line);margin-top:10px;padding-top:16px"><span>결제 금액</span><b style="font-family:var(--serif);font-size:1.3rem;color:var(--gold-bright)">${won(order.total)}</b></div>
        </div>
        <p style="color:var(--gold-deep);font-size:.88rem">각 노트에는 위 고유 에디션 넘버가 새겨진 정품 보증서가 동봉됩니다.</p>
        <p style="color:var(--muted-2);font-size:.86rem">${order.hasPreorder?'사전 예약 상품이 포함되어 있어, 제작 완료 후 순차적으로 배송됩니다.':'3–5 영업일 내에 출고되며, 송장 번호는 메일로 안내드립니다.'}</p>
        <div style="margin-top:36px"><a href="#/products" class="btn btn-solid">컬렉션으로 돌아가기</a></div>
      </div>
    </div>
  </section>`;
}

function viewAbout(){
  return `
  <section class="about-hero">
    <div class="container reveal">
      <div class="mark">.POIESIS</div>
      <h1>다시, 창조하는 사람으로</h1>
      <p class="greek">ποίησις — 없던 것을 세상에 불러내는 일</p>
    </div>
  </section>
  <section class="section" style="padding-top:30px">
    <div class="container prose reveal">
      <p><span class="lead">‘포이에시스(Poiesis)’는 고대 그리스어로 ‘만들어 냄’을 뜻합니다.</span> 존재하지 않던 무언가를 세상에 불러내는 행위 — 시(poetry)라는 단어 역시 여기에서 태어났습니다. 우리는 이 오래된 단어를, 매일 무언가를 만들어 내려는 모든 사람의 이름이라 믿습니다.</p>
      <p>창조의 영혼은 특별한 누군가만의 것이 아닙니다. 다만 일상의 소음 속에서 쉽게 잠들 뿐입니다. POIESIS는 그 잠든 감각을, 다작이면서도 깊이 있었던 위대한 대가들의 손길을 빌려 다시 깨우려 합니다.</p>
      <h3>왜 대가들인가</h3>
      <p>다 빈치는 분야의 경계를 몰랐고, 도스토옙스키는 인간 영혼의 가장 깊은 곳까지 내려갔습니다. 이들의 공통점은 천재성이 아니라 태도였습니다 — 멈추지 않고 관찰하고, 의심하고, 써 내려갔다는 것. 우리는 그 태도를 노트 한 권의 표지에 새깁니다.</p>
      <div class="masters">
        <div class="master"><div class="gk">Homo Universalis</div><h4>Leonardo da Vinci</h4><p>경계 없는 호기심으로 세계를 해부한 만능인. 관찰하고 연결하는 사고를 위해.</p></div>
        <div class="master"><div class="gk">Психолог духа</div><h4>Fyodor Dostoevsky</h4><p>인간 영혼의 심연을 응시한 작가. 가장 깊은 질문을 멈추지 않으려는 사람을 위해.</p></div>
        <div class="master"><div class="gk">Tabula Rasa</div><h4>Origin</h4><p>아직 아무것도 정해지지 않은 빈 페이지. 당신 자신이 곧 대가가 되는 자리.</p></div>
      </div>
      <h3>우리의 약속</h3>
      <p class="lead">“Create, act, and sincerely listen to your inner signal. Follow it, and go on.”</p>
      <p>만들고, 행동하고, 내면의 신호에 진실하게 귀 기울일 것. 그리고 그것을 따라 계속 나아갈 것. POIESIS의 모든 노트는 이 한 문장을 위한 도구이자 약속입니다. 한 장씩 손으로 고른 가죽과, 한 권씩 새긴 표지로 그 약속에 무게를 더합니다.</p>
      <div style="text-align:center;margin-top:50px"><a href="#/products" class="btn btn-solid btn-lg">컬렉션 만나보기</a></div>
    </div>
  </section>`;
}

function viewNotFound(){
  return `<section class="page"><div class="container"><div class="empty">
    <div class="icon">✦</div><h3>페이지를 찾을 수 없습니다</h3>
    <p>요청하신 페이지가 존재하지 않습니다.</p>
    <a href="#/" class="btn btn-solid">홈으로</a></div></div></section>`;
}

function socialBtns(){
  return `
  <div class="social-btns">
    <button type="button" class="social-btn kakao" data-social="카카오"><span class="b">K</span>카카오로 계속하기</button>
    <button type="button" class="social-btn naver" data-social="네이버"><span class="b">N</span>네이버로 계속하기</button>
    <button type="button" class="social-btn google" data-social="구글"><span class="b">G</span>Google로 계속하기</button>
  </div>`;
}

function viewLogin(){
  if(getUser()){ location.hash='#/account'; return viewAccount(); }
  return `
  <section class="auth">
    <div class="auth-card reveal">
      <div class="mark">.POIESIS</div>
      <h1>로그인</h1>
      <p class="sub">창조하는 손을 위한 자리로 돌아오신 걸 환영합니다.</p>
      ${(()=>{const er=hashQuery().get('error');return er?`<div class="notice" style="margin-bottom:18px"><span>!</span><span>${er==='kakao_not_configured'?'카카오 로그인은 아직 키가 설정되지 않았어요.':'카카오 로그인에 실패했습니다. 다시 시도해 주세요.'}</span></div>`:'';})()}
      <form id="loginForm" novalidate>
        <div class="field">
          <label>이메일</label>
          <input name="email" type="email" placeholder="you@email.com" autocomplete="email">
          <div class="err">올바른 이메일을 입력해 주세요.</div>
        </div>
        <div class="field">
          <label>비밀번호</label>
          <input name="password" type="password" placeholder="••••••••" autocomplete="current-password">
          <div class="err">비밀번호를 입력해 주세요.</div>
        </div>
        <div class="forgot"><a href="#/login" onclick="return false">비밀번호를 잊으셨나요?</a></div>
        <button type="submit" class="btn btn-solid btn-block">로그인</button>
      </form>
      <div class="divider-or">또는</div>
      ${socialBtns()}
      <p class="auth-alt">아직 회원이 아니신가요? <a href="#/signup">회원가입</a></p>
    </div>
  </section>`;
}

function viewSignup(){
  if(getUser()){ location.hash='#/account'; return viewAccount(); }
  return `
  <section class="auth">
    <div class="auth-card reveal">
      <div class="mark">.POIESIS</div>
      <h1>회원가입</h1>
      <p class="sub">한 권의 빈 페이지처럼, 여기서 시작해 보세요.</p>
      <form id="signupForm" novalidate>
        <div class="field">
          <label>이름</label>
          <input name="name" type="text" placeholder="이름" autocomplete="name">
          <div class="err">이름을 입력해 주세요.</div>
        </div>
        <div class="field">
          <label>이메일</label>
          <input name="email" type="email" placeholder="you@email.com" autocomplete="email">
          <div class="err">올바른 이메일을 입력해 주세요.</div>
        </div>
        <div class="field">
          <label>비밀번호</label>
          <input name="password" type="password" placeholder="6자 이상" autocomplete="new-password">
          <div class="err">비밀번호는 6자 이상이어야 합니다.</div>
        </div>
        <div class="field">
          <label>비밀번호 확인</label>
          <input name="password2" type="password" placeholder="비밀번호 다시 입력" autocomplete="new-password">
          <div class="err">비밀번호가 일치하지 않습니다.</div>
        </div>
        <label class="checkbox-row">
          <input type="checkbox" name="agree">
          <span><a href="#/signup" onclick="return false">이용약관</a> 및 <a href="#/signup" onclick="return false">개인정보 처리방침</a>에 동의합니다. (필수)</span>
        </label>
        <div class="field" style="margin:-8px 0 18px"><div class="err" id="agreeErr">약관에 동의해 주세요.</div></div>
        <button type="submit" class="btn btn-solid btn-block">가입하고 시작하기</button>
      </form>
      <div class="divider-or">또는</div>
      ${socialBtns()}
      <p class="auth-alt">이미 회원이신가요? <a href="#/login">로그인</a></p>
    </div>
  </section>`;
}

function viewAccount(){
  const u = getUser();
  if(!u){ location.hash='#/login'; return viewLogin(); }
  const orders = (u.orders||[]);
  const initial = (u.name||u.email)[0].toUpperCase();
  return `
  <section class="page">
    <div class="container">
      <div class="account-head reveal">
        <div class="avatar">${esc(initial)}</div>
        <div class="who">
          <div class="nm">${esc(u.name||u.email.split('@')[0])} 님</div>
          <div class="em">${esc(u.email)}</div>
        </div>
      </div>
      <div class="account-grid reveal">
        <div class="acct-card"><div class="k">총 주문</div><div class="v">${orders.length}<small> 건</small></div></div>
        <div class="acct-card"><div class="k">멤버십</div><div class="v">POIESIS Member</div></div>
        <div class="acct-card"><div class="k">가입일</div><div class="v" style="font-size:1.1rem">${u.joined?u.joined.slice(0,10).replace(/-/g,'.'):'—'}</div></div>
      </div>
      <div class="acct-section reveal">
        <h3>주문 내역</h3>
        ${orders.length? orders.map(o=>`
          <div class="co-item" style="padding:16px 0">
            <div class="meta"><div class="nm">${o.no}</div><div class="q">${o.date} · ${o.items}점</div></div>
            <div class="pr">${won(o.total)}</div>
          </div>`).join('') :
          `<div class="acct-empty">아직 주문 내역이 없습니다.<br><a href="#/products" style="color:var(--gold)">컬렉션 둘러보기 →</a></div>`}
      </div>
      <div class="logout-row reveal"><button class="btn" id="logoutBtn">로그아웃</button></div>
    </div>
  </section>`;
}

/* ---------------- LEGAL / POLICY / FAQ ---------------- */
const UPDATED = '2026년 6월 5일';

function legalShell(title, body){
  return `<section class="page"><div class="container">
    <div class="crumb reveal"><a href="#/">Home</a> <span>/</span> <span>${esc(title)}</span></div>
    <div class="legal reveal">
      <h1 class="page-title" style="margin-bottom:6px">${esc(title)}</h1>
      <div class="updated">최종 업데이트: ${UPDATED}</div>
      ${body}
    </div>
  </div></section>`;
}

function viewTerms(){
  return legalShell('이용약관', `
    <div class="callout">본 약관은 표준 전자상거래 이용약관을 바탕으로 한 초안입니다. 실제 운영 전 사업자 정보와 정책에 맞게 수정하고 법무 검토를 받으시길 권합니다.</div>
    <h2>제1조 (목적)</h2>
    <p>본 약관은 POIESIS(이하 "회사")가 운영하는 온라인 쇼핑몰에서 제공하는 전자상거래 관련 서비스의 이용 조건 및 절차, 회사와 이용자의 권리·의무 및 책임사항을 규정함을 목적으로 합니다.</p>
    <h2>제2조 (정의)</h2>
    <ul>
      <li>"몰"이란 회사가 재화·용역을 이용자에게 제공하기 위하여 설정한 가상의 영업장을 말합니다.</li>
      <li>"이용자"란 몰에 접속하여 본 약관에 따라 회사가 제공하는 서비스를 받는 회원 및 비회원을 말합니다.</li>
      <li>"회원"이란 회사에 개인정보를 제공하여 회원등록을 한 자로, 지속적으로 서비스를 이용할 수 있는 자를 말합니다.</li>
    </ul>
    <h2>제3조 (약관의 명시와 개정)</h2>
    <p>회사는 본 약관의 내용을 이용자가 쉽게 알 수 있도록 몰의 초기 화면에 게시합니다. 회사는 관련 법령을 위배하지 않는 범위에서 본 약관을 개정할 수 있으며, 개정 시 적용일자 및 사유를 명시하여 최소 7일 전부터 공지합니다.</p>
    <h2>제4조 (서비스의 제공 및 변경)</h2>
    <p>회사는 재화·용역의 정보 제공, 구매계약 체결, 구매계약된 재화의 배송 등의 업무를 수행합니다. 재화의 품절 또는 사양 변경 등의 사유가 있는 경우 변경될 재화의 내용 및 제공일자를 명시하여 공지합니다.</p>
    <h2>제5조 (구매신청 및 계약의 성립)</h2>
    <p>이용자는 몰에서 재화의 선택, 주문 정보 입력, 결제수단 선택 및 동의 절차를 거쳐 구매를 신청합니다. 회사의 수신확인 통지가 이용자에게 도달한 시점에 계약이 성립한 것으로 봅니다.</p>
    <h2>제6조 (청약철회 및 환불)</h2>
    <p>이용자는 재화를 수령한 날로부터 7일 이내에 청약철회를 할 수 있습니다. 다만 이용자의 책임 있는 사유로 재화가 멸실·훼손된 경우, 사용에 의해 재화의 가치가 현저히 감소한 경우 등 관련 법령이 정하는 경우에는 청약철회가 제한될 수 있습니다. 자세한 사항은 <a href="#/policy" style="color:var(--gold-deep)">배송·교환·환불 정책</a>을 따릅니다.</p>
    <h2>제7조 (개인정보보호)</h2>
    <p>회사는 이용자의 개인정보를 관련 법령에 따라 보호하며, 그 구체적 내용은 <a href="#/privacy" style="color:var(--gold-deep)">개인정보 처리방침</a>에 따릅니다.</p>
    <h2>제8조 (분쟁 해결 및 관할)</h2>
    <p>회사와 이용자 간 발생한 분쟁에 관하여는 대한민국 법을 적용하며, 분쟁으로 인한 소송은 민사소송법상의 관할법원에 제기합니다.</p>
  `);
}

function viewPrivacy(){
  return legalShell('개인정보 처리방침', `
    <div class="callout">아래는 표준 양식 기반 초안입니다. 실제 수집 항목·보유기간·위탁업체(PG, 택배, 호스팅)에 맞춰 반드시 수정하세요.</div>
    <p>POIESIS(이하 "회사")는 「개인정보 보호법」 등 관련 법령을 준수하며, 이용자의 개인정보를 소중히 보호합니다.</p>
    <h2>1. 수집하는 개인정보 항목</h2>
    <table>
      <tr><th>구분</th><th>수집 항목</th><th>목적</th></tr>
      <tr><td>회원가입</td><td>이름, 이메일, 비밀번호</td><td>회원 식별·관리</td></tr>
      <tr><td>주문·결제</td><td>수령인, 연락처, 주소, 결제정보</td><td>주문 처리·배송·CS</td></tr>
      <tr><td>자동수집</td><td>접속 IP, 쿠키, 이용기록</td><td>서비스 개선·부정이용 방지</td></tr>
    </table>
    <h2>2. 개인정보의 보유 및 이용기간</h2>
    <p>원칙적으로 수집·이용 목적이 달성되면 지체 없이 파기합니다. 단, 관련 법령에 따라 일정 기간 보존합니다.</p>
    <ul>
      <li>계약·청약철회 기록: 5년 (전자상거래법)</li>
      <li>대금결제·재화공급 기록: 5년 (전자상거래법)</li>
      <li>소비자 불만·분쟁처리 기록: 3년 (전자상거래법)</li>
    </ul>
    <h2>3. 개인정보의 제3자 제공 및 처리위탁</h2>
    <p>회사는 서비스 제공을 위해 결제대행사(PG), 택배사, 호스팅 업체 등에 필요한 범위 내에서 개인정보 처리를 위탁할 수 있으며, 위탁 시 수탁자와 위탁 업무 내용을 본 방침에 명시합니다.</p>
    <h2>4. 이용자의 권리</h2>
    <p>이용자는 언제든지 자신의 개인정보를 조회·수정·삭제하거나 처리정지를 요청할 수 있습니다.</p>
    <h2>5. 개인정보 보호책임자</h2>
    <p>성명: [담당자명] · 이메일: privacy@poiesis.studio (실제 정보로 교체 필요)</p>
  `);
}

function viewPolicy(){
  return legalShell('배송 · 교환 · 환불 정책', `
    <h2>배송 안내</h2>
    <ul>
      <li>배송 방법: 택배 (CJ대한통운 등)</li>
      <li>배송 기간: 결제 완료 후 영업일 기준 3–5일 이내 출고</li>
      <li>배송비: 150,000원 이상 구매 시 무료 / 미만 시 3,500원</li>
      <li>사전예약(Vinci 에디션) 상품은 제작 완료 후 순차 배송됩니다.</li>
    </ul>
    <h2>교환 및 반품</h2>
    <p>상품 수령 후 <b>7일 이내</b> 교환·반품 신청이 가능합니다. (회사 정책상 14일까지 확대 운영 가능)</p>
    <h3>가능한 경우</h3>
    <ul>
      <li>상품이 표시·광고 내용과 다르거나 하자가 있는 경우 (왕복 배송비 회사 부담)</li>
      <li>단순 변심 (편도/왕복 배송비 고객 부담, 상품 미사용·미훼손 시)</li>
    </ul>
    <h3>제한되는 경우</h3>
    <ul>
      <li>고객 책임으로 상품이 훼손된 경우 (각인·사용 흔적 포함)</li>
      <li>사용 또는 일부 소비로 상품 가치가 현저히 감소한 경우</li>
      <li>주문제작·각인 맞춤 상품 (해당 시)</li>
    </ul>
    <h2>환불 안내</h2>
    <p>반품 상품 회수 및 확인 후 영업일 기준 3일 이내에 환불 처리합니다. 결제 수단에 따라 카드 취소·계좌 환불이 진행되며, 카드사 사정에 따라 영업일이 추가될 수 있습니다.</p>
    <h2>문의</h2>
    <p>교환·반품·환불 문의: hello@poiesis.studio</p>
  `);
}

const FAQS = [
  ['가죽은 어떤 소재인가요?','이탈리아산 베지터블 풀그레인 가죽을 사용합니다. 천연 가죽 특성상 미세한 결과 색 편차가 있을 수 있으며, 사용할수록 고유의 광택(파티나)이 깊어집니다.'],
  ['표지의 각인은 어떻게 제작되나요?','한 권씩 레이저로 각인합니다. 수작업 특성상 위치와 농도에 미세한 차이가 있을 수 있어, 모든 노트가 단 하나뿐입니다.'],
  ['Vinci(다빈치) 에디션은 언제 받을 수 있나요?','현재 제작 준비 중인 사전예약 상품입니다. 표지 이미지는 디자인 콘셉트이며, 제작 완료 후 예약 순서대로 배송됩니다. 일정은 가입 이메일로 안내드립니다.'],
  ['구성품은 무엇인가요?','노트, 전용 펜, 가죽 밴드, 기프트 박스가 기본 포함됩니다.'],
  ['리필이나 속지 교체가 되나요?','현재 버전은 라이플랫 양장 제본으로 속지 교체형이 아닙니다. 리필형은 추후 라인업으로 검토 중입니다.'],
  ['배송은 얼마나 걸리나요?','결제 완료 후 영업일 기준 3–5일 내 출고됩니다. 15만 원 이상 구매 시 무료 배송입니다.'],
  ['선물 포장이 되나요?','모든 제품은 기프트 박스에 담겨 배송되어 별도 포장 없이 선물하기 좋습니다.']
];

function viewFaq(){
  return `<section class="page"><div class="container">
    <div class="section-head center reveal" style="margin-bottom:48px">
      <span class="eyebrow">Support</span><div class="divider"></div>
      <h1 class="page-title">자주 묻는 질문</h1>
    </div>
    <div class="faq reveal">
      ${FAQS.map((f,i)=>`
        <div class="faq-item" data-faq>
          <button class="faq-q">${esc(f[0])}<span class="pm">+</span></button>
          <div class="faq-a"><div class="faq-a-inner">${esc(f[1])}</div></div>
        </div>`).join('')}
    </div>
    <div style="text-align:center;margin-top:44px" class="reveal">
      <p style="color:var(--muted);margin-bottom:18px">더 궁금한 점이 있으신가요?</p>
      <a href="mailto:hello@poiesis.studio" class="btn">hello@poiesis.studio</a>
    </div>
  </div></section>`;
}

/* ============================================================
   ROUTER
   ============================================================ */
let lastOrder = null;

function parseHash(){
  let h = location.hash.replace(/^#/,'') || '/';
  h = h.split('?')[0];                 // 쿼리스트링 제거 (#/login?error=.. 대응)
  if(!h.startsWith('/')) h = '/'+h;
  return h.split('/').filter(Boolean); // e.g. ['product','vinci']
}
function hashQuery(){
  const i = location.hash.indexOf('?');
  return new URLSearchParams(i>=0 ? location.hash.slice(i+1) : '');
}

function render(){
  const app = $('#app');
  const parts = parseHash();
  let html, route='/';
  if(parts.length===0){ html=viewHome(); route='/'; }
  else if(parts[0]==='products'){ html=viewProducts(); route='/products'; }
  else if(parts[0]==='product'){ html=viewProduct(parts[1]); route='/products'; }
  else if(parts[0]==='cart'){ html=viewCart(); route='/cart'; }
  else if(parts[0]==='checkout'){ html=viewCheckout(); route='/cart'; }
  else if(parts[0]==='complete'){ html=viewComplete(lastOrder); }
  else if(parts[0]==='about'){ html=viewAbout(); route='/about'; }
  else if(parts[0]==='login'){ html=viewLogin(); route='/account'; }
  else if(parts[0]==='signup'){ html=viewSignup(); route='/account'; }
  else if(parts[0]==='account'){ html=viewAccount(); route='/account'; }
  else if(parts[0]==='terms'){ html=viewTerms(); }
  else if(parts[0]==='privacy'){ html=viewPrivacy(); }
  else if(parts[0]==='policy'){ html=viewPolicy(); }
  else if(parts[0]==='faq'){ html=viewFaq(); }
  else { html=viewNotFound(); }

  app.innerHTML = html;
  window.scrollTo(0,0);
  setActiveNav(route);
  bindViewEvents(parts);
  observeReveals();
  closeMenu();
  updateCartCount();
  updateAuthUI();
}

function setActiveNav(route){
  $$('.nav a[data-route]').forEach(a=>{
    a.classList.toggle('active', a.dataset.route===route);
  });
}

/* ---------------- per-view event binding ---------------- */
function bindViewEvents(parts){
  // newsletter
  const subForm = $('#subForm');
  if(subForm) subForm.addEventListener('submit',e=>{
    e.preventDefault();
    const v = $('#subEmail').value.trim();
    if(/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)){
      $('#subMsg').textContent='구독해 주셔서 감사합니다. 곧 첫 소식을 전해드릴게요.';
      subForm.reset();
    } else { $('#subMsg').textContent='올바른 이메일 주소를 입력해 주세요.'; }
  });

  // product detail
  if(parts[0]==='product'){
    const p = getProduct(parts[1]); if(!p) return;
    let color = p.colors[0].name;

    $$('.pd-thumb').forEach(t=>t.addEventListener('click',()=>{
      $$('.pd-thumb').forEach(x=>x.classList.remove('active'));
      t.classList.add('active');
      $('#pdMain').src = t.dataset.img;
    }));

    $$('#swatches .swatch').forEach(s=>s.addEventListener('click',()=>{
      $$('#swatches .swatch').forEach(x=>x.classList.remove('active'));
      s.classList.add('active');
      color = s.dataset.color;
      $('#colorName').textContent = color;
    }));

    const cap = Math.max(1, Math.min(BUY_LIMIT, remaining(p.id)));
    const qtyInput = $('#qtyInput');
    bindStepper($('[data-qty]'), qtyInput, (v)=>{
      if(v>cap){ qtyInput.value=cap; toast(`한정판은 1인 ${BUY_LIMIT}권까지 구매할 수 있습니다.`); }
    });
    const getQ = ()=>Math.max(1,Math.min(cap,parseInt(qtyInput.value,10)||1));

    const addEl = $('#addBtn');
    if(addEl) addEl.addEventListener('click',()=>{
      if(addToCart(p.id,color,getQ())) toast(`${p.name} · ${color} 장바구니에 담았습니다.`);
    });
    const buyEl = $('#buyNow');
    if(buyEl) buyEl.addEventListener('click',()=>{
      if(addToCart(p.id,color,getQ())) location.hash='#/checkout';
    });
    const waitEl = $('#waitBtn');
    if(waitEl) waitEl.addEventListener('click',()=>toast('다음 에디션 오픈 시 가장 먼저 알려드릴게요.'));
  }

  // cart line steppers + remove
  if(parts[0]==='cart'){
    $$('[data-cartqty]').forEach(q=>{
      const input = $('input',q);
      const key = q.dataset.key;
      bindStepper(q,input,(val)=>{ setQty(key,val); render(); });
    });
    $$('[data-remove]').forEach(b=>b.addEventListener('click',()=>{
      removeItem(b.dataset.remove); render();
    }));
  }

  // checkout
  if(parts[0]==='checkout'){
    $$('#payMethods .pay-opt').forEach(o=>o.addEventListener('click',()=>{
      $$('#payMethods .pay-opt').forEach(x=>x.classList.remove('active'));
      o.classList.add('active');
      $('input',o).checked=true;
    }));
    const zip = $('#zipBtn');
    if(zip) zip.addEventListener('click',()=>toast('데모에서는 우편번호를 직접 입력해 주세요.'));
    $('#checkoutForm').addEventListener('submit',onCheckoutSubmit);
  }

  // social login buttons (login & signup)
  $$('[data-social]').forEach(b=>b.addEventListener('click',()=>{
    const provider = b.dataset.social;
    if(SERVER.mode){
      if(provider==='카카오' && SERVER.config.kakaoEnabled){
        location.href = '/api/auth/kakao';   // 실제 카카오 OAuth로 이동
      } else {
        toast(`${provider} 로그인은 키 설정 후 사용할 수 있어요. (배포 가이드 참고)`);
      }
      return;
    }
    // 데모 모드(서버 없음)
    toast(`${provider} 로그인은 서버 배포 후 실제로 연결됩니다.`);
  }));

  // login
  if(parts[0]==='login'){
    const f = $('#loginForm');
    if(f) f.addEventListener('submit', async e=>{
      e.preventDefault();
      const email = f.elements['email'].value.trim();
      const pw = f.elements['password'].value;
      const emailOk = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
      const pwOk = pw.length>=1;
      markField(f.elements['email'], emailOk);
      markField(f.elements['password'], pwOk);
      if(!emailOk||!pwOk) return;

      if(SERVER.mode){
        const r = await api('/api/auth/login',{method:'POST',body:JSON.stringify({email,password:pw})});
        if(!r.ok){ toast(r.data?.error||'로그인에 실패했습니다.'); markField(f.elements['password'],false,'이메일 또는 비밀번호를 확인해 주세요.'); return; }
        SERVER.user = r.data.user;
        toast(`${r.data.user.name} 님, 환영합니다.`); location.hash='#/account'; return;
      }
      const user = findUser(email);
      if(!user || user.password!==pw){
        toast('가입되지 않은 이메일이거나 비밀번호가 일치하지 않습니다.');
        markField(f.elements['password'], false, '이메일 또는 비밀번호를 확인해 주세요.'); return;
      }
      setUser({name:user.name,email:user.email,joined:user.joined,orders:user.orders||[]});
      toast(`${user.name} 님, 환영합니다.`); location.hash='#/account';
    });
  }

  // signup
  if(parts[0]==='signup'){
    const f = $('#signupForm');
    if(f) f.addEventListener('submit', async e=>{
      e.preventDefault();
      const name = f.elements['name'].value.trim();
      const email = f.elements['email'].value.trim();
      const pw = f.elements['password'].value;
      const pw2 = f.elements['password2'].value;
      const agree = f.elements['agree'].checked;
      const nameOk = name.length>=1;
      const emailOk = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
      const pwOk = pw.length>=6;
      const pw2Ok = pwOk && pw===pw2;
      markField(f.elements['name'], nameOk);
      markField(f.elements['email'], emailOk);
      markField(f.elements['password'], pwOk);
      markField(f.elements['password2'], pw2Ok);
      $('#agreeErr').classList.toggle('show', !agree);
      if(!(nameOk&&emailOk&&pwOk&&pw2Ok&&agree)) return;

      if(SERVER.mode){
        const r = await api('/api/auth/signup',{method:'POST',body:JSON.stringify({name,email,password:pw})});
        if(!r.ok){ toast(r.data?.error||'가입에 실패했습니다.'); if(r.status===409) markField(f.elements['email'],false,'이미 가입된 이메일입니다.'); return; }
        SERVER.user = r.data.user;
        toast(`${name} 님, 가입을 환영합니다.`); location.hash='#/account'; return;
      }
      if(findUser(email)){
        toast('이미 가입된 이메일입니다. 로그인해 주세요.');
        markField(f.elements['email'], false, '이미 가입된 이메일입니다.'); return;
      }
      registerUser(name,email,pw);
      setUser({name,email,joined:new Date().toISOString(),orders:[]});
      toast(`${name} 님, 가입을 환영합니다.`); location.hash='#/account';
    });
  }

  // account
  if(parts[0]==='account'){
    const lo = $('#logoutBtn');
    if(lo) lo.addEventListener('click', async ()=>{
      if(SERVER.mode){ await api('/api/auth/logout',{method:'POST'}); SERVER.user=null; }
      else logout();
      toast('로그아웃되었습니다.'); location.hash='#/';
    });
    // 로그인 사용자의 실제 주문 내역을 서버에서 가져와 채움
    if(SERVER.mode){
      api('/api/orders').then(r=>{
        if(!r.ok || !r.data.orders) return;
        const wrap = $('.acct-section');
        const cntEl = $('.account-grid .acct-card .v');
        if(cntEl) cntEl.innerHTML = r.data.orders.length+'<small> 건</small>';
        if(wrap){
          const list = r.data.orders.length
            ? r.data.orders.map(o=>`<div class="co-item" style="padding:16px 0"><div class="meta"><div class="nm">${esc(o.order_no)}</div><div class="q">${esc((o.created_at||'').replace('T',' ').slice(0,16))} · ${o.items.reduce((s,i)=>s+i.qty,0)}점</div></div><div class="pr">${won(o.total)}</div></div>`).join('')
            : `<div class="acct-empty">아직 주문 내역이 없습니다.<br><a href="#/products" style="color:var(--gold)">컬렉션 둘러보기 →</a></div>`;
          wrap.innerHTML = '<h3>주문 내역</h3>'+list;
        }
      });
    }
  }

  // faq accordion
  if(parts[0]==='faq'){
    $$('[data-faq]').forEach(item=>{
      const q = $('.faq-q',item), a = $('.faq-a',item);
      q.addEventListener('click',()=>{
        const open = item.classList.toggle('open');
        a.style.maxHeight = open ? a.scrollHeight+'px' : '0';
      });
    });
  }
}

/* mark a field valid/invalid + optional error text */
function markField(input, valid, msg){
  if(!input) return;
  input.classList.toggle('invalid', !valid);
  const field = input.closest('.field');
  const err = field && field.querySelector('.err');
  if(err){
    if(msg) err.textContent = msg;
    err.classList.toggle('show', !valid);
  }
}

/* generic +/- stepper. onChange optional (used by cart) */
function bindStepper(wrap,input,onChange){
  if(!wrap||!input) return;
  $$('button[data-step]',wrap).forEach(b=>b.addEventListener('click',()=>{
    let v = parseInt(input.value,10)||1;
    v += parseInt(b.dataset.step,10);
    v = Math.max(1,Math.min(99,v));
    input.value=v;
    if(onChange) onChange(v);
  }));
  input.addEventListener('change',()=>{
    let v = parseInt(input.value,10)||1;
    v = Math.max(1,Math.min(99,v));
    input.value=v;
    if(onChange) onChange(v);
  });
}

/* ---------------- checkout validation + submit ---------------- */
async function onCheckoutSubmit(e){
  e.preventDefault();
  const f = e.target;
  const rules = {
    name:   v=>v.trim().length>=1,
    phone:  v=>/^01[016789][-\s]?\d{3,4}[-\s]?\d{4}$/.test(v.trim()),
    email:  v=>/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v.trim()),
    postal: v=>/^\d{4,6}$/.test(v.trim()),
    address:v=>v.trim().length>=2
  };
  let ok=true, firstBad=null;
  Object.keys(rules).forEach(name=>{
    const input = f.elements[name];
    const field = input.closest('.field');
    const valid = rules[name](input.value);
    input.classList.toggle('invalid',!valid);
    field && $('.err',field) && $('.err',field).classList.toggle('show',!valid);
    if(!valid){ ok=false; if(!firstBad) firstBad=input; }
  });
  if(!ok){ firstBad && firstBad.focus(); toast('입력 정보를 다시 확인해 주세요.'); return; }

  const cart = getCart();
  const subtotal = cartSubtotal();
  const ship = subtotal>=FREE_SHIP?0:SHIP_FEE;
  const payId = f.elements['pay'].value;
  const payName = (PAYMENTS.find(p=>p.id===payId)||{}).name||'';
  const shipping = {
    name:f.elements['name'].value,
    phone:f.elements['phone'].value,
    email:f.elements['email'].value,
    address:`(${f.elements['postal'].value}) ${f.elements['address'].value} ${f.elements['address2'].value}`.trim(),
  };
  const items = cart.map(it=>({ id:it.id, color:it.color, qty:it.qty }));

  /* ---- 서버 모드: 실제 주문 ---- */
  if(SERVER.mode){
    const submitBtn = $('#checkoutForm button[type="submit"]');
    if(submitBtn){ submitBtn.disabled=true; submitBtn.textContent='처리 중…'; }

    // 카드 + 토스 설정됨 → 실제 결제창
    if(payId==='card' && SERVER.config.tossEnabled){
      const done = await tossCheckout(items, shipping);
      if(!done && submitBtn){ submitBtn.disabled=false; submitBtn.textContent=`${won(subtotal+ship)} 결제하기`; }
      return; // 성공 시 Toss가 리다이렉트 처리
    }

    // 그 외(무통장/간편결제/토스 미설정) → 서버에 주문 직접 생성
    const r = await api('/api/orders',{method:'POST',body:JSON.stringify({items,shipping,payMethod:payId})});
    if(!r.ok){
      toast(r.data?.error||'주문 처리에 실패했습니다.');
      await refreshProducts();
      if(submitBtn){ submitBtn.disabled=false; submitBtn.textContent=`${won(subtotal+ship)} 결제하기`; }
      if(r.data?.code==='SOLD_OUT') render();
      return;
    }
    const o = r.data.order;
    lastOrder = {
      no:o.orderNo,
      date:new Date().toLocaleString('ko-KR'),
      name:shipping.name, email:shipping.email, address:shipping.address,
      payName, total:o.total,
      hasPreorder:o.status==='preorder',
      editions:(o.editions||[]).map(ed=>({ name:ed.name, nums:rangeNums(ed.from,ed.to) })),
    };
    saveCart([]);
    await refreshProducts();
    location.hash='#/complete';
    return;
  }

  /* ---- 데모 모드(서버 없음): 로컬 처리 ---- */
  const hasPreorder = cart.some(i=>{const p=getProduct(i.id);return p&&!p.available;});
  const editions = [];
  cart.forEach(it=>{
    const p = getProduct(it.id);
    const start = soldCount(it.id)+1;
    const nums = [];
    for(let i=0;i<it.qty;i++) nums.push(start+i);
    addSold(it.id, it.qty);
    editions.push({name:p.name, nums});
  });
  const now = new Date();
  const pad = n=>String(n).padStart(2,'0');
  const no = 'PO-'+now.getFullYear()+pad(now.getMonth()+1)+pad(now.getDate())+'-'+
             String(Math.floor(1000+Math.random()*9000));
  lastOrder = {
    no, date:`${now.getFullYear()}.${pad(now.getMonth()+1)}.${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`,
    name:shipping.name, email:shipping.email, address:shipping.address,
    payName, total:subtotal+ship, hasPreorder, editions
  };
  const u = getUser();
  if(u){
    const rec = {no:lastOrder.no, date:lastOrder.date, total:lastOrder.total, items:cartCount()};
    u.orders = (u.orders||[]).concat(rec);
    setUser(u);
    const list = getUsers();
    const stored = list.find(x=>x.email.toLowerCase()===u.email.toLowerCase());
    if(stored){ stored.orders = u.orders; saveUsers(list); }
  }
  saveCart([]);
  location.hash='#/complete';
}

function rangeNums(from,to){ const a=[]; for(let n=from;n<=to;n++) a.push(n); return a; }

/* Toss Payments 결제창 (실제 키가 설정된 경우에만 동작) */
async function tossCheckout(items, shipping){
  const prep = await api('/api/checkout/prepare',{method:'POST',body:JSON.stringify({items,shipping})});
  if(!prep.ok){ toast(prep.data?.error||'결제 준비에 실패했습니다.'); return false; }
  const { orderId, amount, clientKey } = prep.data;
  try{
    await loadScript('https://js.tosspayments.com/v1/payment');
    const tossPayments = window.TossPayments(clientKey);
    await tossPayments.requestPayment('카드', {
      amount,
      orderId,
      orderName: 'POIESIS 주문',
      customerName: shipping.name,
      successUrl: location.origin + '/pay/success',
      failUrl: location.origin + '/pay/fail',
    });
    return true; // requestPayment가 결제창으로 이동
  }catch(err){
    toast('결제를 취소했거나 오류가 발생했습니다.');
    return false;
  }
}
function loadScript(src){
  return new Promise((resolve,reject)=>{
    if([...document.scripts].some(s=>s.src===src)) return resolve();
    const s=document.createElement('script'); s.src=src; s.onload=resolve; s.onerror=reject;
    document.head.appendChild(s);
  });
}

/* ============================================================
   GLOBAL UI (header, menu, reveals)
   ============================================================ */
function observeReveals(){
  const els = $$('.reveal');
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(en=>{ if(en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); } });
  },{threshold:0.12, rootMargin:'0px 0px -40px 0px'});
  els.forEach(el=>io.observe(el));
}

function closeMenu(){
  $('#nav').classList.remove('open');
  $('#menuToggle').classList.remove('open');
}

async function initGlobal(){
  const header = $('#header');
  const onScroll = ()=>header.classList.toggle('scrolled', window.scrollY>40);
  window.addEventListener('scroll',onScroll,{passive:true}); onScroll();

  const toggle = $('#menuToggle');
  toggle.addEventListener('click',()=>{
    $('#nav').classList.toggle('open');
    toggle.classList.toggle('open');
  });
  $$('#nav a').forEach(a=>a.addEventListener('click',closeMenu));

  window.addEventListener('hashchange',render);

  await bootstrap();                 // 서버 연결 시도(없으면 데모 모드)
  if(await handleTossReturn()) return; // Toss 결제 복귀 처리 시 내부에서 라우팅
  updateCartCount();
  render();
}

/* Toss 결제 성공 후 successUrl(/pay/success?paymentKey..)로 돌아왔을 때 처리 */
async function handleTossReturn(){
  if(!SERVER.mode) return false;
  const path = location.pathname;
  if(path === '/pay/success'){
    const q = new URLSearchParams(location.search);
    const body = { paymentKey:q.get('paymentKey'), orderId:q.get('orderId'), amount:Number(q.get('amount')) };
    const r = await api('/api/payments/confirm',{method:'POST',body:JSON.stringify(body)});
    if(r.ok){
      const o = r.data.order;
      lastOrder = { no:o.orderNo, date:new Date().toLocaleString('ko-KR'),
        name:'', email:'', address:'', payName:'카드', total:o.total,
        hasPreorder:o.status==='preorder',
        editions:(o.editions||[]).map(ed=>({name:ed.name,nums:rangeNums(ed.from,ed.to)})) };
      saveCart([]); await refreshProducts();
      history.replaceState(null,'','/#/complete'); render(); return true;
    }
    toast(r.data?.error||'결제 확인에 실패했습니다.');
    history.replaceState(null,'','/#/cart'); render(); return true;
  }
  if(path === '/pay/fail'){
    toast('결제가 취소되었습니다.');
    history.replaceState(null,'','/#/cart'); render(); return true;
  }
  return false;
}

document.addEventListener('DOMContentLoaded',initGlobal);
