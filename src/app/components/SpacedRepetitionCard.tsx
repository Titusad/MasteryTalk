/**
 * ==============================================================
 *  inFluentia PRO - Spaced Repetition Card (Dashboard)
 *
 *  Shows pronunciation phrases due for review, with a CTA to
 *  open the ShadowingModal in "review" mode. Fetches data from
 *  the KV backend on mount.
 *
 *  The internal box/interval system is NOT exposed to the user.
 *  User sees: phrase text, best score, time since last practice.
 * ==============================================================
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import {
    RotateCcw,
    Volume2,
    ChevronRight,
    CheckCircle2,
    Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
    fetchSRPhrases,
    getDuePhrases,
    saveSRPhrases,
} from "../utils/spacedRepetition";
import type { SpacedRepetitionPhrase } from "../utils/spacedRepetition";
import { ShadowingModal } from "./ShadowingModal";
import type { ShadowingPhrase } from "./ShadowingModal";

/* ── Helpers ── */

function timeAgo(isoDate: string): string {
    const diff = Date.now() - new Date(isoDate).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days}d ago`;
    return `${Math.floor(days / 7)}w ago`;
}

function scoreColor(score: number): string {
    if (score >= 70) return "#22c55e";
    if (score >= 50) return "#f59e0b";
    return "#ef4444";
}

/** Convert SR phrase to ShadowingPhrase format for the modal */
function toShadowingPhrase(srp: SpacedRepetitionPhrase, idx: number): ShadowingPhrase {
    return {
        id: srp.id,
        sentence: srp.phrase,
        focusWord: srp.focusWord,
        ipa: srp.ipa,
        originalScore: srp.bestScore,
        problemWords: [{ word: srp.focusWord, score: srp.bestScore, errorType: "Mispronunciation" }],
        turnIndex: idx,
    };
}

/* ── Main Component ── */

export function SpacedRepetitionCard() {
    const [allPhrases, setAllPhrases] = useState<SpacedRepetitionPhrase[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [justCompleted, setJustCompleted] = useState(false);

    /* ── Fetch on mount ── */
    const loadPhrases = useCallback(async () => {
        setLoading(true);
        try {
            const phrases = await fetchSRPhrases();
            setAllPhrases(phrases);
        } catch (err) {
            console.error("[SRCard] Failed to load phrases:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadPhrases();
    }, [loadPhrases]);

    /* ── Due phrases ── */
    const duePhrases = useMemo(() => getDuePhrases(allPhrases), [allPhrases]);
    const activeCount = useMemo(
        () => allPhrases.filter((p) => p.box < 4).length,
        [allPhrases]
    );

    /* ── Modal phrases ── */
    const modalPhrases = useMemo(
        () => duePhrases.map((p, i) => toShadowingPhrase(p, i)),
        [duePhrases]
    );

    /* ── Review complete handler ── */
    const handleReviewComplete = useCallback(
        async (updatedPhrases: SpacedRepetitionPhrase[]) => {
            // Merge updated into allPhrases
            const updatedIds = new Set(updatedPhrases.map((p) => p.id));
            const remaining = allPhrases.filter((p) => !updatedIds.has(p.id));
            const merged = [...remaining, ...updatedPhrases];
            setAllPhrases(merged);
            setJustCompleted(true);

            // Reset completion state after 5 seconds
            setTimeout(() => setJustCompleted(false), 5000);
        },
        [allPhrases]
    );

    /* ── Don't render if no active phrases ── */
    if (loading) {
        return null; // Don't show skeleton to avoid layout shift
    }

    if (activeCount === 0 && !justCompleted) {
        return null; // No SR phrases at all
    }

    /* ── Just completed state ── */
    if (justCompleted && duePhrases.length === 0) {
        return (
            <motion.div
                className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm p-5"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#f0fdf4] flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-[#22c55e]" />
                    </div>
                    <div>
                        <p className="text-sm text-[#0f172b]" style={{ fontWeight: 600 }}>
                            All caught up!
                        </p>
                        <p className="text-xs text-[#62748e]">
                            Your review phrases will reappear when they're due
                        </p>
                    </div>
                </div>
            </motion.div>
        );
    }

    return (
        <>
            <motion.div
                className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm p-5"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18 }}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <RotateCcw className="w-4 h-4 text-[#6366f1]" />
                        <h3 className="text-sm text-[#0f172b]" style={{ fontWeight: 600 }}>
                            Phrases to Review
                        </h3>
                    </div>
                    {duePhrases.length > 0 && (
                        <span
                            className="bg-[#eef2ff] text-[#6366f1] text-[10px] px-2.5 py-1 rounded-full"
                            style={{ fontWeight: 600 }}
                        >
                            {duePhrases.length} due
                        </span>
                    )}
                </div>

                {/* Phrase list */}
                {duePhrases.length > 0 ? (
                    <div className="space-y-2 mb-4">
                        {duePhrases.slice(0, 3).map((phrase) => (
                            <div
                                key={phrase.id}
                                className="rounded-xl border border-[#e2e8f0] px-4 py-3 hover:border-[#c7d2fe] transition-colors"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                        <p
                                            className="text-sm text-[#1e293b] truncate"
                                            style={{ fontWeight: 500 }}
                                            title={phrase.phrase}
                                        >
                                            "{phrase.phrase}"
                                        </p>
                                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                            <span
                                                className="text-[10px] text-[#6366f1] bg-[#eef2ff] px-2 py-0.5 rounded-full"
                                                style={{ fontWeight: 600 }}
                                            >
                                                {phrase.focusWord}
                                            </span>
                                            <span className="text-[10px] text-[#94a3b8]">
                                                Best: {Math.round(phrase.bestScore)}%
                                            </span>
                                            <span className="text-[10px] text-[#94a3b8]">
                                                &middot; {timeAgo(phrase.lastAttemptDate)}
                                            </span>
                                        </div>
                                    </div>
                                    <div
                                        className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                                        style={{ backgroundColor: `${scoreColor(phrase.bestScore)}15` }}
                                    >
                                        <Volume2
                                            className="w-3.5 h-3.5"
                                            style={{ color: scoreColor(phrase.bestScore) }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}

                        {duePhrases.length > 3 && (
                            <p className="text-[10px] text-[#94a3b8] text-center">
                                +{duePhrases.length - 3} more phrase{duePhrases.length - 3 !== 1 ? "s" : ""}
                            </p>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col items-center py-6 text-center">
                        <CheckCircle2 className="w-8 h-8 text-[#cbd5e1] mb-2" />
                        <p className="text-xs text-[#94a3b8]">
                            {activeCount > 0
                                ? "No phrases due today. Check back tomorrow!"
                                : "Complete a shadowing practice to add phrases here"}
                        </p>
                    </div>
                )}

                {/* CTA Button */}
                {duePhrases.length > 0 && (
                    <button
                        onClick={() => setShowModal(true)}
                        className="w-full py-3 rounded-xl bg-[#6366f1] text-white text-sm hover:bg-[#4f46e5] transition-colors cursor-pointer flex items-center justify-center gap-2"
                        style={{ fontWeight: 600 }}
                    >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Start Review Session
                        <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                )}
            </motion.div>

            {/* Review Modal */}
            <AnimatePresence>
                {showModal && duePhrases.length > 0 && (
                    <ShadowingModal
                        phrases={modalPhrases}
                        scenarioLabel="Spaced Repetition Review"
                        scenarioType="review"
                        mode="review"
                        reviewSRPhrases={duePhrases}
                        onClose={() => setShowModal(false)}
                        onComplete={(avg, passed, total) => {
                            console.log(
                                `[SRCard] Review complete: avg=${Math.round(avg)}%, passed=${passed}/${total}`
                            );
                        }}
                        onReviewComplete={(updated) => {
                            handleReviewComplete(updated);
                            setShowModal(false);
                        }}
                    />
                )}
            </AnimatePresence>
        </>
    );
}
