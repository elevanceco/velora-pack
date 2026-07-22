import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// app/api/public/leads/route.ts
export async function POST(request: Request) {
  const apiKey = request.headers.get("x-api-key");

  if (apiKey !== process.env.LEADS_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const {
      name,
      phone,
      email,
      company,
      productId,
      estimatedQty,
      customPrinting,
      notes,
      customerId,
    } = await request.json();

    if (!name || !phone || !company) {
      return NextResponse.json(
        { error: "Name, phone and company are required." },
        { status: 400 },
      );
    }

    const lead = await prisma.lead.create({
      data: {
        name,
        phone,
        email: email || null,
        company,

        productId: productId || null,
        estimatedQty: estimatedQty || null,
        customPrinting:
          typeof customPrinting === "boolean" ? customPrinting : null,
        notes: notes || null,

        customerId: customerId || null,
      },
      include: {
        product: true,
        customer: true,
      },
    });

    return NextResponse.json({ lead }, { status: 201 });
  } catch (error) {
    console.error("Create lead failed:", error);

    return NextResponse.json(
      { error: "Failed to create lead." },
      { status: 500 },
    );
  }
}
