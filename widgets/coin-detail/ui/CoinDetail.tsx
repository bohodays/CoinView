"use client";

import { useCandleHistoryQuery } from "@/entities/candle/api/candle.api.query";
import { useCoinCandles } from "@/entities/candle/api/candle.websocket.query";
import CoinChart from "@/feature/coin-chart/ui/CoinChart";
import DetailNavigator from "@/feature/detail-navigator/ui/DetailNavigator";

type Props = {
  market: string;
};

const CoinDetail = ({ market }: Props) => {
  const { candles, isLoading, error, wsStatus } = useCoinCandles({
    market: market,
    candleUnit: "seconds",
  });

  console.log({ candles, wsStatus });
  // const { data, error, isLoading } = useCandleHistoryQuery({
  //   market: "KRW-BTC",
  //   candleUnit: "seconds",
  // });

  // TODO. 스켈레톤 코드로 변경
  if (isLoading || !candles) return null;

  return (
    <div className="flex flex-col h-full min-h-0 p-3 gap-2">
      {/* Navigator */}
      <DetailNavigator />

      {/* 현재 금액 표시 */}
      <div className="text-xl">
        {candles[candles.length - 1].trade_price.toLocaleString("ko-KR")}
      </div>

      {/* 차트 */}
      <CoinChart candles={candles} />
    </div>
  );
};

export default CoinDetail;
