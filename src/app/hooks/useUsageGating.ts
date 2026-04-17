/**
 * ══════════════════════════════════════════════════════════════
 *  useUsageGating — v9.0 Learning Path access gating
 *
 *  Tracks (via localStorage in prototype mode):
 *  - Demo sessions used per scenario (1 demo/scenario)
 *  - Path purchases (permanent access)
 *  - Fresh attempts per level (3 max)
 *
 *  Paywall triggers:
 *  1. path-required → User tries to access a path they haven't purchased
 *  2. attempts-exhausted → User has used all 3 fresh attempts on a level
 * ══════════════════════════════════════════════════════════════
 */

import { useState, useCallback, useEffect } from "react";
import type { UserPlan } from "../../services/types";

/* ── Paywall Reason Type ── */

export type PaywallReason = "path-required" | "attempts-exhausted";

export interface GateResult {
  allowed: boolean;
  mode?: "demo" | "path";
  reason?: PaywallReason;
}

/* ── localStorage keys ── */
const STORAGE_KEY_DEMOS = "masterytalk_demo_sessions";
const STORAGE_KEY_PATHS = "masterytalk_purchased_paths";
const STORAGE_KEY_ATTEMPTS = "masterytalk_fresh_attempts";

function getStoredArray(key: string): string[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setStoredArray(key: string, value: string[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch { /* ignore */ }
}

interface AttemptRecord {
  [levelKey: string]: number; // "interview:int-1" → 2
}

function getStoredAttempts(): AttemptRecord {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ATTEMPTS);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function setStoredAttempts(record: AttemptRecord): void {
  try {
    localStorage.setItem(STORAGE_KEY_ATTEMPTS, JSON.stringify(record));
  } catch { /* ignore */ }
}

/* ══════════════════════════════════════════════════════════════
   HOOK
   ══════════════════════════════════════════════════════════════ */

export function useUsageGating(userPlan: UserPlan = "free") {
  const [demosUsed, setDemosUsed] = useState<string[]>(() => getStoredArray(STORAGE_KEY_DEMOS));
  const [purchasedPaths, setPurchasedPaths] = useState<string[]>(() => getStoredArray(STORAGE_KEY_PATHS));
  const [attempts, setAttempts] = useState<AttemptRecord>(() => getStoredAttempts());

  /* Sync to localStorage */
  useEffect(() => { setStoredArray(STORAGE_KEY_DEMOS, demosUsed); }, [demosUsed]);
  useEffect(() => { setStoredArray(STORAGE_KEY_PATHS, purchasedPaths); }, [purchasedPaths]);
  useEffect(() => { setStoredAttempts(attempts); }, [attempts]);

  /* ── Gate: Can start a session for a scenario? ── */
  const canStartSession = useCallback((scenarioType: string): GateResult => {
    // Demo: first session of this scenario is always free
    if (!demosUsed.includes(scenarioType)) {
      return { allowed: true, mode: "demo" };
    }

    // Path purchased by user or via all-access
    if (purchasedPaths.includes(scenarioType) || userPlan === "path") {
      return { allowed: true, mode: "path" };
    }

    // No access
    return { allowed: false, reason: "path-required" };
  }, [demosUsed, purchasedPaths, userPlan]);

  /* ── Gate: Can start a fresh attempt on a level? ── */
  const canStartFreshAttempt = useCallback((
    scenarioType: string,
    levelId: string,
    maxAttempts = 3
  ): GateResult => {
    const key = `${scenarioType}:${levelId}`;
    const used = attempts[key] || 0;
    if (used >= maxAttempts) {
      return { allowed: false, reason: "attempts-exhausted" };
    }
    return { allowed: true, mode: "path" };
  }, [attempts]);

  /* ── Mark demo session as used ── */
  const markDemoSessionUsed = useCallback((scenarioType: string) => {
    setDemosUsed((prev) => {
      if (prev.includes(scenarioType)) return prev;
      return [...prev, scenarioType];
    });
  }, []);

  /* ── Mark a path as purchased ── */
  const addPurchasedPath = useCallback((scenarioType: string) => {
    setPurchasedPaths((prev) => {
      if (prev.includes(scenarioType)) return prev;
      return [...prev, scenarioType];
    });
  }, []);

  /* ── Add all paths (All-Access Bundle) ── */
  const addAllAccess = useCallback(() => {
    setPurchasedPaths(["interview", "meeting", "presentation"]);
  }, []);

  /* ── Record a fresh attempt for a level ── */
  const recordAttempt = useCallback((scenarioType: string, levelId: string) => {
    const key = `${scenarioType}:${levelId}`;
    setAttempts((prev) => ({
      ...prev,
      [key]: (prev[key] || 0) + 1,
    }));
  }, []);

  /* ── Get remaining attempts for a level ── */
  const getRemainingAttempts = useCallback((
    scenarioType: string,
    levelId: string,
    maxAttempts = 3
  ): number => {
    const key = `${scenarioType}:${levelId}`;
    return Math.max(0, maxAttempts - (attempts[key] || 0));
  }, [attempts]);

  return {
    demosUsed,
    purchasedPaths,
    canStartSession,
    canStartFreshAttempt,
    markDemoSessionUsed,
    addPurchasedPath,
    addAllAccess,
    recordAttempt,
    getRemainingAttempts,
  };
}
