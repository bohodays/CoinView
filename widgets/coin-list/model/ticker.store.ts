import { create } from "zustand";

type Ticker = {
  market: string;
  trade_price: string;
  change: "EVEN" | "RISE" | "FAIL";
};

type TickerState = {
  tickers: Record<string, Ticker>;
  updateTicker: (list: Ticker[]) => void;
};

export const useTickerStore = create<TickerState>((set, get) => ({
  tickers: {},
  updateTicker: (list) => {
    const { tickers } = get();

    const newTickers = { ...tickers };

    for (const t of list) {
      if (!tickers[t.market] || t.change !== "EVEN") {
        newTickers[t.market] = t;
      }
    }

    set({ tickers: newTickers });
  },
}));
