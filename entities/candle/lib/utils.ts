import { CandleUnit, MinutesUnit } from "../model/type";

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
