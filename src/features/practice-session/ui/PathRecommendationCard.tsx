/**
 * PathRecommendationCard — Post warm-up recommendation
 *
 * Renders inside the feedback step when scenarioType === "self-intro".
 * Educational tone — not a sales modal.
 */

import { motion } from "motion/react";
import { ArrowRight, Target, Briefcase, Video, Mic, Handshake, Crown, Sparkles } from "lucide-react";
import type { PathRecommendation } from "@/features/dashboard/model/path-recommendation";
import type { LucideIcon } from "lucide-react";

const PATH_ICONS: Record<string, LucideIcon> = {
  target: Target,
  briefcase: Briefcase,
  video: Video,
  mic: Mic,
  handshake: Handshake,
  crown: Crown,
};

interface PathRecommendationCardProps {
  recommendation: PathRecommendation;
  onStartPath: () => void;
  onExploreAll: () => void;
}

export function PathRecommendationCard({
  recommendation,
  onStartPath,
  onExploreAll,
}: PathRecommendationCardProps) {
  const Icon = PATH_ICONS[recommendation.pathIcon] || Target;

  return (
    <motion.div
      className="mt-8 mb-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      {/* Separator */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 h-px bg-[#e2e8f0]" />
        <span className="flex items-center gap-1.5 text-xs text-[#94a3b8]" style={{ fontWeight: 500 }}>
          <Sparkles className="w-3 h-3" />
          Based on your session
        </span>
        <div className="flex-1 h-px bg-[#e2e8f0]" />
      </div>

      {/* Card */}
      <div className="bg-gradient-to-br from-[#0f172b] to-[#1e293b] rounded-2xl p-6 relative overflow-hidden">
        {/* Decorative gradient orb */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-gradient-to-br from-[#6366f1]/20 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative">
          {/* Header */}
          <div className="flex items-start gap-4 mb-4">
            {/* Path icon */}
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center shrink-0">
              <Icon className="w-6 h-6 text-white" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-xs text-[#94a3b8] mb-1" style={{ fontWeight: 500 }}>
                Your Recommended Next Step
              </p>
              <h3 className="text-xl text-white" style={{ fontWeight: 700 }}>
                {recommendation.pathTitle}
              </h3>
            </div>
          </div>

          {/* Reason */}
          <p className="text-sm text-white/80 leading-relaxed mb-2">
            {recommendation.reason}
          </p>

          {/* Focus detail */}
          <p className="text-xs text-white/50 mb-6">
            {recommendation.focusDetail}
          </p>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onStartPath}
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-white text-[#0f172b] text-sm hover:bg-[#f8fafc] transition-colors cursor-pointer"
              style={{ fontWeight: 600 }}
            >
              Start This Path
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onExploreAll}
              className="text-sm text-white/60 hover:text-white transition-colors cursor-pointer"
              style={{ fontWeight: 500 }}
            >
              Or explore all paths
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
