/**
 * ==============================================================
 *  inFluentia PRO - Pronunciation Tab (Session Feedback Tab 2)
 *
 *  Three sections:
 *  1. Pronunciation Replay Overview - session scores (Accuracy, Fluency, Intonation & Flow)
 *  2. Shadowing Tool (Modal-based) - practice full sentences with Listen -> Record -> Compare flow
 *  3. Fluency Insights - hesitation analysis + actionable tips
 *
 *  Consumes TurnPronunciationData[] from the voice practice session.
 *  Pronunciation scores come EXCLUSIVELY from Azure Speech AI.
 * ==============================================================
 */

import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import {
    Mic,
    AlertTriangle,
    Zap,
    ChevronDown,
    ChevronRight,
    Award,
    BarChart3,
    MessageSquare,
    Square,
    Loader2,
    CheckCircle2,
    RotateCcw,
    Volume2,
    Headphones,
    Play,
    ArrowRight,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import type { TurnPronunciationData } from "../../services/types";
import { realSpeechService } from "../../services";
import { shadowingScoresCache } from "../utils/sessionCache";
import { ShadowingModal, extractShadowingPhrases } from "./ShadowingModal";
import type { ShadowingPhrase } from "./ShadowingModal";

/* --- Score color helpers --- */

function scoreColor(score: number): string {
    if (score >= 80) return "#22c55e";
    if (score >= 60) return "#f59e0b";
    return "#ef4444";
}

function scoreBg(score: number): string {
    if (score >= 80) return "rgba(34,197,94,0.12)";
    if (score >= 60) return "rgba(245,158,11,0.12)";
    return "rgba(239,68,68,0.12)";
}

function scoreLabel(score: number): string {
    if (score >= 90) return "Excellent";
    if (score >= 80) return "Good";
    if (score >= 60) return "Fair";
    if (score >= 40) return "Needs Work";
    return "Practice More";
}

/* --- Circular Score Gauge --- */

function ScoreGauge({
    score,
    label,
    size = 100,
    strokeWidth = 7,
    delay = 0,
}: {
    score: number;
    label: string;
    size?: number;
    strokeWidth?: number;
    delay?: number;
}) {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const filled = (score / 100) * circumference;
    const color = scoreColor(score);

    return (
        <motion.div
            className="flex flex-col items-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay }}
        >
            <div className="relative" style={{ width: size, height: size }}>
                <svg width={size} height={size} className="-rotate-90">
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke="rgba(255,255,255,0.08)"
                        strokeWidth={strokeWidth}
                    />
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
                        animate={{ strokeDashoffset: circumference - filled }}
                        transition={{ duration: 1.2, delay: delay + 0.3, ease: "easeOut" }}
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span
                        className="text-xl text-white"
                        style={{ fontWeight: 700, color }}
                    >
                        {Math.round(score)}
                    </span>
                </div>
            </div>
            <p
                className="text-xs text-white/60 mt-2 text-center"
                style={{ fontWeight: 500 }}
            >
                {label}
            </p>
        </motion.div>
    );
}

/* --- Data processing utilities --- */

function computeSessionScores(turns: TurnPronunciationData[]) {
    if (turns.length === 0)
        return { accuracy: 0, fluency: 0, prosody: 0, overall: 0 };

    const accuracy =
        turns.reduce((s, t) => s + t.assessment.accuracyScore, 0) / turns.length;
    const fluency =
        turns.reduce((s, t) => s + t.assessment.fluencyScore, 0) / turns.length;
    const prosody =
        turns.reduce((s, t) => s + t.assessment.prosodyScore, 0) / turns.length;
    const overall =
        turns.reduce((s, t) => s + t.assessment.pronScore, 0) / turns.length;

    return { accuracy, fluency, prosody, overall };
}

/**
 * Compute fluency insights from the turn data.
 */
function computeFluencyInsights(turns: TurnPronunciationData[]) {
    if (turns.length === 0)
        return {
            avgFluency: 0,
            avgProsody: 0,
            totalWords: 0,
            totalProblemWords: 0,
            hesitationTriggers: [] as string[],
            tip: "Complete a session to see fluency insights.",
        };

    const avgFluency =
        turns.reduce((s, t) => s + t.assessment.fluencyScore, 0) / turns.length;
    const avgProsody =
        turns.reduce((s, t) => s + t.assessment.prosodyScore, 0) / turns.length;
    const totalWords = turns.reduce((s, t) => s + t.assessment.wordCount, 0);
    const totalProblemWords = turns.reduce(
        (s, t) => s + t.assessment.problemWordCount,
        0
    );

    // Find words that likely caused hesitation (low accuracy + mispronunciation)
    const problemWordMap = new Map<string, number>();
    for (const turn of turns) {
        for (const w of turn.assessment.words) {
            if (w.accuracyScore < 60 || w.errorType === "Mispronunciation") {
                const key = w.word.toLowerCase();
                problemWordMap.set(key, (problemWordMap.get(key) || 0) + 1);
            }
        }
    }

    const hesitationTriggers = Array.from(problemWordMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([word]) => word);

    // Generate contextual tip
    let tip: string;
    if (avgFluency >= 80) {
        tip =
            "Your speech flow is strong. Focus on refining intonation and rhythm for even more natural delivery.";
    } else if (avgFluency >= 60) {
        tip =
            "Practice linking words together smoothly. Try reading professional articles aloud for 5 minutes daily.";
    } else {
        tip =
            "Start with shorter sentences and gradually build complexity. Record yourself and compare with native speakers.";
    }

    return {
        avgFluency,
        avgProsody,
        totalWords,
        totalProblemWords,
        hesitationTriggers,
        tip,
    };
}

/* ================================================================
   SHADOWING DRILL — Listen -> Record -> Compare flow
   ================================================================ */

type ShadowStep = "listen" | "recording" | "processing" | "result" | "error";

interface DrillResult {
    accuracy: number;
    fluency: number;
    prosody: number;
    overall: number;
    wordResults: { word: string; score: number; errorType: string }[];
}

function ShadowingDrill({ phrase, onScoreUpdate }: { phrase: string; onScoreUpdate?: (result: DrillResult) => void }) {
    const [step, setStep] = useState<ShadowStep>("listen");
    const [result, setResult] = useState<DrillResult | null>(null);
    const [errorMsg, setErrorMsg] = useState("");
    const [isPlaying, setIsPlaying] = useState(false);
    const [hasListened, setHasListened] = useState(false);
    const stopPlaybackRef = useRef<(() => void) | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const streamRef = useRef<MediaStream | null>(null);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopPlaybackRef.current?.();
            streamRef.current?.getTracks().forEach((t) => t.stop());
        };
    }, []);

    const playNativeAudio = useCallback(async () => {
        if (isPlaying) {
            stopPlaybackRef.current?.();
            setIsPlaying(false);
            return;
        }
        setIsPlaying(true);
        try {
            const { stop } = await realSpeechService.speak(phrase);
            stopPlaybackRef.current = stop;
            setHasListened(true);
            // Auto-stop after estimated time (phrase length * ~80ms/char + buffer)
            const estimatedMs = Math.max(2000, phrase.length * 80 + 1000);
            setTimeout(() => {
                setIsPlaying(false);
                stopPlaybackRef.current = null;
            }, estimatedMs);
        } catch (err) {
            console.error("[ShadowingDrill] TTS error:", err);
            setIsPlaying(false);
            // Still allow recording even if TTS fails
            setHasListened(true);
        }
    }, [phrase, isPlaying]);

    const startRecording = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
                ? "audio/webm;codecs=opus"
                : MediaRecorder.isTypeSupported("audio/mp4")
                    ? "audio/mp4"
                    : "audio/webm";

            const recorder = new MediaRecorder(stream, { mimeType });
            mediaRecorderRef.current = recorder;
            chunksRef.current = [];

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            recorder.onstop = async () => {
                stream.getTracks().forEach((t) => t.stop());
                streamRef.current = null;

                const blob = new Blob(chunksRef.current, { type: mimeType });
                if (blob.size < 1000) {
                    setStep("listen");
                    return;
                }

                setStep("processing");

                try {
                    // Azure gets the CORRECT phrase as referenceText (not Whisper output!)
                    const assessment = await realSpeechService.assessPronunciation(
                        blob,
                        phrase
                    );
                    if (assessment) {
                        setResult({
                            accuracy: assessment.accuracyScore,
                            fluency: assessment.fluencyScore,
                            prosody: assessment.prosodyScore,
                            overall: assessment.pronScore,
                            wordResults: assessment.words.map((w) => ({
                                word: w.word,
                                score: w.accuracyScore,
                                errorType: w.errorType,
                            })),
                        });
                        setStep("result");
                        if (onScoreUpdate) {
                            onScoreUpdate({
                                accuracy: assessment.accuracyScore,
                                fluency: assessment.fluencyScore,
                                prosody: assessment.prosodyScore,
                                overall: assessment.pronScore,
                                wordResults: assessment.words.map((w) => ({
                                    word: w.word,
                                    score: w.accuracyScore,
                                    errorType: w.errorType,
                                })),
                            });
                        }
                    } else {
                        setErrorMsg(
                            "Could not assess pronunciation. Try speaking more clearly."
                        );
                        setStep("error");
                    }
                } catch (err) {
                    console.error("[ShadowingDrill] Assessment error:", err);
                    setErrorMsg("Assessment failed. Please try again.");
                    setStep("error");
                }
            };

            recorder.start(250);
            setStep("recording");
        } catch (err) {
            console.error("[ShadowingDrill] Mic access failed:", err);
        }
    }, [phrase, onScoreUpdate]);

    const stopRecording = useCallback(() => {
        mediaRecorderRef.current?.stop();
    }, []);

    const resetDrill = useCallback(() => {
        setStep("listen");
        setResult(null);
        setErrorMsg("");
        setHasListened(false);
    }, []);

    /* -- Step: Listen first -- */
    if (step === "listen") {
        return (
            <div className="mt-3 space-y-2.5">
                {/* Step indicator */}
                <div className="flex items-center gap-4 mb-1">
                    <div className="flex items-center gap-1.5">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${hasListened ? 'bg-[#22c55e] text-white' : 'bg-[#6366f1] text-white'}`} style={{ fontWeight: 700 }}>
                            {hasListened ? '✓' : '1'}
                        </div>
                        <span className="text-[10px] text-[#45556c]" style={{ fontWeight: 600 }}>Listen</span>
                    </div>
                    <div className="h-px flex-1 bg-[#e2e8f0]" />
                    <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] bg-[#e2e8f0] text-[#94a3b8]" style={{ fontWeight: 700 }}>2</div>
                        <span className="text-[10px] text-[#94a3b8]" style={{ fontWeight: 500 }}>Record</span>
                    </div>
                    <div className="h-px flex-1 bg-[#e2e8f0]" />
                    <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] bg-[#e2e8f0] text-[#94a3b8]" style={{ fontWeight: 700 }}>3</div>
                        <span className="text-[10px] text-[#94a3b8]" style={{ fontWeight: 500 }}>Compare</span>
                    </div>
                </div>

                {/* Listen button */}
                <button
                    onClick={playNativeAudio}
                    className={`w-full py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer ${isPlaying
                            ? "bg-[#0f172b] text-white"
                            : "bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white hover:from-[#4f46e5] hover:to-[#7c3aed]"
                        }`}
                    style={{ fontWeight: 500 }}
                >
                    {isPlaying ? (
                        <>
                            <Volume2 className="w-4 h-4 animate-pulse" />
                            <span className="text-sm">Playing native pronunciation...</span>
                        </>
                    ) : (
                        <>
                            <Headphones className="w-4 h-4" />
                            <span className="text-sm">
                                {hasListened ? "Listen Again" : "Step 1: Listen to Native Pronunciation"}
                            </span>
                        </>
                    )}
                </button>

                {/* Record button (enabled after listening, or skip) */}
                <button
                    onClick={startRecording}
                    className={`w-full py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${hasListened
                            ? "bg-[#0f172b] text-white hover:bg-[#1e293b] shadow-sm"
                            : "bg-[#f1f5f9] text-[#94a3b8] hover:bg-[#e2e8f0] hover:text-[#64748b]"
                        }`}
                    style={{ fontWeight: 500 }}
                >
                    <Mic className="w-4 h-4" />
                    <span className="text-sm">
                        {hasListened ? "Step 2: Record Yourself" : "Skip to Recording"}
                    </span>
                    {hasListened && <ArrowRight className="w-3.5 h-3.5 ml-1" />}
                </button>
            </div>
        );
    }

    /* -- Step: Recording -- */
    if (step === "recording") {
        return (
            <div className="mt-3 bg-[#fef2f2] border border-red-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                        <p className="text-sm text-red-600" style={{ fontWeight: 600 }}>
                            Recording... Repeat the phrase
                        </p>
                    </div>
                    <button
                        onClick={stopRecording}
                        className="bg-red-500 text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 hover:bg-red-600 transition-colors cursor-pointer"
                    >
                        <Square className="w-3 h-3" />
                        <span className="text-xs" style={{ fontWeight: 500 }}>
                            Stop
                        </span>
                    </button>
                </div>
                <p className="text-xs text-red-400">
                    Say: &ldquo;{phrase}&rdquo;
                </p>
            </div>
        );
    }

    /* -- Step: Processing -- */
    if (step === "processing") {
        return (
            <div className="mt-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-4 flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 text-[#6366f1] animate-spin" />
                <p className="text-sm text-[#45556c]" style={{ fontWeight: 500 }}>
                    Analyzing your pronunciation...
                </p>
            </div>
        );
    }

    /* -- Step: Error -- */
    if (step === "error") {
        return (
            <div className="mt-3 bg-[#fef2f2] border border-[#fecaca] rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-[#ef4444]" />
                    <p className="text-sm text-[#dc2626]" style={{ fontWeight: 500 }}>
                        {errorMsg}
                    </p>
                </div>
                <button
                    onClick={() => { setStep("listen"); setErrorMsg(""); }}
                    className="flex items-center gap-1.5 text-xs text-[#6366f1] hover:text-[#4f46e5] transition-colors cursor-pointer mt-1"
                    style={{ fontWeight: 500 }}
                >
                    <RotateCcw className="w-3 h-3" />
                    Try Again
                </button>
            </div>
        );
    }

    /* -- Step: Result -- */
    if (!result) return null;

    return (
        <motion.div
            className="mt-3 bg-gradient-to-br from-[#f0fdf4] to-[#ecfdf5] border border-[#bbf7d0] rounded-xl p-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
        >
            {/* Step indicator showing completion */}
            <div className="flex items-center gap-4 mb-3">
                <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] bg-[#22c55e] text-white" style={{ fontWeight: 700 }}>✓</div>
                    <span className="text-[10px] text-[#45556c]" style={{ fontWeight: 500 }}>Listen</span>
                </div>
                <div className="h-px flex-1 bg-[#22c55e]" />
                <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] bg-[#22c55e] text-white" style={{ fontWeight: 700 }}>✓</div>
                    <span className="text-[10px] text-[#45556c]" style={{ fontWeight: 500 }}>Record</span>
                </div>
                <div className="h-px flex-1 bg-[#22c55e]" />
                <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] bg-[#22c55e] text-white" style={{ fontWeight: 700 }}>3</div>
                    <span className="text-[10px] text-[#45556c]" style={{ fontWeight: 600 }}>Compare</span>
                </div>
            </div>

            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#22c55e]" />
                    <p className="text-sm text-[#0f172b]" style={{ fontWeight: 600 }}>
                        Your Result
                    </p>
                </div>
                <button
                    onClick={resetDrill}
                    className="flex items-center gap-1 text-xs text-[#6366f1] hover:text-[#4f46e5] transition-colors cursor-pointer"
                    style={{ fontWeight: 500 }}
                >
                    <RotateCcw className="w-3 h-3" />
                    Try Again
                </button>
            </div>

            {/* Score badges */}
            <div className="flex gap-3 mb-3">
                {[
                    { label: "Accuracy", value: result.accuracy },
                    { label: "Fluency", value: result.fluency },
                    { label: "Intonation", value: result.prosody },
                ].map((s) => (
                    <div
                        key={s.label}
                        className="flex-1 text-center rounded-lg py-2"
                        style={{ backgroundColor: scoreBg(s.value) }}
                    >
                        <p
                            className="text-lg"
                            style={{ fontWeight: 700, color: scoreColor(s.value) }}
                        >
                            {Math.round(s.value)}
                        </p>
                        <p className="text-[10px] text-[#45556c]">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Word-level results */}
            <div className="flex flex-wrap gap-1.5">
                {result.wordResults.map((w, i) => (
                    <span
                        key={i}
                        className="text-xs px-2 py-1 rounded-md"
                        style={{
                            fontWeight: 500,
                            backgroundColor: scoreBg(w.score),
                            color: scoreColor(w.score),
                        }}
                    >
                        {w.word}
                        <span className="ml-1 opacity-60">{Math.round(w.score)}</span>
                    </span>
                ))}
            </div>
        </motion.div>
    );
}

/* ================================================================
   MAIN COMPONENT
   ================================================================ */

export interface PronunciationTabProps {
    pronunciationData: TurnPronunciationData[];
    sessionId?: string | null;
    scenarioType?: string;
    scenarioLabel?: string;
}

export function PronunciationTab({
    pronunciationData,
    sessionId,
    scenarioType,
    scenarioLabel = "Practice",
}: PronunciationTabProps) {
    const [showShadowingModal, setShowShadowingModal] = useState(false);

    /* -- Computed data -- */
    const scores = useMemo(
        () => computeSessionScores(pronunciationData),
        [pronunciationData]
    );
    const fluencyInsights = useMemo(
        () => computeFluencyInsights(pronunciationData),
        [pronunciationData]
    );

    /* -- Shadowing phrases (full sentences) for modal -- */
    const shadowingPhrases = useMemo(
        () => extractShadowingPhrases(pronunciationData),
        [pronunciationData]
    );

    /* -- Empty state -- */
    if (pronunciationData.length === 0) {
        return (
            <motion.div
                className="rounded-3xl bg-gradient-to-br from-[#0f172b] to-[#1e293b] p-10 text-center"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <Mic className="w-12 h-12 text-white/20 mx-auto mb-4" />
                <h3 className="text-white text-lg mb-2" style={{ fontWeight: 500 }}>
                    No Pronunciation Data
                </h3>
                <p className="text-white/50 text-sm max-w-md mx-auto">
                    Pronunciation assessment runs automatically during voice practice.
                    Complete a session with at least one voice turn to see your detailed
                    pronunciation analysis here.
                </p>
            </motion.div>
        );
    }

    return (
        <div className="space-y-6">
            {/* ===============================================
         SECTION 1: Pronunciation Replay Overview
         =============================================== */}
            <motion.div
                className="rounded-3xl bg-gradient-to-br from-[#0f172b] to-[#1e293b] p-6 md:p-8"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                {/* Section header */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-[#6366f1] flex items-center justify-center shrink-0">
                        <BarChart3 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl text-white" style={{ fontWeight: 500 }}>
                            Pronunciation Overview
                        </h2>
                        <p className="text-xs text-white/40 mt-0.5">
                            {pronunciationData.length} turn
                            {pronunciationData.length !== 1 ? "s" : ""} analyzed by Azure
                            Speech AI
                        </p>
                    </div>
                </div>

                {/* Score gauges */}
                <div className="flex justify-center gap-6 md:gap-10 mb-8">
                    <ScoreGauge score={scores.accuracy} label="Accuracy" delay={0.1} />
                    <ScoreGauge score={scores.fluency} label="Fluency" delay={0.2} />
                    <ScoreGauge score={scores.prosody} label="Intonation & Flow" delay={0.3} />
                </div>

                {/* Overall score badge */}
                <div className="flex justify-center mb-8">
                    <motion.div
                        className="px-5 py-2.5 rounded-full flex items-center gap-2.5"
                        style={{
                            backgroundColor: scoreBg(scores.overall),
                            border: `1px solid ${scoreColor(scores.overall)}30`,
                        }}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        <Award className="w-4 h-4" style={{ color: scoreColor(scores.overall) }} />
                        <span
                            className="text-sm"
                            style={{ fontWeight: 600, color: scoreColor(scores.overall) }}
                        >
                            Overall: {Math.round(scores.overall)}% &mdash; {scoreLabel(scores.overall)}
                        </span>
                    </motion.div>
                </div>

                {/* Explanation note */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-start gap-2.5">
                    <Zap className="w-3.5 h-3.5 text-[#fbbf24] shrink-0 mt-0.5" />
                    <p className="text-[11px] text-white/50 leading-relaxed">
                        <span style={{ fontWeight: 600, color: "rgba(255,255,255,0.7)" }}>How it works:</span>{" "}
                        During conversation, Azure analyzes your audio in the background. For the most accurate scores, use the Shadowing Tool below &mdash; where you repeat known phrases and get precise word-by-word feedback.
                    </p>
                </div>
            </motion.div>

            {/* ===============================================
         SECTION 2: Shadowing Tool (Modal-based)
         =============================================== */}
            <motion.div
                className="rounded-3xl bg-white border border-[#e2e8f0] p-6 md:p-8"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
            >
                {/* Section header */}
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center shrink-0">
                        <Headphones className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2
                            className="text-xl text-[#0f172b]"
                            style={{ fontWeight: 500 }}
                        >
                            Shadowing Tool
                        </h2>
                        <p className="text-xs text-[#94a3b8] mt-0.5">
                            Practice full sentences with Listen &rarr; Record &rarr; Compare
                        </p>
                    </div>
                </div>

                {/* How it works callout */}
                <div className="bg-[#f0f4ff] border border-[#c7d2fe] rounded-xl p-3 mb-5 flex items-start gap-2.5">
                    <Play className="w-3.5 h-3.5 text-[#6366f1] shrink-0 mt-0.5" />
                    <p className="text-[11px] text-[#45556c] leading-relaxed">
                        <span style={{ fontWeight: 600 }}>Why this works:</span>{" "}
                        Azure compares your audio against the <em>exact target phrase</em> &mdash; giving you precise, word-by-word pronunciation scores. Practice complete sentences from your conversation for maximum impact.
                    </p>
                </div>

                {shadowingPhrases.length === 0 ? (
                    <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl p-5 text-center">
                        <Award className="w-8 h-8 text-[#22c55e] mx-auto mb-2" />
                        <p className="text-sm text-[#0f172b]" style={{ fontWeight: 500 }}>
                            Great job! No significant pronunciation issues detected.
                        </p>
                        <p className="text-xs text-[#45556c] mt-1">
                            Your accuracy was consistently high across all turns.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Phrase preview list */}
                        <div className="space-y-2 mb-5">
                            {shadowingPhrases.map((sp, idx) => (
                                <motion.div
                                    key={sp.id}
                                    className="flex items-center gap-3 p-3 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]"
                                    initial={{ opacity: 0, x: -8 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 + idx * 0.06 }}
                                >
                                    <span
                                        className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] shrink-0"
                                        style={{
                                            fontWeight: 700,
                                            backgroundColor: scoreBg(sp.originalScore),
                                            color: scoreColor(sp.originalScore),
                                        }}
                                    >
                                        {idx + 1}
                                    </span>
                                    <p className="text-sm text-[#1e293b] flex-1 min-w-0 truncate" style={{ fontWeight: 500 }}>
                                        {sp.sentence}
                                    </p>
                                    <span
                                        className="text-[10px] px-2 py-0.5 rounded-full shrink-0"
                                        style={{
                                            fontWeight: 600,
                                            backgroundColor: scoreBg(sp.originalScore),
                                            color: scoreColor(sp.originalScore),
                                        }}
                                    >
                                        {Math.round(sp.originalScore)}%
                                    </span>
                                </motion.div>
                            ))}
                        </div>

                        {/* CTA button */}
                        <motion.button
                            onClick={() => setShowShadowingModal(true)}
                            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white text-sm hover:from-[#4f46e5] hover:to-[#7c3aed] transition-all shadow-md shadow-[#6366f1]/20 cursor-pointer flex items-center justify-center gap-2"
                            style={{ fontWeight: 600 }}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                        >
                            <Headphones className="w-4 h-4" />
                            Start Shadowing Practice ({shadowingPhrases.length} phrase{shadowingPhrases.length !== 1 ? "s" : ""})
                        </motion.button>
                    </>
                )}
            </motion.div>

            {/* Shadowing Modal */}
            {showShadowingModal && shadowingPhrases.length > 0 && (
                <ShadowingModal
                    phrases={shadowingPhrases}
                    scenarioLabel={scenarioLabel}
                    scenarioType={scenarioType}
                    sessionId={sessionId}
                    mode="practice"
                    onClose={() => setShowShadowingModal(false)}
                />
            )}

            {/* ===============================================
         SECTION 3: Fluency Insights
         =============================================== */}
            <motion.div
                className="rounded-3xl bg-gradient-to-br from-[#0f172b] to-[#1e293b] p-6 md:p-8"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
            >
                {/* Section header */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-[#8b5cf6] flex items-center justify-center shrink-0">
                        <MessageSquare className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl text-white" style={{ fontWeight: 500 }}>
                            Fluency Insights
                        </h2>
                        <p className="text-xs text-white/40 mt-0.5">
                            How natural & smooth your speech sounded
                        </p>
                    </div>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                    {[
                        {
                            label: "Fluency",
                            value: `${Math.round(fluencyInsights.avgFluency)}%`,
                            sub: scoreLabel(fluencyInsights.avgFluency),
                            color: scoreColor(fluencyInsights.avgFluency),
                        },
                        {
                            label: "Intonation & Flow",
                            value: `${Math.round(fluencyInsights.avgProsody)}%`,
                            sub: scoreLabel(fluencyInsights.avgProsody),
                            color: scoreColor(fluencyInsights.avgProsody),
                        },
                        {
                            label: "Words Spoken",
                            value: String(fluencyInsights.totalWords),
                            sub: `${pronunciationData.length} turns`,
                            color: "#60a5fa",
                        },
                        {
                            label: "Problem Words",
                            value: String(fluencyInsights.totalProblemWords),
                            sub:
                                fluencyInsights.totalWords > 0
                                    ? `${Math.round((fluencyInsights.totalProblemWords / fluencyInsights.totalWords) * 100)}% of total`
                                    : "\u2014",
                            color:
                                fluencyInsights.totalProblemWords > 5 ? "#ef4444" : "#22c55e",
                        },
                    ].map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            className="bg-white/5 border border-white/10 rounded-xl p-4 text-center"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.35 + i * 0.05 }}
                        >
                            <p
                                className="text-xl mb-1"
                                style={{ fontWeight: 700, color: stat.color }}
                            >
                                {stat.value}
                            </p>
                            <p
                                className="text-xs text-white/60"
                                style={{ fontWeight: 500 }}
                            >
                                {stat.label}
                            </p>
                            <p className="text-[10px] text-white/30 mt-0.5">{stat.sub}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Hesitation triggers */}
                {fluencyInsights.hesitationTriggers.length > 0 && (
                    <motion.div
                        className="mb-6"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        <div className="flex items-center gap-2 mb-3">
                            <AlertTriangle className="w-4 h-4 text-[#f59e0b]" />
                            <p
                                className="text-sm text-white/70"
                                style={{ fontWeight: 500 }}
                            >
                                Words Causing Hesitation
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {fluencyInsights.hesitationTriggers.map((word, i) => (
                                <motion.span
                                    key={word}
                                    className="bg-[#f59e0b]/15 border border-[#f59e0b]/30 text-[#fbbf24] text-sm px-3 py-1.5 rounded-lg"
                                    style={{ fontWeight: 500 }}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.55 + i * 0.05 }}
                                >
                                    {word}
                                </motion.span>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Actionable tip */}
                <motion.div
                    className="bg-white/5 border border-white/10 rounded-xl p-5 flex items-start gap-3"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                >
                    <div className="w-8 h-8 rounded-full bg-[#8b5cf6]/20 flex items-center justify-center shrink-0">
                        <Zap className="w-4 h-4 text-[#a78bfa]" />
                    </div>
                    <div>
                        <p
                            className="text-[10px] uppercase tracking-wider text-[#a78bfa] mb-1"
                            style={{ fontWeight: 600 }}
                        >
                            Personalized Tip
                        </p>
                        <p className="text-sm text-white/80 leading-relaxed">
                            {fluencyInsights.tip}
                        </p>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
}