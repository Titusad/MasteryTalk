import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Volume2, Mic, Square, RotateCcw, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { useMediaRecorder } from "@/shared/hooks/useMediaRecorder";
import { realSpeechService } from "@/services";
import type { VocabularyTerm } from "@/features/dashboard/model/progression-paths";

interface TermScore {
  score: number;
  status: "good" | "ok" | "retry";
}

interface TermCardProps {
  term: VocabularyTerm;
  index: number;
  isRecording: boolean;
  isProcessing: boolean;
  score: TermScore | null;
  onListen: () => void;
  onStartRecord: () => void;
  onStopRecord: () => void;
  onRetry: () => void;
}

function scoreStatus(score: number): TermScore["status"] {
  if (score >= 80) return "good";
  if (score >= 55) return "ok";
  return "retry";
}

function TermCard({
  term, index, isRecording, isProcessing, score,
  onListen, onStartRecord, onStopRecord, onRetry,
}: TermCardProps) {
  const statusColor = score
    ? score.status === "good" ? "text-emerald-600 bg-emerald-50 border-emerald-200"
    : score.status === "ok"   ? "text-amber-600 bg-amber-50 border-amber-200"
    :                           "text-red-600 bg-red-50 border-red-200"
    : "";

  return (
    <motion.div
      className="bg-white rounded-xl border border-[#e2e8f0] p-4"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.25 }}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Term info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-base font-semibold text-[#0f172b]">{term.term}</span>
            <span className="text-xs text-[#6366f1] font-mono">{term.ipa}</span>
          </div>
          <p className="text-xs text-[#62748e] mt-0.5 leading-relaxed">{term.definition}</p>
        </div>

        {/* Score badge */}
        <AnimatePresence>
          {score && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className={`shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-semibold ${statusColor}`}
            >
              {score.status === "good"
                ? <CheckCircle2 className="w-3.5 h-3.5" />
                : <AlertCircle className="w-3.5 h-3.5" />
              }
              {score.score}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 mt-3">
        {/* Listen */}
        <button
          onClick={onListen}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#e2e8f0] text-xs font-medium text-[#45556c] hover:bg-[#f8fafc] transition-colors cursor-pointer"
        >
          <Volume2 className="w-3.5 h-3.5" />
          Listen
        </button>

        {/* Record */}
        {isProcessing ? (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#f8fafc] text-xs text-[#94a3b8]">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Scoring...
          </div>
        ) : isRecording ? (
          <button
            onClick={onStopRecord}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 border border-red-200 text-xs font-medium text-red-600 hover:bg-red-100 transition-colors cursor-pointer animate-pulse"
          >
            <Square className="w-3.5 h-3.5" />
            Stop
          </button>
        ) : (
          <button
            onClick={onStartRecord}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0f172b] text-xs font-medium text-white hover:bg-[#1d293d] transition-colors cursor-pointer"
          >
            <Mic className="w-3.5 h-3.5" />
            Say it
          </button>
        )}

        {/* Retry */}
        {score && score.status !== "good" && !isRecording && !isProcessing && (
          <button
            onClick={onRetry}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#e2e8f0] text-xs font-medium text-[#62748e] hover:bg-[#f8fafc] transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            Try again
          </button>
        )}
      </div>
    </motion.div>
  );
}

interface VocabularyDrillSectionProps {
  terms: VocabularyTerm[];
}

export function VocabularyDrillSection({ terms }: VocabularyDrillSectionProps) {
  const recorder = useMediaRecorder();
  const [recordingIdx, setRecordingIdx] = useState<number | null>(null);
  const [processingIdx, setProcessingIdx] = useState<number | null>(null);
  const [scores, setScores] = useState<Record<number, TermScore>>({});

  const handleListen = useCallback((term: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(term);
    utterance.lang = "en-US";
    utterance.rate = 0.85;
    window.speechSynthesis.speak(utterance);
  }, []);

  const handleStartRecord = useCallback(async (idx: number) => {
    window.speechSynthesis.cancel();
    setRecordingIdx(idx);
    try {
      await recorder.start();
    } catch {
      setRecordingIdx(null);
    }
  }, [recorder]);

  const handleStopRecord = useCallback(async (idx: number, term: string) => {
    setRecordingIdx(null);
    setProcessingIdx(idx);
    try {
      const blob = await recorder.stop();
      if (!blob || blob.size < 500) { setProcessingIdx(null); return; }

      const assessment = await realSpeechService.assessPronunciation(blob, term).catch(() => null);
      if (assessment) {
        const raw = assessment.words?.[0]?.accuracyScore ?? assessment.pronScore ?? 0;
        const score = Math.round(raw);
        setScores(prev => ({ ...prev, [idx]: { score, status: scoreStatus(score) } }));
      }
    } catch {
      console.error("[VocabularyDrill] Pronunciation assessment failed");
    } finally {
      setProcessingIdx(null);
    }
  }, [recorder]);

  const handleRetry = useCallback((idx: number) => {
    setScores(prev => { const n = { ...prev }; delete n[idx]; return n; });
  }, []);

  return (
    <div className="mt-6">
      <div className="flex items-center gap-2 mb-3">
        <p className="text-xs font-semibold text-[#0f172b] uppercase tracking-wider">
          Practice these words — you'll need them
        </p>
      </div>
      <div className="flex flex-col gap-2">
        {terms.map((term, i) => (
          <TermCard
            key={term.term}
            term={term}
            index={i}
            isRecording={recordingIdx === i}
            isProcessing={processingIdx === i}
            score={scores[i] ?? null}
            onListen={() => handleListen(term.term)}
            onStartRecord={() => handleStartRecord(i)}
            onStopRecord={() => handleStopRecord(i, term.term)}
            onRetry={() => handleRetry(i)}
          />
        ))}
      </div>
    </div>
  );
}
