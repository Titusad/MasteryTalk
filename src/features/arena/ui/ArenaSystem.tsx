/**
 * ══════════════════════════════════════════════════════════════
 *  Arena System — Progressive Scaffolding Components
 *
 *  Implements the 3-phase Arena model:
 *  1. Support  → Power Phrases visible, AI recasts
 *  2. Guidance → Phrases in collapsible panel, AI pushes strategically
 *  3. Challenge → Phrases hidden, senior peer mode
 *
 *  Components:
 *  - useArenaPhase: Hook for phase state machine
 *  - PowerPhrasesPanel: Contextual phrase suggestions
 *  - PhaseIndicator: Subtle badge showing current phase
 *  - PhaseTransitionToast: Micro-animation on level up
 *  - TrySayingHint: Compact secondary hint showing a concrete response starter
 * ══════════════════════════════════════════════════════════════
 */
import { useState, useCallback, useRef, useEffect } from "react";
import {
  Sparkles,
  ChevronDown,
  ChevronUp,
  Zap,
  Shield,
  Swords,
  X,
  Check,
  MessageCircle,
  Lightbulb,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import type {
  ArenaPhase,
  ArenaState,
  ArenaPowerPhrase,
} from "@/services/types";

/* ══════════════════════════════════════════════════════════════
   HOOK: useArenaPhase
   ══════════════════════════════════════════════════════════════ */

const GOOD_INTERACTIONS_TO_ADVANCE = 3;
const RESPONSE_TIME_THRESHOLD_MS = 15000; // >15s = elevated cognitive load

interface UseArenaPhaseReturn {
  state: ArenaState;
  /** Call after each user turn. Pass response time in ms. */
  recordInteraction: (responseTimeMs: number, quality: "good" | "weak") => void;
  /** The current phase */
  phase: ArenaPhase;
  /** True when phase just changed (triggers toast) */
  justTransitioned: boolean;
  /** Clear the transition flag after toast shows */
  clearTransition: () => void;
}

export function useArenaPhase(): UseArenaPhaseReturn {
  const [state, setState] = useState<ArenaState>({
    phase: "support",
    goodInteractions: 0,
    totalInteractions: 0,
    cognitiveLoadLevel: "normal",
  });

  const [justTransitioned, setJustTransitioned] = useState(false);

  const recordInteraction = useCallback(
    (responseTimeMs: number, quality: "good" | "weak") => {
      setState((prev) => {
        const newTotal = prev.totalInteractions + 1;
        const newGood =
          quality === "good" ? prev.goodInteractions + 1 : prev.goodInteractions;

        // Cognitive load detection (no UI change, just tone softening)
        const cogLoad: "normal" | "elevated" =
          responseTimeMs > RESPONSE_TIME_THRESHOLD_MS ? "elevated" : "normal";

        // Phase progression — only advance, never regress visually
        let newPhase = prev.phase;
        if (
          prev.phase === "support" &&
          newGood >= GOOD_INTERACTIONS_TO_ADVANCE
        ) {
          newPhase = "guidance";
          setJustTransitioned(true);
        } else if (
          prev.phase === "guidance" &&
          newGood >= GOOD_INTERACTIONS_TO_ADVANCE
        ) {
          newPhase = "challenge";
          setJustTransitioned(true);
        }

        return {
          phase: newPhase,
          goodInteractions: newPhase !== prev.phase ? 0 : newGood, // Reset counter on phase change
          totalInteractions: newTotal,
          cognitiveLoadLevel: cogLoad,
        };
      });
    },
    []
  );

  const clearTransition = useCallback(() => {
    setJustTransitioned(false);
  }, []);

  return {
    state,
    recordInteraction,
    phase: state.phase,
    justTransitioned,
    clearTransition,
  };
}

/* ═════════════════════════════════════════════════════════════
   COMPONENT: PhaseIndicator
   ══════════════════════════════════════════════════════════════ */

const PHASE_CONFIG: Record<
  ArenaPhase,
  {
    label: string;
    sublabel: string;
    icon: typeof Shield;
    color: string;
    bg: string;
    border: string;
  }
> = {
  support: {
    label: "Training Wheels",
    sublabel: "I'll be right here guiding you",
    icon: Shield,
    color: "#2563eb",
    bg: "rgba(37,99,235,0.08)",
    border: "rgba(37,99,235,0.15)",
  },
  guidance: {
    label: "Getting Sharper",
    sublabel: "Less hand-holding, more you",
    icon: Zap,
    color: "#d97706",
    bg: "rgba(217,119,6,0.08)",
    border: "rgba(217,119,6,0.15)",
  },
  challenge: {
    label: "Game Day",
    sublabel: "Show me what you've got",
    icon: Swords,
    color: "#0f172b",
    bg: "rgba(124,58,237,0.08)",
    border: "rgba(124,58,237,0.15)",
  },
};

export function PhaseIndicator({ phase }: { phase: ArenaPhase }) {
  const config = PHASE_CONFIG[phase];
  const Icon = config.icon;

  return (
    <motion.div
      key={phase}
      className="flex items-center gap-2 px-3.5 py-1.5 rounded-full"
      style={{
        background: config.bg,
        border: `1px solid ${config.border}`,
      }}
      initial={{ opacity: 0, scale: 0.9, filter: "blur(4px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <Icon className="w-3.5 h-3.5" style={{ color: config.color }} />
      <span
        className="text-xs"
        style={{ color: config.color }}
      >
        {config.label}
      </span>
      <span className="text-[10px] text-[#62748e] hidden sm:inline">
        — {config.sublabel}
      </span>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════
   COMPONENT: PhaseTransitionToast
   ══════════════════════════════════════════════════════════════ */

const TRANSITION_MESSAGES: Record<ArenaPhase, { title: string; desc: string }> = {
  support: { title: "", desc: "" }, // No toast for initial phase
  guidance: {
    title: "You're leveling up",
    desc: "Less hints this time — you're ready for it",
  },
  challenge: {
    title: "Boss mode unlocked 🔓",
    desc: "No safety net. Let's see the real you.",
  },
};

export function PhaseTransitionToast({
  phase,
  visible,
  onDismiss,
}: {
  phase: ArenaPhase;
  visible: boolean;
  onDismiss: () => void;
}) {
  const msg = TRANSITION_MESSAGES[phase];
  const config = PHASE_CONFIG[phase];

  // Auto-dismiss after 4s
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (visible) {
      timerRef.current = setTimeout(onDismiss, 4000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [visible, onDismiss]);

  if (phase === "support") return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed top-20 left-1/2 z-[90] w-full max-w-sm px-4"
          style={{ x: "-50%" }}
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <div
            className="rounded-2xl p-4 shadow-xl backdrop-blur-md flex items-start gap-3"
            style={{
              background: `linear-gradient(135deg, ${config.bg}, rgba(255,255,255,0.95))`,
              border: `1px solid ${config.border}`,
            }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: config.bg }}
            >
              <Sparkles className="w-5 h-5" style={{ color: config.color }} />
            </div>
            <div className="flex-1 min-w-0">
              <h4
                className="text-sm text-[#0f172b] mb-0.5 font-semibold"
              >
                {msg.title}
              </h4>
              <p className="text-xs text-[#45556c]">{msg.desc}</p>
            </div>
            <button
              onClick={onDismiss}
              className="text-[#94a3b8] hover:text-[#64748b] transition-colors flex-shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ══════════════════════════════════════════════════════════════
   COMPONENT: PowerPhrasesPanel
   ══════════════════════════════════════════════════════════════ */

interface PowerPhrasesPanelProps {
  phrases: ArenaPowerPhrase[];
  phase: ArenaPhase;
  onPhraseClick?: (phrase: ArenaPowerPhrase) => void;
  /** IDs of phrases already used/clicked — shown with a checkmark */
  usedPhraseIds?: Set<string>;
}

export function PowerPhrasesPanel({
  phrases,
  phase,
  onPhraseClick,
  usedPhraseIds,
}: PowerPhrasesPanelProps) {
  // Legacy static panel — no longer rendered.
  // Use InlineHint instead for contextual per-turn hints.
  return null;
}

/* ══════════════════════════════════════════════════════════════
   COMPONENT: InlineHint
   Shows a single contextual Power Phrase as a dismissible hint
   rendered inline after each AI message in the chat flow.
   ══════════════════════════════════════════════════════════════ */

interface InlineHintProps {
  phrase: ArenaPowerPhrase;
  phase: ArenaPhase;
  isUsed: boolean;
  onUse?: (phrase: ArenaPowerPhrase) => void;
}

export function InlineHint({ phrase, phase, isUsed, onUse }: InlineHintProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || phase === "challenge") return null;

  const isGuidance = phase === "guidance";

  return (
    <motion.div
      className="flex items-start w-full"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.35, delay: 0.5 }}
    >
      <div
        className={`inline-flex items-start gap-2.5 px-4 py-3 rounded-2xl max-w-[520px] transition-all ${
          isUsed
            ? "bg-[#f0fdf4]/80 border border-[#86efac]/60"
            : isGuidance
              ? "bg-[#fffbeb]/70 border border-[#fde68a]/50"
              : "bg-[#eff6ff]/70 border border-[#bfdbfe]/50"
        }`}
      >
        <Sparkles
          className="w-3.5 h-3.5 mt-0.5 shrink-0"
          style={{ color: isUsed ? "#16a34a" : isGuidance ? "#d97706" : "#3b82f6" }}
        />
        <div className="flex-1 min-w-0">
          <span
            className="text-[10px] uppercase tracking-wider block mb-1"
            style={{
              fontWeight: 600,
              color: isUsed ? "#16a34a" : isGuidance ? "#92400e" : "#1e40af",
              opacity: 0.7,
            }}
          >
            {isUsed ? "Hint used" : "Hint"}
          </span>
          <p
            className={`text-xs leading-relaxed ${
              isUsed ? "text-[#166534]" : isGuidance ? "text-[#78350f]" : "text-[#1e3a5f]"
            }`}
          >
            "{phrase.phrase}"
          </p>
          <p
            className="text-[10px] mt-1"
            style={{
              color: isUsed ? "#16a34a" : isGuidance ? "#92400e" : "#3b82f6",
              opacity: 0.6,
              fontWeight: 400,
            }}
          >
            {phrase.context}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1 shrink-0 mt-0.5">
          {!isUsed && onUse && (
            <motion.button
              onClick={() => onUse(phrase)}
              className={`p-1.5 rounded-lg transition-colors ${
                isGuidance
                  ? "hover:bg-[#fde68a]/40 text-[#d97706]"
                  : "hover:bg-[#bfdbfe]/40 text-[#3b82f6]"
              }`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title="Use this phrase"
            >
              <Check className="w-3.5 h-3.5" />
            </motion.button>
          )}
          {isUsed && (
            <div className="p-1.5 text-[#16a34a]">
              <Check className="w-3.5 h-3.5" />
            </div>
          )}
          <motion.button
            onClick={() => setDismissed(true)}
            className="p-1.5 rounded-lg hover:bg-black/5 text-[#94a3b8] transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Dismiss hint"
          >
            <X className="w-3 h-3" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════
   COMPONENT: TrySayingHint
   Compact secondary hint showing a concrete response starter.
   Appears below InlineHint — "Try saying: ..."
   ══════════════════════════════════════════════════════════════ */

interface TrySayingHintProps {
  starter: string;
  why: string;
  phase: ArenaPhase;
}

export function TrySayingHint({ starter, why, phase }: TrySayingHintProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || phase === "challenge") return null;

  const isGuidance = phase === "guidance";

  return (
    <motion.div
      className="flex items-start w-full"
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.3, delay: 0.8 }}
    >
      <div
        className={`inline-flex items-start gap-2 px-3.5 py-2.5 rounded-xl max-w-[480px] ${
          isGuidance
            ? "bg-[#fef9c3]/40 border border-[#fde68a]/30"
            : "bg-[#f0f9ff]/60 border border-[#bae6fd]/30"
        }`}
      >
        <MessageCircle
          className="w-3 h-3 mt-0.5 shrink-0"
          style={{ color: isGuidance ? "#ca8a04" : "#0284c7" }}
        />
        <div className="flex-1 min-w-0">
          <span
            className="text-[10px] uppercase tracking-wider block mb-0.5"
            style={{
              fontWeight: 600,
              color: isGuidance ? "#a16207" : "#0369a1",
              opacity: 0.6,
            }}
          >
            Try saying
          </span>
          <p
            className={`text-xs leading-relaxed ${
              isGuidance ? "text-[#854d0e]" : "text-[#0c4a6e]"
            }`}
            style={{ fontStyle: "italic" }}
          >
            "{starter}"
          </p>
          <p className="text-[10px] mt-1 flex items-center gap-1"
            style={{
              color: isGuidance ? "#a16207" : "#0369a1",
              opacity: 0.5,
              fontWeight: 400,
            }}
          >
            <Lightbulb className="w-2.5 h-2.5" />
            {why}
          </p>
        </div>
        <motion.button
          onClick={() => setDismissed(true)}
          className="p-1 rounded-lg hover:bg-black/5 text-[#94a3b8] transition-colors shrink-0"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <X className="w-2.5 h-2.5" />
        </motion.button>
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════
   COMPONENT: ArenaProgressBar
   Shows discreet dots for the 3 phases
   ══════════════════════════════════════════════════════════════ */

export function ArenaProgressBar({ phase }: { phase: ArenaPhase }) {
  const phases: ArenaPhase[] = ["support", "guidance", "challenge"];
  const currentIdx = phases.indexOf(phase);

  return (
    <div className="flex items-center gap-1.5">
      {phases.map((p, i) => (
        <div key={p} className="flex items-center gap-1.5">
          <motion.div
            className="rounded-full"
            animate={{
              width: i === currentIdx ? 20 : 6,
              height: 6,
              backgroundColor:
                i <= currentIdx
                  ? PHASE_CONFIG[p].color
                  : "#e2e8f0",
            }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
      ))}
    </div>
  );
}