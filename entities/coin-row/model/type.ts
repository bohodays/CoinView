import { MarketEvent } from "@/widgets/coin-list/model/types";

export type Ticker = {
  market: string;
  trade_date: string;
  trade_time: string;
  trade_date_kst: string;
  trade_time_kst: string;
  trade_timestamp: number;
  opening_price: number;
  high_price: number;
  low_price: number;
  trade_price: number;
  prev_closing_price: number;
  change: "EVEN" | "RISE" | "FALL";
  change_price: number;
  change_rate: number;
  signed_change_price: number;
  signed_change_rate: number;
  trade_volume: number;
  acc_trade_price: number;
  acc_trade_price_24h: number;
  acc_trade_volume: number;
  acc_trade_volume_24h: number;
  highest_52_week_price: number;
  highest_52_week_date: string;
  lowest_52_week_price: number;
  lowest_52_week_date: string;
  timestamp: number;
};

export type CoinViewModel = {
  market: string;
  korean_name: string;
  market_event: MarketEvent;
};

export type TickerWs = {
  type: "ticker";

  code: string; // "KRW-BTC"

  opening_price: number;
  high_price: number;
  low_price: number;
  trade_price: number;

  prev_closing_price: number;

  acc_trade_price: number;
  acc_trade_price_24h: number;

  acc_trade_volume: number;
  acc_trade_volume_24h: number;

  trade_volume: number;

  change: "EVEN" | "RISE" | "FALL";
  change_price: number;
  signed_change_price: number;

  change_rate: number;
  signed_change_rate: number;

  ask_bid: "ASK" | "BID";

  trade_date: string; // "yyyyMMdd"
  trade_time: string; // "HHmmss"
  trade_timestamp: number; // ms

  timestamp: number; // ms (현재가 반영 시각)

  acc_ask_volume: number;
  acc_bid_volume: number;

  highest_52_week_price: number;
  highest_52_week_date: string; // "yyyy-MM-dd"

  lowest_52_week_price: number;
  lowest_52_week_date: string; // "yyyy-MM-dd"

  market_state: "ACTIVE" | "PREVIEW" | "DELISTED";
  is_trading_suspended: boolean; // Deprecated 필드로 참조 대상에서 제외하는 것을 권장합니다.
  delisting_date: string | null;

  market_warning: "NONE" | "CAUTION" | string; // Deprecated 필드로 참조 대상에서 제외하는 것을 권장합니다.

  stream_type: "REALTIME" | "SNAPSHOT";
};
