import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles } from "lucide-react";
import { useChallenge } from "@/lib/challenge-store";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const c = useChallenge();
  const hasPlan = Boolean(c.endDate);

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* ambient glow */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/25 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 rounded-full bg-primary/10 blur-[120px]" />

      <div className="relative mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 py-20 text-center">
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          O sistema, não a motivação
        </div>

        <h1 className="text-6xl font-black leading-[0.95] tracking-tight text-foreground sm:text-8xl">
          DESAFIO
          <br />
          <span className="text-primary">180 DIAS</span>
        </h1>

        <p className="mt-8 max-w-xl text-lg font-medium text-foreground/80 sm:text-2xl">
          O framework para transformar qualquer meta em um sistema.
        </p>

        <blockquote className="mt-6 max-w-md border-l-2 border-primary pl-4 text-left text-sm text-muted-foreground sm:text-base">
          Você não precisa esperar janeiro.
          <br />
          Você só precisa de uma direção.
        </blockquote>

        <div className="mt-12 flex w-full flex-col items-center gap-3 sm:w-auto">
          <Link
            to="/onboarding"
            className="group inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-primary px-10 py-5 text-lg font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/30 sm:w-auto"
          >
            {hasPlan ? "Refazer meu desafio" : "Começar meu desafio"}
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>

          {hasPlan && (
            <Link
              to="/dashboard"
              className="text-sm font-semibold text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              Ir para o meu dashboard
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
