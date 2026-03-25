/**
 * ══════════════════════════════════════════════════════════════
 *  ProgressionTree — Dashboard component
 *  Tabbed view (Interview / Sales) showing level progression.
 *  Status badges, scores, CTAs, and vertical connector lines.
 * ══════════════════════════════════════════════════════════════
 */

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Lock, Unlock, BookOpen, CheckCircle2, ChevronRight, Trophy, Sparkles } from "lucide-react";
import {
  PROGRESSION_PATHS,
  getDefaultProgressionState,
  getLevelState,
  type ProgressionPath,
  type ProgressionLevel,
} from "./progression-paths";
import type { ProgressionState, LevelStatus } from "../../../services/types";
import { projectId } from "../../../../utils/supabase/info";
import { getAuthToken } from "../../../services/supabase";

/* ── Status Badge ── */

const STATUS_CONFIG: Record<
  LevelStatus,
  { icon: typeof Lock; label: string; color: string; bg: string; border: string }
> = {
  locked: {
    icon: Lock,
    label: "Locked",
    color: "#94a3b8",
    bg: "rgba(148, 163, 184, 0.08)",
    border: "rgba(148, 163, 184, 0.2)",
  },
  unlocked: {
    icon: Unlock,
    label: "Ready",
    color: "#6366f1",
    bg: "rgba(99, 102, 241, 0.08)",
    border: "rgba(99, 102, 241, 0.3)",
  },
  study: {
    icon: BookOpen,
    label: "Study Phase",
    color: "#f59e0b",
    bg: "rgba(245, 158, 11, 0.08)",
    border: "rgba(245, 158, 11, 0.3)",
  },
  completed: {
    icon: CheckCircle2,
    label: "Completed",
    color: "#22c55e",
    bg: "rgba(34, 197, 94, 0.08)",
    border: "rgba(34, 197, 94, 0.3)",
  },
};

/* ── Props ── */

interface ProgressionTreeProps {
  onStartLevel: (
    scenario: string,
    scenarioType: "interview" | "sales",
    levelId: string,
    interlocutor: string,
  ) => void;
  onContinueStudy: (
    pathId: "interview" | "sales",
    levelId: string,
  ) => void;
}

/* ── Component ── */

