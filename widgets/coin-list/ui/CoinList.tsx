"use client";

import React, { useEffect, useMemo } from "react";
import { useMarketData, mergeMarketAndTicker } from "@/entities/market";
import {
  CoinRow,
  useTickerData,
  connectTickerSocket,
  disconnectTickerSocket,
} from "@/entities/coin-row";
import { ErrorState } from "@/shared/ui";

const CoinList = () => {
  const {
    data: marketData,
    isLoading: isMarketDataLoading,
    isError: isMarketDataError,
    refetch: refetchMarketData,
  } = useMarketData(); // 마켓데이터
  const {
    data: tickerAllData,
    isLoading: isTickerDataLoading,
    isError: isTickerDataError,
    refetch: refetchTickerData,
  } = useTickerData(); // 티커 데이터

  const isFetching = isMarketDataLoading || isTickerDataLoading;
  const isError = isMarketDataError || isTickerDataError;
  const coinViewModel = useMemo(() => {
    if (!tickerAllData || !marketData) return [];

    return mergeMarketAndTicker({
      tickerAllData,
      market: marketData,
    });
  }, [marketData, tickerAllData]);

  useEffect(() => {
    if (isFetching || !coinViewModel.length) return;

    connectTickerSocket(coinViewModel);

    return () => {
      disconnectTickerSocket();
    };
  }, [coinViewModel, isFetching]);

  if (isFetching) return <CoinListSkeleton />;

  if (isError) {
    return (
      <ErrorState
        message="코인 목록을 불러오지 못했습니다."
        onRetry={() => {
          refetchMarketData();
          refetchTickerData();
        }}
      />
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="text-center grid grid-cols-[180px_1fr_120px] items-center px-4 py-2 border-b-3 border-border">
        <div className="min-w-0 truncate text-left">{"코인명"}</div>
        <div className="min-w-0 truncate text-right">{"현재가"}</div>
        <div className="min-w-0 truncate text-right">{"전일대비"}</div>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide">
        {coinViewModel?.map((market) => (
          <CoinRow key={market.market} {...market} />
        ))}
      </div>
    </div>
  );
};

const CoinListSkeleton = () => {
  return (
    <div className="flex h-full flex-col" aria-label="코인 목록 로딩 중">
      <div className="grid grid-cols-[180px_1fr_120px] items-center border-b-3 border-border px-4 py-2">
        <div className="h-4 w-16 animate-pulse rounded-md bg-muted" />
        <div className="ml-auto h-4 w-14 animate-pulse rounded-md bg-muted" />
        <div className="ml-auto h-4 w-16 animate-pulse rounded-md bg-muted" />
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        {Array.from({ length: 12 }).map((_, index) => (
          <div
            key={index}
            className="grid grid-cols-[180px_1fr_120px] items-center border-t-3 border-border px-4 py-3 first:border-t-0"
          >
            <div className="flex min-w-0 flex-col gap-2">
              <div className="h-4 w-24 animate-pulse rounded-md bg-muted" />
              <div className="h-3 w-16 animate-pulse rounded-md bg-muted" />
            </div>

            <div className="ml-auto h-7 w-28 min-w-0 animate-pulse rounded-md bg-muted" />

            <div className="flex min-w-0 flex-col items-end gap-2">
              <div className="h-4 w-16 animate-pulse rounded-md bg-muted" />
              <div className="h-3 w-20 animate-pulse rounded-md bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CoinList;
