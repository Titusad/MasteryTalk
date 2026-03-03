import { useState } from "react";
import { X, Check, Sparkles, User, Building2, Briefcase, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import type { OnboardingProfile } from "../../../services/types";

/* ─── Session-Informed Profile Inference ─── */
/* In production, these would come from analyzing the practice conversation.
   For now, mock data that simulates what the AI inferred from the session. */
interface InferredField {
  key: keyof OnboardingProfile;
  label: string;
  inferredValue: string;
  inferredLabel: string;
  confidence: "high" | "medium";
  icon: typeof User;
  options: { id: string; label: string }[];
}

const INFERRED_FIELDS: InferredField[] = [
  {
    key: "industry",
    label: "Industry",
    inferredValue: "tech",
    inferredLabel: "Technology / SaaS",
    confidence: "high",
    icon: Building2,
    options: [
      { id: "tech", label: "Technology / SaaS" },
      { id: "finance", label: "Finance / Fintech" },
      { id: "consulting", label: "Consulting" },
      { id: "manufacturing", label: "Manufacturing" },
      { id: "healthcare", label: "Healthcare / Pharma" },
      { id: "ecommerce", label: "E-commerce / Retail" },
      { id: "other", label: "Other" },
    ],
  },
  {
    key: "position",
    label: "Role",
    inferredValue: "sales",
    inferredLabel: "Sales / Business Development",
    confidence: "high",
    icon: Briefcase,
    options: [
      { id: "sales", label: "Sales / Business Development" },
      { id: "product", label: "Product / Project Management" },
      { id: "engineering", label: "Engineering / Technical" },
      { id: "marketing", label: "Marketing / Growth" },
      { id: "operations", label: "Operations / Supply Chain" },
      { id: "executive", label: "General Management" },
    ],
  },
  {
    key: "seniority",
    label: "Seniority",
    inferredValue: "manager",
    inferredLabel: "Manager",
    confidence: "medium",
    icon: User,
    options: [
      { id: "individual", label: "Individual Contributor" },
      { id: "lead", label: "Team Lead" },
      { id: "manager", label: "Manager" },
      { id: "director", label: "Director / VP" },
      { id: "c-level", label: "C-Level / Founder" },
    ],
  },
];

/* ═══════════════════════ COMPONENT ═══════════════════════ */

interface ProfileCompletionBannerProps {
  userProfile?: OnboardingProfile | null;
  onProfileUpdate?: (profile: OnboardingProfile) => void;
  firstPracticeScenario?: string;
}

export function ProfileCompletionBanner({
  userProfile,
  onProfileUpdate,
  firstPracticeScenario,
}: ProfileCompletionBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [confirmed, setConfirmed] = useState<Record<string, string>>({});
  const [editing, setEditing] = useState<string | null>(null);

  // Don't show if profile already exists or banner dismissed or no practice done
  if (userProfile || dismissed || !firstPracticeScenario) return null;

  const allFieldsConfirmed = INFERRED_FIELDS.every(
    (f) => confirmed[f.key]
  );

  const handleConfirmAll = () => {
    // Accept all inferred values
    const profile: OnboardingProfile = {
      industry: confirmed.industry || INFERRED_FIELDS.find((f) => f.key === "industry")!.inferredValue,
      position: confirmed.position || INFERRED_FIELDS.find((f) => f.key === "position")!.inferredValue,
      seniority: confirmed.seniority || INFERRED_FIELDS.find((f) => f.key === "seniority")!.inferredValue,
    };
    onProfileUpdate?.(profile);
    setDismissed(true);
  };

  const handleConfirmField = (key: string, value: string) => {
    setConfirmed((prev) => ({ ...prev, [key]: value }));
    setEditing(null);
  };

  const confirmedCount = Object.keys(confirmed).length;
  const totalFields = INFERRED_FIELDS.length;

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: -8, height: 0 }}
          animate={{ opacity: 1, y: 0, height: "auto" }}
          exit={{ opacity: 0, y: -8, height: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="bg-gradient-to-r from-[#eef2ff] to-[#f0f9ff] rounded-2xl border border-[#c7d2fe]/40 overflow-hidden">
            {/* Collapsed banner */}
            <div
              className="flex items-center justify-between px-5 py-4 cursor-pointer"
              onClick={() => setExpanded(!expanded)}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#6366f1] flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm text-[#0f172b]" style={{ fontWeight: 600 }}>
                    AI detected your profile
                  </p>
                  <p className="text-xs text-[#6366f1]">
                    {confirmedCount === 0
                      ? "Confirm with 1 tap to personalize your sessions"
                      : `${confirmedCount}/${totalFields} confirmed`
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Quick confirm all button (only if not expanded) */}
                {!expanded && confirmedCount === 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // Accept all inferred
                      INFERRED_FIELDS.forEach((f) => {
                        handleConfirmField(f.key, f.inferredValue);
                      });
                    }}
                    className="bg-[#6366f1] text-white text-xs px-3 py-1.5 rounded-full hover:bg-[#4f46e5] transition-colors"
                    style={{ fontWeight: 500 }}
                  >
                    Confirm all
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDismissed(true);
                  }}
                  className="w-6 h-6 rounded-full hover:bg-white/50 flex items-center justify-center transition-colors"
                >
                  <X className="w-3.5 h-3.5 text-[#62748e]" />
                </button>
                <ChevronUp
                  className={`w-4 h-4 text-[#62748e] transition-transform ${expanded ? "" : "rotate-180"}`}
                />
              </div>
            </div>

            {/* Expanded: inferred fields */}
            <AnimatePresence>
              {expanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-5 space-y-3">
                    <p className="text-xs text-[#62748e] leading-relaxed">
                      Based on your practice session, I inferred this data about your profile.
                      Confirm or edit so the AI can better adapt to you.
                    </p>

                    {INFERRED_FIELDS.map((field) => {
                      const isConfirmed = !!confirmed[field.key];
                      const isEditing = editing === field.key;
                      const currentValue = confirmed[field.key] || field.inferredValue;
                      const currentLabel = field.options.find((o) => o.id === currentValue)?.label || currentValue;
                      const Icon = field.icon;

                      return (
                        <motion.div
                          key={field.key}
                          className={`flex items-center justify-between rounded-xl px-4 py-3 border transition-all ${
                            isConfirmed
                              ? "bg-white border-[#bbf7d0]"
                              : "bg-white border-[#e2e8f0]"
                          }`}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <Icon className="w-4 h-4 text-[#6366f1] shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-[11px] text-[#62748e]" style={{ fontWeight: 500 }}>
                                {field.label}
                              </p>
                              {isEditing ? (
                                <select
                                  className="mt-1 w-full text-sm bg-[#f8fafc] border border-[#e2e8f0] rounded-lg px-2 py-1.5 text-[#0f172b] focus:outline-none focus:border-[#6366f1]"
                                  value={currentValue}
                                  onChange={(e) => handleConfirmField(field.key, e.target.value)}
                                  autoFocus
                                >
                                  {field.options.map((opt) => (
                                    <option key={opt.id} value={opt.id}>
                                      {opt.label}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                <p className="text-sm text-[#0f172b] truncate" style={{ fontWeight: 500 }}>
                                  {currentLabel}
                                  {!isConfirmed && field.confidence === "medium" && (
                                    <span className="text-[10px] text-[#f59e0b] ml-1.5">~</span>
                                  )}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 ml-2 shrink-0">
                            {isConfirmed ? (
                              <div className="w-6 h-6 rounded-full bg-[#16a34a] flex items-center justify-center">
                                <Check className="w-3.5 h-3.5 text-white" />
                              </div>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleConfirmField(field.key, field.inferredValue)}
                                  className="text-[11px] bg-[#6366f1] text-white px-2.5 py-1 rounded-full hover:bg-[#4f46e5] transition-colors"
                                  style={{ fontWeight: 500 }}
                                >
                                  OK
                                </button>
                                <button
                                  onClick={() => setEditing(field.key)}
                                  className="text-[11px] text-[#6366f1] px-2 py-1 rounded-full hover:bg-[#ede9fe] transition-colors"
                                  style={{ fontWeight: 500 }}
                                >
                                  Edit
                                </button>
                              </>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}

                    {/* Save button when all confirmed */}
                    {allFieldsConfirmed && (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="pt-2"
                      >
                        <button
                          onClick={handleConfirmAll}
                          className="w-full bg-[#6366f1] text-white py-3 rounded-full flex items-center justify-center gap-2 hover:bg-[#4f46e5] transition-colors"
                          style={{ fontWeight: 500 }}
                        >
                          <Check className="w-4 h-4" />
                          Save profile
                        </button>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Progress bar at bottom */}
            {confirmedCount > 0 && confirmedCount < totalFields && (
              <div className="h-1 bg-[#e0e7ff]">
                <motion.div
                  className="h-full bg-[#6366f1]"
                  initial={{ width: 0 }}
                  animate={{ width: `${(confirmedCount / totalFields) * 100}%` }}
                  transition={{ duration: 0.4 }}
                />
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}