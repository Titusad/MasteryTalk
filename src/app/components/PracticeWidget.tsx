import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { authService } from "../../services";
import type { AuthProvider, ScenarioType } from "../../services/types";
import { isAuthError } from "../../services/errors";
import { useLandingCopy } from "./LandingLangContext";
import { ArrowRight, Sparkles, X, Loader2, Check, ArrowLeft } from "lucide-react";
import { Mic, Target, UserRound, Users, Briefcase, UserCheck, Heart, Shield, Search, Building2 } from "lucide-react";
import { SmoothHeight } from "./shared";
import {
  INTERLOCUTORS_BY_SCENARIO,
  DEFAULT_INTERLOCUTOR,
  type InterlocutorType,
} from "../../services/prompts";

/* ─── Scenario Type Data (used by PracticeSetupModal) ─── */
interface ScenarioOption {
  id: ScenarioType;
  label: string;
  icon: typeof Target;
  defaultInterlocutor: InterlocutorType;
}

const SCENARIO_TYPES: ScenarioOption[] = [
  { id: "interview", label: "Entrevista", icon: Mic, defaultInterlocutor: DEFAULT_INTERLOCUTOR.interview },
  { id: "sales", label: "Ventas", icon: Target, defaultInterlocutor: DEFAULT_INTERLOCUTOR.sales },
];

/* ─── Icon mapping per interlocutor ─── */
const INTERLOCUTOR_ICONS: Record<InterlocutorType, typeof Users> = {
  // Interview
  recruiter: UserCheck,
  sme: Briefcase,
  hiring_manager: Users,
  hr: Heart,
  // Sales
  gatekeeper: Shield,
  technical_buyer: Search,
  champion: UserRound,
  decision_maker: Building2,
};

/* ─── Guided Field shape (used by PracticeSetupModal with i18n) ─── */
interface GuidedField {
  key: string;
  label: string;
  placeholder: string;
}

