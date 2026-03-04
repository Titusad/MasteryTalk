import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { BrandLogo } from "./shared";
import { authService } from "../../services";
import type { AuthProvider } from "../../services/types";
import { isAuthError, type ServiceError } from "../../services/errors";
import { useLandingCopy } from "./LandingLangContext";

/* ──────────────────────── Social Icons ──────────────────────── */

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

/* ──────────────────────── Types ──────────────────────── */

export type AuthMode = "login" | "registro";

export interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  mode: AuthMode;
  onToggleMode: () => void;
  /** When opened from the CTA Final, shows motivational copy */
  variant?: "default" | "cta";
  /**
   * Called AFTER successful authentication through authService.
   * The service layer handles both mock and real auth transparently.
   */
  onAuthComplete?: () => void;
  /**
   * Called when authService.signIn() throws an error.
   * Parent can display ServiceErrorBanner or handle recovery.
   */
  onAuthError?: (error: ServiceError) => void;
}

/* ──────────────────────── Component ──────────────────────── */

export function AuthModal({
  open,
  onClose,
  mode,
  onToggleMode,
  variant = "default",
  onAuthComplete,
  onAuthError,
}: AuthModalProps) {
  const { copy: landingCopy } = useLandingCopy();
  const authCopy = landingCopy.auth;
  const isLogin = mode === "login";

  const title = isLogin
    ? authCopy.login.title
    : variant === "cta"
    ? authCopy.ctaRegister.title
    : authCopy.register.title;
  const subtitle = isLogin
    ? authCopy.login.subtitle
    : variant === "cta"
    ? authCopy.ctaRegister.subtitle
    : authCopy.register.subtitle;
  const googleLabel = isLogin ? authCopy.login.google : authCopy.register.google;

  /* ── Loading & error state for auth buttons ── */
  const [loadingProvider, setLoadingProvider] = useState<AuthProvider | null>(null);
  const [inlineError, setInlineError] = useState<string | null>(null);

  /**
   * Handle social login through the service layer.
   * Works with both MockAuthService (instant) and SupabaseAuthService (OAuth redirect).
   *
   * Flow:
   *   1. Call authService.signIn(provider)
   *   2. Mock: resolves instantly with fake user → fire onAuthComplete
   *   3. Supabase: initiates OAuth redirect → page reloads → onAuthStateChanged fires
   *   4. On error: catch AuthError → show inline message or bubble to parent
   */
  const handleSocialLogin = async (provider: AuthProvider) => {
    setLoadingProvider(provider);
    setInlineError(null);

    try {
      await authService.signIn(provider);
      // If we reach here (mock mode or popup-based flow), auth succeeded
      setLoadingProvider(null);
      onAuthComplete?.();
    } catch (err) {
      setLoadingProvider(null);

      if (isAuthError(err)) {
        // Show user-friendly message inline
        setInlineError(err.userMessage);
        // Also bubble to parent for ServiceErrorBanner (F1-05, F0-70)
        onAuthError?.(err);
      } else {
        setInlineError(authCopy.errorFallback);
      }
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal card */}
          <motion.div
            className="relative bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors z-10"
            >
              <X className="w-4 h-4 text-[#4B505B]" />
            </button>

            <div className="px-8 pt-10 pb-8">
              {/* Logo */}
              <div className="flex justify-center mb-8">
                <BrandLogo />
              </div>

              {/* Title + Subtitle */}
              <h2
                className="text-2xl text-gray-900 text-center mb-2"
                style={{ fontWeight: 600, lineHeight: 1.3 }}
              >
                {title}
              </h2>
              <p className="text-[#4B505B] text-center mb-8">
                {subtitle}
              </p>

              {/* Inline error message (F1-05: POPUP_CLOSED, etc.) */}
              <AnimatePresence>
                {inlineError && (
                  <motion.div
                    className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {inlineError}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Social buttons */}
              <div className="space-y-3 mb-6">
                {/* Google */}
                <button
                  className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 rounded-full py-3.5 hover:bg-gray-50 hover:border-gray-300 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  onClick={() => handleSocialLogin("google")}
                  disabled={loadingProvider !== null}
                >
                  {loadingProvider === "google" ? (
                    <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                  ) : (
                    <GoogleIcon />
                  )}
                  <span className="text-gray-900" style={{ fontWeight: 500 }}>
                    {googleLabel}
                  </span>
                </button>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400">
                  {isLogin ? authCopy.login.divider : authCopy.register.divider}
                </span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              {/* Toggle mode */}
              <p className="text-center text-sm text-[#4B505B]">
                {isLogin ? (
                  <>
                    {authCopy.login.toggle}{" "}
                    <button
                      onClick={onToggleMode}
                      className="text-gray-900 underline underline-offset-2 hover:text-[#2d2d2d] transition-colors"
                      style={{ fontWeight: 600 }}
                    >
                      {authCopy.login.toggleAction}
                    </button>
                  </>
                ) : (
                  <>
                    {authCopy.register.toggle}{" "}
                    <button
                      onClick={onToggleMode}
                      className="text-gray-900 underline underline-offset-2 hover:text-[#2d2d2d] transition-colors"
                      style={{ fontWeight: 600 }}
                    >
                      {authCopy.register.toggleAction}
                    </button>
                  </>
                )}
              </p>

              {/* Trust line */}
              {mode === "registro" && (
                <p className="text-center text-xs text-gray-400 mt-5">
                  {authCopy.register.trust}
                </p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}