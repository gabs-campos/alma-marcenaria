import { NextRequest } from "next/server";

function onlyDigits(v: string) {
  return v.replace(/\D/g, "");
}

// Integração simples (mock): valor fixo por faixa de CEP.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const cep = onlyDigits(searchParams.get("cep") ?? "");
  if (cep.length !== 8) {
    return Response.json({ error: "invalid_cep" }, { status: 400 });
  }

  // Exemplo: BH/Região (30xxx-31xxx) mais barato, resto mais caro.
  const prefix = Number(cep.slice(0, 2));
  const shippingCents = prefix === 30 || prefix === 31 ? 2500 : 4500;

  return Response.json({ shippingCents });
}

