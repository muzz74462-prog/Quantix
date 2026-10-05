import { NextResponse } from "next/server";
import { createUser } from "@/lib/userStore";
import { USER_COOKIE, USER_SESSION_DAYS, createUserToken, lookupUserId } from "@/lib/userSession";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email : "";
  const password = typeof body?.password === "string" ? body.password : "";
  const country = typeof body?.country === "string" ? body.country : "";
  const currency = typeof body?.currency === "string" ? body.currency : "USD";

  if (!email.trim() || !password) {
    return NextResponse.json({ ok: false, error: "Email and password are required." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ ok: false, error: "Use at least 8 characters." }, { status: 400 });
  }

  try {
    const result = await createUser({ email, password, country, currency });
    if (!result.ok) {
      return NextResponse.json(result, { status: 409 });
    }
    const res = NextResponse.json({ ok: true, user: { email: email.trim(), country, currency } });

    // Additive: signed session cookie so the new user's balance can be served. Never breaks signup.
    try {
      const id = await lookupUserId(email);
      const token = id ? createUserToken(id) : null;
      if (token) {
        res.cookies.set(USER_COOKIE, token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: USER_SESSION_DAYS * 86400,
        });
      }
    } catch (e) {
      console.error("session cookie skipped:", e);
    }
    return res;
  } catch (err) {
    console.error("signup failed:", err);
    return NextResponse.json(
      { ok: false, error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
