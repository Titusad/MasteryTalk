/**
 * GrammarContextScreen — Pre-task grammar scaffolding step
 *
 * Shows one grammar structure per session, rotated from the path's bank.
 * Displays:
 *   - Structure title + pattern (always static)
 *   - Professional uses (always static)
 *   - 3 personalized examples (AI-generated via /grammar-examples, fallback to static)
 *   - Optional warning/contrast note
 *
 * Always skippable.
 * Default state: expanded in L1–L2, collapsed in L3+.
 *
 * Calls onContinue or onSkip — both advance the flow.
 * Increments grammarRotationIndex[levelId] via onRotationAdvance before advancing.
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { BookOpen, ArrowRight, SkipForward, AlertCircle, Loader2, ChevronDown } from "lucide-react";
import { SUPABASE_URL, getAuthToken } from "@/services/supabase";
import type { GrammarStructure } from "@/services/prompts/grammar/interview";
import type { OnboardingProfile } from "@/entities/user";

interface GrammarContextScreenProps {
  structure: GrammarStructure;
  levelNumber: number;
  userProfile?: OnboardingProfile | null;
  onContinue: () => void;
  onSkip: () => void;
}

export function GrammarContextScreen({
  structure,
  levelNumber,
  userProfile,
  onContinue,
  onSkip,
}: GrammarContextScreenProps) {
  // Collapsed by default for L3+
  const defaultExpanded = levelNumber <= 2;
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [examples, setExamples] = useState<string[]>(structure.staticExamples);
  const [loadingExamples, setLoadingExamples] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchExamples() {
      setLoadingExamples(true);
      try {
        const token = await getAuthToken();
        const res = await fetch(
          `${SUPABASE_URL}/functions/v1/make-server-08b8658d/grammar-examples`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              structureId: structure.id,
              title: structure.title,
              pattern: structure.pattern,
              professionalUses: structure.professionalUses,
              staticExamples: structure.staticExamples,
              profile: {
                position: userProfile?.position,
                industry: userProfile?.industry,
                seniority: userProfile?.seniority,
                targetRole: userProfile?.targetRole,
                targetCompanyType: userProfile?.targetCompanyType,
              },
            }),
          }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!cancelled && Array.isArray(data.examples) && data.examples.length === 3) {
          setExamples(data.examples);
        }
      } catch (err) {
        console.error("[GrammarContextScreen] Failed to fetch examples, using static fallback:", err);
        // staticExamples already set as default
      } finally {
        if (!cancelled) setLoadingExamples(false);
      }
    }

    fetchExamples();
    return () => { cancelled = true; };
  // Only run once per structure
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [structure.id]);

  return (
    <div className="flex flex-col min-h-full bg-[#f0f4f8]">
      <div className="flex-1 flex flex-col items-center justify-start px-4 py-8 max-w-2xl mx-auto w-full">

        {/* Header */}
        <div className="w-full mb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-[#0f172b] flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="text-xs text-[#62748e] font-medium uppercase tracking-wide">
              Grammar · Building Block
            </span>
          </div>
          <h1 className="text-2xl text-[#0f172b]" style={{ lineHeight: 1.25 }}>
            {structure.title}
          </h1>
        </div>

        {/* Collapsible content for L3+ */}
        {!defaultExpanded && (
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-between px-4 py-3 bg-white border border-[#e2e8f0] rounded-2xl mb-4 hover:bg-[#f8fafc] transition-colors cursor-pointer"
          >
            <span className="text-sm text-[#0f172b] font-medium">
              {expanded ? "Hide grammar reference" : "Show grammar reference"}
            </span>
            <ChevronDown
              className={`w-4 h-4 text-[#94a3b8] transition-transform ${expanded ? "rotate-180" : ""}`}
            />
          </button>
        )}

        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              key="grammar-content"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full space-y-4 overflow-hidden"
            >
              {/* Pattern */}
              <div className="bg-white border border-[#e2e8f0] rounded-2xl px-5 py-4">
                <p className="text-xs text-[#62748e] font-medium mb-1">Pattern</p>
                <p className="text-sm text-[#0f172b] font-medium" style={{ fontFamily: "monospace" }}>
                  {structure.pattern}
                </p>
              </div>

              {/* Professional uses */}
              <div className="bg-white border border-[#e2e8f0] rounded-2xl px-5 py-4">
                <p className="text-xs text-[#62748e] font-medium mb-3">Professional Uses</p>
                <ul className="space-y-2">
                  {structure.professionalUses.map((use, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-[#314158]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0f172b] mt-1.5 flex-shrink-0" />
                      {use}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Examples */}
              <div className="bg-white border border-[#e2e8f0] rounded-2xl px-5 py-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs text-[#62748e] font-medium">Examples</p>
                  {loadingExamples && (
                    <div className="flex items-center gap-1.5 text-xs text-[#94a3b8]">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Personalizing...
                    </div>
                  )}
                </div>
                <div className="space-y-3">
                  {examples.map((ex, i) => (
                    <p
                      key={i}
                      className="text-sm text-[#314158] italic border-l-2 border-[#e2e8f0] pl-3"
                      style={{ lineHeight: "1.6" }}
                    >
                      "{ex}"
                    </p>
                  ))}
                </div>
              </div>

              {/* Warning note */}
              {structure.warningNote && (
                <div className="bg-[#fefce8] border border-[#fde68a] rounded-2xl px-5 py-4 flex items-start gap-3">
                  <AlertCircle className="w-4 h-4 text-[#d97706] flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-[#92400e]" style={{ lineHeight: "1.6" }}>
                    {structure.warningNote}
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        <div className="w-full flex items-center gap-3 mt-8">
          <button
            type="button"
            onClick={onSkip}
            className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm text-[#62748e] hover:text-[#0f172b] hover:bg-white border border-transparent hover:border-[#e2e8f0] transition-all cursor-pointer"
          >
            <SkipForward className="w-4 h-4" />
            Skip
          </button>
          <button
            type="button"
            onClick={onContinue}
            className="flex-1 flex items-center justify-center gap-2.5 py-3.5 bg-[#0f172b] text-white rounded-lg text-sm hover:bg-[#1d293d] transition-colors cursor-pointer shadow-lg"
          >
            Got it — continue
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
