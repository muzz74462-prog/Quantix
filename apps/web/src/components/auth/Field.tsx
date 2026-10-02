import type { ReactNode } from "react";

type FieldProps = {
  id: string;
  label: string;
  error?: string;
  children: ReactNode;
};

/** Outlined field with the label sitting on the top border. Children render the control. */
export function Field({ id, label, error, children }: FieldProps) {
  return (
    <div>
      <div className="relative">
        {children}
        <label
          htmlFor={id}
          className="pointer-events-none absolute -top-[9px] left-3 bg-ink-800 px-1 text-[11px] leading-none text-slate-400"
        >
          {label}
        </label>
      </div>
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-xs text-down">
          {error}
        </p>
      )}
    </div>
  );
}

/** Shared control styling so every field matches. */
export const CONTROL_BASE =
  "h-[46px] w-full rounded-[3px] border bg-transparent px-3 text-sm text-white placeholder:text-slate-500 outline-none transition-colors focus:border-brand";

export const controlBorder = (hasError: boolean) =>
  hasError ? "border-down" : "border-white/25 hover:border-white/40";
