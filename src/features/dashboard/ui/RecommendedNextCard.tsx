import { Zap, Target } from "lucide-react";

interface RecommendedNextCardProps {
  focusArea: { pillar: string; score: number } | null;
  totalSessions: number;
  onStartSession: (scenario: string, scenarioType?: string, levelId?: string, interlocutor?: string) => void;
}

const PILLAR_SCENARIO: Record<string, {
  scenarioType: string;
  label: string;
  prompt: string;
  interlocutor: string;
}> = {
  Vocabulary: {
    scenarioType: "interview",
    label: "Job Interview",
    prompt: "Practice precise vocabulary in a high-stakes interview",
    interlocutor: "hiring_manager",
  },
  Pronunciation: {
    scenarioType: "meeting",
    label: "Remote Meeting",
    prompt: "Practice clear articulation in a team meeting",
    interlocutor: "team_lead",
  },
  Grammar: {
    scenarioType: "meeting",
    label: "Remote Meeting",
    prompt: "Practice accurate grammar in a structured meeting",
    interlocutor: "team_lead",
  },
  Fluency: {
    scenarioType: "presentation",
    label: "Presentation",
    prompt: "Practice fluent delivery in a live presentation",
    interlocutor: "executive_audience",
  },
  Persuasion: {
    scenarioType: "sales",
    label: "Sales Champion",
    prompt: "Practice persuasion in a B2B sales conversation",
    interlocutor: "b2b_prospect",
  },
  "Professional Tone": {
    scenarioType: "culture",
    label: "U.S. Business Culture",
    prompt: "Practice direct, confident communication in U.S. corporate settings",
    interlocutor: "egalitarian_leader",
  },
};

const FALLBACK = {
  scenarioType: "interview",
  label: "Job Interview",
  prompt: "Practice your professional communication skills",
  interlocutor: "hiring_manager",
};

export function RecommendedNextCard({
  focusArea,
  totalSessions,
  onStartSession,
}: RecommendedNextCardProps) {
  if (totalSessions === 0 || !focusArea) {
    return (
      <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm p-6">
        <p className="text-xs font-medium uppercase tracking-wider text-[#94a3b8] mb-4">
          Recommended Next Session
        </p>
        <div className="flex flex-col items-center justify-center text-center gap-3 py-2">
          <span className="w-12 h-12 rounded-full bg-[#f8fafc] border border-[#e2e8f0] flex items-center justify-center">
            <Target className="w-5 h-5 text-[#62748e]" />
          </span>
          <p className="text-sm font-semibold text-[#0f172b]">No recommendation yet</p>
          <p className="text-sm text-[#62748e] leading-relaxed max-w-[200px]">
            Complete a session and we'll recommend your next one based on your weakest pillar.
          </p>
        </div>
      </div>
    );
  }

  const rec = PILLAR_SCENARIO[focusArea.pillar] ?? FALLBACK;

  return (
    <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm p-6">
      <p className="text-xs font-medium uppercase tracking-wider text-[#94a3b8] mb-4">
        Recommended Next Session
      </p>

      <div className="flex items-start gap-3 mb-4">
        <span className="w-8 h-8 rounded-full bg-[#DBEDDF] flex items-center justify-center flex-shrink-0">
          <Zap className="w-4 h-4 text-[#16803c]" />
        </span>
        <div>
          <p className="text-sm font-semibold text-[#0f172b] leading-snug">
            {rec.label}
          </p>
          <p className="text-xs text-[#62748e] mt-0.5">
            Focus area: {focusArea.pillar} — {focusArea.score}%
          </p>
        </div>
      </div>

      <p className="text-sm text-[#45556c] leading-relaxed mb-4">
        {rec.prompt}. Practicing this scenario targets your weakest pillar directly.
      </p>

      <button
        onClick={() => onStartSession(rec.prompt, rec.scenarioType, undefined, rec.interlocutor)}
        className="w-full bg-[#0f172b] text-white rounded-lg text-sm font-medium py-2.5 hover:bg-[#1d293d] transition-colors"
      >
        Start session →
      </button>
    </div>
  );
}
