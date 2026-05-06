/**
 * ══════════════════════════════════════════════════════════════
 *  WhatsAppActivationCard — Dashboard component for linking
 *  a WhatsApp number to receive daily SR pronunciation coaching.
 *
 *  States: idle → inputting → sending OTP → verifying → verified
 * ══════════════════════════════════════════════════════════════
 */
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MessageCircle, Check, Loader2, ArrowRight, ShieldCheck, Clock } from "lucide-react";
import { SUPABASE_URL, getAuthToken } from "@/services/supabase";

const BASE = `${SUPABASE_URL}/functions/v1/make-server-08b8658d`;

async function apiFetch(path: string, body?: Record<string, unknown>) {
  const token = await getAuthToken();
  return fetch(`${BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}

async function putProfile(updates: Record<string, unknown>) {
  const token = await getAuthToken();
  return fetch(`${BASE}/profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(updates),
  });
}

type Step = "idle" | "input" | "sending" | "verify" | "verifying" | "time-pref" | "done";

const TIME_OPTIONS: { label: string; hour: number; sublabel: string }[] = [
  { label: "Morning", hour: 7, sublabel: "7:00 AM" },
  { label: "Midday", hour: 12, sublabel: "12:00 PM" },
  { label: "Evening", hour: 18, sublabel: "6:00 PM" },
];

interface WhatsAppActivationCardProps {
  whatsappVerified?: boolean;
  whatsappNumber?: string;
  /** "dashboard" (default) = dark card · "feedback" = white card + dismiss */
  variant?: "dashboard" | "feedback";
  /** Number of previous dismissals (0 = first, 1 = second → permanent) */
  dismissCount?: number;
  onDismiss?: () => void;
  /** A phrase from the current session to anchor the WA CTA contextually */
  strongerPhrase?: string | null;
}

