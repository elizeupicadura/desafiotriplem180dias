import { useSyncExternalStore } from "react";

export type Sprint = {
  name: string;
  label: string;
  focus: string;
  question: string;
  goal: string;
};

export type RoutineBlock = {
  id: string;
  time: string;
  title: string;
};

export type Habit = {
  id: string;
  label: string;
};

export type Metric = {
  id: string;
  label: string;
};

export type DailyCheckin = {
  date: string; // YYYY-MM-DD
  execution: number; // 0-100
  worked: string;
  blocked: string;
  better: string;
};

export type ChallengeState = {
  name: string;
  whatsapp: string;
  instagram: string;
  email: string;
  perfil: string;
  objetivoFinanceiro: string;
  goal: string;
  why: string;
  startDate: string; // ISO
  endDate: string; // ISO
  sprints: Sprint[];
  routine: RoutineBlock[];
  habits: Habit[];
  metrics: Metric[];
  checkins: DailyCheckin[];
  missionLog: Record<string, string[]>; // date -> completed habit ids
  completed: boolean;
  xp: number;
};

const STORAGE_KEY = "desafio180";

const DEFAULT_SPRINTS: Sprint[] = [
  { name: "Sprint 1", label: "Fundação", focus: "", question: "", goal: "" },
  { name: "Sprint 2", label: "Tração", focus: "", question: "", goal: "" },
  { name: "Sprint 3", label: "Escala", focus: "", question: "", goal: "" },
  { name: "Sprint 4", label: "Consolidação", focus: "", question: "", goal: "" },
];

const DEFAULT_STATE: ChallengeState = {
  name: "",
  whatsapp: "",
  instagram: "",
  email: "",
  perfil: "",
  objetivoFinanceiro: "",
  goal: "",
  why: "",
  startDate: "",
  endDate: "",
  sprints: DEFAULT_SPRINTS,
  routine: [],
  habits: [],
  metrics: [],
  checkins: [],
  missionLog: {},
  completed: false,
  xp: 0,
};

// Start from defaults so server and first client render match.
// Real data is loaded from localStorage after mount (see subscribe below).
let state: ChallengeState = DEFAULT_STATE;
let hydrated = false;
const listeners = new Set<() => void>();

function load(): ChallengeState {
  if (typeof localStorage === "undefined") return DEFAULT_STATE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    return { ...DEFAULT_STATE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_STATE;
  }
}

function hydrate() {
  if (hydrated || typeof localStorage === "undefined") return;
  hydrated = true;
  state = load();
  listeners.forEach((l) => l());
}

function persist() {
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
  listeners.forEach((l) => l());
}

export function setChallenge(patch: Partial<ChallengeState>) {
  state = { ...state, ...patch };
  persist();
}

export function resetChallenge() {
  state = { ...DEFAULT_STATE, sprints: DEFAULT_SPRINTS.map((s) => ({ ...s })) };
  persist();
}

export function useChallenge(): ChallengeState {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      hydrate();
      return () => listeners.delete(cb);
    },
    () => state,
    () => DEFAULT_STATE,
  );
}


// ---------- derived helpers ----------

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function daysBetween(a: string, b: string) {
  if (!a || !b) return 0;
  const ms = new Date(b).getTime() - new Date(a).getTime();
  return Math.max(0, Math.round(ms / 86400000));
}

export function totalDays(s: ChallengeState) {
  return daysBetween(s.startDate, s.endDate);
}

export function daysElapsed(s: ChallengeState) {
  if (!s.startDate) return 0;
  return Math.min(totalDays(s), daysBetween(s.startDate, todayISO()));
}

export function daysRemaining(s: ChallengeState) {
  return Math.max(0, totalDays(s) - daysElapsed(s));
}

export function currentDay(s: ChallengeState) {
  return daysElapsed(s) + 1;
}

export function progressPct(s: ChallengeState) {
  const t = totalDays(s);
  if (!t) return 0;
  return Math.min(100, Math.round((daysElapsed(s) / t) * 100));
}

export function currentSprintIndex(s: ChallengeState) {
  const t = totalDays(s);
  if (!t) return 0;
  const per = t / s.sprints.length;
  return Math.min(s.sprints.length - 1, Math.floor(daysElapsed(s) / per));
}

export function streak(s: ChallengeState) {
  const done = new Set(s.checkins.filter((c) => c.execution >= 50).map((c) => c.date));
  let count = 0;
  const d = new Date();
  // start from today; if today not done, start from yesterday
  if (!done.has(d.toISOString().slice(0, 10))) d.setDate(d.getDate() - 1);
  while (done.has(d.toISOString().slice(0, 10))) {
    count++;
    d.setDate(d.getDate() - 1);
  }
  return count;
}

export const LEVELS = [
  { name: "Iniciante", min: 0 },
  { name: "Executor", min: 100 },
  { name: "Disciplinado", min: 300 },
  { name: "Consistente", min: 700 },
  { name: "Elite", min: 1500 },
  { name: "180 Mode", min: 3000 },
];

export function currentLevel(xp: number) {
  let idx = 0;
  for (let i = 0; i < LEVELS.length; i++) if (xp >= LEVELS[i].min) idx = i;
  const level = LEVELS[idx];
  const next = LEVELS[idx + 1] ?? null;
  const span = next ? next.min - level.min : 1;
  const into = xp - level.min;
  const pct = next ? Math.min(100, Math.round((into / span) * 100)) : 100;
  return { ...level, number: idx + 1, next, pct };
}

// completed mission habit ids for a given date
export function missionFor(s: ChallengeState, date: string) {
  return s.missionLog[date] ?? [];
}

export function toggleMission(s: ChallengeState, date: string, habitId: string) {
  const cur = new Set(s.missionLog[date] ?? []);
  if (cur.has(habitId)) cur.delete(habitId);
  else cur.add(habitId);
  return { ...s.missionLog, [date]: [...cur] };
}

export function uid() {
  return Math.random().toString(36).slice(2, 9);
}
