import { SUPABASE_URL } from "@/services/supabase";
/**
 * ══════════════════════════════════════════════════════════════
 *  inFluentia PRO — Skill Drill Screen (v8.0)
 *
 *  Post-session remedial evaluation. Evaluates the user's ability
 *  to correct their weakest pillar from the conversation feedback.
 *
 *  - Selects lowest-scoring pillar automatically
 *  - Dual modality: text (Vocab/Grammar/Tone/Persuasion) or voice (Fluency/Pronunciation)
 *  - Max 2 attempts, model phrase revealed after final attempt
 *  - Calls /evaluate-drill Edge Function for AI scoring
 * ══════════════════════════════════════════════════════════════
 */

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  PenLine,
  Mic,
  Send,
  RotateCcw,
  Sparkles,
  Target,
  ArrowRight,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { getAuthToken } from "@/services/supabase";
import { projectId } from "@/../utils/supabase/info";

/* ── Types ── */
type PillarName =
  | "Vocabulary"
  | "Grammar"
  | "Fluency"
  | "Pronunciation"
  | "Professional Tone"
  | "Persuasion";

interface DrillEvaluation {
  score: number;
  passed: boolean;
  badge: "strong" | "close" | "needs-work";
  oneLiner: string;
  modelPhrase: string;
  narrative: string;
  scoreBreakdown: Record<string, number>;
  attemptNumber: 1 | 2;
  pillar: string;
}

export interface SkillDrillScreenProps {
  /** Pillar scores from conversation feedback */
  pillarScores: Record<string, number> | null;
  /** Pronunciation score from Azure */
  pronunciationScore?: number;
  /** The original weak response from the session */
  beforeAfter?: Array<{
    originalPhrase: string;
    professionalVersion: string;
    pillar?: string;
  }>;
  scenarioType?: string;
  interlocutor?: string;
  /** Called when drill is complete — signals to advance to cp-unlock or session-recap */
  onComplete: (result: {
    pillar: PillarName;
    finalScore: number;
    passed: boolean;
    attempts: 1 | 2;
    srCardCreated: boolean;
  }) => void;
  /** Skip drill (e.g., all pillars are strong) */
  onSkip: () => void;
}

/* ── Pillar selection logic ── */
const VOICE_PILLARS: PillarName[] = ["Fluency", "Pronunciation"];
const WEIGHTED_PILLARS: PillarName[] = ["Professional Tone", "Persuasion"];

function selectDrillPillar(
  pillarScores: Record<string, number>,
  pronunciationScore: number
): PillarName | null {
  const scores = { ...pillarScores, Pronunciation: pronunciationScore };

  const drillable = Object.entries(scores)
    .filter(([, score]) => score < 78)
    .sort(([nameA, scoreA], [nameB, scoreB]) => {
      const weightA = WEIGHTED_PILLARS.includes(nameA as PillarName) ? 1.3 : 1;
      const weightB = WEIGHTED_PILLARS.includes(nameB as PillarName) ? 1.3 : 1;
      return scoreA * weightA - scoreB * weightB;
    });

  if (drillable.length === 0) return null;
  return drillable[0][0] as PillarName;
}

