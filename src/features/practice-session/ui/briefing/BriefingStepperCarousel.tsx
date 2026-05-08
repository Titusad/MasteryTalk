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

import { useState, useCallback, useRef, useEffect } from "react";
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
    onProgressChange?: (activeIdx: number, completedSet: Set<number>) => void;
    scenarioType?: string;
    interlocutor?: string;
    cardLabel?: string;
    completedLabel?: string;
}

export function BriefingStepperCarousel({
    cards,
    onAllComplete,
    onDraftChange,
    onProgressChange,
    scenarioType,
    interlocutor,
    cardLabel = "Question",
    completedLabel = "mastered",
}: BriefingStepperCarouselProps) {
    const STEPS: BriefingStep[] = ["question", "strategy", "answer", "feedback"];

    /* ── Audio context (created once, reused) ── */
    const audioCtxRef = useRef<AudioContext | null>(null);
    useEffect(() => () => { audioCtxRef.current?.close(); }, []);

    const playFlipSound = useCallback(() => {
        try {
            if (!audioCtxRef.current || audioCtxRef.current.state === "closed") {
                audioCtxRef.current = new AudioContext();
            }
            const ctx = audioCtxRef.current;
            const duration = 0.08;
            const bufferSize = Math.floor(ctx.sampleRate * duration);
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);

            for (let i = 0; i < bufferSize; i++) {
                data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2.5);
            }

            const source = ctx.createBufferSource();
            source.buffer = buffer;

            const filter = ctx.createBiquadFilter();
            filter.type = "lowpass";
            filter.frequency.value = 2800;

            const gain = ctx.createGain();
            gain.gain.value = 0.22;

            source.connect(filter);
            filter.connect(gain);
            gain.connect(ctx.destination);
            source.start();
        } catch {
            // Silently fail — non-critical UI effect
        }
    }, []);

    /* ── State ── */
    const [activeQuestionIdx, setActiveQuestionIdx] = useState(0);
    const [activeStep, setActiveStep] = useState<BriefingStep>("question");
    const [flipDirection, setFlipDirection] = useState(1);
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

    /* ── Flipbook variants ── */
    const FLIP_VARIANTS = {
        enter: (dir: number) => ({
            rotateY: dir > 0 ? -90 : 90,
            opacity: 0,
            transformPerspective: 900,
            transformOrigin: "center center",
        }),
        center: {
            rotateY: 0,
            opacity: 1,
            transformPerspective: 900,
            transformOrigin: "center center",
        },
        exit: (dir: number) => ({
            rotateY: dir > 0 ? 90 : -90,
            opacity: 0,
            transformPerspective: 900,
            transformOrigin: "center center",
        }),
    };

    /* ── Step navigation ── */
    const goToStep = useCallback((step: BriefingStep) => {
        const currentIdx = STEPS.indexOf(activeStep);
        const nextIdx = STEPS.indexOf(step);
        setFlipDirection(nextIdx >= currentIdx ? 1 : -1);
        playFlipSound();
        setActiveStep(step);
    }, [activeStep, playFlipSound]);

    /* ── Report progress to parent (side nav) ── */
    useEffect(() => {
        onProgressChange?.(activeQuestionIdx, completedQuestions);
    }, [activeQuestionIdx, completedQuestions, onProgressChange]);

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

    return (
        <div className="space-y-6">
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
                <AnimatePresence mode="wait" custom={flipDirection}>
                    {activeStep === "question" && (
                        <motion.div
                            key={`q-${activeQuestionIdx}-question`}
                            custom={flipDirection}
                            variants={FLIP_VARIANTS}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.38, ease: [0.25, 0.46, 0.45, 0.94] }}
                        >
                            <QuestionCard
                                question={currentCard.question}
                                questionNumber={activeQuestionIdx + 1}
                                totalQuestions={totalQuestions}
                                scenarioType={scenarioType}
                                onNext={() => goToStep("strategy")}
                            />
                        </motion.div>
                    )}

                    {activeStep === "strategy" && (
                        <motion.div
                            key={`q-${activeQuestionIdx}-strategy`}
                            custom={flipDirection}
                            variants={FLIP_VARIANTS}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.38, ease: [0.25, 0.46, 0.45, 0.94] }}
                        >
                            <StrategyCard
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
                        </motion.div>
                    )}

                    {activeStep === "answer" && (
                        <motion.div
                            key={`q-${activeQuestionIdx}-answer`}
                            custom={flipDirection}
                            variants={FLIP_VARIANTS}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.38, ease: [0.25, 0.46, 0.45, 0.94] }}
                        >
                            <AnswerCard
                                question={currentCard.question}
                                scenarioType={scenarioType}
                                preparedResponse={assembledResponses[activeQuestionIdx]}
                                onNext={(draft, pron) => handleAnswerSubmit(draft, pron)}
                                onBack={() => goToStep("strategy")}
                            />
                        </motion.div>
                    )}

                    {activeStep === "feedback" && (
                        <motion.div
                            key={`q-${activeQuestionIdx}-feedback`}
                            custom={flipDirection}
                            variants={FLIP_VARIANTS}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.38, ease: [0.25, 0.46, 0.45, 0.94] }}
                        >
                            <FeedbackCard
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
                        </motion.div>
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
