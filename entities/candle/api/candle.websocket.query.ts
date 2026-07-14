import {
  isCandleWebSocketSupported,
  minutesUnitTransWebSocketType,
} from "@/shared/lib/utils";
import { InfiniteData, useQueryClient } from "@tanstack/react-query";
import { CandleUnit, MinutesUnit, UpbitCandle } from "../model/type";
import { useEffect, useMemo } from "react";
import { candleKeys } from "./candle.keys";
import { useUpbitCandleSocket } from "./candle.websocket";
import { upbitCandleToTimeSec } from "@/feature/coin-chart/lib/utils";
import { useCandleHistoryInfiniteQuery } from "./candle.api.infinite.query";
import { useTickerStore } from "@/entities/coin-row/model/ticker.store";
import { connectTickerSocketByCodes } from "@/entities/coin-row/websocket/ticker.websocket";

function mergePagesToSortedUnique(pages: UpbitCandle[][]): UpbitCandle[] {
  // timeSec 기준 중복 제거 + 오름차순 정렬
  const map = new Map<number, UpbitCandle>();
  for (const page of pages) {
    for (const c of page) {
      map.set(upbitCandleToTimeSec(c), c);
    }
  }
  return Array.from(map.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([, c]) => c);
}

export const useCoinCandles = ({
  market,
  candleUnit,
  minutesUnit,
}: {
  market: string;
  candleUnit: CandleUnit;
  minutesUnit?: MinutesUnit;
}) => {
  const queryClient = useQueryClient();
  const wsUnit = useMemo(
    () => minutesUnitTransWebSocketType(candleUnit, minutesUnit),
    [candleUnit, minutesUnit],
  );
  const supportsCandleWs = useMemo(
    () => isCandleWebSocketSupported(candleUnit, minutesUnit),
    [candleUnit, minutesUnit],
  );

  const sessionId = `${market}:${candleUnit}:${minutesUnit ?? ""}`;
  const ticker = useTickerStore((store) => store.tickers[market]);

  const historyQuery = useCandleHistoryInfiniteQuery({
    market,
    candleUnit,
    minutesUnit,
  });

  // REST 성공 후에만 WS 연결(순서 보장)
  const wsEnabled = historyQuery.isSuccess && !!market && supportsCandleWs;

  useEffect(() => {
    if (!historyQuery.isSuccess || !market || supportsCandleWs) return;

    connectTickerSocketByCodes([market]);
  }, [historyQuery.isSuccess, market, supportsCandleWs]);

  const { status: wsStatus } = useUpbitCandleSocket({
    market,
    candleUnit,
    minutesUnit,
    enabled: wsEnabled,
    sessionId,
    onCandle: (e) => {
      if (e.sessionId !== sessionId) return;

      const incoming = e.candle;
      const t = upbitCandleToTimeSec(incoming);

      queryClient.setQueryData<InfiniteData<UpbitCandle[]>>(
        candleKeys.byMarketUnit(market, candleUnit, minutesUnit),
        (prev) => {
          if (!prev || !prev.pages || prev.pages.length === 0) {
            return {
              pages: [[incoming]],
              pageParams: [undefined],
            };
          }

          const pages = prev.pages.map((p) => [...p]); // shallow copy
          const firstPage = pages[0];
          const last = firstPage[firstPage.length - 1];
          const lastT = last ? upbitCandleToTimeSec(last) : null;

          // 1) 최신 데이터와 동일 time이면 마지막 교체
          if (lastT !== null && t === lastT) {
            firstPage[firstPage.length - 1] = incoming;
            pages[0] = firstPage;
            return { ...prev, pages };
          }

          // 2) 더 최신이면 firstPage 끝에 append
          if (lastT !== null && t > lastT) {
            firstPage.push(incoming);
            pages[0] = firstPage;
            return { ...prev, pages };
          }

          // 3) t < lastT: 늦게 온 과거(또는 중간) 데이터
          //    전체 pages를 훑어서 같은 time이 있으면 그 자리 교체, 없으면 무시(정책)
          for (let pi = 0; pi < pages.length; pi++) {
            const page = pages[pi];
            const idx = page.findIndex((c) => upbitCandleToTimeSec(c) === t);
            if (idx !== -1) {
              page[idx] = incoming;
              pages[pi] = page;
              return { ...prev, pages };
            }
          }

          return prev;
        },
      );
    },
  });

  const candles = useMemo(() => {
    const pages = historyQuery.data?.pages ?? [];
    return mergePagesToSortedUnique(pages);
  }, [historyQuery.data]);
  const liveCandles = useMemo(() => {
    if (supportsCandleWs || !ticker || candles.length === 0) return candles;

    const latestCandle = candles[candles.length - 1];
    const currentPrice = ticker.trade_price;

    return [
      ...candles.slice(0, -1),
      {
        ...latestCandle,
        high_price: Math.max(latestCandle.high_price, currentPrice),
        low_price: Math.min(latestCandle.low_price, currentPrice),
        trade_price: currentPrice,
        timestamp: ticker.timestamp,
      },
    ];
  }, [candles, supportsCandleWs, ticker]);
  const latestCandlePrice = liveCandles[liveCandles.length - 1]?.trade_price;
  const currentPrice = supportsCandleWs
    ? latestCandlePrice
    : (ticker?.trade_price ?? latestCandlePrice);

  // 과거 로딩 트리거 (CoinChart에서 호출)
  const loadMore = async (): Promise<void> => {
    if (!historyQuery.hasNextPage) return;
    if (historyQuery.isFetchingNextPage) return;

    await historyQuery.fetchNextPage(); // 반환값 무시
  };

  return {
    candles: liveCandles,
    currentPrice,

    // history 상태
    isLoading: historyQuery.isLoading,
    isFetching: historyQuery.isFetching,
    error: historyQuery.error,

    // load more 상태
    loadMore,
    isLoadingMore: historyQuery.isFetchingNextPage,
    hasMore: historyQuery.hasNextPage,

    // ws 상태
    wsStatus,
    wsUnit,
  };
};
