/**
 * ══════════════════════════════════════════════════════════════
 *  inFluentia PRO — Conversational Path Unlock Screen (v8.1)
 *
 *  The highest-intent conversion screen in the app. Shown after
 *  the Skill Drill, when the user just proved their engagement.
 *
 *  Variants:
 *  - scenarioType: interview / sales / networking (different hooks)
 *  - passed: true (celebration 🎉) / false (motivational 💪)
 *
 *  Copy anchors:
 *  - "4 sessions = the subscription pays for itself"
 *  - Real prices: PRO $19.99/mo, Annual $13.99/mo, Session $4.99
 * ══════════════════════════════════════════════════════════════
 */

import { useEffect, useRef } from "react";
import { motion } from "motion/react";
import {
  Sparkles,
  Trophy,
  Target,
  ArrowRight,
  Zap,
  Star,
  TrendingUp,
  Crown,
} from "lucide-react";

/* ══════════════════════════════════════════════════════════════
   SCENARIO-SPECIFIC COPY
   ══════════════════════════════════════════════════════════════ */

interface ScenarioCopy {
  /** Celebration headline (passed=true) */
  passedHeadline: string;
  /** Motivational headline (passed=false) */
  failedHeadline: string;
  /** Subheadline referencing the unlock */
  unlockLine: string;
  /** What they'll gain with PRO */
  valueCards: { icon: "trending" | "star" | "zap"; title: string; desc: string }[];
  /** Emotional hook for the CTA area */
  conversionHook: string;
}

const SCENARIO_COPY: Record<string, ScenarioCopy> = {
  interview: {
    passedHeadline: "You crushed it! 🎉",
    failedHeadline: "Great effort — you're building real skills 💪",
    unlockLine: "You've unlocked your Interview Conversational Path",
    valueCards: [
      {
        icon: "trending",
        title: "Interviewers that remember you",
        desc: "Each session adapts to your progress — the AI challenges your actual weak points, not generic ones.",
      },
      {
        icon: "star",
        title: "Your phrases, not templates",
        desc: "Coaching derived from your real transcripts. Every suggestion is built from how you actually speak.",
      },
      {
        icon: "zap",
        title: "Skill Drills that diagnose gaps",
        desc: "Vocabulary, Grammar, Pronunciation, Fluency — targeted exercises with AI-scored feedback.",
      },
    ],
    conversionHook: "One practice session costs less than a coffee. Four sessions, and PRO pays for itself.",
  },
  sales: {
    passedHeadline: "You closed it! 🎉",
    failedHeadline: "Every top seller started here 💪",
    unlockLine: "You've unlocked your Sales Conversational Path",
    valueCards: [
      {
        icon: "trending",
        title: "Clients that escalate the challenge",
        desc: "Each session raises objection difficulty based on how you actually handled the last one.",
      },
      {
        icon: "star",
        title: "Your power phrases, weaponized",
        desc: "The AI builds closing language from your strongest moments — not a generic sales playbook.",
      },
      {
        icon: "zap",
        title: "Drills for objection handling",
        desc: "Targeted exercises that stress-test your weakest pillars: vocabulary, framing, persuasion flow.",
      },
    ],
    conversionHook: "One deal covers a year of practice. Four sessions, and PRO pays for itself.",
  },
  networking: {
    passedHeadline: "Nailed the connection! 🎉",
    failedHeadline: "Conversation skills compound — keep building 💪",
    unlockLine: "You've unlocked your Networking Conversational Path",
    valueCards: [
      {
        icon: "trending",
        title: "Conversations that evolve",
        desc: "Each session increases social complexity — from small talk to strategic relationship building.",
      },
      {
        icon: "star",
        title: "Your natural voice, polished",
        desc: "Coaching built from your actual conversation patterns, not scripted networking templates.",
      },
      {
        icon: "zap",
        title: "Drills for social fluency",
        desc: "Targeted exercises on vocabulary, tone, and cultural intelligence with AI-scored feedback.",
      },
    ],
    conversionHook: "One connection can change your career. Four sessions, and PRO pays for itself.",
  },
};

const FALLBACK_COPY = SCENARIO_COPY.interview;

/* ══════════════════════════════════════════════════════════════
   COMPONENT
   ══════════════════════════════════════════════════════════════ */

export interface ConversationalPathUnlockScreenProps {
  /** The pillar that was drilled */
  pillar: string;
  /** The score achieved */
  score: number;
  /** Whether the drill was passed (>= 80) */
  passed: boolean;
  /** Scenario type for contextual copy */
  scenarioType?: string;
  /** Navigate to session-recap */
  onContinue: () => void;
  /** Trigger subscription modal */
  onSubscribe?: () => void;
  /** Trigger pay-per-session purchase */
  onPayPerSession?: () => void;
}

const ICON_MAP = {
  trending: TrendingUp,
  star: Star,
  zap: Zap,
};

