/**
 * ══════════════════════════════════════════════════════════════
 *  OnboardingProfileScreen — One-time Professional Context Capture
 *
 *  Renders as a MODAL overlay on top of the destination page.
 *  Cannot be dismissed — only "Continue" with valid data closes it.
 *
 *  Layout:
 *    1. Manual fields (always visible, primary path)
 *    2. CV upload (accordion, optional, for interview prep)
 *
 *  Uses custom dropdowns (no native <select>) for consistent UX.
 *  Locks body scroll while open.
 * ══════════════════════════════════════════════════════════════
 */

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Upload,
  FileText,
  CheckCircle2,
  Loader2,
  X,
  ChevronDown,
  ArrowRight,
  Briefcase,
  Building2,
  Award,
  Clock,
  Check,
} from "lucide-react";
import { SUPABASE_URL, getAuthToken } from "@/services/supabase";
import type { OnboardingProfile } from "@/services/types";

/* ═══════════════════════ OPTIONS ═══════════════════════ */

interface SelectOption {
  value: string;
  label: string;
}

const ROLE_OPTIONS: SelectOption[] = [
  { value: "software-engineer", label: "Software Engineer" },
  { value: "product-manager", label: "Product Manager" },
  { value: "project-manager", label: "Project Manager" },
  { value: "data-scientist", label: "Data Scientist / Analyst" },
  { value: "designer", label: "UX / UI Designer" },
  { value: "marketing", label: "Marketing / Growth" },
  { value: "sales", label: "Sales / Business Development" },
  { value: "operations", label: "Operations / Supply Chain" },
  { value: "finance", label: "Finance / Accounting" },
  { value: "hr", label: "Human Resources / People" },
  { value: "consulting", label: "Consulting / Advisory" },
  { value: "customer-success", label: "Customer Success / Support" },
  { value: "legal", label: "Legal / Compliance" },
  { value: "engineering-manager", label: "Engineering Manager" },
  { value: "executive", label: "Executive / C-Suite" },
  { value: "other", label: "Other" },
];

const INDUSTRY_OPTIONS: SelectOption[] = [
  { value: "saas", label: "SaaS / Software" },
  { value: "fintech", label: "Fintech / Banking" },
  { value: "ecommerce", label: "E-commerce / Retail" },
  { value: "healthcare", label: "Healthcare / Biotech" },
  { value: "edtech", label: "EdTech / Education" },
  { value: "logistics", label: "Logistics / Supply Chain" },
  { value: "manufacturing", label: "Manufacturing / Industrial" },
  { value: "media", label: "Media / Entertainment" },
  { value: "telecom", label: "Telecom / IT Services" },
  { value: "energy", label: "Energy / Sustainability" },
  { value: "real-estate", label: "Real Estate / Construction" },
  { value: "government", label: "Government / Public Sector" },
  { value: "nonprofit", label: "Non-profit / NGO" },
  { value: "consulting", label: "Consulting / Professional Services" },
  { value: "other", label: "Other" },
];

const SENIORITY_OPTIONS: SelectOption[] = [
  { value: "junior", label: "Junior (0-2 years)" },
  { value: "mid", label: "Mid-level (3-5 years)" },
  { value: "senior", label: "Senior (6-10 years)" },
  { value: "lead", label: "Lead / Staff (10+ years)" },
  { value: "director", label: "Director / VP" },
  { value: "executive", label: "C-Suite / Executive" },
];

/* ═══════════════════════ CUSTOM DROPDOWN ═══════════════════════ */

