# 성능 베이스라인 (Phase 5 — 개선 전 기록)

측정일: 2026-08-12
측정 환경: 프로덕션 빌드(`next build` / `next start`), headless Chromium(Playwright 번들), Windows 11 로컬 머신. 리렌더 측정은 `next build --profile`(React 프로덕션 프로파일링 빌드)로 별도 실행.

이 문서는 Phase 5의 실제 최적화(가상 스크롤·WS 스로틀링·코드 스플리팅) 착수 전 "before" 수치를 기록한다. 이후 동일한 방법으로 재측정해 개선폭을 `AFTER.md`(또는 이 문서에 이어서)에 기록한다.

## 1. Lighthouse — LCP / TBT(INP 랩 프록시) / CLS

Lighthouse 기본 설정(모바일 시뮬레이션 스로틀링: CPU 4x 슬로우다운 + 시뮬레이션 느린 네트워크)으로 측정. INP는 실제 사용자 상호작용이 필요해 랩 환경에서 직접 측정할 수 없으므로, Lighthouse가 랩 지표로 제공하는 **TBT(Total Blocking Time)를 대체 지표로 사용**한다.

| 페이지 | LCP | TBT | CLS | Performance Score | 원본 리포트 |
| --- | --- | --- | --- | --- | --- |
| 홈 (`/`) | 17.4s | 1,656ms | 0.006 | 0.48 | `perf/lighthouse-home.json` |
| 상세 (`/code/KRW-BTC`) | 17.7s | 978ms | 0 | 0.51 | `perf/lighthouse-detail.json` |

**해석**: LCP·TBT가 크게 나온 주된 원인은 두 페이지 모두 **외부 Upbit REST API(마켓/티커/캔들)를 실시간으로 호출**하는데, Lighthouse의 시뮬레이션 네트워크 스로틀링 아래에서는 이 외부 API 왕복 자체가 크게 느려지기 때문이다(정적 콘텐츠 위주 페이지가 아니라 실시간 API 의존 페이지의 전형적인 패턴). 상세 페이지는 `lightweight-charts` 초기화·다건의 캔들 렌더링까지 겹쳐 TBT에 영향을 준다. Phase 5 최적화(캔들 렌더링 경량화, 초기 데이터 흐름 조정 등) 이후 이 수치가 실제로 개선되는지가 핵심 검증 포인트.

## 2. 번들 크기

Turbopack 빌드에서는 `@next/bundle-analyzer`(webpack 전용)가 동작하지 않아("not compatible with Turbopack builds"), 대신 **Next.js 16 네이티브 분석기**(`next experimental-analyze`, `npm run analyze`)와 **실제 라우트 HTML에 포함된 청크 파일 크기 직접 합산**(재현 가능하도록 측정 로직을 이 문서에 남김) 두 가지로 측정했다.

| 라우트 | 청크 수 | 총 JS 크기 |
| --- | --- | --- |
| 홈 (`/`) | 13 | 957.0 KB |
| 상세 (`/code/[market]`) | 13 | 1,107.3 KB |

**`lightweight-charts` 청크**: `87597965cce37546.js`, 167.0 KB.
- 홈 페이지 HTML에 **포함되지 않음** (`includedInHome: false`)
- 상세 페이지 HTML에만 **포함됨** (`includedInDetail: true`)

**중요한 발견**: Next.js App Router의 **라우트 단위 자동 코드 스플리팅이 이미 `lightweight-charts`를 홈 번들에서 제외**하고 있다. PLAN.md의 "차트 코드 스플리팅(`next/dynamic`)" 항목은 이 기본 분리 위에 **추가로** 상세 페이지 자체 내에서 지연 로딩을 적용하는 것이므로, 기대 효과를 "홈 번들에서 청크 제거"가 아니라 "상세 페이지 내에서 차트 섹션만 늦게 불러와 초기 인터랙티브 시점 단축"으로 재정의해야 정확하다. 상세(1,107.3 KB)와 홈(957.0 KB)의 차이(150.3 KB)가 대략 `lightweight-charts` 청크(167 KB)와 상세 전용 코드에 해당.

원본 raw 데이터: `perf/bundle-baseline.json`. 인터랙티브 트리맵은 `npm run analyze` 실행 후 `.next/diagnostics/analyze`에 생성(용량 문제로 커밋하지 않음, `.next/`는 이미 gitignore 대상).

