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
import { conversationService, speechService } from "../../services";
import { toServiceError } from "../../services/errors";
import type { ServiceError } from "../../services/errors";
import { ServiceErrorBanner } from "./shared/ServiceErrorBanner";
import { getTrySaying, getBeforeAfterForScenario, getStrengthsForScenario, getOpportunitiesForScenario, getScriptSectionsForScenario, setMockSpeechScenario, getPowerPhrasesForScenario, getPowerQuestions } from "../../services/scenario-data";
import { BeforeAfterSection } from "./arena/BriefingRoom";
import type {
  ChatMessage,
  ScenarioType,
  ScriptSection,
  UserPlan,
  CreditPack,
} from "../../services/types";
import { SessionProgressBar } from "./SessionProgressBar";
import { SessionReport } from "./SessionReport";
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
   GENERATING SCRIPT STEP: calls AI to generate personalized script
   ═══════════════════════════════════════════════════════════ */

function GeneratingScriptStep({
  scenario,
  scenarioType,
  interlocutor,
  guidedFields,
  marketFocus,
  onComplete,
  onError,
}: {
  scenario: string;
  scenarioType?: ScenarioType;
  interlocutor: string;
  guidedFields?: Record<string, string>;
  marketFocus?: MarketFocus | null;
  onComplete: (sections: ScriptSection[]) => void;
  onError: (err: unknown) => void;
}) {
  const hasCalledRef = useRef(false);

  useEffect(() => {
    if (hasCalledRef.current) return;
    hasCalledRef.current = true;

    // 30s timeout fallback — never leave the user stuck
    const timeout = setTimeout(() => {
      console.warn("[GeneratingScriptStep] Timeout — falling back to mock data");
      onError(new Error("Script generation timed out"));
    }, 30_000);

    conversationService
      .generatePreBriefing({
        scenarioType: scenarioType ?? "interview",
        scenario,
        interlocutor,
        guidedFields,
        marketFocus,
      })
      .then((result) => {
        clearTimeout(timeout);
        onComplete(result.sections);
      })
      .catch((err) => {
        clearTimeout(timeout);
        console.error("[GeneratingScriptStep] Failed:", err);
        onError(err);
      });

    return () => clearTimeout(timeout);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AnalyzingScreen
      variant="generating-script"
      onComplete={() => {
        // Timer-based fallback: if AI takes too long, this fires.
        // The actual transition is driven by the service call above.
      }}
    />
  );
}

/* ═══════════════════════════════════════════════════════════
   PRE-BRIEFING: Narrative script / conversation strategy
   ═══════════════════════════════════════════════════════════ */

function PreBriefingScreen({
  scenarioType,
  interlocutor,
  scriptSections: externalSections,
  onStartSimulation,
  onBack,
}: {
  scenarioType?: ScenarioType;
  interlocutor: string;
  scriptSections?: ScriptSection[] | null;
  onStartSimulation: () => void;
  onBack: () => void;
}) {
  // Use AI-generated sections if available, fall back to mock
  const scriptSections = externalSections ?? getScriptSectionsForScenario(scenarioType);
  const [isEditing, setIsEditing] = useState(false);

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

          {scriptSections.map((section, si) => (
            <motion.div
              key={section.num}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 + si * 0.1, ease: [0.22, 1, 0.36, 1] }}
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
                {section.paragraphs.map((p, pi) => (
                  <p
                    key={pi}
                    className={`text-[#314158] leading-relaxed ${isEditing
                      ? "bg-[#f8fafc] rounded-xl px-4 py-3 border border-[#e2e8f0] focus:outline-none focus:border-[#6366f1] transition-colors"
                      : ""
                      }`}
                    contentEditable={isEditing}
                    suppressContentEditableWarning
                  >
                    {p.text}
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
                ))}
              </div>
            </motion.div>
          ))}
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
   VOICE PRACTICE (MVP: single-phase conversation)
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
  /* Set mock speech scenario on mount */
  useEffect(() => {
    setMockSpeechScenario(scenarioType ?? null);
  }, [scenarioType]);

  /* Chat state */
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConversationComplete, setIsConversationComplete] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [waveformBars, setWaveformBars] = useState<number[]>(
    Array.from({ length: 32 }, () => 0.15)
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [revealingMsgIndex, setRevealingMsgIndex] = useState<number | null>(null);
  const [revealedWords, setRevealedWords] = useState(0);
  const [playingMsgIndex, setPlayingMsgIndex] = useState<number | null>(null);
  const [voiceError, setVoiceError] = useState<ServiceError | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatScrollAreaRef = useRef<HTMLDivElement>(null);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const waveformRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const revealIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recordingStartRef = useRef(0);
  const lastScrolledMsgCount = useRef(0);

  /* Load first message via conversationService on mount */
  useEffect(() => {
    let cancelled = false;
    setIsAiTyping(true);

    conversationService.getSessionMessages(sessionId).then((msgs) => {
      if (cancelled) return;
      setTimeout(() => {
        if (cancelled) return;
        setIsAiTyping(false);
        if (msgs.length > 0) {
          setMessages(msgs);
        }
      }, 1800);
    }).catch((err) => {
      if (cancelled) return;
      setIsAiTyping(false);
      setVoiceError(toServiceError(err));
    });

    return () => { cancelled = true; };
  }, [sessionId]);

  /* Typewriter effect for the last AI message */
  useEffect(() => {
    if (messages.length === 0) return;
    const lastIdx = messages.length - 1;
    const lastMsg = messages[lastIdx];
    if (lastMsg?.role !== "ai") {
      // If the last message isn't AI (e.g. user message added while typewriter was running),
      // ensure revealingMsgIndex is cleared so canViewFeedback isn't blocked
      setRevealingMsgIndex(null);
      return;
    }

    if (revealIntervalRef.current) {
      clearInterval(revealIntervalRef.current);
      revealIntervalRef.current = null;
    }

    const totalChars = lastMsg.text.length;
    setRevealingMsgIndex(lastIdx);
    setRevealedWords(0); // reused as revealedChars
    let count = 0;

    /* ── Character-by-character typewriter ──
       ~25ms per char ≈ 40 chars/s ≈ 8 words/s (≈480 WPM visual).
       Feels like fast real-time transcription.
       In production this is replaced by ElevenLabs word-level timestamps
       (see /src/services/prompts/tts-sync.ts). */
    const msPerChar = 35;
    revealIntervalRef.current = setInterval(() => {
      count += 1;
      setRevealedWords(count); // reused as revealedChars
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
      // Reset revealingMsgIndex on cleanup so it doesn't get stuck
      setRevealingMsgIndex(null);
    };
  }, [messages.length]);

  /* Smart scroll: only auto-scroll on new messages or state changes, NOT every word.
     For word reveals, only nudge scroll if user is already near the bottom. */
  const smoothScrollToBottom = useCallback(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, []);

  // Scroll on new messages or major state changes
  useEffect(() => {
    if (messages.length !== lastScrolledMsgCount.current) {
      lastScrolledMsgCount.current = messages.length;
      // Small delay so the DOM has painted the new bubble
      requestAnimationFrame(() => {
        smoothScrollToBottom();
      });
    }
  }, [messages.length, smoothScrollToBottom]);

  useEffect(() => {
    smoothScrollToBottom();
  }, [isProcessing, isAiTyping, smoothScrollToBottom]);

  // During typewriter reveal, throttled scroll — only every ~350ms and only if near bottom
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

  /* Recording timer */
  useEffect(() => {
    if (isRecording) {
      setRecordingTime(0);
      recordingStartRef.current = Date.now();
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(Date.now() - recordingStartRef.current);
      }, 100);
    } else {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    }
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    };
  }, [isRecording]);

  /* Waveform animation */
  useEffect(() => {
    if (isRecording) {
      waveformRef.current = setInterval(() => {
        setWaveformBars(
          Array.from({ length: 32 }, () => 0.15 + Math.random() * 0.85)
        );
      }, 80);
    } else {
      if (waveformRef.current) {
        clearInterval(waveformRef.current);
        waveformRef.current = null;
      }
      setWaveformBars(Array.from({ length: 32 }, () => 0.15));
    }
    return () => {
      if (waveformRef.current) clearInterval(waveformRef.current);
    };
  }, [isRecording]);

  /* Handle recording stop */
  const handleRecordingStop = async () => {
    if (!isRecording) return;
    setIsRecording(false);
    setVoiceError(null);

    if (recordingTime < 500) return;

    setIsProcessing(true);

    try {
      const transcription = await speechService.transcribe(recordingTime);

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

      setIsAiTyping(true);
      const turnResult = await conversationService.processTurn(sessionId, transcription.text);

      setIsAiTyping(false);
      setMessages((prev) => [...prev, turnResult.aiMessage]);

      if (turnResult.isComplete) {
        setIsConversationComplete(true);
      }
    } catch (err) {
      setIsProcessing(false);
      setIsAiTyping(false);
      const serviceErr = toServiceError(err);
      console.error(`[VoicePractice] Error:`, serviceErr.code, serviceErr.message);
      setVoiceError(serviceErr);
    }
  };

  const canViewFeedback = isConversationComplete && revealingMsgIndex === null;

  /* Count user turns for fallback detection */
  const userTurnCount = messages.filter((m) => m.role === "user").length;
  /* Disable mic when conversation is complete or busy */
  const micDisabled = isConversationComplete || isProcessing || isAiTyping;

  return (
    <div className="flex flex-col h-[calc(100dvh-4rem)] relative" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Arena sub-toolbar (scenario info only — no phase system in MVP) */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-[#e2e8f0]/60 px-6 py-2">
        <div className="max-w-[700px] mx-auto flex items-center justify-between">
          <span className="text-sm text-[#45556c]">
            {scenarioType ? SCENARIO_LABELS_MAP[scenarioType] ?? "Practice" : "Sales Pitch"} · {interlocutor}
          </span>
          <span className="text-xs text-[#62748e] bg-[#f1f5f9] px-3 py-1 rounded-full" style={{ fontWeight: 500 }}>
            Live Conversation
          </span>
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

            // "Try saying..." hint on latest AI message only
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

                {/* Replay button for AI messages */}
                <AnimatePresence>
                  {msg.role === "ai" && aiFullyRevealed && (
                    <motion.button
                      key="replay"
                      className="mt-1.5 flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] transition-colors"
                      style={{
                        fontWeight: 500,
                        color: isPlaying ? "#50C878" : "#94a3b8",
                        background: isPlaying
                          ? "rgba(80,200,120,0.08)"
                          : "rgba(80,200,120,0)",
                        border: isPlaying ? "1px solid rgba(80,200,120,0.2)" : "1px solid rgba(80,200,120,0)",
                      }}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.2 }}
                      whileHover={{ color: "#50C878", background: "rgba(80,200,120,0.06)" }}
                      onClick={() => {
                        setPlayingMsgIndex(i);
                        setTimeout(() => setPlayingMsgIndex(null), 3500);
                      }}
                    >
                      {isPlaying ? (
                        <>
                          <span className="flex items-center gap-[2px]">
                            {[0, 1, 2, 3].map((bar) => (
                              <span
                                key={bar}
                                className="inline-block w-[2px] rounded-full animate-eq-bar"
                                style={{
                                  background: "#50C878",
                                  animationDelay: `${bar * 0.1}s`,
                                }}
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

                {/* "Try saying..." hint after the latest AI message */}
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
                  {interlocutor} · speaking...
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

      {/* Bottom controls — fixed-height panel, no SmoothHeight, no layout shift */}
      <div className="bg-white border-t border-[#e2e8f0] relative flex-shrink-0">
        <div className="max-w-[700px] mx-auto px-6 py-2 flex flex-col items-center gap-1">
          {/* Recording waveform — CSS transition height so chat area doesn't resize abruptly */}
          <div
            className="w-full flex flex-col items-center gap-2 overflow-hidden transition-all duration-200"
            style={{
              height: isRecording ? 56 : 0,
              opacity: isRecording ? 1 : 0,
            }}
          >
            <RecordingTimer timeMs={recordingTime} />
            <div className="flex items-center justify-center gap-[3px] h-6 w-full max-w-[400px] overflow-hidden">
              {waveformBars.map((h, i) => (
                <div
                  key={i}
                  className="w-[5px] rounded-full bg-gradient-to-t from-red-400 to-red-500"
                  style={{
                    height: `${h * 24}px`,
                    transition: "height 0.12s ease-out",
                  }}
                />
              ))}
            </div>
          </div>

          {/* Mic button */}
          <RecordButton
            isRecording={isRecording}
            onClick={() => {
              if (isRecording) {
                handleRecordingStop();
              } else {
                setIsRecording(true);
              }
            }}
            size="sm"
            label={
              isRecording
                ? "Recording — tap to stop"
                : isProcessing
                  ? undefined
                  : "Tap to speak"
            }
            disabled={micDisabled}
          />
          {/* Status hint — fixed height slot to prevent layout shift */}
          <div className="h-5 flex items-center justify-center">
            {isProcessing && !isRecording && (
              <p className="text-sm text-[#45556c] animate-fade-in" style={{ fontWeight: 500 }}>
                Transcribing your response...
              </p>
            )}
            {!isRecording && !isProcessing && (
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

                  {/* Expandable suggestions removed as requested */}
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

  /* Merge setup guidedFields with ExtraContextScreen data */
  const [extraContext, setExtraContext] = useState<Record<string, string>>({});
  const mergedGuidedFields = useMemo(
    () => ({ ...guidedFields, ...extraContext }),
    [guidedFields, extraContext]
  );

  /* Service data */
  const [serviceError, setServiceError] = useState<ServiceError | null>(null);

  /* AI-generated script sections */
  const [generatedScript, setGeneratedScript] = useState<ScriptSection[] | null>(null);

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
    // Don't prepare session until the user has submitted context
    if (step === "extra-context") return;

    let cancelled = false;
    conversationService
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
          console.error(`[PracticeSession] prepareSession failed:`, serviceErr.code);
          setServiceError(serviceErr);
        }
      });
    return () => { cancelled = true; };
  }, [step, scenario, interlocutor, scenarioType, mergedGuidedFields, marketFocus, sessionVersion]);

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
                }}
                onBack={onFinish}
              />
            )}
            {step === "generating-script" && (
              <GeneratingScriptStep
                scenario={scenario}
                scenarioType={scenarioType}
                interlocutor={interlocutor}
                guidedFields={mergedGuidedFields}
                marketFocus={marketFocus}
                onComplete={(sections) => {
                  setGeneratedScript(sections);
                  setStep("pre-briefing");
                }}
                onError={(err) => {
                  const serviceErr = toServiceError(err);
                  setServiceError(serviceErr);
                  // Still advance to pre-briefing with mock fallback
                  setStep("pre-briefing");
                }}
              />
            )}
            {step === "pre-briefing" && (
              <PreBriefingScreen
                scenarioType={scenarioType}
                interlocutor={interlocutor}
                scriptSections={generatedScript}
                onStartSimulation={() => setStep("practice")}
                onBack={() => setStep("extra-context")}
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