/**
 * DeepDiveCard — Post-session lesson recommendations
 *
 * Renders inside the FeedbackScreen bottomSlot.
 * Shows 1-3 lessons: one context-matched (path/level) + up to 2 weakness-based.
 * Dual-axis: what they practiced + where they struggled.
 */

import { motion } from "motion/react";
import { BookOpen, Clock, ChevronRight, Sparkles } from "lucide-react";
import type { MicroLesson } from "@/services/microLessons";

const PILLAR_COLORS: Record<string, string> = {
  Grammar: "#6366f1",
  Vocabulary: "#0ea5e9",
  Fluency: "#22c55e",
  Pronunciation: "#f59e0b",
  "Professional Tone": "#ec4899",
  Persuasion: "#14b8a6",
};

interface DeepDiveCardProps {
  lessons: MicroLesson[];
  onOpenLesson: (lesson: MicroLesson) => void;
}

export function DeepDiveCard({ lessons, onOpenLesson }: DeepDiveCardProps) {
  if (!lessons.length) return null;

  return (
    <motion.div
      className="mt-8 mb-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      {/* Separator */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 h-px bg-[#e2e8f0]" />
        <span className="flex items-center gap-1.5 text-xs text-[#94a3b8] font-medium" >
          <Sparkles className="w-3 h-3" />
          Recommended for you
        </span>
        <div className="flex-1 h-px bg-[#e2e8f0]" />
      </div>

      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <BookOpen className="w-4 h-4 text-[#0f172b]" />
        <p className="text-sm text-[#0f172b] font-semibold" >
          Go deeper — Lessons Library
        </p>
      </div>
      <p className="text-xs text-[#62748e] mb-4">
        Based on your session and the areas where practice pays off most.
      </p>

      {/* Lesson cards */}
      <div className="flex flex-col gap-3">
        {lessons.map((lesson, i) => {
          const color = PILLAR_COLORS[lesson.pillar] ?? "#6366f1";
          return (
            <motion.button
              key={lesson.id}
              onClick={() => onOpenLesson(lesson)}
              className="w-full bg-white rounded-2xl border border-[#e2e8f0] p-4 flex items-center gap-4 hover:shadow hover:border-[#cbd5e1] transition-all text-left cursor-pointer group"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * i }}
            >
              {/* Pillar badge */}
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm shrink-0"
                style={{ backgroundColor: color }}
              >
                {lesson.pillar.charAt(0)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[#0f172b] mb-0.5 group-hover:text-[#6366f1] transition-colors font-semibold" >
                  {lesson.title}
                </p>
                <p className="text-xs text-[#62748e] line-clamp-1">{lesson.subtitle}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded"
                    style={{ backgroundColor: `${color}18`, color }}
                  >
                    {lesson.pillar}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-[#94a3b8]">
                    <Clock className="w-3 h-3" />
                    {lesson.duration}
                  </span>
                </div>
              </div>

              <ChevronRight className="w-4 h-4 text-[#cbd5e1] group-hover:text-[#6366f1] shrink-0 transition-colors" />
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
