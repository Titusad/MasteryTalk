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
  X,
  Zap,
  Check,
  Loader2,
  ShoppingCart,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import {
  CREDIT_PACK_DETAILS,
  type CreditPack,
} from "../../services/types";
import { paymentService } from "../../services";
import { isPaymentError } from "../../services/errors";
import type { LandingLang } from "./landing-i18n";

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

const UPSELL_ES: UpsellCopy = {
  title: "Compra créditos de sesión",
  subtitle: "Elige un paquete para continuar practicando con GPT-4o",
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
    "Sesión completa con GPT-4o",
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
  subtitle: "Escolha um pacote para continuar praticando com GPT-4o",
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
    "Sessão completa com GPT-4o",
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

const UPSELL_COPIES: Record<LandingLang, UpsellCopy> = { es: UPSELL_ES, pt: UPSELL_PT };

/* ══════════════════════════════════════════════════════════════
   PACK DATA
   ══════════════════════════════════════════════════════════════ */

interface PackDisplay {
  id: CreditPack;
  nameIdx: 0 | 1 | 2;
  sessions: number;
  price: string;
  perSession: string;
  discount: number;
  featured: boolean;
}

const PACKS: PackDisplay[] = [
  { id: "session_1", nameIdx: 0, sessions: 1, price: "$4.99",  perSession: "$4.99", discount: 0,  featured: false },
  { id: "session_3", nameIdx: 1, sessions: 3, price: "$12.99", perSession: "$4.33", discount: 13, featured: false },
  { id: "session_5", nameIdx: 2, sessions: 5, price: "$19.99", perSession: "$4.00", discount: 20, featured: true  },
];

/* ══════════════════════════════════════════════════════════════
   CONFETTI CELEBRATION
   Brand-themed burst fired on successful purchase.
   ══════════════════════════════════════════════════════════════ */

const BRAND_COLORS = ["#00D3F3", "#50C878", "#E1D5F8", "#FFE9C7", "#ffffff"];

function firePurchaseConfetti() {
  // Center burst
  confetti({
    particleCount: 80,
    spread: 70,
    origin: { x: 0.5, y: 0.45 },
    colors: BRAND_COLORS,
    startVelocity: 30,
    gravity: 0.8,
    ticks: 120,
    scalar: 1.1,
    disableForReducedMotion: true,
  });

  // Left cannon
  setTimeout(() => {
    confetti({
      particleCount: 40,
      angle: 60,
      spread: 50,
      origin: { x: 0.15, y: 0.6 },
      colors: BRAND_COLORS,
      startVelocity: 35,
      gravity: 0.9,
      ticks: 100,
      scalar: 0.9,
      disableForReducedMotion: true,
    });
  }, 150);

  // Right cannon
  setTimeout(() => {
    confetti({
      particleCount: 40,
      angle: 120,
      spread: 50,
      origin: { x: 0.85, y: 0.6 },
      colors: BRAND_COLORS,
      startVelocity: 35,
      gravity: 0.9,
      ticks: 100,
      scalar: 0.9,
      disableForReducedMotion: true,
    });
  }, 300);
}

/* ══════════════════════════════════════════════════════════════
   COMPONENT
   ══════════════════════════════════════════════════════════════ */

interface CreditUpsellModalProps {
  open: boolean;
  onClose: () => void;
  /** Called after successful purchase — parent should refresh credit count */
  onPurchaseComplete?: (pack: CreditPack, creditsAdded: number) => void;
  /** Current user uid */
  uid?: string;
  /** Optional remaining credits to show (usually 0) */
  creditsRemaining?: number;
  /** Language — defaults to ES */
  lang?: LandingLang;
}

export function CreditUpsellModal({
  open,
  onClose,
  onPurchaseComplete,
  uid = "mock-uid",
  creditsRemaining = 0,
  lang = "es",
}: CreditUpsellModalProps) {
  const t = UPSELL_COPIES[lang];
  const [selectedPack, setSelectedPack] = useState<CreditPack>("session_5");
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<CreditPack | null>(null);

  const handlePurchase = async () => {
    setError(null);
    setPurchasing(true);

    try {
      await paymentService.createCheckout(uid, selectedPack);
      const pack = CREDIT_PACK_DETAILS[selectedPack];
      setSuccess(selectedPack);

      // Fire confetti celebration
      firePurchaseConfetti();

      // Brief success state, then notify parent
      setTimeout(() => {
        onPurchaseComplete?.(selectedPack, pack.sessions);
        setSuccess(null);
        onClose();
      }, 2200);
    } catch (err) {
      if (isPaymentError(err)) {
        setError(err.userMessage);
      } else {
        setError(t.errorFallback);
      }
    } finally {
      setPurchasing(false);
    }
  };

  const selected = PACKS.find((p) => p.id === selectedPack)!;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <motion.div
            className="relative bg-white rounded-3xl shadow-2xl w-full max-w-[520px] max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>

            {/* Header */}
            <div className="px-6 pt-8 pb-5 text-center border-b border-gray-100">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: "linear-gradient(135deg, #00D3F3, #50C878)" }}
              >
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <h2
                className="text-xl text-gray-900 mb-1.5"
                style={{ fontWeight: 600 }}
              >
                {t.title}
              </h2>
              <p className="text-sm text-[#4B505B]">{t.subtitle}</p>
              {creditsRemaining === 0 && (
                <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-full">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-xs text-amber-700" style={{ fontWeight: 500 }}>
                    {t.noCredits}
                  </span>
                </div>
              )}
            </div>

            {/* Pack selection */}
            <div className="px-6 py-5">
              <div className="grid grid-cols-3 gap-3 mb-5">
                {PACKS.map((pack) => {
                  const isSelected = selectedPack === pack.id;
                  return (
                    <motion.button
                      key={pack.id}
                      onClick={() => { setSelectedPack(pack.id); setError(null); }}
                      className={`relative rounded-xl p-3.5 text-center transition-all border-2 cursor-pointer ${
                        isSelected
                          ? pack.featured
                            ? "bg-[#0f172b] border-[#0f172b] shadow-lg"
                            : "bg-white border-[#0f172b] shadow-md"
                          : "bg-gray-50 border-gray-200 hover:border-gray-300"
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {/* Discount badge */}
                      {pack.discount > 0 && (
                        <div
                          className={`absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[9px] ${
                            isSelected && pack.featured
                              ? "bg-[#50C878] text-white"
                              : "bg-emerald-100 text-emerald-700"
                          }`}
                          style={{ fontWeight: 700 }}
                        >
                          -{pack.discount}%
                        </div>
                      )}

                      {/* Sessions count */}
                      <p
                        className={`text-2xl mb-0.5 ${
                          isSelected && pack.featured ? "text-white" : isSelected ? "text-[#0f172b]" : "text-gray-700"
                        }`}
                        style={{ fontWeight: 800 }}
                      >
                        {pack.sessions}
                      </p>
                      <p
                        className={`text-[10px] uppercase tracking-wider mb-2 ${
                          isSelected && pack.featured ? "text-gray-400" : isSelected ? "text-gray-500" : "text-gray-400"
                        }`}
                        style={{ fontWeight: 600 }}
                      >
                        {pack.sessions === 1 ? t.sessionSingular : t.sessionPlural}
                      </p>

                      {/* Price */}
                      <p
                        className={`text-sm mb-0.5 ${isSelected && pack.featured ? "text-white" : "text-gray-900"}`}
                        style={{ fontWeight: 700 }}
                      >
                        {pack.price}
                      </p>

                      {/* Per-session */}
                      <div className={`flex items-center justify-center gap-1 text-[10px] ${
                        isSelected && pack.featured ? "text-emerald-300" : "text-[#4B505B]"
                      }`}>
                        <Zap className="w-2.5 h-2.5" />
                        <span style={{ fontWeight: 500 }}>
                          {pack.perSession}{t.perSessionSuffix}
                        </span>
                      </div>

                      {/* Selection indicator */}
                      {isSelected && (
                        <motion.div
                          className={`absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center ${
                            pack.featured ? "bg-[#50C878]" : "bg-[#0f172b]"
                          }`}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 500, damping: 25 }}
                        >
                          <Check className="w-3 h-3 text-white" strokeWidth={3} />
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {/* Selected pack summary */}
              <div className="bg-gray-50 rounded-xl p-4 mb-5 border border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm text-gray-900" style={{ fontWeight: 600 }}>
                      {t.packNames[selected.nameIdx]}
                    </p>
                    <p className="text-xs text-[#4B505B]">
                      {t.packTaglines[selected.nameIdx]}
                    </p>
                  </div>
                  <p className="text-xl text-gray-900" style={{ fontWeight: 800 }}>
                    {selected.price}{" "}
                    <span className="text-xs text-gray-400" style={{ fontWeight: 400 }}>USD</span>
                  </p>
                </div>

                {/* Features */}
                <div className="grid grid-cols-2 gap-2">
                  {t.features.map((f) => (
                    <div key={f} className="flex items-start gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" strokeWidth={2.5} />
                      <span className="text-[11px] text-gray-600 leading-tight">{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Error state */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-red-700">{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Success state */}
              <AnimatePresence>
                {success && (
                  <motion.div
                    className="flex items-center justify-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 mb-4"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <Check className="w-4 h-4 text-emerald-600" strokeWidth={3} />
                    <p className="text-sm text-emerald-700" style={{ fontWeight: 500 }}>
                      {t.successMessage}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* CTA */}
              <motion.button
                onClick={handlePurchase}
                disabled={purchasing || !!success}
                className={`w-full py-3.5 rounded-full flex items-center justify-center gap-2 transition-all ${
                  success
                    ? "bg-emerald-500 text-white"
                    : "bg-[#0f172b] text-white hover:bg-[#1d293d] shadow-lg cursor-pointer"
                } disabled:opacity-70 disabled:cursor-not-allowed`}
                style={{ fontWeight: 500 }}
                whileHover={!purchasing && !success ? { scale: 1.01 } : {}}
                whileTap={!purchasing && !success ? { scale: 0.98 } : {}}
              >
                {purchasing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">{t.processing}</span>
                  </>
                ) : success ? (
                  <>
                    <Check className="w-4 h-4" strokeWidth={3} />
                    <span className="text-sm">{t.done}</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" />
                    <span className="text-sm">
                      {t.buy} {t.packNames[selected.nameIdx]} — {selected.price}
                    </span>
                  </>
                )}
              </motion.button>

              {/* Trust line */}
              <p className="text-center text-[10px] text-gray-400 mt-3">
                {t.trustLine}
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ══════════════════════════════════════════════════════════════
   HELPER: Get upsell copy for credit balance chip
   ══════════════════════════════════════════════════════════════ */
export function getCreditsLabel(count: number, lang: LandingLang = "es"): string {
  const t = UPSELL_COPIES[lang];
  return count === 1 ? t.creditsSingular : t.creditsPlural;
}