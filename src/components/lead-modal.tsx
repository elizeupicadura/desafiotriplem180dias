import { useState } from "react";
import { ArrowRight, Gift, Loader2, X } from "lucide-react";
import { setChallenge } from "@/lib/challenge-store";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const WEBHOOK_URL =
  import.meta.env.VITE_GOOGLE_SCRIPT_URL ??
  "https://script.google.com/macros/s/AKfycbxQcSBy5kEuIYeyb4zC-NVDX9eFBs0WD4f4zjAvtpFOJW2FD3A5xpttrcWSatvKvM-D2A/exec";

const PERFIS = ["CLT", "Empreendedor", "Criador de Conteúdo", "Freelancer", "Estudante", "Outro"];
const OBJETIVOS = ["Até 10 mil", "10 a 30 mil", "30 a 100 mil", "100 mil+"];

type LeadFields = {
  name: string;
  whatsapp: string;
  instagram: string;
  email: string;
  goal: string;
  porqueMeta: string;
  perfil: string;
  objetivoFinanceiro: string;
};

export function LeadModal({ open, onClose, onDone }: { open: boolean; onClose: () => void; onDone: () => void }) {
  const [f, setF] = useState<LeadFields>({
    name: "",
    whatsapp: "",
    instagram: "",
    email: "",
    goal: "",
    porqueMeta: "",
    perfil: "",
    objetivoFinanceiro: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const valid = f.name.trim() && f.whatsapp.trim() && f.email.trim() && f.goal.trim();

  function set(key: keyof LeadFields, v: string) {
    setF((prev) => ({ ...prev, [key]: v }));
  }

  async function submit() {
    if (!valid) return;
    setSaving(true);
    setError("");

    const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : new URLSearchParams();
    const payload = {
      nome: f.name.trim(),
      whatsapp: f.whatsapp.trim(),
      instagram: f.instagram.trim(),
      email: f.email.trim(),
      meta: f.goal.trim(),
      porqueMeta: f.porqueMeta.trim(),
      perfil: f.perfil,
      objetivoFinanceiro: f.objetivoFinanceiro,
      origem: "Desafio 180 Dias",
      utmSource: params.get("utm_source") ?? "",
      utmMedium: params.get("utm_medium") ?? "",
      utmCampaign: params.get("utm_campaign") ?? "",
      pagina: typeof window !== "undefined" ? window.location.href : "",
    };

    try {
      await fetch(WEBHOOK_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload),
      });
      setChallenge({
        name: f.name.trim(),
        whatsapp: f.whatsapp.trim(),
        instagram: f.instagram.trim(),
        email: f.email.trim(),
        goal: f.goal.trim(),
        why: f.porqueMeta.trim(),
        perfil: f.perfil,
        objetivoFinanceiro: f.objetivoFinanceiro,
      });
      onDone();
    } catch {
      setError("Não foi possível liberar seu desafio agora. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm animate-in fade-in" onClick={onClose} />
      <div className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl border border-border bg-card p-7 shadow-2xl animate-in fade-in zoom-in-95 duration-300">
        <button onClick={onClose} className="absolute right-4 top-4 text-muted-foreground hover:text-foreground">
          <X className="h-5 w-5" />
        </button>
        <div className="mb-1 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <Gift className="h-3.5 w-3.5" /> Acesso gratuito
        </div>
        <h2 className="mt-3 text-2xl font-black tracking-tight">Antes de começar...</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Estou disponibilizando gratuitamente essa ferramenta. Preencha seus dados para liberar o acesso e receber futuras
          atualizações do Desafio 180 Dias.
        </p>

        <div className="mt-6 space-y-3">
          <Input value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="Nome" className="h-12" />
          <Input value={f.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} placeholder="WhatsApp" className="h-12" />
          <Input value={f.instagram} onChange={(e) => set("instagram", e.target.value)} placeholder="Instagram" className="h-12" />
          <Input type="email" value={f.email} onChange={(e) => set("email", e.target.value)} placeholder="Email" className="h-12" />
          <Input value={f.goal} onChange={(e) => set("goal", e.target.value)} placeholder="Meta principal" className="h-12" />
          <Textarea
            value={f.porqueMeta}
            onChange={(e) => set("porqueMeta", e.target.value)}
            placeholder="Por que essa meta importa para você?"
            rows={2}
            className="resize-none"
          />
          <select
            value={f.perfil}
            onChange={(e) => set("perfil", e.target.value)}
            className="h-12 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">Perfil</option>
            {PERFIS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <select
            value={f.objetivoFinanceiro}
            onChange={(e) => set("objetivoFinanceiro", e.target.value)}
            className="h-12 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">Objetivo financeiro</option>
            {OBJETIVOS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>

        {error && <p className="mt-4 text-sm font-medium text-destructive">{error}</p>}

        <Button onClick={submit} disabled={!valid || saving} size="lg" className="mt-6 h-13 w-full rounded-xl text-base font-bold">
          {saving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
          Liberar meu desafio
          {!saving && <ArrowRight className="ml-2 h-5 w-5" />}
        </Button>
      </div>
    </div>
  );
}
