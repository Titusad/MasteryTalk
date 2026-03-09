import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  Mic,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  FileText,
  Play,
  Volume2,
  AudioLines,
  Check,
  PenLine,
  Info,
  ArrowLeft,
  ClipboardPaste,
  Sparkles,
  ChevronDown,
  RotateCcw,
  Trophy,
  Target,
  Zap,
  Briefcase,
  MessageSquare,
  Handshake,
  Users,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  BrandLogo,
  COLORS,
  PastelBlobs,
  MiniFooter,
  RecordButton,
  RecordingTimer,
  HighlightWithTooltip,
  AnalyzingScreen,
  PageTitleBlock,
  highlightEnglish,
} from "./shared";
import { realConversationService, realSpeechService } from "../../services";
import { toServiceError } from "../../services/errors";
import type { ServiceError } from "../../services/errors";
import { ServiceErrorBanner } from "./shared/ServiceErrorBanner";
import { getTrySaying, getBeforeAfterForScenario, getStrengthsForScenario, getOpportunitiesForScenario, getPowerPhrasesForScenario, getPowerQuestions } from "../../services/scenario-data";
import { useMediaRecorder } from "../hooks/useMediaRecorder";
import { projectId, publicAnonKey } from "../../../utils/supabase/info";
import { BeforeAfterSection } from "./arena/BriefingRoom";
import type {
  ChatMessage,
  ScenarioType,
  ScriptSection,
  UserPlan,
  CreditPack,
} from "../../services/types";

/* ── Coaching Cue Formatter ──
   Detects coaching directives at the start of paragraph text
   and wraps them in indigo semibold for visual hierarchy. */
const COACHING_CUE_PATTERN = /^(Here's how you[^.:\n]*[:.:]|You'll want to[^.:\n]*[:.:]|Start by[^.:\n]*[:.:]|Lead with[^.:\n]*[:.:]|Open with[^.:\n]*[:.:]|Make sure to[^.:\n]*[:.:]|Try saying[^.:\n]*[:.:]|Your goal here is[^.:\n]*[:.:]|When they[^.:\n]*[:.:]|If they[^.:\n]*[:.:]|Pivot (?:to|by)[^.:\n]*[:.:]|Close by[^.:\n]*[:.:]|Wrap up by[^.:\n]*[:.:]|End with[^.:\n]*[:.:]|This positions you[^.:\n]*[:.:]|This is where you[^.:\n]*[:.:]|Now,?\s+(?:transition|shift|pivot|move)[^.:\n]*[:.:])/i;

function formatCoachingCues(text: string): React.ReactNode {
  const match = text.match(COACHING_CUE_PATTERN);
  if (!match) return text;
  const cue = match[0];
  const rest = text.slice(cue.length);
  return (
    <>
      <span className="text-[#6366f1]" style={{ fontWeight: 600 }}>{cue}</span>
      {rest}
    </>
  );
}

import { SessionProgressBar } from "./SessionProgressBar";
import { SessionReport } from "./SessionReport";

/* ── TTS Narration Hook ──
   Narrates script sections via ElevenLabs TTS with role-based tonality.
   Decomposes each section into ordered segments:
     "coach"     → warm, supportive narration (body text, coaching cues, suffixes)
     "user_line" → confident, assertive delivery (highlight phrases the user should say)
   Caches audio blobs in memory keyed by segment — replay is instant.
   Prefetches the next segment while current one plays. */

type NarrationSegment = { text: string; role: "coach" | "user_line"; sectionNum: number; paragraphIdx: number };

