import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";

interface NarrationCaptionProps {
  script: string;
  isVisible: boolean;
  onDismiss: () => void;
}

/**
 * Fixed-position subtitle bubble for coach narration.
 * Appears while audio plays (or for reading-time when muted).
 * Dismisses on click or when audio ends.
 */
export function NarrationCaption({ script, isVisible, onDismiss }: NarrationCaptionProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 w-[min(90vw,420px)]"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          <div className="relative bg-[#0f172b]/90 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-lg">
            <p className="text-[13px] text-[#cbd5e1] leading-relaxed pr-6">
              {script}
            </p>
            <button
              onClick={onDismiss}
              aria-label="Dismiss caption"
              className="absolute top-2.5 right-2.5 w-5 h-5 flex items-center justify-center rounded-full text-[#64748b] hover:text-[#94a3b8] transition-colors cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
