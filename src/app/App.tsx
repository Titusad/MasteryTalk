import { SUPABASE_URL } from "@/services/supabase";
import { useState, useEffect, useRef, lazy, Suspense } from "react";
import { ErrorBoundary } from "./components/ErrorBoundary";
/* ── Stale-chunk recovery for React.lazy after Vercel deploys ──
   On chunk 404, the URL is baked into the cached index.js — retrying
   the same URL won't help. A page reload fetches the new index.js
   with updated chunk hashes. The 10s cooldown prevents infinite loops. */
function lazyRetry(factory: () => Promise<any>) {
  return lazy(() =>
    factory().catch((err: any) => {
      const lastReload = Number(sessionStorage.getItem("chunk_reload_ts") || "0");
      if (Date.now() - lastReload > 10_000) {
        sessionStorage.setItem("chunk_reload_ts", String(Date.now()));
        window.location.reload();
        return new Promise(() => {}); // never resolves — reload takes over
      }
      throw err; // already reloaded recently — let ErrorBoundary handle it
    })
  );
}

const LandingPage = lazyRetry(() => import("@/pages/landing/LandingPage").then(m => ({ default: m.LandingPage })));
const Landing2Page = lazyRetry(() => import("@/pages/landing/Landing2Page").then(m => ({ default: m.Landing2Page })));
const Landing3Page = lazyRetry(() => import("@/pages/landing/Landing3Page").then(m => ({ default: m.Landing3Page })));
const DesignSystemPage = lazyRetry(() => import("../pages/DesignSystemPage").then(m => ({ default: m.DesignSystemPage })));
const PracticeSessionPage = lazyRetry(() => import("../pages/PracticeSessionPage").then(m => ({ default: m.PracticeSessionPage })));
const DashboardPage = lazyRetry(() => import("@/features/dashboard/ui/DashboardPage").then(m => ({ default: m.DashboardPage })));
const PracticeHistoryPage = lazyRetry(() => import("@/pages/PracticeHistoryPage").then(m => ({ default: m.PracticeHistoryPage })));
const AccountPage = lazyRetry(() => import("../pages/AccountPage").then(m => ({ default: m.AccountPage })));
const LibraryPage = lazyRetry(() => import("../pages/LibraryPage").then(m => ({ default: m.LibraryPage })));
const AdminDashboardPage = lazyRetry(() => import("../pages/AdminDashboardPage").then(m => ({ default: m.AdminDashboardPage })));
const TermsPage = lazyRetry(() => import("../pages/legal/TermsPage").then(m => ({ default: m.TermsPage })));
const PrivacyPage = lazyRetry(() => import("../pages/legal/PrivacyPage").then(m => ({ default: m.PrivacyPage })));
const CookiesPage = lazyRetry(() => import("../pages/legal/CookiesPage").then(m => ({ default: m.CookiesPage })));
const OnboardingProfileScreen = lazyRetry(() => import("@/features/onboarding/ui/OnboardingProfileScreen").then(m => ({ default: m.OnboardingProfileScreen })));

import { LoadingScreen } from "./components/LoadingScreen";
import { AuthLoadingScreen } from "./components/AuthLoadingScreen";
import { LanguageTransitionModal } from "./components/LanguageTransitionModal";
import type { User, OnboardingProfile, ScenarioType, SessionSummary, TurnPronunciationData, ScriptSection, InterviewBriefingData } from "@/services/types";
import type { PathId } from "@/features/dashboard/model/progression-paths";
import type { SetupModalResult } from "@/pages/landing/PracticeWidget";
// AnimatePresence removed — was causing modal to linger during exit animation
// when auth re-renders interrupted the exit. Direct unmount is bulletproof.
import type { LandingLang } from "@/shared/i18n/landing-i18n";
import { AppHeader } from "@/shared/ui/AppHeader";
import { PathPurchaseModal } from "@/widgets/PathPurchaseModal";
import type { PurchaseType } from "../services/types";
import { useUsageGating } from "@/shared/hooks/useUsageGating";
import { PaymentSuccessHandler } from "@/shared/ui/PaymentSuccessHandler";
import { NarrationToggle } from "@/shared/ui/NarrationToggle";
import { CookieBanner } from "@/shared/ui/CookieBanner";
import { setNarrationMuted } from "@/shared/lib/useNarrationPreference";
import type { MarketFocus } from "../services/prompts";
import { projectId } from "../../utils/supabase/info";

