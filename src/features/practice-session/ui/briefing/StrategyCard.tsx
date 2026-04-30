/**
 * ==============================================================
 *  StrategyCard — Step 2 of the 4-step per-question stepper
 *
 *  Shows "Why This Question", the communication strategy/framework,
 *  and the suggested opener. Educates before the user answers.
 * ==============================================================
 */

import { motion } from "motion/react";
import { ArrowLeft, ArrowRight, Lightbulb, Target, MessageSquare } from "lucide-react";

const WHY_LABELS: Record<string, string> = {
    interview:    "Why They'll Ask This",
    sales:        "Why They'll Bring This Up",
    meeting:      "Why This Moment Matters",
    presentation: "Why This Matters to the Room",
    culture:      "Why This Situation Arises",
};

const STRATEGY_LABELS: Record<string, string> = {
    interview:    "Your Strategy",
    sales:        "Your Pitch Strategy",
    meeting:      "Your Approach",
    presentation: "Your Delivery Strategy",
    culture:      "Your Response Strategy",
};

const EXAMPLE_LABELS: Record<string, string> = {
    interview:    "A Strong Answer Looks Like",
    sales:        "A Strong Pitch Looks Like",
    meeting:      "A Strong Response Looks Like",
    presentation: "Strong Delivery Looks Like",
    culture:      "A Strong Response Looks Like",
};

// Continuation scaffold — shown when only a suggestedOpener is available (no full exampleAnswer)
const RESPONSE_STEPS: Record<string, Array<{ step: string; hint: string }>> = {
    interview: [
        { step: "Situation",  hint: "When and where — set the scene in one sentence" },
        { step: "Action",     hint: "What YOU specifically did — use 'I', not 'we'" },
        { step: "Result",     hint: "Quantify the outcome — metric, timeline, or impact" },
    ],
    sales: [
        { step: "Pain acknowledgment", hint: "Name their specific challenge — shows you listened" },
        { step: "Your solution",       hint: "One clear capability that directly addresses it" },
        { step: "Proof",               hint: "A number or example that backs your claim" },
    ],
    meeting: [
        { step: "Main point",   hint: "What you accomplished or need — one sentence, no fluff" },
        { step: "Why it matters", hint: "Business impact or dependency — why relevant NOW" },
        { step: "Next step",    hint: "The decision or action you need from the room" },
    ],
    presentation: [
        { step: "Core insight", hint: "The one thing the audience must remember" },
        { step: "Evidence",     hint: "One data point or example that makes it undeniable" },
        { step: "Call to action", hint: "What you need them to do, decide, or believe" },
    ],
    culture: [
        { step: "Acknowledge",   hint: "Name what's happening — shows situational awareness" },
        { step: "Your position", hint: "State your view directly — no hedging" },
        { step: "Forward step",  hint: "Propose what happens next — own the resolution" },
    ],
};

const CTA_LABELS: Record<string, string> = {
    interview:    "Record My Answer",
    sales:        "Record My Answer",
    meeting:      "Record My Response",
    presentation: "Record My Delivery",
    culture:      "Record My Response",
};

interface StrategyCardProps {
    question: string;
    why: string;
    approach: string;
    suggestedOpener: string;
    exampleAnswer?: string;
    framework?: { name: string; description: string };
    pivot: string;
    scenarioType?: string;
    onNext: () => void;
    onBack: () => void;
}