export function ProgressionTree({ onStartLevel, onContinueStudy }: ProgressionTreeProps) {
  const [activeTab, setActiveTab] = useState<"interview" | "sales">("interview");
  const [state, setState] = useState<ProgressionState>(getDefaultProgressionState);
  const [loading, setLoading] = useState(true);

  /* Fetch progression state from backend */
  const fetchState = useCallback(async () => {
    try {
      const token = await getAuthToken();
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-08b8658d/progression`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (res.ok) {
        const data = await res.json();
        setState(data);
        if (data.activeGoal === "sales" || data.activeGoal === "interview") {
          setActiveTab(data.activeGoal);
        }
      }
    } catch (err) {
      console.error("[ProgressionTree] Failed to fetch state:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchState();
  }, [fetchState]);

  const activePath = PROGRESSION_PATHS.find((p) => p.id === activeTab)!;

  return (
    <motion.div
      className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm overflow-hidden"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
    >
      {/* Header + Tabs */}
      <div className="px-5 pt-5 pb-0">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-[#f59e0b]" />
          <h3 className="text-base text-[#0f172b]" style={{ fontWeight: 700 }}>
            Your Learning Path
          </h3>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-1 p-1 bg-[#f1f5f9] rounded-xl mb-1">
          {PROGRESSION_PATHS.map((path) => (
            <button
              key={path.id}
              onClick={() => setActiveTab(path.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 cursor-pointer ${
                activeTab === path.id
                  ? "bg-white text-[#0f172b] shadow-sm"
                  : "text-[#62748e] hover:text-[#0f172b]"
              }`}
              style={{ fontWeight: activeTab === path.id ? 600 : 500 }}
            >
              <span className="text-base">{path.icon}</span>
              {path.title}
            </button>
          ))}
        </div>
      </div>

      {/* Level Cards */}
      <div className="px-5 pb-5 pt-4">
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <div className="w-6 h-6 rounded-full border-2 border-[#6366f1] border-t-transparent animate-spin" />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-0"
            >
              {activePath.levels.map((level, i) => {
                const lvl = getLevelState(state, activeTab, level.id);
                const config = STATUS_CONFIG[lvl.status];
                const StatusIcon = config.icon;
                const isLast = i === activePath.levels.length - 1;

                return (
                  <div key={level.id} className="relative">
                    {/* Vertical connector line */}
                    {!isLast && (
                      <div
                        className="absolute left-[22px] top-[56px] w-0.5 bottom-0 z-0"
                        style={{
                          background:
                            lvl.status === "completed"
                              ? "linear-gradient(to bottom, #22c55e, #e2e8f0)"
                              : "#e2e8f0",
                        }}
                      />
                    )}

                    <motion.div
                      className="relative z-10 flex items-start gap-4 py-3 group"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 * i }}
                    >
                      {/* Level number circle */}
                      <div
                        className="w-[44px] h-[44px] rounded-full flex items-center justify-center shrink-0 transition-all duration-300"
                        style={{
                          background: lvl.status === "completed"
                            ? "#22c55e"
                            : lvl.status === "locked"
                              ? "#f1f5f9"
                              : config.bg,
                          border: `2px solid ${
                            lvl.status === "completed"
                              ? "#22c55e"
                              : lvl.status === "locked"
                                ? "#e2e8f0"
                                : config.border
                          }`,
                        }}
                      >
                        {lvl.status === "completed" ? (
                          <CheckCircle2 className="w-5 h-5 text-white" />
                        ) : (
                          <span
                            className="text-sm"
                            style={{ fontWeight: 700, color: config.color }}
                          >
                            {level.level}
                          </span>
                        )}
                      </div>

                      {/* Card content */}
                      <div
                        className={`flex-1 rounded-xl p-4 transition-all duration-200 ${
                          lvl.status === "locked"
                            ? "bg-[#f8fafc] opacity-60"
                            : "bg-white border border-[#e2e8f0] hover:border-[#c4b5fd] hover:shadow-sm cursor-pointer"
                        }`}
                        onClick={() => {
                          if (lvl.status === "unlocked") {
                            onStartLevel(level.scenario, activeTab, level.id, level.interlocutor);
                          } else if (lvl.status === "study") {
                            onContinueStudy(activeTab, level.id);
                          }
                        }}
                      >
                        <div className="flex items-start justify-between mb-1">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-0.5">
                              <h4
                                className="text-sm text-[#0f172b] truncate"
                                style={{ fontWeight: 600 }}
                              >
                                {level.title}
                              </h4>
                              <span
                                className="text-[10px] px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1"
                                style={{
                                  fontWeight: 600,
                                  backgroundColor: config.bg,
                                  color: config.color,
                                  border: `1px solid ${config.border}`,
                                }}
                              >
                                <StatusIcon className="w-3 h-3" />
                                {config.label}
                              </span>
                            </div>
                            <p className="text-[11px] text-[#62748e] leading-relaxed line-clamp-2">
                              {level.interlocutorBehavior}
                            </p>
                          </div>
                        </div>

                        {/* Score + Attempts (only for levels with data) */}
                        {(lvl.bestScore ?? 0) > 0 && (
                          <div className="flex items-center gap-3 mt-2">
                            <span
                              className="text-[10px] px-2 py-0.5 rounded-full bg-[#f1f5f9] text-[#45556c]"
                              style={{ fontWeight: 600 }}
                            >
                              Best: {lvl.bestScore}%
                            </span>
                            {(lvl.attempts ?? 0) > 0 && (
                              <span className="text-[10px] text-[#94a3b8]">
                                {lvl.attempts} attempt{(lvl.attempts ?? 0) !== 1 ? "s" : ""}
                              </span>
                            )}
                          </div>
                        )}

                        {/* CTA */}
                        {lvl.status === "unlocked" && (
                          <motion.div
                            className="flex items-center gap-1.5 mt-3"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 + i * 0.05 }}
                          >
                            <span
                              className="text-xs text-[#6366f1] flex items-center gap-1"
                              style={{ fontWeight: 600 }}
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              Start Practice
                              <ChevronRight className="w-3.5 h-3.5" />
                            </span>
                          </motion.div>
                        )}

                        {lvl.status === "study" && (
                          <motion.div
                            className="flex items-center gap-1.5 mt-3"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                          >
                            <span
                              className="text-xs text-[#f59e0b] flex items-center gap-1"
                              style={{ fontWeight: 600 }}
                            >
                              <BookOpen className="w-3.5 h-3.5" />
                              Continue Study
                              <ChevronRight className="w-3.5 h-3.5" />
                            </span>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  </div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  );
}
