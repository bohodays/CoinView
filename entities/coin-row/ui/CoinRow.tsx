"use client";

import { useMarketData } from "@/widgets/coin-list/api/market.queries";
import React, { memo } from "react";
import { CoinViewModel } from "../model/type";
import { useTickerStore } from "../model/ticker.store";

const CoinRow = memo((props: CoinViewModel) => {
  const { market, korean_name: koreanName, market_event: marketEvent } = props;
  const ticker = useTickerStore((store) => store.tickers[market]);

  // TODO. 스켈레톤 코드로 변경
  if (!ticker) return;

  return (
    // <div className="flex justify-between px-4">
    //   <div className="flex flex-col min-w-[220px] bg-red-400">
    //     <div className="flex">
    //       <div>{koreanName}</div>
    //       {/* <div>{marketEvent.warning ? "유의 O" : "유의 X"}</div> */}
    //     </div>
    //     <div>{market}</div>
    //   </div>

    //   <div>{ticker.trade_price}</div>

    //   <div className="flex gap-4 min-w-[80px] bg-gray-400">
    //     <div className="flex flex-col">
    //       <div>{(ticker.signed_change_rate * 100).toFixed(2)}</div>
    //       <div>{ticker.signed_change_price}</div>
    //     </div>
    //     {/* <div>{ticker.change}</div> */}
    //   </div>
    // </div>

    <div className="grid grid-cols-[180px_1fr_120px] items-center px-4 py-2 border-border hover:bg-muted/40 transition-colors border-t-3">
      <div className="flex flex-col">
        <div className="flex">
          <div>{koreanName}</div>
          {/* <div>{marketEvent.warning ? "유의 O" : "유의 X"}</div> */}
        </div>
        <div>{market}</div>
      </div>

      <div className="text-right tabular-nums">
        {ticker.trade_price.toLocaleString("ko-KR")}
      </div>

      <div className="flex justify-end">
        <div className="flex flex-col text-right">
          <div>{`${(ticker.signed_change_rate * 100).toFixed(2)}%`}</div>
          <div>{ticker.signed_change_price.toLocaleString("ko-KR")}</div>
        </div>
      </div>
    </div>
  );
});

export default CoinRow;
