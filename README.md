# 📈 코인 실시간 가격 차트 웹앱

<br>

## 📌 프로젝트 개요

코인 실시간 가격을 조회할 수 있는 웹앱입니다.  
최신 프론트엔드 기술 스택을 활용하여 개인 역량을 강화하고 실무 경쟁력을 높이는 것을 목표로 합니다.

<br>

## 🛠 기술 스택

| 구분                        | 기술                           |
| --------------------------- | ------------------------------ |
| **Framework**               | Next.js (App Router)           |
| **CSS**                     | Tailwind CSS                   |
| **UI/UX**                   | shadcn/ui                      |
| **Animation**               | framer-motion                  |
| **Validation**              | Zod                            |
| **Form Handling**           | react-hook-form                |
| **Data Fetching & Caching** | react-query                    |
| **State Management**        | zustand                        |
| **Component Development**   | Storybook                      |
| **Chart Library**           | TradingView Lightweight Charts |
| **Stock API**               | Finnhub.io (REST + WebSocket)  |

---

<details>
<summary>📖 기술 선정 공통 이유</summary>

이번 프로젝트는 현재 회사에서 사용하지 않는 최신 프론트엔드 기술들을 적극적으로 활용하여,  
**개인 역량 강화**와 **실무 경쟁력 향상**을 목표로 합니다.  
다양한 라이브러리와 프레임워크를 직접 적용해봄으로써 최신 개발 트렌드에 맞춘 개발 경험을 쌓고,  
향후 실무에서 요구되는 기술을 빠르게 적용할 수 있는 능력을 기르는 것이 핵심 목적입니다.

</details>

---

<details>
<summary>📦 기술 스택 및 선정 이유</summary>

### **Framework: Next.js (App Router)**

- 서버 사이드 렌더링(SSR)과 정적 사이트 생성(SSG) 지원으로 SEO와 초기 로딩 속도 최적화
- App Router 기반의 서버/클라이언트 컴포넌트 분리로 효율적 렌더링
- API Routes, Middleware, Edge Functions 등 풀스택 기능 내장

---

### **CSS: Tailwind CSS**

- 유틸리티 퍼스트 접근으로 빠르고 일관성 있는 스타일링 가능
- CSS 파일 관리 부담 감소
- 다크 모드, 반응형 디자인 등 최신 UI 요구사항에 즉시 대응 가능

---

### **UI/UX: shadcn/ui**

- Tailwind CSS 기반으로 기존 스타일 시스템과 완벽 호환
- Radix UI 기반으로 접근성(Accessibility) 표준 준수
- 필요한 컴포넌트만 선택 설치 및 코드 수정 가능 → 커스터마이징 용이
- 현대적 디자인을 즉시 적용 가능, UI 설계 시간 단축
- 버튼, 모달, 드롭다운, 탭, 폼 필드 등 프로덕션 레벨 고품질 컴포넌트 제공
- Tailwind Variants로 상태·사이즈·색상별 스타일 분리 → 유지보수성 강화

---

### **Animation: framer-motion**

- React에 특화된 애니메이션 라이브러리
- 단순한 페이드/슬라이드부터 복잡한 제스처 기반 인터렉션까지 구현 가능
- 선언적 API로 애니메이션 로직을 간결하게 작성 가능

---

### **Validation: zod**

- 런타임 타입 검증과 타입스크립트 타입 추론 통합
- react-hook-form과 높은 호환성
- API 응답 데이터 검증 가능 → 안전한 데이터 핸들링

---

### **Form Handling: react-hook-form**

- 최소 렌더링으로 폼 성능 최적화
- 다양한 유효성 검사 패턴 지원
- Zod와 결합해 타입 안전성 및 UX 강화

---

### **Data Fetching & Caching: react-query**

- API 데이터 캐싱, 자동 재검증, 에러 처리 내장
- 로딩/에러/갱신 상태를 선언적으로 관리 가능
- 실시간 데이터 패턴(WebSocket, 폴링)에도 확장 가능

---

### **State Management: zustand**

- 심플하고 직관적인 API
- 전역 상태를 최소한의 코드로 관리
- 비동기 상태 업데이트 및 persist 미들웨어 지원

---

### **Component Development: Storybook**

- 격리된 환경에서 UI 컴포넌트 개발 및 문서화 가능
- 컴포넌트 상태, 변형, 상호작용 시각화
- 디자인·QA 협업에 유리

---

### **Chart Library: TradingView Lightweight Charts**

- 금융 데이터 시각화에 최적화
- 캔들스틱, 라인, 영역 차트 지원
- 오픈소스(별도 신청 없이 바로 사용 가능)

---

### **Coin API: 두나무**

- REST API로 과거 데이터 수집
- WebSocket으로 실시간 시세 스트리밍

</details>
