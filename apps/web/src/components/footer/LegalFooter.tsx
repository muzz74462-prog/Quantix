import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { LEGAL_LINKS } from "@/lib/content";

export function LegalFooter() {
  return (
    <div className="bg-ink-950 py-10">
      <Container>
        <div className="grid gap-8 md:grid-cols-[200px_1fr]">
          <nav aria-label="Legal">
            <ul className="space-y-2.5">
              {LEGAL_LINKS.map((l, i) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className={`text-[11px] transition-colors hover:text-white ${i === 0 ? "font-bold text-white" : "text-slate-400"}`}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="max-w-3xl space-y-4 text-[11px] leading-relaxed text-slate-500">
            <p>
              Placeholder legal text. QUANTIX is a demonstration project. It is not licensed, regulated or authorized by any financial regulator, and nothing on this page is an offer or solicitation.
            </p>
            <p>
              Risk warning: trading leveraged and short-term products carries a high level of risk and can result in the loss of your entire invested capital. Only trade with money you can afford to lose, and make sure you understand the risks involved. Past performance is not a guarantee of future results. Seek independent advice if necessary.
            </p>
            <p>The interface and figures shown on this page are sample data for illustration only.</p>
            <p>© {new Date().getFullYear()} QUANTIX. All rights reserved.</p>
          </div>
        </div>
      </Container>
    </div>
  );
}
