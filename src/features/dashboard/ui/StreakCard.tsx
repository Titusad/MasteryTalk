import { Flame } from "lucide-react";

interface StreakCardProps {
  allPracticeDates: Set<string>;
  streak: number;
  totalSessions: number;
}

const DAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export function StreakCard({ allPracticeDates, streak, totalSessions }: StreakCardProps) {
  if (totalSessions === 0) return null;

  // Last 7 calendar days (today = index 6)
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().slice(0, 10);
    return { key, label: DAY_LABELS[d.getDay()], practiced: allPracticeDates.has(key) };
  });

  return (
    <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm p-6">
      <p className="text-xs font-medium uppercase tracking-wider text-[#94a3b8] mb-4">
        Practice Streak
      </p>

      <div className="flex items-center gap-3 mb-4">
        <span className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${streak > 0 ? "bg-orange-50" : "bg-[#f8fafc]"}`}>
          <Flame className={`w-4 h-4 ${streak > 0 ? "text-orange-500" : "text-[#94a3b8]"}`} />
        </span>
        <div>
          <p className="text-sm font-semibold text-[#0f172b]">
            {streak > 0 ? `${streak}-day streak` : "No streak yet"}
          </p>
          <p className="text-xs text-[#62748e] mt-0.5">
            {streak > 0 ? "Keep going — don't break the chain." : "Practice today to start your streak."}
          </p>
        </div>
      </div>

      {/* 7-day grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map(({ key, label, practiced }) => (
          <div key={key} className="flex flex-col items-center gap-1.5">
            <span className="text-[10px] font-medium text-[#94a3b8]">{label}</span>
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center ${
                practiced
                  ? "bg-[#00C950]"
                  : "bg-[#f0f4f8] border border-[#e2e8f0]"
              }`}
            >
              {practiced && (
                <div className="w-2 h-2 rounded-full bg-white opacity-80" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
