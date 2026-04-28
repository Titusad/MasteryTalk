/**
 * PathPurchaseModal — Subscription tier selection + Stripe Checkout
 *
 * Shows 3 tiers: Early Bird ($9.99), Monthly ($16.99), Quarterly ($39.99)
 * Fetches live Early Bird availability from backend on open.
 */

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Check, Zap, ArrowRight, Star } from "lucide-react";
import { AppModal } from "@/shared/ui/AppModal";
import type { SubscriptionTier } from "@/entities/payment";
import type { PaywallReason } from "@/shared/hooks/useUsageGating";
import { paymentService } from "@/services";

/* ── Tier card data ── */

interface TierInfo {
  id: SubscriptionTier;
  label: string;
  price: string;
  period: string;
  badge?: string;
  highlight?: boolean;
  features: string[];
}

const TIERS: TierInfo[] = [
  {
    id: "early_bird",
    label: "Early Bird",
    price: "$9.99",
    period: "/mes · para siempre",
    badge: "Precio vitalicio",
    features: [
      "Todos los paths incluidos",
      "WhatsApp SR Coach diario",
      "Precio nunca sube",
      "Máximo 20 suscriptores",
    ],
  },
  {
    id: "monthly",
    label: "Monthly Pro",
    price: "$16.99",
    period: "/mes",
    highlight: true,
    features: [
      "Todos los paths incluidos",
      "WhatsApp SR Coach diario",
      "Cancela cuando quieras",
    ],
  },
  {
    id: "quarterly",
    label: "Quarterly Pro",
    price: "$39.99",
    period: "/ 3 meses",
    badge: "Ahorra 21%",
    features: [
      "Todos los paths incluidos",
      "WhatsApp SR Coach diario",
      "$13.33/mes equivalente",
    ],
  },
];

/* ── Props ── */

export interface PathPurchaseModalProps {
  open: boolean;
  onClose: () => void;
  scenarioType: string;
  paywallReason: PaywallReason;
  onPurchaseComplete: (purchaseType: any) => void;
  ownedPaths?: string[];
}

/* ── Main component ── */

