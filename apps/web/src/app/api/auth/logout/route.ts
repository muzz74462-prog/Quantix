import { NextResponse } from "next/server";
import { USER_COOKIE } from "@/lib/userSession";

export const runtime = "nodejs";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(USER_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}
