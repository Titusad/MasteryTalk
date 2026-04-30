/**
 * ==============================================================
 *  StrategyCard — Step 2 of the 4-step per-question stepper
 *
 *  Shows "Why This Question", the communication strategy/framework,
 *  and the suggested opener. Educates before the user answers.
 * ==============================================================
 */

import { useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, ArrowRight, Lightbulb, Target, MessageSquare } from "lucide-react";
import type { ResponseStep } from "@/services/types";

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

// Fill-in-the-blank templates — brackets signal what the user needs to slot in.
// Shown when only a suggestedOpener is available (no full exampleAnswer from backend).
const RESPONSE_STEPS: Record<string, Array<{ step: string; template: string }>> = {
    interview: [
        { step: "Situation", template: "At [company / team], I was responsible for [challenge or goal in one sentence]." },
        { step: "Action",    template: "I specifically [verb + what you did] — my role was [your concrete contribution, not the team's]." },
        { step: "Result",    template: "The outcome was [metric, timeline, or business impact] — and here's what I learned from it." },
    ],
    sales: [
        { step: "Pain",      template: "I understand your team is dealing with [their specific challenge] — and that's costing you [time / revenue / efficiency]." },
        { step: "Solution",  template: "Our [feature / approach] directly addresses that by [how it works in plain language, no jargon]." },
        { step: "Proof",     template: "[Similar client / comparable case] went from [before state] to [after metric] in [timeframe]." },
    ],
    meeting: [
        { step: "Main point",     template: "This [week / sprint], I [completed / unblocked / need input on] [specific deliverable], which [enabled / affects] [team or project outcome]." },
        { step: "Why it matters", template: "This is relevant now because [dependency, deadline, or risk it removes]." },
        { step: "Next step",      template: "What I need from the room is [decision / resource / approval] — ideally by [date or end of this meeting]." },
    ],
    presentation: [
        { step: "Core insight",   template: "The key finding is [insight in one sentence] — and it changes how we approach [topic or decision]." },
        { step: "Evidence",       template: "[Data point or example]: [what it shows] — which means [implication for this audience]." },
        { step: "Call to action", template: "I'm asking you to [decide / approve / commit to] [specific action] by [date or next touchpoint]." },
    ],
    culture: [
        { step: "Acknowledge",    template: "I want to make sure we're aligned on [what the expectation or situation is] — because I'm seeing it differently." },
        { step: "Your position",  template: "From where I stand, [your view in one direct sentence — no softeners, no 'I think maybe']." },
        { step: "Forward step",   template: "I'd suggest [concrete action] — I can own [your specific part of it] and have [deliverable] by [date]." },
    ],
};

// Inline input fields for each [bracket] in a template string.
function BracketInput({ template, stepIdx, values, onChange }: {
    template: string;
    stepIdx: number;
    values: Record<number, Record<number, string>>;
    onChange: (stepIdx: number, bracketIdx: number, value: string) => void;
}) {
    const parts = template.split(/(\[[^\]]+\])/g);
    let bracketCount = 0;
    return (
        <>
            {parts.map((part, i) => {
                if (part.startsWith("[") && part.endsWith("]")) {
                    const placeholder = part.slice(1, -1);
                    const bIdx = bracketCount++;
                    const val = values[stepIdx]?.[bIdx] ?? "";
                    const displayWidth = val
                        ? Math.max(60, val.length * 8 + 8)
                        : Math.max(60, placeholder.length * 7);
                    return (
                        <input
                            key={i}
                            type="text"
                            value={val}
                            placeholder={placeholder}
                            onChange={e => onChange(stepIdx, bIdx, e.target.value)}
                            className="inline-block border-b-2 border-[#6366f1] bg-transparent placeholder-[#6366f1]/40 text-[#6366f1] focus:outline-none mx-0.5 text-sm not-italic align-baseline"
                            style={{
                                width: `${displayWidth}px`,
                                fontWeight: val ? 600 : 400,
                                fontSize: "0.875rem",
                            }}
                        />
                    );
                }
                return <span key={i}>{part}</span>;
            })}
        </>
    );
}

