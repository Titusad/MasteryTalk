/**
 * PracticeSideNav — Sidebar widget for PracticeSessionPage.
 *
 * Displays levels of the active progression path. Allows navigating
 * between levels/sessions within the current path. Locked levels
 * are non-interactive.
 */

import { motion } from "motion/react";
import { Lock, Unlock, BookOpen, CheckCircle2, ChevronRight, X } from "lucide-react";
import { useProgressionState } from "@/features/dashboard/model/useProgressionState";
import {
  PROGRESSION_PATHS,
  getLevelState,
} from "@/features/dashboard/model/progression-paths";
import type { LevelStatus, ScenarioType } from "@/services/types";

const STATUS_CONFIG: Record<
  LevelStatus,
  { icon: any; label: string; color: string; bg: string; border: string }
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

interface PracticeSideNavProps {
  activePathId: ScenarioType;
  activeLevelId?: string;
  onLevelSwitch: (
    scenario: string,
    scenarioType: ScenarioType,
    levelId: string,
    interlocutor: string,
  ) => void;
  /** Mobile drawer mode */
  isDrawerOpen?: boolean;
  onDrawerClose?: () => void;
}

export function PracticeSideNav({
  activePathId,
  activeLevelId,
  onLevelSwitch,
  isDrawerOpen = false,
  onDrawerClose,
}: PracticeSideNavProps) {
  const { state, loading } = useProgressionState();
  const activePath = PROGRESSION_PATHS.find((p) => p.id === activePathId);

  if (!activePath) return null;

  const content = (
    <div className="h-full flex flex-col">
      {/* Path header */}
      <div className="px-5 pt-5 pb-3 border-b border-[#e2e8f0] shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">{activePath.icon}</span>
            <h3 className="text-sm font-bold text-[#0f172b] leading-tight">
              {activePath.title}
            </h3>
          </div>
          {/* Close button — only in drawer mode */}
          {onDrawerClose && (
            <button
              onClick={onDrawerClose}
              className="lg:hidden w-8 h-8 rounded-full flex items-center justify-center text-[#62748e] hover:bg-[#f1f5f9] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <p className="text-xs text-[#62748e] mt-1">
          {activePath.levels.length} levels
        </p>
      </div>

      {/* Level list */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1">
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <div className="w-5 h-5 rounded-full border-2 border-[#6366f1] border-t-transparent animate-spin" />
          </div>
        ) : (
          activePath.levels.map((level, i) => {
            const lvl = getLevelState(state, activePathId, level.id);
            const config = STATUS_CONFIG[lvl.status];
            const StatusIcon = config.icon;
            const isActive = level.id === activeLevelId;
            const isLocked = lvl.status === "locked";
            const isLast = i === activePath.levels.length - 1;

            return (
              <div key={level.id} className="relative">
                {/* Vertical connector */}
                {!isLast && (
                  <div
                    className="absolute left-[17px] top-[42px] w-0.5 h-[calc(100%-16px)]"
                    style={{
                      background:
                        lvl.status === "completed"
                          ? "linear-gradient(to bottom, #22c55e, #e2e8f0)"
                          : "#e2e8f0",
                    }}
                  />
                )}

                <motion.button
                  disabled={isLocked}
                  onClick={() => {
                    if (!isLocked && !isActive) {
                      onLevelSwitch(
                        level.scenario,
                        activePathId,
                        level.id,
                        level.interlocutor,
                      );
                    }
                  }}
                  className={`
                    relative z-10 w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-200
                    ${isLocked ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-[#f8fafc]"}
                    ${isActive ? "bg-[#f0f0ff] ring-1 ring-[#6366f1]/20" : ""}
                  `}
                  initial={false}
                  animate={isActive ? { scale: 1 } : { scale: 1 }}
                  whileHover={!isLocked ? { x: 2 } : undefined}
                >
                  {/* Level circle */}
                  <div
                    className="w-[34px] h-[34px] rounded-full flex items-center justify-center shrink-0"
                    style={{
                      background:
                        lvl.status === "completed"
                          ? "#22c55e"
                          : isActive
                            ? "#6366f1"
                            : lvl.status === "locked"
                              ? "#f1f5f9"
                              : config.bg,
                      border: `2px solid ${
                        lvl.status === "completed"
                          ? "#22c55e"
                          : isActive
                            ? "#6366f1"
                            : lvl.status === "locked"
                              ? "#e2e8f0"
                              : config.border
                      }`,
                    }}
                  >
                    {lvl.status === "completed" ? (
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    ) : (
                      <span
                        className="text-xs font-bold"
                        style={{
                          color:
                            isActive
                              ? "#fff"
                              : lvl.status === "locked"
                                ? "#94a3b8"
                                : config.color,
                        }}
                      >
                        {level.level}
                      </span>
                    )}
                  </div>

                  {/* Label + status */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[13px] font-semibold truncate ${
                          isActive ? "text-[#4338ca]" : "text-[#0f172b]"
                        }`}
                      >
                        {level.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <StatusIcon
                        className="w-3 h-3"
                        style={{ color: config.color }}
                      />
                      <span
                        className="text-[10px] font-medium"
                        style={{ color: config.color }}
                      >
                        {config.label}
                      </span>
                    </div>
                  </div>

                  {/* Arrow for interactive levels */}
                  {!isLocked && (
                    <ChevronRight
                      className={`w-3.5 h-3.5 shrink-0 transition-colors ${
                        isActive ? "text-[#6366f1]" : "text-[#cbd5e1]"
                      }`}
                    />
                  )}
                </motion.button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop: static sidebar */}
      <aside className="hidden lg:block w-[280px] shrink-0 border-r border-[#e2e8f0] bg-white overflow-hidden">
        {content}
      </aside>

      {/* Mobile: drawer overlay */}
      {isDrawerOpen && (
        <>
          {/* Backdrop */}
          <div
            className="lg:hidden fixed inset-0 z-[200] bg-black/30 backdrop-blur-[2px]"
            onClick={onDrawerClose}
          />
          {/* Drawer panel */}
          <motion.div
            className="lg:hidden fixed inset-y-0 left-0 z-[201] w-[300px] bg-white shadow-2xl"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
          >
            {content}
          </motion.div>
        </>
      )}
    </>
  );
}
