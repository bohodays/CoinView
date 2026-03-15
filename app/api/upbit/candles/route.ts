import { NextResponse } from "next/server";

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

  let res;
  try {
    if (to) {
      res = await fetch(
        `${BASE_URL}/v1/candles/${candleUnit}?market=${market}&to=${to}&count=200`,
        {
          headers: { accept: "application/json" },
        },
      );
    } else {
      res = await fetch(
        `${BASE_URL}/v1/candles/${candleUnit}?market=${market}&count=200`,
        {
          headers: { accept: "application/json" },
        },
      );
    }

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