/* ── Badge styling ── */
const BADGE_CONFIG = {
  strong: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20", label: "Strong" },
  close: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20", label: "Close" },
  "needs-work": { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/20", label: "Needs Work" },
};

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════ */
export function SkillDrillScreen({
  pillarScores,
  pronunciationScore = 0,
  beforeAfter,
  scenarioType = "interview",
  interlocutor = "AI Interviewer",
  onComplete,
  onSkip,
}: SkillDrillScreenProps) {
  /* ── Select pillar ── */
  const pillar = pillarScores
    ? selectDrillPillar(pillarScores, pronunciationScore)
    : null;

  /* If all pillars are strong, skip immediately */
  if (!pillar) {
    // Effect-free: call onSkip on next tick to avoid setState-in-render
    setTimeout(onSkip, 0);
    return null;
  }

  const isVoice = VOICE_PILLARS.includes(pillar);

  /* Find the relevant beforeAfter item for this pillar */
  const relevantBA = beforeAfter?.find(
    (ba) => ba.pillar === pillar || !ba.pillar
  );
  const userOriginal = relevantBA?.originalPhrase || "";
  const analystModelPhrase = relevantBA?.professionalVersion || "";

  return (
    <SkillDrillCore
      pillar={pillar}
      isVoice={isVoice}
      userOriginal={userOriginal}
      analystModelPhrase={analystModelPhrase}
      scenarioType={scenarioType}
      interlocutor={interlocutor}
      onComplete={onComplete}
    />
  );
}

/* ═══════════════════════════════════════════════════════════
   DRILL CORE — handles attempt logic, API calls, and UI
   ═══════════════════════════════════════════════════════════ */
function SkillDrillCore({
  pillar,
  isVoice,
  userOriginal,
  analystModelPhrase,
  scenarioType,
  interlocutor,
  onComplete,
}: {
  pillar: PillarName;
  isVoice: boolean;
  userOriginal: string;
  analystModelPhrase: string;
  scenarioType: string;
  interlocutor: string;
  onComplete: SkillDrillScreenProps["onComplete"];
}) {
  const [attempt, setAttempt] = useState<1 | 2>(1);
  const [userResponse, setUserResponse] = useState("");
  const [evaluation, setEvaluation] = useState<DrillEvaluation | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModelPhrase, setShowModelPhrase] = useState(false);

  const canRetry = attempt === 1 && evaluation && !evaluation.passed;
  const isFinalResult = attempt === 2 || (evaluation?.passed ?? false);

  /* ── Submit drill response ── */
  const handleSubmit = useCallback(async () => {
    if (!userResponse.trim()) return;
    setIsEvaluating(true);
    setError(null);

    try {
      const token = await getAuthToken();
      const res = await fetch(
        `${SUPABASE_URL}/functions/v1/evaluate-drill`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            pillar,
            scenarioType,
            interlocutorRole: interlocutor,
            situationContext: `${scenarioType} practice session`,
            userOriginal,
            userDrillResponse: userResponse,
            analystModelPhrase,
            attemptNumber: attempt,
            lang: "es",
          }),
        }
      );

      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const result: DrillEvaluation = await res.json();
      setEvaluation(result);

      // Show model phrase on final attempt or if passed
      if (attempt === 2 || result.passed) {
        setShowModelPhrase(true);
      }
    } catch (err: any) {
      setError(err.message || "Evaluation failed");
    } finally {
      setIsEvaluating(false);
    }
  }, [userResponse, pillar, scenarioType, interlocutor, userOriginal, analystModelPhrase, attempt]);

  /* ── Retry logic ── */
  const handleRetry = useCallback(() => {
    setAttempt(2);
    setUserResponse("");
    setEvaluation(null);
    setShowModelPhrase(false);
  }, []);

  /* ── Complete drill ── */
  const handleFinish = useCallback(() => {
    onComplete({
      pillar,
      finalScore: evaluation?.score ?? 0,
      passed: evaluation?.passed ?? false,
      attempts: attempt,
      srCardCreated: (evaluation?.score ?? 0) < 45,
    });
  }, [pillar, evaluation, attempt, onComplete]);

  return (
    <div className="w-full min-h-[calc(100dvh-4rem)] bg-[#0f172b] flex flex-col items-center px-4 py-8">
      {/* Header */}
      <motion.div
        className="w-full max-w-xl text-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1e293b] border border-[#334155] mb-4">
          <Target className="w-4 h-4 text-[#6366f1]" />
          <span className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">
            Skill Drill · {pillar}
          </span>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Time to level up
        </h2>
        <p className="text-sm text-[#94a3b8] max-w-md mx-auto">
          Your <span className="text-[#6366f1] font-medium">{pillar}</span> needs attention. 
          Rewrite the phrase below using what you learned. 
          Attempt {attempt} of 2.
        </p>
      </motion.div>

      <div className="w-full max-w-xl space-y-5">
        {/* Original weak response */}
        <motion.div
          className="bg-[#1e293b]/60 border border-[#334155] rounded-2xl p-5"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-[10px] uppercase tracking-wider text-[#f87171] font-semibold mb-2">
            Your original response
          </p>
          <p className="text-sm text-[#cbd5e1] italic leading-relaxed">
            "{userOriginal || "No specific phrase captured"}"
          </p>
        </motion.div>

        {/* Input area */}
        <motion.div
          className="bg-[#1e293b]/40 border border-[#334155] rounded-2xl p-5"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-2 mb-3">
            {isVoice ? (
              <Mic className="w-4 h-4 text-[#6366f1]" />
            ) : (
              <PenLine className="w-4 h-4 text-[#6366f1]" />
            )}
            <p className="text-xs uppercase tracking-wider text-[#6366f1] font-semibold">
              {isVoice ? "Say it better" : "Write it better"}
            </p>
          </div>

          {/* Text input (for text-based pillars) */}
          {!isVoice && (
            <textarea
              value={userResponse}
              onChange={(e) => setUserResponse(e.target.value)}
              placeholder="Type your improved response here..."
              className="w-full bg-[#0f172b] border border-[#334155] rounded-xl px-4 py-3 text-sm text-white placeholder-[#475569] resize-none focus:outline-none focus:border-[#6366f1] transition-colors"
              rows={4}
              disabled={isEvaluating || isFinalResult}
            />
          )}

          {/* Voice placeholder (Fluency/Pronunciation — future implementation) */}
          {isVoice && (
            <div className="flex flex-col items-center gap-3 py-6">
              <div className="w-16 h-16 rounded-full bg-[#6366f1]/20 border-2 border-[#6366f1] flex items-center justify-center">
                <Mic className="w-7 h-7 text-[#6366f1]" />
              </div>
              <p className="text-xs text-[#64748b]">Voice recording coming soon</p>
              {/* Temporary fallback to text */}
              <textarea
                value={userResponse}
                onChange={(e) => setUserResponse(e.target.value)}
                placeholder="For now, type your response..."
                className="w-full bg-[#0f172b] border border-[#334155] rounded-xl px-4 py-3 text-sm text-white placeholder-[#475569] resize-none focus:outline-none focus:border-[#6366f1] transition-colors"
                rows={3}
                disabled={isEvaluating || isFinalResult}
              />
            </div>
          )}

          {/* Submit / Retry buttons */}
          {!evaluation && (
            <button
              onClick={handleSubmit}
              disabled={!userResponse.trim() || isEvaluating}
              className="mt-3 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#6366f1] text-white text-sm font-semibold hover:bg-[#4f46e5] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              {isEvaluating ? (
                <>
                  <motion.div
                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  Evaluating...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Submit Response
                </>
              )}
            </button>
          )}
        </motion.div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        {/* Evaluation result */}
        <AnimatePresence>
          {evaluation && (
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Score badge */}
              <div className={`flex items-center justify-between p-5 rounded-2xl border ${BADGE_CONFIG[evaluation.badge].bg} ${BADGE_CONFIG[evaluation.badge].border}`}>
                <div className="flex items-center gap-3">
                  {evaluation.passed ? (
                    <CheckCircle2 className={`w-6 h-6 ${BADGE_CONFIG[evaluation.badge].text}`} />
                  ) : (
                    <XCircle className={`w-6 h-6 ${BADGE_CONFIG[evaluation.badge].text}`} />
                  )}
                  <div>
                    <p className={`text-lg font-bold ${BADGE_CONFIG[evaluation.badge].text}`}>
                      {evaluation.score}/100
                    </p>
                    <p className="text-xs text-[#94a3b8]">
                      {BADGE_CONFIG[evaluation.badge].label}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-[#cbd5e1] italic max-w-[200px] text-right">
                  {evaluation.oneLiner}
                </p>
              </div>

              {/* Narrative */}
              <div className="bg-[#1e293b]/40 border border-[#334155] rounded-2xl p-4">
                <p className="text-sm text-[#94a3b8] leading-relaxed">
                  {evaluation.narrative}
                </p>
              </div>

              {/* Model phrase (revealed at end) */}
              {showModelPhrase && analystModelPhrase && (
                <motion.div
                  className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-5"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <p className="text-xs uppercase tracking-wider text-emerald-400 font-semibold">
                      Model Phrase
                    </p>
                  </div>
                  <p className="text-sm text-emerald-200 italic leading-relaxed">
                    "{analystModelPhrase}"
                  </p>
                </motion.div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                {canRetry && (
                  <button
                    onClick={handleRetry}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#1e293b] border border-[#334155] text-[#94a3b8] text-sm font-semibold hover:bg-[#334155] transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Try Again
                  </button>
                )}
                <button
                  onClick={handleFinish}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#6366f1] text-white text-sm font-semibold hover:bg-[#4f46e5] transition-colors cursor-pointer"
                >
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
