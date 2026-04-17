import { useState, useRef, useCallback } from "react";
import { Mic, Square, CheckCircle2, RotateCcw, Volume2, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import type { LessonToolkitStep } from "@/services/types";

interface Props {
  data: LessonToolkitStep;
  footer?: React.ReactNode;
}

type PhraseState = "idle" | "recording" | "done";

export function ToolkitStep({ data, footer }: Props) {
  const [phraseStates, setPhraseStates] = useState<Record<number, PhraseState>>({});
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startRecording = useCallback(async (index: number) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = () => {};
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        setPhraseStates((prev) => ({ ...prev, [index]: "done" }));
      };

      recorder.start();
      setPhraseStates((prev) => ({ ...prev, [index]: "recording" }));

      setTimeout(() => {
        if (recorder.state === "recording") recorder.stop();
      }, 8000);
    } catch (err) {
      console.error("Mic access failed:", err);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const resetPhrase = useCallback((index: number) => {
    setPhraseStates((prev) => ({ ...prev, [index]: "idle" }));
  }, []);

  const completedCount = Object.values(phraseStates).filter((s) => s === "done").length;
  const totalPhrases = data.phrases.length;

  return (
    <motion.div
      className="bg-white rounded-2xl border border-[#6366f1]/20 shadow-md shadow-[#6366f1]/5 overflow-hidden"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      {/* Card header */}
      <div className="px-6 py-6 md:px-8 md:py-7 flex items-start gap-4 border-b border-[#f1f5f9] bg-[#f8fafc]">
        <span
          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
            completedCount === totalPhrases && totalPhrases > 0
              ? "bg-emerald-500"
              : "bg-[#6366f1]"
          }`}
        >
          {completedCount === totalPhrases && totalPhrases > 0 ? (
            <Check className="w-4 h-4 text-white" />
          ) : (
            <Mic className="w-4 h-4 text-white" />
          )}
        </span>
        <div className="flex-1">
          <p className="text-[#0f172b] text-base md:text-lg leading-snug" style={{ fontWeight: 600 }}>
            {data.title}
          </p>
          <p className="text-sm text-[#64748b] mt-1">
            Listen and shadow each phrase aloud
          </p>
        </div>
        <span className="text-sm font-semibold text-[#6366f1] shrink-0 mt-1">
          {completedCount}/{totalPhrases}
        </span>
      </div>

      {/* Phrase cards — PhrasesLayer style */}
      <div className="p-5 md:p-6 flex flex-col gap-3">
        <p className="text-xs text-[#62748e] mb-1">
          Listen to the native pronunciation, then shadow it yourself
        </p>

        {data.phrases.map((phrase, i) => {
          const state = phraseStates[i] || "idle";
          const isDone = state === "done";
          const isRecording = state === "recording";

          return (
            <motion.div
              key={i}
              className={`rounded-xl border transition-all overflow-hidden ${
                isRecording
                  ? "border-red-300 bg-red-50/30 shadow-sm"
                  : isDone
                  ? "border-emerald-200 bg-emerald-50/50"
                  : "border-[#e2e8f0] bg-white"
              }`}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25, delay: i * 0.06 }}
            >
              {/* Phrase row */}
              <div className="flex items-center gap-3 px-4 py-3">
                {/* Number / status badge */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                    isDone
                      ? "bg-emerald-500 text-white"
                      : isRecording
                      ? "bg-red-500 text-white"
                      : "bg-[#f1f5f9] text-[#45556c]"
                  }`}
                >
                  {isDone ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : isRecording ? (
                    <Mic className="w-3.5 h-3.5" />
                  ) : (
                    <span className="text-xs" style={{ fontWeight: 700 }}>{i + 1}</span>
                  )}
                </div>

                {/* Phrase text */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#0f172b] leading-snug" style={{ fontWeight: 600 }}>
                    &ldquo;{phrase.pattern}&rdquo;
                  </p>
                  {phrase.usage && (
                    <p className="text-xs text-[#62748e] mt-0.5">{phrase.usage}</p>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              {!isDone && !isRecording && (
                <div className="flex items-center gap-2 px-4 pb-3">
                  {/* Listen pill — static for Toolkit (no TTS wired yet, kept for UI parity) */}
                  <button
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs bg-[#f1f5f9] text-[#45556c] hover:bg-[#e2e8f0] transition-all"
                    style={{ fontWeight: 500 }}
                    aria-label={`Listen to phrase ${i + 1}`}
                    disabled
                  >
                    <Volume2 className="w-3 h-3" />
                    Listen
                  </button>

                  {/* Practice It pill */}
                  <button
                    onClick={() => startRecording(i)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs bg-[#0f172b] text-white hover:bg-[#1d293d] transition-all"
                    style={{ fontWeight: 500 }}
                    aria-label={`Practice phrase ${i + 1}`}
                  >
                    <Mic className="w-3 h-3" />
                    Practice It
                  </button>
                </div>
              )}

              {/* Recording active UI */}
              {isRecording && (
                <AnimatePresence>
                  <motion.div
                    className="px-4 pb-3 flex flex-col items-center gap-2"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex items-center gap-1.5 text-xs text-red-500" style={{ fontWeight: 500 }}>
                      <motion.div
                        animate={{ opacity: [1, 0.3] }}
                        transition={{ repeat: Infinity, duration: 0.8, repeatType: "reverse" }}
                        className="w-2 h-2 rounded-full bg-red-500"
                      />
                      Repeat the phrase aloud...
                    </div>
                    <button
                      onClick={stopRecording}
                      className="flex items-center gap-1.5 bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600 transition-colors text-xs"
                      style={{ fontWeight: 500 }}
                    >
                      <Square className="w-3 h-3" fill="currentColor" />
                      Done
                    </button>
                  </motion.div>
                </AnimatePresence>
              )}

              {/* Done state */}
              {isDone && (
                <div className="flex items-center justify-between px-4 pb-3">
                  <span className="text-xs text-emerald-700 flex items-center gap-1.5" style={{ fontWeight: 500 }}>
                    <CheckCircle2 className="w-3.5 h-3.5" /> Practiced!
                  </span>
                  <button
                    onClick={() => resetPhrase(i)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#e2e8f0] text-xs text-[#45556c] hover:bg-[#f8fafc] transition-colors"
                    style={{ fontWeight: 500 }}
                  >
                    <RotateCcw className="w-3 h-3" /> Retry
                  </button>
                </div>
              )}
            </motion.div>
          );
        })}

        {completedCount > 0 && (
          <p className="text-[11px] text-[#94a3b8] text-center mt-1">
            {completedCount}/{totalPhrases} phrases practiced
          </p>
        )}
      </div>

      {footer}
    </motion.div>
  );
}
