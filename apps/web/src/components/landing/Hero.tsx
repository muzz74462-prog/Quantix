import { ButtonLink } from "@/components/ui/Button";

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden">
      {/* depth: soft blue wash fading into the page background */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(35,92,150,0.38),transparent_70%),linear-gradient(to_bottom,#12263a_0%,#141a28_100%)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 opacity-[0.07] [background-image:linear-gradient(rgba(255,255,255,.6)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.6)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:linear-gradient(to_bottom,black,transparent_75%)]"
      />

      <div className="mx-auto max-w-[1200px] px-4 pb-14 pt-16 text-center sm:px-6 sm:pt-20 md:pb-16 md:pt-24">
        <div className="animate-hero-in">
          <h1 className="mx-auto max-w-3xl text-[34px] font-bold leading-[1.12] tracking-tight text-white sm:text-5xl md:text-[56px]">
            Precision tools for
            <br />
            confident trading
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-slate-300 sm:text-base">
            Open a free demo account with 10,000 USD in virtual funds and practise on live-style charts before you risk real money.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-5">
            <ButtonLink href="#" size="lg" className="w-full sm:w-auto">
              Create a free account
            </ButtonLink>
            <p className="max-w-[210px] text-left text-[11px] leading-snug text-slate-400 max-sm:max-w-xs max-sm:text-center">
              Real-money trading will require a minimum deposit. Trading involves risk of loss.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
