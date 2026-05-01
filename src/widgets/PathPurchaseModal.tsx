/**
 * PathPurchaseModal — Subscription tier selection + Stripe Checkout
 *
 * Shows 2 tiers (Monthly / Quarterly) with automatic launch pricing.
 * The backend picks early bird price if slots remain — no user action needed.
 * All copy via i18n (ES / PT / EN).
 */

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Check, ArrowRight, Star, Flame } from "lucide-react";
import { AppModal } from "@/shared/ui/AppModal";
import type { SubscriptionTier } from "@/entities/payment";
import type { PaywallReason } from "@/shared/hooks/useUsageGating";
import { paymentService } from "@/services";
import { useLandingCopy } from "@/shared/i18n/LandingLangContext";

/* ── Pricing data from backend ── */

interface PricingData {
  earlyBird:  { slotsLeft: number; available: boolean };
  monthly:    { currentPrice: number; regularPrice: number; isEarlyBird: boolean };
  quarterly:  { currentPrice: number; regularPrice: number; isEarlyBird: boolean; perMonth: number };
}

const PRICING_URL =
  "https://zkuryztcwmazspscomiu.supabase.co/functions/v1/make-server-08b8658d/pricing";

const FALLBACK: PricingData = {
  earlyBird: { slotsLeft: 25, available: true },
  monthly:   { currentPrice: 12.99, regularPrice: 19.99, isEarlyBird: true },
  quarterly: { currentPrice: 29.99, regularPrice: 47.99, isEarlyBird: true, perMonth: 9.99 },
};

/* ── Props ── */

export interface PathPurchaseModalProps {
  open: boolean;
  onClose: () => void;
  scenarioType: string;
  paywallReason: PaywallReason;
  onPurchaseComplete: (purchaseType: any) => void;
  ownedPaths?: string[];
}

/* ── Component ── */

export function PathPurchaseModal({ open, onClose }: PathPurchaseModalProps) {
  const { copy } = useLandingCopy();
  const p        = copy.pricing;

  const [pricing, setPricing]           = useState<PricingData | null>(null);
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier>("monthly");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError]               = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    fetch(PRICING_URL)
      .then(r => r.json())
      .then(data => setPricing({
        earlyBird: { slotsLeft: data.earlyBird.slotsLeft, available: data.earlyBird.available },
        monthly:   { currentPrice: data.monthly.currentPrice, regularPrice: data.monthly.regularPrice, isEarlyBird: data.monthly.isEarlyBird },
        quarterly: { currentPrice: data.quarterly.currentPrice, regularPrice: data.quarterly.regularPrice, isEarlyBird: data.quarterly.isEarlyBird, perMonth: data.quarterly.perMonth },
      }))
      .catch(() => setPricing(FALLBACK));
  }, [open]);

  const pr         = pricing ?? FALLBACK;
  const ebActive   = pr.earlyBird.available;
  const slotsLeft  = pr.earlyBird.slotsLeft;

  const handleCheckout = async () => {
    setIsProcessing(true);
    setError(null);
    try {
      const result = await paymentService.createCheckout("current-user", {
        type: "path",
        tier: selectedTier,
      });
      if (result.checkoutUrl) window.location.href = result.checkoutUrl;
    } catch (err: any) {
      setError(p.modal.cta + " failed. Please try again.");
      setIsProcessing(false);
    }
  };

  const selectedPrice = selectedTier === "quarterly"
    ? pr.quarterly.currentPrice
    : pr.monthly.currentPrice;

  const selectedPeriod = selectedTier === "quarterly"
    ? p.quarterly.period
    : p.monthly.period;

  return (
    <AppModal open={open} onClose={onClose} size="lg">
      <div aria-label="PathPurchaseModal" className="p-6 md:p-8">

        {/* Header */}
        <motion.div
          className="text-center mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <h2 className="text-2xl text-[#0f172b] mb-1.5" style={{ fontWeight: 300 }}>
            {p.modal.headline.split(" ").slice(0, 1).join(" ")}{" "}
            <span style={{ fontWeight: 700 }}>{p.modal.headline.split(" ").slice(1).join(" ")}</span>
          </h2>
          <p className="text-sm text-[#62748e]">{p.modal.subtitle}</p>
        </motion.div>

        {/* Slots counter */}
        {ebActive && (
          <motion.div
            className="flex items-center justify-center gap-2 mb-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
          >
            <span className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold px-3 py-1.5 rounded-full">
              <Flame className="w-3 h-3" />
              {p.slotsLeft.replace("{{count}}", String(slotsLeft))}
            </span>
          </motion.div>
        )}

        {/* Tier cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {/* Monthly */}
          {renderCard({
            id: "monthly",
            label: p.monthly.label,
            period: p.monthly.period,
            currentPrice: pr.monthly.currentPrice,
            regularPrice: pr.monthly.regularPrice,
            isEarlyBird: ebActive,
            badge: ebActive ? p.launchBadge : undefined,
            perMonthLine: undefined,
            features: p.monthly.features,
            selected: selectedTier === "monthly",
            highlight: true,
            onSelect: () => setSelectedTier("monthly"),
          })}

          {/* Quarterly */}
          {renderCard({
            id: "quarterly",
            label: p.quarterly.label,
            period: p.quarterly.period,
            currentPrice: pr.quarterly.currentPrice,
            regularPrice: pr.quarterly.regularPrice,
            isEarlyBird: ebActive,
            badge: ebActive ? p.launchBadge : p.saveBadge,
            perMonthLine: p.quarterly.perMonth.replace("{{price}}", `$${pr.quarterly.perMonth}`),
            features: p.quarterly.features,
            selected: selectedTier === "quarterly",
            highlight: false,
            onSelect: () => setSelectedTier("quarterly"),
          })}
        </div>

        {/* Error */}
        {error && (
          <p className="text-sm text-red-500 text-center mb-4">{error}</p>
        )}

        {/* CTA */}
        <button
          onClick={handleCheckout}
          disabled={isProcessing}
          className="w-full flex items-center justify-center gap-2 bg-[#0f172b] text-white py-3.5 rounded-full text-sm font-semibold hover:bg-[#1d293d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? p.modal.ctaProcessing : (
            <>
              {p.modal.cta} — ${selectedPrice}{selectedPeriod}
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        <p className="text-[10px] text-[#94a3b8] text-center mt-3">
          {p.modal.legal}
        </p>
      </div>
    </AppModal>
  );
}

