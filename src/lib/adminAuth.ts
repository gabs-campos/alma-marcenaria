import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

const ADMIN_COOKIE = "alma_admin";

export function isAdminRequest(req: NextRequest) {
  const token = process.env.ADMIN_API_TOKEN?.trim();
  if (token) {
    const auth = req.headers.get("authorization") ?? "";
    if (auth === `Bearer ${token}`) return true;
  }

  return req.cookies.get(ADMIN_COOKIE)?.value === "1";
}

export function requireAdmin(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return Response.json(
      {
        error: "unauthorized",
        message: "Sessão do admin ausente ou expirada. Abra /admin/login e entre de novo.",
      },
      { status: 401 },
    );
  }
  return null;
}

export async function setAdminCookie() {
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
}

export async function clearAdminCookie() {
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

