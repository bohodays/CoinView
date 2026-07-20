import { CandleUnit, MinutesUnit, upbitCandleSchema } from "../model/type";
import { z } from "zod";

const upbitCandleListSchema = z.array(upbitCandleSchema);

export const fetchCandle = async ({
  market,
  candleUnit,
  minutesUnit,
  to,
}: {
  market: string;
  candleUnit: CandleUnit;
  minutesUnit?: MinutesUnit;
  to?: string;
}) => {
  const params = new URLSearchParams({ market, candleUnit });
  if (minutesUnit) params.set("minutesUnit", minutesUnit);
  if (to) params.set("to", to);

  try {
    const response = await fetch(`/api/upbit/candles?${params.toString()}`);

    if (!response.ok) {
      const errorBody = await response.json().catch(() => null);
      throw new Error(errorBody?.message ?? "Failed to fetch candle");
    }

    const data = await response.json();
    return upbitCandleListSchema.parse(data);
  } catch (error) {
    throw error;
  }
};
