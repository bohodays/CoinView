"use client";

import { useCoinCandles, CandleUnit, MinutesUnit } from "@/entities/candle";
import { CandleUnitButtonsWrapper } from "@/features/candle-type-button";
import { CoinChart } from "@/features/coin-chart";
import { CoinCurrentPriceInfo } from "@/features/coin-current-price-info";
import { DetailNavigator } from "@/features/detail-navigator";
import { makeFullMarketName, useMarketData } from "@/entities/market";
import { useState } from "react";

type Props = {
  market: string;
};

const CoinDetail = ({ market }: Props) => {
  const [candleUnit, setCandleUnit] = useState<CandleUnit>("seconds");
  const [minutesUnit, setMinutesUnit] = useState<MinutesUnit>(null);
  const { candles, currentPrice, loadMore, isLoadingMore, isLoading } =
    useCoinCandles({
      market: market,
      candleUnit,
      minutesUnit,
    });
  const {
    data: marketData,
    isLoading: isMarketDataLoading,
  } = useMarketData(); // 마켓데이터

  if (isMarketDataLoading || isLoading || !marketData || !candles) {
    return <CoinDetailSkeleton />;
  }

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
      <CoinCurrentPriceInfo price={currentPrice} />

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

const CoinDetailSkeleton = () => {
  return (
    <div
      className="flex h-full min-h-0 flex-col gap-3 p-3"
      aria-label="코인 상세 정보 로딩 중"
    >
      <div className="flex items-center gap-2">
        <div className="size-6 animate-pulse rounded-md bg-muted" />
        <div className="h-5 w-40 animate-pulse rounded-md bg-muted" />
      </div>

      <div className="h-7 w-32 animate-pulse rounded-md bg-muted" />

      <div className="flex justify-evenly">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="h-9 w-10 animate-pulse rounded-md bg-muted"
          />
        ))}
      </div>

      <div className="relative h-[360px] w-full overflow-hidden rounded-md border border-border">
        <div className="absolute left-0 right-0 top-10 h-px bg-border" />
        <div className="absolute left-0 right-0 top-32 h-px bg-border" />
        <div className="absolute left-0 right-0 top-56 h-px bg-border" />
        <div className="absolute inset-x-4 bottom-8 h-44 animate-pulse rounded-md bg-muted" />
        <div className="absolute inset-x-4 bottom-4 h-8 animate-pulse rounded-md bg-muted/70" />
      </div>
    </div>
  );
};

export default CoinDetail;
