import { NextResponse } from "next/server";
import { verifyUser } from "@/lib/userStore";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!email.trim() || !password) {
    return NextResponse.json({ ok: false, error: "Email and password are required." }, { status: 400 });
  }

  const result = await verifyUser(email, password);
  if (!result.ok) {
    return NextResponse.json(result, { status: 401 });
  }
  const { user } = result;
  return NextResponse.json({ ok: true, user: { email: user.email, country: user.country, currency: user.currency } });
}
