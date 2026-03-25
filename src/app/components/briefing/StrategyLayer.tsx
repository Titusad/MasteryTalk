/**
 * ==============================================================
 *  StrategyLayer — "Strategy" tab inside a briefing card
 *
 *  Shows:
 *    1. Why they ask this (context)
 *    2. Suggested Opener (concrete first-person template)
 *    3. Framework Pill (expandable methodology explainer)
 *    4. Pivot (redirect strategy)
 *
 *  The opener replaces the old abstract "approach" as the hero
 *  element. The framework pill is opt-in education.
 * ==============================================================
 */

import { useState } from "react";
import { MessageSquareQuote, Shield, HelpCircle, BookOpen, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface StrategyLayerProps {
    why: string;
    approach: string;
    suggestedOpener?: string;
    framework?: { name: string; description: string };
    pivot?: string;
    isSales?: boolean;
}

export function StrategyLayer({ why, approach, suggestedOpener, framework, pivot, isSales }: StrategyLayerProps) {
    const [frameworkOpen, setFrameworkOpen] = useState(false);

    return (
        <div className="space-y-5 p-5 md:p-6">
            {/* Why they ask */}
            <motion.div
                className="flex items-start gap-4"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <div className="w-8 h-8 rounded-lg bg-[#eef2ff] flex items-center justify-center shrink-0 mt-0.5">
                    <HelpCircle className="w-4 h-4 text-[#6366f1]" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-[#6366f1] uppercase tracking-wider mb-1.5" style={{ fontWeight: 600 }}>
                        {isSales ? "Why this matters" : "Why they ask this"}
                    </p>
                    <p className="text-sm text-[#314158] leading-relaxed">{why}</p>
                </div>
            </motion.div>

            {/* Suggested Opener — hero element */}
            <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.08 }}
            >
                <div className="rounded-xl border border-[#6366f1]/15 bg-gradient-to-br from-[#eef2ff] to-[#f5f3ff] p-5">
                    <div className="flex items-center gap-2 mb-3">
                        <MessageSquareQuote className="w-4 h-4 text-[#6366f1]" />
                        <p className="text-[10px] text-[#6366f1] uppercase tracking-wider" style={{ fontWeight: 600 }}>
                            {isSales ? "Say something like…" : "You could start with something like…"}
                        </p>
                    </div>
                    <p
                        className="text-base text-[#0f172b] leading-relaxed"
                        style={{ fontWeight: 500, fontStyle: "italic" }}
                    >
                        "{suggestedOpener || approach}"
                    </p>

                    {/* Framework Pill — expandable */}
                    {framework && (
                        <div className="mt-4">
                            <button
                                onClick={() => setFrameworkOpen((prev) => !prev)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#6366f1]/20 bg-white/80 text-xs text-[#6366f1] hover:bg-white hover:border-[#6366f1]/30 transition-all"
                                style={{ fontWeight: 600 }}
                                aria-expanded={frameworkOpen}
                            >
                                <BookOpen className="w-3 h-3" />
                                {framework.name}
                                <ChevronDown
                                    className="w-3 h-3 transition-transform"
                                    style={{ transform: frameworkOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                                />
                            </button>

                            <AnimatePresence>
                                {frameworkOpen && (
                                    <motion.div
                                        className="mt-2.5 px-3.5 py-3 rounded-lg bg-white/90 border border-[#e2e8f0]"
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <p className="text-xs text-[#314158] leading-relaxed">
                                            {framework.description}
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}

                    {/* Fallback: if no framework, show approach as subtle hint — only if non-empty and different from opener */}
                    {!framework && approach && approach !== suggestedOpener && (
                        <p className="mt-3 text-xs text-[#62748e] leading-relaxed">
                            {approach}
                        </p>
                    )}
                </div>
            </motion.div>

            {/* Pivot */}
            {pivot && (
                <motion.div
                    className="flex items-start gap-4"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.16 }}
                >
                    <div className="w-8 h-8 rounded-lg bg-[#fce7f3] flex items-center justify-center shrink-0 mt-0.5">
                        <Shield className="w-4 h-4 text-[#db2777]" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-[#db2777] uppercase tracking-wider mb-1.5" style={{ fontWeight: 600 }}>
                            If they push back
                        </p>
                        <p className="text-sm text-[#314158] leading-relaxed italic">{pivot}</p>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
