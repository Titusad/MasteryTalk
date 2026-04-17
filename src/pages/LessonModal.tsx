/**
 * ══════════════════════════════════════════════════════════════
 *  inFluentia PRO — Lesson Modal
 *
 *  Displays a MicroLesson inside a fullscreen modal overlay.
 *  Supports navigation between lessons, completion tracking,
 *  and interactive challenge view.
 * ══════════════════════════════════════════════════════════════
 */

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ChevronLeft, ChevronRight, CheckCircle2, Lightbulb, BookOpen, Target, Sparkles } from "lucide-react";
import type { MicroLesson } from "@/services/microLessons";
import { markLessonComplete, isLessonComplete } from "@/services/microLessons";

/* ─── Props ─── */
interface LessonModalProps {
  lessons: MicroLesson[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
  onComplete: () => void;
}

export function LessonModal({ lessons, currentIndex, onClose, onNavigate, onComplete }: LessonModalProps) {
  const lesson = lessons[currentIndex];
  const [showChallenge, setShowChallenge] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const done = isLessonComplete(lesson.id);

  if (!lesson) return null;

  const handleComplete = () => {
    markLessonComplete(lesson.id);
    onComplete();
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setShowChallenge(false);
      setShowAnswer(false);
      onNavigate(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < lessons.length - 1) {
      setShowChallenge(false);
      setShowAnswer(false);
      onNavigate(currentIndex + 1);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
        >
          {/* Header */}
          <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md border-b border-[#e2e8f0] px-6 py-4 rounded-t-3xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{lesson.icon}</span>
                <div>
                  <p
                    className="text-xs text-[#6366f1] uppercase tracking-wider"
                    style={{ fontWeight: 600 }}
                  >
                    {lesson.pillar} · {lesson.duration}
                  </p>
                  <h2
                    className="text-lg text-[#0f172b]"
                    style={{ fontWeight: 700 }}
                  >
                    {lesson.title}
                  </h2>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-[#f1f5f9] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 text-[#94a3b8]" />
              </button>
            </div>

            {/* Progress */}
            <div className="flex items-center gap-2 mt-3">
              <span className="text-[11px] text-[#94a3b8]" style={{ fontWeight: 500 }}>
                {currentIndex + 1} of {lessons.length}
              </span>
              <div className="flex-1 h-1 bg-[#f1f5f9] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#6366f1] rounded-full transition-all duration-300"
                  style={{ width: `${((currentIndex + 1) / lessons.length) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="px-6 py-5 space-y-5">
            {!showChallenge ? (
              <>
                {/* Intro */}
                <section>
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="w-4 h-4 text-[#6366f1]" />
                    <p className="text-xs text-[#6366f1] uppercase tracking-wider" style={{ fontWeight: 600 }}>
                      Introduction
                    </p>
                  </div>
                  <p className="text-sm text-[#334155] leading-relaxed">
                    {lesson.content.intro}
                  </p>
                </section>

                {/* Key Concept */}
                <section className="bg-[#f0f9ff] border border-[#bae6fd] rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="w-4 h-4 text-[#0284c7]" />
                    <p className="text-xs text-[#0284c7] uppercase tracking-wider" style={{ fontWeight: 600 }}>
                      Key Concept
                    </p>
                  </div>
                  <p className="text-sm text-[#0c4a6e] leading-relaxed">
                    {lesson.content.keyConcept}
                  </p>
                </section>

                {/* Example */}
                <section className="bg-[#fefce8] border border-[#fde68a] rounded-2xl p-4">
                  <p className="text-[10px] text-[#92400e] uppercase tracking-wider mb-1" style={{ fontWeight: 600 }}>
                    {lesson.content.example.context}
                  </p>
                  <p className="text-sm text-[#78350f] leading-relaxed italic">
                    "{lesson.content.example.text}"
                  </p>
                </section>

                {/* Pro Tip */}
                <section className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-[#16a34a]" />
                    <p className="text-xs text-[#16a34a] uppercase tracking-wider" style={{ fontWeight: 600 }}>
                      Pro Tip
                    </p>
                  </div>
                  <p className="text-sm text-[#14532d] leading-relaxed">
                    {lesson.content.proTip}
                  </p>
                </section>

                {/* Practice Prompt */}
                <section className="bg-[#faf5ff] border border-[#e9d5ff] rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-[#0f172b]" />
                    <p className="text-xs text-[#0f172b] uppercase tracking-wider" style={{ fontWeight: 600 }}>
                      Practice Prompt
                    </p>
                  </div>
                  <p className="text-sm text-[#3b0764] leading-relaxed">
                    {lesson.content.practicePrompt}
                  </p>
                </section>
              </>
            ) : (
              /* ─── Challenge View ─── */
              <section className="space-y-4">
                <div className="bg-[#fff7ed] border border-[#fed7aa] rounded-2xl p-4">
                  <p className="text-xs text-[#9a3412] uppercase tracking-wider mb-2" style={{ fontWeight: 600 }}>
                    Challenge
                  </p>
                  <p className="text-sm text-[#7c2d12] leading-relaxed mb-3">
                    {lesson.challenge.instruction}
                  </p>
                  <div className="bg-white/80 rounded-xl p-3 border border-[#fdba74]">
                    <p className="text-sm text-[#431407] italic">
                      "{lesson.challenge.weakSentence}"
                    </p>
                  </div>
                </div>

                {showAnswer && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-2xl p-4"
                  >
                    <p className="text-xs text-[#16a34a] uppercase tracking-wider mb-2" style={{ fontWeight: 600 }}>
                      Model Answer
                    </p>
                    <p className="text-sm text-[#14532d] leading-relaxed italic">
                      "{lesson.challenge.modelAnswer}"
                    </p>
                  </motion.div>
                )}

                {!showAnswer && (
                  <button
                    onClick={() => setShowAnswer(true)}
                    className="w-full py-3 rounded-xl bg-[#0f172b] text-white text-sm hover:bg-[#1e293b] transition-colors cursor-pointer"
                    style={{ fontWeight: 600 }}
                  >
                    Show Model Answer
                  </button>
                )}
              </section>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white/95 backdrop-blur-md border-t border-[#e2e8f0] px-6 py-4 rounded-b-3xl">
            <div className="flex items-center justify-between">
              {/* Nav arrows */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  className="p-2 rounded-full hover:bg-[#f1f5f9] transition-colors disabled:opacity-30 cursor-pointer disabled:cursor-default"
                >
                  <ChevronLeft className="w-5 h-5 text-[#64748b]" />
                </button>
                <button
                  onClick={handleNext}
                  disabled={currentIndex === lessons.length - 1}
                  className="p-2 rounded-full hover:bg-[#f1f5f9] transition-colors disabled:opacity-30 cursor-pointer disabled:cursor-default"
                >
                  <ChevronRight className="w-5 h-5 text-[#64748b]" />
                </button>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                {!showChallenge ? (
                  <button
                    onClick={() => setShowChallenge(true)}
                    className="px-4 py-2 rounded-xl bg-[#f1f5f9] text-[#334155] text-sm hover:bg-[#e2e8f0] transition-colors cursor-pointer"
                    style={{ fontWeight: 600 }}
                  >
                    Try Challenge
                  </button>
                ) : (
                  <button
                    onClick={() => { setShowChallenge(false); setShowAnswer(false); }}
                    className="px-4 py-2 rounded-xl bg-[#f1f5f9] text-[#334155] text-sm hover:bg-[#e2e8f0] transition-colors cursor-pointer"
                    style={{ fontWeight: 600 }}
                  >
                    Back to Lesson
                  </button>
                )}

                {done ? (
                  <span className="flex items-center gap-1.5 text-sm text-[#22c55e]" style={{ fontWeight: 600 }}>
                    <CheckCircle2 className="w-4 h-4" /> Completed
                  </span>
                ) : (
                  <button
                    onClick={handleComplete}
                    className="px-4 py-2 rounded-xl bg-[#22c55e] text-white text-sm hover:bg-[#16a34a] transition-colors cursor-pointer"
                    style={{ fontWeight: 600 }}
                  >
                    Mark Complete
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
