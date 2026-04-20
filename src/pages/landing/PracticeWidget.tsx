import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { authService } from "@/services";
import type { AuthProvider, ScenarioType } from "@/services/types";
import { isAuthError } from "@/services/errors";
import { useLandingCopy } from "@/shared/i18n/LandingLangContext";
import { ArrowRight, Sparkles, X, Loader2, Check, ArrowLeft } from "lucide-react";
import { Mic, Target } from "lucide-react";
import { SmoothHeight } from "@/shared/ui";
import { TermsCheckbox } from "@/shared/ui/TermsCheckbox";
import {
  DEFAULT_INTERLOCUTOR,
  type InterlocutorType,
} from "@/services/prompts";

/* ─── Scenario Type Data (used by PracticeSetupModal) ─── */
interface ScenarioOption {
  id: ScenarioType;
  label: string;
  icon: typeof Target;
  defaultInterlocutor: InterlocutorType;
}

const SCENARIO_TYPES: ScenarioOption[] = [
  { id: "interview", label: "Entrevista", icon: Mic, defaultInterlocutor: DEFAULT_INTERLOCUTOR.interview },
  { id: "meeting", label: "Reuniones", icon: Target, defaultInterlocutor: DEFAULT_INTERLOCUTOR.meeting },
  { id: "presentation", label: "Presentaciones", icon: Sparkles, defaultInterlocutor: DEFAULT_INTERLOCUTOR.presentation },
];

/* ─── Guided Field shape (used by PracticeSetupModal with i18n) ─── */
interface GuidedField {
  key: string;
  label: string;
  placeholder: string;
}

/* ─── Scenario auto-detection (MVP: interview + meeting + presentation) ─── */
function detectScenarioFromInput(input: string): ScenarioType | null {
  if (!input) return null;
  const lower = input.toLowerCase();
  const rules: { keywords: string[]; type: ScenarioType }[] = [
    { keywords: ["entrevista", "interview", "recruiter", "hiring", "job", "puesto", "aplicar", "cv", "resume", "emprego", "candidata", "vaga"], type: "interview" },
    { keywords: ["reunión", "meeting", "standup", "sync", "daily", "sprint", "retro", "scrum", "equipo", "team", "remote", "remoto", "reuniao"], type: "meeting" },
    { keywords: ["presentación", "presentation", "pitch", "slides", "keynote", "audience", "público", "apresentação", "palestra"], type: "presentation" },
  ];
  for (const rule of rules) {
    if (rule.keywords.some((kw) => lower.includes(kw))) return rule.type;
  }
  return null;
}

/* ─── Social Icons ─── */
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

/* ═══════════════════════ PRACTICE SETUP MODAL ═══════════════════════ */

export interface SetupModalResult {
  scenario: string;
  scenarioType: ScenarioType;
  interlocutor: InterlocutorType;
  guidedFields: Record<string, string>;
}