## 3. 리렌더 커밋 수 — React Profiler (row 단위 격리 검증)

`widgets/coin-list/ui/CoinList.tsx`에 `?debug=profile` 쿼리로만 활성화되는 Profiler 계측을 추가하고, `scripts/measure-rerenders.mjs`(Playwright)로 홈 화면을 20초간 관찰(실시간 WS 티커 수신 중). **주의**: React Profiler는 일반 프로덕션 빌드에서는 계측 코드가 제거되어 무동작이라, `next build --profile`(React 프로덕션 프로파일링 빌드)로 별도 빌드해야 측정됨.

| 구간 | coin-list 커밋 수 | coin-list 평균 duration | coin-list 최대 duration |
| --- | --- | --- | --- |
| mount (최초 281+행 동시 렌더) | 1 | 8.3ms | 8.3ms |
| update (실시간 티커 수신, 정상 상태) | 620 | **0.162ms** | 9.9ms |

- update 구간 20초 동안 개별 row 커밋 합계 623건, 갱신된 서로 다른 row 수 281개 (거의 전 종목에서 가격 틱 발생).
- **해석**: `coin-list`는 하위 row의 모든 커밋을 "감싸는 Profiler"라 자식이 커밋할 때마다 함께 `onRender`가 호출되므로 **commits 수 자체는 격리의 증거가 아니다.** 격리를 증명하는 지표는 **duration**: update 구간에서 `coin-list`의 평균 실제 렌더 작업량(0.162ms)이 개별 row 1개의 렌더 비용과 같은 자릿수이고(예: KRW-XRP row 평균 0.1ms), **281개 행 전체를 다시 그리는 비용과는 자릿수가 다르다.** 즉 실시간 티커 갱신이 실제로 row 단위로만 커밋되고 있음을 확인.

원본 raw 데이터: `perf/rerender-baseline.json`.

## 진행 상황 — 코드 스플리팅 적용 (2026-08-12)

`widgets/coin-detail/ui/CoinDetail.tsx`에서 `CoinChart`를 `next/dynamic(..., { ssr: false })`로 지연 로딩하도록 변경(`perf/bundle-after-codesplitting.json`).

| | 코드 스플리팅 전 | 후 |
| --- | --- | --- |
| 상세 페이지 초기 JS | 1,107.3 KB | **962.4 KB** (−144.9 KB, 약 −13%) |
| `lightweight-charts` 청크가 상세 페이지 **초기 HTML**에 포함됨 | 예 | **아니오** (마운트 시점에 별도로 fetch) |
| 홈 페이지 초기 JS | 957.0 KB | 957.0 KB (변화 없음, 원래도 미포함) |

로딩 폴백은 기존 `CoinDetailSkeleton`의 차트 자리 마크업을 `ChartSkeleton`으로 추출해 재사용(레이아웃 시프트 방지). Playwright로 상세 페이지(`/code/KRW-BTC`)를 열어 캔버스 7개가 여전히 정상 렌더되고 콘솔 에러가 없음을 확인.

Lighthouse LCP/TBT와 리렌더 커밋 수는 아직 재측정 전(다음 최적화들 — 가상 스크롤, WS 스로틀링 — 까지 마친 뒤 한 번에 재측정 예정).

## 재측정 방법 (Phase 5 최적화 완료 후 동일하게 재실행)

```bash
npm run build && npm run start   # 별도 터미널에서 서버 유지
npx lighthouse http://localhost:3000/ --output=json --output-path=./perf/lighthouse-home.json --chrome-flags="--headless --no-sandbox" --only-categories=performance --quiet
npx lighthouse http://localhost:3000/code/KRW-BTC --output=json --output-path=./perf/lighthouse-detail.json --chrome-flags="--headless --no-sandbox" --only-categories=performance --quiet

npm run analyze   # next experimental-analyze -o, 번들 트리맵 확인용

npx next build --profile && npm run start   # 별도 터미널
node scripts/measure-rerenders.mjs
```

`CHROME_PATH` 환경변수가 없으면 Playwright 번들 Chromium 경로를 지정해야 Lighthouse가 브라우저를 찾는다(예: `C:\Users\<user>\AppData\Local\ms-playwright\chromium-<rev>\chrome-win64\chrome.exe`).
