import { NextResponse } from "next/server";
import { ADMIN_COOKIE, checkPassword, getSessionToken } from "@/lib/adminAuth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const password = typeof body?.password === "string" ? body.password : "";

  const token = getSessionToken();
  if (!token) {
    return NextResponse.json({ ok: false, error: "Admin is not configured." }, { status: 500 });
  }

  if (!checkPassword(password)) {
    // Small delay to slow down password guessing.
    await new Promise((r) => setTimeout(r, 800));
    return NextResponse.json({ ok: false, error: "Wrong password." }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}