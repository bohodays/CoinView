# CoinView

실시간 코인 시세와 캔들 차트를 조회할 수 있는 웹 애플리케이션입니다.  
Upbit REST API와 WebSocket을 함께 사용해 KRW 마켓 목록, 실시간 현재가, 등락률, 캔들 차트를 제공합니다.

개인 포트폴리오 프로젝트로, 단순 조회 화면을 만드는 데서 끝내지 않고 **실시간 데이터 처리**, **렌더링 최적화**, **FSD 기반 구조화**, **차트 데이터 갱신 전략**을 직접 설계하는 데 초점을 두었습니다.

## 주요 기능

- KRW 마켓 코인 목록 조회
- 코인명, 영문명, 심볼 기반 검색
- WebSocket 기반 실시간 현재가 반영
- 가격 상승/하락 시 시각적 피드백 표시
- 유의/주의 종목 태그 표시
- 코인 상세 페이지 이동
- 초/분/일/주/월/년 단위 캔들 차트 조회
- 차트 좌측 이동 시 과거 캔들 데이터 추가 로딩
- 다크 모드 지원

## 페이지 구성

### 홈 페이지 `/`

코인 목록을 확인하고 원하는 코인을 검색할 수 있는 메인 화면입니다.

- `Header`: 서비스 로고, 사용자 메뉴, 테마 토글 진입점 제공
- `CoinSearchBar`: 마켓 메타 데이터를 기반으로 코인명, 영문명, 심볼 검색
- `CoinList`: KRW 마켓 전체 목록 렌더링
- `CoinRow`: 각 코인의 현재가, 전일 대비 등락률, 등락 금액, 유의/주의 태그 표시

초기 데이터는 REST API로 가져오고, 이후 실시간 가격 변경은 WebSocket으로 수신해 row 단위로 반영합니다.

### 코인 상세 페이지 `/code/[market]`

선택한 코인의 상세 시세와 캔들 차트를 확인하는 화면입니다.

- `DetailNavigator`: 이전 페이지 이동과 현재 마켓명 표시
- `CandleUnitButtonsWrapper`: 초봉, 분봉, 일봉, 주봉, 월봉, 연봉 선택
- `CoinChart`: TradingView Lightweight Charts 기반 캔들/거래량 차트 표시
- 차트 좌측 탐색 시 `useInfiniteQuery`로 과거 캔들 데이터 추가 조회
- WebSocket을 지원하는 캔들 단위에서는 실시간 캔들 데이터를 쿼리 캐시에 반영
- WebSocket 미지원 단위에서는 ticker 데이터를 활용해 마지막 캔들의 현재가를 보정

## 기술 스택

| 구분 | 기술 |
| --- | --- |
| Framework | Next.js App Router |
| Language | TypeScript |
| UI | React, Tailwind CSS, shadcn/ui, Radix UI |
| State | Zustand |
| Server State | TanStack Query |
| Chart | TradingView Lightweight Charts |
| Realtime | Upbit WebSocket |
| API | Next.js Route Handler, Upbit REST API |
| Theme | next-themes |
| Icon | lucide-react |
| Component Docs | Storybook |

## 아키텍처

프로젝트는 FSD(Feature-Sliced Design)에 가까운 계층 구조로 구성했습니다.

```text
app/        Next.js 라우트, 전역 Provider, API Route
views/      페이지 단위 화면 조합
widgets/    독립적인 화면 블록
feature/    사용자 액션 중심 기능
entities/   도메인 모델, API, store, UI
shared/     공통 유틸리티
components/ shadcn/ui 기반 공통 UI
```

이 구조를 사용한 이유는 화면이 커질수록 컴포넌트, API, 상태 관리 코드가 섞이기 쉽기 때문입니다.  
페이지는 `views`에서 조립하고, 도메인 로직은 `entities`, 사용자 기능은 `feature`, 큰 UI 블록은 `widgets`로 나누어 변경 범위를 예측하기 쉽게 구성했습니다.

## 데이터 처리 전략

### 마켓 메타 데이터

마켓명, 한글명, 유의 종목 정보처럼 자주 바뀌지 않는 데이터는 TanStack Query로 관리합니다.

- `staleTime`: 10분
- `refetchInterval`: 10분
- Next.js Route Handler의 `revalidate = 600`과 동일한 주기로 설정
- KRW 마켓만 `select` 단계에서 필터링

### 티커 데이터

초기 티커 목록은 REST API로 가져오고, 이후 가격 변경은 WebSocket으로 수신합니다.

React Query만으로 실시간 ticker를 관리하면 쿼리 결과가 갱신될 때 목록 전체가 함께 업데이트되기 쉽습니다.  
이를 줄이기 위해 WebSocket 수신 데이터는 Zustand store에 `market` 기준으로 정규화해서 저장했습니다.

```ts
tickers: Record<string, TickerWs>
```

각 `CoinRow`는 `useTickerStore((store) => store.tickers[market])` 형태로 자기 마켓의 데이터만 구독합니다.  
덕분에 특정 코인의 가격이 바뀌어도 전체 리스트가 아니라 해당 row 중심으로 렌더링 범위를 좁힐 수 있습니다.

### 캔들 데이터

상세 페이지의 캔들 데이터는 REST API와 WebSocket을 함께 사용합니다.

