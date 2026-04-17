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
import { fetchSessions } from "@/services/adapters/supabase/dashboard.supabase";
import type { PersistedSession } from "@/services/adapters/supabase/dashboard.supabase";
import {
  getRecommendedLessons,
  syncLessonProgress,
} from "@/services/microLessons";
import type { RadarDataPoint } from "./dashboard.constants";
import {
  computeRadarFromSessions,
  computeProgressOverTime,
  computeStreak,
  computeBiggestImprovement,
  computeFocusArea,
  computeFocusAreas,
  getLatestBeforeAfter,
  computeProfessionalProficiency,
  computePreviousProficiency,
  getCEFRApprox,
  toPracticeHistoryItem,
  type EnrichedHistoryItem,
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
  const [, setSessionsLoaded] = useState(false);
  const [credits, setCredits] = useState<number | null>(null);
  const [freeSessionAvailable, setFreeSessionAvailable] = useState(false);

  /* ─── Data Fetching ─── */
  const fetchRealSessions = useCallback(async () => {
    try {
      const sessions = await fetchSessions();
      setPersistedSessions(sessions);
      setSessionsLoaded(true);
    } catch (err) {
      console.warn("[Dashboard] Failed to load real sessions:", err);
      setSessionsLoaded(true);
    }
  }, []);

  useEffect(() => {
    fetchRealSessions();
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
  const streak = useMemo(
    () => computeStreak(persistedSessions),
    [persistedSessions]
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
  const totalSessions = persistedSessions.length || allRecent.length;

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

  /* ─── Lessons ─── */
  const recommendedLessons = useMemo(
    () => getRecommendedLessons(radarData),
    [radarData]
  );

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
    persistedSessions,
    recentPractices,
    credits,
    freeSessionAvailable,
    allRecent,
    radarData,
    progressData,
    streak,
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
    recommendedLessons,
    greeting,
    avatarInitials,
    dc,
    setCredits,
    setFreeSessionAvailable,
  };
}
