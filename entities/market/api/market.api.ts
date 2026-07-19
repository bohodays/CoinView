import { marketSchema } from "../model/type";
import { z } from "zod";

const marketListSchema = z.array(marketSchema);

export const fetchMarketData = async () => {
  try {
    const response = await fetch(`/api/upbit/market`);

    if (!response.ok) {
      const errorBody = await response.json().catch(() => null);
      throw new Error(errorBody?.message ?? "Failed to fetch market");
    }

    const data = await response.json();
    return marketListSchema.parse(data);
  } catch (error) {
    throw error;
  }
};
