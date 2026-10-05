"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const INPUT =
  "mt-1.5 h-11 w-full rounded-md bg-ink-800 px-3 text-[14px] text-white outline-none ring-1 ring-white/10 focus:ring-brand";

export function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!email || !password || busy) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.ok) {
        router.push("/admin");
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
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand">Quantix</p>
      <h1 className="mt-1 text-xl font-extrabold text-white">Admin sign in</h1>
      <p className="mt-1 text-[12px] text-slate-500">Authorized administrators only. All activity is logged.</p>

      <label className="mt-5 block text-[12px] font-semibold text-slate-300">
        Email
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="username"
          className={INPUT}
        />
      </label>
      <label className="mt-3 block text-[12px] font-semibold text-slate-300">
        Password
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") void submit();
          }}
          autoComplete="current-password"
          className={INPUT}
        />
      </label>
      {error && <p role="alert" className="mt-3 text-[13px] text-down">{error}</p>}
      <button
        type="button"
        onClick={() => void submit()}
        disabled={busy || !email || !password}
        className="mt-5 h-11 w-full rounded-md bg-brand text-[14px] font-bold text-white transition-colors hover:bg-brand-hover disabled:opacity-50"
      >
        {busy ? "Checking…" : "Sign in"}
      </button>
    </div>
  );
}

export function LogoutButton({ className }: { className?: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={async () => {
        await fetch("/api/admin/logout", { method: "POST" });
        router.push("/admin/login");
        router.refresh();
      }}
      className={className ?? "h-9 rounded-md bg-ink-700 px-4 text-[13px] font-bold text-white hover:bg-ink-600"}
    >
      Sign out
    </button>
  );
}
