/**
 * ══════════════════════════════════════════════════════════════
 *  useDashboardData — Custom Hook (Shared Layer)
 *  Contains ALL state management, data fetching, and derived
 *  computations for the Dashboard.
 *
 *  ✅ Uses only React hooks (no DOM) — portable to React Native.
 * ══════════════════════════════════════════════════════════════
 */
import { useState, useEffect, useMemo, useCallback } from "react";
import { userService, paymentService } from "@/services";
import type { PracticeHistoryItem } from "@/services/types";
import { fetchSessions, fetchWAPracticeDates } from "@/services/adapters/supabase/dashboard.supabase";
import type { PersistedSession } from "@/services/adapters/supabase/dashboard.supabase";
import {
  getRecommendedLessons,
  syncLessonProgress,
} from "@/services/microLessons";
import type { RadarDataPoint } from "./dashboard.constants";
import {
  computeRadarFromSessions,
  computeProgressOverTime,
  computeStreakFromDates,
  computeBiggestImprovement,
  computeFocusArea,
  computeFocusAreas,
  getLatestBeforeAfter,
  computeProfessionalProficiency,
  computePreviousProficiency,
  getCEFRApprox,
  toPracticeHistoryItem,
  computeUserState,
  computeChurnGap,
  buildDiagnosis,
  getOpenNextSteps,
  computeCEFRProgress,
  computeVelocitySignal,
  computeSinceYouStarted,
  type EnrichedHistoryItem,
  type UserState,
  type ChurnGapSignal,
  type CEFRProgress,
  type VelocitySignal,
  type SinceYouStartedPoint,
} from "./dashboard.computations";
import type { LandingLang } from "@/shared/i18n/landing-i18n";
import { LANDING_COPIES } from "@/shared/i18n/landing-i18n";

/* ── Hook Props ── */
export interface UseDashboardDataProps {
  firstPracticeScenario?: string;
  firstPracticeInterlocutor?: string;
  userName?: string;
  lang?: LandingLang;
}

/* ── Hook Return Type ── */
export interface DashboardData {
  loading: boolean;
  /* Raw data */
  persistedSessions: PersistedSession[];
  recentPractices: PracticeHistoryItem[];
  credits: number | null;
  freeSessionAvailable: boolean;

  /* Computed */
  allRecent: EnrichedHistoryItem[];
  radarData: RadarDataPoint[];
  progressData: Array<Record<string, string | number>>;
  streak: number;
  allPracticeDates: Set<string>;
  biggestImprovement: { pillar: string; delta: number } | null;
  focusArea: { pillar: string; score: number } | null;
  focusAreas: Array<{ pillar: string; score: number; tip: string }>;
  latestBeforeAfter: {
    userOriginal: string;
    professionalVersion: string;
    technique: string;
    sessionTitle: string;
  } | null;
  totalSessions: number;
  hasPracticed: boolean;
  hasRealData: boolean;

  /* Proficiency */
  proficiencyScore: number;
  proficiencyDelta: number;
  cefrApprox: { level: string; label: string };
  latestSession: PersistedSession | null;

  /* New: User State & Diagnosis */
  userState: UserState;
  churnGap: ChurnGapSignal | null;
  diagnosis: { text: string; highlights: string[] };
  openNextSteps: Array<{ title: string; desc: string; pillar: string }>;
  daysSinceLastSession: number;

  /* Certification Arc */
  cefrProgress: CEFRProgress | null;
  velocitySignal: VelocitySignal | null;

  /* Cross-path overview */
  perPathStats: Record<string, { sessions: number; avgScore: number | null }>;

  /* Progress since start */
  sinceYouStarted: SinceYouStartedPoint[] | null;

  /* Lessons */
  recommendedLessons: ReturnType<typeof getRecommendedLessons>;

  /* Greeting */
  greeting: string;
  avatarInitials: string;
  dc: (typeof LANDING_COPIES)[LandingLang]["dashboard"];

  /* Upsell + Lesson Modal actions */
  setCredits: React.Dispatch<React.SetStateAction<number | null>>;
  setFreeSessionAvailable: React.Dispatch<React.SetStateAction<boolean>>;
}

