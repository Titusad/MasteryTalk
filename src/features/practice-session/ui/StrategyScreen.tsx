/**
 * ══════════════════════════════════════════════════════════════
 *  StrategyScreen — Educational methodology step before practice
 *
 *  Shows the framework/methodology for the current level.
 *  Always displayed but skippable ("I already know this").
 *  Only appears for Conversational Path sessions.
 *
 *  i18n: toggle EN/ES/PT for translatable fields.
 *  Scripts & power phrases always stay in English.
 * ══════════════════════════════════════════════════════════════
 */

import { motion, AnimatePresence } from "motion/react";
import {
  BookOpen,
  Lightbulb,
  ArrowRight,
  ArrowLeft,
  SkipForward,
  Copy,
  Check,
  X,
  CheckCircle2,
  Globe,
} from "lucide-react";
import { useState, useCallback, useMemo } from "react";
import type {
  LevelMethodology,
  BriefLocale,
} from "@/entities/session";
import { useBriefLocale } from "../hooks/useBriefLocale";
import { useNarration } from "@/shared/lib/useNarration";


/* ── Locale display config ── */

const LOCALE_META: Record<BriefLocale, { flag: string; label: string }> = {
  en: { flag: "🇺🇸", label: "English" },
  es: { flag: "🇪🇸", label: "Español" },
  pt: { flag: "🇧🇷", label: "Português" },
};

/* ── Props ── */

interface StrategyScreenProps {
  levelTitle: string;
  methodology: LevelMethodology;
  anchorPhrases?: string[];
  personalizedPattern?: { bad: { label: string; script: string }; good: { label: string; script: string } } | null;
  patternLoading?: boolean;
  onReady: () => void;
  onSkip: () => void;
  narratorUrl?: string;
}

