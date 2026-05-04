import { useEffect, useRef } from "react";
import { Trophy, ArrowRight } from "lucide-react";
import { AppModal } from "@/shared/ui";
import { PATH_LABELS } from "@/shared/lib/paths";

interface LevelMilestoneModalProps {
  open: boolean;
  pathId: string;
  levelNumber: number;
  levelTitle: string;
  score: number;
  onClose: () => void;
}

export function LevelMilestoneModal({
  open,
  pathId,
  levelNumber,
  levelTitle,
  score,
  onClose,
}: LevelMilestoneModalProps) {
  const confettiFired = useRef(false);

  useEffect(() => {
    if (!open) { confettiFired.current = false; return; }
    if (confettiFired.current) return;
    confettiFired.current = true;
    let t1: ReturnType<typeof setTimeout>;
    let t2: ReturnType<typeof setTimeout>;
    let mounted = true;
    import("canvas-confetti").then((mod) => {
      if (!mounted) return;
      const confetti = mod.default;
      confetti({ particleCount: 80, spread: 70, origin: { x: 0.5, y: 0.55 } });
      t1 = setTimeout(() => confetti({ particleCount: 50, spread: 80, origin: { x: 0.3, y: 0.6 } }), 280);
      t2 = setTimeout(() => confetti({ particleCount: 50, spread: 80, origin: { x: 0.7, y: 0.6 } }), 520);
    });
    return () => { mounted = false; clearTimeout(t1); clearTimeout(t2); };
  }, [open]);

  const pathLabel = PATH_LABELS[pathId] ?? pathId;

  return (
    <AppModal open={open} onClose={onClose} size="sm" showCloseButton={false} accentBar>
      <div className="flex flex-col items-center text-center gap-5 py-2">
        <div className="w-14 h-14 rounded-full bg-[#f0fdf4] flex items-center justify-center">
          <Trophy className="w-7 h-7 text-[#00C950]" />
        </div>

        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wider text-[#94a3b8]">
            Level completed
          </p>
          <h2 className="text-xl font-bold text-[#0f172b]">{pathLabel}</h2>
          <p className="text-sm text-[#62748e]">
            Level {levelNumber} — {levelTitle}
          </p>
        </div>

        <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-full px-6 py-2">
          <span className="text-2xl font-bold text-[#00C950]">{score}</span>
          <span className="text-sm text-[#62748e]">/100</span>
        </div>

        <div className="w-full pt-1">
          <button
            onClick={onClose}
            className="w-full flex items-center justify-center gap-2 bg-[#0f172b] text-white rounded-lg py-3 text-sm font-medium hover:bg-[#1d293d] transition-colors cursor-pointer"
          >
            <ArrowRight className="w-4 h-4" />
            Continue
          </button>
        </div>
      </div>
    </AppModal>
  );
}
