/**
 * ══════════════════════════════════════════════════════════════
 *  DashboardPage — Smart Container (Orchestrator)
 *
 *  This component is the ONLY "smart" piece:
 *  - Calls useDashboardData() to get all state + computed data
 *  - Passes props down to "dumb" presentational sub-components
 *  - Handles UI-local state (modals, upsell flow)
 *
 *  📱 Mobile-Ready Architecture:
 *  - Model layer (hooks, computations) → 100% reusable in React Native
 *  - UI layer (this file + ui/ components) → Web-specific (React DOM)
 * ══════════════════════════════════════════════════════════════
 */
import { useState } from "react";
import { Zap, Trophy, BarChart3 } from "lucide-react";
import { PastelBlobs, MiniFooter } from "../../../components/shared";
import type { LandingLang } from "@/shared/i18n/landing-i18n";
import { CreditUpsellModal } from "@/widgets/CreditUpsellModal";
import type { CreditPack, OnboardingProfile } from "../../../../services/types";

/* ── Feature Module Imports ── */
import { useDashboardData } from "../model";
import {
  DashboardHeader,
  StatPills,
  SkillRadarChart,
  ProgressChart,
  ProficiencyHeroCard,
  BeforeAfterCard,
  RecentSessionsList,
  InterviewPrepCard,
  ProgressionTree,
} from "./index";
import { PracticeDropdown } from "./PracticeDropdown";

/* ─── Types ─── */
interface DashboardPageProps {
  userName?: string;
  firstPracticeScenario?: string;
  firstPracticeInterlocutor?: string;
  onLogout?: () => void;
  onNavigateToHistory?: () => void;
  onNavigateToAccount?: () => void;
  onStartNewPractice?: (scenario: string, scenarioType?: string, levelId?: string, interlocutor?: string) => void;
  userProfile?: OnboardingProfile | null;
  onProfileUpdate?: (profile: OnboardingProfile) => void;
  lang?: LandingLang;
  onNavigateToLibrary?: () => void;
}

