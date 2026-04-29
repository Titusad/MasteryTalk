import { BarChart2 } from "lucide-react";

interface CrossPathCardProps {
  perPathStats: Record<string, { sessions: number; avgScore: number | null }>;
}

const PATH_LABEL: Record<string, string> = {
  interview: "Interview Mastery",
  sales: "Sales Champion",
  meeting: "Remote Meeting",
  presentation: "Presentations",
  culture: "U.S. Business Culture",
};

export function CrossPathCard({ perPathStats }: CrossPathCardProps) {
  const entries = Object.entries(perPathStats).filter(
    ([key]) => key !== "self-intro" && PATH_LABEL[key]
  );

  if (entries.length < 2) return null;

  const sorted = [...entries].sort((a, b) => b[1].sessions - a[1].sessions);
  const maxSessions = sorted[0][1].sessions;

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
        {sorted.map(([key, { sessions, avgScore }]) => {
          const barWidth = maxSessions > 0 ? Math.round((sessions / maxSessions) * 100) : 0;
          const scoreLabel = avgScore !== null ? `${Math.round(avgScore)}%` : null;

          return (
            <div key={key}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-[#0f172b]">
                  {PATH_LABEL[key]}
                </span>
                <div className="flex items-center gap-2">
                  {scoreLabel && (
                    <span className="text-xs text-[#62748e]">{scoreLabel}</span>
                  )}
                  <span className="text-xs font-medium text-[#45556c]">
                    {sessions} {sessions === 1 ? "session" : "sessions"}
                  </span>
                </div>
              </div>
              <div className="h-1.5 bg-[#f0f4f8] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#6366f1] rounded-full transition-all duration-500"
                  style={{ width: `${barWidth}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
