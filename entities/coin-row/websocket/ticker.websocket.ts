import { Market } from "@/widgets/coin-list/model/types";
import { v4 as uuidv4 } from "uuid";
import { useTickerStore } from "../model/ticker.store";

let socket: WebSocket | null = null;
const WS_URL = process.env.NEXT_PUBLIC_UPBIT_WEBSOCKET_BASE_URL;

export const connetTickerSocket = (codes: Market[]) => {
  console.log({ WS_URL, socket });

  if (socket) return; // 중복 연결 방지

  socket = new WebSocket(WS_URL as string);

  socket.onopen = () => {
    console.log("Upbit WS connected !");

    const ticket = uuidv4();
    // 임시 데이터
    const payload = [
      { ticket },
      { type: "ticker", codes: [...codes.map((code) => code.market)] },
      {
        format: "DEFAULT",
      },
    ];

    socket?.send(JSON.stringify(payload));
  };

  socket.onmessage = async (event) => {
    const data = await (event.data as Blob).text();
    const ticker = JSON.parse(data);

    // Ticker Store에 저장
    useTickerStore.getState().updateTicker(ticker);
  };

  socket.onclose = () => {
    console.log("WS closed !");
    socket = null;
  };

  socket.onerror = (err) => {
    console.error("WS error", err);
    socket?.close();
  };
};

export const disconnectTickerSocket = () => {
  socket?.close();
  socket = null;
};
