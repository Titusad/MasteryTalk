/**
 * ══════════════════════════════════════════════════════════════
 *  inFluentia PRO — Lesson Modal (Full-Screen Overlay)
 *
 *  Full-screen overlay for reading micro-lessons with
 *  interactive "Rewrite This" challenge at the bottom.
 *  Supports prev/next navigation between recommended lessons.
 * ══════════════════════════════════════════════════════════════
 */

import { useState, useEffect, useCallback } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Clock,
  Lightbulb,
  Quote,
  Zap,
  Target,
  PenLine,
  Eye,
  RotateCcw,
  CheckCircle2,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import type { MicroLesson } from "../../services/microLessons";
import { markLessonComplete, isLessonComplete } from "../../services/microLessons";

/* ─── Pillar colors ─── */
const PILLAR_COLORS: Record<string, string> = {
  Vocabulary: "#6366f1",
  Grammar: "#0ea5e9",
  Fluency: "#22c55e",
  Pronunciation: "#f59e0b",
  "Professional Tone": "#ec4899",
  Persuasion: "#8b5cf6",
};

/* ─── Props ─── */
export interface LessonModalProps {
  lessons: MicroLesson[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
  onComplete?: () => void;
}

export function LessonModal({
  lessons,
  currentIndex,
  onClose,
  onNavigate,
  onComplete,
}: LessonModalProps) {
  const lesson = lessons[currentIndex];
  const [userAnswer, setUserAnswer] = useState("");
  const [showModel, setShowModel] = useState(false);
  const [completed, setCompleted] = useState(false);

  if (!lesson) return null;

  /* Sync completed state when lesson changes */
  const isComplete = completed || isLessonComplete(lesson.id);

  const color = PILLAR_COLORS[lesson.pillar] || "#6366f1";
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < lessons.length - 1;

  /* Reset challenge state on navigation */
  const navigateTo = (index: number) => {
    setUserAnswer("");
    setShowModel(false);
    setCompleted(isLessonComplete(lessons[index]?.id || ""));
    onNavigate(index);
  };

  /* Keyboard navigation */
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && hasPrev) navigateTo(currentIndex - 1);
      if (e.key === "ArrowRight" && hasNext) navigateTo(currentIndex + 1);
    },
    [onClose, currentIndex, hasPrev, hasNext]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [handleKeyDown]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-stretch justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Full-screen overlay panel */}
        <motion.div
          className="relative w-full max-w-4xl bg-white shadow-2xl overflow-hidden flex flex-col my-0 md:my-4 md:mx-4 md:rounded-3xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {/* ── Header ── */}
          <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-[#e2e8f0] px-6 md:px-8 py-4 flex items-center justify-between z-10">
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-2xl shrink-0">{lesson.icon}</span>
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full"
                    style={{
                      fontWeight: 600,
                      backgroundColor: `${color}15`,
                      color,
                    }}
                  >
                    {lesson.pillar}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-[#94a3b8]">
                    <Clock className="w-3 h-3" />
                    {lesson.duration}
                  </span>
                  {isComplete && (
                    <span className="flex items-center gap-1 text-[10px] text-[#22c55e]" style={{ fontWeight: 600 }}>
                      <CheckCircle2 className="w-3 h-3" />
                      Completed
                    </span>
                  )}
                </div>
                <h2
                  className="text-lg md:text-xl text-[#0f172b] truncate"
                  style={{ fontWeight: 600 }}
                >
                  {lesson.title}
                </h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-[#f1f5f9] hover:bg-[#e2e8f0] flex items-center justify-center transition-colors cursor-pointer shrink-0 ml-3"
            >
              <X className="w-4 h-4 text-[#45556c]" />
            </button>
          </div>

          {/* ── Content ── */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-2xl mx-auto px-6 md:px-8 py-8 space-y-8">
              {/* Subtitle */}
              <p className="text-base text-[#62748e] leading-relaxed italic">
                {lesson.subtitle}
              </p>

              {/* Intro */}
              <p className="text-[15px] text-[#334155] leading-relaxed">
                {lesson.content.intro}
              </p>

              {/* Key Concept */}
              <div
                className="rounded-2xl p-6 border"
                style={{
                  backgroundColor: `${color}08`,
                  borderColor: `${color}20`,
                }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="w-5 h-5 shrink-0" style={{ color }} />
                  <p
                    className="text-xs uppercase tracking-wider"
                    style={{ fontWeight: 700, color }}
                  >
                    Key Concept
                  </p>
                </div>
                <p className="text-[15px] text-[#334155] leading-relaxed">
                  {lesson.content.keyConcept}
                </p>
              </div>

              {/* Example */}
              <div className="bg-[#f8fafc] rounded-2xl border border-[#e2e8f0] p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Quote className="w-4 h-4 text-[#94a3b8] shrink-0" />
                  <p
                    className="text-[10px] uppercase tracking-wider text-[#94a3b8]"
                    style={{ fontWeight: 600 }}
                  >
                    {lesson.content.example.context}
                  </p>
                </div>
                <p
                  className="text-base text-[#0f172b] leading-relaxed italic"
                  style={{ fontWeight: 400 }}
                >
                  &ldquo;{lesson.content.example.text}&rdquo;
                </p>
              </div>

              {/* Pro Tip */}
              <div className="bg-gradient-to-br from-[#0f172b] to-[#1e293b] rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-5 h-5 text-[#fbbf24] shrink-0" />
                  <p
                    className="text-xs uppercase tracking-wider text-[#fbbf24]"
                    style={{ fontWeight: 700 }}
                  >
                    Pro Tip
                  </p>
                </div>
                <p className="text-[15px] text-white/80 leading-relaxed">
                  {lesson.content.proTip}
                </p>
              </div>

              {/* ═══ Interactive Challenge ═══ */}
              <div className="border-t border-[#e2e8f0] pt-8">
                <div className="flex items-center gap-2 mb-4">
                  <PenLine className="w-5 h-5 text-[#6366f1]" />
                  <h3
                    className="text-base text-[#0f172b]"
                    style={{ fontWeight: 600 }}
                  >
                    Your Turn — Rewrite This
                  </h3>
                </div>

                {/* Instruction */}
                <p className="text-sm text-[#45556c] mb-4 leading-relaxed">
                  {lesson.challenge.instruction}
                </p>

                {/* Weak sentence */}
                <div className="bg-red-50/60 rounded-xl border border-red-200/60 p-4 mb-4">
                  <p
                    className="text-[10px] uppercase tracking-wider text-red-400 mb-1.5"
                    style={{ fontWeight: 600 }}
                  >
                    Original (weak)
                  </p>
                  <p className="text-sm text-[#334155] leading-relaxed italic">
                    &ldquo;{lesson.challenge.weakSentence}&rdquo;
                  </p>
                </div>

                {/* Textarea */}
                <textarea
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Write your improved version here..."
                  className="w-full h-28 bg-white border border-[#e2e8f0] rounded-xl p-4 text-sm text-[#0f172b] leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-[#6366f1]/30 focus:border-[#6366f1] transition-all placeholder:text-[#cbd5e1]"
                />

                {/* Actions */}
                <div className="flex items-center gap-3 mt-3">
                  <button
                    onClick={() => {
                      if (!showModel) {
                        markLessonComplete(lesson.id);
                        setCompleted(true);
                        onComplete?.();
                      }
                      setShowModel(!showModel);
                    }}
                    disabled={userAnswer.trim().length === 0 && !showModel}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-all cursor-pointer ${
                      userAnswer.trim().length > 0 || showModel
                        ? "bg-[#0f172b] text-white hover:bg-[#1d293d] shadow-sm"
                        : "bg-[#f1f5f9] text-[#cbd5e1] cursor-not-allowed"
                    }`}
                    style={{ fontWeight: 500 }}
                  >
                    <Eye className="w-4 h-4" />
                    {showModel ? "Hide Model Answer" : "Check My Answer"}
                  </button>
                  {(userAnswer.trim().length > 0 || showModel) && (
                    <button
                      onClick={() => {
                        setUserAnswer("");
                        setShowModel(false);
                      }}
                      className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm text-[#94a3b8] hover:text-[#45556c] hover:bg-[#f1f5f9] transition-all cursor-pointer"
                      style={{ fontWeight: 500 }}
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Reset
                    </button>
                  )}
                </div>

                {/* Model answer reveal */}
                <AnimatePresence>
                  {showModel && (
                    <motion.div
                      className="mt-4 bg-green-50/60 rounded-xl border border-green-200/60 p-4"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <p
                        className="text-[10px] uppercase tracking-wider text-green-500 mb-1.5"
                        style={{ fontWeight: 600 }}
                      >
                        Model Answer
                      </p>
                      <p
                        className="text-sm text-[#334155] leading-relaxed"
                        style={{ fontWeight: 500 }}
                      >
                        &ldquo;{lesson.challenge.modelAnswer}&rdquo;
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Practice Prompt */}
              <div className="bg-gradient-to-r from-[#f0fdf4] to-[#ecfdf5] rounded-2xl border border-[#bbf7d0] p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Target className="w-5 h-5 text-[#22c55e] shrink-0" />
                  <p
                    className="text-xs uppercase tracking-wider text-[#22c55e]"
                    style={{ fontWeight: 700 }}
                  >
                    Try It In Your Next Session
                  </p>
                </div>
                <p className="text-sm text-[#334155] leading-relaxed">
                  {lesson.content.practicePrompt}
                </p>
              </div>
            </div>
          </div>

          {/* ── Footer: Navigation ── */}
          <div className="sticky bottom-0 bg-white/95 backdrop-blur-md border-t border-[#e2e8f0] px-6 md:px-8 py-3 flex items-center justify-between">
            <button
              onClick={() => hasPrev && navigateTo(currentIndex - 1)}
              className={`flex items-center gap-1.5 text-sm px-4 py-2.5 rounded-xl transition-colors ${
                hasPrev
                  ? "text-[#45556c] hover:bg-[#f1f5f9] cursor-pointer"
                  : "text-[#cbd5e1] cursor-not-allowed"
              }`}
              style={{ fontWeight: 500 }}
              disabled={!hasPrev}
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            <span
              className="text-xs text-[#94a3b8]"
              style={{ fontWeight: 500 }}
            >
              {currentIndex + 1} / {lessons.length}
            </span>

            <button
              onClick={() => hasNext && navigateTo(currentIndex + 1)}
              className={`flex items-center gap-1.5 text-sm px-4 py-2.5 rounded-xl transition-colors ${
                hasNext
                  ? "text-[#45556c] hover:bg-[#f1f5f9] cursor-pointer"
                  : "text-[#cbd5e1] cursor-not-allowed"
              }`}
              style={{ fontWeight: 500 }}
              disabled={!hasNext}
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
