"use client";

import { useCandleHistoryQuery } from "@/entities/candle/api/candle.api.query";
import { useCoinCandles } from "@/entities/candle/api/candle.websocket.query";
import CandleUnitButtonsWrapper from "@/feature/candle-type-button/ui/CandleUnitButtonsWrapper";
import CoinChart from "@/feature/coin-chart/ui/CoinChart";
import DetailNavigator from "@/feature/detail-navigator/ui/DetailNavigator";
import { makeFullMarketName } from "@/shared/lib/utils";
import { useMarketData } from "@/widgets/coin-list/api/market.queries";

type Props = {
  market: string;
};

const CoinDetail = ({ market }: Props) => {
  const {
    candles,
    isLoading: isCoinCandleLoading,
    error: coinCandleError,
    wsStatus,
  } = useCoinCandles({
    market: market,
    candleUnit: "seconds",
  });
  const {
    data: marketData,
    error: marketFetchError,
    isLoading: isMarketDataLoading,
  } = useMarketData(); // 마켓데이터

  console.log({ candles, wsStatus });
  // const { data, error, isLoading } = useCandleHistoryQuery({
  //   market: "KRW-BTC",
  //   candleUnit: "seconds",
  // });

  // TODO. 스켈레톤 코드로 변경
  if (isMarketDataLoading || isCoinCandleLoading || !marketData || !candles)
    return null;

  const fullMarketName = makeFullMarketName(market, marketData);

  return (
    <div className="flex flex-col h-full min-h-0 p-3 gap-3">
      {/* Navigator */}
      <DetailNavigator marketName={fullMarketName} />

      {/* 현재 금액 표시 */}
      <div className="text-xl">
        {candles[candles.length - 1].trade_price.toLocaleString("ko-KR")}
      </div>

      {/* 캔들 타입 선택 버튼 */}
      <CandleUnitButtonsWrapper />

      {/* 차트 */}
      <CoinChart candles={candles} />
    </div>
  );
};

export default CoinDetail;
