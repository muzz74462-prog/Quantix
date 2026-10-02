import { Navbar } from "@/components/navbar/Navbar";
import { Hero } from "@/components/landing/Hero";
import { TradingPreview } from "@/components/landing/TradingPreview";
import { Features } from "@/components/landing/Features";
import { FAQ } from "@/components/landing/FAQ";
import { SupportCTA } from "@/components/landing/SupportCTA";
import { Footer } from "@/components/footer/Footer";
import { LegalFooter } from "@/components/footer/LegalFooter";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main id="main">
        <Hero />
        <TradingPreview />
        <Features />
        <FAQ />
        <SupportCTA />
      </main>
      <Footer />
      <LegalFooter />
    </>
  );
}
