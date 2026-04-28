import { useState, useEffect, useCallback } from "react";
import { Check, Play, RefreshCw, X, Volume2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface SRPhrase {
  id: string;
  phrase: string;
  focusWord: string;
  ipa: string;
  dueDate: string;
  box: number;
}

interface SRDashboardCardProps {
  totalSessions: number;
  onPracticeAll?: () => void;
}

export function SRDashboardCard({ totalSessions, onPracticeAll }: SRDashboardCardProps) {
  const [phrases, setPhrases] = useState<SRPhrase[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchPhrases = useCallback(async () => {
    try {
      const { spacedRepetitionService } = await import("@/services");
      const cards = await spacedRepetitionService.getTodayCards("current");
      const mapped: SRPhrase[] = cards.map((c: any) => ({
        id: c.id,
        phrase: c.phrase || c.text || "",
        focusWord: c.focusWord || "",
        ipa: c.ipa || "",
        dueDate: c.nextReview || c.dueDate || "",
        box: c.box ?? 0,
      }));
      setPhrases(mapped);
    } catch {
      setPhrases([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPhrases(); }, [fetchPhrases]);

  if (loading) return null;

  const todayDue = phrases.filter((p) => {
    const due = new Date(p.dueDate);
    return due <= new Date();
  });

  const handlePlayAudio = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    window.speechSynthesis.speak(utterance);
  };

  const renderModal = () => (
    <AnimatePresence>
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-2xl w-full max-w-lg shadow-xl border border-[#e2e8f0] flex flex-col max-h-[80vh]"
          >
            <div className="flex items-center justify-between p-4 border-b border-[#e2e8f0]">
              <h3 className="text-lg font-semibold text-[#0f172b]">Your Phrase Queue</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#94a3b8] hover:text-[#0f172b] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto space-y-3">
              {phrases.length === 0 ? (
                <p className="text-sm text-[#62748e] text-center py-6">No phrases in your queue yet.</p>
              ) : (
                phrases.map((p) => (
                  <div key={p.id} className="p-4 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] flex flex-col gap-2">
                    <div className="flex justify-between items-start gap-4">
                      <p className="text-sm font-medium text-[#0f172b] leading-relaxed">{p.phrase}</p>
                      <button 
                        onClick={() => handlePlayAudio(p.phrase)}
                        className="w-8 h-8 rounded-full bg-white border border-[#e2e8f0] flex items-center justify-center flex-shrink-0 hover:bg-[#f1f5f9] transition-colors"
                      >
                        <Volume2 className="w-4 h-4 text-[#45556c]" />
                      </button>
                    </div>
                    {p.focusWord && (
                      <p className="text-xs text-[#c45e00] font-medium">
                        Focus: {p.focusWord} {p.ipa && <span className="text-[#62748e] font-normal">/{p.ipa}/</span>}
                      </p>
                    )}
                    <div className="text-[10px] text-[#94a3b8] uppercase tracking-wider font-semibold mt-1">
                      Box {p.box}
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div className="p-4 border-t border-[#e2e8f0]">
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-full py-2.5 rounded-xl bg-[#0f172b] text-white text-sm font-medium hover:bg-[#1d293d] transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  // Wrapper for all states to include the title
  const CardWrapper = ({ children }: { children: React.ReactNode }) => (
    <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm p-6">
      <p className="text-xs font-medium uppercase tracking-wider text-[#94a3b8] mb-4">
        Daily Pronunciation Practice
      </p>
      {children}
      {renderModal()}
    </div>
  );

  // State C: Empty
  if (totalSessions === 0) {
    return (
      <CardWrapper>
        <div className="flex flex-col items-center justify-center text-center gap-3 py-2">
          <span className="w-12 h-12 rounded-full bg-[#f8fafc] border border-[#e2e8f0] flex items-center justify-center">
            <RefreshCw className="w-5 h-5 text-[#62748e]" />
          </span>
          <p className="text-base font-semibold text-[#0f172b]">Pronunciation Review</p>
          <p className="text-sm text-[#62748e] leading-relaxed max-w-[220px]">
            Complete your first session to unlock daily pronunciation practice with spaced repetition.
          </p>
        </div>
      </CardWrapper>
    );
  }

  // State B: Up to date
  if (todayDue.length === 0) {
    const totalQueued = phrases.length;
    const mastered = phrases.filter((p) => p.box >= 4).length;
    return (
      <CardWrapper>
        <div className="flex items-start gap-3 mb-2">
          <span className="w-8 h-8 rounded-full bg-[#0f172b] flex items-center justify-center flex-shrink-0">
            <Check className="w-4 h-4 text-white" />
          </span>
          <div>
            <p className="text-sm font-medium text-[#0f172b]">Up to date with your reviews</p>
            <p className="text-xs text-[#62748e] mt-1">
              {totalQueued} phrases queued · {mastered} mastered
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="text-xs text-[#62748e] font-medium cursor-pointer hover:text-[#0f172b] transition-colors mt-2"
        >
          View full queue →
        </button>
      </CardWrapper>
    );
  }

  // State A: Pending
  return (
    <CardWrapper>
      <div className="flex items-start gap-3 mb-4">
        <span className="w-8 h-8 rounded-full bg-[#eef2ff] flex items-center justify-center flex-shrink-0">
          <RefreshCw className="w-4 h-4 text-[#6366f1]" />
        </span>
        <div>
          <p className="text-sm font-semibold text-[#0f172b] leading-snug">
            Your today's pronunciation review
          </p>
          <p className="text-xs text-[#62748e] mt-1">
            {todayDue.length} phrases due today · Leitner system
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {todayDue.slice(0, 3).map((p) => (
          <div
            key={p.id}
            className="flex items-start gap-3 p-3 bg-[#f8fafc] rounded-xl border border-[#e2e8f0] cursor-pointer hover:border-[#cbd5e1] transition-colors"
          >
            <div className="flex-1">
              <p className="text-sm font-medium text-[#0f172b] leading-snug">"{p.phrase}"</p>
              {p.focusWord && (
                <p className="text-xs text-[#c45e00] font-medium mt-1">
                  → {p.focusWord} {p.ipa && <span className="text-[#62748e] font-normal">/{p.ipa}/</span>}
                </p>
              )}
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); handlePlayAudio(p.phrase); }}
              className="w-7 h-7 rounded-full bg-white border border-[#e2e8f0] flex items-center justify-center flex-shrink-0 hover:bg-[#f1f5f9] transition-colors"
            >
              <Play className="w-3 h-3 text-[#45556c] ml-0.5" />
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={onPracticeAll}
        className="w-full flex items-center justify-center gap-2 border border-[#e2e8f0] text-[#0f172b] rounded-xl text-sm font-semibold py-3 mt-4 hover:bg-[#f8fafc] transition-colors cursor-pointer"
      >
        Practice all phrases
        <span className="text-lg leading-none">→</span>
      </button>
    </CardWrapper>
  );
}
