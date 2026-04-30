/**
 * PracticePathsModule — Right column wrapper for the dashboard.
 * Delegates to the existing ProgressionTree which uses VISIBLE_PATHS,
 * useProgressionState, and LevelNode — the real data source with all 6 paths.
 */
import { motion } from "motion/react";
import { ProgressionTree } from "./progression-tree/ProgressionTree";
import type { ScenarioType } from "@/services/types";

interface PracticePathsModuleProps {
  onStartSession: (scenario: string, scenarioType?: string, levelId?: string, interlocutor?: string) => void;
  onLockedClick?: () => void;
}

export function PracticePathsModule({ onStartSession, onLockedClick }: PracticePathsModuleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <ProgressionTree
        onStartLevel={(scenario, scenarioType, levelId, interlocutor) => {
          onStartSession(scenario, scenarioType, levelId, interlocutor);
        }}
        onLockedClick={onLockedClick}
      />
    </motion.div>
  );
}
