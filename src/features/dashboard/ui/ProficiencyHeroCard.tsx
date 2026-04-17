/**
 * ProficiencyHeroCard — Dark proficiency score card with ring, CEFR, focus areas
 * Presentational component (web-specific).
 */
import { useState } from "react";
import { motion } from "motion/react";
import { Info, Target } from "lucide-react";
import { ProficiencyRing } from "./ProficiencyRing";
import { PILLAR_COLORS, type RadarDataPoint } from "../model/dashboard.constants";
import { computeFocusAreas } from "../model/dashboard.computations";
import type { PersistedSession } from "../../../../services/adapters/supabase/dashboard.supabase";

interface ProficiencyHeroCardProps {
  proficiencyScore: number;
  proficiencyDelta: number;
  cefrApprox: { level: string; label: string };
  radarData: RadarDataPoint[];
  biggestImprovement: { pillar: string; delta: number } | null;
  persistedSessions: PersistedSession[];
  dc: {
    proficiency: {
      descWithData: string;
      descEmpty: string;
      cefrTitle: string;
      cefrDisclaimer: string;
    };
  };
}

export function ProficiencyHeroCard({
  proficiencyScore,
  proficiencyDelta,
  cefrApprox,
  radarData,
  biggestImprovement,
  persistedSessions,
  dc,
}: ProficiencyHeroCardProps) {
  const [showCEFRTooltip, setShowCEFRTooltip] = useState(false);
  const areas = computeFocusAreas(radarData);

  return (
    <motion.div
      className="bg-gradient-to-br from-[#0f172b] to-[#1e293b] rounded-2xl shadow-lg p-5 md:p-6 mb-6 relative overflow-hidden"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05, duration: 0.5 }}
    >
      {/* Decorative orbs */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative flex flex-col sm:flex-row items-center gap-5 sm:gap-8">
        {/* Ring + Score */}
        <div className="relative shrink-0">
          <ProficiencyRing score={proficiencyScore} size={110} strokeWidth={8} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {proficiencyScore > 0 ? (
              <>
                <motion.span
                  className="text-white text-2xl leading-none"
                  style={{ fontWeight: 700 }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  {proficiencyScore}%
                </motion.span>
                {proficiencyDelta !== 0 && (
                  <motion.span
                    className={`text-[11px] leading-none mt-0.5 ${
                      proficiencyDelta > 0
                        ? "text-emerald-400"
                        : "text-red-400"
                    }`}
                    style={{ fontWeight: 600 }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                  >
                    {proficiencyDelta > 0 ? "+" : ""}
                    {proficiencyDelta}
                  </motion.span>
                )}
              </>
            ) : (
              <span
                className="text-white/40 text-lg"
                style={{ fontWeight: 600 }}
              >
                —
              </span>
            )}
          </div>
        </div>

        {/* Text content */}
        <div className="flex-1 text-center sm:text-left">
          <h3
            className="text-white text-lg md:text-xl mb-1"
            style={{ fontWeight: 600 }}
          >
            Professional Proficiency
          </h3>
          <p className="text-white/60 text-sm leading-relaxed mb-3 max-w-md">
            {proficiencyScore > 0
              ? dc.proficiency.descWithData
              : dc.proficiency.descEmpty}
          </p>

          {/* CEFR Footnote */}
          {proficiencyScore > 0 && (
            <div className="relative inline-flex items-center gap-1.5">
              <button
                className="flex items-center gap-1.5 bg-white/10 hover:bg-white/15 rounded-full px-3 py-1.5 transition-colors cursor-pointer"
                onClick={() => setShowCEFRTooltip((prev) => !prev)}
                onBlur={() => setShowCEFRTooltip(false)}
              >
                <span
                  className="text-white text-xs"
                  style={{ fontWeight: 600 }}
                >
                  ~{cefrApprox.level}
                </span>
                <span className="text-white/50 text-[11px]">
                  {cefrApprox.label}
                </span>
                <Info className="w-3 h-3 text-white/40" />
              </button>
              {showCEFRTooltip && (
                <motion.div
                  className="absolute bottom-full left-0 mb-2 bg-white rounded-xl shadow-xl border border-[#e2e8f0] p-3 w-64 z-10"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <p
                    className="text-[11px] text-[#0f172b] mb-1"
                    style={{ fontWeight: 600 }}
                  >
                    {dc.proficiency.cefrTitle}
                  </p>
                  <p className="text-[10px] text-[#62748e] leading-relaxed">
                    {dc.proficiency.cefrDisclaimer}
                  </p>
                </motion.div>
              )}
            </div>
          )}

          {/* Pillar mini-bars */}
          {proficiencyScore > 0 && (
            <div className="flex flex-wrap gap-x-3 gap-y-1.5 mt-3">
              {radarData
                .filter((d) => d.score > 0)
                .map((d) => (
                  <div key={d.skill} className="flex items-center gap-1.5">
                    <div
                      className="h-1.5 rounded-full"
                      style={{
                        width: `${Math.max(16, d.score * 0.4)}px`,
                        backgroundColor:
                          PILLAR_COLORS[d.skill] || "#6366f1",
                        opacity: 0.8,
                      }}
                    />
                    <span className="text-[10px] text-white/40">
                      {d.skill === "Professional Tone"
                        ? "Prof. Tone"
                        : d.skill}
                    </span>
                  </div>
                ))}
            </div>
          )}

          {/* Narrative Progress */}
          {proficiencyScore > 0 && (
            <motion.div
              className="mt-4 bg-white/5 border border-white/10 rounded-xl px-4 py-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
            >
              <p className="text-sm text-white/80 leading-relaxed">
                {proficiencyDelta > 0 && biggestImprovement
                  ? `You've improved +${proficiencyDelta} points since your last session, with your strongest gain in ${biggestImprovement.pillar}.`
                  : proficiencyDelta < 0
                    ? `Your score dipped ${proficiencyDelta} points — that's normal. Focus on your areas below to bounce back.`
                    : persistedSessions.length === 1
                      ? "Great start! Complete more sessions to track your progress over time."
                      : "You're holding steady. Push yourself with a new scenario to unlock growth."}
              </p>
            </motion.div>
          )}

          {/* Focus Areas */}
          {areas.length > 0 && (
            <motion.div
              className="mt-4 space-y-2"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
            >
              <p
                className="text-[10px] uppercase tracking-wider text-white/40 mb-2"
                style={{ fontWeight: 600 }}
              >
                Focus Areas
              </p>
              {areas.map((area) => (
                <div
                  key={area.pillar}
                  className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3"
                >
                  <Target className="w-4 h-4 text-[#f59e0b] shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span
                        className="text-sm text-white"
                        style={{ fontWeight: 500 }}
                      >
                        {area.pillar}
                      </span>
                      <span
                        className="text-[10px] px-2 py-0.5 rounded-full"
                        style={{
                          fontWeight: 600,
                          backgroundColor:
                            area.score >= 60
                              ? "rgba(245,158,11,0.2)"
                              : "rgba(239,68,68,0.2)",
                          color:
                            area.score >= 60 ? "#fbbf24" : "#f87171",
                        }}
                      >
                        {area.score}%
                      </span>
                    </div>
                    <p className="text-xs text-white/50 leading-relaxed">
                      {area.tip}
                    </p>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
