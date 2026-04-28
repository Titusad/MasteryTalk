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

interface DashboardPageProps {
  userName?: string;
  firstPracticeScenario?: string;
  firstPracticeInterlocutor?: string;
  onNavigateToHistory?: () => void;
  onStartNewPractice?: (scenario: string, scenarioType?: string, levelId?: string, interlocutor?: string) => void;
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
    interlocutor?: string
  ) => {
    onStartNewPractice?.(scenario, scenarioType, levelId, interlocutor);
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

  return (
    <div
      aria-label="DashboardPage"
      className="w-full min-h-screen flex flex-col bg-[#f0f4f8]"
    >
      {/* ═══════ MAIN — Full width, generous padding ═══════ */}
      <main className="w-full px-6 md:px-8 lg:px-12 pt-6 pb-20">

        {/* Hero Card */}
        <div className="mb-6">
          <HeroCard
            userName={userName}
            userState={data.userState}
            diagnosis={data.diagnosis}
            churnGap={data.churnGap}
            proficiencyScore={data.proficiencyScore}
            proficiencyDelta={data.proficiencyDelta}
            cefrApprox={data.cefrApprox}
            streak={data.streak}
            radarData={data.radarData}
            progressData={data.progressData}
            totalSessions={data.totalSessions}
            focusArea={data.focusArea}
            onStartPractice={handleQuickStart}
          />
        </div>

        {/* Bottom Grid: Left (1fr) | Right (2fr) */}
        <div className="grid grid-cols-1 md:grid-cols-[340px_1fr] gap-6 items-start">

          {/* Left Column */}
          <div className="flex flex-col gap-4">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.08 }}
            >
              <WhatsAppActivationCard />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.14 }}
            >
              <SRDashboardCard totalSessions={data.totalSessions} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <PlatformNewsCard />
            </motion.div>
          </div>

          {/* Right Column */}
          <PracticePathsModule
            onStartSession={handleStartSession}
            onLockedClick={() => setUpsellOpen(true)}
          />
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