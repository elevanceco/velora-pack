import { NextResponse } from "next/server";

export async function GET() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/public/products`,
    {
      cache: "no-store",
    },
  );

  const data = await res.json();

  return NextResponse.json(data, {
    status: res.status,
  });
}
