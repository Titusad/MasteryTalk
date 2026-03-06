import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Globe, ArrowRight, Check, MapPin } from "lucide-react";
import type { LandingLang } from "./landing-i18n";
import type { MarketFocus } from "../../services/prompts";

/* ─── Country options ─── */
interface CountryOption {
  id: MarketFocus | "other";
  flag: string;
  label: Record<"es" | "pt", string>;
}

const COUNTRY_OPTIONS: CountryOption[] = [
  { id: "mexico", flag: "🇲🇽", label: { es: "México", pt: "México" } },
  { id: "colombia", flag: "🇨🇴", label: { es: "Colombia", pt: "Colômbia" } },
  { id: "brazil", flag: "🇧🇷", label: { es: "Brasil", pt: "Brasil" } },
  { id: "other", flag: "🌎", label: { es: "Otro país", pt: "Outro país" } },
];

/* ─── Copy per language ─── */
const MODAL_COPY = {
  es: {
    title: "¡Todo listo!",
    body: "A partir de ahora, la interfaz estará en",
    bodyHighlight: "inglés",
    bodySuffix: "para ofrecerte una experiencia más inmersiva.",

    flag: "🇪🇸",
    langLabel: "Español",
    countryQuestion: "¿Desde dónde trabajas?",
    countryHint: "Esto nos ayuda a personalizar tu práctica.",
    cta: "Let's go",
    footnote: "Puedes cambiar esto en cualquier momento desde tu perfil.",
  },
  pt: {
    title: "Tudo pronto!",
    body: "A partir de agora, a interface estará em",
    bodyHighlight: "inglês",
    bodySuffix: "para oferecer uma experiência mais imersiva.",
    subtitle: "Sua prática, coaching e feedback — tudo no idioma que você precisa dominar.",
    flag: "🇧🇷",
    langLabel: "Português",
    countryQuestion: "De onde você trabalha?",
    countryHint: "Isso nos ajuda a personalizar seu coaching ao contexto de nearshoring da sua região.",
    cta: "Let's go",
    footnote: "Você pode mudar isso a qualquer momento no seu perfil.",
  },
} as const;

/**
 * Post-login modal: language switch notice + country selector.
 * Pre-selects country based on landing language (pt → brazil).
 */
export function LanguageTransitionModal({
  onContinue,
  fromLang = "es",
}: {
  onContinue: (marketFocus: MarketFocus | null) => void;
  fromLang?: LandingLang;
}) {
  const langKey = fromLang === "en" ? "es" : fromLang;
  const c = MODAL_COPY[langKey];

  // Auto-infer: PT users are almost certainly from Brazil
  const [selectedCountry, setSelectedCountry] = useState<MarketFocus | "other" | null>(
    fromLang === "pt" ? "brazil" : null
  );

  const resolvedMarketFocus: MarketFocus | null =
    selectedCountry === "other" ? null : selectedCountry;

  return (
    <motion.div
      className="fixed inset-0 z-[200] flex items-center justify-center p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
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

          {/* ── Country Selector ── */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.45 }}
          >
            {/* Divider */}
            <div className="border-t border-[#e2e8f0] mb-6" />

            <div className="flex items-center justify-center gap-1.5 mb-2">
              <MapPin className="w-3.5 h-3.5 text-[#62748e]" />
              <p
                className="text-sm text-[#0f172b]"
                style={{ fontWeight: 600 }}
              >
                {c.countryQuestion}
              </p>
            </div>
            <p className="text-xs text-[#94a3b8] mb-4 leading-relaxed">
              {c.countryHint}
            </p>

            {/* Country pills */}
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {COUNTRY_OPTIONS.map((country, i) => {
                const isSelected = selectedCountry === country.id;
                return (
                  <motion.button
                    key={country.id}
                    onClick={() => setSelectedCountry(country.id)}
                    className={`relative inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm border-2 transition-all duration-200 ${isSelected
                      ? "border-[#0f172b] bg-[#0f172b] text-white"
                      : "border-[#e2e8f0] bg-[#f8fafc] text-[#314158] hover:border-[#cad5e2] hover:bg-white"
                      }`}
                    style={{ fontWeight: isSelected ? 600 : 400 }}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.25, delay: 0.5 + i * 0.05 }}
                    whileTap={{ scale: 0.96 }}
                  >
                    <span className="text-base leading-none">{country.flag}</span>
                    {country.label[langKey]}
                    <AnimatePresence>
                      {isSelected && (
                        <motion.span
                          initial={{ scale: 0, width: 0 }}
                          animate={{ scale: 1, width: "auto" }}
                          exit={{ scale: 0, width: 0 }}
                          transition={{ duration: 0.15 }}
                          className="inline-flex"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>

          {/* CTA */}
          <motion.button
            onClick={() => onContinue(resolvedMarketFocus)}
            className={`w-full py-4 rounded-full flex items-center justify-center gap-2.5 shadow-lg transition-all text-[15px] ${selectedCountry
              ? "bg-[#0f172b] text-white hover:bg-[#1d293d]"
              : "bg-[#cad5e2] text-white cursor-not-allowed"
              }`}
            style={{ fontWeight: 500 }}
            whileHover={selectedCountry ? { scale: 1.02 } : {}}
            whileTap={selectedCountry ? { scale: 0.98 } : {}}
            disabled={!selectedCountry}
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
