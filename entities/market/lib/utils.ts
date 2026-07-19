import type { Ticker } from "@/entities/coin-row";
import { Market } from "../model/type";

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

/**
 * Market의 풀네임을 만드는 유틸 함수
 * ex) KRW-BTC -> 비트코인(BTC/KRW)
 * @param markets
 */
export function makeFullMarketName(market: string, markets: Market[]) {
  const splitedMarket = market.split("-");
  const marketName = `${splitedMarket[1]}/${splitedMarket[0]}`;
  const matched = markets.find((item) => item.market === market);

  if (!matched) return marketName;

  return `${matched.korean_name} (${marketName})`;
}
