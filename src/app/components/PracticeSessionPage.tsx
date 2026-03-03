import { useState, useEffect, useRef, useCallback } from "react";
import {
  Mic,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  Lightbulb,
  FileText,
  Play,
  Volume2,
  AudioLines,
  Check,
  PenLine,
  Info,
  ArrowLeft,
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
import { getTrySaying, getBeforeAfterForScenario, getStrengthsForScenario, getOpportunitiesForScenario, getScriptSectionsForScenario, setMockSpeechScenario } from "../../services/scenario-data";
import { BeforeAfterSection } from "./arena/BriefingRoom";
import type {
  ChatMessage,
  ScenarioType,
} from "../../services/types";
import { StrategyBuilder } from "./StrategyBuilder";
import type { ValuePillar } from "./StrategyBuilder";
import { SessionProgressBar } from "./SessionProgressBar";
import { SessionReport } from "./SessionReport";
import type { Step } from "./shared/session-types";

/* ═══════════════════════════════════════════════════════════
   TYPES & DATA (MVP-simplified)
   ═══════════════════════════════════════════════════════════ */

interface PracticeSessionPageProps {
  scenario: string;
  interlocutor: string;
  scenarioType?: ScenarioType;
  guidedFields?: Record<string, string>;
  onFinish: () => void;
  onNewPractice?: () => void;
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
  strategyPillars,
  onStartSimulation,
  onBack,
}: {
  scenarioType?: ScenarioType;
  interlocutor: string;
  strategyPillars?: ValuePillar[];
  onStartSimulation: () => void;
  onBack: () => void;
}) {
  const scriptSections = getScriptSectionsForScenario(scenarioType);
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
            className={`absolute -top-4 right-6 z-10 flex items-center gap-2 px-4 py-1.5 rounded-full text-sm shadow-sm transition-all ${
              isEditing
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
                    className={`text-[#314158] leading-relaxed ${
                      isEditing
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

        {/* 4. Strategy Pillars Summary (if available) */}
        {strategyPillars && strategyPillars.length > 0 && (
          <motion.div
            className="bg-gradient-to-r from-[#f0f9ff] to-[#eef2ff] rounded-2xl border border-[#bfdbfe]/40 p-6 mb-8"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.12 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="w-5 h-5 text-[#6366f1]" />
              <h3 className="text-[#0f172b]" style={{ fontWeight: 600 }}>
                Your value strategy
              </h3>
            </div>
            <div className="space-y-2">
              {strategyPillars.map((p, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 text-sm text-[#314158]"
                >
                  <span className="w-5 h-5 rounded-full bg-[#6366f1] text-white flex items-center justify-center shrink-0 text-[10px]" style={{ fontWeight: 700 }}>
                    {idx + 1}
                  </span>
                  <p className="leading-relaxed">{p.summary}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

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
              Want to simulate your conversation?
            </h3>
            <p className="text-[#45556c] text-lg max-w-md mx-auto mb-8">
              Put this script into practice in a realistic AI conversation. Your coach will give you real-time feedback.
            </p>
            <button
              onClick={onStartSimulation}
              className="bg-[#0f172b] text-white px-10 py-5 rounded-full flex items-center gap-3 shadow-lg hover:bg-[#1d293d] transition-colors text-xl mx-auto"
              style={{ fontWeight: 500 }}
            >
              <Play className="w-5 h-5" />
              Start simulation
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
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const waveformRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const revealIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recordingStartRef = useRef(0);

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

    const words = lastMsg.text.split(/\s+/);
    setRevealingMsgIndex(lastIdx);
    setRevealedWords(0);
    let count = 0;

    revealIntervalRef.current = setInterval(() => {
      count++;
      setRevealedWords(count);
      if (count >= words.length) {
        if (revealIntervalRef.current) clearInterval(revealIntervalRef.current);
        revealIntervalRef.current = null;
        setRevealingMsgIndex(null);
      }
    }, 55);

    return () => {
      if (revealIntervalRef.current) {
        clearInterval(revealIntervalRef.current);
        revealIntervalRef.current = null;
      }
      // Reset revealingMsgIndex on cleanup so it doesn't get stuck
      setRevealingMsgIndex(null);
    };
  }, [messages.length]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, isRecording, isProcessing, isAiTyping, revealedWords]);

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
      <div className="flex-1 bg-[#f8fafc] overflow-y-auto relative">
        <PastelBlobs />
        <div className="relative max-w-[700px] mx-auto px-6 py-8 space-y-6">
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
              ? msg.text.split(/\s+/).slice(0, revealedWords).join(" ")
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
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
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
                  className={`rounded-2xl px-6 py-4 max-w-[600px] ${
                    msg.role === "user"
                      ? "bg-[#0f172b] text-white"
                      : "bg-white border border-[#e2e8f0] text-[#0f172b]"
                  }`}
                >
                  <p className="leading-relaxed">
                    {displayText}
                    {isRevealing && (
                      <motion.span
                        className="inline-block w-[2px] h-[1em] ml-0.5 align-text-bottom rounded-full"
                        style={{ background: "linear-gradient(to bottom, #00D3F3, #50C878)" }}
                        animate={{ opacity: [1, 0.2, 1] }}
                        transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut" }}
                      />
                    )}
                  </p>
                </div>

                {/* Replay button for AI messages */}
                {msg.role === "ai" && aiFullyRevealed && (
                  <motion.button
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
                            <motion.span
                              key={bar}
                              className="inline-block w-[2px] rounded-full"
                              style={{ background: "#50C878" }}
                              animate={{ height: [3, 10, 5, 8, 3] }}
                              transition={{
                                duration: 0.8,
                                repeat: Infinity,
                                delay: bar * 0.1,
                                ease: "easeInOut",
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

                {msg.role === "user" && (
                  <span className="text-[10px] text-[#94a3b8] mt-1 flex items-center gap-1">
                    <Mic className="w-2.5 h-2.5" />
                    Voice transcription
                  </span>
                )}

                {/* "Try saying..." hint after the latest AI message */}
                {isLatestAiMsg && trySaying && aiFullyRevealed && (
                  <motion.div
                    className="mt-3 w-full bg-[#f0fdf4] border border-[#b9f8cf] rounded-xl px-4 py-3"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                  >
                    <p className="text-xs text-[#15803d]" style={{ fontWeight: 500 }}>
                      🧠 Try saying: <span className="text-[#0f172b]" style={{ fontWeight: 600 }}>{trySaying.starter}</span>
                    </p>
                    <p className="text-[10px] text-[#45556c] mt-0.5">{trySaying.why}</p>
                  </motion.div>
                )}
              </motion.div>
            );
          })}

          {/* AI speaking indicator */}
          <AnimatePresence>
            {isAiTyping && (
              <motion.div
                className="flex flex-col items-start"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.3 }}
              >
                <span className="text-xs text-[#62748e] mb-2 flex items-center gap-1.5">
                  <Volume2 className="w-3 h-3" />
                  {interlocutor} · speaking...
                </span>
                <div className="bg-white border border-[#e2e8f0] rounded-2xl px-6 py-4">
                  <div className="flex gap-1 items-center h-5">
                    {[0, 1, 2, 3, 4].map((bar) => (
                      <motion.div
                        key={bar}
                        className="w-[3px] rounded-full"
                        style={{ background: "linear-gradient(to top, #00D3F3, #50C878)" }}
                        animate={{
                          height: [6, 18, 8, 16, 6],
                        }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          delay: bar * 0.12,
                          ease: "easeInOut",
                        }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Processing indicator */}
          {isProcessing && (
            <motion.div
              className="flex flex-col items-end"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <span className="text-xs text-[#62748e] mb-2 flex items-center gap-1.5">
                <Mic className="w-3 h-3" />
                Transcribing...
              </span>
              <div className="bg-[#0f172b]/80 rounded-2xl px-6 py-4">
                <div className="flex gap-1 items-center">
                  {[0, 1, 2, 3, 4].map((bar) => (
                    <motion.div
                      key={bar}
                      className="w-[3px] rounded-full bg-white/70"
                      animate={{
                        height: [4, 14, 6, 12, 4],
                      }}
                      transition={{
                        duration: 0.8,
                        repeat: Infinity,
                        delay: bar * 0.1,
                        ease: "easeInOut",
                      }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Bottom controls */}
      <div className="bg-white border-t border-[#e2e8f0] relative">
        <div className="max-w-[700px] mx-auto px-6 py-2 flex flex-col items-center gap-1">
          {/* Recording waveform visualizer */}
          <AnimatePresence>
            {isRecording && (
              <motion.div
                className="w-full flex flex-col items-center gap-2"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <RecordingTimer timeMs={recordingTime} />
                <div className="flex items-center justify-center gap-[3px] h-6 w-full max-w-[400px]">
                  {waveformBars.map((height, i) => (
                    <motion.div
                      key={i}
                      className="w-[5px] rounded-full bg-gradient-to-t from-red-400 to-red-500"
                      animate={{ height: `${height * 24}px` }}
                      transition={{ duration: 0.08, ease: "easeOut" }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

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
          <AnimatePresence mode="wait">
            {isProcessing && !isRecording && (
              <motion.p
                key="processing"
                className="text-sm text-[#45556c]"
                style={{ fontWeight: 500 }}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.25 }}
              >
                Transcribing your response...
              </motion.p>
            )}
            {!isRecording && !isProcessing && (
              <motion.p
                key="hint"
                className="text-xs text-[#62748e] text-center"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.25 }}
              >
                {isConversationComplete
                  ? "Conversation complete — view your feedback below"
                  : "Respond naturally. There are no wrong answers."}
              </motion.p>
            )}
          </AnimatePresence>

          {/* View feedback button */}
          <AnimatePresence>
            {canViewFeedback && (
              <motion.div
                className="w-full pt-4 mt-2 border-t border-[#e2e8f0]/70"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
              >
                <button
                  onClick={onViewFeedback}
                  className="w-full py-3.5 rounded-full flex items-center justify-center gap-2.5 transition-all shadow-lg bg-[#2d2d2d] text-white hover:bg-[#1a1a1a]"
                  style={{ fontWeight: 500 }}
                >
                  Analyze my presentation
                  <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   CONVERSATION FEEDBACK (MVP: 3 dimensions — Clarity, Persuasion, Executive Presence)
   ═══════════════════════════════════════════════════════════ */

function ConversationFeedback({
  scenarioType,
  onViewReport,
  onDashboard,
}: {
  scenarioType?: ScenarioType;
  onViewReport: () => void;
  onDashboard: () => void;
}) {
  const scenarioLabel = scenarioType
    ? SCENARIO_LABELS_MAP[scenarioType] ?? "Practice"
    : "Sales Pitch";
  const beforeAfter = getBeforeAfterForScenario(scenarioType);
  const strengths = getStrengthsForScenario(scenarioType);
  const opportunities = getOpportunitiesForScenario(scenarioType);

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

        {/* What worked well */}
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

        {/* Phrases to correct */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-full bg-[#0f172b] flex items-center justify-center">
              <PenLine className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-[30px] text-[#0f172b]" style={{ fontWeight: 300 }}>
              Phrases to correct
            </h2>
          </div>
          <p className="text-[#45556c] mb-6">
            These are more executive versions of what you said. Each correction includes the technique that makes it more effective.
          </p>
          <BeforeAfterSection comparisons={beforeAfter} />
        </motion.div>

        {/* Improvement Opportunities */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-full bg-[#0f172b] flex items-center justify-center">
              <Lightbulb className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-[30px] text-[#0f172b]" style={{ fontWeight: 300 }}>
              Improvement Opportunities
            </h2>
          </div>
          <div className="space-y-5">
            {opportunities.map((o, i) => (
              <motion.div
                key={i}
                className="bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl p-6"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.1 + i * 0.1 }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-lg text-[#0f172b]" style={{ fontWeight: 500 }}>{o.title}</h3>
                  {o.tag && (
                    <span className="bg-[#0f172b] text-white text-xs px-3 py-1 rounded-full" style={{ fontWeight: 500 }}>
                      {o.tag}
                    </span>
                  )}
                </div>
                <p className="text-[#314158] leading-relaxed">{highlightEnglish(o.desc)}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA: View Full Report */}
        <motion.div
          className="rounded-3xl bg-gradient-to-br from-[#0f172b] to-[#1e293b] p-8 text-center"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
        >
          <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-5">
            <FileText className="w-7 h-7 text-white" />
          </div>
          <h3 className="text-white text-2xl mb-3" style={{ fontWeight: 500 }}>
            Your Session Report is ready
          </h3>
          <p className="text-white/70 mb-6 max-w-md mx-auto">
            Review your complete report with strategy, script, cultural tips and personalized next steps.
          </p>
          <button
            onClick={onViewReport}
            className="bg-white text-[#0f172b] px-8 py-4 rounded-full flex items-center gap-3 shadow-lg hover:bg-gray-100 transition-colors mx-auto text-lg"
            style={{ fontWeight: 500 }}
          >
            <FileText className="w-5 h-5" />
            View Session Report
            <ArrowRight className="w-5 h-5" />
          </button>
          <div className="mt-4">
            <button
              onClick={onDashboard}
              className="text-white/50 hover:text-white/80 transition-colors text-sm"
            >
              No thanks. Go to Dashboard
            </button>
          </div>
        </motion.div>
      </main>
      <MiniFooter />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   EXTRA CONTEXT SCREEN (skippable, between Strategy and Generating)
   ═══════════════════════════════════════════════════════════ */

const EXTRA_CONTEXT_FIELDS: Record<string, { label: string; placeholder: string; hint: string }[]> = {
  interview: [
    { label: "Job Description", placeholder: "Paste the job description or a summary...", hint: "The AI will adapt the questions to the specific profile" },
    { label: "Your CV / key experience", placeholder: "Summarize your most relevant experience for this job...", hint: "To practice answers based on your real history" },
  ],
  sales: [
    { label: "Prospect / company information", placeholder: "Company name, industry, size, known pain points...", hint: "For the AI to simulate realistic objections" },
    { label: "Your deck or presentation", placeholder: "Describe the key points of your presentation or paste a summary...", hint: "The script will align with your material" },
  ],
  /* Non-MVP scenarios — kept as stubs for type safety */
  csuite: [],
  negotiation: [],
  networking: [],
};

function ExtraContextScreen({
  scenarioType,
  onContinue,
  onSkip,
  onBack,
}: {
  scenarioType?: ScenarioType;
  onContinue: (extraData: Record<string, string>) => void;
  onSkip: () => void;
  onBack?: () => void;
}) {
  const fields = scenarioType ? EXTRA_CONTEXT_FIELDS[scenarioType] ?? [] : [];
  const [values, setValues] = useState<Record<string, string>>({});

  const scenarioLabels: Record<string, string> = {
    sales: "sales pitch",
    interview: "interview",
    csuite: "executive presentation",
    negotiation: "negotiation",
    networking: "networking",
  };
  const label = scenarioType ? scenarioLabels[scenarioType] ?? "practice" : "practice";

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
          <div className="inline-flex items-center gap-2 bg-[#f0fdf4] border border-[#b9f8cf] rounded-full px-4 py-2 mb-6">
            <Check className="w-4 h-4 text-[#00c950]" />
            <span className="text-sm text-[#15803d]" style={{ fontWeight: 500 }}>
              Your 2 value pillars are ready
            </span>
          </div>
          <h1
            className="text-3xl md:text-[40px] text-[#0f172b] mb-3"
            style={{ fontWeight: 300, lineHeight: 1.2 }}
          >
            Want to add more context?
          </h1>
          <p className="text-[#45556c] text-base md:text-lg max-w-md mx-auto">
            This is optional — but the more detail you share, the more realistic your {label} will be
          </p>
        </motion.div>

        {fields.length > 0 && (
          <motion.div
            className="space-y-5 mb-10"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            {fields.map((field, i) => (
              <div key={i}>
                <label className="flex items-center gap-1.5 mb-1.5">
                  <span className="text-sm text-[#0f172b]" style={{ fontWeight: 500 }}>
                    {field.label}
                  </span>
                  {field.hint && (
                    <span className="relative group cursor-help">
                      <Info className="w-3.5 h-3.5 text-[#94a3b8] group-hover:text-[#0f172b] transition-colors" />
                      <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-56 rounded-xl bg-[#0f172b] text-white text-xs px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg z-50" style={{ lineHeight: "1.45" }}>
                        {field.hint}
                        <span className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-[5px] border-x-transparent border-t-[5px] border-t-[#0f172b]" />
                      </span>
                    </span>
                  )}
                </label>
                <textarea
                  value={values[field.label] ?? ""}
                  onChange={(e) =>
                    setValues((prev) => ({ ...prev, [field.label]: e.target.value }))
                  }
                  placeholder={field.placeholder}
                  className="w-full h-[100px] bg-white border-2 border-[#e2e8f0] rounded-xl p-4 text-[#0f172b] placeholder:text-[#94a3b8] focus:outline-none focus:border-[#0f172b] transition-colors resize-none"
                  style={{ fontSize: "15px", lineHeight: "22px" }}
                />
              </div>
            ))}
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
            className="flex items-center gap-3 px-10 py-5 rounded-full text-xl bg-[#0f172b] text-white shadow-[0px_10px_15px_rgba(0,0,0,0.1)] hover:bg-[#1d293d] transition-all"
            style={{ fontWeight: 500 }}
          >
            {Object.values(values).some((v) => v.trim()) ? "Continue with context" : "Continue without context"}
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
   Strategy → extra-context → generating-script → pre-briefing →
   practice → analyzing → conversation-feedback → session-recap → Dashboard
   ═══════════════════════════════════════════════════════════ */
export function PracticeSessionPage({
  scenario,
  interlocutor,
  scenarioType,
  guidedFields,
  onFinish,
  onNewPractice,
}: PracticeSessionPageProps) {
  /* Start with strategy step if scenarioType is provided, otherwise go to generating-script */
  const [step, setStep] = useState<Step>(scenarioType ? "strategy" : "generating-script");
  const [strategyPillars, setStrategyPillars] = useState<ValuePillar[]>([]);

  /* Service data */
  const [serviceError, setServiceError] = useState<ServiceError | null>(null);

  /* Session initialization via conversationService */
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    conversationService
      .prepareSession({
        scenario,
        interlocutor,
        scenarioType,
        guidedFields,
        strategyPillars: strategyPillars.length > 0 ? strategyPillars : undefined,
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
  }, [scenario, interlocutor, scenarioType, guidedFields, strategyPillars]);

  /* Retry handler */
  const handleRetry = useCallback(() => {
    setServiceError(null);
  }, []);

  const handleDismissError = useCallback(() => {
    setServiceError(null);
  }, []);

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
      <div className="flex-1 relative min-h-0 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
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

            {step === "strategy" && scenarioType && (
              <StrategyBuilder
                scenarioType={scenarioType}
                guidedFields={guidedFields ?? {}}
                onComplete={(result) => {
                  setStrategyPillars(result.pillars);
                  setStep("extra-context");
                }}
              />
            )}
            {step === "extra-context" && (
              <ExtraContextScreen
                scenarioType={scenarioType}
                onContinue={() => setStep("generating-script")}
                onSkip={() => setStep("generating-script")}
                onBack={() => setStep("strategy")}
              />
            )}
            {step === "generating-script" && (
              <AnalyzingScreen
                variant="generating-script"
                onComplete={() => setStep("pre-briefing")}
              />
            )}
            {step === "pre-briefing" && (
              <PreBriefingScreen
                scenarioType={scenarioType}
                interlocutor={interlocutor}
                strategyPillars={strategyPillars.length > 0 ? strategyPillars : undefined}
                onStartSimulation={() => setStep("practice")}
                onBack={() => scenarioType ? setStep("strategy") : onFinish()}
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
                onViewReport={() => setStep("session-recap")}
                onDashboard={onFinish}
              />
            )}
            {step === "session-recap" && (
              <SessionReport
                scenarioType={scenarioType}
                guidedFields={guidedFields}
                strategyPillars={strategyPillars.length > 0 ? strategyPillars : undefined}
                resultsSummary={null}
                onFinish={onFinish}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}