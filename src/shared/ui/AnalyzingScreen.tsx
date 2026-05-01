/**
 * ══════════════════════════════════════════════════════════════
 *  MasteryTalk PRO — AnalyzingScreen
 *  Full-screen dark transition loader with progress bar,
 *  sequential step indicators, and motivational affirmations.
 *
 *  canComplete (new): when false, progress bar caps at 92% and
 *  the screen stays visible until the prop flips to true.
 *  This eliminates the ugly second loader when GPT takes longer
 *  than the fixed animation duration.
 * ══════════════════════════════════════════════════════════════
 */

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2 } from "lucide-react";
import { BrandLogo } from "./BrandLogo";
import { COLORS } from "./design-tokens";
import { useNarration } from "@/shared/lib/useNarration";

/* ── Config per variant ── */

interface AnalysisConfig {
    title: string;
    subtitle: string;
    steps: { text: string; duration: number }[];
    affirmations: string[];
}

const ANALYSIS_CONFIGS: Record<string, AnalysisConfig> = {
    feedback: {
        title: "Analyzing your presentation",
        subtitle: "Our AI is reviewing every detail of your practice",
        steps: [
            { text: "Transcribing your conversation...", duration: 1200 },
            { text: "Analyzing pronunciation and fluency...", duration: 1400 },
            { text: "Evaluating vocabulary and grammar...", duration: 1300 },
            { text: "Generating personalized feedback...", duration: 1600 },
        ],
        affirmations: [
            "People have a better impression of you than you think. It\u2019s called the Liking Gap \u2014 and science confirms it.",
            "Every conversation you face brings you closer to fluency. Progress isn\u2019t always visible, but it\u2019s always real.",
            "Your accent isn\u2019t a barrier \u2014 it\u2019s your story. Clarity and confidence matter more than perfection.",
        ],
    },
    script: {
        title: "Preparing your improved script",
        subtitle: "AI is optimizing your speech with professional suggestions",
        steps: [
            { text: "Reviewing speech structure...", duration: 900 },
            { text: "Identifying areas for improvement...", duration: 1100 },
            { text: "Applying vocabulary enhancements...", duration: 1000 },
            { text: "Generating optimized script...", duration: 1200 },
        ],
        affirmations: [
            "Professional English fluency isn\u2019t about speaking fast \u2014 it\u2019s about strategic pauses, clarity, and control.",
            "A small grammar mistake is human and doesn\u2019t diminish your arguments. Authenticity builds trust.",
        ],
    },
    results: {
        title: "Calculating your results",
        subtitle: "We\u2019re preparing the complete summary of your session",
        steps: [
            { text: "Evaluating your performance...", duration: 1100 },
            { text: "Comparing with your initial practice...", duration: 1300 },
            { text: "Calculating progress metrics...", duration: 1200 },
            { text: "Preparing final summary...", duration: 1300 },
        ],
        affirmations: [
            "Clarity over speed. Your accent tells your story \u2014 it doesn\u2019t limit your impact.",
            "Practicing is more valuable than memorizing. Each session builds neural pathways that stick.",
            "The most successful professionals aren\u2019t the ones who never make mistakes \u2014 they\u2019re the ones who practice more.",
        ],
    },
    generating: {
        title: "Generating your personalized script",
        subtitle: "Our AI is building your narrative strategy",
        steps: [
            { text: "Analyzing your value pillars...", duration: 1200 },
            { text: "Building your narrative arc...", duration: 1400 },
            { text: "Selecting power phrases for your context...", duration: 1300 },
            { text: "Personalizing your conversation script...", duration: 1400 },
        ],
        affirmations: [
            "Your ideas have value. Language is just the vehicle.",
            "90% of success in executive communication is preparation. You\u2019re already one step ahead by being here.",
            "Structure beats improvisation. Having a plan gives you freedom to be natural.",
        ],
    },
};

/* ── Component ── */

