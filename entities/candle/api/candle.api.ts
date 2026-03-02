import { CandleUnit, MinutesUnit } from "../model/type";

export const fetchCandle = async ({
  market,
  candleUnit,
  minutesUnit,
}: {
  market: string;
  candleUnit: CandleUnit;
  minutesUnit?: MinutesUnit;
}) => {
  try {
    const response = await fetch(
      `/api/upbit/candles?market=${market}&candleUnit=${candleUnit}`,
    );

    if (!response.ok) {
      const errorBody = await response.json().catch(() => null);
      throw new Error(errorBody.message ?? "Failed to fetch candle");
    }

    return response.json();
  } catch (error) {
    throw error;
  }
};
