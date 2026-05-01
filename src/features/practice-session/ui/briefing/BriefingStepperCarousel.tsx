/**
 * ==============================================================
 *  BriefingStepperCarousel — New 4-step per-question briefing flow
 *
 *  Replaces the old BriefingCarousel (3 tabs per card) with a
 *  sequential 4-step flow per question:
 *    Step 1: QuestionCard  — Shows only the question
 *    Step 2: StrategyCard  — Why + strategy + framework + opener
 *    Step 3: AnswerCard    — Voice STT or text response
 *    Step 4: FeedbackCard  — AI feedback + improved response + shadowing
 *
 *  User starts with 3 mandatory questions. After completing those,
 *  a "Load More Questions" button appears to add up to 5 total.
 *  After all visible questions are done, signals onAllComplete.
 * ==============================================================
 */

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { PartyPopper } from "lucide-react";
import type { InterviewQuestionCard, AzurePronunciationAssessment } from "@/services/types";
import { QuestionCard } from "./QuestionCard";
import { StrategyCard } from "./StrategyCard";
import { AnswerCard } from "./AnswerCard";
import { FeedbackCard } from "./FeedbackCard";
import confetti from "canvas-confetti";

type BriefingStep = "question" | "strategy" | "answer" | "feedback";

const MIN_TO_SKIP = 3;

interface BriefingStepperCarouselProps {
    cards: InterviewQuestionCard[];
    onAllComplete: (completedCount: number) => void;
    onDraftChange?: (questionId: number, text: string) => void;
    scenarioType?: string;
    interlocutor?: string;
    cardLabel?: string;
    completedLabel?: string;
}

