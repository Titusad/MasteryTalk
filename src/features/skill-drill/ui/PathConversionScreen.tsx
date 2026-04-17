/**
 * ══════════════════════════════════════════════════════════════
 *  PathConversionScreen — v9.0 Learning Path Conversion Screen
 *
 *  Replaces ConversationalPathUnlockScreen (v8.1).
 *  Shown after the demo session ends. This is the highest-intent
 *  conversion point — the user just experienced the full product.
 *
 *  Copy anchors v9.0:
 *  - "$16.99 one-time — 18 sessions, permanent access"
 *  - "$0.94/session — less than a coffee"
 *  - "All 5 paths for $39.99 (save 47%)"
 *
 *  Props:
 *  - scenarioType: interview / sales / networking / etc.
 *  - proficiencyScore: from the demo session feedback
 *  - onPurchasePath: triggers PathPurchaseModal
 *  - onContinue: skip to dashboard
 * ══════════════════════════════════════════════════════════════
 */

import { useEffect, useRef } from "react";
import { motion } from "motion/react";
import {
  Sparkles,
  Trophy,
  ArrowRight,
  Zap,
  Star,
  TrendingUp,
  RotateCcw,
} from "lucide-react";
import { PATH_PRODUCTS } from "@/services/types";

/* ══════════════════════════════════════════════════════════════
   SCENARIO-SPECIFIC COPY (v9.0 — Learning Path model)
   ══════════════════════════════════════════════════════════════ */

interface ScenarioCopy {
  headline: string;
  subtitle: string;
  valueCards: { icon: "trending" | "star" | "zap"; title: string; desc: string }[];
  conversionHook: string;
}

const SCENARIO_COPY: Record<string, ScenarioCopy> = {
  interview: {
    headline: "You've got the fundamentals — now let's build mastery 🎯",
    subtitle: "Your demo session revealed your strengths and gaps. The Interview Path takes you from here to interview-ready.",
    valueCards: [
      {
        icon: "trending",
        title: "6 progressive levels",
        desc: "Each level raises the difficulty — from phone screens to salary negotiation with adaptive AI.",
      },
      {
        icon: "star",
        title: "18 unique sessions, zero repetition",
        desc: "3 fresh scenarios per level, each one different. Every session builds on your previous performance.",
      },
      {
        icon: "zap",
        title: "Permanent access — yours forever",
        desc: "Come back anytime to practice. Your progress and scores are saved — no subscription, no expiration.",
      },
    ],
    conversionHook: "At less than $1/session, it costs less than a coffee. 18 sessions to interview mastery.",
  },
  sales: {
    headline: "First pitch done — now let's sharpen the blade ⚡",
    subtitle: "Your demo showed your style. The Sales Path builds the skills that close deals in English.",
    valueCards: [
      {
        icon: "trending",
        title: "6 levels of increasing pressure",
        desc: "From discovery calls to executive account reviews — the AI escalates objection difficulty based on your actual performance.",
      },
      {
        icon: "star",
        title: "18 unique negotiation scenarios",
        desc: "No two sessions are the same. Each one stress-tests different aspects: framing, persuasion, objection handling.",
      },
      {
        icon: "zap",
        title: "Practice forever — no subscription",
        desc: "One-time purchase, permanent access. Revisit any level, any time. Your power phrases stay with you.",
      },
    ],
    conversionHook: "One closed deal covers years of practice. 18 sessions for $16.99 — invest in your edge.",
  },
  networking: {
    headline: "Great start — now build real confidence 🌐",
    subtitle: "Your demo revealed your natural style. The Networking Path refines it into a strategic advantage.",
    valueCards: [
      {
        icon: "trending",
        title: "From small talk to strategic rapport",
        desc: "4 levels that evolve from cocktail conversations to building genuine professional relationships.",
      },
      {
        icon: "star",
        title: "12 diverse social scenarios",
        desc: "Industry events, conferences, follow-ups — each session pushes your social fluency further.",
      },
      {
        icon: "zap",
        title: "Access whenever you need it",
        desc: "Got a conference next month? Practice the night before. Permanent access, zero pressure.",
      },
    ],
    conversionHook: "One connection can change your career. 12 preparation sessions for $16.99.",
  },
};

const FALLBACK_COPY = SCENARIO_COPY.interview;

/* ══════════════════════════════════════════════════════════════
   COMPONENT
   ══════════════════════════════════════════════════════════════ */

export interface PathConversionScreenProps {
  /** Scenario type for contextual copy */
  scenarioType?: string;
  /** Proficiency score from the demo session */
  proficiencyScore?: number;
  /** Trigger PathPurchaseModal */
  onPurchasePath: () => void;
  /** Skip to dashboard/report */
  onContinue: () => void;
}

