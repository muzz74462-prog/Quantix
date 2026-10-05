"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!password || busy) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.ok) {
        router.refresh();
      } else {
        setError(data?.error ?? "Login failed.");
      }
    } catch {
      setError("Could not reach the server.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto mt-24 w-full max-w-sm rounded-xl border border-white/10 bg-ink-900 p-6">
      <h1 className="text-lg font-bold text-white">Admin login</h1>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") void submit();
        }}
        placeholder="Admin password"
        autoComplete="current-password"
        className="mt-4 h-11 w-full rounded-md bg-ink-800 px-3 text-[14px] text-white outline-none ring-1 ring-white/10 focus:ring-brand"
      />
      {error && <p className="mt-2 text-[13px] text-down">{error}</p>}
      <button
        type="button"
        onClick={() => void submit()}
        disabled={busy || !password}
        className="mt-4 h-11 w-full rounded-md bg-brand text-[14px] font-bold text-white transition-colors hover:bg-brand-hover disabled:opacity-50"
      >
        {busy ? "Checking…" : "Login"}
      </button>
    </div>
  );
}

export function LogoutButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={async () => {
        await fetch("/api/admin/logout", { method: "POST" });
        router.refresh();
      }}
      className="h-9 rounded-md bg-ink-700 px-4 text-[13px] font-bold text-white hover:bg-ink-600"
    >
      Logout
    </button>
  );
}