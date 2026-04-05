/**
 * ==============================================================
 *  InterviewAnalysis — Single comprehensive post-practice screen
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
import { motion, AnimatePresence } from "motion/react";
import {
    Trophy,
    ArrowRight,
    RotateCcw,
    Download,
    ChevronDown,
    Check,
    Sparkles,
    AudioLines,
    Target,
    Lightbulb,
    RotateCcw as Retry,
    Headphones,
} from "lucide-react";
import {
    ResponsiveContainer,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    Radar,
} from "recharts";
import {
    PastelBlobs,
    PageTitleBlock,
    ProficiencyGauge,
    SessionProgressBar,
} from "@/shared/ui";
import type {
    ScenarioType,
    TurnPronunciationData,
    BeforeAfterComparison,
    Strength,
    Opportunity,
} from "@/services/types";
import type { RealFeedbackData } from "./ConversationFeedback";
import { ShadowingModal } from "@/app/features/practice-session/ui/ShadowingModal";
import type { ShadowingPhrase } from "@/app/features/shadowing/model";
import {
    computeStressedWords,
    computeLinkedPairs,
} from "@/app/features/shadowing/model/shadowing.computations";

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
    Pronunciation: { icon: "🗣️", bg: "rgba(239,68,68,0.12)", text: "#ef4444" },
    Fluency: { icon: "🌊", bg: "rgba(14,165,233,0.12)", text: "#0ea5e9" },
    "Professional Tone": { icon: "🕴️", bg: "rgba(139,92,246,0.12)", text: "#8b5cf6" },
    Grammar: { icon: "📐", bg: "rgba(59,130,246,0.12)", text: "#3b82f6" },
    Vocabulary: { icon: "📚", bg: "rgba(16,185,129,0.12)", text: "#10b981" },
};

type ShadowState = "idle" | "done";

/* ── Props ── */
interface InterviewAnalysisProps {
    scenarioType?: ScenarioType;
    realFeedback?: RealFeedbackData | null;
    pronunciationData?: TurnPronunciationData[];
    onPracticeAgain?: () => void;
    onDownloadPdf?: () => void;
    onFinish: () => void;
    /** Whether this is the user's first free retry */
    canRetryFree?: boolean;
}

