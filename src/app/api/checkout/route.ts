import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const body = (await req.json()) as unknown;

  // Nesta primeira versão, apenas aceitamos e retornamos um OK.
  // Evolução natural: enviar e-mail/WhatsApp, salvar no banco, etc.
  return Response.json({ ok: true, received: body }, { status: 201 });
}

