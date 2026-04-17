import { SUPABASE_URL } from "@/services/supabase";
/**
 * ==============================================================
 *  FeedbackCard — Step 4 of the 4-step per-question stepper
 *
 *  Calls /evaluate-briefing-draft to get AI-powered feedback on
 *  the user's answer. Shows:
 *    - Improved response
 *    - Key changes with reasons
 *    - "Practice Saying It" button → opens ShadowingModal with
 *      annotated phrase chunks (IPA, stress, linking)
 * ==============================================================
 */

import { useState, useEffect, useMemo } from "react";
import { motion } from "motion/react";
import {
    ArrowLeft,
    ArrowRight,
    Sparkles,
    Loader2,
    Headphones,
} from "lucide-react";
import { projectId } from "@/../utils/supabase/info";
import { getAuthToken } from "@/services/supabase";
import { ShadowingModal } from "@/features/practice-session/ui/ShadowingModal";
import type { ShadowingPhrase } from "@/features/shadowing/model";
import {
    computeStressedWords,
    computeLinkedPairs,
} from "@/features/shadowing/model/shadowing.computations";

interface ShadowingPhraseRaw {
    sentence: string;
    stressedWords: string[];
    linkedPairs: [string, string][];
    ipa: string;
    focusWord: string;
}

interface FeedbackResult {
    improvedResponse: string;
    explanation: string;
    keyChanges: Array<{
        original: string;
        improved: string;
        reason: string;
    }>;
    communicationScore: number;
    tone: string;
    shadowingPhrases?: ShadowingPhraseRaw[];
}

interface FeedbackCardProps {
    question: string;
    userDraft: string;
    strategy: string;
    framework?: { name: string; description: string };
    suggestedOpener: string;
    scenarioType?: string;
    interlocutor?: string;
    /** Called when user finishes this card (advance to next question) */
    onComplete: () => void;
    onBack: () => void;
    isLastQuestion?: boolean;
}

