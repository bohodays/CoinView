"use client";

import React, { useEffect } from "react";
import { fetchMarketData } from "../api/market.api";
import { useMarketData } from "../api/market.queries";
import { useTickerData } from "../api/ticker.queries";
import { useTickerStore } from "../model/ticker.store";

const CoinList = () => {
  const {
    data: marketData,
    error: marketFetchError,
    isLoading: isMarketDataLoading,
  } = useMarketData();
  const { data: tickerAllData } = useTickerData();
  const updateTicker = useTickerStore((store) => store.updateTicker);

  useEffect(() => {
    if (tickerAllData) {
      console.log({ tickerAllData });
      updateTicker(tickerAllData);
    }
  }, [tickerAllData]);

  return <div>CoinList</div>;
};

export default CoinList;
