import { ArrowRight, CheckCircle2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export const WHATSAPP_CHANNEL = "https://whatsapp.com/channel/0029Vb5ZfYdFnSz9aTKoDg2z";

export function AccessUnlocked({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm animate-in fade-in" />
      <div className="relative w-full max-w-md rounded-3xl border border-border bg-card p-8 text-center shadow-2xl animate-in fade-in zoom-in-95 duration-300">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary/10">
          <CheckCircle2 className="h-7 w-7 text-primary" />
        </div>
        <h2 className="mt-5 text-2xl font-black tracking-tight">Seu acesso foi liberado.</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Entre no canal gratuito para receber atualizações, materiais extras e próximos passos do Desafio 180 Dias.
        </p>

        <div className="mt-7 space-y-3">
          <a
            href={WHATSAPP_CHANNEL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-primary text-base font-bold text-primary-foreground transition-all hover:scale-[1.02]"
          >
            <MessageCircle className="h-5 w-5" /> Entrar no canal gratuito
          </a>
          <Button
            onClick={onContinue}
            variant="outline"
            size="lg"
            className="h-13 w-full rounded-xl text-base font-bold"
          >
            Continuar para o desafio <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
