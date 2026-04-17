/**
 * ══════════════════════════════════════════════════════════════
 *  PathPurchaseModal — Beta Pricing with Stripe Checkout
 *
 *  Two modes:
 *  - Mode A (first purchase): $4.99, path inherited, no selector
 *  - Mode B (additional):     $16.99, path selector shown
 *
 *  Flow: [Optional: select path] → Create Stripe Checkout → Redirect
 *  Uses canonical AppModal wrapper. Design System compliant.
 * ══════════════════════════════════════════════════════════════
 */

import { useState } from "react";
import { motion } from "motion/react";
import {
  Sparkles,
  Check,
  BookOpen,
  ArrowRight,
  Shield,
  Briefcase,
  Users,
  Presentation,
} from "lucide-react";
import { AppModal } from "@/shared/ui/AppModal";
import { PATH_PRODUCTS } from "@/services/types";
import type { PurchaseType } from "@/services/types";
import type { PaywallReason } from "@/shared/hooks/useUsageGating";
import { paymentService } from "@/services";

/* ── Scenario display info ── */

const SCENARIO_OPTIONS: {
  id: string;
  label: string;
  desc: string;
  icon: React.ReactNode;
}[] = [
    {
      id: "interview",
      label: "Job Interview",
      desc: "Prepare for key questions",
      icon: <Briefcase className="w-5 h-5" />,
    },
    {
      id: "meeting",
      label: "Remote Meetings",
      desc: "Lead international meetings",
      icon: <Users className="w-5 h-5" />,
    },
    {
      id: "presentation",
      label: "Presentations",
      desc: "Deliver impactful presentations",
      icon: <Presentation className="w-5 h-5" />,
    },
  ];

const SCENARIO_LABELS: Record<string, string> = {
  interview: "Job Interview",
  meeting: "Remote Meetings",
  presentation: "Presentations",
};

/* ── Props ── */

export interface PathPurchaseModalProps {
  open: boolean;
  onClose: () => void;
  /** Which scenario triggered the paywall (default for first purchase) */
  scenarioType: string;
  /** Why the paywall was triggered */
  paywallReason: PaywallReason;
  /** Called when a purchase completes */
  onPurchaseComplete: (purchaseType: PurchaseType) => void;
  /** Paths the user already owns */
  ownedPaths?: string[];
}

