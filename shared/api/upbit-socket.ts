import { v4 as uuidv4 } from "uuid";
import { requireEnv } from "@/shared/lib";

/**
 * Upbit WebSocket은 하나의 연결에 여러 type(ticker/candle 등)을 함께 구독할 수
 * 있다. 페이지 전환마다 연결을 끊고 새로 여는 대신, 탭 생존 기간 동안 단일
 * 연결을 유지하고 구독 목록만 갈아끼운다 — Origin 헤더가 있는 브라우저发
 * 연결을 짧은 시간 안에 반복해서 열고 닫으면 Upbit가 핸드셰이크를 429로
 * 거부하는 것을 실측으로 확인했기 때문(연결 자체를 새로 여는 "횟수"가
 * 문제이지, 재시도 간 지연을 늘리는 것으로는 해결되지 않음).
 */

const MAX_RECONNECT_DELAY_MS = 30_000;

const WS_URL = requireEnv(
  process.env.NEXT_PUBLIC_UPBIT_WEBSOCKET_BASE_URL,
  "NEXT_PUBLIC_UPBIT_WEBSOCKET_BASE_URL",
);

type Subscription = { type: string; codes: string[] };
type MessageHandler = (raw: unknown) => void;

let socket: WebSocket | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let reconnectAttempt = 0;
const subscriptions = new Map<string, Subscription>();
const handlers = new Set<MessageHandler>();

function buildSubscribePayload() {
  return JSON.stringify([
    { ticket: uuidv4() },
    ...Array.from(subscriptions.values()).map(({ type, codes }) => ({
      type,
      codes,
    })),
    { format: "DEFAULT" },
  ]);
}

function sendSubscription() {
  if (socket?.readyState === WebSocket.OPEN && subscriptions.size > 0) {
    socket.send(buildSubscribePayload());
  }
}

function openSocket() {
  socket = new WebSocket(WS_URL);

  socket.onopen = () => {
    reconnectAttempt = 0;
    sendSubscription();
  };

  socket.onmessage = async (event) => {
    const data = await (event.data as Blob).text();
    let parsed: unknown;
    try {
      parsed = JSON.parse(data);
    } catch {
      return;
    }
    handlers.forEach((handler) => handler(parsed));
  };

  socket.onclose = () => {
    socket = null;
    scheduleReconnect();
  };

  socket.onerror = (err) => {
    // 재연결 로직이 자동으로 복구를 시도하므로 error 대신 warn으로 기록
    console.warn("Upbit WS error, 재연결을 시도합니다", err);
    socket?.close();
  };
}

function scheduleReconnect() {
  if (subscriptions.size === 0) return;

  const delay = Math.min(1000 * 2 ** reconnectAttempt, MAX_RECONNECT_DELAY_MS);
  reconnectAttempt += 1;
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    openSocket();
  }, delay);
}

function ensureConnected() {
  if (socket || reconnectTimer) return;
  openSocket();
}

/** 수신 메시지를 모두 받아 자체 스키마로 필터링하는 핸들러를 등록한다. */
export function registerUpbitMessageHandler(handler: MessageHandler) {
  handlers.add(handler);
  return () => handlers.delete(handler);
}

/** key로 구분되는 구독 항목을 등록/갱신하고, 필요 시 연결을 시작한다. */
export function subscribeUpbitChannel(
  key: string,
  type: string,
  codes: string[],
) {
  subscriptions.set(key, { type, codes });
  ensureConnected();
  sendSubscription();
}

/** key에 해당하는 구독을 제거한다(연결 자체는 끊지 않음). */
export function unsubscribeUpbitChannel(key: string) {
  if (!subscriptions.delete(key)) return;
  sendSubscription();
}
