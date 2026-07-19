"use client";

import React, { memo, useEffect, useRef, useState } from "react";
import { CoinViewModel } from "../model/type";
import { useTickerStore } from "../model/ticker.store";
import { cn } from "@/shared/lib";
import { WarningCautionTag } from "@/entities/warning-caution-tag";
import Link from "next/link";

const CoinRow = memo((props: CoinViewModel) => {
  const { market, korean_name: koreanName, market_event: marketEvent } = props;
  // primitive만 구독 (Zustand는 selector가 반환하는 값이 Object.is로 동일하면 리렌더 방지)
  const ticker = useTickerStore((store) => store.tickers[market]);
  const [flash, setFlash] = useState(false);
  const prevPriceRef = useRef<number | null>(null);
  const splitedMarketName = market.split("-");

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
      const startId = window.setTimeout(() => setFlash(true), 0);
      const endId = window.setTimeout(() => setFlash(false), 250);

      return () => {
        window.clearTimeout(startId);
        window.clearTimeout(endId);
      };
    }
  }, [ticker]);

  if (!ticker) {
    return (
      <CoinRowSkeleton
        koreanName={koreanName}
        marketName={`${splitedMarketName[1]}/${splitedMarketName[0]}`}
      />
    );
  }

  // 전일대비 방향: 색상만으로 구분하면 색맹 사용자가 상승/보합/하락을
  // 구별할 수 없어 부호를 함께 표기 (하락은 원본 값에 이미 "-"가 있음)
  const changeDirection =
    ticker.signed_change_rate > 0
      ? "RISE"
      : ticker.signed_change_rate < 0
        ? "FALL"
        : "EVEN";
  const signedTextColor =
    changeDirection === "RISE"
      ? "text-red-500"
      : changeDirection === "FALL"
        ? "text-blue-500"
        : "text-muted-foreground";
  const changeSign = changeDirection === "RISE" ? "+" : "";

  return (
    <Link href={`/code/${market}`}>
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
          <div>{`${splitedMarketName[1]}/${splitedMarketName[0]}`}</div>
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
            <div>{`${changeSign}${(ticker.signed_change_rate * 100).toFixed(2)}%`}</div>
            <div>{`${changeSign}${ticker.signed_change_price.toLocaleString("ko-KR")}`}</div>
          </div>
        </div>
      </div>
    </Link>
  );
});

CoinRow.displayName = "CoinRow";

const CoinRowSkeleton = ({
  koreanName,
  marketName,
}: {
  koreanName: string;
  marketName: string;
}) => {
  return (
    <div
      className="grid grid-cols-[180px_1fr_120px] items-center border-t-3 border-border px-4 py-2 first:border-t-0"
      aria-label={`${koreanName} 시세 로딩 중`}
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-1">
          <div>{koreanName}</div>
          <div className="h-4 w-10 animate-pulse rounded-md bg-muted" />
        </div>
        <div>{marketName}</div>
      </div>

      <div className="ml-auto h-8 w-28 animate-pulse rounded-md bg-muted" />

      <div className="flex flex-col items-end gap-2">
        <div className="h-4 w-16 animate-pulse rounded-md bg-muted" />
        <div className="h-3 w-20 animate-pulse rounded-md bg-muted" />
      </div>
    </div>
  );
};

export default CoinRow;
