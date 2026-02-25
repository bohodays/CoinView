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

    set((state) => ({
      tickers: {
        ...state.tickers,
        [wsTicker.code]: wsTicker,
      },
    }));
  },
}));
