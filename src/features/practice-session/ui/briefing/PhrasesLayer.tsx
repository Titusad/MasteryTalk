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
import { Play, Square, Mic, Check, Volume2, Loader2, Lightbulb, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import type { ScriptHighlight } from "@/services/types";
import { realSpeechService } from "@/services";
import { useBriefingTTS } from "./useBriefingTTS";
import { useMediaRecorder } from "@/shared/hooks/useMediaRecorder";
import { RecordingWaveformBars, RecordingTimer } from "@/shared/ui";

type PhraseStep = "idle" | "listened" | "recording" | "processing" | "done";

interface DrillResult {
    accuracy: number;
    fluency: number;
    prosody: number;
    overall: number;
    wordResults: { word: string; score: number; errorType: string }[];
}

interface PhraseState {
    step: PhraseStep;
    result?: DrillResult | null;
    errorMsg?: string;
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

    /* Update a single phrase's state cleanly */
    const updatePhraseState = useCallback((idx: number, newState: Partial<PhraseState>) => {
        setPhraseStates((prev: PhraseState[]) => {
            const next = [...prev];
            next[idx] = { ...next[idx], ...newState };
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

    const handleStartRecording = useCallback(
        async (idx: number) => {
            tts.stop(); // stop any TTS
            setRecordingIdx(idx);
            updatePhraseState(idx, { step: "recording", errorMsg: undefined });
            await recorder.start();
        },
        [tts, recorder, updatePhraseState]
    );

    const handleStopRecording = useCallback(
        async (idx: number, phraseText: string) => {
            const blob = await recorder.stop();
            setRecordingIdx(null);
            
            if (!blob || blob.size < 1000) {
                updatePhraseState(idx, { step: "idle", errorMsg: "Audio too short. Please try again." });
                return;
            }

            // Show processing
            updatePhraseState(idx, { step: "processing", errorMsg: undefined });

            try {
                const assessment = await realSpeechService.assessPronunciation(blob, phraseText);
                if (assessment) {
                    const drillResult: DrillResult = {
                        accuracy: assessment.accuracyScore,
                        fluency: assessment.fluencyScore,
                        prosody: assessment.prosodyScore,
                        overall: assessment.pronScore,
                        wordResults: assessment.words.map((w) => ({
                            word: w.word,
                            score: w.accuracyScore,
                            errorType: w.errorType,
                        })),
                    };
                    updatePhraseState(idx, { step: "done", result: drillResult });
                } else {
                    updatePhraseState(idx, { step: "idle", errorMsg: "Could not evaluate pronunciation." });
                }
            } catch (err) {
                updatePhraseState(idx, { step: "idle", errorMsg: "Evaluation failed. Please check your connection." });
            }
        },
        [recorder, updatePhraseState]
    );

    const handleRetry = useCallback((idx: number) => {
        updatePhraseState(idx, { step: "listened", result: null, errorMsg: undefined }); // allows immediate practice
    }, [updatePhraseState]);

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
                const isProcessing = state.step === "processing";
                const isDone = state.step === "done";
                const hasListened = state.step !== "idle";
                /* Disable interaction while another phrase is recording or processing */
                const otherRecording = (recordingIdx !== null && recordingIdx !== i);

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
                                                : isProcessing
                                                    ? "bg-indigo-100 text-indigo-500"
                                                    : "bg-[#f1f5f9] text-[#45556c]"
                                    }`}
                            >
                                {isDone ? (
                                    <Check className="w-3.5 h-3.5" />
                                ) : isRecording ? (
                                    <Mic className="w-3.5 h-3.5" />
                                ) : isProcessing ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
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
                                {state.errorMsg && (
                                    <p className="text-[11px] text-red-500 mt-1.5">{state.errorMsg}</p>
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
                        {!isDone && !isProcessing && (
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
                                    onClick={() => handleStopRecording(i, kp.phrase)}
                                    className="flex items-center gap-1.5 bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600 transition-colors text-xs"
                                    style={{ fontWeight: 500 }}
                                    aria-label="Stop recording"
                                >
                                    <Square className="w-3 h-3" fill="currentColor" />
                                    Done
                                </button>
                            </motion.div>
                        )}

                        {/* Processing state */}
                        {isProcessing && (
                            <div className="px-4 pb-3 flex items-center gap-2 text-[#6366f1] text-xs" style={{ fontWeight: 500 }}>
                                Evaluating pronunciation...
                            </div>
                        )}

                        {/* Done state with Results inline */}
                        {isDone && state.result && (
                            <div className="px-4 pb-4">
                                <div className="p-3 bg-white/50 border border-[#e2e8f0] rounded-xl flex flex-col gap-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="text-center">
                                                <div className="relative group inline-block">
                                                    <p className="text-[9px] text-[#94a3b8] uppercase tracking-wider cursor-help border-b border-dashed border-[#cbd5e1] pb-0.5" style={{ fontWeight: 600 }}>Accuracy</p>
                                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 w-44 p-2 bg-[#0f172b] text-white text-[10px] leading-relaxed rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 text-center pointer-events-none">
                                                        Mide qué tan fiel fue tu pronunciación comparada con los fonemas de palabras nativas.
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="w-px h-6 bg-[#e2e8f0]" />
                                            <div className="text-center">
                                                <p className="text-lg text-[#0f172b]" style={{ fontWeight: 700 }}>
                                                    {Math.round(state.result.fluency)}%
                                                </p>
                                                <p className="text-[9px] text-[#94a3b8] uppercase tracking-wider" style={{ fontWeight: 600 }}>Fluency</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleRetry(i)}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#e2e8f0] text-xs text-[#45556c] hover:bg-[#f8fafc] transition-colors"
                                            style={{ fontWeight: 500 }}
                                        >
                                            <RotateCcw className="w-3 h-3" />
                                            Retry
                                        </button>
                                    </div>
                                    
                                    {/* Fluency Tip */}
                                    {state.result.fluency < 80 && (
                                        <div className="flex items-start gap-2 bg-indigo-50/50 border border-indigo-100 rounded-lg p-2.5">
                                            <Lightbulb className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                                            <p className="text-[11px] text-indigo-700 leading-relaxed">
                                                Try to link the words smoothly. Listen to the native pronunciation again to catch the rhythm.
                                            </p>
                                        </div>
                                    )}

                                    {/* Words Breakdown */}
                                    <div className="flex flex-wrap gap-1 mt-0.5">
                                        {state.result.wordResults.map((w: { word: string; score: number; errorType: string }, wIdx: number) => {
                                            const isOmission = w.errorType === "Omission";
                                            const isBad = w.score < 60 || isOmission;
                                            const isWarn = w.score >= 60 && w.score < 80 && !isOmission;

                                            return (
                                                <div key={wIdx} className="relative group cursor-help">
                                                    <span
                                                        className={`text-xs px-1.5 py-0.5 rounded transition-colors ${
                                                            isOmission
                                                                ? "text-red-400 line-through bg-red-50/50"
                                                                : isBad
                                                                ? "text-red-600 bg-red-50"
                                                                : isWarn
                                                                ? "text-amber-600 bg-amber-50"
                                                                : "text-emerald-700"
                                                        }`}
                                                        style={{ fontWeight: isBad || isWarn ? 600 : 400 }}
                                                    >
                                                        {w.word}
                                                    </span>
                                                    {/* Tooltip */}
                                                    {(isBad || isWarn) && (
                                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 w-max max-w-[120px] bg-[#0f172b] text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10 text-center">
                                                            {isOmission ? "Word skipped" : `${Math.round(w.score)}% accuracy`}
                                                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#0f172b]" />
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
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