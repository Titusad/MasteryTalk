import { useState, useEffect, useRef, lazy, Suspense } from "react";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { LandingPage } from "./components/LandingPage";
/* Route-based code splitting — heavy pages loaded on demand */
const DesignSystemPage = lazy(() => import("./components/DesignSystemPage").then(m => ({ default: m.DesignSystemPage })));
const PracticeSessionPage = lazy(() => import("./components/PracticeSessionPage").then(m => ({ default: m.PracticeSessionPage })));
const DashboardPage = lazy(() => import("./components/DashboardPage").then(m => ({ default: m.DashboardPage })));
const PracticeHistoryPage = lazy(() => import("./components/PracticeHistoryPage").then(m => ({ default: m.PracticeHistoryPage })));
const AccountPage = lazy(() => import("./components/AccountPage").then(m => ({ default: m.AccountPage })));
import { LoadingScreen } from "./components/LoadingScreen";
import { LanguageTransitionModal } from "./components/LanguageTransitionModal";
import { authService } from "../services";
import type { User, OnboardingProfile, ScenarioType, CreditPack, SessionSummary, TurnPronunciationData, ScriptSection, InterviewBriefingData } from "../services/types";
import type { SetupModalResult } from "./components/PracticeWidget";
// AnimatePresence removed — was causing modal to linger during exit animation
// when auth re-renders interrupted the exit. Direct unmount is bulletproof.
import type { LandingLang } from "./components/landing-i18n";
import { CreditUpsellModal } from "./components/CreditUpsellModal";
import { useUsageGating } from "./hooks/useUsageGating";
import type { MarketFocus } from "../services/prompts";
import { DevPreviewMenu, getDevMockData } from "./components/DevPreviewMenu";
import type { Step } from "./components/shared/session-types";
import type { RealFeedbackData } from "./components/session/ConversationFeedback";

/* ─── App-level page types ─── */
type Page =
  | "landing"
  | "design-system"
  | "loading"
  | "practice-session"
  | "dashboard"
  | "practice-history"
  | "account";

/* ─── Shared flow state ─── */
interface FlowState {
  scenario: string;
  interlocutor: string;
  scenarioType?: ScenarioType;
  guidedFields?: Record<string, string>;
}

/* ─── Dev Preview state ─── */
interface DevPreviewState {
  step?: Step;
  scenarioType?: ScenarioType;
  mockFeedback?: RealFeedbackData | null;
  mockSummary?: SessionSummary | null;
  mockPronData?: TurnPronunciationData[];
  mockScript?: ScriptSection[] | null;
  mockInterviewBriefing?: InterviewBriefingData | null;
}