export function StrategyScreen({
  levelTitle,
  methodology,
  anchorPhrases,
  personalizedPattern,
  patternLoading,
  onReady,
  onSkip,
  narratorUrl,
}: StrategyScreenProps) {
  useNarration(narratorUrl || null);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [briefLocale, setBriefLocale] = useBriefLocale();
  const [showLocalePicker, setShowLocalePicker] = useState(false);

  const handleCopy = useCallback((phrase: string, idx: number) => {
    navigator.clipboard.writeText(phrase).catch(() => { });
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 1500);
  }, []);

  /* Determine available locales — toggle only shows if translations exist */
  const availableLocales = useMemo<BriefLocale[]>(() => {
    const locales: BriefLocale[] = ["en"];
    if (methodology.translations?.es) locales.push("es");
    if (methodology.translations?.pt) locales.push("pt");
    return locales;
  }, [methodology.translations]);

  const hasMultipleLocales = availableLocales.length > 1;

  /* Resolve locale — fall back to "en" if selected locale has no translation */
  const activeLocale: BriefLocale =
    briefLocale !== "en" && methodology.translations?.[briefLocale]
      ? briefLocale
      : "en";

  /* Resolve translatable content */
  const translation =
    activeLocale !== "en" ? methodology.translations?.[activeLocale] : null;

  const displayTagline = translation?.tagline ?? methodology.tagline;
  const displayExplanation = translation?.explanation ?? methodology.explanation;
  const displayBadLabel =
    translation?.patternLabels?.bad ?? methodology.pattern.bad.label;
  const displayGoodLabel =
    translation?.patternLabels?.good ?? methodology.pattern.good.label;
  const displayCoachTip = translation?.coachTip ?? methodology.coachTip;

  /* Scripts & power phrases always in English */
  const displayPhrases = anchorPhrases?.length
    ? anchorPhrases
    : methodology.anchorPhrases;

  return (
    <div
      className="w-full min-h-full flex flex-col bg-[#f0f4f8] relative overflow-hidden"
      style={{ fontFamily: "'Poppins', sans-serif" }}
    >
      <main className="relative w-full max-w-[768px] mx-auto px-6 pt-6 pb-20">

        {/* Header badge + locale toggle */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-center gap-2 mb-4">

            {/* Locale toggle — only shows if translations exist */}
            {hasMultipleLocales && (
              <div className="relative">
                <button
                  onClick={() => setShowLocalePicker((v) => !v)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#e2e8f0] bg-white text-xs text-[#62748e] hover:border-[#6366f1] hover:text-[#4f46e5] transition-all"
                  style={{ fontWeight: 500 }}
                  aria-label="Change strategy language"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>{LOCALE_META[activeLocale].flag}</span>
                </button>

                <AnimatePresence>
                  {showLocalePicker && (
                    <motion.div
                      className="absolute right-0 top-full mt-1.5 bg-white rounded-xl border border-[#e2e8f0] shadow-lg overflow-hidden z-20 min-w-[140px]"
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.15 }}
                    >
                      {availableLocales.map((loc) => (
                        <button
                          key={loc}
                          onClick={() => {
                            setBriefLocale(loc);
                            setShowLocalePicker(false);
                          }}
                          className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-xs transition-colors text-left ${activeLocale === loc
                            ? "bg-indigo-50 text-[#4f46e5]"
                            : "text-[#334155] hover:bg-[#f8fafc]"
                            }`}
                          style={{ fontWeight: activeLocale === loc ? 600 : 500 }}
                        >
                          <span className="text-base">
                            {LOCALE_META[loc].flag}
                          </span>
                          {LOCALE_META[loc].label}
                          {activeLocale === loc && (
                            <Check className="w-3.5 h-3.5 ml-auto" />
                          )}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          <h1
            className="text-2xl md:text-[28px] text-[#0f172b] mb-2"
            style={{ fontWeight: 300, lineHeight: 1.2 }}
          >
            {methodology.name}
          </h1>
          <p className="text-[#45556c] text-sm md:text-base max-w-lg mx-auto">
            {displayTagline}
          </p>
        </motion.div>

        {/* Explanation card */}
        <motion.div
          className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm overflow-hidden mb-6"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.35 }}
        >
          <div className="px-6 py-3 bg-[#f8fafc] border-b border-[#f1f5f9] flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            <span
              className="text-xs text-[#62748e]"
              style={{ fontWeight: 600 }}
            >
              The Framework
            </span>
          </div>
          <div className="px-6 py-6 md:px-8">
            {displayExplanation.split("\n\n").map((paragraph, i) => (
              <p
                key={i}
                className="text-sm text-[#334155] leading-relaxed mb-3 last:mb-0"
                dangerouslySetInnerHTML={{
                  __html: paragraph
                    .replace(/\n(\*\*)/g, "<br/><br/>$1")
                    .replace(
                      /\*\*(.*?)\*\*/g,
                      '<strong class="text-[#0f172b]">$1</strong>'
                    )
                    .replace(/\\n/g, ""),
                }}
              />
            ))}
          </div>
        </motion.div>

        {/* Side-by-side comparison */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.35 }}
        >
          {/* Bad example */}
          <div className="bg-white rounded-2xl border border-red-100 shadow-sm overflow-hidden">
            <div className="px-6 py-2.5 bg-red-50/60 border-b border-red-100 flex items-center gap-2">
              <X className="w-3.5 h-3.5 text-red-400" />
              <span
                className="text-xs text-red-600"
                style={{ fontWeight: 600 }}
              >
                {personalizedPattern?.bad?.label || displayBadLabel}
              </span>
            </div>
            <div className="px-6 py-4 relative">
              {patternLoading && !personalizedPattern ? (
                <div className="space-y-2 animate-pulse">
                  <div className="h-3 bg-red-50 rounded w-full" />
                  <div className="h-3 bg-red-50 rounded w-11/12" />
                  <div className="h-3 bg-red-50 rounded w-4/5" />
                  <div className="h-3 bg-red-50 rounded w-3/4" />
                </div>
              ) : (
                <p className="text-sm text-[#64748b] leading-relaxed italic">
                  "{personalizedPattern?.bad?.script || methodology.pattern.bad.script}"
                </p>
              )}
            </div>
          </div>

          {/* Good example */}
          <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm overflow-hidden">
            <div className="px-6 py-2.5 bg-emerald-50/60 border-b border-emerald-100 flex items-center gap-2 justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span
                  className="text-xs text-emerald-700"
                  style={{ fontWeight: 600 }}
                >
                  {personalizedPattern?.good?.label || displayGoodLabel}
                </span>
              </div>
              {personalizedPattern && (
                <span className="text-[10px] text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full" style={{ fontWeight: 600 }}>
                  Personalized for you
                </span>
              )}
            </div>
            <div className="px-6 py-4">
              {patternLoading && !personalizedPattern ? (
                <div className="space-y-2 animate-pulse">
                  <div className="h-3 bg-emerald-50 rounded w-full" />
                  <div className="h-3 bg-emerald-50 rounded w-11/12" />
                  <div className="h-3 bg-emerald-50 rounded w-4/5" />
                  <div className="h-3 bg-emerald-50 rounded w-3/4" />
                  <div className="h-3 bg-emerald-50 rounded w-2/3" />
                </div>
              ) : (
                <p className="text-sm text-[#334155] leading-relaxed italic">
                  "{personalizedPattern?.good?.script || methodology.pattern.good.script}"
                </p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Power phrases — always in English */}
        <motion.div
          className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm overflow-hidden mb-6"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.35 }}
        >
          <div className="px-6 py-3 bg-[#f8fafc] border-b border-[#f1f5f9] flex items-center gap-2">
            <span
              className="text-xs text-[#62748e]"
              style={{ fontWeight: 600 }}
            >
              Power Phrases — use these during your session
            </span>
          </div>
          <div className="px-6 py-4 space-y-2">
            {displayPhrases.map((phrase, i) => (
              <button
                key={i}
                onClick={() => handleCopy(phrase, i)}
                className="w-full flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] hover:border-[#6366f1] hover:bg-indigo-50/30 transition-all group text-left"
              >
                <span
                  className="text-sm text-[#334155] group-hover:text-[#0f172b] transition-colors"
                  style={{ fontWeight: 500 }}
                >
                  {phrase}
                </span>
                {copiedIdx === i ? (
                  <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-[#94a3b8] group-hover:text-[#6366f1] flex-shrink-0 transition-colors" />
                )}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Coach tip */}
        <motion.div
          className="flex items-start gap-3 px-6 py-4 rounded-xl bg-amber-50/60 border border-amber-200/60 mb-8"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.35 }}
        >
          <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <p
            className="text-sm text-amber-900 leading-relaxed"
            style={{ fontWeight: 500 }}
          >
            {displayCoachTip}
          </p>
        </motion.div>

        {/* Actions — large centered CTA + ghost skip below */}
        <motion.div
          className="flex flex-col items-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.3 }}
        >
          <button
            onClick={onReady}
            className="flex items-center gap-3 px-10 py-5 rounded-full text-xl bg-[#0f172b] text-white hover:bg-[#1d293d] transition-colors shadow-[0px_10px_15px_rgba(0,0,0,0.1)]"
            style={{ fontWeight: 500 }}
          >
            I'm Ready — Continue
            <ArrowRight className="w-6 h-6" />
          </button>
          <button
            onClick={onSkip}
            className="flex items-center gap-1.5 text-sm text-[#62748e] hover:text-[#0f172b] transition-colors"
            style={{ fontWeight: 500 }}
          >
            <SkipForward className="w-3.5 h-3.5" />
            I already know this — Skip
          </button>
        </motion.div>
      </main>
    </div>
  );
}
