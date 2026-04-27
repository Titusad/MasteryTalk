/**
 * ==============================================================
 *  QuestionCard — Step 1 of the 4-step per-question stepper
 *
 *  Shows ONLY the question. Sets the stage — user reads and
 *  mentally prepares before seeing the strategy.
 * ==============================================================
 */

import { motion } from "motion/react";
import { MessageCircleQuestion, ArrowRight } from "lucide-react";

interface QuestionCardProps {
    question: string;
    questionNumber: number;
    totalQuestions: number;
    isSales?: boolean;
    onNext: () => void;
}

export function QuestionCard({
    question,
    questionNumber,
    totalQuestions,
    isSales,
    onNext,
}: QuestionCardProps) {
    return (
        <motion.div aria-label="QuestionCard"
            className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm overflow-hidden"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35 }}
        >

            {/* Question */}
            <div className="px-6 py-10 md:px-10 md:py-14 text-center">
                <div className="w-12 h-12 rounded-xl bg-[#6366f1] flex items-center justify-center mx-auto mb-6">
                    <MessageCircleQuestion className="w-6 h-6 text-white" />
                </div>

                <p className="text-xs text-[#94a3b8] mb-3 uppercase tracking-wider" style={{ fontWeight: 600 }}>
                    {isSales ? "The Prospect Will Ask" : "The Interviewer Will Ask"}
                </p>

                <h2
                    className="text-lg md:text-xl text-[#0f172b] leading-relaxed max-w-lg mx-auto"
                    style={{ fontWeight: 600, lineHeight: 1.5 }}
                >
                    {isSales ? question : `"${question}"`}
                </h2>
            </div>

            {/* Next */}
            <div className="px-6 py-6 border-t border-[#f1f5f9] flex justify-center">
                <button
                    onClick={onNext}
                    className="flex items-center gap-3 px-10 py-5 rounded-full text-xl bg-[#0f172b] text-white hover:bg-[#1d293d] transition-colors shadow-[0px_10px_15px_rgba(0,0,0,0.1)]"
                    style={{ fontWeight: 500 }}
                >
                    See the Strategy
                    <ArrowRight className="w-6 h-6" />
                </button>
            </div>
        </motion.div>
    );
}
