/**
 * ══════════════════════════════════════════════════════════════
 *  useAuthFlow — Auth state management + OAuth redirect recovery
 *
 *  Manages:
 *  - Supabase auth listener subscription
 *  - OAuth redirect recovery from sessionStorage
 *  - Post-auth navigation (practice-session or dashboard)
 *  - Language modal gating for non-EN users
 * ══════════════════════════════════════════════════════════════
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { authService } from "@/services";
import type { User } from "@/services/types";
import type { Page } from "./useHashRouter";
import type { ScenarioType } from "@/services/types";
import type { PathId } from "@/features/dashboard/model/progression-paths";

/* Session storage keys for OAuth redirect recovery */
const OAUTH_PENDING_KEY = "masterytalk_oauth_pending";
const PENDING_SETUP_KEY = "masterytalk_pending_setup";

export interface FlowState {
  scenario: string;
  interlocutor: string;
  scenarioType?: ScenarioType;
  guidedFields?: Record<string, string>;
  progressionPathId?: PathId;
  progressionLevelId?: string;
}

interface UseAuthFlowOptions {
  setPage: (page: Page) => void;
  setFlowState: (state: FlowState) => void;
  setShowLangModal: (show: boolean) => void;
  pendingNavigationRef: React.MutableRefObject<(() => void) | null>;
  langModalDismissedRef: React.MutableRefObject<boolean>;
}

export function useAuthFlow(options: UseAuthFlowOptions) {
  const { setPage, setFlowState, setShowLangModal, pendingNavigationRef, langModalDismissedRef } = options;
  
  const [isInitializing, setIsInitializing] = useState(true);
  const [authUser, setAuthUser] = useState<User | null>(null);
  const prevAuthUserRef = useRef<User | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    let cancelled = false;

    const init = async () => {
      if (cancelled) return;

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
                pendingNavigationRef.current();
                pendingNavigationRef.current = null;
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

          // Mock auth path
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
                pendingNavigationRef.current();
                pendingNavigationRef.current = null;
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

          // No pending setup — auto-redirect returning users to dashboard
          if (!window.location.hash || window.location.hash === "#" || window.location.hash === "#/") {
            setPage("dashboard");
            window.location.hash = "#dashboard";
          } else if (window.location.hash === "#admin") {
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

  const signOut = useCallback(async () => {
    await authService.signOut();
    setAuthUser(null);
    prevAuthUserRef.current = null;
  }, []);

  return {
    isInitializing,
    authUser,
    setAuthUser,
    signOut,
    OAUTH_PENDING_KEY,
    PENDING_SETUP_KEY,
  };
}
