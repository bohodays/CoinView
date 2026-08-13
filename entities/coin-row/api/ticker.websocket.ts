import type { Market } from "@/entities/market";
import {
  registerUpbitMessageHandler,
  subscribeUpbitChannel,
  unsubscribeUpbitChannel,
} from "@/shared/api";
import { useTickerStore } from "../model/ticker.store";
import { tickerWsMessageSchema } from "../model/type";

const TICKER_CHANNEL_KEY = "ticker";

let subscribedCodes: string[] = [];
let unregisterHandler: (() => void) | null = null;

function ensureHandlerRegistered() {
  if (unregisterHandler) return;

  unregisterHandler = registerUpbitMessageHandler((raw) => {
    const parsed = tickerWsMessageSchema.safeParse(raw);
    if (!parsed.success) return;

    useTickerStore.getState().updateTicker(parsed.data);
  });
}

export const connectTickerSocket = (codes: Market[]) => {
  connectTickerSocketByCodes(codes.map((code) => code.market));
};

export const connectTickerSocketByCodes = (codes: string[]) => {
  subscribedCodes = Array.from(new Set([...subscribedCodes, ...codes]));
  ensureHandlerRegistered();
  subscribeUpbitChannel(TICKER_CHANNEL_KEY, "ticker", subscribedCodes);
};

/**
 * 구독 중인 코드 목록에서 일부를 제거하고, 남은 코드로 재구독한다.
 * (Upbit WS는 메시지 전송 시 구독 목록 전체를 대체하는 방식)
 */
export const unsubscribeTickerCodes = (codes: string[]) => {
  if (subscribedCodes.length === 0) return;

  subscribedCodes = subscribedCodes.filter((code) => !codes.includes(code));

  if (subscribedCodes.length === 0) {
    unsubscribeUpbitChannel(TICKER_CHANNEL_KEY);
  } else {
    subscribeUpbitChannel(TICKER_CHANNEL_KEY, "ticker", subscribedCodes);
  }
};

export const disconnectTickerSocket = () => {
  subscribedCodes = [];
  unsubscribeUpbitChannel(TICKER_CHANNEL_KEY);
};
