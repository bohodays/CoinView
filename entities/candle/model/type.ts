import { z } from "zod";

export type CandleUnit =
  | "seconds"
  | "minutes"
  | "days"
  | "weeks"
  | "months"
  | "years";

export type MinutesUnit =
  | null
  | "1"
  | "3"
  | "5"
  | "10"
  | "15"
  | "30"
  | "60"
  | "240";

export const upbitCandleSchema = z.object({
  market: z.string(),
  candle_date_time_utc: z.string(),
  candle_date_time_kst: z.string(),
  opening_price: z.number(),
  high_price: z.number(),
  low_price: z.number(),
  trade_price: z.number(),
  timestamp: z.number(),
  candle_acc_trade_price: z.number(),
  candle_acc_trade_volume: z.number(),
});

export type UpbitCandle = z.infer<typeof upbitCandleSchema>;

/**
 * Upbit candle WebSocket이 실제로 보내는 메시지 형태.
 * REST와 달리 market 대신 code 필드를 사용함.
 */
export const upbitCandleWsMessageSchema = z.object({
  code: z.string(),
  candle_date_time_utc: z.string(),
  candle_date_time_kst: z.string(),
  opening_price: z.number(),
  high_price: z.number(),
  low_price: z.number(),
  trade_price: z.number(),
  timestamp: z.number(),
  candle_acc_trade_price: z.number(),
  candle_acc_trade_volume: z.number(),
});
