/**
 * ProficiencyRing — SVG circular progress ring
 * Presentational component (web-specific).
 */
import { motion } from "motion/react";

interface ProficiencyRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
}

export function ProficiencyRing({
  score,
  size = 100,
  strokeWidth = 7,
}: ProficiencyRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(100, score));
  const offset = circumference - (progress / 100) * circumference;

  const color =
    score >= 78
      ? "#22c55e"
      : score >= 63
        ? "#0ea5e9"
        : score >= 48
          ? "#f59e0b"
          : "#ef4444";

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#e2e8f0"
        strokeWidth={strokeWidth}
      />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
      />
    </svg>
  );
}