export function BriefingStepperCarousel({
    cards,
    onAllComplete,
    onDraftChange,
    scenarioType,
    interlocutor,
    cardLabel = "Question",
    completedLabel = "mastered",
}: BriefingStepperCarouselProps) {
    /* ── State ── */
    const [activeQuestionIdx, setActiveQuestionIdx] = useState(0);
    const [activeStep, setActiveStep] = useState<BriefingStep>("question");
    const [completedQuestions, setCompletedQuestions] = useState<Set<number>>(new Set());
    const [showCelebration, setShowCelebration] = useState(false);

    /* Store user drafts per question for the AI feedback call */
    const userDraftsRef = useRef<Record<number, string>>({});
    /* Store assembled responses per question (from StrategyCard fill-in inputs) */
    const [assembledResponses, setAssembledResponses] = useState<Record<number, string>>({});
    /* Store pronunciation assessment per question (Azure, only when preparedResponse exists) */
    const pronDataRef = useRef<Record<number, AzurePronunciationAssessment>>({});

    const visibleCards = cards.slice(0, Math.min(5, cards.length));
    const currentCard = visibleCards[activeQuestionIdx];
    const totalQuestions = visibleCards.length;
    const progress = totalQuestions > 0 ? (completedQuestions.size / totalQuestions) * 100 : 0;
    const canSkip = completedQuestions.size >= MIN_TO_SKIP && completedQuestions.size < totalQuestions;

    /* ── Step navigation ── */
    const goToStep = useCallback((step: BriefingStep) => {
        setActiveStep(step);
        window.scrollTo({ top: 200, behavior: "smooth" });
    }, []);

    /* ── Answer submission → stores draft, advances to feedback ── */
    const handleAnswerSubmit = useCallback((draft: string, pronAssessment?: AzurePronunciationAssessment) => {
        userDraftsRef.current[activeQuestionIdx] = draft;
        if (pronAssessment) pronDataRef.current[activeQuestionIdx] = pronAssessment;
        if (onDraftChange) {
            onDraftChange(currentCard.id, draft);
        }
        goToStep("feedback");
    }, [activeQuestionIdx, currentCard, onDraftChange, goToStep]);

    /* ── Skip remaining questions → go straight to practice ── */
    const handleSkip = useCallback(() => {
        // Pass only the actually completed count, not the total
        onAllComplete(completedQuestions.size);
    }, [onAllComplete, completedQuestions]);

    /* ── Complete current question → advance to next or finish ── */
    const handleQuestionComplete = useCallback(() => {
        setCompletedQuestions((prev) => {
            const next = new Set(prev);
            next.add(activeQuestionIdx);
            return next;
        });

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

            if (activeQuestionIdx + 1 < totalQuestions) {
                /* Next question → reset to Step 1 */
                setActiveQuestionIdx(activeQuestionIdx + 1);
                setActiveStep("question");
                window.scrollTo({ top: 0, behavior: "smooth" });
            } else {
                /* All visible questions done */
                onAllComplete(completedQuestions.size + 1); // +1 for current
            }
        }, 1500);
    }, [activeQuestionIdx, totalQuestions, onAllComplete]);

    const STEPS: BriefingStep[] = ["question", "strategy", "answer", "feedback"];
    const activeStepIdx = STEPS.indexOf(activeStep);

    return (
        <div className="space-y-6">
            {/* Progress row — counter + step dots + mastered, all in one line */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <span className="text-xs text-[#62748e] shrink-0 font-medium" >
                        {cardLabel} {activeQuestionIdx + 1} of {totalQuestions}
                    </span>

                    {/* Step indicators */}
                    <div className="flex items-center gap-1.5">
                        {STEPS.map((step, i) => (
                            <div key={step} className="flex items-center gap-1.5">
                                <div
                                    className={`w-1.5 h-1.5 rounded-full transition-all ${
                                        step === activeStep
                                            ? "bg-[#6366f1] scale-150"
                                            : i < activeStepIdx
                                                ? "bg-emerald-400"
                                                : "bg-[#d1d5db]"
                                    }`}
                                />
                                {i < 3 && (
                                    <div className={`w-6 h-[1px] ${
                                        i < activeStepIdx
                                            ? "bg-emerald-300"
                                            : "bg-[#e2e8f0]"
                                    }`} />
                                )}
                            </div>
                        ))}
                    </div>

                    <span className="text-xs text-[#62748e] shrink-0 font-medium" >
                        {completedQuestions.size}/{totalQuestions} {completedLabel}
                    </span>
                </div>
                <div className="w-full h-2 bg-[#f1f5f9] rounded-full overflow-hidden">
                    <motion.div
                        className="h-full rounded-full"
                        style={{ background: "linear-gradient(90deg, #6366f1, #14b8a6)" }}
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
                                <p className="text-sm text-[#0f172b] font-semibold" >
                                    {cardLabel} {completedLabel}!
                                </p>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Active card — render based on current step */}
                <AnimatePresence mode="wait">
                    {activeStep === "question" && (
                        <QuestionCard
                            key={`q-${activeQuestionIdx}-question`}
                            question={currentCard.question}
                            questionNumber={activeQuestionIdx + 1}
                            totalQuestions={totalQuestions}
                            scenarioType={scenarioType}
                            onNext={() => goToStep("strategy")}
                        />
                    )}

                    {activeStep === "strategy" && (
                        <StrategyCard
                            key={`q-${activeQuestionIdx}-strategy`}
                            question={currentCard.question}
                            why={currentCard.why}
                            approach={currentCard.approach}
                            suggestedOpener={currentCard.suggestedOpener}
                            exampleAnswer={currentCard.exampleAnswer}
                            framework={currentCard.framework}
                            pivot={currentCard.pivot}
                            scenarioType={scenarioType}
                            responseSteps={currentCard.responseSteps}
                            onNext={(assembled) => {
                                if (assembled) {
                                    setAssembledResponses(prev => ({ ...prev, [activeQuestionIdx]: assembled }));
                                }
                                goToStep("answer");
                            }}
                            onBack={() => goToStep("question")}
                        />
                    )}

                    {activeStep === "answer" && (
                        <AnswerCard
                            key={`q-${activeQuestionIdx}-answer`}
                            question={currentCard.question}
                            scenarioType={scenarioType}
                            preparedResponse={assembledResponses[activeQuestionIdx]}
                            onNext={(draft, pron) => handleAnswerSubmit(draft, pron)}
                            onBack={() => goToStep("strategy")}
                        />
                    )}

                    {activeStep === "feedback" && (
                        <FeedbackCard
                            key={`q-${activeQuestionIdx}-feedback`}
                            question={currentCard.question}
                            userDraft={userDraftsRef.current[activeQuestionIdx] || ""}
                            strategy={currentCard.approach}
                            framework={currentCard.framework}
                            suggestedOpener={currentCard.suggestedOpener}
                            preparedResponse={assembledResponses[activeQuestionIdx]}
                            pronAssessment={pronDataRef.current[activeQuestionIdx]}
                            scenarioType={scenarioType}
                            interlocutor={interlocutor}
                            onComplete={handleQuestionComplete}
                            onBack={() => goToStep("answer")}
                            isLastQuestion={activeQuestionIdx === totalQuestions - 1}
                        />
                    )}
                </AnimatePresence>
            </div>

            {/* Question dots navigation + Load More */}
            <div className="flex items-center justify-center gap-2 flex-wrap">
                {visibleCards.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => {
                            if (i <= activeQuestionIdx || completedQuestions.has(i)) {
                                setActiveQuestionIdx(i);
                                setActiveStep("question");
                            }
                        }}
                        disabled={i > activeQuestionIdx && !completedQuestions.has(i)}
                        className={`w-2.5 h-2.5 rounded-full transition-all ${
                            i === activeQuestionIdx
                                ? "bg-[#6366f1] scale-125"
                                : completedQuestions.has(i)
                                    ? "bg-emerald-400"
                                    : i <= activeQuestionIdx
                                        ? "bg-[#c7d2e0] hover:bg-[#94a3b8]"
                                        : "bg-[#e2e8f0]"
                        }`}
                        aria-label={`Go to question ${i + 1}`}
                    />
                ))}

                {/* Skip remaining questions — appears after MIN_TO_SKIP are done */}
                {canSkip && (
                    <motion.button
                        onClick={handleSkip}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] text-[#62748e] bg-[#f1f5f9] border border-[#e2e8f0] hover:bg-[#e2e8f0] hover:text-[#0f172b] transition-colors font-medium"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        Skip to Practice →
                    </motion.button>
                )}
            </div>
        </div>
    );
}
