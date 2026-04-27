import { useState, useEffect } from "react";
import {
    ArrowRight,
    ArrowLeft,
    Info,
    ClipboardPaste,
    ChevronDown,
    ChevronUp,
    Check,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import type { ScenarioType, OnboardingProfile } from "@/services/types";
import { getPresetsForScenario, type SituationPreset } from "@/features/practice-session/model/scenario-presets";
import { useNarration } from "@/shared/lib/useNarration";

/* ═══════════════════════════════════════════════════════════
   CONTEXT FIELD DATA
   ═══════════════════════════════════════════════════════════ */

interface ExtraContextField {
    label: string;
    placeholder: string;
    hint: string;
    pasteHint: string;
}

const EXTRA_CONTEXT_FIELDS: Record<string, ExtraContextField[]> = {
    interview: [
        {
            label: "Job Description",
            placeholder: "Paste the job description here — or just the key requirements and responsibilities...",
            hint: "The AI will tailor interview questions to the specific role, seniority level, and required skills",
            pasteHint: "Tip: Copy-paste directly from LinkedIn or the company careers page",
        },
    ],
    meeting: [
        {
            label: "Meeting context",
            placeholder: "What type of meeting is this? Who's attending? What's on the agenda?",
            hint: "The AI will simulate realistic interruptions, follow-up questions, and dynamics based on your meeting type",
            pasteHint: "Tip: Copy-paste the meeting invite or agenda if you have one",
        },
    ],
    presentation: [
        {
            label: "Presentation topic & audience",
            placeholder: "What are you presenting? Who's your audience? What's the context?",
            hint: "The AI will challenge you with realistic Q&A and tailor the difficulty to your audience seniority",
            pasteHint: "Tip: Paste your slide outline or key talking points for more targeted practice",
        },
    ],
    sales: [
        {
            label: "Prospect & context",
            placeholder: "Who are you pitching to? What's their company, role, and main pain point?",
            hint: "The AI will role-play the buyer's psychology — skepticism, objections, and evaluation criteria",
            pasteHint: "Tip: Paste the LinkedIn profile or company description of your prospect",
        },
    ],
};

const SCENARIO_TITLES: Record<string, string> = {
    interview: "The Opportunity",
    sales: "The Prospect",
    meeting: "The Meeting",
    presentation: "The Stage",
    client: "The Client",
    csuite: "The Room",
};

const SCENARIO_SUBTITLES: Record<string, string> = {
    interview: "Add the job description and I'll build the interview around it.",
    sales: "Tell me about your prospect. The more I know, the harder I'll push back.",
    meeting: "Describe the meeting and I'll simulate the room — interruptions and all.",
    presentation: "Describe the context and I'll be your toughest audience.",
    client: "Tell me about your client. I'll role-play their expectations and pushback.",
    csuite: "Set the scene. I'll think like a C-level exec.",
};

/* ═══════════════════════════════════════════════════════════
   PERSONALIZE PRESETS — inject user role into context
   ═══════════════════════════════════════════════════════════ */

function personalizePresets(presets: SituationPreset[], position?: string): SituationPreset[] {
    if (!position) return presets;
    return presets.map((p) => ({
        ...p,
        context: `${p.context} The open role is aligned with your background as a ${position}.`,
    }));
}

/* ═══════════════════════════════════════════════════════════
   PRESET CARD
   ═══════════════════════════════════════════════════════════ */

function PresetCard({
    preset,
    selected,
    onSelect,
}: {
    preset: SituationPreset;
    selected: boolean;
    onSelect: () => void;
}) {
    return (
        <button
            onClick={onSelect}
            className={`w-full text-left p-4 rounded-2xl border transition-all ${
                selected
                    ? "border-[#0f172b] bg-white shadow"
                    : "border-[#e2e8f0] bg-white hover:border-[#94a3b8] shadow-sm"
            }`}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-[#0f172b] truncate">{preset.label}</span>
                        {preset.badge && (
                            <span className="shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded bg-[#DBEDDF] text-[#0f172b]">
                                {preset.badge}
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-[#62748e]">{preset.company}</p>
                </div>
                <div className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    selected ? "border-[#0f172b] bg-[#0f172b]" : "border-[#e2e8f0]"
                }`}>
                    {selected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                </div>
            </div>
            {selected && (
                <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mt-3 text-xs text-[#45556c] leading-relaxed border-t border-[#f0f4f8] pt-3"
                >
                    {preset.context}
                </motion.p>
            )}
        </button>
    );
}

/* ═══════════════════════════════════════════════════════════
   CONTEXT SCREEN
   ═══════════════════════════════════════════════════════════ */

function ContextScreen({
    scenarioType,
    onContinue,
    onBack,
    userProfile,
    onProfileUpdate,
    narratorUrl,
}: {
    scenarioType?: ScenarioType;
    onContinue: (extraData: Record<string, string>) => void;
    onBack?: () => void;
    userProfile?: OnboardingProfile | null;
    onProfileUpdate?: (profile: OnboardingProfile) => void; // reserved for future use
    narratorUrl?: string;
}) {
    const fields   = scenarioType ? EXTRA_CONTEXT_FIELDS[scenarioType] ?? [] : [];
    const rawPresets = getPresetsForScenario(scenarioType);
    const presets  = personalizePresets(rawPresets, userProfile?.position);
    useNarration(narratorUrl || null);
    const storageKey = `masterytalk_extra_ctx_${scenarioType || "default"}`;

    const [selectedPreset, setSelectedPreset] = useState<SituationPreset | null>(null);
    const [presetsOpen, setPresetsOpen] = useState(false);
    const [values, setValues] = useState<Record<string, string>>(() => {
        // Restore from sessionStorage first (current session draft)
        if (typeof window !== "undefined") {
            try {
                const saved = sessionStorage.getItem(storageKey);
                if (saved) {
                    const parsed = JSON.parse(saved).values || {};
                    if (Object.values(parsed).some((v) => (v as string).trim())) return parsed;
                }
            } catch (e) {}
        }
        // Fall back to last saved job description from profile
        if (userProfile?.lastJobDescription && scenarioType === "interview") {
            return { "Job Description": userProfile.lastJobDescription };
        }
        return {};
    });

    useEffect(() => {
        if (typeof window !== "undefined") {
            sessionStorage.setItem(storageKey, JSON.stringify({ values }));
        }
    }, [values, storageKey]);

    const handleSelectPreset = (preset: SituationPreset) => {
        if (selectedPreset?.id === preset.id) {
            setSelectedPreset(null);
        } else {
            setSelectedPreset(preset);
            // Clear form when a preset is selected
            setValues({});
        }
    };

    // Typing in the form deselects any preset
    const handleFieldChange = (label: string, value: string) => {
        setSelectedPreset(null);
        setValues((prev) => ({ ...prev, [label]: value }));
    };

    const hasCustomContent = Object.values(values).some((v) => v.trim().length > 0);
    const canContinue = selectedPreset !== null || hasCustomContent;

    const handleContinue = () => {
        if (selectedPreset) {
            onContinue({ situationContext: selectedPreset.context });
        } else {
            onContinue(values);
        }
    };

    const title    = scenarioType ? SCENARIO_TITLES[scenarioType]    ?? "Context" : "Context";
    const subtitle = scenarioType ? SCENARIO_SUBTITLES[scenarioType] ?? "The more you tell me, the more realistic this gets." : "The more you tell me, the more realistic this gets.";

    return (
        <div className="w-full min-h-full flex flex-col bg-[#f0f4f8] relative overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
            <main className="relative w-full max-w-[768px] mx-auto px-6 pt-6 pb-24">

                {/* Header */}
                <motion.div
                    className="text-center mb-8"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="text-2xl md:text-[28px] text-[#0f172b] mb-2" style={{ fontWeight: 300, lineHeight: 1.2 }}>
                        {title}
                    </h1>
                    <p className="text-[#45556c] text-sm md:text-base max-w-lg mx-auto">{subtitle}</p>
                </motion.div>

                {/* ── PRIMARY: Custom form (open by default) ── */}
                {fields.length > 0 && (
                    <motion.div
                        className="mb-6"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                    >
                        {fields.map((field, i) => {
                            const currentValue = values[field.label] ?? "";
                            return (
                                <div key={i} className="bg-white rounded-2xl border border-[#e2e8f0] p-5 shadow-sm">
                                    <div className="flex items-start justify-between mb-3">
                                        <label className="flex items-center gap-1.5">
                                            <span className="text-sm font-medium text-[#0f172b]">{field.label}</span>
                                            <span className="relative group cursor-help">
                                                <Info className="w-3.5 h-3.5 text-[#94a3b8] group-hover:text-[#0f172b] transition-colors" />
                                                <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-56 rounded-xl bg-[#0f172b] text-white text-xs px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg z-50" style={{ lineHeight: "1.45" }}>
                                                    {field.hint}
                                                    <span className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-[5px] border-x-transparent border-t-[5px] border-t-[#0f172b]" />
                                                </span>
                                            </span>
                                        </label>
                                    </div>
                                    <div className="flex items-center gap-1.5 mb-3 text-xs text-[#62748e]">
                                        <ClipboardPaste className="w-3 h-3 shrink-0" />
                                        <span>{field.pasteHint}</span>
                                    </div>
                                    <textarea
                                        value={currentValue}
                                        onChange={(e) => handleFieldChange(field.label, e.target.value)}
                                        placeholder={field.placeholder}
                                        className="w-full h-[110px] bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-4 text-[#0f172b] placeholder:text-[#94a3b8] focus:outline-none focus:border-[#0f172b] focus:bg-white transition-all resize-none"
                                        style={{ fontSize: "14px", lineHeight: "22px" }}
                                    />
                                    {currentValue.length > 0 && (
                                        <div className="flex justify-end mt-1">
                                            <span className={`text-[10px] ${currentValue.length > 4000 ? "text-amber-500" : "text-[#c4cdd5]"}`}>
                                                {currentValue.length} / 5,000 chars
                                            </span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </motion.div>
                )}

                {/* ── SECONDARY: Presets (collapsible) ── */}
                {presets.length > 0 && (
                    <motion.div
                        className="mb-8"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                    >
                        <button
                            onClick={() => setPresetsOpen((p) => !p)}
                            className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-[#e2e8f0] bg-white text-sm text-[#45556c] hover:border-[#94a3b8] transition-colors"
                        >
                            <span className="font-medium">Or pick a scenario</span>
                            {presetsOpen
                                ? <ChevronUp className="w-4 h-4 shrink-0" />
                                : <ChevronDown className="w-4 h-4 shrink-0" />
                            }
                        </button>

                        <AnimatePresence>
                            {presetsOpen && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.25 }}
                                    className="overflow-hidden"
                                >
                                    <div className="space-y-2 pt-3">
                                        {presets.map((preset, i) => (
                                            <motion.div
                                                key={preset.id}
                                                initial={{ opacity: 0, y: 8 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.25, delay: i * 0.06 }}
                                            >
                                                <PresetCard
                                                    preset={preset}
                                                    selected={selectedPreset?.id === preset.id}
                                                    onSelect={() => handleSelectPreset(preset)}
                                                />
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}

                {/* CTAs */}
                <motion.div
                    className="flex flex-col items-center gap-3"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.25 }}
                >
                    <button
                        onClick={handleContinue}
                        disabled={!canContinue}
                        className={`flex items-center gap-3 px-10 py-4 rounded-lg text-base shadow-lg transition-all ${
                            canContinue
                                ? "bg-[#0f172b] text-white hover:bg-[#1d293d] cursor-pointer"
                                : "bg-[#e2e8f0] text-[#94a3b8] cursor-not-allowed"
                        }`}
                        style={{ fontWeight: 500 }}
                    >
                        Let's build your strategy
                        <ArrowRight className="w-5 h-5" />
                    </button>

                    <button
                        onClick={() => onContinue({})}
                        className="text-sm text-[#94a3b8] hover:text-[#62748e] transition-colors py-1"
                    >
                        Skip — use a generic scenario
                    </button>

                    {onBack && (
                        <button
                            onClick={onBack}
                            className="flex items-center justify-center gap-1.5 py-2 text-sm text-[#62748e] hover:text-[#0f172b] transition-colors"
                            style={{ fontWeight: 500 }}
                        >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            Back
                        </button>
                    )}
                </motion.div>
            </main>
        </div>
    );
}

export { ContextScreen };

/** @deprecated Use ContextScreen instead */
export { ContextScreen as ExtraContextScreen };
