import { SUPABASE_URL } from "@/services/supabase";
import { useState, useEffect, useRef, lazy, Suspense } from "react";
import { ErrorBoundary } from "./components/ErrorBoundary";
const LandingPage = lazyRetry(() => import("@/pages/landing/LandingPage").then(m => ({ default: m.LandingPage })));
const DesignSystemPage = lazyRetry(() => import("../pages/DesignSystemPage").then(m => ({ default: m.DesignSystemPage })));
const PracticeSessionPage = lazyRetry(() => import("../pages/PracticeSessionPage").then(m => ({ default: m.PracticeSessionPage })));
const DashboardPage = lazyRetry(() => import("@/features/dashboard/ui/DashboardPage").then(m => ({ default: m.DashboardPage })));
const PracticeHistoryPage = lazyRetry(() => import("@/features/dashboard/ui/PracticeHistoryPage").then(m => ({ default: m.PracticeHistoryPage })));
const AccountPage = lazyRetry(() => import("../pages/AccountPage").then(m => ({ default: m.AccountPage })));
const LibraryPage = lazyRetry(() => import("../pages/LibraryPage").then(m => ({ default: m.LibraryPage })));
const AdminDashboardPage = lazyRetry(() => import("../pages/AdminDashboardPage").then(m => ({ default: m.AdminDashboardPage })));
const TermsPage = lazyRetry(() => import("../pages/legal/TermsPage").then(m => ({ default: m.TermsPage })));
const PrivacyPage = lazyRetry(() => import("../pages/legal/PrivacyPage").then(m => ({ default: m.PrivacyPage })));

