import type { FaqItem, Feature, FooterColumn, NavLink } from "@/types";

export const NAV_LINKS: NavLink[] = [
  { label: "Demo account", href: "/#platform" },
  { label: "About us", href: "/#about" },
  { label: "FAQ", href: "/#faq" },
  { label: "Blog", href: "#" },
];

export const FEATURES: Feature[] = [
  {
    title: "User-friendly interface",
    description:
      "A clean workspace puts charts, instruments and your open positions in one view, so nothing gets in the way of a decision.",
    cta: "Sign up",
    href: "#",
    tone: "purple",
    icon: "layout",
  },
  {
    title: "Advanced market tools",
    description:
      "Drawing tools, multiple chart types and adjustable timeframes help you study price action the way you prefer.",
    cta: "Explore tools",
    href: "#",
    tone: "orange",
    icon: "tools",
  },
  {
    title: "Trading indicators",
    description:
      "Add trend, momentum and volatility indicators to any chart and test how they behave on a demo account first.",
    cta: "Browse indicators",
    href: "#",
    tone: "blue",
    icon: "indicators",
  },
  {
    title: "Support 24/7",
    description:
      "Our support team is available around the clock to help with account, platform and payment questions.",
    cta: "Contact support",
    href: "#",
    tone: "amber",
    icon: "support",
  },
  {
    title: "Flexible trading experience",
    description:
      "Choose your own trade size and expiry, and switch between desktop and mobile without losing your layout.",
    cta: "Try the demo",
    href: "#platform",
    tone: "green",
    icon: "flexible",
  },
  {
    title: "Deposits and withdrawals",
    description:
      "Several payment methods are planned. Available options and limits will be listed here before launch.",
    cta: "Payment options",
    href: "#",
    tone: "teal",
    icon: "wallet",
  },
];

// Placeholder answers: replace with reviewed copy before launch.
export const FAQ_ITEMS: FaqItem[] = [
  {
    id: "start",
    question: "How do I start trading?",
    answer:
      "Create a free account, open the demo mode and practise with virtual funds. When you feel ready, you can fund a real account. Trading involves risk and you can lose your capital.",
  },
  {
    id: "how",
    question: "How does the platform work?",
    answer:
      "You pick an instrument, set an amount and an expiry time, and then choose whether you expect the price to finish higher or lower. Results are shown in your open and closed trades lists.",
  },
  {
    id: "withdraw",
    question: "How long do withdrawals take?",
    answer:
      "Placeholder: processing times will depend on the payment method and on identity verification. Final timings will be published before launch.",
  },
  {
    id: "mobile",
    question: "Can I trade from my phone?",
    answer:
      "Yes. The platform is designed to work in a mobile browser, and dedicated apps are planned. Your account and settings stay in sync across devices.",
  },
  {
    id: "deposit",
    question: "What is the minimum deposit?",
    answer:
      "Placeholder: the minimum deposit will be confirmed when payments are introduced. The demo account is free and needs no deposit.",
  },
  {
    id: "fees",
    question: "Are there any deposit or withdrawal fees?",
    answer:
      "Placeholder: fee details will depend on the payment provider and will be shown before you confirm any transaction.",
  },
];

export const FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: "FAQ",
    links: [
      { label: "General questions", href: "#faq" },
      { label: "Financial questions", href: "#faq" },
      { label: "Verification", href: "#faq" },
    ],
  },
  {
    title: "About us",
    links: [
      { label: "About us", href: "/#about" },
      { label: "Contact", href: "#" },
      { label: "Blog", href: "#" },
    ],
  },
  {
    title: "More",
    links: [
      { label: "Demo account", href: "/#platform" },
      { label: "Affiliate program", href: "#" },
    ],
  },
];

export const LEGAL_LINKS: NavLink[] = [
  { label: "Regulations", href: "#" },
  { label: "Privacy policy", href: "#" },
  { label: "Terms and agreements", href: "#" },
  { label: "Risk disclosure", href: "#" },
  { label: "Rules of trading operations", href: "#" },
  { label: "Non-trading operations", href: "#" },
  { label: "Payment policy", href: "#" },
];
