import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Flag,
  GripVertical,
  Plus,
  Target,
  Trash2,
} from "lucide-react";
import {
  daysBetween,
  setChallenge,
  todayISO,
  uid,
  useChallenge,
  type Habit,
  type Metric,
  type RoutineBlock,
  type Sprint,
} from "@/lib/challenge-store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/onboarding")({
  component: Onboarding,
});

const HABIT_SUGGESTIONS = ["Treinar", "Ler", "Dormir cedo", "Postar conteúdo", "Prospectar", "Meditar", "Água"];
const METRIC_SUGGESTIONS = ["Vendas", "Conteúdos", "Clientes", "Leads", "Peso", "Treinos", "Horas estudadas"];
const STEPS = ["Meta", "Sprints", "Objetivos", "Rotina", "Compromissos", "Métricas", "Marcos"];

function Onboarding() {
  const c = useChallenge();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  const [name, setName] = useState(c.name);
  const [goal, setGoal] = useState(c.goal);
  const [endDate, setEndDate] = useState(c.endDate || defaultEnd());
  const [sprints, setSprints] = useState<Sprint[]>(c.sprints);
  const [routine, setRoutine] = useState<RoutineBlock[]>(c.routine);
  const [habits, setHabits] = useState<Habit[]>(c.habits);
  const [metrics, setMetrics] = useState<Metric[]>(c.metrics);

  const remaining = daysBetween(todayISO(), endDate);

  function next() {
    setChallenge({ name, goal, endDate, sprints, routine, habits, metrics, startDate: c.startDate || todayISO() });
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setChallenge({ completed: true, startDate: c.startDate || todayISO() });
      navigate({ to: "/dashboard" });
    }
  }

  const canContinue = useMemo(() => {
    if (step === 0) return goal.trim() && name.trim() && endDate;
    return true;
  }, [step, goal, name, endDate]);

  return (
    <div className="relative min-h-screen bg-background">
      <div className="pointer-events-none absolute -top-32 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-primary/15 blur-[120px]" />
      <div className="relative mx-auto max-w-2xl px-6 py-10">
        {/* progress header */}
        <div className="mb-10">
          <div className="mb-3 flex items-center justify-between text-xs font-medium text-muted-foreground">
            <span>
              Etapa {step + 1} de {STEPS.length}
            </span>
            <span>{STEPS[step]}</span>
          </div>
          <div className="flex gap-1.5">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-colors ${i <= step ? "bg-primary" : "bg-muted"}`}
              />
            ))}
          </div>
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          {step === 0 && (
            <StepGoal
              name={name}
              setName={setName}
              goal={goal}
              setGoal={setGoal}
              endDate={endDate}
              setEndDate={setEndDate}
              remaining={remaining}
            />
          )}
          {step === 1 && <StepSprints sprints={sprints} setSprints={setSprints} />}
          {step === 2 && <StepObjectives sprints={sprints} setSprints={setSprints} />}
          {step === 3 && <StepRoutine routine={routine} setRoutine={setRoutine} />}
          {step === 4 && <StepHabits habits={habits} setHabits={setHabits} />}
          {step === 5 && <StepMetrics metrics={metrics} setMetrics={setMetrics} />}
          {step === 6 && <StepMilestones endDate={endDate} />}
        </div>

        <div className="mt-12 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => (step === 0 ? navigate({ to: "/" }) : setStep((s) => s - 1))}
          >
            <ArrowLeft className="mr-1 h-4 w-4" /> Voltar
          </Button>
          <Button size="lg" disabled={!canContinue} onClick={next} className="rounded-xl px-8">
            {step === STEPS.length - 1 ? "Concluir" : "Continuar"}
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function defaultEnd() {
  const d = new Date();
  d.setDate(d.getDate() + 180);
  return d.toISOString().slice(0, 10);
}

function Heading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-8">
      <h2 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">{title}</h2>
      {subtitle && <p className="mt-2 text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

function StepGoal(props: {
  name: string;
  setName: (v: string) => void;
  goal: string;
  setGoal: (v: string) => void;
  endDate: string;
  setEndDate: (v: string) => void;
  remaining: number;
}) {
  return (
    <div className="space-y-8">
      <Heading title="Qual é sua grande meta?" subtitle="Uma direção clara muda tudo." />
      <div className="space-y-2">
        <label className="text-sm font-medium">Como você se chama?</label>
        <Input value={props.name} onChange={(e) => props.setName(e.target.value)} placeholder="Seu nome" className="h-14 text-lg" />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Sua grande meta</label>
        <Input
          value={props.goal}
          onChange={(e) => props.setGoal(e.target.value)}
          placeholder="Ex: Faturar 100 mil"
          className="h-14 text-lg"
        />
        <p className="text-xs text-muted-foreground">Exemplos: Faturar 100 mil · Perder 20kg · Construir minha empresa</p>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Qual será sua data final?</label>
        <Input
          type="date"
          value={props.endDate}
          min={todayISO()}
          onChange={(e) => props.setEndDate(e.target.value)}
          className="h-14 text-lg"
        />
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
        <p className="text-sm text-muted-foreground">Faltam</p>
        <p className="my-1 text-6xl font-black text-primary">{props.remaining}</p>
        <p className="text-sm text-muted-foreground">dias</p>
        <Progress value={0} className="mt-4" />
        <p className="mt-2 text-xs text-muted-foreground">0% · a jornada começa hoje</p>
      </div>
    </div>
  );
}

function StepSprints({ sprints, setSprints }: { sprints: Sprint[]; setSprints: (s: Sprint[]) => void }) {
  const [open, setOpen] = useState<number | null>(0);
  function update(i: number, patch: Partial<Sprint>) {
    setSprints(sprints.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  }
  return (
    <div>
      <Heading title="Divisão em Sprints" subtitle="Seu desafio, dividido em 4 fases automáticas." />
      <div className="space-y-3">
        {sprints.map((s, i) => (
          <div key={i} className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="flex w-full items-center gap-4 p-5 text-left"
            >
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-sm font-black text-primary">
                {i + 1}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-muted-foreground">{s.name}</p>
                <p className="truncate text-lg font-bold">{s.label}</p>
              </div>
            </button>
            {open === i && (
              <div className="space-y-4 border-t border-border p-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Qual será o foco desta fase?</label>
                  <Input value={s.focus} onChange={(e) => update(i, { focus: e.target.value })} placeholder="Foco da fase" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Qual pergunta define essa sprint?</label>
                  <Input
                    value={s.question}
                    onChange={(e) => update(i, { question: e.target.value })}
                    placeholder="Ex: O que preciso validar?"
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function StepObjectives({ sprints, setSprints }: { sprints: Sprint[]; setSprints: (s: Sprint[]) => void }) {
  function update(i: number, goal: string) {
    setSprints(sprints.map((s, idx) => (idx === i ? { ...s, goal } : s)));
  }
  return (
    <div>
      <Heading title="Uma meta por sprint" subtitle="Uma meta por sprint gera foco." />
      <div className="grid gap-3">
        {sprints.map((s, i) => (
          <div key={i} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-primary">
              <Target className="h-4 w-4" /> {s.name} · {s.label}
            </div>
            <Input value={s.goal} onChange={(e) => update(i, e.target.value)} placeholder="Qual será sua única meta?" className="h-12" />
          </div>
        ))}
      </div>
    </div>
  );
}

function StepRoutine({ routine, setRoutine }: { routine: RoutineBlock[]; setRoutine: (r: RoutineBlock[]) => void }) {
  const [time, setTime] = useState("07:00");
  const [title, setTitle] = useState("");
  function add() {
    if (!title.trim()) return;
    const next = [...routine, { id: uid(), time, title: title.trim() }].sort((a, b) => a.time.localeCompare(b.time));
    setRoutine(next);
    setTitle("");
  }
  return (
    <div>
      <Heading title="Rotina diária" subtitle="Monte os blocos do seu dia ideal." />
      <div className="mb-4 flex gap-2">
        <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="h-12 w-32" />
        <Input value={title} onChange={(e) => setTitle(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} placeholder="Ex: Academia" className="h-12 flex-1" />
        <Button onClick={add} className="h-12 w-12 shrink-0 p-0">
          <Plus className="h-5 w-5" />
        </Button>
      </div>
      <div className="space-y-2">
        {routine.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">Adicione seu primeiro bloco.</p>}
        {routine.map((b) => (
          <div key={b.id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-sm">
            <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="w-14 shrink-0 font-mono text-sm font-bold text-primary">{b.time}</span>
            <span className="min-w-0 flex-1 truncate font-medium">{b.title}</span>
            <button onClick={() => setRoutine(routine.filter((x) => x.id !== b.id))} className="text-muted-foreground hover:text-destructive">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function StepHabits({ habits, setHabits }: { habits: Habit[]; setHabits: (h: Habit[]) => void }) {
  const [custom, setCustom] = useState("");
  const active = new Set(habits.map((h) => h.label));
  function toggle(label: string) {
    if (active.has(label)) setHabits(habits.filter((h) => h.label !== label));
    else setHabits([...habits, { id: uid(), label }]);
  }
  return (
    <div>
      <Heading title="Compromissos inegociáveis" subtitle="Quais hábitos serão inegociáveis?" />
      <div className="mb-4 flex flex-wrap gap-2">
        {[...new Set([...HABIT_SUGGESTIONS, ...habits.map((h) => h.label)])].map((label) => (
          <button
            key={label}
            onClick={() => toggle(label)}
            className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              active.has(label) ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:bg-accent"
            }`}
          >
            {active.has(label) && <Check className="h-3.5 w-3.5" />}
            {label}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && custom.trim()) {
              toggle(custom.trim());
              setCustom("");
            }
          }}
          placeholder="Adicionar hábito personalizado"
          className="h-12"
        />
      </div>
    </div>
  );
}