/* ─── Scenario auto-detection (MVP: interview + sales only) ─── */
function detectScenarioFromInput(input: string): ScenarioType | null {
  if (!input) return null;
  const lower = input.toLowerCase();
  const rules: { keywords: string[]; type: ScenarioType }[] = [
    { keywords: ["entrevista", "interview", "recruiter", "hiring", "job", "puesto", "aplicar", "cv", "resume", "emprego", "candidata", "vaga"], type: "interview" },
    { keywords: ["venta", "ventas", "pitch", "demo", "sales", "cerrar", "cliente", "producto", "b2b", "saas", "vendas", "produto"], type: "sales" },
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
  const { copy } = useLandingCopy();
  const sm = copy.setupModal;

  /* ── Dynamic guided fields ── */
  const guidedFieldDefs: Record<string, GuidedField[]> = {
    interview: [
      { key: "role", label: sm.guidedFields.interview.role, placeholder: sm.guidedFields.interview.rolePlaceholder },
      { key: "strength", label: sm.guidedFields.interview.strength, placeholder: sm.guidedFields.interview.strengthPlaceholder },
    ],
    sales: [
      { key: "product", label: sm.guidedFields.sales.product, placeholder: sm.guidedFields.sales.productPlaceholder },
      { key: "problem", label: sm.guidedFields.sales.problem, placeholder: sm.guidedFields.sales.problemPlaceholder },
    ],
  };

  /* ── Auto-detect from widget input ── */
  const detectedType = detectScenarioFromInput(scenario);

  const [selectedScenario, setSelectedScenario] = useState<ScenarioType | null>(detectedType);
  const [selectedInterlocutor, setSelectedInterlocutor] = useState<InterlocutorType | null>(() => {
    if (detectedType) {
      return SCENARIO_TYPES.find((s) => s.id === detectedType)?.defaultInterlocutor ?? null;
    }
    return null;
  });
  const [interlocutorOverridden, setInterlocutorOverridden] = useState(false);

  const [guidedValues, setGuidedValues] = useState<Record<string, string>>({});
  const [loadingProvider, setLoadingProvider] = useState<AuthProvider | null>(null);
  const [inlineError, setInlineError] = useState<string | null>(null);
  const [modalStep, setModalStep] = useState<"interlocutor" | "context" | "ready">("interlocutor");

  /* ── Handle scenario type change (reset interlocutor to default) ── */
  const handleScenarioChange = (newScenario: ScenarioType) => {
    if (newScenario === selectedScenario) return;
    setSelectedScenario(newScenario);
    setInterlocutorOverridden(false);
    const defaultInt = DEFAULT_INTERLOCUTOR[newScenario];
    setSelectedInterlocutor(defaultInt);
    setGuidedValues({});
  };

  /* ── Dynamic interlocutor labels (filtered by selected scenario) ── */
  const i18nLabel = (id: InterlocutorType): string =>
    (sm.interlocutors as Record<string, string>)[id] ?? id;
  const i18nSub = (id: InterlocutorType): string =>
    (sm.interlocutors as Record<string, string>)[`${id}Sub`] ?? "";

  const interlocutorIds: InterlocutorType[] = selectedScenario
    ? INTERLOCUTORS_BY_SCENARIO[selectedScenario]
    : [];

  const interlocutors = interlocutorIds.map((id) => ({
    id,
    label: i18nLabel(id),
    sublabel: i18nSub(id),
    icon: INTERLOCUTOR_ICONS[id] ?? Users,
  }));

  /* ── Auto-select interlocutor when scenario changes ── */
  useEffect(() => {
    if (selectedScenario && !interlocutorOverridden) {
      const card = SCENARIO_TYPES.find((s) => s.id === selectedScenario);
      if (card) setSelectedInterlocutor(card.defaultInterlocutor);
    }
  }, [selectedScenario, interlocutorOverridden]);

  /* ── Compute progress steps ── */
  const currentFields = selectedScenario ? guidedFieldDefs[selectedScenario] : [];
  const hasAnyGuidedInput = currentFields.some(
    (f) => (guidedValues[f.key] ?? "").trim().length > 0
  );

  const STEP_ORDER: (typeof modalStep)[] = ["interlocutor", "context", "ready"];
  const currentStepIdx = STEP_ORDER.indexOf(modalStep);

  const progressSteps = [
    { label: sm.stepLabels[0], done: currentStepIdx > 0 },
    { label: sm.stepLabels[1], done: currentStepIdx > 1 },
    { label: sm.stepLabels[2], done: modalStep === "ready" },
  ];

  /* ── Validation ── */
  const canAuth = selectedScenario && selectedInterlocutor && hasAnyGuidedInput;

  /* ── Handle social auth ── */
  const handleSocialLogin = async (provider: AuthProvider) => {
    if (!canAuth || !selectedScenario || !selectedInterlocutor) return;
    setLoadingProvider(provider);
    setInlineError(null);

    // CRITICAL: Save setup data to localStorage BEFORE the OAuth redirect.
    // Google OAuth causes a full page reload, so onAuthComplete() would never fire.
    const setupData: SetupModalResult = {
      scenario,
      scenarioType: selectedScenario,
      interlocutor: selectedInterlocutor,
      guidedFields: { ...guidedValues },
    };
    try {
      localStorage.setItem("pendingAuthAction", JSON.stringify({ mode: "registro", data: setupData }));
    } catch { /* ignore */ }

    try {
      await authService.signIn(provider);
      // If signIn didn't redirect (e.g., popup flow), continue normally:
      setLoadingProvider(null);
      onClose();
      onAuthComplete?.(setupData, "registro");
    } catch (err) {
      setLoadingProvider(null);
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
          {/* ── Endowed Progress Stepper ── */}
          <div className="flex items-center gap-2 mb-8">
            {progressSteps.map((step, i) => {
              const isActive = !step.done && (i === 0 || progressSteps[i - 1].done);
              return (
                <div key={step.label} className="flex items-center gap-1.5 flex-1">
                  <div className="flex items-center gap-1.5 flex-1">
                    <motion.div
                      className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${step.done
                        ? "bg-[#0f172b]"
                        : isActive
                          ? "bg-[#0f172b]/10 ring-2 ring-[#0f172b]/30"
                          : "bg-[#e2e8f0]"
                        }`}
                      layout
                      transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
                    >
                      <AnimatePresence mode="wait">
                        {step.done ? (
                          <motion.div
                            key="check"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Check className="w-3 h-3 text-white" />
                          </motion.div>
                        ) : isActive ? (
                          <motion.div
                            key="dot"
                            className="w-1.5 h-1.5 rounded-full bg-[#0f172b]"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            transition={{ duration: 0.2 }}
                          />
                        ) : null}
                      </AnimatePresence>
                    </motion.div>
                    <span
                      className={`text-[13px] hidden sm:block transition-colors duration-300 ${step.done ? "text-[#0f172b]" : isActive ? "text-[#0f172b]" : "text-[#4b5563]"
                        }`}
                      style={{ fontWeight: step.done || isActive ? 600 : 400 }}
                    >
                      {step.label}
                    </span>
                  </div>
                  {i < progressSteps.length - 1 && (
                    <div className="h-[2px] w-full rounded-full bg-[#e2e8f0] overflow-hidden">
                      <motion.div
                        className="h-full bg-[#0f172b] rounded-full"
                        initial={false}
                        animate={{ width: step.done ? "100%" : "0%" }}
                        transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* ── Title — crossfade on step change ── */}
          <AnimatePresence mode="wait">
            <motion.div
              key={modalStep}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              <h3
                className="text-2xl text-[#0f172b] mb-1.5 text-center"
                style={{ fontWeight: 600 }}
              >
                {modalStep === "ready"
                  ? sm.titles.ready
                  : modalStep === "context"
                    ? sm.titles.context
                    : sm.titles.interlocutor}
              </h3>
              <p className="text-[#45556c] text-sm text-center mb-6">
                {modalStep === "ready"
                  ? sm.subtitles.ready
                  : modalStep === "context"
                    ? sm.subtitles.context
                    : sm.subtitles.interlocutor}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── Step content — single AnimatePresence for all steps ── */}
        <SmoothHeight>
          <AnimatePresence mode="wait" initial={false}>
            {modalStep === "interlocutor" && (
              <motion.div
                key="step-interlocutor"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
              >
                <div className="px-6 sm:px-12 pb-8">
                  {/* ── Scenario type toggle (Interview | Sales) ── */}
                  <div className="flex justify-center mb-6">
                    <div className="inline-flex rounded-full bg-[#f1f5f9] p-1 gap-1">
                      {SCENARIO_TYPES.map((tab) => {
                        const isActive = selectedScenario === tab.id;
                        const TabIcon = tab.icon;
                        const tabLabel = sm.scenarioLabels[tab.id as "sales" | "interview"] ?? tab.label;
                        return (
                          <button
                            key={tab.id}
                            onClick={() => handleScenarioChange(tab.id)}
                            className={`relative inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm transition-all duration-200 ${isActive
                              ? "bg-white text-[#0f172b] shadow-sm"
                              : "text-[#62748e] hover:text-[#314158]"
                              }`}
                            style={{ fontWeight: isActive ? 600 : 400, textTransform: "capitalize" }}
                          >
                            <TabIcon className="w-3.5 h-3.5" strokeWidth={1.5} />
                            {tabLabel}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* ── 2×2 Interlocutor Card Grid ── */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={selectedScenario ?? "empty"}
                      className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
                    >
                      {interlocutors.map((item, i) => {
                        const isSelected = selectedInterlocutor === item.id;
                        const Icon = item.icon;
                        return (
                          <motion.button
                            key={item.id}
                            onClick={() => {
                              setSelectedInterlocutor(item.id);
                              setInterlocutorOverridden(true);
                            }}
                            className={`relative flex items-start gap-3.5 rounded-2xl p-4 text-left border-2 transition-all duration-200 ${isSelected
                              ? "border-[#0f172b] bg-[#0f172b] text-white"
                              : "border-[#e2e8f0] bg-[#f8fafc] text-[#314158] hover:border-[#cad5e2] hover:bg-white"
                              }`}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.25, delay: i * 0.04 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            {/* Icon circle */}
                            <div
                              className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors duration-200 ${isSelected
                                ? "bg-white/15"
                                : "bg-[#0f172b]/5"
                                }`}
                            >
                              <Icon
                                className={`w-4 h-4 transition-colors duration-200 ${isSelected ? "text-white" : "text-[#0f172b]"
                                  }`}
                                strokeWidth={1.5}
                              />
                            </div>
                            {/* Text */}
                            <div className="min-w-0">
                              <p
                                className="text-sm leading-snug"
                                style={{ fontWeight: 600 }}
                              >
                                {item.label}
                              </p>
                              <p
                                className={`text-[12px] leading-snug mt-0.5 transition-colors duration-200 ${isSelected ? "text-white/65" : "text-[#62748e]"
                                  }`}
                              >
                                {item.sublabel}
                              </p>
                            </div>
                            {/* Selection indicator */}
                            {isSelected && (
                              <motion.div
                                className="absolute top-3 right-3 w-5 h-5 rounded-full bg-white flex items-center justify-center"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ duration: 0.2, ease: [0.25, 1, 0.5, 1] }}
                              >
                                <Check className="w-3 h-3 text-[#0f172b]" />
                              </motion.div>
                            )}
                          </motion.button>
                        );
                      })}
                    </motion.div>
                  </AnimatePresence>

                  {/* Next button */}
                  <AnimatePresence>
                    {selectedInterlocutor && (
                      <motion.div
                        className="mt-6"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 6 }}
                        transition={{ duration: 0.2 }}
                      >
                        <button
                          className="w-full py-3.5 rounded-full flex items-center justify-center gap-2.5 transition-all shadow-lg bg-[#2d2d2d] text-white hover:bg-[#1a1a1a]"
                          style={{ fontWeight: 500 }}
                          onClick={() => setModalStep("context")}
                        >
                          {sm.next}
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}

            {modalStep === "context" && (
              <motion.div
                key="step-context"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
              >
                {/* ── Guided Fields (2 only) ── */}
                {selectedScenario && (
                  <div className="px-12 pb-8">
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
                  </div>
                )}

                {/* ── Next button ── */}
                <div className="px-12 pb-10 pt-4">
                  <div className="border-t border-[#e2e8f0]/70 -mx-12 mb-6" />
                  <p
                    className="text-sm text-[#0f172b] text-center mb-6"
                    style={{ fontWeight: 500 }}
                  >
                    {hasAnyGuidedInput
                      ? sm.contextReady
                      : sm.contextNeeded}
                  </p>
                  <button
                    className={`w-full py-3.5 rounded-full flex items-center justify-center gap-2.5 transition-all shadow-lg ${hasAnyGuidedInput
                      ? "bg-[#2d2d2d] text-white hover:bg-[#1a1a1a]"
                      : "bg-[#cad5e2] text-white cursor-not-allowed"
                      }`}
                    style={{ fontWeight: 500 }}
                    onClick={() => setModalStep("ready")}
                    disabled={!hasAnyGuidedInput}
                  >
                    {sm.next}
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  {/* Back button */}
                  <button
                    className="w-full mt-4 py-2.5 text-sm text-[#62748e] hover:text-[#0f172b] flex items-center justify-center gap-1.5 transition-colors"
                    style={{ fontWeight: 500 }}
                    onClick={() => {
                      setModalStep("interlocutor");
                    }}
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    {sm.back}
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── STEP: READY — Preview + Auth ── */}
            {modalStep === "ready" && (
              <motion.div
                key="step-ready"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
              >
                <div className="px-12 pb-12 pt-5">
                  {/* Subtle divider */}
                  <div className="border-t border-[#e2e8f0]/70 -mx-12 mb-8" />

                  {/* Value Preview teaser */}
                  <motion.div
                    className="bg-gradient-to-r from-[#f0f9ff] to-[#eef2ff] rounded-xl border border-[#bfdbfe]/40 p-6 mb-8"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.08 }}
                  >
                    <div className="flex items-start gap-2.5">
                      <Sparkles className="w-4 h-4 text-[#6366f1] shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs text-[#6366f1] mb-1" style={{ fontWeight: 600 }}>
                          {sm.previewTitle}
                        </p>
                        <p className="text-xs text-[#314158] leading-relaxed">
                          {sm.previewBody}{" "}
                          {selectedScenario ? sm.scenarioLabels[selectedScenario as "sales" | "interview"] ?? "" : ""}...
                        </p>
                        {/* Blurred continuation */}
                        <div className="relative overflow-hidden h-5 mt-1">
                          <p className="text-xs text-[#314158] blur-[3px]">
                            {sm.previewBlurred}
                          </p>
                          <div className="absolute inset-0 bg-gradient-to-t from-[#f0f9ff] to-transparent" />
                        </div>
                      </div>
                    </div>
                  </motion.div>

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

                  {/* Auth buttons */}
                  <div className="flex flex-col gap-4">
                    <button
                      className="w-full py-4 rounded-full flex items-center justify-center gap-3 transition-all shadow-lg bg-[#2d2d2d] text-white hover:bg-[#1a1a1a]"
                      style={{ fontWeight: 500 }}
                      onClick={() => handleSocialLogin("google")}
                      disabled={loadingProvider !== null}
                    >
                      {loadingProvider === "google" ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <GoogleIcon />
                      )}
                      {sm.continueGoogle}
                    </button>
                  </div>

                  <p className="text-center text-sm text-[#4b5563] mt-7">
                    {sm.trustLine}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </SmoothHeight>
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

  const { copy } = useLandingCopy();

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
            className="text-center text-[#0f172b] text-xl md:text-2xl mb-2"
            style={{ fontWeight: 300 }}
          >
            {copy.widget.heading}
          </h2>
          <p className="text-center text-[#62748e] text-sm mb-8">
            {copy.widget.subheading}
          </p>

          {/* Scenario CTA cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                id: "sales" as ScenarioType,
                label: copy.widget.salesLabel,
                description: copy.widget.salesDesc,
                icon: Target,
                scenarioText: copy.widget.salesLabel,
              },
              {
                id: "interview" as ScenarioType,
                label: copy.widget.interviewLabel,
                description: copy.widget.interviewDesc,
                icon: Mic,
                scenarioText: copy.widget.interviewLabel,
              },
            ].map((card) => {
              const Icon = card.icon;
              return (
                <motion.button
                  key={card.id}
                  onClick={() => handleScenarioClick(card)}
                  className="group/card relative bg-[#f8fafc] hover:bg-[#0f172b] border-2 border-[#e2e8f0] hover:border-[#0f172b] rounded-2xl p-6 text-left transition-all duration-300 cursor-pointer"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Icon */}
                  <div className="w-11 h-11 rounded-full bg-[#0f172b] group-hover/card:bg-white flex items-center justify-center mb-4 transition-colors duration-300">
                    <Icon className="w-5 h-5 text-white group-hover/card:text-[#0f172b] transition-colors duration-300" strokeWidth={1.5} />
                  </div>

                  {/* Label */}
                  <p
                    className="text-[#0f172b] group-hover/card:text-white text-[15px] mb-1.5 transition-colors duration-300"
                    style={{ fontWeight: 600 }}
                  >
                    {card.label}
                  </p>

                  {/* Description */}
                  <p className="text-[#62748e] group-hover/card:text-white/70 text-[13px] leading-relaxed transition-colors duration-300">
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