function PracticeSetupModal({
  scenario,
  onClose,
  onAuthComplete,
}: {
  scenario: string;
  onClose: () => void;
  onAuthComplete?: (data: SetupModalResult, authMode?: "login" | "registro") => void;
}) {
  const { copy, lang } = useLandingCopy();
  const sm = copy.setupModal;

  const shortSoon = lang === "es" ? "PRONTO" : lang === "pt" ? "BREVE" : "SOON";

  /* ── Dynamic guided fields ── */
  const guidedFieldDefs: Record<string, GuidedField[]> = {
    interview: [
      { key: "role", label: sm.guidedFields.interview.role, placeholder: sm.guidedFields.interview.rolePlaceholder },
      { key: "company", label: sm.guidedFields.interview.company, placeholder: sm.guidedFields.interview.companyPlaceholder },
    ],
    meeting: [
      { key: "topic", label: lang === "es" ? "Tema de la reunión" : lang === "pt" ? "Tópico da reunião" : "Meeting topic", placeholder: lang === "es" ? "Ej: Sprint review, Project kickoff" : lang === "pt" ? "Ex: Sprint review, Project kickoff" : "E.g. Sprint review, Project kickoff" },
      { key: "role", label: lang === "es" ? "Tu rol en la reunión" : lang === "pt" ? "Seu papel na reunião" : "Your role in the meeting", placeholder: lang === "es" ? "Ej: Product Manager, Tech Lead" : lang === "pt" ? "Ex: Product Manager, Tech Lead" : "E.g. Product Manager, Tech Lead" },
    ],
    presentation: [
      { key: "topic", label: lang === "es" ? "Tema de la presentación" : lang === "pt" ? "Tópico da apresentação" : "Presentation topic", placeholder: lang === "es" ? "Ej: Resultados Q1, Propuesta de proyecto" : lang === "pt" ? "Ex: Resultados Q1, Proposta de projeto" : "E.g. Q1 Results, Project proposal" },
      { key: "audience", label: lang === "es" ? "Audiencia" : lang === "pt" ? "Audiência" : "Audience", placeholder: lang === "es" ? "Ej: Equipo directivo, Clientes, Inversores" : lang === "pt" ? "Ex: Diretoria, Clientes, Investidores" : "E.g. Leadership team, Clients, Investors" },
    ],
  };

  /* ── Auto-detect from widget input ── */
  const detectedType = detectScenarioFromInput(scenario);

  const [selectedScenario, setSelectedScenario] = useState<ScenarioType | null>(detectedType);

  /* ── Interlocutor auto-derived from scenario type (no user selector) ── */
  const selectedInterlocutor: InterlocutorType | null = selectedScenario
    ? DEFAULT_INTERLOCUTOR[selectedScenario]
    : null;

  const [guidedValues, setGuidedValues] = useState<Record<string, string>>({});
  const [loadingProvider, setLoadingProvider] = useState<AuthProvider | null>(null);
  const [inlineError, setInlineError] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);

  /* ── Handle scenario type change ── */
  const handleScenarioChange = (newScenario: ScenarioType) => {
    if (newScenario === selectedScenario) return;
    setSelectedScenario(newScenario);
    setGuidedValues({});
  };

  const currentFields = selectedScenario ? guidedFieldDefs[selectedScenario] : [];
  const hasAnyGuidedInput = currentFields.some(
    (f) => (guidedValues[f.key] ?? "").trim().length > 0
  );

  /* ── Validation ── */
  const canAuth = selectedScenario && selectedInterlocutor && hasAnyGuidedInput && termsAccepted;

  /* ── Handle social auth ── */
  const handleSocialLogin = async (provider: AuthProvider) => {
    if (!canAuth || !selectedScenario || !selectedInterlocutor) return;
    setLoadingProvider(provider);
    setInlineError(null);

    try {
      // DEV MODE: Persist setup in sessionStorage so it survives OAuth redirect
      try {
        sessionStorage.setItem("masterytalk_pending_setup", JSON.stringify({
          scenario,
          scenarioType: selectedScenario,
          interlocutor: selectedInterlocutor,
          guidedFields: { ...guidedValues },
        }));
        sessionStorage.setItem("masterytalk_oauth_pending", "true");
      } catch { /* ignore */ }

      await authService.signIn(provider);
      setLoadingProvider(null);
      onClose();
    } catch (err) {
      setLoadingProvider(null);
      try {
        sessionStorage.removeItem("masterytalk_pending_setup");
        sessionStorage.removeItem("masterytalk_oauth_pending");
      } catch { /* ignore */ }
      if (isAuthError(err)) {
        setInlineError(err.userMessage);
      } else {
        setInlineError(copy.auth.errorFallback);
      }
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 z-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <motion.div
        className="relative z-10 bg-white rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-9 h-9 rounded-full bg-[#f1f5f9] flex items-center justify-center hover:bg-[#e2e8f0] transition-colors z-10"
        >
          <X className="w-4 h-4 text-[#45556c]" />
        </button>

        <div className="px-12 pt-10 pb-6">
          <h3
            className="text-2xl text-[#0f172b] mb-1.5 text-center"
            style={{ fontWeight: 600 }}
          >
            {sm.titles.context}
          </h3>
          <p className="text-[#45556c] text-sm text-center mb-6">
            {sm.subtitles.context}
          </p>
        </div>

        {/* ── Step content ── */}
        <div className="px-6 sm:px-12 pb-8">
                  {/* ── Scenario type toggle (Interview | Sales) ── */}
                  <div className="flex justify-center mb-6">
                    <div className="inline-flex rounded-full bg-[#f1f5f9] p-1 gap-1">
                      {SCENARIO_TYPES.map((tab) => {
                        const isActive = selectedScenario === tab.id;
                        const TabIcon = tab.icon;
                        const tabLabel = sm.scenarioLabels[tab.id as "sales" | "interview"] ?? tab.label;
                        const isDisabled = false;
                        return (
                          <button
                            key={tab.id}
                            disabled={isDisabled}
                            onClick={isDisabled ? undefined : () => handleScenarioChange(tab.id)}
                            className={`relative inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm transition-all duration-200 ${isActive
                              ? "bg-white text-[#0f172b] shadow-sm"
                              : isDisabled
                                ? "text-[#94a3b8] opacity-60 cursor-not-allowed"
                                : "text-[#62748e] hover:text-[#314158]"
                              }`}
                            style={{ fontWeight: isActive ? 600 : 400, textTransform: "capitalize" }}
                          >
                            <TabIcon className="w-3.5 h-3.5" strokeWidth={1.5} />
                            {tabLabel}
                            {isDisabled && <span className="text-[9px] bg-[#e2e8f0] text-[#62748e] px-1.5 py-0.5 rounded-full ml-1 uppercase" style={{ fontWeight: 700 }}>{shortSoon}</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* ── Guided Fields (2 only) ── */}
                  {selectedScenario && (
                    <div className="space-y-6">
                      {currentFields.map((field, i) => (
                        <motion.div
                          key={`${selectedScenario}-${field.key}`}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: 0.05 + i * 0.08 }}
                        >
                          <label className="block mb-1.5">
                            <span className="text-sm text-[#0f172b]" style={{ fontWeight: 500 }}>
                              {field.label}
                            </span>
                          </label>
                          <input
                            type="text"
                            value={guidedValues[field.key] ?? ""}
                            onChange={(e) =>
                              setGuidedValues((prev) => ({
                                ...prev,
                                [field.key]: e.target.value,
                              }))
                            }
                            placeholder={field.placeholder}
                            className="w-full bg-[#f8fafc] border-2 border-[#e2e8f0] rounded-xl py-3 px-4 text-[#0f172b] placeholder:text-[#94a3b8] focus:outline-none focus:border-[#0f172b] transition-colors"
                            style={{ fontSize: "14px" }}
                          />
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>

                {/* ── Continue Action ── */}
                <div className="px-12 pb-10 pt-4">
                  <div className="border-t border-[#e2e8f0]/70 -mx-12 mb-6" />
                  
                  {/* Inline error */}
                  <AnimatePresence>
                    {inlineError && (
                      <motion.div
                        className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700"
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.2 }}
                      >
                        {inlineError}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {hasAnyGuidedInput ? (
                      <div className="flex flex-col gap-4">
                         <p className="text-sm text-[#0f172b] text-center mb-2" style={{ fontWeight: 500 }}>
                           {sm.contextReady}
                         </p>
                        {/* Terms checkbox */}
                        <div className="mb-3">
                          <TermsCheckbox checked={termsAccepted} onChange={setTermsAccepted} lang={lang} />
                        </div>
                        <button
                          className={`w-full py-4 rounded-full flex items-center justify-center gap-3 transition-all duration-200 shadow-lg ${
                            termsAccepted
                              ? "bg-[#2d2d2d] text-white hover:bg-[#1a1a1a]"
                              : "bg-[#cad5e2] text-white/70 cursor-not-allowed"
                          }`}
                          style={{ fontWeight: 500 }}
                          onClick={() => handleSocialLogin("google")}
                          disabled={loadingProvider !== null || !termsAccepted}
                        >
                          {loadingProvider === "google" ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <GoogleIcon />
                          )}
                          {sm.continueGoogle}
                        </button>

                      </div>
                  ) : (
                      <div className="flex flex-col gap-4">
                         <p className="text-sm text-[#0f172b] text-center mb-2" style={{ fontWeight: 500 }}>
                           {sm.contextNeeded}
                         </p>
                        <button
                          className="w-full py-4 rounded-full flex items-center justify-center gap-3 transition-all shadow-lg bg-[#cad5e2] text-white cursor-not-allowed"
                          style={{ fontWeight: 500 }}
                          disabled
                        >
                          <GoogleIcon />
                          {sm.continueGoogle}
                        </button>
                      </div>
                  )}
                </div>
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════════ PRACTICE WIDGET (embeddable) ═══════════════════════ */
export function PracticeWidget({
  onAuthComplete,
}: {
  onAuthComplete?: (data: SetupModalResult, authMode?: "login" | "registro") => void;
}) {
  const [showModal, setShowModal] = useState(false);
  const [submittedScenario, setSubmittedScenario] = useState("");

  const handleScenarioClick = (card: { id: ScenarioType; scenarioText: string }) => {
    setSubmittedScenario(card.scenarioText);
    setShowModal(true);
  };

  // Lock body scroll when modal is open
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showModal]);

  const { copy, lang } = useLandingCopy();
  const comingSoonText = lang === "es" ? "Próximamente" : lang === "pt" ? "Em breve" : "Coming soon";

  return (
    <>
      {/* White card with heading + CTA cards — wrapped in glow container */}
      <div className="relative group">
        {/* Rotating gradient glow behind the card */}
        <div
          className="absolute -inset-[2px] rounded-[26px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-[2px] pointer-events-none"
          style={{
            background: "linear-gradient(135deg, #00D3F3, #50C878, #E1D5F8, #FFE9C7, #00D3F3)",
            backgroundSize: "300% 300%",
            animation: "glowRotate 6s ease infinite",
          }}
        />
        {/* Subtle always-on ambient glow */}
        <div
          className="absolute -inset-[1px] rounded-[26px] opacity-40 pointer-events-none blur-[1px]"
          style={{
            background: "linear-gradient(135deg, #00D3F3, #50C878, #E1D5F8, #FFE9C7, #00D3F3)",
            backgroundSize: "300% 300%",
            animation: "glowRotate 6s ease infinite",
          }}
        />
        <div className="relative bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-gray-100">
          <h2
            className="text-center text-[#0f172b] text-xl md:text-2xl mb-6"
            style={{ fontWeight: 300 }}
          >
            {copy.widget.instruction}
          </h2>

          {/* Scenario CTA cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                id: "interview" as ScenarioType,
                label: copy.widget.interviewLabel,
                description: copy.widget.interviewHook,
                icon: Mic,
                scenarioText: copy.widget.interviewLabel,
              },
              {
                id: "meeting" as ScenarioType,
                label: copy.widget.meetingLabel,
                description: copy.widget.meetingHook,
                icon: Target,
                scenarioText: copy.widget.meetingLabel,
              },
              {
                id: "presentation" as ScenarioType,
                label: copy.widget.presentationLabel,
                description: copy.widget.presentationHook,
                icon: Sparkles,
                scenarioText: copy.widget.presentationLabel,
              },
            ].map((card) => {
              const Icon = card.icon;
              return (
                <motion.button
                  key={card.id}
                  onClick={() => handleScenarioClick(card)}
                  className="group/card relative rounded-2xl p-6 text-left transition-all duration-300 bg-[#f8fafc] hover:bg-[#0f172b] border-2 border-[#e2e8f0] hover:border-[#0f172b] cursor-pointer"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Icon */}
                  <div className="w-11 h-11 rounded-full flex items-center justify-center mb-4 transition-colors duration-300 bg-[#0f172b] group-hover/card:bg-white">
                    <Icon className="w-5 h-5 transition-colors duration-300 text-white group-hover/card:text-[#0f172b]" strokeWidth={1.5} />
                  </div>

                  {/* Label */}
                  <p
                    className="text-[15px] mb-1.5 transition-colors duration-300 text-[#0f172b] group-hover/card:text-white"
                    style={{ fontWeight: 600 }}
                  >
                    {card.label}
                  </p>

                  {/* Description */}
                  <p className="text-[13px] leading-relaxed transition-colors duration-300 text-[#62748e] group-hover/card:text-white/70">
                    {card.description}
                  </p>

                  {/* Arrow indicator */}
                  <div className="absolute top-6 right-6 w-8 h-8 rounded-full bg-transparent group-hover/card:bg-white/15 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-all duration-300">
                    <ArrowRight className="w-4 h-4 text-white" />
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Practice Setup Modal */}
      {createPortal(
        <AnimatePresence>
          {showModal && (
            <PracticeSetupModal
              scenario={submittedScenario}
              onClose={() => setShowModal(false)}
              onAuthComplete={onAuthComplete}
            />
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}