/**
 * ══════════════════════════════════════════════════════════════
 *  Dashboard — Pure Computation Functions (Shared Layer)
 *  No React, no DOM, no side-effects.
 *  100% reusable in React Native.
 * ══════════════════════════════════════════════════════════════
 */
import type { PersistedSession } from "@/services/adapters/supabase/dashboard.supabase";
import type { PracticeHistoryItem } from "@/services/types";
import {
  PILLAR_NAMES,
  PILLAR_TIPS,
  PILLAR_WEIGHTS,
  TAG_TO_PILLAR,
  DEFAULT_RADAR,
  type RadarDataPoint,
} from "./dashboard.constants";

/* ── Enriched History Item ── */

export interface EnrichedHistoryItem extends PracticeHistoryItem {
  hasInterviewBriefing?: boolean;
  scenarioType?: string;
}

/* ── Radar Computation ── */

export function computeRadarAtSession(
  sessions: PersistedSession[],
  upTo: number
): Record<string, number> {
  const weaknessCounts: Record<string, number> = {};
  PILLAR_NAMES.forEach((p) => (weaknessCounts[p] = 0));

  for (let i = 0; i <= upTo; i++) {
    const s = sessions[i];
    for (const opp of s?.feedback?.opportunities || []) {
      const tag = (opp.tag || "").toLowerCase().trim();
      const pillar = TAG_TO_PILLAR[tag];
      if (pillar) weaknessCounts[pillar]++;
    }
  }

  const scores: Record<string, number> = {};
  PILLAR_NAMES.forEach((skill) => {
    scores[skill] = Math.max(30, 85 - weaknessCounts[skill] * 8);
  });
  return scores;
}

export function computeRadarFromSessions(
  sessions: PersistedSession[]
): RadarDataPoint[] {
  if (sessions.length === 0) return DEFAULT_RADAR;

  const sorted = [...sessions].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  for (const s of sorted) {
    const backendScores =
      s.summary?.pillarScores || s.feedback?.pillarScores;
    if (backendScores && Object.keys(backendScores).length >= 4) {
      const withPronunciation = { ...backendScores };
      if (
        !withPronunciation["Pronunciation"] &&
        withPronunciation["Pronunciation"] !== 0
      ) {
        const otherScores = Object.values(withPronunciation).filter(
          (v) => typeof v === "number" && v > 0
        );
        if (otherScores.length > 0) {
          const avg =
            otherScores.reduce((a, b) => a + b, 0) / otherScores.length;
          withPronunciation["Pronunciation"] = Math.round(avg * 0.9);
        }
      }
      return PILLAR_NAMES.map((skill) => ({
        skill,
        score: withPronunciation[skill] ?? 0,
        fullMark: 100,
      }));
    }
  }

  const scores = computeRadarAtSession(sessions, sessions.length - 1);
  return PILLAR_NAMES.map((skill) => ({
    skill,
    score: scores[skill],
    fullMark: 100,
  }));
}

/* ── Progress Over Time ── */

export function computeProgressOverTime(
  sessions: PersistedSession[]
): Array<Record<string, string | number>> {
  if (sessions.length === 0) return [];

  const sorted = [...sessions].sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  return sorted.map((s, i) => {
    const backendScores =
      s.summary?.pillarScores || s.feedback?.pillarScores;
    const scores =
      backendScores && Object.keys(backendScores).length >= 4
        ? backendScores
        : computeRadarAtSession(sorted, i);
    const d = new Date(s.created_at);
    const label =
      sorted.length <= 5
        ? d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
        : `S${i + 1}`;
    return { session: label, ...scores };
  });
}

/* ── Biggest Improvement ── */

