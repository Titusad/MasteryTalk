/**
 * ══════════════════════════════════════════════════════════════
 *  inFluentia PRO — Informe de Sesión (MVP)
 *  Organizado en 3 secciones: Preparación, Análisis, Próximos Pasos.
 * ══════════════════════════════════════════════════════════════
 */

import { useState } from "react";
import {
  Target,
  FileText,
  Globe,
  TrendingUp,
  Lightbulb,
  CheckCircle2,
  Zap,
  Sparkles,
  AudioLines,
  ChevronDown,
  ChevronRight,
  Check,
  Trophy,
  ClipboardList,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  PastelBlobs,
  MiniFooter,
} from "./shared";
import {
  getPowerPhrasesForScenario,
  getBeforeAfterForScenario,
  getPowerQuestions,
  getCulturalTips,
  getStrengthsForScenario,
  getScriptSectionsForScenario,
} from "../../services/scenario-data";
import type {
  ScenarioType,
  ResultsSummary,
} from "../../services/types";
import type { ValuePillar } from "./StrategyBuilder";

/* ─── Scenario labels ─── */
const SCENARIO_LABELS_MAP: Record<string, string> = {
  sales: "Sales Pitch",
  interview: "Job Interview",
  csuite: "Executive Presentation",
  negotiation: "Negotiation",
  networking: "Networking",
};

/* ─── Guided field labels (matching PracticeWidget) ─── */
const GUIDED_FIELD_LABELS: Record<string, { key: string; label: string }[]> = {
  interview: [
    { key: "role", label: "Position applied for" },
    { key: "strength", label: "Your most relevant strength" },
  ],
  sales: [
    { key: "product", label: "Product or service" },
    { key: "problem", label: "Problem it solves" },
  ],
  /* Non-MVP scenarios — kept as stubs for type safety */
  csuite: [],
  negotiation: [],
  networking: [],
};

