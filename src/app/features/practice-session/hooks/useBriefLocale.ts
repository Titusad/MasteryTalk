/**
 * useBriefLocale — Persists the Pre-Session Brief language preference.
 *
 * - Default: "en"
 * - Stored in localStorage ("mastery_brief_locale")
 * - Only applies to the Pre-Session Brief (Act 1)
 */

import { useState, useCallback } from "react";
import type { BriefLocale } from "@/app/features/dashboard/model/progression-paths";

const STORAGE_KEY = "mastery_brief_locale";
const DEFAULT_LOCALE: BriefLocale = "en";

function readLocale(): BriefLocale {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "en" || stored === "es" || stored === "pt") return stored;
  } catch {
    /* SSR or private browsing */
  }
  return DEFAULT_LOCALE;
}

export function useBriefLocale() {
  const [locale, setLocaleState] = useState<BriefLocale>(readLocale);

  const setLocale = useCallback((next: BriefLocale) => {
    setLocaleState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  return [locale, setLocale] as const;
}