export function ConversationalPathUnlockScreen({
  pillar,
  score,
  passed,
  scenarioType = "interview",
  onContinue,
  onSubscribe,
  onPayPerSession,
}: ConversationalPathUnlockScreenProps) {
  const confettiRef = useRef(false);
  const copy = SCENARIO_COPY[scenarioType] ?? FALLBACK_COPY;

  /* ── Confetti (only when passed) ── */
  useEffect(() => {
    if (confettiRef.current || !passed) return;
    confettiRef.current = true;

    import("canvas-confetti")
      .then((mod) => {
        const confetti = mod.default;
        confetti({
          particleCount: 120,
          spread: 100,
          origin: { y: 0.45 },
          colors: ["#6366f1", "#22c55e", "#f59e0b", "#ec4899", "#06b6d4"],
        });
        setTimeout(() => confetti({ particleCount: 60, spread: 80, origin: { x: 0.3, y: 0.55 } }), 300);
        setTimeout(() => confetti({ particleCount: 60, spread: 80, origin: { x: 0.7, y: 0.55 } }), 600);
      })
      .catch(() => {});
  }, [passed]);

  return (
    <div className="w-full min-h-[calc(100dvh-4rem)] bg-[#0f172b] flex flex-col items-center justify-center px-4 py-8">
      {/* ── Hero icon ── */}
      <motion.div
        className="mb-6"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.2 }}
      >
        <div
          className={`w-24 h-24 rounded-full flex items-center justify-center shadow-lg ${
            passed
              ? "bg-gradient-to-br from-[#6366f1] to-[#4f46e5] shadow-[#6366f1]/30"
              : "bg-gradient-to-br from-[#f59e0b] to-[#d97706] shadow-[#f59e0b]/30"
          }`}
        >
          {passed ? (
            <Trophy className="w-12 h-12 text-white" />
          ) : (
            <Target className="w-12 h-12 text-white" />
          )}
        </div>
      </motion.div>

      {/* ── Headline ── */}
      <motion.div
        className="text-center mb-6 max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h1 className="text-3xl font-bold text-white mb-2">
          {passed ? copy.passedHeadline : copy.failedHeadline}
        </h1>
        <p className="text-lg text-[#94a3b8]">
          {copy.unlockLine.split("Conversational Path").map((part, i) =>
            i === 0 ? (
              <span key={i}>
                {part}
                <span className="text-[#6366f1] font-semibold">Conversational Path</span>
              </span>
            ) : (
              <span key={i}>{part}</span>
            )
          )}
        </p>
      </motion.div>

      {/* ── Score pill ── */}
      <motion.div
        className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-[#1e293b] border border-[#334155] mb-8"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
      >
        <span className="text-sm text-[#94a3b8]">{pillar} Drill</span>
        <span
          className={`text-lg font-bold ${
            score >= 80 ? "text-emerald-400" : score >= 60 ? "text-amber-400" : "text-red-400"
          }`}
        >
          {score}/100
        </span>
      </motion.div>

      {/* ── Value cards (scenario-specific) ── */}
      <motion.div
        className="w-full max-w-md space-y-3 mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        {copy.valueCards.map((card) => {
          const Icon = ICON_MAP[card.icon];
          const iconColor =
            card.icon === "trending" ? "text-[#6366f1]" : card.icon === "star" ? "text-amber-400" : "text-emerald-400";
          return (
            <div
              key={card.title}
              className="bg-[#1e293b]/60 border border-[#334155] rounded-2xl p-4 flex items-start gap-3"
            >
              <Icon className={`w-5 h-5 ${iconColor} mt-0.5 shrink-0`} />
              <div>
                <p className="text-sm font-semibold text-white">{card.title}</p>
                <p className="text-xs text-[#94a3b8] mt-0.5">{card.desc}</p>
              </div>
            </div>
          );
        })}
      </motion.div>

      {/* ── Conversion anchor ── */}
      <motion.div
        className="w-full max-w-md mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        <div className="flex items-center gap-2.5 bg-[#6366f1]/8 border border-[#6366f1]/20 rounded-xl px-4 py-3">
          <Crown className="w-5 h-5 text-[#6366f1] shrink-0" />
          <p className="text-xs text-[#94a3b8] leading-relaxed">
            {copy.conversionHook}{" "}
            <span className="text-white font-semibold">
              PRO starts at $13.99/mo.
            </span>
          </p>
        </div>
      </motion.div>

      {/* ── CTAs ── */}
      <motion.div
        className="w-full max-w-md space-y-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        {/* Primary: Subscribe → opens SubscriptionModal */}
        {onSubscribe && (
          <button
            onClick={onSubscribe}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-r from-[#6366f1] to-[#4f46e5] text-white text-base font-bold hover:opacity-90 transition-opacity shadow-lg shadow-[#6366f1]/25 cursor-pointer"
          >
            <Sparkles className="w-5 h-5" />
            Go PRO — from $13.99/mo
          </button>
        )}

        {/* Secondary: Pay per session */}
        {onPayPerSession && (
          <button
            onClick={onPayPerSession}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-[#1e293b] border border-[#334155] text-[#cbd5e1] text-sm font-semibold hover:bg-[#334155] transition-colors cursor-pointer"
          >
            <Zap className="w-4 h-4 text-emerald-400" />
            Try one session — $4.99
          </button>
        )}

        {/* Tertiary: Continue to report (free) */}
        <button
          onClick={onContinue}
          className="w-full flex items-center justify-center gap-2 py-3 text-sm text-[#64748b] hover:text-[#94a3b8] transition-colors cursor-pointer"
        >
          View Session Report
          <ArrowRight className="w-4 h-4" />
        </button>
      </motion.div>
    </div>
  );
}
