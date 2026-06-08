import { useTickerStore } from "@/entities/coin-row/model/ticker.store";

const CoinCurrentPriceInfo = ({ market }: { market: string }) => {
  const ticker = useTickerStore((store) => store.tickers[market]);

  return (
    <div className="text-xl">{ticker?.trade_price.toLocaleString("ko-KR")}</div>
  );
};

export default CoinCurrentPriceInfo;
