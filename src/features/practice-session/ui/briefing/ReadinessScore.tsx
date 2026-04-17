/**
 * ==============================================================
 *  ReadinessScore — Final screen after completing all cards
 *
 *  Shows an animated readiness ring, confetti celebration,
 *  and CTA to start practice. PDF download moved to post-session.
 * ==============================================================
 */

import { useEffect, useRef } from "react";
import { Play, Mic, Trophy, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import confetti from "canvas-confetti";

interface ReadinessScoreProps {
    totalCards: number;
    completedCards: number;
    onStartPractice: () => void;
}

export function ReadinessScore({
    totalCards,
    completedCards,
    onStartPractice,
}: ReadinessScoreProps) {
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
            {/* Trophy icon */}
            <motion.div
                className="w-14 h-14 rounded-full bg-amber-50 border-2 border-amber-200 flex items-center justify-center"
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.2 }}
            >
                <Trophy className="w-7 h-7 text-amber-500" />
            </motion.div>

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
                    <circle
                        cx="60"
                        cy="60"
                        r={radius}
                        fill="none"
                        stroke="#f1f5f9"
                        strokeWidth="8"
                    />
                    <motion.circle
                        cx="60"
                        cy="60"
                        r={radius}
                        fill="none"
                        stroke={ringColor}
                        strokeWidth="8"
                        strokeLinecap="round"
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

            {/* Encouragement */}
            <motion.div
                className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-full px-4 py-2"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
            >
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span className="text-sm text-emerald-700" style={{ fontWeight: 500 }}>
                    You're ready to ace this interview!
                </span>
            </motion.div>

            {/* CTA: Start Practice */}
            <div className="w-full max-w-sm flex flex-col gap-3 mt-2">
                <div className="bg-gradient-to-br from-[#f0f9ff] to-[#eef2ff] rounded-3xl border border-[#bfdbfe]/50 p-6 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-[#0f172b] flex items-center justify-center mx-auto mb-4">
                        <Mic className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-sm text-[#45556c] mb-4">
                        Put this briefing into action — simulate the interview with AI.
                    </p>
                    <button
                        onClick={onStartPractice}
                        className="bg-[#0f172b] text-white px-6 py-3.5 rounded-full flex items-center gap-2.5 shadow-lg hover:bg-[#1d293d] transition-colors mx-auto"
                        style={{ fontWeight: 500 }}
                    >
                        <Play className="w-4.5 h-4.5" />
                        <span className="text-sm">Start Practice</span>
                    </button>
                    <p className="text-[10px] text-[#94a3b8] mt-3">
                        Your full report with cheat sheet will be available after the session.
                    </p>
                </div>
            </div>
        </motion.div>
    );
}
