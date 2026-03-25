/**
 * ══════════════════════════════════════════════════════════════
 *  RemedialView — Post-session remedial lesson cards + shadowing drill
 *  Shows AI-generated lessons + shadowing phrases with score gate.
 * ══════════════════════════════════════════════════════════════
 */

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { BookOpen, CheckCircle2, ChevronRight, Mic, RefreshCcw, Trophy, XCircle, Volume2 } from "lucide-react";
import type { RemedialContent, RemedialLesson, RemedialShadowingPhrase } from "../../../services/types";

/* ── Props ── */

interface RemedialViewProps {
  remedial: RemedialContent;
  levelTitle: string;
  onComplete: (shadowingScore: number) => void;
  onRetry: () => void;
}

/* ── Shadowing Drill ── */

function ShadowingDrill({
  phrases,
  onComplete,
}: {
  phrases: RemedialShadowingPhrase[];
  onComplete: (avgScore: number) => void;
}) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [scores, setScores] = useState<number[]>([]);
  const [practiceState, setPracticeState] = useState<"ready" | "listening" | "scored">("ready");

  const current = phrases[currentIdx];
  const isLast = currentIdx === phrases.length - 1;

  const simulatePractice = useCallback(() => {
    setPracticeState("listening");
    // Simulate recording + scoring (MVP: random score 50-95)
    setTimeout(() => {
      const score = Math.floor(Math.random() * 46) + 50;
      setScores((prev) => [...prev, score]);
      setPracticeState("scored");
    }, 2000);
  }, []);

  const handleNext = useCallback(() => {
    if (isLast) {
      const allScores = [...scores];
      const avg = Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length);
      onComplete(avg);
    } else {
      setCurrentIdx((i) => i + 1);
      setPracticeState("ready");
    }
  }, [isLast, scores, onComplete]);

  return (
    <div className="space-y-4">
      {/* Progress indicator */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs text-[#62748e]" style={{ fontWeight: 500 }}>
          Phrase {currentIdx + 1} of {phrases.length}
        </span>
        <div className="flex gap-1 flex-1">
          {phrases.map((_, i) => (
            <div
              key={i}
              className="h-1.5 rounded-full flex-1 transition-all duration-300"
              style={{
                backgroundColor:
                  i < currentIdx
                    ? "#22c55e"
                    : i === currentIdx
                      ? "#6366f1"
                      : "#e2e8f0",
              }}
            />
          ))}
        </div>
      </div>

      {/* Current phrase card */}
      <motion.div
        key={currentIdx}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-gradient-to-br from-[#f8fafc] to-[#eef2ff] rounded-xl border border-[#e2e8f0] p-5"
      >
        <div className="flex items-center gap-2 mb-3">
          <span
            className="text-[10px] px-2 py-0.5 rounded-full bg-[#6366f1]/10 text-[#6366f1]"
            style={{ fontWeight: 600 }}
          >
            {current?.focus}
          </span>
        </div>

        <p className="text-base text-[#0f172b] mb-4 leading-relaxed" style={{ fontWeight: 500 }}>
          "{current?.phrase}"
        </p>

        {/* Listen button (visual only for MVP) */}
        <button
          className="flex items-center gap-2 text-xs text-[#6366f1] mb-4 cursor-pointer hover:text-[#4f46e5] transition-colors"
          style={{ fontWeight: 500 }}
          onClick={() => {
            // TODO: TTS playback
          }}
        >
          <Volume2 className="w-4 h-4" />
          Listen to pronunciation
        </button>

        {/* Practice button */}
        {practiceState === "ready" && (
          <motion.button
            onClick={simulatePractice}
            className="w-full py-3 rounded-xl bg-[#0f172b] text-white text-sm flex items-center justify-center gap-2 hover:bg-[#1e293b] transition-colors cursor-pointer"
            style={{ fontWeight: 600 }}
            whileTap={{ scale: 0.98 }}
          >
            <Mic className="w-4 h-4" />
            Record Your Attempt
          </motion.button>
        )}

        {practiceState === "listening" && (
          <div className="w-full py-3 rounded-xl bg-[#ef4444] text-white text-sm flex items-center justify-center gap-2">
            <div className="w-3 h-3 rounded-full bg-white animate-pulse" />
            Listening...
          </div>
        )}

        {practiceState === "scored" && (
          <div className="space-y-3">
            <div
              className={`w-full py-3 rounded-xl text-sm flex items-center justify-center gap-2 ${
                scores[scores.length - 1] >= 60
                  ? "bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/30"
                  : "bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/30"
              }`}
              style={{ fontWeight: 600 }}
            >
              {scores[scores.length - 1] >= 60 ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <XCircle className="w-4 h-4" />
              )}
              Score: {scores[scores.length - 1]}%
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setPracticeState("ready")}
                className="flex-1 py-2.5 rounded-xl border border-[#e2e8f0] text-sm text-[#62748e] flex items-center justify-center gap-1.5 hover:bg-[#f8fafc] transition-colors cursor-pointer"
                style={{ fontWeight: 500 }}
              >
                <RefreshCcw className="w-3.5 h-3.5" />
                Try Again
              </button>
              <button
                onClick={handleNext}
                className="flex-1 py-2.5 rounded-xl bg-[#6366f1] text-white text-sm flex items-center justify-center gap-1.5 hover:bg-[#4f46e5] transition-colors cursor-pointer"
                style={{ fontWeight: 600 }}
              >
                {isLast ? "Finish" : "Next Phrase"}
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

/* ── Main Component ── */

export function RemedialView({ remedial, levelTitle, onComplete, onRetry }: RemedialViewProps) {
  const [phase, setPhase] = useState<"lessons" | "shadowing" | "result">("lessons");
  const [currentLesson, setCurrentLesson] = useState(0);
  const [finalScore, setFinalScore] = useState(0);

  const passed = finalScore >= 60;

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <BookOpen className="w-5 h-5 text-[#f59e0b]" />
          <h2 className="text-xl text-[#0f172b]" style={{ fontWeight: 700 }}>
            {phase === "result" ? "Results" : "Study Phase"}
          </h2>
        </div>
        <p className="text-sm text-[#62748e]">
          {phase === "lessons"
            ? `Personalized lessons from your "${levelTitle}" session`
            : phase === "shadowing"
              ? "Practice these key phrases to unlock the next level"
              : passed
                ? "Great job! You've unlocked the next level."
                : "Keep practicing — you need ≥ 60% to advance."}
        </p>

        {/* Weak pillars */}
        {phase !== "result" && remedial.weakPillars.length > 0 && (
          <div className="flex items-center justify-center gap-2 mt-3">
            {remedial.weakPillars.map((p) => (
              <span
                key={p}
                className="text-[10px] px-2.5 py-1 rounded-full bg-[#fef3c7] text-[#92400e]"
                style={{ fontWeight: 600 }}
              >
                Focus: {p}
              </span>
            ))}
          </div>
        )}
      </motion.div>

      {/* ── LESSONS PHASE ── */}
      {phase === "lessons" && (
        <div className="space-y-4">
          {remedial.lessons.map((lesson, i) => (
            <motion.div
              key={lesson.id}
              className={`bg-white rounded-xl border p-5 transition-all ${
                i === currentLesson
                  ? "border-[#6366f1] shadow-sm"
                  : i < currentLesson
                    ? "border-[#22c55e]/30 bg-[#f0fdf4]"
                    : "border-[#e2e8f0] opacity-60"
              }`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i }}
            >
              <div className="flex items-start gap-3 mb-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor:
                      i < currentLesson
                        ? "rgba(34, 197, 94, 0.1)"
                        : "rgba(99, 102, 241, 0.1)",
                  }}
                >
                  {i < currentLesson ? (
                    <CheckCircle2 className="w-4 h-4 text-[#22c55e]" />
                  ) : (
                    <span className="text-sm" style={{ fontWeight: 700, color: "#6366f1" }}>
                      {i + 1}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm text-[#0f172b]" style={{ fontWeight: 600 }}>
                      {lesson.title}
                    </h4>
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-full bg-[#f1f5f9] text-[#62748e]"
                      style={{ fontWeight: 500 }}
                    >
                      {lesson.pillar}
                    </span>
                  </div>
                  <p className="text-xs text-[#62748e] leading-relaxed mb-3">{lesson.content}</p>

                  {/* Before/After example */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-[#fef2f2] rounded-lg p-3 border border-[#fecaca]">
                      <span className="text-[10px] text-[#dc2626] uppercase tracking-wider" style={{ fontWeight: 600 }}>
                        ✗ Avoid
                      </span>
                      <p className="text-xs text-[#7f1d1d] mt-1 italic">"{lesson.example.wrong}"</p>
                    </div>
                    <div className="bg-[#f0fdf4] rounded-lg p-3 border border-[#bbf7d0]">
                      <span className="text-[10px] text-[#16a34a] uppercase tracking-wider" style={{ fontWeight: 600 }}>
                        ✓ Better
                      </span>
                      <p className="text-xs text-[#14532d] mt-1 italic">"{lesson.example.correct}"</p>
                    </div>
                  </div>
                </div>
              </div>

              {i === currentLesson && (
                <motion.button
                  onClick={() => {
                    if (i < remedial.lessons.length - 1) {
                      setCurrentLesson(i + 1);
                    } else {
                      setPhase("shadowing");
                    }
                  }}
                  className="w-full mt-3 py-2.5 rounded-xl bg-[#0f172b] text-white text-sm flex items-center justify-center gap-1.5 hover:bg-[#1e293b] transition-colors cursor-pointer"
                  style={{ fontWeight: 600 }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {i < remedial.lessons.length - 1 ? (
                    <>
                      Next Lesson <ChevronRight className="w-3.5 h-3.5" />
                    </>
                  ) : (
                    <>
                      Start Shadowing Drill <Mic className="w-3.5 h-3.5" />
                    </>
                  )}
                </motion.button>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* ── SHADOWING PHASE ── */}
      {phase === "shadowing" && (
        <ShadowingDrill
          phrases={remedial.shadowingPhrases}
          onComplete={(avgScore) => {
            setFinalScore(avgScore);
            setPhase("result");
          }}
        />
      )}

      {/* ── RESULT PHASE ── */}
      {phase === "result" && (
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div
            className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${
              passed
                ? "bg-[#22c55e]/10 border-2 border-[#22c55e]"
                : "bg-[#f59e0b]/10 border-2 border-[#f59e0b]"
            }`}
          >
            {passed ? (
              <Trophy className="w-10 h-10 text-[#22c55e]" />
            ) : (
              <RefreshCcw className="w-10 h-10 text-[#f59e0b]" />
            )}
          </div>

          <h3
            className="text-2xl text-[#0f172b] mb-2"
            style={{ fontWeight: 700 }}
          >
            {finalScore}%
          </h3>
          <p className="text-sm text-[#62748e] mb-6">
            {passed
              ? "You've passed the shadowing drill! The next level is now unlocked."
              : "You need at least 60% to unlock the next level. Try again!"}
          </p>

          <div className="flex gap-3 justify-center">
            {!passed && (
              <button
                onClick={onRetry}
                className="px-6 py-3 rounded-xl border border-[#e2e8f0] text-sm text-[#0f172b] hover:bg-[#f8fafc] transition-colors cursor-pointer"
                style={{ fontWeight: 500 }}
              >
                Try Again
              </button>
            )}
            <button
              onClick={() => onComplete(finalScore)}
              className="px-6 py-3 rounded-xl bg-[#0f172b] text-white text-sm hover:bg-[#1e293b] transition-colors cursor-pointer"
              style={{ fontWeight: 600 }}
            >
              {passed ? "Continue to Next Level →" : "Back to Dashboard"}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
