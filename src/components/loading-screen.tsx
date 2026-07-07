import { useEffect, useState } from "react";
import { Check, Loader2 } from "lucide-react";

const STAGES = [
  "Criando sua linha do tempo",
  "Calculando seus sprints",
  "Organizando seu dashboard",
  "Gerando seu plano",
];

export function LoadingScreen({ onDone }: { onDone: () => void }) {
  const [pct, setPct] = useState(0);
  const [done, setDone] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const total = 2600;
    const id = setInterval(() => {
      const elapsed = Date.now() - start;
      const p = Math.min(100, Math.round((elapsed / total) * 100));
      setPct(p);
      setDone(Math.min(STAGES.length, Math.floor((p / 100) * (STAGES.length + 0.5))));
      if (elapsed >= total) {
        clearInterval(id);
        setPct(100);
        setDone(STAGES.length);
        setTimeout(onDone, 400);
      }
    }, 60);
    return () => clearInterval(id);
  }, [onDone]);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background px-6">
      <div className="w-full max-w-sm text-center">
        <h2 className="text-2xl font-black tracking-tight">Preparando seu desafio...</h2>
        <div className="mt-8 space-y-3 text-left">
          {STAGES.map((s, i) => (
            <div key={s} className="flex items-center gap-3 text-sm">
              {i < done ? (
                <Check className="h-5 w-5 text-primary" />
              ) : (
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground/50" />
              )}
              <span className={i < done ? "font-medium text-foreground" : "text-muted-foreground"}>{s}</span>
            </div>
          ))}
        </div>
        <div className="mt-8 h-2 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary transition-all duration-100" style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-2 text-right text-xs font-mono font-bold text-primary">{pct}%</p>
      </div>
    </div>
  );
}
