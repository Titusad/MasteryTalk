/**
 * ProgressChart — Area chart showing proficiency over time
 * Presentational component (web-specific).
 */
import { motion } from "motion/react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { TrendingUp } from "lucide-react";
import { PILLAR_NAMES, PILLAR_COLORS } from "../model/dashboard.constants";

interface ProgressChartProps {
  progressData: Array<Record<string, string | number>>;
  dc: {
    progress: {
      title: string;
      descMultiple: string;
      descSingle: string;
      descEmpty: string;
      emptyOneSessions: string;
      emptyNoSessions: string;
    };
  };
}

export function ProgressChart({ progressData, dc }: ProgressChartProps) {
  return (
    <motion.div
      className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm p-6"
      style={{ minWidth: 0 }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
    >
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[#22c55e]" />
          <h3
            className="text-sm text-[#0f172b]"
            style={{ fontWeight: 600 }}
          >
            {dc.progress.title}
          </h3>
        </div>
        {progressData.length > 0 && (
          <span className="text-[10px] text-[#62748e]">
            {progressData.length} session
            {progressData.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>
      <p className="text-[11px] text-[#62748e] mb-4">
        {progressData.length >= 2
          ? dc.progress.descMultiple
          : progressData.length === 1
            ? dc.progress.descSingle
            : dc.progress.descEmpty}
      </p>

      {progressData.length >= 2 ? (
        <div style={{ width: "100%", height: 180 }}>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={progressData}>
              <defs>
                {PILLAR_NAMES.map((p) => (
                  <linearGradient
                    key={p}
                    id={`grad-${p.replace(/\s/g, "")}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor={PILLAR_COLORS[p]}
                      stopOpacity={0.15}
                    />
                    <stop
                      offset="100%"
                      stopColor={PILLAR_COLORS[p]}
                      stopOpacity={0.02}
                    />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f1f5f9"
                vertical={false}
              />
              <XAxis
                dataKey="session"
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                domain={[20, 100]}
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                tickLine={false}
                axisLine={false}
                width={30}
              />
              <Tooltip
                contentStyle={{
                  background: "#0f172b",
                  border: "none",
                  borderRadius: 10,
                  padding: "8px 14px",
                  fontSize: 11,
                  color: "#fff",
                }}
                cursor={{
                  stroke: "#cbd5e1",
                  strokeDasharray: "3 3",
                }}
              />
              {PILLAR_NAMES.map((p) => (
                <Area
                  key={p}
                  type="monotone"
                  dataKey={p}
                  stroke={PILLAR_COLORS[p]}
                  strokeWidth={2}
                  fill={`url(#grad-${p.replace(/\s/g, "")})`}
                  dot={{
                    r: 2.5,
                    fill: PILLAR_COLORS[p],
                    strokeWidth: 0,
                  }}
                  activeDot={{
                    r: 4,
                    fill: PILLAR_COLORS[p],
                    stroke: "#fff",
                    strokeWidth: 2,
                  }}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex items-center justify-center py-8 text-center">
          <div>
            <TrendingUp className="w-8 h-8 text-[#cbd5e1] mx-auto mb-2" />
            <p className="text-xs text-[#94a3b8]">
              {progressData.length === 1
                ? dc.progress.emptyOneSessions
                : dc.progress.emptyNoSessions}
            </p>
          </div>
        </div>
      )}

      {/* Pillar legend */}
      {progressData.length >= 2 && (
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3">
          {PILLAR_NAMES.map((p) => (
            <div key={p} className="flex items-center gap-1.5">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: PILLAR_COLORS[p] }}
              />
              <span className="text-[10px] text-[#62748e]">{p}</span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
