"use client";

import { cn } from "@/shared/lib";
import { useMarketData } from "@/entities/market";
import { Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useId, useMemo, useState } from "react";

const CoinSearchBar = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<"input">
>(
  (
    {
      className,
      type,
      value,
      defaultValue,
      onChange,
      onFocus,
      onBlur,
      onKeyDown,
      ...props
    },
    ref,
  ) => {
    const router = useRouter();
    const listboxId = useId();
    const { data: marketData, isLoading } = useMarketData();
    const [keyword, setKeyword] = useState(
      typeof defaultValue === "string" ? defaultValue : "",
    );
    const [isFocused, setIsFocused] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);

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
    const activeOptionId =
      showResults && highlightedIndex >= 0 && searchResults[highlightedIndex]
        ? `${listboxId}-option-${highlightedIndex}`
        : undefined;

    const moveToMarket = (market: string, koreanName: string) => {
      setKeyword(koreanName);
      setIsFocused(false);
      router.push(`/code/${market}`);
    };

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
            role="combobox"
            aria-expanded={showResults}
            aria-controls={listboxId}
            aria-autocomplete="list"
            aria-activedescendant={activeOptionId}
            className={cn(
              "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-3xl border bg-transparent pl-9 pr-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
              "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
              "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
              className,
            )}
            onChange={(event) => {
              setKeyword(event.target.value);
              setHighlightedIndex(-1);
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
            onKeyDown={(event) => {
              if (showResults && searchResults.length > 0) {
                if (event.key === "ArrowDown") {
                  event.preventDefault();
                  setHighlightedIndex(
                    (prev) => (prev + 1) % searchResults.length,
                  );
                } else if (event.key === "ArrowUp") {
                  event.preventDefault();
                  setHighlightedIndex((prev) =>
                    prev <= 0 ? searchResults.length - 1 : prev - 1,
                  );
                } else if (event.key === "Enter" && highlightedIndex >= 0) {
                  event.preventDefault();
                  const target = searchResults[highlightedIndex];
                  if (target) moveToMarket(target.market, target.korean_name);
                } else if (event.key === "Escape") {
                  setIsFocused(false);
                }
              }
              onKeyDown?.(event);
            }}
            {...props}
          />
          <Search
            aria-hidden="true"
            className="absolute top-1/2 -translate-1/2 left-5 w-5 h-5"
          />

          {showResults && (
            <ul
              id={listboxId}
              role="listbox"
              className="absolute left-0 right-0 top-full z-50 mt-2 max-h-80 overflow-y-auto rounded-xl border border-border bg-background shadow-lg"
            >
              {isLoading && (
                <li className="px-4 py-3 text-sm text-muted-foreground">
                  검색 중
                </li>
              )}

              {!isLoading && searchResults.length === 0 && (
                <li className="px-4 py-3 text-sm text-muted-foreground">
                  검색 결과가 없습니다
                </li>
              )}

              {!isLoading &&
                searchResults.map(({ market, korean_name: koreanName }, index) => {
                  const [currency, symbol] = market.split("-");
                  const isActive = index === highlightedIndex;

                  return (
                    <li
                      key={market}
                      id={`${listboxId}-option-${index}`}
                      role="option"
                      aria-selected={isActive}
                    >
                      <Link
                        href={`/code/${market}`}
                        className={cn(
                          "flex items-center justify-between gap-4 px-4 py-3 text-sm transition-colors hover:bg-muted focus-visible:bg-muted focus-visible:outline-none",
                          isActive && "bg-muted",
                        )}
                        onClick={() => setKeyword(koreanName)}
                        onMouseEnter={() => setHighlightedIndex(index)}
                      >
                        <span className="font-medium">{koreanName}</span>
                        <span className="shrink-0 text-muted-foreground">
                          {symbol}/{currency}
                        </span>
                      </Link>
                    </li>
                  );
                })}
            </ul>
          )}
        </div>
      </div>
    );
  },
);

CoinSearchBar.displayName = "CoinSearchBar";

export default CoinSearchBar;
