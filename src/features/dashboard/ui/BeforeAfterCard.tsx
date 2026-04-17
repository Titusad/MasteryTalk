/**
 * BeforeAfterCard — Shows latest before/after improvement example
 * Presentational component (web-specific).
 */
import { motion } from "motion/react";
import { Award } from "lucide-react";

interface BeforeAfterCardProps {
  data: {
    userOriginal: string;
    professionalVersion: string;
    technique: string;
    sessionTitle: string;
  };
  dc: {
    improvement: {
      title: string;
      youSaid: string;
      proVersion: string;
      technique: string;
    };
  };
}

export function BeforeAfterCard({ data, dc }: BeforeAfterCardProps) {
  return (
    <motion.div
      className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm p-5 mb-6"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.22 }}
      aria-label="Before and after comparison"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-[#14b8a6]" />
          <h3
            className="text-sm text-[#0f172b]"
            style={{ fontWeight: 600 }}
          >
            {dc.improvement.title}
          </h3>
        </div>
        <span
          className="text-[10px] text-[#62748e] bg-[#f1f5f9] px-2.5 py-1 rounded-full"
          style={{ fontWeight: 500 }}
        >
          {data.sessionTitle}
        </span>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-red-50/60 rounded-xl p-4 border border-red-100">
          <p
            className="text-[10px] text-red-400 mb-2 uppercase tracking-wider"
            style={{ fontWeight: 600 }}
          >
            {dc.improvement.youSaid}
          </p>
          <p className="text-sm text-[#334155] leading-relaxed italic">
            &ldquo;{data.userOriginal}&rdquo;
          </p>
        </div>
        <div className="bg-green-50/60 rounded-xl p-4 border border-green-100">
          <p
            className="text-[10px] text-green-500 mb-2 uppercase tracking-wider"
            style={{ fontWeight: 600 }}
          >
            {dc.improvement.proVersion}
          </p>
          <p
            className="text-sm text-[#334155] leading-relaxed"
            style={{ fontWeight: 500 }}
          >
            &ldquo;{data.professionalVersion}&rdquo;
          </p>
        </div>
      </div>
      {data.technique && (
        <div className="mt-3 flex items-start gap-2">
          <div className="w-1 h-1 rounded-full bg-[#14b8a6] mt-1.5 shrink-0" />
          <p className="text-[11px] text-[#62748e] leading-relaxed">
            <span style={{ fontWeight: 600, color: "#14b8a6" }}>
              {dc.improvement.technique}:
            </span>{" "}
            {data.technique}
          </p>
        </div>
      )}
    </motion.div>
  );
}
