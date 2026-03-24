/**
 * DashboardService — Centralized data fetching for the Dashboard
 *
 * Replaces the direct `fetch()` calls in DashboardPage.tsx with
 * a proper service adapter that follows the existing pattern.
 */
import { projectId, publicAnonKey } from "../../../../utils/supabase/info";

const BASE = `https://${projectId}.supabase.co/functions/v1/make-server-08b8658d`;

async function getToken(): Promise<string> {
  try {
    const { getSupabaseClient } = await import("../../supabase");
    const supabase = getSupabaseClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session?.access_token || publicAnonKey;
  } catch {
    return publicAnonKey;
  }
}

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
export async function fetchSessions(): Promise<PersistedSession[]> {
  try {
    const token = await getToken();
    const res = await fetch(`${BASE}/sessions`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`${res.status}`);
    const data = await res.json();
    return data.sessions || [];
  } catch (err) {
    console.warn("[DashboardService] fetchSessions failed:", err);
    return [];
  }
}

/**
 * Fetch profile stats (pillarScores, proficiency, etc.)
 */
export async function fetchProfileStats(): Promise<ProfileStats> {
  try {
    const token = await getToken();
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