/* ─── Section wrapper component ─── */
function ReportSection({
  number,
  icon,
  iconBg = "#0f172b",
  title,
  delay = 0,
  children,
  dark = false,
}: {
  number: number;
  icon: React.ReactNode;
  iconBg?: string;
  title: string;
  delay?: number;
  children: React.ReactNode;
  dark?: boolean;
}) {
  return (
    <motion.div
      className={`rounded-3xl p-6 md:p-8 mb-6 ${
        dark
          ? "bg-gradient-to-br from-[#0f172b] to-[#1e293b]"
          : "bg-white border border-[#e2e8f0]"
      }`}
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
        <div className="flex items-center gap-2.5">
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full ${
              dark
                ? "bg-white/10 text-white/50"
                : "bg-[#f1f5f9] text-[#62748e]"
            }`}
            style={{ fontWeight: 600 }}
          >
            {number}
          </span>
          <h2
            className={`text-xl ${dark ? "text-white" : "text-[#0f172b]"}`}
            style={{ fontWeight: 500 }}
          >
            {title}
          </h2>
        </div>
      </div>
      {children}
    </motion.div>
  );
}

/* ─── Collapsible sub-section for dark cards ─── */
function CollapsibleDarkSection({
  icon,
  label,
  badge,
  defaultOpen = false,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  badge?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="mb-4 last:mb-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 mb-3 group w-full text-left"
      >
        {icon}
        <p
          className="text-sm text-white/70 group-hover:text-white/90 transition-colors"
          style={{ fontWeight: 500 }}
        >
          {label}
        </p>
        {badge}
        {open ? (
          <ChevronDown className="w-3.5 h-3.5 text-white/40 ml-auto" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5 text-white/40 ml-auto" />
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT: SessionReport
   ═══════════════════════════════════════════════════════════════ */

export interface SessionReportProps {
  scenarioType?: ScenarioType;
  guidedFields?: Record<string, string>;
  strategyPillars?: ValuePillar[];
  resultsSummary?: ResultsSummary | null;
  /** Finish button label and handler */
  onFinish?: () => void;
  finishLabel?: string;
  /** If true, hides the hero & background (for embedding inside another page) */
  embedded?: boolean;
}

export function SessionReport({
  scenarioType,
  guidedFields = {},
  strategyPillars = [],
  resultsSummary,
  onFinish,
  finishLabel = "Finish session",
  embedded = false,
}: SessionReportProps) {
  const scenarioLabel = scenarioType
    ? SCENARIO_LABELS_MAP[scenarioType] ?? "your conversation"
    : "your conversation";

  /* ── Data sources ── */
  const scenarioPhrases = Object.values(getPowerPhrasesForScenario(scenarioType)).flat();
  const powerQuestions = getPowerQuestions(scenarioType);
  const beforeAfter = getBeforeAfterForScenario(scenarioType);
  const strengths = getStrengthsForScenario(scenarioType);
  const scriptSections = getScriptSectionsForScenario(scenarioType);
  const culturalTips = getCulturalTips(scenarioType);
  const fieldLabels = scenarioType ? GUIDED_FIELD_LABELS[scenarioType] : [];

  /* Stats (MVP-simplified) */
  const totalTime = resultsSummary?.totalTime ?? "4 min";

  return (
    <div
      className={`w-full min-h-full flex flex-col ${embedded ? "" : "bg-[#f0f4f8] relative overflow-hidden"}`}
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {!embedded && <PastelBlobs />}

      <main className={`relative max-w-[800px] mx-auto px-6 ${embedded ? "pt-0 pb-8" : "pt-10 pb-20"}`}>
        {/* ── Hero ── */}
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
            <h1 className="text-3xl md:text-[42px] text-[#0f172b] mb-3" style={{ fontWeight: 300, lineHeight: 1.2 }}>
              Session Report
            </h1>
            <p className="text-[#45556c] max-w-lg mx-auto">
              Your complete {scenarioLabel} practice report. Review each section before your next real conversation.
            </p>
          </motion.div>
        )}

        {/* ── Performance Overview ── */}
        <motion.div
          className="flex justify-center gap-3 mb-8"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
        >
          {[
            { label: "Total Duration", value: totalTime, icon: <TrendingUp className="w-4 h-4" /> },
            { label: "Value Pillars", value: String(strategyPillars.length), icon: <Target className="w-4 h-4" /> },
            { label: "Corrections", value: String(beforeAfter.length), icon: <Zap className="w-4 h-4" /> },
          ].map((stat, i) => (
            <div key={i} className="bg-white border border-[#e2e8f0] rounded-2xl p-5 text-center flex-1 max-w-[200px]">
              <div className="w-8 h-8 rounded-lg bg-[#f0f4f8] flex items-center justify-center mx-auto mb-2 text-[#45556c]">
                {stat.icon}
              </div>
              <p className="text-2xl text-[#0f172b] mb-1" style={{ fontWeight: 600 }}>{stat.value}</p>
              <p className="text-xs text-[#45556c]">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* ═══════════════════════════════════════════════
           SECCIÓN 1: Tu Estrategia
           ═══════════════════════════════════════════════ */}
        {(strategyPillars.length > 0 || Object.values(guidedFields).some(v => v?.trim())) && (
          <ReportSection
            number={1}
            icon={<ClipboardList className="w-5 h-5 text-white" />}
            title="Your Strategy"
            delay={0.1}
          >
            {/* Guided fields (context from setup) */}
            {fieldLabels.length > 0 && Object.values(guidedFields).some(v => v?.trim()) && (
              <div className="mb-6 bg-[#f8fafc] rounded-xl border border-[#e2e8f0] p-5">
                <p className="text-[10px] uppercase tracking-wider text-[#94a3b8] mb-3" style={{ fontWeight: 600 }}>
                  Initial Context
                </p>
                <div className="space-y-3">
                  {fieldLabels.map(({ key, label }) => {
                    const value = guidedFields[key];
                    if (!value?.trim()) return null;
                    return (
                      <div key={key}>
                        <p className="text-xs text-[#62748e] mb-0.5">{label}</p>
                        <p className="text-sm text-[#0f172b]" style={{ fontWeight: 500 }}>
                          {value}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Strategy pillars */}
            {strategyPillars.length > 0 && (
              <div className="space-y-4">
                {strategyPillars.map((pillar, idx) => (
                  <div
                    key={idx}
                    className="bg-gradient-to-r from-[#f0f9ff] to-[#eef2ff] rounded-xl border border-[#bfdbfe]/40 p-5"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <span
                        className="w-6 h-6 rounded-lg bg-[#6366f1]/10 flex items-center justify-center shrink-0 text-[10px] text-[#6366f1]"
                        style={{ fontWeight: 700 }}
                      >
                        {idx + 1}
                      </span>
                      <p className="text-sm text-[#0f172b]" style={{ fontWeight: 600 }}>
                        {pillar.summary}
                      </p>
                    </div>
                    <div className="ml-9 space-y-2">
                      <div className="flex items-start gap-2">
                        <span className="text-[10px] bg-[#dbeafe] text-[#1e40af] px-2 py-0.5 rounded-md shrink-0" style={{ fontWeight: 600 }}>
                          Why
                        </span>
                        <p className="text-sm text-[#45556c]">{pillar.why}</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-[10px] bg-[#dcfce7] text-[#16a34a] px-2 py-0.5 rounded-md shrink-0" style={{ fontWeight: 600 }}>
                          How
                        </span>
                        <p className="text-sm text-[#45556c]">{pillar.how}</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-[10px] bg-[#fef3c7] text-[#92400e] px-2 py-0.5 rounded-md shrink-0" style={{ fontWeight: 600 }}>
                          Result
                        </span>
                        <p className="text-sm text-[#45556c]">{pillar.result}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ReportSection>
        )}

        {/* ═══════════════════════════════════════════════
           SECCIÓN 2: Tu Guión
           ═══════════════════════════════════════════════ */}
        {scriptSections.length > 0 && (
          <ReportSection
            number={2}
            icon={<FileText className="w-5 h-5 text-white" />}
            title="Your Script"
            delay={0.15}
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
           SECCIÓN 3: Inteligencia Cultural
           ═══════════════════════════════════════════════ */}
        {culturalTips.length > 0 && (
          <ReportSection
            number={3}
            icon={<Globe className="w-5 h-5 text-white" />}
            title="Cultural Intelligence"
            delay={0.2}
          >
            <div className="flex items-center gap-2 mb-5">
              <span
                className="text-[10px] bg-[#50C878]/15 text-[#16a34a] px-2.5 py-0.5 rounded-full"
                style={{ fontWeight: 600 }}
              >
                LATAM → US
              </span>
              <p className="text-xs text-[#62748e]">Cultural adaptations for your communication</p>
            </div>
            <div className="space-y-3">
              {culturalTips.filter(t => t.type === "do").map((tip, i) => (
                <div key={`do-${i}`} className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl px-5 py-4 flex items-start gap-3">
                  <span className="text-[10px] bg-[#16a34a]/15 text-[#16a34a] rounded-full px-2 py-0.5 shrink-0 mt-0.5" style={{ fontWeight: 600 }}>
                    DO
                  </span>
                  <div>
                    <p className="text-sm text-[#0f172b]" style={{ fontWeight: 500 }}>{tip.title}</p>
                    <p className="text-xs text-[#45556c] mt-0.5">{tip.description}</p>
                  </div>
                </div>
              ))}
              {culturalTips.filter(t => t.type === "avoid").map((tip, i) => (
                <div key={`avoid-${i}`} className="bg-[#fef2f2] border border-[#fecaca] rounded-xl px-5 py-4 flex items-start gap-3">
                  <span className="text-[10px] bg-red-500/15 text-red-600 rounded-full px-2 py-0.5 shrink-0 mt-0.5" style={{ fontWeight: 600 }}>
                    AVOID
                  </span>
                  <div>
                    <p className="text-sm text-[#0f172b]" style={{ fontWeight: 500 }}>{tip.title}</p>
                    <p className="text-xs text-[#45556c] mt-0.5">{tip.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </ReportSection>
        )}

        {/* ═══════════════════════════════════════════════
           SECCIÓN 4: Análisis de tu Práctica
           ═══════════════════════════════════════════════ */}
        <ReportSection
          number={4}
          icon={<Target className="w-5 h-5 text-white" />}
          title="Practice Analysis"
          delay={0.25}
          dark
        >
          {/* Strengths */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-4 h-4 text-[#50C878]" />
              <p className="text-sm text-white/70" style={{ fontWeight: 500 }}>What worked well</p>
            </div>
            <div className="space-y-2">
              {strengths.slice(0, 3).map((s, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#50C878]/20 text-[#50C878] flex items-center justify-center shrink-0 text-[10px]" style={{ fontWeight: 600 }}>
                    ✓
                  </span>
                  <div>
                    <p className="text-white text-sm" style={{ fontWeight: 500 }}>{s.title}</p>
                    <p className="text-white/40 text-xs mt-0.5">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Grammar corrections */}
          {beforeAfter.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4 text-[#fbbf24]" />
                <p className="text-sm text-white/70" style={{ fontWeight: 500 }}>Key corrections</p>
              </div>
              <div className="space-y-2">
                {beforeAfter.slice(0, 3).map((ba, i) => (
                  <div key={i} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                    <div className="flex items-start gap-2 mb-2">
                      <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded-md" style={{ fontWeight: 500 }}>Before</span>
                      <p className="text-sm text-white/50 line-through">{ba.userOriginal}</p>
                    </div>
                    <div className="flex items-start gap-2 mb-2">
                      <span className="text-[10px] bg-[#50C878]/20 text-[#50C878] px-2 py-0.5 rounded-md" style={{ fontWeight: 500 }}>After</span>
                      <p className="text-sm text-white" style={{ fontWeight: 500 }}>{ba.professionalVersion}</p>
                    </div>
                    <div className="flex items-center gap-1.5 ml-1">
                      <Lightbulb className="w-3 h-3 text-[#fbbf24]" />
                      <span className="text-[10px] text-[#fbbf24]/80" style={{ fontWeight: 500 }}>{ba.technique}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pronunciation */}
          {resultsSummary?.improvementAreas && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <AudioLines className="w-4 h-4 text-[#60a5fa]" />
                <p className="text-sm text-white/70" style={{ fontWeight: 500 }}>Pronunciation</p>
              </div>
              {resultsSummary.overallSentiment && (
                <p className="text-xs text-white/50 mb-3">{resultsSummary.overallSentiment}</p>
              )}
              <div className="flex flex-wrap gap-2">
                {resultsSummary.improvementAreas.map((area) => {
                  const colorMap: Record<string, { bg: string; text: string }> = {
                    "Clarity": { bg: "rgba(251,191,36,0.15)", text: "#fbbf24" },
                    "Rhythm": { bg: "rgba(96,165,250,0.15)", text: "#60a5fa" },
                    "Intonation": { bg: "rgba(168,85,247,0.15)", text: "#a855f7" },
                  };
                  const c = colorMap[area.category] ?? { bg: "rgba(255,255,255,0.1)", text: "#94a3b8" };
                  return (
                    <div
                      key={area.category}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl"
                      style={{ backgroundColor: c.bg }}
                    >
                      <span className="text-[10px]" style={{ fontWeight: 600, color: c.text }}>{area.category}</span>
                      <span className="text-[10px]" style={{ color: c.text, opacity: 0.7 }}>{area.description}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Power Phrases */}
          <CollapsibleDarkSection
            icon={<Sparkles className="w-4 h-4 text-[#fbbf24]" />}
            label="Power Phrases"
            defaultOpen
          >
            <div className="space-y-2">
              {scenarioPhrases.slice(0, 4).map((p, i) => (
                <motion.div
                  key={p.id}
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-3"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.05 }}
                >
                  <p className="text-white text-sm" style={{ fontWeight: 500 }}>"{p.phrase}"</p>
                  <p className="text-white/40 text-xs mt-1">{p.context}</p>
                </motion.div>
              ))}
              {scenarioPhrases.length > 4 && (
                <p className="text-xs text-white/30 text-center mt-2">
                  +{scenarioPhrases.length - 4} more available in your next session
                </p>
              )}
            </div>
          </CollapsibleDarkSection>

          {/* Power Questions */}
          <CollapsibleDarkSection
            icon={<Target className="w-4 h-4 text-[#818cf8]" />}
            label="Power Questions"
          >
            <div className="space-y-2">
              {powerQuestions.slice(0, 3).map((q, i) => (
                <motion.div
                  key={i}
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-3"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 + i * 0.05 }}
                >
                  <p className="text-white text-sm" style={{ fontWeight: 500 }}>"{q.question}"</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] bg-[#6366f1]/30 text-[#a5b4fc] px-2 py-0.5 rounded-full">{q.timing}</span>
                  </div>
                </motion.div>
              ))}
              {powerQuestions.length > 3 && (
                <p className="text-xs text-white/30 text-center mt-2">
                  +{powerQuestions.length - 3} more available in your next session
                </p>
              )}
            </div>
          </CollapsibleDarkSection>
        </ReportSection>

        {/* ═══════════════════════════════════════════════
           SECCIÓN 5: Próximos Pasos
           ═══════════════════════════════════════════════ */}
        <ReportSection
          number={5}
          icon={<Lightbulb className="w-5 h-5 text-white" />}
          title="Next Steps"
          delay={0.3}
        >
          <div className="space-y-4">
            {[
              {
                emoji: "🎯",
                title: "Practice the corrections",
                desc: "Read the corrected phrases out loud until they flow naturally.",
              },
              {
                emoji: "📖",
                title: "Review your script before the meeting",
                desc: "Read your script 15 minutes before the real conversation to activate your memory.",
              },
              {
                emoji: "🔄",
                title: "Schedule a new practice",
                desc: "Practice the same scenario in 2-3 days to consolidate your progress.",
              },
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-3 bg-[#f8fafc] rounded-xl border border-[#e2e8f0] p-4">
                <span className="text-xl">{step.emoji}</span>
                <div>
                  <p className="text-sm text-[#0f172b]" style={{ fontWeight: 500 }}>{step.title}</p>
                  <p className="text-xs text-[#45556c] mt-0.5">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </ReportSection>

        {/* ── Motivational banner ── */}
        <motion.div
          className="rounded-3xl bg-gradient-to-br from-[#0f172b] to-[#1e293b] p-8 text-center mb-10"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.35 }}
        >
          <div className="text-4xl mb-4">🚀</div>
          <h2 className="text-white text-2xl mb-3" style={{ fontWeight: 500 }}>
            Good luck with your {scenarioLabel}!
          </h2>
          <p className="text-white/70 max-w-md mx-auto">
            You have the tools, the phrases, and the practice. Now go out and show what you can do.
          </p>
        </motion.div>

        {/* ── Finish CTA ── */}
        {onFinish && (
          <motion.div
            className="flex flex-col items-center gap-3"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <button
              onClick={onFinish}
              className="bg-[#0f172b] text-white px-10 py-4 rounded-full flex items-center gap-3 shadow-lg hover:bg-[#1d293d] transition-colors text-lg"
              style={{ fontWeight: 500 }}
            >
              <Check className="w-5 h-5" />
              {finishLabel}
            </button>
          </motion.div>
        )}
      </main>

      {!embedded && <MiniFooter />}
    </div>
  );
}