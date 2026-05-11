/**
 * RecommendedLessonsCard — Dashboard widget
 *
 * Surfaces lessons the user should review based on their weakest pillars
 * (from profile.stats.pillarScores). Catch-up mechanism for users who
 * skipped the DeepDiveCard in FeedbackScreen.
 *
 * Visible when: sessions_count >= 1 AND pillarScores exist.
 * Hidden when: all recommended lessons are already completed.
 */

import { BookOpen, Clock, ChevronRight, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { getRecommendedLessons, isLessonComplete } from "@/services/microLessons";
import type { MicroLesson } from "@/services/microLessons";

const PILLAR_COLORS: Record<string, string> = {
  Grammar: "#6366f1",
  Vocabulary: "#0ea5e9",
  Fluency: "#22c55e",
  Pronunciation: "#f59e0b",
  "Professional Tone": "#ec4899",
  Persuasion: "#14b8a6",
};

interface RecommendedLessonsCardProps {
  pillarScores?: Record<string, number> | null;
  onOpenLesson: (lessons: MicroLesson[], index: number) => void;
  onNavigateToLibrary?: () => void;
  onStartSession?: () => void;
}

export function RecommendedLessonsCard({ pillarScores, onOpenLesson, onNavigateToLibrary, onStartSession }: RecommendedLessonsCardProps) {
  if (!pillarScores || Object.keys(pillarScores).length === 0) {
    return (
      <motion.div
        className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm p-6"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-4 h-4 text-[#0f172b] shrink-0" />
          <p className="text-xs font-medium uppercase tracking-wider text-[#0f172b]">Recommended for you</p>
        </div>
        <p className="text-sm text-[#62748e] mb-4 leading-relaxed">
          After your first session, we identify which skills need the most attention and surface targeted micro-lessons here.
        </p>
        {onStartSession && (
          <button
            onClick={onStartSession}
            className="text-xs font-medium text-[#6366f1] hover:text-[#4f46e5] transition-colors cursor-pointer"
          >
            Start your first session →
          </button>
        )}
      </motion.div>
    );
  }

  const radarData = Object.entries(pillarScores).map(([skill, score]) => ({
    skill,
    score: typeof score === "number" ? score : 0,
    fullMark: 100,
  }));

  const allLessons = getRecommendedLessons(radarData);
  const pending = allLessons.filter((l) => !isLessonComplete(l.id));

  if (!pending.length) return null;

  return (
    <motion.div
      className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm p-6"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-4 h-4 text-[#0f172b] shrink-0" />
        <p className="text-xs font-medium uppercase tracking-wider text-[#0f172b]">Recommended for you</p>
      </div>
      <p className="text-xs text-[#62748e] mb-4">
        Based on areas where focused study pays off most.
      </p>

      {/* Top lesson */}
      {(() => {
        const lesson = pending[0];
        const color = PILLAR_COLORS[lesson.pillar] ?? "#6366f1";
        return (
          <button
            onClick={() => onOpenLesson(pending, 0)}
            className="w-full flex items-center gap-3 p-3 rounded-xl border border-[#e2e8f0] hover:border-[#c7d2fe] hover:bg-[#f8faff] transition-all text-left cursor-pointer group"
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs shrink-0 font-bold"
              style={{ backgroundColor: color }}
            >
              {lesson.pillar.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-[#0f172b] group-hover:text-[#6366f1] transition-colors font-semibold">
                {lesson.title}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded font-semibold"
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
          </button>
        );
      })()}

      {/* Footer */}
      <div className="mt-3 pt-3 border-t border-[#f1f5f9] flex items-center justify-between">
        {onNavigateToLibrary && pending.length > 1 ? (
          <button
            onClick={onNavigateToLibrary}
            className="text-[11px] text-[#6366f1] hover:text-[#4f46e5] transition-colors cursor-pointer font-semibold"
          >
            {pending.length - 1} more suggestion{pending.length - 1 !== 1 ? "s" : ""} →
          </button>
        ) : (
          <span />
        )}
        {onNavigateToLibrary && (
          <button
            onClick={onNavigateToLibrary}
            className="flex items-center gap-1 text-[11px] text-[#6366f1] hover:text-[#4f46e5] transition-colors cursor-pointer"
          >
            <BookOpen className="w-3 h-3" />
            <span className="font-semibold">Lessons Library</span>
          </button>
        )}
      </div>
    </motion.div>
  );
}
