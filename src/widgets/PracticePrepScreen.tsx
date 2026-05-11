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
import { useNarration } from "@/shared/lib/useNarration";
import { READINESS_URLS } from "@/features/practice-session/model/narrator-audio";
import { motion } from "motion/react";
import {
    ArrowLeft,
    Sparkles,
} from "lucide-react";
import {
    PageTitleBlock,
    FeedbackThumbs,
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

/* ── Scenario-specific copy ── */
const SCENARIO_PREP_CONFIG: Record<string, {
    title: string;
    cardLabel: string;
    completedLabel: string;
    subtitle: (n: number, interlocutor?: string, levelTitle?: string) => string;
}> = {
    interview: {
        title: "Interview Preparation",
        cardLabel: "Question",
        completedLabel: "mastered",
        subtitle: (n, il, level) => level
            ? `Let's review your ${level} — ${n} questions your ${il || "interviewer"} will likely ask. Master each one.`
            : `${n} questions your ${il || "interviewer"} will likely ask — master each one.`,
    },
    sales: {
        title: "Sales Preparation",
        cardLabel: "Section",
        completedLabel: "practiced",
        subtitle: (n, _il, level) => level
            ? `Let's review your ${level} session — ${n} sections to master step by step.`
            : `${n} sections — master each one step by step.`,
    },
    meeting: {
        title: "Meeting Preparation",
        cardLabel: "Key moment",
        completedLabel: "prepared",
        subtitle: (n, _il, level) => level
            ? `Let's review your ${level} session — ${n} key moments where your communication will define the outcome.`
            : `${n} key moments where your communication will define the outcome.`,
    },
    presentation: {
        title: "Presentation Preparation",
        cardLabel: "Key challenge",
        completedLabel: "prepared",
        subtitle: (n, _il, level) => level
            ? `Let's review your ${level} session — ${n} challenges to prepare for.`
            : `${n} questions your audience will likely challenge you with.`,
    },
};

interface PracticePrepScreenProps {
    interlocutor: string;
    briefingData: InterviewBriefingData;
    onStartSimulation: (userDrafts: Record<number, string>, personalizedResponses: Record<number, string>) => void;
    onBack: () => void;
    scenario?: string;
    scenarioType?: ScenarioType;
    /** Level title for level-specific coach message (e.g. "Phone Screen") */
    levelTitle?: string;
    narratorUrl?: string;
    onProgressChange?: (activeIdx: number, completedSet: Set<number>) => void;
}

/* ── Main Screen ── */
export function PracticePrepScreen({
    interlocutor,
    briefingData,
    onStartSimulation,
    onBack,
    scenario,
    scenarioType,
    levelTitle,
    narratorUrl,
    onProgressChange,
}: PracticePrepScreenProps) {
    useNarration(narratorUrl || null);
    const [allDone, setAllDone] = useState(false);
    const [actualCompleted, setActualCompleted] = useState(0);

    /** Accumulated user drafts keyed by question id */
    const draftsRef = useRef<Record<number, string>>({});
    /** Accumulated personalized responses keyed by question id */
    const personalizedRef = useRef<Record<number, string>>({});

    const handleDraftChange = useCallback((questionId: number, text: string) => {
        draftsRef.current[questionId] = text;
    }, []);

    const handlePersonalizeChange = useCallback((questionId: number, text: string) => {
        personalizedRef.current[questionId] = text;
    }, []);

    const interlocutorInfo = INTERLOCUTOR_LABELS[interlocutor] ?? {
        label: interlocutor,
    };

    const handleAllComplete = useCallback((completedCount: number) => {
        setActualCompleted(completedCount);
        setAllDone(true);
    }, []);

    const handleStartPractice = useCallback(() => {
        onStartSimulation(draftsRef.current, personalizedRef.current);
    }, [onStartSimulation]);

    return (
        <div aria-label="PracticePrepScreen"
            className="w-full min-h-full flex flex-col bg-[#f0f4f8] relative overflow-hidden"
        >
            <div className="absolute top-4 right-4 flex items-center gap-2">
                <FeedbackThumbs contentType="session_brief" contentId={scenarioType ?? "session_brief"} />
                <Sparkles className="w-4 h-4 text-[#94a3b8]" aria-label="AI-generated content" />
            </div>
            <main className="relative w-full max-w-[800px] mx-auto px-4 sm:px-6 pt-6 pb-20">

                {/* Header */}
                <PageTitleBlock
                    title={(SCENARIO_PREP_CONFIG[scenarioType ?? "interview"] ?? SCENARIO_PREP_CONFIG.interview).title}
                    subtitle={(SCENARIO_PREP_CONFIG[scenarioType ?? "interview"] ?? SCENARIO_PREP_CONFIG.interview).subtitle(
                        briefingData.anticipatedQuestions.length,
                        interlocutorInfo.label,
                        levelTitle,
                    )}
                />

                {/* ── Carousel or Readiness Score ── */}
                {allDone ? (
                    <ReadinessScore
                        totalCards={briefingData.anticipatedQuestions.length}
                        completedCards={actualCompleted}
                        onStartPractice={handleStartPractice}
                        narratorUrl={READINESS_URLS[scenarioType ?? "interview"]}
                    />
                ) : (
                    <BriefingStepperCarousel
                        cards={briefingData.anticipatedQuestions}
                        onAllComplete={handleAllComplete}
                        onDraftChange={handleDraftChange}
                        onPersonalizeChange={handlePersonalizeChange}
                        onProgressChange={onProgressChange}
                        scenarioType={scenarioType}
                        cardLabel={(SCENARIO_PREP_CONFIG[scenarioType ?? "interview"] ?? SCENARIO_PREP_CONFIG.interview).cardLabel}
                        completedLabel={(SCENARIO_PREP_CONFIG[scenarioType ?? "interview"] ?? SCENARIO_PREP_CONFIG.interview).completedLabel}
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