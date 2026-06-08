"use client";

import React, { useEffect, useMemo } from "react";
import { useMarketData } from "../api/market.queries";
import CoinRow from "@/entities/coin-row/ui/CoinRow";
import { useTickerData } from "@/entities/coin-row/api/ticker.queries";
import { mergeMarketAndTicker } from "@/shared/lib/utils";
import {
  connetTickerSocket,
  disconnectTickerSocket,
} from "@/entities/coin-row/websocket/ticker.websocket";

const CoinList = () => {
  const {
    data: marketData,
    isLoading: isMarketDataLoading,
  } = useMarketData(); // 마켓데이터
  const {
    data: tickerAllData,
    isLoading: isTickerDataLoading,
  } = useTickerData(); // 티커 데이터

  const isFetching = isMarketDataLoading || isTickerDataLoading;
  const coinViewModel = useMemo(() => {
    if (!tickerAllData || !marketData) return [];

    return mergeMarketAndTicker({
      tickerAllData,
      market: marketData,
    });
  }, [marketData, tickerAllData]);

  useEffect(() => {
    if (isFetching || !coinViewModel.length) return;

    connetTickerSocket(coinViewModel);

    return () => {
      disconnectTickerSocket();
    };
  }, [coinViewModel, isFetching]);

  if (isFetching) return <CoinListSkeleton />;

  return (
    <div className="flex flex-col h-full">
      <div className="text-center grid grid-cols-[180px_1fr_120px] items-center px-4 py-2 border-b-3 border-border">
        <div className="text-left">{"코인명"}</div>
        <div className="text-right">{"현재가"}</div>
        <div className="text-right">{"전일대비"}</div>
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
            <div className="flex flex-col gap-2">
              <div className="h-4 w-24 animate-pulse rounded-md bg-muted" />
              <div className="h-3 w-16 animate-pulse rounded-md bg-muted" />
            </div>

            <div className="ml-auto h-7 w-28 animate-pulse rounded-md bg-muted" />

            <div className="flex flex-col items-end gap-2">
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
