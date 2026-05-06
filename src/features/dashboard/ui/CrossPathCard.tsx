import { BarChart2 } from "lucide-react";
import type { ProgressionState, LevelState } from "@/services/types";

interface CrossPathCardProps {
  perPathStats: Record<string, { sessions: number; avgScore: number | null }>;
  progressionState?: ProgressionState | null;
  onStartSession?: () => void;
}

const PATH_LABEL: Record<string, string> = {
  interview: "Interview Mastery",
  sales: "Sales Champion",
  meeting: "Remote Meeting",
  presentation: "Presentations",
  culture: "U.S. Business Culture",
};

export function CrossPathCard({ perPathStats, progressionState, onStartSession }: CrossPathCardProps) {
  const entries = Object.entries(perPathStats).filter(
    ([key]) => key !== "self-intro" && PATH_LABEL[key]
  );

  if (entries.length < 2) {
    return (
      <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm p-6">
        <p className="text-xs font-medium uppercase tracking-wider text-[#94a3b8] mb-4">
          Progress Across Paths
        </p>
        <div className="flex flex-col gap-3">
          <span className="w-10 h-10 rounded-full bg-[#f8fafc] border border-[#e2e8f0] flex items-center justify-center">
            <BarChart2 className="w-4 h-4 text-[#62748e]" />
          </span>
          <p className="text-xs text-[#62748e] leading-relaxed">
            Once you practice across multiple paths, here you'll see a side-by-side comparison of your level completions and scores.
          </p>
          <div className="space-y-2">
            {Object.keys(PATH_LABEL).slice(0, 3).map((key) => (
              <div key={key}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-[#94a3b8]">{PATH_LABEL[key]}</span>
                  <span className="text-xs text-[#94a3b8]">0/6 levels</span>
                </div>
                <div className="h-1.5 bg-[#f0f4f8] rounded-full" />
              </div>
            ))}
          </div>
          {onStartSession && (
            <button
              onClick={onStartSession}
              className="text-xs font-medium text-[#6366f1] hover:text-[#4f46e5] transition-colors cursor-pointer text-left"
            >
              Start your first session →
            </button>
          )}
        </div>
      </div>
    );
  }

  const TOTAL_LEVELS = 6;
  const sorted = [...entries].sort((a, b) => b[1].sessions - a[1].sessions);

  // Real completion from progression state: count levels with status "completed"
  const getCompletion = (pathKey: string): { completed: number; pct: number } => {
    const pathLevels = progressionState
      ? (progressionState[pathKey as keyof ProgressionState] as Record<string, LevelState> | undefined)
      : null;
    if (pathLevels && typeof pathLevels === "object") {
      const completed = Object.values(pathLevels).filter(
        (l: LevelState) => l?.status === "completed"
      ).length;
      return { completed, pct: Math.round((completed / TOTAL_LEVELS) * 100) };
    }
    // Fallback: use sessions (capped) if no progression state available
    const sessions = entries.find(([k]) => k === pathKey)?.[1].sessions ?? 0;
    const capped = Math.min(sessions, TOTAL_LEVELS);
    return { completed: capped, pct: Math.round((capped / TOTAL_LEVELS) * 100) };
  };

  return (
    <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm p-6">
      <p className="text-xs font-medium uppercase tracking-wider text-[#94a3b8] mb-4">
        Progress Across Paths
      </p>

      <div className="flex items-center gap-2 mb-4">
        <span className="w-8 h-8 rounded-full bg-[#eef2ff] flex items-center justify-center flex-shrink-0">
          <BarChart2 className="w-4 h-4 text-[#6366f1]" />
        </span>
        <p className="text-sm font-semibold text-[#0f172b]">
          {entries.length} paths practiced
        </p>
      </div>

      <div className="space-y-3">
        {sorted.map(([key]) => {
          const { completed, pct } = getCompletion(key);
          return (
            <div key={key}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-[#0f172b]">
                  {PATH_LABEL[key]}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[#6366f1]">
                    {pct}%
                  </span>
                  <span className="text-xs text-[#94a3b8]">
                    {completed}/{TOTAL_LEVELS} levels
                  </span>
                </div>
              </div>
              <div className="h-1.5 bg-[#f0f4f8] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#6366f1] rounded-full transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
