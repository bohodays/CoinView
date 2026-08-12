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
// 페이지 전환 시 다른 WS(티커)가 닫히는 시점과 겹쳐 Upbit가 "너무 많은
// 연결 시도"로 판단해 핸드셰이크를 429로 거부하는 경우가 있어, 새 연결
// 시도 전에 짧게 여유를 둔다.
const CONNECT_DELAY_MS = 300;

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
  const connectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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

  const clearConnectTimer = () => {
    if (connectTimerRef.current) {
      clearTimeout(connectTimerRef.current);
      connectTimerRef.current = null;
    }
  };

  const closeSocket = () => {
    clearReconnectTimer();
    clearConnectTimer();

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

  const doConnect = () => {
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
      // 재연결 로직이 자동으로 복구를 시도하므로 error 대신 warn으로 기록
      console.warn("WS error, 재연결을 시도합니다", err);
      setStatus("error");
      ws?.close();
    };

    ws.onclose = () => {
      wsRef.current = null;
      setStatus("closed");
      scheduleReconnect();
    };
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
    if (connectTimerRef.current) return; // 이미 연결이 예약되어 있음

    connectTimerRef.current = setTimeout(() => {
      connectTimerRef.current = null;
      doConnect();
    }, CONNECT_DELAY_MS);
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
