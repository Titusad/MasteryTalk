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

interface StrategyCardProps {
    question: string;
    why: string;
    approach: string;
    suggestedOpener: string;
    framework?: { name: string; description: string };
    pivot: string;
    isSales?: boolean;
    onNext: () => void;
    onBack: () => void;
}

export function StrategyCard({
    question,
    why,
    approach,
    suggestedOpener,
    framework,
    pivot,
    isSales,
    onNext,
    onBack,
}: StrategyCardProps) {
    return (
        <motion.div aria-label="StrategyCard"
            className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm overflow-hidden"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35 }}
        >
            {/* Step indicator */}
            <div className="px-6 py-3 bg-[#f8fafc] border-b border-[#f1f5f9] flex items-center justify-between">
                <span className="text-[11px] text-[#94a3b8]" style={{ fontWeight: 500 }}>
                    Step 2 of 4
                </span>
                <span className="text-[11px] text-[#6366f1]" style={{ fontWeight: 600 }}>
                    Understand the Strategy
                </span>
            </div>

            <div className="px-6 py-6 md:px-8 space-y-5">
                {/* Why this question */}
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
                            <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                        </div>
                        <h3 className="text-sm text-[#0f172b]" style={{ fontWeight: 600 }}>
                            Why They'll Ask This
                        </h3>
                    </div>
                    <p className="text-sm text-[#45556c] leading-relaxed pl-9">
                        {why}
                    </p>
                </div>

                {/* Strategy / Approach */}
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                            <Target className="w-3.5 h-3.5 text-blue-600" />
                        </div>
                        <h3 className="text-sm text-[#0f172b]" style={{ fontWeight: 600 }}>
                            {framework ? `Apply: ${framework.name}` : "Your Strategy"}
                        </h3>
                    </div>
                    <p className="text-sm text-[#45556c] leading-relaxed pl-9">
                        {approach}
                    </p>
                    {framework && (
                        <div className="ml-9 mt-2 px-3 py-2 bg-[#f8fafc] rounded-lg border border-[#e2e8f0]">
                            <p className="text-xs text-[#62748e] leading-relaxed">
                                <span style={{ fontWeight: 600 }}>{framework.name}:</span>{" "}
                                {framework.description}
                            </p>
                        </div>
                    )}
                </div>

                {/* Suggested opener */}
                {suggestedOpener && (
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center">
                                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                            </div>
                            <h3 className="text-sm text-[#0f172b]" style={{ fontWeight: 600 }}>
                                You Could Start With
                            </h3>
                        </div>
                        <div className="ml-9 px-4 py-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
                            <p
                                className="text-sm text-[#0f172b] leading-relaxed italic"
                                style={{ fontWeight: 500 }}
                            >
                                "{suggestedOpener}"
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <div className="px-6 py-4 border-t border-[#f1f5f9] flex items-center justify-between">
                <button
                    onClick={onBack}
                    className="flex items-center gap-1.5 text-sm text-[#45556c] hover:text-[#0f172b] transition-colors"
                    style={{ fontWeight: 500 }}
                >
                    <ArrowLeft className="w-4 h-4" />
                    Question
                </button>
                <button
                    onClick={onNext}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm bg-[#0f172b] text-white hover:bg-[#1d293d] transition-colors shadow-sm"
                    style={{ fontWeight: 500 }}
                >
                    Record My Answer
                    <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        </motion.div>
    );
}
