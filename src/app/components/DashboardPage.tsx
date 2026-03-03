import { useState, useEffect } from "react";
import {
  ArrowRight,
  Calendar,
  ChevronRight,
  Target,
  Mic,
  PlayCircle,
  Clock,
  BookOpen,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { BrandLogo, PastelBlobs, MiniFooter } from "./shared";
import { authService, userService, paymentService } from "../../services";
import type { PracticeHistoryItem } from "../../services/types";
import type { LandingLang } from "./landing-i18n";
import { CreditUpsellModal, getCreditsLabel } from "./CreditUpsellModal";

/* ─── Types ─── */
interface DashboardPageProps {
  userName?: string;
  firstPracticeScenario?: string;
  firstPracticeInterlocutor?: string;
  onLogout?: () => void;
  onNavigateToHistory?: () => void;
  onStartNewPractice?: (scenario: string) => void;
  userProfile?: import("../../services/types").OnboardingProfile | null;
  onProfileUpdate?: (profile: import("../../services/types").OnboardingProfile) => void;
  /** Language for upsell modal i18n */
  lang?: LandingLang;
}

/* ═══════════════════════ DASHBOARD COMPONENT (MVP) ═══════════════════════ */
export function DashboardPage({
  userName,
  firstPracticeScenario,
  firstPracticeInterlocutor,
  onLogout,
  onNavigateToHistory,
  onStartNewPractice,
  lang = "es",
}: DashboardPageProps) {
  const avatarInitials = userName
    ? userName
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  /* ─── Recent practice history (simple list) ─── */
  const [recentPractices, setRecentPractices] = useState<PracticeHistoryItem[]>([]);

  /* ─── Credit balance ─── */
  const [credits, setCredits] = useState<number | null>(null);
  const [freeSessionAvailable, setFreeSessionAvailable] = useState(false);

  useEffect(() => {
    userService
      .getPracticeHistory("mock-uid")
      .then((history) => setRecentPractices(history.slice(0, 3)))
      .catch(() => {});

    // Fetch credit balance
    paymentService
      .getCredits("mock-uid")
      .then((c) => setCredits(c))
      .catch(() => {});

    // Check if free session is still available
    userService
      .getProfile("mock-uid")
      .then((u) => setFreeSessionAvailable(!u.freeSessionUsed))
      .catch(() => {});
  }, []);

  const hasPracticed = !!firstPracticeScenario;

  /* Build recent list including latest session */
  const allRecent: PracticeHistoryItem[] = firstPracticeScenario
    ? [
        {
          title: firstPracticeScenario,
          date: "Today",
          duration: "8 min",
          tag: firstPracticeInterlocutor || "Client",
        },
        ...recentPractices,
      ]
    : recentPractices;

  /* ─── Upsell modal state ─── */
  const [upsellOpen, setUpsellOpen] = useState(false);
  const [pendingScenario, setPendingScenario] = useState<string | null>(null);

  /**
   * Gate session start behind canStartSession check.
   * If credits exhausted → show upsell modal instead of navigating.
   */
  const handleStartSession = async (scenario: string) => {
    try {
      const result = await userService.canStartSession("mock-uid");
      if (result.allowed) {
        onStartNewPractice?.(scenario);
      } else {
        // Credits exhausted → show upsell
        setPendingScenario(scenario);
        setUpsellOpen(true);
      }
    } catch {
      // On error, allow through (fail-open for UX)
      onStartNewPractice?.(scenario);
    }
  };

  const handlePurchaseComplete = (_pack: import("../../services/types").CreditPack, creditsAdded: number) => {
    // Refresh credit balance after purchase
    setCredits((prev) => (prev ?? 0) + creditsAdded);
    setFreeSessionAvailable(false); // After buying, free session is no longer the primary indicator
    setUpsellOpen(false);
    // After purchase, proceed to the pending scenario
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

      {/* ───── HEADER ───── */}
      <header className="sticky top-0 z-50 bg-white border-b border-[#e2e8f0] relative">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between px-8 h-20">
          <BrandLogo />
          <div className="flex items-center gap-6">
            <button
              onClick={() => onNavigateToHistory?.()}
              className="text-[#45556c] hover:text-[#0f172b] transition-colors text-sm"
              style={{ fontWeight: 500 }}
            >
              History
            </button>

            {/* Credit balance chip */}
            {credits !== null && (
              <button
                onClick={() => setUpsellOpen(true)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all cursor-pointer ${
                  credits === 0 && !freeSessionAvailable
                    ? "bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100"
                    : "bg-[#f1f5f9] border border-[#e2e8f0] text-[#45556c] hover:bg-[#e2e8f0]"
                }`}
                style={{ fontWeight: 600 }}
                title={lang === "pt" ? "Comprar créditos" : "Comprar créditos"}
              >
                <Zap className={`w-3 h-3 ${credits === 0 && !freeSessionAvailable ? "text-amber-500" : "text-[#50C878]"}`} />
                {freeSessionAvailable && credits === 0
                  ? (lang === "pt" ? "1 sessão grátis" : "1 sesión gratis")
                  : `${credits} ${getCreditsLabel(credits, lang)}`
                }
              </button>
            )}

            <div
              className="w-10 h-10 rounded-full bg-[#0f172b] flex items-center justify-center cursor-pointer"
              onClick={() => {
                authService.signOut().catch(() => {});
                onLogout?.();
              }}
              title="Sign out"
            >
              <span
                className="text-white text-sm"
                style={{ fontWeight: 500 }}
              >
                {avatarInitials}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* ───── MAIN CONTENT ───── */}
      <main className="relative w-full max-w-[960px] mx-auto px-8 pt-8 pb-20">
        {/* ─── Greeting ─── */}
        <h2
          className="text-2xl md:text-3xl text-[#0f172b] mb-8"
          style={{ fontWeight: 300 }}
        >
          Hello, <span style={{ fontWeight: 500 }}>{userName || "David"}</span>
        </h2>

        {/* ─── Hero: Practice Input Card ─── */}
        <motion.div
          className="bg-white rounded-3xl border border-[#e2e8f0] shadow-sm p-10 md:p-12 mb-8"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
        >
          <h1
            className="text-3xl md:text-[48px] text-[#0f172b] mb-2"
            style={{ fontWeight: 300, lineHeight: 1.2 }}
          >
            What will you practice today?
          </h1>
          <p className="text-[#62748e] text-sm mb-8">
            Choose a scenario and start training your professional communication.
          </p>

          {/* Scenario CTA cards — same style as landing */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {([
              {
                id: "sales",
                label: "Sales Pitch",
                description: "Practice presenting your product or service to a potential client.",
                icon: Target,
              },
              {
                id: "interview",
                label: "Job Interview",
                description: "Prepare to answer key questions in your next interview.",
                icon: Mic,
              },
            ] as const).map((card) => {
              const Icon = card.icon;
              return (
                <motion.button
                  key={card.id}
                  onClick={() => handleStartSession(card.label)}
                  className="group/card relative bg-[#f8fafc] hover:bg-[#0f172b] border-2 border-[#e2e8f0] hover:border-[#0f172b] rounded-2xl p-6 text-left transition-all duration-300 cursor-pointer"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Icon */}
                  <div className="w-11 h-11 rounded-full bg-[#0f172b] group-hover/card:bg-white flex items-center justify-center mb-4 transition-colors duration-300">
                    <Icon className="w-5 h-5 text-white group-hover/card:text-[#0f172b] transition-colors duration-300" strokeWidth={1.5} />
                  </div>

                  {/* Label */}
                  <p
                    className="text-[#0f172b] group-hover/card:text-white text-[15px] mb-1.5 transition-colors duration-300"
                    style={{ fontWeight: 600 }}
                  >
                    {card.label}
                  </p>

                  {/* Description */}
                  <p className="text-[#62748e] group-hover/card:text-white/70 text-[13px] leading-relaxed transition-colors duration-300">
                    {card.description}
                  </p>

                  {/* Arrow indicator */}
                  <div className="absolute top-6 right-6 w-8 h-8 rounded-full bg-transparent group-hover/card:bg-white/15 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-all duration-300">
                    <ArrowRight className="w-4 h-4 text-white" />
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* ─── Two-column: Recent Sessions + Next Suggestion ─── */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* ── Recent Sessions (simple list) ── */}
          <motion.div
            className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm p-6 flex flex-col"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
          >
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#0f172b] flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <h3
                className="text-lg text-[#0f172b]"
                style={{ fontWeight: 500 }}
              >
                Recent Sessions
              </h3>
            </div>

            {allRecent.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-8 text-center">
                <BookOpen className="w-8 h-8 text-[#cbd5e1] mb-2" />
                <p className="text-sm text-[#62748e]">
                  No sessions completed yet
                </p>
              </div>
            ) : (
              <div className="space-y-2 flex-1 mb-4">
                {allRecent.slice(0, 3).map((practice, i) => (
                  <motion.div
                    key={i}
                    className="rounded-xl px-4 py-3 border border-[#e2e8f0] hover:border-[#cad5e2] transition-all"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + i * 0.05, duration: 0.3 }}
                  >
                    <p
                      className="text-sm text-[#0f172b] mb-1.5 truncate"
                      style={{ fontWeight: 500 }}
                    >
                      {practice.title}
                    </p>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="flex items-center gap-1 text-[10px] text-[#62748e]">
                        <Calendar className="w-3 h-3" />
                        {practice.date}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] text-[#62748e]">
                        <Clock className="w-3 h-3" />
                        {practice.duration}
                      </span>
                      <span
                        className="bg-[#f1f5f9] text-[#62748e] text-[10px] px-2 py-0.5 rounded-full"
                        style={{ fontWeight: 500 }}
                      >
                        {practice.tag}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {allRecent.length > 0 && (
              <button
                onClick={() => onNavigateToHistory?.()}
                className="w-full text-sm text-[#45556c] hover:text-[#0f172b] transition-colors flex items-center justify-center gap-1.5 py-2 border border-[#e2e8f0] rounded-full"
              >
                View full history
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </motion.div>

          {/* ── Next Session Suggestion ── */}
          <motion.div
            className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm p-6 flex flex-col"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.22 }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-full bg-[#0f172b] flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              <span
                className="bg-[#fef3c7] text-[#92400e] text-[10px] px-2.5 py-1 rounded-full"
                style={{ fontWeight: 600 }}
              >
                Suggested for you
              </span>
            </div>

            <h3
              className="text-lg text-[#0f172b] mb-1"
              style={{ fontWeight: 500 }}
            >
              Next Session
            </h3>
            <p className="text-sm text-[#45556c] mb-5 flex-1">
              {hasPracticed
                ? "Based on your last practice and areas for improvement."
                : "Start with a popular scenario for LATAM professionals."}
            </p>

            {/* Suggested scenario card */}
            <div className="bg-[#f8fafc] rounded-xl border border-[#e2e8f0] p-4 mb-4">
              <p
                className="text-[15px] text-[#0f172b] mb-2"
                style={{ fontWeight: 500 }}
              >
                {hasPracticed ? "Job Interview" : "SaaS B2B Sales Pitch"}
              </p>
              <p className="text-xs text-[#62748e] leading-relaxed mb-3">
                {hasPracticed
                  ? "Practice STAR responses and strengthen your professional positioning in English."
                  : "Practice a compelling pitch in English for the US market."}
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className="text-[10px] bg-[#eef2ff] text-[#6366f1] rounded-full px-2.5 py-0.5"
                  style={{ fontWeight: 600 }}
                >
                  {hasPracticed ? "Interview" : "Sales"}
                </span>
                <span
                  className="text-[10px] bg-[#f1f5f9] text-[#45556c] rounded-full px-2.5 py-0.5"
                  style={{ fontWeight: 500 }}
                >
                  ~8 min
                </span>
              </div>
            </div>

            {/* CTA */}
            <button
              onClick={() =>
                handleStartSession(
                  hasPracticed ? "Job Interview" : "SaaS B2B Sales Pitch"
                )
              }
              className="w-full bg-[#0f172b] text-white py-3 rounded-full flex items-center justify-center gap-2 hover:bg-[#1d293d] transition-colors shadow-sm cursor-pointer"
            >
              <PlayCircle className="w-4 h-4" />
              <span className="text-sm" style={{ fontWeight: 500 }}>
                Start session
              </span>
            </button>
          </motion.div>
        </div>
      </main>
      <MiniFooter />
      <CreditUpsellModal
        open={upsellOpen}
        onClose={() => setUpsellOpen(false)}
        onPurchaseComplete={handlePurchaseComplete}
        lang={lang}
        creditsRemaining={credits ?? 0}
      />
    </div>
  );
}