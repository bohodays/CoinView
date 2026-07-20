import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ThemeProvider } from "next-themes";
import CoinChart from "./CoinChart";
import type { UpbitCandle } from "@/entities/candle";

function makeSampleCandles(): UpbitCandle[] {
  const candles: UpbitCandle[] = [];
  const start = Date.parse("2026-01-01T00:00:00Z");
  let price = 100_000;

  for (let i = 0; i < 60; i++) {
    const open = price;
    const close = open + Math.sin(i / 5) * 500 + (i % 7 === 0 ? 800 : -200);
    const high = Math.max(open, close) + 300;
    const low = Math.min(open, close) - 300;
    const timeMs = start + i * 60_000;

    candles.push({
      market: "KRW-BTC",
      candle_date_time_utc: new Date(timeMs).toISOString().slice(0, 19),
      candle_date_time_kst: new Date(timeMs).toISOString().slice(0, 19),
      opening_price: open,
      high_price: high,
      low_price: low,
      trade_price: close,
      timestamp: timeMs,
      candle_acc_trade_price: 1_000_000,
      candle_acc_trade_volume: 10 + i,
    });

    price = close;
  }

  return candles;
}

const meta: Meta<typeof CoinChart> = {
  title: "features/coin-chart/CoinChart",
  component: CoinChart,
  decorators: [
    (Story) => (
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
        <Story />
      </ThemeProvider>
    ),
  ],
  args: {
    candles: makeSampleCandles(),
    isLoadingMore: false,
    onLoadMore: async () => {},
  },
};

export default meta;

type Story = StoryObj<typeof CoinChart>;

export const Default: Story = {};
