import { Flame, Zap } from "lucide-react";

interface StreakCardProps {
  allPracticeDates: Set<string>;
  streak: number;
  totalSessions: number;
  waPhrasesMastered?: number;
}

const DAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export function StreakCard({ allPracticeDates, streak, totalSessions, waPhrasesMastered = 0 }: StreakCardProps) {
  if (totalSessions === 0) {
    return (
      <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm p-6">
        <p className="text-xs font-medium uppercase tracking-wider text-[#94a3b8] mb-4">
          Practice Streak
        </p>
        <div className="flex flex-col items-center justify-center text-center gap-3 py-2">
          <span className="w-12 h-12 rounded-full bg-[#f8fafc] border border-[#e2e8f0] flex items-center justify-center">
            <Zap className="w-5 h-5 text-[#62748e]" />
          </span>
          <p className="text-sm font-semibold text-[#0f172b]">No streak yet</p>
          <p className="text-sm text-[#62748e] leading-relaxed max-w-[200px]">
            Complete your first session to start building your daily practice streak.
          </p>
        </div>
      </div>
    );
  }

  const todayKey = new Date().toISOString().slice(0, 10);

  // Last 7 calendar days (today = index 6)
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().slice(0, 10);
    return { key, label: DAY_LABELS[d.getDay()], practiced: allPracticeDates.has(key), isToday: key === todayKey };
  });

  const practicedToday = allPracticeDates.has(todayKey);

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
      <div className="grid grid-cols-7 gap-1 mb-1">
        {days.map(({ key, label, practiced, isToday }) => (
          <div key={key} className="flex flex-col items-center gap-1.5">
            <span className="text-[10px] font-medium text-[#94a3b8]">{label}</span>
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center ${
                practiced
                  ? "bg-[#00C950]"
                  : isToday
                    ? "bg-[#f1f5f9] border border-dashed border-[#c7d2e0]"
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

      {/* Today closing hint — only when today is empty */}
      {!practicedToday && (
        <p className="text-[10px] text-[#94a3b8] text-center mb-3">
          Day closes at 11:59 PM
        </p>
      )}

      {/* WA phrases drilled this month */}
      {waPhrasesMastered > 0 && (
        <div className="border-t border-[#f1f5f9] pt-3 mt-1 flex items-center justify-between">
          <p className="text-xs text-[#62748e]">WhatsApp phrases drilled</p>
          <p className="text-xs font-semibold text-[#0f172b]">{waPhrasesMastered}</p>
        </div>
      )}
    </div>
  );
}