export function InterviewAnalysis({
    scenarioType,
    realFeedback,
    pronunciationData = [],
    onPracticeAgain,
    onDownloadPdf,
    onFinish,
    canRetryFree = true,
}: InterviewAnalysisProps) {
    const [insightsOpen, setInsightsOpen] = useState(false);
    const isInterview = scenarioType === "interview";

    /* ── Shadow state per before/after item ── */
    const [shadowStates, setShadowStates] = useState<Record<number, ShadowState>>({});
    const [activeShadowIdx, setActiveShadowIdx] = useState<number | null>(null);

    const updateShadow = useCallback((idx: number, state: ShadowState) => {
        setShadowStates(prev => ({ ...prev, [idx]: state }));
    }, []);

    /* ── Communication Score (pronunciation-centered) ── */
    const communicationScore = useMemo(() => {
        // Prioritize Azure pronunciation data for the hero score
        if (pronunciationData.length > 0) {
            const avgAccuracy = pronunciationData.reduce(
                (s, t) => s + t.assessment.accuracyScore, 0
            ) / pronunciationData.length;
            const avgFluency = pronunciationData.reduce(
                (s, t) => s + t.assessment.fluencyScore, 0
            ) / pronunciationData.length;
            const avgProsody = pronunciationData.reduce(
                (s, t) => s + t.assessment.prosodyScore, 0
            ) / pronunciationData.length;
            // Weighted: Pronunciation 40%, Fluency 30%, Prosody 30%
            return Math.round(avgAccuracy * 0.4 + avgFluency * 0.3 + avgProsody * 0.3);
        }

        // Fallback to GPT proficiency
        if (typeof realFeedback?.professionalProficiency === "number") {
            return Math.round(realFeedback.professionalProficiency);
        }

        return null;
    }, [pronunciationData, realFeedback]);

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
            <PastelBlobs />

            <main className="relative max-w-[800px] mx-auto px-4 sm:px-6 pt-6 pb-20">
                <div className="w-full mb-5">
                    <SessionProgressBar currentStep="interview-analysis" />
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
                            <p
                                className="mt-4 text-[10px] text-white/40 tracking-wider text-center"
                                style={{ fontWeight: 500 }}
                            >
                                PRONUNCIATION 40% • FLUENCY 30% • PROSODY 30%
                            </p>
                        </div>

                        {/* Coach Verdict */}
                        <div className="flex-1 text-left border-t md:border-t-0 md:border-l border-white/10 pt-6 md:pt-0 md:pl-8 flex flex-col justify-center">
                            <h3 className="text-white text-lg mb-2" style={{ fontWeight: 500 }}>
                                {passed ? "🎉 Great job!" : "Let's keep working"}
                            </h3>
                            <p className="text-white/80 text-sm mb-5 leading-relaxed">
                                {passed
                                    ? "Your pronunciation and delivery are solid. You're communicating with clarity and confidence — keep refining."
                                    : "You're making progress! Focus on the specific areas below and practice the corrected phrases to level up."
                                }
                            </p>
                            {/* Quick stats */}
                            {pronunciationData.length > 0 && (
                                <div className="flex gap-4">
                                    {[
                                        { label: "Accuracy", value: Math.round(pronunciationData.reduce((s, t) => s + t.assessment.accuracyScore, 0) / pronunciationData.length) },
                                        { label: "Fluency", value: Math.round(pronunciationData.reduce((s, t) => s + t.assessment.fluencyScore, 0) / pronunciationData.length) },
                                        { label: "Prosody", value: Math.round(pronunciationData.reduce((s, t) => s + t.assessment.prosodyScore, 0) / pronunciationData.length) },
                                    ].map(({ label, value }) => (
                                        <div key={label} className="text-center">
                                            <p className="text-white text-lg" style={{ fontWeight: 600 }}>{value}%</p>
                                            <p className="text-white/40 text-[10px]">{label}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* ═══ PILLAR BREAKDOWN ═══ */}
                {hasRadarData && (
                    <motion.div
                        className="bg-white rounded-3xl border border-[#e2e8f0] p-5 md:p-6 mb-6"
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.12 }}
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <AudioLines className="w-4 h-4 text-[#6366f1]" />
                            <p className="text-sm text-[#0f172b]" style={{ fontWeight: 600 }}>
                                Skill Breakdown
                            </p>
                        </div>

                        <div className="w-full" style={{ height: 220, margin: "0 auto" }}>
                            <ResponsiveContainer width="100%" height={220}>
                                <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="72%">
                                    <PolarGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                                    <PolarAngleAxis
                                        dataKey="skill"
                                        tick={({ payload, x, y, textAnchor, index }: any) => {
                                            const label = payload.value as string;
                                            const scoreVal = radarData[index]?.score ?? 0;
                                            const short = label === "Professional Tone" ? "Prof. Tone" : label;
                                            return (
                                                <text x={x} y={y} textAnchor={textAnchor} fontSize={9} fill="#62748e">
                                                    <tspan x={x} dy="0">{short}</tspan>
                                                    <tspan x={x} dy="11" fontSize={8} fontWeight={600} fill="#6366f1">
                                                        {Math.round(scoreVal)}%
                                                    </tspan>
                                                </text>
                                            );
                                        }}
                                        tickLine={false}
                                    />
                                    <Radar
                                        name="Score"
                                        dataKey="score"
                                        stroke="#6366f1"
                                        fill="#6366f1"
                                        fillOpacity={0.15}
                                        strokeWidth={2}
                                        dot={{ r: 2.5, fill: "#6366f1", strokeWidth: 0 }}
                                    />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Weakest skill highlight */}
                        {(() => {
                            const sorted = [...radarData].filter(d => d.score > 0).sort((a, b) => a.score - b.score);
                            const bottom = sorted[0];
                            const top = sorted[sorted.length - 1];
                            if (!bottom || !top) return null;
                            return (
                                <div className="mt-4 pt-4 border-t border-[#e2e8f0]">
                                    <p className="text-sm text-[#45556c] leading-relaxed">
                                        Your <strong className="text-[#0f172b]">{top.skill}</strong> is looking sharp. Focus on <strong className="text-[#0f172b]">{bottom.skill}</strong> — that's where the biggest gains are.
                                    </p>
                                </div>
                            );
                        })()}
                    </motion.div>
                )}

                {/* ═══ BEFORE/AFTER WITH SHADOWING ═══ */}
                {beforeAfter.length > 0 && (
                    <motion.div
                        className="bg-white rounded-3xl border border-[#e2e8f0] p-5 md:p-6 mb-6"
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.16 }}
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <Target className="w-4 h-4 text-[#d97706]" />
                            <p className="text-sm text-[#0f172b]" style={{ fontWeight: 600 }}>
                                Before & After
                            </p>
                        </div>
                        <p className="text-xs text-[#94a3b8] mb-4">
                            Listen to the improved version, then shadow it to practice.
                        </p>

                        <div className="space-y-4">
                            {beforeAfter.slice(0, 5).map((ba, i) => {
                                const ss = shadowStates[i] || "idle";
                                return (
                                    <div key={i} className="border border-[#e2e8f0] rounded-xl overflow-hidden">
                                        {/* Before */}
                                        <div className="px-4 py-3 bg-red-50/30 border-b border-[#f1f5f9]">
                                            <p className="text-[10px] text-red-400 mb-1" style={{ fontWeight: 600 }}>
                                                WHAT YOU SAID
                                            </p>
                                            <p className="text-sm text-[#45556c] leading-relaxed line-through decoration-red-200">
                                                {ba.userOriginal}
                                            </p>
                                        </div>
                                        {/* After */}
                                        <div className="px-4 py-3 bg-emerald-50/30">
                                            <p className="text-[10px] text-emerald-500 mb-1" style={{ fontWeight: 600 }}>
                                                PROFESSIONAL VERSION
                                            </p>
                                            <p className="text-sm text-[#0f172b] leading-relaxed" style={{ fontWeight: 500 }}>
                                                {ba.professionalVersion}
                                            </p>
                                            {ba.technique && (
                                                <p className="text-[10px] text-[#94a3b8] mt-1">
                                                    Technique: {ba.technique}
                                                </p>
                                            )}
                                        </div>
                                        {/* Shadowing controls */}
                                        <div className="px-4 py-2.5 bg-[#f8fafc] border-t border-[#f1f5f9] flex items-center gap-2">
                                            {ss === "done" ? (
                                                <span className="text-[11px] text-emerald-600 flex items-center gap-1.5" style={{ fontWeight: 500 }}>
                                                    <Check className="w-3 h-3" /> Practiced ✓
                                                </span>
                                            ) : (
                                                <button
                                                    onClick={() => handleOpenShadowModal(i)}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] bg-[#0f172b] text-white hover:bg-[#1d293d] transition-all"
                                                    style={{ fontWeight: 500 }}
                                                >
                                                    <Headphones className="w-3 h-3" />
                                                    Practice Pronunciation
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}

                {/* ═══ CONTENT INSIGHTS (collapsible) ═══ */}
                {allInsights.length > 0 && (
                    <motion.div
                        className="bg-white rounded-3xl border border-[#e2e8f0] mb-6 overflow-hidden"
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <button
                            onClick={() => setInsightsOpen(!insightsOpen)}
                            className="w-full px-5 py-4 flex items-center justify-between text-left"
                        >
                            <div className="flex items-center gap-2">
                                <Lightbulb className="w-4 h-4 text-amber-500" />
                                <p className="text-sm text-[#0f172b]" style={{ fontWeight: 600 }}>
                                    Detailed Insights ({allInsights.length})
                                </p>
                            </div>
                            <ChevronDown className={`w-4 h-4 text-[#94a3b8] transition-transform ${insightsOpen ? "rotate-180" : ""}`} />
                        </button>

                        <AnimatePresence>
                            {insightsOpen && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="overflow-hidden"
                                >
                                    <div className="px-5 pb-5 space-y-3">
                                        {allInsights.map((insight, i) => (
                                            <div key={i} className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-3.5">
                                                <p className="text-xs text-[#0f172b] mb-1" style={{ fontWeight: 600 }}>
                                                    {insight.dimension}
                                                </p>
                                                <p className="text-xs text-[#45556c] leading-relaxed mb-1.5">
                                                    {insight.observation}
                                                </p>
                                                <p className="text-xs text-[#6366f1]" style={{ fontWeight: 500 }}>
                                                    💡 {insight.tip}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
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
                                Level Complete! 🎉
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
