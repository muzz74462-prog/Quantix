export type NavLink = { label: string; href: string };

export type FeatureTone = "purple" | "orange" | "blue" | "amber" | "green" | "teal";

export type FeatureIconName =
  | "layout"
  | "tools"
  | "indicators"
  | "support"
  | "flexible"
  | "wallet";

export type Feature = {
  title: string;
  description: string;
  cta: string;
  href: string;
  tone: FeatureTone;
  icon: FeatureIconName;
};

export type FaqItem = { id: string; question: string; answer: string };

export type FooterColumn = { title: string; links: NavLink[] };

export type Candle = { o: number; h: number; l: number; c: number };