export default function App() {
  /* ─── DEV MODE: sessionStorage keys for OAuth redirect recovery ─── */
  const OAUTH_PENDING_KEY = "influentia_oauth_pending";
  const PENDING_SETUP_KEY = "influentia_pending_setup";

  const [page, setPage] = useState<Page>(() => {
    // DEV MODE: always start from landing.
    // Clear stale app-level hashes (but preserve Supabase #access_token fragments)
    const hash = window.location.hash;
    if (hash === "#design-system") return "design-system"; // keep design-system shortcut
    if (["#dashboard", "#practice-session", "#practice-history"].includes(hash)) {
      window.location.hash = "";
    }
    return "landing";
  });

  const [flowState, setFlowState] = useState<FlowState>({
    scenario: "",
    interlocutor: "",
  });

  /* ─── Auth state ─── */
  const [isInitializing, setIsInitializing] = useState(true);
  const [authUser, setAuthUser] = useState<User | null>(null);

  /* ─── Onboarding profile ─── */
  const [userProfile, setUserProfile] = useState<OnboardingProfile | null>(
    () => {
      try {
        const saved = localStorage.getItem("influentia_profile");
        return saved ? JSON.parse(saved) : null;
      } catch {
        return null;
      }
    }
  );

  const prevAuthUserRef = useRef<User | null>(null);
  const pendingSetupRef = useRef<SetupModalResult | null>(null);

  /* ─── Usage gating & new-session paywall ─── */
  const usageGating = useUsageGating(authUser?.plan ?? "free");
  const [showNewSessionPaywall, setShowNewSessionPaywall] = useState(false);
  const pendingNewSessionRef = useRef<(() => void) | null>(null);

  /* ─── Language transition modal ─── */
  const [showLangModal, setShowLangModal] = useState(false);
  const pendingNavigationRef = useRef<(() => void) | null>(null);
  const langModalDismissedRef = useRef(false); // Guard: prevent double-fire of onContinue
  const [landingLang, setLandingLang] = useState<LandingLang>(() => {
    try {
      const saved = localStorage.getItem("influentia_lang");
      if (saved === "es" || saved === "pt" || saved === "en") return saved;
    } catch { /* ignore */ }
    return "es";
  });

  /* ─── Market focus (region) — persisted in localStorage ─── */
  const [marketFocus, setMarketFocus] = useState<MarketFocus | null>(() => {
    try {
      const saved = localStorage.getItem("influentia_market_focus");
      if (saved === "mexico" || saved === "colombia" || saved === "brazil") return saved;
    } catch { /* ignore */ }
    return null;
  });

  /* ─── Dev Preview state ─── */
  const [devPreview, setDevPreview] = useState<DevPreviewState | null>(null);

  const handleDevNavigate = (optionId: string) => {
    // Reset dev preview
    setDevPreview(null);

    // Pages
    if (optionId === "landing") {
      setPage("landing");
      window.location.hash = "";
      return;
    }
    if (optionId === "dashboard") {
      setFlowState({
        scenario: "Sales pitch: Producto B2B SaaS para LATAM",
        interlocutor: "decision_maker",
        scenarioType: "sales" as ScenarioType,
      });
      setPage("dashboard");
      window.location.hash = "#dashboard";
      return;
    }
    if (optionId === "practice-history") {
      setFlowState({
        scenario: "Sales pitch: Producto B2B SaaS para LATAM",
        interlocutor: "decision_maker",
        scenarioType: "sales" as ScenarioType,
      });
      setPage("practice-history");
      window.location.hash = "#practice-history";
      return;
    }

    // Practice Session steps (ps:*)
    if (optionId.startsWith("ps:")) {
      const isInterview = optionId.includes("interview");
      const mockData = getDevMockData(isInterview);
      const sType: ScenarioType = isInterview ? "interview" : "sales";

      // Determine the step from the option ID
      let step: Step = "extra-context";
      if (optionId.includes("extra-context")) step = "extra-context";
      else if (optionId.includes("generating-script")) step = "generating-script";
      else if (optionId.includes("pre-briefing")) step = "pre-briefing";
      else if (optionId.includes("conversation-feedback")) step = "conversation-feedback";
      else if (optionId.includes("session-recap")) step = "session-recap";

      setFlowState({
        scenario: isInterview
          ? "Technical Interview: Senior Frontend Developer at Toptal"
          : "Sales pitch: Producto B2B SaaS para LATAM",
        interlocutor: isInterview ? "recruiter" : "decision_maker",
        scenarioType: sType,
      });

      setDevPreview({
        step,
        scenarioType: sType,
        mockFeedback: {
          strengths: mockData.feedback.strengths,
          opportunities: mockData.feedback.opportunities,
          beforeAfter: mockData.feedback.beforeAfter,
          pillarScores: mockData.feedback.pillarScores,
          professionalProficiency: mockData.feedback.professionalProficiency,
          contentScores: mockData.feedback.contentScores,
          interviewReadinessScore: mockData.feedback.interviewReadinessScore,
          contentInsights: mockData.feedback.contentInsights,
        },
        mockSummary: mockData.summary,
        mockPronData: mockData.pronData,
        mockScript: mockData.script,
        mockInterviewBriefing: mockData.interviewBriefing,
      });

      setPage("practice-session");
      window.location.hash = "#practice-session";
    }
  };

  const handleLangChange = (lang: LandingLang) => {
    setLandingLang(lang);
    try {
      localStorage.setItem("influentia_lang", lang);
    } catch { /* ignore */ }
  };

  /* ─── Auth state listener ─── */
  /*
   * DEV MODE: Forces a clean start every time.
   *
   * Flow A — Fresh visit (no OAuth return):
   *   1. No `influentia_oauth_pending` flag → sign out stale session
   *   2. Auth listener fires with null → stays on landing
   *
   * Flow B — Returning from Google OAuth redirect:
   *   1. `influentia_oauth_pending` flag exists → DON'T sign out
   *   2. Supabase detects session from URL fragment
   *   3. Auth listener fires with user → reads setup from sessionStorage
   *   4. Shows Language Modal → navigates to Practice Session
   */
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    let cancelled = false;

    const init = async () => {
      const isOAuthReturn = sessionStorage.getItem(OAUTH_PENDING_KEY) === "true";

      if (cancelled) return;

      // Now subscribe to auth state changes
      unsubscribe = authService.onAuthStateChanged((user) => {
        setIsInitializing(false);
        const hadUser = prevAuthUserRef.current !== null;
        prevAuthUserRef.current = user;
        setAuthUser(user);

        if (user && !hadUser) {
          // Check if returning from OAuth with persisted setup
          const pendingRaw = sessionStorage.getItem(PENDING_SETUP_KEY);
          const isReturning = sessionStorage.getItem(OAUTH_PENDING_KEY) === "true";

          if (isReturning && pendingRaw) {
            // Flow B: OAuth return — recover setup and navigate to practice
            sessionStorage.removeItem(OAUTH_PENDING_KEY);
            sessionStorage.removeItem(PENDING_SETUP_KEY);

            try {
              const setup = JSON.parse(pendingRaw);
              setFlowState({
                scenario: setup.scenario || "",
                interlocutor: setup.interlocutor || "recruiter",
                scenarioType: setup.scenarioType || "interview",
                guidedFields: setup.guidedFields,
              });

              // Show language modal (or skip for EN users)
              const savedLang = localStorage.getItem("influentia_lang") || "es";
              pendingNavigationRef.current = () => {
                setPage("practice-session");
                window.location.hash = "#practice-session";
              };
              console.log("[DEBUG] pendingNavigationRef SET at Flow B (OAuth return, line ~264)");
              if (savedLang === "en") {
                pendingNavigationRef.current();
                pendingNavigationRef.current = null;
              } else {
                langModalDismissedRef.current = false; // Reset guard before showing modal
                setShowLangModal(true);
                console.log("[DEBUG] setShowLangModal(true) at Flow B (OAuth return)");
              }
            } catch (err) {
              console.warn("[inFluentia] Failed to parse pending setup:", err);
              setPage("dashboard");
              window.location.hash = "#dashboard";
            }
            return;
          }

          if (isReturning && !pendingRaw) {
            // OAuth return but no setup data — go to dashboard as fallback
            sessionStorage.removeItem(OAUTH_PENDING_KEY);
            setFlowState({
              scenario: "Sales pitch: Producto B2B SaaS para LATAM",
              interlocutor: "decision_maker",
              scenarioType: "sales" as ScenarioType,
            });
            setPage("dashboard");
            window.location.hash = "#dashboard";
            return;
          }

          // Mock auth path: user appeared via signIn() (no redirect).
          // Check sessionStorage (PracticeSetupModal saves before signIn)
          const mockPendingRaw = sessionStorage.getItem(PENDING_SETUP_KEY);
          if (mockPendingRaw) {
            sessionStorage.removeItem(OAUTH_PENDING_KEY);
            sessionStorage.removeItem(PENDING_SETUP_KEY);

            try {
              const setup = JSON.parse(mockPendingRaw);
              setFlowState({
                scenario: setup.scenario || "",
                interlocutor: setup.interlocutor || "recruiter",
                scenarioType: setup.scenarioType || "interview",
                guidedFields: setup.guidedFields,
              });

              const savedLang = localStorage.getItem("influentia_lang") || "es";
              pendingNavigationRef.current = () => {
                setPage("practice-session");
                window.location.hash = "#practice-session";
              };
              console.log("[DEBUG] pendingNavigationRef SET at Mock auth path (line ~312)");
              if (savedLang === "en") {
                pendingNavigationRef.current();
                pendingNavigationRef.current = null;
              } else {
                langModalDismissedRef.current = false; // Reset guard before showing modal
                setShowLangModal(true);
                console.log("[DEBUG] setShowLangModal(true) at Mock auth path");
              }
            } catch {
              setPage("dashboard");
              window.location.hash = "#dashboard";
            }
            return;
          }

          // No pending setup at all. If user is on the landing page (hash is empty), auto-redirect to dashboard.
          // This ensures returning users don't stay on the landing page.
          if (!window.location.hash || window.location.hash === "#" || window.location.hash === "#/") {
            setPage("dashboard");
            window.location.hash = "#dashboard";
          }
        }

        if (!user && hadUser) {
          setFlowState({ scenario: "", interlocutor: "" });
          setPage("landing");
          window.location.hash = "";
        }
      });
    };

    init();

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, []);

  /* ─── Hash-based routing ─── */
  useEffect(() => {
    // Prevent browser from restoring scroll position on hash navigation
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
    // Also scroll any overflow containers (redundant safety net)
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
    });
  }, [page]);

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash === "#design-system") setPage("design-system");
      else if (hash === "#dashboard") {
        setFlowState((prev) =>
          prev.scenario
            ? prev
            : {
              scenario: "Sales pitch: Producto B2B SaaS para LATAM",
              interlocutor: "decision_maker",
              scenarioType: "sales" as ScenarioType,
            }
        );
        setPage("dashboard");
      } else if (hash === "#practice-session") setPage("practice-session");
      else if (hash === "#practice-history") setPage("practice-history");
      else if (hash === "#account") setPage("account");
      else setPage("landing");
    };
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  /* ─── Navigation handlers ─── */

  const handleAuthComplete = (data: SetupModalResult, authMode?: "login" | "registro") => {
    if (authMode === "login") {
      setFlowState((prev) =>
        prev.scenario
          ? prev
          : {
            scenario: "Sales pitch: Producto B2B SaaS para LATAM",
            interlocutor: "decision_maker",
            scenarioType: "sales" as ScenarioType,
          }
      );
      pendingNavigationRef.current = () => {
        setPage("dashboard");
        window.location.hash = "#dashboard";
      };
      console.log("[DEBUG] Navigation SET at handleAuthComplete login (line ~398). Bypassing Lang modal for returning users.");
      
      // For returning users (login), always skip the language transition modal
      pendingNavigationRef.current();
      pendingNavigationRef.current = null;
      
      return;
    }

    setFlowState({
      scenario: data.scenario,
      interlocutor: data.interlocutor,
      scenarioType: data.scenarioType,
      guidedFields: data.guidedFields,
    });

    pendingSetupRef.current = data;

    pendingNavigationRef.current = () => {
      setPage("practice-session");
      window.location.hash = "#practice-session";
    };
    console.log("[DEBUG] pendingNavigationRef SET at handleAuthComplete registro (line ~421)");
    // Skip language transition modal for EN users (already in English)
    if (landingLang === "en") {
      pendingNavigationRef.current();
      pendingNavigationRef.current = null;
    } else {
      langModalDismissedRef.current = false; // Reset guard before showing modal
      setShowLangModal(true);
      console.log("[DEBUG] setShowLangModal(true) at handleAuthComplete registro");
    }
  };

  const handleProfileUpdate = (profile: OnboardingProfile) => {
    setUserProfile(profile);
    try {
      localStorage.setItem("influentia_profile", JSON.stringify(profile));
    } catch { /* ignore */ }
  };

  const handlePracticeFinish = () => {
    // Mark free session as used when finishing a practice
    usageGating.markFreeSessionUsed();
    setPage("dashboard");
    window.location.hash = "#dashboard";
  };

  const handleBackToLanding = () => {
    setFlowState({ scenario: "", interlocutor: "" });
    setPage("landing");
    window.location.hash = "";
  };

  const handleNewPractice = () => {
    // DEV MODE: bypass usage gating — always allow
    setFlowState({ scenario: "", interlocutor: "" });
    setPage("landing");
    window.location.hash = "";
  };

  const handleStartNewPractice = (scenario: string, scenarioType?: string) => {
    // DEV MODE: bypass usage gating — always allow
    if (scenarioType === "interview" || scenarioType === "sales") {
      // Dashboard → direct to practice-session (skip widget)
      // No guidedFields: PracticeSessionPage will show role field in ExtraContext
      const defaultInterlocutor = scenarioType === "interview" ? "recruiter" : "decision_maker";
      setFlowState({
        scenario,
        interlocutor: defaultInterlocutor,
        scenarioType: scenarioType as ScenarioType,
        // No guidedFields — signals "from Dashboard" flow
      });
      setPage("practice-session");
      window.location.hash = "#practice-session";
    } else {
      setPage("landing");
      window.location.hash = "";
    }
  };

  const handleNavigateToHistory = () => {
    setPage("practice-history");
    window.location.hash = "#practice-history";
  };

  const handleBackToDashboard = () => {
    setPage("dashboard");
    window.location.hash = "#dashboard";
  };

  if (isInitializing) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="w-8 h-8 rounded-full border-2 border-[#0f172b] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="size-full">
        <Suspense fallback={<LoadingScreen scenario="" />}>
          {page === "design-system" && <DesignSystemPage />}
          {page === "landing" && (
            <LandingPage
              onAuthComplete={handleAuthComplete}
              landingLang={landingLang}
              onLangChange={handleLangChange}
              authUser={authUser}
              onLogout={() => {
                authService.signOut().catch(() => {});
                handleBackToLanding();
                setAuthUser(null);
              }}
              onGoToDashboard={handleBackToDashboard}
            />
          )}
          {page === "loading" && <LoadingScreen scenario={flowState.scenario} />}
          {page === "practice-session" && (
            <PracticeSessionPage
              scenario={flowState.scenario}
              interlocutor={flowState.interlocutor || "recruiter"}
              scenarioType={flowState.scenarioType || "interview"}
              guidedFields={flowState.guidedFields}
              marketFocus={marketFocus}
              onFinish={handlePracticeFinish}
              onNewPractice={handleNewPractice}
              userPlan={authUser?.plan}
              userProfile={userProfile}
              onProfileUpdate={handleProfileUpdate}
              devInitialStep={devPreview?.step}
              devMockFeedback={devPreview?.mockFeedback}
              devMockSummary={devPreview?.mockSummary}
              devMockPronData={devPreview?.mockPronData}
              devMockScript={devPreview?.mockScript}
              devMockInterviewBriefing={devPreview?.mockInterviewBriefing}
              userName={authUser?.displayName}
              onLogout={() => {
                authService.signOut().catch(() => {});
                handleBackToLanding();
                setAuthUser(null);
              }}
              onNavigateToAccount={() => {
                setPage("account");
                window.location.hash = "#account";
              }}
            />
          )}
          {page === "dashboard" && (
            <DashboardPage
              userName={authUser?.displayName}
              firstPracticeScenario={flowState.scenario}
              firstPracticeInterlocutor={flowState.interlocutor}
              onLogout={handleBackToLanding}
              onNavigateToHistory={handleNavigateToHistory}
              onNavigateToAccount={() => {
                setPage("account");
                window.location.hash = "#account";
              }}
              onStartNewPractice={handleStartNewPractice}
              userProfile={userProfile}
              onProfileUpdate={handleProfileUpdate}
              lang={landingLang}
            />
          )}
          {page === "practice-history" && (
            <PracticeHistoryPage
              userName={authUser?.displayName}
              firstPracticeScenario={flowState.scenario}
              firstPracticeInterlocutor={flowState.interlocutor}
              onBack={handleBackToDashboard}
              onLogout={handleBackToLanding}
            />
          )}
          {page === "account" && (
            <AccountPage
              userProfile={userProfile}
              authUser={authUser}
              onBack={handleBackToDashboard}
              onLogout={() => {
                authService.signOut().catch(() => {});
                handleBackToLanding();
                setAuthUser(null);
              }}
            />
          )}
          {showLangModal && (
            <LanguageTransitionModal
              fromLang={landingLang}
              onContinue={() => {
                // Guard: prevent double-fire (AnimatePresence exit re-render race)
                if (langModalDismissedRef.current) {
                  console.log("[DEBUG LanguageModal] onContinue BLOCKED (already dismissed)");
                  return;
                }
                langModalDismissedRef.current = true;

                console.log("[DEBUG LanguageModal] onContinue fired. pendingNav is:", pendingNavigationRef.current ? "SET" : "NULL");
                setShowLangModal(false);

                if (pendingNavigationRef.current) {
                  pendingNavigationRef.current();
                  pendingNavigationRef.current = null;
                } else {
                  // Fallback: if ref was lost (race condition), navigate to practice-session
                  // (the modal only shows after a practice setup, so this is the expected destination)
                  console.warn("[inFluentia] pendingNavigationRef was null — fallback to practice-session");
                  setPage("practice-session");
                  window.location.hash = "#practice-session";
                }
              }}
            />
          )}

          {/* New-session paywall modal */}
          <CreditUpsellModal
            open={showNewSessionPaywall}
            onClose={() => {
              setShowNewSessionPaywall(false);
              pendingNewSessionRef.current = null;
            }}
            onPurchaseComplete={(_pack: CreditPack, creditsAdded: number) => {
              usageGating.addCredits(creditsAdded);
              setShowNewSessionPaywall(false);
              // After purchase, proceed to new session
              pendingNewSessionRef.current?.();
              pendingNewSessionRef.current = null;
            }}
            paywallReason="new-session"
            creditsRemaining={usageGating.credits}
            lang={landingLang}
          />
        </Suspense>

        {/* Dev Preview Menu — floating dropdown for rapid UI testing (disabled for prod) */}
        {/* <DevPreviewMenu onNavigate={handleDevNavigate} /> */}
      </div>
    </ErrorBoundary>
  );
}