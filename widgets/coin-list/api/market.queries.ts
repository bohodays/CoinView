import { useQuery } from "@tanstack/react-query";
import { fetchMarketData } from "./market.api";
import { Market } from "../model/types";

export const marketQueryKeys = {
  allMarket: ["coin", "market", "all"],
};

export const useMarketData = () => {
  return useQuery<Market[]>({
    queryKey: marketQueryKeys.allMarket,
    queryFn: fetchMarketData,
    staleTime: 10 * 60 * 1000, // revalidate 시간과 동일하게 10분으로 설정
    refetchInterval: 10 * 60 * 1000,
    select: (market) => {
      return market.filter((data) => data.market.startsWith("KRW-"));
    },
  });
};
