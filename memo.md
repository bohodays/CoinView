데이터 종류

마켓 메타(10분): market, korean_name, warning(유의)
→ React Query로 관리 (서버 데이터 + 갱신 느림)

티커(1초): market, trade_price, ...
→ React Query로 “가져오되”, UI 반영은 zustand store로 정규화해서 행 단위 구독으로 처리

왜 zustand가 여기서 필요하냐?
React Query는 “쿼리 결과가 바뀌면 그걸 구독하는 컴포넌트가 통째로 업데이트”되기 쉬워서,
코인 리스트 전체를 매초 rerender할 확률이 높아.
반면 zustand는 **“market 단위 selector”**로 각 Row가 자기 데이터만 구독하게 만들 수 있어.

TODO

1. 리스트 가상화(virtualization) 적용
