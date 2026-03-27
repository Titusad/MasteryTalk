/**
 * ══════════════════════════════════════════════════════════════
 *  ServiceErrorBanner — Inline error display for service failures
 *
 *  Renders contextual error messages with retry/dismiss actions.
 *  Adapts visuals based on severity (warning vs error vs fatal).
 *  Shows different CTAs based on recovery strategy.
 * ══════════════════════════════════════════════════════════════
 */
import { AlertTriangle, RefreshCw, X, WifiOff, Mic, CreditCard } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import type { ServiceError, RecoveryStrategy, ErrorSeverity } from "@/services/errors";

interface ServiceErrorBannerProps {
  error: ServiceError | null;
  onRetry?: () => void;
  onDismiss?: () => void;
  onNavigate?: () => void;
  /** Optional override for the CTA label */
  retryLabel?: string;
  /** Compact mode for inline placement */
  compact?: boolean;
  className?: string;
}

/* ── Severity → visual config ── */
const SEVERITY_STYLES: Record<
  ErrorSeverity,
  { bg: string; border: string; icon: string; text: string }
> = {
  warning: {
    bg: "bg-[#FFF8E1]",
    border: "border-[#FFE082]",
    icon: "text-[#F9A825]",
    text: "text-[#5D4037]",
  },
  error: {
    bg: "bg-[#FFF0F0]",
    border: "border-[#FFCDD2]",
    icon: "text-[#E53935]",
    text: "text-[#4A1C1C]",
  },
  fatal: {
    bg: "bg-[#FBE9E7]",
    border: "border-[#FF8A65]",
    icon: "text-[#BF360C]",
    text: "text-[#3E2723]",
  },
};

/* ── Error code → specific icon ── */
function getErrorIcon(code: string) {
  if (code.startsWith("MICROPHONE")) return Mic;
  if (code.includes("NETWORK") || code.includes("TIMEOUT")) return WifiOff;
  if (code.startsWith("PAYMENT") || code.startsWith("CHECKOUT") || code.startsWith("SUBSCRIPTION") || code.startsWith("WEBHOOK"))
    return CreditCard;
  return AlertTriangle;
}

/* ── Recovery strategy → CTA config ── */
function getRecoveryCTA(
  recovery: RecoveryStrategy,
  retryLabel?: string
): { label: string; show: boolean } {
  switch (recovery) {
    case "retry":
    case "retry-manual":
      return { label: retryLabel ?? "Intentar de nuevo", show: true };
    case "user-action":
      return { label: "Entendido", show: true };
    case "navigate":
      return { label: "Ir al dashboard", show: true };
    case "degrade":
      return { label: "Continuar sin esto", show: true };
    case "none":
      return { label: "", show: false };
    default:
      return { label: "Intentar de nuevo", show: true };
  }
}

export function ServiceErrorBanner({
  error,
  onRetry,
  onDismiss,
  onNavigate,
  retryLabel,
  compact = false,
  className = "",
}: ServiceErrorBannerProps) {
  return (
    <AnimatePresence>
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -8, height: 0 }}
          animate={{ opacity: 1, y: 0, height: "auto" }}
          exit={{ opacity: 0, y: -8, height: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className={className}
        >
          <div
            className={`
              ${SEVERITY_STYLES[error.severity].bg}
              ${SEVERITY_STYLES[error.severity].border}
              border rounded-xl
              ${compact ? "px-4 py-3" : "px-5 py-4"}
              relative
            `}
          >
            <div className="flex items-start gap-3">
              {/* Icon */}
              <div className={`mt-0.5 shrink-0 ${SEVERITY_STYLES[error.severity].icon}`}>
                {(() => {
                  const Icon = getErrorIcon(error.code);
                  return <Icon className={compact ? "w-4 h-4" : "w-5 h-5"} />;
                })()}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p
                  className={`
                    ${SEVERITY_STYLES[error.severity].text}
                    ${compact ? "text-sm" : "text-sm"}
                    leading-relaxed
                  `}
                >
                  {error.userMessage}
                </p>

                {/* Pending payment extra info */}
                {error.code === "PAYMENT_PENDING" && (error as any).estimatedWait && (
                  <p className="text-xs text-[#8D6E63] mt-1">
                    Tiempo estimado: {(error as any).estimatedWait}
                  </p>
                )}

                {/* CTA buttons */}
                {(() => {
                  const cta = getRecoveryCTA(error.recovery, retryLabel);
                  if (!cta.show) return null;

                  return (
                    <div className="flex items-center gap-3 mt-3">
                      {(error.recovery === "retry" || error.recovery === "retry-manual") && onRetry && (
                        <button
                          onClick={onRetry}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/80 border border-current/10 text-sm hover:bg-white transition-colors"
                          style={{ fontWeight: 500, color: SEVERITY_STYLES[error.severity].icon.replace("text-[", "").replace("]", "") }}
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          {cta.label}
                        </button>
                      )}
                      {error.recovery === "user-action" && onDismiss && (
                        <button
                          onClick={onDismiss}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/80 border border-current/10 text-sm hover:bg-white transition-colors"
                          style={{ fontWeight: 500 }}
                        >
                          {cta.label}
                        </button>
                      )}
                      {error.recovery === "navigate" && onNavigate && (
                        <button
                          onClick={onNavigate}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/80 border border-current/10 text-sm hover:bg-white transition-colors"
                          style={{ fontWeight: 500 }}
                        >
                          {cta.label}
                        </button>
                      )}
                      {error.recovery === "degrade" && onDismiss && (
                        <button
                          onClick={onDismiss}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/80 border border-current/10 text-sm hover:bg-white transition-colors"
                          style={{ fontWeight: 500 }}
                        >
                          {cta.label}
                        </button>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* Dismiss X */}
              {onDismiss && error.recovery !== "none" && (
                <button
                  onClick={onDismiss}
                  className="shrink-0 text-[#90a4ae] hover:text-[#546e7a] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ═══════════════════════════════════════════════════════════
   PaymentPendingBanner — Specialized for pending payments
   Shows progress/status with estimated wait time
   ═══════════════════════════════════════════════════════════ */
export function PaymentPendingBanner({
  estimatedWait,
  onDismiss,
  className = "",
}: {
  estimatedWait?: string;
  onDismiss?: () => void;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className={className}
    >
      <div className="bg-[#FFF8E1] border border-[#FFE082] rounded-xl px-5 py-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 shrink-0 text-[#F9A825]">
            <CreditCard className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-[#5D4037]" style={{ fontWeight: 500 }}>
              Pago pendiente de confirmación
            </p>
            <p className="text-sm text-[#8D6E63] mt-1">
              Tu pago está siendo procesado. Para pagos en efectivo o transferencia,
              la acreditación puede tomar hasta 72 horas.
              Tu acceso se activará automáticamente cuando se confirme.
            </p>
            {estimatedWait && (
              <p className="text-xs text-[#A1887F] mt-2">
                Tiempo estimado: {estimatedWait}
              </p>
            )}
          </div>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="shrink-0 text-[#BCAAA4] hover:text-[#8D6E63] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
