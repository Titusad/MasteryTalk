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

export function computeStreakFromDates(practiceDays: Set<string>): number {
  if (practiceDays.size === 0) return 0;
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

export function computeStreak(sessions: PersistedSession[]): number {
  const practiceDays = new Set(
    sessions.map((s) => new Date(s.created_at).toISOString().slice(0, 10))
  );
  return computeStreakFromDates(practiceDays);
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

/* ── CEFR Pillar Thresholds ── */
// Source: CEFR Companion Volume 2020 (Council of Europe) adapted for professional
// business English. See docs/CEFR_CALIBRATION.md for full methodology.

const CEFR_THRESHOLDS: Record<string, Record<string, number>> = {
  Vocabulary:          { B1: 48, B2: 65, C1: 82 },
  Grammar:             { B1: 50, B2: 67, C1: 83 },
  Fluency:             { B1: 45, B2: 63, C1: 80 },
  Pronunciation:       { B1: 48, B2: 65, C1: 82 },
  "Professional Tone": { B1: 45, B2: 62, C1: 80 },
  Persuasion:          { B1: 40, B2: 60, C1: 78 },
};

const CEFR_ORDER = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;

const NEXT_LEVEL: Record<string, { level: string; label: string } | null> = {
  A1: { level: "B1", label: "Intermediate" },
  A2: { level: "B1", label: "Intermediate" },
  B1: { level: "B2", label: "Upper Intermediate" },
  B2: { level: "C1", label: "Advanced" },
  C1: null,
  C2: null,
};

export interface CEFRGate {
  pillar: string;
  score: number;
  threshold: number;
  passed: boolean;
}

export interface CEFRProgress {
  currentLevel: string;
  nextLevel: string;
  nextLevelLabel: string;
  gates: CEFRGate[];
  gatesPassed: number;
  gatesNeeded: number;
}

export function computeCEFRProgress(
  radarData: RadarDataPoint[],
  cefrApprox: { level: string; label: string }
): CEFRProgress | null {
  const next = NEXT_LEVEL[cefrApprox.level];
  if (!next) return null; // already at C1/C2

  const gates: CEFRGate[] = PILLAR_NAMES.map((pillar) => {
    const dataPoint = radarData.find((r) => r.skill === pillar);
    const score = dataPoint?.score ?? 0;
    const threshold = CEFR_THRESHOLDS[pillar]?.[next.level] ?? 0;
    return { pillar, score, threshold, passed: score >= threshold };
  });

  return {
    currentLevel: cefrApprox.level,
    nextLevel: next.level,
    nextLevelLabel: next.label,
    gates,
    gatesPassed: gates.filter((g) => g.passed).length,
    gatesNeeded: 4,
  };
}

/* ── Velocity Signal ── */

export interface VelocitySignal {
  trend: "improving" | "plateau" | "declining";
  estimatedWeeks: number | null;
  avgGainPerSession: number;
}

export function computeVelocitySignal(
  sessions: PersistedSession[],
  cefrProgress: CEFRProgress | null
): VelocitySignal | null {
  if (sessions.length < 3) return null;

  const sorted = [...sessions].sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  // Smoothed scores: avg of last 3 sessions vs avg of sessions before that
  const recent3 = sorted.slice(-3);
  const older = sorted.slice(0, -3);

  const avgScore = (ss: PersistedSession[]) => {
    const scores = ss.map((_, i) => {
      const radar = computeRadarAtSession(sorted, sorted.indexOf(ss[i] ?? ss[0]));
      const points = PILLAR_NAMES.map((p) => ({ skill: p, score: radar[p] ?? 0, fullMark: 100 }));
      return computeProfessionalProficiency(points);
    });
    return scores.reduce((a, b) => a + b, 0) / scores.length;
  };

  const recentAvg = avgScore(recent3);
  const olderAvg = older.length > 0 ? avgScore(older) : recentAvg;
  const totalGain = recentAvg - olderAvg;
  const sessionsElapsed = Math.max(sorted.length - 3, 1);
  const avgGainPerSession = totalGain / sessionsElapsed;

  const trend: VelocitySignal["trend"] =
    avgGainPerSession > 0.5 ? "improving" :
    avgGainPerSession < -0.5 ? "declining" : "plateau";

  if (!cefrProgress || avgGainPerSession <= 0) {
    return { trend, estimatedWeeks: null, avgGainPerSession };
  }

  // Gates still to pass
  const failingGates = cefrProgress.gates.filter((g) => !g.passed);
  const gatesStillNeeded = Math.max(0, cefrProgress.gatesNeeded - cefrProgress.gatesPassed);

  if (gatesStillNeeded === 0) return { trend, estimatedWeeks: 0, avgGainPerSession };

  // Pick the N-th easiest failing gate as the target (conservative estimate)
  const sortedGaps = failingGates
    .map((g) => g.threshold - g.score)
    .sort((a, b) => a - b);
  const targetGap = sortedGaps[gatesStillNeeded - 1] ?? sortedGaps[0] ?? 0;

  const sessionsToNext = Math.ceil(targetGap / avgGainPerSession);

  // Weekly frequency from session history
  const firstDate = new Date(sorted[0].created_at).getTime();
  const lastDate = new Date(sorted[sorted.length - 1].created_at).getTime();
  const weeksElapsed = Math.max((lastDate - firstDate) / (7 * 86_400_000), 1);
  const sessionsPerWeek = sorted.length / weeksElapsed;

  const estimatedWeeks = Math.ceil(sessionsToNext / sessionsPerWeek);

  return {
    trend,
    estimatedWeeks: estimatedWeeks > 52 ? null : estimatedWeeks,
    avgGainPerSession,
  };
}

/* ── Since You Started ── */

export interface SinceYouStartedPoint {
  pillar: string;
  first: number;
  latest: number;
  delta: number;
}

export function computeSinceYouStarted(
  sessions: PersistedSession[]
): SinceYouStartedPoint[] | null {
  const withScores = sessions
    .filter((s) => {
      const sc = s.summary?.pillarScores ?? s.feedback?.pillarScores;
      return sc && Object.keys(sc).length >= 4;
    })
    .sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

  if (withScores.length < 2) return null;

  const firstScores =
    withScores[0].summary?.pillarScores ??
    withScores[0].feedback?.pillarScores ??
    {};
  const latestScores =
    withScores[withScores.length - 1].summary?.pillarScores ??
    withScores[withScores.length - 1].feedback?.pillarScores ??
    {};

  const result: SinceYouStartedPoint[] = PILLAR_NAMES.map((pillar) => ({
    pillar,
    first: Math.round((firstScores[pillar] as number) ?? 0),
    latest: Math.round((latestScores[pillar] as number) ?? 0),
    delta: Math.round(
      ((latestScores[pillar] as number) ?? 0) -
        ((firstScores[pillar] as number) ?? 0)
    ),
  })).filter((p) => p.first > 0 || p.latest > 0);

  return result.length >= 4 ? result : null;
}
