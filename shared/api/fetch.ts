import { z } from "zod";

/** fetch + 응답 에러 처리 + zod 검증을 한 번에 수행하는 공용 클라이언트 */
export async function apiFetch<T>(
  url: string,
  schema: z.ZodType<T>,
): Promise<T> {
  const response = await fetch(url);

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new Error(errorBody?.message ?? `Failed to fetch ${url}`);
  }

  const data = await response.json();
  return schema.parse(data);
}
