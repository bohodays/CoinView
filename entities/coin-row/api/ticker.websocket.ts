import type { Market } from "@/entities/market";
import { requireEnv } from "@/shared/lib";
import { v4 as uuidv4 } from "uuid";
import { useTickerStore } from "../model/ticker.store";
import { tickerWsMessageSchema } from "../model/type";

const MAX_RECONNECT_DELAY_MS = 30_000;
// 페이지 전환 시 다른 WS(캔들)가 닫히는 시점과 겹쳐 Upbit가 "너무 많은
// 연결 시도"로 판단해 핸드셰이크를 429로 거부하는 경우가 있어, 새 연결
// 시도 전에 짧게 여유를 둔다.
const CONNECT_DELAY_MS = 300;

let socket: WebSocket | null = null;
let subscribedCodes: string[] = [];
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let connectTimer: ReturnType<typeof setTimeout> | null = null;
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
  if (connectTimer) return; // 이미 연결이 예약되어 있음

  scheduleOpenSocket();
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

function scheduleOpenSocket() {
  clearReconnectTimer();
  clearConnectTimer();
  connectTimer = setTimeout(() => {
    connectTimer = null;
    openSocket();
  }, CONNECT_DELAY_MS);
}

function openSocket() {
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
    // 재연결 로직이 자동으로 복구를 시도하므로 error 대신 warn으로 기록
    console.warn("WS error, 재연결을 시도합니다", err);
    socket?.close();
  };
}

function scheduleReconnect() {
  if (isManuallyDisconnected || subscribedCodes.length === 0) return;

  const delay = Math.min(1000 * 2 ** reconnectAttempt, MAX_RECONNECT_DELAY_MS);
  reconnectAttempt += 1;
  reconnectTimer = setTimeout(scheduleOpenSocket, delay);
}

function clearReconnectTimer() {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
}

function clearConnectTimer() {
  if (connectTimer) {
    clearTimeout(connectTimer);
    connectTimer = null;
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
  clearConnectTimer();
  reconnectAttempt = 0;
  socket?.close();
  socket = null;
  subscribedCodes = [];
};