const ICON_MAP = {
  trending: TrendingUp,
  star: Star,
  zap: Zap,
};

export function PathConversionScreen({
  scenarioType = "interview",
  proficiencyScore,
  onPurchasePath,
  onContinue,
}: PathConversionScreenProps) {
  const confettiRef = useRef(false);
  const copy = SCENARIO_COPY[scenarioType] ?? FALLBACK_COPY;
  const product = PATH_PRODUCTS.first_path;

  /* ── Celebratory confetti on mount ── */
  useEffect(() => {
    if (confettiRef.current) return;
    confettiRef.current = true;

    import("canvas-confetti")
      .then((mod) => {
        const confetti = mod.default;
        confetti({
          particleCount: 100,
          spread: 90,
          origin: { y: 0.45 },
          colors: ["#0f172b", "#22c55e", "#f59e0b", "#6366f1", "#06b6d4"],
        });
        setTimeout(() => confetti({ particleCount: 50, spread: 70, origin: { x: 0.3, y: 0.5 } }), 300);
        setTimeout(() => confetti({ particleCount: 50, spread: 70, origin: { x: 0.7, y: 0.5 } }), 600);
      })
      .catch(() => {});
  }, []);

  return (
    <div aria-label=\"PathConversionScreen" className="w-full min-h-[calc(100dvh-4rem)] bg-[#0f172b] flex flex-col items-center justify-center px-4 py-8">
      {/* ── Hero icon ── */}
      <motion.div
        className="mb-6"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.2 }}
      >
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#22c55e] to-[#16a34a] shadow-lg shadow-[#22c55e]/30 flex items-center justify-center">
          <Trophy className="w-12 h-12 text-white" />
        </div>
      </motion.div>

      {/* ── Headline ── */}
      <motion.div
        className="text-center mb-4 max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h1 className="text-2xl font-bold text-white mb-2">
          {copy.headline}
        </h1>
        <p className="text-sm text-[#94a3b8] leading-relaxed">
          {copy.subtitle}
        </p>
      </motion.div>

      {/* ── Score pill (if available) ── */}
      {proficiencyScore != null && proficiencyScore > 0 && (
        <motion.div
          className="inline-flex items-center gap-3 px-4 py-2 rounded-lg bg-[#1e293b] border border-[#334155] mb-6"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          <span className="text-xs text-[#94a3b8]">Demo Score</span>
          <span
            className={`text-lg font-bold ${
              proficiencyScore >= 80 ? "text-emerald-400" : proficiencyScore >= 60 ? "text-amber-400" : "text-red-400"
            }`}
          >
            {Math.round(proficiencyScore)}%
          </span>
        </motion.div>
      )}

      {/* ── What's included (value cards) ── */}
      <motion.div
        className="w-full max-w-md space-y-3 mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        {copy.valueCards.map((card) => {
          const Icon = ICON_MAP[card.icon];
          const iconColor =
            card.icon === "trending" ? "text-[#22c55e]" : card.icon === "star" ? "text-amber-400" : "text-[#06b6d4]";
          return (
            <div
              key={card.title}
              className="bg-[#1e293b]/60 border border-[#334155] rounded-2xl p-4 flex items-start gap-3"
            >
              <Icon className={`w-4 h-4 ${iconColor} mt-0.5 shrink-0`} />
              <div>
                <p className="text-sm font-medium text-white">{card.title}</p>
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
        <div className="flex items-center gap-2 bg-[#22c55e]/8 border border-[#22c55e]/20 rounded-lg px-4 py-3">
          <Sparkles className="w-4 h-4 text-[#22c55e] shrink-0" />
          <p className="text-xs text-[#94a3b8] leading-relaxed">
            {copy.conversionHook}
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
        {/* Primary: Unlock path at beta price */}
        <button
          onClick={onPurchasePath}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-lg bg-white text-[#0f172b] text-sm font-medium hover:bg-[#f8fafc] transition-colors shadow-lg cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          Continue this path — ${product.price}
          <span className="text-[10px] bg-[#f59e0b]/15 text-[#d97706] px-1.5 py-0.5 rounded font-medium ml-1">
            BETA PRICE
          </span>
          <ArrowRight className="w-4 h-4" />
        </button>

        {/* Tertiary: Skip to report */}
        <button
          onClick={onContinue}
          className="w-full flex items-center justify-center gap-2 py-3 text-sm text-[#64748b] hover:text-[#94a3b8] transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Continue to Dashboard
        </button>
      </motion.div>
    </div>
  );
}
