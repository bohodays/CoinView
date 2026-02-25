export const fetchTickerAllData = async () => {
  try {
    const response = await fetch(`/api/upbit/ticker`);

    if (!response.ok) {
      const errorBody = await response.json().catch(() => null);
      throw new Error(errorBody.message ?? "Failed to fetch ticker all");
    }

    return response.json();
  } catch (error) {
    throw error;
  }
};
