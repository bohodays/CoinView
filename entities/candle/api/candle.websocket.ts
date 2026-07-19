import { useEffect, useMemo, useRef, useState } from "react";
import {
  CandleUnit,
  MinutesUnit,
  UpbitCandle,
  upbitCandleWsMessageSchema,
} from "../model/type";
import { v4 as uuidv4 } from "uuid";
import { minutesUnitTransWebSocketType } from "../lib/utils";
import { requireEnv } from "@/shared/lib";

type SocketStatus = "idle" | "connecting" | "open" | "closed" | "error";

const MAX_RECONNECT_DELAY_MS = 30_000;

type Params = {
  market: string;
  candleUnit: CandleUnit;
  minutesUnit?: MinutesUnit;
  enabled: boolean;
  sessionId: string;
  onCandle: ({
    sessionId,
    market,
    candleUnit,
    minutesUnit,
    candle,
  }: {
    sessionId: string;
    market: string;
    candleUnit: CandleUnit;
    minutesUnit?: MinutesUnit;
    candle: UpbitCandle;
  }) => void;
};

const WS_URL = requireEnv(
  process.env.NEXT_PUBLIC_UPBIT_WEBSOCKET_BASE_URL,
  "NEXT_PUBLIC_UPBIT_WEBSOCKET_BASE_URL",
);

export const useUpbitCandleSocket = ({
  market,
  candleUnit,
  minutesUnit,
  enabled,
  sessionId,
  onCandle,
}: Params) => {
  const [status, setStatus] = useState<SocketStatus>("idle");
  const wsRef = useRef<WebSocket | null>(null);
  const ticketRef = useRef<string>(uuidv4());
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const reconnectAttemptRef = useRef(0);

  // stale closure 방지
  const onCandleRef = useRef(onCandle);
  const sessionRef = useRef(sessionId);
  useEffect(() => {
    onCandleRef.current = onCandle;
  }, [onCandle]);
  useEffect(() => {
    sessionRef.current = sessionId;
  }, [sessionId]);

  const buildSubscribePayload = useMemo(() => {
    const type = minutesUnitTransWebSocketType(candleUnit, minutesUnit);
    return () =>
      JSON.stringify([
        { ticket: ticketRef.current },
        { type, codes: [market] },
      ]);
  }, [candleUnit, minutesUnit, market]);

  const clearReconnectTimer = () => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
  };

  const closeSocket = () => {
    clearReconnectTimer();

    const ws = wsRef.current;
    wsRef.current = null;
    if (!ws) return;

    try {
      if (
        ws.readyState === WebSocket.OPEN ||
        ws.readyState === WebSocket.CONNECTING
      ) {
        ws.close();
      }
    } catch {
      // ignore
    }
  };

  const connectIfNeeded = () => {
    if (!enabled || !market) return;

    const existing = wsRef.current;
    if (
      existing &&
      (existing.readyState === WebSocket.OPEN ||
        existing.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    setStatus("connecting");

    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      reconnectAttemptRef.current = 0;
      setStatus("open");
      ws.send(buildSubscribePayload());
    };

    ws.onmessage = async (event) => {
      try {
        const data = await (event.data as Blob).text();
        const parsed = upbitCandleWsMessageSchema.safeParse(JSON.parse(data));
        if (!parsed.success) return;

        // WS 메시지는 market 대신 code 필드를 사용하므로 내부 UpbitCandle 형태로 매핑
        const { code, ...rest } = parsed.data;
        const candle: UpbitCandle = { market: code, ...rest };

        onCandleRef.current({
          sessionId: sessionRef.current,
          market,
          candleUnit,
          minutesUnit,
          candle,
        });
      } catch {
        // ignore
      }
    };

    ws.onerror = (err) => {
      console.error("WS error", err);
      setStatus("error");
      ws?.close();
    };

    ws.onclose = () => {
      wsRef.current = null;
      setStatus("closed");
      scheduleReconnect();
    };
  };

  const scheduleReconnect = () => {
    if (!enabled || !market) return;

    const delay = Math.min(
      1000 * 2 ** reconnectAttemptRef.current,
      MAX_RECONNECT_DELAY_MS,
    );
    reconnectAttemptRef.current += 1;
    reconnectTimerRef.current = setTimeout(connectIfNeeded, delay);
  };

  // enabled/market 변화: 연결 on/off
  useEffect(() => {
    if (!enabled || !market) {
      closeSocket();
      setStatus("idle");
      return;
    }

    reconnectAttemptRef.current = 0;
    connectIfNeeded();
    return closeSocket;
  }, [enabled, market]);

  // unit 변화: 연결 유지 + 구독만 교체
  useEffect(() => {
    if (!enabled) return;

    const ws = wsRef.current;
    if (!ws) {
      connectIfNeeded();
      return;
    }
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(buildSubscribePayload());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candleUnit, minutesUnit, enabled, buildSubscribePayload]);

  return { status, closeSocket };
};
