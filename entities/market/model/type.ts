import { z } from "zod";

export const marketEventSchema = z.object({
  warning: z.boolean(), // 유의 종목 여부
  caution: z.object({
    PRICE_FLUCTUATIONS: z.boolean(), // 가격 급등락 경보
    TRADING_VOLUME_SOARING: z.boolean(), // 거래량 급증 경보
    DEPOSIT_AMOUNT_SOARING: z.boolean(), // 입금량 급증 경보
    GLOBAL_PRICE_DIFFERENCES: z.boolean(), // 국내외 가격 차이 경보
    CONCENTRATION_OF_SMALL_ACCOUNTS: z.boolean(), // 소수 계정 집중 거래 경보
  }),
});

export const marketSchema = z.object({
  market: z.string(),
  korean_name: z.string(),
  english_name: z.string(),
  market_event: marketEventSchema,
});

export type MarketEvent = z.infer<typeof marketEventSchema>;
export type Market = z.infer<typeof marketSchema>;
