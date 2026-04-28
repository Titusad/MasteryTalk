/**
 * ==============================================================
 *  FeedbackScreen — Single comprehensive post-practice screen
 *
 *  Replaces 4 old screens (ConversationFeedback, SkillDrill,
 *  ConversationalPathUnlock, SessionReport) with one focused view.
 *
 *  Sections:
 *    1. Hero: Professional Communication Score (pronunciation-focused)
 *    2. Before/After with inline shadowing
 *    3. Collapsible Content Insights
 *    4. Progression Gate (score ≥ 75 → complete, < 75 → retry)
 *    5. Actions: Practice Again, Download PDF, Go to Dashboard
 * ==============================================================
 */

import { useState, useMemo, useCallback } from "react";
import { useNarration } from "@/shared/lib/useNarration";
import { motion, AnimatePresence } from "motion/react";
import {
    Trophy,
    ArrowRight,
    RotateCcw,
    Download,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Check,
    X,
    Sparkles,
    AudioLines,
    Target,
    Lightbulb,
    RotateCcw as Retry,
    Headphones,
} from "lucide-react";
import {
    PageTitleBlock,
    ProficiencyGauge,
} from "@/shared/ui";
import { SessionProgressBar } from "@/widgets/SessionProgressBar";
import type {
    ScenarioType,
    TurnPronunciationData,
    BeforeAfterComparison,
    Strength,
    Opportunity,
} from "@/services/types";
import type { RealFeedbackData } from "./ConversationFeedback";
import { ShadowingModal } from "@/features/practice-session/ui/ShadowingModal";
import type { ShadowingPhrase } from "@/entities/feedback";
import {
    computeStressedWords,
    computeLinkedPairs,
} from "@/features/shadowing/model/shadowing.computations";

/* ── Constants ── */
const PROGRESSION_THRESHOLD = 75;

const PILLAR_NAMES = [
    "Pronunciation",
    "Fluency",
    "Professional Tone",
    "Grammar",
    "Vocabulary",
] as const;

const PILLAR_COLORS: Record<string, { icon: string; bg: string; text: string }> = {
    Pronunciation: { icon: "P", bg: "rgba(239,68,68,0.12)", text: "#ef4444" },
    Fluency: { icon: "F", bg: "rgba(14,165,233,0.12)", text: "#0ea5e9" },
    "Professional Tone": { icon: "T", bg: "rgba(139,92,246,0.12)", text: "#14b8a6" },
    Grammar: { icon: "G", bg: "rgba(59,130,246,0.12)", text: "#3b82f6" },
    Vocabulary: { icon: "V", bg: "rgba(16,185,129,0.12)", text: "#10b981" },
};

type ShadowState = "idle" | "done";

/* ── Props ── */
interface FeedbackScreenProps {
    scenarioType?: ScenarioType;
    realFeedback?: RealFeedbackData | null;
    pronunciationData?: TurnPronunciationData[];
    onPracticeAgain?: () => void;
    onDownloadPdf?: () => void;
    onFinish: () => void;
    /** Whether this is the user's first free retry */
    canRetryFree?: boolean;
    /** Optional slot rendered below progression gate (e.g. path recommendation) */
    bottomSlot?: React.ReactNode;
    narratorUrl?: string;
}

