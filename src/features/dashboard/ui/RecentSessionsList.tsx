/**
 * RecentSessionsList — List of recent practice sessions
 * Presentational component (web-specific).
 */
import { motion } from "motion/react";
import {
  BookOpen,
  ChevronRight,
  Calendar,
  Clock,
  MessageCircleQuestion,
} from "lucide-react";
import type { EnrichedHistoryItem } from "../model/dashboard.computations";

interface RecentSessionsListProps {
  allRecent: EnrichedHistoryItem[];
  dc: {
    recentSessions: {
      title: string;
      viewAll: string;
      empty: string;
    };
  };
  onNavigateToHistory?: () => void;
}

export function RecentSessionsList({
  allRecent,
  dc,
  onNavigateToHistory,
}: RecentSessionsListProps) {
  return (
    <motion.div
      className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm p-5 flex flex-col"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-[#0f172b]" />
          <h3
            className="text-sm text-[#0f172b]"
            style={{ fontWeight: 600 }}
          >
            {dc.recentSessions.title}
          </h3>
        </div>
        {allRecent.length > 0 && (
          <button
            onClick={() => onNavigateToHistory?.()}
            className="text-xs text-[#6366f1] hover:text-[#4f46e5] transition-colors flex items-center gap-0.5"
            style={{ fontWeight: 500 }}
          >
            {dc.recentSessions.viewAll}
            <ChevronRight className="w-3 h-3" />
          </button>
        )}
      </div>

      {allRecent.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-8 text-center">
          <BookOpen className="w-8 h-8 text-[#cbd5e1] mb-2" />
          <p className="text-sm text-[#62748e]">
            {dc.recentSessions.empty}
          </p>
        </div>
      ) : (
        <div className="space-y-2 flex-1">
          {allRecent.slice(0, 4).map((practice, i) => (
            <motion.div
              key={`session-${i}`}
              className="rounded-xl px-4 py-3 border border-[#e2e8f0] hover:border-[#cbd5e1] transition-all cursor-pointer group"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28 + i * 0.05, duration: 0.3 }}
              onClick={() => onNavigateToHistory?.()}
            >
              <div className="flex items-center justify-between mb-1.5">
                <p
                  className="text-sm text-[#0f172b] truncate flex-1 mr-2"
                  style={{ fontWeight: 500 }}
                >
                  {practice.title}
                </p>
                <ChevronRight className="w-3.5 h-3.5 text-[#cbd5e1] group-hover:text-[#6366f1] transition-colors shrink-0" />
              </div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="flex items-center gap-1 text-[10px] text-[#62748e]">
                  <Calendar className="w-3 h-3" />
                  {practice.date}
                </span>
                <span className="flex items-center gap-1 text-[10px] text-[#62748e]">
                  <Clock className="w-3 h-3" />
                  {practice.duration}
                </span>
                <span
                  className="bg-[#f1f5f9] text-[#62748e] text-[10px] px-2 py-0.5 rounded-full"
                  style={{ fontWeight: 500 }}
                >
                  {practice.tag}
                </span>
                {practice.hasInterviewBriefing && (
                  <span
                    className="bg-[#6366f1]/10 text-[#6366f1] text-[10px] px-2 py-0.5 rounded-full flex items-center gap-0.5"
                    style={{ fontWeight: 600 }}
                  >
                    <MessageCircleQuestion className="w-2.5 h-2.5" />
                    Briefing
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
