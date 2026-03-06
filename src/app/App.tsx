import { useState, useEffect, useRef } from "react";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { LandingPage } from "./components/LandingPage";
import { DesignSystemPage } from "./components/DesignSystemPage";
import { PracticeSessionPage } from "./components/PracticeSessionPage";
import { DashboardPage } from "./components/DashboardPage";
import { PracticeHistoryPage } from "./components/PracticeHistoryPage";
import { LoadingScreen } from "./components/LoadingScreen";
import { LanguageTransitionModal } from "./components/LanguageTransitionModal";
import { authService } from "../services";
import type { User, OnboardingProfile, ScenarioType } from "../services/types";
import type { MarketFocus } from "../services/prompts";
import type { SetupModalResult } from "./components/PracticeWidget";
import { AnimatePresence } from "motion/react";
import type { LandingLang } from "./components/landing-i18n";
import { CreditUpsellModal } from "./components/CreditUpsellModal";
import { useUsageGating } from "./hooks/useUsageGating";
import type { CreditPack } from "../services/types";

/* ─── App-level page types ─── */
type Page =
  | "landing"
  | "design-system"
  | "loading"
  | "practice-session"
  | "dashboard"
  | "practice-history";

/* ─── Shared flow state ─── */
interface FlowState {
  scenario: string;
  interlocutor: string;
  scenarioType?: ScenarioType;
  guidedFields?: Record<string, string>;
}