- 최초 진입 시 REST API로 최신 캔들 조회
- 차트 좌측 탐색 시 `useInfiniteQuery`로 과거 데이터 추가 조회
- 초봉/분봉처럼 WebSocket을 지원하는 단위는 실시간 캔들을 쿼리 캐시에 병합
- 중복 캔들은 time 기준으로 제거하고 오름차순으로 정렬
- 동일 시간 캔들은 교체, 더 최신 캔들은 append하는 방식으로 최신 상태 유지

## 최적화 포인트

### Row 단위 렌더링 최적화

실시간 가격 데이터는 1초 단위로 자주 변경되기 때문에 목록 전체 리렌더링을 줄이는 것이 중요했습니다.

- WebSocket 데이터는 Zustand에 market key로 정규화
- 각 row는 자신에게 필요한 ticker만 selector로 구독
- `React.memo`를 적용해 부모 렌더링이 row 전체 렌더링으로 번지는 것을 방지
- 동일 timestamp 데이터는 store 업데이트 단계에서 skip

### 서버 상태와 클라이언트 상태 분리

변경 주기가 느린 서버 데이터와 변경 주기가 빠른 실시간 데이터를 분리했습니다.

- 마켓 메타, 초기 ticker, 캔들 히스토리: TanStack Query
- 실시간 ticker stream: Zustand
- 차트 WebSocket 데이터: TanStack Query cache 직접 갱신

이렇게 나누면서 캐싱, 재검증, 무효화가 필요한 데이터는 React Query에 맡기고, 고빈도 UI 업데이트는 Zustand selector 기반 구독으로 처리했습니다.

### 차트 업데이트 최적화

TradingView Lightweight Charts 인스턴스와 series 객체는 `useRef`로 보관해 React 렌더링과 분리했습니다.

- 최초 데이터는 `setData`
- 최신 캔들 변경은 `update`
- 과거 데이터가 prepend되는 경우에만 `setData`
- 추가 로딩 중복 호출을 막기 위해 ref 기반 lock 사용
- 차트 인스턴스는 unmount 시 명시적으로 remove

### API Proxy와 캐싱

클라이언트에서 Upbit REST API를 직접 호출하지 않고 Next.js Route Handler를 통해 프록시했습니다.

- API base URL을 서버 환경 변수로 관리
- 마켓/티커 API는 Route Handler에서 10분 revalidate 적용
- 클라이언트 쿼리 캐시 주기와 서버 revalidate 주기를 맞춰 불필요한 요청을 줄임

### UX 최적화

- 목록과 상세 페이지에 skeleton UI를 적용해 로딩 상태를 명확히 표현
- 가격 변경 시 상승/하락 방향에 따라 border 색상 피드백 제공
- `tabular-nums`를 사용해 숫자 폭 변화로 인한 시각적 흔들림 완화
- 검색 결과를 최대 8개로 제한해 드롭다운 사용성을 유지
- 다크 모드를 지원해 시세 확인 화면의 장시간 사용성을 고려

## 트러블슈팅 및 개선 경험

### 실시간 목록 렌더링 범위 문제

초기에는 ticker 데이터를 React Query 중심으로만 다루는 방식을 고려했습니다.  
하지만 실시간 데이터는 변경 빈도가 높고, 쿼리 결과를 구독하는 컴포넌트가 넓어질수록 코인 목록 전체가 자주 업데이트될 수 있습니다.

이를 해결하기 위해 ticker stream은 Zustand store로 분리하고, `market` 단위 selector를 통해 row별 구독 구조로 변경했습니다.  
이 방식으로 실시간성은 유지하면서도 렌더링 영향을 받는 컴포넌트 범위를 줄였습니다.

### 캔들 히스토리와 실시간 캔들 병합

차트는 과거 데이터와 실시간 데이터가 동시에 반영되어야 합니다.  
과거 데이터는 pagination으로 앞쪽에 추가되고, 실시간 데이터는 마지막 캔들을 교체하거나 뒤에 추가됩니다.

이를 위해 캔들 timestamp를 기준으로 중복을 제거하고, WebSocket 수신 시 동일 시간 캔들은 교체, 최신 시간 캔들은 append하는 규칙을 적용했습니다.

## 실행 방법

```bash
npm install
npm run dev
```

개발 서버 실행 후 `http://localhost:3000`에서 확인할 수 있습니다.

### 환경 변수

프로젝트 루트에 `.env` 파일을 생성하고 아래 값을 설정합니다.

```env
UPBIT_API_BASE_URL=https://api.upbit.com
NEXT_PUBLIC_UPBIT_WEBSOCKET_BASE_URL=wss://api.upbit.com/websocket/v1
```

## 스크립트

| 명령어 | 설명 |
| --- | --- |
| `npm run dev` | 개발 서버 실행 |
| `npm run build` | 프로덕션 빌드 |
| `npm run start` | 프로덕션 서버 실행 |
| `npm run lint` | ESLint 검사 |
| `npm run storybook` | Storybook 실행 |
| `npm run build-storybook` | Storybook 빌드 |

## 향후 개선 사항

- 코인 목록 가상 스크롤 적용
- 관심 코인 즐겨찾기 기능
- 차트 보조지표 추가
- 에러/재연결 상태 UI 강화
- 핵심 유틸과 데이터 병합 로직 테스트 보강
