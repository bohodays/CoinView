import { NextResponse } from "next/server";

export const revalidate = 60 * 10; // 10분으로 캐싱

export async function GET() {
  const BASE_URL = process.env.UPBIT_API_BASE_URL;

  try {
    const res = await fetch(`${BASE_URL}/v1/ticker/all?quote_currencies=KRW`, {
      headers: { accept: "application/json" },
      next: { revalidate },
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
