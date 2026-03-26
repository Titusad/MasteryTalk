/**
 * CoachRecommendation — AI-recommended lessons panel
 * Presentational component (web-specific).
 */
import { motion } from "motion/react";
import { Target, ChevronRight, Clock } from "lucide-react";
import { isLessonComplete } from "../../../../services/microLessons";

interface Lesson {
  id: string;
  title: string;
  subtitle: string;
  pillar: string;
  icon: string;
  duration: string;
}

interface CoachRecommendationProps {
  lessons: Lesson[];
  focusArea: { pillar: string; score: number } | null;
  hasPracticed: boolean;
  dc: {
    recommended: {
      title: string;
      aiBadge: string;
    };
  };
  onOpenLesson: (index: number) => void;
  onSeeAll: () => void;
}

const PILLAR_COLORS: Record<string, string> = {
  Vocabulary: "#6366f1",
  Grammar: "#0ea5e9",
  Fluency: "#22c55e",
  Pronunciation: "#f59e0b",
  "Professional Tone": "#ec4899",
  Persuasion: "#8b5cf6",
};

export function CoachRecommendation({
  lessons,
  focusArea,
  hasPracticed,
  dc,
  onOpenLesson,
  onSeeAll,
}: CoachRecommendationProps) {
  return (
    <motion.div
      className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm p-5 flex flex-col"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-[#f59e0b]" />
          <h3
            className="text-sm text-[#0f172b]"
            style={{ fontWeight: 600 }}
          >
            {dc.recommended.title}
          </h3>
        </div>
        <span
          className="bg-[#fef3c7] text-[#92400e] text-[10px] px-2.5 py-1 rounded-full"
          style={{ fontWeight: 600 }}
        >
          {dc.recommended.aiBadge}
        </span>
      </div>

      <p className="text-xs text-[#45556c] mb-4 leading-relaxed">
        {focusArea
          ? `Based on your sessions, strengthen these skills to boost your ${focusArea.pillar.toLowerCase()} score.`
          : hasPracticed
            ? "Here are lessons tailored to your communication profile."
            : "Start with these foundational skills for executive communication."}
      </p>

      <div className="space-y-2 mb-4 flex-1">
        {lessons.slice(0, 3).map((lesson, i) => {
          const lColor = PILLAR_COLORS[lesson.pillar] || "#6366f1";
          return (
            <motion.button
              key={lesson.id}
              onClick={() => onOpenLesson(i)}
              className={`w-full bg-gradient-to-br from-[#f8fafc] to-[#eef2ff] rounded-xl border p-4 flex items-start gap-3 hover:shadow-md transition-all text-left cursor-pointer group ${
                isLessonComplete(lesson.id)
                  ? "border-[#bbf7d0]"
                  : "border-[#e2e8f0]"
              }`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.05 }}
            >
              <span className="text-xl shrink-0 mt-0.5">
                {lesson.icon}
              </span>
              <div className="min-w-0 flex-1">
                <p
                  className="text-sm text-[#0f172b] mb-0.5 group-hover:text-[#6366f1] transition-colors"
                  style={{ fontWeight: 500 }}
                >
                  {lesson.title}
                </p>
                <p className="text-[11px] text-[#62748e] leading-relaxed line-clamp-1">
                  {lesson.subtitle}
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full"
                    style={{
                      fontWeight: 600,
                      backgroundColor: `${lColor}12`,
                      color: lColor,
                    }}
                  >
                    {lesson.pillar}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-[#94a3b8]">
                    <Clock className="w-3 h-3" />
                    {lesson.duration}
                  </span>
                  {isLessonComplete(lesson.id) && (
                    <span
                      className="flex items-center gap-1 text-[10px] text-[#22c55e]"
                      style={{ fontWeight: 600 }}
                    >
                      ✓ Done
                    </span>
                  )}
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#cbd5e1] group-hover:text-[#6366f1] shrink-0 mt-2 transition-colors" />
            </motion.button>
          );
        })}
      </div>

      {lessons.length > 3 && (
        <button
          onClick={onSeeAll}
          className="text-xs text-[#6366f1] hover:text-[#4f46e5] transition-colors mb-3 cursor-pointer text-center"
          style={{ fontWeight: 500 }}
        >
          See all {lessons.length} recommended lessons →
        </button>
      )}
    </motion.div>
  );
}
