import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { TrendingUp } from "lucide-react";
import { motion } from "motion/react";

const PILLARS = ["Vocabulary", "Grammar", "Fluency", "Tone", "Persuasion"];
import { fetchSessions } from "@/services/adapters/supabase/dashboard.supabase";
import type { PersistedSession } from "@/services/adapters/supabase/dashboard.supabase";

interface ChartPoint {
  label: string;
  avg: number;
  cefr?: string;
}

const CEFR_THRESHOLDS: { label: string; min: number; max: number }[] = [
  { label: "B1→B2", min: 60, max: 67 },
  { label: "B2→C1", min: 78, max: 83 },
];

function avgPillarScore(session: PersistedSession): number | null {
  const scores = session.summary?.pillarScores ?? session.feedback?.pillarScores ?? null;
  if (!scores) return null;
  const values = (Object.values(scores) as number[]).filter((v) => v > 0);
  if (values.length === 0) return null;
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}

function toCefrLabel(avg: number): string | undefined {
  if (avg < 60) return "B1";
  if (avg < 78) return "B2";
  return "C1";
}

function buildChartData(sessions: PersistedSession[]): ChartPoint[] {
  const sorted = [...sessions]
    .filter((s) => !!s.created_at)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  const withScores = sorted
    .map((s) => ({ session: s, avg: avgPillarScore(s) }))
    .filter((x): x is { session: PersistedSession; avg: number } => x.avg !== null)
    .slice(-10);

  return withScores.map(({ session, avg }, i) => {
    const date = new Date(session.created_at);
    const label =
      i === 0 || date.getMonth() !== new Date(withScores[i - 1]?.session.created_at).getMonth()
        ? date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
        : date.toLocaleDateString("en-US", { day: "numeric" });
    return { label, avg, cefr: toCefrLabel(avg) };
  });
}

interface ProgressChartCardProps {
  onStartSession?: () => void;
}

export function ProgressChartCard({ onStartSession }: ProgressChartCardProps) {
  const [data, setData] = useState<ChartPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSessions()
      .then((sessions) => {
        const points = buildChartData(sessions);
        setData(points);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;

  if (data.length < 3) {
    return (
      <motion.div
        className="bg-white rounded-2xl border border-[#e2e8f0] p-4 flex flex-col"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-[#0f172b]" />
          <p className="text-xs font-medium uppercase tracking-wider text-[#0f172b]">Score Progression</p>
        </div>
        <div className="flex flex-col gap-3">
          <p className="text-xs text-[#62748e] leading-relaxed">
            After each session we score you across {PILLARS.length} pillars:{" "}
            <span className="text-[#0f172b] font-medium">{PILLARS.join(", ")}</span>.
            {" "}This chart tracks your evolution over time.
          </p>
          <div className="flex flex-wrap gap-1.5">
            {PILLARS.map((p) => (
              <span
                key={p}
                className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#f0f4f8] text-[#62748e]"
              >
                {p}
              </span>
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
      </motion.div>
    );
  }

  const minScore = Math.max(0, Math.min(...data.map((d) => d.avg)) - 8);
  const maxScore = Math.min(100, Math.max(...data.map((d) => d.avg)) + 8);

  const milestones = CEFR_THRESHOLDS.filter(
    (t) => t.min >= minScore && t.max <= maxScore + 10
  );

  return (
    <motion.div
      className="bg-white rounded-2xl border border-[#e2e8f0] p-4 flex flex-col"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="w-4 h-4 text-[#0f172b]" />
        <p className="text-xs font-medium uppercase tracking-wider text-[#0f172b]">Score Progression</p>
        <span className="ml-auto text-[11px] text-[#94a3b8]">last {data.length} sessions</span>
      </div>

      <ResponsiveContainer width="100%" height={100}>
        <LineChart data={data} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: "#94a3b8" }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            domain={[minScore, maxScore]}
            tick={{ fontSize: 10, fill: "#94a3b8" }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0", boxShadow: "none" }}
            formatter={(value) => [`${value}`, "Avg score"]}
            labelStyle={{ color: "#0f172b", fontWeight: 500 }}
          />
          {milestones.map((m) => (
            <ReferenceLine
              key={m.label}
              y={m.min}
              stroke="#6366f1"
              strokeDasharray="4 3"
              strokeOpacity={0.5}
              label={{ value: m.label, position: "insideTopRight", fontSize: 9, fill: "#6366f1" }}
            />
          ))}
          <Line
            type="monotone"
            dataKey="avg"
            stroke="#6366f1"
            strokeWidth={2}
            dot={{ r: 3, fill: "#6366f1", strokeWidth: 0 }}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
