import { SUPABASE_URL } from "@/services/supabase";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Lock, Unlock, BookOpen, CheckCircle2, Target, Briefcase, Video, Mic, Handshake, Crown } from "lucide-react";
import type { LucideIcon } from "lucide-react";

/* Map icon name → Lucide component */
const PATH_ICONS: Record<string, LucideIcon> = {
  target: Target,
  briefcase: Briefcase,
  video: Video,
  mic: Mic,
  handshake: Handshake,
  crown: Crown,
};

import {
  PROGRESSION_PATHS,
  VISIBLE_PATHS,
  getLevelState,
} from "@/features/dashboard/model/progression-paths";
import type { PathId } from "@/features/dashboard/model/progression-paths";
import { useProgressionState } from "@/features/dashboard/model/useProgressionState";
import type { LevelStatus, ScenarioType } from "@/services/types";
import { projectId } from "@/../utils/supabase/info";
import { getAuthToken } from "@/services/supabase";

import { LevelNode } from "./LevelNode";

export const STATUS_CONFIG: Record<
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

interface ProgressionTreeProps {
  onStartLevel: (
    scenario: string,
    scenarioType: ScenarioType,
    levelId: string,
    interlocutor: string,
  ) => void;
  onDrillComplete?: (pathId: string, levelId: string, score: number) => void;
}

export function ProgressionTree({ onStartLevel, onDrillComplete }: ProgressionTreeProps) {
  const [activeTab, setActiveTab] = useState<PathId>("interview");
  const { state, loading, refetch: fetchState } = useProgressionState();

  useEffect(() => {
    if (state.activeGoal) {
      setActiveTab(state.activeGoal as PathId);
    }
  }, [state.activeGoal]);

  const activePath = PROGRESSION_PATHS.find((p) => p.id === activeTab)!;

  const handleNodeClick = (levelId: string, status: LevelStatus, level: any) => {
    if (status === "locked") return;
    // Both "unlocked" and "study" levels launch a practice session
    // (learning content is now embedded in the session's Preparation phase)
    onStartLevel(level.scenario, activeTab, level.id, level.interlocutor);
  };

  const handleDrillCompletion = async (levelId: string, score: number) => {
    if (onDrillComplete) {
      onDrillComplete(activeTab, levelId, score);
    }

    try {
      const token = await getAuthToken();
      await fetch(
        `${SUPABASE_URL}/functions/v1/make-server-08b8658d/progression/complete-remedial`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ pathId: activeTab, levelId, shadowingScore: score }),
        },
      );
      fetchState();
    } catch (err) {
      console.error("Failed to complete remedial", err);
    }
  };



  return (
    <>
      <motion.div aria-label="ProgressionTree"
        className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm overflow-hidden"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        {/* Path Tabs */}
        <div className="px-5 pt-5 pb-0">
          <div className="flex gap-1 p-1 bg-[#f1f5f9] rounded-xl mb-1 overflow-x-auto">
            {VISIBLE_PATHS.map((path) => (
              <button
                key={path.id}
                onClick={() => {
                  setActiveTab(path.id as PathId);
                }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  activeTab === path.id
                    ? "bg-white text-[#0f172b] shadow-sm"
                    : "text-[#62748e] hover:text-[#0f172b]"
                }`}
                style={{ fontWeight: activeTab === path.id ? 600 : 500 }}
                title={path.title}
              >
                {(() => {
                  const Icon = PATH_ICONS[path.icon];
                  return Icon ? (
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#0f172b]">
                      <Icon size={11} color="#fff" />
                    </span>
                  ) : null;
                })()}
                <span className="hidden sm:inline">{path.title}</span>
                <span className="sm:hidden">{path.title.split(' ')[0]}</span>
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
                  const isLast = i === activePath.levels.length - 1;

                  return (
                    <LevelNode
                      key={level.id}
                      level={level}
                      status={lvl.status}
                      config={config}
                      isLast={isLast}
                    onClick={() => handleNodeClick(level.id, lvl.status, level)}
                    />
                  );
                })}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </motion.div>


    </>
  );
}