export function WhatsAppActivationCard({
  whatsappVerified = false,
  whatsappNumber: initialNumber,
  variant = "dashboard",
  dismissCount = 0,
  onDismiss,
  strongerPhrase,
}: WhatsAppActivationCardProps) {
  const [step, setStep] = useState<Step>(whatsappVerified ? "done" : "idle");
  const [phone, setPhone] = useState(initialNumber || "");
  const [countryCode, setCountryCode] = useState("+");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const [savingPref, setSavingPref] = useState(false);

  const fullNumber = `${countryCode}${phone.replace(/\D/g, "")}`;

  const handleSendOTP = async () => {
    setError(null);
    setStep("sending");
    try {
      const res = await apiFetch("/whatsapp/send-otp", { phoneNumber: fullNumber });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not send the code");
        setStep("input");
        return;
      }
      setStep("verify");
    } catch {
      setError("Connection error. Please try again.");
      setStep("input");
    }
  };

  const handleVerifyOTP = async () => {
    setError(null);
    setStep("verifying");
    try {
      const res = await apiFetch("/whatsapp/verify-otp", {
        phoneNumber: fullNumber,
        code: otp,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Invalid code");
        setStep("verify");
        return;
      }
      // Go to time preference step before completing
      setStep("time-pref");
    } catch {
      setError("Connection error. Please try again.");
      setStep("verify");
    }
  };

  const handleSaveTimePref = async (hour: number) => {
    setSelectedHour(hour);
    setSavingPref(true);
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    try {
      await putProfile({ wa_preferred_hour: hour, wa_timezone: timezone });
    } catch {
      // Non-blocking — preference saved best-effort
    } finally {
      setSavingPref(false);
      setStep("done");
    }
  };

  // Already verified — show compact confirmation
  if (step === "done") {
    return (
      <motion.div
        className="bg-white border border-[#d1fae5] rounded-2xl p-4 flex items-center gap-4"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <span className="flex items-center justify-center w-10 h-10 rounded-full bg-[#10b981]/10">
          <Check className="w-5 h-5 text-[#10b981]" />
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-[#0f172b] font-semibold" >
            WhatsApp Coach active
          </p>
          <p className="text-xs text-[#62748e] truncate">
            You'll receive daily practice phrases on your WhatsApp
          </p>
        </div>
        <ShieldCheck className="w-4 h-4 text-[#10b981] shrink-0" />
      </motion.div>
    );
  }

  // Idle — promotional CTA (two visual variants)
  if (step === "idle") {
    // Feedback variant: white card, contextual copy, dismissible
    if (variant === "feedback") {
      return (
        <motion.div
          className="bg-white border border-[#e2e8f0] rounded-2xl p-4 flex items-start gap-4"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <span className="flex items-center justify-center w-10 h-10 rounded-full bg-[#25d366]/10 shrink-0 mt-0.5">
            <MessageCircle className="w-5 h-5 text-[#25d366]" />
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-[#0f172b] mb-1 font-semibold">
              Practice this on WhatsApp tomorrow
            </p>
            {strongerPhrase && (
              <p className="text-xs text-[#0f172b]/70 italic leading-relaxed mb-1 border-l-2 border-[#6366f1]/30 pl-2">
                "{strongerPhrase.length > 80 ? strongerPhrase.slice(0, 77) + "…" : strongerPhrase}"
              </p>
            )}
            <p className="text-xs text-[#62748e] leading-relaxed mb-3">
              Activate your coach in 30 seconds — daily audio challenges, instant pronunciation score.
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={() => setStep("input")}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs bg-[#0f172b] text-white hover:bg-[#1d293d] transition-colors cursor-pointer font-semibold"
                
              >
                <MessageCircle className="w-3.5 h-3.5" />
                Activate coach
              </button>
              {onDismiss && (
                <button
                  onClick={onDismiss}
                  className="text-xs text-[#94a3b8] hover:text-[#62748e] transition-colors cursor-pointer font-medium"
                  
                >
                  {dismissCount >= 1 ? "Don't show again" : "Maybe later"}
                </button>
              )}
            </div>
          </div>
        </motion.div>
      );
    }

    // Dashboard variant: dark gradient card (original)
    return (
      <motion.div
        className="bg-gradient-to-br from-[#0f172b] to-[#1e293b] rounded-2xl p-6 relative overflow-hidden"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-gradient-to-br from-[#10b981]/15 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex items-start gap-4">
          <span className="flex items-center justify-center w-11 h-11 rounded-full bg-[#25d366]/15 shrink-0 mt-0.5">
            <MessageCircle className="w-5 h-5 text-[#25d366]" />
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm mb-1 font-semibold" >
              Activate your WhatsApp Pronunciation Coach
            </p>
            <p className="text-white/60 text-xs leading-relaxed mb-4">
              Get daily practice phrases sent to your phone. Reply with audio and receive your score instantly.
            </p>
            <button
              onClick={() => setStep("input")}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs bg-[#25d366] text-white hover:bg-[#22c55e] transition-colors cursor-pointer font-semibold"
              
            >
              <MessageCircle className="w-3.5 h-3.5" />
              Link WhatsApp
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  // Time preference step — shown after OTP verified, before "done"
  if (step === "time-pref") {
    return (
      <motion.div
        className="bg-white border border-[#e2e8f0] rounded-2xl p-6"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-4">
          <span className="flex items-center justify-center w-9 h-9 rounded-full bg-[#6366f1]/10">
            <Clock className="w-4 h-4 text-[#6366f1]" />
          </span>
          <div>
            <p className="text-sm text-[#0f172b] font-semibold" >
              When should your coach reach you?
            </p>
            <p className="text-xs text-[#62748e]">We'll send your daily challenge at this time.</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-2">
          {TIME_OPTIONS.map((opt) => (
            <button
              key={opt.hour}
              onClick={() => !savingPref && handleSaveTimePref(opt.hour)}
              disabled={savingPref}
              className={`flex flex-col items-center gap-1 py-3 rounded-xl border text-xs transition-all cursor-pointer disabled:opacity-50 ${
                selectedHour === opt.hour
                  ? "border-[#6366f1] bg-[#6366f1]/5 text-[#6366f1] font-semibold"
                  : "border-[#e2e8f0] text-[#45556c] hover:border-[#94a3b8] font-medium"
              }`}
            >
              {savingPref && selectedHour === opt.hour ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : null}
              <span>{opt.label}</span>
              <span className="text-[10px] opacity-60">{opt.sublabel}</span>
            </button>
          ))}
        </div>

        <p className="text-[10px] text-[#94a3b8] text-center mt-2">
          Timezone detected automatically · Change anytime from your account
        </p>
      </motion.div>
    );
  }

  // Input + Verify flow
  return (
    <motion.div
      className="bg-white border border-[#e2e8f0] rounded-2xl p-6"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center gap-3 mb-4">
        <span className="flex items-center justify-center w-9 h-9 rounded-full bg-[#25d366]/10">
          <MessageCircle className="w-4 h-4 text-[#25d366]" />
        </span>
        <p className="text-sm text-[#0f172b] font-semibold" >
          {step === "verify" || step === "verifying"
            ? "Enter your verification code"
            : "Enter your WhatsApp number"}
        </p>
      </div>

      <AnimatePresence mode="wait">
        {(step === "input" || step === "sending") && (
          <motion.div
            key="phone-input"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                placeholder="+1"
                value={countryCode}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^\d+]/g, "");
                  setCountryCode(val.startsWith("+") ? val : `+${val}`);
                }}
                className="w-20 px-3 py-2.5 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] text-sm text-[#0f172b] text-center focus:outline-none focus:border-[#6366f1]"
                maxLength={5}
              />
              <input
                type="tel"
                placeholder="Phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-[#e2e8f0] text-sm text-[#0f172b] placeholder-[#94a3b8] focus:outline-none focus:border-[#6366f1]"
                maxLength={15}
              />
            </div>
            <button
              onClick={handleSendOTP}
              disabled={countryCode.length < 2 || phone.replace(/\D/g, "").length < 6 || step === "sending"}
              className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm bg-[#0f172b] text-white hover:bg-[#1e293b] transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer font-medium"
              
            >
              {step === "sending" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ArrowRight className="w-4 h-4" />
              )}
              {step === "sending" ? "Sending code..." : "Send code via WhatsApp"}
            </button>
          </motion.div>
        )}

        {(step === "verify" || step === "verifying") && (
          <motion.div
            key="otp-input"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <p className="text-xs text-[#62748e] mb-3">
              We sent a 6-digit code to <span className="font-semibold">{fullNumber}</span>
            </p>
            <input
              type="text"
              placeholder="000000"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className="w-full px-4 py-2.5 rounded-xl border border-[#e2e8f0] text-sm text-[#0f172b] placeholder-[#94a3b8] text-center tracking-[0.3em] focus:outline-none focus:border-[#6366f1] mb-3 font-semibold"
              style={{ fontSize: "1.1rem" }}
              maxLength={6}
              autoFocus
            />
            <button
              onClick={handleVerifyOTP}
              disabled={otp.length < 6 || step === "verifying"}
              className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm bg-[#0f172b] text-white hover:bg-[#1e293b] transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer font-medium"
              
            >
              {step === "verifying" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ShieldCheck className="w-4 h-4" />
              )}
              {step === "verifying" ? "Verifying..." : "Verify code"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <p className="text-xs text-[#ef4444] mt-3">{error}</p>
      )}
    </motion.div>
  );
}
