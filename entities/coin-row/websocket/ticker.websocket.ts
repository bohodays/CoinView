import { Market } from "@/widgets/coin-list/model/types";
import { v4 as uuidv4 } from "uuid";
import { useTickerStore } from "../model/ticker.store";

let socket: WebSocket | null = null;
let subscribedCodes: string[] = [];
const WS_URL = process.env.NEXT_PUBLIC_UPBIT_WEBSOCKET_BASE_URL;

export const connetTickerSocket = (codes: Market[]) => {
  connectTickerSocketByCodes(codes.map((code) => code.market));
};

export const connectTickerSocketByCodes = (codes: string[]) => {
  subscribedCodes = Array.from(new Set([...subscribedCodes, ...codes]));

  if (socket) {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(createSubscribePayload(subscribedCodes)));
    }
    return; // 중복 연결 방지
  }

  socket = new WebSocket(WS_URL as string);

  socket.onopen = () => {
    console.log("Upbit WS connected !");

    socket?.send(JSON.stringify(createSubscribePayload(subscribedCodes)));
  };

  socket.onmessage = async (event) => {
    const data = await (event.data as Blob).text();
    const ticker = JSON.parse(data);

    // Ticker Store에 저장
    useTickerStore.getState().updateTicker(ticker);
  };

  socket.onclose = () => {
    console.log("Ticker WS closed !");
    socket = null;
  };

  socket.onerror = (err) => {
    console.error("WS error", err);
    socket?.close();
  };
};

const createSubscribePayload = (codes: string[]) => [
  { ticket: uuidv4() },
  { type: "ticker", codes },
  {
    format: "DEFAULT",
  },
];

export const disconnectTickerSocket = () => {
  socket?.close();
  socket = null;
  subscribedCodes = [];
};
