import { useQuery } from "@tanstack/react-query";
import { fetchTickerAllData } from "./ticker.api";
import { Ticker } from "../model/type";

export const tickerQueryKeys = {
  all: ["coin", "ticker", "all"],
};

export const useTickerData = () => {
  return useQuery<Ticker[]>({
    queryKey: tickerQueryKeys.all,
    queryFn: fetchTickerAllData,
    staleTime: 10 * 60 * 1000, // revalidate 시간과 동일하게 10분으로 설정
    refetchInterval: 10 * 60 * 1000,
  });
};
