import { SUPABASE_URL } from "@/services/supabase";
import { useState, useRef, useEffect } from "react";
import {
    FileText,
    ArrowRight,
    ArrowLeft,
    CheckCircle2,
    Info,
    Upload,
    X,
    Loader2,
    ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { PastelBlobs, MiniFooter } from "@/shared/ui";
import { projectId } from "@/../utils/supabase/info";
import { getAuthToken } from "@/services/supabase";
import type { ScenarioType, OnboardingProfile } from "@/services/types";
import { SessionProgressBar } from "@/widgets/SessionProgressBar";

/* ═══════════════════════════════════════════════════════════
   CV UPLOAD SCREEN — "About You"
   
   Focused single-action screen for uploading a CV (interview)
   or sales deck (sales). Extracted from ExtraContextScreen
   to reduce cognitive load.
   ═══════════════════════════════════════════════════════════ */

interface CVUploadScreenProps {
    scenarioType?: ScenarioType;
    onContinue: (cvData: { cvSummary?: string; manualExperience?: string }) => void;
    onBack?: () => void;
    userProfile?: OnboardingProfile | null;
    onProfileUpdate?: (profile: OnboardingProfile) => void;
}

function CVUploadScreen({
    scenarioType,
    onContinue,
    onBack,
    userProfile,
    onProfileUpdate,
}: CVUploadScreenProps) {
    const isInterview = scenarioType === "interview";
    const isSales = scenarioType === "sales";
    const isPresentation = scenarioType === "presentation";
    const hasDocUpload = isInterview || isSales || isPresentation;
    const storageKey = `influ_cv_upload_${scenarioType || "default"}`;

    /* ── Dynamic copy per scenario type ── */
    const copyMap: Record<string, { heading: string; subtitle: string; uploadLabel: string; uploadDrag: string; uploadReading: string; uploadDone: string; manualFallback: string; manualPlaceholder: string }> = {
        interview: {
            heading: "About You",
            subtitle: "Drop your CV — I'll pull out the highlights that matter for this interview.",
            uploadLabel: "Drop your CV here",
            uploadDrag: "Drag & drop your CV here",
            uploadReading: "Reading your CV...",
            uploadDone: "Got it — your CV is loaded ✓",
            manualFallback: "Don't have your CV? Type a quick summary",
            manualPlaceholder: "e.g. 8 years in product management, led a team of 12 at a Series B fintech, launched 3 products with $2M+ ARR...",
        },
        sales: {
            heading: "Your Pitch Material",
            subtitle: "Share your deck — I'll extract the angles that'll resonate with your prospect.",
            uploadLabel: "Drop your deck here",
            uploadDrag: "Drag & drop your deck here",
            uploadReading: "Going through your deck...",
            uploadDone: "Got it — your deck is loaded ✓",
            manualFallback: "Don't have your deck? Type your key points",
            manualPlaceholder: "e.g. Our SaaS reduces onboarding time by 60%, pricing starts at $499/mo, 200+ enterprise customers including Stripe and Shopify...",
        },
        presentation: {
            heading: "Your Presentation",
            subtitle: "Drop your slides — I'll find the points your audience will challenge.",
            uploadLabel: "Drop your slides here",
            uploadDrag: "Drag & drop your slides here",
            uploadReading: "Reviewing your slides...",
            uploadDone: "Got it — your slides are loaded ✓",
            manualFallback: "Don't have slides? Type your key talking points",
            manualPlaceholder: "e.g. Q3 revenue grew 24% YoY, key driver was enterprise expansion. We missed LATAM targets by 12% due to...",
        },
        meeting: {
            heading: "Your Background",
            subtitle: "Share some context about yourself — I'll use it to make the meeting feel real.",
            uploadLabel: "Drop a relevant document",
            uploadDrag: "Drag & drop a document here",
            uploadReading: "Processing document...",
            uploadDone: "Got it — document loaded ✓",
            manualFallback: "Type your background and talking points",
            manualPlaceholder: "e.g. I'm a Tech Lead with 3 years at the company. In this standup I need to explain why the API migration is behind schedule...",
        },
        client: {
            heading: "Your Background",
            subtitle: "Tell me about your work — I'll play the client who knows exactly what to expect.",
            uploadLabel: "Drop a project brief or proposal",
            uploadDrag: "Drag & drop a document here",
            uploadReading: "Processing document...",
            uploadDone: "Got it — document loaded ✓",
            manualFallback: "Type your background and project context",
            manualPlaceholder: "e.g. Full-stack dev agency, we've been working with this client for 6 months on a React Native app. Current sprint is behind by 2 weeks...",
        },
        csuite: {
            heading: "Your Position",
            subtitle: "Give me your context — I'll think like the exec who'll challenge every assumption.",
            uploadLabel: "Drop a proposal or deck",
            uploadDrag: "Drag & drop a document here",
            uploadReading: "Processing document...",
            uploadDone: "Got it — document loaded ✓",
            manualFallback: "Type your role and what you're presenting",
            manualPlaceholder: "e.g. I'm an Engineering Manager presenting a $200K budget request for cloud migration to the CTO. Previous attempt was rejected because...",
        },
    };
    const copy = copyMap[scenarioType || "interview"] || copyMap.interview;

    /* ── State: PDF upload ── */
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

    /* ── State: Manual experience fallback (collapsible, auto-expanded for non-doc paths) ── */
    const [showManualFallback, setShowManualFallback] = useState(!hasDocUpload);
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
                cvSummary,
                cvFileName,
                manualExperience,
            }));
        }
    }, [cvSummary, cvFileName, manualExperience, storageKey]);

    const hasContent = cvSummary.length > 0 || manualExperience.trim().length > 0;

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

            const url = `${SUPABASE_URL}/functions/v1/make-server-08b8658d/process-cv`;
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

            // Persist to profile
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
            console.error("[CVUploadScreen] CV processing failed:", err);
            setCvStatus("error");
            setCvError(err.message || "Failed to process CV");
        }
    };

    /* ── Drag & drop handlers ── */
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

    const handleContinue = () => {
        const cvData: { cvSummary?: string; manualExperience?: string } = {};
        if (cvSummary) cvData.cvSummary = cvSummary;
        if (manualExperience.trim()) cvData.manualExperience = manualExperience.trim();
        onContinue(cvData);
    };

    return (
        <div
            className="w-full min-h-full flex flex-col bg-[#f0f4f8] relative overflow-hidden"
            style={{ fontFamily: "'Inter', sans-serif" }}
        >
            <PastelBlobs />

            <main className="relative w-full max-w-[768px] mx-auto px-6 pt-6 pb-20">
                <div className="w-full mb-5">
                    <SessionProgressBar currentStep="cv-upload" />
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
                        {copy.heading}
                    </h1>
                    <p className="text-[#45556c] text-sm md:text-base max-w-lg mx-auto">
                        {copy.subtitle}
                    </p>
                </motion.div>

                {/* ═══ PDF UPLOAD CARD ═══ */}
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
                                    {copy.uploadLabel}
                                </span>
                                <span className="relative group cursor-help">
                                    <Info className="w-3.5 h-3.5 text-[#94a3b8] group-hover:text-[#0f172b] transition-colors" />
                                    <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 rounded-xl bg-[#0f172b] text-white text-xs px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg z-50" style={{ lineHeight: "1.45" }}>
                                        I'll extract the key points and use them during your session. The original file isn't stored — only the summary.
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

                        {/* Drag & drop zone */}
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
                                    {isDragging ? "Drop it right here" : copy.uploadDrag}
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
                                    {copy.uploadReading}
                                </p>
                                <p className="text-xs text-[#62748e] mt-1">
                                    Extracting the key points...
                                </p>
                            </div>
                        )}

                        {cvStatus === "done" && cvSummary && (
                            <div className="w-full border border-[#bbf7d0] rounded-xl p-5 bg-[#f0fdf4]">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-[#16a34a]" />
                                        <span className="text-sm text-[#15803d]" style={{ fontWeight: 600 }}>{copy.uploadDone}</span>
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

                        {/* ── Collapsible manual experience fallback ── */}
                        {(cvStatus !== "done" || !hasDocUpload) && (
                            <div className="mt-4">
                                <button
                                    onClick={() => setShowManualFallback(!showManualFallback)}
                                    className="flex items-center gap-1.5 text-xs text-[#62748e] hover:text-[#0f172b] transition-colors"
                                    style={{ fontWeight: 500 }}
                                >
                                    <ChevronDown
                                        className={`w-3.5 h-3.5 transition-transform ${showManualFallback ? "rotate-180" : ""}`}
                                    />
                                    {copy.manualFallback}
                                </button>

                                <AnimatePresence>
                                    {showManualFallback && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="overflow-hidden"
                                        >
                                            <textarea
                                                value={manualExperience}
                                                onChange={(e) => setManualExperience(e.target.value)}
                                                placeholder={copy.manualPlaceholder}
                                                className="w-full h-[110px] mt-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-4 text-[#0f172b] placeholder:text-[#94a3b8] focus:outline-none focus:border-[#0f172b] focus:bg-white transition-all resize-none"
                                                style={{ fontSize: "14px", lineHeight: "22px" }}
                                            />
                                            {manualExperience.length > 0 && (
                                                <div className="flex justify-end mt-1">
                                                    <span className={`text-[10px] ${manualExperience.length > 4000 ? "text-amber-500" : "text-[#c4cdd5]"}`}>
                                                        {manualExperience.length} / 5,000 chars
                                                    </span>
                                                </div>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* ═══ ACTIONS ═══ */}
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
                                {copy.uploadReading}
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

export { CVUploadScreen };
