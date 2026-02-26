"use client";

import { useMarketData } from "@/widgets/coin-list/api/market.queries";
import React, { memo, useEffect, useRef, useState } from "react";
import { CoinViewModel } from "../model/type";
import { useTickerStore } from "../model/ticker.store";
import { cn } from "@/shared/lib/utils";
import WarningCautionTag from "@/entities/warning-caution-tag/ui/WarningCautionTag";

const CoinRow = memo((props: CoinViewModel) => {
  const { market, korean_name: koreanName, market_event: marketEvent } = props;
  // primitive만 구독 (Zustand는 selector가 반환하는 값이 Object.is로 동일하면 리렌더 방지)
  const ticker = useTickerStore((store) => store.tickers[market]);
  const [flash, setFlash] = useState(false);
  const prevPriceRef = useRef<number | null>(null);

  // 경보 적용 여부
  const isCaution =
    marketEvent.caution.CONCENTRATION_OF_SMALL_ACCOUNTS ||
    marketEvent.caution.DEPOSIT_AMOUNT_SOARING ||
    marketEvent.caution.GLOBAL_PRICE_DIFFERENCES ||
    marketEvent.caution.PRICE_FLUCTUATIONS ||
    marketEvent.caution.TRADING_VOLUME_SOARING;

  useEffect(() => {
    if (!ticker) return;

    const next = ticker.trade_price;
    const prev = prevPriceRef.current;

    // 항상 업데이트
    prevPriceRef.current = next;

    if (prev !== null && prev !== next) {
      setFlash(true);
      const id = window.setTimeout(() => setFlash(false), 250);
      return () => window.clearTimeout(id);
    }
  }, [ticker?.trade_price]);

  // TODO. 스켈레톤 코드로 변경
  if (!ticker) return null;

  // 전일대비 색상 적용을 위한 CSS 변수 (양수 / 빨간색, 음수 / 파란색)
  const signedTextColor =
    ticker.signed_change_rate > 0 ? "text-red-500" : "text-blue-500";

  return (
    <div className="grid grid-cols-[180px_1fr_120px] items-center px-4 py-2 border-border hover:bg-muted/40 transition-colors border-t-3 first:border-t-0 cursor-pointer">
      <div className="flex flex-col">
        <div className="flex items-center gap-1">
          <div>{koreanName}</div>
          <div className="flex gap-1">
            {marketEvent.warning && <WarningCautionTag type="WARN" />}
            {isCaution && <WarningCautionTag type="CAUT" />}
          </div>
          <div></div>
        </div>
        <div>{market}</div>
      </div>

      <div
        className={cn(
          "text-right tabular-nums transition-colors duration-150 border-2 p-2 border-transparent",
          signedTextColor,
          flash &&
            (ticker.current_change === "RISE"
              ? "border-red-500"
              : ticker.current_change === "FALL"
                ? "border-blue-500"
                : "border-transparent"),
        )}
      >
        {ticker.trade_price.toLocaleString("ko-KR")}
      </div>

      <div className="flex justify-end">
        <div className={cn("flex flex-col text-right", signedTextColor)}>
          <div>{`${(ticker.signed_change_rate * 100).toFixed(2)}%`}</div>
          <div>{ticker.signed_change_price.toLocaleString("ko-KR")}</div>
        </div>
      </div>
    </div>
  );
});

export default CoinRow;
