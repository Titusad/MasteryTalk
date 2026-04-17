import { SUPABASE_URL } from "@/services/supabase";
import { useState, useRef, useEffect } from "react";
import { Mic, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { PROGRESSION_PATHS, VISIBLE_PATHS, getLevelState, getDefaultProgressionState } from "@/app/features/dashboard/model/progression-paths";
import type { ProgressionState, ScenarioType } from "@/services/types";

import { projectId } from "@/../utils/supabase/info";
import { getAuthToken } from "@/services/supabase";

interface PracticeDropdownProps {
  onSelect: (scenario: string, scenarioType: string, levelId: string, interlocutor: string) => void;
}

export function PracticeDropdown({ onSelect }: PracticeDropdownProps) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<ProgressionState>(getDefaultProgressionState);
  const ref = useRef<HTMLDivElement>(null);

  // Fetch progression state to find current level per path
  useEffect(() => {
    (async () => {
      try {
        const token = await getAuthToken();
        if (!token) return;
        const res = await fetch(
          `${SUPABASE_URL}/functions/v1/make-server-08b8658d/progression`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.ok) {
          const data = await res.json();
          if (data?.state) setState(data.state);
        }
      } catch {}
    })();
  }, []);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleSelect = (pathId: ScenarioType) => {
    const path = PROGRESSION_PATHS.find((p) => p.id === pathId);
    if (!path) return;

    // Find the first unlocked or study level (the one the user should practice)
    const currentLevel = path.levels.find((l) => {
      const ls = getLevelState(state, pathId, l.id);
      return ls.status === "unlocked" || ls.status === "study";
    }) || path.levels[0];

    setOpen(false);
    onSelect(currentLevel.scenario, pathId, currentLevel.id, currentLevel.interlocutor);
  };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "10px 20px", borderRadius: 12,
          background: "linear-gradient(135deg, #0f172b 0%, #1e293b 100%)",
          border: "none", cursor: "pointer",
          color: "#fff", fontSize: 14, fontWeight: 600,
          boxShadow: "0 2px 8px rgba(15, 23, 43, 0.2)",
          transition: "transform 0.15s",
        }}
      >
        <Mic size={16} />
        Practice Conversation
        <ChevronDown
          size={14}
          style={{
            transition: "transform 0.2s",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            style={{
              position: "absolute",
              top: "calc(100% + 8px)",
              right: 0,
              width: 220,
              background: "#ffffff",
              borderRadius: 14,
              boxShadow: "0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)",
              border: "1px solid #e2e8f0",
              overflow: "hidden",
              zIndex: 50,
            }}
          >
            {VISIBLE_PATHS.map((path) => {
              return (
                <button
                  key={path.id}
                  onClick={() => handleSelect(path.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    width: "100%", padding: "14px 16px",
                    background: "transparent", border: "none",
                    cursor: "pointer", fontSize: 14, fontWeight: 500,
                    color: "#0f172b", textAlign: "left",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <span style={{
                    display: "flex", alignItems: "center", justifyContent: "center",
                    width: 28, height: 28, borderRadius: "50%",
                    background: "#0f172b", flexShrink: 0,
                    fontSize: 14,
                  }}>
                    {path.icon}
                  </span>
                  {path.title}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