// Assemble the full response from opener + filled-in steps.
function assembleResponse(
    opener: string,
    steps: ResponseStep[],
    values: Record<number, Record<number, string>>,
): string {
    const parts = [opener];
    steps.forEach((step, stepIdx) => {
        let text = step.template;
        const stepVals = values[stepIdx] ?? {};
        let bIdx = 0;
        text = text.replace(/\[[^\]]+\]/g, () => {
            const v = stepVals[bIdx++]?.trim();
            return v || "___";
        });
        parts.push(text);
    });
    return parts.join(" ");
}

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
    /** Context-specific steps from backend — takes priority over hardcoded fallbacks */
    responseSteps?: ResponseStep[];
    onNext: (assembled?: string) => void;
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
    responseSteps,
    onNext,
    onBack,
}: StrategyCardProps) {
    const s = scenarioType ?? "interview";
    const whyLabel      = WHY_LABELS[s]      ?? "Why This Comes Up";
    const strategyLabel = STRATEGY_LABELS[s] ?? "Your Strategy";
    const exampleLabel  = EXAMPLE_LABELS[s]  ?? "A Strong Answer Looks Like";
    const ctaLabel      = CTA_LABELS[s]      ?? "Record My Answer";
    // [stepIdx][bracketIdx] = user typed value
    const [inputs, setInputs] = useState<Record<number, Record<number, string>>>({});
    const handleInputChange = (stepIdx: number, bracketIdx: number, value: string) => {
        setInputs(prev => ({
            ...prev,
            [stepIdx]: { ...(prev[stepIdx] ?? {}), [bracketIdx]: value },
        }));
    };

    // Compute continuation steps here so they're accessible in the CTA button handler
    const continuationSteps: ResponseStep[] = !exampleAnswer
        ? (responseSteps?.length ? responseSteps : (RESPONSE_STEPS[s] ?? RESPONSE_STEPS.interview))
        : [];
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

                            {/* Opener — shown as-is, no Opening badge */}
                            <div className="ml-9">
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

                                {/* Fill-in-the-blank steps — inline inputs for each [bracket] */}
                                {!isFullAnswer && continuationSteps.length > 0 && (
                                    <div className="mt-3 space-y-2">
                                        <p className="text-[10px] text-[#94a3b8] uppercase tracking-wider mb-1" style={{ fontWeight: 600 }}>
                                            Continue with:
                                        </p>
                                        {continuationSteps.map((step, i) => (
                                            <div
                                                key={i}
                                                className="px-3 py-3 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] space-y-2"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span
                                                        className="w-5 h-5 rounded-full bg-[#0f172b] text-white text-[10px] flex items-center justify-center shrink-0"
                                                        style={{ fontWeight: 700 }}
                                                    >
                                                        {i + 2}
                                                    </span>
                                                    <span className="text-[11px] text-[#0f172b] uppercase tracking-wider" style={{ fontWeight: 600 }}>
                                                        {step.step}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-[#45556c] leading-relaxed pl-7 italic">
                                                    "<BracketInput
                                                        template={step.template}
                                                        stepIdx={i}
                                                        values={inputs}
                                                        onChange={handleInputChange}
                                                    />"
                                                </p>
                                            </div>
                                        ))}
                                        <p className="text-[10px] text-[#94a3b8] pl-1 pt-1">
                                            Type in the <span className="text-[#6366f1]" style={{ fontWeight: 600 }}>[fields]</span> — then record your full response.
                                        </p>
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
                    onClick={() => {
                        const steps = !exampleAnswer ? continuationSteps : [];
                        const assembled = steps.length > 0
                            ? assembleResponse(suggestedOpener, steps, inputs)
                            : undefined;
                        onNext(assembled);
                    }}
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
