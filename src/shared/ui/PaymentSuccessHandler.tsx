/**
 * ══════════════════════════════════════════════════════════════
 *  PaymentSuccessHandler — Post-payment redirect handler
 *
 *  Detects ?payment=success in the URL hash after Stripe Checkout
 *  redirect and shows a success notification + refreshes user data.
 *
 *  Mount once in App.tsx — renders nothing visible except the toast.
 *
 *  FIX: Waits for auth to be ready before processing, preventing
 *  the "user appears logged out" issue after Stripe redirect.
 * ══════════════════════════════════════════════════════════════
 */

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, X } from "lucide-react";

interface PaymentSuccessHandlerProps {
  /** Whether auth state has been restored */
  authReady: boolean;
  /** Called to refresh user profile after successful payment */
  onPaymentConfirmed?: () => void;
}

export function PaymentSuccessHandler({
  authReady,
  onPaymentConfirmed,
}: PaymentSuccessHandlerProps) {
  const [visible, setVisible] = useState(false);
  const [purchaseInfo, setPurchaseInfo] = useState<{
    type: string;
    scenario: string;
  } | null>(null);
  const processedRef = useRef(false);

  useEffect(() => {
    // Don't process until auth is ready
    if (!authReady) return;
    // Don't double-process
    if (processedRef.current) return;

    // Parse hash-based query params: /#/dashboard?payment=success&type=first_path&scenario=interview
    const hash = window.location.hash;
    if (!hash.includes("payment=success")) return;

    // Extract params from the hash
    const queryStart = hash.indexOf("?");
    if (queryStart === -1) return;

    const params = new URLSearchParams(hash.slice(queryStart));
    const paymentStatus = params.get("payment");

    if (paymentStatus === "success") {
      processedRef.current = true;
      const type = params.get("type") || "first_path";
      const scenario = params.get("scenario") || "";

      setPurchaseInfo({ type, scenario });
      setVisible(true);

      // Refresh user data
      onPaymentConfirmed?.();

      // Navigate to dashboard with clean URL
      window.history.replaceState(null, "", "#/dashboard");

      // Auto-dismiss after 6 seconds
      const timer = setTimeout(() => setVisible(false), 6000);
      return () => clearTimeout(timer);
    }

    if (params.get("payment") === "cancelled") {
      processedRef.current = true;
      // Clean up cancelled params silently
      window.history.replaceState(null, "", "#/dashboard");
    }
  }, [authReady, onPaymentConfirmed]);

  const label =
    purchaseInfo?.type === "first_path"
      ? "Learning Path unlocked!"
      : "Learning Path unlocked!";

  return (
    <AnimatePresence>
      {visible && (
        <motion.div aria-label="PaymentSuccessHandler"
          className="fixed top-4 right-4 z-50 max-w-sm"
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.3 }}
        >
          <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-lg p-4 flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#22c55e]/10 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-[#22c55e]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#0f172b]">
                Payment successful!
              </p>
              <p className="text-xs text-[#62748e] mt-0.5">
                {label} Start practicing now.
              </p>
            </div>
            <button
              onClick={() => setVisible(false)}
              className="text-[#94a3b8] hover:text-[#62748e] transition-colors shrink-0 mt-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
