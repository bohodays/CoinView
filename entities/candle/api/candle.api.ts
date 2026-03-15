import { CandleUnit, MinutesUnit } from "../model/type";

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
  let response;
  try {
    if (to) {
      response = await fetch(
        `/api/upbit/candles?market=${market}&candleUnit=${candleUnit}&to=${to}`,
      );
    } else {
      response = await fetch(
        `/api/upbit/candles?market=${market}&candleUnit=${candleUnit}`,
      );
    }

    if (!response.ok) {
      const errorBody = await response.json().catch(() => null);
      throw new Error(errorBody.message ?? "Failed to fetch candle");
    }

    return response.json();
  } catch (error) {
    throw error;
  }
};
