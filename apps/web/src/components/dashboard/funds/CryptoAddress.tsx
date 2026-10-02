"use client";

import { useEffect, useRef, useState } from "react";

async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through to the legacy path */
  }
  try {
    const el = document.createElement("textarea");
    el.value = text;
    el.setAttribute("readonly", "");
    el.style.position = "fixed";
    el.style.opacity = "0";
    document.body.appendChild(el);
    el.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(el);
    return ok;
  } catch {
    return false;
  }
}

/** Network label + address box + "Copy address" button. */
export function CryptoAddress({ network, address }: { network: string; address: string }) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const handleCopy = async () => {
    const ok = await copyText(address);
    setCopied(ok);
    setFailed(!ok);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setCopied(false);
      setFailed(false);
    }, 2000);
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[13px] font-medium text-slate-400">Network</p>
        <p className="mt-1 text-[15px] font-semibold text-white">{network}</p>
      </div>
      <div>
        <p className="text-[13px] font-medium text-slate-400">Deposit address</p>
        <div className="mt-1.5 flex flex-col gap-3 rounded-lg border border-white/10 bg-ink-950 p-3 sm:flex-row sm:items-center">
          <code className="block min-w-0 flex-1 select-all break-all font-mono text-[14px] leading-relaxed text-white">
            {address}
          </code>
          <button
            type="button"
            onClick={handleCopy}
            aria-live="polite"
            className={`flex h-10 w-full shrink-0 items-center justify-center rounded-md px-4 text-[13px] font-bold transition-colors sm:w-auto sm:min-w-[140px] ${
              copied ? "bg-brand/20 text-brand" : "bg-brand text-white hover:bg-brand-hover"
            }`}
          >
            {copied ? "Address copied" : "Copy address"}
          </button>
        </div>
        {failed && (
          <p role="alert" className="mt-2 text-[12px] text-down">
            Could not copy automatically. Select the address above and copy it manually.
          </p>
        )}
      </div>
    </div>
  );
}
