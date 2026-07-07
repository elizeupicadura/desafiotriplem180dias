import { useState } from "react";
import { ArrowRight, Gift, Loader2, X } from "lucide-react";
import { setChallenge } from "@/lib/challenge-store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type LeadFields = { name: string; whatsapp: string; instagram: string; email: string; goal: string };

export function LeadModal({ open, onClose, onDone }: { open: boolean; onClose: () => void; onDone: () => void }) {
  const [f, setF] = useState<LeadFields>({ name: "", whatsapp: "", instagram: "", email: "", goal: "" });
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  const valid = f.name.trim() && f.email.trim() && f.goal.trim();

  function set(key: keyof LeadFields, v: string) {
    setF((prev) => ({ ...prev, [key]: v }));
  }

  async function submit() {
    if (!valid) return;
    setSaving(true);
    // Persist lead locally; ready to sync to Google Sheets when connected.
    setChallenge({ name: f.name.trim(), whatsapp: f.whatsapp.trim(), instagram: f.instagram.trim(), email: f.email.trim(), goal: f.goal.trim() });
    await new Promise((r) => setTimeout(r, 500));
    onDone();
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm animate-in fade-in" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-3xl border border-border bg-card p-7 shadow-2xl animate-in fade-in zoom-in-95 duration-300">
        <button onClick={onClose} className="absolute right-4 top-4 text-muted-foreground hover:text-foreground">
          <X className="h-5 w-5" />
        </button>
        <div className="mb-1 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <Gift className="h-3.5 w-3.5" /> Acesso gratuito
        </div>
        <h2 className="mt-3 text-2xl font-black tracking-tight">Antes de começar...</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Estou disponibilizando gratuitamente uma ferramenta que normalmente faria parte de uma mentoria. Só preciso de algumas
          informações para enviar futuras atualizações. Leva menos de 20 segundos.
        </p>

        <div className="mt-6 space-y-3">
          <Input value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="Nome" className="h-12" />
          <Input value={f.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} placeholder="WhatsApp" className="h-12" />
          <Input value={f.instagram} onChange={(e) => set("instagram", e.target.value)} placeholder="Instagram" className="h-12" />
          <Input type="email" value={f.email} onChange={(e) => set("email", e.target.value)} placeholder="Email" className="h-12" />
          <Input value={f.goal} onChange={(e) => set("goal", e.target.value)} placeholder="Meta principal" className="h-12" />
        </div>

        <Button onClick={submit} disabled={!valid || saving} size="lg" className="mt-6 h-13 w-full rounded-xl text-base font-bold">
          {saving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
          Liberar meu desafio
          {!saving && <ArrowRight className="ml-2 h-5 w-5" />}
        </Button>
      </div>
    </div>
  );
}
