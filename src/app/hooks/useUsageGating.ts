/**
 * ══════════════════════════════════════════════════════════════
 *  useUsageGating — Free tier usage tracking & paywall gates
 *
 *  Tracks (via localStorage in prototype mode):
 *  - Free session used this month (1 free session/month)
 *  - Practice attempts per session
 *
 *  Three paywall triggers:
 *  1. extra-practice  → 3rd practice attempt (free gets 2 total)
 *  2. download-report → Downloading the PDF report
 *  3. new-session     → Starting a new session after free used
 * ══════════════════════════════════════════════════════════════
 */

import { useState, useCallback, useEffect } from "react";
import type { UserPlan } from "../../services/types";

/* ── Paywall Reason Type ── */

export type PaywallReason = "extra-practice" | "download-report" | "new-session";

export interface GateResult {
  allowed: boolean;
  reason?: PaywallReason;
}

/* ── localStorage keys ── */
const STORAGE_KEY_FREE_SESSION = "influentia_free_session";
const STORAGE_KEY_CREDITS = "influentia_credits";

interface FreeSessionRecord {
  usedAt: string; // ISO date
  month: string;  // "YYYY-MM"
}

function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function getFreeSessionRecord(): FreeSessionRecord | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_FREE_SESSION);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setFreeSessionRecord(record: FreeSessionRecord): void {
  try {
    localStorage.setItem(STORAGE_KEY_FREE_SESSION, JSON.stringify(record));
  } catch { /* ignore */ }
}

function getStoredCredits(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CREDITS);
    return raw ? parseInt(raw, 10) : 0;
  } catch {
    return 0;
  }
}

function setStoredCredits(n: number): void {
  try {
    localStorage.setItem(STORAGE_KEY_CREDITS, String(n));
  } catch { /* ignore */ }
}

/* ══════════════════════════════════════════════════════════════
   HOOK
   ══════════════════════════════════════════════════════════════ */

export function useUsageGating(userPlan: UserPlan = "free") {
  const [credits, setCredits] = useState(getStoredCredits);
  const [freeUsedThisMonth, setFreeUsedThisMonth] = useState(() => {
    const record = getFreeSessionRecord();
    return record?.month === getCurrentMonth();
  });

  /* Sync credits to localStorage */
  useEffect(() => {
    setStoredCredits(credits);
  }, [credits]);

  /* ── Gate: Can start a new session? ── */
  const canStartSession = useCallback((): GateResult => {
    // Paid users with credits can always start
    if (userPlan === "per-session" || credits > 0) {
      return { allowed: true };
    }
    // Free user: check monthly free session
    if (!freeUsedThisMonth) {
      return { allowed: true };
    }
    return { allowed: false, reason: "new-session" };
  }, [userPlan, credits, freeUsedThisMonth]);

  /* ── Gate: Can download report? ── */
  const canDownloadReport = useCallback((): GateResult => {
    if (userPlan === "per-session" || credits > 0) {
      return { allowed: true };
    }
    return { allowed: false, reason: "download-report" };
  }, [userPlan, credits]);

  /* ── Gate: Can practice again? (called with current attempt count) ── */
  const canPracticeAgain = useCallback(
    (currentAttempt: number, maxAttempts: number): GateResult => {
      if (currentAttempt < maxAttempts) {
        return { allowed: true };
      }
      // At limit — if free, show paywall; if paid, show mastery
      if (userPlan === "free" && credits <= 0) {
        return { allowed: false, reason: "extra-practice" };
      }
      return { allowed: false }; // paid user at limit → mastery nudge
    },
    [userPlan, credits]
  );

  /* ── Mark free session as used ── */
  const markFreeSessionUsed = useCallback(() => {
    const record: FreeSessionRecord = {
      usedAt: new Date().toISOString(),
      month: getCurrentMonth(),
    };
    setFreeSessionRecord(record);
    setFreeUsedThisMonth(true);
  }, []);

  /* ── Add credits after purchase ── */
  const addCredits = useCallback((amount: number) => {
    setCredits((prev) => prev + amount);
  }, []);

  /* ── Consume a credit (for paid sessions) ── */
  const consumeCredit = useCallback((): boolean => {
    if (credits <= 0) return false;
    setCredits((prev) => prev - 1);
    return true;
  }, [credits]);

  return {
    credits,
    freeUsedThisMonth,
    canStartSession,
    canDownloadReport,
    canPracticeAgain,
    markFreeSessionUsed,
    addCredits,
    consumeCredit,
  };
}
