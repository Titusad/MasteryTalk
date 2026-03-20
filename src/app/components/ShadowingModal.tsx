/**
 * ==============================================================
 *  inFluentia PRO - Shadowing Modal
 *
 *  Full-screen modal overlay for pronunciation shadowing practice.
 *  Flow: Listen -> Record -> Compare (per phrase), then Summary.
 *
 *  Design based on card-modal with progress bar, phrase display
 *  with stressed syllables, focus word with IPA, waveform
 *  animations, circular score gauge, and completion summary.
 * ==============================================================
 */

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import {
    X,
    Play,
    Square,
    Volume2,
    Mic,
    RotateCcw,
    ChevronRight,
    PartyPopper,
    AlertTriangle,
    Loader2,
    BookmarkCheck,
    Lightbulb,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import type { TurnPronunciationData, BeforeAfterComparison } from "../../services/types";
import { realSpeechService } from "../../services";
import { shadowingScoresCache } from "../utils/sessionCache";
import {
    createSRPhrase,
    flagPhrasesForReview,
    updatePhraseAfterReview,
    saveSRPhrases,
} from "../utils/spacedRepetition";
import type { SpacedRepetitionPhrase } from "../utils/spacedRepetition";

/* ── Types ── */

export interface ShadowingPhrase {
    id: string;
    /** Full sentence from the conversation turn */
    sentence: string;
    /** Focus word (worst-scoring) */
    focusWord: string;
    /** IPA-like transcription from Azure phonemes */
    ipa: string;
    /** Original accuracy score from session */
    originalScore: number;
    /** Problem words in this sentence */
    problemWords: { word: string; score: number; errorType: string }[];
    /** Turn index for reference */
    turnIndex: number;
}

interface DrillResult {
    accuracy: number;
    fluency: number;
    prosody: number;
    overall: number;
    wordResults: { word: string; score: number; errorType: string }[];
}

type Phase = "idle" | "playing" | "ready" | "recording" | "processing" | "result" | "error";

/* ── Phoneme to IPA mapping (Azure SAPI → IPA) ── */
const PHONEME_IPA: Record<string, string> = {
    aa: "\u0251", ah: "\u028C", ae: "\u00E6", ao: "\u0254", aw: "a\u028A",
    ax: "\u0259", ay: "a\u026A", b: "b", ch: "t\u0283", d: "d",
    dh: "\u00F0", eh: "\u025B", er: "\u025D", ey: "e\u026A", f: "f",
    g: "\u0261", hh: "h", ih: "\u026A", iy: "i", jh: "d\u0292",
    k: "k", l: "l", m: "m", n: "n", ng: "\u014B",
    ow: "o\u028A", oy: "\u0254\u026A", p: "p", r: "\u0279", s: "s",
    sh: "\u0283", t: "t", th: "\u03B8", uh: "\u028A", uw: "u",
    v: "v", w: "w", y: "j", z: "z", zh: "\u0292",
};

function phonemesToIpa(phonemes: { phoneme: string }[]): string {
    if (!phonemes || phonemes.length === 0) return "";
    const ipa = phonemes
        .map((p) => PHONEME_IPA[p.phoneme.toLowerCase()] || p.phoneme.toLowerCase())
        .join("");
    return `/${ipa}/`;
}

/* ── Stress syllable detection ── */

/**
 * Simple heuristic: identify likely stressed syllable position
 * by finding the first vowel cluster (common in English stress-initial words).
 * Returns [beforeStress, stressedPart, afterStress].
 */
function splitStress(word: string): [string, string, string] {
    if (word.length <= 3) return ["", word, ""];
    const lower = word.toLowerCase();
    const vowels = "aeiouy";

    // Find first vowel
    let vStart = -1;
    for (let i = 0; i < lower.length; i++) {
        if (vowels.includes(lower[i])) {
            vStart = i;
            break;
        }
    }
    if (vStart === -1) return ["", word, ""];

    // Find end of vowel cluster
    let vEnd = vStart;
    while (vEnd < lower.length && vowels.includes(lower[vEnd])) vEnd++;

    // Include one trailing consonant if exists
    if (vEnd < lower.length) vEnd++;

    // The stressed portion: from start of word up to end of first syllable
    const stressEnd = Math.min(vEnd, word.length);
    return [
        "", // no prefix for stress-initial
        word.slice(0, stressEnd),
        word.slice(stressEnd),
    ];
}

/* ── Extract full-sentence phrases from pronunciation data ── */

export function extractShadowingPhrases(
    turns: TurnPronunciationData[],
    beforeAfter?: BeforeAfterComparison[]
): ShadowingPhrase[] {
    const phrases: ShadowingPhrase[] = [];

    for (const turn of turns) {
        const { words, recognizedText, accuracyScore } = turn.assessment;
        if (!words || words.length < 4) continue; // Skip very short turns
        if (!recognizedText || recognizedText.trim().length < 10) continue;

        // Find problem words
        const problemWords = words
            .filter((w) => w.errorType !== "None" || w.accuracyScore < 75)
            .map((w) => ({ word: w.word, score: w.accuracyScore, errorType: w.errorType }));

        // Only include turns with at least one problem word or below-average accuracy
        if (problemWords.length === 0 && accuracyScore >= 85) continue;

        // Focus word = worst-scoring word (with phonemes)
        const sortedWords = [...words]
            .filter((w) => w.word.length > 2) // Skip tiny words like "a", "I", "to"
            .sort((a, b) => a.accuracyScore - b.accuracyScore);

        const focusWordData = sortedWords[0];
        if (!focusWordData) continue;

        const ipa = phonemesToIpa(focusWordData.phonemes || []);

        const normalize = (s: string) => s.toLowerCase().replace(/[^\w\s]/g, '').trim();
        const normRecognized = normalize(recognizedText);
        
        let sentenceToPractice = recognizedText;
        if (beforeAfter && beforeAfter.length > 0) {
            const matched = beforeAfter.find(ba => {
                if (!ba.userOriginal) return false;
                const normOriginal = normalize(ba.userOriginal);
                return normRecognized.includes(normOriginal) || normOriginal.includes(normRecognized);
            });
            if (matched && matched.professionalVersion) {
                sentenceToPractice = matched.professionalVersion;
            }
        }

        phrases.push({
            id: `shadowing-t${turn.turnIndex}`,
            sentence: sentenceToPractice.trim(),
            focusWord: focusWordData.word.toLowerCase(),
            ipa,
            originalScore: accuracyScore,
            problemWords,
            turnIndex: turn.turnIndex,
        });
    }

    // Sort by accuracy (worst first), take top 5
    phrases.sort((a, b) => a.originalScore - b.originalScore);
    return phrases.slice(0, 5);
}

/* ── Spaced repetition hint ── */
function spacedRepetitionDays(score: number): number {
    if (score >= 90) return 7;
    if (score >= 80) return 3;
    if (score >= 60) return 1;
    return 0; // practice again today
}

function scoreLabel(score: number): string {
    if (score >= 90) return "Excellent pronunciation";
    if (score >= 80) return "Great pronunciation";
    if (score >= 60) return "Good effort, keep practicing";
    if (score >= 40) return "Needs more practice";
    return "Let's try again";
}

function scoreColor(score: number): string {
    if (score >= 80) return "#22c55e";
    if (score >= 60) return "#f59e0b";
    return "#ef4444";
}

/* ── Waveform bars animation ── */
function WaveformBars({ color = "#6366f1", count = 7 }: { color?: string; count?: number }) {
    return (
        <div className="flex items-center justify-center gap-[3px] h-8">
            {Array.from({ length: count }).map((_, i) => (
                <motion.div
                    key={i}
                    className="w-[3px] rounded-full"
                    style={{ backgroundColor: color }}
                    animate={{
                        height: [8, 20 + Math.random() * 12, 8],
                    }}
                    transition={{
                        duration: 0.6 + Math.random() * 0.4,
                        repeat: Infinity,
                        delay: i * 0.08,
                        ease: "easeInOut",
                    }}
                />
            ))}
        </div>
    );
}

/* ── Circular Score Ring ── */
function ScoreRing({ score, size = 100 }: { score: number; size?: number }) {
    const strokeWidth = 6;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const filled = (score / 100) * circumference;
    const color = scoreColor(score);

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="-rotate-90">
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="#e5e7eb"
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
                    transition={{ duration: 1, ease: "easeOut" }}
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl" style={{ fontWeight: 700, color }}>
                    {Math.round(score)}%
                </span>
            </div>
        </div>
    );
}

