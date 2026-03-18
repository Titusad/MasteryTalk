/**
 * ==============================================================
 *  BriefingCarousel — Main carousel for Interview Briefing
 *
 *  Horizontal carousel of BriefingCards with:
 *  - Progress bar at top
 *  - Sequential card unlock (card N+1 unlocks after N completes)
 *  - Micro-celebration on card completion
 *  - ReadinessScore screen after all cards are done
 *  - Navigation: Prev/Next arrows + swipe (mobile)
 * ==============================================================
 */

import { useState, useRef, useCallback, useEffect } from "react";
import { ChevronLeft, ChevronRight, Lock, PartyPopper } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import type { InterviewQuestionCard } from "../../../services/types";
import { BriefingCard } from "./BriefingCard";
import confetti from "canvas-confetti";

interface BriefingCarouselProps {
    cards: InterviewQuestionCard[];
    onAllComplete: () => void;
    completedCards: Set<number>;
    onCardComplete: (cardIndex: number) => void;
    activeCardIndex: number;
    onNavigate: (index: number) => void;
}

export function BriefingCarousel({
    cards,
    onAllComplete,
    completedCards,
    onCardComplete,
    activeCardIndex,
    onNavigate,
}: BriefingCarouselProps) {
    const [showCelebration, setShowCelebration] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    /* Card unlock logic: card is unlocked if it's the first OR the previous card is complete */
    const isCardUnlocked = useCallback(
        (index: number) => index === 0 || completedCards.has(index - 1),
        [completedCards]
    );

    /* Handle card completion */
    const handleCardComplete = useCallback(
        (index: number) => {
            if (completedCards.has(index)) return;
            onCardComplete(index);

            /* Micro-celebration */
            setShowCelebration(true);
            confetti({
                particleCount: 40,
                spread: 50,
                origin: { y: 0.7, x: 0.5 },
                colors: ["#6366f1", "#22c55e", "#f59e0b"],
            });

            setTimeout(() => {
                setShowCelebration(false);

                /* Auto-advance to next card or signal all complete */
                if (index + 1 < cards.length) {
                    onNavigate(index + 1);
                } else {
                    onAllComplete();
                }
            }, 1500);
        },
        [completedCards, onCardComplete, cards.length, onNavigate, onAllComplete]
    );

    /* Navigate */
    const goNext = useCallback(() => {
        if (activeCardIndex < cards.length - 1 && isCardUnlocked(activeCardIndex + 1)) {
            onNavigate(activeCardIndex + 1);
        }
    }, [activeCardIndex, cards.length, isCardUnlocked, onNavigate]);

    const goPrev = useCallback(() => {
        if (activeCardIndex > 0) {
            onNavigate(activeCardIndex - 1);
        }
    }, [activeCardIndex, onNavigate]);

    /* Keyboard navigation */
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "ArrowLeft") goPrev();
            if (e.key === "ArrowRight") goNext();
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [goPrev, goNext]);

    const progress = cards.length > 0 ? (completedCards.size / cards.length) * 100 : 0;

    return (
        <div className="space-y-6">
            {/* Progress bar */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <span className="text-xs text-[#62748e]" style={{ fontWeight: 500 }}>
                        Question {activeCardIndex + 1} of {cards.length}
                    </span>
                    <span className="text-xs text-[#62748e]" style={{ fontWeight: 500 }}>
                        {completedCards.size}/{cards.length} mastered
                    </span>
                </div>
                <div className="w-full h-2 bg-[#f1f5f9] rounded-full overflow-hidden">
                    <motion.div
                        className="h-full rounded-full"
                        style={{ background: "linear-gradient(90deg, #6366f1, #8b5cf6)" }}
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                </div>

            </div>

            {/* Card display */}
            <div className="relative">
                {/* Micro-celebration overlay */}
                <AnimatePresence>
                    {showCelebration && (
                        <motion.div
                            className="absolute inset-0 z-20 flex items-center justify-center bg-white/80 rounded-2xl backdrop-blur-sm"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <motion.div
                                className="flex flex-col items-center gap-3"
                                initial={{ scale: 0.5 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                            >
                                <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center">
                                    <PartyPopper className="w-8 h-8 text-emerald-500" />
                                </div>
                                <p className="text-sm text-[#0f172b]" style={{ fontWeight: 600 }}>
                                    Question mastered!
                                </p>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Active card */}
                <BriefingCard
                    key={activeCardIndex}
                    card={cards[activeCardIndex]}
                    index={activeCardIndex}
                    isUnlocked={isCardUnlocked(activeCardIndex)}
                    isCardComplete={completedCards.has(activeCardIndex)}
                    onCardComplete={() => handleCardComplete(activeCardIndex)}
                />
            </div>

            {/* Navigation arrows */}
            <div className="flex items-center justify-between">
                <button
                    onClick={goPrev}
                    disabled={activeCardIndex === 0}
                    className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm transition-all ${activeCardIndex === 0
                            ? "text-[#c7d2e0] cursor-not-allowed"
                            : "text-[#45556c] bg-white border border-[#e2e8f0] hover:border-[#c7d2e0] hover:shadow-sm"
                        }`}
                    style={{ fontWeight: 500 }}
                >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                </button>

                {/* Card dots */}
                <div className="flex items-center gap-2">
                    {cards.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => isCardUnlocked(i) && onNavigate(i)}
                            disabled={!isCardUnlocked(i)}
                            className={`w-2.5 h-2.5 rounded-full transition-all ${i === activeCardIndex
                                    ? "bg-[#6366f1] scale-125"
                                    : completedCards.has(i)
                                        ? "bg-emerald-400"
                                        : isCardUnlocked(i)
                                            ? "bg-[#c7d2e0] hover:bg-[#94a3b8]"
                                            : "bg-[#e2e8f0]"
                                }`}
                            aria-label={`Go to question ${i + 1}`}
                        />
                    ))}
                </div>

                <button
                    onClick={goNext}
                    disabled={activeCardIndex >= cards.length - 1 || !isCardUnlocked(activeCardIndex + 1)}
                    className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm transition-all ${activeCardIndex >= cards.length - 1 || !isCardUnlocked(activeCardIndex + 1)
                            ? "text-[#c7d2e0] cursor-not-allowed"
                            : "text-white bg-[#6366f1] hover:bg-[#4f46e5] shadow-sm"
                        }`}
                    style={{ fontWeight: 500 }}
                >
                    Next
                    {!isCardUnlocked(activeCardIndex + 1) && activeCardIndex < cards.length - 1 ? (
                        <Lock className="w-3.5 h-3.5" />
                    ) : (
                        <ChevronRight className="w-4 h-4" />
                    )}
                </button>
            </div>
        </div>
    );
}