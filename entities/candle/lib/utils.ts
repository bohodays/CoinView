import { CandleUnit, MinutesUnit, UpbitCandle } from "../model/type";

/**
 * UpbitCandle의 시간 -> lightweight-charts time(초 단위 UNIX)
 * - 우선순위: candle_date_time_utc(ISO) → timestamp(ms)
 */
export function upbitCandleToTimeSec(c: UpbitCandle): number {
  const parsed = Date.parse(c.candle_date_time_utc);
  if (!Number.isNaN(parsed)) return Math.floor(parsed / 1000);
  return Math.floor(c.timestamp / 1000);
}

export function minutesUnitTransWebSocketType(
  candleUnit: CandleUnit,
  minutesUnit?: MinutesUnit,
) {
  if (candleUnit === "seconds") return "candle.1s";
  if (candleUnit === "minutes" && minutesUnit) return `candle.${minutesUnit}m`;
  return "candle.";
}

export function isCandleWebSocketSupported(
  candleUnit: CandleUnit,
  minutesUnit?: MinutesUnit,
) {
  if (candleUnit === "seconds") return true;
  return candleUnit === "minutes" && !!minutesUnit;
}
