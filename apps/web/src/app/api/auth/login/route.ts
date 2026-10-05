import { NextResponse } from "next/server";
import { verifyUser } from "@/lib/userStore";
import { USER_COOKIE, USER_SESSION_DAYS, createUserToken, lookupUserId } from "@/lib/userSession";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!email.trim() || !password) {
    return NextResponse.json({ ok: false, error: "Email and password are required." }, { status: 400 });
  }

  try {
    const result = await verifyUser(email, password);
    if (!result.ok) {
      return NextResponse.json(result, { status: 401 });
    }
    const { user } = result;
    const res = NextResponse.json({ ok: true, user: { email: user.email, country: user.country, currency: user.currency } });

    // Additive: attach a signed session cookie so the server can serve this user's balance.
    // Failure here must never break login.
    try {
      const id = await lookupUserId(user.email);
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
    console.error("login failed:", err);
    return NextResponse.json(
      { ok: false, error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
