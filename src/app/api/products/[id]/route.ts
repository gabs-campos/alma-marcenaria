import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

function getId(params: { id: string }) {
  const id = Number(params.id);
  return Number.isFinite(id) ? id : null;
}

async function getParams(ctx: { params: Promise<{ id: string }> }) {
  return await ctx.params;
}

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const params = await getParams(ctx);
  const id = getId(params);
  if (!id) return Response.json({ error: "invalid_id" }, { status: 400 });

  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return Response.json({ error: "not_found" }, { status: 404 });

  return Response.json({ product });
}

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const unauthorized = requireAdmin(req);
  if (unauthorized) return unauthorized;

  const params = await getParams(ctx);
  const id = getId(params);
  if (!id) return Response.json({ error: "invalid_id" }, { status: 400 });

  const body = (await req.json()) as Partial<{
    name: string;
    description: string;
    priceCents: number;
    category: "MOVEIS" | "DECORACAO" | "MATERIAIS";
    imageUrl: string | null;
  }>;

  const product = await prisma.product.update({
    where: { id },
    data: {
      name: body.name,
      description: body.description,
      priceCents:
        typeof body.priceCents === "number"
          ? Math.max(0, Math.round(body.priceCents))
          : undefined,
      category: body.category,
      imageUrl: body.imageUrl ?? undefined,
    },
  });

  return Response.json({ product });
}

export async function DELETE(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const unauthorized = requireAdmin(req);
  if (unauthorized) return unauthorized;

  const params = await getParams(ctx);
  const id = getId(params);
  if (!id) return Response.json({ error: "invalid_id" }, { status: 400 });

  await prisma.product.delete({ where: { id } });
  return Response.json({ ok: true });
}

