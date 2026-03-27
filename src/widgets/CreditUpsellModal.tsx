/**
 * ══════════════════════════════════════════════════════════════
 *  CreditUpsellModal — In-app credit purchase screen (i18n ES/PT)
 *
 *  Triggered when:
 *  - userService.canStartSession() returns { allowed: false }
 *  - PaymentError("CREDITS_EXHAUSTED") is thrown
 *
 *  Shows the 3 credit packs with pricing, integrates with
 *  paymentService.createCheckout(), and handles loading/error states.
 * ══════════════════════════════════════════════════════════════
 */
import { useState } from "react";
import {
  Zap,
  Check,
  Loader2,
  ShoppingCart,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { motion } from "motion/react";
import confetti from "canvas-confetti";
import { AppModal } from "@/shared/ui/AppModal";
import {
  CREDIT_PACK_DETAILS,
  type CreditPack,
} from "@/services/types";
import { paymentService, authService } from "@/services";
import { isPaymentError } from "@/services/errors";
import type { LandingLang } from "@/shared/i18n/landing-i18n";
import type { PaywallReason } from "@/app/hooks/useUsageGating";

/* ══════════════════════════════════════════════════════════════
   i18n COPY
   ══════════════════════════════════════════════════════════════ */

interface UpsellCopy {
  title: string;
  subtitle: string;
  noCredits: string;
  sessionSingular: string;
  sessionPlural: string;
  perSessionSuffix: string;
  processing: string;
  done: string;
  buy: string;
  successMessage: string;
  errorFallback: string;
  trustLine: string;
  features: string[];
  packNames: [string, string, string];
  packTaglines: [string, string, string];
  /** Credit balance chip label */
  creditsLabel: string;
  creditsSingular: string;
  creditsPlural: string;
}

/* ── Paywall reason-specific copy ── */
interface PaywallReasonCopy {
  title: string;
  subtitle: string;
  valueProps: string[];
}

type PaywallReasonCopyMap = Record<PaywallReason, PaywallReasonCopy>;

const PAYWALL_REASON_ES: PaywallReasonCopyMap = {
  "extra-practice": {
    title: "Unlock unlimited practice",
    subtitle: "You've used your 2 free attempts. Get more practice to perfect your delivery.",
    valueProps: [
      "Practice as many times as you want",
      "The AI adapts each conversation differently",
      "Build confidence with repetition",
    ],
  },
  "download-report": {
    title: "Download your full report",
    subtitle: "Save your personalized report as PDF — review it before your real conversation.",
    valueProps: [
      "Complete PDF with all feedback sections",
      "Power Phrases & Questions ready to use",
      "Take it anywhere — no internet needed",
    ],
  },
  "new-session": {
    title: "Start a new coaching session",
    subtitle: "You've used your free monthly session. Get credits to keep improving.",
    valueProps: [
      "New scenarios with AI-generated feedback",
      "Personalized scripts & strategies",
      "Each session makes you more confident",
    ],
  },
};

const PAYWALL_REASON_PT: PaywallReasonCopyMap = {
  "extra-practice": {
    title: "Desbloqueie pratica ilimitada",
    subtitle: "Voce usou suas 2 tentativas gratuitas. Obtenha mais pratica para aperfeicoar sua apresentacao.",
    valueProps: [
      "Pratique quantas vezes quiser",
      "A IA adapta cada conversa de forma diferente",
      "Construa confianca com a repeticao",
    ],
  },
  "download-report": {
    title: "Baixe seu relatorio completo",
    subtitle: "Salve seu relatorio personalizado em PDF — revise antes da sua conversa real.",
    valueProps: [
      "PDF completo com todas as secoes de feedback",
      "Power Phrases & Questions prontas para usar",
      "Leve para qualquer lugar — sem internet",
    ],
  },
  "new-session": {
    title: "Inicie uma nova sessao de coaching",
    subtitle: "Voce usou sua sessao gratuita mensal. Obtenha creditos para continuar melhorando.",
    valueProps: [
      "Novos cenarios com feedback gerado por IA",
      "Scripts e estrategias personalizadas",
      "Cada sessao te deixa mais confiante",
    ],
  },
};

const PAYWALL_REASON_COPIES: Record<LandingLang, PaywallReasonCopyMap> = {
  es: PAYWALL_REASON_ES,
  pt: PAYWALL_REASON_PT,
  en: PAYWALL_REASON_ES, // EN paywall reasons are already in English (same as ES keys)
};

const UPSELL_ES: UpsellCopy = {
  title: "Compra créditos de sesión",
  subtitle: "Elige un paquete para continuar practicando con IA",
  noCredits: "No tienes créditos disponibles",
  sessionSingular: "sesión",
  sessionPlural: "sesiones",
  perSessionSuffix: "/ses",
  processing: "Procesando...",
  done: "¡Listo!",
  buy: "Comprar",
  successMessage: "¡Créditos agregados exitosamente!",
  errorFallback: "Ocurrió un error al procesar tu compra. Intenta de nuevo.",
  trustLine: "Pago seguro · Tus créditos no expiran · Sin suscripción",
  features: [
    "Sesión completa con IA avanzada",
    "Feedback profundo + guión optimizado",
    "Shadowing con scoring de pronunciación",
    "Spaced Repetition cards generadas",
  ],
  packNames: ["1 Sesión", "3 Sesiones", "5 Sesiones"],
  packTaglines: ["Práctica puntual", "Preparación a fondo", "Mejor valor"],
  creditsLabel: "créditos",
  creditsSingular: "crédito",
  creditsPlural: "créditos",
};

const UPSELL_PT: UpsellCopy = {
  title: "Comprar créditos de sessão",
  subtitle: "Escolha um pacote para continuar praticando com IA",
  noCredits: "Você não tem créditos disponíveis",
  sessionSingular: "sessão",
  sessionPlural: "sessões",
  perSessionSuffix: "/ses",
  processing: "Processando...",
  done: "Pronto!",
  buy: "Comprar",
  successMessage: "Créditos adicionados com sucesso!",
  errorFallback: "Ocorreu um erro ao processar sua compra. Tente novamente.",
  trustLine: "Pagamento seguro · Seus créditos não expiram · Sem assinatura",
  features: [
    "Sessão completa com IA avançada",
    "Feedback profundo + roteiro otimizado",
    "Shadowing com scoring de pronúncia",
    "Spaced Repetition cards geradas",
  ],
  packNames: ["1 Sessão", "3 Sessões", "5 Sessões"],
  packTaglines: ["Prática pontual", "Preparação completa", "Melhor valor"],
  creditsLabel: "créditos",
  creditsSingular: "crédito",
  creditsPlural: "créditos",
};

const UPSELL_EN: UpsellCopy = {
  title: "Buy session credits",
  subtitle: "Choose a pack to keep practicing with AI",
  noCredits: "You have no credits available",
  sessionSingular: "session",
  sessionPlural: "sessions",
  perSessionSuffix: "/ses",
  processing: "Processing...",
  done: "Done!",
  buy: "Buy",
  successMessage: "Credits added successfully!",
  errorFallback: "An error occurred while processing your purchase. Please try again.",
  trustLine: "Secure payment · Credits never expire · No subscription",
  features: [
    "Full session with advanced AI",
    "Deep feedback + optimized script",
    "Shadowing with pronunciation scoring",
    "Spaced Repetition cards generated",
  ],
  packNames: ["1 Session", "3 Sessions", "5 Sessions"],
  packTaglines: ["Quick practice", "Thorough prep", "Best value"],
  creditsLabel: "credits",
  creditsSingular: "credit",
  creditsPlural: "credits",
};

const UPSELL_COPIES: Record<LandingLang, UpsellCopy> = { es: UPSELL_ES, pt: UPSELL_PT, en: UPSELL_EN };

/* ══════════════════════════════════════════════════════════════
   PACK DATA
   ══════════════════════════════════════════════════════════════ */

const PACKS: CreditPack[] = ["session_1", "session_3", "session_5"];

/* ══════════════════════════════════════════════════════════════
   HELPER — credits label for Dashboard badge
   ══════════════════════════════════════════════════════════════ */

export function getCreditsLabel(count: number, lang: LandingLang = "es"): string {
  const c = UPSELL_COPIES[lang];
  return count === 1 ? c.creditsSingular : c.creditsPlural;
}

/* ══════════════════════════════════════════════════════════════
   COMPONENT
   ══════════════════════════════════════════════════════════════ */

interface CreditUpsellModalProps {
  open: boolean;
  onClose: () => void;
  onPurchaseComplete?: (pack: CreditPack, creditsAdded: number) => void;
  paywallReason?: PaywallReason;
  creditsRemaining?: number;
  lang?: LandingLang;
}

export function CreditUpsellModal({
  open,
  onClose,
  onPurchaseComplete,
  paywallReason,
  creditsRemaining = 0,
  lang = "es",
}: CreditUpsellModalProps) {
  const [selected, setSelected] = useState<CreditPack>("session_5");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const copy = UPSELL_COPIES[lang];
  const reasonCopy = paywallReason ? PAYWALL_REASON_COPIES[lang][paywallReason] : null;

  const handlePurchase = async () => {
    setLoading(true);
    setError(null);
    try {
      const user = authService.getCurrentUser();
      if (!user) throw new Error("Not authenticated");
      await paymentService.createCheckout(user.uid, selected);
      const detail = CREDIT_PACK_DETAILS[selected];

      // Confetti burst
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ["#50C878", "#00D3F3", "#E1D5F8", "#FFE9C7"],
      });

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onPurchaseComplete?.(selected, detail.sessions);
      }, 1600);
    } catch (err) {
      if (isPaymentError(err)) {
        setError(err.message);
      } else {
        setError(copy.errorFallback);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppModal open={open} onClose={onClose} size="md" showCloseButton={true}>
      {/* Top gradient bar */}
      <div className="h-1.5 bg-gradient-to-r from-[#00D3F3] via-[#50C878] to-[#E1D5F8]" />

      <div className="px-6 pt-6 pb-6">
        {/* Credits badge */}
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-[#f0f4f8] rounded-full px-3 py-1 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-[#50C878]" />
            <span className="text-xs text-[#4B505B]" style={{ fontWeight: 600 }}>
              {creditsRemaining} {getCreditsLabel(creditsRemaining, lang)}
            </span>
          </div>
        </div>

        {/* Header — contextual per paywall reason */}
        {reasonCopy ? (
          <>
            <h2 className="text-xl text-[#0f172b] mb-1" style={{ fontWeight: 600 }}>
              {reasonCopy.title}
            </h2>
            <p className="text-sm text-[#62748e] mb-4">{reasonCopy.subtitle}</p>
            <div className="space-y-1.5 mb-5">
              {reasonCopy.valueProps.map((vp) => (
                <div key={vp} className="flex items-start gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#50C878] mt-0.5 shrink-0" />
                  <span className="text-xs text-[#45556c]">{vp}</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <h2 className="text-xl text-[#0f172b] mb-1" style={{ fontWeight: 600 }}>
              {copy.title}
            </h2>
            <p className="text-sm text-[#62748e] mb-5">{copy.subtitle}</p>
          </>
        )}

        {/* Pack selector */}
        <div className="space-y-2 mb-5">
          {PACKS.map((pack, i) => {
            const detail = CREDIT_PACK_DETAILS[pack];
            const isSelected = selected === pack;
            const isFeatured = pack === "session_5";
            return (
              <button
                key={pack}
                onClick={() => setSelected(pack)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                  isSelected
                    ? "border-[#0f172b] bg-[#f8fafc]"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                {/* Radio */}
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  isSelected ? "border-[#0f172b]" : "border-gray-300"
                }`}>
                  {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-[#0f172b]" />}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-[#0f172b]" style={{ fontWeight: 600 }}>
                      {copy.packNames[i]}
                    </span>
                    {isFeatured && (
                      <span className="bg-[#50C878] text-white text-[10px] px-1.5 py-0.5 rounded-full" style={{ fontWeight: 600 }}>
                        ⭐
                      </span>
                    )}
                    {detail.discount > 0 && (
                      <span className="text-[10px] text-[#50C878] bg-[#DBEDDF] px-1.5 py-0.5 rounded-full" style={{ fontWeight: 600 }}>
                        -{detail.discount}%
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-[#62748e]">{copy.packTaglines[i]}</span>
                </div>

                {/* Price */}
                <div className="text-right shrink-0">
                  <div className="text-base text-[#0f172b]" style={{ fontWeight: 700 }}>
                    ${detail.price.toFixed(2)}
                  </div>
                  <div className="text-[10px] text-[#62748e]">
                    ${detail.perSession.toFixed(2)}{copy.perSessionSuffix}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 bg-red-50 text-red-600 rounded-xl px-3 py-2 mb-3 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {/* CTA */}
        <motion.button
          onClick={handlePurchase}
          disabled={loading || success}
          className="w-full py-3.5 rounded-full text-white flex items-center justify-center gap-2 text-sm disabled:opacity-70 transition-colors"
          style={{
            fontWeight: 500,
            background: success
              ? "#50C878"
              : "linear-gradient(135deg, #0f172b, #1e293b)",
          }}
          whileHover={{ scale: loading || success ? 1 : 1.02 }}
          whileTap={{ scale: loading || success ? 1 : 0.98 }}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {copy.processing}
            </>
          ) : success ? (
            <>
              <Check className="w-4 h-4" />
              {copy.done}
            </>
          ) : (
            <>
              <ShoppingCart className="w-4 h-4" />
              {copy.buy} — ${CREDIT_PACK_DETAILS[selected].price.toFixed(2)}
            </>
          )}
        </motion.button>

        {/* Trust line */}
        <p className="text-center text-[10px] text-[#94a3b8] mt-3">
          {copy.trustLine}
        </p>
      </div>
    </AppModal>
  );
}