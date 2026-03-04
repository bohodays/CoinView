import { CandleUnit, MinutesUnit } from "@/entities/candle/model/type";
import { CoinViewModel, Ticker } from "@/entities/coin-row/model/type";
import { Market } from "@/widgets/coin-list/model/types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// tailwind CSS
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function mergeMarketAndTicker({
  tickerAllData,
  market,
}: {
  tickerAllData: Ticker[];
  market: Market[];
}) {
  const orderMap = new Map(
    tickerAllData.map((ticker, index) => [ticker.market, index]),
  );

  return [...market].sort((a, b) => {
    return (
      (orderMap.get(a.market) ?? Infinity) -
      (orderMap.get(b.market) ?? Infinity)
    );
  });
}

export function minutesUnitTransWebSocketType(
  candleUnit: CandleUnit,
  minutesUnit?: MinutesUnit,
) {
  if (candleUnit !== "seconds" && candleUnit !== "minutes") return;

  // 초봉
  if (candleUnit === "seconds") return "candle.1s";

  // 분봉
  let typeResult = "candle.";
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

  return typeResult;
}

/**
 * Market의 풀네임을 만드는 유틸 함수
 * ex) KRW-BTC -> 비트코인(BTC/KRW)
 * @param markets
 */
export function makeFullMarketName(market: string, markets: Market[]) {
  const splitedMarket = market.split("-");
  const marketName = `${splitedMarket[1]}/${splitedMarket[0]}`;
  const fullMarketName = `${markets.filter((item) => item.market === market)[0].korean_name} (${marketName})`;
  return fullMarketName;
}