/* ═══════════════════════════ DASHBOARD ═══════════════════════════ */
export function DashboardPage({
  userName,
  firstPracticeScenario,
  firstPracticeInterlocutor,
  onLogout,
  onNavigateToHistory,
  onNavigateToAccount,
  onStartNewPractice,
  lang = "en",
  onNavigateToLibrary,
}: DashboardPageProps) {
  /* ─── Shared Data Hook ─── */
  const data = useDashboardData({
    firstPracticeScenario,
    firstPracticeInterlocutor,
    userName,
    lang,
  });

  /* ─── UI-Local State (web-only) ─── */
  const [upsellOpen, setUpsellOpen] = useState(false);
  const [pendingScenario, setPendingScenario] = useState<string | null>(null);


  /* ─── Handlers ─── */
  const handleStartSession = (
    scenario: string,
    scenarioType?: string,
    levelId?: string,
    interlocutor?: string
  ) => {
    onStartNewPractice?.(scenario, scenarioType, levelId, interlocutor);
  };

  const handlePurchaseComplete = (
    _pack: CreditPack,
    creditsAdded: number
  ) => {
    data.setCredits((prev) => (prev ?? 0) + creditsAdded);
    data.setFreeSessionAvailable(false);
    setUpsellOpen(false);
    if (pendingScenario) {
      onStartNewPractice?.(pendingScenario);
      setPendingScenario(null);
    }
  };

  return (
    <div
      className="w-full min-h-full flex flex-col bg-[#f8fafc] relative overflow-hidden"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <PastelBlobs />

      {/* ═══════ HEADER ═══════ */}
      <DashboardHeader
        avatarInitials={data.avatarInitials}
        credits={data.credits}
        freeSessionAvailable={data.freeSessionAvailable}
        lang={lang}
        dc={data.dc}
        onNavigateToHistory={onNavigateToHistory}
        onNavigateToLibrary={onNavigateToLibrary}
        onNavigateToAccount={onNavigateToAccount}
        onLogout={onLogout}
        onOpenUpsell={() => setUpsellOpen(true)}
      />

      {/* ═══════ MAIN ═══════ */}
      <main className="relative w-full max-w-[1120px] mx-auto px-4 md:px-8 pt-6 md:pt-8 pb-20">
        {/* ─── Greeting row ─── */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-6 md:mb-8">
          <div>
            <h2
              className="text-2xl md:text-3xl text-[#0f172b]"
              style={{ fontWeight: 300 }}
            >
              Hello{" "}
              <span style={{ fontWeight: 500 }}>
                {userName && userName.trim().length > 0
                  ? userName.trim().split(" ")[0]
                  : "Explorer"}
              </span>
            </h2>
            <p className="text-sm text-[#62748e] mt-1">
              {data.hasRealData
                ? data.dc.subtitleWithData
                : data.dc.subtitleEmpty}
            </p>
          </div>

          {/* Practice Conversation Dropdown */}
          <PracticeDropdown onSelect={handleStartSession} />
        </div>

        {/* ═══════ SECTION 1: YOUR LEARNING PATH ═══════ */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-6 h-6 text-[#f59e0b]" />
            <h2
              className="text-xl md:text-2xl text-[#0f172b]"
              style={{ fontWeight: 800 }}
            >
              Your Learning Path
            </h2>
          </div>
          <ProgressionTree
            onStartLevel={(scenario, scenarioType, levelId, interlocutor) => {
              handleStartSession(scenario, scenarioType, levelId, interlocutor);
            }}
            onDrillComplete={(pathId, levelId, score) => {
              console.log("Drill complete", pathId, levelId, score);
            }}
          />
        </div>

        {/* ═══════ SECTION 2: RECENT ACTIVITY ═══════ */}
        {data.allRecent && data.allRecent.length > 0 && (
          <div className="mb-8">
            <RecentSessionsList
              allRecent={data.allRecent}
              dc={data.dc}
              onNavigateToHistory={onNavigateToHistory}
            />
          </div>
        )}

        {/* ═══════ SECTION 3: PROGRESS HISTORY ═══════ */}
        <div className="border-t border-[#e2e8f0] pt-8 mt-4">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-5 h-5 text-[#6366f1]" />
            <h2
              className="text-lg text-[#0f172b]"
              style={{ fontWeight: 700 }}
            >
              Your Progress History
            </h2>
          </div>

          <ProficiencyHeroCard
            proficiencyScore={data.proficiencyScore}
            proficiencyDelta={data.proficiencyDelta}
            cefrApprox={data.cefrApprox}
            radarData={data.radarData}
            biggestImprovement={data.biggestImprovement}
            persistedSessions={data.persistedSessions}
            dc={data.dc}
          />

          <StatPills
            totalSessions={data.totalSessions}
            biggestImprovement={data.biggestImprovement}
            streak={data.streak}
            dc={data.dc}
          />

          <div className="grid lg:grid-cols-3 gap-6 mb-6">
            <SkillRadarChart
              radarData={data.radarData}
              hasRealData={data.hasRealData}
              dc={data.dc}
            />

            <div
              className="lg:col-span-2 flex flex-col gap-6"
              style={{ minWidth: 0 }}
            >
              <ProgressChart
                progressData={data.progressData}
                dc={data.dc}
              />
            </div>
          </div>

          {data.latestBeforeAfter && (
            <BeforeAfterCard
              data={data.latestBeforeAfter}
              dc={data.dc}
            />
          )}

          <InterviewPrepCard
            persistedSessions={data.persistedSessions}
          />
        </div>
      </main>

      <MiniFooter />

      {/* ═══════ MODALS ═══════ */}


      <CreditUpsellModal
        open={upsellOpen}
        onClose={() => setUpsellOpen(false)}
        onPurchaseComplete={handlePurchaseComplete}
        lang={lang}
        creditsRemaining={data.credits ?? 0}
      />
    </div>
  );
}