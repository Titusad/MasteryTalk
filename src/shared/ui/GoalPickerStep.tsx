import { useState } from "react";
import { motion } from "motion/react";
import {
  Briefcase,
  Handshake,
  Users,
  Monitor,
  Globe,
  Target,
  ArrowRight,
  ArrowLeft,
  Check,
} from "lucide-react";

export const GOAL_LABELS: Record<string, string> = {
  interview: "Job Interview",
  sales: "Sales & Negotiation",
  meeting: "Team Meetings",
  presentation: "Presentations",
  culture: "Culture & Teamwork",
};

const GOAL_OPTIONS = [
  {
    key: "interview",
    label: "Job Interview",
    description: "Ace your next interview with senior hiring managers",
    icon: Briefcase,
  },
  {
    key: "sales",
    label: "Sales & Negotiation",
    description: "Close deals and pitch confidently in English",
    icon: Handshake,
  },
  {
    key: "meeting",
    label: "Team Meetings",
    description: "Lead discussions and speak up in every meeting",
    icon: Users,
  },
  {
    key: "presentation",
    label: "Presentations",
    description: "Deliver clear, structured presentations that land",
    icon: Monitor,
  },
  {
    key: "culture",
    label: "Culture & Teamwork",
    description: "Fit in and connect with international teams",
    icon: Globe,
  },
];

interface GoalPickerStepProps {
  initialValue?: string;
  onComplete: (goal: string) => void;
  onBack?: () => void;
  ctaLabel?: string;
}

export function GoalPickerStep({
  initialValue,
  onComplete,
  onBack,
  ctaLabel = "Start my journey",
}: GoalPickerStepProps) {
  const [selected, setSelected] = useState(initialValue ?? "");

  return (
    <div className="px-7 pt-8 pb-8">
      {/* Header */}
      <div className="text-center mb-7">
        <div className="w-12 h-12 rounded-2xl bg-[#0f172b] flex items-center justify-center mx-auto mb-4">
          <Target className="w-6 h-6 text-white" />
        </div>
        <h1
          className="text-xl md:text-2xl text-[#0f172b] mb-1.5"
          style={{ lineHeight: 1.2 }}
        >
          Now, tell me your primary goal
        </h1>
        <p className="text-[#62748e] text-sm mx-auto">
          Choose the path you want to master.
        </p>
      </div>

      {/* Options */}
      <div className="flex flex-col gap-3 mb-7">
        {GOAL_OPTIONS.map((opt) => {
          const Icon = opt.icon;
          const isSelected = selected === opt.key;
          return (
            <motion.button
              key={opt.key}
              type="button"
              onClick={() => setSelected(opt.key)}
              whileTap={{ scale: 0.98 }}
              className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all cursor-pointer ${
                isSelected
                  ? "border-[#0f172b] bg-[#0f172b]"
                  : "border-[#e2e8f0] bg-[#f8fafc] hover:border-[#c7d2e0] hover:bg-white"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                  isSelected ? "bg-white/15" : "bg-white border border-[#e2e8f0]"
                }`}
              >
                <Icon
                  className={`w-5 h-5 ${isSelected ? "text-white" : "text-[#45556c]"}`}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-medium leading-tight ${
                    isSelected ? "text-white" : "text-[#0f172b]"
                  }`}
                >
                  {opt.label}
                </p>
                <p
                  className={`text-xs mt-0.5 ${
                    isSelected ? "text-white/70" : "text-[#62748e]"
                  }`}
                >
                  {opt.description}
                </p>
              </div>
              {isSelected && (
                <Check className="w-4 h-4 text-white shrink-0" />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 px-5 py-4 rounded-full text-sm text-[#45556c] border border-[#e2e8f0] hover:bg-[#f8fafc] transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
       
          </button>
        )}
        <button
          type="button"
          onClick={() => onComplete(selected)}
          disabled={!selected}
          className={`flex-1 flex items-center justify-center gap-2.5 py-4 rounded-full text-base shadow-lg transition-all ${
            selected
              ? "bg-[#0f172b] text-white hover:bg-[#1d293d] cursor-pointer"
              : "bg-[#e2e8f0] text-[#94a3b8] cursor-not-allowed"
          }`}
        >
          {ctaLabel}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
