import { motion } from "motion/react";

export function feedbackProficiencyColor(score: number): string {
  if (score >= 82) return "#22c55e";
  if (score >= 65) return "#6366f1";
  if (score >= 48) return "#f59e0b";
  return "#ef4444";
}

export function feedbackProficiencyLabel(score: number): string {
  if (score >= 82) return "Advanced";
  if (score >= 65) return "Proficient";
  if (score >= 48) return "Progressing";
  return "Developing";
}

interface ProficiencyGaugeProps {
  score: number;
  size?: number;
  darkBg?: boolean;
  hideLabel?: boolean;
  strokeWidth?: number;
}

export function ProficiencyGauge({
  score,
  size = 160,
  darkBg = false,
  hideLabel = false,
  strokeWidth = 10,
}: ProficiencyGaugeProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(100, Math.max(0, score)) / 100;
  const strokeDashoffset = Math.max(0, circumference * (1 - progress));
  const color = feedbackProficiencyColor(score);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={darkBg ? "rgba(255,255,255,0.15)" : "#e2e8f0"}
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
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className={`${size >= 140 ? "text-4xl" : size >= 80 ? "text-2xl" : "text-lg"} ${darkBg ? "text-white" : "text-[#0f172b]"}`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          {Math.round(score)}%
        </motion.span>
        {!hideLabel && (
          <span className="text-xs mt-0.5" style={{ color }}>
            {feedbackProficiencyLabel(score)}
          </span>
        )}
      </div>
    </div>
  );
}
