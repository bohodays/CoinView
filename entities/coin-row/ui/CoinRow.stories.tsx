import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import CoinRow from "./CoinRow";
import { useTickerStore } from "../model/ticker.store";
import type { CoinViewModel, TickerWs } from "../model/type";

const baseMarketEvent = {
  warning: false,
  caution: {
    PRICE_FLUCTUATIONS: false,
    TRADING_VOLUME_SOARING: false,
    DEPOSIT_AMOUNT_SOARING: false,
    GLOBAL_PRICE_DIFFERENCES: false,
    CONCENTRATION_OF_SMALL_ACCOUNTS: false,
  },
};

function seedTicker(market: string, overrides: Partial<TickerWs>) {
  const ticker: TickerWs = {
    type: "ticker",
    code: market,
    opening_price: 100,
    high_price: 105,
    low_price: 95,
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
    current_change: null,
    ...overrides,
  };

  useTickerStore.setState((state) => ({
    tickers: { ...state.tickers, [market]: ticker },
  }));
}

const meta: Meta<typeof CoinRow> = {
  title: "entities/coin-row/CoinRow",
  component: CoinRow,
  parameters: { layout: "padded" },
  // 실제 앱에서 CoinRow는 프레임의 bg-background(라이트 모드 기준 흰색)
  // 위에 렌더됨. Storybook 기본 캔버스 배경(연회색)은 이보다 살짝 어두워
  // 텍스트 명암비 검사가 실제와 다르게 나오므로 실제 배경을 재현한다.
  decorators: [
    (Story) => (
      <div className="bg-background text-foreground">
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof CoinRow>;

export const Rising: Story = {
  render: () => {
    seedTicker("KRW-BTC-STORY-RISE", {
      trade_price: 105_000_000,
      signed_change_price: 2_000_000,
      signed_change_rate: 0.0196,
    });
    const props: CoinViewModel = {
      market: "KRW-BTC-STORY-RISE",
      korean_name: "비트코인",
      market_event: baseMarketEvent,
    };
    return <CoinRow {...props} />;
  },
};

export const Falling: Story = {
  render: () => {
    seedTicker("KRW-ETH-STORY-FALL", {
      trade_price: 3_500_000,
      signed_change_price: -150_000,
      signed_change_rate: -0.0411,
    });
    const props: CoinViewModel = {
      market: "KRW-ETH-STORY-FALL",
      korean_name: "이더리움",
      market_event: baseMarketEvent,
    };
    return <CoinRow {...props} />;
  },
};

export const Even: Story = {
  render: () => {
    seedTicker("KRW-XRP-STORY-EVEN", {
      trade_price: 800,
      signed_change_price: 0,
      signed_change_rate: 0,
    });
    const props: CoinViewModel = {
      market: "KRW-XRP-STORY-EVEN",
      korean_name: "리플",
      market_event: baseMarketEvent,
    };
    return <CoinRow {...props} />;
  },
};

export const WithWarningTag: Story = {
  render: () => {
    seedTicker("KRW-STORY-WARN", {
      trade_price: 1000,
      signed_change_price: 10,
      signed_change_rate: 0.01,
    });
    const props: CoinViewModel = {
      market: "KRW-STORY-WARN",
      korean_name: "유의종목코인",
      market_event: { ...baseMarketEvent, warning: true },
    };
    return <CoinRow {...props} />;
  },
};

export const Loading: Story = {
  render: () => {
    const props: CoinViewModel = {
      market: "KRW-STORY-LOADING",
      korean_name: "로딩중코인",
      market_event: baseMarketEvent,
    };
    return <CoinRow {...props} />;
  },
};
