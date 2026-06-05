// POIESIS — 데이터베이스 계층 (Node 내장 SQLite)
// 개발/소규모 운영용. 대규모 트래픽 시 Postgres로 교체 권장(쿼리는 거의 동일).
import { DatabaseSync } from 'node:sqlite';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = process.env.DB_PATH || join(__dirname, 'poiesis.db');

export const db = new DatabaseSync(DB_PATH);
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

export const EDITION = 33;     // 에디션당 한정 수량
export const BUY_LIMIT = 2;    // 1인 구매 제한

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  email       TEXT UNIQUE NOT NULL,
  name        TEXT NOT NULL,
  pw_hash     TEXT,                 -- 소셜 로그인은 NULL
  provider    TEXT NOT NULL DEFAULT 'local',  -- local | kakao | naver | google
  provider_id TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS products (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  kr          TEXT NOT NULL,
  price       INTEGER NOT NULL,
  edition     INTEGER NOT NULL DEFAULT 33,
  sold        INTEGER NOT NULL DEFAULT 0,
  available   INTEGER NOT NULL DEFAULT 1   -- 1=판매, 0=사전예약
);

CREATE TABLE IF NOT EXISTS orders (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  order_no    TEXT UNIQUE NOT NULL,
  user_id     INTEGER REFERENCES users(id),
  name        TEXT NOT NULL,
  phone       TEXT NOT NULL,
  email       TEXT NOT NULL,
  address     TEXT NOT NULL,
  pay_method  TEXT NOT NULL,
  total       INTEGER NOT NULL,
  status      TEXT NOT NULL DEFAULT 'paid', -- paid | preorder | cancelled
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS order_items (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id     INTEGER NOT NULL REFERENCES orders(id),
  product_id   TEXT NOT NULL REFERENCES products(id),
  product_name TEXT NOT NULL,
  color        TEXT NOT NULL,
  qty          INTEGER NOT NULL,
  edition_from INTEGER NOT NULL,   -- 부여된 에디션 넘버 시작
  edition_to   INTEGER NOT NULL    -- 끝 (No.from ~ No.to)
);
`);

// 최초 1회 제품 시드
const seed = [
  ['vinci',      'Vinci',      '다빈치 에디션',     168000, 19, 0],
  ['dostoevsky', 'Dostoevsky', '도스토옙스키 에디션', 168000, 21, 1],
  ['origin',     'Origin',     '오리진',           148000, 8,  1],
];
const countRow = db.prepare('SELECT COUNT(*) AS n FROM products').get();
if (countRow.n === 0) {
  const ins = db.prepare(
    'INSERT INTO products (id,name,kr,price,edition,sold,available) VALUES (?,?,?,?,?,?,?)'
  );
  for (const [id, name, kr, price, sold, available] of seed) {
    ins.run(id, name, kr, price, EDITION, sold, available);
  }
}

/* ---------------- 쿼리 헬퍼 ---------------- */
export const Users = {
  byEmail: db.prepare('SELECT * FROM users WHERE email = ?'),
  byId:    db.prepare('SELECT id,email,name,provider,created_at FROM users WHERE id = ?'),
  byProvider: db.prepare('SELECT * FROM users WHERE provider = ? AND provider_id = ?'),
  create:  db.prepare(
    'INSERT INTO users (email,name,pw_hash,provider,provider_id) VALUES (?,?,?,?,?)'
  ),
};

// 소셜 로그인 사용자 찾기 또는 생성 (provider+provider_id 기준)
export function upsertSocialUser({ provider, providerId, name, email }) {
  const found = Users.byProvider.get(provider, String(providerId));
  if (found) return found;
  // 이메일 충돌 회피용 보조 이메일
  const safeEmail = email && !Users.byEmail.get(email)
    ? email
    : `${provider}_${providerId}@social.poiesis`;
  const r = Users.create.run(safeEmail, name || `${provider} 사용자`, null, provider, String(providerId));
  return Users.byProvider.get(provider, String(providerId)) || Users.byId.get(r.lastInsertRowid);
}

export const Products = {
  all: db.prepare('SELECT * FROM products'),
  byId: db.prepare('SELECT * FROM products WHERE id = ?'),
};

export function remaining(p) { return Math.max(0, p.edition - p.sold); }

// 이 사용자가 특정 제품을 이미 몇 권 샀는지(1인 구매 제한 검증용)
const boughtStmt = db.prepare(`
  SELECT COALESCE(SUM(oi.qty),0) AS n
  FROM order_items oi JOIN orders o ON o.id = oi.order_id
  WHERE o.user_id = ? AND oi.product_id = ? AND o.status != 'cancelled'
`);
export function boughtByUser(userId, productId) {
  return boughtStmt.get(userId, productId).n;
}

/* ----- 주문 생성: 재고를 원자적으로 차감 (33권 초과 절대 불가) ----- */
const updSold = db.prepare('UPDATE products SET sold = sold + ? WHERE id = ? AND sold + ? <= edition');
const insOrder = db.prepare(
  'INSERT INTO orders (order_no,user_id,name,phone,email,address,pay_method,total,status) VALUES (?,?,?,?,?,?,?,?,?)'
);
const insItem = db.prepare(
  'INSERT INTO order_items (order_id,product_id,product_name,color,qty,edition_from,edition_to) VALUES (?,?,?,?,?,?,?)'
);

export class OrderError extends Error {
  constructor(code, message) { super(message); this.code = code; }
}

export function createOrder({ userId, items, shipping, payMethod }) {
  db.exec('BEGIN IMMEDIATE');
  try {
    let total = 0;
    let hasPreorder = false;
    const lines = [];

    for (const it of items) {
      const p = Products.byId.get(it.id);
      if (!p) throw new OrderError('NO_PRODUCT', `존재하지 않는 상품: ${it.id}`);
      const qty = Math.floor(Number(it.qty) || 0);
      if (qty < 1) throw new OrderError('BAD_QTY', '수량이 올바르지 않습니다.');

      // 1인 구매 제한
      const already = userId ? boughtByUser(userId, p.id) : 0;
      if (already + qty > BUY_LIMIT) {
        throw new OrderError('LIMIT', `${p.name}: 한정판은 1인 ${BUY_LIMIT}권까지 구매할 수 있습니다.`);
      }

      // 재고 원자적 차감 — 조건부 UPDATE가 0행이면 재고 부족
      const editionFrom = p.sold + 1;
      const res = updSold.run(qty, p.id, qty);
      if (res.changes === 0) {
        throw new OrderError('SOLD_OUT', `${p.name}: 남은 수량이 부족합니다. (남은 ${remaining(p)}권)`);
      }
      const editionTo = editionFrom + qty - 1;

      total += p.price * qty;
      if (!p.available) hasPreorder = true;
      lines.push({ id: p.id, name: p.name, color: it.color || '기본', qty, editionFrom, editionTo });
    }

    const ship = total >= 150000 ? 0 : 3500;
    total += ship;

    const now = new Date();
    const pad = n => String(n).padStart(2, '0');
    const orderNo = 'PO-' + now.getFullYear() + pad(now.getMonth()+1) + pad(now.getDate()) +
      '-' + String(Math.floor(1000 + Math.random() * 9000));
    const status = hasPreorder ? 'preorder' : 'paid';

    const o = insOrder.run(
      orderNo, userId || null, shipping.name, shipping.phone, shipping.email,
      shipping.address, payMethod, total, status
    );
    const orderId = o.lastInsertRowid;
    for (const ln of lines) {
      insItem.run(orderId, ln.id, ln.name, ln.color, ln.qty, ln.editionFrom, ln.editionTo);
    }

    db.exec('COMMIT');
    return {
      orderNo, total, status, shipFee: ship,
      editions: lines.map(l => ({ name: l.name, from: l.editionFrom, to: l.editionTo })),
    };
  } catch (e) {
    db.exec('ROLLBACK');
    throw e;
  }
}

const ordersByUser = db.prepare('SELECT order_no,total,status,created_at FROM orders WHERE user_id = ? ORDER BY id DESC');
const itemsByOrder = db.prepare('SELECT product_name,color,qty,edition_from,edition_to FROM order_items WHERE order_id = (SELECT id FROM orders WHERE order_no = ?)');
export function userOrders(userId) {
  return ordersByUser.all(userId).map(o => ({ ...o, items: itemsByOrder.all(o.order_no) }));
}
