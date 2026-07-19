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
  // 초봉
  if (candleUnit === "seconds") return "candle.1s";

  // 분봉
  let typeResult = "candle.";
  if (candleUnit === "minutes") {
    switch (minutesUnit) {
      case "1":
        typeResult += "1m";
        break;
      case "3":
        typeResult += "3m";
        break;
      case "5":
        typeResult += "5m";
        break;
      case "10":
        typeResult += "10m";
        break;
      case "15":
        typeResult += "15m";
        break;
      case "30":
        typeResult += "30m";
        break;
      case "60":
        typeResult += "60m";
        break;
      case "240":
        typeResult += "240m";
        break;
      default:
        break;
    }
  }

  return typeResult;
}

export function isCandleWebSocketSupported(
  candleUnit: CandleUnit,
  minutesUnit?: MinutesUnit,
) {
  if (candleUnit === "seconds") return true;
  return candleUnit === "minutes" && !!minutesUnit;
}
