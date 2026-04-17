import { SUPABASE_URL } from "@/services/supabase";
import { useState } from "react";
import {
    ArrowRight,
    ArrowLeft,
    Check,
    Info,
    ClipboardPaste,
    Sparkles,
    ChevronDown,
    Briefcase,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { PastelBlobs, MiniFooter } from "@/app/components/shared";
import { projectId } from "@/../utils/supabase/info";
import { getAuthToken } from "@/services/supabase";
import type { OnboardingProfile } from "@/services/types";
import { SessionProgressBar } from "@/shared/ui/SessionProgressBar";

/* ═══════════════════════════════════════════════════════════
   KEY EXPERIENCE SCREEN (interview only — persisted to profile)
   Shown once; after saving, user never sees it again.
   ═══════════════════════════════════════════════════════════ */
function KeyExperienceScreen({
    onContinue,
    onBack,
    guidedFields,
    userProfile,
    onProfileUpdate,
}: {
    onContinue: () => void;
    onBack?: () => void;
    guidedFields?: Record<string, string>;
    userProfile?: OnboardingProfile | null;
    onProfileUpdate?: (profile: OnboardingProfile) => void;
}) {
    const [keyExperience, setKeyExperience] = useState("");
    const [showSuggestions, setShowSuggestions] = useState(false);
    const hasContent = keyExperience.trim().length > 0;

    const suggestions = [
        "5 years as PM at a SaaS startup, grew ARR 3x",
        "Led a team of 6 engineers shipping to US clients",
        "Fluent in Spanish, professional English (B2+)",
        "MBA from [university], certified Scrum Master",
    ];

    const handleSuggestionClick = (suggestion: string) => {
        setKeyExperience((prev) => {
            const separator = prev.trim() ? "\n" : "";
            return prev + separator + suggestion;
        });
    };

    const handleContinue = () => {
        // Save keyExperience + role + company to profile
        const updatedProfile: OnboardingProfile = {
            ...(userProfile || { industry: "", position: "", seniority: "" }),
            keyExperience: keyExperience.trim(),
            role: guidedFields?.role || userProfile?.role || "",
            company: guidedFields?.company || userProfile?.company || "",
        };
        onProfileUpdate?.(updatedProfile);

        // Also persist to backend
        try {
            const serverUrl = `${SUPABASE_URL}/functions/v1/make-server-08b8658d/profile`;
            getAuthToken().then((token) => {
                fetch(serverUrl, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(updatedProfile),
                });
            });
        } catch { /* ignore */ }

        onContinue();
    };

    return (
        <div
            className="w-full min-h-full flex flex-col bg-[#f0f4f8] relative overflow-hidden"
            style={{ fontFamily: "'Inter', sans-serif" }}
        >
            <PastelBlobs />

            <main className="relative w-full max-w-[768px] mx-auto px-6 pt-6 pb-20">
                <div className="w-full mb-5">
                    <SessionProgressBar currentStep="key-experience" />
                </div>
                <motion.div
                    className="text-center mb-10"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="inline-flex items-center gap-2 bg-[#f0fdf4] border border-[#bbf7d0] rounded-full px-4 py-2 mb-6">
                        <Briefcase className="w-4 h-4 text-[#16a34a]" />
                        <span className="text-sm text-[#15803d]" style={{ fontWeight: 500 }}>
                            Quick setup — one time only
                        </span>
                    </div>
                    <h1
                        className="text-3xl md:text-[40px] text-[#0f172b] mb-3"
                        style={{ fontWeight: 300, lineHeight: 1.2 }}
                    >
                        What are your career highlights?
                    </h1>
                    <p className="text-[#45556c] text-base md:text-lg max-w-lg mx-auto">
                        Tell me about your best professional moments — I'll use them to craft killer{" "}
                        <span className="text-[#6366f1]" style={{ fontWeight: 500 }}>STAR-method</span> answers for you.{" "}
                        <span className="text-[#94a3b8]">Just this once.</span>
                    </p>
                </motion.div>

                <motion.div
                    className="bg-white rounded-2xl border border-[#e2e8f0] p-5 shadow-sm mb-10"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                >
                    {/* Field header */}
                    <div className="flex items-start justify-between mb-3">
                        <label className="flex items-center gap-1.5">
                            <span className="text-sm text-[#0f172b]" style={{ fontWeight: 600 }}>
                                Your highlights
                            </span>
                            <span className="relative group cursor-help">
                                <Info className="w-3.5 h-3.5 text-[#94a3b8] group-hover:text-[#0f172b] transition-colors" />
                                <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-56 rounded-xl bg-[#0f172b] text-white text-xs px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg z-50" style={{ lineHeight: "1.45" }}>
                                    I'll turn these into strong STAR-method answers tailored to your real experience
                                    <span className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-[5px] border-x-transparent border-t-[5px] border-t-[#0f172b]" />
                                </span>
                            </span>
                        </label>
                        <span className="text-[10px] text-[#6366f1] bg-[#f0f4ff] rounded-full px-2.5 py-0.5" style={{ fontWeight: 500 }}>
                            Recommended
                        </span>
                    </div>

                    {/* Paste hint */}
                    <div className="flex items-center gap-1.5 mb-3 text-xs text-[#62748e]">
                        <ClipboardPaste className="w-3 h-3 shrink-0" />
                        <span>Skip the full CV — just the good stuff that matters for this role</span>
                    </div>

                    {/* Textarea */}
                    <textarea
                        value={keyExperience}
                        onChange={(e) => setKeyExperience(e.target.value)}
                        placeholder="e.g. 'Led a 12-person team, grew ARR 3x in 18 months, shipped to US enterprise clients...'"
                        className="w-full h-[140px] bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-4 text-[#0f172b] placeholder:text-[#94a3b8] focus:outline-none focus:border-[#0f172b] focus:bg-white transition-all resize-none"
                        style={{ fontSize: "14px", lineHeight: "22px" }}
                    />

                    {/* Character count */}
                    {keyExperience.length > 0 && (
                        <div className="flex justify-end mt-1">
                            <span className={`text-[10px] ${keyExperience.length > 1500 ? "text-amber-500" : "text-[#c4cdd5]"}`}>
                                {keyExperience.length} / 2,000 chars
                            </span>
                        </div>
                    )}

                    {/* Expandable suggestions */}
                    <div className="mt-3">
                        <button
                            onClick={() => setShowSuggestions(!showSuggestions)}
                            className="flex items-center gap-1.5 text-xs text-[#6366f1] hover:text-[#4f46e5] transition-colors group"
                            style={{ fontWeight: 500 }}
                        >
                            <Sparkles className="w-3 h-3" />
                            Not sure what to write? Try these examples
                            <motion.span
                                animate={{ rotate: showSuggestions ? 180 : 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <ChevronDown className="w-3 h-3" />
                            </motion.span>
                        </button>

                        <AnimatePresence>
                            {showSuggestions && (
                                <motion.div
                                    className="mt-2.5 flex flex-wrap gap-2"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.25 }}
                                >
                                    {suggestions.map((suggestion, si) => (
                                        <motion.button
                                            key={si}
                                            onClick={() => handleSuggestionClick(suggestion)}
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

                {/* Saved profile data summary */}
                {(guidedFields?.role || guidedFields?.company) && (
                    <motion.div
                        className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-4 mb-10"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                    >
                        <p className="text-[10px] text-[#94a3b8] uppercase tracking-wider mb-2" style={{ fontWeight: 600 }}>
                            Also saving to your profile
                        </p>
                        <div className="space-y-1.5">
                            {guidedFields?.role && (
                                <div className="flex items-center gap-2 text-xs text-[#45556c]">
                                    <Check className="w-3 h-3 text-[#16a34a]" />
                                    <span><span style={{ fontWeight: 500 }}>Role:</span> {guidedFields.role}</span>
                                </div>
                            )}
                            {guidedFields?.company && (
                                <div className="flex items-center gap-2 text-xs text-[#45556c]">
                                    <Check className="w-3 h-3 text-[#16a34a]" />
                                    <span><span style={{ fontWeight: 500 }}>Company:</span> {guidedFields.company}</span>
                                </div>
                            )}
                        </div>
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
                        Lock it in
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

export { KeyExperienceScreen };
