/**
 * ══════════════════════════════════════════════════════════════
 *  useHashRouter — Hash-based routing with scroll reset
 *
 *  Manages:
 *  - Page state from URL hash
 *  - Scroll-to-top on page change
 *  - Admin page detection
 *  - Auth-aware initial page resolution
 * ══════════════════════════════════════════════════════════════
 */
import { useState, useEffect, useCallback } from "react";

export type Page =
  | "landing"
  | "landing2"
  | "landing3"
  | "loading"
  | "practice-session"
  | "dashboard"
  | "practice-history"
  | "design-system"
  | "account"
  | "admin"
  | "library"
  | "study-phase"
  | "terms"
  | "privacy";

const AUTH_PAGES: Record<string, Page> = {
  "#dashboard": "dashboard",
  "#practice-session": "practice-session",
  "#practice-history": "practice-history",
  "#account": "account",
  "#library": "library",
  "#study-phase": "study-phase",
};

function resolveInitialPage(): Page {
  const hash = window.location.hash;
  // Strip query params from hash before matching (e.g. #dashboard?payment=success → #dashboard)
  const hashPath = hash.split("?")[0];

  if (hashPath === "#design-system") return "design-system";
  if (hashPath === "#admin") return "admin";
  if (hashPath === "#terms") return "terms";
  if (hashPath === "#privacy") return "privacy";
  if (hashPath === "#landing2") return "landing2";
  if (hashPath === "#landing3") return "landing3";

  if (AUTH_PAGES[hashPath] || hashPath.startsWith("#study-phase")) {
    const hasSession = Object.keys(localStorage).some(
      (k) => k.startsWith("sb-") && k.endsWith("-auth-token")
    );
    if (hasSession) {
      return AUTH_PAGES[hashPath];
    }
    window.location.hash = "";
  }
  return "landing";
}

export function useHashRouter() {
  const [page, setPage] = useState<Page>(resolveInitialPage);

  // Scroll to top on page change
  useEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
    });
  }, [page]);

  const navigate = useCallback((target: Page) => {
    setPage(target);
    window.location.hash = target === "landing" ? "" : `#${target}`;
  }, []);

  const isAdmin = useCallback((email: string | undefined, adminEmails: string[]): boolean => {
    return !!email && adminEmails.includes(email.toLowerCase());
  }, []);

  return { page, setPage, navigate, isAdmin };
}
