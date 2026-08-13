import { useEffect, useRef } from "react";
import {
  CandleUnit,
  MinutesUnit,
  UpbitCandle,
  upbitCandleWsMessageSchema,
} from "../model/type";
import { v4 as uuidv4 } from "uuid";
import { minutesUnitTransWebSocketType } from "../lib/utils";
import {
  registerUpbitMessageHandler,
  subscribeUpbitChannel,
  unsubscribeUpbitChannel,
} from "@/shared/api";

type SocketStatus = "idle" | "open";

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

export const useUpbitCandleSocket = ({
  market,
  candleUnit,
  minutesUnit,
  enabled,
  sessionId,
  onCandle,
}: Params) => {
  const status: SocketStatus = enabled && market ? "open" : "idle";
  const channelKeyRef = useRef(`candle:${uuidv4()}`);

  // stale closure 방지
  const onCandleRef = useRef(onCandle);
  const sessionRef = useRef(sessionId);
  useEffect(() => {
    onCandleRef.current = onCandle;
  }, [onCandle]);
  useEffect(() => {
    sessionRef.current = sessionId;
  }, [sessionId]);

  const closeSocket = () => {
    unsubscribeUpbitChannel(channelKeyRef.current);
  };

  useEffect(() => {
    if (!enabled || !market) {
      return;
    }

    const key = channelKeyRef.current;
    const type = minutesUnitTransWebSocketType(candleUnit, minutesUnit);

    const unregister = registerUpbitMessageHandler((raw) => {
      const parsed = upbitCandleWsMessageSchema.safeParse(raw);
      if (!parsed.success || parsed.data.code !== market) return;

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
    });

    subscribeUpbitChannel(key, type, [market]);

    return () => {
      unregister();
      unsubscribeUpbitChannel(key);
    };
  }, [enabled, market, candleUnit, minutesUnit]);

  return { status, closeSocket };
};
