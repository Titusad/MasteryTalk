/**
 * ==============================================================
 *  BriefingCard — Single question card with 3 tabbed layers
 *
 *  Layers: Strategy → Phrases & Practice → Your Response
 *  Pill tabs at top (all freely clickable). No sequential lock.
 *
 *  Sub-navigation at the bottom:
 *    [← Previous]  [Next →]  (always enabled)
 *    Response tab also shows "Got it — Next Card" after done/skip
 *
 *  Navigation: simple conditional render (no scroll-snap).
 * ==============================================================
 */

import { useState, useCallback } from "react";
import { BookOpen, Volume2, PenLine, Check, Lock, ChevronRight, ChevronLeft, CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";
import type { InterviewQuestionCard } from "../../../services/types";
import { StrategyLayer } from "./StrategyLayer";
import { PhrasesLayer } from "./PhrasesLayer";
import { ResponseLayer } from "./ResponseLayer";

type LayerKey = "strategy" | "phrases" | "response";

const LAYER_ORDER: LayerKey[] = ["strategy", "phrases", "response"];

interface BriefingCardProps {
    card: InterviewQuestionCard;
    index: number;
    isUnlocked: boolean;
    isCardComplete: boolean;
    onCardComplete: () => void;
    /** Bubble draft text changes up (Gap B) */
    onDraftChange?: (text: string) => void;
}

const LAYERS: { key: LayerKey; label: string; icon: typeof BookOpen }[] = [
    { key: "strategy", label: "Strategy", icon: BookOpen },
    { key: "phrases", label: "Phrases & Practice", icon: Volume2 },
    { key: "response", label: "Your Response", icon: PenLine },
];

export function BriefingCard({ card, index, isUnlocked, isCardComplete, onCardComplete, onDraftChange }: BriefingCardProps) {
    const [activeLayer, setActiveLayer] = useState<LayerKey>("strategy");
    /* Track which layers the user has interacted with (visual indicators only, no gating) */
    const [visited, setVisited] = useState<Record<LayerKey, boolean>>({
        strategy: true, // starts here
        phrases: isCardComplete,
        response: isCardComplete,
    });
    /* Response completion — needed for "Got it" button */
    const [responseComplete, setResponseComplete] = useState(isCardComplete);

    /* Mark layer as visited when navigating to it */
    const navigateTo = useCallback((key: LayerKey) => {
        setActiveLayer(key);
        setVisited((prev) => ({ ...prev, [key]: true }));
    }, []);

    /* Sub-nav: go to next layer */
    const handleNext = useCallback(() => {
        const currentIdx = LAYER_ORDER.indexOf(activeLayer);
        if (currentIdx < LAYER_ORDER.length - 1) {
            navigateTo(LAYER_ORDER[currentIdx + 1]);
        }
    }, [activeLayer, navigateTo]);

    /* Sub-nav: go to previous layer */
    const handlePrev = useCallback(() => {
        const currentIdx = LAYER_ORDER.indexOf(activeLayer);
        if (currentIdx > 0) {
            navigateTo(LAYER_ORDER[currentIdx - 1]);
        }
    }, [activeLayer, navigateTo]);

    /* "Got it" — complete the entire card */
    const handleGotIt = useCallback(() => {
        if (!isCardComplete) {
            onCardComplete();
        }
    }, [isCardComplete, onCardComplete]);

    /* Response layer signals completion (typed 30+ chars or skipped) */
    const handleResponseComplete = useCallback(() => {
        setResponseComplete(true);
    }, []);

    const activeIdx = LAYER_ORDER.indexOf(activeLayer);
    const hasPrev = activeIdx > 0;
    const hasNext = activeIdx < LAYER_ORDER.length - 1;
    const isResponse = activeLayer === "response";

    /* Locked card */
    if (!isUnlocked) {
        return (
            <motion.div
                className="bg-white/60 rounded-2xl border border-[#e2e8f0] p-6 md:p-8 opacity-60"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 0.6, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.06 }}
            >
                <div className="flex items-center gap-4">
                    <span
                        className="w-9 h-9 rounded-xl bg-[#f1f5f9] flex items-center justify-center text-sm text-[#94a3b8] shrink-0"
                        style={{ fontWeight: 700 }}
                    >
                        {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                        <p className="text-[#94a3b8] text-base" style={{ fontWeight: 600 }}>
                            "{card.question}"
                        </p>
                    </div>
                    <Lock className="w-4 h-4 text-[#94a3b8] shrink-0" />
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            className={`bg-white rounded-2xl border overflow-hidden transition-all ${isCardComplete
                    ? "border-emerald-200 shadow-sm"
                    : "border-[#6366f1]/20 shadow-md shadow-[#6366f1]/5"
                }`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.06 }}
        >
            {/* Card header — question display */}
            <div className="px-6 py-6 md:px-8 md:py-7 flex items-start gap-4">
                <span
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm shrink-0 mt-0.5 ${isCardComplete
                            ? "bg-emerald-500 text-white"
                            : "bg-[#6366f1] text-white"
                        }`}
                    style={{ fontWeight: 700 }}
                >
                    {isCardComplete ? <Check className="w-4 h-4" /> : index + 1}
                </span>
                <div className="flex-1 min-w-0">
                    <p className="text-[#0f172b] text-base md:text-lg leading-relaxed" style={{ fontWeight: 600 }}>
                        "{card.question}"
                    </p>
                </div>
            </div>

            {/* Pill tabs — all freely clickable */}
            <div className="flex items-center gap-2 px-6 py-4 md:px-8 bg-[#f8fafc] border-y border-[#f1f5f9] overflow-x-auto">
                {LAYERS.map(({ key, label, icon: Icon }, i) => {
                    const isActive = activeLayer === key;
                    const wasVisited = visited[key] && !isActive;

                    return (
                        <button
                            key={key}
                            onClick={() => navigateTo(key)}
                            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs transition-all whitespace-nowrap ${isActive
                                    ? "bg-[#6366f1] text-white shadow-sm"
                                    : wasVisited
                                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                        : "bg-white text-[#45556c] border border-[#e2e8f0] hover:border-[#c7d2e0]"
                                }`}
                            style={{ fontWeight: 500 }}
                        >
                            {wasVisited ? (
                                <Check className="w-3 h-3" />
                            ) : (
                                <Icon className="w-3 h-3" />
                            )}
                            {label}
                            {i < LAYERS.length - 1 && (
                                <ChevronRight className="w-3 h-3 text-[#c7d2e0] ml-0.5 hidden sm:block" />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Layer content — conditional render, no lock screens */}
            <div className="px-2 py-2 md:px-3 md:py-3">
                {activeLayer === "strategy" && (
                    <StrategyLayer
                        why={card.why}
                        approach={card.approach}
                        suggestedOpener={card.suggestedOpener}
                        framework={card.framework}
                        pivot={card.pivot}
                    />
                )}

                {activeLayer === "phrases" && (
                    <PhrasesLayer
                        cardId={card.id}
                        phrases={card.keyPhrases}
                    />
                )}

                {activeLayer === "response" && (
                    <ResponseLayer
                        question={card.question}
                        isComplete={responseComplete}
                        onComplete={handleResponseComplete}
                        onDraftChange={onDraftChange}
                    />
                )}
            </div>

            {/* ── Sub-navigation bar ── */}
            <div className="px-6 py-4 md:px-8 border-t border-[#f1f5f9] flex items-center justify-between">
                {/* Previous — always enabled */}
                {hasPrev ? (
                    <button
                        onClick={handlePrev}
                        className="flex items-center gap-1.5 text-sm text-[#45556c] hover:text-[#0f172b] transition-colors"
                        style={{ fontWeight: 500 }}
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                    </button>
                ) : (
                    <div />
                )}

                {/* Right side: Next OR "Got it" */}
                {isResponse ? (
                    /* "Got it" button — enabled after response done/skipped */
                    responseComplete || isCardComplete ? (
                        <motion.button
                            onClick={handleGotIt}
                            disabled={isCardComplete}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm transition-all ${isCardComplete
                                    ? "bg-emerald-50 text-emerald-600 border border-emerald-200 cursor-default"
                                    : "bg-[#6366f1] text-white hover:bg-[#4f46e5] shadow-sm"
                                }`}
                            style={{ fontWeight: 500 }}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.25 }}
                        >
                            <CheckCircle2 className="w-4 h-4" />
                            {isCardComplete ? "Completed" : "Got it — Next Card"}
                        </motion.button>
                    ) : (
                        <span className="text-xs text-[#94a3b8] italic">
                            Draft your answer or skip to continue
                        </span>
                    )
                ) : hasNext ? (
                    <button
                        onClick={handleNext}
                        className="flex items-center gap-1.5 text-sm text-[#6366f1] hover:text-[#4f46e5] transition-colors"
                        style={{ fontWeight: 500 }}
                    >
                        Next
                        <ChevronRight className="w-4 h-4" />
                    </button>
                ) : (
                    <div />
                )}
            </div>
        </motion.div>
    );
}