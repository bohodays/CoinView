export const fetchMarketData = async () => {
  try {
    const response = await fetch(`/api/upbit/market`);

    if (!response.ok) {
      const errorBody = await response.json().catch(() => null);
      throw new Error(errorBody.message ?? "Failed to fetch market");
    }

    return response.json();
  } catch (error) {
    throw error;
  }
};
