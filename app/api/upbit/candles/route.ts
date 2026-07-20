// entities/candle의 public API(index.ts)는 useCoinCandles 등 클라이언트 전용
// React 훅까지 재수출하므로, 서버 전용 Route Handler에서는 배럴을 거치지 않고
// 순수 유틸 파일만 직접 import한다.
import { candleUnitPathSegment } from "@/entities/candle/lib/utils";
import { NextResponse } from "next/server";

const COUNT = 200;

export async function GET(req: Request) {
  const url = new URL(req.url);

  const market = url.searchParams.get("market");
  const candleUnit = url.searchParams.get("candleUnit");
  const minutesUnit = url.searchParams.get("minutesUnit");
  const to = url.searchParams.get("to");

  if (!market || !candleUnit) {
    return NextResponse.json(
      { message: "market/unit required" },
      { status: 400 },
    );
  }

  const BASE_URL = process.env.UPBIT_API_BASE_URL;

  try {
    const params = new URLSearchParams({ market, count: String(COUNT) });
    if (to) params.set("to", to);

    const path = candleUnitPathSegment(candleUnit, minutesUnit);
    const TARGET_URL = `${BASE_URL}/v1/candles/${path}?${params.toString()}`;

    const res = await fetch(TARGET_URL, {
      headers: { accept: "application/json" },
    });

    if (!res.ok) {
      return NextResponse.json(
        { message: "Upbit API error" },
        { status: res.status },
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ message: "Internal error" }, { status: 500 });
  }
}
