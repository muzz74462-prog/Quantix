import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/ui/Logo";
import { AtIcon, MonitorIcon, PhoneIcon, PlayIcon, SendIcon } from "@/components/ui/Icons";
import { FOOTER_COLUMNS } from "@/lib/content";

const APPS = [
  { label: "Android app", icon: PlayIcon },
  { label: "iOS app", icon: PhoneIcon },
  { label: "Windows app", icon: MonitorIcon },
  { label: "macOS app", icon: MonitorIcon },
];

const SOCIALS = [
  { label: "Messaging channel", icon: SendIcon },
  { label: "Social profile", icon: AtIcon },
];

export function Footer() {
  return (
    <footer id="about" className="pb-6">
      <Container>
        <div className="grid gap-10 rounded-2xl border border-white/[0.04] bg-ink-850 p-6 sm:p-8 md:grid-cols-[1.1fr_repeat(3,1fr)_1.2fr] md:gap-6 md:p-10">
          <div>
            <Logo />
            <p className="mt-3 max-w-[200px] text-xs leading-relaxed text-slate-500">
              A demonstration trading interface. Placeholder brand for Phase 1.
            </p>
          </div>

          {FOOTER_COLUMNS.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h2 className="text-xs font-bold text-white">{col.title}</h2>
              <ul className="mt-4 space-y-3">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-xs text-slate-400 transition-colors hover:text-white">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div className="space-y-6">
            <div>
              <h2 className="text-[11px] text-slate-400">Download the app (coming soon)</h2>
              <ul className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-1">
                {APPS.map(({ label, icon: Icon }) => (
                  <li key={label}>
                    <span
                      aria-disabled="true"
                      className="flex h-9 items-center gap-2 rounded-md border border-white/10 bg-ink-950 px-3 text-xs font-semibold text-slate-200"
                    >
                      <Icon size={16} /> {label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-[11px] text-slate-400">Follow us on social media</h2>
              <ul className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-1">
                {SOCIALS.map(({ label, icon: Icon }) => (
                  <li key={label}>
                    <Link
                      href="#"
                      className="flex h-9 items-center gap-2 rounded-md bg-accent-soft px-3 text-xs font-semibold text-accent transition-colors hover:bg-accent/20"
                    >
                      <Icon size={15} /> {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
}
