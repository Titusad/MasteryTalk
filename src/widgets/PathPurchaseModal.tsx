/**
 * ══════════════════════════════════════════════════════════════
 *  PathPurchaseModal — v9.0 Learning Path Purchase Modal
 *
 *  Primary paywall for the per-Learning-Path business model.
 *  Shown when:
 *  1. User tries a second session on a scenario (path-required)
 *  2. User exhausted fresh attempts on a level (attempts-exhausted)
 *
 *  Products:
 *  - Single Path: $24.99 — 4 levels × 3 sessions, permanent access
 *  - All-Access Bundle: $59.99 — All 5 paths
 *  - Booster Pack: $4.99 — +3 fresh sessions (attempts-exhausted only)
 *
 *  Uses canonical AppModal wrapper. Design System compliant.
 * ══════════════════════════════════════════════════════════════
 */

import { useState } from "react";
import { motion } from "motion/react";
import {
  Sparkles,
  Check,
  Zap,
  Crown,
  BookOpen,
  ArrowRight,
  Shield,
  Gift,
} from "lucide-react";
import { AppModal } from "@/shared/ui/AppModal";
import { PATH_PRODUCTS } from "../services/types";
import type { PurchaseType, PurchaseDetails } from "../services/types";
import type { PaywallReason } from "@/app/hooks/useUsageGating";

/* ── Scenario display info ── */

const SCENARIO_INFO: Record<string, { label: string; emoji: string }> = {
  interview: { label: "Job Interview", emoji: "🎯" },
  sales: { label: "Sales Pitch", emoji: "🤝" },
  networking: { label: "Networking", emoji: "🌐" },
  negotiation: { label: "Negotiation", emoji: "⚡" },
  csuite: { label: "Executive Presentation", emoji: "👔" },
};

/* ── Props ── */

export interface PathPurchaseModalProps {
  open: boolean;
  onClose: () => void;
  /** Which scenario triggered the paywall */
  scenarioType: string;
  /** Why the paywall was triggered */
  paywallReason: PaywallReason;
  /** Called when a purchase completes */
  onPurchaseComplete: (purchaseType: PurchaseType) => void;
}

