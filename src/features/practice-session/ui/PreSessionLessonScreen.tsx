import { useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, Eye } from "lucide-react";
import { SessionProgressBar } from "@/widgets/SessionProgressBar";
import { PATH_LABELS } from "@/shared/lib/paths";
import type { MicroLesson } from "@/services/microLessons";

interface PreSessionLessonScreenProps {
  lesson: MicroLesson;
  pathId: string;
  levelNumber: number;
  onContinue: () => void;
}

export function PreSessionLessonScreen({
  lesson,
  pathId,
  levelNumber,
  onContinue,
}: PreSessionLessonScreenProps) {
  const [recallRevealed, setRecallRevealed] = useState(false);
  const recall = lesson.recallQuestions?.[0] ?? null;
  const pathLabel = PATH_LABELS[pathId] ?? pathId;

  return (
    <div className="min-h-screen bg-[#f0f4f8] flex flex-col">
      <SessionProgressBar currentStep="lesson" />

      <div className="flex-1 flex items-start justify-center px-4 pt-8 pb-12">
        <motion.div
          className="w-full max-w-[520px] flex flex-col gap-6"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Path + level badge */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium bg-[#0f172b] text-white px-3 py-1 rounded-full">
              {pathLabel}
            </span>
            <span className="text-xs font-medium text-[#62748e] bg-white border border-[#e2e8f0] px-3 py-1 rounded-full">
              Level {levelNumber}
            </span>
          </div>

          {/* Lesson title */}
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-[#94a3b8] mb-1">
              Pre-session primer
            </p>
            <h1 className="text-2xl font-bold text-[#0f172b] leading-snug">
              {lesson.title}
            </h1>
          </div>

          {/* Core concept */}
          <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5">
            <p className="text-sm font-medium text-[#45556c] leading-relaxed">
              {lesson.content.keyConcept}
            </p>
          </div>

          {/* Power phrase */}
          <div className="bg-[#0f172b] rounded-2xl p-5 relative overflow-hidden">
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/5 rounded-full blur-xl pointer-events-none" />
            <p className="text-[11px] font-medium uppercase tracking-wider text-white/40 mb-2">
              Power phrase
            </p>
            <p className="text-base font-medium text-white leading-relaxed italic">
              "{lesson.content.example.text}"
            </p>
          </div>

          {/* Recall question */}
          {recall && (
            <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5">
              <p className="text-xs font-medium uppercase tracking-wider text-[#94a3b8] mb-2">
                Quick recall
              </p>
              <p className="text-sm font-medium text-[#0f172b] mb-3">
                {recall.question}
              </p>

              {recallRevealed ? (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl p-3"
                >
                  <p className="text-xs text-[#15803d] leading-relaxed">
                    {recall.answer}
                  </p>
                </motion.div>
              ) : (
                <button
                  onClick={() => setRecallRevealed(true)}
                  className="flex items-center gap-1.5 text-xs font-medium text-[#6366f1] hover:text-[#4f46e5] transition-colors cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Reveal answer
                </button>
              )}
            </div>
          )}

          {/* CTA — locked until recall revealed (or no recall question) */}
          <button
            onClick={onContinue}
            disabled={!!recall && !recallRevealed}
            className={`w-full flex items-center justify-center gap-2 rounded-lg py-3.5 text-sm font-semibold transition-colors ${
              recall && !recallRevealed
                ? "bg-[#e2e8f0] text-[#94a3b8] cursor-not-allowed"
                : "bg-[#0f172b] text-white hover:bg-[#1d293d] cursor-pointer"
            }`}
          >
            <ArrowRight className="w-4 h-4" />
            {recall && !recallRevealed ? "Reveal the answer to continue" : "Start session"}
          </button>
        </motion.div>
      </div>
    </div>
  );
}
