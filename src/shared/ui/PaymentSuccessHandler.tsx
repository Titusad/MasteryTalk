/**
 * PaymentSuccessHandler — Subscription confirmation modal with confetti
 *
 * Detects ?payment=success in the URL hash after Stripe Checkout redirect.
 * Shows a celebration modal with animated confetti (motion/react only, no external lib).
 * Waits for auth to be ready before processing to prevent "logged out" flash.
 */

import { useEffect, useState, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, Sparkles } from "lucide-react";

const TIER_LABELS: Record<string, string> = {
  early_bird: "Early Bird",
  monthly: "Monthly Pro",
  quarterly: "Quarterly Pro",
};

const CONFETTI_COLORS = [
  "#22c55e", "#6366f1", "#f59e0b", "#3b82f6",
  "#ec4899", "#0f172b", "#00C950", "#FFE9C7",
];

interface Particle {
  id: number;
  color: string;
  startX: number;
  endX: number;
  endY: number;
  rotate: number;
  delay: number;
  size: number;
  isRect: boolean;
}

interface PaymentSuccessHandlerProps {
  authReady: boolean;
  onPaymentConfirmed?: () => void;
  onNavigateToDashboard?: () => void;
}

export function PaymentSuccessHandler({
  authReady,
  onPaymentConfirmed,
  onNavigateToDashboard,
}: PaymentSuccessHandlerProps) {
  const [visible, setVisible] = useState(false);
  const [tier, setTier] = useState<string>("monthly");
  const processedRef = useRef(false);

  // Stable particle set — computed once
  const particles = useMemo<Particle[]>(() =>
    Array.from({ length: 60 }, (_, i) => ({
      id: i,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      startX: (Math.random() - 0.5) * 120,
      endX: (Math.random() - 0.5) * window.innerWidth * 1.4,
      endY: window.innerHeight * 0.7 + Math.random() * 300,
      rotate: Math.random() * 720 - 360,
      delay: Math.random() * 0.6,
      size: Math.random() * 10 + 5,
      isRect: Math.random() > 0.4,
    }))
  , []);

  useEffect(() => {
    if (!authReady) return;
    if (processedRef.current) return;

    const hash = window.location.hash;
    if (!hash.includes("payment=success")) return;

    const queryStart = hash.indexOf("?");
    if (queryStart === -1) return;

    const params = new URLSearchParams(hash.slice(queryStart));
    if (params.get("payment") !== "success") return;

    processedRef.current = true;
    const detectedTier = params.get("tier") || "monthly";
    setTier(detectedTier);
    setVisible(true);

    // Clean URL immediately
    window.history.replaceState(null, "", "#dashboard");

    onPaymentConfirmed?.();
  }, [authReady, onPaymentConfirmed]);

  // Also handle payment=cancelled silently
  useEffect(() => {
    if (!authReady) return;
    const hash = window.location.hash;
    if (hash.includes("payment=cancelled")) {
      window.history.replaceState(null, "", "#dashboard");
    }
  }, [authReady]);

  const handleClose = () => {
    setVisible(false);
    onNavigateToDashboard?.();
  };

  const tierLabel = TIER_LABELS[tier] ?? "Pro";

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Confetti — full screen, pointer-events-none */}
          <div className="fixed inset-0 z-[60] pointer-events-none overflow-hidden">
            {particles.map((p) => (
              <motion.div
                key={p.id}
                className="absolute"
                style={{
                  width: p.size,
                  height: p.isRect ? p.size * 0.4 : p.size,
                  backgroundColor: p.color,
                  borderRadius: p.isRect ? 2 : "50%",
                  left: "50%",
                  top: "20%",
                }}
                initial={{ x: p.startX, y: 0, opacity: 1, rotate: 0, scale: 1 }}
                animate={{
                  x: p.endX,
                  y: p.endY,
                  opacity: 0,
                  rotate: p.rotate,
                  scale: 0.3,
                }}
                transition={{
                  duration: 2.2,
                  delay: p.delay,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
              />
            ))}
          </div>

          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[70] bg-[#0f172b]/60 backdrop-blur-sm flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Modal card */}
            <motion.div
              className="bg-white rounded-3xl shadow-2xl overflow-hidden w-full max-w-md"
              initial={{ scale: 0.88, y: 32, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.92, y: 16, opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
            >
              {/* Green accent bar */}
              <div className="h-1.5 bg-gradient-to-r from-[#00C950] via-[#22c55e] to-[#6366f1]" />

              <div className="p-8 flex flex-col items-center text-center">
                {/* Icon */}
                <motion.div
                  className="w-20 h-20 rounded-full bg-[#DBEDDF] flex items-center justify-center mb-5"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
                >
                  <CheckCircle2 className="w-10 h-10 text-[#00C950]" />
                </motion.div>

                {/* Headline */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                >
                  <p className="text-xs font-medium text-[#6366f1] uppercase tracking-widest mb-2">
                    Subscription confirmed
                  </p>
                  <h2 className="text-2xl font-semibold text-[#0f172b] mb-1">
                    You're officially in!
                  </h2>
                  <p className="text-sm text-[#45556c]">
                    <span className="font-medium text-[#0f172b]">{tierLabel}</span> is now active
                  </p>
                </motion.div>

                {/* What's unlocked */}
                <motion.div
                  className="mt-6 w-full bg-[#f0f4f8] rounded-2xl p-4 text-left"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.4 }}
                >
                  <p className="text-xs font-medium text-[#62748e] uppercase tracking-wide mb-3">
                    Unlocked for you
                  </p>
                  {[
                    "All practice paths & levels",
                    "Unlimited sessions",
                    "AI coaching & detailed feedback",
                    "Spaced repetition system",
                  ].map((item, i) => (
                    <motion.div
                      key={item}
                      className="flex items-center gap-2 mb-2 last:mb-0"
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.45 + i * 0.07, duration: 0.3 }}
                    >
                      <div className="w-4 h-4 rounded-full bg-[#00C950]/15 flex items-center justify-center shrink-0">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#00C950]" />
                      </div>
                      <span className="text-sm text-[#0f172b]">{item}</span>
                    </motion.div>
                  ))}
                </motion.div>

                {/* CTA */}
                <motion.button
                  onClick={handleClose}
                  className="mt-6 w-full bg-[#0f172b] text-white px-5 py-3 rounded-lg text-sm font-medium hover:bg-[#1d293d] transition-colors flex items-center justify-center gap-2"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.75, duration: 0.3 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Sparkles className="w-4 h-4" />
                  Explore your paths
                </motion.button>

                <motion.p
                  className="mt-3 text-xs text-[#94a3b8]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9 }}
                >
                  Manage your subscription anytime from Account settings
                </motion.p>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
