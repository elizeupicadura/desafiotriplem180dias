import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Award, Brain, CalendarCheck, Flame, RefreshCw, Target } from "lucide-react";
import {
  currentDay,
  currentLevel,
  currentSprintIndex,
  daysRemaining,
  progressPct,
  resetChallenge,
  streak,
  todayISO,
  useChallenge,
} from "@/lib/challenge-store";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const c = useChallenge();
  const navigate = useNavigate();

  useEffect(() => {
    if (!c.endDate) navigate({ to: "/onboarding" });
  }, [c.endDate, navigate]);

  if (!c.endDate) return null;

  const sprintIdx = currentSprintIndex(c);
  const sprint = c.sprints[sprintIdx];
  const level = currentLevel(c.xp);
  const pct = progressPct(c);
  const didCheckinToday = c.checkins.some((ci) => ci.date === todayISO());

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="mx-auto max-w-3xl px-6 py-10">
        <header className="mb-8 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
          <div className="min-w-0">
            <p className="text-muted-foreground">Olá,</p>
            <h1 className="truncate text-3xl font-black tracking-tight sm:text-4xl">{c.name || "Executor"} 👋</h1>
          </div>
          <Button variant="ghost" size="sm" onClick={() => { resetChallenge(); navigate({ to: "/" }); }}>
            <RefreshCw className="mr-1 h-4 w-4" /> Reiniciar
          </Button>
        </header>

        {/* hero progress */}
        <div className="mb-6 grid gap-4 sm:grid-cols-[auto_1fr]">
          <div className="flex items-center justify-center rounded-3xl border border-border bg-card p-6 shadow-sm">
            <Ring pct={pct} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Stat label="Dias restantes" value={daysRemaining(c)} />
            <Stat label="Hoje é o dia" value={currentDay(c)} />
            <Stat label="Sequência" value={streak(c)} icon={<Flame className="h-4 w-4 text-primary" />} />
            <Stat label="XP" value={c.xp} icon={<Award className="h-4 w-4 text-primary" />} />
          </div>
        </div>

        {/* level */}
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10">
            <Award className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Seu nível</p>
            <p className="text-lg font-bold">{level.name}</p>
          </div>
        </div>

        {/* current sprint */}
        {sprint && (
          <div className="mb-6 rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-primary">
              <Target className="h-4 w-4" /> Sprint atual · {sprint.name}
            </div>
            <p className="text-xl font-bold">{sprint.label}</p>
            {sprint.goal && <p className="mt-2 text-muted-foreground">Meta: {sprint.goal}</p>}
            {sprint.focus && <p className="text-sm text-muted-foreground">Foco: {sprint.focus}</p>}
          </div>
        )}

        {/* routine today */}
        <div className="mb-6 rounded-2xl border border-border bg-card p-5 shadow-sm">
          <p className="mb-3 font-bold">Rotina de hoje</p>
          {c.routine.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum bloco definido.</p>
          ) : (
            <div className="space-y-2">
              {c.routine.map((b) => (
                <div key={b.id} className="flex items-center gap-3 rounded-xl bg-secondary/60 px-3 py-2">
                  <span className="w-14 font-mono text-sm font-bold text-primary">{b.time}</span>
                  <span className="font-medium">{b.title}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* habits */}
        {c.habits.length > 0 && (
          <div className="mb-6 rounded-2xl border border-border bg-card p-5 shadow-sm">
            <p className="mb-3 font-bold">Hábitos inegociáveis</p>
            <div className="flex flex-wrap gap-2">
              {c.habits.map((h) => (
                <span key={h.id} className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                  {h.label}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* metrics */}
        {c.metrics.length > 0 && (
          <div className="mb-6 rounded-2xl border border-border bg-card p-5 shadow-sm">
            <p className="mb-3 font-bold">Métricas</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {c.metrics.map((m) => (
                <div key={m.id} className="rounded-xl bg-secondary/60 p-3 text-center">
                  <p className="text-2xl font-black">0</p>
                  <p className="text-xs text-muted-foreground">{m.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <AiAnalysis />

        {/* CTA */}
        <div className="fixed inset-x-0 bottom-0 border-t border-border bg-background/80 p-4 backdrop-blur">
          <div className="mx-auto flex max-w-3xl gap-3">
            <Button asChild className="h-12 flex-1 rounded-xl text-base font-bold" disabled={didCheckinToday}>
              <Link to="/checkin">
                <CalendarCheck className="mr-2 h-5 w-5" />
                {didCheckinToday ? "Check-in feito hoje ✓" : "Check-in diário"}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Ring({ pct }: { pct: number }) {
  const r = 52;
  const circ = 2 * Math.PI * r;
  return (
    <div className="relative h-36 w-36">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} fill="none" stroke="var(--color-muted)" strokeWidth="10" />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ - (circ * pct) / 100}
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center">
          <p className="text-3xl font-black">{pct}%</p>
          <p className="text-xs text-muted-foreground">progresso</p>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, icon }: { label: string; value: number; icon?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        {icon} {label}
      </div>
      <p className="mt-1 text-3xl font-black">{value}</p>
    </div>
  );
}

function AiAnalysis() {
  const c = useChallenge();
  const [result, setResult] = useState<string | null>(null);

  function analyze() {
    const done = c.checkins.filter((x) => x.execution >= 50).length;
    const total = c.checkins.length;
    const rate = total ? Math.round((done / total) * 100) : 0;
    const avg = total ? Math.round(c.checkins.reduce((a, x) => a + x.execution, 0) / total) : 0;
    let msg = "";
    if (total === 0) {
      msg = "Você ainda não fez check-ins. O maior gargalo agora é começar: registre seu primeiro dia hoje mesmo.";
    } else if (avg < 50) {
      msg = `Sua execução média é ${avg}%. O maior gargalo hoje é a consistência da rotina. Reduza o número de blocos e proteja os 2 hábitos mais importantes.`;
    } else if (rate < 70) {
      msg = `Você executa bem quando aparece (média ${avg}%), mas falha em ${100 - rate}% dos dias. O gargalo é frequência — crie um gatilho fixo para o primeiro bloco do dia.`;
    } else {
      msg = `Excelente: ${rate}% de dias executados e média de ${avg}%. Agora o gargalo é ambição — aumente a meta da sprint atual para manter a tração.`;
    }
    setResult(msg);
  }

  return (
    <div className="mb-6 rounded-2xl border border-primary/30 bg-primary/5 p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 font-bold">
          <Brain className="h-5 w-5 text-primary" /> Analisar meu progresso
        </div>
        <Button size="sm" onClick={analyze}>Analisar</Button>
      </div>
      {result && <p className="mt-4 text-sm leading-relaxed text-foreground/90">{result}</p>}
    </div>
  );
}
