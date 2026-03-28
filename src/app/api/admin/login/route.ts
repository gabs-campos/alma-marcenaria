import { NextRequest } from "next/server";
import { setAdminCookie } from "@/lib/adminAuth";

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Partial<{
    username: string;
    password: string;
  }>;

  const expectedUser = process.env.ADMIN_USERNAME ?? "";
  const expectedPass = process.env.ADMIN_PASSWORD ?? "";

  if (!body.username || !body.password) {
    return Response.json({ error: "invalid_body" }, { status: 400 });
  }

  if (body.username !== expectedUser || body.password !== expectedPass) {
    return Response.json({ error: "invalid_credentials" }, { status: 401 });
  }

  await setAdminCookie();
  return Response.json({ ok: true });
}