/* ── Phrase Card with stress markers ── */
function PhraseCard({
    sentence,
    focusWord,
    problemWords,
}: {
    sentence: string;
    focusWord: string;
    problemWords: { word: string; score: number }[];
}) {
    const problemSet = useMemo(
        () => new Set(problemWords.map((w) => w.word.toLowerCase())),
        [problemWords]
    );

    const words = sentence.split(/\s+/);

    return (
        <div className="rounded-2xl border border-[#e2e8f0] bg-[#fafbfc] p-5 md:p-6">
            <p className="text-lg md:text-xl leading-relaxed text-[#1e293b]" style={{ fontWeight: 400 }}>
                {words.map((word, i) => {
                    const clean = word.replace(/[.,!?;:'"()]/g, "").toLowerCase();
                    const isMultiSyllable = clean.length >= 4;
                    const isProblem = problemSet.has(clean) || clean === focusWord;

                    if (isMultiSyllable) {
                        const [before, stressed, after] = splitStress(word);
                        return (
                            <span key={i}>
                                {i > 0 ? " " : ""}
                                {before}
                                <span style={{ fontWeight: 700 }}>{stressed}</span>
                                {after}
                            </span>
                        );
                    }

                    return (
                        <span key={i} className={isProblem ? "text-[#6366f1]" : ""}>
                            {i > 0 ? " " : ""}
                            {word}
                        </span>
                    );
                })}
            </p>
        </div>
    );
}

/* ================================================================
   MAIN COMPONENT
   ================================================================ */

export interface ShadowingModalProps {
    phrases: ShadowingPhrase[];
    scenarioLabel: string;
    scenarioType?: string;
    sessionId?: string | null;
    /** "practice" = normal post-session drill, "review" = spaced repetition review from Dashboard */
    mode?: "practice" | "review";
    /** When mode="review", the SR phrases being reviewed (for updating box/interval) */
    reviewSRPhrases?: SpacedRepetitionPhrase[];
    initialIndex?: number;
    onClose: () => void;
    onComplete?: (avgScore: number, passed: number, total: number) => void;
    /** Called after review mode completes with updated SR phrase data */
    onReviewComplete?: (updatedPhrases: SpacedRepetitionPhrase[]) => void;
}

const SR_FAIL_THRESHOLD = 70;
const SR_MAX_ATTEMPTS = 3;

export function ShadowingModal({
    phrases,
    scenarioLabel,
    scenarioType = "",
    sessionId,
    mode = "practice",
    reviewSRPhrases,
    initialIndex = 0,
    onClose,
    onComplete,
    onReviewComplete,
}: ShadowingModalProps) {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [phase, setPhase] = useState<Phase>("idle");
    const [result, setResult] = useState<DrillResult | null>(null);
    const [errorMsg, setErrorMsg] = useState("");
    const [isComplete, setIsComplete] = useState(false);
    const [scores, setScores] = useState<Record<number, DrillResult>>({});

    /* ── Spaced Repetition: attempt tracking ── */
    // Tracks total attempts per phrase index
    const [attemptCounts, setAttemptCounts] = useState<Record<number, number>>({});
    // Tracks best accuracy per phrase index
    const [bestScores, setBestScores] = useState<Record<number, number>>({});
    // Set of phrase indices flagged for SR
    const [flaggedForSR, setFlaggedForSR] = useState<Set<number>>(new Set());
    // Whether SR save has been triggered
    const srSavedRef = useRef(false);

    // Audio refs
    const stopPlaybackRef = useRef<(() => void) | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const streamRef = useRef<MediaStream | null>(null);

    const currentPhrase = phrases[currentIndex];
    const total = phrases.length;
    const progress = ((currentIndex + (phase === "result" ? 1 : 0)) / total) * 100;

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopPlaybackRef.current?.();
            streamRef.current?.getTracks().forEach((t) => t.stop());
        };
    }, []);

    // Prevent body scroll when modal is open
    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "";
        };
    }, []);

    /* ── Play AI pronunciation ── */
    const playAudio = useCallback(async () => {
        if (phase === "playing") {
            stopPlaybackRef.current?.();
            setPhase("idle");
            return;
        }
        setPhase("playing");
        try {
            const { stop } = await realSpeechService.speak(currentPhrase.sentence);
            stopPlaybackRef.current = stop;
            const estimatedMs = Math.max(2500, currentPhrase.sentence.length * 75 + 1500);
            setTimeout(() => {
                setPhase((prev) => (prev === "playing" ? "ready" : prev));
                stopPlaybackRef.current = null;
            }, estimatedMs);
        } catch (err) {
            console.error("[ShadowingModal] TTS error:", err);
            setPhase("idle");
        }
    }, [currentPhrase, phase]);

    /* ── Start recording ── */
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
                    setPhase("idle");
                    return;
                }

                setPhase("processing");
                try {
                    const assessment = await realSpeechService.assessPronunciation(
                        blob,
                        currentPhrase.sentence
                    );
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
                        setResult(drillResult);
                        setPhase("result");

                        // Track attempts and best scores for spaced repetition
                        setAttemptCounts((prev) => ({
                            ...prev,
                            [currentIndex]: (prev[currentIndex] || 0) + 1,
                        }));
                        setBestScores((prev) => ({
                            ...prev,
                            [currentIndex]: Math.max(prev[currentIndex] || 0, drillResult.accuracy),
                        }));

                        // Check if phrase should be flagged for SR (3+ attempts, best < 70%)
                        const newAttemptCount = (attemptCounts[currentIndex] || 0) + 1;
                        const newBest = Math.max(bestScores[currentIndex] || 0, drillResult.accuracy);
                        if (
                            mode === "practice" &&
                            newAttemptCount >= SR_MAX_ATTEMPTS &&
                            newBest < SR_FAIL_THRESHOLD &&
                            !flaggedForSR.has(currentIndex)
                        ) {
                            setFlaggedForSR((prev) => new Set([...prev, currentIndex]));
                            console.log(
                                `[ShadowingModal] Phrase "${currentPhrase.sentence.slice(0, 40)}..." flagged for spaced repetition (attempts=${newAttemptCount}, best=${Math.round(newBest)}%)`
                            );
                        }

                        setScores((prev) => {
                            const updated = { ...prev, [currentIndex]: drillResult };
                            // Persist to cache
                            if (sessionId) {
                                const cacheData: Record<string, DrillResult> = {};
                                for (const [k, v] of Object.entries(updated)) {
                                    cacheData[phrases[Number(k)]?.id || k] = v;
                                }
                                shadowingScoresCache.set(sessionId, cacheData);
                            }
                            return updated;
                        });
                    } else {
                        setErrorMsg("Could not assess pronunciation. Try speaking more clearly.");
                        setPhase("error");
                    }
                } catch (err) {
                    console.error("[ShadowingModal] Assessment error:", err);
                    setErrorMsg("Assessment failed. Please try again.");
                    setPhase("error");
                }
            };

            recorder.start(250);
            setPhase("recording");
        } catch (err) {
            console.error("[ShadowingModal] Mic access failed:", err);
            setErrorMsg("Microphone access denied. Please allow microphone access.");
            setPhase("error");
        }
    }, [currentPhrase, currentIndex, sessionId, phrases]);

    /* ── Stop recording ── */
    const stopRecording = useCallback(() => {
        mediaRecorderRef.current?.stop();
    }, []);

    /* ── Save flagged phrases to backend (practice mode) ── */
    const saveFlaggedPhrases = useCallback(async () => {
        if (srSavedRef.current) return;
        srSavedRef.current = true;

        if (mode === "practice" && flaggedForSR.size > 0) {
            const srPhrases: SpacedRepetitionPhrase[] = [];
            flaggedForSR.forEach((idx) => {
                const p = phrases[idx];
                if (!p) return;
                srPhrases.push(
                    createSRPhrase(
                        p.id,
                        p.sentence,
                        p.focusWord,
                        p.ipa,
                        bestScores[idx] || 0,
                        attemptCounts[idx] || SR_MAX_ATTEMPTS,
                        scenarioType,
                        scenarioLabel
                    )
                );
            });
            console.log(`[ShadowingModal] Saving ${srPhrases.length} phrases for spaced repetition`);
            await flagPhrasesForReview(srPhrases).catch((err) =>
                console.error("[ShadowingModal] Failed to save SR phrases:", err)
            );
        }

        // In review mode, update SR phrases with new scores and merge with full list
        if (mode === "review" && reviewSRPhrases) {
            const updated = reviewSRPhrases.map((srp, idx) => {
                const drillResult = scores[idx];
                if (!drillResult) return srp;
                return updatePhraseAfterReview(srp, drillResult.accuracy);
            });
            // Fetch full phrase list, merge updated, then save
            try {
                const { fetchSRPhrases: fetchAll } = await import("../utils/spacedRepetition");
                const allPhrases = await fetchAll();
                const updatedIds = new Set(updated.map((p) => p.id));
                const merged = [
                    ...allPhrases.filter((p) => !updatedIds.has(p.id)),
                    ...updated,
                ];
                await saveSRPhrases(merged);
            } catch (err) {
                // Fallback: save just the updated ones
                console.error("[ShadowingModal] Failed to merge SR phrases, saving subset:", err);
                await saveSRPhrases(updated).catch(() => { });
            }
            onReviewComplete?.(updated);
        }
    }, [mode, flaggedForSR, phrases, bestScores, attemptCounts, scenarioType, scenarioLabel, reviewSRPhrases, scores, onReviewComplete]);

    /* ── Next phrase ── */
    const goNext = useCallback(() => {
        if (currentIndex + 1 >= total) {
            setIsComplete(true);
            // Calculate summary
            const allScores = Object.values(scores);
            const avgScore = allScores.length > 0
                ? allScores.reduce((s, r) => s + r.accuracy, 0) / allScores.length
                : 0;
            const passed = allScores.filter((r) => r.accuracy >= 60).length;
            onComplete?.(avgScore, passed, total);
            // Save SR data asynchronously
            saveFlaggedPhrases();
        } else {
            setCurrentIndex((i) => i + 1);
            setPhase("idle");
            setResult(null);
            setErrorMsg("");
        }
    }, [currentIndex, total, scores, onComplete, saveFlaggedPhrases]);

    /* ── Retry current phrase ── */
    const retry = useCallback(() => {
        setPhase("idle");
        setResult(null);
        setErrorMsg("");
    }, []);

    /* ── Summary stats ── */
    const summaryStats = useMemo(() => {
        const allScores = Object.values(scores);
        const avgScore = allScores.length > 0
            ? allScores.reduce((s, r) => s + r.accuracy, 0) / allScores.length
            : 0;
        const passed = allScores.filter((r) => r.accuracy >= 60).length;
        return { avgScore, passed, practiced: allScores.length };
    }, [scores]);

    /* ── Completion screen ── */
    if (isComplete) {
        return createPortal(
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    className="absolute inset-0 bg-black/40 backdrop-blur-md"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={onClose}
                />
                {/* Card */}
                <motion.div
                    className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 text-center"
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ type: "spring", damping: 25 }}
                >
                    {/* Confetti icon */}
                    <motion.div
                        className="w-16 h-16 rounded-full bg-[#22c55e] flex items-center justify-center mx-auto mb-5"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring" }}
                    >
                        <PartyPopper className="w-8 h-8 text-white" />
                    </motion.div>

                    <h2 className="text-2xl text-[#0f172b] mb-2" style={{ fontWeight: 700 }}>
                        {mode === "review" ? "Review Complete" : "Practice Complete"}
                    </h2>
                    <p className="text-sm text-[#64748b] mb-6">
                        You practiced {summaryStats.practiced} phrase{summaryStats.practiced !== 1 ? "s" : ""} today. Consistency builds confidence.
                    </p>

                    {/* SR flagged phrases notice */}
                    {mode === "practice" && flaggedForSR.size > 0 && (
                        <motion.div
                            className="bg-[#eef2ff] border border-[#c7d2fe] rounded-xl p-4 mb-6 flex items-start gap-3"
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <BookmarkCheck className="w-5 h-5 text-[#6366f1] shrink-0 mt-0.5" />
                            <div className="text-left">
                                <p className="text-sm text-[#4338ca]" style={{ fontWeight: 600 }}>
                                    {flaggedForSR.size} phrase{flaggedForSR.size !== 1 ? "s" : ""} saved for review
                                </p>
                                <p className="text-[11px] text-[#6366f1]/70 mt-0.5 leading-relaxed">
                                    These will appear in your Dashboard for spaced repetition practice
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {/* Stats */}
                    <div className="flex items-center justify-center gap-0 mb-8">
                        <div className="flex-1 text-center">
                            <p className="text-3xl text-[#0f172b]" style={{ fontWeight: 700 }}>
                                {Math.round(summaryStats.avgScore)}%
                            </p>
                            <p className="text-xs text-[#94a3b8] mt-1">Avg Score</p>
                        </div>
                        <div className="w-px h-10 bg-[#e2e8f0]" />
                        <div className="flex-1 text-center">
                            <p className="text-3xl text-[#22c55e]" style={{ fontWeight: 700 }}>
                                {summaryStats.passed}
                            </p>
                            <p className="text-xs text-[#94a3b8] mt-1">Passed</p>
                        </div>
                        <div className="w-px h-10 bg-[#e2e8f0]" />
                        <div className="flex-1 text-center">
                            <p className="text-3xl text-[#6366f1]" style={{ fontWeight: 700 }}>
                                {summaryStats.practiced}
                            </p>
                            <p className="text-xs text-[#94a3b8] mt-1">Practiced</p>
                        </div>
                    </div>

                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="w-full py-3.5 rounded-xl bg-[#0f172b] text-white text-sm hover:bg-[#1e293b] transition-colors cursor-pointer"
                        style={{ fontWeight: 600 }}
                    >
                        Back to Feedback
                    </button>
                </motion.div>
            </div>
            , document.body);
    }

    /* ── Main drill screen ── */
    return createPortal(
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
                className="absolute inset-0 bg-black/40 backdrop-blur-md"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            />

            {/* Card */}
            <motion.div
                className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto"
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: "spring", damping: 25 }}
            >
                {/* Header */}
                <div className="px-6 pt-5 pb-0">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-[#f1f5f9] flex items-center justify-center">
                                <Volume2 className="w-4.5 h-4.5 text-[#0f172b]" />
                            </div>
                            <span className="text-sm text-[#6366f1]" style={{ fontWeight: 600 }}>
                                Phrase {currentIndex + 1} of {total}
                            </span>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-full hover:bg-[#f1f5f9] flex items-center justify-center transition-colors cursor-pointer"
                        >
                            <X className="w-4.5 h-4.5 text-[#94a3b8]" />
                        </button>
                    </div>

                    {/* Progress bar */}
                    <div className="h-1 bg-[#e2e8f0] rounded-full overflow-hidden mb-6">
                        <motion.div
                            className="h-full bg-[#6366f1] rounded-full"
                            initial={{ width: `${((currentIndex) / total) * 100}%` }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.4 }}
                        />
                    </div>
                </div>

                {/* Content */}
                <div className="px-6 pb-6">
                    {/* Phrase card */}
                    <PhraseCard
                        sentence={currentPhrase.sentence}
                        focusWord={currentPhrase.focusWord}
                        problemWords={currentPhrase.problemWords}
                    />

                    {/* Focus word + IPA + scenario */}
                    <div className="flex items-center gap-2 mt-3 mb-1 flex-wrap">
                        <span className="text-sm text-[#6366f1]" style={{ fontWeight: 700 }}>
                            {currentPhrase.focusWord}
                        </span>
                        {currentPhrase.ipa && (
                            <span className="text-sm text-[#94a3b8]" style={{ fontFamily: "serif" }}>
                                {currentPhrase.ipa}
                            </span>
                        )}
                        <span className="text-xs text-[#94a3b8]">
                            &middot; Practice: {scenarioLabel}
                        </span>
                    </div>

                    {/* Phase-specific content */}
                    <AnimatePresence mode="wait">
                        {/* IDLE */}
                        {phase === "idle" && (
                            <motion.div
                                key="idle"
                                className="flex flex-col items-center py-6"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                <p className="text-sm text-[#64748b] mb-5 text-center">
                                    Listen to the pronunciation, then repeat the phrase
                                </p>
                                <button
                                    onClick={playAudio}
                                    className="w-16 h-16 rounded-full bg-[#6366f1] hover:bg-[#4f46e5] flex items-center justify-center shadow-lg shadow-[#6366f1]/30 transition-colors cursor-pointer"
                                >
                                    <Play className="w-7 h-7 text-white ml-1" />
                                </button>
                                <p className="text-xs text-[#6366f1] mt-3" style={{ fontWeight: 500 }}>
                                    Press play to start
                                </p>
                            </motion.div>
                        )}

                        {/* PLAYING */}
                        {phase === "playing" && (
                            <motion.div
                                key="playing"
                                className="flex flex-col items-center py-6"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                <button
                                    onClick={playAudio}
                                    className="w-14 h-14 rounded-full bg-[#f1f5f9] flex items-center justify-center mb-3 cursor-pointer"
                                >
                                    <Volume2 className="w-6 h-6 text-[#6366f1]" />
                                </button>
                                <WaveformBars color="#6366f1" count={7} />
                                <p className="text-sm text-[#6366f1] mt-3" style={{ fontWeight: 500 }}>
                                    Listening to AI...
                                </p>
                            </motion.div>
                        )}

                        {/* READY — AI finished, user's turn to record */}
                        {phase === "ready" && (
                            <motion.div
                                key="ready"
                                className="flex flex-col items-center py-6"
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                            >
                                <p className="text-sm text-[#64748b] mb-5 text-center">
                                    Now repeat the phrase
                                </p>
                                <button
                                    onClick={startRecording}
                                    className="w-16 h-16 rounded-full bg-[#0f172b] hover:bg-[#1e293b] flex items-center justify-center shadow-lg shadow-[#0f172b]/30 transition-colors cursor-pointer"
                                >
                                    <Mic className="w-7 h-7 text-white" />
                                </button>
                                <p className="text-xs text-[#0f172b] mt-3" style={{ fontWeight: 500 }}>
                                    Tap to record
                                </p>
                                <button
                                    onClick={playAudio}
                                    className="mt-4 flex items-center gap-1.5 text-xs text-[#94a3b8] hover:text-[#6366f1] transition-colors cursor-pointer"
                                    style={{ fontWeight: 500 }}
                                >
                                    <Volume2 className="w-3.5 h-3.5" />
                                    Listen again
                                </button>
                            </motion.div>
                        )}

                        {/* RECORDING */}
                        {phase === "recording" && (
                            <motion.div
                                key="recording"
                                className="flex flex-col items-center py-6"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                <p className="text-sm text-[#ef4444] mb-3" style={{ fontWeight: 600 }}>
                                    Recording...
                                </p>
                                <WaveformBars color="#ef4444" count={7} />
                                <button
                                    onClick={stopRecording}
                                    className="mt-4 w-14 h-14 rounded-full bg-[#ef4444] hover:bg-[#dc2626] flex items-center justify-center shadow-lg shadow-[#ef4444]/30 transition-colors cursor-pointer"
                                >
                                    <Square className="w-5 h-5 text-white" fill="white" />
                                </button>
                                <p className="text-xs text-[#94a3b8] mt-3" style={{ fontWeight: 500 }}>
                                    Press to stop
                                </p>
                            </motion.div>
                        )}

                        {/* PROCESSING */}
                        {phase === "processing" && (
                            <motion.div
                                key="processing"
                                className="flex flex-col items-center py-8"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                <Loader2 className="w-8 h-8 text-[#6366f1] animate-spin mb-3" />
                                <p className="text-sm text-[#64748b]" style={{ fontWeight: 500 }}>
                                    Analyzing pronunciation...
                                </p>
                            </motion.div>
                        )}

                        {/* RESULT */}
                        {phase === "result" && result && (
                            <motion.div
                                key="result"
                                className="flex flex-col items-center py-4"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <ScoreRing score={result.accuracy} size={110} />
                                <div
                                    className="w-full mt-5 rounded-xl p-4 text-center"
                                    style={{
                                        backgroundColor: result.accuracy >= 80 ? "#f0fdf4" : result.accuracy >= 60 ? "#fffbeb" : "#fef2f2",
                                    }}
                                >
                                    <p className="text-sm" style={{ fontWeight: 700, color: scoreColor(result.accuracy) }}>
                                        {scoreLabel(result.accuracy)}
                                    </p>
                                    {result.accuracy >= 60 && (
                                        <p className="text-xs text-[#64748b] mt-1">
                                            We'll practice this phrase again in{" "}
                                            <span style={{ fontWeight: 700, color: scoreColor(result.accuracy) }}>
                                                {spacedRepetitionDays(result.accuracy)} day{spacedRepetitionDays(result.accuracy) !== 1 ? "s" : ""}
                                            </span>
                                        </p>
                                    )}
                                    {result.accuracy < 60 && (
                                        <p className="text-xs text-[#64748b] mt-1">
                                            Try again or move to the next phrase
                                        </p>
                                    )}
                                </div>

                                {/* Word-level feedback */}
                                {result.wordResults && result.wordResults.length > 0 && (
                                    <div className="w-full mt-4 mb-2">
                                        <p className="text-xs text-[#64748b] mb-2 text-center" style={{ fontWeight: 500 }}>
                                            Word-level analysis: (hover for tips)
                                        </p>
                                        <div className="flex flex-wrap justify-center gap-1.5 p-3 bg-[#f8fafc] rounded-xl border border-[#e2e8f0]">
                                            {result.wordResults.map((w, i) => {
                                                const color = w.score >= 80 ? "#334155" : w.score >= 60 ? "#f59e0b" : "#ef4444";
                                                const bg = w.score >= 80 ? "transparent" : w.score >= 60 ? "rgba(245,158,11,0.1)" : "rgba(239,68,68,0.1)";
                                                const isError = w.errorType && w.errorType !== "None";
                                                
                                                return (
                                                    <div 
                                                        key={i} 
                                                        className="relative group cursor-default px-1.5 py-0.5 rounded transition-colors"
                                                        style={{ backgroundColor: bg }}
                                                    >
                                                        <span style={{ color: color, fontWeight: w.score < 80 ? 600 : 400 }}>
                                                            {w.word}
                                                        </span>
                                                        {/* Tooltip */}
                                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 w-max px-2.5 py-1.5 bg-[#0f172b] text-white text-[10px] rounded-lg shadow-xl pointer-events-none">
                                                            Score: {Math.round(w.score)}%
                                                            {isError && <span className="block text-red-300 font-medium mt-0.5 text-[9px] uppercase tracking-wider">{w.errorType}</span>}
                                                            {w.errorType === 'Omission' && <span className="block text-gray-300 mt-0.5">Don't skip this sound!</span>}
                                                            {w.errorType === 'Insertion' && <span className="block text-gray-300 mt-0.5">Extra word added.</span>}
                                                            {w.errorType === 'Mispronunciation' && <span className="block text-gray-300 mt-0.5">Check your vowel/consonants.</span>}
                                                            {/* Arrow */}
                                                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#0f172b]" />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                                
                                {/* Fluency heuristic Tip */}
                                {result.fluency < 80 && (
                                    <div className="w-full mt-2 bg-[#f0fdfa] border border-[#ccfbf1] rounded-xl p-3 flex gap-3 text-left">
                                        <Lightbulb className="w-4 h-4 text-[#14b8a6] shrink-0 mt-0.5" />
                                        <p className="text-xs text-[#134e4a] leading-relaxed">
                                            <strong>Fluency Tip: </strong> 
                                            Tu ritmo se nota fragmentado. Intenta agrupar las palabras <em>(linking)</em> en lugar de decirlas una por una. Escucha a la IA de nuevo para imitar su fluidez.
                                        </p>
                                    </div>
                                )}

                                {flaggedForSR.has(currentIndex) && (
                                    <motion.div
                                        className="w-full mt-2 rounded-lg bg-[#eef2ff] border border-[#c7d2fe] p-3 flex items-center gap-2"
                                        initial={{ opacity: 0, y: 4 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        <BookmarkCheck className="w-4 h-4 text-[#6366f1] shrink-0" />
                                        <p className="text-[11px] text-[#4338ca] leading-snug">
                                            Saved for future review in your Dashboard
                                        </p>
                                    </motion.div>
                                )}

                                {mode === "practice" &&
                                    !flaggedForSR.has(currentIndex) &&
                                    (attemptCounts[currentIndex] || 0) >= 2 &&
                                    result.accuracy < SR_FAIL_THRESHOLD && (
                                        <p className="text-[10px] text-[#94a3b8] mt-2 text-center">
                                            Attempt {attemptCounts[currentIndex] || 0} of {SR_MAX_ATTEMPTS} &middot; Below 70% after 3 attempts saves this phrase for review
                                        </p>
                                    )}

                                <div className="w-full mt-4 space-y-2">
                                    <button
                                        onClick={goNext}
                                        className="w-full py-3.5 rounded-xl bg-[#6366f1] text-white text-sm hover:bg-[#4f46e5] transition-colors cursor-pointer flex items-center justify-center gap-2"
                                        style={{ fontWeight: 600 }}
                                    >
                                        {currentIndex + 1 >= total ? "Finish" : "Next phrase"}
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                    {result.accuracy < 80 && (
                                        <button
                                            onClick={retry}
                                            className="w-full py-3 rounded-xl bg-[#f1f5f9] text-[#64748b] text-sm hover:bg-[#e2e8f0] transition-colors cursor-pointer flex items-center justify-center gap-2"
                                            style={{ fontWeight: 500 }}
                                        >
                                            <RotateCcw className="w-3.5 h-3.5" />
                                            Try again
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {/* ERROR */}
                        {phase === "error" && (
                            <motion.div
                                key="error"
                                className="flex flex-col items-center py-6"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                <div className="w-12 h-12 rounded-full bg-[#fef2f2] flex items-center justify-center mb-3">
                                    <AlertTriangle className="w-6 h-6 text-[#ef4444]" />
                                </div>
                                <p className="text-sm text-[#dc2626] text-center mb-4" style={{ fontWeight: 500 }}>
                                    {errorMsg}
                                </p>
                                <button
                                    onClick={retry}
                                    className="px-5 py-2.5 rounded-xl bg-[#6366f1] text-white text-sm hover:bg-[#4f46e5] transition-colors cursor-pointer flex items-center gap-2"
                                    style={{ fontWeight: 500 }}
                                >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                    Try Again
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>,
        document.body
    );
}