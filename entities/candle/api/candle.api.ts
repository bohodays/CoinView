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
      throw new Error(errorBody?.message ?? "Failed to fetch candle");
    }

    const data = await response.json();
    return upbitCandleListSchema.parse(data);
  } catch (error) {
    throw error;
  }
};
