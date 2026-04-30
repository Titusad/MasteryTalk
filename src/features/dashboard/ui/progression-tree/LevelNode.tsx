import { motion } from "motion/react";
import { CheckCircle2, ChevronRight, Lock } from "lucide-react";

interface StatusConfig {
  label: string;
  bg: string;
  color: string;
  border: string;
  icon: any; // LucideIcon placeholder
}

interface LevelNodeProps {
  level: {
    id: string;
    level: string | number;
    title: string;
    scenario: string;
    interlocutor: any;
    introValue?: string;
  };
  status: "locked" | "unlocked" | "study" | "completed";
  config: StatusConfig;
  isLast: boolean;
  isExpanded?: boolean;
  tagline?: string;
  onClick: () => void;
}

export function LevelNode({ level, status, config, isLast, isExpanded = false, tagline, onClick }: LevelNodeProps) {
  const StatusIcon = config.icon;

  return (
    <div className="relative">
      {/* Vertical connector line */}
      {!isLast && (
        <div
          className="absolute left-[22px] top-[56px] w-0.5 z-0"
          style={{
            bottom: isExpanded ? "-30px" : "0", // extend if expanded inside tree
            background:
              status === "completed"
                ? "linear-gradient(to bottom, #22c55e, #e2e8f0)"
                : "#e2e8f0",
          }}
        />
      )}

      <motion.div
        className="relative z-10 flex items-start gap-4 py-3 group"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Level number circle */}
        <div
          className={`w-[44px] h-[44px] rounded-full flex items-center justify-center shrink-0 transition-all duration-300 z-10`}
          style={{
            background: status === "completed"
              ? "#22c55e"
              : status === "locked"
                ? "#f1f5f9"
                : config.bg,
            border: `2px solid ${
              status === "completed"
                ? "#22c55e"
                : status === "locked"
                  ? "#e2e8f0"
                  : config.border
            }`,
          }}
        >
          {status === "completed" ? (
            <CheckCircle2 className="w-5 h-5 text-white" />
          ) : (
            <span
              className="text-sm font-bold"
              style={{ color: status === "locked" ? "#94a3b8" : config.color }}
            >
              {level.level}
            </span>
          )}
        </div>

        {/* Card content */}
        <div
          className={`flex-1 rounded-xl p-4 transition-all duration-200 ${
            status === "locked"
              ? "bg-[#f8fafc] opacity-60"
              : "bg-white border border-[#e2e8f0] hover:border-[#cbd5e1] hover:shadow-sm cursor-pointer"
          } ${isExpanded ? "border-[#cbd5e1] shadow-md ring-2 ring-[#cbd5e1]/20" : ""}`}
          onClick={onClick}
        >
          {/* Row 1: title + badge + chevron */}
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <h4 className="text-[15px] font-bold text-[#0f172b] truncate">
                {level.title}
              </h4>
              <span
                className="text-[10px] px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1 font-semibold"
                style={{
                  backgroundColor: status === "locked" ? "#f1f5f9" : config.bg,
                  color: status === "locked" ? "#94a3b8" : config.color,
                  border: `1px solid ${status === "locked" ? "#e2e8f0" : config.border}`,
                }}
              >
                <StatusIcon className="w-3 h-3" />
                {config.label}
              </span>
            </div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border transition-colors ${
              status === "locked"
                ? "bg-[#f1f5f9] border-[#e2e8f0]"
                : "bg-[#f8fafc] border-[#e2e8f0] group-hover:bg-[#f1f5f9]"
            }`}>
              <ChevronRight className={`w-4 h-4 ${status === "locked" ? "text-[#c7d2e0]" : "text-[#64748b]"}`} />
            </div>
          </div>

          {/* Row 2: tagline */}
          {tagline && (
            <p className="text-sm text-[#62748e] leading-snug mb-1">
              {tagline}
            </p>
          )}

          {/* Row 3: locked hint (only when locked) */}
          {status === "locked" && (
            <p className="text-[11px] text-[#94a3b8] flex items-center gap-1 mt-1">
              <Lock className="w-3 h-3 shrink-0" />
              Complete the previous level first
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
