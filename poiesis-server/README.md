# POIESIS 백엔드 서버 (1단계)

진짜 회원·세션·한정재고·주문을 처리하는 실제 서버입니다. (데모 아님)

## 무엇이 진짜로 동작하나 (테스트로 검증됨)
- **회원가입/로그인**: 비밀번호를 bcrypt로 **해시 저장**(평문 저장 안 함), 세션 쿠키로 로그인 유지
- **공유 재고**: 모든 손님이 같은 33권 재고를 공유. 한 명이 사면 모두에게 줄어듦
- **초과 판매 방지**: 동시에 몰려도 33권을 **절대 초과하지 않음**(DB 원자적 차감)
- **1인 구매 제한**: 에디션당 2권
- **에디션 넘버**: 주문 시 서버가 No.○○ 자동 발급, 주문 내역에 기록

## 로컬에서 실행
```bash
cd poiesis-server
npm install
npm start          # → http://localhost:4000  (프런트엔드까지 같이 서빙)
```
프런트엔드 폴더(`../poiesis`)를 자동으로 함께 서빙합니다.

## 검증 테스트 실행
```bash
rm -f test.db
DB_PATH=./test.db PORT=4555 node server.js &   # 서버 시작
DB_PATH=./test.db npm test                     # 14개 항목 검증
```

## API 요약
| 메서드 | 경로 | 설명 |
|---|---|---|
| POST | /api/auth/signup | 회원가입 |
| POST | /api/auth/login | 로그인 |
| POST | /api/auth/logout | 로그아웃 |
| GET | /api/auth/me | 로그인 상태 확인 |
| GET | /api/products | 실시간 재고 포함 제품 목록 |
| POST | /api/orders | 주문(재고 차감+에디션 넘버 발급) |
| GET | /api/orders | 내 주문 내역 |

## 다음 단계
- 2단계: 프런트엔드(app.js)를 이 API에 연결 (localStorage → 실제 서버)
- 3단계: 카카오 로그인(앱키 필요) + 토스페이먼츠(테스트키) 연동
- 4단계: 인터넷 배포(Render 등) + 도메인/HTTPS

## 운영 참고
- 현재 DB는 Node 내장 SQLite(파일 1개). 소규모엔 충분하나, 대규모/다중 서버는 PostgreSQL 권장(쿼리 거의 동일).
- 배포 시 환경변수: `SESSION_SECRET`(필수, 긴 무작위 문자열), `NODE_ENV=production`, `PORT`.
