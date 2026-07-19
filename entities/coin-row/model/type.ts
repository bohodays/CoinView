import { z } from "zod";
import type { MarketEvent } from "@/entities/market";

export const tickerSchema = z.object({
  market: z.string(),
  trade_date: z.string(),
  trade_time: z.string(),
  trade_date_kst: z.string(),
  trade_time_kst: z.string(),
  trade_timestamp: z.number(),
  opening_price: z.number(),
  high_price: z.number(),
  low_price: z.number(),
  trade_price: z.number(),
  prev_closing_price: z.number(),
  change: z.enum(["EVEN", "RISE", "FALL"]),
  change_price: z.number(),
  change_rate: z.number(),
  signed_change_price: z.number(),
  signed_change_rate: z.number(),
  trade_volume: z.number(),
  acc_trade_price: z.number(),
  acc_trade_price_24h: z.number(),
  acc_trade_volume: z.number(),
  acc_trade_volume_24h: z.number(),
  highest_52_week_price: z.number(),
  highest_52_week_date: z.string(),
  lowest_52_week_price: z.number(),
  lowest_52_week_date: z.string(),
  timestamp: z.number(),
});

export type Ticker = z.infer<typeof tickerSchema>;

export type CoinViewModel = {
  market: string;
  korean_name: string;
  market_event: MarketEvent;
};

/**
 * Upbit ticker WebSocket이 실제로 보내는 메시지 형태.
 * current_change는 여기 포함되지 않음 — 클라이언트(ticker.store)에서 별도 계산.
 */
export const tickerWsMessageSchema = z.object({
  type: z.literal("ticker"),

  code: z.string(), // "KRW-BTC"

  opening_price: z.number(),
  high_price: z.number(),
  low_price: z.number(),
  trade_price: z.number(),

  prev_closing_price: z.number(),

  acc_trade_price: z.number(),
  acc_trade_price_24h: z.number(),

  acc_trade_volume: z.number(),
  acc_trade_volume_24h: z.number(),

  trade_volume: z.number(),

  change: z.enum(["EVEN", "RISE", "FALL"]),
  change_price: z.number(),
  signed_change_price: z.number(),

  change_rate: z.number(),
  signed_change_rate: z.number(),

  ask_bid: z.enum(["ASK", "BID"]),

  trade_date: z.string(), // "yyyyMMdd"
  trade_time: z.string(), // "HHmmss"
  trade_timestamp: z.number(), // ms

  timestamp: z.number(), // ms (현재가 반영 시각)

  acc_ask_volume: z.number(),
  acc_bid_volume: z.number(),

  highest_52_week_price: z.number(),
  highest_52_week_date: z.string(), // "yyyy-MM-dd"

  lowest_52_week_price: z.number(),
  lowest_52_week_date: z.string(), // "yyyy-MM-dd"

  market_state: z.enum(["ACTIVE", "PREVIEW", "DELISTED"]),
  is_trading_suspended: z.boolean(), // Deprecated 필드로 참조 대상에서 제외하는 것을 권장합니다.
  delisting_date: z.string().nullable(),

  market_warning: z.string(), // "NONE" | "CAUTION" | string. Deprecated 필드로 참조 대상에서 제외하는 것을 권장합니다.

  stream_type: z.enum(["REALTIME", "SNAPSHOT"]),
});

export type TickerWsMessage = z.infer<typeof tickerWsMessageSchema>;

export type TickerWs = TickerWsMessage & {
  current_change: "EVEN" | "RISE" | "FALL" | null; // 현재가격변화 (업비트에서 제공해주지 않음. 별도 계산)
};
