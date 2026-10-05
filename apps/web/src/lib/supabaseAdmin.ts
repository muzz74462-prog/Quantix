/**
 * Service-role Supabase client. SERVER ONLY.
 * Never import this file from a "use client" component or from anything a client component imports:
 * the service-role key bypasses RLS and must never reach the browser. (The key is read from a
 * non-NEXT_PUBLIC_ env var, so Next.js would not ship it to the client anyway.)
 */
import { createClient, SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

export function db(): SupabaseClient {
  if (client) return client;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  return client;
}
