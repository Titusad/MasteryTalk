import { useState, useEffect, useRef, useCallback } from "react";
import { User, CreditCard, Settings, LogOut, CheckCircle, AlertTriangle, ShieldAlert, ExternalLink, MessageCircle, Pencil, Save, X, Upload, FileText, Trash2, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { PastelBlobs, MiniFooter } from "@/shared/ui";
import type { OnboardingProfile, User as AuthUser } from "@/services/types";
import { SUPABASE_URL, getAuthToken, getSupabaseClient } from "@/services/supabase";

const TIER_LABELS: Record<string, string> = {
  early_bird: "Early Bird Plan",
  monthly: "Monthly Pro",
  quarterly: "Quarterly Pro",
};

interface SubscriptionInfo {
  subscription_active: boolean;
  tier?: string;
  plan_status?: string;
  next_billing_date?: string | null;
}

const ROLE_OPTIONS = [
  "Software Engineer", "Product Manager", "Project Manager",
  "Data Scientist / Analyst", "UX / UI Designer", "Marketing / Growth",
  "Sales / Business Development", "Operations / Supply Chain",
  "Finance / Accounting", "Human Resources / People", "Consulting / Advisory",
  "Customer Success / Support", "Legal / Compliance", "Engineering Manager",
  "Executive / C-Suite", "Other",
];

const INDUSTRY_OPTIONS = [
  "SaaS / Software", "Fintech / Banking", "E-commerce / Retail",
  "Healthcare / Biotech", "EdTech / Education", "Logistics / Supply Chain",
  "Manufacturing / Industrial", "Media / Entertainment", "Telecom / IT Services",
  "Energy / Sustainability", "Real Estate / Construction",
  "Government / Public Sector", "Non-profit / NGO",
  "Consulting / Professional Services", "Other",
];

const SENIORITY_OPTIONS = [
  "Junior (0-2 years)", "Mid-level (3-5 years)", "Senior (6-10 years)",
  "Lead / Staff (10+ years)", "Director / VP", "C-Suite / Executive",
];

interface AccountPageProps {
  userProfile?: OnboardingProfile | null;
  authUser?: AuthUser | null;
  onLogout: () => void;
  onProfileUpdate?: (profile: OnboardingProfile) => void;
}

type WaStep = "idle" | "otp_sent" | "verified";

export function AccountPage({ userProfile, authUser, onLogout, onProfileUpdate }: AccountPageProps) {
  const [showConfirmLogout, setShowConfirmLogout] = useState(false);
  const [subInfo, setSubInfo] = useState<SubscriptionInfo | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  // ── Professional profile edit state ──
  const [editingProfile, setEditingProfile] = useState(false);
  const [editPosition, setEditPosition] = useState(userProfile?.position ?? "");
  const [editIndustry, setEditIndustry] = useState(userProfile?.industry ?? "");
  const [editSeniority, setEditSeniority] = useState(userProfile?.seniority ?? "");
  const [editAchievements, setEditAchievements] = useState(userProfile?.keyExperience ?? "");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  // ── CV management state ──
  const [cvFileName, setCvFileName] = useState(userProfile?.cvFileName ?? "");
  const [cvSummary, setCvSummary] = useState(userProfile?.cvSummary ?? "");
  const [cvUploadStatus, setCvUploadStatus] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const [cvError, setCvError] = useState<string | null>(null);
  const cvFileInputRef = useRef<HTMLInputElement>(null);

  // Sync editable fields when userProfile changes (e.g. after backend fetch)
  useEffect(() => {
    if (!editingProfile) {
      setEditPosition(userProfile?.position ?? "");
      setEditIndustry(userProfile?.industry ?? "");
      setEditSeniority(userProfile?.seniority ?? "");
      setEditAchievements(userProfile?.keyExperience ?? "");
      setCvFileName(userProfile?.cvFileName ?? "");
      setCvSummary(userProfile?.cvSummary ?? "");
    }
  }, [userProfile, editingProfile]);

  const handleSaveProfile = async () => {
    if (!onProfileUpdate) return;
    setProfileSaving(true);
    const updated: OnboardingProfile = {
      ...(userProfile ?? {}),
      position: editPosition,
      industry: editIndustry,
      seniority: editSeniority,
      keyExperience: editAchievements,
      cvFileName: cvFileName || undefined,
      cvSummary: cvSummary || undefined,
      cvConsentGiven: !!cvSummary,
      profile_completed: true,
    } as OnboardingProfile;
    onProfileUpdate(updated);
    setProfileSaving(false);
    setProfileSaved(true);
    setEditingProfile(false);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  const handleCvUpload = useCallback(async (file: File) => {
    if (!file || file.type !== "application/pdf") {
      setCvError("Please upload a PDF file.");
      return;
    }
    setCvUploadStatus("uploading");
    setCvError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "cv");
      const token = await getAuthToken();
      const res = await fetch(
        `${SUPABASE_URL}/functions/v1/make-server-08b8658d/process-cv`,
        { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: formData }
      );
      if (!res.ok) throw new Error(`Failed (${res.status})`);
      const data = await res.json();
      const summary = data.summary || data.cvSummary || "";
      setCvFileName(file.name);
      setCvSummary(summary);
      setCvUploadStatus("done");
    } catch (err: any) {
      setCvError(err.message || "Upload failed. Try again.");
      setCvUploadStatus("error");
    }
  }, []);

  const handleCvDelete = () => {
    setCvFileName("");
    setCvSummary("");
    setCvUploadStatus("idle");
    setCvError(null);
    if (cvFileInputRef.current) cvFileInputRef.current.value = "";
  };

  // WhatsApp Coach state
  const [waStep, setWaStep] = useState<WaStep>("idle");
  const [waPhoneInput, setWaPhoneInput] = useState("");
  const [waOtpInput, setWaOtpInput] = useState("");
  const [waLinkedNumber, setWaLinkedNumber] = useState<string | null>(null);
  const [waLoading, setWaLoading] = useState(false);
  const [waError, setWaError] = useState<string | null>(null);

  useEffect(() => {
    getAuthToken().then(token => {
      if (!token) return;
      fetch(`${SUPABASE_URL}/functions/v1/make-server-08b8658d/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (data) setSubInfo({
            subscription_active: data.subscription_active ?? false,
            tier: data.tier,
            plan_status: data.plan_status,
            next_billing_date: data.next_billing_date,
          });
        })
        .catch(() => {});
    });

    // Load WhatsApp linking status from Supabase profiles table
    (async () => {
      try {
        const { data: { user } } = await getSupabaseClient().auth.getUser();
        if (!user) return;
        const { data: profile } = await getSupabaseClient()
          .from("profiles")
          .select("whatsapp_number, whatsapp_verified")
          .eq("id", user.id)
          .single();
        if (!profile) return;
        if (profile.whatsapp_verified && profile.whatsapp_number) {
          setWaLinkedNumber(profile.whatsapp_number);
          setWaPhoneInput(profile.whatsapp_number);
          setWaStep("verified");
        } else if (profile.whatsapp_number) {
          setWaPhoneInput(profile.whatsapp_number);
        }
      } catch {
        // non-blocking
      }
    })();
  }, []);

  const handleSendOtp = async () => {
    setWaLoading(true);
    setWaError(null);
    try {
      const token = await getAuthToken();
      const res = await fetch(
        `${SUPABASE_URL}/functions/v1/make-server-08b8658d/whatsapp/send-otp`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ phoneNumber: waPhoneInput.trim() }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send the code");
      setWaStep("otp_sent");
    } catch (err) {
      setWaError(err instanceof Error ? err.message : "Failed to send the code");
    } finally {
      setWaLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setWaLoading(true);
    setWaError(null);
    try {
      const token = await getAuthToken();
      const res = await fetch(
        `${SUPABASE_URL}/functions/v1/make-server-08b8658d/whatsapp/verify-otp`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ phoneNumber: waPhoneInput.trim(), code: waOtpInput }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Incorrect or expired code");
      setWaLinkedNumber(waPhoneInput.trim());
      setWaStep("verified");
    } catch (err) {
      setWaError(err instanceof Error ? err.message : "Failed to verify the code");
    } finally {
      setWaLoading(false);
    }
  };

  const handleWaUnlink = async () => {
    setWaLoading(true);
    try {
      const { data } = await getSupabaseClient().auth.getUser();
      if (data.user) {
        await getSupabaseClient()
          .from("profiles")
          .update({ whatsapp_number: null, whatsapp_verified: false })
          .eq("id", data.user.id);
      }
      setWaStep("idle");
      setWaLinkedNumber(null);
      setWaPhoneInput("");
      setWaOtpInput("");
    } catch (err) {
      console.error("[AccountPage] Failed to unlink WhatsApp:", err);
    } finally {
      setWaLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    setPortalLoading(true);
    try {
      const token = await getAuthToken();
      const res = await fetch(
        `${SUPABASE_URL}/functions/v1/make-server-08b8658d/create-portal-session`,
        { method: "POST", headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      // silent
    } finally {
      setPortalLoading(false);
    }
  };

  // Fallbacks
  const displayName = authUser?.displayName || "Beta User";
  const displayEmail = authUser?.email || "beta.user@example.com";
  const avatarInitials = displayName.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) || "U";
  
  return (
    <div className="w-full min-h-full flex flex-col bg-[#f8fafc] relative overflow-hidden" style={{ fontFamily: "'Poppins', sans-serif" }}>
      <PastelBlobs />

      {/* MAIN CONTENT */}
      <main className="relative w-full max-w-[800px] mx-auto px-4 md:px-8 pt-8 pb-20 flex-1">

        <h1 className="text-3xl md:text-4xl font-light text-[#0f172b] mb-8">
          My Account
        </h1>

        <div className="space-y-6">
          {/* PROFILE CARD */}
          <section className="bg-white rounded-2xl border border-[#e2e8f0] p-6 hover:border-[#cad5e2] transition-colors shadow-sm">
            <h2 className="text-lg font-medium text-[#0f172b] mb-5 flex items-center gap-2">
              <User className="w-5 h-5 text-[#62748e]" />
              Personal Info
            </h2>
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <div className="w-20 h-20 rounded-full bg-[#0f172b] flex items-center justify-center shrink-0">
                <span className="text-white text-2xl font-light">{avatarInitials}</span>
              </div>
              <div className="flex-1 space-y-4 w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#62748e] mb-1.5">Full Name</label>
                    <div className="w-full bg-[#f1f5f9] border border-[#e2e8f0] text-[#0f172b] rounded-lg px-4 py-3 text-sm font-medium">
                      {displayName}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#62748e] mb-1.5">Email</label>
                    <div className="w-full bg-[#f1f5f9] border border-[#e2e8f0] text-[#45556c] rounded-lg px-4 py-3 text-sm">
                      {displayEmail}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-[#94a3b8] italic">Member since 2025.</p>
              </div>
            </div>
          </section>

          {/* WHATSAPP COACH CARD */}
          <section className="bg-white rounded-2xl border border-[#e2e8f0] p-6 hover:border-[#cad5e2] transition-colors shadow-sm">
            <h2 className="text-lg font-medium text-[#0f172b] mb-2 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-[#25D366]" />
              WhatsApp Coach
            </h2>
            <p className="text-sm text-[#62748e] mb-6">
              Receive your daily pronunciation challenge on WhatsApp. Reply with audio and get your score instantly.
            </p>

            {waStep === "verified" ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#f0fdf4] flex items-center justify-center shrink-0">
                    <CheckCircle className="w-5 h-5 text-[#16a34a]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#0f172b]">{waLinkedNumber}</p>
                    <p className="text-xs text-[#16a34a]">Verified · You'll receive daily challenges</p>
                  </div>
                </div>
                <button
                  onClick={handleWaUnlink}
                  disabled={waLoading}
                  className="text-xs text-[#94a3b8] hover:text-[#ef4444] transition-colors disabled:opacity-40"
                >
                  Unlink
                </button>
              </div>
            ) : waStep === "otp_sent" ? (
              <div className="space-y-4">
                <p className="text-sm text-[#45556c]">
                  We sent a 6-digit code to{" "}
                  <span className="font-medium text-[#0f172b]">{waPhoneInput}</span> via WhatsApp.
                </p>
                <input
                  type="text"
                  value={waOtpInput}
                  onChange={e => setWaOtpInput(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="123456"
                  maxLength={6}
                  className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-lg px-4 py-3 text-sm text-[#0f172b] text-center tracking-widest font-medium focus:outline-none focus:border-[#0f172b]"
                />
                {waError && <p className="text-xs text-[#ef4444]">{waError}</p>}
                <div className="flex gap-3">
                  <button
                    onClick={handleVerifyOtp}
                    disabled={waOtpInput.length < 6 || waLoading}
                    className="flex-1 py-2.5 rounded-lg bg-[#0f172b] text-white text-sm font-medium hover:bg-[#1d293d] transition-colors disabled:opacity-40"
                  >
                    {waLoading ? "Verifying..." : "Verify code"}
                  </button>
                  <button
                    onClick={() => { setWaStep("idle"); setWaOtpInput(""); setWaError(null); }}
                    className="px-4 py-2.5 rounded-lg border border-[#e2e8f0] text-sm text-[#45556c] hover:bg-[#f8fafc] transition-colors"
                  >
                    Change number
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#62748e] mb-1.5">
                    WhatsApp number (international format)
                  </label>
                  <input
                    type="tel"
                    value={waPhoneInput}
                    onChange={e => setWaPhoneInput(e.target.value)}
                    placeholder="+521234567890"
                    className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-lg px-4 py-3 text-sm text-[#0f172b] focus:outline-none focus:border-[#0f172b]"
                  />
                  <p className="text-xs text-[#94a3b8] mt-1.5">
                    Include country code: +1 (US), +52 (Mexico), +55 (Brazil), +44 (UK), +34 (Spain)...
                  </p>
                </div>
                {waError && <p className="text-xs text-[#ef4444]">{waError}</p>}
                <button
                  onClick={handleSendOtp}
                  disabled={!waPhoneInput.trim() || waLoading}
                  className="w-full py-2.5 rounded-lg bg-[#0f172b] text-white text-sm font-medium hover:bg-[#1d293d] transition-colors disabled:opacity-40"
                >
                  {waLoading ? "Sending..." : "Send verification code"}
                </button>
              </div>
            )}
          </section>

          {/* PROFESSIONAL PROFILE CARD */}
          <section className="bg-white rounded-2xl border border-[#e2e8f0] p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-medium text-[#0f172b] flex items-center gap-2">
                <Settings className="w-5 h-5 text-[#62748e]" />
                Professional Profile
              </h2>
              {!editingProfile ? (
                <button
                  onClick={() => setEditingProfile(true)}
                  className="flex items-center gap-1.5 text-sm text-[#45556c] hover:text-[#0f172b] border border-[#e2e8f0] px-3 py-1.5 rounded-lg hover:bg-[#f8fafc] transition-colors"
                  style={{ fontWeight: 500 }}
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Edit
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { setEditingProfile(false); }}
                    className="flex items-center gap-1.5 text-sm text-[#62748e] hover:text-[#0f172b] px-3 py-1.5 rounded-lg hover:bg-[#f8fafc] transition-colors border border-[#e2e8f0]"
                  >
                    <X className="w-3.5 h-3.5" /> Cancel
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    disabled={profileSaving}
                    className="flex items-center gap-1.5 text-sm bg-[#0f172b] text-white px-4 py-1.5 rounded-lg hover:bg-[#1d293d] transition-colors disabled:opacity-50"
                    style={{ fontWeight: 500 }}
                  >
                    {profileSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    Save
                  </button>
                </div>
              )}
            </div>

            {profileSaved && (
              <div className="mb-4 flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                Profile updated successfully.
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Current Role */}
              <div>
                <label className="block text-xs font-medium text-[#62748e] mb-1.5">Current Role</label>
                {editingProfile ? (
                  <select
                    value={editPosition}
                    onChange={e => setEditPosition(e.target.value)}
                    className="w-full border border-[#e2e8f0] rounded-lg px-3 py-2.5 text-sm text-[#0f172b] bg-white focus:outline-none focus:border-[#0f172b] transition-colors"
                  >
                    <option value="">Select your role</option>
                    {ROLE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : (
                  <div className="w-full bg-[#f8fafc] border border-[#e2e8f0] text-[#45556c] rounded-lg px-3 py-2.5 text-sm">
                    {userProfile?.position || <span className="text-[#94a3b8]">Not set</span>}
                  </div>
                )}
              </div>

              {/* Industry */}
              <div>
                <label className="block text-xs font-medium text-[#62748e] mb-1.5">Industry</label>
                {editingProfile ? (
                  <select
                    value={editIndustry}
                    onChange={e => setEditIndustry(e.target.value)}
                    className="w-full border border-[#e2e8f0] rounded-lg px-3 py-2.5 text-sm text-[#0f172b] bg-white focus:outline-none focus:border-[#0f172b] transition-colors"
                  >
                    <option value="">Select your industry</option>
                    {INDUSTRY_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : (
                  <div className="w-full bg-[#f8fafc] border border-[#e2e8f0] text-[#45556c] rounded-lg px-3 py-2.5 text-sm">
                    {userProfile?.industry || <span className="text-[#94a3b8]">Not set</span>}
                  </div>
                )}
              </div>

              {/* Experience Level */}
              <div>
                <label className="block text-xs font-medium text-[#62748e] mb-1.5">Experience Level</label>
                {editingProfile ? (
                  <select
                    value={editSeniority}
                    onChange={e => setEditSeniority(e.target.value)}
                    className="w-full border border-[#e2e8f0] rounded-lg px-3 py-2.5 text-sm text-[#0f172b] bg-white focus:outline-none focus:border-[#0f172b] transition-colors"
                  >
                    <option value="">Select your level</option>
                    {SENIORITY_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : (
                  <div className="w-full bg-[#f8fafc] border border-[#e2e8f0] text-[#45556c] rounded-lg px-3 py-2.5 text-sm">
                    {userProfile?.seniority || <span className="text-[#94a3b8]">Not set</span>}
                  </div>
                )}
              </div>
            </div>

            {/* Key Achievements */}
            <div className="mb-5">
              <label className="block text-xs font-medium text-[#62748e] mb-1.5">Key Achievements <span className="text-[#94a3b8]">(optional)</span></label>
              {editingProfile ? (
                <textarea
                  value={editAchievements}
                  onChange={e => setEditAchievements(e.target.value)}
                  rows={3}
                  placeholder="e.g. Led a team of 12, launched 3 products with $2M+ ARR..."
                  className="w-full border border-[#e2e8f0] rounded-lg px-3 py-2.5 text-sm text-[#0f172b] bg-white focus:outline-none focus:border-[#0f172b] transition-colors resize-none placeholder-[#94a3b8]"
                />
              ) : (
                <div className="w-full bg-[#f8fafc] border border-[#e2e8f0] text-[#45556c] rounded-lg px-3 py-2.5 text-sm min-h-[72px]">
                  {userProfile?.keyExperience || <span className="text-[#94a3b8]">No achievements added yet</span>}
                </div>
              )}
            </div>

            {/* CV / Resume */}
            <div>
              <label className="block text-xs font-medium text-[#62748e] mb-2">CV / Resume</label>
              {cvFileName ? (
                <div className="flex items-center justify-between px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-[#0f172b]">{cvFileName}</p>
                      <p className="text-xs text-emerald-600">Processed — used for session personalization</p>
                    </div>
                  </div>
                  {editingProfile && (
                    <button
                      onClick={handleCvDelete}
                      className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors"
                      style={{ fontWeight: 500 }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Remove
                    </button>
                  )}
                </div>
              ) : editingProfile ? (
                <div>
                  <input
                    ref={cvFileInputRef}
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={e => { const f = e.target.files?.[0]; if (f) handleCvUpload(f); }}
                  />
                  {cvUploadStatus === "uploading" ? (
                    <div className="flex items-center gap-2 px-4 py-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg">
                      <Loader2 className="w-4 h-4 animate-spin text-[#6366f1]" />
                      <span className="text-sm text-[#45556c]">Processing your CV...</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => cvFileInputRef.current?.click()}
                      className="w-full flex items-center gap-2 px-4 py-3 border border-dashed border-[#c7d2e0] rounded-lg text-sm text-[#62748e] hover:border-[#0f172b] hover:text-[#0f172b] transition-colors"
                    >
                      <Upload className="w-4 h-4" />
                      Upload CV / Resume (PDF)
                    </button>
                  )}
                  {cvError && <p className="text-xs text-red-500 mt-1.5">{cvError}</p>}
                </div>
              ) : (
                <div className="px-4 py-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg">
                  <p className="text-sm text-[#94a3b8]">No CV uploaded — click Edit to add one</p>
                </div>
              )}
            </div>
          </section>

          {/* SUBSCRIPTION CARD */}
          <section className="bg-white rounded-2xl border border-[#e2e8f0] p-6 hover:border-[#cad5e2] transition-colors shadow-sm">
            <h2 className="text-lg font-medium text-[#0f172b] mb-5 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-[#62748e]" />
              Plan & Usage
            </h2>

            {subInfo?.subscription_active ? (
              /* ── Active subscription ── */
              <>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1.5">
                      <h3 className="text-xl font-semibold text-[#0f172b]">
                        {TIER_LABELS[subInfo.tier ?? ""] ?? "MasteryTalk PRO"}
                      </h3>
                      <span className="bg-[#f0fdf4] text-[#16a34a] border border-[#bbf7d0] text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest">
                        Active
                      </span>
                    </div>
                    {subInfo.next_billing_date && (
                      <p className="text-xs text-[#62748e]">
                        Next renewal: {new Date(subInfo.next_billing_date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={handleManageSubscription}
                    disabled={portalLoading}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border border-[#e2e8f0] text-sm font-medium text-[#0f172b] hover:bg-[#f8fafc] transition-colors shrink-0 disabled:opacity-50"
                  >
                    {portalLoading ? (
                      <div className="w-4 h-4 rounded-full border-2 border-[#0f172b] border-t-transparent animate-spin" />
                    ) : (
                      <ExternalLink className="w-4 h-4" />
                    )}
                    {portalLoading ? "Loading..." : "Manage Subscription"}
                  </button>
                </div>

                <div className="mt-6 pt-6 border-t border-[#e2e8f0]">
                  <div className="flex items-center gap-2 mb-2 text-sm font-medium text-[#0f172b]">
                    <CheckCircle className="w-4 h-4 text-[#16a34a]" />
                    Sessions available
                  </div>
                  <div className="w-full bg-[#f1f5f9] rounded-full h-2 mb-2">
                    <div className="bg-[#00C950] h-2 rounded-full" style={{ width: "100%" }} />
                  </div>
                  <p className="text-xs text-[#62748e] text-right">Unlimited access to all paths</p>
                </div>
              </>
            ) : (
              /* ── Beta / no subscription ── */
              <>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-semibold text-[#0f172b]">Pioneer (Beta)</h3>
                  <span className="bg-[#f0fdf4] text-[#16a34a] border border-[#bbf7d0] text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest">Activo</span>
                </div>
                <p className="text-sm text-[#45556c] max-w-sm">During beta, you have full and free access to all practice paths on the platform.</p>
                <div className="mt-6 pt-6 border-t border-[#e2e8f0]">
                  <div className="flex items-center gap-2 mb-2 text-sm font-medium text-[#0f172b]">
                    <CheckCircle className="w-4 h-4 text-[#16a34a]" />
                    Sessions Available
                  </div>
                  <div className="w-full bg-[#f1f5f9] rounded-full h-2 mb-2">
                    <div className="bg-[#0f172b] h-2 rounded-full" style={{ width: "100%" }} />
                  </div>
                  <p className="text-xs text-[#62748e] text-right">Unlimited (Beta test phase)</p>
                </div>
              </>
            )}
          </section>

        </div>
      </main>

      <MiniFooter />

      {/* CONFIRM LOGOUT MODAL */}
      <AnimatePresence>
        {showConfirmLogout && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setShowConfirmLogout(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden p-6 text-center"
            >
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogOut className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-[#0f172b] mb-2">Sign out?</h3>
              <p className="text-[#45556c] text-sm mb-6">You'll need to sign in again to access your practice sessions.</p>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => {
                    setShowConfirmLogout(false);
                    onLogout();
                  }}
                  className="w-full py-3 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors text-sm font-medium"
                >
                  Yes, sign out
                </button>
                <button
                  onClick={() => setShowConfirmLogout(false)}
                  className="w-full py-3 rounded-lg bg-[#f1f5f9] text-[#45556c] hover:bg-[#e2e8f0] transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
