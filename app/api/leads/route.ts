import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// export async function POST(request: Request) {
//   const body = await request.json();
//   const { name, phone, email, company, notes } = body;

//   if (!name?.trim() || !phone?.trim() || !company?.trim()) {
//     return NextResponse.json(
//       { error: "name, phone, and company are required." },
//       { status: 400 },
//     );
//   }

//   try {
//     const lead = await prisma.lead.create({
//       data: { name, phone, email: email || null, company, notes },
//     });
//     return NextResponse.json({ lead }, { status: 201 });
//   } catch (error) {
//     console.error("Failed to create lead:", error);
//     return NextResponse.json(
//       { error: "Failed to save lead." },
//       { status: 500 },
//     );
//   }
// }

// opsi 2 -> fetch api yang ada di backend (internal dashboard api) -> ini lebih aman karena kita bisa pake x-api-key
export async function POST(request: Request) {
  const body = await request.json();
  const res = await fetch(`${process.env.DASHBOARD_URL}/api/public/leads`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.LEADS_API_KEY!,
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
