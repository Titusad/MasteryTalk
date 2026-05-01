import { motion } from "motion/react";

export function AccuracyRing({ score }: { score: number }) {
    const radius = 44;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;
    const color =
        score >= 80 ? "#22c55e" : score >= 60 ? "#f59e0b" : "#ef4444";

    return (
        <div className="relative w-28 h-28 flex items-center justify-center">
            <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
                <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="none"
                    stroke="#f1f5f9"
                    strokeWidth="6"
                />
                <motion.circle
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="none"
                    stroke={color}
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1, ease: "easeOut" }}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span
                    className="text-2xl text-[#0f172b]"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.5 }}
                >
                    {score}%
                </motion.span>
                <span className="text-[10px] text-[#45556c] uppercase tracking-wider">
                    accuracy
                </span>
            </div>
        </div>
    );
}
