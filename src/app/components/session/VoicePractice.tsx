import {
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import {
  Mic,
  ArrowRight,
  Play,
  Volume2,
  AudioLines,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  RecordButton,
  RecordingTimer,
  PastelBlobs,
} from "../shared";
import {
  realConversationService,
  realSpeechService,
} from "../../../services";
import { toServiceError } from "../../../services/errors";
import type { ServiceError } from "../../../services/errors";
import { ServiceErrorBanner } from "../shared/ServiceErrorBanner";
import { useMediaRecorder } from "../../hooks/useMediaRecorder";
import {
  projectId,
  publicAnonKey,
} from "../../../../utils/supabase/info";
import type {
  ChatMessage,
  ScenarioType,
  TurnPronunciationData,
} from "../../../services/types";
import { SessionProgressBar } from "../SessionProgressBar";

const SCENARIO_LABELS_MAP: Record<string, string> = {
  sales: "Sales Pitch",
  interview: "Job Interview",
  csuite: "Executive Presentation",
  negotiation: "Negotiation",
  networking: "Networking",
};

function VoicePractice({
  interlocutor,
  sessionId,
  scenarioType,
  onViewFeedback,
  onConversationComplete,
  onEnd,
}: {
  interlocutor: string;
  sessionId: string;
  scenarioType?: ScenarioType;
  onViewFeedback: (pronData: TurnPronunciationData[]) => void;
  /** Fires as soon as the conversation ends — use to pre-warm feedback analysis */
  onConversationComplete?: () => void;
  onEnd: () => void;
}) {
  /* Chat state */
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConversationComplete, setIsConversationComplete] =
    useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [revealingMsgIndex, setRevealingMsgIndex] = useState<
    number | null
  >(null);
  const [revealedWords, setRevealedWords] = useState(0);
  const [playingMsgIndex, setPlayingMsgIndex] = useState<
    number | null
  >(null);
  const [voiceError, setVoiceError] =
    useState<ServiceError | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatScrollAreaRef = useRef<HTMLDivElement>(null);
  const revealIntervalRef = useRef<ReturnType<
    typeof setInterval
  > | null>(null);
  const lastScrolledMsgCount = useRef(0);
  /** Track which message indices have been fully revealed (prevents re-animation) */
  const revealedMsgsRef = useRef(new Set<number>());

  /* ── Real MediaRecorder hook ── */
  const recorder = useMediaRecorder();

  /* ── TTS: play AI message via OpenAI gpt-4o-mini-tts ── */
  const ttsAudioRef = useRef<HTMLAudioElement | null>(null);
  const [isTtsPlaying, setIsTtsPlaying] = useState(false);
  /** Track which message index is currently being TTS-played → skip typewriter for it */
  const ttsTargetMsgRef = useRef<number | null>(null);
  /** Guard against double-tap mic submissions */
  const isSubmittingRef = useRef(false);
  /** Gate: typewriter waits until TTS audio is actually playing */
  const [ttsReady, setTtsReady] = useState(true);
  /** Accumulated Azure pronunciation assessments per user turn (background, non-blocking) */
  const pronunciationDataRef = useRef<TurnPronunciationData[]>(
    [],
  );
  /** Counter for user turns (for indexing pronunciation data) */
  const userTurnCountRef = useRef(0);
  /** Track pending pronunciation assessment promises so we can await them before "Analyze" */
  const pendingPronPromisesRef = useRef<Promise<void>[]>([]);
  /** Actual audio duration (seconds) for calibrating typewriter speed */
  const ttsDurationRef = useRef<number>(0);

  const playAiTts = useCallback(
    async (text: string, msgIndex?: number) => {
      try {
        // Stop any currently playing TTS before starting new one (prevents overlapping audio)
        if (ttsAudioRef.current) {
          ttsAudioRef.current.pause();
          ttsAudioRef.current.onended = null;
          ttsAudioRef.current.onerror = null;
          ttsAudioRef.current = null;
        }
        setIsTtsPlaying(true);
        setTtsReady(false); // Gate typewriter — don't reveal text until audio plays
        ttsDurationRef.current = 0;
        if (msgIndex !== undefined)
          ttsTargetMsgRef.current = msgIndex;
        const ttsUrl = `https://${projectId}.supabase.co/functions/v1/make-server-08b8658d/tts`;
        const res = await fetch(ttsUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ text, role: "user_line" }),
        });
        if (!res.ok) {
          console.error(
            `[VoicePractice TTS] Error ${res.status}`,
          );
          setIsTtsPlaying(false);
          setTtsReady(true); // Ungate on error — let typewriter run without audio
          return;
        }
        const blob = await res.blob();
        const audioUrl = URL.createObjectURL(blob);
        const audio = new Audio(audioUrl);
        ttsAudioRef.current = audio;

        // Capture actual audio duration for typewriter calibration
        audio.addEventListener("loadedmetadata", () => {
          if (audio.duration && isFinite(audio.duration)) {
            ttsDurationRef.current = audio.duration;
          }
        });

        audio.onended = () => {
          setIsTtsPlaying(false);
          // Fast-forward typewriter to completion when audio finishes
          if (revealIntervalRef.current) {
            clearInterval(revealIntervalRef.current);
            revealIntervalRef.current = null;
          }
          if (ttsTargetMsgRef.current !== null) {
            revealedMsgsRef.current.add(
              ttsTargetMsgRef.current,
            );
          }
          setRevealingMsgIndex(null);
          ttsTargetMsgRef.current = null;
          URL.revokeObjectURL(audioUrl);
          ttsAudioRef.current = null;
        };
        audio.onerror = () => {
          setIsTtsPlaying(false);
          setTtsReady(true); // Ungate on error
          ttsTargetMsgRef.current = null;
          URL.revokeObjectURL(audioUrl);
          ttsAudioRef.current = null;
        };
        await audio.play().catch(() => {
          setIsTtsPlaying(false);
          setTtsReady(true); // Ungate on play failure
        });
        // Audio is NOW playing — ungate typewriter so text starts revealing in sync
        setTtsReady(true);
      } catch {
        setIsTtsPlaying(false);
        setTtsReady(true); // Ungate on any error
      }
    },
    [],
  );

  /* Load first message via REAL conversationService on mount */
  useEffect(() => {
    let cancelled = false;
    setIsAiTyping(true);

    realConversationService
      .getSessionMessages(sessionId)
      .then((msgs) => {
        if (cancelled) return;
        setTimeout(() => {
          if (cancelled) return;
          setIsAiTyping(false);
          if (msgs.length > 0) {
            // Use functional updater: only set initial messages if state is
            // still empty — prevents overwriting messages already added by
            // handleRecordingStop if this effect fires late.
            setMessages((prev) => {
              if (prev.length > 0) {
                return prev;
              }
              return msgs;
            });
            // Play TTS for the first AI message — typewriter runs in sync
            const firstAiIdx = msgs.findIndex(
              (m) => m.role === "ai",
            );
            if (firstAiIdx >= 0)
              playAiTts(msgs[firstAiIdx].text, firstAiIdx);
          }
        }, 800);
      })
      .catch((err) => {
        if (cancelled) return;
        setIsAiTyping(false);
        setVoiceError(toServiceError(err));
      });

    return () => {
      cancelled = true;
    };
  }, [sessionId, playAiTts]);

  /* Typewriter effect for the last AI message — GATED by TTS readiness.
     Text reveal is held until audio.play() resolves, then both run in sync.
     Speed is calibrated to actual audio duration when available.
     When audio ends, any remaining text is fast-forwarded (see onended above). */
  useEffect(() => {
    if (messages.length === 0) return;
    const lastIdx = messages.length - 1;
    const lastMsg = messages[lastIdx];
    if (lastMsg?.role !== "ai") {
      setRevealingMsgIndex(null);
      return;
    }

    // Already fully revealed (previous typewriter completion or TTS fast-forward)
    if (revealedMsgsRef.current.has(lastIdx)) {
      setRevealingMsgIndex(null);
      return;
    }

    // GATE: If TTS is loading, wait until audio starts playing.
    // ttsReady flips to true after audio.play() resolves → this effect re-runs.
    // NOTE: We do NOT match ttsTargetMsgRef === lastIdx because React 18
    // batching defers state updater execution, so ttsTargetMsgRef may hold a
    // stale index when the effect first fires. Checking only !ttsReady is safe
    // because the typewriter only ever targets the last AI message.
    if (!ttsReady) {
      return;
    }

    if (revealIntervalRef.current) {
      clearInterval(revealIntervalRef.current);
      revealIntervalRef.current = null;
    }

    const totalChars = lastMsg.text.length;
    setIsAiTyping(false); // Now safe — typewriter takes over
    setRevealingMsgIndex(lastIdx);
    setRevealedWords(0);
    let count = 0;

    // Calibrate speed to actual audio duration when available.
    // audioDuration is set by loadedmetadata before audio.play() resolves.
    // Reserve ~5% margin so text finishes slightly before audio ends.
    const audioDuration = ttsDurationRef.current;
    let msPerChar: number;
    if (audioDuration > 0 && totalChars > 0) {
      msPerChar = Math.max(
        20,
        Math.floor((audioDuration * 950) / totalChars),
      );
    } else {
      // Fallback: ~150 WPM ≈ 60ms/char
      msPerChar = 60;
    }

    revealIntervalRef.current = setInterval(() => {
      count += 1;
      setRevealedWords(count);
      if (count >= totalChars) {
        if (revealIntervalRef.current)
          clearInterval(revealIntervalRef.current);
        revealIntervalRef.current = null;
        setRevealingMsgIndex(null);
        revealedMsgsRef.current.add(lastIdx);
      }
    }, msPerChar);

    return () => {
      if (revealIntervalRef.current) {
        clearInterval(revealIntervalRef.current);
        revealIntervalRef.current = null;
      }
      setRevealingMsgIndex(null);
    };
  }, [messages.length, ttsReady]);

  /* Smart scroll */
  const smoothScrollToBottom = useCallback(() => {
    chatEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
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
    const distFromBottom =
      area.scrollHeight - area.scrollTop - area.clientHeight;
    if (distFromBottom < 150) {
      chatEndRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [revealedWords, revealingMsgIndex]);

  /* Handle mic error from recorder hook */
  useEffect(() => {
    if (recorder.error) {
      setVoiceError(
        toServiceError(
          new Error(recorder.error),
          "MICROPHONE_DENIED",
        ),
      );
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
    // Guard against double-tap / touch+click submissions — lock ref IMMEDIATELY
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;

    if (!recorder.isRecording) {
      isSubmittingRef.current = false;
      return;
    }

    if (recorder.recordingTime < 500) {
      await recorder.stop();
      isSubmittingRef.current = false;
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Stop recording → get audio Blob
      const audioBlob = await recorder.stop();
      if (!audioBlob || audioBlob.size < 100) {
        setIsProcessing(false);
        return;
      }

      // 2. Send audio to Whisper for transcription
      const transcription =
        await realSpeechService.transcribeBlob(audioBlob);

      if (!transcription.text.trim()) {
        setIsProcessing(false);
        setVoiceError(
          toServiceError(
            new Error(
              "Could not detect speech. Please try again.",
            ),
            "STT_EMPTY",
          ),
        );
        return;
      }

      // 2b. Fire Azure Pronunciation Assessment in BACKGROUND (parallel, non-blocking)
      // The promise is tracked so we can await all pending assessments before user clicks "Analyze"
      const currentTurnIndex = userTurnCountRef.current++;

      const pronPromise = (async () => {
        try {
          const result =
            await realSpeechService.assessPronunciation(
              audioBlob,
              transcription.text,
            );
          if (result) {
            pronunciationDataRef.current.push({
              turnIndex: currentTurnIndex,
              assessment: result,
              timestamp: new Date().toISOString(),
            });
          } else {
          }
        } catch (err) { }
      })();

      pendingPronPromisesRef.current.push(pronPromise);

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
      // Dedup guard: prevent adding the same user message twice
      // (can happen with touch+click double-fire or StrictMode updater replay)
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (
          last &&
          last.role === "user" &&
          last.text === userMsg.text
        ) {
          return prev;
        }
        return [...prev, userMsg];
      });
      setIsProcessing(false);

      // 3. Send transcription to GPT-4o for AI response
      setIsAiTyping(true);
      const turnResult =
        await realConversationService.processTurn(
          sessionId,
          transcription.text,
        );

      // NOTE: Do NOT setIsAiTyping(false) here.  The AI message is added to
      // the array below and will show typing-bars inside its own bubble
      // (aiWaiting state).  isAiTyping is cleared later when the typewriter
      // starts, keeping the mic disabled throughout the transition.
      const aiMsg = turnResult.aiMessage;
      let aiMsgIndex = 0;
      setMessages((prev) => {
        // Dedup guard: prevent adding the same AI message twice
        // (React 18 StrictMode replays updaters; batching races can also cause this)
        const lastMsg = prev[prev.length - 1];
        if (
          lastMsg &&
          lastMsg.role === "ai" &&
          lastMsg.text === aiMsg.text
        ) {
          aiMsgIndex = prev.length - 1;
          ttsTargetMsgRef.current = aiMsgIndex;
          return prev;
        }
        const newMsgs = [...prev, aiMsg];
        aiMsgIndex = newMsgs.length - 1;
        // Set ref INSIDE updater where index is guaranteed correct.
        // React 18 batching defers updater execution, so setting aiMsgIndex
        // outside the updater would use a stale value (0).
        ttsTargetMsgRef.current = aiMsgIndex;
        return newMsgs;
      });
      // 4. Play AI response via ElevenLabs TTS — called OUTSIDE state updater to prevent double execution
      // NOTE: msgIndex is intentionally omitted — ttsTargetMsgRef is already set correctly inside the updater above.
      if (aiMsg.text) {
        playAiTts(aiMsg.text);
      }

      if (turnResult.isComplete) {
        setIsConversationComplete(true);
        // Pre-warm feedback analysis in background — gives Gemini a ~15-30s head
        // start while the user reads the last AI message and clicks "Analyze".
        onConversationComplete?.();
      }
    } catch (err) {
      setIsProcessing(false);
      setIsAiTyping(false);
      const serviceErr = toServiceError(err);
      console.error(
        `[VoicePractice] Error:`,
        serviceErr.code,
        serviceErr.message,
      );
      setVoiceError(serviceErr);
    } finally {
      isSubmittingRef.current = false;
    }
  }, [recorder, sessionId, playAiTts]);

  const canViewFeedback =
    isConversationComplete && revealingMsgIndex === null;
  const micDisabled =
    isConversationComplete ||
    isProcessing ||
    isAiTyping ||
    isTtsPlaying;

  /* Cleanup TTS on unmount */
  useEffect(() => {
    return () => {
      ttsAudioRef.current?.pause();
      ttsAudioRef.current = null;
    };
  }, []);

  return (
    <div
      className="flex flex-col h-[calc(100dvh-4rem)] relative"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Arena sub-toolbar */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-[#e2e8f0]/60 px-6 py-2">
        <div className="max-w-[700px] mx-auto flex items-center justify-between">
          <span className="text-sm text-[#45556c]">
            {scenarioType
              ? (SCENARIO_LABELS_MAP[scenarioType] ??
                "Practice")
              : "Sales Pitch"}{" "}
            · {interlocutor}
          </span>
          <div className="flex items-center gap-2">
            {isTtsPlaying && (
              <span
                className="flex items-center gap-1.5 text-xs text-[#50C878] bg-[#f0fdf4] px-2.5 py-1 rounded-full"
                style={{ fontWeight: 500 }}
              >
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
            <span
              className="text-xs text-[#62748e] bg-[#f1f5f9] px-3 py-1 rounded-full"
              style={{ fontWeight: 500 }}
            >
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
      <div
        ref={chatScrollAreaRef}
        className="flex-1 bg-[#f8fafc] overflow-y-auto relative scroll-smooth"
      >
        <PastelBlobs />
        <div
          className="relative max-w-[700px] mx-auto px-6 py-8 space-y-6"
          style={{ overflowAnchor: "none" }}
        >
          {/* Voice conversation banner */}
          <motion.div
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-full mx-auto w-fit"
            style={{
              background:
                "linear-gradient(135deg, rgba(0,211,243,0.08), rgba(80,200,120,0.08))",
              border: "1px solid rgba(80,200,120,0.15)",
            }}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <AudioLines className="w-3.5 h-3.5 text-[#50C878]" />
            <span
              className="text-xs text-[#4B505B]"
              style={{ fontWeight: 500 }}
            >
              Voice conversation — AI speaks, you respond with
              your microphone
            </span>
          </motion.div>

          {messages.map((msg, i, arr) => {
            // Render-level dedup: skip AI messages whose text is identical
            // to the NEXT message (the later copy will be the one with the
            // active typewriter / reveal state, so we keep that one).
            if (
              msg.role === "ai" &&
              i < arr.length - 1 &&
              arr[i + 1].role === "ai" &&
              arr[i + 1].text === msg.text
            ) {
              return null;
            }

            const isRevealing = revealingMsgIndex === i;
            const isPlaying = playingMsgIndex === i;
            const hasBeenRevealed =
              revealedMsgsRef.current.has(i);

            // ── AI message: waiting for TTS / typewriter ──
            // Instead of returning null (which collapses the container and causes
            // a scroll jump), we render the typing-bars placeholder INSIDE the
            // same container.  When the typewriter starts the content crossfades
            // to text — same DOM slot, no height change, zero layout shift.
            // Only the LAST AI message may show typing bars.  Older AI messages
            // always display their text — this prevents "ghost" typing bars when a
            // typewriter effect is cleaned up before it completes and the message
            // is never added to revealedMsgsRef.
            const aiWaiting =
              msg.role === "ai" &&
              i === messages.length - 1 &&
              !hasBeenRevealed &&
              !isRevealing;

            const aiFullyRevealed =
              msg.role === "ai" &&
              !isRevealing &&
              hasBeenRevealed;
            // displayText: typewriter slice while revealing, full text once revealed
            const displayText = isRevealing
              ? msg.text.slice(0, revealedWords)
              : msg.text;

            const trySaying =
              msg.role === "ai"
                ? msg.coachingHint || null
                : null;
            const isLatestAiMsg =
              msg.role === "ai" &&
              (() => {
                for (let j = messages.length - 1; j >= 0; j--) {
                  if (messages[j].role === "ai") return j === i;
                }
                return false;
              })();

            return (
              <motion.div
                key={i}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                transition={{
                  height: {
                    duration: 0.8,
                    ease: [0.16, 1, 0.3, 1],
                  },
                  opacity: { duration: 0.01 },
                }}
                style={{ overflow: "hidden" }}
              >
                <motion.div
                  initial={{ opacity: 0, y: 24, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{
                    duration: 1.1,
                    ease: [0.16, 1, 0.3, 1],
                    opacity: { duration: 0.8, delay: 0.15 },
                    scale: { duration: 0.9, delay: 0.05 },
                    y: { duration: 1.1 },
                  }}
                  style={{
                    transformOrigin:
                      msg.role === "user"
                        ? "bottom right"
                        : "bottom left",
                  }}
                  className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
                >
                  <span className="text-xs text-[#62748e] mb-2 flex items-center gap-1.5">
                    {msg.role === "ai" ? (
                      <Volume2 className="w-3 h-3" />
                    ) : (
                      <Mic className="w-3 h-3" />
                    )}
                    {aiWaiting ? (
                      <>{interlocutor} · thinking...</>
                    ) : (
                      <>
                        {msg.label} · {msg.time}
                      </>
                    )}
                  </span>

                  {/* Bubble content: typing bars while waiting, text when revealing/revealed */}
                  <div
                    className={`rounded-2xl px-6 py-4 max-w-[600px] transition-all duration-300 ${msg.role === "user"
                        ? "bg-[#0f172b] text-white"
                        : "bg-white border border-[#e2e8f0] text-[#0f172b]"
                      }`}
                  >
                    <AnimatePresence mode="wait">
                      {aiWaiting ? (
                        <motion.div
                          key="typing-bars"
                          className="flex gap-1 items-center h-5"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          {[0, 1, 2, 3, 4].map((bar) => (
                            <div
                              key={bar}
                              className="w-[3px] rounded-full animate-speaking-bar"
                              style={{
                                background:
                                  "linear-gradient(to top, #00D3F3, #50C878)",
                                animationDelay: `${bar * 0.12}s`,
                              }}
                            />
                          ))}
                        </motion.div>
                      ) : (
                        <motion.p
                          key="text-content"
                          className="leading-relaxed"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          {displayText}
                          {isRevealing && (
                            <span
                              className="inline-block w-[2px] h-[1em] ml-0.5 align-text-bottom rounded-full animate-cursor-blink"
                              style={{
                                background:
                                  "linear-gradient(to bottom, #00D3F3, #50C878)",
                              }}
                            />
                          )}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Replay button */}
                  <AnimatePresence>
                    {msg.role === "ai" && aiFullyRevealed && (
                      <motion.button
                        key="replay"
                        className="mt-1.5 flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] transition-colors"
                        style={{
                          fontWeight: 500,
                          color: isPlaying
                            ? "#50C878"
                            : "#94a3b8",
                          background: isPlaying
                            ? "rgba(80,200,120,0.08)"
                            : "rgba(80,200,120,0)",
                          border: isPlaying
                            ? "1px solid rgba(80,200,120,0.2)"
                            : "1px solid rgba(80,200,120,0)",
                        }}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.3,
                          delay: 0.2,
                        }}
                        whileHover={{
                          color: "#50C878",
                          background: "rgba(80,200,120,0.06)",
                        }}
                        onClick={() => {
                          setPlayingMsgIndex(i);
                          playAiTts(msg.text);
                          setTimeout(
                            () => setPlayingMsgIndex(null),
                            5000,
                          );
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

                  {/* "Try saying..." hint */}
                  <AnimatePresence>
                    {isLatestAiMsg &&
                      trySaying &&
                      aiFullyRevealed && (
                        <motion.div
                          key="try-saying"
                          className="mt-3 w-full bg-[#f0fdf4] border border-[#b9f8cf] rounded-xl px-4 py-3 overflow-hidden"
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          transition={{
                            duration: 0.35,
                            delay: 0.2,
                            ease: [0.25, 1, 0.5, 1],
                          }}
                          onAnimationComplete={() => {
                            // Auto-scroll so the hint is visible above the mic bar
                            chatEndRef.current?.scrollIntoView({
                              behavior: "smooth",
                              block: "end",
                            });
                          }}
                        >
                          <p
                            className="text-xs text-[#15803d]"
                            style={{ fontWeight: 500 }}
                          >
                            🧠 Start with:{" "}
                            <span
                              className="text-[#0f172b] italic"
                              style={{ fontWeight: 600 }}
                            >
                              "{trySaying.starter}"
                            </span>
                          </p>
                          {trySaying.keywords &&
                            trySaying.keywords.length > 0 && (
                              <p
                                className="text-[11px] text-[#0f172b] mt-1.5"
                                style={{ fontWeight: 500 }}
                              >
                                🔑{" "}
                                <span
                                  className="text-[#45556c]"
                                  style={{ fontWeight: 400 }}
                                >
                                  Key words:
                                </span>{" "}
                                {trySaying.keywords.map(
                                  (kw: string, ki: number) => (
                                    <span key={ki}>
                                      <span
                                        className="bg-[#dcfce7] text-[#166534] px-1.5 py-0.5 rounded-md text-[10px]"
                                        style={{
                                          fontWeight: 600,
                                        }}
                                      >
                                        {kw}
                                      </span>
                                      {ki <
                                        (trySaying.keywords
                                          ?.length ?? 0) -
                                        1 && (
                                          <span className="mx-1 text-[#cbd5e1]">
                                            ·
                                          </span>
                                        )}
                                    </span>
                                  ),
                                )}
                              </p>
                            )}
                          <p className="text-[10px] text-[#45556c] mt-1">
                            {trySaying.strategy}
                          </p>
                        </motion.div>
                      )}
                  </AnimatePresence>
                </motion.div>
              </motion.div>
            );
          })}

          {/* AI speaking indicator — shown ONLY before the AI message is
              added to the messages array (e.g., waiting for the API).
              Once the message exists, the typing bars live INSIDE the
              message bubble to avoid layout collapse/re-expand. */}
          <AnimatePresence>
            {isAiTyping &&
              messages[messages.length - 1]?.role !== "ai" && (
                <motion.div
                  key="ai-typing-standalone"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{
                    height: {
                      duration: 0.6,
                      ease: [0.16, 1, 0.3, 1],
                    },
                    opacity: { duration: 0.15 },
                  }}
                  style={{ overflow: "hidden" }}
                >
                  <motion.div
                    className="flex flex-col items-start"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{
                      duration: 0.3,
                      ease: [0.25, 1, 0.5, 1],
                    }}
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
                              background:
                                "linear-gradient(to top, #00D3F3, #50C878)",
                              animationDelay: `${bar * 0.12}s`,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
          </AnimatePresence>

          {/* Processing indicator */}
          <AnimatePresence>
            {isProcessing && (
              <motion.div
                key="processing"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{
                  height: {
                    duration: 0.6,
                    ease: [0.16, 1, 0.3, 1],
                  },
                  opacity: { duration: 0.15 },
                }}
                style={{ overflow: "hidden" }}
              >
                <motion.div
                  className="flex flex-col items-end"
                  initial={{ opacity: 0, y: 10, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.97 }}
                  transition={{
                    duration: 0.35,
                    ease: [0.25, 1, 0.5, 1],
                  }}
                  style={{ transformOrigin: "bottom right" }}
                >
                  <span className="text-xs text-[#62748e] mb-2 flex items-center gap-1.5">
                    <Mic className="w-3 h-3" />
                    Transcribing...
                  </span>
                  <div className="bg-[#0f172b]/80 rounded-2xl px-6 h-14 flex items-center justify-center">
                    <div className="flex gap-1 items-center h-6">
                      {[0, 1, 2, 3, 4].map((bar) => (
                        <div
                          key={bar}
                          className="w-[3px] rounded-full bg-white/70 animate-processing-bar"
                          style={{
                            animationDelay: `${bar * 0.1}s`,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <div
            ref={chatEndRef}
            style={{ overflowAnchor: "auto" }}
          />
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
              <p
                className="text-sm text-[#45556c] animate-fade-in"
                style={{ fontWeight: 500 }}
              >
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
                onClick={async () => {
                  // Wait for any pending pronunciation assessments to complete (max 8s timeout)
                  const pending =
                    pendingPronPromisesRef.current;
                  if (pending.length > 0) {
                    await Promise.race([
                      Promise.allSettled(pending),
                      new Promise((resolve) =>
                        setTimeout(resolve, 8000),
                      ),
                    ]);
                    pendingPronPromisesRef.current = [];
                  }
                  onViewFeedback([
                    ...pronunciationDataRef.current,
                  ]);
                }}
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
   SESSION FEEDBACK — Professional Proficiency gauge, Skill Radar,
   Collapsible Practice Analysis + Pronunciation Analysis,
   Practice Again, Generate Report
   ═══════════════════════════════════════════════════════════ */

/* ── Radar pillar names (must match backend keys) ── */
const FEEDBACK_PILLAR_NAMES = [
  "Vocabulary",
  "Grammar",
  "Fluency",
  "Pronunciation",
  "Professional Tone",
  "Persuasion",
] as const;

/* ── Content Quality pillar names (interview-specific) ── */
const CONTENT_QUALITY_NAMES = [
  "Relevance",
  "Structure",
  "Examples",
  "Impact",
] as const;

const CONTENT_QUALITY_COLORS: Record<
  string,
  { icon: string; bg: string; text: string }
> = {
  Relevance: {
    icon: "🎯",
    bg: "rgba(59,130,246,0.12)",
    text: "#3b82f6",
  },
  Structure: {
    icon: "🏗️",
    bg: "rgba(168,85,247,0.12)",
    text: "#a855f7",
  },
  Examples: {
    icon: "📊",
    bg: "rgba(245,158,11,0.12)",
    text: "#f59e0b",
  },
  Impact: {
    icon: "⚡",
    bg: "rgba(239,68,68,0.12)",
    text: "#ef4444",
  },
};

export { VoicePractice };