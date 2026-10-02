"use client";

import { useState, type InputHTMLAttributes } from "react";
import { EyeIcon, EyeOffIcon } from "@/components/ui/Icons";
import { CONTROL_BASE, controlBorder } from "./Field";

type PasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  hasError?: boolean;
};

export function PasswordInput({ hasError = false, className = "", ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <input
        {...props}
        type={visible ? "text" : "password"}
        className={`${CONTROL_BASE} ${controlBorder(hasError)} pr-11 ${className}`}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        className="absolute right-1.5 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded text-slate-300 transition-colors hover:text-white"
      >
        {visible ? <EyeIcon size={18} /> : <EyeOffIcon size={18} />}
      </button>
    </>
  );
}
