/**
 * ScoreRing — Circular SVG score gauge
 * Presentational component (web-specific).
 */
import { motion } from "motion/react";
import { scoreColor } from "../model/shadowing.computations";

interface ScoreRingProps {
  score: number;
  size?: number;
}

export function ScoreRing({ score, size = 100 }: ScoreRingProps) {
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const filled = (score / 100) * circumference;
  const color = scoreColor(score);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
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
          animate={{ strokeDashoffset: circumference - filled }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className="text-2xl"
          style={{ color }}
        >
          {Math.round(score)}%
        </span>
      </div>
    </div>
  );
}
