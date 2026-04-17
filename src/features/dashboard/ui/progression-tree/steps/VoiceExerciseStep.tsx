import { useState, useRef, useCallback } from "react";
import { Mic, Square, CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";
import type { LessonExerciseStep } from "@/services/types";

interface Props {
  data: LessonExerciseStep;
  onComplete: () => void;
  footer?: React.ReactNode;
}



export function VoiceExerciseStep({ data, onComplete, footer }: Props) {
  const [recording, setRecording] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [done, setDone] = useState(false);

  // We simulate the Azure Pronunciation Assessment for the redesign
  // In production, wire this to the `usePronunciationAssessment` hook
  const handleRecordSubmit = async () => {
    setRecording(false);
    setAnalyzing(true);
    
    // Fake network delay for analysis
    await new Promise(r => setTimeout(r, 1500));
    
    setAnalyzing(false);
    setDone(true);
  };

  return (
    <motion.div aria-label=\"VoiceExerciseStep"
      className="bg-white rounded-2xl border border-[#6366f1]/20 shadow-md shadow-[#6366f1]/5 flex flex-col overflow-hidden"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      {/* Card header */}
      <div className="px-6 py-6 md:px-8 md:py-7 flex items-start gap-4 border-b border-[#f1f5f9] bg-[#f8fafc]">
        <span className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
          done ? "bg-emerald-500" : "bg-[#6366f1]"
        }`}>
          {done ? (
            <CheckCircle2 className="w-4 h-4 text-white" />
          ) : (
            <Mic className="w-4 h-4 text-white" />
          )}
        </span>
        <p className="text-[#0f172b] text-base md:text-lg leading-snug" style={{ fontWeight: 600 }}>
          {data.title}
        </p>
      </div>

      {/* Body */}
      <div className="px-6 py-6 md:px-8 flex flex-col gap-4">
        {/* Coach instruction */}
        <div className="rounded-2xl bg-[#f8fafc] border border-[#e2e8f0] px-5 py-4">
          <p className="text-[11px] text-[#64748b] uppercase tracking-wider mb-2" style={{ fontWeight: 700 }}>
            🎤 Coach Says
          </p>
          <p className="text-[15px] text-[#334155] leading-relaxed">
            {data.instruction}
          </p>
        </div>

        {/* Template */}
        <div className="rounded-2xl bg-[#eff6ff] border border-[#bfdbfe] px-5 py-4">
          <p className="text-[11px] text-[#1d4ed8] uppercase tracking-wider mb-2" style={{ fontWeight: 700 }}>
            Template to Follow
          </p>
          <p className="text-[15px] text-[#1e3a5f] leading-relaxed italic" style={{ fontWeight: 500 }}>
            &ldquo;{data.template}&rdquo;
          </p>
        </div>

        {/* Recording area */}
        <div className="flex flex-col items-center gap-4 pt-2">
          {!recording && !analyzing && !done && (
            <motion.button
              onClick={() => setRecording(true)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center justify-center gap-2.5 w-full py-4 px-6 rounded-2xl bg-[#0f172b] text-white text-[15px] border-none cursor-pointer"
              style={{ fontWeight: 600 }}
            >
              <Mic className="w-5 h-5" /> Start Recording
            </motion.button>
          )}

          {recording && (
            <div className="flex flex-col items-center gap-3 w-full">
              <div className="flex items-center gap-2 text-red-500 text-sm" style={{ fontWeight: 500 }}>
                <motion.div
                  animate={{ opacity: [1, 0.3] }}
                  transition={{ repeat: Infinity, duration: 0.8, repeatType: "reverse" }}
                  className="w-3 h-3 rounded-full bg-red-500"
                />
                Recording... speak now
              </div>
              <button
                onClick={handleRecordSubmit}
                className="flex items-center justify-center gap-2 w-full py-4 px-6 rounded-2xl bg-red-500 text-white text-sm border-none cursor-pointer hover:bg-red-600 transition-colors"
                style={{ fontWeight: 600 }}
              >
                <Square className="w-4 h-4" fill="currentColor" /> Stop Recording
              </button>
            </div>
          )}

          {analyzing && (
            <div className="flex flex-col items-center gap-3 w-full">
              <div className="flex items-center gap-2 text-blue-500 text-sm" style={{ fontWeight: 500 }}>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"
                />
                Analyzing your speech...
              </div>
            </div>
          )}

          {done && (
            <div className="flex flex-col items-center gap-4 w-full">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                <p className="text-[15px] text-emerald-600" style={{ fontWeight: 600 }}>Great job!</p>
              </div>
              <motion.button
                onClick={onComplete}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="w-full py-4 px-6 rounded-2xl border-none cursor-pointer text-white text-[15px]"
                style={{
                  fontWeight: 700,
                  background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                  boxShadow: "0 4px 16px rgba(34, 197, 94, 0.3)",
                }}
              >
                Complete Lesson &amp; Unlock Next Level →
              </motion.button>
            </div>
          )}
        </div>

        {/* Hint */}
        {data.evaluationCriteria && (
          <p className="text-xs text-[#94a3b8] text-center mt-1">
            {data.evaluationCriteria}
          </p>
        )}
      </div>

      {footer}
    </motion.div>
  );
}
