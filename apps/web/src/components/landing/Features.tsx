import { Container } from "@/components/ui/Container";
import { FEATURES } from "@/lib/content";
import { FeatureCard } from "./FeatureCard";

export function Features() {
  return (
    <section id="features" aria-labelledby="features-title" className="pb-16 md:pb-24">
      <Container>
        <div className="text-center">
          <h2 id="features-title" className="text-3xl font-bold text-white md:text-4xl">
            Features of the platform
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm text-slate-400">
            We keep improving the platform so trading stays comfortable, clear and well supported.
          </p>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <FeatureCard key={f.title} feature={f} />
          ))}
        </div>
      </Container>
    </section>
  );
}
