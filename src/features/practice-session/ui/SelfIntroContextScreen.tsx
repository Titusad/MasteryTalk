/**
 * SelfIntroContextScreen — Context selector for self-intro warm-up
 *
 * Shows 3 visual chips (Networking, Team, Client) for the user to
 * choose their introduction setting. No text input needed.
 */

import { useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, Globe, Users, Handshake } from "lucide-react";
import { SELF_INTRO_CONTEXTS } from "@/shared/lib/self-intro-contexts";
import type { SelfIntroContext } from "@/entities/session";

/* Map context id → Lucide icon component */
const CONTEXT_ICONS: Record<string, React.ElementType> = {
  networking: Globe,
  team: Users,
  client: Handshake,
};

interface SelfIntroContextScreenProps {
  onSelect: (context: SelfIntroContext) => void;
}

export function SelfIntroContextScreen({ onSelect }: SelfIntroContextScreenProps) {
  const [selected, setSelected] = useState<SelfIntroContext | null>(null);

  return (
    <motion.div
      className="flex flex-col items-center justify-center px-6 py-10 max-w-2xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {/* Pill */}
      <span
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0f172b] text-white text-[11px] mb-5"
        style={{ fontWeight: 600, letterSpacing: "0.02em" }}
      >
        Self-Introduction · Choose Your Setting
      </span>

      {/* Heading */}
      <h1
        className="text-2xl font-bold text-center text-[#0f172b] leading-snug mb-2"
        style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
      >
        Where are you introducing yourself?
      </h1>
      <p className="text-sm text-[#62748e] text-center mb-8" style={{ fontWeight: 500 }}>
        Pick the setting — I'll adapt the conversation and feedback to match.
      </p>

      {/* Context chips */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-3 mb-10">
        {SELF_INTRO_CONTEXTS.map((ctx, i) => {
          const isSelected = selected?.id === ctx.id;
          const IconComponent = CONTEXT_ICONS[ctx.id] || Globe;
          return (
            <motion.button
              key={ctx.id}
              onClick={() => setSelected(ctx)}
              className={`relative flex flex-col items-center text-center p-6 rounded-2xl border-2 transition-all cursor-pointer ${
                isSelected
                  ? "border-[#0f172b] bg-[#0f172b]/[0.03] shadow-md"
                  : "border-[#e2e8f0] bg-white hover:border-[#94a3b8] hover:shadow-sm"
              }`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.08, duration: 0.3 }}
              whileTap={{ scale: 0.97 }}
            >
              {/* Selection indicator */}
              {isSelected && (
                <motion.div
                  className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#0f172b] flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 25 }}
                >
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </motion.div>
              )}

              {/* Icon — dark circle + white Lucide icon */}
              <div className="w-10 h-10 rounded-full bg-[#0f172b] flex items-center justify-center mb-3">
                <IconComponent className="w-5 h-5 text-white" />
              </div>

              {/* Label */}
              <h3
                className="text-sm text-[#0f172b] mb-1"
                style={{ fontWeight: 600 }}
              >
                {ctx.label}
              </h3>

              {/* Description */}
              <p className="text-xs text-[#62748e] leading-relaxed">
                {ctx.description}
              </p>
            </motion.button>
          );
        })}
      </div>

      {/* CTA */}
      <motion.button
        onClick={() => selected && onSelect(selected)}
        disabled={!selected}
        className={`w-full max-w-xs py-3.5 rounded-full text-[15px] flex items-center justify-center gap-2 transition-all ${
          selected
            ? "bg-[#0f172b] text-white hover:opacity-90 active:scale-[0.98] cursor-pointer"
            : "bg-[#e2e8f0] text-[#94a3b8] cursor-not-allowed"
        }`}
        style={{ fontWeight: 600 }}
        whileTap={selected ? { scale: 0.97 } : undefined}
      >
        Continue
        <ArrowRight className="w-4 h-4" />
      </motion.button>
    </motion.div>
  );
}
