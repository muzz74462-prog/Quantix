/**
 * Minimal signed session for normal users (SERVER ONLY).
 * Before this, login only stored the user's email in the browser's sessionStorage, so the server could not
 * know who was asking for a balance. This adds an HttpOnly, HMAC-signed cookie holding the user's id.
 * Needs USER_SESSION_SECRET (>= 32 random chars). If it is missing, login still works and simply sets no cookie.
 */
import crypto from "crypto";
import { cookies } from "next/headers";
import { db } from "@/lib/supabaseAdmin";

export const USER_COOKIE = "qx_session";
export const USER_SESSION_DAYS = 7;

function secret(): string | null {
  const s = process.env.USER_SESSION_SECRET;
  return s && s.length >= 32 ? s : null;
}

const sign = (payload: string, s: string) => crypto.createHmac("sha256", s).update(payload).digest("base64url");

export function createUserToken(userId: string): string | null {
  const s = secret();
  if (!s) return null;
  const exp = Math.floor(Date.now() / 1000) + USER_SESSION_DAYS * 86400;
  const payload = `${userId}.${exp}`;
  return `${payload}.${sign(payload, s)}`;
}

export function readUserId(): string | null {
  const s = secret();
  const token = cookies().get(USER_COOKIE)?.value;
  if (!s || !token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [id, exp, sig] = parts;
  const expected = sign(`${id}.${exp}`, s);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  if (!Number.isFinite(Number(exp)) || Number(exp) < Date.now() / 1000) return null;
  return id;
}

export async function lookupUserId(email: string): Promise<string | null> {
  const { data } = await db().from("users").select("id").eq("email_norm", email.trim().toLowerCase()).maybeSingle();
  return (data as { id: string } | null)?.id ?? null;
}
