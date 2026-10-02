import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

/**
 * Minimal server-side "database": a JSON file on disk. Good enough for a prototype
 * account system — not meant for production scale or real financial data.
 */
const DB_PATH = path.join(process.cwd(), "data", "users.json");

export type StoredUser = {
  email: string;
  country: string;
  currency: string;
  salt: string;
  hash: string;
  createdAt: string;
};

async function readAll(): Promise<StoredUser[]> {
  try {
    const raw = await fs.readFile(DB_PATH, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeAll(users: StoredUser[]): Promise<void> {
  await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
  await fs.writeFile(DB_PATH, JSON.stringify(users, null, 2), "utf8");
}

function hashPassword(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 64).toString("hex");
}

export async function findUser(email: string): Promise<StoredUser | null> {
  const users = await readAll();
  const norm = email.trim().toLowerCase();
  return users.find((u) => u.email.toLowerCase() === norm) ?? null;
}

export async function createUser(input: {
  email: string;
  password: string;
  country: string;
  currency: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const users = await readAll();
  const norm = input.email.trim().toLowerCase();
  if (users.some((u) => u.email.toLowerCase() === norm)) {
    return { ok: false, error: "An account with this email already exists." };
  }
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = hashPassword(input.password, salt);
  users.push({
    email: input.email.trim(),
    country: input.country,
    currency: input.currency,
    salt,
    hash,
    createdAt: new Date().toISOString(),
  });
  await writeAll(users);
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
