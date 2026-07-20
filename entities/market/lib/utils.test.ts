import { describe, it, expect } from "vitest";
import { mergeMarketAndTicker, makeFullMarketName } from "./utils";
import type { Market, MarketEvent } from "../model/type";
import type { Ticker } from "@/entities/coin-row";

const marketEvent: MarketEvent = {
  warning: false,
  caution: {
    PRICE_FLUCTUATIONS: false,
    TRADING_VOLUME_SOARING: false,
    DEPOSIT_AMOUNT_SOARING: false,
    GLOBAL_PRICE_DIFFERENCES: false,
    CONCENTRATION_OF_SMALL_ACCOUNTS: false,
  },
};

function makeMarket(market: string, koreanName: string): Market {
  return {
    market,
    korean_name: koreanName,
    english_name: koreanName,
    market_event: marketEvent,
  };
}

function makeTicker(market: string): Ticker {
  return {
    market,
    trade_date: "20260101",
    trade_time: "000000",
    trade_date_kst: "20260101",
    trade_time_kst: "000000",
    trade_timestamp: 0,
    opening_price: 0,
    high_price: 0,
    low_price: 0,
    trade_price: 0,
    prev_closing_price: 0,
    change: "EVEN",
    change_price: 0,
    change_rate: 0,
    signed_change_price: 0,
    signed_change_rate: 0,
    trade_volume: 0,
    acc_trade_price: 0,
    acc_trade_price_24h: 0,
    acc_trade_volume: 0,
    acc_trade_volume_24h: 0,
    highest_52_week_price: 0,
    highest_52_week_date: "2026-01-01",
    lowest_52_week_price: 0,
    lowest_52_week_date: "2026-01-01",
    timestamp: 0,
  };
}

describe("mergeMarketAndTicker", () => {
  it("티커 데이터의 순서를 기준으로 마켓을 정렬한다", () => {
    const market = [
      makeMarket("KRW-ETH", "이더리움"),
      makeMarket("KRW-BTC", "비트코인"),
    ];
    const tickerAllData = [makeTicker("KRW-BTC"), makeTicker("KRW-ETH")];

    const result = mergeMarketAndTicker({ tickerAllData, market });

    expect(result.map((m) => m.market)).toEqual(["KRW-BTC", "KRW-ETH"]);
  });

  it("티커 목록에 없는 마켓은 뒤로 밀린다", () => {
    const market = [
      makeMarket("KRW-XRP", "리플"),
      makeMarket("KRW-BTC", "비트코인"),
    ];
    const tickerAllData = [makeTicker("KRW-BTC")];

    const result = mergeMarketAndTicker({ tickerAllData, market });

    expect(result.map((m) => m.market)).toEqual(["KRW-BTC", "KRW-XRP"]);
  });
});

describe("makeFullMarketName", () => {
  it("마켓 코드와 매칭되는 한글명으로 풀네임을 만든다", () => {
    const markets = [makeMarket("KRW-BTC", "비트코인")];

    expect(makeFullMarketName("KRW-BTC", markets)).toBe("비트코인 (BTC/KRW)");
  });

  it("매칭되는 마켓이 없으면 심볼/통화 조합만 반환한다", () => {
    const markets = [makeMarket("KRW-BTC", "비트코인")];

    expect(makeFullMarketName("KRW-ETH", markets)).toBe("ETH/KRW");
  });
});
