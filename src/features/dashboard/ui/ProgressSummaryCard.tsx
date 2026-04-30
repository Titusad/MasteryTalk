import { TrendingUp, BarChart2 } from "lucide-react";

interface ProgressSummaryCardProps {
  totalSessions: number;
  waPhrasesMastered: number;
  mostPracticed: string | null;
  bestPillarDelta: { pillar: string; delta: number } | null;
}

const SCENARIO_LABELS: Record<string, string> = {
  interview: "Interview",
  meeting: "Meeting",
  presentation: "Presentation",
  sales: "Sales",
  culture: "U.S. Culture",
  "self-intro": "Self-Intro",
};

export function ProgressSummaryCard({
  totalSessions,
  waPhrasesMastered,
  mostPracticed,
  bestPillarDelta,
}: ProgressSummaryCardProps) {
  if (totalSessions === 0) {
    return (
      <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-7 h-7 rounded-full bg-[#DBEDDF] flex items-center justify-center">
            <TrendingUp className="w-3.5 h-3.5 text-[#16803c]" />
          </span>
          <p className="text-xs font-medium uppercase tracking-wider text-[#94a3b8]">
            What you've built
          </p>
        </div>
        <div className="flex flex-col items-center justify-center text-center gap-3 py-2">
          <span className="w-12 h-12 rounded-full bg-[#f8fafc] border border-[#e2e8f0] flex items-center justify-center">
            <BarChart2 className="w-5 h-5 text-[#62748e]" />
          </span>
          <p className="text-sm text-[#62748e] leading-relaxed max-w-[200px]">
            Your progress summary will appear here after your first session.
          </p>
        </div>
      </div>
    );
  }

  const scenarioLabel = mostPracticed ? (SCENARIO_LABELS[mostPracticed] ?? mostPracticed) : null;

  return (
    <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="w-7 h-7 rounded-full bg-[#DBEDDF] flex items-center justify-center">
          <TrendingUp className="w-3.5 h-3.5 text-[#16803c]" />
        </span>
        <p className="text-xs font-medium uppercase tracking-wider text-[#94a3b8]">
          What you've built
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#f8fafc] rounded-xl p-3">
          <p className="text-2xl font-bold text-[#0f172b] leading-none">{totalSessions}</p>
          <p className="text-xs text-[#62748e] mt-1">sessions</p>
        </div>

        <div className="bg-[#f8fafc] rounded-xl p-3">
          <p className="text-2xl font-bold text-[#0f172b] leading-none">{waPhrasesMastered}</p>
          <p className="text-xs text-[#62748e] mt-1">phrases drilled</p>
        </div>

        {scenarioLabel && (
          <div className="bg-[#f8fafc] rounded-xl p-3">
            <p className="text-sm font-semibold text-[#0f172b] leading-snug">{scenarioLabel}</p>
            <p className="text-xs text-[#62748e] mt-1">most practiced</p>
          </div>
        )}

        {bestPillarDelta && bestPillarDelta.delta > 0 && (
          <div className="bg-[#f8fafc] rounded-xl p-3">
            <p className="text-sm font-semibold text-[#16803c] leading-snug">
              +{bestPillarDelta.delta}pts
            </p>
            <p className="text-xs text-[#62748e] mt-1">{bestPillarDelta.pillar}</p>
          </div>
        )}
      </div>
    </div>
  );
}
