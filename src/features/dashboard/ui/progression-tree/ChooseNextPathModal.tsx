import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { ArrowRight, Trophy, Linkedin } from "lucide-react";
import { AppModal } from "@/shared/ui/AppModal";
import { SUPABASE_URL } from "@/services/supabase";
import { getAuthToken } from "@/services/supabase";
import { PATH_LABELS } from "@/features/dashboard/model/progression-paths";

interface ChooseNextPathModalProps {
  open: boolean;
  onClose: () => void;
  availablePaths: { id: string; title: string; description: string }[];
  onUnlocked: () => void;
  completedPathId?: string;
}

export function ChooseNextPathModal({ open, onClose, availablePaths, onUnlocked, completedPathId }: ChooseNextPathModalProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const confettiFired = useRef(false);

  useEffect(() => {
    if (!open) { confettiFired.current = false; return; }
    if (!completedPathId || confettiFired.current) return;
    confettiFired.current = true;
    let t1: ReturnType<typeof setTimeout>;
    let t2: ReturnType<typeof setTimeout>;
    let mounted = true;
    import("canvas-confetti").then((mod) => {
      if (!mounted) return;
      const confetti = mod.default;
      confetti({ particleCount: 100, spread: 80, origin: { x: 0.5, y: 0.5 } });
      t1 = setTimeout(() => confetti({ particleCount: 60, spread: 90, origin: { x: 0.2, y: 0.6 } }), 300);
      t2 = setTimeout(() => confetti({ particleCount: 60, spread: 90, origin: { x: 0.8, y: 0.6 } }), 550);
    });
    return () => { mounted = false; clearTimeout(t1); clearTimeout(t2); };
  }, [open, completedPathId]);

  const completedPathLabel = completedPathId ? (PATH_LABELS[completedPathId] ?? completedPathId) : null;

  const linkedInShareUrl = completedPathLabel
    ? `https://www.linkedin.com/sharing/share-offsite/?url=https%3A%2F%2Fmasterytalk.pro&summary=${encodeURIComponent(
        `Just completed the ${completedPathLabel} program on MasteryTalk PRO — 6 levels of professional English communication in high-stakes business scenarios. masterytalk.pro`
      )}`
    : null;

  const handleConfirm = async () => {
    if (!selected) return;
    setLoading(true);
    setError(null);
    try {
      const token = await getAuthToken();
      const res = await fetch(
        `${SUPABASE_URL}/functions/v1/make-server-08b8658d/progression/unlock-path`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ pathId: selected }),
        }
      );
      if (!res.ok) throw new Error("Failed to unlock path");
      onUnlocked();
      onClose();
    } catch (err) {
      console.error("[ChooseNextPath] Failed to unlock:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppModal open={open} onClose={onClose} size="md">
      <div className="p-6 md:p-8">

        {completedPathLabel && (
          <div className="flex flex-col items-center text-center mb-7 pb-6 border-b border-[#e2e8f0]">
            <div className="w-12 h-12 rounded-full bg-[#f0fdf4] flex items-center justify-center mb-3">
              <Trophy className="w-6 h-6 text-[#00C950]" />
            </div>
            <p className="text-xs font-medium uppercase tracking-wider text-[#94a3b8] mb-1">
              Path complete
            </p>
            <h2 className="text-lg font-bold text-[#0f172b] mb-3">
              {completedPathLabel}
            </h2>
            {linkedInShareUrl && (
              <a
                href={linkedInShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-[#0a66c2] border border-[#0a66c2] rounded-lg px-4 py-2 hover:bg-[#f0f7ff] transition-colors"
              >
                <Linkedin className="w-3.5 h-3.5" />
                Share on LinkedIn
              </a>
            )}
          </div>
        )}

        <div className="mb-6">
          <h2 className="text-xl font-light text-[#0f172b] mb-1">
            Choose your <span className="font-bold">next path</span>
          </h2>
          <p className="text-sm text-[#62748e]">You've earned it. Pick the scenario you want to master next.</p>
        </div>

        <div className="flex flex-col gap-3 mb-6">
          {availablePaths.map((path) => (
            <motion.button
              key={path.id}
              onClick={() => setSelected(path.id)}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-left p-4 rounded-xl border-2 transition-all cursor-pointer ${
                selected === path.id
                  ? "border-[#0f172b] bg-[#f8fafc]"
                  : "border-[#e2e8f0] bg-white hover:border-[#94a3b8]"
              }`}
            >
              <p className="text-sm font-medium text-[#0f172b]">{path.title}</p>
              <p className="text-xs text-[#62748e] mt-0.5">{path.description}</p>
            </motion.button>
          ))}
        </div>

        {error && <p className="text-sm text-red-500 mb-4 text-center">{error}</p>}

        <button
          onClick={handleConfirm}
          disabled={!selected || loading}
          className="w-full flex items-center justify-center gap-2 bg-[#0f172b] text-white py-3 rounded-lg text-sm font-semibold hover:bg-[#1d293d] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? "Unlocking..." : (
            <>
              Start this path <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </AppModal>
  );
}
