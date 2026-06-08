import { UpbitCandle } from "@/entities/candle/model/type";
import { CandlestickData, HistogramData, Time } from "lightweight-charts";

/**
 * UpbitCandle의 시간 -> lightweight-charts time(초 단위 UNIX)
 * - 우선순위: candle_date_time_utc(ISO) → timestamp(ms)
 */
export function upbitCandleToTimeSec(c: UpbitCandle): number {
  const parsed = Date.parse(c.candle_date_time_utc);
  if (!Number.isNaN(parsed)) return Math.floor(parsed / 1000);
  return Math.floor(c.timestamp / 1000);
}

/** 캔들(OHLC) 데이터 변환 */
export function upbitCandleToCandlestickData(
  c: UpbitCandle,
): CandlestickData<Time> {
  return {
    time: upbitCandleToTimeSec(c) as Time,
    open: c.opening_price,
    high: c.high_price,
    low: c.low_price,
    close: c.trade_price,
  };
}

/** 거래량(Volume) 데이터 변환 */
export function upbitCandleToVolumeData(c: UpbitCandle): HistogramData<Time> {
  return {
    time: upbitCandleToTimeSec(c) as Time,
    value: c.candle_acc_trade_volume,
  };
}

/** 배열 변환 (정렬까지 보장: 오래된 → 최신) */
export function upbitCandlesToSeriesData(candles: UpbitCandle[]) {
  // timeSec -> candle (마지막으로 온 걸 wins)
  const map = new Map<number, UpbitCandle>();
  for (const c of candles) {
    map.set(upbitCandleToTimeSec(c), c);
  }

  const sorted = [...map.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([, c]) => c);

  return {
    candleData: sorted.map(upbitCandleToCandlestickData),
    volumeData: sorted.map(upbitCandleToVolumeData),
    firstTimeSec: sorted.length ? upbitCandleToTimeSec(sorted[0]) : null,
    lastTimeSec: sorted.length
      ? upbitCandleToTimeSec(sorted[sorted.length - 1])
      : null,
  };
}