import { useHashRouter } from "./hooks/useHashRouter";
import type { Page } from "./hooks/useHashRouter";
import { useAuthFlow } from "./hooks/useAuthFlow";
import type { FlowState } from "./hooks/useAuthFlow";
import { authService } from "../services";
import { runStorageMigration } from "@/shared/lib/storageMigration";

/* Run once on load — migrates old influentia_* keys */
runStorageMigration();



export default function App() {
  /* ─── Admin email whitelist (from env, not exposed in source) ─── */
  const ADMIN_EMAILS = (import.meta.env.VITE_ADMIN_EMAILS || "").split(",").map((e: string) => e.trim().toLowerCase()).filter(Boolean);

  /* ─── DEV MODE: sessionStorage keys for OAuth redirect recovery ─── */
  const OAUTH_PENDING_KEY = "masterytalk_oauth_pending";
  const PENDING_SETUP_KEY = "masterytalk_pending_setup";

  const [page, setPage] = useState<Page>(() => {
    const hash = window.location.hash;
    // Strip query params from hash to get just the path (e.g. #dashboard?payment=success → #dashboard)
    const hashPath = hash.split("?")[0];

    if (hashPath === "#design-system") return "design-system";
    if (hashPath === "#admin") return "admin";
    if (hashPath === "#terms") return "terms";
    if (hashPath === "#privacy") return "privacy";
    if (hashPath === "#landing2") return "landing2";
    if (hashPath === "#landing3") return "landing3";

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
    if (AUTH_PAGES[hashPath] || hashPath.startsWith("#study-phase")) {
      // Quick check: does a Supabase session exist in localStorage?
      const hasSession = Object.keys(localStorage).some(
        (k) => k.startsWith("sb-") && k.endsWith("-auth-token")
      );
      if (hasSession) {
        return AUTH_PAGES[hashPath];
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
  // Covers landing during OAuth redirect — uses a SEPARATE key from the
  // practice-setup key so it doesn't interfere with the PracticeWidget flow.
  const [isOAuthPending, setIsOAuthPending] = useState(
    () => sessionStorage.getItem("masterytalk_auth_loading") === "true"
  );
  useEffect(() => {
    if (!isOAuthPending) return;
    // Safety: if navigation never completes (auth failure), release after 5s
    const t = setTimeout(() => setIsOAuthPending(false), 5000);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // runs once at mount, only when isOAuthPending was initially true

  /* ─── Onboarding profile ─── */
  const [userProfile, setUserProfile] = useState<OnboardingProfile | null>(
    () => {
      try {
        const saved = localStorage.getItem("masterytalk_profile");
        const profile = saved ? JSON.parse(saved) : null;
        // Restore mute state for returning users who completed their first session
        if (profile?.narrationCompleted) setNarrationMuted(true);
        return profile;
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

  /* ─── Onboarding gate ─── */
  const [showOnboarding, setShowOnboarding] = useState(false);

  /**
   * Navigate first, then check backend to decide if onboarding modal is needed.
   * Source of truth: backend KV. Modal only opens for genuine first-time users.
   * backendProfile is passed in from the auth handler that already fetched it.
   */
  const navigateWithOnboardingCheck = (
    navigateFn: () => void,
    backendProfile?: Record<string, unknown> | null,
  ) => {
    navigateFn();
    const hasProfile = backendProfile?.profile_completed || backendProfile?.position ||
      backendProfile?.industry || backendProfile?.keyExperience || backendProfile?.cvSummary;
    if (!hasProfile) {
      setShowOnboarding(true);
    }
  };
  const [landingLang, setLandingLang] = useState<LandingLang>(() => {
    try {
      const saved = localStorage.getItem("masterytalk_lang");
      if (saved === "es" || saved === "pt" || saved === "en") return saved;
    } catch { /* ignore */ }
    return "es";
  });

  /* ─── Market focus (region) — persisted in localStorage ─── */
  const [marketFocus, setMarketFocus] = useState<MarketFocus | null>(() => {
    try {
      const saved = localStorage.getItem("masterytalk_market_focus");
      if (saved === "mexico" || saved === "colombia" || saved === "brazil") return saved;
    } catch { /* ignore */ }
    return null;
  });



  const handleLangChange = (lang: LandingLang) => {
    setLandingLang(lang);
    try {
      localStorage.setItem("masterytalk_lang", lang);
    } catch { /* ignore */ }
  };

  /* ─── Auth state listener ─── */
  /*
   * DEV MODE: Forces a clean start every time.
   *
   * Flow A — Fresh visit (no OAuth return):
   *   1. No `masterytalk_oauth_pending` flag → sign out stale session
   *   2. Auth listener fires with null → stays on landing
   *
   * Flow B — Returning from Google OAuth redirect:
   *   1. `masterytalk_oauth_pending` flag exists → DON'T sign out
   *   2. Supabase detects session from URL fragment
   *   3. Auth listener fires with user → reads setup from sessionStorage
   *   4. Shows Language Modal → navigates to Practice Session
   */
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    let cancelled = false;

    const init = async () => {
      // isOAuthReturn: controls practice-setup flow (PracticeWidget key)
      const isOAuthReturn = sessionStorage.getItem(OAUTH_PENDING_KEY) === "true";
      // isAuthLoading: controls the branded loading screen (set for ALL signIn() calls)
      const isAuthLoading = sessionStorage.getItem("masterytalk_auth_loading") === "true";

      if (cancelled) return;

      // Now subscribe to auth state changes
      unsubscribe = authService.onAuthStateChanged((user) => {
        const hadUser = prevAuthUserRef.current !== null;
        prevAuthUserRef.current = user;
        setAuthUser(user);

        if (user && !hadUser) {
          // Wrap in async IIFE: fetch backend profile FIRST, then navigate.
          // setIsInitializing(false) fires AFTER the IIFE so the branded
          // loading screen covers the entire auth transition — no landing flash.
          (async () => {
            // ── Step 1: Fetch profile from backend (source of truth) ──
            let backendProfile: Record<string, unknown> | null = null;
            try {
              const { getAuthToken } = await import("../services/supabase");
              const token = await getAuthToken();
              const res = await fetch(
                `${SUPABASE_URL}/functions/v1/make-server-08b8658d/profile`,
                { headers: { Authorization: `Bearer ${token}` } }
              );
              if (res.ok) {
                const data = await res.json();
                // Only use if backend has actual profile content
                const hasContent = data.profile_completed || data.position ||
                  data.industry || data.keyExperience || data.cvSummary;
                if (hasContent) {
                  backendProfile = data;
                  setUserProfile(data as OnboardingProfile);
                }
              }
            } catch { /* silent — proceed without backend profile */ }

            // ── Step 2: Navigate, passing fetched profile to onboarding gate ──
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
                  progressionPathId: sType as PathId,
                  progressionLevelId: setup.progressionLevelId || (sType === "interview" ? "int-1" : "sal-1"),
                });

                const savedLang = localStorage.getItem("masterytalk_lang") || "es";
                pendingNavigationRef.current = () => {
                  setPage("practice-session");
                  window.location.hash = "#practice-session";
                };
                if (savedLang === "en") {
                  navigateWithOnboardingCheck(() => {
                    pendingNavigationRef.current?.();
                    pendingNavigationRef.current = null;
                  }, backendProfile);
                } else {
                  langModalDismissedRef.current = false;
                  setShowLangModal(true);
                }
              } catch (err) {
                console.warn("[MasteryTalk] Failed to parse pending setup:", err);
                setPage("dashboard");
                window.location.hash = "#dashboard";
              }
              return;
            }

            if (isReturning && !pendingRaw) {
              // OAuth return but no setup data — "Probar Gratis" flow → Dashboard
              sessionStorage.removeItem(OAUTH_PENDING_KEY);
              setFlowState({ scenario: "", interlocutor: "" });

              const savedLang = localStorage.getItem("masterytalk_lang") || "es";
              pendingNavigationRef.current = () => {
                setPage("dashboard");
                window.location.hash = "#dashboard";
              };

              if (savedLang === "en") {
                navigateWithOnboardingCheck(() => {
                  pendingNavigationRef.current?.();
                  pendingNavigationRef.current = null;
                }, backendProfile);
              } else {
                langModalDismissedRef.current = false;
                setShowLangModal(true);
              }
              return;
            }

            // Mock auth path: user appeared via signIn() (no redirect)
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

                const savedLang = localStorage.getItem("masterytalk_lang") || "es";
                pendingNavigationRef.current = () => {
                  setPage("practice-session");
                  window.location.hash = "#practice-session";
                };
                if (savedLang === "en") {
                  navigateWithOnboardingCheck(() => {
                    pendingNavigationRef.current?.();
                    pendingNavigationRef.current = null;
                  }, backendProfile);
                } else {
                  langModalDismissedRef.current = false;
                  setShowLangModal(true);
                }
              } catch {
                setPage("dashboard");
                window.location.hash = "#dashboard";
              }
              return;
            }

            // No pending setup — returning user goes to dashboard
            if (!window.location.hash || window.location.hash === "#" || window.location.hash === "#/") {
              const hasPurchaseIntent = sessionStorage.getItem("masterytalk_purchase_intent") === "true";
              if (hasPurchaseIntent) sessionStorage.removeItem("masterytalk_purchase_intent");

              navigateWithOnboardingCheck(() => {
                setPage("dashboard");
                window.location.hash = "#dashboard";
                if (hasPurchaseIntent) setTimeout(() => setShowNewSessionPaywall(true), 400);
              }, backendProfile);
            } else if (window.location.hash === "#admin") {
              setPage("admin");
            }
          })().finally(() => {
            sessionStorage.removeItem("masterytalk_auth_loading");
            setIsOAuthPending(false);
            setIsInitializing(false);
          });
        } else {
          // If auth_loading key was set (any signIn() call), keep the loader.
          // Only the IIFE .finally() clears isOAuthPending after navigation.
          if (!isAuthLoading) {
            setIsOAuthPending(false);
          }

          // If there's no user but the URL is a protected page (e.g. #dashboard),
          // Supabase may fire a transient null before the real session arrives.
          // Keep isInitializing=true briefly to avoid a flash of the page with
          // authUser=null (which hides the profile avatar).
          const isProtectedHash = ["#dashboard", "#account", "#practice-history", "#library", "#admin"]
            .some(h => window.location.hash.startsWith(h));

          if (!user && !hadUser && isProtectedHash) {
            // Safety release after 2s in case the real user event never comes
            setTimeout(() => setIsInitializing(false), 2000);
          } else {
            setIsInitializing(false);
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
  // Restore profile from backend after login (survives cache clears)
  useEffect(() => {
    if (!authUser) return;
    (async () => {
      try {
        const { getAuthToken } = await import("../services/supabase");
        const token = await getAuthToken();
        const res = await fetch(
          `${SUPABASE_URL}/functions/v1/make-server-08b8658d/profile`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok) return;
        const backendProfile = await res.json();
        // Check if backend has any meaningful profile data
        const hasData = backendProfile.profile_completed ||
          backendProfile.position || backendProfile.industry ||
          backendProfile.keyExperience || backendProfile.cvSummary;
        if (!hasData) return;
        setUserProfile(prev => {
          const merged = { ...(prev ?? {}), ...backendProfile } as OnboardingProfile;
          try { localStorage.setItem("masterytalk_profile", JSON.stringify(merged)); } catch { /* ignore */ }
          return merged;
        });
      } catch { /* silent — localStorage fallback still works */ }
    })();
  }, [authUser?.uid]); // re-runs only when the logged-in user changes

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
      else if (hash === "#cookies") setPage("cookies");
      else if (hash === "#landing2") setPage("landing2");
      else if (hash === "#landing3") setPage("landing3");
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
      navigateWithOnboardingCheck(() => {
        pendingNavigationRef.current?.();
        pendingNavigationRef.current = null;
      });
    } else {
      langModalDismissedRef.current = false; // Reset guard before showing modal
      setShowLangModal(true);
      console.log("[DEBUG] setShowLangModal(true) at handleAuthComplete registro");
    }
  };

  const handleProfileUpdate = (profile: OnboardingProfile) => {
    setUserProfile(profile);
    // Mute narration once user has completed their first session
    if (profile.narrationCompleted) setNarrationMuted(true);
    try {
      localStorage.setItem("masterytalk_profile", JSON.stringify(profile));
    } catch { /* ignore */ }

    // Sync profile fields to backend KV store (fire-and-forget)
    const kvFields: Record<string, unknown> = {};
    if ("cvConsentGiven" in profile) kvFields.cvConsentGiven = profile.cvConsentGiven;
    if ("cvSummary" in profile) kvFields.cvSummary = profile.cvSummary;
    if ("cvFileName" in profile) kvFields.cvFileName = profile.cvFileName;
    // Professional profile fields — persisted so they survive cache clears
    if ("position" in profile && profile.position) kvFields.position = profile.position;
    if ("industry" in profile && profile.industry) kvFields.industry = profile.industry;
    if ("profile_completed" in profile) kvFields.profile_completed = profile.profile_completed;
    if ("seniority" in profile && profile.seniority) kvFields.seniority = profile.seniority;
    if ("keyExperience" in profile && profile.keyExperience) kvFields.keyExperience = profile.keyExperience;

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

  /** Onboarding complete — save profile and close modal (page already navigated) */
  const handleOnboardingComplete = (profile: OnboardingProfile) => {
    // Mark as completed so future logins skip the form even without localStorage
    handleProfileUpdate({ ...profile, profile_completed: true } as OnboardingProfile);
    setShowOnboarding(false);
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

  const handleLogout = () => {
    authService.signOut().catch(() => {});
    handleBackToLanding();
    setAuthUser(null);
  };

  const handleNewPractice = () => {
    // DEV MODE: bypass usage gating — always allow
    setFlowState({ scenario: "", interlocutor: "" });
    setPage("landing");
    window.location.hash = "";
  };

  const handleStartNewPractice = (scenario: string, scenarioType?: string, levelId?: string, interlocutor?: string, startAtContext?: boolean) => {
    const validPaths = new Set<string>(["interview", "sales", "meeting", "presentation", "client", "csuite", "self-intro"]);
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
        progressionPathId: levelId ? (scenarioType as PathId) : undefined,
        startAtContext,
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

  if (isInitializing || isOAuthPending) {
    return <AuthLoadingScreen />;
  }

  return (
    <ErrorBoundary>
      <div className="size-full">
        <Suspense fallback={<AuthLoadingScreen />}>
          {/* ─── Onboarding modal overlay (renders ON TOP of current page) ─── */}
          {showOnboarding && (
            <OnboardingProfileScreen
              existingProfile={userProfile}
              onComplete={handleOnboardingComplete}
            />
          )}

          {page === "design-system" && <DesignSystemPage />}
          {page === "landing3" && (
            <Landing3Page
              onAuthComplete={handleAuthComplete}
              landingLang={landingLang}
              onLangChange={handleLangChange}
              authUser={authUser}
              onLogout={() => { authService.signOut().catch(() => {}); handleBackToLanding(); setAuthUser(null); }}
              onGoToDashboard={handleBackToDashboard}
              onPricingPurchase={() => { setPage("dashboard"); }}
            />
          )}
          {page === "landing2" && (
            <Landing2Page
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
              onPricingPurchase={() => { setPage("dashboard"); }}
            />
          )}
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
              startAtContext={flowState.startAtContext}
              progressionLevelId={flowState.progressionLevelId}
              progressionPathId={flowState.progressionPathId}
              marketFocus={marketFocus}
              onFinish={handlePracticeFinish}
              onNewPractice={handleNewPractice}
              onSwitchLevel={(scenario: string, scenarioType: ScenarioType, levelId: string, interlocutor: string) => {
                setFlowState({
                  scenario,
                  interlocutor,
                  scenarioType,
                  progressionLevelId: levelId,
                  progressionPathId: scenarioType as PathId,
                });
              }}
              userPlan={authUser?.plan}
              ownedPaths={authUser?.pathsPurchased ?? []}
              userProfile={userProfile}
              onProfileUpdate={handleProfileUpdate}
              onGoToDashboard={handleBackToDashboard}
            />
          )}

          {/* ═══ Dashboard family — persistent header ═══ */}
          {(page === "dashboard" || page === "account" || page === "practice-history" || page === "library") && (
            <>
              <AppHeader
                variant="dashboard"
                userName={authUser?.displayName || authUser?.email?.split("@")[0]}
                onLogout={handleLogout}
                onNavigateToDashboard={page !== "dashboard" ? handleBackToDashboard : undefined}
                onNavigateToAccount={() => {
                  setPage("account");
                  window.location.hash = "#account";
                }}
                onNavigateToHistory={handleNavigateToHistory}
                onNavigateToLibrary={handleNavigateToLibrary}
              />
              {page === "dashboard" && (
                <DashboardPage
                  userName={authUser?.displayName || authUser?.email?.split("@")[0]}
                  firstPracticeScenario={flowState.scenario}
                  firstPracticeInterlocutor={flowState.interlocutor}
                  onNavigateToHistory={handleNavigateToHistory}
                  onNavigateToLibrary={handleNavigateToLibrary}
                  onStartNewPractice={handleStartNewPractice}
                  userProfile={userProfile}
                  onProfileUpdate={handleProfileUpdate}
                  lang={landingLang}
                  ownedPaths={authUser?.pathsPurchased ?? []}
                />
              )}
              {page === "library" && <LibraryPage />}
              {page === "practice-history" && (
                <PracticeHistoryPage
                  firstPracticeScenario={flowState.scenario}
                  firstPracticeInterlocutor={flowState.interlocutor}
                />
              )}
              {page === "account" && (
                <AccountPage
                  userProfile={userProfile}
                  authUser={authUser}
                  onLogout={handleLogout}
                  onProfileUpdate={handleProfileUpdate}
                />
              )}
            </>
          )}
          {page === "admin" && (
            authUser && ADMIN_EMAILS.includes(authUser.email?.toLowerCase() || "") ? (
              <AdminDashboardPage
                onBack={handleBackToDashboard}
              />
            ) : (
              <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" as const, alignItems: "center", justifyContent: "center", background: "#0f172a", color: "#e2e8f0", gap: 16 }}>
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
          {page === "terms" && <TermsPage />}
          {page === "privacy" && <PrivacyPage />}
          {page === "cookies" && <CookiesPage />}

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

                const doNavigate = () => {
                  if (pendingNavigationRef.current) {
                    pendingNavigationRef.current();
                    pendingNavigationRef.current = null;
                  } else {
                    console.warn("[MasteryTalk] pendingNavigationRef was null — fallback to dashboard");
                    setPage("dashboard");
                    window.location.hash = "#dashboard";
                  }
                };

                navigateWithOnboardingCheck(doNavigate);
              }}
            />
          )}

          {/* PathPurchaseModal — Monthly/Quarterly subscription with auto launch pricing */}
          <PathPurchaseModal
            open={showNewSessionPaywall}
            scenarioType={flowState.scenarioType || "interview"}
            paywallReason="path-required"
            ownedPaths={authUser?.pathsPurchased ?? []}
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

          {/* Stripe payment redirect handler — celebration modal with confetti */}
          <PaymentSuccessHandler
            authReady={!!authUser}
            onNavigateToDashboard={() => setPage("dashboard")}
            onPaymentConfirmed={() => {
              // Navigate to dashboard and refresh user profile
              setPage("dashboard");
              import("../services").then(({ userService }) => {
                userService.getProfile("current").then((u) => {
                  setAuthUser((prev) => prev ? { ...prev, plan: u.plan, pathsPurchased: u.pathsPurchased } : prev);
                  u.pathsPurchased?.forEach((path: string) => usageGating.addPurchasedPath(path));
                }).catch(() => {});
              });
            }}
          />
        </Suspense>

        <CookieBanner />

      </div>
    </ErrorBoundary>
  );
}