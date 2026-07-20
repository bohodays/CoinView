import { describe, it, expect } from "vitest";
import {
  isCandleWebSocketSupported,
  minutesUnitTransWebSocketType,
  sortUniqueByTime,
  mergePagesToSortedUnique,
  candleUnitPathSegment,
  upbitCandleToTimeSec,
} from "./utils";
import type { UpbitCandle } from "../model/type";

function makeCandle(timeUtc: string, tradePrice = 0): UpbitCandle {
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
    candle_acc_trade_volume: 0,
  };
}

describe("isCandleWebSocketSupported", () => {
  it("초봉은 항상 지원한다", () => {
    expect(isCandleWebSocketSupported("seconds")).toBe(true);
  });

  it("분봉은 minutesUnit이 있어야 지원한다", () => {
    expect(isCandleWebSocketSupported("minutes", "1")).toBe(true);
    expect(isCandleWebSocketSupported("minutes", null)).toBe(false);
    expect(isCandleWebSocketSupported("minutes")).toBe(false);
  });

  it("일/주 단위는 미지원이다", () => {
    expect(isCandleWebSocketSupported("days")).toBe(false);
    expect(isCandleWebSocketSupported("weeks")).toBe(false);
  });
});

describe("minutesUnitTransWebSocketType", () => {
  it("초봉은 candle.1s를 반환한다", () => {
    expect(minutesUnitTransWebSocketType("seconds")).toBe("candle.1s");
  });

  it("분봉은 candle.{n}m을 반환한다", () => {
    expect(minutesUnitTransWebSocketType("minutes", "5")).toBe("candle.5m");
    expect(minutesUnitTransWebSocketType("minutes", "240")).toBe(
      "candle.240m",
    );
  });

  it("minutesUnit 없는 분봉/그 외 단위는 candle.을 반환한다", () => {
    expect(minutesUnitTransWebSocketType("minutes")).toBe("candle.");
    expect(minutesUnitTransWebSocketType("days")).toBe("candle.");
  });
});

describe("sortUniqueByTime", () => {
  it("timeSec 기준 오름차순으로 정렬한다", () => {
    const candles = [
      makeCandle("2026-01-01T00:00:03Z"),
      makeCandle("2026-01-01T00:00:01Z"),
      makeCandle("2026-01-01T00:00:02Z"),
    ];

    const result = sortUniqueByTime(candles);

    expect(result.map((c) => c.candle_date_time_utc)).toEqual([
      "2026-01-01T00:00:01Z",
      "2026-01-01T00:00:02Z",
      "2026-01-01T00:00:03Z",
    ]);
  });

  it("동일 timeSec은 나중 값으로 교체한다", () => {
    const candles = [
      makeCandle("2026-01-01T00:00:01Z", 100),
      makeCandle("2026-01-01T00:00:01Z", 200),
    ];

    const result = sortUniqueByTime(candles);

    expect(result).toHaveLength(1);
    expect(result[0].trade_price).toBe(200);
  });
});

describe("mergePagesToSortedUnique", () => {
  it("여러 페이지를 하나로 합쳐 정렬 + 중복 제거한다", () => {
    const pages = [
      [makeCandle("2026-01-01T00:00:02Z")],
      [makeCandle("2026-01-01T00:00:01Z"), makeCandle("2026-01-01T00:00:03Z")],
    ];

    const result = mergePagesToSortedUnique(pages);

    expect(result.map((c) => c.candle_date_time_utc)).toEqual([
      "2026-01-01T00:00:01Z",
      "2026-01-01T00:00:02Z",
      "2026-01-01T00:00:03Z",
    ]);
  });
});

describe("candleUnitPathSegment", () => {
  it("minutesUnit이 있으면 경로에 포함한다", () => {
    expect(candleUnitPathSegment("minutes", "5")).toBe("minutes/5");
  });

  it("minutesUnit이 없으면 candleUnit만 반환한다", () => {
    expect(candleUnitPathSegment("days")).toBe("days");
    expect(candleUnitPathSegment("days", null)).toBe("days");
  });
});

describe("upbitCandleToTimeSec", () => {
  it("candle_date_time_utc를 초 단위 UNIX 시간으로 변환한다", () => {
    const candle = makeCandle("2026-01-01T00:00:00Z");

    expect(upbitCandleToTimeSec(candle)).toBe(
      Math.floor(Date.parse("2026-01-01T00:00:00Z") / 1000),
    );
  });
});
