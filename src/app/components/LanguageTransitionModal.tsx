import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { Globe, ArrowRight } from "lucide-react";
import { AppModal } from "@/shared/ui";
import type { LandingLang } from "@/shared/i18n/landing-i18n";

/* ── Auto-dismiss duration (ms) ── */
const AUTO_DISMISS_MS = 5000;

/* ── Copy per language ── */
const MODAL_COPY = {
  es: {
    title: "¡Todo listo!",
    body: "A partir de ahora, la interfaz estará en",
    bodyHighlight: "inglés",
    bodySuffix: "para ofrecerte una experiencia más inmersiva.",
    subtitle: "Tu práctica, coaching y feedback — todo en el idioma que necesitas dominar.",
    flag: "🇪🇸",
    langLabel: "Español",
    preparing: "Preparando tu sesión...",
    skipHint: "Toca para continuar",
    footnote: "Puedes cambiar el idioma en cualquier momento.",
  },
  pt: {
    title: "Tudo pronto!",
    body: "A partir de ahora, a interface estará em",
    bodyHighlight: "inglês",
    bodySuffix: "para oferecer uma experiência mais imersiva.",
    subtitle: "Sua prática, coaching e feedback — tudo no idioma que você precisa dominar.",
    flag: "🇧🇷",
    langLabel: "Português",
    preparing: "Preparando sua sessão...",
    skipHint: "Toque para continuar",
    footnote: "Você pode mudar o idioma a qualquer momento.",
  },
} as const;

/**
 * Post-login modal: language switch notice.
 * Auto-dismisses after 5 seconds with a circular countdown.
 * User can click anywhere to skip the wait.
 */
export function LanguageTransitionModal({
  onContinue,
  fromLang = "es",
}: {
  onContinue: () => void;
  fromLang?: LandingLang;
}) {
  const langKey = fromLang === "en" ? "es" : fromLang;
  const c = MODAL_COPY[langKey];
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dismissed = useRef(false);
  const [elapsed, setElapsed] = useState(0);

  const handleDismiss = () => {
    if (dismissed.current) return;
    dismissed.current = true;
    if (timerRef.current) clearTimeout(timerRef.current);
    onContinue();
  };

  /* Auto-dismiss countdown */
  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      const ms = Date.now() - start;
      setElapsed(ms);
      if (ms >= AUTO_DISMISS_MS) {
        clearInterval(interval);
        handleDismiss();
      }
    }, 50);

    timerRef.current = setTimeout(() => {
      clearInterval(interval);
      handleDismiss();
    }, AUTO_DISMISS_MS + 100);

    return () => {
      clearInterval(interval);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const progress = Math.min(elapsed / AUTO_DISMISS_MS, 1);
  const remainingSeconds = Math.ceil((AUTO_DISMISS_MS - elapsed) / 1000);

  /* SVG circular progress */
  const size = 56;
  const stroke = 3;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);

  return (
    <AppModal open={true} onClose={() => {}} showCloseButton={false} size="md">
      {/* Green accent bar */}
      <div className="h-1.5 bg-gradient-to-r from-[#DBEDDF] via-[#50C878] to-[#DBEDDF]" />

      <div
        className="px-10 pt-10 pb-10 text-center cursor-pointer"
        onClick={handleDismiss}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && handleDismiss()}
      >
        {/* Icon */}
        <motion.div
          className="w-16 h-16 rounded-full bg-[#0f172b] flex items-center justify-center mx-auto mb-6"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.3 }}
        >
          <Globe className="w-8 h-8 text-white" />
        </motion.div>

        {/* Title */}
        <h2
          className="text-2xl text-[#0f172b] mb-3"
          style={{ fontWeight: 600, lineHeight: 1.3 }}
        >
          {c.title}
        </h2>

        {/* Explanation */}
        <p className="text-[#45556c] text-[15px] leading-relaxed mb-2">
          {c.body}{" "}
          <span style={{ fontWeight: 600 }} className="text-[#0f172b]">{c.bodyHighlight}</span>{" "}
          {c.bodySuffix}
        </p>
        <p className="text-[#62748e] text-sm leading-relaxed mb-6">
          {c.subtitle}
        </p>

        {/* Language pills */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <span className="bg-[#f1f5f9] text-[#62748e] text-sm px-4 py-2 rounded-full" style={{ fontWeight: 500 }}>
            {c.flag} {c.langLabel}
          </span>
          <ArrowRight className="w-4 h-4 text-[#94a3b8]" />
          <span className="bg-[#0f172b] text-white text-sm px-4 py-2 rounded-full" style={{ fontWeight: 500 }}>
            🇺🇸 English
          </span>
        </div>

        {/* Countdown ring + preparing text */}
        <div className="flex flex-col items-center gap-3 mb-4">
          <div className="relative" style={{ width: size, height: size }}>
            <svg
              width={size}
              height={size}
              viewBox={`0 0 ${size} ${size}`}
              className="transform -rotate-90"
            >
              {/* Background ring */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="#e2e8f0"
                strokeWidth={stroke}
              />
              {/* Progress ring */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="#0f172b"
                strokeWidth={stroke}
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
                className="transition-none"
              />
            </svg>
            <span
              className="absolute inset-0 flex items-center justify-center text-sm text-[#0f172b]"
              style={{ fontWeight: 600 }}
            >
              {remainingSeconds}
            </span>
          </div>
          <p className="text-sm text-[#45556c]" style={{ fontWeight: 500 }}>
            {c.preparing}
          </p>
        </div>

        <p className="text-xs text-[#94a3b8]">
          {c.skipHint}
        </p>
      </div>
    </AppModal>
  );
}