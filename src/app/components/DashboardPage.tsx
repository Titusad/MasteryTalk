import { useState, useEffect, useMemo, useCallback } from "react";
import {
  ArrowRight,
  Calendar,
  ChevronRight,
  Target,
  Mic,
  PlayCircle,
  Clock,
  BookOpen,
  Zap,
  Flame,
  TrendingUp,
  Award,
  BarChart3,
  Info,
  MessageCircleQuestion,
  LogOut,
} from "lucide-react";
import { motion } from "motion/react";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { BrandLogo, PastelBlobs, MiniFooter } from "./shared";
import { authService, userService, paymentService } from "../../services";
import { getSupabaseClient } from "../../services/supabase";
import type { PracticeHistoryItem } from "../../services/types";
import type { LandingLang } from "./landing-i18n";
import { LANDING_COPIES } from "./landing-i18n";
import { CreditUpsellModal, getCreditsLabel } from "./CreditUpsellModal";
import { projectId, publicAnonKey } from "../../../utils/supabase/info";
import { VocabTracker } from "./VocabTracker";
import { SpacedRepetitionCard } from "./SpacedRepetitionCard";

/* ─── Types ─── */
interface DashboardPageProps {
  userName?: string;
  firstPracticeScenario?: string;
  firstPracticeInterlocutor?: string;
  onLogout?: () => void;
  onNavigateToHistory?: () => void;
  onNavigateToAccount?: () => void;
  onStartNewPractice?: (scenario: string, scenarioType?: string) => void;
  userProfile?: import("../../services/types").OnboardingProfile | null;
  onProfileUpdate?: (
    profile: import("../../services/types").OnboardingProfile
  ) => void;
  lang?: LandingLang;
}

