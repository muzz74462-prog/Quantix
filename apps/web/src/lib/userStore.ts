import crypto from "crypto";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

export type StoredUser = {
  email: string;
  country: string;
  currency: string;
  salt: string;
  hash: string;
  createdAt: string;
};

let client: SupabaseClient | null = null;

function db(): SupabaseClient {
  if (client) return client;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }
  client = createClient(url, key, { auth: { persistSession: false } });
  return client;
}

function hashPassword(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 64).toString("hex");
}

type Row = {
  email: string;
  country: string;
  currency: string;
  salt: string;
  hash: string;
  created_at: string;
};

function toUser(r: Row): StoredUser {
  return {
    email: r.email,
    country: r.country,
    currency: r.currency,
    salt: r.salt,
    hash: r.hash,
    createdAt: r.created_at,
  };
}

export async function findUser(email: string): Promise<StoredUser | null> {
  const norm = email.trim().toLowerCase();
  const { data, error } = await db()
    .from("users")
    .select("email,country,currency,salt,hash,created_at")
    .eq("email_norm", norm)
    .maybeSingle();
  if (error) throw error;
  return data ? toUser(data as Row) : null;
}

export async function createUser(input: {
  email: string;
  password: string;
  country: string;
  currency: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const norm = input.email.trim().toLowerCase();
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = hashPassword(input.password, salt);

  const { error } = await db().from("users").insert({
    email: input.email.trim(),
    email_norm: norm,
    country: input.country,
    currency: input.currency,
    salt,
    hash,
  });

  if (error) {
    // 23505 = unique_violation (email already registered)
    if (error.code === "23505") {
      return { ok: false, error: "An account with this email already exists." };
    }
    throw error;
  }
  return { ok: true };
}

export async function verifyUser(
  email: string,
  password: string,
): Promise<{ ok: true; user: StoredUser } | { ok: false; error: string }> {
  const user = await findUser(email);
  if (!user) return { ok: false, error: "No account found with this email." };
  const hash = hashPassword(password, user.salt);
  const a = Buffer.from(hash, "hex");
  const b = Buffer.from(user.hash, "hex");
  const match = a.length === b.length && crypto.timingSafeEqual(a, b);
  if (!match) return { ok: false, error: "Incorrect password." };
  return { ok: true, user };
}