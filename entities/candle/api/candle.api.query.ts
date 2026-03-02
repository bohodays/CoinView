import { useQuery } from "@tanstack/react-query";
import { fetchCandle } from "./candle.api";
import { CandleUnit, MinutesUnit, UpbitCandle } from "../model/type";

export const candleKeys = {
  all: ["candles"] as const,
  byMarketUnit: (
    market: string,
    candleUnit: CandleUnit,
    minutesUnit?: MinutesUnit,
  ) => [...candleKeys.all, market, candleUnit, minutesUnit] as const,
};

export const useCandleHistoryQuery = ({
  market,
  candleUnit,
  minutesUnit,
}: {
  market: string;
  candleUnit: CandleUnit;
  minutesUnit?: MinutesUnit;
}) => {
  console.log({ candleUnit });
  return useQuery<UpbitCandle[]>({
    queryKey: candleKeys.byMarketUnit(market, candleUnit, minutesUnit),
    queryFn: () => fetchCandle({ market, candleUnit, minutesUnit }),
    enabled: !!market,
  });
};
