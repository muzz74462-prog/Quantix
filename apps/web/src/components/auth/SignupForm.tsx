"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRightIcon, CheckIcon, ChevronDownIcon } from "@/components/ui/Icons";
import { CURRENCIES } from "@/lib/countries";
import { saveDemoUser } from "@/lib/session";
import { CountrySelect } from "./CountrySelect";
import { CONTROL_BASE, Field, controlBorder } from "./Field";
import { PasswordInput } from "./PasswordInput";

type Errors = Partial<Record<"country" | "email" | "password" | "age" | "tax", string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(v: {
  country: string;
  email: string;
  password: string;
  age: boolean;
  tax: boolean;
}): Errors {
  const e: Errors = {};
  if (!v.country) e.country = "Please select your country or region.";
  if (!v.email.trim()) e.email = "Please enter your email.";
  else if (!EMAIL_RE.test(v.email.trim())) e.email = "Please enter a valid email address.";
  if (!v.password) e.password = "Please enter a password.";
  else if (v.password.length < 8) e.password = "Use at least 8 characters.";
  if (!v.age) e.age = "You must confirm this to continue.";
  if (!v.tax) e.tax = "You must confirm this to continue.";
  return e;
}

function Checkbox({
  id,
  checked,
  onChange,
  error,
  children,
}: {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="flex cursor-pointer items-start gap-3">
        <span className="relative mt-0.5 shrink-0">
          <input
            id={id}
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            aria-invalid={!!error}
            className="peer sr-only"
          />
          <span
            className={`flex h-[22px] w-[22px] items-center justify-center rounded-[3px] border bg-transparent text-white transition-colors peer-checked:border-brand peer-checked:bg-brand peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent ${
              error ? "border-down" : "border-white/40 hover:border-white/70"
            }`}
          >
            <CheckIcon size={14} strokeWidth={2.6} className={checked ? "opacity-100" : "opacity-0"} />
          </span>
        </span>
        <span className="text-[13px] leading-snug text-slate-100">{children}</span>
      </label>
      {error && (
        <p role="alert" className="mt-1.5 pl-[34px] text-xs text-down">
          {error}
        </p>
      )}
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
      <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
      <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
    </svg>
  );
}

export function SignupForm() {
  const router = useRouter();
  const [country, setCountry] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [promo, setPromo] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [age, setAge] = useState(false);
  const [tax, setTax] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);
  const [done, setDone] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function revalidate(next: Partial<{ country: string; email: string; password: string; age: boolean; tax: boolean }>) {
    if (!submitted) return;
    setErrors(validate({ country, email, password, age, tax, ...next }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    setServerError(null);
    const found = validate({ country, email, password, age, tax });
    setErrors(found);
    const ok = Object.keys(found).length === 0;
    if (!ok) return;

    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, country, currency }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setServerError(data.error ?? "Could not create your account.");
        return;
      }
      saveDemoUser({ email: data.user.email, country: data.user.country, currency: data.user.currency });
      setDone(true);
      router.push("/dashboard");
    } catch {
      setServerError("Could not reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-md border border-white/[0.07] bg-ink-800 shadow-2xl shadow-black/30">
      {/* Login / Registration segmented control */}
      <div className="flex justify-center border-b border-white/10 px-4 py-3">
        <nav aria-label="Account" className="inline-flex rounded-[3px] bg-ink-600/60 p-[3px]">
          <Link
            href="/login"
            className="inline-flex h-9 min-w-[88px] items-center justify-center rounded-[3px] px-4 text-[13px] font-bold text-slate-100 transition-colors hover:bg-white/5"
          >
            Login
          </Link>
          <Link
            href="/signup"
            aria-current="page"
            className="inline-flex h-9 min-w-[110px] items-center justify-center rounded-[3px] bg-ink-800 px-4 text-[13px] font-bold text-white"
          >
            Registration
          </Link>
        </nav>
      </div>

      <form onSubmit={onSubmit} noValidate className="space-y-[22px] px-5 pb-8 pt-8 sm:px-10">
        <Field id="country" label="Country / Region of residence" error={errors.country}>
          <CountrySelect
            id="country"
            value={country}
            hasError={!!errors.country}
            onChange={(c) => {
              setCountry(c);
              revalidate({ country: c });
            }}
          />
        </Field>

        <Field id="currency" label="Currency">
          <select
            id="currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className={`${CONTROL_BASE} ${controlBorder(false)} cursor-pointer appearance-none pr-9 [&>option]:bg-ink-700`}
          >
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white">
            <ChevronDownIcon size={16} />
          </span>
        </Field>

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
              revalidate({ email: e.target.value });
            }}
            className={`${CONTROL_BASE} ${controlBorder(!!errors.email)}`}
          />
        </Field>

        <Field id="password" label="Password" error={errors.password}>
          <PasswordInput
            id="password"
            autoComplete="new-password"
            value={password}
            hasError={!!errors.password}
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? "password-error" : undefined}
            onChange={(e) => {
              setPassword(e.target.value);
              revalidate({ password: e.target.value });
            }}
          />
        </Field>

        <Field id="promo" label="Promo code (optional)">
          <input
            id="promo"
            type="text"
            autoComplete="off"
            value={promo}
            onChange={(e) => {
              setPromo(e.target.value);
              setPromoApplied(false);
            }}
            className={`${CONTROL_BASE} ${controlBorder(false)} pr-20`}
          />
          <button
            type="button"
            disabled={!promo.trim() || promoApplied}
            onClick={() => setPromoApplied(true)}
            className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold transition-colors ${
              promoApplied
                ? "text-brand"
                : "text-accent hover:text-white disabled:text-accent/40 disabled:hover:text-accent/40"
            }`}
          >
            {promoApplied ? "Applied" : "Apply"}
          </button>
        </Field>

        <div className="space-y-5 pt-1">
          <Checkbox
            id="age"
            checked={age}
            error={errors.age}
            onChange={(c) => {
              setAge(c);
              revalidate({ age: c });
            }}
          >
            I confirm that I am 18 years old or older and accept{" "}
            <Link href="#" className="font-semibold text-accent hover:underline">
              Service Agreement
            </Link>
            .
          </Checkbox>
          <Checkbox
            id="tax"
            checked={tax}
            error={errors.tax}
            onChange={(c) => {
              setTax(c);
              revalidate({ tax: c });
            }}
          >
            <span className="text-slate-300">
              I declare and confirm that I am not a citizen or resident of the US for tax purposes.
            </span>
          </Checkbox>
        </div>

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
          {loading ? "Creating account…" : "Create account"}
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/20 transition-transform duration-150 group-hover:translate-x-0.5">
            <ArrowRightIcon size={14} strokeWidth={2.2} />
          </span>
        </button>

        {done && (
          <p
            role="status"
            className="rounded-[3px] border border-brand/40 bg-brand-soft px-3 py-2.5 text-center text-[13px] text-slate-100"
          >
            Account created. Opening your dashboard…
          </p>
        )}

        <div className="flex items-center gap-4 pt-1" aria-hidden="true">
          <span className="h-px flex-1 bg-white/10" />
          <span className="text-[13px] text-slate-400">Sign in via</span>
          <span className="h-px flex-1 bg-white/10" />
        </div>

        <div className="flex justify-center">
          <button
            type="button"
            aria-label="Sign in with Google"
            className="inline-flex h-11 w-16 items-center justify-center rounded-md border border-white/20 bg-transparent transition-colors hover:border-white/40 hover:bg-white/5"
          >
            <GoogleIcon />
          </button>
        </div>
      </form>
    </div>
  );
}
