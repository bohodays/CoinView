import { create } from "zustand";
import { TickerWs } from "./type";

type TickerState = {
  tickers: Record<string, TickerWs>;
  updateTicker: (ticker: TickerWs) => void;
};

export const useTickerStore = create<TickerState>((set, get) => ({
  tickers: {},
  updateTicker: (wsTicker) => {
    const prevTicker = get().tickers[wsTicker.code];

    // 동일 timestamp면 스킵
    if (prevTicker && prevTicker.timestamp === wsTicker.timestamp) return;

    // 가격변화 계산
    let currentChange: "RISE" | "EVEN" | "FALL" | null = null;
    if (prevTicker) {
      const prevPrice = prevTicker.trade_price;
      const currentPrice = wsTicker.trade_price;
      currentChange =
        prevPrice < currentPrice
          ? "RISE"
          : prevPrice === currentPrice
            ? "EVEN"
            : "FALL";
    }

    set((state) => ({
      tickers: {
        ...state.tickers,
        [wsTicker.code]: { ...wsTicker, current_change: currentChange },
      },
    }));
  },
}));
