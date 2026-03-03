import { minutesUnitTransWebSocketType } from "@/shared/lib/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CandleUnit, MinutesUnit, UpbitCandle } from "../model/type";
import { useMemo } from "react";
import { v4 as uuidv4 } from "uuid";
import { candleKeys, useCandleHistoryQuery } from "./candle.api.query";
import { useUpbitCandleSocket } from "./candle.websocket";
import { upbitCandleToTimeSec } from "@/feature/coin-chart/lib/utils";

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

  const sessionId = useMemo(() => uuidv4(), [candleUnit, minutesUnit]);

  const historyQuery = useCandleHistoryQuery({
    market,
    candleUnit,
    minutesUnit,
  });

  // REST 성공 후에만 WS 연결(순서 보장)
  const wsEnabled = historyQuery.isSuccess && !!market;

  const { status: wsStatus } = useUpbitCandleSocket({
    market,
    candleUnit,
    minutesUnit,
    enabled: wsEnabled,
    sessionId,
    onCandle: (e) => {
      if (e.sessionId !== sessionId) return;

      queryClient.setQueryData<UpbitCandle[]>(
        candleKeys.byMarketUnit(market, candleUnit, minutesUnit),
        (prev) => {
          const list = prev ?? [];
          const incoming = e.candle;
          const t = upbitCandleToTimeSec(incoming);

          if (list.length === 0) return [incoming];

          // 1) 마지막과 동일 time이면 마지막 교체
          const last = list[list.length - 1];
          const lastT = upbitCandleToTimeSec(last);
          if (t === lastT) {
            const next = [...list];
            next[next.length - 1] = incoming;
            return next;
          }

          // 2) 더 최신이면 append
          if (t > lastT) return [...list, incoming];

          // 3) t < lastT: 늦게 온 과거 데이터
          // 같은 time이 이미 있으면 그 자리 교체, 없으면 무시(또는 삽입 정책)
          const idx = list.findIndex((c) => upbitCandleToTimeSec(c) === t);
          if (idx !== -1) {
            const next = [...list];
            next[idx] = incoming;
            return next;
          }

          return list;
        },
      );
    },
  });

  return {
    candles: historyQuery.data ?? [],
    isLoading: historyQuery.isLoading,
    isFetching: historyQuery.isFetching,
    error: historyQuery.error,
    wsStatus,
  };
};
