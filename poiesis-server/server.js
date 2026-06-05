// POIESIS — 백엔드 서버 (Express)
// 회원/세션/한정재고/주문을 서버에서 권위 있게 처리. 정적 프런트엔드도 함께 서빙.
import express from 'express';
import session from 'express-session';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import {
  EDITION, BUY_LIMIT, Users, Products, remaining,
  createOrder, OrderError, userOrders, boughtByUser, upsertSocialUser,
} from './db.js';

// 환경변수 (배포 시 주입). 없으면 해당 기능은 "미설정"으로 동작.
const KAKAO_CLIENT_ID     = process.env.KAKAO_CLIENT_ID || '';
const KAKAO_CLIENT_SECRET = process.env.KAKAO_CLIENT_SECRET || '';
const KAKAO_REDIRECT_URI  = process.env.KAKAO_REDIRECT_URI || '';
const TOSS_CLIENT_KEY     = process.env.TOSS_CLIENT_KEY || '';   // 프런트 공개 키
const TOSS_SECRET_KEY     = process.env.TOSS_SECRET_KEY || '';   // 서버 비밀 키
const APP_ORIGIN          = process.env.APP_ORIGIN || '';        // 예: https://poiesis.studio

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 4000;
const PUBLIC_DIR = process.env.PUBLIC_DIR || join(__dirname, '..', 'poiesis');

app.use(express.json());
app.use(session({
  name: 'poiesis.sid',
  secret: process.env.SESSION_SECRET || 'dev-secret-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production', // HTTPS 배포 시 true
    maxAge: 1000 * 60 * 60 * 24 * 14, // 14일
  },
}));

/* ---------------- 검증 헬퍼 ---------------- */
const isEmail = v => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(v || '').trim());
const isPhone = v => /^01[016789][-\s]?\d{3,4}[-\s]?\d{4}$/.test(String(v || '').trim());
const publicUser = u => ({ id: u.id, name: u.name, email: u.email, provider: u.provider });

function requireAuth(req, res, next) {
  if (!req.session.userId) return res.status(401).json({ error: '로그인이 필요합니다.' });
  next();
}

/* ============================================================
   AUTH
   ============================================================ */
app.post('/api/auth/signup', async (req, res) => {
  const { name, email, password } = req.body || {};
  if (!name || String(name).trim().length < 1) return res.status(400).json({ error: '이름을 입력해 주세요.' });
  if (!isEmail(email)) return res.status(400).json({ error: '올바른 이메일을 입력해 주세요.' });
  if (!password || String(password).length < 6) return res.status(400).json({ error: '비밀번호는 6자 이상이어야 합니다.' });

  if (Users.byEmail.get(email)) return res.status(409).json({ error: '이미 가입된 이메일입니다.' });

  const hash = await bcrypt.hash(String(password), 10); // 실제 해시 저장 (평문 저장 안 함)
  const r = Users.create.run(email.trim(), String(name).trim(), hash, 'local', null);
  const user = Users.byId.get(r.lastInsertRowid);
  req.session.userId = user.id;
  res.json({ user: publicUser(user) });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body || {};
  const row = Users.byEmail.get(String(email || '').trim());
  if (!row || !row.pw_hash) return res.status(401).json({ error: '이메일 또는 비밀번호가 일치하지 않습니다.' });
  const ok = await bcrypt.compare(String(password || ''), row.pw_hash);
  if (!ok) return res.status(401).json({ error: '이메일 또는 비밀번호가 일치하지 않습니다.' });
  req.session.userId = row.id;
  res.json({ user: publicUser(row) });
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

app.get('/api/auth/me', (req, res) => {
  if (!req.session.userId) return res.json({ user: null });
  const u = Users.byId.get(req.session.userId);
  res.json({ user: u ? publicUser(u) : null });
});

/* ============================================================
   PRODUCTS (실시간 재고)
   ============================================================ */
app.get('/api/products', (req, res) => {
  const list = Products.all.all().map(p => ({
    id: p.id, name: p.name, kr: p.kr, price: p.price,
    edition: p.edition, sold: p.sold, remaining: remaining(p),
    available: !!p.available,
  }));
  res.json({ products: list, edition: EDITION, buyLimit: BUY_LIMIT });
});

/* ============================================================
   ORDERS (서버가 재고 차감 + 에디션 넘버 발급)
   ============================================================ */
app.post('/api/orders', (req, res) => {
  const { items, shipping, payMethod } = req.body || {};
  if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ error: '주문 항목이 없습니다.' });
  if (!shipping || !String(shipping.name||'').trim()) return res.status(400).json({ error: '받는 분을 입력해 주세요.' });
  if (!isPhone(shipping.phone)) return res.status(400).json({ error: '올바른 연락처를 입력해 주세요.' });
  if (!isEmail(shipping.email)) return res.status(400).json({ error: '올바른 이메일을 입력해 주세요.' });
  if (!String(shipping.address||'').trim()) return res.status(400).json({ error: '주소를 입력해 주세요.' });
  if (!payMethod) return res.status(400).json({ error: '결제 수단을 선택해 주세요.' });

  try {
    const result = createOrder({ userId: req.session.userId || null, items, shipping, payMethod });
    res.json({ order: result });
  } catch (e) {
    if (e instanceof OrderError) return res.status(409).json({ error: e.message, code: e.code });
    console.error(e);
    res.status(500).json({ error: '주문 처리 중 오류가 발생했습니다.' });
  }
});

