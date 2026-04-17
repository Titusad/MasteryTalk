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
  if (hash === "#design-system") return "design-system";
  if (hash === "#admin") return "admin";
  if (hash === "#terms") return "terms";
  if (hash === "#privacy") return "privacy";

  if (AUTH_PAGES[hash] || hash.startsWith("#study-phase")) {
    const hasSession = Object.keys(localStorage).some(
      (k) => k.startsWith("sb-") && k.endsWith("-auth-token")
    );
    if (hasSession) {
      return AUTH_PAGES[hash];
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