export function computeBiggestImprovement(
  sessions: PersistedSession[]
): { pillar: string; delta: number } | null {
  if (sessions.length < 2) return null;

  const sorted = [...sessions].sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
  const prev = computeRadarAtSession(sorted, sorted.length - 2);
  const curr = computeRadarAtSession(sorted, sorted.length - 1);

  let best: { pillar: string; delta: number } | null = null;
  for (const p of PILLAR_NAMES) {
    const delta = curr[p] - prev[p];
    if (delta > 0 && (!best || delta > best.delta)) {
      best = { pillar: p, delta };
    }
  }
  return best;
}

/* ── Focus Areas ── */

export function computeFocusArea(
  radarData: RadarDataPoint[]
): { pillar: string; score: number } | null {
  const withScores = radarData.filter((d) => d.score > 0);
  if (withScores.length === 0) return null;
  const weakest = withScores.reduce((w, c) =>
    c.score < w.score ? c : w, withScores[0]
  );
  return { pillar: weakest.skill, score: weakest.score };
}

export function computeFocusAreas(
  radarData: RadarDataPoint[]
): Array<{ pillar: string; score: number; tip: string }> {
  const withScores = radarData.filter((d) => d.score > 0);
  if (withScores.length === 0) return [];
  return [...withScores]
    .sort((a, b) => a.score - b.score)
    .slice(0, 2)
    .map((d) => ({
      pillar: d.skill,
      score: d.score,
      tip: PILLAR_TIPS[d.skill] || "Keep practicing to improve this area.",
    }));
}

/* ── Before/After ── */

export function getLatestBeforeAfter(
  sessions: PersistedSession[]
): {
  userOriginal: string;
  professionalVersion: string;
  technique: string;
  sessionTitle: string;
} | null {
  const sorted = [...sessions].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  for (const s of sorted) {
    const ba = s.feedback?.beforeAfter?.[0];
    if (ba) return { ...ba, sessionTitle: s.scenario };
  }
  return null;
}

/* ── Streak ── */

export function computeStreak(sessions: PersistedSession[]): number {
  if (sessions.length === 0) return 0;
  const practiceDays = new Set(
    sessions.map((s) => new Date(s.created_at).toISOString().slice(0, 10))
  );
  let streak = 0;
  const now = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    if (practiceDays.has(key)) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }
  return streak;
}

/* ── Professional Proficiency ── */

export function computeProfessionalProficiency(
  radarData: RadarDataPoint[]
): number {
  const withScores = radarData.filter((d) => d.score > 0);
  if (withScores.length === 0) return 0;

  let weightedSum = 0;
  let totalWeight = 0;
  for (const d of radarData) {
    const w = PILLAR_WEIGHTS[d.skill] || 1;
    weightedSum += d.score * w;
    totalWeight += w;
  }
  return Math.round(weightedSum / totalWeight);
}

export function computePreviousProficiency(
  sessions: PersistedSession[]
): number {
  if (sessions.length < 2) return 0;
  const sorted = [...sessions].sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
  const prevScores = computeRadarAtSession(sorted, sorted.length - 2);
  const prevRadar = PILLAR_NAMES.map((skill) => ({
    skill,
    score: prevScores[skill],
    fullMark: 100,
  }));
  return computeProfessionalProficiency(prevRadar);
}

/* ── CEFR ── */

export function getCEFRApprox(
  score: number
): { level: string; label: string } {
  if (score >= 90) return { level: "C2", label: "Proficient" };
  if (score >= 78) return { level: "C1", label: "Advanced" };
  if (score >= 63) return { level: "B2", label: "Upper Intermediate" };
  if (score >= 48) return { level: "B1", label: "Intermediate" };
  if (score >= 35) return { level: "A2", label: "Elementary" };
  return { level: "A1", label: "Beginner" };
}

/* ── Session → History Item Conversion ── */