export function PathPurchaseModal({
  open,
  onClose,
  scenarioType,
  paywallReason,
  onPurchaseComplete,
}: PathPurchaseModalProps) {
  const [selectedProduct, setSelectedProduct] = useState<PurchaseType>(
    paywallReason === "attempts-exhausted" ? "booster" : "single_path"
  );
  const [isProcessing, setIsProcessing] = useState(false);

  const scenarioInfo = SCENARIO_INFO[scenarioType] || SCENARIO_INFO.interview;
  const singlePath = PATH_PRODUCTS.single_path;
  const allAccess = PATH_PRODUCTS.all_access;
  const booster = PATH_PRODUCTS.booster;

  const handlePurchase = async () => {
    setIsProcessing(true);

    const details: PurchaseDetails = {
      type: selectedProduct,
      scenarioType: selectedProduct === "single_path" ? scenarioType : undefined,
      levelId: selectedProduct === "booster" ? scenarioType : undefined,
    };

    // TODO: Wire to paymentService.createCheckout(details)
    // For now, simulate success after 1.5s
    console.log("[PathPurchaseModal] Purchase initiated:", details);
    await new Promise((r) => setTimeout(r, 1500));

    setIsProcessing(false);
    onPurchaseComplete(selectedProduct);
  };

  return (
    <AppModal open={open} onClose={onClose} size="lg">
      <div className="p-6 md:p-8">
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

          {paywallReason === "path-required" ? (
            <>
              <h2 className="text-xl font-medium text-[#0f172b] mb-1">
                Unlock the {scenarioInfo.label} Path {scenarioInfo.emoji}
              </h2>
              <p className="text-sm text-[#62748e]">
                Your demo session showed what's possible. Now get the full program.
              </p>
            </>
          ) : (
            <>
              <h2 className="text-xl font-medium text-[#0f172b] mb-1">
                Need more attempts? {scenarioInfo.emoji}
              </h2>
              <p className="text-sm text-[#62748e]">
                You've used your 3 fresh sessions on this level. Grab a booster to keep going.
              </p>
            </>
          )}
        </motion.div>

        {/* ── Product cards ── */}
        <motion.div
          className="space-y-3 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
        >
          {/* Single Path */}
          <ProductCard
            selected={selectedProduct === "single_path"}
            onSelect={() => setSelectedProduct("single_path")}
            icon={<BookOpen className="w-4 h-4" />}
            label={singlePath.label}
            badge={paywallReason === "path-required" ? "BEST VALUE" : undefined}
            price={`$${singlePath.price}`}
            priceDetail={`$${singlePath.perSession}/session`}
            features={[
              "4 progressive levels",
              "3 unique sessions per level",
              "Permanent access — practice anytime",
              "AI feedback + pronunciation analysis",
            ]}
            delay={0.2}
          />

          {/* All-Access Bundle */}
          <ProductCard
            selected={selectedProduct === "all_access"}
            onSelect={() => setSelectedProduct("all_access")}
            icon={<Crown className="w-4 h-4" />}
            label={allAccess.label}
            badge="SAVE 52%"
            price={`$${allAccess.price}`}
            priceDetail={`$${allAccess.perPath}/path`}
            features={[
              "All 5 Learning Paths included",
              "Interview + Sales + Networking + more",
              "Best value for serious learners",
            ]}
            delay={0.25}
          />

          {/* Booster Pack (visible on attempts-exhausted, collapsed on path-required) */}
          {paywallReason === "attempts-exhausted" && (
            <ProductCard
              selected={selectedProduct === "booster"}
              onSelect={() => setSelectedProduct("booster")}
              icon={<Zap className="w-4 h-4" />}
              label={booster.label}
              price={`$${booster.price}`}
              priceDetail="+3 fresh sessions"
              features={[
                "3 new unique sessions for any level",
                "Stack with existing attempts",
              ]}
              delay={0.3}
            />
          )}
        </motion.div>

        {/* ── Trust signals ── */}
        <motion.div
          className="flex items-center justify-center gap-4 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
        >
          <div className="flex items-center gap-1.5 text-xs text-[#62748e]">
            <Shield className="w-3.5 h-3.5 text-[#22c55e]" />
            <span>Secure payment</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#62748e]">
            <Gift className="w-3.5 h-3.5 text-[#6366f1]" />
            <span>Access forever</span>
          </div>
        </motion.div>

        {/* ── CTA Button ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <button
            onClick={handlePurchase}
            disabled={isProcessing}
            className="w-full flex items-center justify-center gap-2 bg-[#0f172b] text-white py-4 rounded-lg text-sm font-medium hover:bg-[#1d293d] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                {selectedProduct === "single_path"
                  ? `Unlock ${scenarioInfo.label} Path — $${singlePath.price}`
                  : selectedProduct === "all_access"
                    ? `Get All Paths — $${allAccess.price}`
                    : `Get Booster — $${booster.price}`}
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
        </motion.div>
      </div>
    </AppModal>
  );
}

/* ══════════════════════════════════════════════════════════════
   PRODUCT CARD (internal)
   ══════════════════════════════════════════════════════════════ */

interface ProductCardProps {
  selected: boolean;
  onSelect: () => void;
  icon: React.ReactNode;
  label: string;
  badge?: string;
  price: string;
  priceDetail: string;
  features: string[];
  delay?: number;
}

function ProductCard({
  selected,
  onSelect,
  icon,
  label,
  badge,
  price,
  priceDetail,
  features,
  delay = 0,
}: ProductCardProps) {
  return (
    <motion.button
      onClick={onSelect}
      className={`w-full text-left rounded-2xl border-2 p-4 transition-all duration-200 cursor-pointer ${
        selected
          ? "border-[#0f172b] bg-[#f8fafc] shadow-sm"
          : "border-[#e2e8f0] bg-white hover:border-[#94a3b8]"
      }`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {/* Radio indicator */}
          <div
            className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
              selected ? "border-[#0f172b] bg-[#0f172b]" : "border-[#94a3b8]"
            }`}
          >
            {selected && (
              <div className="w-1.5 h-1.5 rounded-full bg-white" />
            )}
          </div>

          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center ${
              selected ? "bg-[#0f172b] text-white" : "bg-[#f1f5f9] text-[#62748e]"
            }`}
          >
            {icon}
          </div>

          <span className="text-sm font-medium text-[#0f172b]">{label}</span>

          {badge && (
            <span className="text-[10px] font-medium bg-[#22c55e]/10 text-[#16a34a] px-2 py-0.5 rounded">
              {badge}
            </span>
          )}
        </div>

        <div className="text-right">
          <span className="text-lg font-bold text-[#0f172b]">{price}</span>
          <p className="text-[10px] text-[#94a3b8]">{priceDetail}</p>
        </div>
      </div>

      {/* Features (only visible when selected) */}
      {selected && (
        <motion.div
          className="ml-6 space-y-1.5"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.2 }}
        >
          {features.map((feature) => (
            <div key={feature} className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-[#22c55e] shrink-0" />
              <span className="text-xs text-[#62748e]">{feature}</span>
            </div>
          ))}
        </motion.div>
      )}
    </motion.button>
  );
}
