import { useState, useEffect } from "react";
import {
    ArrowRight,
    ArrowLeft,
    Info,
    ClipboardPaste,
    Loader2,
} from "lucide-react";
import { motion } from "motion/react";
import { PastelBlobs, MiniFooter } from "@/app/components/shared";
import type { ScenarioType, OnboardingProfile } from "@/services/types";
import { SessionProgressBar } from "@/shared/ui/SessionProgressBar";

/* ═══════════════════════════════════════════════════════════
   EXTRA CONTEXT FIELD DATA — "The Opportunity"
   
   After CV/About You is complete, this screen captures the
   specific job/prospect context. Interview = JD, Sales = prospect.
   ═══════════════════════════════════════════════════════════ */

interface ExtraContextField {
    label: string;
    placeholder: string;
    hint: string;
    pasteHint: string;
    suggestions: string[];
}

const EXTRA_CONTEXT_FIELDS: Record<
    string,
    ExtraContextField[]
> = {
    interview: [
        {
            label: "Job Description",
            placeholder:
                "Paste the job description here — or just the key requirements and responsibilities...",
            hint: "The AI will tailor interview questions to the specific role, seniority level, and required skills",
            pasteHint:
                "Tip: Copy-paste directly from LinkedIn or the company careers page",
            suggestions: [
                "Senior PM role, B2B SaaS, 5+ years experience required",
                "Must lead cross-functional teams of 8-12 people",
                "Key KPIs: retention, NPS, quarterly revenue targets",
                "Reports to VP of Product, US-based company",
            ],
        },
    ],
    sales: [
        {
            label: "Prospect / company information",
            placeholder:
                "Company name, industry, size, decision-makers, known pain points or priorities...",
            hint: "The more specific you are, the more realistic the objections and pushback will be",
            pasteHint:
                "Check their LinkedIn, Crunchbase, or recent press releases for context",
            suggestions: [
                "Mid-market fintech, 200 employees, Series B",
                "Currently using a competitor (Salesforce/HubSpot)",
                "Pain point: manual reporting taking 10+ hours/week",
                "Decision-maker is the CFO, budget cycle ends Q4",
            ],
        },
    ],
    csuite: [],
    negotiation: [],
    networking: [],
};

/* ═══════════════════════════════════════════════════════════
   EXTRA CONTEXT SCREEN — "The Opportunity"
   
   Now focused solely on capturing the job/prospect context.
   CV upload has been extracted to CVUploadScreen.
   ═══════════════════════════════════════════════════════════ */

