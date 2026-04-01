import { useState, useMemo } from "react";
import {
  CheckCircle2,
  FileText,
  Check,
  Sparkles,
  ChevronDown,
  RotateCcw,
  Trophy,
  Target,
  Zap,
  Briefcase,
  MessageSquare,
  Handshake,
  Users,
  Lightbulb,
  AudioLines,
  ArrowRight,
  Mic,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
} from "recharts";
import { PastelBlobs, MiniFooter, PageTitleBlock, ProficiencyGauge, FeedbackAccordion, SessionProgressBar } from "@/shared/ui";
import {
  getBeforeAfterForScenario,
  getStrengthsForScenario,
} from "@/services/scenario-data";
import type {
  ScenarioType,
  TurnPronunciationData,
  Strength,
  Opportunity,
  BeforeAfterComparison,
} from "@/services/types";
import { PronunciationTab } from "./PronunciationTab";

import type { PaywallReason } from "@/app/hooks/useUsageGating";

/* Re-export shared types */
export interface RepeatInfo {
  /** Current attempt number (1-based) */
  attempt: number;
  /** Maximum attempts allowed for this scenario */
  maxAttempts: number;
  /** Whether the user can practice again */
  canRepeat: boolean;
}

export type { PaywallReason };

/* ── Real Feedback Data from /analyze-feedback ── */
export interface RealFeedbackData {
  strengths: Strength[];
  opportunities: Opportunity[];
  beforeAfter: BeforeAfterComparison[];
  pillarScores?: Record<string, number> | null;
  professionalProficiency?: number | null;
  contentScores?: Record<string, number> | null;
  interviewReadinessScore?: number | null;
  preparationUtilization?: {
    score: number;
    verdict: string;
    insights: Array<{
      aspect: string;
      observation: string;
      rating: "strong" | "partial" | "missed";
    }>;
  } | null;
  contentInsights?: Array<{
    dimension: string;
    observation: string;
    tip: string;
  }> | null;
  languageInsights?: Array<{
    dimension: string;
    observation: string;
    tip: string;
  }> | null;
}

/* ── Data Constants ── */
const SCENARIO_LABELS_MAP: Record<string, string> = {
  sales: "Sales Pitch",
  interview: "Job Interview",
  csuite: "Executive Presentation",
  negotiation: "Negotiation",
  networking: "Networking",
};

const FEEDBACK_PILLAR_NAMES = [
  "Vocabulary",
  "Grammar",
  "Fluency",
  "Pronunciation",
  "Professional Tone",
  "Persuasion",
] as const;

/* ── Content Quality pillar names (interview-specific) ── */
const CONTENT_QUALITY_NAMES = [
  "Relevance",
  "Structure",
  "Examples",
  "Impact",
] as const;

const CONTENT_QUALITY_COLORS: Record<
  string,
  { icon: string; bg: string; text: string }
> = {
  Relevance: {
    icon: "🎯",
    bg: "rgba(59,130,246,0.12)",
    text: "#3b82f6",
  },
  Structure: {
    icon: "🏗️",
    bg: "rgba(168,85,247,0.12)",
    text: "#a855f7",
  },
  Examples: {
    icon: "📊",
    bg: "rgba(245,158,11,0.12)",
    text: "#f59e0b",
  },
  Impact: {
    icon: "⚡",
    bg: "rgba(239,68,68,0.12)",
    text: "#ef4444",
  },
};

const LANGUAGE_PILLAR_COLORS: Record<
  string,
  { icon: string; bg: string; text: string }
> = {
  Vocabulary: { icon: "📚", bg: "rgba(16,185,129,0.12)", text: "#10b981" },
  Grammar: { icon: "📐", bg: "rgba(59,130,246,0.12)", text: "#3b82f6" },
  Fluency: { icon: "🌊", bg: "rgba(14,165,233,0.12)", text: "#0ea5e9" },
  "Professional Tone": { icon: "🕴️", bg: "rgba(139,92,246,0.12)", text: "#8b5cf6" },
  Persuasion: { icon: "🎯", bg: "rgba(245,158,11,0.12)", text: "#f59e0b" },
};

/* ── Label/Color helpers (used for inline rendering) ── */
function feedbackProficiencyLabel(score: number): string {
  if (score >= 90) return "Expert";
  if (score >= 75) return "Advanced";
  if (score >= 60) return "Intermediate";
  if (score >= 40) return "Developing";
  return "Beginner";
}

function feedbackProficiencyColor(score: number): string {
  if (score >= 75) return "#22c55e";
  if (score >= 60) return "#6366f1";
  if (score >= 40) return "#f59e0b";
  return "#ef4444";
}

