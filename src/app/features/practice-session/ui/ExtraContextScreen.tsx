import { useState, useRef, useEffect } from "react";
import {
    FileText,
    ArrowRight,
    ArrowLeft,
    CheckCircle2,
    Info,
    ClipboardPaste,
    Upload,
    X,
    Loader2,
} from "lucide-react";
import { motion } from "motion/react";
import { PastelBlobs, MiniFooter } from "../shared";
import { projectId } from "../../../../utils/supabase/info";
import { getAuthToken } from "@/services/supabase";
import type { ScenarioType, OnboardingProfile } from "../../../services/types";
import { SessionProgressBar } from "../SessionProgressBar";

/* ═══════════════════════════════════════════════════════════
   EXTRA CONTEXT FIELD DATA
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
   EXTRA CONTEXT SCREEN
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
    /** User profile — for persisting cvSummary / cvFileName */
    userProfile?: OnboardingProfile | null;
    onProfileUpdate?: (profile: OnboardingProfile) => void;
}) {
    const fields = scenarioType ? EXTRA_CONTEXT_FIELDS[scenarioType] ?? [] : [];
    const storageKey = `influ_extra_ctx_${scenarioType || "default"}`;

    const [values, setValues] = useState<Record<string, string>>(() => {
        if (typeof window !== "undefined") {
            try {
                const saved = sessionStorage.getItem(storageKey);
                if (saved) return JSON.parse(saved).values || {};
            } catch (e) {}
        }
        return {};
    });

    /* ── PDF Upload state (interview: CV, sales: deck) ── */
    const isInterview = scenarioType === "interview";
    const isSales = scenarioType === "sales";
    const showUpload = isInterview || isSales;
    const [cvFile, setCvFile] = useState<File | null>(null);

    const initialCvSummary = (() => {
        if (typeof window !== "undefined") {
            try {
                const saved = sessionStorage.getItem(storageKey);
                if (saved && JSON.parse(saved).cvSummary) return JSON.parse(saved).cvSummary;
            } catch (e) {}
        }
        return isInterview ? (userProfile?.cvSummary ?? "") : isSales ? (userProfile?.deckSummary ?? "") : "";
    })();
    
    const initialCvFileName = (() => {
        if (typeof window !== "undefined") {
            try {
                const saved = sessionStorage.getItem(storageKey);
                if (saved && JSON.parse(saved).cvFileName) return JSON.parse(saved).cvFileName;
            } catch (e) {}
        }
        return isInterview ? (userProfile?.cvFileName ?? "") : isSales ? (userProfile?.deckFileName ?? "") : "";
    })();

    const [cvSummary, setCvSummary] = useState<string>(initialCvSummary);
    const [cvFileName, setCvFileName] = useState<string>(initialCvFileName);
    const [cvStatus, setCvStatus] = useState<"idle" | "uploading" | "done" | "error">(initialCvSummary ? "done" : "idle");
    const [cvError, setCvError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    /* ── Manual experience fallback (no PDF) ── */
    const [manualExperience, setManualExperience] = useState<string>(() => {
        if (typeof window !== "undefined") {
            try {
                const saved = sessionStorage.getItem(storageKey);
                if (saved && JSON.parse(saved).manualExperience) return JSON.parse(saved).manualExperience;
            } catch (e) {}
        }
        return "";
    });

    // Auto-save to sessionStorage
    useEffect(() => {
        if (typeof window !== "undefined") {
            sessionStorage.setItem(storageKey, JSON.stringify({
                values,
                cvSummary,
                cvFileName,
                manualExperience
            }));
        }
    }, [values, cvSummary, cvFileName, manualExperience, storageKey]);

    const hasContent = Object.values(values).some((v) => v.trim().length > 0) || cvSummary.length > 0 || manualExperience.trim().length > 0;

    const scenarioLabels: Record<string, string> = {
        sales: "sales pitch",
        interview: "interview",
        csuite: "executive presentation",
        negotiation: "negotiation",
        networking: "networking",
    };
    const label = scenarioType ? scenarioLabels[scenarioType] ?? "practice" : "practice";

    /** Process uploaded CV via POST /process-cv (GPT-4o extraction) */
    const processCv = async (file: File) => {
        setCvFile(file);
        setCvFileName(file.name);
        setCvStatus("uploading");
        setCvError(null);

        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("type", isSales ? "deck" : "cv");

            const url = `https://${projectId}.supabase.co/functions/v1/make-server-08b8658d/process-cv`;
            const token = await getAuthToken();
            const res = await fetch(url, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });

            if (!res.ok) {
                const errText = await res.text();
                throw new Error(`CV processing error ${res.status}: ${errText}`);
            }

            const data = await res.json();
            const summary = data.summary || data.cvSummary || "";
            setCvSummary(summary);
            setCvStatus("done");

            // Persist to profile — scoped per scenario
            if (onProfileUpdate && summary) {
                const profilePatch = isInterview
                    ? { cvSummary: summary, cvFileName: file.name }
                    : { deckSummary: summary, deckFileName: file.name };
                onProfileUpdate({
                    ...(userProfile || { industry: "", position: "", seniority: "" }),
                    ...profilePatch,
                });
            }
        } catch (err: any) {
            console.error("[ExtraContextScreen] CV processing failed:", err);
            setCvStatus("error");
            setCvError(err.message || "Failed to process CV");
        }
    };

    /** Drag & drop handlers */
    const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file && file.type === "application/pdf") {
            processCv(file);
        } else {
            setCvError("Please upload a PDF file");
        }
    };
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) processCv(file);
    };
    const clearCv = () => {
        setCvFile(null);
        setCvFileName("");
        setCvSummary("");
        setCvStatus("idle");
        setCvError(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    /** Build final data including cvSummary when submitting */
    const handleContinue = () => {
        const finalData = { ...values };
        if (cvSummary) {
            finalData["cvSummary"] = cvSummary;
        }
        if (manualExperience.trim()) {
            finalData["manualExperience"] = manualExperience.trim();
        }
        onContinue(finalData);
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
                        Add context for your {label}
                    </h1>
                    <p className="text-[#45556c] text-sm md:text-base max-w-lg mx-auto">
                        {isInterview
                            ? "Upload your CV or paste the job description so the AI can create a realistic, personalized simulation."
                            : isSales
                                ? "Upload your sales deck or paste key talking points so the AI can challenge you with realistic buyer objections."
                                : "Fill in at least one field so the AI can create a realistic, personalized simulation."}
                    </p>
                </motion.div>

                {/* ═══ PDF UPLOAD ZONE (interview: CV, sales: deck) ═══ */}
                {showUpload && (
                    <motion.div
                        className="mb-8"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.05 }}
                    >
                        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5 shadow-sm">
                            {/* Header */}
                            <div className="flex items-start justify-between mb-3">
                                <label className="flex items-center gap-1.5">
                                    <span className="text-sm text-[#0f172b]" style={{ fontWeight: 600 }}>
                                        {isInterview ? "Upload your CV / Resume" : "Upload your Sales Deck"}
                                    </span>
                                    <span className="relative group cursor-help">
                                        <Info className="w-3.5 h-3.5 text-[#94a3b8] group-hover:text-[#0f172b] transition-colors" />
                                        <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 rounded-xl bg-[#0f172b] text-white text-xs px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg z-50" style={{ lineHeight: "1.45" }}>
                                            {isInterview
                                                ? "Your CV is processed by AI to extract key experience. The original file is not stored — only the summary."
                                                : "Your deck is processed by AI to extract key points. The original file is not stored — only the summary."}
                                            <span className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-[5px] border-x-transparent border-t-[5px] border-t-[#0f172b]" />
                                        </span>
                                    </span>
                                </label>
                            </div>

                            {/* Hidden file input */}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".pdf"
                                onChange={handleFileSelect}
                                className="hidden"
                            />

                            {/* Drag & drop zone or status */}
                            {cvStatus === "idle" && (
                                <div
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`w-full border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${isDragging
                                            ? "border-[#6366f1] bg-[#eef2ff]"
                                            : "border-[#e2e8f0] bg-[#f8fafc] hover:border-[#c7d2e0] hover:bg-[#f1f5f9]"
                                        }`}
                                >
                                    <Upload className={`w-8 h-8 mx-auto mb-3 ${isDragging ? "text-[#6366f1]" : "text-[#94a3b8]"}`} />
                                    <p className="text-sm text-[#0f172b]" style={{ fontWeight: 500 }}>
                                        {isDragging ? "Drop your PDF here" : isInterview ? "Drag & drop your CV here" : "Drag & drop your deck here"}
                                    </p>
                                    <p className="text-xs text-[#62748e] mt-1">
                                        or <span className="text-[#6366f1] underline">click to browse</span> — PDF only
                                    </p>
                                </div>
                            )}

                            {cvStatus === "uploading" && (
                                <div className="w-full border border-[#e2e8f0] rounded-xl p-8 text-center bg-[#f8fafc]">
                                    <Loader2 className="w-8 h-8 mx-auto mb-3 text-[#6366f1] animate-spin" />
                                    <p className="text-sm text-[#0f172b]" style={{ fontWeight: 500 }}>
                                        {isInterview ? "Processing your CV with AI..." : "Processing your deck with AI..."}
                                    </p>
                                    <p className="text-xs text-[#62748e] mt-1">
                                        {isInterview ? "Extracting key experience, skills, and career highlights" : "Extracting value propositions, pricing, and key talking points"}
                                    </p>
                                </div>
                            )}

                            {cvStatus === "done" && cvSummary && (
                                <div className="w-full border border-[#bbf7d0] rounded-xl p-5 bg-[#f0fdf4]">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-[#16a34a]" />
                                            <span className="text-sm text-[#15803d]" style={{ fontWeight: 600 }}>{isInterview ? "CV processed successfully" : "Deck processed successfully"}</span>
                                        </div>
                                        <button
                                            onClick={clearCv}
                                            className="text-xs text-[#62748e] hover:text-[#0f172b] flex items-center gap-1 transition-colors"
                                        >
                                            <X className="w-3 h-3" />
                                            Remove
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <FileText className="w-3.5 h-3.5 text-[#45556c]" />
                                        <span className="text-xs text-[#45556c]" style={{ fontWeight: 500 }}>{cvFileName}</span>
                                    </div>
                                    <div className="bg-white border border-[#e2e8f0] rounded-lg p-3 max-h-[160px] overflow-y-auto">
                                        <p className="text-xs text-[#314158] leading-relaxed whitespace-pre-wrap">{cvSummary}</p>
                                    </div>
                                    {/* CV Consent Checkbox (interview only) */}
                                    {isInterview && (
                                    <label className="flex items-start gap-2.5 mt-4 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            checked={userProfile?.cvConsentGiven || false}
                                            onChange={(e) => {
                                                if (onProfileUpdate) {
                                                    onProfileUpdate({
                                                        ...(userProfile || { industry: "", position: "", seniority: "" }),
                                                        cvConsentGiven: e.target.checked,
                                                    });
                                                }
                                            }}
                                            className="mt-0.5 w-4 h-4 rounded border-[#d1d5db] text-[#6366f1] focus:ring-[#6366f1] accent-[#6366f1] cursor-pointer"
                                        />
                                        <span className="text-xs text-[#45556c] leading-relaxed group-hover:text-[#0f172b] transition-colors">
                                            I authorize receiving job offers based on my professional profile.
                                        </span>
                                    </label>
                                    )}
                                </div>
                            )}

                            {cvStatus === "error" && (
                                <div className="w-full border border-[#fecaca] rounded-xl p-5 bg-[#fef2f2]">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <X className="w-4 h-4 text-[#dc2626]" />
                                            <span className="text-sm text-[#dc2626]" style={{ fontWeight: 600 }}>Processing failed</span>
                                        </div>
                                        <button
                                            onClick={clearCv}
                                            className="text-xs text-[#62748e] hover:text-[#0f172b] transition-colors"
                                        >
                                            Try again
                                        </button>
                                    </div>
                                    {cvError && <p className="text-xs text-[#991b1b]">{cvError}</p>}
                                </div>
                            )}

                            {/* ── Manual experience fallback ── */}
                            {cvStatus !== "done" && (
                                <>
                                    <div className="flex items-center gap-3 my-4">
                                        <div className="flex-1 h-px bg-[#e2e8f0]" />
                                        <span className="text-xs text-[#94a3b8]" style={{ fontWeight: 500 }}>{isInterview ? "or paste your experience" : "or paste your talking points"}</span>
                                        <div className="flex-1 h-px bg-[#e2e8f0]" />
                                    </div>
                                    <div className="flex items-center gap-1.5 mb-3 text-xs text-[#62748e]">
                                        <ClipboardPaste className="w-3 h-3 shrink-0" />
                                        <span>{isInterview ? "Copy-paste key highlights from your CV or LinkedIn profile" : "Copy-paste key bullet points from your pitch deck"}</span>
                                    </div>
                                    <textarea
                                        value={manualExperience}
                                        onChange={(e) => setManualExperience(e.target.value)}
                                        placeholder={isInterview
                                            ? "e.g. 8 years in product management, led a team of 12 at a Series B fintech, launched 3 products with $2M+ ARR..."
                                            : "e.g. Our SaaS reduces onboarding time by 60%, pricing starts at $499/mo, 200+ enterprise customers including Stripe and Shopify..."}
                                        className="w-full h-[110px] bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-4 text-[#0f172b] placeholder:text-[#94a3b8] focus:outline-none focus:border-[#0f172b] focus:bg-white transition-all resize-none"
                                        style={{ fontSize: "14px", lineHeight: "22px" }}
                                    />
                                    {manualExperience.length > 0 && (
                                        <div className="flex justify-end mt-1">
                                            <span className={`text-[10px] ${manualExperience.length > 4000 ? "text-amber-500" : "text-[#c4cdd5]"}`}>
                                                {manualExperience.length} / 5,000 chars
                                            </span>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>


                    </motion.div>
                )}

                {/* ═══ TEXT FIELDS ═══ */}
                {fields.length > 0 && (
                    <motion.div
                        className="space-y-8 mb-10"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: isInterview ? 0.15 : 0.1 }}
                    >
                        {fields.map((field, i) => {
                            const currentValue = values[field.label] ?? "";

                            return (
                                <motion.div
                                    key={i}
                                    className="bg-white rounded-2xl border border-[#e2e8f0] p-5 shadow-sm"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: (isInterview ? 0.15 : 0.1) + i * 0.08 }}
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
                        disabled={!hasContent || cvStatus === "uploading"}
                        className={`flex items-center gap-3 px-10 py-5 rounded-full text-xl shadow-[0px_10px_15px_rgba(0,0,0,0.1)] transition-all ${hasContent && cvStatus !== "uploading"
                                ? "bg-[#0f172b] text-white hover:bg-[#1d293d] cursor-pointer"
                                : "bg-[#e2e8f0] text-[#94a3b8] cursor-not-allowed"
                            }`}
                        style={{ fontWeight: 500 }}
                    >
                        {cvStatus === "uploading" ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                {isSales ? "Processing Deck..." : "Processing CV..."}
                            </>
                        ) : (
                            <>
                                Continue
                                <ArrowRight className="w-6 h-6" />
                            </>
                        )}
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