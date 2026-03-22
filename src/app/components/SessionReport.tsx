/**
 * ══════════════════════════════════════════════════════════════
 *  inFluentia PRO — Session Report (Final Report after feedback)
 *
 *  This is the FULL REPORT page shown after the user clicks
 *  "Generate Report" in Session Feedback. Contains:
 *  1. Hero
 *  2. Your Script
 *  3. Next Steps (from AI summary)
 *  4. Preparation Utilization (interview + briefing only)
 *  5. Pronunciation Analysis (Azure Speech data)
 *  6. Motivational banner
 *  7. Download PDF + Go To Dashboard CTAs
 * ══════════════════════════════════════════════════════════════
 */

import { useState, useMemo } from "react";
import {
  FileText,
  Sparkles,
  Check,
  Trophy,
  Download,
  Lock,
  ArrowRight,
  Copy,
  Lightbulb,
  ClipboardCheck,
  Mic,
  BarChart3,
  Award,
} from "lucide-react";
import { motion } from "motion/react";
import {
  PastelBlobs,
  MiniFooter,
  PageTitleBlock,
} from "./shared";
import { SessionProgressBar } from "./SessionProgressBar";
import {
  getScriptSectionsForScenario,
} from "../../services/scenario-data";
import type {
  ScenarioType,
  UserPlan,
  Strength,
  Opportunity,
  BeforeAfterComparison,
  ScriptSection,
  SessionSummary,
  TurnPronunciationData,
  InterviewBriefingData,
} from "../../services/types";
import type { CVMatchResult } from "../../services/cvMatchService";
import { downloadSessionReportPdf } from "../utils/cheatSheetPdf";

/* ─── Scenario labels ─── */
const SCENARIO_LABELS_MAP: Record<string, string> = {
  sales: "Sales Pitch",
  interview: "Job Interview",
  csuite: "Executive Presentation",
  negotiation: "Negotiation",
  networking: "Networking",
};

/* ─── Pillar color map (for Next Steps badges) ─── */
const PILLAR_COLORS: Record<string, { bg: string; text: string }> = {
  "Resiliencia Linguistica": { bg: "rgba(96,165,250,0.15)", text: "#60a5fa" },
  "Defensa de Valor": { bg: "rgba(251,191,36,0.15)", text: "#fbbf24" },
  "Alineacion Cultural": { bg: "rgba(80,200,120,0.15)", text: "#50C878" },
  "Estructura del Discurso": { bg: "rgba(168,85,247,0.15)", text: "#a855f7" },
  "Resiliência Linguística": { bg: "rgba(96,165,250,0.15)", text: "#60a5fa" },
  "Defesa de Valor": { bg: "rgba(251,191,36,0.15)", text: "#fbbf24" },
  "Alinhamento Cultural": { bg: "rgba(80,200,120,0.15)", text: "#50C878" },
  "Estrutura do Discurso": { bg: "rgba(168,85,247,0.15)", text: "#a855f7" },
  Vocabulary: { bg: "rgba(96,165,250,0.15)", text: "#60a5fa" },
  Grammar: { bg: "rgba(168,85,247,0.15)", text: "#a855f7" },
  Fluency: { bg: "rgba(251,191,36,0.15)", text: "#fbbf24" },
  Pronunciation: { bg: "rgba(239,68,68,0.12)", text: "#ef4444" },
  "Professional Tone": { bg: "rgba(80,200,120,0.15)", text: "#50C878" },
  Persuasion: { bg: "rgba(99,102,241,0.15)", text: "#6366f1" },
};