function ConversationFeedback({
  scenarioType,
  onGenerateReport,
  onPracticeAgain,
  repeatInfo,
  onPaywallTriggered,
  showPaywallOnRepeat,
  realFeedback,
  pronunciationData = [],
  sessionId,
}: {
  scenarioType?: ScenarioType;
  onGenerateReport: () => void;
  onPracticeAgain?: () => void;
  repeatInfo?: RepeatInfo;
  onPaywallTriggered?: (reason: PaywallReason) => void;
  showPaywallOnRepeat?: boolean;
  realFeedback?: RealFeedbackData | null;
  pronunciationData?: TurnPronunciationData[];
  sessionId?: string | null;
}) {
  const [activeAccordion, setActiveAccordion] = useState<string | null>(null);

  const handleAccordionToggle = (id: string) => {
    setActiveAccordion((prev) => (prev === id ? null : id));
  };
  const scenarioLabel = scenarioType
    ? (SCENARIO_LABELS_MAP[scenarioType] ?? "Practice")
    : "Sales Pitch";
  const isInterview = scenarioType === "interview";

  /* ── Data sources ── */
  const beforeAfter = realFeedback?.beforeAfter?.length
    ? realFeedback.beforeAfter
    : getBeforeAfterForScenario(scenarioType);
  const strengths = realFeedback?.strengths?.length
    ? realFeedback.strengths
    : getStrengthsForScenario(scenarioType);
  const isRealData = !!realFeedback?.strengths?.length;
  const hasPronData = pronunciationData.length > 0;

  /* ── Proficiency score ── */
  const proficiencyScore = useMemo(() => {
    if (
      typeof realFeedback?.professionalProficiency ===
      "number" &&
      realFeedback.professionalProficiency > 0
    ) {
      return Math.round(realFeedback.professionalProficiency);
    }
    if (
      realFeedback?.pillarScores &&
      Object.keys(realFeedback.pillarScores).length >= 4
    ) {
      const vals = Object.values(realFeedback.pillarScores);
      return Math.round(
        vals.reduce((a, b) => a + b, 0) / vals.length,
      );
    }
    return null;
  }, [realFeedback]);

  /* ── Radar data ── */
  const radarData = useMemo(() => {
    const scores = realFeedback?.pillarScores;
    if (scores && Object.keys(scores).length >= 4) {
      // Compute Azure pronunciation aggregate (average accuracy across all turns)
      const azurePronScore =
        pronunciationData.length > 0
          ? Math.round(
            pronunciationData.reduce(
              (s, t) => s + t.assessment.accuracyScore,
              0,
            ) / pronunciationData.length,
          )
          : 0;
      return FEEDBACK_PILLAR_NAMES.map((skill) => ({
        skill,
        // Pronunciation comes EXCLUSIVELY from Azure, not GPT
        score:
          skill === "Pronunciation"
            ? azurePronScore
            : (scores[skill] ?? 0),
        fullMark: 100,
      }));
    }
    return FEEDBACK_PILLAR_NAMES.map((skill) => ({
      skill,
      score: 0,
      fullMark: 100,
    }));
  }, [realFeedback, pronunciationData]);
  const hasRadarData = radarData.some((d) => d.score > 0);

  /* ── Content Quality data (interview only) ── */
  const contentRadarData = useMemo(() => {
    const cs = realFeedback?.contentScores;
    if (!cs || !isInterview) return [];
    return CONTENT_QUALITY_NAMES.map((dim) => ({
      skill: dim,
      score: cs[dim] ?? 0,
      fullMark: 100,
    }));
  }, [realFeedback, isInterview]);
  const hasContentData = contentRadarData.some(
    (d) => d.score > 0,
  );
  const interviewReadiness =
    isInterview &&
      typeof realFeedback?.interviewReadinessScore === "number"
      ? Math.round(realFeedback.interviewReadinessScore)
      : null;
  const contentInsights = isInterview
    ? (realFeedback?.contentInsights ?? [])
    : [];
  const languageInsights = realFeedback?.languageInsights ?? [];
  const allInsights = [...languageInsights, ...contentInsights];

  return (
    <div
      className="w-full min-h-full flex flex-col bg-[#f0f4f8] relative overflow-hidden"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <PastelBlobs />

      <main className="relative max-w-[800px] mx-auto px-6 pt-6 pb-20">
        <div className="w-full mb-5">
          <SessionProgressBar currentStep="conversation-feedback" />
        </div>
        {/* ═══ HERO ═══ */}
        <PageTitleBlock
            title={isInterview ? "Interview Analysis" : "Session Feedback"}
            subtitle={isInterview ? "Your Readiness Score evaluates your true preparedness for the role, prioritizing Content Quality (60%) over Language Proficiency (40%)." : `Your ${scenarioLabel} practice analysis is ready. Review your performance below.`}
        >
          {isRealData ? (
            <span
              className="inline-flex items-center gap-1.5 text-[10px] bg-[#50C878]/15 text-[#16a34a] px-3 py-1 rounded-full"
              style={{ fontWeight: 600 }}
            >
              <Sparkles className="w-3 h-3" /> AI-powered analysis
            </span>
          ) : (
            <span
              className="inline-flex items-center gap-1.5 text-[10px] bg-[#fef3c7] text-[#92400e] px-3 py-1 rounded-full"
              style={{ fontWeight: 600 }}
            >
              ⚠️ AI analysis unavailable — showing sample feedback
            </span>
          )}
        </PageTitleBlock>

        {/* ═══ INTERVIEW READINESS SCORE (interview only) ═══ */}
        {isInterview && interviewReadiness !== null && (
          <motion.div
            className="bg-gradient-to-br from-[#0f172b] to-[#1e293b] rounded-3xl p-6 md:p-8 mb-6 flex flex-col md:flex-row items-center md:items-stretch gap-8"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08 }}
          >
            {/* Left side: Score Gauge */}
            <div className="flex flex-col items-center justify-center shrink-0">
              <p
                className="text-[10px] uppercase tracking-wider text-white/50 mb-4 md:mb-5"
                style={{ fontWeight: 600 }}
              >
                Readiness Score
              </p>
              <ProficiencyGauge
                score={interviewReadiness}
                size={120}
                darkBg
              />
              <p
                className="mt-4 text-[10px] text-white/40 tracking-wider text-center"
                style={{ fontWeight: 500 }}
              >
                CONTENT 60% <span className="mx-2 opacity-30">|</span> LANGUAGE 40%
              </p>
            </div>

            {/* Right side: Coach Verdict */}
            <div className="flex-1 text-left border-t md:border-t-0 md:border-l border-white/10 pt-6 md:pt-0 md:pl-8 flex flex-col justify-center">
              <h3 className="text-white text-lg mb-2" style={{ fontWeight: 500 }}>
                Coach's Verdict
              </h3>
              <p className="text-white/80 text-sm mb-5 leading-relaxed">
                {interviewReadiness >= 80 
                  ? "Outstanding performance! You combined strong professional content with confident delivery. Focus on minor refinements to sound even more natural and persuasive."
                  : interviewReadiness >= 60
                  ? "Good effort. Your content is clear and structured, but there are opportunities to enhance your fluency and delivery to make a stronger impact."
                  : "Keep practicing! You covered the basics, but building more solid structure and practicing your pacing will greatly improve your persuasiveness."}
              </p>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="text-lg leading-none mt-0.5">✨</span>
                  <p className="text-sm text-white/70">
                    <strong className="text-white">Top Strength:</strong>{" "}
                    {strengths[0]?.title || "Structured and clear responses."}
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-lg leading-none mt-0.5">🎯</span>
                  <p className="text-sm text-white/70">
                    <strong className="text-white">Next Focus:</strong>{" "}
                    {realFeedback?.opportunities?.[0]?.title || "Improving persuasion and pacing."}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ═══ INTERVIEW FALLBACK: shown when AI analysis failed ═══ */}
        {isInterview && !isRealData && (
          <motion.div
            className="bg-[#fef3c7] border border-[#fde68a] rounded-2xl px-5 py-4 mb-6 flex items-start gap-3"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <span className="text-xl mt-0.5">⏱️</span>
            <div>
              <p className="text-sm text-[#92400e]" style={{ fontWeight: 600 }}>
                AI analysis took too long
              </p>
              <p className="text-xs text-[#a16207] mt-0.5">
                The detailed scores couldn't be generated this time. Below you'll see example feedback to guide your next practice. Try generating the full report — it may still be available.
              </p>
            </div>
          </motion.div>
        )}

        {/* ═══ DUAL-AXIS RADARS (interview) or SINGLE GAUGE+RADAR (other) ═══ */}
        {isInterview ? (
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            {/* Axis 1: Language Proficiency */}
            <motion.div
              className="bg-white rounded-3xl border border-[#e2e8f0] p-5 md:p-6"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.12 }}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-7 h-7 rounded-lg bg-[#eef2ff] flex items-center justify-center">
                      <AudioLines className="w-3.5 h-3.5 text-[#6366f1]" />
                    </div>
                    <p
                      className="text-sm text-[#0f172b]"
                      style={{ fontWeight: 600 }}
                    >
                      Language Proficiency
                    </p>
                  </div>
                  <p className="text-[10px] text-[#94a3b8] ml-9">
                    How did you sound?
                  </p>
                </div>
                {proficiencyScore !== null && (
                  <div className="shrink-0 flex items-center justify-center">
                    <ProficiencyGauge
                      score={proficiencyScore}
                      size={54}
                      hideLabel={true}
                      strokeWidth={5}
                    />
                  </div>
                )}
              </div>
              {hasRadarData ? (
                <div
                  className="w-full"
                  style={{ height: 230, margin: "0 auto" }}
                >
                  <ResponsiveContainer
                    width="100%"
                    height={230}
                  >
                    <RadarChart
                      data={radarData}
                      cx="50%"
                      cy="50%"
                      outerRadius="72%"
                    >
                      <PolarGrid
                        stroke="#e2e8f0"
                        strokeDasharray="3 3"
                      />
                      <PolarAngleAxis
                        dataKey="skill"
                        tick={({
                          payload,
                          x,
                          y,
                          textAnchor,
                          index,
                        }: any) => {
                          const label = payload.value as string;
                          const scoreVal =
                            radarData[index]?.score ?? 0;
                          const pct = `${Math.round(scoreVal)}%`;
                          if (label === "Professional Tone") {
                            return (
                              <text
                                x={x}
                                y={y}
                                textAnchor={textAnchor}
                                fontSize={9}
                                fill="#62748e"
                              >
                                <tspan x={x} dy="0">
                                  Prof. Tone
                                </tspan>
                                <tspan
                                  x={x}
                                  dy="11"
                                  fontSize={8}
                                  fontWeight={600}
                                  fill="#6366f1"
                                >
                                  {pct}
                                </tspan>
                              </text>
                            );
                          }
                          return (
                            <text
                              x={x}
                              y={y}
                              textAnchor={textAnchor}
                              fontSize={9}
                              fill="#62748e"
                            >
                              <tspan x={x} dy="0">
                                {label}
                              </tspan>
                              <tspan
                                x={x}
                                dy="11"
                                fontSize={8}
                                fontWeight={600}
                                fill="#6366f1"
                              >
                                {pct}
                              </tspan>
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
                        dot={{
                          r: 2.5,
                          fill: "#6366f1",
                          strokeWidth: 0,
                        }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="w-full h-[160px] flex items-center justify-center bg-[#f8fafc] rounded-2xl border border-dashed border-[#e2e8f0]">
                  <p className="text-xs text-[#94a3b8]">
                    No language data yet
                  </p>
                </div>
              )}

              {/* Language Insight Summary */}
              {hasRadarData && (
                <div className="mt-4 pt-4 border-t border-[#e2e8f0]">
                  {(() => {
                    const sorted = [...radarData].sort((a, b) => b.score - a.score);
                    const top = sorted[0];
                    const bottom = sorted[sorted.length - 1];
                    return (
                      <p className="text-sm text-[#45556c] leading-relaxed">
                        Your <strong className="text-[#0f172b]">{top.skill}</strong> is solid, demonstrating a great command in this area. However, there's significant room for growth in <strong className="text-[#0f172b]">{bottom.skill}</strong>. Focusing on this specific area during your next practice sessions will make the most noticeable difference in elevating your overall language proficiency and sounding much more natural.
                      </p>
                    );
                  })()}
                </div>
              )}
            </motion.div>

            {/* Axis 2: Content Quality */}
            <motion.div
              className="bg-white rounded-3xl border border-[#e2e8f0] p-5 md:p-6"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.16 }}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-7 h-7 rounded-lg bg-[#fef3c7] flex items-center justify-center">
                      <Target className="w-3.5 h-3.5 text-[#d97706]" />
                    </div>
                    <p
                      className="text-sm text-[#0f172b]"
                      style={{ fontWeight: 600 }}
                    >
                      Content Quality
                    </p>
                  </div>
                  <p className="text-[10px] text-[#94a3b8] ml-9">
                    How well did you answer?
                  </p>
                </div>
                {hasContentData && (
                  <div className="shrink-0 flex items-center justify-center">
                    {(() => {
                      const avg = Math.round(
                        contentRadarData.reduce(
                          (s, d) => s + d.score,
                          0,
                        ) / contentRadarData.length,
                      );
                      return (
                        <ProficiencyGauge
                          score={avg}
                          size={54}
                          hideLabel={true}
                          strokeWidth={5}
                        />
                      );
                    })()}
                  </div>
                )}
              </div>
              {hasContentData ? (
                <div
                  className="w-full"
                  style={{ height: 230, margin: "0 auto" }}
                >
                  <ResponsiveContainer
                    width="100%"
                    height={230}
                  >
                    <RadarChart
                      data={contentRadarData}
                      cx="50%"
                      cy="50%"
                      outerRadius="72%"
                    >
                      <PolarGrid
                        stroke="#e2e8f0"
                        strokeDasharray="3 3"
                      />
                      <PolarAngleAxis
                        dataKey="skill"
                        tick={({
                          payload,
                          x,
                          y,
                          textAnchor,
                          index,
                        }: any) => {
                          const label = payload.value as string;
                          const scoreVal =
                            contentRadarData[index]?.score ?? 0;
                          const pct = `${Math.round(scoreVal)}%`;
                          return (
                            <text
                              x={x}
                              y={y}
                              textAnchor={textAnchor}
                              fontSize={9}
                              fill="#62748e"
                            >
                              <tspan x={x} dy="0">
                                {label}
                              </tspan>
                              <tspan
                                x={x}
                                dy="11"
                                fontSize={8}
                                fontWeight={600}
                                fill="#d97706"
                              >
                                {pct}
                              </tspan>
                            </text>
                          );
                        }}
                        tickLine={false}
                      />
                      <Radar
                        name="Score"
                        dataKey="score"
                        stroke="#d97706"
                        fill="#f59e0b"
                        fillOpacity={0.15}
                        strokeWidth={2}
                        dot={{
                          r: 2.5,
                          fill: "#d97706",
                          strokeWidth: 0,
                        }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="w-full h-[160px] flex items-center justify-center bg-[#f8fafc] rounded-2xl border border-dashed border-[#e2e8f0]">
                  <p className="text-xs text-[#94a3b8]">
                    No content data yet
                  </p>
                </div>
              )}

              {/* Content Insight Summary */}
              {hasContentData && (
                <div className="mt-4 pt-4 border-t border-[#e2e8f0]">
                  {(() => {
                    const sorted = [...contentRadarData].sort((a, b) => b.score - a.score);
                    const top = sorted[0];
                    const bottom = sorted[sorted.length - 1];
                    return (
                      <p className="text-sm text-[#45556c] leading-relaxed">
                        Great work on your <strong className="text-[#0f172b]">{top.skill}</strong>! You're providing strong points here. Try to deliberately reinforce your <strong className="text-[#0f172b]">{bottom.skill}</strong>. Taking a few extra seconds to craft your responses with this element in mind will dramatically increase the professional impact and overall persuasiveness of your answers.
                      </p>
                    );
                  })()}
                </div>
              )}
            </motion.div>
          </div>
        ) : (
          /* ═══ NON-INTERVIEW: Proficiency Gauge + Skill Cards ═══ */
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08 }}
          >
            {/* Row 1: Proficiency gauge centered */}
            <div className="bg-white rounded-3xl border border-[#e2e8f0] p-6 md:p-8 mb-4">
              <div className="flex flex-col items-center text-center">
                <p
                  className="text-[10px] uppercase tracking-wider text-[#94a3b8] mb-4"
                  style={{ fontWeight: 600 }}
                >
                  Professional Proficiency
                </p>
                {proficiencyScore !== null ? (
                  <ProficiencyGauge
                    score={proficiencyScore}
                    size={140}
                  />
                ) : (
                  <div className="w-[140px] h-[140px] rounded-full border-[10px] border-[#e2e8f0] flex items-center justify-center">
                    <span className="text-sm text-[#94a3b8]">
                      No data
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Row 2: Skill Cards */}
            {hasRadarData && (() => {
              const sorted = [...radarData].sort((a, b) => a.score - b.score);
              const worstSkill = sorted[0]?.skill;

              // Build insight lookup from languageInsights
              const insightMap: Record<string, { observation: string; tip: string }> = {};
              for (const ins of languageInsights) {
                insightMap[ins.dimension] = { observation: ins.observation, tip: ins.tip };
              }

              // Fallback tips with concrete examples when GPT insights aren't available
              const fallbackTips: Record<string, { tip: string; before: string; after: string }> = {
                Vocabulary: {
                  tip: "Replace general words with precise, domain-specific terms.",
                  before: "We have a good solution for that.",
                  after: "We offer a cost-effective, scalable solution for that.",
                },
                Grammar: {
                  tip: "Watch for subject-verb agreement and consistent tense usage.",
                  before: "The team have completed the reports and then we start reviewing.",
                  after: "The team has completed the reports and we have started reviewing.",
                },
                Fluency: {
                  tip: "Link ideas smoothly and reduce pauses between phrases.",
                  before: "So... we did the project. And... it was successful.",
                  after: "We completed the project successfully, exceeding the initial targets.",
                },
                Pronunciation: {
                  tip: "Use the Shadowing Tool below to drill your problem words with AI feedback.",
                  before: "",
                  after: "",
                },
                "Professional Tone": {
                  tip: "Replace casual expressions with formal, business-appropriate language.",
                  before: "Yeah, that's pretty much what we did.",
                  after: "That accurately reflects our approach and methodology.",
                },
                Persuasion: {
                  tip: "Support your claims with specific metrics and real-world outcomes.",
                  before: "Our product really helps companies a lot.",
                  after: "Our platform reduced client onboarding time by 40% across 12 enterprise accounts.",
                },
              };

              return (
                <div className="bg-white rounded-3xl border border-[#e2e8f0] p-5 md:p-6">
                  <p
                    className="text-sm text-[#0f172b] mb-4"
                    style={{ fontWeight: 600 }}
                  >
                    Skill Breakdown
                  </p>

                  <div className="space-y-3">
                    {radarData.map((d, i) => {
                      const colors = LANGUAGE_PILLAR_COLORS[d.skill] || { icon: "📊", bg: "rgba(99,102,241,0.12)", text: "#6366f1" };
                      const isWorst = d.skill === worstSkill;
                      const insight = insightMap[d.skill];
                      const fallback = fallbackTips[d.skill];
                      const score = Math.round(d.score);
                      const barColor = score >= 80 ? "#22c55e" : score >= 60 ? "#6366f1" : "#f59e0b";

                      return (
                        <motion.div
                          key={d.skill}
                          className={`rounded-xl p-3.5 border ${isWorst ? "border-[#fde68a] bg-[#fffbeb]" : "border-[#e2e8f0] bg-[#fafbfc]"}`}
                          initial={{ opacity: 0, x: -12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 + i * 0.05 }}
                        >
                          {/* Skill header row */}
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-base">{colors.icon}</span>
                              <span className="text-sm text-[#0f172b]" style={{ fontWeight: 600 }}>
                                {d.skill}
                              </span>
                              {isWorst && (
                                <span
                                  className="text-[9px] bg-[#f59e0b]/15 text-[#b45309] px-1.5 py-0.5 rounded"
                                  style={{ fontWeight: 600 }}
                                >
                                  FOCUS AREA
                                </span>
                              )}
                            </div>
                            <span
                              className="text-sm"
                              style={{ fontWeight: 700, color: barColor }}
                            >
                              {score}%
                            </span>
                          </div>

                          {/* Progress bar */}
                          <div className="h-1.5 bg-[#e2e8f0] rounded-full overflow-hidden mb-2">
                            <motion.div
                              className="h-full rounded-full"
                              style={{ backgroundColor: barColor }}
                              initial={{ width: 0 }}
                              animate={{ width: `${score}%` }}
                              transition={{ duration: 0.8, delay: 0.15 + i * 0.05, ease: "easeOut" }}
                            />
                          </div>

                          {/* Tip: GPT insight or fallback with example */}
                          {insight ? (
                            <p className="text-xs text-[#62748e] leading-relaxed">
                              <span className="text-[#6366f1]" style={{ fontWeight: 600 }}>Tip: </span>
                              {insight.tip}
                            </p>
                          ) : fallback ? (
                            <div>
                              <p className="text-xs text-[#62748e] leading-relaxed mb-1.5">
                                <span className="text-[#6366f1]" style={{ fontWeight: 600 }}>Tip: </span>
                                {fallback.tip}
                              </p>
                              {fallback.before && fallback.after && (
                                <div className="text-[11px] leading-relaxed bg-white/80 rounded-lg px-3 py-2 border border-[#e2e8f0]/60">
                                  <span className="text-[#94a3b8] line-through">{fallback.before}</span>
                                  <span className="text-[#94a3b8] mx-1.5">→</span>
                                  <span className="text-[#0f172b]" style={{ fontWeight: 500 }}>{fallback.after}</span>
                                </div>
                              )}
                            </div>
                          ) : null}
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </motion.div>
        )}

        {/* ═══ COACHING INSIGHTS (Language + Content) ═══ */}
        {allInsights.length > 0 && (
          <FeedbackAccordion
            icon={<Lightbulb className="w-5 h-5 text-white" />}
            title="Coaching Insights"
            isOpen={activeAccordion === "coaching"}
            onToggle={() => handleAccordionToggle("coaching")}
            badge={
              isInterview ? (
                <span
                  className="text-[10px] bg-[#fef3c7] text-[#92400e] px-2.5 py-0.5 rounded-full"
                  style={{ fontWeight: 600 }}
                >
                  Language & Content
                </span>
              ) : null
            }
            delay={0.2}
          >
            <div className="space-y-3">
              {allInsights.map((insight, i) => {
                const dimColor = CONTENT_QUALITY_COLORS[insight.dimension] || LANGUAGE_PILLAR_COLORS[insight.dimension] || {
                  icon: "💡",
                  bg: "rgba(99,102,241,0.12)",
                  text: "#6366f1",
                };
                return (
                  <motion.div
                    key={i}
                    className="rounded-xl border border-[#e2e8f0] p-4"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.24 + i * 0.06 }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-base">
                        {dimColor.icon}
                      </span>
                      <span
                        className="text-[10px] px-2 py-0.5 rounded-full"
                        style={{
                          fontWeight: 600,
                          backgroundColor: dimColor.bg,
                          color: dimColor.text,
                        }}
                      >
                        {insight.dimension}
                      </span>
                    </div>
                    <p className="text-sm text-[#314158] mb-1.5">
                      {insight.observation}
                    </p>
                    <p className="text-xs text-[#45556c] bg-[#f8fafc] rounded-lg px-3 py-2 border border-[#e2e8f0]">
                      <span
                        className="text-[#6366f1]"
                        style={{ fontWeight: 600 }}
                      >
                        Tip:
                      </span>{" "}
                      {insight.tip}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </FeedbackAccordion>
        )}

        {/* ═══ COLLAPSIBLE: Practice Analysis ═══ */}
        <FeedbackAccordion
          icon={<Target className="w-5 h-5 text-white" />}
          title="Practice Analysis"
          isOpen={activeAccordion === "practice"}
          onToggle={() => handleAccordionToggle("practice")}
          badge={
            <span
              className="text-[10px] bg-[#f1f5f9] text-[#62748e] px-2.5 py-0.5 rounded-full"
              style={{ fontWeight: 600 }}
            >
              {strengths.length + beforeAfter.length} insights
            </span>
          }
          delay={0.14}
        >
          {/* Strengths */}
          {strengths.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-4 h-4 text-[#22c55e]" />
                <p
                  className="text-sm text-[#0f172b]"
                  style={{ fontWeight: 600 }}
                >
                  What worked well
                </p>
              </div>
              <div className="space-y-2.5">
                {strengths.slice(0, 4).map((s: Strength, i: number) => (
                  <motion.div
                    key={i}
                    className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl px-4 py-3 flex items-start gap-2.5"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.18 + i * 0.04 }}
                  >
                    <span
                      className="w-5 h-5 rounded-full bg-[#22c55e]/15 text-[#22c55e] flex items-center justify-center shrink-0 text-[10px]"
                      style={{ fontWeight: 600 }}
                    >
                      ✓
                    </span>
                    <div>
                      <p
                        className="text-sm text-[#0f172b]"
                        style={{ fontWeight: 500 }}
                      >
                        {s.title}
                      </p>
                      <p className="text-xs text-[#45556c] mt-0.5">
                        {s.desc}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Before / After */}
          {beforeAfter.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4 text-[#f59e0b]" />
                <p
                  className="text-sm text-[#0f172b]"
                  style={{ fontWeight: 600 }}
                >
                  Key improvements
                </p>
              </div>
              <div className="space-y-2.5">
                {beforeAfter.slice(0, 4).map((ba: BeforeAfterComparison, i: number) => (
                  <motion.div
                    key={i}
                    className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-4 py-3"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.22 + i * 0.04 }}
                  >
                    <div className="flex items-start gap-2 mb-1.5">
                      <span
                        className="text-[10px] bg-red-500/15 text-red-500 px-2 py-0.5 rounded-md shrink-0"
                        style={{ fontWeight: 500 }}
                      >
                        Before
                      </span>
                      <p className="text-sm text-[#94a3b8] line-through">
                        {ba.userOriginal}
                      </p>
                    </div>
                    <div className="flex items-start gap-2 mb-1.5">
                      <span
                        className="text-[10px] bg-[#22c55e]/15 text-[#22c55e] px-2 py-0.5 rounded-md shrink-0"
                        style={{ fontWeight: 500 }}
                      >
                        After
                      </span>
                      <p
                        className="text-sm text-[#0f172b]"
                        style={{ fontWeight: 500 }}
                      >
                        {ba.professionalVersion}
                      </p>
                    </div>
                    {ba.technique && (
                      <div className="flex items-center gap-1.5 ml-1">
                        <Sparkles className="w-3 h-3 text-[#f59e0b]" />
                        <span
                          className="text-[10px] text-[#f59e0b]"
                          style={{ fontWeight: 500 }}
                        >
                          {ba.technique}
                        </span>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </FeedbackAccordion>


        {/* ═══ COLLAPSIBLE: Pronunciation Analysis ═══ */}
        <FeedbackAccordion
          icon={<Mic className="w-5 h-5 text-white" />}
          title="Pronunciation & Shadowing"
          isOpen={activeAccordion === "pronunciation"}
          onToggle={() => handleAccordionToggle("pronunciation")}
          badge={
            hasPronData ? (
              <span
                className="text-[10px] bg-[#6366f1]/10 text-[#6366f1] px-2.5 py-0.5 rounded-full"
                style={{ fontWeight: 600 }}
              >
                {pronunciationData.length} turns &middot; AI analysis
              </span>
            ) : (
              <span
                className="text-[10px] bg-[#f1f5f9] text-[#94a3b8] px-2.5 py-0.5 rounded-full"
                style={{ fontWeight: 500 }}
              >
                No data
              </span>
            )
          }
          defaultOpen={false}
          delay={0.18}
        >
          {hasPronData ? (
            <PronunciationTab
              pronunciationData={pronunciationData}
              sessionId={sessionId}
              scenarioType={scenarioType}
              scenarioLabel={scenarioLabel}
              beforeAfter={realFeedback?.beforeAfter}
            />
          ) : (
            <div className="text-center py-10">
              <div className="w-14 h-14 rounded-full bg-[#f1f5f9] flex items-center justify-center mx-auto mb-4">
                <Mic className="w-6 h-6 text-[#94a3b8]" />
              </div>
              <p
                className="text-sm text-[#62748e] mb-1"
                style={{ fontWeight: 500 }}
              >
                No pronunciation data available
              </p>
              <p className="text-xs text-[#94a3b8] max-w-xs mx-auto">
                Pronunciation analysis requires voice practice
                mode.
              </p>
            </div>
          )}
        </FeedbackAccordion>

        {/* ═══ PRACTICE AGAIN / PAYWALL ═══ */}
        {onPracticeAgain && repeatInfo && (
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
          >
            {repeatInfo.canRepeat ? (
              <div className="rounded-3xl bg-gradient-to-br from-[#eef2ff] to-[#f0f9ff] border border-[#bfdbfe]/50 p-8 text-center">
                <div className="w-14 h-14 rounded-full bg-[#6366f1]/10 flex items-center justify-center mx-auto mb-4">
                  <RotateCcw className="w-7 h-7 text-[#6366f1]" />
                </div>
                <h3
                  className="text-xl text-[#0f172b] mb-2"
                  style={{ fontWeight: 500 }}
                >
                  Ready to try again?
                </h3>
                <p className="text-[#45556c] mb-1 max-w-md mx-auto">
                  Apply your feedback in a new conversation. The
                  AI will respond differently each time.
                </p>
                <p
                  className="text-xs text-[#6366f1] mb-6"
                  style={{ fontWeight: 600 }}
                >
                  Attempt {repeatInfo.attempt} of{" "}
                  {repeatInfo.maxAttempts} —{" "}
                  {repeatInfo.maxAttempts - repeatInfo.attempt}{" "}
                  {repeatInfo.maxAttempts -
                    repeatInfo.attempt ===
                    1
                    ? "retry"
                    : "retries"}{" "}
                  remaining
                </p>
                <button
                  onClick={onPracticeAgain}
                  className="bg-[#6366f1] text-white px-8 py-4 rounded-full flex items-center gap-3 shadow-lg hover:bg-[#4f46e5] transition-colors mx-auto text-lg"
                  style={{ fontWeight: 500 }}
                >
                  <RotateCcw className="w-5 h-5" />
                  Practice Again
                </button>
              </div>
            ) : showPaywallOnRepeat ? (
              <div className="rounded-3xl bg-gradient-to-br from-[#fef3c7] to-[#fff7ed] border border-[#fde68a]/60 p-8 text-center">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#f59e0b]/10 to-[#f97316]/10 flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-7 h-7 text-[#f59e0b]" />
                </div>
                <h3
                  className="text-xl text-[#0f172b] mb-2"
                  style={{ fontWeight: 500 }}
                >
                  Want more practice?
                </h3>
                <p className="text-[#45556c] mb-2 max-w-md mx-auto">
                  You've completed your {repeatInfo.maxAttempts}{" "}
                  free{" "}
                  {repeatInfo.maxAttempts === 1
                    ? "attempt"
                    : "attempts"}
                  . Unlock unlimited practice to perfect your
                  delivery.
                </p>
                <p className="text-xs text-[#92400e]/70 mb-6">
                  Each attempt generates a different
                  conversation — the more you practice, the more
                  confident you become.
                </p>
                <button
                  onClick={() =>
                    onPaywallTriggered?.("extra-practice")
                  }
                  className="bg-[#0f172b] text-white px-8 py-4 rounded-full flex items-center gap-3 shadow-lg hover:bg-[#1d293d] transition-colors mx-auto text-lg"
                  style={{ fontWeight: 500 }}
                >
                  <Sparkles className="w-5 h-5" />
                  Unlock More Practice
                  <ArrowRight className="w-5 h-5" />
                </button>
                <p className="text-[10px] text-[#92400e]/50 mt-3">
                  Starting at $4.99 per session · No
                  subscription required
                </p>
              </div>
            ) : (
              <div className="rounded-3xl bg-gradient-to-br from-[#f0fdf4] to-[#dcfce7] border border-[#bbf7d0] p-8 text-center">
                <div className="w-14 h-14 rounded-full bg-[#16a34a]/10 flex items-center justify-center mx-auto mb-4">
                  <Trophy className="w-7 h-7 text-[#16a34a]" />
                </div>
                <h3
                  className="text-xl text-[#0f172b] mb-2"
                  style={{ fontWeight: 500 }}
                >
                  You've mastered this scenario!
                </h3>
                <p className="text-[#45556c] mb-6 max-w-md mx-auto">
                  You've completed {repeatInfo.maxAttempts}{" "}
                  {repeatInfo.maxAttempts === 1
                    ? "attempt"
                    : "attempts"}{" "}
                  of this scenario. Try a different one to build
                  versatility.
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  {[
                    {
                      key: "interview",
                      label: "Interview",
                      icon: <Briefcase className="w-4 h-4" />,
                    },
                    {
                      key: "sales",
                      label: "Sales Pitch",
                      icon: (
                        <MessageSquare className="w-4 h-4" />
                      ),
                    },
                    {
                      key: "negotiation",
                      label: "Negotiation",
                      icon: <Handshake className="w-4 h-4" />,
                    },
                    {
                      key: "networking",
                      label: "Networking",
                      icon: <Users className="w-4 h-4" />,
                    },
                  ]
                    .filter((s) => s.key !== scenarioType)
                    .slice(0, 3)
                    .map((s) => (
                      <button
                        key={s.key}
                        onClick={onGenerateReport}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-[#e2e8f0] text-sm text-[#0f172b] hover:bg-[#f8fafc] transition-colors shadow-sm"
                        style={{ fontWeight: 500 }}
                      >
                        {s.icon}
                        {s.label}
                      </button>
                    ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* ═══ GENERATE REPORT CTA ═══ */}
        <motion.div
          className="flex flex-col items-center gap-3"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <button
            onClick={onGenerateReport}
            className="bg-[#0f172b] text-white px-10 py-4 rounded-full flex items-center gap-3 shadow-lg hover:bg-[#1d293d] transition-colors text-lg"
            style={{ fontWeight: 500 }}
          >
            <FileText className="w-5 h-5" />
            Generate Full Report
            <ArrowRight className="w-5 h-5" />
          </button>
        </motion.div>
      </main>
      <MiniFooter />
    </div>
  );
}

/* ── ExtraContextField data moved to session/ExtraContextScreen.tsx ── */

export { ConversationFeedback };