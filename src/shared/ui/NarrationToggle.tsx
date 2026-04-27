import { motion, AnimatePresence } from "motion/react";
import { VolumeX } from "lucide-react";
import { useNarrationPreference } from "@/shared/lib/useNarrationPreference";

/* ── Waveform bars — animated while audio plays ── */
function Waveform() {
  const bars = [4, 8, 12, 8, 5, 10, 7];
  return (
    <div className="flex items-center gap-[2px] h-4">
      {bars.map((h, i) => (
        <motion.div
          key={i}
          className="w-[2px] rounded-full bg-white"
          animate={{ height: [`${h}px`, `${h * 2}px`, `${h}px`] }}
          transition={{
            repeat: Infinity,
            duration: 0.5 + i * 0.07,
            ease: "easeInOut",
            delay: i * 0.05,
          }}
        />
      ))}
    </div>
  );
}

/* ── Speaker icon — static when idle ── */
function SpeakerIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  );
}

/* ── Main component ── */
export function NarrationToggle() {
  const { muted, playing, toggle } = useNarrationPreference();

  return (
    <motion.button
      onClick={toggle}
      title={muted ? "Enable coach narration" : "Mute coach narration"}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full shadow-lg transition-colors overflow-hidden"
      style={{
        background: muted ? "#e2e8f0" : "#0f172b",
        color: muted ? "#94a3b8" : "white",
        padding: "0 14px",
        height: "40px",
      }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.93 }}
      transition={{ duration: 0.25 }}
    >
      {/* Icon — waveform when playing, speaker when idle, mute-x when muted */}
      <AnimatePresence mode="wait">
        {muted ? (
          <motion.div key="muted"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.15 }}
          >
            <VolumeX className="w-4 h-4" />
          </motion.div>
        ) : playing ? (
          <motion.div key="playing"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.15 }}
          >
            <Waveform />
          </motion.div>
        ) : (
          <motion.div key="idle"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.15 }}
          >
            <SpeakerIcon />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Label */}
      <span className="text-[11px]" style={{ fontWeight: 600, letterSpacing: "0.02em" }}>
        {muted ? "Unmute" : playing ? "Coach" : "Coach"}
      </span>
    </motion.button>
  );
}
