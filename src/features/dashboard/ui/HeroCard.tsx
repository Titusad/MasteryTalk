/**
 * HeroCard — Context-Aware Dashboard Hero
 * Adapts CTA and messaging based on userState: "new" | "inactive" | "returning"
 * Follows DESIGN_SYSTEM.md strictly: no arbitrary px, no inline CSS, no emojis.
 */
import { useState, useMemo } from "react";
import DOMPurify from "dompurify";
import { motion } from "motion/react";
import { ChevronDown, Zap, ArrowRight, Check } from "lucide-react";
import {
  LineChart, Line, XAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { ProficiencyRing } from "./ProficiencyRing";
import type { UserState, ChurnGapSignal, CEFRProgress, VelocitySignal } from "../model/dashboard.computations";
import type { RadarDataPoint } from "../model/dashboard.constants";
import { PILLAR_NAMES } from "../model/dashboard.constants";

const PILLAR_COLOR_MAP: Record<string, string> = {
  Vocabulary: "#5b3eb5",
  Grammar: "#1a6fb5",
  Fluency: "#0e7a6a",
  Pronunciation: "#2d7d00",
  "Professional Tone": "#b5256e",
  Persuasion: "#c45e00",
};

interface HeroCardProps {
  userName?: string;
  userState: UserState;
  diagnosis: { text: string; highlights: string[] };
  churnGap: ChurnGapSignal | null;
  proficiencyScore: number;
  proficiencyDelta: number;
  cefrApprox: { level: string; label: string };
  streak: number;
  allPracticeDates?: Set<string>;
  radarData: RadarDataPoint[];
  progressData: Array<Record<string, string | number>>;
  totalSessions: number;
  focusArea: { pillar: string; score: number } | null;
  cefrProgress: CEFRProgress | null;
  velocitySignal: VelocitySignal | null;
  onStartPractice: () => void;
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export function HeroCard({
  userName,
  userState,
  diagnosis,
  churnGap,
  proficiencyScore,
  proficiencyDelta,
  cefrApprox,
  streak,
  allPracticeDates,
  radarData,
  progressData,
  totalSessions,
  focusArea,
  cefrProgress,
  velocitySignal,
  onStartPractice,
}: HeroCardProps) {
  const [expandedMetrics, setExpandedMetrics] = useState(false);
  const firstName = userName?.trim().split(" ")[0] || "Explorer";

  const actionCard = useMemo(() => {
    if (userState === "new") {
      return {
        label: "START HERE",
        title: "Professional Self-Introduction",
        subtitle: "3 min · Calibrate your baseline score",
        ctaLabel: "Start Warm-Up",
        ctaAction: onStartPractice,
        wrapperClass: "bg-[#f0f4f8] border border-[#e2e8f0]",
        labelColor: "text-[#0f172b]",
        btnClass: "bg-[#0f172b] text-white hover:bg-[#1d293d]",
      };
    }
    if (userState === "inactive" && churnGap) {
      return {
        label: "RECOVERY SESSION",
        title: `Recover your ${churnGap.weakestPillar}`,
        subtitle: `15 min · Your score dropped to ${churnGap.weakestScore}%`,
        ctaLabel: "Recover Points",
        ctaAction: onStartPractice,
        wrapperClass: "bg-[#fef0e6] border border-[#e2e8f0]",
        labelColor: "text-[#c45e00]",
        btnClass: "bg-[#c45e00] text-white hover:bg-[#a04e00]",
      };
    }
    return {
      label: "NEXT SESSION",
      title: focusArea ? `Focus on ${focusArea.pillar}` : "Continue practicing",
      subtitle: focusArea ? `Currently at ${focusArea.score}%` : "Keep your streak going",
      ctaLabel: "Practice Now",
      ctaAction: onStartPractice,
      wrapperClass: "bg-[#f0f4f8] border border-[#e2e8f0]",
      labelColor: "text-[#0f172b]",
      btnClass: "bg-[#0f172b] text-white hover:bg-[#1d293d]",
    };
  }, [userState, churnGap, focusArea, onStartPractice]);

  const streakDays = useMemo(() => {
    const DAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
    const todayKey = new Date().toISOString().slice(0, 10);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const key = d.toISOString().slice(0, 10);
      return {
        key,
        label: DAY_LABELS[d.getDay()],
        practiced: allPracticeDates?.has(key) ?? false,
        isToday: key === todayKey,
      };
    });
  }, [allPracticeDates]);

  const diagnosisHTML = useMemo(() => {
    let text = diagnosis.text;
    for (const h of diagnosis.highlights) {
      text = text.replace(
        h,
        `<strong class="font-bold ${userState === 'inactive' ? 'text-[#c45e00]' : 'text-[#0f172b]'}">${h}</strong>`
      );
    }
    return DOMPurify.sanitize(text, { ALLOWED_TAGS: ["strong"], ALLOWED_ATTR: ["class"] });
  }, [diagnosis, userState]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      {/* Hero Card */}
      <div className={`bg-white rounded-2xl border border-[#e2e8f0] shadow-sm overflow-hidden ${expandedMetrics ? "rounded-b-none" : ""}`}>
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr]">
          {/* Left Column — Diagnosis & Action */}
          <div className="p-6 md:border-r border-[#e2e8f0] flex flex-col gap-4">
            {/* Greeting */}
            <h1 
              className="text-2xl md:text-[28px] text-[#0f172b]"
              style={{ lineHeight: 1.2 }}
            >
              {getGreeting()}, {firstName}
            </h1>

            {/* Diagnosis */}
            <p
              className="text-base text-[#45556c] leading-relaxed"
              dangerouslySetInnerHTML={{ __html: diagnosisHTML }}
            />

            {/* Action Card */}
            <div className={`${actionCard.wrapperClass} rounded-2xl p-4 flex items-center justify-between gap-4`}>
              <div className="flex flex-col gap-1">
                <span className={`text-xs font-medium uppercase tracking-wider ${actionCard.labelColor}`}>
                  {actionCard.label}
                </span>
                <span className="text-sm font-medium text-[#0f172b]">{actionCard.title}</span>
                <span className="text-xs text-[#62748e]">{actionCard.subtitle}</span>
              </div>
              <button
                onClick={actionCard.ctaAction}
                className={`${actionCard.btnClass} flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap`}
              >
                {userState === "new" ? <Zap className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                {actionCard.ctaLabel}
              </button>
            </div>

            {/* Streak — 7-day grid with day labels (50% width on desktop) */}
            <div className="w-full md:w-1/2">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-medium uppercase tracking-wider text-[#94a3b8]">Streak</span>
                {streak > 0 && (
                  <span className="text-xs font-semibold text-[#0f172b]">{streak}-day</span>
                )}
              </div>
              <div className="grid grid-cols-7 gap-1.5">
                {streakDays.map(({ key, label, practiced, isToday }) => (
                  <div key={key} className="flex flex-col items-center gap-1">
                    <span className="text-[10px] font-medium text-[#94a3b8]">{label}</span>
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        practiced
                          ? "bg-[#00C950]"
                          : isToday
                            ? "bg-[#f1f5f9] border border-dashed border-[#c7d2e0]"
                            : "bg-[#f0f4f8] border border-[#e2e8f0]"
                      }`}
                    >
                      {practiced && <div className="w-1.5 h-1.5 rounded-full bg-white opacity-80" />}
                    </div>
                  </div>
                ))}
              </div>
              {!streakDays[6]?.practiced && (
                <p className="text-[10px] text-[#94a3b8] mt-1.5">Day closes at 11:59 PM</p>
              )}
            </div>
          </div>

          {/* Right Column — Proficiency Score */}
          <div className="p-6 flex flex-col items-center justify-center gap-3">
            <div className="relative">
              <ProficiencyRing score={proficiencyScore} size={96} strokeWidth={8} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                {totalSessions > 0 ? (
                  <>
                    <span className="text-2xl font-bold text-[#0f172b]">{proficiencyScore}</span>
                    <span className="text-xs text-[#94a3b8]">/100</span>
                  </>
                ) : (
                  <span className="text-xl text-[#94a3b8]">--</span>
                )}
              </div>
            </div>

            {/* CEFR level label */}
            <div className="text-center">
              <div className="text-2xl font-bold text-[#0f172b]">
                {totalSessions > 0 ? cefrApprox.level : "--"}
              </div>
              <div className="text-xs text-[#62748e]">
                {totalSessions > 0 ? cefrApprox.label : "Not assessed yet"}
              </div>
            </div>

            {/* Certification Arc */}
            {cefrProgress && totalSessions > 0 && (
              <div className="w-full px-1">
                {/* Gate pills */}
                <div className="flex gap-1 justify-center mb-2">
                  {cefrProgress.gates.map((gate) => (
                    <div
                      key={gate.pillar}
                      title={`${gate.pillar}: ${gate.score}/${gate.threshold}`}
                      className={`h-1.5 flex-1 rounded-full transition-colors ${
                        gate.passed ? "bg-[#00C950]" : "bg-[#e2e8f0]"
                      }`}
                    />
                  ))}
                </div>
                {/* Progress label */}
                <p className="text-xs text-center text-[#62748e]">
                  <span className="font-medium text-[#0f172b]">
                    {cefrProgress.gatesPassed}/{cefrProgress.gates.length}
                  </span>
                  {" skills towards "}
                  <span className="font-medium text-[#0f172b]">
                    {cefrProgress.nextLevel}
                  </span>
                </p>
                {/* Velocity Signal */}
                {velocitySignal?.trend === "improving" && velocitySignal.estimatedWeeks !== null && (
                  <p className="text-[10px] text-center text-[#94a3b8] mt-1">
                    {velocitySignal.estimatedWeeks <= 1
                      ? "Almost there at your current pace"
                      : `~${velocitySignal.estimatedWeeks} weeks at your current pace`}
                  </p>
                )}
                {velocitySignal?.trend === "plateau" && (
                  <p className="text-[10px] text-center text-[#94a3b8] mt-1">
                    Increase session frequency to accelerate
                  </p>
                )}
              </div>
            )}

            {/* Delta Chip */}
            {proficiencyDelta !== 0 && totalSessions >= 2 && (
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                proficiencyDelta > 0
                  ? "bg-[#f0f4f8] text-[#0f172b] border border-[#e2e8f0]"
                  : "bg-[#fdecea] text-[#c0392b]"
              }`}>
                {proficiencyDelta > 0 ? `↑ +${proficiencyDelta}` : `↓ ${proficiencyDelta}`}
              </span>
            )}

            {/* Expand Button */}
            {totalSessions > 0 && (
              <button
                onClick={() => setExpandedMetrics(!expandedMetrics)}
                className="flex items-center gap-1 text-xs text-white cursor-pointer bg-[#0f172b] rounded-lg px-3 py-1.5 mt-2 hover:bg-[#1d293d] transition-colors"
              >
                <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${expandedMetrics ? "rotate-180" : ""}`} />
                <span>{expandedMetrics ? "Hide metrics" : "View all metrics"}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Expandable Metrics Panel */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          expandedMetrics ? "max-h-[320px] border border-[#e2e8f0] border-t-0 rounded-b-2xl bg-white" : "max-h-0"
        }`}
      >
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Pillar Breakdown */}
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-[#94a3b8] mb-4">Pillar Breakdown</p>
            {PILLAR_NAMES.map((pillar, idx) => {
              const d = radarData.find((r) => r.skill === pillar);
              const score = d?.score || 0;
              const color = PILLAR_COLOR_MAP[pillar] || "#94a3b8";
              return (
                <div key={pillar} className="flex items-center gap-3 mb-2">
                  <span className="text-xs text-[#45556c] w-24 flex-shrink-0">{pillar}</span>
                  <div className="flex-1 h-1.5 bg-[#f0f4f8] rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: color }}
                      initial={{ width: "0%" }}
                      animate={{ width: `${score}%` }}
                      transition={{ duration: 0.6, ease: "easeOut", delay: 0.05 * idx }}
                    />
                  </div>
                  <span className="text-xs font-medium w-8 text-right" style={{ color }}>
                    {score}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Right: Overtime Chart */}
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-[#94a3b8] mb-4">Overtime</p>
            {progressData.length >= 2 ? (
              <ResponsiveContainer width="100%" height={150}>
                <LineChart data={progressData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="session" hide />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  {["Vocabulary", "Fluency", "Professional Tone", "Persuasion"].map((key) => (
                    <Line key={key} type="monotone" dataKey={key} stroke={PILLAR_COLOR_MAP[key]} strokeWidth={1.5} dot={false} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-36">
                <p className="text-sm text-[#94a3b8] italic text-center">
                  Complete 2 sessions to see your progress over time
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