export function AnalyzingScreen({
    variant = "feedback",
    onComplete,
    canComplete = true,
    narratorUrl,
}: {
    variant?: "feedback" | "script" | "results" | "generating";
    onComplete: () => void;
    canComplete?: boolean;
    narratorUrl?: string;
}) {
    useNarration(narratorUrl || null);
    const config = ANALYSIS_CONFIGS[variant];
    const [activeStep, setActiveStep] = useState(0);
    const [progress, setProgress] = useState(0);
    const [affirmationIdx, setAffirmationIdx] = useState(0);
    const [animTimerDone, setAnimTimerDone] = useState(false);
    const canCompleteRef = useRef(canComplete);

    /* Keep ref in sync so the interval callback reads latest value */
    useEffect(() => {
        canCompleteRef.current = canComplete;
    }, [canComplete]);

    /* When canComplete flips to true AND animation timer already finished → fire onComplete */
    useEffect(() => {
        if (animTimerDone && canComplete) {
            onComplete();
        }
    }, [animTimerDone, canComplete, onComplete]);

    /* When canComplete flips true and progress already at 92+, snap to 100% */
    useEffect(() => {
        if (canComplete && progress >= 92) {
            setProgress(100);
        }
    }, [canComplete, progress >= 92]);

    useEffect(() => {
        // Step progression
        let cumulative = 0;
        const timers: ReturnType<typeof setTimeout>[] = [];
        config.steps.forEach((s, i) => {
            if (i > 0) {
                cumulative += config.steps[i - 1].duration;
                timers.push(setTimeout(() => setActiveStep(i), cumulative));
            }
        });

        // Smooth progress bar — cap at 92% if canComplete is not yet true
        const totalDuration = config.steps.reduce((sum, s) => sum + s.duration, 0);
        const interval = 40;
        let elapsed = 0;
        const progressTimer = setInterval(() => {
            elapsed += interval;
            const rawPct = Math.min((elapsed / totalDuration) * 100, 100);
            setProgress(canCompleteRef.current ? rawPct : Math.min(rawPct, 92));
            if (rawPct >= 100) clearInterval(progressTimer);
        }, interval);

        // Affirmation rotation — switch every ~3.5s so user can read
        const affirmationTimer = setInterval(() => {
            setAffirmationIdx((prev) => (prev + 1) % config.affirmations.length);
        }, 6000);

        // Mark animation timer done (but don't auto-advance — useEffect above handles that)
        const finishTimer = setTimeout(() => {
            setAnimTimerDone(true);
        }, totalDuration + 400);

        return () => {
            timers.forEach(clearTimeout);
            clearInterval(progressTimer);
            clearInterval(affirmationTimer);
            clearTimeout(finishTimer);
        };
    }, []);

    return (
        <div
            className="w-full min-h-[calc(100dvh-4rem)] bg-[#0f172b] flex flex-col items-center justify-center px-6"
           
        >
            <motion.div
                className="text-center max-w-md w-full"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="flex justify-center mb-10">
                    <BrandLogo light />
                </div>

                {/* Animated analysis icon */}
                <div className="relative w-20 h-20 mx-auto mb-8">
                    <motion.div
                        className="absolute inset-0 rounded-full"
                        style={{
                            background: `conic-gradient(from 0deg, ${COLORS.brandCyan}40, ${COLORS.brandGreen}40, transparent)`,
                        }}
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    />
                    <motion.div
                        className="absolute inset-2 rounded-full bg-white/5 flex items-center justify-center"
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    >
                        <motion.div
                            className="absolute inset-0 rounded-full"
                            style={{
                                background: `radial-gradient(circle, ${COLORS.brandCyan}15, transparent 70%)`,
                            }}
                            animate={{ opacity: [0.3, 0.8, 0.3] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                        />
                        <div className="flex items-center gap-[3px]">
                            {[0, 1, 2, 3, 4].map((i) => (
                                <motion.div
                                    key={i}
                                    className="w-[3px] rounded-full"
                                    style={{
                                        background: `linear-gradient(to top, ${COLORS.brandCyan}, ${COLORS.brandGreen})`,
                                    }}
                                    animate={{
                                        height: [8, 20 + Math.random() * 10, 8],
                                    }}
                                    transition={{
                                        duration: 0.6 + i * 0.1,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                        delay: i * 0.1,
                                    }}
                                />
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Title */}
                <motion.h2
                    className="text-white text-xl mb-2 font-medium"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    {config.title}
                </motion.h2>
                <motion.p
                    className="text-white/50 text-sm mb-10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    {config.subtitle}
                </motion.p>

                {/* Progress bar */}
                <div className="w-full max-w-xs mx-auto mb-8">
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full rounded-full"
                            style={{
                                background: `linear-gradient(90deg, ${COLORS.brandCyan}, ${COLORS.brandGreen})`,
                                width: `${progress}%`,
                            }}
                            transition={{ duration: 0.1, ease: "linear" }}
                        />
                    </div>
                    <p className="text-white/30 text-xs mt-2 text-right">
                        {Math.round(progress)}%
                    </p>
                </div>

                {/* Steps */}
                <div className="space-y-3 text-left max-w-xs mx-auto">
                    {config.steps.map((s, i) => {
                        const isActive = activeStep === i;
                        const isDone = activeStep > i;
                        return (
                            <motion.div
                                key={i}
                                className="flex items-center gap-3"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{
                                    opacity: activeStep >= i ? 1 : 0.25,
                                    x: 0,
                                }}
                                transition={{ duration: 0.4, delay: i * 0.15 }}
                            >
                                {isDone ? (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 20 }}
                                    >
                                        <CheckCircle2 className="w-4 h-4 text-[#50C878]" />
                                    </motion.div>
                                ) : isActive ? (
                                    <motion.div
                                        className="w-4 h-4 flex items-center justify-center"
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    >
                                        <div className="w-3 h-3 rounded-full border-2 border-transparent border-t-white/80" />
                                    </motion.div>
                                ) : (
                                    <div className="w-4 h-4 flex items-center justify-center">
                                        <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                                    </div>
                                )}
                                <span
                                    className={`text-sm transition-colors duration-500 ${isDone
                                            ? "text-[#50C878]/80"
                                            : isActive
                                                ? "text-white/90"
                                                : "text-white/30"
                                        }`}
                                >
                                    {s.text}
                                </span>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Mindset Affirmation — large, rotating */}
                <div className="mt-10 mb-2 min-h-[80px] flex items-center justify-center">
                    <AnimatePresence mode="wait">
                        <motion.p
                            key={affirmationIdx}
                            className="text-white/70 text-base md:text-lg leading-relaxed max-w-sm mx-auto italic font-light"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            transition={{ duration: 1, ease: "easeInOut" }}
                        >
                            &ldquo;{config.affirmations[affirmationIdx]}&rdquo;
                        </motion.p>
                    </AnimatePresence>
                </div>


            </motion.div>
        </div>
    );
}
