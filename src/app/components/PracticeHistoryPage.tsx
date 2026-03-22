import { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  ChevronDown,
  BookOpen,
  ArrowLeft,
  FileText,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { BrandLogo, PastelBlobs, MiniFooter } from "./shared";
import { authService, userService } from "../../services";
import type { PracticeHistoryItem, ScenarioType } from "../../services/types";
import { SessionReport } from "./SessionReport";
import { projectId, publicAnonKey } from "../../../utils/supabase/info";
import { getAuthToken } from "../../services/supabase";

/* ─── Props ─── */
interface PracticeHistoryPageProps {
  userName?: string;
  firstPracticeScenario?: string;
  firstPracticeInterlocutor?: string;
  onBack: () => void;
  onLogout?: () => void;
}

/* ─── Detect scenario type from title ─── */
function detectScenarioType(title: string): ScenarioType {
  const lower = title.toLowerCase();
  if (lower.includes("interview") || lower.includes("entrevista")) return "interview";
  return "sales";
}

/* ─── Interfaces for real sessions ─── */
interface PersistedSession {
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
  improvedScript?: Array<{
    num: number;
    title: string;
    paragraphs: Array<{
      text: string;
      suffix?: string;
      highlights?: Array<{ phrase: string }>;
    }>;
  }> | null;
  interviewBriefing?: {
    anticipatedQuestions?: Array<{ theme: string; question: string }>;
  } | null;
}

interface EnrichedHistoryItem extends PracticeHistoryItem {
  hasInterviewBriefing?: boolean;
  rawSession?: PersistedSession;
}

function toPracticeHistoryItem(s: PersistedSession): EnrichedHistoryItem {
  const d = new Date(s.created_at);
  const isToday = new Date().toDateString() === d.toDateString();
  return {
    title: s.scenario,
    date: isToday ? "Today" : d.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }),
    duration: s.duration || "8 min",
    tag: s.interlocutor || "Client",
    beforeAfterHighlight: s.feedback?.beforeAfter?.[0] || undefined,
    hasInterviewBriefing: !!(s.interviewBriefing?.anticipatedQuestions?.length),
    rawSession: s,
  };
}

