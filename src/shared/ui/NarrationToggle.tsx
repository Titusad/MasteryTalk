import { motion } from "motion/react";
import { Volume2, VolumeX } from "lucide-react";
import { useNarrationPreference } from "@/shared/lib/useNarrationPreference";

export function NarrationToggle() {
  const { muted, toggle } = useNarrationPreference();

  return (
    <motion.button
      onClick={toggle}
      title={muted ? "Enable coach narration" : "Mute coach narration"}
      className="fixed bottom-6 right-6 z-50 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-colors"
      style={{
        background: muted ? "#e2e8f0" : "#0f172b",
        color: muted ? "#94a3b8" : "white",
      }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileTap={{ scale: 0.9 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        key={String(muted)}
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.15 }}
      >
        {muted
          ? <VolumeX className="w-4 h-4" />
          : <Volume2 className="w-4 h-4" />
        }
      </motion.div>
    </motion.button>
  );
}
