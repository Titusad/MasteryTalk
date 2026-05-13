/**
 * PathSetupModal — Lazy path context capture
 *
 * Shown once before the user's first session on a given path.
 * Captures the scenario-specific context needed to pre-populate
 * the AI briefing without asking the user at every session start.
 *
 * Currently implemented for: interview
 * Pending: meeting, presentation, sales (separate fields per path)
 *
 * Cannot be dismissed — user must complete to start the session.
 * Saves to profile via onProfileUpdate + PUT /profile (handled by caller).
 */

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Briefcase, Building2, FileText, ArrowRight, ChevronDown, Check } from "lucide-react";
import { AppModal } from "@/shared/ui";
import type { OnboardingProfile } from "@/entities/user";

// ── Company type options for interview ──

interface SelectOption { value: string; label: string }

const COMPANY_TYPE_OPTIONS: SelectOption[] = [
  { value: "saas-startup", label: "SaaS Startup (Seed–Series B)" },
  { value: "saas-scaleup", label: "SaaS Scale-up (Series C+)" },
  { value: "enterprise-tech", label: "Enterprise Tech / Big Tech" },
  { value: "fintech", label: "Fintech / Banking" },
  { value: "consulting", label: "Consulting / Professional Services" },
  { value: "ecommerce", label: "E-commerce / Retail" },
  { value: "healthcare-biotech", label: "Healthcare / Biotech" },
  { value: "agency", label: "Agency / Creative Studio" },
  { value: "other", label: "Other" },
];

// ── Inline select ──

function CustomSelect({
  options, value, onChange, placeholder, icon: Icon, label,
}: {
  options: SelectOption[];
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <div className="relative">
      <label className="flex items-center gap-1.5 text-xs text-[#45556c] mb-1.5">
        <Icon className="w-3 h-3" />
        <span className="font-medium">{label}</span>
      </label>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full h-11 bg-[#f8fafc] border rounded-xl px-3 pr-9 text-sm text-left transition-all relative cursor-pointer ${
          open ? "border-[#0f172b] bg-white ring-1 ring-[#0f172b]/10" : "border-[#e2e8f0] hover:border-[#c7d2e0]"
        }`}
      >
        <span className={selected ? "text-[#0f172b]" : "text-[#94a3b8]"}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8] transition-transform ${open ? "rotate-180 text-[#0f172b]" : ""}`} />
      </button>
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
                  onClick={() => { onChange(opt.value); setOpen(false); }}
                  className={`w-full text-left px-3.5 py-2.5 text-sm flex items-center justify-between transition-colors cursor-pointer ${
                    opt.value === value ? "bg-[#f1f5f9] text-[#0f172b]" : "text-[#314158] hover:bg-[#f8fafc]"
                  }`}
                  style={{ fontWeight: opt.value === value ? 500 : 400 }}
                >
                  {opt.label}
                  {opt.value === value && <Check className="w-3.5 h-3.5 text-[#0f172b] flex-shrink-0" />}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main component ──

export interface PathSetupModalProps {
  open: boolean;
  pathId: string;
  userProfile?: OnboardingProfile | null;
  onComplete: (updates: Partial<OnboardingProfile>) => void;
}

export function PathSetupModal({ open, pathId, userProfile, onComplete }: PathSetupModalProps) {
  const [targetRole, setTargetRole] = useState(userProfile?.targetRole ?? "");
  const [targetCompanyType, setTargetCompanyType] = useState(userProfile?.targetCompanyType ?? "");
  const [jobDescription, setJobDescription] = useState(userProfile?.jobDescription ?? "");

  const canContinue = targetRole.trim().length > 0;

  function handleContinue() {
    const updates: Partial<OnboardingProfile> = {
      targetRole: targetRole.trim(),
      targetCompanyType: targetCompanyType || undefined,
      jobDescription: jobDescription.trim() || undefined,
    };
    onComplete(updates);
  }

  if (pathId !== "interview") return null;

  return (
    <AppModal open={open} onClose={() => {}} showCloseButton={false} size="md">
      <div className="px-7 pt-7 pb-8">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-11 h-11 rounded-2xl bg-[#0f172b] flex items-center justify-center mx-auto mb-4">
            <Briefcase className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl text-[#0f172b] mb-1.5" style={{ lineHeight: 1.25 }}>
            Set up your Interview profile
          </h2>
          <p className="text-sm text-[#62748e]">
            Your AI coach will use this to tailor every session to your actual target role — no more filling in context each time.
          </p>
        </div>

        {/* Fields */}
        <div className="space-y-4 mb-6">

          {/* Target role */}
          <div>
            <label className="flex items-center gap-1.5 text-xs text-[#45556c] mb-1.5">
              <Briefcase className="w-3 h-3" />
              <span className="font-medium">Role you're applying for</span>
            </label>
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g. Senior Product Manager, Lead Backend Engineer..."
              className="w-full h-11 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-3 text-sm text-[#0f172b] placeholder:text-[#94a3b8] focus:outline-none focus:border-[#0f172b] focus:bg-white transition-all"
            />
          </div>

          {/* Target company type */}
          <CustomSelect
            options={COMPANY_TYPE_OPTIONS}
            value={targetCompanyType}
            onChange={setTargetCompanyType}
            placeholder="Select company type (optional)"
            icon={Building2}
            label="Type of company you're targeting"
          />

          {/* Job description */}
          <div>
            <label className="flex items-center gap-1.5 text-xs text-[#45556c] mb-1.5">
              <FileText className="w-3 h-3" />
              <span className="font-medium">
                Job Description{" "}
                <span className="text-[#94a3b8]">(optional — recommended)</span>
              </span>
            </label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description here — your AI interviewer will tailor questions to the exact role, seniority, and required skills."
              className="w-full h-28 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-3 text-sm text-[#0f172b] placeholder:text-[#94a3b8] focus:outline-none focus:border-[#0f172b] focus:bg-white transition-all resize-none"
              style={{ lineHeight: "20px" }}
            />
            <p className="text-xs text-[#94a3b8] mt-1.5">
              Tip: copy-paste directly from LinkedIn or the company's careers page.
            </p>
          </div>
        </div>

        {/* CTA */}
        <button
          type="button"
          onClick={handleContinue}
          disabled={!canContinue}
          className={`w-full flex items-center justify-center gap-2.5 py-4 rounded-full text-base transition-all ${
            canContinue
              ? "bg-[#0f172b] text-white hover:bg-[#1d293d] cursor-pointer shadow-lg"
              : "bg-[#e2e8f0] text-[#94a3b8] cursor-not-allowed"
          }`}
        >
          Start my first session
          <ArrowRight className="w-4 h-4" />
        </button>

        <p className="text-center text-xs text-[#94a3b8] mt-3">
          You can update this anytime from your Account settings.
        </p>
      </div>
    </AppModal>
  );
}
