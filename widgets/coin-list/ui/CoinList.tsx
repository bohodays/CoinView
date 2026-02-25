"use client";

import React, { useEffect, useState } from "react";
import { fetchMarketData } from "../api/market.api";
import { useMarketData } from "../api/market.queries";
import CoinRow from "@/entities/coin-row/ui/CoinRow";
import { useTickerData } from "@/entities/coin-row/api/ticker.queries";
import { mergeMarketAndTicker } from "@/shared/lib/utils";
import { CoinViewModel } from "@/entities/coin-row/model/type";
import { connetTickerSocket } from "@/entities/coin-row/websocket/ticker.websocket";

const CoinList = () => {
  const {
    data: marketData,
    error: marketFetchError,
    isLoading: isMarketDataLoading,
  } = useMarketData(); // 마켓데이터
  const {
    data: tickerAllData,
    error: tickerFetchError,
    isLoading: isTickerDataLoading,
  } = useTickerData(); // 티커 데이터
  const [coinViewModel, setCoinViewModel] = useState<CoinViewModel[]>([]);

  const isFetching = isMarketDataLoading || isTickerDataLoading;

  useEffect(() => {
    if (!isFetching && !coinViewModel.length) {
      if (tickerAllData && marketData) {
        const mergeMarketAndTickerData = mergeMarketAndTicker({
          tickerAllData,
          market: marketData,
        });
        setCoinViewModel(mergeMarketAndTickerData);

        connetTickerSocket(mergeMarketAndTickerData);
      }
    }
  }, [isFetching]);

  if (isFetching) return <div>{"Loading"}</div>;

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

export default CoinList;
