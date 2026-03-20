/**
 * ==============================================================
 *  inFluentia PRO — Interview Briefing Screen (Carousel Edition)
 *
 *  Gamified, Duolingo-style horizontal carousel that replaces the
 *  original accordion layout. Each anticipated question becomes a
 *  BriefingCard with 3 sequential layers:
 *    Strategy → Phrases (TTS) → Shadowing (record)
 *
 *  After completing all cards the ReadinessScore screen appears
 *  with confetti, animated ring, and CTA to start practice.
 *
 *  Cultural Tips & Questions to Ask are NOT shown in the UI;
 *  they are included in the post-session comprehensive PDF report.
 * ==============================================================
 */

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
    ArrowLeft,
    MessageCircleQuestion,
    Play,
    Mic,
    Lock,
    FileText,
    Loader2,
    ChevronDown,
} from "lucide-react";
import {
    PastelBlobs,
    PageTitleBlock,
} from "./shared";
import type { InterviewBriefingData } from "../../services/types";
import type { CVMatchResult } from "../../services/cvMatchService";
import { BriefingCarousel } from "./briefing/BriefingCarousel";
import { ReadinessScore } from "./briefing/ReadinessScore";

/* ── Minimum cards to unlock practice ── */
const MIN_CARDS_FOR_PRACTICE = 3;

/* ── Interlocutor labels ── */
const INTERLOCUTOR_LABELS: Record<string, { label: string; emoji: string }> = {
    recruiter: { label: "Recruiter", emoji: "🎯" },
    sme: { label: "Technical Expert", emoji: "🔬" },
    hiring_manager: { label: "Hiring Manager", emoji: "👔" },
    hr: { label: "HR / People & Culture", emoji: "🤝" },
};

