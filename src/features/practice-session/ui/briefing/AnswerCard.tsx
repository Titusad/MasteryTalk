/**
 * ==============================================================
 *  AnswerCard — Step 3 of the 4-step per-question stepper
 *
 *  User records their answer via voice (primary) using existing
 *  Whisper STT, or types a text fallback. Voice is the primary
 *  path since the goal is pronunciation coaching.
 * ==============================================================
 */

import { useState, useCallback } from "react";
import { motion } from "motion/react";
import {
    Mic,
    Square,
    ArrowLeft,
    ArrowRight,
    Type,
    Loader2,
    RotateCcw,
} from "lucide-react";
import { realSpeechService } from "@/services";
import { useMediaRecorder } from "@/shared/hooks/useMediaRecorder";
import { RecordingWaveformBars, RecordingTimer } from "@/shared/ui";

interface AnswerCardProps {
    question: string;
    onNext: (userDraft: string) => void;
    onBack: () => void;
}

export function AnswerCard({ question, onNext, onBack }: AnswerCardProps) {
    const recorder = useMediaRecorder();
    const [mode, setMode] = useState<"voice" | "text">("voice");
    const [status, setStatus] = useState<"idle" | "recording" | "processing" | "done">("idle");
    const [transcript, setTranscript] = useState("");
    const [textDraft, setTextDraft] = useState("");
    const [error, setError] = useState<string | null>(null);

    /* ── Voice recording ── */
    const handleStartRecording = useCallback(async () => {
        setError(null);
        setStatus("recording");
        try {
            await recorder.start();
        } catch (err) {
            console.error("[AnswerCard] Mic access failed:", err);
            setError("Couldn't access microphone. Try the text option.");
            setStatus("idle");
            setMode("text");
        }
    }, [recorder]);

    const handleStopRecording = useCallback(async () => {
        setStatus("processing");
        try {
            const blob = await recorder.stop();
            if (!blob || blob.size < 500) {
                setError("Recording was too short. Try again.");
                setStatus("idle");
                return;
            }

            // Transcribe using existing Whisper endpoint
            const result = await realSpeechService.transcribeBlob(blob);
            const text = result.text?.trim() || "";

            if (!text) {
                setError("Couldn't catch what you said. Try again or switch to text.");
                setStatus("idle");
                return;
            }

            setTranscript(text);
            setStatus("done");
        } catch (err: any) {
            console.error("[AnswerCard] Transcription failed:", err);
            setError("Transcription failed. Try again or use text input.");
            setStatus("idle");
        }
    }, [recorder]);

    const handleRetry = useCallback(() => {
        setTranscript("");
        setStatus("idle");
        setError(null);
    }, []);

    const handleContinue = useCallback(() => {
        const draft = mode === "voice" ? transcript : textDraft.trim();
        if (draft) {
            onNext(draft);
        }
    }, [mode, transcript, textDraft, onNext]);

    const canContinue = mode === "voice" ? transcript.length > 0 : textDraft.trim().length > 10;

    return (
        <motion.div
            className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm overflow-hidden"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35 }}
        >
            {/* Step indicator */}
            <div className="px-6 py-3 bg-[#f8fafc] border-b border-[#f1f5f9] flex items-center justify-between">
                <span className="text-[11px] text-[#94a3b8]" style={{ fontWeight: 500 }}>
                    Step 3 of 4
                </span>
                <span className="text-[11px] text-[#6366f1]" style={{ fontWeight: 600 }}>
                    Your Answer
                </span>
            </div>

            <div className="px-6 py-6 md:px-8">
                {/* Question reminder */}
                <p className="text-sm text-[#45556c] mb-1" style={{ fontWeight: 500 }}>
                    How would you respond to:
                </p>
                <p className="text-base text-[#0f172b] mb-6" style={{ fontWeight: 600 }}>
                    "{question}"
                </p>

                {/* Mode toggle */}
                <div className="flex items-center gap-2 mb-5">
                    <button
                        onClick={() => setMode("voice")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all ${
                            mode === "voice"
                                ? "bg-[#6366f1] text-white"
                                : "bg-[#f1f5f9] text-[#45556c] hover:bg-[#e2e8f0]"
                        }`}
                        style={{ fontWeight: 500 }}
                    >
                        <Mic className="w-3 h-3" />
                        Voice
                    </button>
                    <button
                        onClick={() => setMode("text")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all ${
                            mode === "text"
                                ? "bg-[#6366f1] text-white"
                                : "bg-[#f1f5f9] text-[#45556c] hover:bg-[#e2e8f0]"
                        }`}
                        style={{ fontWeight: 500 }}
                    >
                        <Type className="w-3 h-3" />
                        Text
                    </button>
                </div>

                {/* Voice mode */}
                {mode === "voice" && (
                    <div className="text-center">
                        {status === "idle" && (
                            <div>
                                <button
                                    onClick={handleStartRecording}
                                    className="w-20 h-20 rounded-full bg-[#0f172b] text-white flex items-center justify-center mx-auto shadow-lg hover:bg-[#1d293d] transition-all hover:scale-105 active:scale-95"
                                >
                                    <Mic className="w-8 h-8" />
                                </button>
                                <p className="text-xs text-[#94a3b8] mt-3">
                                    Tap to record your answer
                                </p>
                            </div>
                        )}

                        {status === "recording" && (
                            <div>
                                <button
                                    onClick={handleStopRecording}
                                    className="w-20 h-20 rounded-full bg-red-500 text-white flex items-center justify-center mx-auto shadow-lg animate-pulse"
                                >
                                    <Square className="w-6 h-6" />
                                </button>
                                <div className="flex items-center justify-center gap-3 mt-4">
                                    <RecordingWaveformBars />
                                    <RecordingTimer timeMs={recorder.recordingTime} />
                                </div>
                                <p className="text-xs text-[#94a3b8] mt-2">
                                    Tap to stop recording
                                </p>
                            </div>
                        )}

                        {status === "processing" && (
                            <div className="py-6">
                                <Loader2 className="w-10 h-10 text-[#6366f1] animate-spin mx-auto mb-3" />
                                <p className="text-sm text-[#45556c]" style={{ fontWeight: 500 }}>
                                    Transcribing your answer...
                                </p>
                            </div>
                        )}

                        {status === "done" && transcript && (
                            <div className="text-left">
                                <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-4 mb-3">
                                    <p className="text-xs text-[#94a3b8] mb-1" style={{ fontWeight: 500 }}>
                                        What you said:
                                    </p>
                                    <p className="text-sm text-[#0f172b] leading-relaxed">
                                        {transcript}
                                    </p>
                                </div>
                                <button
                                    onClick={handleRetry}
                                    className="flex items-center gap-1.5 text-xs text-[#62748e] hover:text-[#0f172b] transition-colors"
                                    style={{ fontWeight: 500 }}
                                >
                                    <RotateCcw className="w-3 h-3" />
                                    Record again
                                </button>
                            </div>
                        )}

                        {error && (
                            <p className="text-xs text-red-500 mt-3">{error}</p>
                        )}
                    </div>
                )}

                {/* Text mode */}
                {mode === "text" && (
                    <div>
                        <textarea
                            value={textDraft}
                            onChange={(e) => setTextDraft(e.target.value)}
                            placeholder="Type how you would respond to this question..."
                            className="w-full h-[120px] bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-4 text-[#0f172b] placeholder:text-[#94a3b8] focus:outline-none focus:border-[#0f172b] focus:bg-white transition-all resize-none"
                            style={{ fontSize: "14px", lineHeight: "22px" }}
                        />
                        {textDraft.length > 0 && (
                            <div className="flex justify-end mt-1">
                                <span className={`text-[10px] ${textDraft.length > 800 ? "text-amber-500" : "text-[#c4cdd5]"}`}>
                                    {textDraft.length} chars
                                </span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Navigation */}
            <div className="px-6 py-6 border-t border-[#f1f5f9] flex flex-col items-center">
                <button
                    onClick={handleContinue}
                    disabled={!canContinue}
                    className={`flex items-center gap-3 px-10 py-5 rounded-full text-xl transition-all shadow-[0px_10px_15px_rgba(0,0,0,0.1)] ${
                        canContinue
                            ? "bg-[#0f172b] text-white hover:bg-[#1d293d]"
                            : "bg-[#e2e8f0] text-[#94a3b8] cursor-not-allowed"
                    }`}
                    style={{ fontWeight: 500 }}
                >
                    Get Feedback
                    <ArrowRight className="w-6 h-6" />
                </button>
                <button
                    onClick={onBack}
                    className="mt-4 flex items-center gap-1.5 text-sm text-[#62748e] hover:text-[#0f172b] transition-colors"
                    style={{ fontWeight: 500 }}
                >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Back
                </button>
            </div>
        </motion.div>
    );
}
