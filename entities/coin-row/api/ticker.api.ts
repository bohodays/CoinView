import { tickerSchema } from "../model/type";
import { z } from "zod";

const tickerListSchema = z.array(tickerSchema);

export const fetchTickerAllData = async () => {
  try {
    const response = await fetch(`/api/upbit/ticker`);

    if (!response.ok) {
      const errorBody = await response.json().catch(() => null);
      throw new Error(errorBody?.message ?? "Failed to fetch ticker all");
    }

    const data = await response.json();
    return tickerListSchema.parse(data);
  } catch (error) {
    throw error;
  }
};
