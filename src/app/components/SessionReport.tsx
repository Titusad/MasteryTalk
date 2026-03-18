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
 *  5. Motivational banner
 *  6. Download PDF + Go To Dashboard CTAs
 * ══════════════════════════════════════════════════════════════
 */

import { useState } from "react";
import {
  FileText,
  Sparkles,
  Check,
  Trophy,
  Download,
  Lock,
  ArrowRight,
  Lightbulb,
  ClipboardCheck,
} from "lucide-react";
import { motion } from "motion/react";
import {
  PastelBlobs,
  MiniFooter,
} from "./shared";
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
}

export function SessionReport({
  scenarioType,
  realFeedback,
  sessionSummary,
  generatedScript,
  sessionDuration,
  onFinish,
  finishLabel = "Go To Dashboard",
  embedded = false,
  onDownloadReport,
  userPlan = "free",
  interviewBriefing,
  interlocutor,
  scenario,
}: SessionReportProps) {
  const scenarioLabel = scenarioType
    ? SCENARIO_LABELS_MAP[scenarioType] ?? "your conversation"
    : "your conversation";

  /* ── Data sources ── */
  const scriptSections = generatedScript?.length
    ? generatedScript
    : getScriptSectionsForScenario(scenarioType);
  const isRealData = !!(realFeedback?.strengths?.length);
  const totalTime = sessionDuration || "4 min";

  /* ── Summary data ── */
  const overallSentiment = sessionSummary?.overallSentiment || null;
  const nextSteps = sessionSummary?.nextSteps || [];
  const sessionHighlight = sessionSummary?.sessionHighlight || null;

  return (
    <div
      className={`w-full min-h-full flex flex-col ${embedded ? "" : "bg-[#f0f4f8] relative overflow-hidden"}`}
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {!embedded && <PastelBlobs />}

      <main className={`relative max-w-[800px] mx-auto px-6 ${embedded ? "pt-0 pb-8" : "pt-10 pb-20"}`}>
        {/* ═══════════════════════════════════════════════
           HERO
           ═══════════════════════════════════════════════ */}
        {!embedded && (
          <motion.div
            className="text-center mb-10"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#dcfce7] to-[#d1fae5] flex items-center justify-center mx-auto mb-5">
              <Trophy className="w-8 h-8 text-[#00A63E]" />
            </div>
            <h1
              className="text-3xl md:text-[42px] text-[#0f172b] mb-3"
              style={{ fontWeight: 300, lineHeight: 1.2 }}
            >
              Session Report
            </h1>
            {overallSentiment ? (
              <p className="text-[#45556c] max-w-lg mx-auto text-lg" style={{ fontWeight: 400 }}>
                {overallSentiment}
              </p>
            ) : (
              <p className="text-[#45556c] max-w-lg mx-auto">
                Your complete {scenarioLabel} practice report.
              </p>
            )}
            <div className="flex items-center justify-center gap-3 mt-4">
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
            </div>
          </motion.div>
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
                  ? "bg-gradient-to-r from-[#f59e0b] to-[#f97316] text-white hover:from-[#d97706] hover:to-[#ea580c]"
                  : "bg-white border border-[#e2e8f0] text-[#0f172b] hover:bg-[#f8fafc]"
                }`}
              style={{ fontWeight: 500 }}
            >
              {userPlan === "free" ? (
                <>
                  <Lock className="w-4 h-4" />
                  Download Full Report (PDF)
                  <Sparkles className="w-4 h-4" />
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Download Report (PDF)
                </>
              )}
            </button>
          )}
          {userPlan === "free" && onDownloadReport && (
            <p className="text-[10px] text-[#92400e]/60">
              Free users can view the report on screen · Download requires a session credit
            </p>
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