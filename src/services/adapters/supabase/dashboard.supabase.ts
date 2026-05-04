import { SUPABASE_URL } from "@/services/supabase";
/**
 * DashboardService — Centralized data fetching for the Dashboard
 *
 * Replaces the direct `fetch()` calls in DashboardPage.tsx with
 * a proper service adapter that follows the existing pattern.
 */
import { projectId } from "../../../../utils/supabase/info";
import { getAuthToken } from "../../supabase";

const BASE = `${SUPABASE_URL}/functions/v1/make-server-08b8658d`;

export interface PersistedSession {
  id: string;
  scenario: string;
  interlocutor: string;
  scenarioType: string;
  duration: string;
  created_at: string;
  feedback?: {
    strengths?: Array<{ title: string; desc: string }>;
    opportunities?: Array<{ title: string; tag?: string; desc: string }>;
    beforeAfter?: Array<{
      userOriginal: string;
      professionalVersion: string;
      technique: string;
    }>;
    pillarScores?: Record<string, number> | null;
    professionalProficiency?: number | null;
  } | null;
  summary?: {
    overallSentiment?: string;
    nextSteps?: Array<{ title: string; desc: string; pillar: string }>;
    sessionHighlight?: string;
    pillarScores?: Record<string, number> | null;
    professionalProficiency?: number | null;
    cefrApprox?: string | null;
  } | null;
  interviewBriefing?: {
    anticipatedQuestions?: Array<{
      id: number;
      question: string;
      approach: string;
    }>;
    questionsToAsk?: Array<{ question: string }>;
  } | null;
}

export interface ProfileStats {
  pillarScores?: Record<string, number>;
  professionalProficiency?: number;
  sessions_count?: number;
  completedLessons?: string[];
  lastFeedbackAt?: string;
}

/**
 * Fetch all sessions for the authenticated user.
 */
let _sessionsCache: { ts: number; promise: Promise<PersistedSession[]> } | null = null;

export function fetchSessions(): Promise<PersistedSession[]> {
  if (_sessionsCache && Date.now() - _sessionsCache.ts < 30_000) {
    return _sessionsCache.promise;
  }
  const promise = (async () => {
    try {
      const token = await getAuthToken();
      const res = await fetch(`${BASE}/sessions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`${res.status}`);
      const data = await res.json();
      return (data.sessions || []) as PersistedSession[];
    } catch (err) {
      console.warn("[DashboardService] fetchSessions failed:", err);
      _sessionsCache = null;
      return [] as PersistedSession[];
    }
  })();
  _sessionsCache = { ts: Date.now(), promise };
  return promise;
}

export function invalidateSessionsCache(): void {
  _sessionsCache = null;
}

export async function fetchWAPracticeDates(): Promise<Set<string>> {
  try {
    const token = await getAuthToken();
    const res = await fetch(`${BASE}/wa/practice-dates`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`${res.status}`);
    const data = await res.json();
    return new Set<string>(data.dates ?? []);
  } catch (err) {
    console.warn("[DashboardService] fetchWAPracticeDates failed:", err);
    return new Set();
  }
}

/**
 * Fetch profile stats (pillarScores, proficiency, etc.)
 */
export async function fetchProfileStats(): Promise<ProfileStats> {
  try {
    const token = await getAuthToken();
    const res = await fetch(`${BASE}/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`${res.status}`);
    const profile = await res.json();
    return profile?.stats || {};
  } catch (err) {
    console.warn("[DashboardService] fetchProfileStats failed:", err);
    return {};
  }
}
