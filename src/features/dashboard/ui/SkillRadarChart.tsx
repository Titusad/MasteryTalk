/**
 * SkillRadarChart — Radar chart for 6 communication pillars
 * Presentational component (web-specific).
 */
import { motion } from "motion/react";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
} from "recharts";
import { BarChart3 } from "lucide-react";
import type { RadarDataPoint } from "../model/dashboard.constants";

interface SkillRadarChartProps {
  radarData: RadarDataPoint[];
  hasRealData: boolean;
  dc: {
    radar: {
      title: string;
      descWithData: string;
      descEmpty: string;
    };
  };
}

export function SkillRadarChart({
  radarData,
  hasRealData,
  dc,
}: SkillRadarChartProps) {
  return (
    <motion.div
      className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm p-6 lg:col-span-1"
      style={{ minWidth: 0 }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <div className="flex items-center gap-2 mb-1">
        <BarChart3 className="w-4 h-4 text-[#6366f1]" />
        <h3
          className="text-sm text-[#0f172b]"
          style={{ fontWeight: 600 }}
        >
          {dc.radar.title}
        </h3>
      </div>
      <p className="text-[11px] text-[#62748e] mb-3">
        {hasRealData ? dc.radar.descWithData : dc.radar.descEmpty}
      </p>
      <div
        className="w-full"
        style={{ height: 240, maxWidth: 280, margin: "0 auto" }}
      >
        <ResponsiveContainer width="100%" height={240}>
          <RadarChart
            data={radarData}
            cx="50%"
            cy="50%"
            outerRadius="72%"
          >
            <PolarGrid stroke="#e2e8f0" strokeDasharray="3 3" />
            <PolarAngleAxis
              dataKey="skill"
              tick={({ payload, x, y, textAnchor }: any) => {
                const label = payload.value as string;
                const entry = radarData.find(
                  (d) => d.skill === label
                );
                const pct =
                  entry && entry.score > 0
                    ? `${Math.round(entry.score)}%`
                    : "";
                if (label === "Professional Tone") {
                  return (
                    <text
                      x={x}
                      y={y}
                      textAnchor={textAnchor}
                      fontSize={10}
                      fill="#62748e"
                    >
                      <tspan x={x} dy="0">
                        Professional
                      </tspan>
                      <tspan x={x} dy="12">
                        Tone
                      </tspan>
                      {pct && (
                        <tspan
                          x={x}
                          dy="12"
                          fontWeight={600}
                          fill="#6366f1"
                          fontSize={11}
                        >
                          {pct}
                        </tspan>
                      )}
                    </text>
                  );
                }
                return (
                  <text
                    x={x}
                    y={y}
                    textAnchor={textAnchor}
                    fontSize={10}
                    fill="#62748e"
                  >
                    <tspan x={x} dy="0">
                      {label}
                    </tspan>
                    {pct && (
                      <tspan
                        x={x}
                        dy="13"
                        fontWeight={600}
                        fill="#6366f1"
                        fontSize={11}
                      >
                        {pct}
                      </tspan>
                    )}
                  </text>
                );
              }}
              tickLine={false}
            />
            <Radar
              name="Score"
              dataKey="score"
              stroke="#6366f1"
              fill="#6366f1"
              fillOpacity={0.15}
              strokeWidth={2}
              dot={{ r: 3, fill: "#6366f1", strokeWidth: 0 }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
