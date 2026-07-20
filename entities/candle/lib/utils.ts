import { CandleUnit, MinutesUnit, UpbitCandle } from "../model/type";

/**
 * UpbitCandle의 시간 -> lightweight-charts time(초 단위 UNIX)
 * - 우선순위: candle_date_time_utc(ISO) → timestamp(ms)
 */
export function upbitCandleToTimeSec(c: UpbitCandle): number {
  const parsed = Date.parse(c.candle_date_time_utc);
  if (!Number.isNaN(parsed)) return Math.floor(parsed / 1000);
  return Math.floor(c.timestamp / 1000);
}

export function minutesUnitTransWebSocketType(
  candleUnit: CandleUnit,
  minutesUnit?: MinutesUnit,
) {
  if (candleUnit === "seconds") return "candle.1s";
  if (candleUnit === "minutes" && minutesUnit) return `candle.${minutesUnit}m`;
  return "candle.";
}

/** Upbit 캔들 API의 candleUnit(+minutesUnit) 경로 세그먼트 (예: "minutes/1") */
export function candleUnitPathSegment(
  candleUnit: string,
  minutesUnit?: string | null,
): string {
  return minutesUnit ? `${candleUnit}/${minutesUnit}` : candleUnit;
}

export function isCandleWebSocketSupported(
  candleUnit: CandleUnit,
  minutesUnit?: MinutesUnit,
) {
  if (candleUnit === "seconds") return true;
  return candleUnit === "minutes" && !!minutesUnit;
}

/** timeSec 기준 중복 제거 + 오름차순 정렬 (마지막에 온 캔들이 우선) */
export function sortUniqueByTime(candles: UpbitCandle[]): UpbitCandle[] {
  const map = new Map<number, UpbitCandle>();
  for (const c of candles) {
    map.set(upbitCandleToTimeSec(c), c);
  }
  return Array.from(map.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([, c]) => c);
}

/** InfiniteQuery의 페이지 배열을 하나로 합쳐 시간순 정렬 + 중복 제거 */
export function mergePagesToSortedUnique(
  pages: UpbitCandle[][],
): UpbitCandle[] {
  return sortUniqueByTime(pages.flat());
}