export function StrategyCard({
    question,
    why,
    approach,
    suggestedOpener,
    exampleAnswer,
    framework,
    pivot,
    scenarioType,
    onNext,
    onBack,
}: StrategyCardProps) {
    const s = scenarioType ?? "interview";
    const whyLabel      = WHY_LABELS[s]      ?? "Why This Comes Up";
    const strategyLabel = STRATEGY_LABELS[s] ?? "Your Strategy";
    const exampleLabel  = EXAMPLE_LABELS[s]  ?? "A Strong Answer Looks Like";
    const ctaLabel      = CTA_LABELS[s]      ?? "Record My Answer";
    return (
        <motion.div aria-label="StrategyCard"
            className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm overflow-hidden"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35 }}
        >

            <div className="px-6 py-6 md:px-8 space-y-5">
                {/* Why this question/moment */}
                {why && (
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
                                <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                            </div>
                            <h3 className="text-sm text-[#0f172b]" style={{ fontWeight: 600 }}>
                                {whyLabel}
                            </h3>
                        </div>
                        <p className="text-sm text-[#45556c] leading-relaxed pl-9">
                            {why}
                        </p>
                    </div>
                )}

                {/* Strategy / Approach — hidden when empty */}
                {(approach || framework) && (
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                                <Target className="w-3.5 h-3.5 text-blue-600" />
                            </div>
                            <h3 className="text-sm text-[#0f172b]" style={{ fontWeight: 600 }}>
                                {framework ? `Apply: ${framework.name}` : strategyLabel}
                            </h3>
                        </div>
                        {approach && (
                            <p className="text-sm text-[#45556c] leading-relaxed pl-9">
                                {approach}
                            </p>
                        )}
                        {framework && (
                            <div className="ml-9 mt-2 px-3 py-2 bg-[#f8fafc] rounded-lg border border-[#e2e8f0]">
                                <p className="text-xs text-[#62748e] leading-relaxed">
                                    <span style={{ fontWeight: 600 }}>{framework.name}:</span>{" "}
                                    {framework.description}
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Example answer / opening line + continuation scaffold */}
                {(exampleAnswer || suggestedOpener) && (() => {
                    const isFullAnswer = !!exampleAnswer;
                    const continuationSteps = !isFullAnswer
                        ? (RESPONSE_STEPS[s] ?? RESPONSE_STEPS.interview)
                        : [];
                    const sectionLabel = isFullAnswer ? exampleLabel : "Your Opening Line";

                    return (
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center">
                                    <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                                </div>
                                <h3 className="text-sm text-[#0f172b]" style={{ fontWeight: 600 }}>
                                    {sectionLabel}
                                </h3>
                            </div>

                            {/* Step 1 — the example or opener */}
                            <div className="ml-9">
                                {!isFullAnswer && (
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] flex items-center justify-center shrink-0" style={{ fontWeight: 700 }}>
                                            1
                                        </span>
                                        <p className="text-[11px] text-emerald-600 uppercase tracking-wider" style={{ fontWeight: 600 }}>
                                            Opening
                                        </p>
                                    </div>
                                )}
                                <div className="px-4 py-4 bg-emerald-50/50 rounded-xl border border-emerald-100 space-y-2">
                                    <p className="text-sm text-[#0f172b] leading-relaxed italic" style={{ fontWeight: 500 }}>
                                        "{exampleAnswer || suggestedOpener}"
                                    </p>
                                    {isFullAnswer && (
                                        <p className="text-[11px] text-emerald-600" style={{ fontWeight: 500 }}>
                                            Built from your profile · Use this as your model, not a script
                                        </p>
                                    )}
                                </div>

                                {/* Continuation scaffold — only when showing opener, not full answer */}
                                {!isFullAnswer && continuationSteps.length > 0 && (
                                    <div className="mt-3 space-y-2">
                                        <p className="text-[10px] text-[#94a3b8] uppercase tracking-wider mb-1" style={{ fontWeight: 600 }}>
                                            Continue with:
                                        </p>
                                        {continuationSteps.map((step, i) => (
                                            <div
                                                key={i}
                                                className="flex items-start gap-2.5 px-3 py-2.5 rounded-lg border border-[#e2e8f0] bg-[#f8fafc]"
                                            >
                                                <span
                                                    className="w-5 h-5 rounded-full bg-[#0f172b] text-white text-[10px] flex items-center justify-center shrink-0 mt-0.5"
                                                    style={{ fontWeight: 700 }}
                                                >
                                                    {i + 2}
                                                </span>
                                                <p className="text-xs text-[#45556c] leading-relaxed">
                                                    <span className="text-[#0f172b]" style={{ fontWeight: 600 }}>
                                                        {step.step}
                                                    </span>
                                                    {" — "}{step.hint}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })()}
            </div>

            {/* Navigation */}
            <div className="px-6 py-6 border-t border-[#f1f5f9] flex flex-col items-center">
                <button
                    onClick={onNext}
                    className="flex items-center gap-3 px-10 py-5 rounded-full text-xl bg-[#0f172b] text-white hover:bg-[#1d293d] transition-colors shadow-[0px_10px_15px_rgba(0,0,0,0.1)]"
                    style={{ fontWeight: 500 }}
                >
                    {ctaLabel}
                    <ArrowRight className="w-6 h-6" />
                </button>
                <button
                    onClick={onBack}
                    className="mt-4 flex items-center gap-1.5 text-sm text-[#62748e] hover:text-[#0f172b] transition-colors"
                    style={{ fontWeight: 500 }}
                >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Back
                </button>
            </div>
        </motion.div>
    );
}
