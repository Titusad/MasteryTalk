/**
 * AppModal — Canonical modal wrapper for all internal app modals.
 *
 * Sizes:
 *   sm   → max-w-sm   — Simple confirmations
 *   md   → max-w-md   — AuthModal, LanguageTransitionModal
 *   lg   → max-w-2xl  — CreditUpsellModal, complex forms
 *   full → fullscreen — LevelDrawer, report views
 *
 * Fixed specs (never modify):
 *   Backdrop  : bg-[#0f172b]/60 backdrop-blur-sm
 *   Card      : bg-white rounded-3xl shadow-2xl overflow-hidden
 *   Animation : scale 0.92→1, y 24→0, opacity 0→1, 0.5s spring
 *   Close btn : absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100
 */

import { X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import type React from "react";

const SIZE_MAX_W: Record<"sm" | "md" | "lg" | "full", string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-2xl",
  full: "",
};

export interface AppModalProps {
  open: boolean;
  onClose: () => void;
  size?: "sm" | "md" | "lg" | "full";
  showCloseButton?: boolean;
  /** Thin green brand accent bar (4px) at the very top of the card */
  accentBar?: boolean;
  children: React.ReactNode;
}

export function AppModal({
  open,
  onClose,
  size = "md",
  showCloseButton = true,
  accentBar = false,
  children,
}: AppModalProps) {
  const isFull = size === "full";

  return (
    <AnimatePresence>
      {open && (
        <motion.div aria-label=\"AppModal"
          className="fixed inset-0 z-[200] flex items-center justify-center p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-[#0f172b]/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Card */}
          <motion.div
            className={`relative z-10 bg-white shadow-2xl overflow-hidden w-full ${
              isFull
                ? "h-full rounded-none"
                : `${SIZE_MAX_W[size]} rounded-3xl`
            }`}
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 24 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            {accentBar && <div className="h-1 bg-[#00C950] w-full" />}

            {showCloseButton && (
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors z-10"
              >
                <X className="w-4 h-4 text-[#45556c]" />
              </button>
            )}

            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