export default function App() {
  const [isInitializing, setIsInitializing] = useState(true);
  const [page, setPage] = useState<Page>(() => {
    const hash = window.location.hash;
    if (hash === "#design-system") return "design-system";
    if (hash === "#dashboard") return "dashboard";
    if (hash === "#practice-session") return "practice-session";
    if (hash === "#practice-history") return "practice-history";
    return "landing";
  });

  const [flowState, setFlowState] = useState<FlowState>(() => {
    if (window.location.hash === "#dashboard" || window.location.hash === "#practice-history") {
      return {
        scenario: "Sales pitch: Producto B2B SaaS para LATAM",
        interlocutor: "VP of Sales",
      };
    }
    return { scenario: "", interlocutor: "" };
  });

  /* ─── Auth state ─── */
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

  /* ─── MarketFocus from LanguageTransitionModal ─── */
  const [selectedMarketFocus, setSelectedMarketFocus] = useState<MarketFocus | null>(null);

  /* ─── Language transition modal ─── */
  const [showLangModal, setShowLangModal] = useState(false);
  const pendingNavigationRef = useRef<(() => void) | null>(null);
  const [landingLang, setLandingLang] = useState<LandingLang>(() => {
    try {
      const saved = localStorage.getItem("influentia_lang");
      if (saved === "es" || saved === "pt" || saved === "en") return saved;
    } catch { /* ignore */ }
    return "es";
  });

  const handleLangChange = (lang: LandingLang) => {
    setLandingLang(lang);
    try {
      localStorage.setItem("influentia_lang", lang);
    } catch { /* ignore */ }
  };

  /* ─── Auth state listener (mock in prototype mode) ─── */
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((user) => {
      const hadUser = prevAuthUserRef.current !== null;
      prevAuthUserRef.current = user;
      setAuthUser(user);

      if (user && !hadUser) {
        let pendingAct: any = null;
        try {
          const saved = localStorage.getItem("pendingAuthAction");
          if (saved) {
            pendingAct = JSON.parse(saved);
            localStorage.removeItem("pendingAuthAction");
          }
        } catch { }

        setPage((currentPage) => {
          if (currentPage === "landing") {
            const pending = pendingSetupRef.current || (pendingAct?.mode === "registro" ? pendingAct.data : null);

            // Read latest language from storage to avoid stale closure
            let currentLang = "es";
            try {
              const savedLang = localStorage.getItem("influentia_lang");
              if (savedLang === "es" || savedLang === "pt" || savedLang === "en") {
                currentLang = savedLang;
              }
            } catch { }

            // Check if user already completed language transition
            const langDone = (() => { try { return localStorage.getItem("langTransitionDone") === "1"; } catch { return false; } })();

            if (pending) {
              setFlowState({
                scenario: pending.scenario,
                interlocutor: pending.interlocutor,
                scenarioType: pending.scenarioType,
                guidedFields: pending.guidedFields,
              });
              pendingSetupRef.current = null;

              if (currentLang === "en") {
                window.location.hash = "#practice-session";
                return "practice-session";
              } else {
                pendingNavigationRef.current = () => {
                  setPage("practice-session");
                  window.location.hash = "#practice-session";
                };
                setShowLangModal(true);
                return "landing";
              }
            }

            // No pending setup from PracticeWidget.
            // First-time user (registro) → practice-session with defaults.
            // Returning user (login) → dashboard.
            const authAction = pendingAct?.mode;
            const isFirstTimeUser = authAction === "registro" || !user.freeSessionUsed;

            setFlowState((prev) =>
              prev.scenario
                ? prev
                : {
                  scenario: "Sales pitch: Producto B2B SaaS para LATAM",
                  interlocutor: "VP of Sales",
                  scenarioType: "sales" as ScenarioType,
                }
            );

            const targetPage = isFirstTimeUser ? "practice-session" : "dashboard";


            if (currentLang === "en" || langDone) {
              window.location.hash = `#${targetPage}`;
              return targetPage as Page;
            } else {
              pendingNavigationRef.current = () => {
                setPage(targetPage);
                window.location.hash = `#${targetPage}`;
              };
              setShowLangModal(true);
              return "landing";
            }
          }
          return currentPage;
        });
      }

      if (!user && hadUser) {
        setFlowState({ scenario: "", interlocutor: "" });
        setPage("landing");
        window.location.hash = "";
      }

      // If user comes back non-null, we are definitely initialized.
      // If user is null, it could be the immediate synchronous fire from the service
      // before Supabase has actually checked local storage. We don't want to flash the landing page.
      if (user) {
        setIsInitializing(false);
      }
    });

    const isOauthRedirect = window.location.hash.includes("access_token=") || window.location.hash.includes("error_description=");

    // Fallback timer: 
    // If it's a normal load, 600ms is enough to know if there's no session in local storage.
    // If it's an OAuth redirect, Supabase needs time to exchange tokens and fetch the profile
    // over the network, which can take 1-2 seconds.
    const fallbackTimer = setTimeout(() => {
      setIsInitializing(false);
    }, isOauthRedirect ? 3000 : 700);

    return () => {
      unsubscribe();
      clearTimeout(fallbackTimer);
    };
  }, []);

  /* ─── Hash-based routing ─── */
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
              interlocutor: "VP of Sales",
            }
        );
        setPage("dashboard");
      } else if (hash === "#practice-session") setPage("practice-session");
      else if (hash === "#practice-history") setPage("practice-history");
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
            interlocutor: "VP of Sales",
          }
      );
      try {
        localStorage.setItem("pendingAuthAction", JSON.stringify({ mode: "login" }));
      } catch { }

      pendingNavigationRef.current = () => {
        setPage("dashboard");
        window.location.hash = "#dashboard";
      };
      // Skip language transition modal for EN users (already in English)
      if (landingLang === "en") {
        pendingNavigationRef.current();
        pendingNavigationRef.current = null;
      } else {
        setShowLangModal(true);
      }
      return;
    }

    setFlowState({
      scenario: data.scenario,
      interlocutor: data.interlocutor,
      scenarioType: data.scenarioType,
      guidedFields: data.guidedFields,
    });

    pendingSetupRef.current = data;
    try {
      localStorage.setItem("pendingAuthAction", JSON.stringify({ mode: "registro", data }));
    } catch { }

    pendingNavigationRef.current = () => {
      setPage("practice-session");
      window.location.hash = "#practice-session";
    };
    // Skip language transition modal for EN users (already in English)
    if (landingLang === "en") {
      pendingNavigationRef.current();
      pendingNavigationRef.current = null;
    } else {
      setShowLangModal(true);
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
    const gate = usageGating.canStartSession();
    if (!gate.allowed) {
      pendingNewSessionRef.current = () => {
        setFlowState({ scenario: "", interlocutor: "" });
        setPage("landing");
        window.location.hash = "";
      };
      setShowNewSessionPaywall(true);
      return;
    }
    setFlowState({ scenario: "", interlocutor: "" });
    setPage("landing");
    window.location.hash = "";
  };

  const handleStartNewPractice = (_scenario: string) => {
    const gate = usageGating.canStartSession();
    if (!gate.allowed) {
      pendingNewSessionRef.current = () => {
        setPage("landing");
        window.location.hash = "";
      };
      setShowNewSessionPaywall(true);
      return;
    }
    setPage("landing");
    window.location.hash = "";
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
      <div className="w-full h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-gray-200 border-t-[#0f172b] animate-spin" />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="size-full">
        {page === "design-system" && <DesignSystemPage />}
        {page === "landing" && (
          <LandingPage onAuthComplete={handleAuthComplete} landingLang={landingLang} onLangChange={handleLangChange} />
        )}
        {page === "loading" && <LoadingScreen scenario={flowState.scenario} />}
        {page === "practice-session" && (
          <PracticeSessionPage
            scenario={flowState.scenario}
            interlocutor={flowState.interlocutor || "Client"}
            scenarioType={flowState.scenarioType}
            guidedFields={flowState.guidedFields}
            marketFocus={selectedMarketFocus ?? authUser?.marketFocus}
            onFinish={handlePracticeFinish}
            onNewPractice={handleNewPractice}
            userPlan={authUser?.plan}
          />
        )}
        {page === "dashboard" && (
          <DashboardPage
            userName={authUser?.displayName}
            firstPracticeScenario={flowState.scenario}
            firstPracticeInterlocutor={flowState.interlocutor}
            onLogout={handleBackToLanding}
            onNavigateToHistory={handleNavigateToHistory}
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
        <AnimatePresence>
          {showLangModal && (
            <LanguageTransitionModal
              fromLang={landingLang}
              onContinue={(marketFocus) => {
                setSelectedMarketFocus(marketFocus);
                setShowLangModal(false);
                try { localStorage.setItem("langTransitionDone", "1"); } catch { /* ignore */ }
                pendingNavigationRef.current?.();
                pendingNavigationRef.current = null;
              }}
            />
          )}
        </AnimatePresence>

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
      </div>
    </ErrorBoundary>
  );
}