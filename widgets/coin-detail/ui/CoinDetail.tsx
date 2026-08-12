"use client";

import { useCoinCandles, CandleUnit, MinutesUnit } from "@/entities/candle";
import { CandleUnitButtonsWrapper } from "@/features/candle-type-button";
import { CoinCurrentPriceInfo } from "@/features/coin-current-price-info";
import { DetailNavigator } from "@/features/detail-navigator";
import { makeFullMarketName, useMarketData } from "@/entities/market";
import { ErrorState } from "@/shared/ui";
import dynamic from "next/dynamic";
import { useState } from "react";

// lightweight-charts(~167KB)는 상세 페이지 진입 후 실제로 차트를 그릴
// 때만 필요하므로 지연 로딩. ssr:false로 서버 렌더링에서 제외하고
// 클라이언트에서 청크를 따로 받아오는 동안 ChartSkeleton을 보여준다.
const CoinChart = dynamic(
  () => import("@/features/coin-chart").then((mod) => mod.CoinChart),
  { ssr: false, loading: () => <ChartSkeleton /> },
);

type Props = {
  market: string;
};

const CoinDetail = ({ market }: Props) => {
  const [candleUnit, setCandleUnit] = useState<CandleUnit>("seconds");
  const [minutesUnit, setMinutesUnit] = useState<MinutesUnit>(null);
  const {
    candles,
    currentPrice,
    loadMore,
    isLoadingMore,
    isLoading,
    isError: isCandlesError,
    refetch: refetchCandles,
  } = useCoinCandles({
    market: market,
    candleUnit,
    minutesUnit,
  });
  const {
    data: marketData,
    isLoading: isMarketDataLoading,
    isError: isMarketDataError,
    refetch: refetchMarketData,
  } = useMarketData(); // 마켓데이터

  if (isMarketDataLoading || isLoading) {
    return <CoinDetailSkeleton />;
  }

  if (isMarketDataError || isCandlesError || !marketData || !candles) {
    return (
      <ErrorState
        message="시세 정보를 불러오지 못했습니다."
        onRetry={() => {
          refetchMarketData();
          refetchCandles();
        }}
      />
    );
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
        minutesUnit={minutesUnit}
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

const ChartSkeleton = () => (
  <div className="relative h-[360px] w-full overflow-hidden rounded-md border border-border">
    <div className="absolute left-0 right-0 top-10 h-px bg-border" />
    <div className="absolute left-0 right-0 top-32 h-px bg-border" />
    <div className="absolute left-0 right-0 top-56 h-px bg-border" />
    <div className="absolute inset-x-4 bottom-8 h-44 animate-pulse rounded-md bg-muted" />
    <div className="absolute inset-x-4 bottom-4 h-8 animate-pulse rounded-md bg-muted/70" />
  </div>
);

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

      <ChartSkeleton />
    </div>
  );
};

export default CoinDetail;
