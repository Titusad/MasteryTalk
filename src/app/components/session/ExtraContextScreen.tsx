import { useState, useEffect } from "react";
import {
    ArrowRight,
    ArrowLeft,
    Info,
    ClipboardPaste,
    Sparkles,
    ChevronDown,
    Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { PastelBlobs, MiniFooter } from "../shared";
import type { ScenarioType } from "../../../services/types";
import { conversationService } from "../../../services";

interface ExtraContextField {
    label: string;
    placeholder: string;
    hint: string;
    pasteHint: string;
    suggestions: string[];
}

export function ExtraContextScreen({
    scenarioType,
    scenario,
    interlocutor,
    onContinue,
    onBack,
}: {
    scenarioType?: ScenarioType;
    scenario: string;
    interlocutor: string;
    onContinue: (extraData: Record<string, string>) => void;
    onBack?: () => void;
}) {
    const [fields, setFields] = useState<ExtraContextField[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [values, setValues] = useState<Record<string, string>>({});
    const [expandedHints, setExpandedHints] = useState<Record<number, boolean>>({});

    useEffect(() => {
        let cancelled = false;
        setIsLoading(true);
        if (!scenarioType) {
            setFields([]);
            setIsLoading(false);
            return;
        }

        conversationService.generateContextSuggestions(scenarioType, scenario, interlocutor)
            .then((data) => {
                if (!cancelled) {
                    setFields(data.fields);
                    setIsLoading(false);
                }
            })
            .catch((err) => {
                if (!cancelled) {
                    console.error("Failed to generate context suggestions", err);
                    setError(`Error: ${err.message || 'Unknown error'}. You can still proceed without suggestions.`);
                    setFields([]);
                    setIsLoading(false);
                }
            });

        return () => { cancelled = true; };
    }, [scenarioType]);

    const scenarioLabels: Record<string, string> = {
        sales: "sales pitch",
        interview: "interview",
        csuite: "executive presentation",
        negotiation: "negotiation",
        networking: "networking",
    };
    const label = scenarioType ? scenarioLabels[scenarioType] ?? "practice" : "practice";
    const hasContent = Object.values(values).some((v) => v.trim().length > 0);

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
                    <div className="inline-flex items-center gap-2 bg-[#eff6ff] border border-[#bfdbfe] rounded-full px-4 py-2 mb-6">
                        <Info className="w-4 h-4 text-[#3b82f6]" />
                        <span className="text-sm text-[#1d4ed8]" style={{ fontWeight: 500 }}>
                            Step 2 of 3 — Context
                        </span>
                    </div>
                    <h1
                        className="text-3xl md:text-[40px] text-[#0f172b] mb-3"
                        style={{ fontWeight: 300, lineHeight: 1.2 }}
                    >
                        Add context for your {label}
                    </h1>
                    <p className="text-[#45556c] text-base md:text-lg max-w-lg mx-auto">
                        The more detail you share, the more realistic your {label} will be.
                        {" "}<span className="text-[#94a3b8]">Just paste or type — no file uploads needed.</span>
                    </p>
                </motion.div>

                <AnimatePresence mode="wait">
                    {isLoading ? (
                        <motion.div
                            key="loading"
                            className="flex flex-col items-center justify-center py-16 bg-white rounded-3xl shadow-sm border border-[#e2e8f0] mb-10"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                        >
                            <Loader2 className="w-8 h-8 mb-4 animate-spin text-[#0f172b]" />
                            <p className="text-[#62748e]" style={{ fontWeight: 500 }}>
                                Generating tailored context fields...
                            </p>
                        </motion.div>
                    ) : error ? (
                        <motion.div
                            key="error"
                            className="p-6 bg-red-50 text-red-600 rounded-3xl text-center mb-10"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            <p>{error}</p>
                        </motion.div>
                    ) : fields.length > 0 ? (
                        <motion.div
                            key="content"
                            className="space-y-8 mb-10"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.1 }}
                        >
                            {fields.map((field, i) => {
                                const isExpanded = expandedHints[i] ?? false;
                                const currentValue = values[field.label] ?? "";

                                return (
                                    <div
                                        key={i}
                                        className="bg-white rounded-2xl border border-[#e2e8f0] p-5 shadow-sm"
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
                                            <span className="text-[10px] text-[#7c3aed] bg-[#f5f3ff] rounded-full px-2.5 py-0.5" style={{ fontWeight: 500 }}>
                                                Recommended
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
                                    </div>
                                );
                            })}
                        </motion.div>
                    ) : null}
                </AnimatePresence>

                <motion.div
                    className="flex flex-col items-center justify-center"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                >
                    <button
                        onClick={() => onContinue(values)}
                        disabled={!hasContent}
                        className={`flex items-center gap-3 px-10 py-5 rounded-full text-xl shadow-[0px_10px_15px_rgba(0,0,0,0.1)] transition-all ${hasContent
                            ? "bg-[#0f172b] text-white hover:bg-[#1d293d]"
                            : "bg-[#e2e8f0] text-[#94a3b8] cursor-not-allowed"
                            }`}
                        style={{ fontWeight: 500 }}
                    >
                        Continue
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
