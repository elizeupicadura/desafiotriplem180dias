import { useEffect, useState } from "react";
import { ArrowRight, Gift, Loader2, X } from "lucide-react";
import { setChallenge } from "@/lib/challenge-store";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const WEBHOOK_URL =
  "https://script.google.com/macros/s/AKfycbz6inpVEgSwXUewtfK5fWbGrS9xkEJuwT5XIf2WgMSe-T8-E_5iC8xfie3J2sfHBeMvbQ/exec";

async function submitToSheets(fields: Record<string, string>) {
  const formData = new FormData();
  Object.entries(fields).forEach(([name, value]) => formData.append(name, value ?? ""));
  await fetch(WEBHOOK_URL, {
    method: "POST",
    mode: "no-cors",
    body: formData,
  });
}

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

type BrowserLeadData = {
  pageUrl: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
};

const EMPTY_BROWSER_DATA: BrowserLeadData = {
  pageUrl: "",
  utmSource: "",
  utmMedium: "",
  utmCampaign: "",
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
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [isDev, setIsDev] = useState(false);
  const [browserData, setBrowserData] = useState<BrowserLeadData>(EMPTY_BROWSER_DATA);

  useEffect(() => {
    if (!open) return;
    setIsDev(import.meta.env.DEV || /localhost|lovable\.app|127\.0\.0\.1/.test(window.location.hostname));
    const params = new URLSearchParams(window.location.search);
    setBrowserData({
      pageUrl: window.location.href,
      utmSource: params.get("utm_source") ?? "",
      utmMedium: params.get("utm_medium") ?? "",
      utmCampaign: params.get("utm_campaign") ?? "",
    });
  }, [open]);

  if (!open) return null;

  const valid = f.name.trim() && f.whatsapp.trim() && f.email.trim() && f.goal.trim();

  function set(key: keyof LeadFields, v: string) {
    setF((prev) => ({ ...prev, [key]: v }));
  }

  async function submit() {
    if (!valid) return;
    setSaving(true);
    setError("");
    setStatus("sending");

    const payload: Record<string, string> = {
      nome: f.name.trim(),
      whatsapp: f.whatsapp.trim(),
      instagram: f.instagram.trim(),
      email: f.email.trim(),
      meta: f.goal.trim(),
      porqueMeta: f.porqueMeta.trim(),
      perfil: f.perfil,
      objetivoFinanceiro: f.objetivoFinanceiro,
      utmSource: browserData.utmSource,
      utmMedium: browserData.utmMedium,
      utmCampaign: browserData.utmCampaign,
      pagina: browserData.pageUrl,
    };

    try {
      await submitToSheets(payload);
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Erro ao enviar");
      setSaving(false);
      return;
    }

    setTimeout(() => {
      setStatus("sent");
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
      setSaving(false);
      onDone();
    }, 1000);
  }

  function testSend() {
    setStatus("sending");
    setError("");
    submitToSheets({
      nome: "Teste Lovable",
      whatsapp: "62999999999",
      instagram: "@teste",
      email: "teste@teste.com",
      meta: "Teste de integração",
      porqueMeta: "",
      perfil: "",
      objetivoFinanceiro: "",
      utmSource: browserData.utmSource,
      utmMedium: browserData.utmMedium,
      utmCampaign: browserData.utmCampaign,
      pagina: browserData.pageUrl,
    });
    setTimeout(() => setStatus("sent"), 1000);
  }

  const STATUS_TEXT: Record<typeof status, string> = {
    idle: "Status: aguardando envio",
    sending: "Enviando...",
    sent: "Enviado. Liberando seu desafio...",
    error: "Status: erro ao enviar",
  };

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

        <p
          className={
            "mt-2 text-center text-xs font-medium " +
            (status === "error"
              ? "text-destructive"
              : status === "sent"
                ? "text-primary"
                : "text-muted-foreground")
          }
        >
          {STATUS_TEXT[status]}
        </p>

        {isDev && (
          <button
            onClick={testSend}
            className="mt-3 w-full rounded-lg border border-dashed border-border py-2 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            Testar envio Sheets
          </button>
        )}

      </div>
    </div>
  );
}