/* ── Main Screen ── */
export function InterviewBriefingScreen({
    interlocutor,
    briefingData,
    onStartSimulation,
    onBack,
    scenario,
    cvMatchData,
    cvMatchStatus,
}: {
    interlocutor: string;
    briefingData: InterviewBriefingData;
    /** Now receives user drafts keyed by question id */
    onStartSimulation: (userDrafts: Record<number, string>) => void;
    onBack: () => void;
    scenario?: string;
    cvMatchData?: CVMatchResult | null;
    cvMatchStatus?: "idle" | "loading" | "success" | "error";
}) {
    /* Carousel state lifted here so ReadinessScore can access it */
    const [completedCards, setCompletedCards] = useState<Set<number>>(new Set());
    const [activeCardIndex, setActiveCardIndex] = useState(0);
    const [allDone, setAllDone] = useState(false);
    
    // Collapsable state for Resume Tailoring Tips, closed by default
    const [isTailoringTipsOpen, setIsTailoringTipsOpen] = useState(false);

    /** Accumulated user drafts keyed by question id (Gap B) */
    const draftsRef = useRef<Record<number, string>>({});

    const handleDraftChange = useCallback((questionId: number, text: string) => {
        draftsRef.current[questionId] = text;
    }, []);

    const interlocutorInfo = INTERLOCUTOR_LABELS[interlocutor] ?? {
        label: interlocutor,
        emoji: "💼",
    };

    const practiceUnlocked = completedCards.size >= MIN_CARDS_FOR_PRACTICE;

    const handleCardComplete = useCallback((index: number) => {
        setCompletedCards((prev) => {
            const next = new Set(prev);
            next.add(index);
            return next;
        });
    }, []);

    const handleAllComplete = useCallback(() => {
        setAllDone(true);
    }, []);

    const handleStartPractice = useCallback(() => {
        onStartSimulation(draftsRef.current);
    }, [onStartSimulation]);

    return (
        <div
            className="w-full min-h-full flex flex-col bg-[#f0f4f8] relative overflow-hidden"
            style={{ fontFamily: "'Inter', sans-serif" }}
        >
            <PastelBlobs />

            <main className="relative w-full max-w-[800px] mx-auto px-4 sm:px-6 pt-10 pb-20">
                {/* Back Button */}
                <motion.button
                    onClick={onBack}
                    className="flex items-center gap-1.5 text-sm text-[#45556c] hover:text-[#0f172b] mb-6 transition-colors"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </motion.button>

                {/* Header */}
                <PageTitleBlock
                    icon={<MessageCircleQuestion className="w-8 h-8 text-white" />}
                    title="Interview Briefing"
                    subtitle={`${briefingData.anticipatedQuestions.length} questions your ${interlocutorInfo.label} will likely ask — master each one step by step.`}
                />

                {/* ── Resume Tailoring Tips ── */}
                {cvMatchStatus && cvMatchStatus !== "idle" && (
                    <motion.div
                        className="mb-8"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                    >
                        <div className="bg-white rounded-3xl border border-[#e2e8f0] p-6 md:p-8">
                            <button 
                                onClick={() => setIsTailoringTipsOpen(!isTailoringTipsOpen)}
                                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2 w-full text-left focus:outline-none group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#10b981] to-[#34d399] flex items-center justify-center shrink-0">
                                        <FileText className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-[#0f172b] group-hover:text-[#10b981] transition-colors" style={{ fontWeight: 600 }}>Resume Tailoring Tips</p>
                                        <p className="text-xs text-[#62748e]">AI analysis to match the Job Description</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] bg-[#10b981]/10 text-[#10b981] px-2.5 py-1 rounded-full shrink-0" style={{ fontWeight: 600 }}>
                                        Highly Actionable
                                    </span>
                                    <ChevronDown className={`w-5 h-5 text-[#94a3b8] transition-transform duration-300 ${isTailoringTipsOpen ? "rotate-180" : ""}`} />
                                </div>
                            </button>

                            <AnimatePresence>
                                {isTailoringTipsOpen && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0, marginTop: 0 }}
                                        animate={{ height: "auto", opacity: 1, marginTop: 16 }}
                                        exit={{ height: 0, opacity: 0, marginTop: 0 }}
                                        className="overflow-hidden"
                                    >

                            {cvMatchStatus === "loading" && (
                                <div className="flex flex-col items-center justify-center py-6 gap-3">
                                    <Loader2 className="w-6 h-6 text-[#10b981] animate-spin" />
                                    <p className="text-sm text-[#62748e]">Analyzing your CV against the Job Description...</p>
                                </div>
                            )}

                            {cvMatchStatus === "error" && (
                                <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-5 py-4 text-sm">
                                    Failed to perform CV Match analysis. Try again later.
                                </div>
                            )}

                            {cvMatchStatus === "success" && cvMatchData && (
                                <div className="space-y-3 mt-4">
                                    {cvMatchData.qualitativeInsights.map((insight: any, i: number) => (
                                        <motion.div
                                            key={i}
                                            className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-5 py-4"
                                            initial={{ opacity: 0, x: -8 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.2 + i * 0.05 }}
                                        >
                                            <p className="text-[#0f172b] text-sm mb-2" style={{ fontWeight: 600 }}>
                                                {insight.actionableAdvice}
                                            </p>
                                            <div className="flex items-start gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-[#10b981] mt-1.5 shrink-0" />
                                                <p className="text-xs text-[#45556c] leading-relaxed">
                                                    <span className="font-semibold text-[#314158]">Why:</span> {insight.finding}
                                                </p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                )}

                {/* ── Carousel or Readiness Score ── */}
                {allDone ? (
                    <ReadinessScore
                        totalCards={briefingData.anticipatedQuestions.length}
                        completedCards={completedCards.size}
                        onStartPractice={handleStartPractice}
                    />
                ) : (
                    <BriefingCarousel
                        cards={briefingData.anticipatedQuestions}
                        onAllComplete={handleAllComplete}
                        completedCards={completedCards}
                        onCardComplete={handleCardComplete}
                        activeCardIndex={activeCardIndex}
                        onNavigate={setActiveCardIndex}
                        onDraftChange={handleDraftChange}
                    />
                )}

                {/* ── Always-visible Practice Interview CTA ── */}
                {!allDone && (
                    <motion.div
                        className="mt-8"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.3 }}
                    >
                        <div className={`rounded-2xl border p-5 text-center transition-all ${practiceUnlocked
                                ? "bg-gradient-to-br from-[#f0f9ff] to-[#eef2ff] border-[#bfdbfe]/50"
                                : "bg-[#f8fafc] border-[#e2e8f0]"
                            }`}>
                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center mx-auto mb-3 transition-colors ${practiceUnlocked ? "bg-[#0f172b]" : "bg-[#cbd5e1]"
                                }`}>
                                {practiceUnlocked ? (
                                    <Mic className="w-5 h-5 text-white" />
                                ) : (
                                    <Lock className="w-5 h-5 text-white" />
                                )}
                            </div>

                            <p className="text-sm text-[#45556c] mb-3">
                                {practiceUnlocked
                                    ? "You're ready — simulate the interview with AI."
                                    : `Complete ${MIN_CARDS_FOR_PRACTICE} questions to unlock the practice interview.`
                                }
                            </p>

                            <button
                                onClick={handleStartPractice}
                                disabled={!practiceUnlocked}
                                className={`px-6 py-3 rounded-full flex items-center gap-2.5 mx-auto transition-all text-sm ${practiceUnlocked
                                        ? "bg-[#0f172b] text-white shadow-lg hover:bg-[#1d293d]"
                                        : "bg-[#e2e8f0] text-[#94a3b8] cursor-not-allowed"
                                    }`}
                                style={{ fontWeight: 500 }}
                                aria-label={practiceUnlocked ? "Start practice interview" : `Complete ${MIN_CARDS_FOR_PRACTICE - completedCards.size} more questions to unlock`}
                            >
                                <Play className="w-4 h-4" />
                                Practice Interview
                            </button>
                        </div>
                    </motion.div>
                )}
            </main>
        </div>
    );
}