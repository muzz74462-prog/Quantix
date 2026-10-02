"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { ChevronDownIcon, GlobeIcon } from "@/components/ui/Icons";
import { COUNTRIES } from "@/lib/countries";
import { CONTROL_BASE, controlBorder } from "./Field";

type CountrySelectProps = {
  id: string;
  value: string;
  onChange: (country: string) => void;
  hasError?: boolean;
};

/** Searchable combobox. Typing filters the list; arrow keys + Enter select. */
export function CountrySelect({ id, value, onChange, hasError = false }: CountrySelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listId = `${id}-listbox`;

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? COUNTRIES.filter((c) => c.toLowerCase().includes(q)) : COUNTRIES;
  }, [query]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) close();
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    listRef.current?.children[active]?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  function close() {
    setOpen(false);
    setQuery("");
  }

  function openList() {
    if (open) return;
    setOpen(true);
    setActive(Math.max(0, COUNTRIES.indexOf(value)));
  }

  function select(country: string) {
    onChange(country);
    close();
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!open) return openList();
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && open) {
      e.preventDefault();
      if (results[active]) select(results[active]);
    } else if (e.key === "Escape" || e.key === "Tab") {
      if (open) close();
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
        <GlobeIcon size={16} />
      </span>
      <input
        id={id}
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-invalid={hasError}
        autoComplete="off"
        placeholder="Search"
        value={open ? query : value}
        onFocus={openList}
        onClick={openList}
        onChange={(e) => {
          setQuery(e.target.value);
          setActive(0);
          if (!open) setOpen(true);
        }}
        onKeyDown={onKeyDown}
        className={`${CONTROL_BASE} ${controlBorder(hasError)} pl-9 pr-9 text-[15px]`}
      />
      <button
        type="button"
        tabIndex={-1}
        aria-label={open ? "Close country list" : "Open country list"}
        onClick={() => (open ? close() : openList())}
        className="absolute right-1.5 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded text-white"
      >
        <ChevronDownIcon size={16} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <ul
          id={listId}
          ref={listRef}
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+4px)] z-30 max-h-60 overflow-y-auto rounded-md border border-white/15 bg-ink-700 py-1 shadow-xl shadow-black/40"
        >
          {results.length === 0 && (
            <li className="px-3 py-2.5 text-sm text-slate-400">No countries found</li>
          )}
          {results.map((c, i) => (
            <li
              key={c}
              role="option"
              aria-selected={c === value}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => select(c)}
              onMouseEnter={() => setActive(i)}
              className={`cursor-pointer px-3 py-2 text-sm ${
                i === active ? "bg-white/10 text-white" : "text-slate-200"
              } ${c === value ? "font-semibold" : ""}`}
            >
              {c}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
