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
