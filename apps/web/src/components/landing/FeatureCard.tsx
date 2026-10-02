import Link from "next/link";
import type { Feature, FeatureIconName, FeatureTone } from "@/types";
import {
  ArrowRightIcon,
  FlexibleIcon,
  IndicatorsIcon,
  LayoutIcon,
  SupportIcon,
  ToolsIcon,
  WalletIcon,
} from "@/components/ui/Icons";

const ICONS: Record<FeatureIconName, typeof LayoutIcon> = {
  layout: LayoutIcon,
  tools: ToolsIcon,
  indicators: IndicatorsIcon,
  support: SupportIcon,
  flexible: FlexibleIcon,
  wallet: WalletIcon,
};

const TONES: Record<FeatureTone, string> = {
  purple: "bg-violet-500/90",
  orange: "bg-orange-500/90",
  blue: "bg-blue-500/90",
  amber: "bg-amber-500/90",
  green: "bg-emerald-500/90",
  teal: "bg-teal-500/90",
};

export function FeatureCard({ feature }: { feature: Feature }) {
  const Icon = ICONS[feature.icon];
  return (
    <article className="group flex min-h-[220px] flex-col rounded-xl border border-white/[0.05] bg-ink-800 p-6 transition-colors duration-200 hover:border-white/[0.12] hover:bg-ink-700/80">
      <div className={`flex h-9 w-9 items-center justify-center rounded-lg text-white ${TONES[feature.tone]}`}>
        <Icon size={18} />
      </div>
      <h3 className="mt-5 text-[15px] font-bold text-white">{feature.title}</h3>
      <p className="mt-2 text-[13px] leading-relaxed text-slate-400">{feature.description}</p>
      <Link
        href={feature.href}
        className="mt-auto inline-flex items-center gap-1.5 pt-5 text-[13px] font-semibold text-accent transition-colors hover:text-blue-300"
      >
        {feature.cta}
        <ArrowRightIcon size={14} className="transition-transform duration-200 group-hover:translate-x-0.5" />
      </Link>
    </article>
  );
}