export function PathPurchaseModal({
  open,
  onClose,
}: PathPurchaseModalProps) {
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier>("monthly");
  const [earlyBirdSlots, setEarlyBirdSlots] = useState<{ used: number; max: number; available: boolean } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch Early Bird availability when modal opens
  useEffect(() => {
    if (!open) return;
    fetch(`https://zkuryztcwmazspscomiu.supabase.co/functions/v1/make-server-08b8658d/pricing`)
      .then(r => r.json())
      .then(data => {
        setEarlyBirdSlots({
          used: data.earlyBird.slotsUsed,
          max: data.earlyBird.maxSlots,
          available: data.earlyBird.available,
        });
        // Auto-switch to monthly if Early Bird is full
        if (!data.earlyBird.available && selectedTier === "early_bird") {
          setSelectedTier("monthly");
        }
      })
      .catch(() => setEarlyBirdSlots({ used: 0, max: 20, available: true }));
  }, [open]);

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
      const msg = err?.cause?.message || err?.message || "";
      if (msg.includes("full") || msg.includes("20/20")) {
        setError("Early Bird is sold out. Please select another plan.");
        setSelectedTier("monthly");
      } else {
        setError("Payment failed. Please try again.");
      }
      setIsProcessing(false);
    }
  };

  const earlyBirdAvailable = earlyBirdSlots?.available !== false;
  const slotsLeft = earlyBirdSlots ? earlyBirdSlots.max - earlyBirdSlots.used : null;

  return (
    <AppModal open={open} onClose={onClose} size="lg">
      <div aria-label="PathPurchaseModal" className="p-6 md:p-8">

        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h2 className="text-2xl text-[#0f172b] mb-2" style={{ fontWeight: 300 }}>
            Accede a todo <span style={{ fontWeight: 700 }}>MasteryTalk PRO</span>
          </h2>
          <p className="text-sm text-[#62748e]">
            Todos los paths, WhatsApp SR Coach, sin límite de sesiones.
          </p>
        </motion.div>

        {/* Tier cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {TIERS.map((tier, i) => {
            const isSelected = selectedTier === tier.id;
            const isEarlyBird = tier.id === "early_bird";
            const isDisabled = isEarlyBird && !earlyBirdAvailable;

            return (
              <motion.button
                key={tier.id}
                onClick={() => !isDisabled && setSelectedTier(tier.id)}
                disabled={isDisabled}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className={`relative text-left p-5 rounded-2xl border-2 transition-all ${
                  isDisabled
                    ? "border-[#e2e8f0] opacity-40 cursor-not-allowed"
                    : isSelected
                    ? tier.highlight
                      ? "border-[#0f172b] bg-[#0f172b] text-white"
                      : "border-[#0f172b] bg-[#f8fafc]"
                    : "border-[#e2e8f0] bg-white hover:border-[#94a3b8] cursor-pointer"
                }`}
              >
                {/* Badge */}
                {tier.badge && !isDisabled && (
                  <span className={`absolute -top-3 left-4 text-[10px] font-semibold px-2.5 py-1 rounded-full ${
                    isEarlyBird ? "bg-amber-400 text-amber-900" : "bg-[#DBEDDF] text-[#0f172b]"
                  }`}>
                    {tier.badge}
                  </span>
                )}

                {/* Selected indicator */}
                {isSelected && (
                  <div className={`absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center ${
                    tier.highlight ? "bg-white" : "bg-[#0f172b]"
                  }`}>
                    <Check className={`w-3 h-3 ${tier.highlight ? "text-[#0f172b]" : "text-white"}`} strokeWidth={3} />
                  </div>
                )}

                {/* Tier name */}
                <div className="flex items-center gap-1.5 mb-3">
                  {isEarlyBird && <Zap className={`w-4 h-4 ${isSelected && tier.highlight ? "text-amber-300" : "text-amber-500"}`} />}
                  {tier.id === "quarterly" && <Star className={`w-4 h-4 ${isSelected && tier.highlight ? "text-emerald-300" : "text-emerald-500"}`} />}
                  <span className={`text-sm font-semibold ${isSelected && tier.highlight ? "text-white" : "text-[#0f172b]"}`}>
                    {tier.label}
                  </span>
                </div>

                {/* Price */}
                <div className="mb-4">
                  <span className={`text-3xl font-bold ${isSelected && tier.highlight ? "text-white" : "text-[#0f172b]"}`}>
                    {tier.price}
                  </span>
                  <span className={`text-xs ml-1 ${isSelected && tier.highlight ? "text-white/60" : "text-[#94a3b8]"}`}>
                    {tier.period}
                  </span>
                </div>

                {/* Features */}
                <ul className="space-y-1.5">
                  {tier.features.map(f => (
                    <li key={f} className="flex items-center gap-2">
                      <Check className={`w-3 h-3 shrink-0 ${isSelected && tier.highlight ? "text-emerald-300" : "text-emerald-500"}`} strokeWidth={3} />
                      <span className={`text-xs ${isSelected && tier.highlight ? "text-white/80" : "text-[#45556c]"}`}>{f}</span>
                    </li>
                  ))}
                </ul>

                {/* Early Bird slots */}
                {isEarlyBird && slotsLeft !== null && (
                  <div className={`mt-3 pt-3 border-t ${isSelected ? "border-white/20" : "border-[#e2e8f0]"}`}>
                    <p className={`text-[10px] font-medium ${isSelected && tier.highlight ? "text-amber-300" : "text-amber-600"}`}>
                      {earlyBirdAvailable
                        ? `${slotsLeft} de 20 slots disponibles`
                        : "Sold out — elige otro plan"}
                    </p>
                  </div>
                )}
              </motion.button>
            );
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
          className="w-full flex items-center justify-center gap-2 bg-[#0f172b] text-white py-3.5 rounded-full text-sm font-medium hover:bg-[#1d293d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? "Redirigiendo a Stripe..." : (
            <>
              Suscribirse — {TIERS.find(t => t.id === selectedTier)?.price}
              {selectedTier === "quarterly" ? " / 3 meses" : "/mes"}
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        <p className="text-[10px] text-[#94a3b8] text-center mt-3">
          Pago seguro con Stripe · Cancela cuando quieras
        </p>
      </div>
    </AppModal>
  );
}
