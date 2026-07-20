import { beforeEach, describe, it, expect } from "vitest";
import { useTickerStore } from "./ticker.store";
import type { TickerWsMessage } from "./type";

function makeTickerMessage(
  overrides: Partial<TickerWsMessage> = {},
): TickerWsMessage {
  return {
    type: "ticker",
    code: "KRW-BTC",
    opening_price: 100,
    high_price: 100,
    low_price: 100,
    trade_price: 100,
    prev_closing_price: 100,
    acc_trade_price: 0,
    acc_trade_price_24h: 0,
    acc_trade_volume: 0,
    acc_trade_volume_24h: 0,
    trade_volume: 0,
    change: "EVEN",
    change_price: 0,
    signed_change_price: 0,
    change_rate: 0,
    signed_change_rate: 0,
    ask_bid: "BID",
    trade_date: "20260101",
    trade_time: "000000",
    trade_timestamp: 0,
    timestamp: 1,
    acc_ask_volume: 0,
    acc_bid_volume: 0,
    highest_52_week_price: 100,
    highest_52_week_date: "2026-01-01",
    lowest_52_week_price: 100,
    lowest_52_week_date: "2026-01-01",
    market_state: "ACTIVE",
    is_trading_suspended: false,
    delisting_date: null,
    market_warning: "NONE",
    stream_type: "REALTIME",
    ...overrides,
  };
}

describe("useTickerStore.updateTicker", () => {
  beforeEach(() => {
    useTickerStore.setState({ tickers: {} });
  });

  it("최초 수신 시 current_change는 null이다", () => {
    useTickerStore
      .getState()
      .updateTicker(makeTickerMessage({ timestamp: 1, trade_price: 100 }));

    expect(useTickerStore.getState().tickers["KRW-BTC"].current_change).toBe(
      null,
    );
  });

  it("이전보다 가격이 오르면 RISE", () => {
    const { updateTicker } = useTickerStore.getState();
    updateTicker(makeTickerMessage({ timestamp: 1, trade_price: 100 }));
    updateTicker(makeTickerMessage({ timestamp: 2, trade_price: 101 }));

    expect(useTickerStore.getState().tickers["KRW-BTC"].current_change).toBe(
      "RISE",
    );
  });

  it("이전보다 가격이 내리면 FALL", () => {
    const { updateTicker } = useTickerStore.getState();
    updateTicker(makeTickerMessage({ timestamp: 1, trade_price: 100 }));
    updateTicker(makeTickerMessage({ timestamp: 2, trade_price: 99 }));

    expect(useTickerStore.getState().tickers["KRW-BTC"].current_change).toBe(
      "FALL",
    );
  });

  it("가격이 같으면 EVEN", () => {
    const { updateTicker } = useTickerStore.getState();
    updateTicker(makeTickerMessage({ timestamp: 1, trade_price: 100 }));
    updateTicker(makeTickerMessage({ timestamp: 2, trade_price: 100 }));

    expect(useTickerStore.getState().tickers["KRW-BTC"].current_change).toBe(
      "EVEN",
    );
  });

  it("동일 timestamp면 업데이트를 스킵한다", () => {
    const { updateTicker } = useTickerStore.getState();
    updateTicker(makeTickerMessage({ timestamp: 1, trade_price: 100 }));
    updateTicker(makeTickerMessage({ timestamp: 1, trade_price: 999 }));

    expect(useTickerStore.getState().tickers["KRW-BTC"].trade_price).toBe(
      100,
    );
  });
});
