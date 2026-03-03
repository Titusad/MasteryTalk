import { useState, useEffect, useRef } from "react";
import {
  Target,
  ArrowLeft,
  Sparkles,
  Check,
  Loader2,
  MessageSquare,
  Info,
  ArrowRight,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { PastelBlobs, MiniFooter, PageTitleBlock } from "./shared";
import type { ScenarioType } from "../../services/types";

/* ─── Types ─── */

export interface ValuePillar {
  summary: string;
  why: string;
  how: string;
  result: string;
}

interface StrategyBuilderProps {
  scenarioType: ScenarioType;
  guidedFields: Record<string, string>;
  onComplete: (result: { pillars: ValuePillar[] }) => void;
  onBack?: () => void;
}

/* ─── Scenario noun in Spanish (for subtitle) ─── */
const SCENARIO_NOUN_EN: Record<string, string> = {
  interview: "interview",
  sales: "sales pitch",
  csuite: "executive presentation",
  negotiation: "negotiation",
  networking: "networking conversation",
};

/* ─── Framework Tooltips ─── */
const FRAMEWORK_TOOLTIPS: Record<string, string> = {
  STAR: "Situation, Task, Action, Result \u2014 un framework para estructurar respuestas de entrevista con ejemplos concretos y medibles.",
  BATNA: "Best Alternative To a Negotiated Agreement \u2014 tu mejor opci\u00f3n si la negociaci\u00f3n no llega a un acuerdo. Define tu poder de negociaci\u00f3n.",
  SPIN: "Situation, Problem, Implication, Need-payoff \u2014 framework de ventas consultivas para descubrir necesidades del cliente.",
  MEDDIC: "Metrics, Economic Buyer, Decision Criteria, Decision Process, Identify Pain, Champion \u2014 framework de calificaci\u00f3n de oportunidades B2B.",
};

/* ─── Coach Questions per Scenario ─── */
interface CoachQuestion {
  prompt: string;
  followUp: string;
}

const COACH_QUESTIONS: Record<string, CoachQuestion[]> = {
  interview: [
    {
      prompt:
        "Think about the strongest accomplishment you can share using the STAR framework. What\u2019s a specific result you\u2019re most proud of that\u2019s relevant to this role?",
      followUp:
        "Great! Now quantify that impact. What metrics, percentages, or before/after numbers can you cite to make this tangible for the interviewer?",
    },
    {
      prompt:
        "What unique skill or experience do you bring that most candidates won\u2019t? Think about the intersection of your background that makes you stand out.",
      followUp:
        "How does that unique differentiator directly solve a pain point the company is facing right now?",
    },
    {
      prompt:
        "Why this specific company and role? What\u2019s the genuine connection between their mission and your career trajectory?",
      followUp:
        "How would you articulate that connection in 30 seconds, making it feel authentic rather than rehearsed?",
    },
  ],
  sales: [
    {
      prompt:
        "What\u2019s the single biggest pain point your prospect faces that your solution directly addresses? Use the SPIN framework to think through this.",
      followUp:
        "What\u2019s the cost of inaction? How much is this problem costing them per quarter in revenue, time, or resources?",
    },
    {
      prompt:
        "What proof points or case studies can you share? Think of a client with a similar profile and the results they achieved.",
      followUp:
        "How can you frame those results in terms that resonate with your prospect\u2019s specific KPIs?",
    },
    {
      prompt:
        "What are the top 2 objections you expect, and how will you reframe them as opportunities?",
      followUp:
        "If they say \u2018we\u2019re happy with our current solution,\u2019 what\u2019s your MEDDIC-aligned response to uncover hidden dissatisfaction?",
    },
  ],
  /* Non-MVP scenarios — kept as stubs for type safety */
  csuite: [],
  negotiation: [],
  networking: [],
};

/* ─── Mock Pillar Generator ─── */
function generateMockPillar(
  _scenarioType: ScenarioType,
  pillarIndex: number,
  userAnswer: string
): ValuePillar {
  const summaries = [
    "Lead with quantified impact from past achievements",
    "Differentiate through unique cross-functional expertise",
    "Align your ask with their strategic priorities",
  ];
  const whys = [
    "Concrete numbers build instant credibility",
    "Uniqueness creates a memorable positioning",
    "Alignment shows strategic thinking and preparation",
  ];
  const hows = [
    "Use the STAR framework with specific metrics",
    "Connect your unique background to their pain points",
    "Reference their public goals and map your contribution",
  ];
  const results = [
    "Interviewer sees you as a proven performer",
    "You stand out from equally qualified candidates",
    "Decision-maker feels confident in your strategic fit",
  ];

  return {
    summary: summaries[pillarIndex] || userAnswer.slice(0, 60),
    why: whys[pillarIndex] || "Builds credibility",
    how: hows[pillarIndex] || "Through structured communication",
    result: results[pillarIndex] || "Stronger executive presence",
  };
}

/* ─── Helper: Render text with framework tooltips ─── */
function renderWithFrameworkTooltips(text: string) {
  const frameworkKeys = Object.keys(FRAMEWORK_TOOLTIPS);
  const regex = new RegExp(`\\b(${frameworkKeys.join("|")})\\b`, "g");
  const parts: (string | { keyword: string })[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    parts.push({ keyword: match[1] });
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  // No frameworks found — return plain text
  if (parts.length <= 1 && typeof parts[0] === "string") {
    return text;
  }
  return parts.map((part, idx) => {
    if (typeof part === "string") {
      return <span key={idx}>{part}</span>;
    }
    const tooltip = FRAMEWORK_TOOLTIPS[part.keyword];
    return (
      <span key={idx} className="relative inline-flex items-baseline group/fw">
        <span
          className="underline decoration-dotted decoration-[#62748e] underline-offset-2 cursor-help"
          style={{ fontWeight: 600 }}
        >
          {part.keyword}
        </span>
        <span className="inline-flex items-center ml-0.5 cursor-help">
          <Info className="w-3.5 h-3.5 text-[#1e40af] group-hover/fw:text-[#0f172b] transition-colors" />
        </span>
        {/* Tooltip */}
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 px-3.5 py-2.5 bg-[#0f172b] text-white text-xs leading-relaxed rounded-xl shadow-lg opacity-0 invisible group-hover/fw:opacity-100 group-hover/fw:visible transition-all duration-200 pointer-events-none z-50">
          <span className="block" style={{ fontWeight: 600 }}>
            {part.keyword}
          </span>
          {tooltip}
          {/* Arrow */}
          <span className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-[#0f172b]" />
        </span>
      </span>
    );
  });
}

/* ═══════════════════════════════════════════════════════════
   STRATEGY BUILDER COMPONENT
   ═══════════════════════════════════════════════════════════ */

export function StrategyBuilder({
  scenarioType,
  guidedFields,
  onComplete,
  onBack,
}: StrategyBuilderProps) {
  const totalPillars = 2;
  const [currentPillar, setCurrentPillar] = useState(0);
  const [phase, setPhase] = useState<"initial" | "followup">("initial");
  const [pillars, setPillars] = useState<(ValuePillar | null)[]>([null, null]);
  const [userInput, setUserInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isAllComplete = pillars.every((p) => p !== null);
  const questions = COACH_QUESTIONS[scenarioType] ?? COACH_QUESTIONS.interview;

  /* Step hints for stepper (per scenario) */
  const STEP_HINTS: Record<string, [string, string]> = {
    interview: ["Your Differentiator", "Your Evidence"],
    sales: ["Your Solution", "Your Case Study"],
  };
  const stepHints = STEP_HINTS[scenarioType] ?? STEP_HINTS.interview;

  /* Handle back navigation */
  const handleBack = () => {
    if (isGenerating) return;
    setUserInput("");

    if (phase === "followup") {
      // From followup → go back to initial phase of same pillar
      setPhase("initial");
      return;
    }

    // phase === "initial"
    if (currentPillar > 0) {
      // Go back to previous pillar — reset it so user can redo
      const prevIdx = currentPillar - 1;
      const newPillars = [...pillars];
      newPillars[prevIdx] = null;
      setPillars(newPillars);
      setCurrentPillar(prevIdx);
      setPhase("initial");
    }
  };

  /* Can we go back? */
  const canGoBack = phase === "followup" || currentPillar > 0;

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [currentPillar, phase]);

  /* Handle user submission */
  const handleSubmit = () => {
    if (!userInput.trim() || isGenerating) return;

    if (phase === "initial") {
      // Move to follow-up
      setPhase("followup");
      setUserInput("");
      return;
    }

    // Generate pillar from response
    setIsGenerating(true);
    setTimeout(() => {
      const pillar = generateMockPillar(scenarioType, currentPillar, userInput);
      const newPillars = [...pillars];
      newPillars[currentPillar] = pillar;
      setPillars(newPillars);
      setIsGenerating(false);
      setUserInput("");

      // Move to next pillar or auto-complete
      if (currentPillar < totalPillars - 1) {
        setCurrentPillar(currentPillar + 1);
        setPhase("initial");
      } else {
        // Last pillar done → go straight to next step
        const completed = newPillars.filter((p): p is ValuePillar => p !== null);
        onComplete({ pillars: completed });
      }
    }, 1200);
  };

  /* Handle key press */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div
      className="w-full min-h-full flex flex-col bg-[#f0f4f8] relative overflow-hidden"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <PastelBlobs />

      <main className="relative w-full max-w-[800px] mx-auto px-6 pt-12 pb-20">
        {/* Title — uses shared PageTitleBlock */}
        <PageTitleBlock
          icon={<Target className="w-8 h-8 text-white" />}
          title="Prepare Your Strategy"
          subtitle={`2 key arguments to make your ${SCENARIO_NOUN_EN[scenarioType]} strategic, not improvised.`}
        />

        {/* ── Stepper Indicator ── */}
        <motion.div
          className="bg-white rounded-3xl border border-[#e2e8f0] p-6 md:p-8 mb-8"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
        >
          {(() => {
            /* Build 4 visual steps from 2 pillars × 2 phases */
            const visualSteps = [
              { label: "Pillar 1", hint: stepHints[0] },
              { label: "Deepen", hint: "Add evidence" },
              { label: "Pillar 2", hint: stepHints[1] },
              { label: "Deepen", hint: "Add evidence" },
            ];
            const activeIdx = isAllComplete
              ? visualSteps.length
              : currentPillar * 2 + (phase === "followup" ? 1 : 0);

            return (
              <div className="flex items-start gap-0">
                {visualSteps.map((step, i) => {
                  const isCompleted = i < activeIdx;
                  const isActive = i === activeIdx;

                  return (
                    <div key={i} className="flex items-start flex-1">
                      {/* Step node + content */}
                      <div className="flex flex-col items-center flex-1">
                        {/* Circle indicator */}
                        <motion.div
                          className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all ${
                            isCompleted
                              ? "bg-[#0f172b]"
                              : isActive
                              ? "bg-white border-[3px] border-[#0f172b] shadow-sm"
                              : "bg-[#f1f5f9] border-2 border-[#e2e8f0]"
                          }`}
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.3, delay: i * 0.06 }}
                        >
                          {isCompleted ? (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring", stiffness: 400, damping: 25 }}
                            >
                              <Check className="w-4 h-4 text-white" />
                            </motion.div>
                          ) : isActive ? (
                            <span className="w-2.5 h-2.5 rounded-full bg-[#0f172b] animate-pulse" />
                          ) : (
                            <span
                              className="text-xs text-[#cad5e2]"
                              style={{ fontWeight: 600 }}
                            >
                              {i + 1}
                            </span>
                          )}
                        </motion.div>

                        {/* Label + hint text */}
                        <motion.div
                          className="mt-3 text-center px-1"
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: i * 0.06 + 0.1 }}
                        >
                          <p
                            className={`text-xs uppercase tracking-wide mb-1 ${
                              isCompleted || isActive
                                ? "text-[#0f172b]"
                                : "text-[#62748e]"
                            }`}
                            style={{ fontWeight: 600 }}
                          >
                            {step.label}
                          </p>
                          <p
                            className={`text-[13px] leading-snug whitespace-nowrap ${
                              isCompleted
                                ? "text-[#45556c]"
                                : isActive
                                ? "text-[#62748e]"
                                : "text-[#cad5e2]"
                            }`}
                          >
                            {step.hint}
                          </p>
                        </motion.div>
                      </div>

                      {/* Connector line */}
                      {i < visualSteps.length - 1 && (
                        <div
                          className="flex items-center h-9 flex-shrink-0"
                          style={{ width: "32px" }}
                        >
                          <div
                            className={`h-[2px] w-full rounded-full transition-colors duration-300 ${
                              isCompleted ? "bg-[#0f172b]" : "bg-[#e2e8f0]"
                            }`}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </motion.div>

        {/* ── Coach Conversation Area ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key="coach"
            className="bg-white rounded-3xl border border-[#e2e8f0] overflow-visible mb-8"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            {/* Coach question */}
            <div className="p-6 md:p-8 border-b border-[#f1f5f9]">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0f172b] to-[#334155] flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="text-xs text-[#62748e] mb-2 uppercase tracking-wide"
                    style={{ fontWeight: 600 }}
                  >
                    AI Coach — Pillar {currentPillar + 1},{" "}
                    {phase === "initial" ? "Exploration" : "Deep Dive"}
                  </p>
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={`q-${currentPillar}-${phase}`}
                      className="text-[#314158] leading-relaxed"
                      style={{ fontSize: "15px" }}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35 }}
                    >
                      {renderWithFrameworkTooltips(
                        phase === "followup"
                          ? questions[currentPillar]?.followUp ?? ""
                          : questions[currentPillar]?.prompt ?? ""
                      )}
                    </motion.p>
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* User input */}
            <div className="p-6 md:p-8">
              <div className="relative">
                <textarea
                  ref={textareaRef}
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your response..."
                  rows={3}
                  className="relative z-10 w-full px-4 py-3 pb-14 border-2 border-[#e2e8f0] rounded-xl text-sm text-[#0f172b] placeholder:text-[#b0bec5] resize-none focus:outline-none focus:border-[#0f172b] transition-all bg-[#f8fafc]"
                />
                <div className="absolute bottom-3 right-3 z-20 flex items-center gap-2">
                  {isGenerating ? (
                    <span className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm bg-[#e2e8f0] text-[#62748e]" style={{ fontWeight: 500 }}>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Analyzing...
                    </span>
                  ) : (
                    <button
                      onClick={handleSubmit}
                      disabled={!userInput.trim()}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm transition-all ${
                        userInput.trim()
                          ? "bg-[#0f172b] text-white hover:bg-[#1e293b] shadow-sm"
                          : "bg-[#e2e8f0] text-[#62748e] cursor-not-allowed"
                      }`}
                      style={{ fontWeight: 500 }}
                    >
                      {phase === "initial" ? "Continue" : "Build Pillar"}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* ── Back Button ── */}
        {canGoBack && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.15 }}
          >
            <button
              onClick={handleBack}
              disabled={isGenerating}
              className="w-full py-2.5 text-sm text-[#62748e] hover:text-[#0f172b] flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ fontWeight: 500 }}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back
            </button>
          </motion.div>
        )}

      </main>

      <MiniFooter />
    </div>
  );
}