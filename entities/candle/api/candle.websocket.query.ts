import { minutesUnitTransWebSocketType } from "@/shared/lib/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CandleUnit, MinutesUnit, UpbitCandle } from "../model/type";
import { useMemo } from "react";
import { v4 as uuidv4 } from "uuid";
import { candleKeys, useCandleHistoryQuery } from "./candle.api.query";
import { useUpbitCandleSocket } from "./candle.websocket";

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
      console.log({ e });
      if (e.sessionId !== sessionId) return;
      console.log(e.candle);
      queryClient.setQueryData<UpbitCandle[]>(
        candleKeys.byMarketUnit(market, candleUnit, minutesUnit),
        (prev) => [...(prev ?? []), e.candle],
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
