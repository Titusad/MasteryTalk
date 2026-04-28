import { BookOpen, Lightbulb } from "lucide-react";
import { motion } from "motion/react";
import type { LessonConceptStep } from "@/services/types";

interface Props {
  data: LessonConceptStep;
  footer?: React.ReactNode;
}

export function ConceptStep({ data, footer }: Props) {
  return (
    <motion.div aria-label="ConceptStep"
      className="bg-white rounded-2xl border border-[#6366f1]/20 shadow-md shadow-[#6366f1]/5 flex flex-col overflow-hidden"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      {/* Card header */}
      <div className="px-6 py-6 md:px-8 md:py-7 flex items-start gap-4 border-b border-[#f1f5f9] bg-[#f8fafc]">
        <span className="w-9 h-9 rounded-xl bg-[#6366f1] flex items-center justify-center shrink-0 mt-0.5">
          <BookOpen className="w-4 h-4 text-white" />
        </span>
        <div>
          <p className="text-[#0f172b] text-base md:text-lg leading-snug" style={{ fontWeight: 600 }}>
            {data.title}
          </p>
          {data.subtitle && (
            <p className="text-sm text-[#64748b] mt-1">{data.subtitle}</p>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="px-6 py-6 md:px-8">
        <p className="text-[#334155] text-[15px] leading-relaxed whitespace-pre-line">
          {data.body}
        </p>

        {/* Mental Model callout */}
        {data.mentalModel && (
          <div className="mt-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-[11px] text-amber-700 uppercase tracking-wider mb-1" style={{ fontWeight: 700 }}>
                Mental Model
              </p>
              <p className="text-sm text-amber-800 leading-relaxed" style={{ fontWeight: 500 }}>
                {data.mentalModel}
              </p>
            </div>
          </div>
        )}
      </div>

      {footer}
    </motion.div>
  );
}
