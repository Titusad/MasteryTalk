/**
 * StatPills — Compact metric pills (Sessions, Biggest Gain, Streak)
 * Presentational component (web-specific).
 */
import { motion } from "motion/react";
import { BookOpen, TrendingUp, Flame } from "lucide-react";

interface StatPillsProps {
  totalSessions: number;
  biggestImprovement: { pillar: string; delta: number } | null;
  streak: number;
  dc: {
    stats: {
      sessions: string;
      biggestGain: string;
      streak: string;
    };
  };
}

export function StatPills({
  totalSessions,
  biggestImprovement,
  streak,
  dc,
}: StatPillsProps) {
  return (
    <div className="grid grid-cols-3 gap-3 mb-6">
      {/* Sessions */}
      <motion.div
        className="bg-indigo-50 rounded-2xl border border-white/60 p-4 md:p-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08, duration: 0.4 }}
      >
        <BookOpen className="w-5 h-5 mb-2 text-[#6366f1]" />
        <p
          className="text-xl md:text-2xl text-[#0f172b] mb-0.5"
          style={{ fontWeight: 600 }}
        >
          {totalSessions}
        </p>
        <p className="text-xs text-[#62748e]">{dc.stats.sessions}</p>
      </motion.div>

      {/* Biggest Improvement */}
      <motion.div
        className={`rounded-2xl border border-white/60 p-4 md:p-6 ${
          biggestImprovement ? "bg-green-50" : "bg-slate-50"
        }`}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
      >
        <TrendingUp
          className="w-5 h-5 mb-2"
          style={{
            color: biggestImprovement ? "#22c55e" : "#94a3b8",
          }}
        />
        <p
          className="text-xl md:text-2xl text-[#0f172b] mb-0.5"
          style={{ fontWeight: 600 }}
        >
          {biggestImprovement ? `+${biggestImprovement.delta}` : "—"}
        </p>
        <p className="text-xs text-[#62748e]">
          {biggestImprovement
            ? biggestImprovement.pillar
            : dc.stats.biggestGain}
        </p>
      </motion.div>

      {/* Streak */}
      <motion.div
        className={`rounded-2xl border border-white/60 p-4 md:p-6 ${
          streak > 0 ? "bg-orange-50" : "bg-slate-50"
        }`}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.14, duration: 0.4 }}
      >
        <Flame
          className="w-5 h-5 mb-2"
          style={{ color: streak > 0 ? "#f97316" : "#94a3b8" }}
        />
        <p
          className="text-xl md:text-2xl text-[#0f172b] mb-0.5"
          style={{ fontWeight: 600 }}
        >
          {streak > 0 ? `${streak}d` : "—"}
        </p>
        <p className="text-xs text-[#62748e]">{dc.stats.streak}</p>
      </motion.div>
    </div>
  );
}