/* ── Card renderer ── */

interface CardProps {
  id: SubscriptionTier;
  label: string;
  period: string;
  currentPrice: number;
  regularPrice: number;
  isEarlyBird: boolean;
  badge?: string;
  perMonthLine?: string;
  features: readonly string[];
  selected: boolean;
  highlight: boolean;
  onSelect: () => void;
}

function renderCard(c: CardProps) {
  const isDark = c.selected && c.highlight;

  return (
    <motion.button
      key={c.id}
      onClick={c.onSelect}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: c.id === "monthly" ? 0.1 : 0.18 }}
      className={`relative text-left p-5 rounded-2xl border-2 transition-all cursor-pointer w-full ${
        c.selected
          ? c.highlight
            ? "border-[#0f172b] bg-[#0f172b]"
            : "border-[#0f172b] bg-[#f8fafc]"
          : "border-[#e2e8f0] bg-white hover:border-[#94a3b8]"
      }`}
    >
      {/* Badge */}
      {c.badge && (
        <span className={`absolute -top-3 left-4 text-[10px] font-semibold px-2.5 py-1 rounded-full ${
          c.isEarlyBird
            ? "bg-amber-400 text-amber-900"
            : "bg-[#DBEDDF] text-[#0f172b]"
        }`}>
          {c.badge}
        </span>
      )}

      {/* Selected indicator */}
      {c.selected && (
        <div className={`absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center ${
          isDark ? "bg-white" : "bg-[#0f172b]"
        }`}>
          <Check className={`w-3 h-3 ${isDark ? "text-[#0f172b]" : "text-white"}`} strokeWidth={3} />
        </div>
      )}

      {/* Label */}
      <div className="flex items-center gap-1.5 mb-3">
        {c.id === "quarterly" && (
          <Star className={`w-3.5 h-3.5 ${isDark ? "text-emerald-300" : "text-emerald-500"}`} />
        )}
        <span className={`text-sm font-semibold ${isDark ? "text-white" : "text-[#0f172b]"}`}>
          {c.label}
        </span>
      </div>

      {/* Price */}
      <div className="mb-1">
        <span className={`text-3xl font-bold ${isDark ? "text-white" : "text-[#0f172b]"}`}>
          ${c.currentPrice}
        </span>
        <span className={`text-xs ml-1 ${isDark ? "text-white/60" : "text-[#94a3b8]"}`}>
          {c.period}
        </span>
        {/* Strikethrough regular price when EB active */}
        {c.isEarlyBird && c.currentPrice < c.regularPrice && (
          <span className={`ml-2 text-xs line-through ${isDark ? "text-white/30" : "text-[#94a3b8]"}`}>
            ${c.regularPrice}
          </span>
        )}
      </div>

      {/* Per month line (quarterly only) */}
      {c.perMonthLine && (
        <p className={`text-[10px] mb-3 font-medium ${isDark ? "text-white/50" : "text-[#62748e]"}`}>
          {c.perMonthLine}
        </p>
      )}

      {/* Features */}
      <ul className="space-y-1.5 mt-3">
        {c.features.map(f => (
          <li key={f} className="flex items-center gap-2">
            <Check className={`w-3 h-3 shrink-0 ${isDark ? "text-emerald-300" : "text-emerald-500"}`} strokeWidth={3} />
            <span className={`text-xs ${isDark ? "text-white/80" : "text-[#45556c]"}`}>{f}</span>
          </li>
        ))}
      </ul>
    </motion.button>
  );
}