app.get('/api/orders', requireAuth, (req, res) => {
  res.json({ orders: userOrders(req.session.userId) });
});

/* ============================================================
   CONFIG — 프런트가 어떤 기능이 켜져 있는지 확인
   ============================================================ */
app.get('/api/config', (req, res) => {
  res.json({
    kakaoEnabled: !!(KAKAO_CLIENT_ID && KAKAO_REDIRECT_URI),
    tossEnabled: !!(TOSS_CLIENT_KEY && TOSS_SECRET_KEY),
    tossClientKey: TOSS_CLIENT_KEY || null,
    edition: EDITION, buyLimit: BUY_LIMIT,
  });
});

/* ============================================================
   KAKAO 로그인 (실제 OAuth 2.0)
   ============================================================ */
app.get('/api/auth/kakao', (req, res) => {
  if (!KAKAO_CLIENT_ID || !KAKAO_REDIRECT_URI) {
    return res.redirect('/#/login?error=kakao_not_configured');
  }
  const url = 'https://kauth.kakao.com/oauth/authorize?response_type=code'
    + `&client_id=${encodeURIComponent(KAKAO_CLIENT_ID)}`
    + `&redirect_uri=${encodeURIComponent(KAKAO_REDIRECT_URI)}`;
  res.redirect(url);
});

app.get('/api/auth/kakao/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) return res.redirect('/#/login?error=kakao_no_code');
  try {
    // 1) 인가코드 → 토큰
    const tokenRes = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: KAKAO_CLIENT_ID,
        redirect_uri: KAKAO_REDIRECT_URI,
        code: String(code),
        ...(KAKAO_CLIENT_SECRET ? { client_secret: KAKAO_CLIENT_SECRET } : {}),
      }),
    });
    const token = await tokenRes.json();
    if (!token.access_token) throw new Error('token exchange failed');

    // 2) 토큰 → 사용자 정보
    const meRes = await fetch('https://kapi.kakao.com/v2/user/me', {
      headers: { Authorization: `Bearer ${token.access_token}` },
    });
    const me = await meRes.json();
    const kakaoId = me.id;
    const acc = me.kakao_account || {};
    const user = upsertSocialUser({
      provider: 'kakao', providerId: kakaoId,
      name: (acc.profile && acc.profile.nickname) || '카카오 사용자',
      email: acc.email || null,
    });
    req.session.userId = user.id;
    res.redirect('/#/account');
  } catch (e) {
    console.error('kakao oauth error', e);
    res.redirect('/#/login?error=kakao_failed');
  }
});