import { LoadingScreen } from "./components/LoadingScreen";
import { LanguageTransitionModal } from "./components/LanguageTransitionModal";
import type { User, OnboardingProfile, ScenarioType, SessionSummary, TurnPronunciationData, ScriptSection, InterviewBriefingData } from "@/services/types";
import type { SetupModalResult } from "@/pages/landing/PracticeWidget";
// AnimatePresence removed — was causing modal to linger during exit animation
// when auth re-renders interrupted the exit. Direct unmount is bulletproof.
import type { LandingLang } from "@/shared/i18n/landing-i18n";
import { PathPurchaseModal } from "@/widgets/PathPurchaseModal";
import type { PurchaseType } from "../services/types";
import { useUsageGating } from "@/shared/hooks/useUsageGating";
import { PaymentSuccessHandler } from "@/shared/ui/PaymentSuccessHandler";
import type { MarketFocus } from "../services/prompts";
import { projectId } from "../../utils/supabase/info";
import { DevPreviewMenu, getDevMockData } from "./components/DevPreviewMenu";
import type { Step } from "@/entities/session";
import type { RealFeedbackData } from "@/features/practice-session/ui/ConversationFeedback";
import { useHashRouter } from "./hooks/useHashRouter";
import type { Page } from "./hooks/useHashRouter";
import { useAuthFlow } from "./hooks/useAuthFlow";
import type { FlowState } from "./hooks/useAuthFlow";
import { authService } from "../services";

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
  /* ─── Admin email whitelist (from env, not exposed in source) ─── */
  const ADMIN_EMAILS = (import.meta.env.VITE_ADMIN_EMAILS || "").split(",").map((e: string) => e.trim().toLowerCase()).filter(Boolean);

  /* ─── DEV MODE: sessionStorage keys for OAuth redirect recovery ─── */
  const OAUTH_PENDING_KEY = "influentia_oauth_pending";
  const PENDING_SETUP_KEY = "influentia_pending_setup";

  const [page, setPage] = useState<Page>(() => {
    const hash = window.location.hash;
    if (hash === "#design-system") return "design-system";
    if (hash === "#admin") return "admin";
    if (hash === "#terms") return "terms";
    if (hash === "#privacy") return "privacy";

    // For authenticated app pages, check if there's a Supabase session
    // in localStorage. If so, respect the hash so users stay on their
    // current page across refreshes and lazy-load remounts.
    const AUTH_PAGES: Record<string, Page> = {
      "#dashboard": "dashboard",
      "#practice-session": "practice-session",
      "#practice-history": "practice-history",
      "#account": "account",
      "#library": "library",
      "#study-phase": "study-phase",
    };
    if (AUTH_PAGES[hash] || hash.startsWith("#study-phase")) {
      // Quick check: does a Supabase session exist in localStorage?
      const hasSession = Object.keys(localStorage).some(
        (k) => k.startsWith("sb-") && k.endsWith("-auth-token")
      );
      if (hasSession) {
        return AUTH_PAGES[hash];
      }
      // No session → clear hash and go to landing
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
      else if (optionId.includes("conversation-feedback")) step = "interview-analysis";
      else if (optionId.includes("session-recap")) step = "interview-analysis";
      else if (optionId.includes("interview-analysis")) step = "interview-analysis";

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
              const sType = setup.scenarioType || "interview";
              setFlowState({
                scenario: setup.scenario || "",
                interlocutor: setup.interlocutor || "recruiter",
                scenarioType: sType,
                guidedFields: setup.guidedFields,
                progressionPathId: sType as ScenarioType,
                progressionLevelId: setup.progressionLevelId || (sType === "interview" ? "int-1" : "sal-1"),
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
            // Check if user arrived via pricing CTA — show purchase modal on dashboard
            const hasPurchaseIntent = sessionStorage.getItem("influentia_purchase_intent") === "true";
            if (hasPurchaseIntent) {
              sessionStorage.removeItem("influentia_purchase_intent");
            }
            setPage("dashboard");
            window.location.hash = "#dashboard";
            if (hasPurchaseIntent) {
              // Slight delay to let dashboard mount before opening modal
              setTimeout(() => setShowNewSessionPaywall(true), 400);
            }
          } else if (window.location.hash === "#admin") {
            // Admin direct access — page already set to admin, just ensure it stays
            setPage("admin");
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
      else if (hash === "#library") setPage("library");
      else if (hash === "#admin") setPage("admin");
      else if (hash === "#terms") setPage("terms");
      else if (hash === "#privacy") setPage("privacy");
      else if (hash.startsWith("#study-phase")) setPage("study-phase");
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

    // Map scenarioType → progression path + Level 1 (default for new users)
    // PracticeSessionPage will upgrade to the highest unlocked level on mount
    const pathId = data.scenarioType === "interview" ? "interview" : data.scenarioType === "sales" ? "sales" : data.scenarioType === "meeting" ? "meeting" : "presentation";
    const defaultLevelId = data.scenarioType === "interview" ? "int-1" : data.scenarioType === "sales" ? "sal-1" : data.scenarioType === "meeting" ? "meet-1" : "pres-1";

    setFlowState({
      scenario: data.scenario,
      interlocutor: data.interlocutor,
      scenarioType: data.scenarioType,
      guidedFields: data.guidedFields,
      progressionPathId: pathId,
      progressionLevelId: defaultLevelId,
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

    // Sync CV-related fields to backend KV store (fire-and-forget)
    const kvFields: Record<string, unknown> = {};
    if ("cvConsentGiven" in profile) kvFields.cvConsentGiven = profile.cvConsentGiven;
    if ("cvSummary" in profile) kvFields.cvSummary = profile.cvSummary;
    if ("cvFileName" in profile) kvFields.cvFileName = profile.cvFileName;

    if (Object.keys(kvFields).length > 0) {
      import("../services/supabase").then(({ getAuthToken }) => {
        getAuthToken().then((token) => {
          fetch(
            `${SUPABASE_URL}/functions/v1/make-server-08b8658d/profile`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(kvFields),
            }
          ).catch(() => { /* silent — admin data sync only */ });
        }).catch(() => { /* no auth token — skip sync */ });
      });
    }
  };

  const handlePracticeFinish = () => {
    // v9.0: Mark demo session as used for this scenario
    usageGating.markDemoSessionUsed(flowState.scenarioType || "interview");
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

  const handleStartNewPractice = (scenario: string, scenarioType?: string, levelId?: string, interlocutor?: string) => {
    const validPaths = new Set<string>(["interview", "sales", "meeting", "presentation", "client", "csuite"]);
    if (scenarioType && validPaths.has(scenarioType)) {
      // Dashboard → direct to practice-session (skip widget)
      const interlocutorDefaults: Record<string, string> = {
        interview: "recruiter",
        sales: "decision_maker",
        meeting: "meeting_facilitator",
        presentation: "senior_stakeholder",
        client: "senior_stakeholder",
        csuite: "senior_stakeholder",
      };
      const defaultInterlocutor = interlocutor || interlocutorDefaults[scenarioType] || "senior_stakeholder";
      setFlowState({
        scenario,
        interlocutor: defaultInterlocutor,
        scenarioType: scenarioType as ScenarioType,
        progressionLevelId: levelId,
        progressionPathId: levelId ? (scenarioType as ScenarioType) : undefined,
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

  const handleNavigateToLibrary = () => {
    setPage("library");
    window.location.hash = "#library";
  };

  const handleNavigateToAdmin = () => {
    setPage("admin");
    window.location.hash = "#admin";
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
              onPricingPurchase={() => {
                // Authenticated user clicked pricing CTA on landing
                setFlowState((prev) => prev.scenarioType ? prev : {
                  ...prev,
                  scenarioType: "interview" as ScenarioType,
                });
                setPage("dashboard");
                window.location.hash = "#dashboard";
                setTimeout(() => setShowNewSessionPaywall(true), 300);
              }}
            />
          )}
          {page === "loading" && <LoadingScreen scenario={flowState.scenario} />}
          {page === "practice-session" && (
            <PracticeSessionPage
              scenario={flowState.scenario}
              interlocutor={flowState.interlocutor || "recruiter"}
              scenarioType={flowState.scenarioType || "interview"}
              guidedFields={flowState.guidedFields}
              progressionLevelId={flowState.progressionLevelId}
              progressionPathId={flowState.progressionPathId}
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
              onNavigateToLibrary={handleNavigateToLibrary}
            />
          )}
          {page === "library" && (
            <LibraryPage
              onBack={handleBackToDashboard}
            />
          )}
          {page === "admin" && (
            authUser && ADMIN_EMAILS.includes(authUser.email?.toLowerCase() || "") ? (
              <AdminDashboardPage
                onBack={handleBackToDashboard}
              />
            ) : (
              <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" as const, alignItems: "center", justifyContent: "center", background: "#0f172a", color: "#e2e8f0", fontFamily: "'Inter', sans-serif", gap: 16 }}>
                {!authUser ? (
                  <>
                    <div style={{ width: 32, height: 32, border: "3px solid #334155", borderTopColor: "#6366f1", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                    <p style={{ color: "#94a3b8" }}>Authenticating...</p>
                  </>
                ) : (
                  <>
                    <p style={{ fontSize: 48 }}>🔒</p>
                    <p style={{ fontSize: 18, fontWeight: 600 }}>Access Denied</p>
                    <p style={{ color: "#64748b", fontSize: 14 }}>{authUser.email} is not an admin</p>
                    <button onClick={handleBackToDashboard} style={{ marginTop: 12, padding: "8px 20px", background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)", borderRadius: 8, color: "#818cf8", cursor: "pointer", fontSize: 14 }}>
                      ← Back to Dashboard
                    </button>
                  </>
                )}
              </div>
            )
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
          {page === "terms" && <TermsPage />}
          {page === "privacy" && <PrivacyPage />}

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

          {/* v11.0: PathPurchaseModal — Mode A ($4.99 first) / Mode B ($16.99 additional) */}
          <PathPurchaseModal
            open={showNewSessionPaywall}
            scenarioType={flowState.scenarioType || "interview"}
            paywallReason="path-required"
            ownedPaths={usageGating.purchasedPaths}
            onClose={() => {
              setShowNewSessionPaywall(false);
              pendingNewSessionRef.current = null;
            }}
            onPurchaseComplete={(_purchaseType: PurchaseType) => {
              usageGating.addPurchasedPath(flowState.scenarioType || "interview");
              setShowNewSessionPaywall(false);
              pendingNewSessionRef.current?.();
              pendingNewSessionRef.current = null;
            }}
          />

          {/* Stripe payment redirect handler — shows success toast */}
          <PaymentSuccessHandler
            authReady={!!authUser}
            onPaymentConfirmed={() => {
              // Refresh user profile to pick up new paths_purchased
              import("../services").then(({ userService }) => {
                userService.getProfile("current").then((u) => {
                  setAuthUser((prev) => prev ? { ...prev, plan: u.plan, pathsPurchased: u.pathsPurchased } : prev);
                }).catch(() => {});
              });
            }}
          />
        </Suspense>

        {/* Dev Preview Menu — floating dropdown for rapid UI testing (admin only) */}
        {authUser && ADMIN_EMAILS.includes(authUser.email?.toLowerCase() || "") && (
          <DevPreviewMenu onNavigate={handleDevNavigate} />
        )}
      </div>
    </ErrorBoundary>
  );
}