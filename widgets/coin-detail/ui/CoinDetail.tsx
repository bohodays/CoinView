"use client";

import { useCandleHistoryQuery } from "@/entities/candle/api/candle.api.query";
import { useCoinCandles } from "@/entities/candle/api/candle.websocket.query";
import { CandleUnit, MinutesUnit } from "@/entities/candle/model/type";
import CandleUnitButtonsWrapper from "@/feature/candle-type-button/ui/CandleUnitButtonsWrapper";
import CoinChart from "@/feature/coin-chart/ui/CoinChart";
import DetailNavigator from "@/feature/detail-navigator/ui/DetailNavigator";
import { makeFullMarketName } from "@/shared/lib/utils";
import { useMarketData } from "@/widgets/coin-list/api/market.queries";
import { useState } from "react";

type Props = {
  market: string;
};

const CoinDetail = ({ market }: Props) => {
  const [candleUnit, setCandleUnit] = useState<CandleUnit>("seconds");
  const [minutesUnit, setMinutesUnit] = useState<MinutesUnit>(null);
  const { candles, loadMore, isLoadingMore, isLoading, error } = useCoinCandles(
    {
      market: market,
      candleUnit,
      minutesUnit,
    },
  );
  const {
    data: marketData,
    error: marketFetchError,
    isLoading: isMarketDataLoading,
  } = useMarketData(); // 마켓데이터

  // TODO. 스켈레톤 코드로 변경
  if (isMarketDataLoading || isLoading || !marketData || !candles) return null;

  const fullMarketName = makeFullMarketName(market, marketData);

  const onChangeCandleUnit = (candleUnit: CandleUnit) => {
    if (candleUnit !== "minutes") setMinutesUnit(null);

    setCandleUnit(candleUnit);
  };

  const onChangeMinutesUnit = (minuteUnit: MinutesUnit) => {
    setMinutesUnit(minuteUnit);
  };

  return (
    <div className="flex flex-col h-full min-h-0 p-3 gap-3">
      {/* Navigator */}
      <DetailNavigator marketName={fullMarketName} />

      {/* 현재 금액 표시 */}
      <div className="text-xl">
        {candles[candles.length - 1].trade_price.toLocaleString("ko-KR")}
      </div>

      {/* 캔들 타입 선택 버튼 */}
      <CandleUnitButtonsWrapper
        candleUnit={candleUnit}
        onChangeCandleUnit={onChangeCandleUnit}
        onChangeMinutesUnit={onChangeMinutesUnit}
      />

      {/* 차트 */}
      <CoinChart
        candles={candles}
        isLoadingMore={isLoadingMore}
        onLoadMore={loadMore}
      />
    </div>
  );
};

export default CoinDetail;
