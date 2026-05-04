import { useEffect, useState, useRef } from "react";
import { TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import { fetchSessions } from "@/services/adapters/supabase/dashboard.supabase";
import { PILLAR_NAMES, PILLAR_COLORS } from "@/features/dashboard/model/dashboard.constants";
import type { ScenarioType } from "@/services/types";

interface ScenarioDeltaPoint {
  pillar: string;
  prev: number;
  curr: number;
  delta: number;
}

interface ScenarioDeltaCardProps {
  scenarioType: ScenarioType;
  currentPillarScores: Record<string, number>;
}

export function ScenarioDeltaCard({
  scenarioType,
  currentPillarScores,
}: ScenarioDeltaCardProps) {
  const [points, setPoints] = useState<ScenarioDeltaPoint[] | null>(null);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    fetchSessions()
      .then((sessions) => {
        const same = sessions
          .filter(
            (s) =>
              s.scenarioType === scenarioType &&
              (s.summary?.pillarScores ?? s.feedback?.pillarScores)
          )
          .sort(
            (a, b) =>
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );

        // Most recent session is the current one — take the one before it
        const previous = same.length >= 2 ? same[1] : null;
        if (!previous) return;

        const prevScores =
          previous.summary?.pillarScores ?? previous.feedback?.pillarScores ?? {};

        const result: ScenarioDeltaPoint[] = PILLAR_NAMES.map((pillar) => ({
          pillar,
          prev: Math.round((prevScores[pillar] as number) ?? 0),
          curr: Math.round((currentPillarScores[pillar] as number) ?? 0),
          delta: Math.round(
            ((currentPillarScores[pillar] as number) ?? 0) -
              ((prevScores[pillar] as number) ?? 0)
          ),
        })).filter((p) => p.prev > 0 || p.curr > 0);

        if (result.length >= 3) setPoints(result);
      })
      .catch(() => {});
  }, [scenarioType, currentPillarScores]);

  if (!points) return null;

  const improved = points.filter((p) => p.delta > 0).length;
  const declined = points.filter((p) => p.delta < 0).length;

  return (
    <motion.div
      className="bg-white rounded-2xl border border-[#e2e8f0] p-4 mt-4"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-2 mb-1">
        <TrendingUp className="w-4 h-4 text-[#6366f1]" />
        <p className="text-xs font-medium uppercase tracking-wider text-[#94a3b8]">
          vs. your last session
        </p>
      </div>
      <p className="text-xs text-[#62748e] mb-4">
        {improved > declined
          ? `You improved in ${improved} of ${points.length} pillars.`
          : improved === 0 && declined === 0
          ? "Scores held steady — consistent performance."
          : `${declined} pillar${declined !== 1 ? "s" : ""} dropped. Focus there next session.`}
      </p>

      <div className="space-y-3">
        {points.map((point, idx) => {
          const color = PILLAR_COLORS[point.pillar] ?? "#6366f1";
          const pct = Math.max(0, Math.min(100, point.curr));
          const prevPct = Math.max(0, Math.min(100, point.prev));
          return (
            <div key={point.pillar} className="flex items-center gap-3">
              <span className="text-[11px] text-[#45556c] w-[100px] shrink-0 truncate">
                {point.pillar}
              </span>
              <div className="flex-1 h-2 bg-[#f0f4f8] rounded-full overflow-hidden relative">
                <div
                  className="absolute inset-y-0 left-0 rounded-full opacity-25"
                  style={{ width: `${prevPct}%`, backgroundColor: color }}
                />
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{ backgroundColor: color }}
                  initial={{ width: "0%" }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.5, ease: "easeOut", delay: 0.05 * idx }}
                />
              </div>
              <span
                className={`text-[11px] font-semibold w-10 text-right shrink-0 ${
                  point.delta > 0
                    ? "text-[#00C950]"
                    : point.delta < 0
                    ? "text-[#ef4444]"
                    : "text-[#94a3b8]"
                }`}
              >
                {point.delta > 0
                  ? `+${point.delta}`
                  : point.delta === 0
                  ? "—"
                  : point.delta}
              </span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
