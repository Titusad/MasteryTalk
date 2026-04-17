/**
 * WaveformBars — Animated audio waveform visualization
 * Presentational component (web-specific).
 */
import { motion } from "motion/react";

interface WaveformBarsProps {
  color?: string;
  count?: number;
}

export function WaveformBars({
  color = "#6366f1",
  count = 7,
}: WaveformBarsProps) {
  return (
    <div className="flex items-center justify-center gap-[3px] h-8">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className="w-[3px] rounded-full"
          style={{ backgroundColor: color }}
          animate={{
            height: [8, 20 + Math.random() * 12, 8],
          }}
          transition={{
            duration: 0.6 + Math.random() * 0.4,
            repeat: Infinity,
            delay: i * 0.08,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