function ExtraContextScreen({
    scenarioType,
    onContinue,
    onBack,
    userProfile,
    onProfileUpdate,
}: {
    scenarioType?: ScenarioType;
    onContinue: (extraData: Record<string, string>) => void;
    onBack?: () => void;
    /** User profile — for backward compat */
    userProfile?: OnboardingProfile | null;
    onProfileUpdate?: (profile: OnboardingProfile) => void;
}) {
    const fields = scenarioType ? EXTRA_CONTEXT_FIELDS[scenarioType] ?? [] : [];
    const storageKey = `influ_extra_ctx_${scenarioType || "default"}`;
    const isInterview = scenarioType === "interview";
    const isSales = scenarioType === "sales";

    const [values, setValues] = useState<Record<string, string>>(() => {
        if (typeof window !== "undefined") {
            try {
                const saved = sessionStorage.getItem(storageKey);
                if (saved) return JSON.parse(saved).values || {};
            } catch (e) {}
        }
        return {};
    });

    // Auto-save to sessionStorage
    useEffect(() => {
        if (typeof window !== "undefined") {
            sessionStorage.setItem(storageKey, JSON.stringify({ values }));
        }
    }, [values, storageKey]);

    const hasContent = Object.values(values).some((v) => v.trim().length > 0);

    const scenarioLabels: Record<string, string> = {
        sales: "sales pitch",
        interview: "interview",
        csuite: "executive presentation",
        negotiation: "negotiation",
        networking: "networking",
    };
    const label = scenarioType ? scenarioLabels[scenarioType] ?? "practice" : "practice";

    const handleContinue = () => {
        onContinue(values);
    };

    return (
        <div
            className="w-full min-h-full flex flex-col bg-[#f0f4f8] relative overflow-hidden"
            style={{ fontFamily: "'Inter', sans-serif" }}
        >
            <PastelBlobs />

            <main className="relative w-full max-w-[768px] mx-auto px-6 pt-6 pb-20">
                <div className="w-full mb-5">
                    <SessionProgressBar currentStep="extra-context" />
                </div>
                <motion.div
                    className="text-center mb-10"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1
                        className="text-2xl md:text-[28px] text-[#0f172b] mb-2"
                        style={{ fontWeight: 300, lineHeight: 1.2 }}
                    >
                        {isInterview ? "The Opportunity" : isSales ? "The Prospect" : "Context"}
                    </h1>
                    <p className="text-[#45556c] text-sm md:text-base max-w-lg mx-auto">
                        {isInterview
                            ? "Paste the job description — I'll build questions that match what they're actually looking for."
                            : isSales
                                ? "Tell me about your prospect. The more I know, the harder I'll push back — like a real buyer."
                                : "The more you tell me, the more realistic this gets."}
                    </p>
                </motion.div>

                {/* ═══ TEXT FIELDS ═══ */}
                {fields.length > 0 && (
                    <motion.div
                        className="space-y-8 mb-10"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                    >
                        {fields.map((field, i) => {
                            const currentValue = values[field.label] ?? "";

                            return (
                                <motion.div
                                    key={i}
                                    className="bg-white rounded-2xl border border-[#e2e8f0] p-5 shadow-sm"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: 0.1 + i * 0.08 }}
                                >
                                    {/* Field header */}
                                    <div className="flex items-start justify-between mb-3">
                                        <label className="flex items-center gap-1.5">
                                            <span className="text-sm text-[#0f172b]" style={{ fontWeight: 600 }}>
                                                {field.label}
                                            </span>
                                            <span className="relative group cursor-help">
                                                <Info className="w-3.5 h-3.5 text-[#94a3b8] group-hover:text-[#0f172b] transition-colors" />
                                                <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-56 rounded-xl bg-[#0f172b] text-white text-xs px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg z-50" style={{ lineHeight: "1.45" }}>
                                                    {field.hint}
                                                    <span className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-[5px] border-x-transparent border-t-[5px] border-t-[#0f172b]" />
                                                </span>
                                            </span>
                                        </label>
                                    </div>

                                    {/* Paste hint */}
                                    <div className="flex items-center gap-1.5 mb-3 text-xs text-[#62748e]">
                                        <ClipboardPaste className="w-3 h-3 shrink-0" />
                                        <span>{field.pasteHint}</span>
                                    </div>

                                    {/* Textarea */}
                                    <textarea
                                        value={currentValue}
                                        onChange={(e) =>
                                            setValues((prev) => ({ ...prev, [field.label]: e.target.value }))
                                        }
                                        placeholder={field.placeholder}
                                        className="w-full h-[110px] bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-4 text-[#0f172b] placeholder:text-[#94a3b8] focus:outline-none focus:border-[#0f172b] focus:bg-white transition-all resize-none"
                                        style={{ fontSize: "14px", lineHeight: "22px" }}
                                    />

                                    {/* Character count */}
                                    {currentValue.length > 0 && (
                                        <div className="flex justify-end mt-1">
                                            <span className={`text-[10px] ${currentValue.length > 4000 ? "text-amber-500" : "text-[#c4cdd5]"}`}>
                                                {currentValue.length} / 5,000 chars
                                            </span>
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </motion.div>
                )}

                <motion.div
                    className="flex flex-col items-center justify-center"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                >
                    <button
                        onClick={handleContinue}
                        disabled={!hasContent}
                        className={`flex items-center gap-3 px-10 py-5 rounded-full text-xl shadow-[0px_10px_15px_rgba(0,0,0,0.1)] transition-all ${hasContent
                                ? "bg-[#0f172b] text-white hover:bg-[#1d293d] cursor-pointer"
                                : "bg-[#e2e8f0] text-[#94a3b8] cursor-not-allowed"
                            }`}
                        style={{ fontWeight: 500 }}
                    >
                        Let's build your strategy
                        <ArrowRight className="w-6 h-6" />
                    </button>

                    {onBack && (
                        <button
                            onClick={onBack}
                            className="mt-4 flex items-center justify-center gap-1.5 py-2.5 text-sm text-[#62748e] hover:text-[#0f172b] transition-colors"
                            style={{ fontWeight: 500 }}
                        >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            Back
                        </button>
                    )}
                </motion.div>
            </main>
            <MiniFooter />
        </div>
    );
}

export { ExtraContextScreen };