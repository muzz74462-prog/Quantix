"use client";

import { useState } from "react";
import { Container } from "@/components/ui/Container";
import { PlusIcon } from "@/components/ui/Icons";
import { FAQ_ITEMS } from "@/lib/content";

export function FAQ() {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <section id="faq" aria-labelledby="faq-title" className="pb-10 pt-4 md:pb-14">
      <Container>
        <div className="text-center">
          <h2 id="faq-title" className="text-3xl font-bold text-white md:text-4xl">
            Frequently asked questions
          </h2>
          <p className="mt-3 text-sm text-slate-400">See the most common questions from new traders answered here.</p>
        </div>

        <div className="mx-auto mt-10 flex max-w-[720px] flex-col gap-3">
          {FAQ_ITEMS.map((item) => {
            const open = openId === item.id;
            return (
              <div key={item.id} className="overflow-hidden rounded-lg bg-ink-800 transition-colors hover:bg-ink-700/70">
                <h3>
                  <button
                    type="button"
                    id={`faq-btn-${item.id}`}
                    aria-expanded={open}
                    aria-controls={`faq-panel-${item.id}`}
                    onClick={() => setOpenId(open ? null : item.id)}
                    className="flex min-h-[52px] w-full items-center justify-between gap-4 px-5 py-3 text-left text-[13px] font-bold text-white"
                  >
                    {item.question}
                    <PlusIcon
                      size={16}
                      className={`shrink-0 text-accent transition-transform duration-200 ${open ? "rotate-45" : ""}`}
                    />
                  </button>
                </h3>
                <div
                  id={`faq-panel-${item.id}`}
                  role="region"
                  aria-labelledby={`faq-btn-${item.id}`}
                  className={`grid transition-[grid-template-rows] duration-300 ease-out ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
                >
                  <div className="overflow-hidden">
                    <p className="px-5 pb-4 text-[13px] leading-relaxed text-slate-300">{item.answer}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
