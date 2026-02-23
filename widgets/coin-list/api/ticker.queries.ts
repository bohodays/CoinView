import { useQuery } from "@tanstack/react-query";
import { fetchTickerAllData } from "./ticker.api";

export const tickerQueryKeys = {
  all: ["coin", "ticker", "all"],
};

export const useTickerData = () => {
  return useQuery({
    queryKey: tickerQueryKeys.all,
    queryFn: fetchTickerAllData,
    refetchIntervalInBackground: false,
    staleTime: 5 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    // retry: 0,
  });
};
