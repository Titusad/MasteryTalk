import { motion } from "motion/react";
import { AlertTriangle } from "lucide-react";
import { PathSetupModal } from "@/features/practice-session/ui/PathSetupModal";
import { LevelMilestoneModal } from "@/features/practice-session/ui/LevelMilestoneModal";
import { PathPurchaseModal } from "@/widgets/PathPurchaseModal";
import { LessonModal } from "@/widgets/LessonModal";
import type { ScenarioType, OnboardingProfile, PurchaseType } from "@/services/types";
import type { PathId } from "@/entities/progression";
import type { ProgressionLevel } from "@/entities/progression/path-types";
import type { PaywallReason } from "@/shared/hooks/useUsageGating";
import type { MicroLesson } from "@/services/microLessons";

interface PendingSwitch {
  scenario: string;
  scenarioType: ScenarioType;
  levelId: string;
  interlocutor: string;
}

export interface SessionModalLayerProps {
  // Exit confirm dialog
  showExitConfirm: boolean;
  setShowExitConfirm: (v: boolean) => void;
  onGoToDashboard?: () => void;

  // Path setup modal
  pathSetupDone: boolean;
  progressionPathId?: PathId;
  userProfile?: OnboardingProfile | null;
  onPathSetupComplete: (updates: Partial<OnboardingProfile>) => void;

  // Deep dive lesson modal
  deepDiveLessonOpen: boolean;
  deepDiveLessons: MicroLesson[];
  deepDiveLessonIndex: number;
  setDeepDiveLessonOpen: (v: boolean) => void;
  setDeepDiveLessonIndex: (i: number) => void;

  // Level milestone modal
  levelMilestoneOpen: boolean;
  setLevelMilestoneOpen: (v: boolean) => void;
  progressionLevelDef?: ProgressionLevel | null;
  realFeedbackProficiency?: number;

  // Paywall modal
  paywallOpen: boolean;
  setPaywallOpen: (v: boolean) => void;
  paywallReason: PaywallReason | null;
  setPaywallReason: (r: PaywallReason | null) => void;
  scenarioType?: ScenarioType;
  recommendedPathOverride: ScenarioType | null;
  ownedPaths: string[];
  onPurchaseComplete: (purchaseType: PurchaseType) => void;
  selfIntroPrimaryPath?: string;

  // Pending level-switch confirm dialog
  pendingSwitch: PendingSwitch | null;
  setPendingSwitch: (v: PendingSwitch | null) => void;
  onConfirmSwitch: () => void;
}

export function SessionModalLayer({
  showExitConfirm, setShowExitConfirm, onGoToDashboard,
  pathSetupDone, progressionPathId, userProfile, onPathSetupComplete,
  deepDiveLessonOpen, deepDiveLessons, deepDiveLessonIndex, setDeepDiveLessonOpen, setDeepDiveLessonIndex,
  levelMilestoneOpen, setLevelMilestoneOpen, progressionLevelDef, realFeedbackProficiency,
  paywallOpen, setPaywallOpen, paywallReason, setPaywallReason,
  scenarioType, recommendedPathOverride, ownedPaths, onPurchaseComplete, selfIntroPrimaryPath,
  pendingSwitch, setPendingSwitch, onConfirmSwitch,
}: SessionModalLayerProps) {
  return (
    <>
      {/* Exit confirmation */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-sm mx-4 shadow-xl border border-[#e2e8f0]">
            <div className="flex items-center gap-3 mb-3">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <h3 className="text-lg text-[#0f172b] font-medium">Leave session?</h3>
            </div>
            <p className="text-sm text-[#45556c] mb-5">
              Your current session progress will be lost. Are you sure you want to go to the Dashboard?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-[#e2e8f0] text-sm text-[#45556c] hover:bg-[#f8fafc] transition-colors font-medium"
              >
                Stay
              </button>
              <button
                onClick={() => { setShowExitConfirm(false); onGoToDashboard?.(); }}
                className="flex-1 py-2.5 rounded-xl bg-[#0f172b] text-white text-sm hover:bg-[#1d293d] transition-colors font-medium"
              >
                Leave
              </button>
            </div>
          </div>
        </div>
      )}

      <PathSetupModal
        open={!pathSetupDone}
        pathId={progressionPathId ?? ""}
        userProfile={userProfile}
        onComplete={onPathSetupComplete}
      />

      {deepDiveLessonOpen && deepDiveLessons.length > 0 && (
        <LessonModal
          lessons={deepDiveLessons}
          currentIndex={deepDiveLessonIndex}
          onClose={() => setDeepDiveLessonOpen(false)}
          onNavigate={(i) => setDeepDiveLessonIndex(i)}
          onComplete={() => {}}
        />
      )}

      {progressionPathId && progressionLevelDef && (
        <LevelMilestoneModal
          open={levelMilestoneOpen}
          pathId={progressionPathId}
          levelNumber={progressionLevelDef.level}
          levelTitle={progressionLevelDef.title}
          score={Math.round(realFeedbackProficiency ?? 0)}
          onClose={() => setLevelMilestoneOpen(false)}
        />
      )}

      <PathPurchaseModal
        open={paywallOpen}
        onClose={() => { setPaywallOpen(false); setPaywallReason(null); }}
        scenarioType={recommendedPathOverride || scenarioType || "interview"}
        paywallReason={paywallReason ?? "path-required"}
        ownedPaths={ownedPaths}
        onPurchaseComplete={onPurchaseComplete}
        primaryPath={selfIntroPrimaryPath}
      />

      {pendingSwitch && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            onClick={() => setPendingSwitch(null)}
          />
          <motion.div
            className="relative z-10 bg-white rounded-2xl shadow-2xl p-6 mx-4 max-w-sm w-full"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <h3 className="text-[15px] font-bold text-[#0f172b]">Switch level?</h3>
                <p className="text-sm text-[#62748e] mt-0.5">
                  You have an active session in progress. Switching will reset your current progress.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setPendingSwitch(null)}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-[#45556c] bg-[#f1f5f9] hover:bg-[#e2e8f0] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onConfirmSwitch}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#6366f1] hover:bg-[#4f46e5] transition-colors"
              >
                Continue
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}
