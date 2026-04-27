/**
 * IntroductionScreen — Level-specific welcome screen
 *
 * Shown once per level (tracked via localStorage).
 * Tells the user what they'll master and previews the 3-step session flow.
 */

import { useState, useEffect } from "react";
import { useNarration } from "@/shared/lib/useNarration";
import { motion } from "motion/react";
import { ArrowRight, ClipboardList, Lightbulb, Mic, Clock } from "lucide-react";
import { getSupabaseClient } from "@/services/supabase";
import type { ScenarioType } from "@/entities/session";

const SCENARIO_LABELS: Record<ScenarioType, string> = {
  interview: "Interview",
  sales: "Sales",
  meeting: "Meeting",
  presentation: "Presentation",
  client: "Client",
  csuite: "C-Suite",
  "self-intro": "Self-Introduction",
};

const STEPS = [
  {
    num: 1,
    title: "Set the Scene",
    description: "Add the role and company so I can tailor the simulation.",
    color: "#14b8a6",
    bg: "rgba(20, 184, 166, 0.1)",
  },
  {
    num: 2,
    title: "Study & Strategize",
    description: "Review likely questions, frameworks, and your opening lines.",
    color: "#6366f1",
    bg: "rgba(99, 102, 241, 0.1)",
  },
  {
    num: 3,
    title: "Live Practice",
    description: "Voice conversation with AI feedback on your delivery.",
    color: "#22c55e",
    bg: "rgba(34, 197, 94, 0.1)",
  },
];

interface IntroductionScreenProps {
  scenarioType: ScenarioType;
  levelTitle: string;
  introHeadline: string;
  onContinue: () => void;
  narratorUrl?: string;
}

export function IntroductionScreen({
  scenarioType,
  levelTitle,
  introHeadline,
  onContinue,
  narratorUrl,
}: IntroductionScreenProps) {
  useNarration(narratorUrl || null);
  const [firstName, setFirstName] = useState("there");

  useEffect(() => {
    getSupabaseClient().auth.getUser().then(({ data }) => {
      const name = data.user?.user_metadata?.full_name || data.user?.email?.split("@")[0];
      if (name) setFirstName(name.split(" ")[0]);
    });
  }, []);

  return (
    <motion.div
      className="flex flex-col items-center justify-center px-6 py-10 max-w-2xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >

      {/* Scenario pill */}
      <span
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0f172b] text-white text-[11px] mb-5"
        style={{ fontWeight: 600, letterSpacing: "0.02em" }}
      >
        {SCENARIO_LABELS[scenarioType]} · {levelTitle}
      </span>

      {/* Greeting + headline */}
      <h1
        className="text-2xl font-bold text-center text-[#0f172b] leading-snug mb-2"
        style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
      >
        Hey {firstName}, <br></br>in this practice you'll master how to{" "}
        <span style={{ color: "#6366f1" }}>{introHeadline}</span>.
      </h1>

      {/* Transition text */}
      <p className="text-sm text-[#62748e] text-center mb-8 mt-2" style={{ fontWeight: 500 }}>
        To get there, we'll go through 3 steps:
      </p>

      {/* Steps */}
      <div className="w-full space-y-3 mb-8">
        {STEPS.map((step, i) => (
          <motion.div
            key={step.num}
            className="flex items-start gap-4 p-4 rounded-xl border border-[#e2e8f0] bg-white"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 + i * 0.1, duration: 0.3 }}
          >
            {/* Number circle */}
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-sm font-bold"
              style={{ background: step.bg, color: step.color }}
            >
              {step.num}
            </div>

            {/* Text */}
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-[#0f172b] mb-0.5">{step.title}</h3>
              <p className="text-xs text-[#62748e] leading-relaxed">{step.description}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Time estimate */}
      <div className="flex items-center gap-1.5 text-xs text-[#94a3b8] mb-6" style={{ fontWeight: 500 }}>
        <Clock className="w-3.5 h-3.5" />
        <span> Time in practice: ~15-20 min</span>
      </div>

      {/* Motivational */}
      <p className="text-sm text-[#62748e] text-center mb-8 mt-2" style={{ fontWeight: 500 }}>
        Are you ready?
      </p>

      {/* CTA */}
      <motion.button
        onClick={onContinue}
        className="w-full py-3.5 rounded-full text-white font-semibold text-[15px] flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98]"
        style={{ background: "#0f172b" }}
        whileTap={{ scale: 0.97 }}
      >
        Let's Go
        <ArrowRight className="w-4 h-4" />
      </motion.button>
    </motion.div>
  );
}
