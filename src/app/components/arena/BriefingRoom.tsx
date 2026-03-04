/**
 * ══════════════════════════════════════════════════════════════
 *  Briefing Room Components
 *
 *  - BeforeAfterSection: Side-by-side comparison of user vs professional
 * ══════════════════════════════════════════════════════════════
 */
import { useState } from "react";
import {
  ArrowRight,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import type {
  BeforeAfterComparison,
} from "../../../services/types";

/* ══════════════════════════════════════════════════════════════
   COMPONENT: BeforeAfterSection
   ══════════════════════════════════════════════════════════════ */

interface BeforeAfterSectionProps {
  comparisons: BeforeAfterComparison[];
}

export function BeforeAfterSection({ comparisons }: BeforeAfterSectionProps) {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(0);

  if (comparisons.length === 0) return null;

  return (
    <motion.div
      className="mb-8"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <div className="space-y-3">
        {comparisons.map((comp, i) => {
          const isExpanded = expandedIdx === i;
          return (
            <motion.div
              key={i}
              className="bg-white border border-[#e2e8f0] rounded-2xl overflow-hidden"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 + i * 0.08 }}
            >
              <button
                onClick={() => setExpandedIdx(isExpanded ? null : i)}
                className="w-full text-left px-5 py-4 flex items-start gap-4 hover:bg-[#f8fafc] transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="text-xs px-2 py-0.5 rounded-full bg-[#fee2e2] text-[#991b1b]"
                      style={{ fontWeight: 500 }}
                    >
                      Before
                    </span>
                  </div>
                  <p className="text-sm text-[#64748b] italic line-clamp-2">
                    "{comp.userOriginal}"
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-[#45556c] mt-3 flex-shrink-0" />
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 border-t border-[#f1f5f9]">
                      <div className="pt-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className="text-xs px-2 py-0.5 rounded-full bg-[#dcfce7] text-[#166534]"
                            style={{ fontWeight: 500 }}
                          >
                            After
                          </span>
                          <Sparkles className="w-3 h-3 text-[#22c55e]" />
                        </div>
                        <p className="text-sm text-[#0f172b] leading-relaxed mb-3" style={{ fontWeight: 500 }}>
                          "{comp.professionalVersion}"
                        </p>
                        <div className="bg-[#f8fafc] rounded-xl px-4 py-3 border border-[#e2e8f0]">
                          <p className="text-xs text-[#45556c]">
                            <span style={{ fontWeight: 600, color: "#0f172b" }}>
                              Technique:
                            </span>{" "}
                            {comp.technique}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}