/**
 * ==============================================================
 *  PhrasesLayer — "Phrases & Practice" tab inside a briefing card
 *
 *  Each key phrase has a micro-flow:
 *    1. Listen  → TTS plays the phrase
 *    2. Shadow  → user records themselves repeating it
 *
 *  Practicing phrases is OPTIONAL — purely informational tracking.
 *  Navigation is handled by BriefingCard's next/prev buttons.
 * ==============================================================
 */

import { useState, useCallback } from "react";
import { Play, Square, Mic, Check, Volume2 } from "lucide-react";
import { motion } from "motion/react";
import type { ScriptHighlight } from "../../../services/types";
import { useBriefingTTS } from "./useBriefingTTS";
import { useMediaRecorder } from "../../hooks/useMediaRecorder";
import { RecordingWaveformBars, RecordingTimer } from "../shared";

type PhraseStep = "idle" | "listened" | "recording" | "done";

interface PhraseState {
    step: PhraseStep;
}

interface PhrasesLayerProps {
    cardId: number;
    phrases: ScriptHighlight[];
}

export function PhrasesLayer({ cardId, phrases }: PhrasesLayerProps) {
    const tts = useBriefingTTS();
    const recorder = useMediaRecorder();

    /* Per-phrase state */
    const [phraseStates, setPhraseStates] = useState<PhraseState[]>(
        () => phrases.map(() => ({ step: "idle" }))
    );
    /* Track which phrase is currently being recorded (only one at a time) */
    const [recordingIdx, setRecordingIdx] = useState<number | null>(null);

    const completedCount = phraseStates.filter((s) => s.step === "done").length;

    /* Update a single phrase's step */
    const updatePhrase = useCallback((idx: number, step: PhraseStep) => {
        setPhraseStates((prev) => {
            const next = [...prev];
            next[idx] = { step };
            return next;
        });
    }, []);

    /* TTS: listen to one phrase */
    const handleListen = useCallback(
        (phrase: ScriptHighlight, idx: number) => {
            const key = `card-${cardId}-phrase-${idx}`;
            tts.play(key, phrase.phrase);

            /* Mark as listened (at minimum) */
            setPhraseStates((prev) => {
                if (prev[idx].step === "idle") {
                    const next = [...prev];
                    next[idx] = { step: "listened" };
                    return next;
                }
                return prev;
            });
        },
        [cardId, tts]
    );

    /* Record: shadow one phrase */
    const handleStartRecording = useCallback(
        async (idx: number) => {
            tts.stop(); // stop any TTS
            setRecordingIdx(idx);
            updatePhrase(idx, "recording");
            await recorder.start();
        },
        [tts, recorder, updatePhrase]
    );

    const handleStopRecording = useCallback(
        async (idx: number) => {
            await recorder.stop();
            setRecordingIdx(null);
            updatePhrase(idx, "done");
        },
        [recorder, updatePhrase]
    );

    if (!phrases.length) {
        return (
            <div className="p-4 text-center text-sm text-[#62748e]">
                No key phrases for this question.
            </div>
        );
    }

    return (
        <div className="space-y-3 p-5 md:p-6">
            <p className="text-xs text-[#62748e] mb-2">
                Listen and shadow the phrases you'd like to practice
            </p>

            {phrases.map((kp, i) => {
                const state = phraseStates[i];
                const ttsKey = `card-${cardId}-phrase-${i}`;
                const isPlaying = tts.playingKey === ttsKey;
                const isRecording = recordingIdx === i && recorder.isRecording;
                const isRecordingStarting = recordingIdx === i && state.step === "recording" && !recorder.isRecording;
                const isDone = state.step === "done";
                const hasListened = state.step !== "idle";
                /* Disable interaction while another phrase is recording */
                const otherRecording = recordingIdx !== null && recordingIdx !== i;

                return (
                    <motion.div
                        key={i}
                        className={`rounded-xl border transition-all overflow-hidden ${isRecording
                                ? "border-red-300 bg-red-50/30 shadow-sm"
                                : isPlaying
                                    ? "border-[#6366f1]/40 bg-[#eef2ff] shadow-sm"
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
                            {/* Status icon */}
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${isDone
                                        ? "bg-emerald-500 text-white"
                                        : isPlaying
                                            ? "bg-[#6366f1] text-white"
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
                                <p
                                    className="text-sm text-[#0f172b] leading-snug"
                                    style={{ fontWeight: 500 }}
                                >
                                    "{kp.phrase}"
                                </p>
                                {kp.tooltip && (
                                    <p className="text-xs text-[#62748e] mt-0.5 truncate">{kp.tooltip}</p>
                                )}
                            </div>

                            {/* Waveform when playing TTS */}
                            {isPlaying && (
                                <div className="flex items-end gap-[2px] h-4 shrink-0">
                                    {[0, 1, 2, 3].map((j) => (
                                        <div
                                            key={j}
                                            className="w-[3px] rounded-full bg-[#6366f1] animate-eq-bar"
                                            style={{ animationDelay: `${j * 0.12}s` }}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Action buttons row */}
                        {!isDone && (
                            <div className="flex items-center gap-2 px-4 pb-3">
                                {/* Listen button */}
                                <button
                                    onClick={() => handleListen(kp, i)}
                                    disabled={otherRecording}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all ${isPlaying
                                            ? "bg-[#6366f1] text-white"
                                            : hasListened
                                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                                : "bg-[#f1f5f9] text-[#45556c] hover:bg-[#e2e8f0]"
                                        } ${otherRecording ? "opacity-40 cursor-not-allowed" : ""}`}
                                    style={{ fontWeight: 500 }}
                                    aria-label={`Listen to phrase ${i + 1}`}
                                >
                                    {isPlaying ? (
                                        <Square className="w-3 h-3" fill="currentColor" />
                                    ) : hasListened ? (
                                        <Check className="w-3 h-3" />
                                    ) : (
                                        <Volume2 className="w-3 h-3" />
                                    )}
                                    {isPlaying ? "Stop" : hasListened ? "Heard" : "Listen"}
                                </button>

                                {/* Practice It button — always visible, disabled until listened */}
                                {!isRecording && !isRecordingStarting && (
                                    <button
                                        onClick={() => handleStartRecording(i)}
                                        disabled={!hasListened || otherRecording}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all ${!hasListened || otherRecording
                                                ? "bg-[#e2e8f0] text-[#94a3b8] cursor-not-allowed"
                                                : "bg-[#0f172b] text-white hover:bg-[#1d293d]"
                                            }`}
                                        style={{ fontWeight: 500 }}
                                        aria-label={`Record yourself saying phrase ${i + 1}`}
                                    >
                                        <Mic className="w-3 h-3" />
                                        Practice It
                                    </button>
                                )}

                                {/* Recording starting spinner */}
                                {isRecordingStarting && (
                                    <div className="flex items-center gap-1.5 text-xs text-[#45556c]">
                                        <div className="w-4 h-4 border-2 border-[#e2e8f0] border-t-[#6366f1] rounded-full animate-spin" />
                                        Starting mic...
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Recording active UI */}
                        {isRecording && (
                            <motion.div
                                className="px-4 pb-3 flex flex-col items-center gap-2"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                transition={{ duration: 0.2 }}
                            >
                                <RecordingWaveformBars color="#ef4444" count={5} height={20} />
                                <RecordingTimer timeMs={recorder.recordingTime} />
                                <button
                                    onClick={() => handleStopRecording(i)}
                                    className="flex items-center gap-1.5 bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600 transition-colors text-xs"
                                    style={{ fontWeight: 500 }}
                                    aria-label="Stop recording"
                                >
                                    <Square className="w-3 h-3" fill="currentColor" />
                                    Done
                                </button>
                            </motion.div>
                        )}

                        {/* Done state inline */}
                        {isDone && (
                            <div className="px-4 pb-3">
                                <span className="text-[11px] text-emerald-600 flex items-center gap-1" style={{ fontWeight: 500 }}>
                                    <Check className="w-3 h-3" />
                                    Listened & shadowed
                                </span>
                            </div>
                        )}
                    </motion.div>
                );
            })}

            {/* Informational progress — no gating */}
            {completedCount > 0 && (
                <p className="text-[11px] text-[#94a3b8] text-center mt-2">
                    {completedCount}/{phrases.length} phrases practiced
                </p>
            )}

            {recorder.error && (
                <p className="text-xs text-red-500 text-center">{recorder.error}</p>
            )}
        </div>
    );
}