export function toPracticeHistoryItem(
  s: PersistedSession
): EnrichedHistoryItem {
  const d = new Date(s.created_at);
  const isToday = new Date().toDateString() === d.toDateString();
  return {
    title: s.scenario,
    date: isToday
      ? "Today"
      : d.toLocaleDateString("en-US", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
    duration: s.duration || "8 min",
    tag: s.interlocutor || "Client",
    beforeAfterHighlight: s.feedback?.beforeAfter?.[0] || undefined,
    hasInterviewBriefing: !!(
      s.interviewBriefing?.anticipatedQuestions?.length
    ),
    scenarioType: s.scenarioType,
  };
}

/* ── User State Classification ── */

export type UserState = "new" | "inactive" | "returning";

export function computeUserState(
  sessions: PersistedSession[]
): UserState {
  if (sessions.length === 0) return "new";
  const sorted = [...sessions].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  const lastDate = new Date(sorted[0].created_at);
  const daysSince = Math.floor(
    (Date.now() - lastDate.getTime()) / 86_400_000
  );
  return daysSince > 7 ? "inactive" : "returning";
}

/* ── Churn Gap Signal ── */

export interface ChurnGapSignal {
  daysSinceLastSession: number;
  weakestPillar: string;
  weakestScore: number;
}

export function computeChurnGap(
  sessions: PersistedSession[],
  radarData: RadarDataPoint[]
): ChurnGapSignal | null {
  if (sessions.length === 0) return null;
  const sorted = [...sessions].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  const lastDate = new Date(sorted[0].created_at);
  const daysSince = Math.floor(
    (Date.now() - lastDate.getTime()) / 86_400_000
  );
  if (daysSince <= 7) return null;

  const withScores = radarData.filter((d) => d.score > 0);
  if (withScores.length === 0) return null;
  const weakest = withScores.reduce((w, c) =>
    c.score < w.score ? c : w, withScores[0]
  );
  return {
    daysSinceLastSession: daysSince,
    weakestPillar: weakest.skill,
    weakestScore: weakest.score,
  };
}

/* ── Dynamic Diagnosis Builder ── */

export function buildDiagnosis(
  sessions: PersistedSession[],
  proficiencyScore: number,
  cefr: { level: string; label: string },
  focusArea: { pillar: string; score: number } | null,
  biggestImprovement: { pillar: string; delta: number } | null
): { text: string; highlights: string[] } {
  // State A: New user
  if (sessions.length === 0) {
    return {
      text: "Let's establish your baseline. A 3-minute self-introduction will calibrate your score, CEFR level, and personalize your learning path.",
      highlights: ["baseline", "CEFR level"],
    };
  }

  // Compute days since last session
  const sorted = [...sessions].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  const daysSince = Math.floor(
    (Date.now() - new Date(sorted[0].created_at).getTime()) / 86_400_000
  );

  // State C: Inactive user (>7 days)
  if (daysSince > 7) {
    const focusPillar = focusArea?.pillar || "Fluency";
    const focusScore = focusArea?.score || 0;
    return {
      text: `${daysSince} days without practice. Your ${focusPillar} was at ${focusScore}% — without sessions, that level does not consolidate.`,
      highlights: [`${daysSince} days`, `${focusPillar}`, `${focusScore}%`],
    };
  }

  // State B: Returning user — build a specific, data-driven sentence
  const parts: string[] = [];
  if (biggestImprovement && biggestImprovement.delta > 0) {
    parts.push(
      `Your ${biggestImprovement.pillar} improved +${biggestImprovement.delta} points recently.`
    );
  } else {
    parts.push(`You're at ${cefr.level} (${cefr.label}).`);
  }

  if (focusArea) {
    parts.push(
      `Next goal: push ${focusArea.pillar} past ${focusArea.score}%.`
    );
  }

  const highlights = [
    biggestImprovement?.pillar,
    focusArea?.pillar,
    cefr.level,
  ].filter(Boolean) as string[];

  return { text: parts.join(" "), highlights };
}

/* ── Open Next Steps ── */

export function getOpenNextSteps(
  sessions: PersistedSession[]
): Array<{ title: string; desc: string; pillar: string }> {
  if (sessions.length === 0) return [];
  const sorted = [...sessions].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  return sorted[0]?.summary?.nextSteps || [];
}
