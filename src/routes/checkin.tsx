import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { PartyPopper } from "lucide-react";
import { setChallenge, todayISO, useChallenge, type DailyCheckin } from "@/lib/challenge-store";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";

export const Route = createFileRoute("/checkin")({
  component: Checkin,
});

function Checkin() {
  const c = useChallenge();
  const navigate = useNavigate();
  const [execution, setExecution] = useState(75);
  const [worked, setWorked] = useState("");
  const [blocked, setBlocked] = useState("");
  const [better, setBetter] = useState("");
  const [done, setDone] = useState(false);

  function save() {
    const entry: DailyCheckin = { date: todayISO(), execution, worked, blocked, better };
    const checkins = [...c.checkins.filter((x) => x.date !== todayISO()), entry];
    const gained = Math.round(execution / 10) + 5;
    setChallenge({ checkins, xp: c.xp + gained });
    setDone(true);
  }

  if (done) {
    return (
      <div className="grid min-h-screen place-items-center bg-background px-6 text-center">
        <div className="animate-in fade-in zoom-in duration-500">
          <PartyPopper className="mx-auto h-16 w-16 text-primary" />
          <h1 className="mt-6 text-4xl font-black">Check-in salvo!</h1>
          <p className="mt-2 text-muted-foreground">Você executou mais que ontem. Continue.</p>
          <Button className="mt-8 rounded-xl px-8" size="lg" onClick={() => navigate({ to: "/dashboard" })}>
            Voltar ao dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-lg px-6 py-12">
        <h1 className="text-3xl font-black tracking-tight">Check-in diário</h1>
        <p className="mt-1 text-muted-foreground">Como foi hoje?</p>

        <div className="mt-10 space-y-8">
          <div>
            <div className="mb-3 flex items-center justify-between">
              <label className="font-semibold">Você executou sua rotina?</label>
              <span className="text-2xl font-black text-primary">{execution}%</span>
            </div>
            <Slider value={[execution]} onValueChange={(v) => setExecution(v[0])} step={25} max={100} />
          </div>

          <Field label="O que funcionou hoje?" value={worked} onChange={setWorked} />
          <Field label="O que atrapalhou?" value={blocked} onChange={setBlocked} />
          <Field label="O que você fará melhor amanhã?" value={better} onChange={setBetter} />

          <div className="flex gap-3">
            <Button variant="ghost" className="flex-1" onClick={() => navigate({ to: "/dashboard" })}>
              Cancelar
            </Button>
            <Button className="flex-1 rounded-xl" size="lg" onClick={save}>
              Salvar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-2">
      <label className="font-semibold">{label}</label>
      <Textarea value={value} onChange={(e) => onChange(e.target.value)} rows={2} className="resize-none" />
    </div>
  );
}
