import { Target } from "lucide-react";
import { motion } from "motion/react";
import type { LessonScenarioStep } from "@/services/types";

interface Props {
  data: LessonScenarioStep;
  footer?: React.ReactNode;
}

export function ScenarioStep({ data, footer }: Props) {
  return (
    <motion.div aria-label="ScenarioStep"
      className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm flex flex-col overflow-hidden"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      {/* Card header */}
      <div className="px-6 py-6 md:px-8 md:py-7 flex items-start gap-4 border-b border-[#f1f5f9] bg-[#f8fafc]">
        <span className="w-9 h-9 rounded-xl bg-[#6366f1] flex items-center justify-center shrink-0 mt-0.5">
          <Target className="w-4 h-4 text-white" />
        </span>
        <p className="text-[#0f172b] text-base md:text-lg leading-snug" style={{ fontWeight: 600 }}>
          {data.title}
        </p>
      </div>

      {/* Body */}
      <div className="px-6 py-6 md:px-8 flex flex-col gap-4">
        {/* Context */}
        <div className="p-5 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0]">
          <p className="text-[11px] text-[#64748b] uppercase tracking-wider mb-2" style={{ fontWeight: 700 }}>
            Your Role &amp; Situation
          </p>
          <p className="text-[#334155] text-[15px] leading-relaxed">
            {data.context}
          </p>
        </div>

        {/* Challenge */}
        <div className="p-5 rounded-2xl bg-[#eff6ff] border border-[#bfdbfe]">
          <p className="text-[11px] text-[#1d4ed8] uppercase tracking-wider mb-2" style={{ fontWeight: 700 }}>
            Your Challenge
          </p>
          <p className="text-[#1e3a5f] text-[15px] leading-relaxed" style={{ fontWeight: 500 }}>
            {data.challenge}
          </p>
        </div>
      </div>

      {footer}
    </motion.div>
  );
}
