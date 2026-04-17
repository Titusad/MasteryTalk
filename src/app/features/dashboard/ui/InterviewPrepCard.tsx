/**
 * InterviewPrepCard — Shows latest interview preparation summary
 * Presentational component (web-specific).
 */
import { motion } from "motion/react";
import { MessageCircleQuestion } from "lucide-react";
import type { PersistedSession } from "../../../../services/adapters/supabase/dashboard.supabase";

interface InterviewPrepCardProps {
  persistedSessions: PersistedSession[];
}

export function InterviewPrepCard({
  persistedSessions,
}: InterviewPrepCardProps) {
  const latestInterview = persistedSessions
    .filter(
      (s) =>
        s.scenarioType === "interview" &&
        s.interviewBriefing?.anticipatedQuestions?.length
    )
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() -
        new Date(a.created_at).getTime()
    )[0];

  if (!latestInterview?.interviewBriefing) return null;

  const brief = latestInterview.interviewBriefing;
  const proficiency =
    latestInterview.summary?.professionalProficiency ??
    latestInterview.feedback?.professionalProficiency;

  return (
    <motion.div
      className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm p-5 mb-6"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.22 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MessageCircleQuestion className="w-4 h-4 text-[#6366f1]" />
          <h3
            className="text-sm text-[#0f172b]"
            style={{ fontWeight: 600 }}
          >
            Your Last Interview Prep
          </h3>
        </div>
        <span
          className="text-[10px] bg-[#6366f1]/10 text-[#6366f1] px-2.5 py-1 rounded-full"
          style={{ fontWeight: 600 }}
        >
          {latestInterview.interlocutor.replace("_", " ")}
        </span>
      </div>

      <p className="text-xs text-[#62748e] mb-3 truncate">
        {latestInterview.scenario}
      </p>

      <div className="space-y-1.5 mb-4">
        {brief.anticipatedQuestions!.slice(0, 5).map((q, i) => (
          <div
            key={q.id ?? i}
            className="flex items-start gap-2.5 bg-[#f8fafc] rounded-lg px-3 py-2"
          >
            <span
              className="w-5 h-5 rounded-md bg-[#6366f1]/10 text-[#6366f1] flex items-center justify-center text-[10px] shrink-0 mt-0.5"
              style={{ fontWeight: 700 }}
            >
              {i + 1}
            </span>
            <div className="min-w-0">
              <p
                className="text-xs text-[#0f172b] leading-snug truncate"
                style={{ fontWeight: 500 }}
              >
                {q.question}
              </p>
              <p className="text-[10px] text-[#94a3b8] truncate mt-0.5">
                {q.approach}
              </p>
            </div>
          </div>
        ))}
      </div>

      {proficiency && proficiency > 0 ? (
        <div className="flex items-center gap-2 bg-gradient-to-r from-[#f0fdf4] to-[#eef2ff] rounded-lg px-3 py-2.5 border border-[#bbf7d0]/50">
          <div className="w-8 h-8 rounded-full bg-white border border-[#e2e8f0] flex items-center justify-center">
            <span
              className="text-xs text-[#0f172b]"
              style={{ fontWeight: 700 }}
            >
              {proficiency}%
            </span>
          </div>
          <div>
            <p
              className="text-xs text-[#0f172b]"
              style={{ fontWeight: 500 }}
            >
              Session Score
            </p>
            <p className="text-[10px] text-[#62748e]">
              Based on {brief.anticipatedQuestions!.length} prepared
              questions
            </p>
          </div>
        </div>
      ) : (
        <p className="text-[10px] text-[#94a3b8] text-center">
          Practice this scenario to see your performance score here
        </p>
      )}
    </motion.div>
  );
}
