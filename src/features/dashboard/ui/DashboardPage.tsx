/**
 * ══════════════════════════════════════════════════════════════
 *  DashboardPage — v4.0 Redesign
 *
 *  Architecture: Context-Aware Hero + 2-column grid (1fr | 2fr)
 *  Width: Full width (matches PracticeSessionPage — w-full, no max-w)
 *  Design System: DESIGN_SYSTEM.md compliant
 * ══════════════════════════════════════════════════════════════
 */
import { useState } from "react";
import { motion } from "motion/react";
import { Zap } from "lucide-react";
import { MiniFooter } from "@/shared/ui";
import type { LandingLang } from "@/shared/i18n/landing-i18n";
import { PathPurchaseModal } from "@/widgets/PathPurchaseModal";
import type { PurchaseType, OnboardingProfile } from "@/services/types";

import { useDashboardData } from "../model";
import { HeroCard } from "./HeroCard";
import { WhatsAppActivationCard } from "./WhatsAppActivationCard";
import { PlatformNewsCard } from "./PlatformNewsCard";
import { SRDashboardCard } from "./SRDashboardCard";
import { PracticePathsModule } from "./PracticePathsModule";
import { CrossPathCard } from "./CrossPathCard";
import { ProgressSummaryCard } from "./ProgressSummaryCard";

interface DashboardPageProps {
  userName?: string;
  firstPracticeScenario?: string;
  firstPracticeInterlocutor?: string;
  onNavigateToHistory?: () => void;
  onStartNewPractice?: (scenario: string, scenarioType?: string, levelId?: string, interlocutor?: string, startAtContext?: boolean) => void;
  userProfile?: OnboardingProfile | null;
  onProfileUpdate?: (profile: OnboardingProfile) => void;
  lang?: LandingLang;
  ownedPaths?: string[];
}

export function DashboardPage({
  userName,
  firstPracticeScenario,
  firstPracticeInterlocutor,
  onStartNewPractice,
  userProfile,
  lang = "en",
  ownedPaths = [],
}: DashboardPageProps) {
  const data = useDashboardData({
    firstPracticeScenario,
    firstPracticeInterlocutor,
    userName,
    lang,
  });

  const [upsellOpen, setUpsellOpen] = useState(false);
  const [pendingScenario, setPendingScenario] = useState<string | null>(null);

  const handleStartSession = (
    scenario: string,
    scenarioType?: string,
    levelId?: string,
    interlocutor?: string,
    startAtContext?: boolean,
  ) => {
    onStartNewPractice?.(scenario, scenarioType, levelId, interlocutor, startAtContext);
  };

  const handleQuickStart = () => {
    handleStartSession(
      "Professional self-introduction warm-up",
      "self-intro",
      undefined,
      "senior_stakeholder"
    );
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

  // Derive computed values for Row 2 cards
  const waPhrasesMastered = (userProfile as any)?.wa_phrases_mastered ?? 0;
  const waVerified = !!(userProfile as any)?.whatsapp_verified;
  const scenarioCounts = data.persistedSessions.reduce<Record<string, number>>((acc, s) => {
    const t = s.scenarioType ?? "interview";
    acc[t] = (acc[t] ?? 0) + 1;
    return acc;
  }, {});
  const mostPracticed = Object.keys(scenarioCounts).length > 0
    ? Object.keys(scenarioCounts).reduce((a, b) => scenarioCounts[a] > scenarioCounts[b] ? a : b)
    : null;

  return (
    <div
      aria-label="DashboardPage"
      className="w-full min-h-screen flex flex-col bg-[#f0f4f8]"
    >
      <main className="w-full px-6 md:px-8 lg:px-12 pt-6 pb-20 space-y-12">

        {/* ── Row 1: Hero Card ── */}
        <HeroCard
          userName={userName}
          userState={data.userState}
          diagnosis={data.diagnosis}
          churnGap={data.churnGap}
          proficiencyScore={data.proficiencyScore}
          proficiencyDelta={data.proficiencyDelta}
          cefrApprox={data.cefrApprox}
          streak={data.streak}
          allPracticeDates={data.allPracticeDates}
          radarData={data.radarData}
          progressData={data.progressData}
          totalSessions={data.totalSessions}
          focusArea={data.focusArea}
          onStartPractice={handleQuickStart}
        />

        {/* ── Row 2: Actionable widgets ──
            WhatsApp only shown when not yet verified — others auto-fill the grid. */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.08 }}
        >
          <ProgressSummaryCard
            totalSessions={data.totalSessions}
            waPhrasesMastered={waPhrasesMastered}
            mostPracticed={mostPracticed}
            bestPillarDelta={data.biggestImprovement}
          />

          {!waVerified && (
            <WhatsAppActivationCard />
          )}

          <SRDashboardCard totalSessions={data.totalSessions} />

          {/* Emergency Prep */}
          <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm p-5 flex flex-col">
            <p className="text-xs font-medium uppercase tracking-wider text-[#94a3b8] mb-3">
              Emergency Prep
            </p>
            <p className="text-sm font-semibold text-[#0f172b] mb-1">
              Meeting in 30 minutes?
            </p>
            <p className="text-xs text-[#62748e] leading-relaxed mb-4 flex-1">
              Paste the agenda or invite — I'll build a targeted session right now.
            </p>
            <button
              onClick={() => handleStartSession("Emergency practice session", "meeting", undefined, undefined, true)}
              className="w-full flex items-center justify-center gap-2 bg-[#0f172b] text-white rounded-lg text-sm font-medium py-2.5 hover:bg-[#1d293d] transition-colors"
            >
              <Zap className="w-3.5 h-3.5" />
              Start emergency prep
            </button>
          </div>
        </motion.div>

        {/* ── Row 3: Practice Paths + Sidebar ──
            Desktop: sidebar on left (260px) | practice paths on right (1fr)
            Mobile:  practice paths first (DOM order), sidebar below */}
        <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6 items-start">

          {/* Practice Paths — first in DOM so it appears first on mobile */}
          <motion.div
            className="md:col-start-2 md:row-start-1"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <PracticePathsModule
              onStartSession={handleStartSession}
              onLockedClick={() => setUpsellOpen(true)}
            />
          </motion.div>

          {/* Sidebar — second in DOM (mobile: below practice paths) | desktop: left column */}
          <motion.div
            className="md:col-start-1 md:row-start-1 flex flex-col gap-4"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
          >
            <CrossPathCard perPathStats={data.perPathStats} />
            <PlatformNewsCard />
          </motion.div>
        </div>

      </main>

      <MiniFooter />

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