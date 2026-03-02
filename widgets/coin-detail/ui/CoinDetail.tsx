"use client";

import { useCandleHistoryQuery } from "@/entities/candle/api/candle.api.query";
import { useCoinCandles } from "@/entities/candle/api/candle.websocket.query";
import CoinChart from "@/feature/coin-chart/ui/CoinChart";
import React from "react";

const CoinDetail = () => {
  const { candles, isLoading, error, wsStatus } = useCoinCandles({
    market: "KRW-BTC",
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
    <div>
      <div>CoinChart</div>
      <CoinChart candles={candles} />
    </div>
  );
};

export default CoinDetail;
