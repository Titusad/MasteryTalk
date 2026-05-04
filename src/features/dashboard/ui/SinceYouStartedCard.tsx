import { TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import type { SinceYouStartedPoint } from "../model/dashboard.computations";
import { PILLAR_COLORS } from "../model/dashboard.constants";

interface SinceYouStartedCardProps {
  data: SinceYouStartedPoint[];
}

export function SinceYouStartedCard({ data }: SinceYouStartedCardProps) {
  if (data.length === 0) return null;

  const totalDelta = Math.round(
    data.reduce((sum, p) => sum + p.delta, 0) / data.length
  );

  return (
    <motion.div
      className="bg-white rounded-2xl border border-[#e2e8f0] p-4"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-2 mb-1">
        <TrendingUp className="w-4 h-4 text-[#6366f1]" />
        <p className="text-xs font-medium uppercase tracking-wider text-[#94a3b8]">
          Since you started
        </p>
      </div>
      <p className="text-xs text-[#62748e] mb-3">
        {totalDelta > 0 ? (
          <>
            Average score up{" "}
            <span className="font-semibold text-[#00C950]">+{totalDelta} pts</span>
          </>
        ) : totalDelta < 0 ? (
          <>
            Average score{" "}
            <span className="font-semibold text-[#ef4444]">{totalDelta} pts</span>
          </>
        ) : (
          "No change yet — keep practicing"
        )}
      </p>

      <div className="space-y-2.5">
        {data.map((point, idx) => {
          const color = PILLAR_COLORS[point.pillar] ?? "#6366f1";
          const pct = Math.max(0, Math.min(100, point.latest));
          const deltaPositive = point.delta > 0;
          const deltaZero = point.delta === 0;
          return (
            <div key={point.pillar} className="flex items-center gap-2">
              <span className="text-[10px] text-[#45556c] w-[88px] shrink-0 truncate">
                {point.pillar}
              </span>
              <div className="flex-1 h-1.5 bg-[#f0f4f8] rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: color }}
                  initial={{ width: "0%" }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.5, ease: "easeOut", delay: 0.05 * idx }}
                />
              </div>
              <span
                className={`text-[10px] font-medium w-8 text-right shrink-0 ${
                  deltaPositive
                    ? "text-[#00C950]"
                    : deltaZero
                    ? "text-[#94a3b8]"
                    : "text-[#ef4444]"
                }`}
              >
                {deltaPositive ? `+${point.delta}` : deltaZero ? "—" : point.delta}
              </span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
