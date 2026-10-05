// Creates (or resets the password of) an admin account. Run from apps/web:
//   node scripts/create-admin.mjs
// Reads SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY from apps/web/.env.local or the environment.
// The password is typed hidden and is never stored in plain text or written to disk.
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const here = path.dirname(fileURLToPath(import.meta.url));
const envFile = path.join(here, "..", ".env.local");
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}
const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

function ask(question, hidden = false) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    if (hidden) {
      rl._writeToOutput = (s) => {
        if (s.includes(question)) rl.output.write(s);
      };
    }
    rl.question(question, (answer) => {
      rl.close();
      if (hidden) process.stdout.write("\n");
      resolve(answer);
    });
  });
}

const email = (await ask("Admin email: ")).trim();
const roleIn = (await ask("Role [super_admin / admin / support] (default admin): ")).trim() || "admin";
const password = await ask("Password (min 12 chars): ", true);
const confirm = await ask("Repeat password: ", true);

if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error("Invalid email.");
if (!["super_admin", "admin", "support"].includes(roleIn)) throw new Error("Invalid role.");
if (password.length < 12) throw new Error("Password must be at least 12 characters.");
if (password !== confirm) throw new Error("Passwords do not match.");

const salt = crypto.randomBytes(16).toString("hex");
const hash = crypto.scryptSync(password, salt, 64).toString("hex");
const db = createClient(url, key, { auth: { persistSession: false } });

const { error } = await db.from("admin_users").upsert(
  {
    email,
    email_norm: email.toLowerCase(),
    password_salt: salt,
    password_hash: hash,
    role: roleIn,
    is_active: true,
    failed_attempts: 0,
    locked_until: null,
  },
  { onConflict: "email_norm" },
);
if (error) {
  console.error("Failed:", error.message);
  process.exit(1);
}
console.log(`Admin ${email} saved with role ${roleIn}. Sign in at /admin/login.`);
