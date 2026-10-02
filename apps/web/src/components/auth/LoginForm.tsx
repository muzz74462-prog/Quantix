"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRightIcon } from "@/components/ui/Icons";
import { saveDemoUser } from "@/lib/session";
import { CONTROL_BASE, Field, controlBorder } from "./Field";
import { PasswordInput } from "./PasswordInput";

type Errors = Partial<Record<"email" | "password", string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function validate(): Errors {
    const e: Errors = {};
    if (!email.trim()) e.email = "Please enter your email.";
    else if (!EMAIL_RE.test(email.trim())) e.email = "Please enter a valid email address.";
    if (!password) e.password = "Please enter your password.";
    return e;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    setServerError(null);
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setServerError(data.error ?? "Could not log in.");
        return;
      }
      saveDemoUser({ email: data.user.email, country: data.user.country, currency: data.user.currency });
      router.push("/dashboard");
    } catch {
      setServerError("Could not reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-md border border-white/[0.07] bg-ink-800 shadow-2xl shadow-black/30">
      <div className="flex justify-center border-b border-white/10 px-4 py-3">
        <nav aria-label="Account" className="inline-flex rounded-[3px] bg-ink-600/60 p-[3px]">
          <Link
            href="/login"
            aria-current="page"
            className="inline-flex h-9 min-w-[88px] items-center justify-center rounded-[3px] bg-ink-800 px-4 text-[13px] font-bold text-white"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="inline-flex h-9 min-w-[110px] items-center justify-center rounded-[3px] px-4 text-[13px] font-bold text-slate-100 transition-colors hover:bg-white/5"
          >
            Registration
          </Link>
        </nav>
      </div>

      <form onSubmit={onSubmit} noValidate className="space-y-[22px] px-5 pb-8 pt-8 sm:px-10">
        <Field id="email" label="Email" error={errors.email}>
          <input
            id="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            value={email}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
            onChange={(e) => {
              setEmail(e.target.value);
              if (submitted) setErrors(validate());
            }}
            className={`${CONTROL_BASE} ${controlBorder(!!errors.email)}`}
          />
        </Field>

        <Field id="password" label="Password" error={errors.password}>
          <PasswordInput
            id="password"
            autoComplete="current-password"
            value={password}
            hasError={!!errors.password}
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? "password-error" : undefined}
            onChange={(e) => {
              setPassword(e.target.value);
              if (submitted) setErrors(validate());
            }}
          />
        </Field>

        {serverError && (
          <p role="alert" className="rounded-[3px] border border-down/40 bg-down/10 px-3 py-2.5 text-center text-[13px] text-down">
            {serverError}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="group inline-flex h-12 w-full items-center justify-center gap-2.5 rounded-[3px] bg-brand text-[15px] font-bold text-white shadow-[0_6px_18px_-6px_rgba(18,180,95,0.55)] transition-all duration-150 hover:-translate-y-px hover:bg-brand-hover hover:shadow-[0_10px_24px_-6px_rgba(18,180,95,0.65)] active:translate-y-0 disabled:opacity-60"
        >
          {loading ? "Logging in…" : "Log in"}
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/20 transition-transform duration-150 group-hover:translate-x-0.5">
            <ArrowRightIcon size={14} strokeWidth={2.2} />
          </span>
        </button>

        <p className="text-center text-[13px] text-slate-400">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-semibold text-accent hover:underline">
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
}
