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
  Lightbulb,
  ArrowRight,
  SkipForward,
  Copy,
  Check,
  CheckCircle2,
  Globe,
  Sparkles,
} from "lucide-react";
import { FeedbackThumbs, NarrationCaption } from "@/shared/ui";
import { useState, useCallback, useMemo } from "react";
import DOMPurify from "dompurify";
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
  vocabularyBank?: Array<{ term: string; ipa: string; definition: string; example?: string }>;
  userProfile?: { industry?: string; position?: string } | null;
  personalizedPattern?: { bad: { label: string; script: string }; good: { label: string; script: string; beats?: Array<{ label: string; text: string }> } } | null;
  patternLoading?: boolean;
  onReady: () => void;
  onSkip: () => void;
  narratorUrl?: string;
  narratorScript?: string;
}

export function StrategyScreen({
  levelTitle,
  methodology,
  anchorPhrases,
  vocabularyBank,
  userProfile,
  personalizedPattern,
  patternLoading,
  onReady,
  onSkip,
  narratorUrl,
  narratorScript,
}: StrategyScreenProps) {
  const { isScriptVisible, dismissCaption } = useNarration(narratorUrl || null, narratorScript);
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
  const displayCoachTip = translation?.coachTip ?? methodology.coachTip;

  /* Scripts & power phrases always in English */
  const displayPhrases = anchorPhrases?.length
    ? anchorPhrases
    : methodology.anchorPhrases;

  return (
    <div className="w-full min-h-full flex flex-col bg-[#f0f4f8] relative overflow-hidden">
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <FeedbackThumbs contentType="strategy" contentId={levelTitle} />
        <Sparkles className="w-4 h-4 text-[#94a3b8]" aria-label="AI-generated content" />
      </div>
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
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#e2e8f0] bg-white text-xs text-[#62748e] hover:border-[#6366f1] hover:text-[#4f46e5] transition-all font-medium"
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
                          className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-xs transition-colors text-left ${
                            activeLocale === loc
                              ? "bg-indigo-50 text-[#4f46e5] font-semibold"
                              : "text-[#334155] hover:bg-[#f8fafc] font-medium"
                          }`}
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
            style={{ lineHeight: 1.2 }}
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
            <span className="text-xs text-[#62748e] font-semibold">
              The Framework
            </span>
          </div>
          <div className="px-6 py-6 md:px-8">
            {displayExplanation.split("\n\n").map((paragraph, i) => {
              const moveMatch = paragraph.match(/^\*\*Move (\d)/);
              const moveIndex = moveMatch ? parseInt(moveMatch[1]) - 1 : -1;
              const beat = moveIndex >= 0 ? personalizedPattern?.good?.beats?.[moveIndex] : null;
              const showBeatSkeleton = moveIndex >= 0 && patternLoading && !personalizedPattern?.good?.beats;

              return (
                <div key={i} className="mb-3 last:mb-0">
                  <p
                    className="text-sm text-[#334155] leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(
                        paragraph
                          .replace(/\n(\*\*)/g, "<br/><br/>$1")
                          .replace(/\*\*(.*?)\*\*/g, '<strong class="text-[#0f172b]">$1</strong>')
                          .replace(/\\n/g, ""),
                        { ALLOWED_TAGS: ["br", "strong"], ALLOWED_ATTR: ["class"] }
                      ),
                    }}
                  />
                  {beat && (
                    <div className="mt-2 flex items-start gap-2 px-3 py-2 rounded-lg bg-emerald-50/70 border border-emerald-100">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <p className="text-xs text-[#334155] italic leading-relaxed">"{beat.text}"</p>
                    </div>
                  )}
                  {showBeatSkeleton && (
                    <div className="mt-2 h-6 bg-emerald-50 rounded-lg animate-pulse" />
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Power phrases */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.35 }}
          className="mb-6"
        >
          <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm overflow-hidden">
            <div className="px-6 py-3 bg-[#f8fafc] border-b border-[#f1f5f9] flex items-center gap-2">
              <span className="text-xs text-[#62748e] font-semibold">
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
                  <span className="text-sm text-[#334155] group-hover:text-[#0f172b] transition-colors font-medium">
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
          </div>
        </motion.div>

        {/* Vocabulary bank */}
        {vocabularyBank && vocabularyBank.length > 0 && (
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.35 }}
          >
            <p className="text-xs font-medium text-[#62748e] uppercase tracking-wide mb-3">Key Vocabulary</p>
            <div className="flex flex-col gap-2">
              {vocabularyBank.map((item) => (
                <div key={item.term} className="flex items-start gap-3 px-4 py-3 rounded-xl border border-[#e2e8f0] bg-white">
                  <div className="min-w-0 flex-1">
                    <span className="font-medium text-[#0f172b] text-sm">{item.term}</span>
                    <span className="ml-2 text-xs text-[#94a3b8] font-mono">{item.ipa}</span>
                    <p className="text-xs text-[#62748e] mt-0.5 leading-relaxed">{item.definition}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Coach tip */}
        <motion.div
          className="flex items-start gap-3 px-6 py-4 rounded-xl bg-amber-50/60 border border-amber-200/60 mb-8"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.35 }}
        >
          <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-900 leading-relaxed font-medium">
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
            className="flex items-center gap-3 px-10 py-5 rounded-full text-xl bg-[#0f172b] text-white hover:bg-[#1d293d] transition-colors shadow-[0px_10px_15px_rgba(0,0,0,0.1)] font-medium"
          >
            I'm Ready — Continue
            <ArrowRight className="w-6 h-6" />
          </button>
          <button
            onClick={onSkip}
            className="flex items-center gap-1.5 text-sm text-[#62748e] hover:text-[#0f172b] transition-colors font-medium"
          >
            <SkipForward className="w-3.5 h-3.5" />
            I already know this — Skip
          </button>
        </motion.div>
      </main>
      {narratorScript && (
        <NarrationCaption script={narratorScript} isVisible={isScriptVisible} onDismiss={dismissCaption} />
      )}
    </div>
  );
}
