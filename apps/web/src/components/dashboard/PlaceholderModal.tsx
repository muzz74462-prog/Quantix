"use client";

import { useEffect, useRef } from "react";
import { CloseIcon } from "@/components/ui/Icons";

type PlaceholderModalProps = {
  title: string;
  message: string;
  onClose: () => void;
};

/** Generic "this will be connected later" dialog (deposit, withdrawal, nav stubs). */
export function PlaceholderModal({ title, message, onClose }: PlaceholderModalProps) {
  const btn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    btn.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="placeholder-title"
        className="relative w-full max-w-sm rounded-lg border border-white/10 bg-ink-800 p-5 shadow-2xl"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 rounded p-1 text-slate-400 hover:bg-white/5 hover:text-white"
        >
          <CloseIcon size={16} />
        </button>
        <h2 id="placeholder-title" className="pr-6 text-[17px] font-bold text-white">
          {title}
        </h2>
        <p className="mt-2 text-[13px] leading-relaxed text-slate-300">{message}</p>
        <p className="mt-2 text-[12px] leading-relaxed text-slate-500">
          QUANTIX is a front-end prototype. No real funds, payments or trades are involved.
        </p>
        <button
          ref={btn}
          type="button"
          onClick={onClose}
          className="mt-5 inline-flex h-10 w-full items-center justify-center rounded-md bg-brand text-sm font-semibold text-white transition-colors hover:bg-brand-hover"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
