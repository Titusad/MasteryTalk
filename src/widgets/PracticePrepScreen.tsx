/**
 * ==============================================================
 *  MasteryTalk PRO — Practice Preparation Screen (Stepper Edition)
 *
 *  New 4-step per-question mastery flow:
 *    Step 1: See the question
 *    Step 2: Understand the strategy
 *    Step 3: Record your answer (voice STT)
 *    Step 4: Get AI feedback + shadowing practice
 *
 *  Cultural Tips & Questions to Ask are NOT shown in the UI;
 *  they are included in the post-session comprehensive PDF report.
 * ==============================================================
 */

import { useState, useCallback, useRef } from "react";
import { motion } from "motion/react";
import {
    ArrowLeft,
} from "lucide-react";
import {
    PageTitleBlock,
} from "@/shared/ui";
import type { InterviewBriefingData } from "@/services/types";
import type { ScenarioType } from "@/services/types";
import { BriefingStepperCarousel } from "@/features/practice-session/ui/briefing/BriefingStepperCarousel";
import { ReadinessScore } from "@/features/practice-session/ui/briefing/ReadinessScore";

/* ── Minimum cards to unlock practice early ── */
const MIN_CARDS_FOR_SKIP = 3;

/* ── Interlocutor labels ── */
const INTERLOCUTOR_LABELS: Record<string, { label: string }> = {
    recruiter: { label: "Recruiter" },
    sme: { label: "Technical Expert" },
    hiring_manager: { label: "Hiring Manager" },
    hr: { label: "HR / People & Culture" },
    meeting_facilitator: { label: "Meeting Facilitator" },
    senior_stakeholder: { label: "Senior Stakeholder" },
};

interface PracticePrepScreenProps {
    interlocutor: string;
    briefingData: InterviewBriefingData;
    /** Now receives user drafts keyed by question id */
    onStartSimulation: (userDrafts: Record<number, string>) => void;
    onBack: () => void;
    scenario?: string;
    scenarioType?: ScenarioType;
}

/* ── Main Screen ── */
export function PracticePrepScreen({
    interlocutor,
    briefingData,
    onStartSimulation,
    onBack,
    scenario,
    scenarioType,
}: PracticePrepScreenProps) {
    const [allDone, setAllDone] = useState(false);
    const [actualCompleted, setActualCompleted] = useState(0);

    /** Accumulated user drafts keyed by question id (Gap B) */
    const draftsRef = useRef<Record<number, string>>({});

    const handleDraftChange = useCallback((questionId: number, text: string) => {
        draftsRef.current[questionId] = text;
    }, []);

    const interlocutorInfo = INTERLOCUTOR_LABELS[interlocutor] ?? {
        label: interlocutor,
    };

    const handleAllComplete = useCallback((completedCount: number) => {
        setActualCompleted(completedCount);
        setAllDone(true);
    }, []);

    const handleStartPractice = useCallback(() => {
        onStartSimulation(draftsRef.current);
    }, [onStartSimulation]);

    return (
        <div aria-label="PracticePrepScreen"
            className="w-full min-h-full flex flex-col bg-[#f0f4f8] relative overflow-hidden"
            style={{ fontFamily: "'Inter', sans-serif" }}
        >


            <main className="relative w-full max-w-[800px] mx-auto px-4 sm:px-6 pt-6 pb-20">

                {/* Header */}
                <PageTitleBlock
                    title={scenarioType === "sales" ? "Sales Preparation" : "Interview Preparation"}
                    subtitle={scenarioType === "sales"
                        ? `${briefingData.anticipatedQuestions.length} sections — master each one step by step.`
                        : `${briefingData.anticipatedQuestions.length} questions your ${interlocutorInfo.label} will likely ask — master each one.`
                    }
                />

                {/* ── Carousel or Readiness Score ── */}
                {allDone ? (
                    <ReadinessScore
                        totalCards={briefingData.anticipatedQuestions.length}
                        completedCards={actualCompleted}
                        onStartPractice={handleStartPractice}
                    />
                ) : (
                    <BriefingStepperCarousel
                        cards={briefingData.anticipatedQuestions}
                        onAllComplete={handleAllComplete}
                        onDraftChange={handleDraftChange}
                        isSales={scenarioType === "sales"}
                        scenarioType={scenarioType}
                        interlocutor={interlocutor}
                    />
                )}



                {/* Back Button (Bottom) */}
                <motion.div
                    className="mt-12 text-center flex justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                >
                    <button
                        onClick={onBack}
                        className="flex items-center gap-1.5 text-sm text-[#45556c] hover:text-[#0f172b] transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </button>
                </motion.div>
            </main>
        </div>
    );
}