/**
 * ══════════════════════════════════════════════════════════════
 *  DashboardPage — Smart Container (Orchestrator)
 *
 *  This component is the ONLY "smart" piece:
 *  - Calls useDashboardData() to get all state + computed data
 *  - Passes props down to "dumb" presentational sub-components
 *  - Handles UI-local state (modals, upsell flow)
 *
 *  Mobile-Ready Architecture:
 *  - Model layer (hooks, computations) → 100% reusable in React Native
 *  - UI layer (this file + ui/ components) → Web-specific (React DOM)
 * ══════════════════════════════════════════════════════════════
 */
import { useState } from "react";
import { motion } from "motion/react";
import { Zap, Trophy, BarChart3, Target, ClipboardList, Mic2 } from "lucide-react";
import { PastelBlobs, MiniFooter } from "@/shared/ui";
import type { LandingLang } from "@/shared/i18n/landing-i18n";
import { PathPurchaseModal } from "@/widgets/PathPurchaseModal";
import type { PurchaseType, OnboardingProfile } from "@/services/types";

/* ── Feature Module Imports ── */
import { useDashboardData } from "../model";
import {
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
  onNavigateToHistory?: () => void;
  onStartNewPractice?: (scenario: string, scenarioType?: string, levelId?: string, interlocutor?: string) => void;
  userProfile?: OnboardingProfile | null;
  onProfileUpdate?: (profile: OnboardingProfile) => void;
  lang?: LandingLang;
  /** Paths already purchased by the user — used for Mode A/B detection in PathPurchaseModal */
  ownedPaths?: string[];
}

/* ═══════════════════════════ DASHBOARD ═══════════════════════════ */
export function DashboardPage({
  userName,
  firstPracticeScenario,
  firstPracticeInterlocutor,
  onNavigateToHistory,
  onStartNewPractice,
  lang = "en",
  ownedPaths = [],
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

  const handlePurchaseComplete = (_purchaseType: PurchaseType) => {
    data.setCredits((prev) => (prev ?? 0) + 1);
    data.setFreeSessionAvailable(false);
    setUpsellOpen(false);
    if (pendingScenario) {
      onStartNewPractice?.(pendingScenario);
      setPendingScenario(null);
    }
  };

  return (
    <div aria-label="DashboardPage"
      className="w-full min-h-screen flex flex-col bg-[#f8fafc] relative overflow-hidden"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <PastelBlobs />

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

        {/* ═══════ EMPTY STATE — First-time users ═══════ */}
        {data.totalSessions === 0 && (
          <div className="mb-10">
            {/* Warm-up Recommendation */}
            <motion.div
              className="bg-gradient-to-br from-[#0f172b] to-[#1e293b] rounded-3xl p-6 md:p-8 mb-6 relative overflow-hidden"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05 }}
            >
              {/* Decorative gradient orb */}
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br from-[#6366f1]/20 to-transparent rounded-full blur-3xl pointer-events-none" />

              <div className="relative">
                <span
                  className="inline-flex items-center gap-1.5 text-[10px] bg-[#f59e0b]/15 text-[#f59e0b] px-3 py-1 rounded-full mb-4"
                  style={{ fontWeight: 600 }}
                >
                  <Zap className="w-3 h-3" /> START HERE
                </span>

                <h3
                  className="text-xl md:text-2xl text-white mb-2"
                  style={{ fontWeight: 600 }}
                >
                  Professional Self-Introduction
                </h3>
                <p className="text-white/70 text-sm leading-relaxed mb-6 max-w-lg">
                  Practice introducing yourself in a professional setting — the perfect warm-up before interviews, networking events, or team meetings.
                </p>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() =>
                      handleStartSession(
                        "Professional self-introduction warm-up",
                        "self-intro",
                        undefined as any,
                        "senior_stakeholder"
                      )
                    }
                    className="flex items-center gap-2 px-6 py-3 rounded-full text-sm bg-white text-[#0f172b] hover:bg-[#f8fafc] transition-colors shadow-lg cursor-pointer"
                    style={{ fontWeight: 500 }}
                  >
                    <Zap className="w-4 h-4" />
                    Start Warm-Up
                  </button>
                  <span className="text-xs text-white/40">~8 min · Free</span>
                </div>
              </div>
            </motion.div>

            {/* Scenario quick-picks */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
            >
              <p
                className="text-sm text-[#45556c] mb-4"
                style={{ fontWeight: 500 }}
              >
                Or choose a specific scenario:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    iconName: "target" as const,
                    title: "Job Interview",
                    desc: "Practice with an AI interviewer",
                    scenario: "Job interview preparation",
                    type: "interview",
                    level: "int-1",
                    interlocutor: "recruiter",
                  },
                  {
                    iconName: "clipboard" as const,
                    title: "Remote Meeting",
                    desc: "Lead or present in meetings",
                    scenario: "Remote meeting simulation",
                    type: "meeting",
                    level: "meet-1",
                    interlocutor: "meeting_facilitator",
                  },
                  {
                    iconName: "mic" as const,
                    title: "Presentation",
                    desc: "Deliver and handle Q&A",
                    scenario: "Professional presentation",
                    type: "presentation",
                    level: "pres-1",
                    interlocutor: "senior_stakeholder",
                  },
                ].map((card) => (
                  <button
                    key={card.type}
                    onClick={() =>
                      handleStartSession(
                        card.scenario,
                        card.type,
                        card.level,
                        card.interlocutor
                      )
                    }
                    className="bg-white border border-[#e2e8f0] rounded-2xl p-5 text-left hover:border-[#c7d2e0] hover:shadow-sm transition-all cursor-pointer group"
                  >
                    {(() => {
                      const iconMap = { target: Target, clipboard: ClipboardList, mic: Mic2 };
                      const Icon = iconMap[card.iconName];
                      return (
                        <span className="flex items-center justify-center w-9 h-9 rounded-full bg-[#0f172b] mb-3">
                          <Icon size={16} color="#fff" />
                        </span>
                      );
                    })()}
                    <p
                      className="text-sm text-[#0f172b] mb-1 group-hover:text-[#6366f1] transition-colors"
                      style={{ fontWeight: 600 }}
                    >
                      {card.title}
                    </p>
                    <p className="text-xs text-[#62748e]">{card.desc}</p>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}

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

        {/* ═══════ SECTION 3: PROGRESS HISTORY (only if user has data) ═══════ */}
        {data.hasRealData && (
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
        )}
      </main>

      <MiniFooter />

      {/* ═══════ MODALS ═══════ */}


      <PathPurchaseModal
        open={upsellOpen}
        onClose={() => setUpsellOpen(false)}
        scenarioType="interview"
        paywallReason="path-required"
        ownedPaths={ownedPaths}
        onPurchaseComplete={handlePurchaseComplete}
      />
    </div>
  );
}