/* ============================================================
   TOSS PAYMENTS (실제 결제 — 테스트/라이브 키 모두 지원)
   결제 흐름: prepare(금액·재고검증) → Toss 결제창 → confirm(서버검증) → 주문생성
   ============================================================ */
app.post('/api/checkout/prepare', (req, res) => {
  const { items, shipping } = req.body || {};
  if (!Array.isArray(items) || !items.length) return res.status(400).json({ error: '주문 항목이 없습니다.' });
  // 재고 가용성 사전 확인(차감은 confirm 시점에)
  let amount = 0;
  for (const it of items) {
    const p = Products.byId.get(it.id);
    if (!p) return res.status(400).json({ error: `존재하지 않는 상품: ${it.id}` });
    const qty = Math.floor(Number(it.qty) || 0);
    if (qty < 1) return res.status(400).json({ error: '수량 오류' });
    if (remaining(p) < qty) return res.status(409).json({ error: `${p.name}: 재고 부족 (남은 ${remaining(p)}권)`, code: 'SOLD_OUT' });
    amount += p.price * qty;
  }
  amount += amount >= 150000 ? 0 : 3500;
  const now = new Date(), pad = n => String(n).padStart(2,'0');
  const orderId = 'PO-' + now.getFullYear()+pad(now.getMonth()+1)+pad(now.getDate()) + '-' + String(Math.floor(100000+Math.random()*900000));
  // 결제 금액·내용을 세션에 보관 → confirm에서 위변조 검증
  req.session.pendingOrder = { orderId, amount, items, shipping };
  res.json({ orderId, amount, clientKey: TOSS_CLIENT_KEY || null });
});

app.post('/api/payments/confirm', async (req, res) => {
  const { paymentKey, orderId, amount } = req.body || {};
  const pending = req.session.pendingOrder;
  if (!pending || pending.orderId !== orderId || Number(pending.amount) !== Number(amount)) {
    return res.status(400).json({ error: '주문 정보가 일치하지 않습니다.' });
  }
  if (!TOSS_SECRET_KEY) return res.status(503).json({ error: '결제가 설정되지 않았습니다.', code: 'TOSS_OFF' });

  try {
    // 1) Toss에 결제 승인 요청 (서버에서만!)
    const auth = 'Basic ' + Buffer.from(TOSS_SECRET_KEY + ':').toString('base64');
    const tossRes = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
      method: 'POST',
      headers: { Authorization: auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentKey, orderId, amount }),
    });
    const pay = await tossRes.json();
    if (!tossRes.ok || pay.status !== 'DONE') {
      return res.status(402).json({ error: pay.message || '결제 승인 실패' });
    }

    // 2) 결제 성공 → 실제 주문 생성(재고 차감). 재고 부족 시 결제 취소(환불)
    try {
      const order = createOrder({
        userId: req.session.userId || null,
        items: pending.items,
        shipping: pending.shipping,
        payMethod: 'card',
      });
      delete req.session.pendingOrder;
      res.json({ order });
    } catch (e) {
      // 결제는 됐는데 재고가 마감된 경우 → 자동 취소
      await fetch(`https://api.tosspayments.com/v1/payments/${paymentKey}/cancel`, {
        method: 'POST', headers: { Authorization: auth, 'Content-Type': 'application/json' },
        body: JSON.stringify({ cancelReason: '재고 소진으로 자동 취소' }),
      }).catch(()=>{});
      return res.status(409).json({ error: '결제 중 재고가 마감되어 자동 취소되었습니다.', code: 'SOLD_OUT' });
    }
  } catch (e) {
    console.error('toss confirm error', e);
    res.status(500).json({ error: '결제 처리 중 오류가 발생했습니다.' });
  }
});

/* ============================================================
   정적 프런트엔드 서빙 + SPA 폴백
   ============================================================ */
app.use(express.static(PUBLIC_DIR));
app.get('*', (req, res) => res.sendFile(join(PUBLIC_DIR, 'index.html')));

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => console.log(`POIESIS server running → http://localhost:${PORT}`));
}

export { app };
