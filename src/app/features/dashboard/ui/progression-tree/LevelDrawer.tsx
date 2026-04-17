import { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import { LessonStepper } from "./LessonStepper";
import { completeLessonAndUnlock } from "../../model/progression.api";

interface LevelDrawerProps {
  open: boolean;
  pathId: string;
  levelId: string;
  levelTitle: string;
  levelSubtitle?: string;
  onClose: () => void;
  onLessonComplete: () => void;
}

export function LevelDrawer({
  open,
  pathId,
  levelId,
  levelTitle,
  levelSubtitle,
  onClose,
  onLessonComplete,
}: LevelDrawerProps) {

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const handleComplete = async () => {
    try {
      await completeLessonAndUnlock(pathId, levelId);
    } catch (err) {
      console.error("Failed to complete lesson:", err);
    }
    onLessonComplete();
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(15, 23, 43, 0.45)",
              backdropFilter: "blur(4px)",
              zIndex: 9998,
            }}
          />

          {/* Full-screen modal — gradient background matching PracticeSession */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: "fixed",
              inset: 0,
              background: "linear-gradient(to bottom, #f0f4ff, #ffffff)",
              zIndex: 9999,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* Close button at top right */}
            <button
              onClick={onClose}
              style={{
                position: "absolute",
                top: 48,
                right: 48,
                display: "flex", alignItems: "center", justifyContent: "center",
                width: 34, height: 34, borderRadius: 10,
                border: "none", background: "#0f172b",
                cursor: "pointer", color: "#ffffff",
                zIndex: 10,
              }}
              aria-label="Close"
            >
              <X size={16} />
            </button>

            {/* Lesson Stepper — fills remaining space */}
            <div style={{ flex: 1, overflow: "hidden", minHeight: 0, display: "flex", flexDirection: "column" }}>
              <LessonStepper
                pathId={pathId}
                levelId={levelId}
                onComplete={handleComplete}
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
