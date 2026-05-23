/**
 * VocabularyScreen — D.4 dedicated vocabulary + pronunciation step
 *
 * Shown between context and generating for levels with a vocabularyBank.
 * Reuses VocabularyDrillSection (listen + record + Azure scoring).
 * Always skippable — no gate required.
 */

import { motion } from "motion/react";
import { ArrowRight, BookOpen, SkipForward } from "lucide-react";
import { VocabularyDrillSection } from "./VocabularyDrillSection";
import { getVocabularyForProfile } from "@/entities/progression";
import type { VocabularyTerm } from "@/entities/progression";
import type { ScenarioType } from "@/entities/session";

const SCENARIO_LABELS: Partial<Record<ScenarioType, string>> = {
  interview: "Interview",
  sales: "Sales",
  meeting: "Meeting",
  presentation: "Presentation",
  culture: "U.S. Business Culture",
  client: "Client",
  csuite: "C-Suite",
};

interface VocabularyScreenProps {
  levelTitle: string;
  scenarioType?: ScenarioType;
  vocabularyBank: VocabularyTerm[];
  userProfile?: { industry?: string; position?: string } | null;
  onContinue: () => void;
  onSkip: () => void;
}

export function VocabularyScreen({
  levelTitle,
  scenarioType,
  vocabularyBank,
  userProfile,
  onContinue,
  onSkip,
}: VocabularyScreenProps) {
  const terms = getVocabularyForProfile(vocabularyBank, userProfile, 6);
  const label = scenarioType ? SCENARIO_LABELS[scenarioType] : null;

  return (
    <motion.div
      className="flex flex-col px-6 py-8 max-w-2xl mx-auto w-full"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0f172b] text-white text-[11px]">
          {label && <>{label} · </>}{levelTitle}
        </span>
      </div>

      <div className="flex items-center gap-2.5 mt-4 mb-1">
        <div className="w-8 h-8 rounded-lg bg-[#eef2ff] flex items-center justify-center shrink-0">
          <BookOpen className="w-4 h-4 text-[#6366f1]" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-[#0f172b]">Vocabulary Drill</h2>
          <p className="text-sm text-[#62748e]">
            Practice these words — you'll use them in the session.
          </p>
        </div>
      </div>

      {/* Drill */}
      <VocabularyDrillSection terms={terms} />

      {/* Actions */}
      <div className="flex flex-col items-center gap-3 mt-8">
        <motion.button
          onClick={onContinue}
          className="w-full py-3.5 rounded-full font-semibold text-[15px] flex items-center justify-center gap-2 bg-[#0f172b] text-white hover:opacity-90 transition-all active:scale-[0.98] cursor-pointer"
          whileTap={{ scale: 0.97 }}
        >
          Continue to Practice
          <ArrowRight className="w-4 h-4" />
        </motion.button>

        <button
          onClick={onSkip}
          className="flex items-center gap-1.5 text-sm text-[#62748e] hover:text-[#0f172b] transition-colors font-medium cursor-pointer"
        >
          <SkipForward className="w-3.5 h-3.5" />
          Skip — I know these words
        </button>
      </div>
    </motion.div>
  );
}
