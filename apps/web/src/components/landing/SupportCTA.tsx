import Link from "next/link";
import { Container } from "@/components/ui/Container";

/** Original abstract support visual: a speech-bubble pair with a question mark. */
function SupportVisual() {
  return (
    <svg viewBox="0 0 120 100" className="h-24 w-28 shrink-0" aria-hidden="true">
      <ellipse cx="60" cy="92" rx="38" ry="5" fill="#000" opacity="0.25" />
      <rect x="14" y="14" width="64" height="46" rx="12" fill="#252d42" stroke="#313a54" />
      <path d="M32 60l-6 14 18-14z" fill="#252d42" stroke="#313a54" />
      <text x="46" y="48" fontSize="30" fontWeight="700" fill="#3b8bff" textAnchor="middle">?</text>
      <rect x="62" y="40" width="46" height="34" rx="10" fill="#12b45f" />
      <path d="M96 74l6 10-16-10z" fill="#12b45f" />
      <circle cx="75" cy="57" r="3" fill="#fff" />
      <circle cx="85" cy="57" r="3" fill="#fff" />
      <circle cx="95" cy="57" r="3" fill="#fff" />
    </svg>
  );
}

export function SupportCTA() {
  return (
    <section aria-labelledby="support-title" className="pb-14 md:pb-20">
      <Container>
        <div className="mx-auto flex max-w-[720px] justify-end">
          <div className="flex w-full items-center gap-4 rounded-xl border border-accent/20 bg-accent-soft px-5 py-4 sm:w-auto sm:max-w-md">
            <div>
              <h2 id="support-title" className="text-sm font-bold text-white">Still have questions?</h2>
              <p className="mt-1 text-xs leading-relaxed text-slate-300">
                Browse every answer in the{" "}
                <Link href="#faq" className="font-semibold text-accent hover:underline">FAQ section</Link>{" "}
                or{" "}
                <Link href="#" className="font-semibold text-accent hover:underline">contact support</Link>.
              </p>
            </div>
            <SupportVisual />
          </div>
        </div>
      </Container>
    </section>
  );
}