/* ─── Section wrapper ─── */
function ReportSection({
  icon,
  iconBg = "#0f172b",
  title,
  delay = 0,
  children,
}: {
  icon: React.ReactNode;
  iconBg?: string;
  title: string;
  delay?: number;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      className="rounded-3xl bg-white border border-[#e2e8f0] p-6 md:p-8 mb-6"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
          style={{ backgroundColor: iconBg }}
        >
          {icon}
        </div>
        <h2 className="text-xl text-[#0f172b]" style={{ fontWeight: 500 }}>
          {title}
        </h2>
      </div>
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Real Feedback Data (from /analyze-feedback) — kept for prop compat
   ═══════════════════════════════════════════════════════════════ */
interface RealFeedbackData {
  strengths: Strength[];
  opportunities: Opportunity[];
  beforeAfter: BeforeAfterComparison[];
  pillarScores?: Record<string, number> | null;
  professionalProficiency?: number | null;
  contentScores?: Record<string, number> | null;
  interviewReadinessScore?: number | null;
  contentInsights?: Array<{
    dimension: string;
    observation: string;
    tip: string;
  }> | null;
  /** Preparation Utilization — interview + briefing only */
  preparationUtilization?: {
    score: number;
    verdict: string;
    insights: Array<{
      aspect: string;
      observation: string;
      rating: "strong" | "partial" | "missed";
    }>;
  } | null;
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT: SessionReport
   ═══════════════════════════════════════════════════════════════ */

export interface SessionReportProps {
  scenarioType?: ScenarioType;
  guidedFields?: Record<string, string>;
  realFeedback?: RealFeedbackData | null;
  sessionSummary?: SessionSummary | null;
  generatedScript?: ScriptSection[] | null;
  improvedScript?: ScriptSection[] | null;
  sessionDuration?: string;
  onFinish?: () => void;
  finishLabel?: string;
  embedded?: boolean;
  onDownloadReport?: () => void;
  userPlan?: UserPlan;
  pronunciationData?: TurnPronunciationData[];
  /** Interview briefing data for comprehensive PDF report */
  interviewBriefing?: InterviewBriefingData | null;
  interlocutor?: string;
  scenario?: string;
  cvMatchData?: CVMatchResult | null;
  cvMatchStatus?: "idle" | "loading" | "success" | "error";
}

export function SessionReport({
  scenarioType,
  realFeedback,
  sessionSummary,
  generatedScript,
  improvedScript,
  sessionDuration,
  onFinish,
  finishLabel = "Go To Dashboard",
  embedded = false,
  onDownloadReport,
  userPlan = "free",
  pronunciationData,
  interviewBriefing,
  interlocutor,
  scenario,
  cvMatchData,
  cvMatchStatus,
}: SessionReportProps) {
  const scenarioLabel = scenarioType
    ? SCENARIO_LABELS_MAP[scenarioType] ?? "your conversation"
    : "your conversation";

  /* ── Data sources ── */
  const scriptSections = improvedScript?.length
    ? improvedScript
    : (generatedScript?.length ? generatedScript : []);
  const isRealData = !!(realFeedback?.strengths?.length);
  const totalTime = sessionDuration || "4 min";

  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const handleCopy = (text: string, index: number) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    }
  };

  /* ── Summary data ── */
  const overallSentiment = sessionSummary?.overallSentiment || null;
  const nextSteps = sessionSummary?.nextSteps || [];
  const sessionHighlight = sessionSummary?.sessionHighlight || null;

  /* ── Pronunciation computed data ── */
  const pronScores = useMemo(() => {
    if (!pronunciationData?.length) return null;
    const turns = pronunciationData;
    const accuracy = turns.reduce((s, t) => s + t.assessment.accuracyScore, 0) / turns.length;
    const fluency = turns.reduce((s, t) => s + t.assessment.fluencyScore, 0) / turns.length;
    const prosody = turns.reduce((s, t) => s + t.assessment.prosodyScore, 0) / turns.length;
    const overall = turns.reduce((s, t) => s + t.assessment.pronScore, 0) / turns.length;
    return { accuracy, fluency, prosody, overall, turnCount: turns.length };
  }, [pronunciationData]);

  const problemWords = useMemo(() => {
    if (!pronunciationData?.length) return [];
    const wordMap = new Map<string, { count: number; totalScore: number; errorType: string }>();
    for (const turn of pronunciationData) {
      for (const w of turn.assessment.words) {
        if (w.accuracyScore < 60 || w.errorType === "Mispronunciation") {
          const key = w.word.toLowerCase();
          const existing = wordMap.get(key);
          if (existing) {
            existing.count++;
            existing.totalScore += w.accuracyScore;
          } else {
            wordMap.set(key, { count: 1, totalScore: w.accuracyScore, errorType: w.errorType });
          }
        }
      }
    }
    return Array.from(wordMap.entries())
      .map(([word, data]) => ({ word, avgScore: Math.round(data.totalScore / data.count), errorType: data.errorType, count: data.count }))
      .sort((a, b) => a.avgScore - b.avgScore)
      .slice(0, 8);
  }, [pronunciationData]);

  const pronTip = useMemo(() => {
    if (!pronScores) return "";
    if (pronScores.fluency >= 80) return "Your speech flow is strong. Focus on refining intonation and rhythm for even more natural delivery.";
    if (pronScores.fluency >= 60) return "Practice linking words together smoothly. Try reading professional articles aloud for 5 minutes daily.";
    return "Start with shorter sentences and gradually build complexity. Record yourself and compare with native speakers.";
  }, [pronScores]);

  return (
    <div
      className={`w-full min-h-full flex flex-col ${embedded ? "" : "bg-[#f0f4f8] relative overflow-hidden"}`}
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {!embedded && <PastelBlobs />}

      <main className={`relative max-w-[800px] mx-auto px-6 ${embedded ? "pt-0 pb-8" : "pt-10 pb-20"}`}>
        {!embedded && (
          <div className="w-full mb-10 pt-4">
            <SessionProgressBar currentStep="session-recap" />
          </div>
        )}
        {/* ═══════════════════════════════════════════════
           HERO
           ═══════════════════════════════════════════════ */}
        {!embedded && (
          <PageTitleBlock
            icon={<Trophy className="w-8 h-8 text-white" />}
            title="Session Report"
            subtitle={overallSentiment ? overallSentiment : `Your complete ${scenarioLabel} practice report.`}
          >
            {isRealData && (
              <span
                className="inline-flex items-center gap-1.5 text-[10px] bg-[#50C878]/15 text-[#16a34a] px-3 py-1 rounded-full"
                style={{ fontWeight: 600 }}
              >
                <Sparkles className="w-3 h-3" /> AI-generated
              </span>
            )}
            <span className="text-[10px] bg-[#f1f5f9] text-[#62748e] px-3 py-1 rounded-full" style={{ fontWeight: 500 }}>
              {totalTime}
            </span>
          </PageTitleBlock>
        )}

        {/* ═══════════════════════════════════════════════
           SESSION HIGHLIGHT
           ═══════════════════════════════════════════════ */}
        {sessionHighlight && (
          <motion.div
            className="bg-gradient-to-r from-[#f0fdf4] to-[#ecfdf5] border border-[#bbf7d0] rounded-2xl p-5 mb-6 flex items-start gap-3"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08 }}
          >
            <div className="w-8 h-8 rounded-full bg-[#50C878]/20 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-[#16a34a]" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-[#16a34a] mb-1" style={{ fontWeight: 600 }}>Session highlight</p>
              <p className="text-sm text-[#0f172b] leading-relaxed">{sessionHighlight}</p>
            </div>
          </motion.div>
        )}

        {/* ═══════════════════════════════════════════════
           TAILORED RESUME
           ═══════════════════════════════════════════════ */}
        {cvMatchStatus === "success" && cvMatchData?.tailoredBullets && cvMatchData.tailoredBullets.length > 0 && (
          <ReportSection
            icon={<FileText className="w-5 h-5 text-white" />}
            iconBg="#10b981"
            title="Tailored Resume Bullets"
            delay={0.10}
          >
            <div className="space-y-4">
              {cvMatchData.tailoredBullets.map((bullet: any, i: number) => (
                <motion.div
                    key={i}
                    className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-5 py-4 relative group hover:border-[#bfdbfe] transition-colors"
                >
                    <p className="text-[11px] text-[#62748e] mb-1.5 font-medium bg-[#e2e8f0]/60 inline-flex items-center px-2 py-0.5 rounded-md">
                        Based on: {bullet.experienceContext}
                    </p>
                    <p className="text-[#0f172b] text-[15px] mb-4 mt-1 pr-10" style={{ fontWeight: 500, lineHeight: 1.6 }}>
                        {bullet.rewrittenBullet}
                    </p>
                    
                    {/* Copy Button */}
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            handleCopy(bullet.rewrittenBullet, i);
                        }}
                        className={`absolute top-4 right-4 w-8 h-8 rounded-lg border flex items-center justify-center transition-all shadow-sm ${
                            copiedIndex === i 
                                ? "bg-[#10b981] border-[#10b981] text-white" 
                                : "bg-white border-[#e2e8f0] text-[#62748e] hover:text-[#3b82f6] hover:border-[#bfdbfe]"
                        }`}
                        title="Copy to clipboard"
                    >
                        {copiedIndex === i ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>

                    <div className="flex items-start gap-2 pt-3 border-t border-[#e2e8f0]">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#10b981] mt-1.5 shrink-0" />
                        <p className="text-[13px] text-[#45556c] leading-relaxed">
                            <span className="font-semibold text-[#314158]">Why this works:</span> {bullet.matchReason}
                        </p>
                    </div>
                </motion.div>
              ))}
            </div>
          </ReportSection>
        )}

        {/* ═══════════════════════════════════════════════
           YOUR SCRIPT
           ═══════════════════════════════════════════════ */}
        {scriptSections.length > 0 && (
          <ReportSection
            icon={<FileText className="w-5 h-5 text-white" />}
            title="Your Script"
            delay={0.12}
          >
            <div className="space-y-4">
              {scriptSections.map((section) => (
                <div key={section.num} className="bg-[#f8fafc] rounded-xl border border-[#e2e8f0] p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className="w-6 h-6 rounded-lg bg-[#3b82f6]/10 flex items-center justify-center text-[10px] text-[#3b82f6]"
                      style={{ fontWeight: 700 }}
                    >
                      {section.num}
                    </span>
                    <p className="text-sm text-[#0f172b]" style={{ fontWeight: 500 }}>
                      {section.title}
                    </p>
                  </div>
                  <div className="ml-8 space-y-2">
                    {section.paragraphs.map((p, pi) => (
                      <p key={pi} className="text-sm text-[#45556c] leading-relaxed">
                        {p.text}
                        {p.highlights?.map((h, hi) => (
                          <span key={hi} className="text-[#0f172b]" style={{ fontWeight: 500 }}>
                            {h.phrase}
                          </span>
                        ))}
                        {p.suffix}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ReportSection>
        )}

        {/* ═══════════════════════════════════════════════
           NEXT STEPS (from AI summary)
           ═══════════════════════════════════════════════ */}
        {nextSteps.length > 0 && (
          <ReportSection
            icon={<ArrowRight className="w-5 h-5 text-white" />}
            iconBg="#6366f1"
            title="Next Steps"
            delay={0.2}
          >
            <div className="space-y-3">
              {nextSteps.map((step, i) => {
                const pillarColor = PILLAR_COLORS[step.pillar] ?? { bg: "rgba(99,102,241,0.1)", text: "#6366f1" };
                return (
                  <motion.div
                    key={i}
                    className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-5"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.24 + i * 0.08 }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-[#0f172b] text-sm" style={{ fontWeight: 600 }}>{step.title}</h3>
                      <span
                        className="text-[10px] px-2.5 py-0.5 rounded-full shrink-0 ml-3"
                        style={{ fontWeight: 600, backgroundColor: pillarColor.bg, color: pillarColor.text }}
                      >
                        {step.pillar}
                      </span>
                    </div>
                    <p className="text-sm text-[#45556c] leading-relaxed">{step.desc}</p>
                  </motion.div>
                );
              })}
            </div>
          </ReportSection>
        )}

        {/* ═══════════════════════════════════════════════
           PREPARATION UTILIZATION (interview + briefing only)
           ═══════════════════════════════════════════════ */}
        {realFeedback?.preparationUtilization && (
          <ReportSection
            icon={<ClipboardCheck className="w-5 h-5 text-white" />}
            iconBg="#6366f1"
            title="Preparation Score"
            delay={0.24}
          >
            {/* Score + Verdict */}
            <div className="flex items-center gap-5 mb-5">
              <div className="relative w-[80px] h-[80px] shrink-0">
                <svg width={80} height={80} className="-rotate-90">
                  <circle cx={40} cy={40} r={34} fill="none" stroke="#e2e8f0" strokeWidth={8} />
                  <motion.circle
                    cx={40} cy={40} r={34} fill="none"
                    stroke={realFeedback.preparationUtilization.score >= 75 ? "#22c55e" : realFeedback.preparationUtilization.score >= 50 ? "#6366f1" : "#f59e0b"}
                    strokeWidth={8} strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 34}
                    initial={{ strokeDashoffset: 2 * Math.PI * 34 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 34 * (1 - realFeedback.preparationUtilization.score / 100) }}
                    transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl text-[#0f172b]" style={{ fontWeight: 700 }}>
                    {realFeedback.preparationUtilization.score}%
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm text-[#0f172b] mb-1" style={{ fontWeight: 600 }}>
                  {realFeedback.preparationUtilization.verdict}
                </p>
                <p className="text-xs text-[#62748e]">
                  How well you leveraged your pre-interview preparation during the live conversation.
                </p>
              </div>
            </div>

            {/* Insight items */}
            <div className="space-y-2.5">
              {realFeedback.preparationUtilization.insights.map((ins, i) => {
                const cfg = {
                  strong: { bg: "bg-[#f0fdf4]", border: "border-[#bbf7d0]", dot: "#22c55e", label: "Strong" },
                  partial: { bg: "bg-[#fffbeb]", border: "border-[#fde68a]", dot: "#f59e0b", label: "Partial" },
                  missed: { bg: "bg-[#fef2f2]", border: "border-[#fecaca]", dot: "#ef4444", label: "Missed" },
                }[ins.rating] ?? { bg: "bg-[#f8fafc]", border: "border-[#e2e8f0]", dot: "#94a3b8", label: ins.rating };

                return (
                  <motion.div
                    key={i}
                    className={`${cfg.bg} ${cfg.border} border rounded-xl px-4 py-3`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.28 + i * 0.06 }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cfg.dot }} />
                      <span className="text-[10px] text-[#62748e] uppercase tracking-wider" style={{ fontWeight: 600 }}>
                        {ins.aspect}
                      </span>
                      <span className="text-[10px] ml-auto px-2 py-0.5 rounded-full bg-white/70" style={{ fontWeight: 600, color: cfg.dot }}>
                        {cfg.label}
                      </span>
                    </div>
                    <p className="text-sm text-[#314158] leading-relaxed">{ins.observation}</p>
                  </motion.div>
                );
              })}
            </div>
          </ReportSection>
        )}

        {/* ═══════════════════════════════════════════════
           PRONUNCIATION ANALYSIS (Azure Speech data)
           ═══════════════════════════════════════════════ */}
        {pronScores && (
          <ReportSection
            icon={<Mic className="w-5 h-5 text-white" />}
            iconBg="#6366f1"
            title="Pronunciation Analysis"
            delay={0.26}
          >
            {/* Subtitle */}
            <p className="text-xs text-[#94a3b8] -mt-4 mb-5">
              {pronScores.turnCount} turn{pronScores.turnCount !== 1 ? "s" : ""} analyzed by Azure Speech AI
            </p>

            {/* Score gauges row */}
            <div className="grid grid-cols-4 gap-3 mb-6">
              {[
                { label: "Accuracy", value: pronScores.accuracy },
                { label: "Fluency", value: pronScores.fluency },
                { label: "Intonation", value: pronScores.prosody },
                { label: "Overall", value: pronScores.overall },
              ].map((s, i) => {
                const color = s.value >= 80 ? "#22c55e" : s.value >= 60 ? "#f59e0b" : "#ef4444";
                const bg = s.value >= 80 ? "rgba(34,197,94,0.08)" : s.value >= 60 ? "rgba(245,158,11,0.08)" : "rgba(239,68,68,0.08)";
                const radius = 28;
                const circumference = 2 * Math.PI * radius;
                const filled = (s.value / 100) * circumference;
                return (
                  <motion.div
                    key={s.label}
                    className="flex flex-col items-center rounded-xl py-4"
                    style={{ backgroundColor: bg }}
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.3 + i * 0.08 }}
                  >
                    <div className="relative w-[64px] h-[64px] mb-2">
                      <svg width={64} height={64} className="-rotate-90">
                        <circle cx={32} cy={32} r={radius} fill="none" stroke="#e2e8f0" strokeWidth={5} />
                        <motion.circle
                          cx={32} cy={32} r={radius} fill="none"
                          stroke={color} strokeWidth={5} strokeLinecap="round"
                          strokeDasharray={circumference}
                          initial={{ strokeDashoffset: circumference }}
                          animate={{ strokeDashoffset: circumference - filled }}
                          transition={{ duration: 1, delay: 0.4 + i * 0.1, ease: "easeOut" }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-base" style={{ fontWeight: 700, color }}>{Math.round(s.value)}</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-[#62748e]" style={{ fontWeight: 500 }}>{s.label}</span>
                  </motion.div>
                );
              })}
            </div>

            {/* Overall badge */}
            <div className="flex justify-center mb-6">
              {(() => {
                const ov = pronScores.overall;
                const color = ov >= 80 ? "#22c55e" : ov >= 60 ? "#f59e0b" : "#ef4444";
                const bg = ov >= 80 ? "rgba(34,197,94,0.1)" : ov >= 60 ? "rgba(245,158,11,0.1)" : "rgba(239,68,68,0.1)";
                const label = ov >= 90 ? "Excellent" : ov >= 80 ? "Good" : ov >= 60 ? "Fair" : ov >= 40 ? "Needs Work" : "Practice More";
                return (
                  <motion.div
                    className="px-5 py-2 rounded-full flex items-center gap-2"
                    style={{ backgroundColor: bg, border: `1px solid ${color}30` }}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <Award className="w-4 h-4" style={{ color }} />
                    <span className="text-sm" style={{ fontWeight: 600, color }}>
                      Overall: {Math.round(ov)}% — {label}
                    </span>
                  </motion.div>
                );
              })()}
            </div>

            {/* Problem words */}
            {problemWords.length > 0 && (
              <div className="mb-5">
                <h3 className="text-sm text-[#0f172b] mb-3" style={{ fontWeight: 600 }}>
                  Words to Practice
                </h3>
                <div className="flex flex-wrap gap-2">
                  {problemWords.map((pw) => {
                    const color = pw.avgScore >= 40 ? "#f59e0b" : "#ef4444";
                    const bg = pw.avgScore >= 40 ? "rgba(245,158,11,0.1)" : "rgba(239,68,68,0.1)";
                    return (
                      <motion.span
                        key={pw.word}
                        className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border"
                        style={{ backgroundColor: bg, borderColor: `${color}30`, color }}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <span style={{ fontWeight: 600 }}>{pw.word}</span>
                        <span className="opacity-60" style={{ fontWeight: 500 }}>{pw.avgScore}%</span>
                        {pw.count > 1 && (
                          <span className="text-[9px] opacity-50">×{pw.count}</span>
                        )}
                      </motion.span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Fluency tip */}
            {pronTip && (
              <div className="bg-[#f0f4ff] border border-[#c7d2fe] rounded-xl p-4 flex items-start gap-3">
                <Lightbulb className="w-4 h-4 text-[#6366f1] shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-[#6366f1] mb-1" style={{ fontWeight: 600 }}>Tip</p>
                  <p className="text-sm text-[#314158] leading-relaxed">{pronTip}</p>
                </div>
              </div>
            )}
          </ReportSection>
        )}

        {/* ═══════════════════════════════════════════════
           MOTIVATIONAL BANNER
           ═══════════════════════════════════════════════ */}
        <motion.div
          className="rounded-3xl bg-gradient-to-br from-[#0f172b] to-[#1e293b] p-8 text-center mb-10"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.28 }}
        >
          <div className="text-4xl mb-4">🚀</div>
          <h2 className="text-white text-2xl mb-3" style={{ fontWeight: 500 }}>
            Good luck with your {scenarioLabel}!
          </h2>
          <p className="text-white/70 max-w-md mx-auto">
            You have the tools, the phrases, and the practice. Now go out and show what you can do.
          </p>
        </motion.div>

        {/* ═══════════════════════════════════════════════
           CTAs: Download + Finish
           ═══════════════════════════════════════════════ */}
        <motion.div
          className="flex flex-col items-center gap-4"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.32 }}
        >
          {onDownloadReport && (
            <button
              onClick={onDownloadReport}
              className={`px-8 py-3.5 rounded-full flex items-center gap-2.5 shadow-md transition-all text-lg ${userPlan === "free"
                  ? "bg-gradient-to-r from-[#10b981] to-[#059669] text-white hover:from-[#059669] hover:to-[#047857]"
                  : "bg-white border border-[#e2e8f0] text-[#0f172b] hover:bg-[#f8fafc]"
                }`}
              style={{ fontWeight: 500 }}
            >
              {userPlan === "free" ? (
                <>
                  <Download className="w-5 h-5" />
                  Descargar Gratis (PDF)
                  <Sparkles className="w-4 h-4 ml-1" />
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Download Report (PDF)
                </>
              )}
            </button>
          )}

          {onFinish && (
            <button
              onClick={onFinish}
              className="bg-[#0f172b] text-white px-10 py-4 rounded-full flex items-center gap-3 shadow-lg hover:bg-[#1d293d] transition-colors text-lg"
              style={{ fontWeight: 500 }}
            >
              <Check className="w-5 h-5" />
              {finishLabel}
            </button>
          )}
        </motion.div>
      </main>

      {!embedded && <MiniFooter />}
    </div>
  );
}