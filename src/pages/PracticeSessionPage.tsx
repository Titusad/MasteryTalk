import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Menu } from "lucide-react";
import { AppHeader, MiniFooter, NarrationToggle } from "@/shared/ui";
import { AnalyzingScreen } from "@/shared/ui";
import { PracticeSideNav } from "@/widgets/PracticeSideNav";
import type { SessionStepItem } from "@/widgets/PracticeSideNav";
import { realConversationService } from "@/services";
import { toServiceError } from "@/services/errors";
import type { ServiceError } from "@/services/errors";

import { getLevelDefinition } from "@/entities/progression";
import type { PathId } from "@/entities/progression";
import { ProgressionProvider } from "@/shared/lib/ProgressionContext";
import { ServiceErrorBanner } from "@/shared/ui";
import { useMediaRecorder } from "@/shared/hooks/useMediaRecorder";
import { projectId, publicAnonKey } from "@/../utils/supabase/info";
import { getAuthToken } from "@/services/supabase";
import type {
  ScenarioType,
  UserPlan,
  SessionConfig,
} from "@/services/types";
import { SessionProgressBar } from "@/shared/ui";
import { PracticePrepScreen } from "@/widgets/PracticePrepScreen";
import type { Step } from "@/entities/session";
import { VoicePractice } from "@/features/practice-session/ui/VoicePractice";
import { UpsellScreen } from "@/features/skill-drill/ui/UpsellScreen";
import { useUsageGating } from "@/shared/hooks/useUsageGating";
import type { PaywallReason } from "@/shared/hooks/useUsageGating";
import type { OnboardingProfile } from "@/services/types";
import {
  scenarioKey,
  simpleHash,
  interviewBriefingCache,
  cvMatchCacheV2,
  scriptCache,
  toolkitCache,
  cleanupExpiredCache,
} from "@/shared/lib/sessionCache";
import { analyzeCvMatch } from "@/services/cvMatchService";

/* ── Sub-screens ── */
import { ExperienceScreen } from "@/features/practice-session/ui/ExperienceScreen";
import { ContextScreen, type ContextScreenMeta } from "@/features/practice-session/ui/ContextScreen";
import { InterlocutorIntroScreen } from "@/features/practice-session/ui/InterlocutorIntroScreen";
import { NARRATOR_URLS, INTRO_URLS, STRATEGY_URLS, PREP_URLS, NARRATOR_SCRIPTS } from "@/features/practice-session/model/narrator-audio";
import type { InterlocutorKey } from "@/features/practice-session/model/narrator-audio";
import { StrategyScreen } from "@/features/practice-session/ui/StrategyScreen";
import { IntroductionScreen } from "@/features/practice-session/ui/IntroductionScreen";
import { VocabularyScreen } from "@/features/practice-session/ui/VocabularyScreen";
import { scriptSectionsToBriefingData } from "@/features/practice-session/ui/briefing/salesAdapter";
import { recommendPath } from "@/features/dashboard/model/path-recommendation";
import { GrammarContextScreen } from "@/features/practice-session/ui/GrammarContextScreen";
import { getGrammarStructure, nextGrammarIndex } from "@/services/prompts/grammar/interview";
import type { MicroLesson } from "@/services/microLessons";
import { SessionModalLayer } from "@/features/practice-session/ui/SessionModalLayer";
import { FeedbackStep } from "@/features/practice-session/ui/FeedbackStep";

/* ── Orchestration hooks ── */
import { useScriptGeneration } from "@/features/practice-session/model/useScriptGeneration";
import { useFeedbackGeneration } from "@/features/practice-session/model/useFeedbackGeneration";
import { useSessionSave } from "@/features/practice-session/model/useSessionSave";
import { useStepGates } from "@/features/practice-session/model/useStepGates";

import { MAX_REPEATS } from "@/features/practice-session/model/session.constants";
import {
  savePronunciationData,
  completeProgressionLevel,
} from "@/features/practice-session/model/session-api";

/* ═══════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════ */

interface PracticeSessionPageProps {
  scenario: string;
  interlocutor: string;
  scenarioType?: ScenarioType;
  guidedFields?: Record<string, string>;
  progressionLevelId?: string;
  progressionPathId?: PathId;
  marketFocus?: string | null;
  onFinish: () => void;
  onNewPractice?: () => void;
  onSwitchLevel?: (scenario: string, scenarioType: ScenarioType, levelId: string, interlocutor: string) => void;
  userPlan?: UserPlan;
  ownedPaths?: string[];
  userProfile?: OnboardingProfile | null;
  onProfileUpdate?: (profile: OnboardingProfile) => void;
  onGoToDashboard?: () => void;
  startAtContext?: boolean;
}

/** Steps where switching level is safe (no AI-generated data to lose) */
const SAFE_STEPS: Step[] = ["intro", "experience", "context", "interlocutor-intro"];
/** Steps that have AI narrator audio — NarrationToggle only shows here */
const NARRATION_STEPS: Step[] = ["intro", "context", "strategy", "generating", "practice-prep", "interlocutor-intro", "analyzing"];

