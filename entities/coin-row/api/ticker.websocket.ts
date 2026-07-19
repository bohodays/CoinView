import type { Market } from "@/entities/market";
import { requireEnv } from "@/shared/lib";
import { v4 as uuidv4 } from "uuid";
import { useTickerStore } from "../model/ticker.store";
import { tickerWsMessageSchema } from "../model/type";

const MAX_RECONNECT_DELAY_MS = 30_000;

let socket: WebSocket | null = null;
let subscribedCodes: string[] = [];
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let reconnectAttempt = 0;
let isManuallyDisconnected = false;
const WS_URL = requireEnv(
  process.env.NEXT_PUBLIC_UPBIT_WEBSOCKET_BASE_URL,
  "NEXT_PUBLIC_UPBIT_WEBSOCKET_BASE_URL",
);

export const connectTickerSocket = (codes: Market[]) => {
  connectTickerSocketByCodes(codes.map((code) => code.market));
};

export const connectTickerSocketByCodes = (codes: string[]) => {
  isManuallyDisconnected = false;
  subscribedCodes = Array.from(new Set([...subscribedCodes, ...codes]));

  if (socket) {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(createSubscribePayload(subscribedCodes)));
    }
    return; // 중복 연결 방지
  }

  openSocket();
};

/**
 * 구독 중인 코드 목록에서 일부를 제거하고, 남은 코드로 재구독한다.
 * (Upbit WS는 메시지 전송 시 구독 목록 전체를 대체하는 방식)
 */
export const unsubscribeTickerCodes = (codes: string[]) => {
  if (subscribedCodes.length === 0) return;

  subscribedCodes = subscribedCodes.filter((code) => !codes.includes(code));

  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(createSubscribePayload(subscribedCodes)));
  }
};

function openSocket() {
  clearReconnectTimer();

  socket = new WebSocket(WS_URL);

  socket.onopen = () => {
    reconnectAttempt = 0;
    socket?.send(JSON.stringify(createSubscribePayload(subscribedCodes)));
  };

  socket.onmessage = async (event) => {
    const data = await (event.data as Blob).text();
    const parsed = tickerWsMessageSchema.safeParse(JSON.parse(data));
    if (!parsed.success) return;

    // Ticker Store에 저장
    useTickerStore.getState().updateTicker(parsed.data);
  };

  socket.onclose = () => {
    socket = null;
    scheduleReconnect();
  };

  socket.onerror = (err) => {
    console.error("WS error", err);
    socket?.close();
  };
}

function scheduleReconnect() {
  if (isManuallyDisconnected || subscribedCodes.length === 0) return;

  const delay = Math.min(1000 * 2 ** reconnectAttempt, MAX_RECONNECT_DELAY_MS);
  reconnectAttempt += 1;
  reconnectTimer = setTimeout(openSocket, delay);
}

function clearReconnectTimer() {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
}

const createSubscribePayload = (codes: string[]) => [
  { ticket: uuidv4() },
  { type: "ticker", codes },
  {
    format: "DEFAULT",
  },
];

export const disconnectTickerSocket = () => {
  isManuallyDisconnected = true;
  clearReconnectTimer();
  reconnectAttempt = 0;
  socket?.close();
  socket = null;
  subscribedCodes = [];
};
