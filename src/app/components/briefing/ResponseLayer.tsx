/**
 * ==============================================================
 *  ResponseLayer — "Your Response" tab inside a briefing card
 *
 *  A lightweight textarea where the user drafts their answer
 *  to the interview question. Completes when ≥30 chars typed
 *  or user clicks "Skip for now".
 *
 *  No AI feedback here — that comes in the live simulation.
 * ==============================================================
 */

import { useState, useCallback } from "react";
import { PenLine, SkipForward, Check, Lightbulb } from "lucide-react";
import { motion } from "motion/react";

const MIN_CHARS = 30;

interface ResponseLayerProps {
    question: string;
    isComplete: boolean;
    onComplete: () => void;
    /** Bubble draft text up to parent for Gap B data flow */
    onDraftChange?: (text: string) => void;
}

export function ResponseLayer({ question, isComplete, onComplete, onDraftChange }: ResponseLayerProps) {
    const [text, setText] = useState("");
    const [skipped, setSkipped] = useState(false);

    const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const val = e.target.value;
        setText(val);
        onDraftChange?.(val);
    }, [onDraftChange]);

    const charCount = text.trim().length;
    const meetsMinimum = charCount >= MIN_CHARS;

    const handleSubmit = useCallback(() => {
        if (!isComplete) {
            onComplete();
        }
    }, [isComplete, onComplete]);

    const handleSkip = useCallback(() => {
        setSkipped(true);
        if (!isComplete) {
            setTimeout(() => onComplete(), 0);
        }
    }, [isComplete, onComplete]);

    /* Already completed */
    if (isComplete) {
        return (
            <div className="p-5 md:p-6 flex flex-col items-center gap-4">
                <motion.div
                    className="w-14 h-14 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                    <Check className="w-6 h-6 text-emerald-600" />
                </motion.div>
                <div className="text-center">
                    <p className="text-sm text-[#0f172b]" style={{ fontWeight: 600 }}>
                        {skipped ? "Step skipped" : "Response drafted!"}
                    </p>
                    <p className="text-xs text-[#62748e] mt-1">
                        {skipped
                            ? "You can always come back to draft your answer."
                            : "Great prep. You'll refine this in the live simulation."}
                    </p>
                </div>
                {text.trim() && (
                    <div className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-4 py-3 mt-1">
                        <p className="text-xs text-[#62748e] whitespace-pre-wrap leading-relaxed">{text}</p>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="p-5 md:p-6 space-y-4">
            {/* Textarea */}
            <div>
                <label htmlFor="response-draft" className="flex items-center gap-1.5 text-xs text-[#62748e] mb-2">
                    <PenLine className="w-3.5 h-3.5" />
                    Draft your answer for this question
                </label>
                <textarea
                    id="response-draft"
                    value={text}
                    onChange={handleTextChange}
                    placeholder="Use bullet points or short sentences — e.g. 'I would lead with my experience in…'"
                    rows={4}
                    className="w-full rounded-xl border border-[#e2e8f0] bg-white px-4 py-3 text-sm text-[#0f172b] placeholder:text-[#94a3b8] focus:outline-none focus:border-[#6366f1]/40 focus:ring-2 focus:ring-[#6366f1]/10 resize-none transition-all leading-relaxed"
                />
                <div className="flex items-center justify-between mt-1.5">
                    <p className={`text-[11px] transition-colors ${meetsMinimum ? "text-emerald-600" : "text-[#94a3b8]"}`}>
                        {charCount}/{MIN_CHARS} characters
                    </p>
                </div>
            </div>

            {/* Tip */}
            <div className="flex items-start gap-2 bg-amber-50/60 border border-amber-100 rounded-lg px-3.5 py-2.5">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-700 leading-relaxed">
                    Use the key phrases from the previous step to structure your answer.
                </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-center gap-3 pt-1">
                {meetsMinimum && (
                    <motion.button
                        onClick={handleSubmit}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#6366f1] text-white text-sm hover:bg-[#4f46e5] shadow-sm transition-all"
                        style={{ fontWeight: 500 }}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Check className="w-4 h-4" />
                        Done
                    </motion.button>
                )}
                <button
                    onClick={handleSkip}
                    className="flex items-center gap-1.5 text-xs text-[#94a3b8] hover:text-[#62748e] transition-colors"
                    style={{ fontWeight: 500 }}
                >
                    <SkipForward className="w-3.5 h-3.5" />
                    Skip for now
                </button>
            </div>
        </div>
    );
}