/* ─── Persisted session shape (from POST /sessions) ─── */
interface PersistedSession {
  id: string;
  scenario: string;
  interlocutor: string;
  scenarioType: string;
  duration: string;
  created_at: string;
  feedback?: {
    strengths?: Array<{ title: string; desc: string }>;
    opportunities?: Array<{
      title: string;
      tag?: string;
      desc: string;
    }>;
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
  /** Interview briefing data (persisted for dashboard cross-reference) */
  interviewBriefing?: {
    anticipatedQuestions?: Array<{
      id: number;
      question: string;
      approach: string;
    }>;
    questionsToAsk?: Array<{ question: string }>;
  } | null;
}

/* ─── Constants ─── */
const PILLAR_NAMES = [
  "Vocabulary",
  "Grammar",
  "Fluency",
  "Pronunciation",
  "Professional Tone",
  "Persuasion",
] as const;

const TAG_TO_PILLAR: Record<string, string> = {
  vocabulary: "Vocabulary",
  lexicon: "Vocabulary",
  léxico: "Vocabulary",
  vocabulário: "Vocabulary",
  grammar: "Grammar",
  gramática: "Grammar",
  fluency: "Fluency",
  fluidez: "Fluency",
  fluência: "Fluency",
  pronunciation: "Pronunciation",
  pronunciación: "Pronunciation",
  pronúncia: "Pronunciation",
  "professional tone": "Professional Tone",
  "tono profesional": "Professional Tone",
  "tom profissional": "Professional Tone",
  register: "Professional Tone",
  persuasion: "Persuasion",
  persuasión: "Persuasion",
  persuasão: "Persuasion",
  impact: "Persuasion",
  structure: "Persuasion",
};

const PILLAR_COLORS: Record<string, string> = {
  Vocabulary: "#6366f1",
  Grammar: "#0ea5e9",
  Fluency: "#22c55e",
  Pronunciation: "#f59e0b",
  "Professional Tone": "#ec4899",
  Persuasion: "#8b5cf6",
};

const DEFAULT_RADAR = PILLAR_NAMES.map((skill) => ({
  skill,
  score: 0,
  fullMark: 100,
}));

/* ─── Helpers ─── */

/** Compute cumulative radar scores up to a given session index */
function computeRadarAtSession(
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

/** Compute skill radar from all sessions */
function computeRadarFromSessions(
  sessions: PersistedSession[]
): typeof DEFAULT_RADAR {
  if (sessions.length === 0) return DEFAULT_RADAR;

  // Prefer backend-computed pillarScores from most recent session
  const sorted = [...sessions].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  for (const s of sorted) {
    const backendScores =
      s.summary?.pillarScores || s.feedback?.pillarScores;
    if (backendScores && Object.keys(backendScores).length >= 4) {
      return PILLAR_NAMES.map((skill) => ({
        skill,
        score: backendScores[skill] ?? 0,
        fullMark: 100,
      }));
    }
  }

  // Fallback: heuristic computation from opportunity tags
  const scores = computeRadarAtSession(sessions, sessions.length - 1);
  return PILLAR_NAMES.map((skill) => ({
    skill,
    score: scores[skill],
    fullMark: 100,
  }));
}

/** Compute proficiency progress: per-session scores for line chart */
function computeProgressOverTime(
  sessions: PersistedSession[]
): Array<Record<string, string | number>> {
  if (sessions.length === 0) return [];

  const sorted = [...sessions].sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  return sorted.map((s, i) => {
    // Prefer backend pillarScores if available for this session
    const backendScores = s.summary?.pillarScores || s.feedback?.pillarScores;
    const scores = (backendScores && Object.keys(backendScores).length >= 4)
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

/** Compute the biggest improvement between last 2 sessions */
function computeBiggestImprovement(
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

/** Find the weakest pillar (focus area) */
function computeFocusArea(
  radarData: typeof DEFAULT_RADAR
): { pillar: string; score: number } | null {
  const withScores = radarData.filter((d) => d.score > 0);
  if (withScores.length === 0) return null;
  const weakest = withScores.reduce((w, c) => (c.score < w.score ? c : w), withScores[0]);
  return { pillar: weakest.skill, score: weakest.score };
}

/** Get the latest before/after example from sessions */
function getLatestBeforeAfter(
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

/** Compute streak */
function computeStreak(sessions: PersistedSession[]): number {
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

/** Compute Professional Proficiency % (weighted average of all pillars) */
function computeProfessionalProficiency(
  radarData: typeof DEFAULT_RADAR
): number {
  const withScores = radarData.filter((d) => d.score > 0);
  if (withScores.length === 0) return 0;

  // Weighted: Professional Tone and Persuasion get 1.3x (they define "professional" communication)
  const WEIGHTS: Record<string, number> = {
    Vocabulary: 1,
    Grammar: 1,
    Fluency: 1.1,
    Pronunciation: 1,
    "Professional Tone": 1.3,
    Persuasion: 1.3,
  };

  let weightedSum = 0;
  let totalWeight = 0;
  for (const d of radarData) {
    const w = WEIGHTS[d.skill] || 1;
    weightedSum += d.score * w;
    totalWeight += w;
  }
  return Math.round(weightedSum / totalWeight);
}

/** Compute previous session's proficiency for delta calculation */
function computePreviousProficiency(
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

/** Get approximate CEFR equivalent from proficiency % */
function getCEFRApprox(score: number): { level: string; label: string } {
  if (score >= 90) return { level: "C2", label: "Proficient" };
  if (score >= 78) return { level: "C1", label: "Advanced" };
  if (score >= 63) return { level: "B2", label: "Upper Intermediate" };
  if (score >= 48) return { level: "B1", label: "Intermediate" };
  if (score >= 35) return { level: "A2", label: "Elementary" };
  return { level: "A1", label: "Beginner" };
}

/** SVG circular progress ring component */
function ProficiencyRing({
  score,
  size = 100,
  strokeWidth = 7,
}: {
  score: number;
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(100, score));
  const offset = circumference - (progress / 100) * circumference;

  const color =
    score >= 78 ? "#22c55e" : score >= 63 ? "#0ea5e9" : score >= 48 ? "#f59e0b" : "#ef4444";

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      {/* Background circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#e2e8f0"
        strokeWidth={strokeWidth}
      />
      {/* Progress arc */}
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
      />
    </svg>
  );
}

/** Convert persisted session to PracticeHistoryItem (with enrichment flags) */
interface EnrichedHistoryItem extends PracticeHistoryItem {
  hasInterviewBriefing?: boolean;
  scenarioType?: string;
}

function toPracticeHistoryItem(s: PersistedSession): EnrichedHistoryItem {
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
    hasInterviewBriefing: !!(s.interviewBriefing?.anticipatedQuestions?.length),
    scenarioType: s.scenarioType,
  };
}

/* ═══════════════════════════ DASHBOARD ═══════════════════════════ */
export function DashboardPage({
  userName,
  firstPracticeScenario,
  firstPracticeInterlocutor,
  onLogout,
  onNavigateToHistory,
  onNavigateToAccount,
  onStartNewPractice,
  lang = "es",
}: DashboardPageProps) {
  const avatarInitials = userName
    ? userName
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase()
    : "U";

  /* ─── State ─── */
  const [recentPractices, setRecentPractices] = useState<PracticeHistoryItem[]>(
    []
  );
  const [persistedSessions, setPersistedSessions] = useState<
    PersistedSession[]
  >([]);
  const [, setSessionsLoaded] = useState(false);
  const [credits, setCredits] = useState<number | null>(null);
  const [freeSessionAvailable, setFreeSessionAvailable] = useState(false);

  /* ─── Fetch real sessions from backend ─── */
  const fetchRealSessions = useCallback(async () => {
    const serverUrl = `https://${projectId}.supabase.co/functions/v1/make-server-08b8658d/sessions`;
    
    const supabase = getSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token || publicAnonKey;

    fetch(serverUrl, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(`${res.status}`);
        return res.json();
      })
      .then((data) => {
        const sessions: PersistedSession[] = data.sessions || [];
        console.log(
          `[Dashboard] Loaded ${sessions.length} real sessions from backend`
        );
        setPersistedSessions(sessions);
        setSessionsLoaded(true);
      })
      .catch((err) => {
        console.warn(
          "[Dashboard] Failed to load real sessions, using mock:",
          err.message
        );
        setSessionsLoaded(true);
      });
  }, []);

  useEffect(() => {
    fetchRealSessions();
    userService
      .getPracticeHistory("mock-uid")
      .then((history) => setRecentPractices(history.slice(0, 4)))
      .catch(() => { });
    paymentService
      .getCredits("mock-uid")
      .then((c) => setCredits(c))
      .catch(() => { });
    userService
      .getProfile("mock-uid")
      .then((u) => setFreeSessionAvailable(!u.freeSessionUsed))
      .catch(() => { });
  }, [fetchRealSessions]);

  const hasPracticed = !!firstPracticeScenario;

  /* ─── Build display list ─── */
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
  const focusArea = useMemo(() => computeFocusArea(radarData), [radarData]);
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
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    return sorted[0];
  }, [persistedSessions]);

  const clientProficiency = useMemo(
    () => computeProfessionalProficiency(radarData),
    [radarData]
  );
  const proficiencyScore = useMemo(() => {
    // Prefer backend-computed professionalProficiency from latest session
    const backendVal =
      latestSession?.summary?.professionalProficiency ??
      latestSession?.feedback?.professionalProficiency;
    if (typeof backendVal === "number" && backendVal > 0) return Math.round(backendVal);
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
    // Prefer backend-computed cefrApprox from latest session summary
    const backendCefr = latestSession?.summary?.cefrApprox;
    if (backendCefr && typeof backendCefr === "string") {
      // Parse "B2" or "B2 - Upper Intermediate" format
      const match = backendCefr.match(/^(A1|A2|B1|B2|C1|C2)/i);
      if (match) {
        const level = match[1].toUpperCase();
        // Map to label
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

  const [showCEFRTooltip, setShowCEFRTooltip] = useState(false);

  /* ─── Upsell ─── */
  const [upsellOpen, setUpsellOpen] = useState(false);
  const [pendingScenario, setPendingScenario] = useState<string | null>(null);

  const handleStartSession = async (scenario: string, scenarioType?: string) => {
    // DEV MODE: bypass credit/session gate — always allow
    onStartNewPractice?.(scenario, scenarioType);
  };

  const handlePurchaseComplete = (
    _pack: import("../../services/types").CreditPack,
    creditsAdded: number
  ) => {
    setCredits((prev) => (prev ?? 0) + creditsAdded);
    setFreeSessionAvailable(false);
    setUpsellOpen(false);
    if (pendingScenario) {
      onStartNewPractice?.(pendingScenario);
      setPendingScenario(null);
    }
  };

  /* ─── Greeting ─── */
  const hour = new Date().getHours();
  const dc = LANDING_COPIES[lang].dashboard;
  const greeting =
    hour < 12 ? dc.greetingMorning : hour < 18 ? dc.greetingAfternoon : dc.greetingEvening;

  const hasRealData = persistedSessions.length > 0;

  return (
    <div
      className="w-full min-h-full flex flex-col bg-[#f8fafc] relative overflow-hidden"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <PastelBlobs />

      {/* ═══════ HEADER ═══════ */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#e2e8f0] relative">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between px-6 md:px-8 h-16 md:h-20">
          <BrandLogo />
          <div className="flex items-center gap-4 md:gap-6">
            <button
              onClick={() => onNavigateToHistory?.()}
              className="text-[#45556c] hover:text-[#0f172b] transition-colors text-sm hidden sm:block"
              style={{ fontWeight: 500 }}
            >
              {dc.history}
            </button>

            {credits !== null && (
              <button
                onClick={() => setUpsellOpen(true)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all cursor-pointer ${credits === 0 && !freeSessionAvailable
                    ? "bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100"
                    : "bg-[#f1f5f9] border border-[#e2e8f0] text-[#45556c] hover:bg-[#e2e8f0]"
                  }`}
                style={{ fontWeight: 600 }}
              >
                <Zap
                  className={`w-3 h-3 ${credits === 0 && !freeSessionAvailable
                      ? "text-amber-500"
                      : "text-[#50C878]"
                    }`}
                />
                {freeSessionAvailable && credits === 0
                  ? lang === "pt"
                    ? "1 sessao gratis"
                    : "1 sesion gratis"
                  : `${credits} ${getCreditsLabel(credits, lang)}`}
              </button>
            )}

            <div className="flex items-center gap-3">
              <button
                className="text-[#45556c] hover:text-[#0f172b] transition-colors p-2 rounded-full cursor-pointer flex items-center justify-center"
                onClick={() => {
                  authService.signOut().catch(() => { });
                  onLogout?.();
                }}
                title="Cerrar sesión"
              >
                <LogOut className="w-5 h-5" />
              </button>
              <div
                className="w-10 h-10 rounded-full bg-[#0f172b] flex items-center justify-center cursor-pointer"
                title="Mi cuenta"
                onClick={() => onNavigateToAccount?.()}
              >
                <span
                  className="text-white text-sm"
                  style={{ fontWeight: 500 }}
                >
                  {avatarInitials}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ═══════ MAIN ═══════ */}
      <main className="relative w-full max-w-[1120px] mx-auto px-4 md:px-8 pt-6 md:pt-8 pb-20">
        {/* ─── Greeting row ─── */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-6 md:mb-8">
          <div>
            <h2
              className="text-2xl md:text-3xl text-[#0f172b]"
              style={{ fontWeight: 300 }}
            >
              Hola{" "}
              <span style={{ fontWeight: 500 }}>{userName && userName.trim().length > 0 ? userName.trim().split(" ")[0] : "Explorador"}</span>
            </h2>
            <p className="text-sm text-[#62748e] mt-1">
              {hasRealData
                ? dc.subtitleWithData
                : dc.subtitleEmpty}
            </p>
          </div>
        </div>

        {/* ─── Professional Proficiency Hero Card ─── */}
        <motion.div
          className="bg-gradient-to-br from-[#0f172b] to-[#1e293b] rounded-2xl shadow-lg p-5 md:p-6 mb-6 relative overflow-hidden"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.5 }}
        >
          {/* Subtle decorative orbs */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative flex flex-col sm:flex-row items-center gap-5 sm:gap-8">
            {/* Ring + Score */}
            <div className="relative shrink-0">
              <ProficiencyRing
                score={proficiencyScore}
                size={110}
                strokeWidth={8}
              />
              {/* Score text centered inside ring */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                {proficiencyScore > 0 ? (
                  <>
                    <motion.span
                      className="text-white text-2xl leading-none"
                      style={{ fontWeight: 700 }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8 }}
                    >
                      {proficiencyScore}%
                    </motion.span>
                    {proficiencyDelta !== 0 && (
                      <motion.span
                        className={`text-[11px] leading-none mt-0.5 ${proficiencyDelta > 0
                            ? "text-emerald-400"
                            : "text-red-400"
                          }`}
                        style={{ fontWeight: 600 }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                      >
                        {proficiencyDelta > 0 ? "+" : ""}
                        {proficiencyDelta}
                      </motion.span>
                    )}
                  </>
                ) : (
                  <span className="text-white/40 text-lg" style={{ fontWeight: 600 }}>
                    —
                  </span>
                )}
              </div>
            </div>

            {/* Text content */}
            <div className="flex-1 text-center sm:text-left">
              <h3
                className="text-white text-lg md:text-xl mb-1"
                style={{ fontWeight: 600 }}
              >
                Professional Proficiency
              </h3>
              <p className="text-white/60 text-sm leading-relaxed mb-3 max-w-md">
                {proficiencyScore > 0
                  ? dc.proficiency.descWithData
                  : dc.proficiency.descEmpty}
              </p>

              {/* CEFR Footnote */}
              {proficiencyScore > 0 && (
                <div className="relative inline-flex items-center gap-1.5">
                  <button
                    className="flex items-center gap-1.5 bg-white/10 hover:bg-white/15 rounded-full px-3 py-1.5 transition-colors cursor-pointer"
                    onClick={() => setShowCEFRTooltip((prev) => !prev)}
                    onBlur={() => setShowCEFRTooltip(false)}
                  >
                    <span
                      className="text-white text-xs"
                      style={{ fontWeight: 600 }}
                    >
                      ~{cefrApprox.level}
                    </span>
                    <span className="text-white/50 text-[11px]">
                      {cefrApprox.label}
                    </span>
                    <Info className="w-3 h-3 text-white/40" />
                  </button>
                  {showCEFRTooltip && (
                    <motion.div
                      className="absolute bottom-full left-0 mb-2 bg-white rounded-xl shadow-xl border border-[#e2e8f0] p-3 w-64 z-10"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <p
                        className="text-[11px] text-[#0f172b] mb-1"
                        style={{ fontWeight: 600 }}
                      >
                        {dc.proficiency.cefrTitle}
                      </p>
                      <p className="text-[10px] text-[#62748e] leading-relaxed">
                        {dc.proficiency.cefrDisclaimer}
                      </p>
                    </motion.div>
                  )}
                </div>
              )}

              {/* Pillar mini-bars */}
              {proficiencyScore > 0 && (
                <div className="flex flex-wrap gap-x-3 gap-y-1.5 mt-3">
                  {radarData
                    .filter((d) => d.score > 0)
                    .map((d) => (
                      <div key={d.skill} className="flex items-center gap-1.5">
                        <div
                          className="h-1.5 rounded-full"
                          style={{
                            width: `${Math.max(16, d.score * 0.4)}px`,
                            backgroundColor:
                              PILLAR_COLORS[d.skill] || "#6366f1",
                            opacity: 0.8,
                          }}
                        />
                        <span className="text-[10px] text-white/40">
                          {d.skill === "Professional Tone" ? "Prof. Tone" : d.skill}
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* ─── Compact stat pills ─── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {/* Sessions */}
          <motion.div
            className="bg-indigo-50 rounded-2xl border border-white/60 p-4 md:p-5"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.4 }}
          >
            <BookOpen className="w-5 h-5 mb-2 text-[#6366f1]" />
            <p
              className="text-xl md:text-2xl text-[#0f172b] mb-0.5"
              style={{ fontWeight: 600 }}
            >
              {totalSessions}
            </p>
            <p className="text-xs text-[#62748e]">{dc.stats.sessions}</p>
          </motion.div>

          {/* Biggest Improvement */}
          <motion.div
            className={`rounded-2xl border border-white/60 p-4 md:p-5 ${biggestImprovement ? "bg-green-50" : "bg-slate-50"
              }`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
          >
            <TrendingUp
              className="w-5 h-5 mb-2"
              style={{
                color: biggestImprovement ? "#22c55e" : "#94a3b8",
              }}
            />
            <p
              className="text-xl md:text-2xl text-[#0f172b] mb-0.5"
              style={{ fontWeight: 600 }}
            >
              {biggestImprovement ? `+${biggestImprovement.delta}` : "—"}
            </p>
            <p className="text-xs text-[#62748e]">
              {biggestImprovement
                ? biggestImprovement.pillar
                : dc.stats.biggestGain}
            </p>
          </motion.div>

          {/* Focus Area */}
          <motion.div
            className={`rounded-2xl border border-white/60 p-4 md:p-5 ${focusArea ? "bg-amber-50" : "bg-slate-50"
              }`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, duration: 0.4 }}
          >
            <Target
              className="w-5 h-5 mb-2"
              style={{ color: focusArea ? "#f59e0b" : "#94a3b8" }}
            />
            <p
              className="text-lg md:text-xl text-[#0f172b] mb-0.5 truncate"
              style={{ fontWeight: 600 }}
            >
              {focusArea ? `${focusArea.score}%` : "—"}
            </p>
            <p className="text-xs text-[#62748e] truncate">
              {focusArea ? focusArea.pillar : dc.stats.focusArea}
            </p>
          </motion.div>

          {/* Streak */}
          <motion.div
            className={`rounded-2xl border border-white/60 p-4 md:p-5 ${streak > 0 ? "bg-orange-50" : "bg-slate-50"
              }`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.14, duration: 0.4 }}
          >
            <Flame
              className="w-5 h-5 mb-2"
              style={{ color: streak > 0 ? "#f97316" : "#94a3b8" }}
            />
            <p
              className="text-xl md:text-2xl text-[#0f172b] mb-0.5"
              style={{ fontWeight: 600 }}
            >
              {streak > 0 ? `${streak}d` : "—"}
            </p>
            <p className="text-xs text-[#62748e]">{dc.stats.streak}</p>
          </motion.div>
        </div>

        {/* ─── Main grid: Radar + Progress Chart ─── */}
        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          {/* ── Skill Radar ── */}
          <motion.div
            className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm p-5 lg:col-span-1"
            style={{ minWidth: 0 }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="w-4 h-4 text-[#6366f1]" />
              <h3
                className="text-sm text-[#0f172b]"
                style={{ fontWeight: 600 }}
              >
                {dc.radar.title}
              </h3>
            </div>
            <p className="text-[11px] text-[#62748e] mb-3">
              {hasRealData
                ? dc.radar.descWithData
                : dc.radar.descEmpty}
            </p>
            <div
              className="w-full"
              style={{ height: 240, maxWidth: 280, margin: "0 auto" }}
            >
              <ResponsiveContainer width="100%" height={240}>
                <RadarChart
                  data={radarData}
                  cx="50%"
                  cy="50%"
                  outerRadius="72%"
                >
                  <PolarGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                  <PolarAngleAxis
                    dataKey="skill"
                    tick={({ payload, x, y, textAnchor }: any) => {
                      const label = payload.value as string;
                      if (label === "Professional Tone") {
                        return (
                          <text
                            x={x}
                            y={y}
                            textAnchor={textAnchor}
                            fontSize={10}
                            fill="#62748e"
                          >
                            <tspan x={x} dy="0">
                              Professional
                            </tspan>
                            <tspan x={x} dy="12">
                              Tone
                            </tspan>
                          </text>
                        );
                      }
                      return (
                        <text
                          x={x}
                          y={y}
                          textAnchor={textAnchor}
                          fontSize={10}
                          fill="#62748e"
                        >
                          {label}
                        </text>
                      );
                    }}
                    tickLine={false}
                  />
                  <Radar
                    name="Score"
                    dataKey="score"
                    stroke="#6366f1"
                    fill="#6366f1"
                    fillOpacity={0.15}
                    strokeWidth={2}
                    dot={{ r: 3, fill: "#6366f1", strokeWidth: 0 }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* ── Proficiency Progress + Quick Start ── */}
          <div
            className="lg:col-span-2 flex flex-col gap-6"
            style={{ minWidth: 0 }}
          >
            {/* Proficiency Progress Chart */}
            <motion.div
              className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm p-5"
              style={{ minWidth: 0 }}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#22c55e]" />
                  <h3
                    className="text-sm text-[#0f172b]"
                    style={{ fontWeight: 600 }}
                  >
                    {dc.progress.title}
                  </h3>
                </div>
                {progressData.length > 0 && (
                  <span className="text-[10px] text-[#62748e]">
                    {progressData.length} session
                    {progressData.length !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#62748e] mb-4">
                {progressData.length >= 2
                  ? dc.progress.descMultiple
                  : progressData.length === 1
                    ? dc.progress.descSingle
                    : dc.progress.descEmpty}
              </p>

              {progressData.length >= 2 ? (
                <div style={{ width: "100%", height: 180 }}>
                  <ResponsiveContainer width="100%" height={180}>
                    <AreaChart data={progressData}>
                      <defs>
                        {PILLAR_NAMES.map((p) => (
                          <linearGradient
                            key={p}
                            id={`grad-${p.replace(/\s/g, "")}`}
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="0%"
                              stopColor={PILLAR_COLORS[p]}
                              stopOpacity={0.15}
                            />
                            <stop
                              offset="100%"
                              stopColor={PILLAR_COLORS[p]}
                              stopOpacity={0.02}
                            />
                          </linearGradient>
                        ))}
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#f1f5f9"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="session"
                        tick={{ fontSize: 11, fill: "#94a3b8" }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        domain={[20, 100]}
                        tick={{ fontSize: 11, fill: "#94a3b8" }}
                        tickLine={false}
                        axisLine={false}
                        width={30}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "#0f172b",
                          border: "none",
                          borderRadius: 10,
                          padding: "8px 14px",
                          fontSize: 11,
                          color: "#fff",
                        }}
                        cursor={{
                          stroke: "#cbd5e1",
                          strokeDasharray: "3 3",
                        }}
                      />
                      {PILLAR_NAMES.map((p) => (
                        <Area
                          key={p}
                          type="monotone"
                          dataKey={p}
                          stroke={PILLAR_COLORS[p]}
                          strokeWidth={2}
                          fill={`url(#grad-${p.replace(/\s/g, "")})`}
                          dot={{
                            r: 2.5,
                            fill: PILLAR_COLORS[p],
                            strokeWidth: 0,
                          }}
                          activeDot={{
                            r: 4,
                            fill: PILLAR_COLORS[p],
                            stroke: "#fff",
                            strokeWidth: 2,
                          }}
                        />
                      ))}
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex items-center justify-center py-8 text-center">
                  <div>
                    <TrendingUp className="w-8 h-8 text-[#cbd5e1] mx-auto mb-2" />
                    <p className="text-xs text-[#94a3b8]">
                      {progressData.length === 1
                        ? dc.progress.emptyOneSessions
                        : dc.progress.emptyNoSessions}
                    </p>
                  </div>
                </div>
              )}

              {/* Pillar legend */}
              {progressData.length >= 2 && (
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3">
                  {PILLAR_NAMES.map((p) => (
                    <div key={p} className="flex items-center gap-1.5">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: PILLAR_COLORS[p] }}
                      />
                      <span className="text-[10px] text-[#62748e]">{p}</span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Quick start cards */}
            <motion.div
              className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm p-5"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h3
                className="text-sm text-[#0f172b] mb-4"
                style={{ fontWeight: 600 }}
              >
                {dc.quickStart.title}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(
                  [
                    {
                      id: "sales",
                      label: dc.quickStart.salesLabel,
                      description: dc.quickStart.salesDesc,
                      icon: Target,
                    },
                    {
                      id: "interview",
                      label: dc.quickStart.interviewLabel,
                      description: dc.quickStart.interviewDesc,
                      icon: Mic,
                    },
                  ] as const
                ).map((card) => {
                  const Icon = card.icon;
                  return (
                    <motion.button
                      key={card.id}
                      onClick={() => handleStartSession(card.label, card.id)}
                      className="group/card relative bg-[#f8fafc] hover:bg-[#0f172b] border-2 border-[#e2e8f0] hover:border-[#0f172b] rounded-xl p-5 text-left transition-all duration-300 cursor-pointer"
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="w-9 h-9 rounded-full bg-[#0f172b] group-hover/card:bg-white flex items-center justify-center mb-3 transition-colors duration-300">
                        <Icon
                          className="w-4 h-4 text-white group-hover/card:text-[#0f172b] transition-colors duration-300"
                          strokeWidth={1.5}
                        />
                      </div>
                      <p
                        className="text-[#0f172b] group-hover/card:text-white text-sm mb-1 transition-colors duration-300"
                        style={{ fontWeight: 600 }}
                      >
                        {card.label}
                      </p>
                      <p className="text-[#62748e] group-hover/card:text-white/70 text-xs leading-relaxed transition-colors duration-300">
                        {card.description}
                      </p>
                      <div className="absolute top-4 right-4 w-7 h-7 rounded-full bg-transparent group-hover/card:bg-white/15 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-all duration-300">
                        <ArrowRight className="w-3.5 h-3.5 text-white" />
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </div>

        {/* ─── Before → After Highlight ─── */}
        {latestBeforeAfter && (
          <motion.div
            className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm p-5 mb-6"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-[#8b5cf6]" />
                <h3
                  className="text-sm text-[#0f172b]"
                  style={{ fontWeight: 600 }}
                >
                  {dc.improvement.title}
                </h3>
              </div>
              <span
                className="text-[10px] text-[#62748e] bg-[#f1f5f9] px-2.5 py-1 rounded-full"
                style={{ fontWeight: 500 }}
              >
                {latestBeforeAfter.sessionTitle}
              </span>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {/* What you said */}
              <div className="bg-red-50/60 rounded-xl p-4 border border-red-100">
                <p
                  className="text-[10px] text-red-400 mb-2 uppercase tracking-wider"
                  style={{ fontWeight: 600 }}
                >
                  {dc.improvement.youSaid}
                </p>
                <p className="text-sm text-[#334155] leading-relaxed italic">
                  &ldquo;{latestBeforeAfter.userOriginal}&rdquo;
                </p>
              </div>
              {/* Professional version */}
              <div className="bg-green-50/60 rounded-xl p-4 border border-green-100">
                <p
                  className="text-[10px] text-green-500 mb-2 uppercase tracking-wider"
                  style={{ fontWeight: 600 }}
                >
                  {dc.improvement.proVersion}
                </p>
                <p
                  className="text-sm text-[#334155] leading-relaxed"
                  style={{ fontWeight: 500 }}
                >
                  &ldquo;{latestBeforeAfter.professionalVersion}&rdquo;
                </p>
              </div>
            </div>
            {latestBeforeAfter.technique && (
              <div className="mt-3 flex items-start gap-2">
                <div className="w-1 h-1 rounded-full bg-[#8b5cf6] mt-1.5 shrink-0" />
                <p className="text-[11px] text-[#62748e] leading-relaxed">
                  <span style={{ fontWeight: 600, color: "#8b5cf6" }}>
                    {dc.improvement.technique}:
                  </span>{" "}
                  {latestBeforeAfter.technique}
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* ─── Interview Prep Summary (latest interview session with briefing data) ─── */}
        {(() => {
          const latestInterview = persistedSessions
            .filter((s) => s.scenarioType === "interview" && s.interviewBriefing?.anticipatedQuestions?.length)
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
          if (!latestInterview?.interviewBriefing) return null;
          const brief = latestInterview.interviewBriefing;
          const proficiency = latestInterview.summary?.professionalProficiency
            ?? latestInterview.feedback?.professionalProficiency;
          return (
            <motion.div
              className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm p-5 mb-6"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <MessageCircleQuestion className="w-4 h-4 text-[#6366f1]" />
                  <h3 className="text-sm text-[#0f172b]" style={{ fontWeight: 600 }}>
                    Your Last Interview Prep
                  </h3>
                </div>
                <span
                  className="text-[10px] bg-[#6366f1]/10 text-[#6366f1] px-2.5 py-1 rounded-full"
                  style={{ fontWeight: 600 }}
                >
                  {latestInterview.interlocutor.replace("_", " ")}
                </span>
              </div>

              {/* Scenario */}
              <p className="text-xs text-[#62748e] mb-3 truncate">
                {latestInterview.scenario}
              </p>

              {/* Questions grid */}
              <div className="space-y-1.5 mb-4">
                {brief.anticipatedQuestions!.slice(0, 5).map((q, i) => (
                  <div
                    key={q.id ?? i}
                    className="flex items-start gap-2.5 bg-[#f8fafc] rounded-lg px-3 py-2"
                  >
                    <span
                      className="w-5 h-5 rounded-md bg-[#6366f1]/10 text-[#6366f1] flex items-center justify-center text-[10px] shrink-0 mt-0.5"
                      style={{ fontWeight: 700 }}
                    >
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs text-[#0f172b] leading-snug truncate" style={{ fontWeight: 500 }}>
                        {q.question}
                      </p>
                      <p className="text-[10px] text-[#94a3b8] truncate mt-0.5">
                        {q.approach}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Performance connection */}
              {proficiency && proficiency > 0 ? (
                <div className="flex items-center gap-2 bg-gradient-to-r from-[#f0fdf4] to-[#eef2ff] rounded-lg px-3 py-2.5 border border-[#bbf7d0]/50">
                  <div className="w-8 h-8 rounded-full bg-white border border-[#e2e8f0] flex items-center justify-center">
                    <span className="text-xs text-[#0f172b]" style={{ fontWeight: 700 }}>
                      {proficiency}%
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-[#0f172b]" style={{ fontWeight: 500 }}>
                      Session Score
                    </p>
                    <p className="text-[10px] text-[#62748e]">
                      Based on {brief.anticipatedQuestions!.length} prepared questions
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-[10px] text-[#94a3b8] text-center">
                  Practice this scenario to see your performance score here
                </p>
              )}
            </motion.div>
          );
        })()}

        {/* ─── Spaced Repetition Review ─── */}
        <div className="mb-6">
          <SpacedRepetitionCard />
        </div>

        {/* ─── Pronunciation Vocabulary Tracker ─── */}
        <div className="mb-6">
          <VocabTracker />
        </div>

        {/* ─── Bottom grid: Recent Sessions + Recommended Next ─── */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* ── Recent Sessions ── */}
          <motion.div
            className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm p-5 flex flex-col"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#0f172b]" />
                <h3
                  className="text-sm text-[#0f172b]"
                  style={{ fontWeight: 600 }}
                >
                  {dc.recentSessions.title}
                </h3>
              </div>
              {allRecent.length > 0 && (
                <button
                  onClick={() => onNavigateToHistory?.()}
                  className="text-xs text-[#6366f1] hover:text-[#4f46e5] transition-colors flex items-center gap-0.5"
                  style={{ fontWeight: 500 }}
                >
                  {dc.recentSessions.viewAll}
                  <ChevronRight className="w-3 h-3" />
                </button>
              )}
            </div>

            {allRecent.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-8 text-center">
                <BookOpen className="w-8 h-8 text-[#cbd5e1] mb-2" />
                <p className="text-sm text-[#62748e]">
                  {dc.recentSessions.empty}
                </p>
              </div>
            ) : (
              <div className="space-y-2 flex-1">
                {allRecent.slice(0, 4).map((practice, i) => (
                  <motion.div
                    key={`session-${i}`}
                    className="rounded-xl px-4 py-3 border border-[#e2e8f0] hover:border-[#c4b5fd] transition-all cursor-pointer group"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.28 + i * 0.05, duration: 0.3 }}
                    onClick={() => onNavigateToHistory?.()}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <p
                        className="text-sm text-[#0f172b] truncate flex-1 mr-2"
                        style={{ fontWeight: 500 }}
                      >
                        {practice.title}
                      </p>
                      <ChevronRight className="w-3.5 h-3.5 text-[#cbd5e1] group-hover:text-[#6366f1] transition-colors shrink-0" />
                    </div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="flex items-center gap-1 text-[10px] text-[#62748e]">
                        <Calendar className="w-3 h-3" />
                        {practice.date}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] text-[#62748e]">
                        <Clock className="w-3 h-3" />
                        {practice.duration}
                      </span>
                      <span
                        className="bg-[#f1f5f9] text-[#62748e] text-[10px] px-2 py-0.5 rounded-full"
                        style={{ fontWeight: 500 }}
                      >
                        {practice.tag}
                      </span>
                      {(practice as EnrichedHistoryItem).hasInterviewBriefing && (
                        <span
                          className="bg-[#6366f1]/10 text-[#6366f1] text-[10px] px-2 py-0.5 rounded-full flex items-center gap-0.5"
                          style={{ fontWeight: 600 }}
                        >
                          <MessageCircleQuestion className="w-2.5 h-2.5" />
                          Briefing
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* ── Recommended Next ── */}
          <motion.div
            className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm p-5 flex flex-col"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-[#0f172b]" />
                <h3
                  className="text-sm text-[#0f172b]"
                  style={{ fontWeight: 600 }}
                >
                  {dc.recommended.title}
                </h3>
              </div>
              <span
                className="bg-[#fef3c7] text-[#92400e] text-[10px] px-2.5 py-1 rounded-full"
                style={{ fontWeight: 600 }}
              >
                {dc.recommended.aiBadge}
              </span>
            </div>

            <p className="text-xs text-[#45556c] mb-4 flex-1 leading-relaxed">
              {focusArea
                ? dc.recommended.descFocus
                  .replace("{pillar}", focusArea.pillar)
                  .replace("{score}", String(focusArea.score))
                : hasPracticed
                  ? dc.recommended.descPracticed
                  : dc.recommended.descNew}
            </p>

            <div className="bg-gradient-to-br from-[#f8fafc] to-[#eef2ff] rounded-xl border border-[#e2e8f0] p-4 mb-4">
              <div className="flex items-start justify-between mb-2">
                <p
                  className="text-[15px] text-[#0f172b]"
                  style={{ fontWeight: 500 }}
                >
                  {hasPracticed || hasRealData
                    ? dc.recommended.scenarioInterview
                    : dc.recommended.scenarioSales}
                </p>
                {focusArea && (
                  <div
                    className="flex items-center gap-1 text-[10px] text-[#f59e0b]"
                    style={{ fontWeight: 600 }}
                  >
                    <Target className="w-3 h-3" />
                    {focusArea.pillar}
                  </div>
                )}
              </div>
              <p className="text-xs text-[#62748e] leading-relaxed mb-3">
                {hasPracticed || hasRealData
                  ? dc.recommended.scenarioInterviewDesc
                  : dc.recommended.scenarioSalesDesc}
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className="text-[10px] bg-[#eef2ff] text-[#6366f1] rounded-full px-2.5 py-0.5"
                  style={{ fontWeight: 600 }}
                >
                  {hasPracticed || hasRealData ? dc.recommended.tagInterview : dc.recommended.tagSales}
                </span>
                <span
                  className="text-[10px] bg-[#f1f5f9] text-[#45556c] rounded-full px-2.5 py-0.5"
                  style={{ fontWeight: 500 }}
                >
                  {dc.recommended.duration}
                </span>
              </div>
            </div>

            <button
              onClick={() =>
                handleStartSession(
                  hasPracticed || hasRealData
                    ? dc.recommended.scenarioInterview
                    : dc.recommended.scenarioSales,
                  hasPracticed || hasRealData ? "interview" : "sales"
                )
              }
              className="w-full bg-[#0f172b] text-white py-3 rounded-full flex items-center justify-center gap-2 hover:bg-[#1d293d] transition-colors shadow-sm cursor-pointer"
            >
              <PlayCircle className="w-4 h-4" />
              <span className="text-sm" style={{ fontWeight: 500 }}>
                {dc.recommended.startSession}
              </span>
            </button>
          </motion.div>
        </div>
      </main>

      <MiniFooter />

      <CreditUpsellModal
        open={upsellOpen}
        onClose={() => setUpsellOpen(false)}
        onPurchaseComplete={handlePurchaseComplete}
        lang={lang}
        creditsRemaining={credits ?? 0}
      />
    </div>
  );
}