export function FeedbackScreen({
    scenarioType,
    realFeedback,
    pronunciationData = [],
    onPracticeAgain,
    onDownloadPdf,
    onFinish,
    canRetryFree = true,
    bottomSlot,
    narratorUrl,
}: FeedbackScreenProps) {
    useNarration(narratorUrl || null);
    const [insightsOpen, setInsightsOpen] = useState(false);
    const isInterview = scenarioType === "interview";

    /* ── Shadow state per before/after item ── */
    const [shadowStates, setShadowStates] = useState<Record<number, ShadowState>>({});
    const [activeShadowIdx, setActiveShadowIdx] = useState<number | null>(null);

    const updateShadow = useCallback((idx: number, state: ShadowState) => {
        setShadowStates(prev => ({ ...prev, [idx]: state }));
    }, []);

    /* ── Radar data for pillar breakdown ── */
    const radarData = useMemo(() => {
        const scores = realFeedback?.pillarScores;
        const azurePronScore = pronunciationData.length > 0
            ? Math.round(pronunciationData.reduce(
                (s, t) => s + t.assessment.accuracyScore, 0
            ) / pronunciationData.length)
            : 0;

        if (scores && Object.keys(scores).length >= 4) {
            return PILLAR_NAMES.map((skill) => ({
                skill,
                score: skill === "Pronunciation" ? azurePronScore : (scores[skill] ?? 0),
                fullMark: 100,
            }));
        }
        return PILLAR_NAMES.map((skill) => ({
            skill,
            score: skill === "Pronunciation" ? azurePronScore : 0,
            fullMark: 100,
        }));
    }, [realFeedback, pronunciationData]);
    const hasRadarData = radarData.some(d => d.score > 0);

    /* ── Communication Score (average of all pillars) ── */
    const communicationScore = useMemo(() => {
        const activeScores = radarData.filter(d => d.score > 0);
        if (activeScores.length > 0) {
            const avg = activeScores.reduce((s, d) => s + d.score, 0) / activeScores.length;
            return Math.round(avg);
        }

        // Fallback to GPT proficiency
        if (typeof realFeedback?.professionalProficiency === "number") {
            return Math.round(realFeedback.professionalProficiency);
        }

        return null;
    }, [radarData, realFeedback]);

    /* ── Before/After data ── */
    const beforeAfter = realFeedback?.beforeAfter ?? [];

    /* ── Insights ── */
    const languageInsights = realFeedback?.languageInsights ?? [];
    const contentInsights = realFeedback?.contentInsights ?? [];
    const allInsights = [...languageInsights, ...contentInsights];

    /* ── Progression Gate ── */
    const passed = communicationScore !== null && communicationScore >= PROGRESSION_THRESHOLD;

    /* ── Shadowing phrases from beforeAfter (with heuristic annotations) ── */
    const shadowingPhrasesMap = useMemo(() => {
        const map: Record<number, ShadowingPhrase[]> = {};
        beforeAfter.slice(0, 5).forEach((ba, i) => {
            const text = ba.professionalVersion;
            if (!text) return;
            // Split into sentence-level chunks
            const rawChunks = text
                .split(/(?<=[.!?;])\s+/)
                .map(s => s.trim())
                .filter(s => s.length > 5);
            const chunks = rawChunks.length > 0 ? rawChunks : [text];

            map[i] = chunks.map((chunk, ci) => {
                const stressed = computeStressedWords(chunk);
                const linked = computeLinkedPairs(chunk);
                const words = chunk.split(/\s+/).filter(w => w.replace(/[^a-zA-Z]/g, "").length >= 4);
                const focusWord = words.sort((a, b) => b.length - a.length)[0] || "";
                return {
                    id: `ba-${i}-chunk-${ci}`,
                    sentence: chunk,
                    focusWord: focusWord.replace(/[.,!?;:'"()]/g, ""),
                    ipa: "",
                    originalScore: 0,
                    problemWords: [],
                    turnIndex: ci,
                    stressedWords: stressed,
                    linkedPairs: linked,
                };
            });
        });
        return map;
    }, [beforeAfter]);

    /* ── Shadowing handlers ── */

    const handleOpenShadowModal = useCallback((idx: number) => {
        setActiveShadowIdx(idx);
    }, []);

    return (
        <div
            className="w-full min-h-full flex flex-col bg-[#f0f4f8] relative overflow-hidden"
            style={{ fontFamily: "'Inter', sans-serif" }}
        >


            <main className="relative max-w-[800px] mx-auto px-4 sm:px-6 pt-6 pb-20">
                <div className="w-full mb-5">
                    <SessionProgressBar currentStep="feedback" />
                </div>

                {/* ═══ HERO ═══ */}
                <PageTitleBlock
                    title="How You Sound"
                    subtitle="Your professional communication performance — focused on how you sound, not just what you say."
                >
                    <span
                        className="inline-flex items-center gap-1.5 text-[10px] bg-[#50C878]/15 text-[#16a34a] px-3 py-1 rounded-full"
                        style={{ fontWeight: 600 }}
                    >
                        <Sparkles className="w-3 h-3" /> AI-powered analysis
                    </span>
                </PageTitleBlock>

                {/* ═══ COMMUNICATION SCORE HERO ═══ */}
                <motion.div
                    className="bg-gradient-to-br from-[#0f172b] to-[#1e293b] rounded-3xl p-6 md:p-8 mb-6"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.08 }}
                >
                    <div className="flex flex-col md:flex-row items-center md:items-stretch gap-8">
                        {/* Score Gauge */}
                        <div className="flex flex-col items-center justify-center shrink-0">
                            <p
                                className="text-[10px] uppercase tracking-wider text-white/50 mb-4"
                                style={{ fontWeight: 600 }}
                            >
                                Communication Score
                            </p>
                            {communicationScore !== null ? (
                                <ProficiencyGauge
                                    score={communicationScore}
                                    size={120}
                                    darkBg
                                />
                            ) : (
                                <div className="w-[120px] h-[120px] rounded-full border-[8px] border-white/10 flex items-center justify-center">
                                    <span className="text-sm text-white/40">—</span>
                                </div>
                            )}
                        </div>

                        {/* Coach Verdict */}
                        <div className="flex-1 text-left border-t md:border-t-0 md:border-l border-white/10 pt-6 md:pt-0 md:pl-8 flex flex-col justify-center">
                            <h3 className="text-white text-lg mb-2" style={{ fontWeight: 500 }}>
                                {passed ? "Great job!" : "Let's keep working"}
                            </h3>
                            <p className="text-white/80 text-sm leading-relaxed">
                                {passed
                                    ? "Your pronunciation and delivery are solid. You're communicating with clarity and confidence — keep refining."
                                    : "You're making progress! Focus on the specific areas below and practice the corrected phrases to level up."
                                }
                            </p>
                        </div>
                    </div>

                    {/* Score row — all pillars */}
                    {hasRadarData && (
                        <div className="flex justify-center flex-wrap gap-x-5 gap-y-3 mt-6 pt-6 border-t border-white/10">
                            {radarData.filter(d => d.score > 0).map(({ skill, score }) => {
                                const color = score >= 80 ? "#22c55e" : score >= 60 ? "#f59e0b" : "#ef4444";
                                return (
                                    <div key={skill} className="text-center min-w-[60px]">
                                        <p className="text-lg" style={{ fontWeight: 600, color }}>{Math.round(score)}%</p>
                                        <p className="text-white/40 text-[10px]">{skill}</p>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </motion.div>

                {/* ═══ #1 FOCUS AREA — Chat Bubble Carousel ═══ */}
                {beforeAfter.length > 0 && (() => {
                    /* Identify weakest pillar for title */
                    const sorted = [...radarData].filter(d => d.score > 0).sort((a, b) => a.score - b.score);
                    const weakest = sorted[0];
                    const focusLabel = weakest?.skill ?? "Communication";
                    const focusScore = weakest?.score ?? 0;

                    return (
                        <FocusBubbleCarousel
                            focusLabel={focusLabel}
                            focusScore={focusScore}
                            items={beforeAfter.slice(0, 3)}
                            shadowStates={shadowStates}
                            onPractice={handleOpenShadowModal}
                        />
                    );
                })()}

                {/* ═══ DETAILED INSIGHTS (always open) ═══ */}
                {allInsights.length > 0 && (
                    <motion.div
                        className="bg-white rounded-3xl border border-[#e2e8f0] p-4 md:p-6 mb-6"
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <Lightbulb className="w-4 h-4 text-amber-500" />
                            <p className="text-sm text-[#0f172b]" style={{ fontWeight: 600 }}>
                                Detailed Insights
                            </p>
                        </div>

                        <div className="space-y-3">
                            {allInsights.map((insight, i) => (
                                <div key={i} className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-3.5">
                                    <p className="text-xs text-[#0f172b] mb-1" style={{ fontWeight: 600 }}>
                                        {insight.dimension}
                                    </p>
                                    <p className="text-xs text-[#45556c] leading-relaxed mb-1.5">
                                        {insight.observation}
                                    </p>
                                    <p className="text-xs text-[#314158] flex items-center gap-1" style={{ fontWeight: 500 }}>
                                        <Lightbulb className="w-3 h-3 text-[#f59e0b] shrink-0" />
                                        {insight.tip}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* ═══ PROGRESSION GATE ═══ */}
                <motion.div
                    className={`rounded-3xl border p-6 md:p-8 mb-6 text-center ${
                        passed
                            ? "bg-gradient-to-br from-emerald-50 to-[#f0f9ff] border-emerald-200"
                            : "bg-gradient-to-br from-amber-50 to-[#fffbeb] border-amber-200"
                    }`}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.24 }}
                >
                    {passed ? (
                        <>
                            <Trophy className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
                            <h3 className="text-lg text-[#0f172b] mb-2" style={{ fontWeight: 600 }}>
                                Level Complete!
                            </h3>
                            <p className="text-sm text-[#45556c] mb-6 max-w-md mx-auto">
                                You scored {communicationScore}/100 — above the {PROGRESSION_THRESHOLD} threshold. Your next level is now available.
                            </p>
                            <button
                                onClick={onFinish}
                                className="px-6 py-3 rounded-full text-sm bg-[#0f172b] text-white hover:bg-[#1d293d] transition-colors shadow-sm flex items-center gap-2 mx-auto"
                                style={{ fontWeight: 500 }}
                            >
                                Go to Dashboard
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </>
                    ) : (
                        <>
                            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-3">
                                <Retry className="w-5 h-5 text-amber-600" />
                            </div>
                            <h3 className="text-lg text-[#0f172b] mb-2" style={{ fontWeight: 600 }}>
                                Almost there
                            </h3>
                            <p className="text-sm text-[#45556c] mb-6 max-w-md mx-auto">
                                You scored {communicationScore ?? "—"}/100 — you need {PROGRESSION_THRESHOLD} to advance.
                                {canRetryFree
                                    ? " You have a free retry available."
                                    : " Practice the phrases above, then try again from your Dashboard."
                                }
                            </p>
                            <div className="flex items-center justify-center gap-3 flex-wrap">
                                {canRetryFree && onPracticeAgain && (
                                    <button
                                        onClick={onPracticeAgain}
                                        className="px-6 py-3 rounded-full text-sm bg-[#0f172b] text-white hover:bg-[#1d293d] transition-colors shadow-sm flex items-center gap-2"
                                        style={{ fontWeight: 500 }}
                                    >
                                        <RotateCcw className="w-4 h-4" />
                                        Practice Again (Free)
                                    </button>
                                )}
                                <button
                                    onClick={onFinish}
                                    className="px-6 py-3 rounded-full text-sm bg-white text-[#45556c] border border-[#e2e8f0] hover:border-[#c7d2e0] transition-colors flex items-center gap-2"
                                    style={{ fontWeight: 500 }}
                                >
                                    Go to Dashboard
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </>
                    )}
                </motion.div>

                {/* ═══ BOTTOM SLOT (e.g. Path Recommendation) ═══ */}
                {bottomSlot}

                {/* ═══ ACTIONS ═══ */}
                <motion.div
                    className="flex items-center justify-center gap-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                >
                    {onDownloadPdf && (
                        <button
                            onClick={onDownloadPdf}
                            className="flex items-center gap-1.5 text-sm text-[#45556c] hover:text-[#0f172b] transition-colors"
                            style={{ fontWeight: 500 }}
                        >
                            <Download className="w-4 h-4" />
                            Download PDF Report
                        </button>
                    )}
                </motion.div>
            </main>

            {/* ShadowingModal for Before & After practice */}
            {activeShadowIdx !== null && shadowingPhrasesMap[activeShadowIdx]?.length > 0 && (
                <ShadowingModal
                    phrases={shadowingPhrasesMap[activeShadowIdx]}
                    scenarioLabel={
                        beforeAfter[activeShadowIdx]?.professionalVersion?.slice(0, 40) + "…"
                    }
                    scenarioType={scenarioType}
                    onClose={() => {
                        updateShadow(activeShadowIdx, "done");
                        setActiveShadowIdx(null);
                    }}
                />
            )}
        </div>
    );
}

/* ── FocusBubbleCarousel ── */
interface FocusBubbleProps {
    focusLabel: string;
    focusScore: number;
    items: BeforeAfterComparison[];
    shadowStates: Record<number, ShadowState>;
    onPractice: (idx: number) => void;
}

function FocusBubbleCarousel({ focusLabel, focusScore, items, shadowStates, onPractice }: FocusBubbleProps) {
    const [idx, setIdx] = useState(0);
    const total = items.length;
    const item = items[idx];
    if (!item) return null;

    const ss = shadowStates[idx] || "idle";
    const prev = () => setIdx(i => Math.max(0, i - 1));
    const next = () => setIdx(i => Math.min(total - 1, i + 1));

    return (
        <motion.div
            className="bg-white rounded-3xl border-l-4 border-l-[#f59e0b] border border-[#e2e8f0] p-4 md:p-6 mb-6"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.12 }}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-[#f59e0b]" />
                    <p className="text-xs text-[#f59e0b] uppercase tracking-wider" style={{ fontWeight: 600 }}>
                        #1 Focus Area
                    </p>
                </div>
                {total > 1 && (
                    <span className="text-[10px] text-[#94a3b8]" style={{ fontWeight: 500 }}>
                        {idx + 1} of {total}
                    </span>
                )}
            </div>

            <h3 className="text-lg text-[#0f172b] mb-5" style={{ fontWeight: 700 }}>
                {focusLabel} — {Math.round(focusScore)}%
            </h3>

            {/* Chat Bubbles */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-3"
                >
                    {/* User bubble (wrong) */}
                    <div className="flex items-start gap-2.5 justify-end">
                        <div className="max-w-[80%] bg-[#fef2f2] border border-[#fecaca] rounded-2xl rounded-tr-sm px-4 py-3">
                            <p className="text-sm text-[#991b1b] leading-relaxed line-through decoration-[#fca5a5]">
                                {item.userOriginal}
                            </p>
                        </div>
                        <div className="w-7 h-7 rounded-full bg-[#fef2f2] border border-[#fecaca] flex items-center justify-center shrink-0 mt-1">
                            <X className="w-3.5 h-3.5 text-[#ef4444]" />
                        </div>
                    </div>

                    {/* Technique label */}
                    {item.technique && (
                        <p className="text-[11px] text-[#92400e] flex items-center gap-1.5 ml-10" style={{ fontWeight: 500 }}>
                            <Lightbulb className="w-3 h-3 text-[#f59e0b]" />
                            {item.technique}
                        </p>
                    )}

                    {/* Coach bubble (correct) */}
                    <div className="flex items-start gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-[#f0fdf4] border border-[#bbf7d0] flex items-center justify-center shrink-0 mt-1">
                            <Check className="w-3.5 h-3.5 text-[#22c55e]" />
                        </div>
                        <div className="max-w-[80%] bg-[#f0fdf4] border border-[#bbf7d0] rounded-2xl rounded-tl-sm px-4 py-3">
                            <p className="text-sm text-[#166534] leading-relaxed" style={{ fontWeight: 500 }}>
                                {item.professionalVersion}
                            </p>
                        </div>
                    </div>

                    {/* Practice button */}
                    <div className="flex justify-center gap-2 pt-1">
                        {ss === "done" ? (
                            <>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f0fdf4] border border-[#bbf7d0] text-[11px] text-emerald-600" style={{ fontWeight: 500 }}>
                                    <Check className="w-3 h-3" /> Practiced
                                </span>
                                <button
                                    onClick={() => onPractice(idx)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] border border-[#e2e8f0] text-[#45556c] hover:bg-[#f8fafc] hover:border-[#c7d2e0] transition-all"
                                    style={{ fontWeight: 500 }}
                                >
                                    <RotateCcw className="w-3 h-3" />
                                    Repeat
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => onPractice(idx)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] bg-[#0f172b] text-white hover:bg-[#1d293d] transition-all"
                                style={{ fontWeight: 500 }}
                            >
                                <Headphones className="w-3 h-3" />
                                Practice Pronunciation
                            </button>
                        )}
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Navigation dots */}
            {total > 1 && (
                <div className="flex items-center justify-center gap-3 mt-5">
                    <button
                        onClick={prev}
                        disabled={idx === 0}
                        className="w-7 h-7 rounded-full border border-[#e2e8f0] flex items-center justify-center text-[#94a3b8] hover:text-[#0f172b] hover:border-[#c7d2e0] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-1.5">
                        {items.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setIdx(i)}
                                className={`w-2 h-2 rounded-full transition-all ${
                                    i === idx ? "bg-[#f59e0b] scale-125" : "bg-[#e2e8f0]"
                                }`}
                            />
                        ))}
                    </div>
                    <button
                        onClick={next}
                        disabled={idx === total - 1}
                        className="w-7 h-7 rounded-full border border-[#e2e8f0] flex items-center justify-center text-[#94a3b8] hover:text-[#0f172b] hover:border-[#c7d2e0] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            )}
        </motion.div>
    );
}