function useBriefingNarration(sections: ScriptSection[]) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeSection, setActiveSection] = useState<number | null>(null);
  const [activeParagraph, setActiveParagraph] = useState<{ sectionNum: number; paraIdx: number } | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const queueIndexRef = useRef(0);
  /* In-memory audio cache: cacheKey → blob URL */
  const cacheRef = useRef<Map<string, string>>(new Map());

  /* Decompose all sections into a flat ordered list of segments with roles */
  const allSegments = useMemo((): NarrationSegment[] => {
    const segs: NarrationSegment[] = [];
    for (const section of sections) {
      // Section title → coach narration (paragraphIdx -1 = title, not a real paragraph)
      segs.push({ text: `Section ${section.num}: ${section.title}.`, role: "coach", sectionNum: section.num, paragraphIdx: -1 });
      for (const [pi, p] of section.paragraphs.entries()) {
        // Body text → coach (includes coaching cues naturally)
        if (p.text?.trim()) {
          segs.push({ text: p.text.trim(), role: "coach", sectionNum: section.num, paragraphIdx: pi });
        }
        // Highlight phrases → user_line (what the user should say)
        if (p.highlights?.length) {
          const userText = p.highlights.map((h) => h.phrase).join(". ");
          if (userText.trim()) {
            segs.push({ text: userText.trim(), role: "user_line", sectionNum: section.num, paragraphIdx: pi });
          }
        }
        // Suffix text → coach
        if (p.suffix?.trim()) {
          segs.push({ text: p.suffix.trim(), role: "coach", sectionNum: section.num, paragraphIdx: pi });
        }
      }
    }
    return segs;
  }, [sections]);

  const fetchAudio = useCallback(async (text: string, role: string, signal: AbortSignal): Promise<string> => {
    const url = `https://${projectId}.supabase.co/functions/v1/make-server-08b8658d/tts`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${publicAnonKey}` },
      body: JSON.stringify({ text, role }),
      signal,
    });
    if (!res.ok) throw new Error(`TTS ${res.status}: ${await res.text()}`);
    const blob = await res.blob();
    return URL.createObjectURL(blob);
  }, []);

  /* Cache key for a segment */
  const segKey = useCallback((seg: NarrationSegment, idx: number) =>
    `${seg.sectionNum}-${idx}-${seg.role}`, []);

  /* Get audio URL — from cache or fetch (and cache) */
  const getSegAudio = useCallback(async (seg: NarrationSegment, idx: number, signal: AbortSignal): Promise<string> => {
    const key = segKey(seg, idx);
    const cached = cacheRef.current.get(key);
    if (cached) { console.log(`[TTS Cache] HIT ${key}`); return cached; }
    console.log(`[TTS Cache] MISS ${key} (role=${seg.role}, ${seg.text.length} chars)`);
    const blobUrl = await fetchAudio(seg.text, seg.role, signal);
    cacheRef.current.set(key, blobUrl);
    return blobUrl;
  }, [fetchAudio, segKey]);

  /* Prefetch next segment while current one plays */
  const prefetch = useCallback((seg: NarrationSegment, idx: number) => {
    if (cacheRef.current.has(segKey(seg, idx))) return;
    const c = new AbortController();
    getSegAudio(seg, idx, c.signal).catch(() => { });
  }, [getSegAudio, segKey]);

  const playFromIndex = useCallback(async (startIndex: number) => {
    const controller = new AbortController();
    abortRef.current = controller;
    for (let i = startIndex; i < allSegments.length; i++) {
      if (controller.signal.aborted) break;
      queueIndexRef.current = i;
      const seg = allSegments[i];
      setActiveSection(seg.sectionNum);
      if (seg.paragraphIdx >= 0) {
        setActiveParagraph({ sectionNum: seg.sectionNum, paraIdx: seg.paragraphIdx });
      }
      try {
        const isCached = cacheRef.current.has(segKey(seg, i));
        if (!isCached) setIsLoading(true);
        const audioUrl = await getSegAudio(seg, i, controller.signal);
        if (controller.signal.aborted) break;
        setIsLoading(false);
        /* Prefetch the NEXT segment while this one plays */
        if (i + 1 < allSegments.length) prefetch(allSegments[i + 1], i + 1);
        await new Promise<void>((resolve, reject) => {
          const audio = new Audio(audioUrl);
          audioRef.current = audio;
          audio.onended = () => { resolve(); };
          audio.onerror = () => { reject(new Error("Audio playback error")); };
          controller.signal.addEventListener("abort", () => { audio.pause(); resolve(); }, { once: true });
          audio.play().catch(reject);
        });
      } catch (err: any) {
        if (err.name === "AbortError" || controller.signal.aborted) break;
        console.error("[TTS Narration]", err);
        break;
      }
    }
    setIsPlaying(false);
    setIsLoading(false);
    setActiveSection(null);
    setActiveParagraph(null);
    audioRef.current = null;
  }, [allSegments, getSegAudio, prefetch, segKey]);

  const play = useCallback(() => { setIsPlaying(true); playFromIndex(0); }, [playFromIndex]);
  const pause = useCallback(() => {
    abortRef.current?.abort();
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    setIsPlaying(false); setIsLoading(false); setActiveSection(null); setActiveParagraph(null);
  }, []);
  const togglePlayPause = useCallback(() => { isPlaying ? pause() : play(); }, [isPlaying, play, pause]);

  /* Skip to next SECTION (jumps all remaining segments in current section) */
  const skipNext = useCallback(() => {
    if (!isPlaying) return;
    const curNum = allSegments[queueIndexRef.current]?.sectionNum;
    const nextIdx = allSegments.findIndex((s, i) => i > queueIndexRef.current && s.sectionNum !== curNum);
    if (nextIdx === -1) { pause(); return; }
    abortRef.current?.abort();
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    setIsLoading(false);
    playFromIndex(nextIdx);
  }, [isPlaying, allSegments, pause, playFromIndex]);

  const skipPrev = useCallback(() => {
    if (!isPlaying) return;
    const curNum = allSegments[queueIndexRef.current]?.sectionNum;
    let prevStart = 0;
    for (let i = queueIndexRef.current - 1; i >= 0; i--) {
      if (allSegments[i].sectionNum !== curNum) {
        const prevNum = allSegments[i].sectionNum;
        prevStart = allSegments.findIndex((s) => s.sectionNum === prevNum);
        break;
      }
    }
    abortRef.current?.abort();
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    setIsLoading(false);
    playFromIndex(prevStart);
  }, [isPlaying, allSegments, playFromIndex]);

  /* Cleanup: revoke all cached blob URLs on unmount */
  useEffect(() => {
    const cache = cacheRef.current;
    return () => {
      abortRef.current?.abort();
      audioRef.current?.pause();
      cache.forEach((url) => URL.revokeObjectURL(url));
      cache.clear();
    };
  }, []);

  return { isPlaying, isLoading, activeSection, activeParagraph, togglePlayPause, skipNext, skipPrev };
}
import type { Step } from "./shared/session-types";
import { CreditUpsellModal } from "./CreditUpsellModal";
import { useUsageGating } from "../hooks/useUsageGating";
import type { PaywallReason } from "../hooks/useUsageGating";
import type { MarketFocus } from "../../services/prompts";

/* ═══════════════════════════════════════════════════════════
   TYPES & DATA (MVP-simplified)
   ═══════════════════════════════════════════════════════════ */

interface PracticeSessionPageProps {
  scenario: string;
  interlocutor: string;
  scenarioType?: ScenarioType;
  guidedFields?: Record<string, string>;
  marketFocus?: MarketFocus | null;
  onFinish: () => void;
  onNewPractice?: () => void;
  userPlan?: UserPlan;
}

/** Repeat limits: free tier gets 1 repeat (2 total), paid gets 2 repeats (3 total) */
const MAX_REPEATS: Record<UserPlan, number> = {
  free: 1,
  "per-session": 2,
};

/** Info passed to ConversationFeedback for repeat UI */
export interface RepeatInfo {
  /** Current attempt number (1-based) */
  attempt: number;
  /** Maximum attempts allowed for this scenario */
  maxAttempts: number;
  /** Whether the user can practice again */
  canRepeat: boolean;
}

const SCENARIO_LABELS_MAP: Record<string, string> = {
  sales: "Sales Pitch",
  interview: "Job Interview",
  csuite: "Executive Presentation",
  negotiation: "Negotiation",
  networking: "Networking",
};

/* ═══════════════════════════════════════════════════════════
   PRE-BRIEFING: Narrative script / conversation strategy
   ═══════════════════════════════════════════════════════════ */

function PreBriefingScreen({
  scenarioType,
  interlocutor,
  onStartSimulation,
  onBack,
  generatedSections,
}: {
  scenarioType?: ScenarioType;
  interlocutor: string;
  onStartSimulation: () => void;
  onBack: () => void;
  generatedSections: ScriptSection[];
}) {
  /* Always use AI-generated sections — no mock fallback */
  const scriptSections = generatedSections;
  const [isEditing, setIsEditing] = useState(false);

  /* TTS Narration */
  const narration = useBriefingNarration(scriptSections);

  /* Narrative structure label per scenario */
  const narrativeLabels: Record<string, string> = {
    sales: "Opening → Objection handling → Close with value",
    interview: "Personal pitch → STAR Story → Strategic close",
    csuite: "Executive summary → Data-backed support → Call to decision",
    negotiation: "Position → Counter-offer → Conditional close",
    networking: "Elevator pitch → Value exchange → Follow-up hook",
  };
  const narrativeStructure = scenarioType
    ? narrativeLabels[scenarioType] ?? "Apertura → Desarrollo → Cierre"
    : "Apertura → Desarrollo → Cierre";

  return (
    <div
      className="w-full min-h-full flex flex-col bg-[#f0f4f8] relative overflow-hidden"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <PastelBlobs />

      <main className="relative w-full max-w-[800px] mx-auto px-6 pt-12 pb-20">
        {/* Title */}
        <PageTitleBlock
          icon={<FileText className="w-8 h-8 text-white" />}
          title="Your Conversation Script"
          subtitle="A structured script gives you clarity and confidence — turn your ideas into a persuasive and natural message."
        />

        {/* 1. Narrative Structure Badge */}
        <motion.div
          className="flex items-center gap-3 mb-8"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.03 }}
        >
          <div className="w-8 h-8 rounded-xl bg-[#0f172b] flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm text-[#45556c]" style={{ fontWeight: 500 }}>Narrative structure</p>
            <p className="text-sm text-[#0f172b]" style={{ fontWeight: 600 }}>
              {narrativeStructure}
            </p>
          </div>
        </motion.div>

        {/* 2. Highlight Legend */}
        <motion.div
          className="flex items-center gap-4 mb-8 flex-wrap"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
        >
          {[
            { color: COLORS.softPurple, label: "Structure" },
            { color: COLORS.peach, label: "Impact" },
            { color: COLORS.blue, label: "Engagement" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: item.color }} />
              <span className="text-sm text-[#45556c]" style={{ fontWeight: 500 }}>{item.label}</span>
            </div>
          ))}
          <span className="text-sm text-[#62748e] italic">— Hover over text for tips</span>
        </motion.div>

        {/* 2.5 Narration Player */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.06 }}
        >
          <div className={`flex items-center gap-3 px-5 py-3 rounded-2xl border transition-all ${narration.isPlaying
            ? "bg-[#eef2ff] border-[#6366f1]/30 shadow-sm"
            : "bg-white border-[#e2e8f0] hover:border-[#c7d2e0]"
            }`}>
            {/* Play / Pause */}
            <button
              onClick={narration.togglePlayPause}
              disabled={narration.isLoading && !narration.isPlaying}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shrink-0 ${narration.isPlaying
                ? "bg-[#6366f1] text-white shadow-md"
                : "bg-[#0f172b] text-white hover:bg-[#1d293d]"
                }`}
            >
              {narration.isLoading && !narration.isPlaying ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : narration.isPlaying ? (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><rect x="1" y="0" width="4" height="14" rx="1" /><rect x="9" y="0" width="4" height="14" rx="1" /></svg>
              ) : (
                <Play className="w-4 h-4 ml-0.5" />
              )}
            </button>

            <div className="flex-1 min-w-0">
              <p className="text-sm text-[#0f172b] truncate" style={{ fontWeight: 600 }}>
                {narration.isPlaying
                  ? `Listening — Section ${narration.activeSection} of ${scriptSections.length}`
                  : "Listen to Briefing"
                }
              </p>
              <p className="text-xs text-[#62748e]">
                {narration.isPlaying
                  ? narration.isLoading ? "Loading audio…" : "Coach is speaking"
                  : "Your coach narrates the strategy for you"
                }
              </p>
            </div>

            {/* Skip Controls (only when playing) */}
            {narration.isPlaying && (
              <div className="flex items-center gap-1">
                <button
                  onClick={narration.skipPrev}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[#45556c] hover:bg-[#f1f5f9] transition-colors"
                  title="Previous section"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="19 20 9 12 19 4 19 20" /><line x1="5" y1="19" x2="5" y2="5" /></svg>
                </button>
                <button
                  onClick={narration.skipNext}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[#45556c] hover:bg-[#f1f5f9] transition-colors"
                  title="Next section"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 4 15 12 5 20 5 4" /><line x1="19" y1="5" x2="19" y2="19" /></svg>
                </button>
              </div>
            )}

            {/* Waveform indicator when playing */}
            {narration.isPlaying && !narration.isLoading && (
              <div className="flex items-end gap-[3px] h-5 shrink-0">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-[3px] bg-[#6366f1] rounded-full animate-speaking-bar"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* 3. Script Sections */}
        <motion.div
          className="bg-white rounded-3xl border border-[#e2e8f0] p-8 mb-8 space-y-10 relative"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08 }}
        >
          {/* Edit toggle */}
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`absolute -top-4 right-6 z-10 flex items-center gap-2 px-4 py-1.5 rounded-full text-sm shadow-sm transition-all ${isEditing
              ? "bg-[#dcfce7] text-[#15803d] border border-[#bbf7d0]"
              : "bg-white border border-[#e2e8f0] text-[#45556c] hover:bg-[#f8fafc]"
              }`}
            style={{ fontWeight: 500 }}
          >
            {isEditing ? (
              <>
                <Check className="w-3.5 h-3.5" />
                Save changes
              </>
            ) : (
              <>
                <PenLine className="w-3.5 h-3.5" />
                Edit script
              </>
            )}
          </button>

          {scriptSections.map((section, si) => {
            const isSpeaking = narration.activeSection === section.num;
            return (
              <motion.div
                key={section.num}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 + si * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className={`rounded-2xl transition-all duration-500 ${isSpeaking
                  ? "border-l-[3px] border-l-[#6366f1] pl-5 bg-[#f5f3ff]/40"
                  : "border-l-[3px] border-l-transparent pl-5"
                  }`}
              >
                <div className="flex items-center gap-3 mb-5">
                  <span
                    className="w-8 h-8 rounded-xl bg-[#6366f1]/10 flex items-center justify-center text-sm text-[#6366f1]"
                    style={{ fontWeight: 700 }}
                  >
                    {section.num}
                  </span>
                  <h3
                    className="text-xl text-[#0f172b]"
                    style={{ fontWeight: 600 }}
                  >
                    {section.title}
                  </h3>
                </div>
                <div className="space-y-4">
                  {section.paragraphs.map((p, pi) => {
                    const isActivePara = narration.isPlaying &&
                      narration.activeParagraph?.sectionNum === section.num &&
                      narration.activeParagraph?.paraIdx === pi;
                    const isDimmed = narration.isPlaying && !isActivePara;
                    return (
                      <p
                        key={pi}
                        className={`text-[#314158] leading-relaxed transition-all duration-500 ${isEditing
                          ? "bg-[#f8fafc] rounded-xl px-4 py-3 border border-[#e2e8f0] focus:outline-none focus:border-[#6366f1] transition-colors"
                          : isActivePara
                            ? "bg-[#eef2ff]/60 rounded-xl px-4 py-3 ring-2 ring-[#6366f1]/30 shadow-sm"
                            : isDimmed
                              ? "opacity-40"
                              : ""
                          }`}
                        contentEditable={isEditing}
                        suppressContentEditableWarning
                      >
                        {formatCoachingCues(p.text)}
                        {p.highlights?.map((h, hi) => (
                          <HighlightWithTooltip
                            key={hi}
                            phrase={h.phrase}
                            color={h.color}
                            tooltip={h.tooltip}
                          />
                        ))}
                        {p.suffix}
                      </p>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </motion.div>



        {/* CTA: Start Simulation */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="bg-gradient-to-br from-[#f0f9ff] to-[#eef2ff] rounded-3xl border border-[#bfdbfe]/50 p-10 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-[#0f172b] flex items-center justify-center mx-auto mb-6">
              <Mic className="w-8 h-8 text-white" />
            </div>
            <h3
              className="text-2xl md:text-[28px] text-[#0f172b] mb-3"
              style={{ fontWeight: 300, lineHeight: 1.3 }}
            >
              Want to practice your conversation?
            </h3>
            <p className="text-[#45556c] text-lg max-w-md mx-auto mb-8">
              Put this script into practice in a realistic AI conversation to get feedback.
            </p>
            <button
              onClick={onStartSimulation}
              className="bg-[#0f172b] text-white px-10 py-5 rounded-full flex items-center gap-3 shadow-lg hover:bg-[#1d293d] transition-colors text-xl mx-auto"
              style={{ fontWeight: 500 }}
            >
              <Play className="w-5 h-5" />
              Start Practice
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={onBack}
              className="mt-4 text-sm text-[#45556c] hover:text-[#0f172b] transition-colors mx-auto block"
            >
              ← Back to strategy
            </button>
          </div>
          <p className="text-sm text-[#45556c]/70">
            Estimated reading time:{" "}
            <span style={{ fontWeight: 500 }}>
              {Math.max(2, Math.ceil(scriptSections.reduce((acc, s) => acc + s.paragraphs.length, 0) * 0.8))} min
            </span>
          </p>
        </motion.div>
      </main>
      <MiniFooter />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   VOICE PRACTICE — Real voice pipeline:
   MediaRecorder → Whisper STT → GPT-4o → ElevenLabs TTS
   ═══════════════════════════════════════════════════════════ */

function VoicePractice({
  interlocutor,
  sessionId,
  scenarioType,
  onViewFeedback,
  onEnd,
}: {
  interlocutor: string;
  sessionId: string;
  scenarioType?: ScenarioType;
  onViewFeedback: () => void;
  onEnd: () => void;
}) {
  /* Chat state */
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConversationComplete, setIsConversationComplete] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [revealingMsgIndex, setRevealingMsgIndex] = useState<number | null>(null);
  const [revealedWords, setRevealedWords] = useState(0);
  const [playingMsgIndex, setPlayingMsgIndex] = useState<number | null>(null);
  const [voiceError, setVoiceError] = useState<ServiceError | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatScrollAreaRef = useRef<HTMLDivElement>(null);
  const revealIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastScrolledMsgCount = useRef(0);

  /* ── Real MediaRecorder hook ── */
  const recorder = useMediaRecorder();

  /* ── TTS: play AI message via ElevenLabs ── */
  const ttsAudioRef = useRef<HTMLAudioElement | null>(null);
  const [isTtsPlaying, setIsTtsPlaying] = useState(false);
  /** Track which message index is currently being TTS-played → skip typewriter for it */
  const ttsTargetMsgRef = useRef<number | null>(null);
  /** Guard against double-tap mic submissions */
  const isSubmittingRef = useRef(false);

  const playAiTts = useCallback(async (text: string, msgIndex?: number) => {
    try {
      setIsTtsPlaying(true);
      if (msgIndex !== undefined) ttsTargetMsgRef.current = msgIndex;
      const ttsUrl = `https://${projectId}.supabase.co/functions/v1/make-server-08b8658d/tts`;
      const res = await fetch(ttsUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${publicAnonKey}` },
        body: JSON.stringify({ text, role: "user_line" }),
      });
      if (!res.ok) {
        console.error(`[VoicePractice TTS] Error ${res.status}`);
        setIsTtsPlaying(false);
        return;
      }
      const blob = await res.blob();
      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);
      ttsAudioRef.current = audio;
      audio.onended = () => {
        setIsTtsPlaying(false);
        ttsTargetMsgRef.current = null;
        URL.revokeObjectURL(audioUrl);
        ttsAudioRef.current = null;
      };
      audio.onerror = () => {
        setIsTtsPlaying(false);
        URL.revokeObjectURL(audioUrl);
        ttsAudioRef.current = null;
      };
      await audio.play().catch(() => setIsTtsPlaying(false));
    } catch {
      setIsTtsPlaying(false);
    }
  }, []);

  /* Load first message via REAL conversationService on mount */
  useEffect(() => {
    let cancelled = false;
    setIsAiTyping(true);

    realConversationService.getSessionMessages(sessionId).then((msgs) => {
      if (cancelled) return;
      setTimeout(() => {
        if (cancelled) return;
        setIsAiTyping(false);
        if (msgs.length > 0) {
          setMessages(msgs);
          // Play TTS for the first AI message — pass index so typewriter is skipped
          const firstAiIdx = msgs.findIndex(m => m.role === "ai");
          if (firstAiIdx >= 0) playAiTts(msgs[firstAiIdx].text, firstAiIdx);
        }
      }, 800);
    }).catch((err) => {
      if (cancelled) return;
      setIsAiTyping(false);
      setVoiceError(toServiceError(err));
    });

    return () => { cancelled = true; };
  }, [sessionId, playAiTts]);

  /* Typewriter effect for the last AI message — SKIPPED when TTS is playing
     to keep audio and text in sync (audio plays immediately, text shows fully) */
  useEffect(() => {
    if (messages.length === 0) return;
    const lastIdx = messages.length - 1;
    const lastMsg = messages[lastIdx];
    if (lastMsg?.role !== "ai") {
      setRevealingMsgIndex(null);
      return;
    }

    // If TTS is targeting this message, skip typewriter → show text immediately
    if (ttsTargetMsgRef.current === lastIdx || isTtsPlaying) {
      setRevealingMsgIndex(null);
      setRevealedWords(lastMsg.text.length);
      return;
    }

    if (revealIntervalRef.current) {
      clearInterval(revealIntervalRef.current);
      revealIntervalRef.current = null;
    }

    const totalChars = lastMsg.text.length;
    setRevealingMsgIndex(lastIdx);
    setRevealedWords(0);
    let count = 0;

    const msPerChar = 35;
    revealIntervalRef.current = setInterval(() => {
      count += 1;
      setRevealedWords(count);
      if (count >= totalChars) {
        if (revealIntervalRef.current) clearInterval(revealIntervalRef.current);
        revealIntervalRef.current = null;
        setRevealingMsgIndex(null);
      }
    }, msPerChar);

    return () => {
      if (revealIntervalRef.current) {
        clearInterval(revealIntervalRef.current);
        revealIntervalRef.current = null;
      }
      setRevealingMsgIndex(null);
    };
  }, [messages.length, isTtsPlaying]);

  /* Smart scroll */
  const smoothScrollToBottom = useCallback(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, []);

  useEffect(() => {
    if (messages.length !== lastScrolledMsgCount.current) {
      lastScrolledMsgCount.current = messages.length;
      requestAnimationFrame(() => smoothScrollToBottom());
    }
  }, [messages.length, smoothScrollToBottom]);

  useEffect(() => {
    smoothScrollToBottom();
  }, [isProcessing, isAiTyping, smoothScrollToBottom]);

  const lastTypewriterScrollRef = useRef(0);
  useEffect(() => {
    if (revealingMsgIndex === null) return;
    const now = Date.now();
    if (now - lastTypewriterScrollRef.current < 350) return;
    lastTypewriterScrollRef.current = now;
    const area = chatScrollAreaRef.current;
    if (!area) return;
    const distFromBottom = area.scrollHeight - area.scrollTop - area.clientHeight;
    if (distFromBottom < 150) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [revealedWords, revealingMsgIndex]);

  /* Handle mic error from recorder hook */
  useEffect(() => {
    if (recorder.error) {
      setVoiceError(toServiceError(new Error(recorder.error), "MICROPHONE_DENIED"));
    }
  }, [recorder.error]);

  /* Handle recording start */
  const handleRecordingStart = useCallback(async () => {
    setVoiceError(null);
    // Stop any TTS playing
    if (ttsAudioRef.current) {
      ttsAudioRef.current.pause();
      ttsAudioRef.current = null;
      setIsTtsPlaying(false);
    }
    await recorder.start();
  }, [recorder]);

  /* Handle recording stop — REAL pipeline: record → Whisper → GPT-4o → TTS */
  const handleRecordingStop = useCallback(async () => {
    if (!recorder.isRecording) return;
    // Guard against double-tap submissions
    if (isSubmittingRef.current) return;

    if (recorder.recordingTime < 500) {
      await recorder.stop();
      return;
    }

    isSubmittingRef.current = true;
    setIsProcessing(true);

    try {
      // 1. Stop recording → get audio Blob
      const audioBlob = await recorder.stop();
      if (!audioBlob || audioBlob.size < 100) {
        setIsProcessing(false);
        return;
      }

      console.log(`[VoicePractice] Recording stopped — ${audioBlob.size} bytes`);

      // 2. Send audio to Whisper for transcription
      const transcription = await realSpeechService.transcribeBlob(audioBlob);

      if (!transcription.text.trim()) {
        setIsProcessing(false);
        setVoiceError(toServiceError(new Error("Could not detect speech. Please try again."), "STT_EMPTY"));
        return;
      }

      const userMsg: ChatMessage = {
        role: "user",
        label: "You",
        time: new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
        text: transcription.text,
      };
      setMessages((prev) => [...prev, userMsg]);
      setIsProcessing(false);

      // 3. Send transcription to GPT-4o for AI response
      setIsAiTyping(true);
      const turnResult = await realConversationService.processTurn(sessionId, transcription.text);

      setIsAiTyping(false);
      setMessages((prev) => {
        const newMsgs = [...prev, turnResult.aiMessage];
        // 4. Play AI response via ElevenLabs TTS — pass the new message index
        if (turnResult.aiMessage.text) {
          playAiTts(turnResult.aiMessage.text, newMsgs.length - 1);
        }
        return newMsgs;
      });

      if (turnResult.isComplete) {
        setIsConversationComplete(true);
      }
    } catch (err) {
      setIsProcessing(false);
      setIsAiTyping(false);
      const serviceErr = toServiceError(err);
      console.error(`[VoicePractice] Error:`, serviceErr.code, serviceErr.message);
      setVoiceError(serviceErr);
    } finally {
      isSubmittingRef.current = false;
    }
  }, [recorder, sessionId, playAiTts]);

  const canViewFeedback = isConversationComplete && revealingMsgIndex === null;
  const micDisabled = isConversationComplete || isProcessing || isAiTyping;

  /* Cleanup TTS on unmount */
  useEffect(() => {
    return () => {
      ttsAudioRef.current?.pause();
      ttsAudioRef.current = null;
    };
  }, []);

  return (
    <div className="flex flex-col h-[calc(100dvh-4rem)] relative" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Arena sub-toolbar */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-[#e2e8f0]/60 px-6 py-2">
        <div className="max-w-[700px] mx-auto flex items-center justify-between">
          <span className="text-sm text-[#45556c]">
            {scenarioType ? SCENARIO_LABELS_MAP[scenarioType] ?? "Practice" : "Sales Pitch"} · {interlocutor}
          </span>
          <div className="flex items-center gap-2">
            {isTtsPlaying && (
              <span className="flex items-center gap-1.5 text-xs text-[#50C878] bg-[#f0fdf4] px-2.5 py-1 rounded-full" style={{ fontWeight: 500 }}>
                <div className="flex items-end gap-[2px] h-3">
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="w-[2px] bg-[#50C878] rounded-full animate-speaking-bar"
                      style={{ animationDelay: `${i * 0.12}s` }}
                    />
                  ))}
                </div>
                AI Speaking
              </span>
            )}
            <span className="text-xs text-[#62748e] bg-[#f1f5f9] px-3 py-1 rounded-full" style={{ fontWeight: 500 }}>
              Live Conversation
            </span>
          </div>
        </div>
      </div>

      {/* Inline error banner */}
      <ServiceErrorBanner
        error={voiceError}
        onRetry={() => setVoiceError(null)}
        onDismiss={() => setVoiceError(null)}
        onNavigate={onEnd}
        compact
        className="max-w-[700px] mx-auto px-6 pt-3"
      />

      {/* Chat area */}
      <div ref={chatScrollAreaRef} className="flex-1 bg-[#f8fafc] overflow-y-auto relative scroll-smooth">
        <PastelBlobs />
        <div className="relative max-w-[700px] mx-auto px-6 py-8 space-y-6" style={{ overflowAnchor: "none" }}>
          {/* Voice conversation banner */}
          <motion.div
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-full mx-auto w-fit"
            style={{ background: "linear-gradient(135deg, rgba(0,211,243,0.08), rgba(80,200,120,0.08))", border: "1px solid rgba(80,200,120,0.15)" }}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <AudioLines className="w-3.5 h-3.5 text-[#50C878]" />
            <span className="text-xs text-[#4B505B]" style={{ fontWeight: 500 }}>
              Voice conversation — AI speaks, you respond with your microphone
            </span>
          </motion.div>

          {messages.map((msg, i) => {
            const isRevealing = revealingMsgIndex === i;
            const isPlaying = playingMsgIndex === i;
            const aiFullyRevealed = msg.role === "ai" && !isRevealing;
            const displayText = isRevealing
              ? msg.text.slice(0, revealedWords)
              : msg.text;

            const trySaying = msg.role === "ai" ? getTrySaying(scenarioType, msg.text) : null;
            const isLatestAiMsg = msg.role === "ai" && (() => {
              for (let j = messages.length - 1; j >= 0; j--) {
                if (messages[j].role === "ai") return j === i;
              }
              return false;
            })();

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
                className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
              >
                <span className="text-xs text-[#62748e] mb-2 flex items-center gap-1.5">
                  {msg.role === "ai" ? (
                    <Volume2 className="w-3 h-3" />
                  ) : (
                    <Mic className="w-3 h-3" />
                  )}
                  {msg.label} · {msg.time}
                </span>
                <div
                  className={`rounded-2xl px-6 py-4 max-w-[600px] transition-all duration-300 ${msg.role === "user"
                    ? "bg-[#0f172b] text-white"
                    : "bg-white border border-[#e2e8f0] text-[#0f172b]"
                    }`}
                >
                  <p className="leading-relaxed">
                    {displayText}
                    {isRevealing && (
                      <span
                        className="inline-block w-[2px] h-[1em] ml-0.5 align-text-bottom rounded-full animate-cursor-blink"
                        style={{ background: "linear-gradient(to bottom, #00D3F3, #50C878)" }}
                      />
                    )}
                  </p>
                </div>

                {/* Replay button */}
                <AnimatePresence>
                  {msg.role === "ai" && aiFullyRevealed && (
                    <motion.button
                      key="replay"
                      className="mt-1.5 flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] transition-colors"
                      style={{
                        fontWeight: 500,
                        color: isPlaying ? "#50C878" : "#94a3b8",
                        background: isPlaying ? "rgba(80,200,120,0.08)" : "rgba(80,200,120,0)",
                        border: isPlaying ? "1px solid rgba(80,200,120,0.2)" : "1px solid rgba(80,200,120,0)",
                      }}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.2 }}
                      whileHover={{ color: "#50C878", background: "rgba(80,200,120,0.06)" }}
                      onClick={() => {
                        setPlayingMsgIndex(i);
                        playAiTts(msg.text);
                        setTimeout(() => setPlayingMsgIndex(null), 5000);
                      }}
                    >
                      {isPlaying ? (
                        <>
                          <span className="flex items-center gap-[2px]">
                            {[0, 1, 2, 3].map((bar) => (
                              <span
                                key={bar}
                                className="inline-block w-[2px] rounded-full animate-eq-bar"
                                style={{ background: "#50C878", animationDelay: `${bar * 0.1}s` }}
                              />
                            ))}
                          </span>
                          Playing...
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3 h-3" />
                          Listen again
                        </>
                      )}
                    </motion.button>
                  )}
                </AnimatePresence>

                {msg.role === "user" && (
                  <span className="text-[10px] text-[#94a3b8] mt-1 flex items-center gap-1">
                    <Mic className="w-2.5 h-2.5" />
                    Voice transcription
                  </span>
                )}

                {/* "Try saying..." hint */}
                <AnimatePresence>
                  {isLatestAiMsg && trySaying && aiFullyRevealed && (
                    <motion.div
                      key="try-saying"
                      className="mt-3 w-full bg-[#f0fdf4] border border-[#b9f8cf] rounded-xl px-4 py-3 overflow-hidden"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.35, delay: 0.2, ease: [0.25, 1, 0.5, 1] }}
                    >
                      <p className="text-xs text-[#15803d]" style={{ fontWeight: 500 }}>
                        🧠 Try saying: <span className="text-[#0f172b]" style={{ fontWeight: 600 }}>{trySaying.starter}</span>
                      </p>
                      <p className="text-[10px] text-[#45556c] mt-0.5">{trySaying.why}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}

          {/* AI speaking indicator */}
          <AnimatePresence>
            {isAiTyping && (
              <motion.div
                key="ai-typing"
                className="flex flex-col items-start"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
              >
                <span className="text-xs text-[#62748e] mb-2 flex items-center gap-1.5">
                  <Volume2 className="w-3 h-3" />
                  {interlocutor} · thinking...
                </span>
                <div className="bg-white border border-[#e2e8f0] rounded-2xl px-6 py-4">
                  <div className="flex gap-1 items-center h-5">
                    {[0, 1, 2, 3, 4].map((bar) => (
                      <div
                        key={bar}
                        className="w-[3px] rounded-full animate-speaking-bar"
                        style={{
                          background: "linear-gradient(to top, #00D3F3, #50C878)",
                          animationDelay: `${bar * 0.12}s`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Processing indicator */}
          <AnimatePresence>
            {isProcessing && (
              <motion.div
                key="processing"
                className="flex flex-col items-end"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
              >
                <span className="text-xs text-[#62748e] mb-2 flex items-center gap-1.5">
                  <Mic className="w-3 h-3" />
                  Transcribing...
                </span>
                <div className="bg-[#0f172b]/80 rounded-2xl px-6 py-4">
                  <div className="flex gap-1 items-center">
                    {[0, 1, 2, 3, 4].map((bar) => (
                      <div
                        key={bar}
                        className="w-[3px] rounded-full bg-white/70 animate-processing-bar"
                        style={{ animationDelay: `${bar * 0.1}s` }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={chatEndRef} style={{ overflowAnchor: "auto" }} />
        </div>
      </div>

      {/* Bottom controls */}
      <div className="bg-white border-t border-[#e2e8f0] relative flex-shrink-0">
        <div className="max-w-[700px] mx-auto px-6 py-2 flex flex-col items-center gap-1">
          {/* Recording waveform — REAL from AnalyserNode */}
          <div
            className="w-full flex flex-col items-center gap-2 overflow-hidden transition-all duration-200"
            style={{
              height: recorder.isRecording ? 56 : 0,
              opacity: recorder.isRecording ? 1 : 0,
            }}
          >
            <RecordingTimer timeMs={recorder.recordingTime} />
            <div className="flex items-center justify-center gap-[3px] h-6 w-full max-w-[400px] overflow-hidden">
              {recorder.waveformBars.map((h, i) => (
                <div
                  key={i}
                  className="w-[5px] rounded-full bg-gradient-to-t from-red-400 to-red-500"
                  style={{
                    height: `${h * 24}px`,
                    transition: "height 0.08s ease-out",
                  }}
                />
              ))}
            </div>
          </div>

          {/* Mic button */}
          <RecordButton
            isRecording={recorder.isRecording}
            onClick={() => {
              if (recorder.isRecording) {
                handleRecordingStop();
              } else {
                handleRecordingStart();
              }
            }}
            size="sm"
            label={
              recorder.isRecording
                ? "Recording — tap to stop"
                : isProcessing
                  ? undefined
                  : "Tap to speak"
            }
            disabled={micDisabled}
          />
          {/* Status hint */}
          <div className="h-5 flex items-center justify-center">
            {isProcessing && !recorder.isRecording && (
              <p className="text-sm text-[#45556c] animate-fade-in" style={{ fontWeight: 500 }}>
                Transcribing your response...
              </p>
            )}
            {!recorder.isRecording && !isProcessing && (
              <p className="text-xs text-[#62748e] text-center">
                {isConversationComplete
                  ? "Conversation complete — view your feedback below"
                  : "Respond naturally. There are no wrong answers."}
              </p>
            )}
          </div>

          {/* View feedback button */}
          {canViewFeedback && (
            <div className="w-full pt-4 mt-2 border-t border-[#e2e8f0]/70">
              <button
                onClick={onViewFeedback}
                className="w-full py-3.5 rounded-full flex items-center justify-center gap-2.5 transition-all shadow-lg bg-[#2d2d2d] text-white hover:bg-[#1a1a1a]"
                style={{ fontWeight: 500 }}
              >
                Analyze my presentation
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   CONVERSATION FEEDBACK — What worked, Key improvements,
   Power Phrases, Power Questions, Practice Again, Generate Report
   ═══════════════════════════════════════════════════════════ */

function ConversationFeedback({
  scenarioType,
  onGenerateReport,
  onPracticeAgain,
  repeatInfo,
  onPaywallTriggered,
  showPaywallOnRepeat,
}: {
  scenarioType?: ScenarioType;
  onGenerateReport: () => void;
  onPracticeAgain?: () => void;
  repeatInfo?: RepeatInfo;
  /** Called when practice-again hits the free tier limit */
  onPaywallTriggered?: (reason: PaywallReason) => void;
  /** If true, the "Practice Again" button opens paywall instead */
  showPaywallOnRepeat?: boolean;
}) {
  const scenarioLabel = scenarioType
    ? SCENARIO_LABELS_MAP[scenarioType] ?? "Practice"
    : "Sales Pitch";
  const beforeAfter = getBeforeAfterForScenario(scenarioType);
  const strengths = getStrengthsForScenario(scenarioType);
  const scenarioPhrases = Object.values(getPowerPhrasesForScenario(scenarioType)).flat();
  const powerQuestions = getPowerQuestions(scenarioType);

  return (
    <div
      className="w-full min-h-full flex flex-col bg-[#f0f4f8] relative overflow-hidden"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <PastelBlobs />

      <main className="relative max-w-[960px] mx-auto px-6 pt-12 pb-20">
        <PageTitleBlock
          icon={<CheckCircle2 className="w-8 h-8 text-white" />}
          title="Conversation Feedback"
          subtitle={scenarioLabel}
        />

        {/* ── 1. What worked well ── */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-full bg-[#0f172b] flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-[30px] text-[#0f172b]" style={{ fontWeight: 300 }}>
              What worked well
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {strengths.map((s, i) => (
              <motion.div
                key={i}
                className="bg-[#f0fdf4] border border-[#b9f8cf] rounded-2xl p-6"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.15 + i * 0.1 }}
              >
                <h3 className="text-lg text-[#0f172b] mb-3" style={{ fontWeight: 500 }}>
                  {s.title}
                </h3>
                <p className="text-[#314158] leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── 2. Key improvements (before/after) ── */}
        {beforeAfter.length > 0 && (
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-full bg-[#0f172b] flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-[30px] text-[#0f172b]" style={{ fontWeight: 300 }}>
                Key improvements
              </h2>
            </div>
            <p className="text-[#45556c] mb-6">
              These are more executive versions of what you said. Each correction includes the technique that makes it more effective.
            </p>
            <BeforeAfterSection comparisons={beforeAfter} />
          </motion.div>
        )}

        {/* ── 3. Power Phrases ── */}
        {scenarioPhrases.length > 0 && (
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-full bg-[#0f172b] flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-[30px] text-[#0f172b]" style={{ fontWeight: 300 }}>
                Power Phrases
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {scenarioPhrases.slice(0, 6).map((p, i) => (
                <motion.div
                  key={p.id}
                  className="bg-white border border-[#e2e8f0] rounded-2xl p-5"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.28 + i * 0.05 }}
                >
                  <p className="text-[#0f172b] mb-2" style={{ fontWeight: 500 }}>
                    "{p.phrase}"
                  </p>
                  <p className="text-sm text-[#45556c]">{p.context}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── 4. Power Questions ── */}
        {powerQuestions.length > 0 && (
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-full bg-[#0f172b] flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-[30px] text-[#0f172b]" style={{ fontWeight: 300 }}>
                Power Questions
              </h2>
            </div>
            <div className="space-y-4">
              {powerQuestions.slice(0, 5).map((q, i) => (
                <motion.div
                  key={i}
                  className="bg-white border border-[#e2e8f0] rounded-2xl p-5"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.33 + i * 0.05 }}
                >
                  <p className="text-[#0f172b] mb-2" style={{ fontWeight: 500 }}>
                    "{q.question}"
                  </p>
                  <span className="text-[10px] bg-[#6366f1]/10 text-[#6366f1] px-2.5 py-0.5 rounded-full" style={{ fontWeight: 600 }}>
                    {q.timing}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── 5. Practice Again / Mastery Nudge / Paywall ── */}
        {onPracticeAgain && repeatInfo && (
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
          >
            {repeatInfo.canRepeat ? (
              <div className="rounded-3xl bg-gradient-to-br from-[#eef2ff] to-[#f0f9ff] border border-[#bfdbfe]/50 p-8 text-center">
                <div className="w-14 h-14 rounded-full bg-[#6366f1]/10 flex items-center justify-center mx-auto mb-4">
                  <RotateCcw className="w-7 h-7 text-[#6366f1]" />
                </div>
                <h3 className="text-xl text-[#0f172b] mb-2" style={{ fontWeight: 500 }}>
                  Ready to try again?
                </h3>
                <p className="text-[#45556c] mb-1 max-w-md mx-auto">
                  Apply your feedback in a new conversation. The AI will respond differently each time.
                </p>
                <p className="text-xs text-[#6366f1] mb-6" style={{ fontWeight: 600 }}>
                  Attempt {repeatInfo.attempt} of {repeatInfo.maxAttempts} — {repeatInfo.maxAttempts - repeatInfo.attempt} {repeatInfo.maxAttempts - repeatInfo.attempt === 1 ? "retry" : "retries"} remaining
                </p>
                <button
                  onClick={onPracticeAgain}
                  className="bg-[#6366f1] text-white px-8 py-4 rounded-full flex items-center gap-3 shadow-lg hover:bg-[#4f46e5] transition-colors mx-auto text-lg"
                  style={{ fontWeight: 500 }}
                >
                  <RotateCcw className="w-5 h-5" />
                  Practice Again
                </button>
              </div>
            ) : showPaywallOnRepeat ? (
              /* ── Paywall nudge: free user at attempt limit ── */
              <div className="rounded-3xl bg-gradient-to-br from-[#fef3c7] to-[#fff7ed] border border-[#fde68a]/60 p-8 text-center">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#f59e0b]/10 to-[#f97316]/10 flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-7 h-7 text-[#f59e0b]" />
                </div>
                <h3 className="text-xl text-[#0f172b] mb-2" style={{ fontWeight: 500 }}>
                  Want more practice?
                </h3>
                <p className="text-[#45556c] mb-2 max-w-md mx-auto">
                  You've completed your {repeatInfo.maxAttempts} free {repeatInfo.maxAttempts === 1 ? "attempt" : "attempts"}. Unlock unlimited practice to perfect your delivery.
                </p>
                <p className="text-xs text-[#92400e]/70 mb-6">
                  Each attempt generates a different conversation — the more you practice, the more confident you become.
                </p>
                <button
                  onClick={() => onPaywallTriggered?.("extra-practice")}
                  className="bg-[#0f172b] text-white px-8 py-4 rounded-full flex items-center gap-3 shadow-lg hover:bg-[#1d293d] transition-colors mx-auto text-lg"
                  style={{ fontWeight: 500 }}
                >
                  <Sparkles className="w-5 h-5" />
                  Unlock More Practice
                  <ArrowRight className="w-5 h-5" />
                </button>
                <p className="text-[10px] text-[#92400e]/50 mt-3">
                  Starting at $4.99 per session · No subscription required
                </p>
              </div>
            ) : (
              <div className="rounded-3xl bg-gradient-to-br from-[#f0fdf4] to-[#dcfce7] border border-[#bbf7d0] p-8 text-center">
                <div className="w-14 h-14 rounded-full bg-[#16a34a]/10 flex items-center justify-center mx-auto mb-4">
                  <Trophy className="w-7 h-7 text-[#16a34a]" />
                </div>
                <h3 className="text-xl text-[#0f172b] mb-2" style={{ fontWeight: 500 }}>
                  You've mastered this scenario!
                </h3>
                <p className="text-[#45556c] mb-6 max-w-md mx-auto">
                  You've completed {repeatInfo.maxAttempts} {repeatInfo.maxAttempts === 1 ? "attempt" : "attempts"} of this scenario. Try a different one to build versatility.
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  {[
                    { key: "interview", label: "Interview", icon: <Briefcase className="w-4 h-4" /> },
                    { key: "sales", label: "Sales Pitch", icon: <MessageSquare className="w-4 h-4" /> },
                    { key: "negotiation", label: "Negotiation", icon: <Handshake className="w-4 h-4" /> },
                    { key: "networking", label: "Networking", icon: <Users className="w-4 h-4" /> },
                  ]
                    .filter((s) => s.key !== scenarioType)
                    .slice(0, 3)
                    .map((s) => (
                      <button
                        key={s.key}
                        onClick={onGenerateReport}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-[#e2e8f0] text-sm text-[#0f172b] hover:bg-[#f8fafc] transition-colors shadow-sm"
                        style={{ fontWeight: 500 }}
                      >
                        {s.icon}
                        {s.label}
                      </button>
                    ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* ── 6. Finish & Generate Report CTA ── */}
        <motion.div
          className="flex flex-col items-center gap-3"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <button
            onClick={onGenerateReport}
            className="bg-[#0f172b] text-white px-10 py-4 rounded-full flex items-center gap-3 shadow-lg hover:bg-[#1d293d] transition-colors text-lg"
            style={{ fontWeight: 500 }}
          >
            <FileText className="w-5 h-5" />
            Finish practice and generate report
            <ArrowRight className="w-5 h-5" />
          </button>
        </motion.div>
      </main>
      <MiniFooter />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   EXTRA CONTEXT SCREEN (required, between Setup and Generating)
   ═══════════════════════════════════════════════════════════ */

interface ExtraContextField {
  label: string;
  placeholder: string;
  hint: string;
  pasteHint: string;
  suggestions: string[];
}

const EXTRA_CONTEXT_FIELDS: Record<string, ExtraContextField[]> = {
  interview: [
    {
      label: "Job Description",
      placeholder: "Paste the job description here — or just the key requirements and responsibilities...",
      hint: "The AI will tailor interview questions to the specific role, seniority level, and required skills",
      pasteHint: "Tip: Copy-paste directly from LinkedIn or the company careers page",
      suggestions: [
        "Senior PM role, B2B SaaS, 5+ years experience required",
        "Must lead cross-functional teams of 8-12 people",
        "Key KPIs: retention, NPS, quarterly revenue targets",
        "Reports to VP of Product, US-based company",
      ],
    },
    {
      label: "Your key experience",
      placeholder: "Your 3 most relevant roles, key achievements, and skills that match this position...",
      hint: "The AI will help you build STAR-method answers using your real career history",
      pasteHint: "No need to paste your full CV — just the highlights relevant to this role",
      suggestions: [
        "5 years as PM at a SaaS startup, grew ARR 3x",
        "Led a team of 6 engineers shipping to US clients",
        "Fluent in Spanish, professional English (B2+)",
        "MBA from [university], certified Scrum Master",
      ],
    },
  ],
  sales: [
    {
      label: "Prospect / company information",
      placeholder: "Company name, industry, size, decision-makers, known pain points or priorities...",
      hint: "The more specific you are, the more realistic the objections and pushback will be",
      pasteHint: "Check their LinkedIn, Crunchbase, or recent press releases for context",
      suggestions: [
        "Mid-market fintech, 200 employees, Series B",
        "Currently using a competitor (Salesforce/HubSpot)",
        "Pain point: manual reporting taking 10+ hours/week",
        "Decision-maker is the CFO, budget cycle ends Q4",
      ],
    },
    {
      label: "Your deck or talking points",
      placeholder: "The main value propositions, pricing structure, case studies, or differentiators from your pitch...",
      hint: "The AI will align the conversation with your actual material so you practice what you'll really say",
      pasteHint: "Paste your slide titles and key bullet points — no need for the full deck",
      suggestions: [
        "3 main slides: Problem → Solution → ROI",
        "Key differentiator: 40% faster implementation",
        "Case study: similar client saved $200K/year",
        "Pricing: $15K/year, includes onboarding",
      ],
    },
  ],
  csuite: [],
  negotiation: [],
  networking: [],
};

function ExtraContextScreen({
  scenarioType,
  onContinue,
  onBack,
}: {
  scenarioType?: ScenarioType;
  onContinue: (extraData: Record<string, string>) => void;
  onBack?: () => void;
}) {
  const fields = scenarioType ? EXTRA_CONTEXT_FIELDS[scenarioType] ?? [] : [];
  const [values, setValues] = useState<Record<string, string>>({});
  const [expandedHints, setExpandedHints] = useState<Record<number, boolean>>({});
  const hasContent = Object.values(values).some((v) => v.trim().length > 0);

  const scenarioLabels: Record<string, string> = {
    sales: "sales pitch",
    interview: "interview",
    csuite: "executive presentation",
    negotiation: "negotiation",
    networking: "networking",
  };
  const label = scenarioType ? scenarioLabels[scenarioType] ?? "practice" : "practice";

  /** Insert a suggestion chip into the textarea */
  const handleSuggestionClick = (fieldLabel: string, suggestion: string) => {
    setValues((prev) => {
      const current = prev[fieldLabel] ?? "";
      const separator = current.trim() ? "\n" : "";
      return { ...prev, [fieldLabel]: current + separator + suggestion };
    });
  };

  return (
    <div
      className="w-full min-h-full flex flex-col bg-[#f0f4f8] relative overflow-hidden"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <PastelBlobs />

      <main className="relative w-full max-w-[768px] mx-auto px-6 pt-12 pb-20">
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 bg-[#eff6ff] border border-[#bfdbfe] rounded-full px-4 py-2 mb-6">
            <FileText className="w-4 h-4 text-[#3b82f6]" />
            <span className="text-sm text-[#1e40af]" style={{ fontWeight: 500 }}>
              Step 2 of 3 — Context
            </span>
          </div>
          <h1
            className="text-3xl md:text-[40px] text-[#0f172b] mb-3"
            style={{ fontWeight: 300, lineHeight: 1.2 }}
          >
            Add context for your {label}
          </h1>
          <p className="text-[#45556c] text-base md:text-lg max-w-lg mx-auto">
            Fill in at least one field so the AI can create a realistic, personalized simulation.
            {" "}<span className="text-[#94a3b8]">Just paste or type — no file uploads needed.</span>
          </p>
        </motion.div>

        {fields.length > 0 && (
          <motion.div
            className="space-y-8 mb-10"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            {fields.map((field, i) => {
              const isExpanded = expandedHints[i] ?? false;
              const currentValue = values[field.label] ?? "";

              return (
                <motion.div
                  key={i}
                  className="bg-white rounded-2xl border border-[#e2e8f0] p-5 shadow-sm"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 + i * 0.08 }}
                >
                  {/* Field header */}
                  <div className="flex items-start justify-between mb-3">
                    <label className="flex items-center gap-1.5">
                      <span className="text-sm text-[#0f172b]" style={{ fontWeight: 600 }}>
                        {field.label}
                      </span>
                      <span className="relative group cursor-help">
                        <Info className="w-3.5 h-3.5 text-[#94a3b8] group-hover:text-[#0f172b] transition-colors" />
                        <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-56 rounded-xl bg-[#0f172b] text-white text-xs px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg z-50" style={{ lineHeight: "1.45" }}>
                          {field.hint}
                          <span className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-[5px] border-x-transparent border-t-[5px] border-t-[#0f172b]" />
                        </span>
                      </span>
                    </label>
                    <span className="text-[10px] text-[#6366f1] bg-[#f0f4ff] rounded-full px-2.5 py-0.5" style={{ fontWeight: 500 }}>
                      Recommended
                    </span>
                  </div>

                  {/* Paste hint */}
                  <div className="flex items-center gap-1.5 mb-3 text-xs text-[#62748e]">
                    <ClipboardPaste className="w-3 h-3 shrink-0" />
                    <span>{field.pasteHint}</span>
                  </div>

                  {/* Textarea */}
                  <textarea
                    value={currentValue}
                    onChange={(e) =>
                      setValues((prev) => ({ ...prev, [field.label]: e.target.value }))
                    }
                    placeholder={field.placeholder}
                    className="w-full h-[110px] bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-4 text-[#0f172b] placeholder:text-[#94a3b8] focus:outline-none focus:border-[#0f172b] focus:bg-white transition-all resize-none"
                    style={{ fontSize: "14px", lineHeight: "22px" }}
                  />

                  {/* Character count */}
                  {currentValue.length > 0 && (
                    <div className="flex justify-end mt-1">
                      <span className={`text-[10px] ${currentValue.length > 1500 ? "text-amber-500" : "text-[#c4cdd5]"}`}>
                        {currentValue.length} / 2,000 chars
                      </span>
                    </div>
                  )}

                  {/* Expandable suggestions */}
                  <div className="mt-3">
                    <button
                      onClick={() => setExpandedHints((prev) => ({ ...prev, [i]: !isExpanded }))}
                      className="flex items-center gap-1.5 text-xs text-[#6366f1] hover:text-[#4f46e5] transition-colors group"
                      style={{ fontWeight: 500 }}
                    >
                      <Sparkles className="w-3 h-3" />
                      Not sure what to write? Try these examples
                      <motion.span
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className="w-3 h-3" />
                      </motion.span>
                    </button>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          className="mt-2.5 flex flex-wrap gap-2"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.25 }}
                        >
                          {field.suggestions.map((suggestion, si) => (
                            <motion.button
                              key={si}
                              onClick={() => handleSuggestionClick(field.label, suggestion)}
                              className="text-xs bg-[#f0f4ff] hover:bg-[#e0e7ff] border border-[#c7d2fe]/50 text-[#3730a3] rounded-lg px-3 py-1.5 transition-all hover:shadow-sm text-left"
                              style={{ fontWeight: 450 }}
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.2, delay: si * 0.05 }}
                              whileTap={{ scale: 0.97 }}
                            >
                              + {suggestion}
                            </motion.button>
                          ))}
                          <p className="w-full text-[10px] text-[#94a3b8] mt-1 italic">
                            Click to add — then edit to match your real situation
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        <motion.div
          className="flex flex-col items-center justify-center"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <button
            onClick={() => onContinue(values)}
            disabled={!hasContent}
            className={`flex items-center gap-3 px-10 py-5 rounded-full text-xl shadow-[0px_10px_15px_rgba(0,0,0,0.1)] transition-all ${hasContent
              ? "bg-[#0f172b] text-white hover:bg-[#1d293d] cursor-pointer"
              : "bg-[#e2e8f0] text-[#94a3b8] cursor-not-allowed"
              }`}
            style={{ fontWeight: 500 }}
          >
            Continue
            <ArrowRight className="w-6 h-6" />
          </button>

          {onBack && (
            <button
              onClick={onBack}
              className="mt-4 flex items-center justify-center gap-1.5 py-2.5 text-sm text-[#62748e] hover:text-[#0f172b] transition-colors"
              style={{ fontWeight: 500 }}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back
            </button>
          )}

        </motion.div>
      </main>
      <MiniFooter />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN ORCHESTRATOR (MVP-simplified flow)
   extra-context → generating-script → pre-briefing →
   practice → analyzing → conversation-feedback → session-recap → Dashboard
   ═══════════════════════════════════════════════════════════ */
export function PracticeSessionPage({
  scenario,
  interlocutor,
  scenarioType,
  guidedFields,
  marketFocus,
  onFinish,
  onNewPractice,
  userPlan,
}: PracticeSessionPageProps) {
  /* Start with context step */
  const [step, setStep] = useState<Step>("extra-context");

  /* Merge setup guidedFields with ExtraContextScreen data
     IMPORTANT: useMemo with serialized deps prevents infinite re-render loop.
     Without this, { ...guidedFields, ...extraContext } creates a NEW object
     every render → useEffect sees mergedGuidedFields as "changed" → cancels
     & restarts prepareSession endlessly → VoicePractice never loads messages. */
  const [extraContext, setExtraContext] = useState<Record<string, string>>({});
  const guidedFieldsJSON = JSON.stringify(guidedFields);
  const extraContextJSON = JSON.stringify(extraContext);
  const mergedGuidedFields = useMemo(
    () => ({ ...guidedFields, ...extraContext }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [guidedFieldsJSON, extraContextJSON]
  );

  /* Service data */
  const [serviceError, setServiceError] = useState<ServiceError | null>(null);

  /* AI-generated pre-briefing script (NO mock fallback — real AI or error+retry) */
  const [generatedScript, setGeneratedScript] = useState<ScriptSection[] | null>(null);
  const [scriptGenStatus, setScriptGenStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [scriptGenError, setScriptGenError] = useState<string | null>(null);
  const [animationDone, setAnimationDone] = useState(false);

  /* ── Script generation: call Edge Function ── */
  const fireScriptGeneration = useCallback((extraData?: Record<string, string>) => {
    setScriptGenStatus("loading");
    setScriptGenError(null);
    setGeneratedScript(null);
    setAnimationDone(false);

    const serverUrl = `https://${projectId}.supabase.co/functions/v1/make-server-08b8658d/generate-script`;
    const allFields = { ...guidedFields, ...(extraData || extraContext) };

    // ── DIAGNOSTIC LOGGING (v4-diagnostic) ──
    console.log(`%c[GenerateScript] FIRED v4-diagnostic`, 'color: #ff6b6b; font-weight: bold; font-size: 14px');
    console.log(`[GenerateScript] URL: ${serverUrl}`);
    console.log(`[GenerateScript] projectId: "${projectId}", publicAnonKey: "${publicAnonKey?.slice(0, 20)}..."`);
    console.log(`[GenerateScript] Payload:`, { scenario, interlocutor, scenarioType, guidedFieldKeys: Object.keys(allFields), marketFocus });

    fetch(serverUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify({
        scenario,
        interlocutor,
        scenarioType,
        guidedFields: allFields,
        marketFocus,
      }),
    })
      .then(async (res) => {
        console.log(`[GenerateScript] Response received: status=${res.status}, ok=${res.ok}`);
        if (!res.ok) {
          const errBody = await res.text();
          throw new Error(`Server ${res.status}: ${errBody.slice(0, 200)}`);
        }
        return res.json();
      })
      .then((data) => {
        if (data.sections && Array.isArray(data.sections) && data.sections.length > 0) {
          console.log(`[GenerateScript] ✅ ${data.sections.length} sections received from GPT-4o`);
          if (data._debug) {
            console.log(`[GenerateScript] 🔍 DEBUG: version=${data._debug.version}, wordCount=${data._debug.wordCount}, wasRewritten=${data._debug.wasRewritten}`);
          }
          setGeneratedScript(data.sections);
          setScriptGenStatus("ready");
        } else {
          throw new Error("Response missing valid sections array");
        }
      })
      .catch((err) => {
        console.error("[GenerateScript] ❌ Failed:", err.message);
        setScriptGenError(err.message);
        setScriptGenStatus("error");
      });
  }, [scenario, interlocutor, scenarioType, guidedFields, extraContext, marketFocus]);

  /* ── Auto-transition: only when BOTH animation AND API are done ── */
  useEffect(() => {
    if (step === "generating-script" && animationDone && scriptGenStatus === "ready" && generatedScript) {
      setStep("pre-briefing");
    }
  }, [step, animationDone, scriptGenStatus, generatedScript]);

  /* Session initialization via conversationService */
  const [sessionId, setSessionId] = useState<string | null>(null);

  /* ── Practice Again: repeat tracking ── */
  const [repeatCount, setRepeatCount] = useState(0);
  const [sessionVersion, setSessionVersion] = useState(0);
  const plan: UserPlan = userPlan ?? "free";
  const maxRepeats = MAX_REPEATS[plan];
  const canRepeat = repeatCount < maxRepeats;
  const repeatInfo: RepeatInfo = {
    attempt: repeatCount + 1,
    maxAttempts: maxRepeats + 1,
    canRepeat,
  };

  /* ── Usage gating & paywall ── */
  const usageGating = useUsageGating(plan);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [paywallReason, setPaywallReason] = useState<PaywallReason | null>(null);

  /** Determine if free user should see paywall on repeat limit */
  const gateResult = usageGating.canPracticeAgain(repeatInfo.attempt, repeatInfo.maxAttempts);
  const showPaywallOnRepeat = !repeatInfo.canRepeat && gateResult.reason === "extra-practice";

  const handlePaywallTriggered = useCallback((reason: PaywallReason) => {
    setPaywallReason(reason);
    setPaywallOpen(true);
  }, []);

  const handlePurchaseComplete = useCallback((_pack: CreditPack, creditsAdded: number) => {
    usageGating.addCredits(creditsAdded);
    setPaywallOpen(false);
    setPaywallReason(null);

    // After purchase, grant extra repeats based on what was bought
    if (paywallReason === "extra-practice") {
      // Immediately allow practice again
      setRepeatCount(0); // Reset attempts
      setSessionId(null);
      setServiceError(null);
      setSessionVersion((v) => v + 1);
      setStep("practice");
    }
  }, [paywallReason, usageGating]);

  /** Handle "Practice Again" from Conversation Feedback */
  const handlePracticeAgain = useCallback(() => {
    if (!canRepeat) return;
    setRepeatCount((c) => c + 1);
    setSessionId(null);
    setServiceError(null);
    setSessionVersion((v) => v + 1);
    // Go directly to practice — skip pre-briefing on repeat
    setStep("practice");
  }, [canRepeat]);

  useEffect(() => {
    let cancelled = false;
    realConversationService
      .prepareSession({
        scenario,
        interlocutor,
        scenarioType,
        guidedFields: mergedGuidedFields,
        marketFocus,
      })
      .then((prepared) => {
        if (!cancelled) {
          setSessionId(prepared.sessionId);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          const serviceErr = toServiceError(err);
          console.error(`[PracticeSession] prepareSession failed:`, serviceErr.code, serviceErr.message, err);
          setServiceError(serviceErr);
        }
      });
    return () => { cancelled = true; };
  }, [scenario, interlocutor, scenarioType, mergedGuidedFields, marketFocus, sessionVersion]);

  /* Retry handler */
  const handleRetry = useCallback(() => {
    setServiceError(null);
  }, []);

  const handleDismissError = useCallback(() => {
    setServiceError(null);
  }, []);

  /* ── Scroll to top on step change ── */
  const stepContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    stepContainerRef.current?.scrollTo(0, 0);
  }, [step]);

  return (
    <div className="size-full flex flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Persistent header: BrandLogo + inline stepper */}
      <header className="sticky top-0 z-50 bg-white border-b border-[#e2e8f0] shrink-0">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-6 h-16">
          <BrandLogo />
          <div className="max-w-xs w-full -translate-y-2">
            <SessionProgressBar currentStep={step} />
          </div>
        </div>
      </header>

      {/* Step content (animated transitions) */}
      <div ref={stepContainerRef} className="flex-1 relative min-h-0 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${step}-${sessionVersion}`}
            className="w-full min-h-full"
            initial={{ opacity: 0, filter: "blur(4px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, filter: "blur(4px)" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Global error banner */}
            {serviceError && (
              <div className="fixed top-16 left-0 right-0 z-[100] p-4 max-w-xl mx-auto">
                <ServiceErrorBanner
                  error={serviceError}
                  onRetry={handleRetry}
                  onDismiss={handleDismissError}
                  onNavigate={onFinish}
                />
              </div>
            )}

            {step === "extra-context" && (
              <ExtraContextScreen
                scenarioType={scenarioType}
                onContinue={(extraData) => {
                  setExtraContext(extraData);
                  setStep("generating-script");
                  fireScriptGeneration(extraData);
                }}
                onBack={onFinish}
              />
            )}
            {step === "generating-script" && (
              <>
                {/* Show animation while loading OR while waiting for animation to finish */}
                {scriptGenStatus !== "error" && (
                  <AnalyzingScreen
                    variant="generating-script"
                    canComplete={scriptGenStatus === "ready" && !!generatedScript}
                    onComplete={() => setAnimationDone(true)}
                  />
                )}

                {/* Error state with retry */}
                {scriptGenStatus === "error" && (
                  <div className="w-full min-h-[calc(100dvh-4rem)] bg-[#0f172b] flex flex-col items-center justify-center px-6 gap-6">
                    <div className="w-16 h-16 rounded-full bg-[#1e293b] flex items-center justify-center">
                      <svg className="w-8 h-8 text-[#f87171]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="text-center max-w-sm">
                      <h3 className="text-lg font-semibold text-white mb-2">
                        Script generation failed
                      </h3>
                      <p className="text-sm text-[#94a3b8] mb-1">
                        We couldn't generate your personalized script. This is usually a temporary issue.
                      </p>
                      {scriptGenError && (
                        <p className="text-xs text-[#475569] font-mono bg-[#1e293b] rounded px-3 py-2 mt-3 break-all">
                          {scriptGenError.slice(0, 150)}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-3 mt-2">
                      <button
                        onClick={() => {
                          setStep("extra-context");
                          setScriptGenStatus("idle");
                        }}
                        className="px-5 py-2.5 rounded-lg text-sm font-medium text-[#94a3b8] bg-[#1e293b] hover:bg-[#334155] transition-colors"
                      >
                        ← Go back
                      </button>
                      <button
                        onClick={() => fireScriptGeneration()}
                        className="px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-[#6366f1] hover:bg-[#4f46e5] transition-colors"
                      >
                        Retry generation
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
            {step === "pre-briefing" && generatedScript && (
              <PreBriefingScreen
                scenarioType={scenarioType}
                interlocutor={interlocutor}
                onStartSimulation={() => setStep("practice")}
                onBack={() => setStep("extra-context")}
                generatedSections={generatedScript}
              />
            )}
            {step === "practice" && !sessionId && !serviceError && (
              <div className="flex flex-col items-center justify-center h-[calc(100dvh-4rem)] gap-4">
                <motion.div
                  className="w-8 h-8 border-2 border-[#e2e8f0] border-t-[#0f172b] rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <p className="text-sm text-[#45556c]">Preparing your session...</p>
              </div>
            )}
            {step === "practice" && sessionId && (
              <VoicePractice
                interlocutor={interlocutor}
                sessionId={sessionId}
                scenarioType={scenarioType}
                onViewFeedback={() => setStep("analyzing")}
                onEnd={onFinish}
              />
            )}
            {step === "analyzing" && (
              <AnalyzingScreen variant="feedback" onComplete={() => setStep("conversation-feedback")} />
            )}
            {step === "conversation-feedback" && (
              <ConversationFeedback
                scenarioType={scenarioType}
                onGenerateReport={() => setStep("session-recap")}
                onPracticeAgain={handlePracticeAgain}
                repeatInfo={repeatInfo}
                onPaywallTriggered={handlePaywallTriggered}
                showPaywallOnRepeat={showPaywallOnRepeat}
              />
            )}
            {step === "session-recap" && (
              <SessionReport
                scenarioType={scenarioType}
                guidedFields={mergedGuidedFields}
                resultsSummary={null}
                onFinish={onFinish}
                finishLabel="Go To Dashboard"
                onDownloadReport={() => {
                  const gate = usageGating.canDownloadReport();
                  if (gate.allowed) {
                    // Mock download — in production this generates a real PDF
                    const el = document.createElement("a");
                    el.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent("inFluentia PRO — Session Report\n\nThis is a mock PDF download. In production, a full PDF report is generated."));
                    el.setAttribute("download", "influentia-report.txt");
                    el.click();
                  } else {
                    handlePaywallTriggered("download-report");
                  }
                }}
                userPlan={plan}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Paywall Modal (shared across all triggers) ── */}
      <CreditUpsellModal
        open={paywallOpen}
        onClose={() => { setPaywallOpen(false); setPaywallReason(null); }}
        onPurchaseComplete={handlePurchaseComplete}
        paywallReason={paywallReason ?? undefined}
        creditsRemaining={usageGating.credits}
      />
    </div>
  );
} 