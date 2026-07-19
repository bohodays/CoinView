"use client";

import { cn } from "@/shared/lib/utils";
import { useMarketData } from "@/entities/market/api/market.queries";
import { Search } from "lucide-react";
import Link from "next/link";
import React, { useMemo, useState } from "react";

const CoinSearchBar = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<"input">
>(
  (
    { className, type, value, defaultValue, onChange, onFocus, onBlur, ...props },
    ref,
  ) => {
    const { data: marketData, isLoading } = useMarketData();
    const [keyword, setKeyword] = useState(
      typeof defaultValue === "string" ? defaultValue : "",
    );
    const [isFocused, setIsFocused] = useState(false);

    const searchKeyword = typeof value === "string" ? value : keyword;
    const normalizedKeyword = searchKeyword.trim().toLowerCase();

    const searchResults = useMemo(() => {
      if (!normalizedKeyword || !marketData) return [];

      return marketData
        .filter(
          ({ market, korean_name: koreanName, english_name: englishName }) => {
            const symbol = market.split("-")[1]?.toLowerCase() ?? "";

            return (
              koreanName.toLowerCase().includes(normalizedKeyword) ||
              englishName.toLowerCase().includes(normalizedKeyword) ||
              symbol.includes(normalizedKeyword)
            );
          },
        )
        .slice(0, 8);
    }, [marketData, normalizedKeyword]);

    const showResults = isFocused && normalizedKeyword.length > 0;

    return (
      <div className="w-full flex justify-center">
        <div className="relative w-[90%]">
          <input
            placeholder="코인명 검색"
            ref={ref}
            type={type}
            value={value}
            defaultValue={defaultValue}
            data-slot="input"
            className={cn(
              "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-3xl border bg-transparent pl-9 pr-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
              "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
              "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
              className,
            )}
            onChange={(event) => {
              setKeyword(event.target.value);
              onChange?.(event);
            }}
            onFocus={(event) => {
              setIsFocused(true);
              onFocus?.(event);
            }}
            onBlur={(event) => {
              window.setTimeout(() => setIsFocused(false), 120);
              onBlur?.(event);
            }}
            {...props}
          />
          <Search className="absolute top-1/2 -translate-1/2 left-5 w-5 h-5" />

          {showResults && (
            <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-80 overflow-y-auto rounded-xl border border-border bg-background shadow-lg">
              {isLoading && (
                <div className="px-4 py-3 text-sm text-muted-foreground">
                  검색 중
                </div>
              )}

              {!isLoading && searchResults.length === 0 && (
                <div className="px-4 py-3 text-sm text-muted-foreground">
                  검색 결과가 없습니다
                </div>
              )}

              {!isLoading &&
                searchResults.map(({ market, korean_name: koreanName }) => {
                  const [currency, symbol] = market.split("-");

                  return (
                    <Link
                      key={market}
                      href={`/code/${market}`}
                      className="flex items-center justify-between gap-4 px-4 py-3 text-sm transition-colors hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
                      onClick={() => setKeyword(koreanName)}
                    >
                      <span className="font-medium">{koreanName}</span>
                      <span className="shrink-0 text-muted-foreground">
                        {symbol}/{currency}
                      </span>
                    </Link>
                  );
                })}
            </div>
          )}
        </div>
      </div>
    );
  },
);

CoinSearchBar.displayName = "CoinSearchBar";

export default CoinSearchBar;
