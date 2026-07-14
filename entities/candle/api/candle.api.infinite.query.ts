import { InfiniteData, useInfiniteQuery } from "@tanstack/react-query";
import { fetchCandle } from "./candle.api";
import { candleKeys } from "./candle.keys";
import { CandleUnit, MinutesUnit, UpbitCandle } from "../model/type";

type PageParam = string | undefined; // Upbit "to" ISO string

export const useCandleHistoryInfiniteQuery = ({
  market,
  candleUnit,
  minutesUnit,
}: {
  market: string;
  candleUnit: CandleUnit;
  minutesUnit?: MinutesUnit;
}) => {
  const queryKey = candleKeys.byMarketUnit(market, candleUnit, minutesUnit);

  return useInfiniteQuery<
    UpbitCandle[],
    Error,
    InfiniteData<UpbitCandle[]>,
    typeof queryKey,
    PageParam
  >({
    queryKey,
    enabled: !!market,

    initialPageParam: undefined,

    queryFn: ({ pageParam }) =>
      fetchCandle({
        market,
        candleUnit,
        minutesUnit,
        to: pageParam,
      }),

    /**
     * fetchCandle이 "과거 -> 최신" 오름차순으로 준다는 전제.
     * - lastPage[0] = 그 페이지의 oldest
     * - 더 과거를 가져오려면 oldest - 1초 를 to로 설정
     */
    getNextPageParam: (lastPage) => {
      if (!lastPage || lastPage.length === 0) return undefined;
      const oldest = lastPage[lastPage.length - 1];
      return oldest.candle_date_time_utc;
    },

    staleTime: 1,
    gcTime: 1,
  });
};
