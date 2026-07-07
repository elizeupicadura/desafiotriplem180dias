import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Award, Brain, Check, Flame, Target, Users } from "lucide-react";
import {
  currentDay,
  currentLevel,
  currentSprintIndex,
  daysRemaining,
  missionFor,
  progressPct,
  setChallenge,
  streak,
  toggleMission,
  todayISO,
  totalDays,
  useChallenge,
  useChallengeHydrated,
} from "@/lib/challenge-store";
import { celebrate } from "@/lib/confetti";
import { Button } from "@/components/ui/button";
import { Dock } from "@/components/dock";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
});

function greetingForHour(h: number) {
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

function Dashboard() {
  const c = useChallenge();
  const hydrated = useChallengeHydrated();
  const navigate = useNavigate();
  const [today, setToday] = useState("");
  const [greeting, setGreeting] = useState("Olá");

  useEffect(() => {
    setToday(todayISO());
    setGreeting(greetingForHour(new Date().getHours()));
  }, []);

  useEffect(() => {
    if (hydrated && !c.endDate) navigate({ to: "/onboarding" });
  }, [c.endDate, hydrated, navigate]);

  if (!hydrated || !c.endDate || !today) return null;

  const sprintIdx = currentSprintIndex(c, today);
  const sprint = c.sprints[sprintIdx];
  const level = currentLevel(c.xp);
  const pct = progressPct(c, today);
  const total = totalDays(c);
  const per = Math.round(total / c.sprints.length);
  const sprintStart = sprintIdx * per + 1;
  const sprintEnd = sprintIdx === c.sprints.length - 1 ? total : (sprintIdx + 1) * per;

  return (
    <div className="min-h-screen bg-background pb-28">
      <div className="mx-auto max-w-3xl px-6 py-10">
        {/* greeting + group CTA */}
        <header className="mb-8 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-3xl font-black leading-tight tracking-tight sm:text-4xl">
              {greeting}, {c.name || "Executor"}.
            </h1>
            <p className="mt-1 text-muted-foreground">
              Hoje é o dia {currentDay(c, today)}. Faltam {daysRemaining(c, today)} dias.
            </p>
          </div>
          <a
            href="https://whatsapp.com/channel/0029Vb5ZfYdFnSz9aTKoDg2z"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden shrink-0 items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/20 sm:inline-flex"
          >
            <Users className="h-4 w-4" /> Entrar no canal gratuito
          </a>
        </header>

        {/* why reminder */}
        {c.why && (
          <div className="mb-6 rounded-2xl border-l-4 border-primary bg-primary/5 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">Você começou porque</p>
            <p className="mt-1 text-lg font-medium leading-snug">{c.why}</p>
          </div>
        )}

        {/* mission of the day */}
        <MissionCard today={today} />

        {/* level */}
        <div className="mb-6 rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10">
              <Award className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Nível {level.number}</p>
              <p className="text-lg font-bold">{level.name}</p>
            </div>
            <p className="font-mono text-sm font-bold text-primary">{c.xp} XP</p>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${level.pct}%` }} />
          </div>
          {level.next && (
            <p className="mt-2 text-xs text-muted-foreground">
              Faltam {level.next.min - c.xp} XP para {level.next.name}
            </p>
          )}
        </div>

        {/* stats */}
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Progresso" value={`${pct}%`} />
          <Stat label="Dias restantes" value={daysRemaining(c, today)} />
          <Stat label="Sequência" value={streak(c, today)} icon={<Flame className="h-4 w-4 text-primary" />} />
          <Stat label="XP" value={c.xp} icon={<Award className="h-4 w-4 text-primary" />} />
        </div>

        {/* current sprint */}
        {sprint && (
          <div className="mb-6 rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-primary">
              <Target className="h-4 w-4" /> Sprint atual · {sprint.name}
            </div>
            <p className="text-xl font-bold">{sprint.label}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {sprintEnd - sprintStart + 1} dias · Dias {sprintStart}–{sprintEnd}
            </p>
            {sprint.goal && <p className="mt-2 text-muted-foreground">Meta: {sprint.goal}</p>}
            {sprint.focus && <p className="text-sm text-muted-foreground">Foco: {sprint.focus}</p>}
          </div>
        )}

        {/* metrics */}
        {c.metrics.length > 0 && (
          <div className="mb-6 rounded-2xl border border-border bg-card p-5 shadow-sm">
            <p className="mb-3 font-bold">Métricas de vitória</p>
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

        {/* group CTA footer */}
        <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5 text-center">
          <a
            href="#"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground"
          >
            <Users className="h-4 w-4" /> Entrar no Grupo
          </a>
          <p className="mt-3 text-xs text-muted-foreground">Toda semana libero melhorias gratuitas do desafio.</p>
        </div>
      </div>

      <Dock />
    </div>
  );
}

function MissionCard({ today }: { today: string }) {
  const c = useChallenge();
  const done = new Set(missionFor(c, today));
  const items = c.habits.length ? c.habits : c.routine.map((r) => ({ id: r.id, label: `${r.time} · ${r.title}` }));

  function toggle(id: string) {
    const nextLog = toggleMission(c, today, id);
    const wasDone = done.has(id);
    const nextDone = new Set(nextLog[today]);
    // award XP only when newly completing
    const gained = wasDone ? 0 : 10;
    setChallenge({ missionLog: nextLog, xp: Math.max(0, c.xp + gained) });
    if (!wasDone && items.length > 0 && items.every((it) => nextDone.has(it.id))) {
      celebrate();
    }
  }

  const allDone = items.length > 0 && items.every((it) => done.has(it.id));

  return (
    <div className="mb-6 overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
      <div className="bg-primary/10 px-6 py-4">
        <p className="text-xs font-bold uppercase tracking-widest text-primary">Missão de hoje</p>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {allDone ? "Missão concluída. Você venceu o dia. 🔥" : `${done.size}/${items.length} concluídas`}
        </p>
      </div>
      <div className="divide-y divide-border">
        {items.length === 0 && (
          <p className="px-6 py-8 text-center text-sm text-muted-foreground">
            Defina hábitos ou rotina no onboarding para montar sua missão.
          </p>
        )}
        {items.map((it) => {
          const checked = done.has(it.id);
          return (
            <button
              key={it.id}
              onClick={() => toggle(it.id)}
              className="flex w-full items-center gap-3 px-6 py-4 text-left transition-colors hover:bg-accent/50"
            >
              <span
                className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 transition-all ${
                  checked ? "scale-110 border-primary bg-primary text-primary-foreground" : "border-border"
                }`}
              >
                {checked && <Check className="h-4 w-4" />}
              </span>
              <span className={`font-medium transition-all ${checked ? "text-muted-foreground line-through" : ""}`}>
                {it.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Stat({ label, value, icon }: { label: string; value: number | string; icon?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        {icon} {label}
      </div>
      <p className="mt-1 text-2xl font-black">{value}</p>
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
