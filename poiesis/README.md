# POIESIS — 브랜드 스토어 (프런트엔드)

위대한 대가들의 창조 정신을 담은 핸드메이드 가죽 노트 브랜드 POIESIS의 제품 판매 사이트입니다.
순수 HTML·CSS·JavaScript로 만들어져 별도 빌드 과정 없이 바로 열립니다.

## 미리 보기
`index.html`을 더블클릭하면 브라우저에서 바로 열립니다.

## 파일 구조
```
poiesis/
├─ index.html          진입점 (헤더·푸터·메타·SEO)
├─ styles.css          디자인 시스템 (밝은 파치먼트 테마)
├─ app.js              SPA 로직 (라우팅·장바구니·회원·재고·결제 데모)
├─ robots.txt          검색엔진 크롤링 안내
├─ sitemap.xml         사이트맵 (배포 도메인으로 URL 교체 필요)
├─ assets/
│  ├─ favicon.svg      파비콘
│  ├─ logo.svg         로고 (밝은 배경용)
│  ├─ logo-cream.svg   로고 (어두운 배경용)
│  ├─ og-cover.svg     공유 미리보기 이미지
│  └─ img/             제품 사진 · 콘셉트/표지 디자인
├─ 상용화-로드맵.md     실제 판매까지 필요한 전체 절차
└─ 한정판-운영-가이드.md  33개 한정 에디션 운영 절차
```

## 무료로 바로 배포하기 (가장 쉬움)
정적 사이트이므로 아래 중 하나에 폴더를 올리면 끝입니다.

- **Netlify Drop**: app.netlify.com/drop 에 `poiesis` 폴더를 드래그
- **Vercel**: `vercel` CLI 또는 깃 연동 후 배포
- **Cloudflare Pages / GitHub Pages**: 저장소 연결 후 배포

배포 후 할 일
1. `sitemap.xml`·`index.html`의 `poiesis.studio` 도메인을 실제 도메인으로 교체
2. 도메인 연결 + HTTPS 적용 (대부분 자동)

## 중요 — 지금은 "데모"입니다
- 회원·주문·재고·에디션 넘버는 브라우저(localStorage)에만 저장됩니다.
- 실제 결제·회원·재고 관리는 백엔드 또는 커머스 솔루션이 필요합니다.
- 다음 단계는 `상용화-로드맵.md`를 참고하세요.

## 커스터마이즈 빠른 참조
- 색상/폰트: `styles.css` 상단 `:root` 변수
- 제품 정보·가격·재고: `app.js`의 `PRODUCTS` / `EDITION` / 초기 판매수량
- 회사·판매자 정보: `index.html` 푸터의 `.seller-info` (사업자 등록 후 실제값 입력)
- 정책 문구: `app.js`의 `viewTerms` / `viewPrivacy` / `viewPolicy`
