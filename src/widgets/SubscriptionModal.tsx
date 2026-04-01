/**
 * ══════════════════════════════════════════════════════════════
 *  SubscriptionModal — PRO plan + Pay-per-session paywall
 *
 *  Replaces CreditUpsellModal as the primary conversion UI.
 *  Triggered from ConversationalPathUnlockScreen and usage gating.
 *
 *  Plans:
 *   - PRO Monthly:  $19.99/mo (unlimited sessions)
 *   - PRO Annual:   $13.99/mo ($167.88/yr, ~30% off)
 *   - Pay-per-session: $4.99 (single session, no commitment)
 *
 *  Design: dark modal, indigo accents, savings badge on annual.
 * ══════════════════════════════════════════════════════════════
 */
import { useState } from "react";
import {
  Crown,
  Check,
  Loader2,
  Sparkles,
  AlertCircle,
  Zap,
  Shield,
  TrendingUp,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import { AppModal } from "@/shared/ui/AppModal";
import { paymentService, authService } from "@/services";
import { isPaymentError } from "@/services/errors";
import type { PaywallReason } from "@/app/hooks/useUsageGating";

/* ══════════════════════════════════════════════════════════════
   PRICING
   ══════════════════════════════════════════════════════════════ */

type PlanId = "pro-monthly" | "pro-annual" | "per-session";

interface PlanOption {
  id: PlanId;
  name: string;
  price: number;
  period: string;
  perMonth: number;
  savings?: string;
  featured?: boolean;
  features: string[];
}

const PLANS: PlanOption[] = [
  {
    id: "pro-annual",
    name: "PRO Annual",
    price: 167.88,
    period: "/year",
    perMonth: 13.99,
    savings: "Save 30%",
    featured: true,
    features: [
      "Unlimited sessions",
      "Full Skill Drills with AI scoring",
      "Conversational Path progression",
      "Priority support",
    ],
  },
  {
    id: "pro-monthly",
    name: "PRO Monthly",
    price: 19.99,
    period: "/month",
    perMonth: 19.99,
    features: [
      "Unlimited sessions",
      "Full Skill Drills with AI scoring",
      "Conversational Path progression",
    ],
  },
  {
    id: "per-session",
    name: "Single Session",
    price: 4.99,
    period: "one-time",
    perMonth: 4.99,
    features: [
      "One full AI practice session",
      "Complete feedback report",
      "No commitment",
    ],
  },
];

/* ══════════════════════════════════════════════════════════════
   PAYWALL REASON COPY (contextual headers)
   ══════════════════════════════════════════════════════════════ */

interface PaywallContextCopy {
  headline: string;
  subheadline: string;
}

const PAYWALL_CONTEXT: Record<PaywallReason, PaywallContextCopy> = {
  "extra-practice": {
    headline: "Ready to keep improving?",
    subheadline: "You've used your free attempts. Unlock unlimited practice to perfect your skills.",
  },
  "download-report": {
    headline: "Save your personalized report",
    subheadline: "Download your full PDF — power phrases, feedback, and strategies ready to use.",
  },
  "new-session": {
    headline: "Start your next session",
    subheadline: "You've used your free session. Go PRO for unlimited coaching.",
  },
};

const DEFAULT_CONTEXT: PaywallContextCopy = {
  headline: "Upgrade to PRO",
  subheadline: "Unlimited sessions, Skill Drills, and Conversational Path progression.",
};

/* ══════════════════════════════════════════════════════════════
   COMPONENT
   ══════════════════════════════════════════════════════════════ */

interface SubscriptionModalProps {
  open: boolean;
  onClose: () => void;
  /** Called after successful purchase/subscription (for backward compat) */
  onPurchaseComplete?: (planId: PlanId, creditsAdded: number) => void;
  paywallReason?: PaywallReason;
  /** Pre-select a plan when the modal opens (matches the CTA the user tapped) */
  defaultPlan?: PlanId;
}

export function SubscriptionModal({
  open,
  onClose,
  onPurchaseComplete,
  paywallReason,
  defaultPlan = "pro-annual",
}: SubscriptionModalProps) {
  const [selected, setSelected] = useState<PlanId>(defaultPlan);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ctx = paywallReason ? PAYWALL_CONTEXT[paywallReason] : DEFAULT_CONTEXT;
  const selectedPlan = PLANS.find((p) => p.id === selected)!;

  const handlePurchase = async () => {
    setLoading(true);
    setError(null);
    try {
      const user = authService.getCurrentUser();
      if (!user) throw new Error("Not authenticated");

      // For MVP: all plans go through createCheckout
      // In production, subscriptions would use a different flow (Stripe Billing / MP recurring)
      if (selected === "per-session") {
        await paymentService.createCheckout(user.uid, "session_1");
      } else {
        // Subscription plans — for now, simulate with createCheckout
        // TODO: Replace with paymentService.createSubscription() when Stripe/MP billing is integrated
        await paymentService.createCheckout(user.uid, "session_5");
      }

      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 },
        colors: ["#6366f1", "#22c55e", "#f59e0b", "#ec4899"],
      });

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        const creditsAdded = selected === "per-session" ? 1 : 999; // Unlimited for subs
        onPurchaseComplete?.(selected, creditsAdded);
      }, 1600);
    } catch (err) {
      if (isPaymentError(err)) {
        setError(err.message);
      } else {
        setError("An error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppModal open={open} onClose={onClose} size="md" showCloseButton={true}>
      <div className="bg-[#0f172b] rounded-xl overflow-hidden">
        {/* ── Header ── */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6366f1] to-[#4f46e5] flex items-center justify-center">
              <Crown className="w-4 h-4 text-white" />
            </div>
            <span className="text-xs font-semibold text-[#6366f1] uppercase tracking-wider">
              inFluentia PRO
            </span>
          </div>
          <h2 className="text-xl font-bold text-white mb-1">
            {ctx.headline}
          </h2>
          <p className="text-sm text-[#94a3b8]">
            {ctx.subheadline}
          </p>
        </div>

        {/* ── Plan selector ── */}
        <div className="px-6 space-y-2.5 mb-5">
          {PLANS.map((plan) => {
            const isSelected = selected === plan.id;
            return (
              <button
                key={plan.id}
                onClick={() => setSelected(plan.id)}
                className={`w-full relative flex items-start gap-3 p-4 rounded-xl border-2 transition-all text-left cursor-pointer ${
                  isSelected
                    ? "border-[#6366f1] bg-[#6366f1]/10"
                    : "border-[#334155] bg-[#1e293b]/50 hover:border-[#475569]"
                }`}
              >
                {/* Savings badge */}
                {plan.savings && (
                  <span className="absolute -top-2.5 right-3 bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-sm">
                    {plan.savings}
                  </span>
                )}

                {/* Radio */}
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                    isSelected ? "border-[#6366f1]" : "border-[#475569]"
                  }`}
                >
                  {isSelected && (
                    <motion.div
                      className="w-2.5 h-2.5 rounded-full bg-[#6366f1]"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", damping: 15 }}
                    />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm font-semibold text-white">
                      {plan.name}
                    </span>
                    <div className="text-right">
                      {plan.id === "per-session" ? (
                        <span className="text-lg font-bold text-white">
                          ${plan.price}
                        </span>
                      ) : (
                        <>
                          <span className="text-lg font-bold text-white">
                            ${plan.perMonth}
                          </span>
                          <span className="text-xs text-[#94a3b8]">/mo</span>
                        </>
                      )}
                    </div>
                  </div>

                  {plan.id === "pro-annual" && (
                    <p className="text-[11px] text-[#94a3b8] mt-0.5">
                      Billed ${plan.price}/year · That's less than 4 single sessions
                    </p>
                  )}
                  {plan.id === "pro-monthly" && (
                    <p className="text-[11px] text-[#94a3b8] mt-0.5">
                      Cancel anytime · 4 sessions = it pays for itself
                    </p>
                  )}
                  {plan.id === "per-session" && (
                    <p className="text-[11px] text-[#94a3b8] mt-0.5">
                      No commitment · Full session + feedback
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* ── Features list (for selected plan) ── */}
        <div className="px-6 mb-5">
          <div className="bg-[#1e293b]/60 rounded-xl p-4 space-y-2">
            {selectedPlan.features.map((f) => (
              <div key={f} className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-xs text-[#cbd5e1]">{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Conversion anchor ── */}
        {selected !== "per-session" && (
          <div className="px-6 mb-4">
            <div className="flex items-center gap-2 bg-[#6366f1]/5 border border-[#6366f1]/20 rounded-lg px-3 py-2">
              <TrendingUp className="w-4 h-4 text-[#6366f1] shrink-0" />
              <p className="text-[11px] text-[#94a3b8]">
                <span className="text-[#6366f1] font-semibold">
                  4 sessions = the subscription pays for itself.
                </span>{" "}
                Most users practice 6-8 times per month.
              </p>
            </div>
          </div>
        )}

        {/* ── Error ── */}
        <AnimatePresence>
          {error && (
            <motion.div
              className="px-6 mb-3"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span className="text-xs text-red-300">{error}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── CTA ── */}
        <div className="px-6 pb-4">
          <motion.button
            onClick={handlePurchase}
            disabled={loading || success}
            className="w-full py-3.5 rounded-xl text-white flex items-center justify-center gap-2 text-sm font-semibold disabled:opacity-70 transition-all cursor-pointer"
            style={{
              background: success
                ? "#22c55e"
                : "linear-gradient(135deg, #6366f1, #4f46e5)",
            }}
            whileHover={{ scale: loading || success ? 1 : 1.02 }}
            whileTap={{ scale: loading || success ? 1 : 0.98 }}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : success ? (
              <>
                <Check className="w-4 h-4" />
                Welcome to PRO!
              </>
            ) : selected === "per-session" ? (
              <>
                <Zap className="w-4 h-4" />
                Buy Session — $4.99
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                {selected === "pro-annual"
                  ? `Go PRO — $${PLANS[0].perMonth}/mo`
                  : `Go PRO — $${PLANS[1].price}/mo`}
              </>
            )}
          </motion.button>
        </div>

        {/* ── Trust signals ── */}
        <div className="px-6 pb-6">
          <div className="flex items-center justify-center gap-4 text-[10px] text-[#64748b]">
            <div className="flex items-center gap-1">
              <Shield className="w-3 h-3" />
              Secure payment
            </div>
            <span>·</span>
            <span>Cancel anytime</span>
            <span>·</span>
            <span>Instant access</span>
          </div>
        </div>
      </div>
    </AppModal>
  );
}

/* ── Backward-compat export for existing imports ── */
export { SubscriptionModal as CreditUpsellModal };
export type { PlanId };