export function FeedbackCard({
    question,
    userDraft,
    strategy,
    framework,
    suggestedOpener,
    scenarioType,
    interlocutor,
    onComplete,
    onBack,
    isLastQuestion,
}: FeedbackCardProps) {
    const [loading, setLoading] = useState(true);
    const [feedback, setFeedback] = useState<FeedbackResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [showShadowingModal, setShowShadowingModal] = useState(false);

    /* Fetch feedback from /evaluate-briefing-draft endpoint */
    useEffect(() => {
        let cancelled = false;

        async function fetchFeedback() {
            try {
                const token = await getAuthToken();
                const url = `${SUPABASE_URL}/functions/v1/make-server-08b8658d/evaluate-briefing-draft`;
                const res = await fetch(url, {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        question,
                        userDraft,
                        strategy,
                        framework,
                        suggestedOpener,
                        scenarioType,
                        interlocutor,
                    }),
                });

                if (!res.ok) {
                    const errText = await res.text();
                    throw new Error(`Evaluation failed (${res.status}): ${errText}`);
                }

                const data: FeedbackResult = await res.json();
                if (!cancelled) {
                    setFeedback(data);
                    setLoading(false);
                }
            } catch (err: any) {
                if (!cancelled) {
                    setError(err.message || "Failed to get feedback");
                    setLoading(false);
                }
            }
        }

        fetchFeedback();
        return () => { cancelled = true; };
    }, [question, userDraft, strategy, framework, suggestedOpener, scenarioType, interlocutor]);

    /* ── Convert GPT shadowingPhrases → ShadowingPhrase[] for modal ── */
    const shadowingPhrases: ShadowingPhrase[] = useMemo(() => {
        if (!feedback) return [];

        // If GPT returned proper shadowing phrases, use them directly
        if (feedback.shadowingPhrases?.length) {
            return feedback.shadowingPhrases.map((p, i) => ({
                id: `briefing-chunk-${i}`,
                sentence: p.sentence,
                focusWord: p.focusWord || "",
                ipa: p.ipa || "",
                originalScore: 0,
                problemWords: [],
                turnIndex: i,
                stressedWords: p.stressedWords,
                linkedPairs: p.linkedPairs,
            }));
        }

        // Fallback: GPT didn't return shadowingPhrases (truncated/omitted).
        // Split the improved response into sentence-level chunks and
        // apply heuristic annotations (same logic as PronunciationTab).
        if (!feedback.improvedResponse) return [];

        const text = feedback.improvedResponse;

        // Split into sentence-level chunks (by ., !, ?, or ;)
        const rawChunks = text
            .split(/(?<=[.!?;])\s+/)
            .map(s => s.trim())
            .filter(s => s.length > 5);

        // If the response is very short, keep it as one phrase
        const chunks = rawChunks.length > 0 ? rawChunks : [text];

        return chunks.map((chunk, i) => {
            const stressed = computeStressedWords(chunk);
            const linked = computeLinkedPairs(chunk);
            // Find the longest content word as focus word
            const words = chunk.split(/\s+/).filter(w => w.replace(/[^a-zA-Z]/g, "").length >= 4);
            const focusWord = words.sort((a, b) => b.length - a.length)[0] || "";

            return {
                id: `briefing-heuristic-${i}`,
                sentence: chunk,
                focusWord: focusWord.replace(/[.,!?;:'"()]/g, ""),
                ipa: "", // No IPA without GPT data
                originalScore: 0,
                problemWords: [],
                turnIndex: i,
                stressedWords: stressed,
                linkedPairs: linked,
            };
        });
    }, [feedback]);

    /* ── Loading state ── */
    if (loading) {
        return (
            <motion.div aria-label="FeedbackCard"
                className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm overflow-hidden"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="px-6 py-3 bg-[#f8fafc] border-b border-[#f1f5f9]">
                    <span className="text-[11px] text-[#94a3b8]" style={{ fontWeight: 500 }}>
                        Step 4 of 4
                    </span>
                </div>
                <div className="flex flex-col items-center justify-center py-14 px-6">
                    <Loader2 className="w-10 h-10 text-[#6366f1] animate-spin mb-4" />
                    <p className="text-sm text-[#45556c]" style={{ fontWeight: 500 }}>
                        Analyzing your answer...
                    </p>
                    <p className="text-xs text-[#94a3b8] mt-1">
                        Getting an improved version based on the strategy
                    </p>
                </div>
            </motion.div>
        );
    }

    /* ── Error state ── */
    if (error) {
        return (
            <motion.div
                className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm overflow-hidden"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="px-6 py-3 bg-[#f8fafc] border-b border-[#f1f5f9]">
                    <span className="text-[11px] text-[#94a3b8]" style={{ fontWeight: 500 }}>
                        Step 4 of 4
                    </span>
                </div>
                <div className="flex flex-col items-center justify-center py-14 px-6">
                    <p className="text-sm text-red-600 mb-3">Feedback generation failed</p>
                    <p className="text-xs text-[#94a3b8] mb-4">{error}</p>
                    <button
                        onClick={onComplete}
                        className="px-5 py-2 rounded-full text-sm bg-[#0f172b] text-white hover:bg-[#1d293d] transition-colors"
                        style={{ fontWeight: 500 }}
                    >
                        Skip to Next Question
                    </button>
                </div>
            </motion.div>
        );
    }

    if (!feedback) return null;

    return (
        <>
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
                        Step 4 of 4
                    </span>
                    <span className="text-[11px] text-emerald-600" style={{ fontWeight: 600 }}>
                        AI Feedback
                    </span>
                </div>

                <div className="px-6 py-6 md:px-8 space-y-5">
                    {/* ── Score pill ── */}
                    <div className="flex items-center gap-3">
                        <div className={`px-3 py-1 rounded-full text-xs ${
                            feedback.communicationScore >= 70
                                ? "bg-emerald-50 text-emerald-700"
                                : feedback.communicationScore >= 40
                                    ? "bg-amber-50 text-amber-700"
                                    : "bg-red-50 text-red-700"
                        }`} style={{ fontWeight: 600 }}>
                            Draft Score: {feedback.communicationScore}/100
                        </div>
                        <span className="text-xs text-[#94a3b8]">
                            Tone: {feedback.tone}
                        </span>
                    </div>

                    {/* ── Improved Response ── */}
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="w-4 h-4 text-[#6366f1]" />
                            <h3 className="text-sm text-[#0f172b]" style={{ fontWeight: 600 }}>
                                Improved Response
                            </h3>
                        </div>
                        <div className="bg-gradient-to-br from-[#eef2ff] to-[#f0f9ff] rounded-xl border border-[#c7d2fe]/30 p-4">
                            <p
                                className="text-sm text-[#0f172b] leading-relaxed"
                                style={{ fontWeight: 500 }}
                            >
                                "{feedback.improvedResponse}"
                            </p>
                        </div>
                        <p className="text-xs text-[#62748e] mt-2 leading-relaxed">
                            {feedback.explanation}
                        </p>
                    </div>

                    {/* ── Key Changes ── */}
                    {feedback.keyChanges.length > 0 && (
                        <div>
                            <h3 className="text-xs text-[#94a3b8] mb-2 uppercase tracking-wider" style={{ fontWeight: 600 }}>
                                What Changed & Why
                            </h3>
                            <div className="space-y-2">
                                {feedback.keyChanges.map((change, i) => (
                                    <div
                                        key={i}
                                        className="bg-[#f8fafc] border border-[#e2e8f0] rounded-lg p-3"
                                    >
                                        <div className="flex items-start gap-2">
                                            <span className="text-xs text-[#94a3b8] mt-0.5 shrink-0">→</span>
                                            <div>
                                                <p className="text-xs text-[#0f172b]" style={{ fontWeight: 500 }}>
                                                    {change.improved}
                                                </p>
                                                <p className="text-xs text-[#62748e] mt-0.5">
                                                    {change.reason}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ── Practice Saying It — opens ShadowingModal ── */}
                    <div className="border-t border-[#f1f5f9] pt-5">
                        <h3 className="text-sm text-[#0f172b] mb-2" style={{ fontWeight: 600 }}>
                            🎧 Practice Saying It
                        </h3>
                        <p className="text-xs text-[#62748e] mb-4">
                            Practice each phrase with pronunciation scoring, IPA guides, and stress markers.
                        </p>
                        <button
                            onClick={() => setShowShadowingModal(true)}
                            className="flex items-center gap-2.5 px-5 py-3 rounded-xl bg-gradient-to-r from-[#6366f1] to-[#4f46e5] text-white text-sm hover:from-[#4f46e5] hover:to-[#4338ca] transition-all shadow-md shadow-[#6366f1]/20 active:scale-[0.97]"
                            style={{ fontWeight: 600 }}
                        >
                            <Headphones className="w-4 h-4" />
                            Open Practice Modal
                            <span className="text-[10px] text-white/70 ml-1">
                                {shadowingPhrases.length} phrase{shadowingPhrases.length !== 1 ? "s" : ""}
                            </span>
                        </button>
                    </div>
                </div>

                {/* Navigation */}
                <div className="px-6 py-4 border-t border-[#f1f5f9] flex items-center justify-between">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-1.5 text-sm text-[#45556c] hover:text-[#0f172b] transition-colors"
                        style={{ fontWeight: 500 }}
                    >
                        <ArrowLeft className="w-4 h-4" />
                        My Answer
                    </button>
                    <button
                        onClick={onComplete}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm bg-[#0f172b] text-white hover:bg-[#1d293d] transition-colors shadow-sm"
                        style={{ fontWeight: 500 }}
                    >
                        {isLastQuestion ? "See Results" : "Next Question"}
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </motion.div>

            {/* Shadowing Modal */}
            {showShadowingModal && shadowingPhrases.length > 0 && (
                <ShadowingModal
                    phrases={shadowingPhrases}
                    scenarioLabel={question.length > 40 ? question.slice(0, 40) + "…" : question}
                    scenarioType={scenarioType}
                    onClose={() => setShowShadowingModal(false)}
                />
            )}
        </>
    );
}
