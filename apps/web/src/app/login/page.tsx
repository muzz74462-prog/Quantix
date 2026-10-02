import type { Metadata } from "next";
import { Navbar } from "@/components/navbar/Navbar";
import { Container } from "@/components/ui/Container";
import { AuthBackdrop } from "@/components/auth/AuthBackdrop";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Log in | QUANTIX",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col bg-ink-900">
      <Navbar />
      <main id="main" className="relative isolate flex-1 overflow-x-clip pb-16 pt-10 sm:pt-14">
        <AuthBackdrop />
        <Container>
          <h1 className="text-center text-4xl font-bold tracking-tight text-white sm:text-[44px]">Log in</h1>
          <div className="mx-auto mt-8 w-full max-w-[460px] sm:mt-10">
            <LoginForm />
          </div>
        </Container>
      </main>
    </div>
  );
}
