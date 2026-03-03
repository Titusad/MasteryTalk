/**
 * ══════════════════════════════════════════════════════════════
 *  SessionProgressBar — Inline horizontal phase stepper
 *  Sits inside the shared header next to BrandLogo.
 *  Maps 8 internal steps → 4 user-facing phases (MVP).
 * ══════════════════════════════════════════════════════════════
 */

import { motion } from "motion/react";
import { Check } from "lucide-react";
import type { Step } from "./shared/session-types";

/* ── Phase definitions ── */

interface Phase {
  id: string;
  label: string;
  steps: Step[];
}

const PHASES: Phase[] = [
  {
    id: "prep",
    label: "Preparation",
    steps: ["strategy", "extra-context", "generating-script", "pre-briefing"],
  },
  {
    id: "practice",
    label: "Practice",
    steps: ["practice"],
  },
  {
    id: "feedback",
    label: "Feedback",
    steps: ["analyzing", "conversation-feedback"],
  },
  {
    id: "wrapup",
    label: "Report",
    steps: ["session-recap"],
  },
];

function getPhaseIndex(step: Step): number {
  return PHASES.findIndex((p) => p.steps.includes(step));
}

/* ── Component ── */

interface SessionProgressBarProps {
  currentStep: Step;
}

export function SessionProgressBar({ currentStep }: SessionProgressBarProps) {
  const currentPhaseIdx = getPhaseIndex(currentStep);

  return (
    <div className="flex items-center gap-0 w-full">
      {PHASES.map((phase, idx) => {
        const isCompleted = idx < currentPhaseIdx;
        const isCurrent = idx === currentPhaseIdx;

        return (
          <div
            key={phase.id}
            className="flex items-center flex-1 last:flex-none"
          >
            {/* Node: dot + label */}
            <div className="relative flex flex-col items-center">
              {/* Pulse ring for current */}
              {isCurrent && (
                <motion.div
                  className="absolute rounded-full border-2 border-[#DBEDDF]"
                  style={{ width: 24, height: 24, top: -4, left: -4 }}
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 0, 0.5],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              )}

              {/* Circle */}
              <motion.div
                className="relative flex items-center justify-center rounded-full"
                style={{ width: 16, height: 16 }}
                animate={{
                  backgroundColor: isCompleted || isCurrent ? "#0f172b" : "#d1d5db",
                  scale: isCurrent ? 1.15 : 1,
                }}
                transition={{ duration: 0.35, ease: "easeOut" }}
              >
                {isCompleted ? (
                  <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                ) : isCurrent ? (
                  <div className="w-[5px] h-[5px] rounded-full bg-[#DBEDDF]" />
                ) : (
                  <div className="w-[5px] h-[5px] rounded-full bg-white/80" />
                )}
              </motion.div>

              {/* Label below dot */}
              <span
                className="absolute top-[22px] whitespace-nowrap text-center select-none"
                style={{
                  fontSize: "11px",
                  fontWeight: isCurrent ? 600 : 400,
                  color: isCurrent
                    ? "#0f172b"
                    : isCompleted
                      ? "#64748b"
                      : "#94a3b8",
                  letterSpacing: "0.01em",
                }}
              >
                {phase.label}
              </span>
            </div>

            {/* Connector line */}
            {idx < PHASES.length - 1 && (
              <div className="flex-1 h-[1.5px] mx-1.5 bg-[#e2e8f0] rounded-full overflow-hidden relative">
                {isCompleted && (
                  <motion.div
                    className="absolute inset-0 bg-[#0f172b] rounded-full"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    style={{ transformOrigin: "left" }}
                  />
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}