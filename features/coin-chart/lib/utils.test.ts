import { describe, it, expect } from "vitest";
import { upbitCandlesToSeriesData } from "./utils";
import type { UpbitCandle } from "@/entities/candle";

function makeCandle(timeUtc: string, tradePrice: number): UpbitCandle {
  return {
    market: "KRW-BTC",
    candle_date_time_utc: timeUtc,
    candle_date_time_kst: timeUtc,
    opening_price: tradePrice,
    high_price: tradePrice,
    low_price: tradePrice,
    trade_price: tradePrice,
    timestamp: Date.parse(timeUtc),
    candle_acc_trade_price: 0,
    candle_acc_trade_volume: 10,
  };
}

describe("upbitCandlesToSeriesData", () => {
  it("정렬 + 중복제거 후 캔들/거래량 시리즈와 첫/마지막 시간을 반환한다", () => {
    const candles = [
      makeCandle("2026-01-01T00:00:02Z", 200),
      makeCandle("2026-01-01T00:00:01Z", 100),
    ];

    const result = upbitCandlesToSeriesData(candles);

    expect(result.candleData.map((c) => c.close)).toEqual([100, 200]);
    expect(result.volumeData).toHaveLength(2);
    expect(result.firstTimeSec).toBe(
      Math.floor(Date.parse("2026-01-01T00:00:01Z") / 1000),
    );
    expect(result.lastTimeSec).toBe(
      Math.floor(Date.parse("2026-01-01T00:00:02Z") / 1000),
    );
  });

  it("빈 배열이면 firstTimeSec/lastTimeSec은 null이다", () => {
    const result = upbitCandlesToSeriesData([]);

    expect(result.candleData).toEqual([]);
    expect(result.firstTimeSec).toBe(null);
    expect(result.lastTimeSec).toBe(null);
  });
});