export function useDashboardData({
  firstPracticeScenario,
  firstPracticeInterlocutor,
  userName,
  lang = "en",
}: UseDashboardDataProps): DashboardData {
  /* ─── State ─── */
  const [recentPractices, setRecentPractices] = useState<
    PracticeHistoryItem[]
  >([]);
  const [persistedSessions, setPersistedSessions] = useState<
    PersistedSession[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [credits, setCredits] = useState<number | null>(null);
  const [freeSessionAvailable, setFreeSessionAvailable] = useState(false);
  const [waPracticeDates, setWAPracticeDates] = useState<Set<string>>(new Set());

  /* ─── Data Fetching ─── */
  const fetchRealSessions = useCallback(async () => {
    try {
      const sessions = await fetchSessions();
      setPersistedSessions(sessions);
      setLoading(false);
    } catch (err) {
      console.warn("[Dashboard] Failed to load real sessions:", err);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRealSessions();
    fetchWAPracticeDates().then(setWAPracticeDates).catch(() => {});
    syncLessonProgress().catch(() => {});
    userService
      .getPracticeHistory("mock-uid")
      .then((history) => setRecentPractices(history.slice(0, 4)))
      .catch(() => {});
    // v9.0: Credits replaced by path access — credits state kept for backward compat
    paymentService
      .getPathAccess("mock-uid")
      .then((info) => setCredits(info.pathsPurchased.length))
      .catch(() => {});
    userService
      .getProfile("mock-uid")
      .then((u) => setFreeSessionAvailable(u.freeSessionsUsed.length === 0))
      .catch(() => {});
  }, [fetchRealSessions]);

  const hasPracticed = !!firstPracticeScenario;

  /* ─── Display list ─── */
  const realHistoryItems = useMemo(
    () => persistedSessions.map(toPracticeHistoryItem),
    [persistedSessions]
  );

  const allRecent: EnrichedHistoryItem[] = useMemo(() => {
    if (realHistoryItems.length > 0) return realHistoryItems.slice(0, 5);
    if (firstPracticeScenario) {
      return [
        {
          title: firstPracticeScenario,
          date: "Today",
          duration: "8 min",
          tag: firstPracticeInterlocutor || "Client",
        },
        ...recentPractices,
      ];
    }
    return recentPractices;
  }, [
    realHistoryItems,
    firstPracticeScenario,
    firstPracticeInterlocutor,
    recentPractices,
  ]);

  /* ─── Computed proficiency stats ─── */
  const radarData = useMemo(
    () => computeRadarFromSessions(persistedSessions),
    [persistedSessions]
  );
  const progressData = useMemo(
    () => computeProgressOverTime(persistedSessions),
    [persistedSessions]
  );
  const allPracticeDates = useMemo(() => {
    const sessionDates = persistedSessions.map((s) =>
      new Date(s.created_at).toISOString().slice(0, 10)
    );
    return new Set<string>([...sessionDates, ...waPracticeDates]);
  }, [persistedSessions, waPracticeDates]);

  const streak = useMemo(
    () => computeStreakFromDates(allPracticeDates),
    [allPracticeDates]
  );
  const biggestImprovement = useMemo(
    () => computeBiggestImprovement(persistedSessions),
    [persistedSessions]
  );
  const focusArea = useMemo(
    () => computeFocusArea(radarData),
    [radarData]
  );
  const focusAreas = useMemo(
    () => computeFocusAreas(radarData),
    [radarData]
  );
  const latestBeforeAfter = useMemo(
    () => getLatestBeforeAfter(persistedSessions),
    [persistedSessions]
  );
  const totalSessions = persistedSessions.length;

  /* ─── Professional Proficiency ─── */
  const latestSession = useMemo(() => {
    if (persistedSessions.length === 0) return null;
    const sorted = [...persistedSessions].sort(
      (a, b) =>
        new Date(b.created_at).getTime() -
        new Date(a.created_at).getTime()
    );
    return sorted[0];
  }, [persistedSessions]);

  const clientProficiency = useMemo(
    () => computeProfessionalProficiency(radarData),
    [radarData]
  );

  const proficiencyScore = useMemo(() => {
    const backendVal =
      latestSession?.summary?.professionalProficiency ??
      latestSession?.feedback?.professionalProficiency;
    if (typeof backendVal === "number" && backendVal > 0)
      return Math.round(backendVal);
    return clientProficiency;
  }, [latestSession, clientProficiency]);

  const previousProficiency = useMemo(
    () => computePreviousProficiency(persistedSessions),
    [persistedSessions]
  );

  const proficiencyDelta =
    proficiencyScore > 0 && previousProficiency > 0
      ? proficiencyScore - previousProficiency
      : 0;

  const cefrApprox = useMemo(() => {
    const backendCefr = latestSession?.summary?.cefrApprox;
    if (backendCefr && typeof backendCefr === "string") {
      const match = backendCefr.match(/^(A1|A2|B1|B2|C1|C2)/i);
      if (match) {
        const level = match[1].toUpperCase();
        const labels: Record<string, string> = {
          A1: "Beginner",
          A2: "Elementary",
          B1: "Intermediate",
          B2: "Upper Intermediate",
          C1: "Advanced",
          C2: "Proficient",
        };
        return { level, label: labels[level] || level };
      }
    }
    return getCEFRApprox(proficiencyScore);
  }, [latestSession, proficiencyScore]);

  /* ─── Since You Started ─── */
  const sinceYouStarted = useMemo(
    () => computeSinceYouStarted(persistedSessions),
    [persistedSessions]
  );

  /* ─── Lessons ─── */
  const recommendedLessons = useMemo(
    () => getRecommendedLessons(radarData),
    [radarData]
  );

  /* ─── User State & Diagnosis ─── */
  const userState = useMemo(
    () => computeUserState(persistedSessions),
    [persistedSessions]
  );
  const churnGap = useMemo(
    () => computeChurnGap(persistedSessions, radarData),
    [persistedSessions, radarData]
  );
  const diagnosis = useMemo(
    () => buildDiagnosis(persistedSessions, proficiencyScore, cefrApprox, focusArea, biggestImprovement),
    [persistedSessions, proficiencyScore, cefrApprox, focusArea, biggestImprovement]
  );
  const openNextSteps = useMemo(
    () => getOpenNextSteps(persistedSessions),
    [persistedSessions]
  );
  const daysSinceLastSession = useMemo(() => {
    if (persistedSessions.length === 0) return Infinity;
    const sorted = [...persistedSessions].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    return Math.floor((Date.now() - new Date(sorted[0].created_at).getTime()) / 86_400_000);
  }, [persistedSessions]);

  const cefrProgress = useMemo(
    () => computeCEFRProgress(radarData, cefrApprox),
    [radarData, cefrApprox]
  );
  const velocitySignal = useMemo(
    () => computeVelocitySignal(persistedSessions, cefrProgress),
    [persistedSessions, cefrProgress]
  );

  /* ─── Per-path stats ─── */
  const perPathStats = useMemo(() => {
    const stats: Record<string, { sessions: number; avgScore: number | null }> = {};
    for (const s of persistedSessions) {
      const key = s.scenarioType || "unknown";
      if (!stats[key]) stats[key] = { sessions: 0, avgScore: null };
      stats[key].sessions += 1;
      const scores =
        s.feedback?.pillarScores ?? s.summary?.pillarScores ?? null;
      if (scores) {
        const vals = Object.values(scores).filter((v) => typeof v === "number") as number[];
        if (vals.length > 0) {
          const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
          stats[key].avgScore =
            stats[key].avgScore === null
              ? avg
              : (stats[key].avgScore! + avg) / 2;
        }
      }
    }
    return stats;
  }, [persistedSessions]);

  /* ─── Greeting ─── */
  const hour = new Date().getHours();
  const dc = LANDING_COPIES[lang].dashboard;
  const greeting =
    hour < 12
      ? dc.greetingMorning
      : hour < 18
        ? dc.greetingAfternoon
        : dc.greetingEvening;

  const avatarInitials = userName
    ? userName
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  const hasRealData = persistedSessions.length > 0;

  return {
    loading,
    persistedSessions,
    recentPractices,
    credits,
    freeSessionAvailable,
    allRecent,
    radarData,
    progressData,
    streak,
    allPracticeDates,
    perPathStats,
    biggestImprovement,
    focusArea,
    focusAreas,
    latestBeforeAfter,
    totalSessions,
    hasPracticed,
    hasRealData,
    proficiencyScore,
    proficiencyDelta,
    cefrApprox,
    latestSession,
    sinceYouStarted,
    recommendedLessons,
    greeting,
    avatarInitials,
    dc,
    setCredits,
    setFreeSessionAvailable,
    userState,
    churnGap,
    diagnosis,
    openNextSteps,
    daysSinceLastSession,
    cefrProgress,
    velocitySignal,
  };
}
