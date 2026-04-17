import { ArrowLeftRight } from "lucide-react";
import { motion } from "motion/react";
import type { LessonComparisonStep } from "@/services/types";

interface Props {
  data: LessonComparisonStep;
  footer?: React.ReactNode;
}

export function ComparisonStep({ data, footer }: Props) {
  return (
    <motion.div
      className="bg-white rounded-2xl border border-[#6366f1]/20 shadow-md shadow-[#6366f1]/5 overflow-hidden"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      {/* Card header */}
      <div className="px-6 py-6 md:px-8 md:py-7 flex items-start gap-4 border-b border-[#f1f5f9] bg-[#f8fafc]">
        <span className="w-9 h-9 rounded-xl bg-[#6366f1] flex items-center justify-center shrink-0 mt-0.5">
          <ArrowLeftRight className="w-4 h-4 text-white" />
        </span>
        <p className="text-[#0f172b] text-base md:text-lg leading-snug" style={{ fontWeight: 600 }}>
          {data.title}
        </p>
      </div>

      {/* Body */}
      <div className="px-6 py-6 md:px-8 flex flex-col gap-4">
        {/* Side-by-side comparison cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Weak side */}
          <div className="rounded-2xl border border-[#e2e8f0] overflow-hidden">
            <div className="px-4 py-3 bg-red-50 border-b border-red-100">
              <p className="text-[11px] text-red-600 uppercase tracking-wider" style={{ fontWeight: 700 }}>
                ✗ {data.weak.label}
              </p>
            </div>
            <div className="px-4 py-4">
              <p className="text-[14px] text-[#7f1d1d] leading-relaxed italic">
                &ldquo;{data.weak.script}&rdquo;
              </p>
            </div>
          </div>

          {/* Strong side */}
          <div className="rounded-2xl border border-[#e2e8f0] overflow-hidden">
            <div className="px-4 py-3 bg-emerald-50 border-b border-emerald-100">
              <p className="text-[11px] text-emerald-700 uppercase tracking-wider" style={{ fontWeight: 700 }}>
                ✓ {data.strong.label}
              </p>
            </div>
            <div className="px-4 py-4">
              <p className="text-[14px] text-[#14532d] leading-relaxed" style={{ fontWeight: 500 }}>
                &ldquo;{data.strong.script}&rdquo;
              </p>
            </div>
          </div>
        </div>

        {/* Analysis callout — indigo left border */}
        <div className="rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] px-5 py-4" style={{ borderLeft: "3px solid #6366f1" }}>
          <p className="text-[11px] text-[#6366f1] uppercase tracking-wider mb-2" style={{ fontWeight: 700 }}>
            Why this works
          </p>
          <p className="text-[14px] text-[#475569] leading-relaxed">
            {data.analysis}
          </p>
        </div>
      </div>

      {footer}
    </motion.div>
  );
}