export function PracticeHistoryPage({
  userName,
  firstPracticeScenario,
  firstPracticeInterlocutor,
  onBack,
  onLogout,
}: PracticeHistoryPageProps) {
  const [expandedPractice, setExpandedPractice] = useState<number | null>(0);
  const [persistedSessions, setPersistedSessions] = useState<PersistedSession[]>([]);
  const [viewingReport, setViewingReport] = useState<number | null>(null);

  const avatarInitials = userName
    ? userName.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  /* ─── Load practice history ─── */
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const token = await getAuthToken();
        const serverUrl = `https://${projectId}.supabase.co/functions/v1/make-server-08b8658d/sessions`;
        const res = await fetch(serverUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
            apikey: publicAnonKey,
          },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const sessions: PersistedSession[] = data.sessions || [];
        setPersistedSessions(sessions);
      } catch (err) {
        console.warn("[PracticeHistory] Failed to load real sessions:", (err as Error).message);
      }
    };
    loadHistory();
  }, []);

  /* ─── Computed practices list (inject the latest session if available) ─── */
  const realHistoryItems = persistedSessions.map(toPracticeHistoryItem);
  const practices: EnrichedHistoryItem[] = firstPracticeScenario
    ? [
      {
        title: firstPracticeScenario,
        date: "Today",
        duration: "8 min",
        tag: firstPracticeInterlocutor || "Client",
        beforeAfterHighlight: {
          userOriginal:
            "The main differentiator is that we offer bilingual support and integrations with local payment processors.",
          professionalVersion:
            "We’ve built a purpose-designed solution for the LATAM mid-market, with native bilingual capabilities and seamless integration into the local payment ecosystem.",
          technique: "Value elevation",
        },
      },
      ...realHistoryItems,
    ]
    : realHistoryItems;

  /* ─── Stats summary ─── */
  const totalSessions = practices.length;

  return (
    <div
      className="w-full min-h-full flex flex-col bg-[#f8fafc] relative overflow-hidden"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <PastelBlobs />

      {/* ───── HEADER ───── */}
      <header className="sticky top-0 z-50 bg-white border-b border-[#e2e8f0] relative">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between px-8 h-20">
          <div className="flex items-center gap-6">
            <BrandLogo />
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 text-sm text-[#45556c] hover:text-[#0f172b] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Dashboard
            </button>
          </div>
          <div className="flex items-center gap-6">
            <div
              className="w-10 h-10 rounded-full bg-[#0f172b] flex items-center justify-center cursor-pointer"
              onClick={() => {
                authService.signOut().catch(() => { });
                onLogout?.();
              }}
              title="Sign out"
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
      </header>

      {/* ───── CONTENT ───── */}
      <main className="flex-1 relative z-10">
        <div className="max-w-[860px] mx-auto px-6 py-10 space-y-8">
          {/* ── Page title ── */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-[#0f172b] flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <h1
                className="text-[28px] text-[#0f172b]"
                style={{ fontWeight: 300 }}
              >
                Session History
              </h1>
            </div>
            <p className="text-sm text-[#45556c] ml-[52px]">
              All your practices with feedback and Before/After
            </p>
          </div>

          {/* ── Summary stat ── */}
          {totalSessions > 0 && (
            <div className="grid grid-cols-2 gap-3 max-w-[320px]">
              <div className="bg-white rounded-2xl border border-[#e2e8f0] p-4 text-center">
                <p
                  className="text-2xl text-[#0f172b] mb-0.5"
                  style={{ fontWeight: 600 }}
                >
                  {totalSessions}
                </p>
                <p className="text-xs text-[#62748e]">Sessions</p>
              </div>
              <div className="bg-white rounded-2xl border border-[#e2e8f0] p-4 text-center">
                <p
                  className="text-2xl text-[#0f172b] mb-0.5"
                  style={{ fontWeight: 600 }}
                >
                  {practices.reduce((sum, p) => {
                    const mins = parseInt(p.duration) || 0;
                    return sum + mins;
                  }, 0)} min
                </p>
                <p className="text-xs text-[#62748e]">Total time</p>
              </div>
            </div>
          )}

          {/* ── Session cards (simple list) ── */}
          {practices.length === 0 ? (
            <div className="bg-white rounded-3xl border border-[#e2e8f0] p-12 text-center">
              <BookOpen className="w-10 h-10 text-[#cbd5e1] mx-auto mb-3" />
              <p
                className="text-lg text-[#0f172b] mb-1"
                style={{ fontWeight: 500 }}
              >
                No sessions yet
              </p>
              <p className="text-sm text-[#62748e]">
                Complete your first practice to see your history here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {practices.map((practice, i) => {
                const isExpanded = expandedPractice === i;
                const highlight = practice.beforeAfterHighlight;

                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    className={`w-full bg-white rounded-2xl border text-left transition-all ${isExpanded
                        ? "border-[#c4b5fd] shadow-sm"
                        : "border-[#e2e8f0] hover:border-[#cad5e2]"
                      }`}
                  >
                    {/* Clickable header */}
                    <button
                      onClick={() =>
                        setExpandedPractice(isExpanded ? null : i)
                      }
                      className="w-full p-5 text-left group"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h4
                              className="text-[15px] text-[#0f172b] truncate"
                              style={{ fontWeight: 500 }}
                            >
                              {practice.title}
                            </h4>
                            {i === 0 && firstPracticeScenario && (
                              <span
                                className="shrink-0 text-[10px] px-2 py-0.5 rounded-full bg-[#f0fdf4] text-[#16a34a] border border-[#bbf7d0]"
                                style={{ fontWeight: 600 }}
                              >
                                Latest
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <span className="flex items-center gap-1 text-xs text-[#62748e]">
                              <Calendar className="w-3.5 h-3.5" />
                              <span style={{ fontWeight: 500 }}>
                                {practice.date}
                              </span>
                            </span>
                            <span className="flex items-center gap-1 text-xs text-[#62748e]">
                              <Clock className="w-3.5 h-3.5" />
                              <span style={{ fontWeight: 500 }}>
                                {practice.duration}
                              </span>
                            </span>
                            <span
                              className="bg-[#f1f5f9] text-[#62748e] text-[10px] px-2 py-0.5 rounded-full"
                              style={{ fontWeight: 500 }}
                            >
                              {practice.tag}
                            </span>
                          </div>
                        </div>
                        <ChevronDown
                          className={`w-5 h-5 text-[#62748e] mt-0.5 shrink-0 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""
                            }`}
                        />
                      </div>
                    </button>

                    {/* Expandable details */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 pb-5 space-y-3">
                            {/* Before/After highlight */}
                            {highlight && (
                              <div className="rounded-xl bg-[#fafbfc] border border-[#e2e8f0] p-4">
                                <p
                                  className="text-[10px] uppercase tracking-wider text-[#94a3b8] mb-3"
                                  style={{ fontWeight: 600 }}
                                >
                                  Before / After highlight
                                </p>
                                <div className="space-y-2">
                                  <div className="text-xs text-[#64748b] italic leading-relaxed">
                                    &ldquo;{highlight.userOriginal}&rdquo;
                                  </div>
                                  <div className="text-xs text-[#0f172b] leading-relaxed" style={{ fontWeight: 500 }}>
                                    &ldquo;{highlight.professionalVersion}&rdquo;
                                  </div>
                                </div>
                                <p className="text-[10px] text-[#92400e] mt-2" style={{ fontWeight: 500 }}>
                                  Technique: {highlight.technique}
                                </p>
                              </div>
                            )}

                            {/* Ver informe button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setViewingReport(i);
                              }}
                              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#0f172b] text-white text-sm hover:bg-[#1d293d] transition-colors"
                              style={{ fontWeight: 500 }}
                            >
                              <FileText className="w-4 h-4" />
                              View full report
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <MiniFooter />

      {/* ── Report overlay ── */}
      <AnimatePresence>
        {viewingReport !== null && practices[viewingReport] && (() => {
          const practice = practices[viewingReport];
          const detectedType = detectScenarioType(practice.title);
          return (
            <motion.div
              className="fixed inset-0 z-[100] bg-[#f0f4f8] overflow-y-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Report header */}
              <header className="sticky top-0 z-50 bg-white border-b border-[#e2e8f0]">
                <div className="max-w-[860px] mx-auto flex items-center justify-between px-6 h-16">
                  <button
                    onClick={() => setViewingReport(null)}
                    className="flex items-center gap-1.5 text-sm text-[#45556c] hover:text-[#0f172b] transition-colors"
                    style={{ fontWeight: 500 }}
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to history
                  </button>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#62748e]">{practice.date}</span>
                    <span className="text-xs bg-[#f1f5f9] text-[#62748e] px-2 py-0.5 rounded-full" style={{ fontWeight: 500 }}>
                      {practice.tag}
                    </span>
                  </div>
                </div>
              </header>

              {/* Report content */}
              <SessionReport
                scenarioType={detectedType}
                guidedFields={{}}
                realFeedback={practice.rawSession?.feedback as any}
                sessionSummary={practice.rawSession?.summary as any}
                improvedScript={practice.rawSession?.improvedScript as any}
                interviewBriefing={practice.rawSession?.interviewBriefing as any}
                sessionDuration={practice.duration}
                interlocutor={practice.tag}
                scenario={practice.title}
                onFinish={() => setViewingReport(null)}
                finishLabel="Back to history"
              />
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}