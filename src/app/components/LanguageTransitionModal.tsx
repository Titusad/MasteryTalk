import { motion } from "motion/react";
import { Globe, ArrowRight } from "lucide-react";
import type { LandingLang } from "./landing-i18n";

/* ─── Copy per language ─── */
const MODAL_COPY = {
  es: {
    title: "¡Todo listo!",
    body: "A partir de ahora, la interfaz estará en",
    bodyHighlight: "inglés",
    bodySuffix: "para ofrecerte una experiencia más inmersiva.",
    subtitle: "Tu práctica, coaching y feedback — todo en el idioma que necesitas dominar.",
    flag: "🇪🇸",
    langLabel: "Español",
    cta: "Let's go",
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
    cta: "Let's go",
    footnote: "Você pode mudar o idioma a qualquer momento.",
  },
} as const;

/**
 * Post-login modal: language switch notice.
 * No longer asks for region — auto-detects timezone silently.
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

  return (
    <motion.div
      className="fixed inset-0 z-[200] flex items-center justify-center p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[#0f172b]/60 backdrop-blur-sm" />

      {/* Card */}
      <motion.div
        className="relative z-10 bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden"
        initial={{ opacity: 0, scale: 0.92, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
      >
        {/* Green accent bar */}
        <div className="h-1.5 bg-gradient-to-r from-[#DBEDDF] via-[#50C878] to-[#DBEDDF]" />

        <div className="px-10 pt-10 pb-10 text-center">
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

          {/* CTA — always enabled, no country selection needed */}
          <motion.button
            onClick={() => onContinue()}
            className="w-full py-4 rounded-full flex items-center justify-center gap-2.5 shadow-lg transition-all text-[15px] bg-[#0f172b] text-white hover:bg-[#1d293d]"
            style={{ fontWeight: 500 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {c.cta}
            <ArrowRight className="w-4 h-4" />
          </motion.button>

          <p className="text-xs text-[#94a3b8] mt-4">
            {c.footnote}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}