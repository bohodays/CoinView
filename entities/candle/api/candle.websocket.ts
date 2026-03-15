import { useEffect, useMemo, useRef, useState } from "react";
import { CandleUnit, MinutesUnit, UpbitCandle } from "../model/type";
import { v4 as uuidv4 } from "uuid";
import { minutesUnitTransWebSocketType } from "@/shared/lib/utils";

type SocketStatus = "idle" | "connecting" | "open" | "closed" | "error";

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

const WS_URL = process.env.NEXT_PUBLIC_UPBIT_WEBSOCKET_BASE_URL;

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

  const closeSocket = () => {
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

    const ws = new WebSocket(WS_URL as string);
    wsRef.current = ws;

    ws.onopen = () => {
      setStatus("open");
      ws.send(buildSubscribePayload());
    };

    ws.onmessage = async (event) => {
      try {
        const data = await (event.data as Blob).text();
        const res: UpbitCandle = JSON.parse(data);
        // const candle = mapUpbitWsCandleToCandle(raw);
        onCandleRef.current({
          sessionId: sessionRef.current,
          market,
          candleUnit,
          minutesUnit,
          candle: res,
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
      console.log("WS closed !");
      setStatus("closed");
      wsRef.current = null;
    };
  };

  // enabled/market 변화: 연결 on/off
  useEffect(() => {
    if (!enabled || !market) {
      closeSocket();
      setStatus("idle");
      return;
    }

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
