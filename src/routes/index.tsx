import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Check, Sparkles, Star } from "lucide-react";
import { useChallenge } from "@/lib/challenge-store";
import { LeadModal } from "@/components/lead-modal";
import { LoadingScreen } from "@/components/loading-screen";

export const Route = createFileRoute("/")({
  component: Index,
});

const BENEFITS = ["Meta clara", "Plano de 180 dias", "Dashboard", "Rotina", "Métricas", "Check-ins"];

function Index() {
  const c = useChallenge();
  const navigate = useNavigate();
  const hasPlan = Boolean(c.endDate);
  const [modal, setModal] = useState(false);
  const [loading, setLoading] = useState(false);

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

        <div className="mt-12 flex w-full flex-col items-center gap-3 sm:w-auto">
          <button
            onClick={() => (hasPlan ? navigate({ to: "/onboarding" }) : setModal(true))}
            className="group inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-primary px-10 py-5 text-lg font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/30 sm:w-auto"
          >
            {hasPlan ? "Refazer meu desafio" : "Começar meu desafio"}
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </button>

          {hasPlan && (
            <button
              onClick={() => navigate({ to: "/dashboard" })}
              className="text-sm font-semibold text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              Ir para o meu dashboard
            </button>
          )}
        </div>

        {/* social proof */}
        <div className="mt-8 flex flex-col items-center gap-1.5">
          <div className="flex text-primary">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-current" />
            ))}
          </div>
          <p className="text-sm text-muted-foreground">Mais de 2.000 pessoas já começaram o desafio.</p>
        </div>

        {/* benefits */}
        <div className="mt-14 w-full max-w-lg rounded-3xl border border-border bg-card/50 p-7 text-left backdrop-blur">
          <p className="text-center text-sm font-semibold text-muted-foreground">
            O que você vai construir em menos de 5 minutos
          </p>
          <div className="mt-5 grid grid-cols-2 gap-3">
            {BENEFITS.map((b) => (
              <div key={b} className="flex items-center gap-2 text-sm font-medium">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary/10">
                  <Check className="h-3.5 w-3.5 text-primary" />
                </span>
                {b}
              </div>
            ))}
          </div>
          <p className="mt-5 text-center text-xs font-semibold uppercase tracking-wide text-primary">Tudo gratuito.</p>
        </div>
      </div>

      <LeadModal
        open={modal}
        onClose={() => setModal(false)}
        onDone={() => {
          setModal(false);
          setLoading(true);
        }}
      />
      {loading && <LoadingScreen onDone={() => navigate({ to: "/onboarding" })} />}
    </div>
  );
}
