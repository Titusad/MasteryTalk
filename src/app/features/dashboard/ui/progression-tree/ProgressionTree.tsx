import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Lock, Unlock, BookOpen, CheckCircle2, Target, Briefcase } from "lucide-react";

import {
  PROGRESSION_PATHS,
  getDefaultProgressionState,
  getLevelState,
} from "@/app/features/dashboard/model/progression-paths";
import type { ProgressionState, LevelStatus } from "@/services/types";
import { projectId } from "@/../utils/supabase/info";
import { getAuthToken } from "@/services/supabase";

import { LevelNode } from "./LevelNode";
import { LevelDrawer } from "./LevelDrawer";

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

interface ProgressionTreeProps {
  onStartLevel: (
    scenario: string,
    scenarioType: "interview" | "sales",
    levelId: string,
    interlocutor: string,
  ) => void;
  onDrillComplete?: (pathId: string, levelId: string, score: number) => void;
}

export function ProgressionTree({ onStartLevel, onDrillComplete }: ProgressionTreeProps) {
  const [activeTab, setActiveTab] = useState<"interview" | "sales">("interview");
  const [state, setState] = useState<ProgressionState>(getDefaultProgressionState);
  const [loading, setLoading] = useState(true);

  // Drawer state: which level is open in the drawer
  const [drawerLevelId, setDrawerLevelId] = useState<string | null>(null);

  const fetchState = useCallback(async () => {
    try {
      const token = await getAuthToken();
      if (!token) return;

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

  const handleNodeClick = (levelId: string, status: LevelStatus, level: any) => {
    if (status === "locked") return;

    if (status === "unlocked") {
      onStartLevel(level.scenario, activeTab, level.id, level.interlocutor);
    } else {
      // study or completed → open drawer
      setDrawerLevelId(levelId);
    }
  };

  const handleDrillCompletion = async (levelId: string, score: number) => {
    if (onDrillComplete) {
      onDrillComplete(activeTab, levelId, score);
    }

    try {
      const token = await getAuthToken();
      await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-08b8658d/progression/complete-remedial`,
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

  // Find the level object that is currently open in the drawer
  const drawerLevel = drawerLevelId
    ? activePath.levels.find((l) => l.id === drawerLevelId)
    : null;
  const drawerLvlState = drawerLevelId
    ? getLevelState(state, activeTab, drawerLevelId)
    : null;

  return (
    <>
      <motion.div
        className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm overflow-hidden"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        {/* Path Tabs */}
        <div className="px-5 pt-5 pb-0">
          <div className="flex gap-1 p-1 bg-[#f1f5f9] rounded-xl mb-1">
            {PROGRESSION_PATHS.map((path) => (
              <button
                key={path.id}
                onClick={() => {
                  setActiveTab(path.id as any);
                  setDrawerLevelId(null);
                }}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 cursor-pointer ${
                  activeTab === path.id
                    ? "bg-white text-[#0f172b] shadow-sm"
                    : "text-[#62748e] hover:text-[#0f172b]"
                }`}
                style={{ fontWeight: activeTab === path.id ? 600 : 500 }}
              >
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 24, height: 24, borderRadius: "50%", background: activeTab === path.id ? "#0f172b" : "#94a3b8", transition: "background 0.2s" }}>
                  {path.id === "interview" ? <Target size={12} color="#fff" /> : <Briefcase size={12} color="#fff" />}
                </span>
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
                  const isLast = i === activePath.levels.length - 1;

                  return (
                    <LevelNode
                      key={level.id}
                      level={level}
                      status={lvl.status}
                      config={config}
                      isLast={isLast}
                      isExpanded={drawerLevelId === level.id}
                      onClick={() => handleNodeClick(level.id, lvl.status, level)}
                    />
                  );
                })}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </motion.div>

      {/* Study Lesson Modal */}
      <LevelDrawer
        open={!!drawerLevel}
        pathId={activeTab}
        levelId={drawerLevelId || ""}
        levelTitle={drawerLevel?.title || ""}
        levelSubtitle={drawerLevel?.scenario || ""}
        onClose={() => setDrawerLevelId(null)}
        onLessonComplete={() => {
          setDrawerLevelId(null);
          fetchState(); // refresh progression after lesson completion
        }}
      />
    </>
  );
}
