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

export type UpbitCandle = {
  market: string;
  candle_date_time_utc: string;
  candle_date_time_kst: string;
  opening_price: number;
  high_price: number;
  low_price: number;
  trade_price: number;
  timestamp: number;
  candle_acc_trade_price: number;
  candle_acc_trade_volume: number;
};
