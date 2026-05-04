import { useState } from "react";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { AppModal } from "@/shared/ui/AppModal";
import { SUPABASE_URL } from "@/services/supabase";
import { getAuthToken } from "@/services/supabase";
import type { PathId } from "@/features/dashboard/model/progression-paths";

interface ChooseNextPathModalProps {
  open: boolean;
  onClose: () => void;
  availablePaths: { id: string; title: string; description: string }[];
  onUnlocked: () => void;
}

export function ChooseNextPathModal({ open, onClose, availablePaths, onUnlocked }: ChooseNextPathModalProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
          className="w-full flex items-center justify-center gap-2 bg-[#0f172b] text-white py-3 rounded-full text-sm font-semibold hover:bg-[#1d293d] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
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