function CustomSelect({
  options,
  value,
  onChange,
  placeholder,
  icon: Icon,
  label,
}: {
  options: SelectOption[];
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <label className="flex items-center gap-1.5 text-xs text-[#45556c] mb-1.5">
        <Icon className="w-3 h-3" />
        <span className="font-medium">{label}</span>
      </label>

      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full h-11 bg-[#f8fafc] border rounded-xl px-3 pr-9 text-sm text-left transition-all relative cursor-pointer ${
          open
            ? "border-[#0f172b] bg-white ring-1 ring-[#0f172b]/10"
            : "border-[#e2e8f0] hover:border-[#c7d2e0]"
        }`}
      >
        <span className={selected ? "text-[#0f172b]" : "text-[#94a3b8]"}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8] transition-transform ${
            open ? "rotate-180 text-[#0f172b]" : ""
          }`}
        />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 left-0 right-0 mt-1.5 bg-white border border-[#e2e8f0] rounded-xl shadow-lg overflow-hidden"
            style={{ maxHeight: 240 }}
          >
            <div className="overflow-y-auto" style={{ maxHeight: 240 }}>
              {options.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2.5 text-sm flex items-center justify-between transition-colors cursor-pointer ${
                    opt.value === value
                      ? "bg-[#f1f5f9] text-[#0f172b]"
                      : "text-[#314158] hover:bg-[#f8fafc]"
                  }`}
                  style={{ fontWeight: opt.value === value ? 500 : 400 }}
                >
                  {opt.label}
                  {opt.value === value && (
                    <Check className="w-3.5 h-3.5 text-[#0f172b] flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════ MAIN COMPONENT ═══════════════════════ */

interface OnboardingProfileScreenProps {
  onComplete: (profile: OnboardingProfile) => void;
  existingProfile?: OnboardingProfile | null;
}

export function OnboardingProfileScreen({
  onComplete,
  existingProfile,
}: OnboardingProfileScreenProps) {
  /* ── Manual fields state ── */
  const [position, setPosition] = useState(existingProfile?.position ?? "");
  const [customPosition, setCustomPosition] = useState("");
  const [industry, setIndustry] = useState(existingProfile?.industry ?? "");
  const [seniority, setSeniority] = useState(existingProfile?.seniority ?? "");
  const [achievements, setAchievements] = useState(
    existingProfile?.keyExperience ?? ""
  );

  /* ── PDF Upload state ── */
  const [showCvSection, setShowCvSection] = useState(false);
  const [cvFileName, setCvFileName] = useState("");
  const [cvSummary, setCvSummary] = useState("");
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "uploading" | "done" | "error"
  >("idle");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [cvConsentGiven, setCvConsentGiven] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ── Scroll lock ── */
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, []);

  /* ── Derived ── */
  const effectivePosition =
    position === "other" ? customPosition.trim() : position;
  const canContinue =
    effectivePosition.length > 0 &&
    industry.length > 0 &&
    seniority.length > 0;

  /* ── Process uploaded CV via /process-cv ── */
  const processCv = useCallback(async (file: File) => {
    setCvFileName(file.name);
    setUploadStatus("uploading");
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "cv");

      const url = `${SUPABASE_URL}/functions/v1/make-server-08b8658d/process-cv`;
      const token = await getAuthToken();
      const res = await fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Processing failed (${res.status}): ${errText}`);
      }

      const data = await res.json();
      const summary = data.summary || data.cvSummary || "";
      setCvSummary(summary);
      setUploadStatus("done");
    } catch (err: any) {
      console.error("[OnboardingProfile] CV processing failed:", err);
      setUploadStatus("error");
      setUploadError(err.message || "Failed to process your document");
    }
  }, []);

  /* ── Drag & drop ── */
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type === "application/pdf") {
      processCv(file);
    } else {
      setUploadError("Please upload a PDF file");
    }
  };
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processCv(file);
  };
  const clearUpload = () => {
    setCvFileName("");
    setCvSummary("");
    setUploadStatus("idle");
    setUploadError(null);
    setCvConsentGiven(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  /* ── Submit ── */
  const handleContinue = () => {
    const industryLabel =
      INDUSTRY_OPTIONS.find((o) => o.value === industry)?.label ||
      industry ||
      "Not specified";
    const positionLabel =
      position === "other"
        ? customPosition.trim()
        : ROLE_OPTIONS.find((o) => o.value === position)?.label ||
          position ||
          "Not specified";
    const profile: OnboardingProfile = {
      industry: industryLabel,
      position: positionLabel,
      seniority: seniority || "mid",
    };

    if (uploadStatus === "done" && cvSummary && cvConsentGiven) {
      profile.cvSummary = cvSummary;
      profile.cvFileName = cvFileName;
      profile.cvConsentGiven = true;
    }

    if (achievements.trim()) {
      profile.keyExperience = achievements.trim();
    }

    onComplete(profile);
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ overscrollBehavior: "contain" }}
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      />

      {/* Modal — outer clips corners, inner scrolls */}
      <motion.div
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-[640px] max-h-[90dvh] mx-4 overflow-hidden"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <div
          className="overflow-y-auto max-h-[90dvh]"
          style={{
            overscrollBehavior: "contain",
            scrollbarWidth: "thin",
            scrollbarColor: "#cbd5e1 transparent",
          }}
        >
        <div className="px-7 pt-8 pb-8">
          {/* ── Header ── */}
          <div className="text-center mb-7">
            <div className="w-12 h-12 rounded-2xl bg-[#0f172b] flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <h1
              className="text-xl md:text-2xl text-[#0f172b] mb-1.5"
              style={{ lineHeight: 1.2 }}
            >
              Your Professional Profile
            </h1>
            <p className="text-[#62748e] text-sm mx-auto">
              Help me understand your background so I can coach you effectively.
            </p>
          </div>

          {/* ═══ SECTION 1: Manual Fields (always visible) ═══ */}
          <div className="space-y-4 mb-6">
            {/* Current Role */}
            <div>
              <CustomSelect
                options={ROLE_OPTIONS}
                value={position}
                onChange={setPosition}
                placeholder="Select your role"
                icon={Briefcase}
                label="Current Role"
              />
              {position === "other" && (
                <motion.input
                  type="text"
                  value={customPosition}
                  onChange={(e) => setCustomPosition(e.target.value)}
                  placeholder="Tell us your role"
                  className="w-full h-11 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-3 text-sm text-[#0f172b] placeholder:text-[#94a3b8] focus:outline-none focus:border-[#0f172b] focus:bg-white transition-all mt-2"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 44 }}
                  autoFocus
                />
              )}
            </div>

            {/* Industry */}
            <CustomSelect
              options={INDUSTRY_OPTIONS}
              value={industry}
              onChange={setIndustry}
              placeholder="Select your industry"
              icon={Building2}
              label="Industry"
            />

            {/* Experience Level */}
            <CustomSelect
              options={SENIORITY_OPTIONS}
              value={seniority}
              onChange={setSeniority}
              placeholder="Select your level"
              icon={Clock}
              label="Experience Level"
            />

            {/* Key Achievements (optional) */}
            <div>
              <label className="flex items-center gap-1.5 text-xs text-[#45556c] mb-1.5">
                <Award className="w-3 h-3" />
                <span className="font-medium">
                  Key Achievements{" "}
                  <span className="text-[#94a3b8]">(optional)</span>
                </span>
              </label>
              <textarea
                value={achievements}
                onChange={(e) => setAchievements(e.target.value)}
                placeholder="e.g. Led a team of 12, launched 3 products with $2M+ ARR..."
                className="w-full h-[80px] bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-3 text-sm text-[#0f172b] placeholder:text-[#94a3b8] focus:outline-none focus:border-[#0f172b] focus:bg-white transition-all resize-none"
                style={{ lineHeight: "20px" }}
              />
            </div>
          </div>

          {/* ═══ SECTION 2: CV Upload (accordion, optional) ═══ */}
          <div className="border border-[#e2e8f0] rounded-2xl mb-7 overflow-hidden">
            <button
              type="button"
              onClick={() => setShowCvSection(!showCvSection)}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-[#f8fafc] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-[#45556c]" />
                <div className="text-left">
                  <span
                    className="text-sm text-[#0f172b] block font-semibold"
                  >
                    Upload your CV / Resume
                  </span>
                  <span className="text-xs text-[#94a3b8]">
                    Recommended if you're practicing for interviews
                  </span>
                </div>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-[#94a3b8] transition-transform flex-shrink-0 ${
                  showCvSection ? "rotate-180" : ""
                }`}
              />
            </button>

            <AnimatePresence>
              {showCvSection && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-5 pt-2">

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf"
                      onChange={handleFileSelect}
                      className="hidden"
                    />

                    {uploadStatus === "idle" && (
                      <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`w-full border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                          isDragging
                            ? "border-[#6366f1] bg-[#eef2ff]"
                            : "border-[#e2e8f0] bg-[#f8fafc] hover:border-[#c7d2e0] hover:bg-[#f1f5f9]"
                        }`}
                      >
                        <Upload
                          className={`w-6 h-6 mx-auto mb-2 ${
                            isDragging ? "text-[#6366f1]" : "text-[#94a3b8]"
                          }`}
                        />
                        <p
                          className="text-sm text-[#0f172b] font-medium"
                        >
                          {isDragging
                            ? "Drop it here"
                            : "Drag & drop your PDF"}
                        </p>
                        <p className="text-xs text-[#62748e] mt-0.5">
                          or{" "}
                          <span className="text-[#6366f1] underline">
                            click to browse
                          </span>
                        </p>
                      </div>
                    )}

                    {uploadStatus === "uploading" && (
                      <div className="w-full border border-[#e2e8f0] rounded-xl p-6 text-center bg-[#f8fafc]">
                        <Loader2 className="w-6 h-6 mx-auto mb-2 text-[#6366f1] animate-spin" />
                        <p
                          className="text-sm text-[#0f172b] font-medium"
                        >
                          Reading your document...
                        </p>
                      </div>
                    )}

                    {uploadStatus === "done" && cvSummary && (
                      <div className="w-full border border-[#bbf7d0] rounded-xl p-4 bg-[#f0fdf4]">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-[#16a34a]" />
                            <div>
                              <span
                                className="text-sm text-[#15803d] block font-semibold"
                              >
                                CV uploaded successfully
                              </span>
                              <span className="text-xs text-[#45556c]">
                                {cvFileName}
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={clearUpload}
                            className="text-xs text-[#62748e] hover:text-[#0f172b] flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                            Remove
                          </button>
                        </div>

                        {/* Consent checkbox */}
                        <label className="flex items-start gap-2.5 mt-3 pt-3 border-t border-[#bbf7d0]/50 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={cvConsentGiven}
                            onChange={(e) => setCvConsentGiven(e.target.checked)}
                            className="mt-0.5 w-4 h-4 rounded border-[#c7d2e0] text-[#0f172b] focus:ring-[#0f172b] cursor-pointer"
                          />
                          <span className="text-xs text-[#45556c] leading-relaxed">
                            I authorize using my CV data to personalize my coaching sessions and to receive job proposals.
                          </span>
                        </label>
                      </div>
                    )}

                    {uploadStatus === "error" && (
                      <div className="w-full border border-[#fecaca] rounded-xl p-4 bg-[#fef2f2]">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <X className="w-3.5 h-3.5 text-[#dc2626]" />
                            <span
                              className="text-xs text-[#dc2626] font-semibold"
                            >
                              Processing failed
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={clearUpload}
                            className="text-xs text-[#62748e] hover:text-[#0f172b] transition-colors cursor-pointer"
                          >
                            Try again
                          </button>
                        </div>
                        {uploadError && (
                          <p className="text-xs text-[#991b1b]">
                            {uploadError}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ═══ CTA ═══ */}
          <button
            type="button"
            onClick={handleContinue}
            disabled={!canContinue || uploadStatus === "uploading"}
            className={`w-full flex items-center justify-center gap-2.5 py-4 rounded-full text-base shadow-lg transition-all ${
              canContinue && uploadStatus !== "uploading"
                ? "bg-[#0f172b] text-white hover:bg-[#1d293d] cursor-pointer"
                : "bg-[#e2e8f0] text-[#94a3b8] cursor-not-allowed"
            }`}
          >
            {uploadStatus === "uploading" ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
        </div>{/* /scroll container */}
      </motion.div>
    </div>
  );
}
