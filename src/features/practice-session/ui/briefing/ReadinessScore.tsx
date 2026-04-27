/**
 * ==============================================================
 *  ReadinessScore — Final screen after completing all cards
 * ==============================================================
 */

import { useEffect, useRef } from "react";
import { Play } from "lucide-react";
import { motion } from "motion/react";
import confetti from "canvas-confetti";
import { useNarration } from "@/shared/lib/useNarration";

interface ReadinessScoreProps {
    totalCards: number;
    completedCards: number;
    onStartPractice: () => void;
    narratorUrl?: string;
}

export function ReadinessScore({
    totalCards,
    completedCards,
    onStartPractice,
    narratorUrl,
}: ReadinessScoreProps) {
    useNarration(narratorUrl || null);
    const confettiFired = useRef(false);
    const score = totalCards > 0 ? Math.round((completedCards / totalCards) * 100) : 0;

    /* Fire confetti on mount */
    useEffect(() => {
        if (confettiFired.current) return;
        confettiFired.current = true;
        const fire = () => {
            confetti({
                particleCount: 80,
                spread: 70,
                origin: { y: 0.6, x: 0.5 },
                colors: ["#6366f1", "#14b8a6", "#22c55e", "#f59e0b", "#ec4899"],
            });
        };
        fire();
        const t = setTimeout(fire, 300);
        return () => clearTimeout(t);
    }, []);

    /* Ring geometry */
    const radius = 52;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;
    const ringColor = score >= 80 ? "#22c55e" : score >= 60 ? "#f59e0b" : "#6366f1";

    return (
        <motion.div aria-label="ReadinessScore"
            className="flex flex-col items-center gap-6 py-8"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
        >
            {/* Title */}
            <div className="text-center">
                <h3 className="text-xl md:text-2xl text-[#0f172b] mb-1" style={{ fontWeight: 300 }}>
                    Preparation Complete!
                </h3>
                <p className="text-sm text-[#45556c]">
                    You've prepared {completedCards} of {totalCards} questions
                </p>
            </div>

            {/* Readiness Ring */}
            <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r={radius} fill="none" stroke="#f1f5f9" strokeWidth="8" />
                    <motion.circle
                        cx="60" cy="60" r={radius} fill="none"
                        stroke={ringColor} strokeWidth="8" strokeLinecap="round"
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: offset }}
                        transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <motion.span
                        className="text-3xl text-[#0f172b]"
                        style={{ fontWeight: 700 }}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4, delay: 0.8 }}
                    >
                        {score}%
                    </motion.span>
                    <span className="text-[10px] text-[#45556c] uppercase tracking-wider" style={{ fontWeight: 600 }}>
                        Readiness
                    </span>
                </div>
            </div>

            {/* CTA */}
            <motion.div
                className="w-full max-w-sm mt-2"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
            >
                <div className="bg-gradient-to-br from-[#f0f9ff] to-[#eef2ff] rounded-3xl border border-[#bfdbfe]/50 p-6 text-center">
                    <p className="text-sm text-[#45556c] mb-4">
                        Put this briefing into action — simulate the interview with AI.
                    </p>
                    <button
                        onClick={onStartPractice}
                        className="bg-[#0f172b] text-white px-6 py-3.5 rounded-full flex items-center gap-2.5 shadow-lg hover:bg-[#1d293d] transition-colors mx-auto"
                        style={{ fontWeight: 500 }}
                    >
                        <Play className="w-4 h-4" />
                        <span className="text-sm">Start Practice</span>
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}