function StepMetrics({ metrics, setMetrics }: { metrics: Metric[]; setMetrics: (m: Metric[]) => void }) {
  const [custom, setCustom] = useState("");
  const active = new Set(metrics.map((m) => m.label));
  function toggle(label: string) {
    if (active.has(label)) setMetrics(metrics.filter((m) => m.label !== label));
    else setMetrics([...metrics, { id: uid(), label }]);
  }
  return (
    <div>
      <Heading title="Como você mede sucesso?" subtitle="Escolha os KPIs que importam." />
      <div className="mb-4 flex flex-wrap gap-2">
        {[...new Set([...METRIC_SUGGESTIONS, ...metrics.map((m) => m.label)])].map((label) => (
          <button
            key={label}
            onClick={() => toggle(label)}
            className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              active.has(label) ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:bg-accent"
            }`}
          >
            {active.has(label) && <Check className="h-3.5 w-3.5" />}
            {label}
          </button>
        ))}
      </div>
      <Input
        value={custom}
        onChange={(e) => setCustom(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && custom.trim()) {
            toggle(custom.trim());
            setCustom("");
          }
        }}
        placeholder="Adicionar métrica personalizada"
        className="h-12"
      />
    </div>
  );
}

function StepMilestones({ endDate }: { endDate: string }) {
  const total = daysBetween(todayISO(), endDate);
  const per = total / 4;
  const milestones = [
    { day: 1, label: "Início da jornada" },
    { day: Math.round(per), label: "Fim Sprint 1" },
    { day: Math.round(per * 2), label: "Fim Sprint 2" },
    { day: Math.round(per * 3), label: "Fim Sprint 3" },
    { day: total, label: "Dia final" },
  ];
  return (
    <div>
      <Heading title="Seus marcos" subtitle="Pontos de celebração ao longo dos 180 dias." />
      <div className="relative ml-3 space-y-6 border-l-2 border-primary/30 pl-8">
        {milestones.map((m, i) => (
          <div key={i} className="relative">
            <div className="absolute -left-[41px] grid h-6 w-6 place-items-center rounded-full bg-primary text-primary-foreground">
              <Flag className="h-3 w-3" />
            </div>
            <p className="text-xs font-medium text-muted-foreground">Dia {m.day}</p>
            <p className="text-lg font-bold">{m.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

