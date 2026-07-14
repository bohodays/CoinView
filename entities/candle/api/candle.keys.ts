import { CandleUnit, MinutesUnit } from "../model/type";

export const candleKeys = {
  all: ["candles"] as const,
  byMarketUnit: (
    market: string,
    candleUnit: CandleUnit,
    minutesUnit?: MinutesUnit,
  ) => [...candleKeys.all, market, candleUnit, minutesUnit] as const,
};