export function PathPurchaseModal({
  open,
  onClose,
  scenarioType,
  paywallReason,
  onPurchaseComplete,
  ownedPaths = [],
}: PathPurchaseModalProps) {
  const isFirstPurchase = ownedPaths.length === 0;
  const product = isFirstPurchase ? PATH_PRODUCTS.first_path : PATH_PRODUCTS.path;

  // For Mode B: track which path the user selects
  const availablePaths = SCENARIO_OPTIONS.filter((s) => !ownedPaths.includes(s.id));
  const [selectedPath, setSelectedPath] = useState<string>(
    // Default to current scenario if available, else first available path
    availablePaths.find((s) => s.id === scenarioType)
      ? scenarioType
      : availablePaths[0]?.id || scenarioType,
  );

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const targetPath = isFirstPurchase ? scenarioType : selectedPath;
  const targetLabel = SCENARIO_LABELS[targetPath] || targetPath;

  const handlePurchase = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      const purchaseType: PurchaseType = isFirstPurchase ? "first_path" : "path";
      const result = await paymentService.createCheckout("current-user", {
        type: purchaseType,
        scenarioType: targetPath,
      });

      // Redirect to Stripe Checkout
      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
      }
    } catch (err: any) {
      console.error("[PathPurchaseModal] Checkout error:", err);
      const backendError = err?.cause?.message || err?.message || "";
      setError(
        `We couldn't process your payment. Please, try again later. ${backendError ? `(Error: ${backendError})` : ""
        }`,
      );
      setIsProcessing(false);
    }
  };

  return (
    <AppModal open={open} onClose={onClose} size="lg">
      <div aria-label="PathPurchaseModal" className="p-6 md:p-8">
        {/* ── Header ── */}
        <motion.div
          className="text-center mb-6"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="w-14 h-14 rounded-2xl bg-[#0f172b] flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-7 h-7 text-white" />
          </div>

          {isFirstPurchase ? (
            <>
              <h2 className="text-xl font-medium text-[#0f172b] mb-1">
                Continue the {targetLabel} Path
              </h2>
              <p className="text-sm text-[#62748e]">
                {paywallReason === "path-required"
                  ? "Your demo session showed what's possible. Unlock the full program at our beta price."
                  : "Continue practicing with full access to this Learning Path."}
              </p>
            </>
          ) : (
            <>
              <h2 className="text-xl font-medium text-[#0f172b] mb-1">
                Choose your next path
              </h2>
              <p className="text-sm text-[#62748e]">
                Expand your training — unlock a new Learning Path.
              </p>
            </>
          )}
        </motion.div>

        {/* ── Path Selector (Mode B only) ── */}
        {!isFirstPurchase && (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
          >
            {SCENARIO_OPTIONS.map((scenario) => {
              const isOwned = ownedPaths.includes(scenario.id);
              const isSelected = selectedPath === scenario.id;
              return (
                <button
                  key={scenario.id}
                  onClick={() => !isOwned && setSelectedPath(scenario.id)}
                  disabled={isOwned}
                  className={`text-left p-3 rounded-xl border-2 transition-all duration-200 ${isOwned
                      ? "border-[#e2e8f0] bg-[#f8fafc] opacity-50 cursor-not-allowed"
                      : isSelected
                        ? "border-[#0f172b] bg-[#f8fafc] shadow-sm"
                        : "border-[#e2e8f0] bg-white hover:border-[#94a3b8] cursor-pointer"
                    }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${isOwned
                      ? "bg-[#22c55e]/10 text-[#22c55e]"
                      : isSelected
                        ? "bg-[#0f172b] text-white"
                        : "bg-[#f1f5f9] text-[#62748e]"
                    }`}>
                    {isOwned ? <Check className="w-4 h-4" /> : scenario.icon}
                  </div>
                  <p className="text-sm font-medium text-[#0f172b]">{scenario.label}</p>
                  <p className="text-[10px] text-[#94a3b8]">
                    {isOwned ? "Already owned ✓" : scenario.desc}
                  </p>
                </button>
              );
            })}
          </motion.div>
        )}

        {/* ── Price display ── */}
        <motion.div
          className="mb-6 rounded-2xl border-2 border-[#0f172b] bg-[#f8fafc] p-4"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#0f172b] text-white flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium text-[#0f172b]">
                {product.label}
              </span>
              {isFirstPurchase && (
                <span className="text-[10px] font-medium bg-[#f59e0b]/10 text-[#d97706] px-2 py-0.5 rounded">
                  BETA PRICE
                </span>
              )}
            </div>
            <div className="text-right">
              <span className="text-lg font-bold text-[#0f172b]">
                ${product.price}
              </span>
              <p className="text-[10px] text-[#94a3b8]">one-time — forever access</p>
            </div>
          </div>

          <div className="space-y-1.5">
            {[
              `Permanent access to ${targetLabel}`,
              "Up to 6 progressive levels",
              "AI feedback + pronunciation coaching",
              "Unlimited reviews",
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#22c55e] shrink-0" />
                <span className="text-xs text-[#62748e]">{feature}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Error message ── */}
        {error && (
          <motion.div
            className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="text-xs text-red-600">{error}</p>
          </motion.div>
        )}

        {/* ── Trust signals ── */}
        <motion.div
          className="flex items-center justify-center gap-4 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-1.5 text-xs text-[#62748e]">
            <Shield className="w-3.5 h-3.5 text-[#22c55e]" />
            <span>Secure payment via Stripe</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#62748e]">
            <Sparkles className="w-3.5 h-3.5 text-[#0ea5e9]" />
            <span>Access forever — no recurring charges</span>
          </div>
        </motion.div>

        {/* ── CTA Button ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <button
            onClick={handlePurchase}
            disabled={isProcessing}
            className="w-full flex items-center justify-center gap-2 bg-[#0f172b] text-white py-4 rounded-lg text-sm font-medium hover:bg-[#1d293d] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Redirecting to checkout...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Unlock {targetLabel} — ${product.price}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <button
            onClick={onClose}
            className="w-full text-center text-sm text-[#94a3b8] hover:text-[#62748e] transition-colors mt-3 py-2"
          >
            Maybe later
          </button>

          {isFirstPurchase && (
            <p className="text-center text-[10px] text-[#94a3b8] mt-2">
              Additional paths available at $16.99 each
            </p>
          )}
        </motion.div>
      </div>
    </AppModal>
  );
}
