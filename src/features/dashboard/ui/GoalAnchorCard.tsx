import { Target, Pencil } from "lucide-react";
import { motion } from "motion/react";

const GOAL_LABELS: Record<string, string> = {
  interview: "Job Interview",
  sales: "Sales & Negotiation",
  meeting: "Team Meetings",
  presentation: "Presentations",
  culture: "Culture & Teamwork",
};

interface GoalAnchorCardProps {
  englishGoal?: string;
  daysActive: number;
  onEditGoal: () => void;
}

export function GoalAnchorCard({ englishGoal, daysActive, onEditGoal }: GoalAnchorCardProps) {
  const displayGoal = englishGoal ? (GOAL_LABELS[englishGoal] ?? englishGoal) : undefined;

  if (!displayGoal) {
    return (
      <motion.div
        className="bg-white rounded-2xl border border-[#e2e8f0] p-4"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-2 mb-2">
          <Target className="w-4 h-4 text-[#94a3b8]" />
          <p className="text-xs font-medium uppercase tracking-wider text-[#94a3b8]">Your English Goal</p>
        </div>
        <p className="text-sm text-[#94a3b8] leading-relaxed mb-3">
          Set a specific goal to anchor your motivation and make every session count.
        </p>
        <button
          onClick={onEditGoal}
          className="flex items-center gap-1.5 text-xs font-medium text-[#6366f1] hover:text-[#4f46e5] transition-colors cursor-pointer"
        >
          <Pencil className="w-3 h-3" />
          Set your goal
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="bg-gradient-to-br from-[#0f172b] to-[#1e293b] rounded-2xl p-4 relative overflow-hidden"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/5 rounded-full blur-xl pointer-events-none" />
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-[#6366f1] shrink-0" />
          <p className="text-xs font-medium uppercase tracking-wider text-white/50">Your Goal</p>
        </div>
        <button
          onClick={onEditGoal}
          className="shrink-0 p-1 rounded-md hover:bg-white/10 transition-colors cursor-pointer"
          title="Edit goal"
        >
          <Pencil className="w-3 h-3 text-white/40" />
        </button>
      </div>
      <p className="text-sm font-medium text-white leading-snug mb-3">
        "{displayGoal}"
      </p>
      <p className="text-xs text-white/40">
        {daysActive} day{daysActive !== 1 ? "s" : ""} practicing · keep going
      </p>
    </motion.div>
  );
}
