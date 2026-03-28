import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");

  const products = await prisma.product.findMany({
    where: category ? { category: category as never } : undefined,
    orderBy: { createdAt: "desc" },
  });

  return Response.json({ products });
}

export async function POST(req: NextRequest) {
  const unauthorized = requireAdmin(req);
  if (unauthorized) return unauthorized;

  const body = (await req.json()) as Partial<{
    name: string;
    description: string;
    priceCents: number;
    category: "MOVEIS" | "DECORACAO" | "MATERIAIS";
    imageUrl: string | null;
  }>;

  if (!body.name || !body.description || typeof body.priceCents !== "number" || !body.category) {
    return Response.json({ error: "invalid_body" }, { status: 400 });
  }

  const product = await prisma.product.create({
    data: {
      name: body.name,
      description: body.description,
      priceCents: Math.max(0, Math.round(body.priceCents)),
      category: body.category,
      imageUrl: body.imageUrl ?? null,
    },
  });

  return Response.json({ product }, { status: 201 });
}

