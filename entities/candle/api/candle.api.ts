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
  let TARGET_URL = "";
  let response;
  try {
    if (to) {
      if (minutesUnit) {
        TARGET_URL = `/api/upbit/candles?market=${market}&candleUnit=${candleUnit}&minutesUnit=${minutesUnit}&to=${to}`;
      } else {
        TARGET_URL = `/api/upbit/candles?market=${market}&candleUnit=${candleUnit}&to=${to}`;
      }
    } else {
      if (minutesUnit) {
        TARGET_URL = `/api/upbit/candles?market=${market}&candleUnit=${candleUnit}&minutesUnit=${minutesUnit}`;
      } else {
        TARGET_URL = `/api/upbit/candles?market=${market}&candleUnit=${candleUnit}`;
      }
    }

    response = await fetch(TARGET_URL);

    if (!response.ok) {
      const errorBody = await response.json().catch(() => null);
      throw new Error(errorBody.message ?? "Failed to fetch candle");
    }

    return response.json();
  } catch (error) {
    throw error;
  }
};