export function PracticeSessionPage({
  scenario,
  interlocutor,
  scenarioType,
  guidedFields,
  progressionLevelId,
  progressionPathId,
  onFinish,
  onNewPractice,
  onSwitchLevel,
  userPlan,
  ownedPaths = [],
  userProfile,
  onProfileUpdate,
  onGoToDashboard,
  startAtContext,
}: PracticeSessionPageProps) {

  /* ── UI Shell state ── */
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [pendingSwitch, setPendingSwitch] = useState<{
    scenario: string; scenarioType: ScenarioType; levelId: string; interlocutor: string;
  } | null>(null);
  const [levelMilestoneOpen, setLevelMilestoneOpen] = useState(false);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [paywallReason, setPaywallReason] = useState<PaywallReason | null>(null);
  const [deepDiveLessonOpen, setDeepDiveLessonOpen] = useState(false);
  const [deepDiveLessons, setDeepDiveLessons] = useState<MicroLesson[]>([]);
  const [deepDiveLessonIndex, setDeepDiveLessonIndex] = useState(0);
  const [recommendedPathOverride, setRecommendedPathOverride] = useState<ScenarioType | null>(null);

  const isSelfIntro = scenarioType === "self-intro";

  /* ── Path Setup Modal ── */
  const needsPathSetup = useMemo(() => {
    if (startAtContext) return false;
    if (isSelfIntro) return false;
    if (!progressionPathId) return false;
    if (progressionPathId === "interview") return !userProfile?.targetRole;
    return false;
  }, [startAtContext, isSelfIntro, progressionPathId, userProfile?.targetRole]);

  const [pathSetupDone, setPathSetupDone] = useState(!needsPathSetup);

  function handlePathSetupComplete(updates: Partial<OnboardingProfile>) {
    onProfileUpdate?.({ ...(userProfile ?? {} as OnboardingProfile), ...updates });
    setPathSetupDone(true);
  }

  /* ── History recovery ── */
  const initialHistoryState = useMemo(() => {
    if (typeof window !== "undefined" && window.history.state?.influSession) {
      return window.history.state.influSession as { step: Step; sessionId: string };
    }
    return null;
  }, []);

  /* ── Step state ── */
  const [step, setStep] = useState<Step>(() => {
    if (initialHistoryState?.step) return initialHistoryState.step;
    if (scenarioType === "self-intro") return "intro";
    const levelDef = progressionPathId && progressionLevelId
      ? getLevelDefinition(progressionPathId, progressionLevelId)
      : null;
    if (levelDef?.introHeadline) return "intro";
    if (startAtContext) return "context";
    const hasProfileContext = userProfile?.cvSummary || (userProfile?.position && userProfile?.industry);
    if (hasProfileContext) return "context";
    return "experience";
  });

  /* ── Session identity ── */
  const [sessionId, setSessionId] = useState<string | null>(
    () => initialHistoryState?.sessionId ?? null
  );
  const [sessionVersion, setSessionVersion] = useState(0);
  const [repeatCount, setRepeatCount] = useState(0);
  const sessionStartRef = useRef<number>(Date.now());

  /* ── Coaching parameter refs ── */
  const sessionFocusRef = useRef<string | undefined>(undefined);
  const confidenceScoreRef = useRef<number | undefined>(undefined);
  const challengeModeRef = useRef<boolean>(false);

  /* ── Extra context from user input ── */
  const profileSeed = useMemo(() => {
    if (!userProfile) return {};
    const seed: Record<string, string> = {};
    if (userProfile.cvSummary) seed.cvSummary = userProfile.cvSummary;
    if (userProfile.position) seed.manualExperience = `${userProfile.position} in ${userProfile.industry || "tech"}, ${userProfile.seniority || "mid-level"}. ${userProfile.keyExperience || ""}`.trim();
    return seed;
  }, [userProfile]);

  const [extraContext, setExtraContext] = useState<Record<string, string>>(profileSeed);
  const guidedFieldsJSON = JSON.stringify(guidedFields);
  const extraContextJSON = JSON.stringify(extraContext);
  const mergedGuidedFields = useMemo(
    () => ({ ...guidedFields, ...extraContext }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [guidedFieldsJSON, extraContextJSON]
  );

  const effectiveScenario = scenario;
  const effectiveInterlocutor = interlocutor;
  const sKey = useMemo(
    () => scenarioKey(effectiveScenario, effectiveInterlocutor, scenarioType),
    [effectiveScenario, effectiveInterlocutor, scenarioType]
  );

  useEffect(() => { cleanupExpiredCache(); }, []);

  /* ── Service error ── */
  const [serviceError, setServiceError] = useState<ServiceError | null>(null);
  const handleRetry = useCallback(() => setServiceError(null), []);
  const handleDismissError = useCallback(() => setServiceError(null), []);

  /* ── Briefing session payload + user drafts ── */
  const [briefingForSession, setBriefingForSession] = useState<SessionConfig["interviewBriefing"] | null>(null);
  const [userDrafts, setUserDrafts] = useState<Record<number, string>>({});
  const [briefingPersonalizations, setBriefingPersonalizations] = useState<Record<number, string>>({});

  /* ── Side nav step tracking ── */
  const [sessionSteps, setSessionSteps] = useState<SessionStepItem[]>([]);
  const [qaProgress, setQaProgress] = useState<{ activeIdx: number; completedSet: Set<number> } | null>(null);
  const handleQaProgressChange = useCallback((activeIdx: number, completedSet: Set<number>) => {
    setQaProgress({ activeIdx, completedSet });
  }, []);

  const BUILD_LABEL: Record<string, string> = {
    interview:    "Build Your Answers",
    sales:        "Build Your Pitch",
    meeting:      "Build Your Points",
    presentation: "Build Your Delivery",
    culture:      "Build Your Approach",
    "self-intro": "Build Your Narrative",
  };

  useEffect(() => {
    if (!progressionPathId || !progressionLevelId) return;
    const FLOW = ["intro", "strategy", "experience", "context", "grammar", "vocabulary", "generating", "practice-prep", "interlocutor-intro", "practice", "analyzing", "feedback"];
    const currentIdx = FLOW.indexOf(step);
    const status = (forSteps: string[]): SessionStepItem["status"] => {
      const earliest = Math.min(...forSteps.map(s => FLOW.indexOf(s)).filter(i => i >= 0));
      if (forSteps.includes(step)) return "active";
      if (earliest < 0) return "pending";
      if (currentIdx > earliest) return "done";
      return "pending";
    };
    setSessionSteps([
      { id: "s-intro",    label: "Success Strategy",                                              status: status(["intro", "strategy"]),                           stepKey: "intro" },
      { id: "s-vocab",    label: "Powerful Vocabulary",                                           status: status(["grammar", "vocabulary"]),                       stepKey: "vocabulary" },
      { id: "s-prep",     label: BUILD_LABEL[scenarioType ?? ""] ?? "Build Your Preparation",     status: status(["generating", "practice-prep"]),                 stepKey: "practice-prep" },
      { id: "s-practice", label: "Practice Live",                                                 status: status(["interlocutor-intro", "practice"]),              stepKey: "practice" },
      { id: "s-feedback", label: "Your Mastery Report",                                           status: status(["analyzing", "feedback"]),                       stepKey: "feedback" },
    ]);
  }, [step, progressionPathId, progressionLevelId, scenarioType, qaProgress]);

  /* ── Script generation ── */
  const {
    generatedScript, scriptGenStatus, scriptGenError,
    interviewBriefing, preparationToolkit, personalizedPattern, patternLoading,
    cvMatchData, cvMatchStatus,
    fireScriptGeneration, setScriptGenStatus, setInterviewBriefing,
    setGeneratedScript, setPreparationToolkit, setCvMatchData, setCvMatchStatus,
  } = useScriptGeneration({
    effectiveScenario, effectiveInterlocutor, scenarioType,
    guidedFields, extraContext, sKey,
    progressionPathId, progressionLevelId, startAtContext,
    userProfile, step, setStep, setExtraContext, challengeModeRef,
  });

  /* ── Step gates ── */
  const { gateWithVocabulary, gateWithGrammar, nextStepAfterVocabularyRef, nextStepAfterGrammarRef } = useStepGates({
    progressionPathId, progressionLevelId, startAtContext, challengeModeRef, setStep,
  });

  /* ── Feedback generation ── */
  const {
    realFeedback, feedbackStatus, feedbackAnimDone,
    sessionSummary, summaryStatus,
    improvedScript,
    sessionPronData,
    fireFeedbackAnalysis, fireSummaryGeneration, fireImprovedScriptGeneration,
    setFeedbackAnimDone, setSessionPronData, setFeedbackStatus,
  } = useFeedbackGeneration({
    sessionId, scenarioType, scenario,
    initialSessionId: initialHistoryState?.sessionId,
    initialHistoryStep: initialHistoryState?.step,
  });

  /* ── Session save ── */
  useSessionSave({
    step, sessionId, feedbackStatus, summaryStatus,
    realFeedback, sessionSummary, sessionPronData, improvedScript,
    effectiveScenario, effectiveInterlocutor, scenarioType,
    interviewBriefing, briefingPersonalizations, startAtContext,
    progressionPathId, progressionLevelId, sessionStartRef,
  });

  /* ── History sync ── */
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.history.replaceState(
        { ...window.history.state, influSession: { step, sessionId } }, ""
      );
    }
  }, [step, sessionId]);

  /* ── Navigation guard during active practice ── */
  useEffect(() => {
    if (step !== "practice" && step !== "analyzing") return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "¿Seguro que quieres salir? Tu sesión en curso se perderá.";
      return e.returnValue;
    };
    const handlePopState = () => {
      if (!window.confirm("You have an active session. If you go back, your progress will be lost. Leave anyway?")) {
        window.history.pushState(
          { ...window.history.state, influSession: { step, sessionId } }, "", window.location.href
        );
      }
    };
    if (typeof window !== "undefined") {
      window.history.pushState(
        { ...window.history.state, influSession: { step, sessionId } }, "", window.location.href
      );
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [step, sessionId]);

  /* ── Auto-transition: analyzing → feedback ── */
  useEffect(() => {
    if (step !== "analyzing" || !feedbackAnimDone) return;
    if (feedbackStatus === "ready" || feedbackStatus === "error") {
      setStep("feedback");
      fireSummaryGeneration();
      if (progressionLevelId && progressionPathId && realFeedback) {
        const score = realFeedback.professionalProficiency ?? 0;
        completeProgressionLevel(progressionPathId, progressionLevelId, score, realFeedback.pillarScores || {})
          .catch((err: any) => console.info("[Progression]", err));
        if (score >= 75) setLevelMilestoneOpen(true);
      }
    } else if (feedbackStatus === "loading") {
      console.warn("[AnalyzeFeedback] ⚠️ Skip pressed while API loading — forcing transition");
      setFeedbackStatus("error");
    }
  }, [step, feedbackAnimDone, feedbackStatus, fireSummaryGeneration, progressionLevelId, progressionPathId, realFeedback]);

  /* ── prepareSession ── */
  useEffect(() => {
    if (scenarioType === "interview" && !briefingForSession && !challengeModeRef.current) return;
    const progressionLevelDef = progressionLevelId && progressionPathId
      ? getLevelDefinition(progressionPathId, progressionLevelId)
      : null;
    let cancelled = false;
    realConversationService.prepareSession({
      scenario: effectiveScenario,
      interlocutor: effectiveInterlocutor,
      scenarioType,
      guidedFields: mergedGuidedFields,
      interviewBriefing: briefingForSession ?? undefined,
      sessionFocus: sessionFocusRef.current,
      confidenceScore: confidenceScoreRef.current,
      levelNumber: progressionLevelDef?.level,
      turnLimit: progressionLevelDef?.turnLimit,
    })
      .then((prepared) => { if (!cancelled) setSessionId(prepared.sessionId); })
      .catch((err) => {
        if (!cancelled) {
          const serviceErr = toServiceError(err);
          console.error(`[PracticeSession] prepareSession failed:`, serviceErr.code, serviceErr.message);
          setServiceError(serviceErr);
        }
      });
    return () => { cancelled = true; };
  }, [effectiveScenario, effectiveInterlocutor, scenarioType, mergedGuidedFields, sessionVersion, briefingForSession]);

  /* ── Scroll to top on step change ── */
  const stepContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    stepContainerRef.current?.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
    const raf = requestAnimationFrame(() => {
      stepContainerRef.current?.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
      window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
    });
    const timer = setTimeout(() => {
      stepContainerRef.current?.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
    }, 600);
    return () => { cancelAnimationFrame(raf); clearTimeout(timer); };
  }, [step]);

  /* ── Progression level def (derived) ── */
  const progressionLevelDef = progressionLevelId && progressionPathId
    ? getLevelDefinition(progressionPathId, progressionLevelId)
    : null;
  const pathLabels: Record<string, string> = {
    interview: "Interview", sales: "Sales", meeting: "Meeting",
    presentation: "Presentation", client: "Client", csuite: "C-Suite",
  };
  const progressionLevelTitle = progressionLevelDef
    ? `${pathLabels[progressionPathId || ""] || progressionPathId} - Level ${progressionLevelDef.level}: ${progressionLevelDef.title}`
    : null;

  /* ── Level switch ── */
  const handleSideNavLevelSwitch = useCallback((s: string, st: ScenarioType, lid: string, interl: string) => {
    if (lid === progressionLevelId) return;
    setDrawerOpen(false);
    if (SAFE_STEPS.includes(step)) {
      onSwitchLevel?.(s, st, lid, interl);
    } else {
      setPendingSwitch({ scenario: s, scenarioType: st, levelId: lid, interlocutor: interl });
    }
  }, [step, progressionLevelId, onSwitchLevel]);

  const confirmSwitch = useCallback(() => {
    if (pendingSwitch && onSwitchLevel) {
      onSwitchLevel(pendingSwitch.scenario, pendingSwitch.scenarioType, pendingSwitch.levelId, pendingSwitch.interlocutor);
    }
    setPendingSwitch(null);
  }, [pendingSwitch, onSwitchLevel]);

  /* ── Repeat / usage gating ── */
  const plan: UserPlan = userPlan ?? "free";
  const maxRepeats = MAX_REPEATS[plan];
  const canRepeat = repeatCount < maxRepeats;
  const usageGating = useUsageGating(plan);
  const selfIntroPrimaryPath = isSelfIntro
    ? recommendPath(realFeedback?.pillarScores, undefined, userProfile)?.pathId ?? undefined
    : undefined;

  const handlePaywallTriggered = useCallback((reason: PaywallReason) => {
    setPaywallReason(reason);
    setPaywallOpen(true);
  }, []);

  const handlePurchaseComplete = useCallback((purchaseType: import("../services/types").PurchaseType) => {
    usageGating.addPurchasedPath(scenarioType || "interview");
    setPaywallOpen(false);
    setPaywallReason(null);
    if (paywallReason === "attempts-exhausted") {
      setRepeatCount(0);
      setSessionId(null);
      setServiceError(null);
      setSessionVersion((v) => v + 1);
      setStep("practice");
    }
  }, [paywallReason, usageGating, scenarioType]);

  const handlePracticeAgain = useCallback(() => {
    if (!canRepeat) return;
    setRepeatCount((c) => c + 1);
    setSessionId(null);
    setServiceError(null);
    setSessionVersion((v) => v + 1);
    setStep("practice");
  }, [canRepeat]);

  /* ══════════════════════════════════════════════════════════
     RENDER
     ══════════════════════════════════════════════════════════ */
  return (
    <ProgressionProvider value={{ levelTitle: progressionLevelTitle }}>
    <div aria-label="PracticeSessionPage" className="w-full min-h-screen flex flex-col">
      <AppHeader
        variant="session"
        leftSlot={
          <button
            onClick={() => setDrawerOpen(true)}
            className="lg:hidden w-8 h-8 rounded-full flex items-center justify-center text-[#45556c] hover:bg-[#f1f5f9] transition-colors"
            title="Open practice path"
          >
            <Menu className="w-5 h-5" />
          </button>
        }
        onGoToDashboard={() => setShowExitConfirm(true)}
      />
      {NARRATION_STEPS.includes(step) && <NarrationToggle />}


      {/* Main layout: SideNav + Content */}
      <div className="flex-1 flex min-h-0">
        {progressionPathId && (
          <PracticeSideNav
            activePathId={progressionPathId}
            activeLevelId={progressionLevelId}
            onLevelSwitch={handleSideNavLevelSwitch}
            sessionSteps={sessionSteps.length > 0 ? sessionSteps : undefined}
            onSessionStepClick={(key) => setStep(key as any)}
            isDrawerOpen={drawerOpen}
            onDrawerClose={() => setDrawerOpen(false)}
          />
        )}

        <div ref={stepContainerRef} className="flex-1 relative min-h-0 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${step}-${sessionVersion}`}
            className="w-full min-h-full bg-[#f0f4f8]"
            initial={{ opacity: 0, filter: "blur(4px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, filter: "blur(4px)" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            {serviceError && (
              <div className="fixed top-16 left-0 right-0 z-[100] p-4 max-w-xl mx-auto">
                <ServiceErrorBanner
                  error={serviceError}
                  onRetry={handleRetry}
                  onDismiss={handleDismissError}
                  onNavigate={onFinish}
                />
              </div>
            )}

            {/* ── intro ── */}
            {step === "intro" && (() => {
              if (isSelfIntro) {
                const siLevelDef = progressionPathId && progressionLevelId
                  ? getLevelDefinition(progressionPathId, progressionLevelId) : null;
                return (
                  <IntroductionScreen
                    scenarioType="self-intro"
                    levelTitle={siLevelDef?.title ?? "Crafting Your Professional Narrative"}
                    introHeadline={siLevelDef?.introHeadline ?? "learn the introduction structure that adapts to any room — once"}
                    practiceObjectives={[
                      "Learn the 3-move skeleton behind every great professional introduction",
                      "Understand why only Move 2 changes — and how each room demands a different version",
                      "Identify your Anchor: a value-led sentence that works in any context",
                      "Practice the full Three-Move Introduction in a live AI simulation",
                    ]}
                    onContinue={() => setStep("strategy")}
                    minimal
                  />
                );
              }
              const levelDef = progressionPathId && progressionLevelId
                ? getLevelDefinition(progressionPathId, progressionLevelId) : null;
              return levelDef?.introHeadline ? (
                <IntroductionScreen
                  scenarioType={scenarioType || "interview"}
                  levelTitle={levelDef.title}
                  introHeadline={levelDef.introHeadline}
                  scenarioContext={levelDef.scenarioContext}
                  narratorUrl={progressionLevelId ? INTRO_URLS[progressionLevelId] : undefined}
                  narratorScript={progressionLevelId ? NARRATOR_SCRIPTS.intro[progressionLevelId as keyof typeof NARRATOR_SCRIPTS.intro] : undefined}
                  onContinue={(meta) => {
                    sessionFocusRef.current = meta.sessionFocus;
                    confidenceScoreRef.current = meta.confidenceScore;
                    setStep("strategy");
                  }}
                />
              ) : null;
            })()}

            {/* ── experience ── */}
            {step === "experience" && (
              <ExperienceScreen
                scenarioType={scenarioType}
                userProfile={userProfile}
                onProfileUpdate={onProfileUpdate}
                onContinue={(cvData) => {
                  setExtraContext((prev) => ({ ...prev, ...cvData }));
                  setStep("context");
                }}
                onBack={onFinish}
              />
            )}

            {/* ── context ── */}
            {step === "context" && (
              <ContextScreen
                scenarioType={scenarioType}
                userProfile={userProfile}
                onProfileUpdate={onProfileUpdate}
                warRoomMode={startAtContext}
                narratorUrl={NARRATOR_URLS.context[scenarioType as keyof typeof NARRATOR_URLS.context] || ""}
                onContinue={(extraData, meta?: ContextScreenMeta) => {
                  if (meta?.sessionFocus) sessionFocusRef.current = meta.sessionFocus;
                  if (meta?.confidenceScore !== undefined) confidenceScoreRef.current = meta.confidenceScore;
                  challengeModeRef.current = meta?.challengeMode ?? false;
                  const enriched = { ...extraData };
                  if (scenarioType === "interview") {
                    if (userProfile?.keyExperience) enriched["Your key experience"] = userProfile.keyExperience;
                    if (userProfile?.company && !guidedFields?.company) enriched["company"] = userProfile.company;
                    if (enriched["Role you're applying for"] && !guidedFields?.role) enriched["role"] = enriched["Role you're applying for"];
                  }
                  setExtraContext(enriched);
                  const jd = extraData["Job Description"];
                  if (jd?.trim() && scenarioType === "interview") {
                    getAuthToken().then((token) => {
                      fetch(`https://${projectId}.supabase.co/functions/v1/make-server-08b8658d/profile`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, apikey: publicAnonKey },
                        body: JSON.stringify({ lastJobDescription: jd.trim() }),
                      }).catch(() => {});
                    }).catch(() => {});
                    onProfileUpdate?.({ ...(userProfile as any), lastJobDescription: jd.trim() });
                  }
                  if (challengeModeRef.current) {
                    fireScriptGeneration(enriched);
                    setStep("generating");
                    return;
                  }
                  if (scenarioType === "interview") {
                    const contentFingerprint = JSON.stringify(Object.entries(enriched).sort(([a], [b]) => a.localeCompare(b)));
                    const briefingCacheKey = `${sKey}_${simpleHash(contentFingerprint)}`;
                    const cachedBriefing = interviewBriefingCache.get(briefingCacheKey);
                    if (cachedBriefing && cachedBriefing.anticipatedQuestions?.length > 0) {
                      setInterviewBriefing(cachedBriefing);
                      setScriptGenStatus("ready");
                      const userCv = enriched["cvSummary"] || enriched["manualExperience"] || enriched["Your key experience"];
                      const userJd = enriched["Job Description"];
                      if (userCv && userJd && !cvMatchCacheV2.get(sKey)) {
                        setCvMatchStatus("loading");
                        analyzeCvMatch(userCv, userJd)
                          .then((data) => { cvMatchCacheV2.set(sKey, data); setCvMatchData(data); setCvMatchStatus("success"); })
                          .catch(() => setCvMatchStatus("error"));
                      }
                      gateWithGrammar("practice-prep");
                      return;
                    }
                  } else {
                    const cachedScript = scriptCache.get(sKey);
                    if (cachedScript && cachedScript.length > 0) {
                      setGeneratedScript(cachedScript);
                      setScriptGenStatus("ready");
                      const cachedToolkit = toolkitCache.get(sKey);
                      if (cachedToolkit) setPreparationToolkit?.(cachedToolkit);
                      gateWithGrammar("practice-prep");
                      return;
                    }
                  }
                  fireScriptGeneration(enriched);
                  gateWithGrammar("generating");
                }}
                onBack={() => {
                  const hasProfileContext = userProfile?.cvSummary || (userProfile?.position && userProfile?.industry);
                  if (hasProfileContext) { onFinish?.(); } else { setStep("experience"); }
                }}
              />
            )}

            {/* ── strategy ── */}
            {step === "strategy" && (() => {
              if (!progressionPathId || !progressionLevelId) return null;
              const levelDef = getLevelDefinition(progressionPathId, progressionLevelId);
              if (!levelDef?.methodology) return null;
              const handleStrategyAdvance = () => {
                const isPathSession = !!progressionPathId && !startAtContext;
                if (isSelfIntro || isPathSession) {
                  const profileFields: Record<string, string> = {};
                  if (userProfile?.cvSummary) profileFields.cvSummary = userProfile.cvSummary;
                  if (userProfile?.position) profileFields.manualExperience = `${userProfile.position} in ${userProfile.industry || "tech"}, ${userProfile.seniority || "mid-level"}.`.trim();
                  if (userProfile?.keyExperience) profileFields["Your key experience"] = userProfile.keyExperience;
                  setExtraContext(profileFields);
                  if (scriptGenStatus !== "ready" && scriptGenStatus !== "loading") fireScriptGeneration(profileFields);
                  if (isSelfIntro) {
                    gateWithVocabulary("practice-prep");
                  } else {
                    gateWithGrammar(scriptGenStatus === "ready" ? "practice-prep" : "generating");
                  }
                  return;
                }
                const hasProfileContext = userProfile?.cvSummary || (userProfile?.position && userProfile?.industry);
                setStep(hasProfileContext ? "context" : "experience");
              };
              return (
                <StrategyScreen
                  levelTitle={levelDef.title}
                  methodology={levelDef.methodology}
                  anchorPhrases={levelDef.anchorPhrases}
                  userProfile={userProfile}
                  personalizedPattern={personalizedPattern}
                  patternLoading={patternLoading}
                  narratorUrl={progressionLevelId ? STRATEGY_URLS[progressionLevelId] : undefined}
                  narratorScript={progressionLevelId ? NARRATOR_SCRIPTS.strategy[progressionLevelId as keyof typeof NARRATOR_SCRIPTS.strategy] : undefined}
                  onReady={handleStrategyAdvance}
                  onSkip={handleStrategyAdvance}
                />
              );
            })()}

            {/* ── grammar ── */}
            {step === "grammar" && (() => {
              if (!progressionLevelId) { setStep(nextStepAfterGrammarRef.current); return null; }
              const levelDef = progressionPathId && progressionLevelId
                ? getLevelDefinition(progressionPathId, progressionLevelId) : null;
              const rotationIndex = userProfile?.grammarRotationIndex?.[progressionLevelId] ?? 0;
              const structure = getGrammarStructure(progressionLevelId, rotationIndex);
              if (!structure) { setStep(nextStepAfterGrammarRef.current); return null; }
              function advanceAndGo() {
                const nextIdx = nextGrammarIndex(progressionLevelId!, rotationIndex);
                onProfileUpdate?.({
                  ...(userProfile ?? {} as OnboardingProfile),
                  grammarRotationIndex: { ...(userProfile?.grammarRotationIndex ?? {}), [progressionLevelId!]: nextIdx },
                });
                gateWithVocabulary(nextStepAfterGrammarRef.current as "generating" | "practice-prep");
              }
              return (
                <GrammarContextScreen
                  structure={structure}
                  levelNumber={levelDef?.level ?? 1}
                  userProfile={userProfile}
                  onContinue={advanceAndGo}
                  onSkip={advanceAndGo}
                />
              );
            })()}

            {/* ── vocabulary ── */}
            {step === "vocabulary" && (() => {
              const levelDef = progressionPathId && progressionLevelId
                ? getLevelDefinition(progressionPathId, progressionLevelId) : null;
              if (!levelDef?.vocabularyBank?.length) { setStep(nextStepAfterVocabularyRef.current); return null; }
              return (
                <VocabularyScreen
                  levelTitle={levelDef.title}
                  scenarioType={scenarioType}
                  vocabularyBank={levelDef.vocabularyBank}
                  userProfile={userProfile}
                  onContinue={() => setStep(nextStepAfterVocabularyRef.current)}
                  onSkip={() => setStep(nextStepAfterVocabularyRef.current)}
                />
              );
            })()}

            {/* ── generating ── */}
            {step === "generating" && (
              <>
                {scriptGenStatus !== "error" && (
                  <AnalyzingScreen
                    variant="generating"
                    canComplete={scriptGenStatus === "ready"}
                    onComplete={() => {}}
                    narratorUrl={NARRATOR_URLS.generating}
                    narratorScript={NARRATOR_SCRIPTS.generating}
                  />
                )}
                {scriptGenStatus === "error" && (
                  <div className="w-full min-h-[calc(100dvh-4rem)] bg-[#0f172b] flex flex-col items-center justify-center px-6 gap-6">
                    <div className="w-16 h-16 rounded-full bg-[#1e293b] flex items-center justify-center">
                      <svg className="w-8 h-8 text-[#f87171]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="text-center max-w-sm">
                      <h3 className="text-lg font-semibold text-white mb-2">
                        {scenarioType === "interview" ? "Preparation failed" : "Script generation failed"}
                      </h3>
                      <p className="text-sm text-[#94a3b8] mb-1">
                        {scenarioType === "interview"
                          ? "We couldn't generate your interview preparation. This is usually a temporary issue."
                          : "We couldn't generate your personalized script. This is usually a temporary issue."}
                      </p>
                      {scriptGenError && (
                        <p className="text-xs text-[#475569] font-mono bg-[#1e293b] rounded px-3 py-2 mt-3 break-all">
                          {scriptGenError.slice(0, 150)}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-3 mt-2">
                      <button
                        onClick={() => {
                          setScriptGenStatus("idle");
                          if (startAtContext) { setStep("context"); return; }
                          const levelDef = progressionPathId && progressionLevelId ? getLevelDefinition(progressionPathId, progressionLevelId) : null;
                          setStep(levelDef?.methodology ? "strategy" : "intro");
                        }}
                        className="px-5 py-2.5 rounded-lg text-sm font-medium text-[#94a3b8] bg-[#1e293b] hover:bg-[#334155] transition-colors"
                      >
                        ← Go back
                      </button>
                      <button
                        onClick={() => fireScriptGeneration()}
                        className="px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-[#6366f1] hover:bg-[#4f46e5] transition-colors"
                      >
                        Retry generation
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* ── practice-prep (self-intro) ── */}
            {step === "practice-prep" && isSelfIntro && !interviewBriefing && (
              <div className="w-full min-h-full flex flex-col items-center justify-center bg-[#f0f4f8] gap-6 px-6 py-12">
                <div className="w-full max-w-[640px] space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white rounded-2xl border border-[#e2e8f0] p-6 animate-pulse space-y-3">
                      <div className="h-4 bg-[#e2e8f0] rounded w-1/3" />
                      <div className="h-3 bg-[#f1f5f9] rounded w-full" />
                      <div className="h-3 bg-[#f1f5f9] rounded w-4/5" />
                      <div className="h-3 bg-[#f1f5f9] rounded w-2/3" />
                    </div>
                  ))}
                </div>
                <p className="text-sm text-[#62748e]">Personalizing your introduction cards…</p>
              </div>
            )}
            {step === "practice-prep" && isSelfIntro && interviewBriefing && (
              <PracticePrepScreen
                interlocutor={interlocutor}
                briefingData={interviewBriefing}
                levelTitle={progressionPathId && progressionLevelId ? getLevelDefinition(progressionPathId, progressionLevelId)?.title : undefined}
                onStartSimulation={(userDrafts, personalizedResponses) => {
                  const briefingPayload: SessionConfig["interviewBriefing"] = {
                    anticipatedQuestions: interviewBriefing.anticipatedQuestions.map((q) => ({
                      id: q.id, question: q.question, approach: q.approach,
                      suggestedOpener: q.suggestedOpener, framework: q.framework,
                      keyPhrases: q.keyPhrases.map((kp) => kp.phrase),
                    })),
                    userDrafts: Object.keys(userDrafts).length > 0 ? userDrafts : undefined,
                  };
                  setBriefingForSession(briefingPayload);
                  if (Object.keys(userDrafts).length > 0) setUserDrafts(userDrafts);
                  if (Object.keys(personalizedResponses).length > 0) setBriefingPersonalizations(personalizedResponses);
                  setStep("interlocutor-intro");
                }}
                onBack={() => setStep("strategy")}
                scenario={scenario}
              />
            )}

            {/* ── practice-prep (interview) ── */}
            {step === "practice-prep" && interviewBriefing && scenarioType === "interview" && (
              <PracticePrepScreen
                interlocutor={interlocutor}
                briefingData={interviewBriefing}
                narratorUrl={PREP_URLS["interview"]}
                narratorScript={NARRATOR_SCRIPTS.prep.interview}
                levelTitle={progressionPathId && progressionLevelId ? getLevelDefinition(progressionPathId, progressionLevelId)?.title : undefined}
                onProgressChange={handleQaProgressChange}
                initialActiveIdx={qaProgress?.activeIdx}
                initialCompletedSet={qaProgress?.completedSet}
                onStartSimulation={(userDrafts, personalizedResponses) => {
                  const briefingPayload: SessionConfig["interviewBriefing"] = {
                    anticipatedQuestions: interviewBriefing.anticipatedQuestions.map((q) => ({
                      id: q.id, question: q.question, approach: q.approach,
                      suggestedOpener: q.suggestedOpener, framework: q.framework,
                      keyPhrases: q.keyPhrases.map((kp) => kp.phrase),
                    })),
                    userDrafts: Object.keys(userDrafts).length > 0 ? userDrafts : undefined,
                  };
                  setBriefingForSession(briefingPayload);
                  if (Object.keys(userDrafts).length > 0) setUserDrafts(userDrafts);
                  if (Object.keys(personalizedResponses).length > 0) setBriefingPersonalizations(personalizedResponses);
                  setStep("interlocutor-intro");
                }}
                onBack={() => {
                  if (startAtContext) { setStep("context"); return; }
                  const levelDef = progressionPathId && progressionLevelId ? getLevelDefinition(progressionPathId, progressionLevelId) : null;
                  setStep(levelDef?.methodology ? "strategy" : "intro");
                }}
                scenario={scenario}
              />
            )}

            {/* ── interlocutor-intro ── */}
            {step === "interlocutor-intro" && (
              <InterlocutorIntroScreen
                interlocutor={effectiveInterlocutor}
                narratorUrl={NARRATOR_URLS.interlocutor[effectiveInterlocutor as InterlocutorKey] || ""}
                narratorScript={NARRATOR_SCRIPTS.interlocutor[effectiveInterlocutor as keyof typeof NARRATOR_SCRIPTS.interlocutor]}
                onReady={() => setStep("practice")}
              />
            )}

            {/* ── practice-prep (sales/meeting/presentation) ── */}
            {step === "practice-prep" && generatedScript && scenarioType !== "interview" && (
              <PracticePrepScreen
                interlocutor={interlocutor}
                briefingData={scriptSectionsToBriefingData(generatedScript)}
                narratorUrl={PREP_URLS[scenarioType ?? "interview"]}
                narratorScript={NARRATOR_SCRIPTS.prep[scenarioType as keyof typeof NARRATOR_SCRIPTS.prep]}
                levelTitle={progressionPathId && progressionLevelId ? getLevelDefinition(progressionPathId, progressionLevelId)?.title : undefined}
                onStartSimulation={(userDrafts, personalizedResponses) => {
                  const genericBriefing = scriptSectionsToBriefingData(generatedScript);
                  const briefingPayload: SessionConfig["interviewBriefing"] = {
                    anticipatedQuestions: genericBriefing.anticipatedQuestions.map((q) => ({
                      id: q.id, question: q.question, approach: q.approach,
                      suggestedOpener: q.suggestedOpener, framework: q.framework,
                      keyPhrases: q.keyPhrases.map((kp) => kp.phrase),
                    })),
                    userDrafts: Object.keys(userDrafts).length > 0 ? userDrafts : undefined,
                  };
                  setBriefingForSession(briefingPayload);
                  if (Object.keys(userDrafts).length > 0) setUserDrafts(userDrafts);
                  if (Object.keys(personalizedResponses).length > 0) setBriefingPersonalizations(personalizedResponses);
                  setStep("practice");
                }}
                onBack={() => {
                  if (startAtContext) { setStep("context"); return; }
                  const levelDef = progressionPathId && progressionLevelId ? getLevelDefinition(progressionPathId, progressionLevelId) : null;
                  setStep(levelDef?.methodology ? "strategy" : "intro");
                }}
                onProgressChange={handleQaProgressChange}
                initialActiveIdx={qaProgress?.activeIdx}
                initialCompletedSet={qaProgress?.completedSet}
                scenario={scenario}
                scenarioType={scenarioType}
              />
            )}

            {/* ── practice ── */}
            {step === "practice" && !sessionId && !serviceError && (
              <div className="flex flex-col items-center justify-center h-[calc(100dvh-4rem)] gap-4">
                <motion.div
                  className="w-8 h-8 border-2 border-[#e2e8f0] border-t-[#0f172b] rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <p className="text-sm text-[#45556c]">Preparing your session...</p>
              </div>
            )}
            {step === "practice" && sessionId && (
              <VoicePractice
                interlocutor={interlocutor}
                sessionId={sessionId}
                scenarioType={scenarioType}
                challengeMode={challengeModeRef.current}
                onConversationComplete={() => {
                  fireFeedbackAnalysis();
                  fireImprovedScriptGeneration();
                }}
                onViewFeedback={async (pronData) => {
                  setSessionPronData(pronData);
                  if (sessionId && pronData.length > 0) {
                    const { pronDataCache } = await import("@/shared/lib/sessionCache");
                    pronDataCache.set(sessionId, pronData);
                  }
                  setStep("analyzing");
                  if (pronData.length > 0 && sessionId) {
                    savePronunciationData(sessionId, pronData).catch(() => {});
                  }
                }}
                onEnd={onFinish}
              />
            )}

            {/* ── analyzing ── */}
            {step === "analyzing" && (
              <AnalyzingScreen
                variant="feedback"
                canComplete={feedbackStatus === "ready" || feedbackStatus === "error"}
                onComplete={() => setFeedbackAnimDone(true)}
                narratorUrl={NARRATOR_URLS.analyzing}
                narratorScript={NARRATOR_SCRIPTS.analyzing}
              />
            )}

            {/* ── feedback ── */}
            {step === "feedback" && (
              <FeedbackStep
                scenarioType={scenarioType}
                isSelfIntro={isSelfIntro}
                progressionPathId={progressionPathId}
                progressionLevelId={progressionLevelId}
                effectiveScenario={effectiveScenario}
                effectiveInterlocutor={effectiveInterlocutor}
                realFeedback={realFeedback}
                sessionPronData={sessionPronData}
                sessionSummary={sessionSummary}
                interviewBriefing={interviewBriefing}
                cvMatchStatus={cvMatchStatus}
                cvMatchData={cvMatchData}
                improvedScript={improvedScript}
                userProfile={userProfile}
                onProfileUpdate={onProfileUpdate}
                userDrafts={userDrafts}
                canRepeat={canRepeat}
                onPracticeAgain={handlePracticeAgain}
                sessionStartRef={sessionStartRef}
                onFinish={onFinish}
                onPaywallTriggered={handlePaywallTriggered}
                setDeepDiveLessons={setDeepDiveLessons}
                setDeepDiveLessonIndex={setDeepDiveLessonIndex}
                setDeepDiveLessonOpen={setDeepDiveLessonOpen}
                setRecommendedPathOverride={setRecommendedPathOverride}
              />
            )}

            {/* ── upsell ── */}
            {step === "upsell" && (
              <UpsellScreen
                scenarioType={scenarioType}
                proficiencyScore={realFeedback?.professionalProficiency ?? undefined}
                onPurchasePath={() => handlePaywallTriggered("path-required")}
                onContinue={onFinish}
              />
            )}

          </motion.div>
        </AnimatePresence>
        </div>
      </div>

      <MiniFooter />

      <SessionModalLayer
        showExitConfirm={showExitConfirm}
        setShowExitConfirm={setShowExitConfirm}
        onGoToDashboard={onGoToDashboard}
        pathSetupDone={pathSetupDone}
        progressionPathId={progressionPathId}
        userProfile={userProfile}
        onPathSetupComplete={handlePathSetupComplete}
        deepDiveLessonOpen={deepDiveLessonOpen}
        deepDiveLessons={deepDiveLessons}
        deepDiveLessonIndex={deepDiveLessonIndex}
        setDeepDiveLessonOpen={setDeepDiveLessonOpen}
        setDeepDiveLessonIndex={setDeepDiveLessonIndex}
        levelMilestoneOpen={levelMilestoneOpen}
        setLevelMilestoneOpen={setLevelMilestoneOpen}
        progressionLevelDef={progressionLevelDef}
        realFeedbackProficiency={realFeedback?.professionalProficiency ?? 0}
        paywallOpen={paywallOpen}
        setPaywallOpen={setPaywallOpen}
        paywallReason={paywallReason}
        setPaywallReason={setPaywallReason}
        scenarioType={scenarioType}
        recommendedPathOverride={recommendedPathOverride}
        ownedPaths={ownedPaths}
        onPurchaseComplete={handlePurchaseComplete}
        selfIntroPrimaryPath={selfIntroPrimaryPath}
        pendingSwitch={pendingSwitch}
        setPendingSwitch={setPendingSwitch}
        onConfirmSwitch={confirmSwitch}
      />
    </div>
    </ProgressionProvider>
  );
}
