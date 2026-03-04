import { useState } from "react";
import {
    ArrowRight,
    ArrowLeft,
    Check,
    Info,
    ClipboardPaste,
    Sparkles,
    ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { PastelBlobs, MiniFooter } from "../shared";
import type { ScenarioType } from "../../../services/types";

interface ExtraContextField {
    label: string;
    placeholder: string;
    hint: string;
    pasteHint: string;
    suggestions: string[];
}

const EXTRA_CONTEXT_FIELDS: Record<string, ExtraContextField[]> = {
    interview: [
        {
            label: "Job Description",
            placeholder: "Paste the job description here — or just the key requirements and responsibilities...",
            hint: "The AI will tailor interview questions to the specific role, seniority level, and required skills",
            pasteHint: "Tip: Copy-paste directly from LinkedIn or the company careers page",
            suggestions: [
                "Senior PM role, B2B SaaS, 5+ years experience required",
                "Must lead cross-functional teams of 8-12 people",
                "Key KPIs: retention, NPS, quarterly revenue targets",
                "Reports to VP of Product, US-based company",
            ],
        },
        {
            label: "Your key experience",
            placeholder: "Your 3 most relevant roles, key achievements, and skills that match this position...",
            hint: "The AI will help you build STAR-method answers using your real career history",
            pasteHint: "No need to paste your full CV — just the highlights relevant to this role",
            suggestions: [
                "5 years as PM at a SaaS startup, grew ARR 3x",
                "Led a team of 6 engineers shipping to US clients",
                "Fluent in Spanish, professional English (B2+)",
                "MBA from [university], certified Scrum Master",
            ],
        },
    ],
    sales: [
        {
            label: "Prospect / company information",
            placeholder: "Company name, industry, size, decision-makers, known pain points or priorities...",
            hint: "The more specific you are, the more realistic the objections and pushback will be",
            pasteHint: "Check their LinkedIn, Crunchbase, or recent press releases for context",
            suggestions: [
                "Mid-market fintech, 200 employees, Series B",
                "Currently using a competitor (Salesforce/HubSpot)",
                "Pain point: manual reporting taking 10+ hours/week",
                "Decision-maker is the CFO, budget cycle ends Q4",
            ],
        },
        {
            label: "Your deck or talking points",
            placeholder: "The main value propositions, pricing structure, case studies, or differentiators from your pitch...",
            hint: "The AI will align the conversation with your actual material so you practice what you'll really say",
            pasteHint: "Paste your slide titles and key bullet points — no need for the full deck",
            suggestions: [
                "3 main slides: Problem → Solution → ROI",
                "Key differentiator: 40% faster implementation",
                "Case study: similar client saved $200K/year",
                "Pricing: $15K/year, includes onboarding",
            ],
        },
    ],
    csuite: [],
    negotiation: [],
    networking: [],
};

export function ExtraContextScreen({
    scenarioType,
    onContinue,
    onSkip,
    onBack,
}: {
    scenarioType?: ScenarioType;
    onContinue: (extraData: Record<string, string>) => void;
    onSkip: () => void;
    onBack?: () => void;
}) {
    const fields = scenarioType ? EXTRA_CONTEXT_FIELDS[scenarioType] ?? [] : [];
    const [values, setValues] = useState<Record<string, string>>({});
    const [expandedHints, setExpandedHints] = useState<Record<number, boolean>>({});

    const scenarioLabels: Record<string, string> = {
        sales: "sales pitch",
        interview: "interview",
        csuite: "executive presentation",
        negotiation: "negotiation",
        networking: "networking",
    };
    const label = scenarioType ? scenarioLabels[scenarioType] ?? "practice" : "practice";

    const handleSuggestionClick = (fieldLabel: string, suggestion: string) => {
        setValues((prev) => {
            const current = prev[fieldLabel] ?? "";
            const separator = current.trim() ? "\n" : "";
            return { ...prev, [fieldLabel]: current + separator + suggestion };
        });
    };

    return (
        <div
            className="w-full min-h-full flex flex-col bg-[#f0f4f8] relative overflow-hidden"
            style={{ fontFamily: "'Inter', sans-serif" }}
        >
            <PastelBlobs />

            <main className="relative w-full max-w-[768px] mx-auto px-6 pt-12 pb-20">
                <motion.div
                    className="text-center mb-10"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="inline-flex items-center gap-2 bg-[#f0fdf4] border border-[#b9f8cf] rounded-full px-4 py-2 mb-6">
                        <Check className="w-4 h-4 text-[#00c950]" />
                        <span className="text-sm text-[#15803d]" style={{ fontWeight: 500 }}>
                            Your 2 value pillars are ready
                        </span>
                    </div>
                    <h1
                        className="text-3xl md:text-[40px] text-[#0f172b] mb-3"
                        style={{ fontWeight: 300, lineHeight: 1.2 }}
                    >
                        Want to add more context?
                    </h1>
                    <p className="text-[#45556c] text-base md:text-lg max-w-lg mx-auto">
                        This is optional — but the more detail you share, the more realistic your {label} will be.
                        {" "}<span className="text-[#94a3b8]">Just paste or type — no file uploads needed.</span>
                    </p>
                </motion.div>

                {fields.length > 0 && (
                    <motion.div
                        className="space-y-8 mb-10"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                    >
                        {fields.map((field, i) => {
                            const isExpanded = expandedHints[i] ?? false;
                            const currentValue = values[field.label] ?? "";

                            return (
                                <motion.div
                                    key={i}
                                    className="bg-white rounded-2xl border border-[#e2e8f0] p-5 shadow-sm"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: 0.1 + i * 0.08 }}
                                >
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
                                        <span className="text-[10px] text-[#94a3b8] bg-[#f8fafc] rounded-full px-2.5 py-0.5" style={{ fontWeight: 500 }}>
                                            Optional
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-1.5 mb-3 text-xs text-[#62748e]">
                                        <ClipboardPaste className="w-3 h-3 shrink-0" />
                                        <span>{field.pasteHint}</span>
                                    </div>

                                    <textarea
                                        value={currentValue}
                                        onChange={(e) =>
                                            setValues((prev) => ({ ...prev, [field.label]: e.target.value }))
                                        }
                                        placeholder={field.placeholder}
                                        className="w-full h-[110px] bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-4 text-[#0f172b] placeholder:text-[#94a3b8] focus:outline-none focus:border-[#0f172b] focus:bg-white transition-all resize-none"
                                        style={{ fontSize: "14px", lineHeight: "22px" }}
                                    />

                                    {currentValue.length > 0 && (
                                        <div className="flex justify-end mt-1">
                                            <span className={`text-[10px] ${currentValue.length > 1500 ? "text-amber-500" : "text-[#c4cdd5]"}`}>
                                                {currentValue.length} / 2,000 chars
                                            </span>
                                        </div>
                                    )}

                                    <div className="mt-3">
                                        <button
                                            onClick={() => setExpandedHints((prev) => ({ ...prev, [i]: !isExpanded }))}
                                            className="flex items-center gap-1.5 text-xs text-[#6366f1] hover:text-[#4f46e5] transition-colors group"
                                            style={{ fontWeight: 500 }}
                                        >
                                            <Sparkles className="w-3 h-3" />
                                            Not sure what to write? Try these examples
                                            <motion.span
                                                animate={{ rotate: isExpanded ? 180 : 0 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <ChevronDown className="w-3 h-3" />
                                            </motion.span>
                                        </button>

                                        <AnimatePresence>
                                            {isExpanded && (
                                                <motion.div
                                                    className="mt-2.5 flex flex-wrap gap-2"
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: "auto" }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    transition={{ duration: 0.25 }}
                                                >
                                                    {field.suggestions.map((suggestion, si) => (
                                                        <motion.button
                                                            key={si}
                                                            onClick={() => handleSuggestionClick(field.label, suggestion)}
                                                            className="text-xs bg-[#f0f4ff] hover:bg-[#e0e7ff] border border-[#c7d2fe]/50 text-[#3730a3] rounded-lg px-3 py-1.5 transition-all hover:shadow-sm text-left"
                                                            style={{ fontWeight: 450 }}
                                                            initial={{ opacity: 0, scale: 0.95 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            transition={{ duration: 0.2, delay: si * 0.05 }}
                                                            whileTap={{ scale: 0.97 }}
                                                        >
                                                            + {suggestion}
                                                        </motion.button>
                                                    ))}
                                                    <p className="w-full text-[10px] text-[#94a3b8] mt-1 italic">
                                                        Click to add — then edit to match your real situation
                                                    </p>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
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
                        onClick={() => onContinue(values)}
                        className="flex items-center gap-3 px-10 py-5 rounded-full text-xl bg-[#0f172b] text-white shadow-[0px_10px_15px_rgba(0,0,0,0.1)] hover:bg-[#1d293d] transition-all"
                        style={{ fontWeight: 500 }}
                    >
                        {Object.values(values).some((v) => v.trim()) ? "Continue with context" : "Continue without context"}
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
