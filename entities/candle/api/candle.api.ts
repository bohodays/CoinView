import { CandleUnit, MinutesUnit, upbitCandleSchema } from "../model/type";
import { apiFetch } from "@/shared/api";
import { z } from "zod";

const upbitCandleListSchema = z.array(upbitCandleSchema);

export const fetchCandle = ({
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

  return apiFetch(
    `/api/upbit/candles?${params.toString()}`,
    upbitCandleListSchema,
  );
};
