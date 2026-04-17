import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { AppHeader } from "@/shared/ui";
import { AnalyzingScreen } from "@/shared/ui";
import { realConversationService } from "@/services";
import { toServiceError } from "@/services/errors";
import type { ServiceError } from "@/services/errors";
import type { RemedialContent } from "@/services/types";

import { getLevelDefinition } from "@/features/dashboard/model/progression-paths";
import { ProgressionProvider } from "@/shared/lib/ProgressionContext";
import { ServiceErrorBanner } from "@/shared/ui";
import { getBeforeAfterForScenario, getStrengthsForScenario } from "@/services/scenario-data";
import { useMediaRecorder } from "@/app/hooks/useMediaRecorder";
import { projectId, publicAnonKey } from "@/../utils/supabase/info";
import { getAuthToken } from "@/services/supabase";
import type {
  ScenarioType,
  ScriptSection,
  UserPlan,
  CreditPack,
  SessionSummary,
  TurnPronunciationData,
  SessionConfig,
} from "@/services/types";
import { SessionProgressBar } from "@/widgets/SessionProgressBar";
import { InterviewBriefingScreen } from "@/widgets/InterviewBriefingScreen";
import type { Step } from "@/entities/session";
import { VoicePractice } from "@/features/practice-session/ui/VoicePractice";
import { type RealFeedbackData, type RepeatInfo } from "@/features/practice-session/ui/ConversationFeedback";
import { InterviewAnalysis } from "@/features/practice-session/ui/InterviewAnalysis";
import { PathConversionScreen } from "@/features/skill-drill/ui/PathConversionScreen";
import { PathPurchaseModal } from "@/widgets/PathPurchaseModal";
import { useUsageGating } from "@/app/hooks/useUsageGating";
import type { PaywallReason } from "@/app/hooks/useUsageGating";
import { createSRPhrase, flagPhrasesForReview } from "@/app/utils/spacedRepetition";
import type { InterviewBriefingData, OnboardingProfile } from "@/services/types";
import {
  scenarioKey,
  simpleHash,
  scriptCache,
  toolkitCache,
  cvMatchCacheV2,
  interviewBriefingCache,
  feedbackCache,
  summaryCache,
  improvedScriptCache,
  pronDataCache,
  cleanupExpiredCache,
} from "@/app/utils/sessionCache";
import { detectLanguageBackground } from "@/services/locale-detect";
import { downloadSessionReportPdf } from "@/app/utils/cheatSheetPdf";
import { analyzeCvMatch, type CVMatchResult } from "@/services/cvMatchService";

/** Detect locale once at module level — stable across renders */
const _detectedLocale = detectLanguageBackground();

/* ── Sub-screens extracted to session/ ── */
import { PreBriefingScreen } from "@/features/practice-session/ui/PreBriefingScreen";
import { CVUploadScreen } from "@/features/practice-session/ui/CVUploadScreen";
import { ExtraContextScreen } from "@/features/practice-session/ui/ExtraContextScreen";
import { KeyExperienceScreen } from "@/features/practice-session/ui/KeyExperienceScreen";
import { PreSessionBrief } from "@/features/practice-session/ui/PreSessionBrief";
import { scriptSectionsToBriefingData } from "@/features/practice-session/ui/briefing/salesAdapter";

/* ═══════════════════════════════════════════════════════════
   TYPES & DATA (MVP-simplified)
   ═══════════════════════════════════════════════════════════ */

interface PracticeSessionPageProps {
  scenario: string;
  interlocutor: string;
  scenarioType?: ScenarioType;
  guidedFields?: Record<string, string>;
  progressionLevelId?: string;
  progressionPathId?: ScenarioType;
  marketFocus?: string | null;
  onFinish: () => void;
  onNewPractice?: () => void;
  userPlan?: UserPlan;
  /** User profile for persisting key experience, role, company */
  userProfile?: OnboardingProfile | null;
  onProfileUpdate?: (profile: OnboardingProfile) => void;
  /** Dev Preview: jump directly to a specific step with mock data */
  devInitialStep?: Step;
  /** Dev Preview: pre-loaded mock feedback data */
  devMockFeedback?: RealFeedbackData | null;
  /** Dev Preview: pre-loaded mock session summary */
  devMockSummary?: SessionSummary | null;
  /** Dev Preview: pre-loaded mock pronunciation data */
  devMockPronData?: TurnPronunciationData[];
  /** Dev Preview: pre-loaded mock script sections */
  devMockScript?: ScriptSection[] | null;
  /** Dev Preview: pre-loaded mock interview briefing */
  devMockInterviewBriefing?: InterviewBriefingData | null;
  /** Logged in user name for header */
  userName?: string;
  /** Callback to handle logout from header */
  onLogout?: () => void;
  /** Callback to navigate to account page */
  onNavigateToAccount?: () => void;
}

import { MAX_REPEATS, SCENARIO_LABELS_MAP } from "@/features/practice-session/model/session.constants";
import {
  generateInterviewBriefing,
  generateScript,
  generatePreparationToolkit,
  analyzeFeedback,
  generateSummary,
  generateImprovedScript,
  saveSession,
  savePronunciationData,
  completeProgressionLevel,
  completeRemedial,
  personalizePatterns,
} from "@/features/practice-session/model/session-api";
import type { PersonalizedPatterns } from "@/features/practice-session/model/session-api";

/* ═══════════════════════════════════════════════════════════
   MAIN ORCHESTRATOR (MVP-simplified flow)
   cv-upload → extra-context → generating-script → pre-briefing →
   practice → analyzing → interview-analysis → Dashboard
   ═══════════════════════════════════════════════════════════ */
export function PracticeSessionPage({
  scenario,
  interlocutor,
  scenarioType,
  guidedFields,
  progressionLevelId,
  progressionPathId,
  onFinish,
  onNewPractice,
  userPlan,
  userProfile,
  onProfileUpdate,
  devInitialStep,
  devMockFeedback,
  devMockSummary,
  devMockPronData,
  devMockScript,
  devMockInterviewBriefing,
  userName,
  onLogout,
  onNavigateToAccount,
}: PracticeSessionPageProps) {
  const isDevPreview = !!devInitialStep;

  /* Recover session state from browser history if navigating Back/Forward */
  const initialHistoryState = useMemo(() => {
    if (typeof window !== "undefined" && window.history.state?.influSession) {
      return window.history.state.influSession as { step: Step; sessionId: string };
    }
    return null;
  }, []);

  /* Determine initial step: skip key-experience screen as per user request */
  const needsKeyExperience = false;
  const [step, setStep] = useState<Step>(() => {
    if (devInitialStep) return devInitialStep;
    if (initialHistoryState?.step) return initialHistoryState.step;
    return "cv-upload";
  });

  /* ── Scenario cache key for pre-session data (script, toolkit) ── */
  const sKey = useMemo(
    () => scenarioKey(scenario, interlocutor, scenarioType),
    [scenario, interlocutor, scenarioType]
  );

  /* ── Cleanup expired cache entries on mount ── */
  useEffect(() => { cleanupExpiredCache(); }, []);

  /* Merge setup guidedFields with ExtraContextScreen data
     IMPORTANT: useMemo with serialized deps prevents infinite re-render loop.
     Without this, { ...guidedFields, ...extraContext } creates a NEW object
     every render → useEffect sees mergedGuidedFields as "changed" → cancels
     & restarts prepareSession endlessly → VoicePractice never loads messages. */
  const [extraContext, setExtraContext] = useState<Record<string, string>>({});
  const guidedFieldsJSON = JSON.stringify(guidedFields);
  const extraContextJSON = JSON.stringify(extraContext);
  const mergedGuidedFields = useMemo(
    () => ({ ...guidedFields, ...extraContext }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [guidedFieldsJSON, extraContextJSON]
  );

  /* Service data */
  const [serviceError, setServiceError] = useState<ServiceError | null>(null);

  /* Session initialization via conversationService (declared early so callbacks below can reference it) */
  const [sessionId, setSessionId] = useState<string | null>(() => {
    if (isDevPreview) return "dev-preview-session";
    if (initialHistoryState?.sessionId) return initialHistoryState.sessionId;
    return null;
  });

  /* Real AI-generated feedback from /analyze-feedback */
  const [realFeedback, setRealFeedback] = useState<RealFeedbackData | null>(() => {
    if (devMockFeedback) return devMockFeedback;
    if (initialHistoryState?.sessionId) {
      return feedbackCache.get(initialHistoryState.sessionId) || null;
    }
    return null;
  });
  const [feedbackStatus, setFeedbackStatus] = useState<"idle" | "loading" | "ready" | "error">(() => {
    if (isDevPreview) return "ready";
    if (initialHistoryState?.step === "conversation-feedback" || initialHistoryState?.step === "session-recap" || initialHistoryState?.step === "interview-analysis") return "ready";
    return "idle";
  });
  const [feedbackAnimDone, setFeedbackAnimDone] = useState(() => {
    if (isDevPreview) return true;
    if (initialHistoryState?.step === "conversation-feedback" || initialHistoryState?.step === "session-recap" || initialHistoryState?.step === "interview-analysis") return true;
    return false;
  });

  /* Real AI-generated session summary from /generate-summary */
  const [sessionSummary, setSessionSummary] = useState<SessionSummary | null>(() => {
    if (devMockSummary) return devMockSummary;
    if (initialHistoryState?.sessionId) {
      return summaryCache.get(initialHistoryState.sessionId) || null;
    }
    return null;
  });
  const [summaryStatus, setSummaryStatus] = useState<"idle" | "loading" | "ready" | "error">(() => {
    if (isDevPreview) return "ready";
    if (initialHistoryState?.step === "session-recap" || initialHistoryState?.step === "interview-analysis") return "ready";
    return "idle";
  });

  /* Real AI-generated Golden Master Script from /generate-improved-script */
  const [improvedScript, setImprovedScript] = useState<ScriptSection[] | null>(() => {
    if (initialHistoryState?.sessionId) {
      return improvedScriptCache.get(initialHistoryState.sessionId) || null;
    }
    return null;
  });
  const [improvedScriptStatus, setImprovedScriptStatus] = useState<"idle" | "loading" | "ready" | "error">(() => {
    if (isDevPreview) return "ready";
    if (initialHistoryState?.step === "session-recap" || initialHistoryState?.step === "interview-analysis") return "ready";
    return "idle";
  });

  /* Azure pronunciation assessment data accumulated during the session */
  const [sessionPronData, setSessionPronData] = useState<TurnPronunciationData[]>(() => {
    if (devMockPronData) return devMockPronData;
    if (initialHistoryState?.sessionId) {
      return pronDataCache.get(initialHistoryState.sessionId) || [];
    }
    return [];
  });


  /* Session start timestamp for duration calculation */
  const sessionStartRef = useRef<number>(Date.now());

  /* Sync relevant state to history for Back/Forward restoration */
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.history.replaceState(
        { ...window.history.state, influSession: { step, sessionId } },
        ""
      );
    }
  }, [step, sessionId]);

  /* ── Prevent accidental navigation and session loss during active practice ── */
  useEffect(() => {
    if (step === "practice" || step === "analyzing") {
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        e.preventDefault();
        e.returnValue = "¿Seguro que quieres salir? Tu sesión en curso se perderá.";
        return e.returnValue;
      };

      const handlePopState = (e: PopStateEvent) => {
        if (!window.confirm("You have an active session. If you go back, your progress will be lost. Leave anyway?")) {
          // Push state back to stay on the current screen
          window.history.pushState(
            { ...window.history.state, influSession: { step, sessionId } },
            "",
            window.location.href
          );
        }
      };

      // Push a dummy state when entering practice so the first "back" click is trapped
      if (typeof window !== "undefined") {
        window.history.pushState(
          { ...window.history.state, influSession: { step, sessionId } },
          "",
          window.location.href
        );
      }

      window.addEventListener("beforeunload", handleBeforeUnload);
      window.addEventListener("popstate", handlePopState);

      return () => {
        window.removeEventListener("beforeunload", handleBeforeUnload);
        window.removeEventListener("popstate", handlePopState);
      };
    }
  }, [step, sessionId]);

  /* AI-generated pre-briefing script (NO mock fallback — real AI or error+retry) */
  const [generatedScript, setGeneratedScript] = useState<ScriptSection[] | null>(() => devMockScript ?? scriptCache.get(sKey));
  const [scriptGenStatus, setScriptGenStatus] = useState<"idle" | "loading" | "ready" | "error">(() =>
    isDevPreview ? "ready" : (scenarioType === "interview" ? interviewBriefingCache.get(sKey) : scriptCache.get(sKey)) ? "ready" : "idle"
  );
  const [scriptGenError, setScriptGenError] = useState<string | null>(null);
  const [animationDone, setAnimationDone] = useState(isDevPreview);

  /* AI-generated interview briefing (card-per-question format, interviews only) */
  const [interviewBriefing, setInterviewBriefing] = useState<InterviewBriefingData | null>(
    () => devMockInterviewBriefing ?? (scenarioType === "interview" ? interviewBriefingCache.get(sKey) : null)
  );

  /**
   * Briefing data packaged for the interviewer prompt (Gap A+B).
   * Populated when user clicks "Practice Interview" — null until then.
   * For interview scenarios, prepareSession is deferred until this is set.
   */
  const [briefingForSession, setBriefingForSession] = useState<SessionConfig["interviewBriefing"] | null>(null);

  /** User drafts from "Your Response" tab — persisted for PDF generation */
  const [userDrafts, setUserDrafts] = useState<Record<number, string>>({});



  /* AI-generated preparation toolkit (power phrases, power questions, cultural tips) */
  const [preparationToolkit, setPreparationToolkit] = useState<{
    powerPhrases: Array<{ id: string; phrase: string; context: string; category: string }>;
    powerQuestions: Array<{ question: string; rationale: string; timing: string }>;
    culturalTips: Array<{ title: string; description: string; type: "do" | "avoid" }>;
  } | null>(() => toolkitCache.get(sKey));

  /* AI-generated CV Match analysis */
  const [cvMatchData, setCvMatchData] = useState<CVMatchResult | null>(() => cvMatchCacheV2.get(sKey));
  const [cvMatchStatus, setCvMatchStatus] = useState<"idle" | "loading" | "success" | "error">(
    cvMatchCacheV2.get(sKey) ? "success" : "idle"
  );

  /* AI-personalized bad/good pattern examples */
  const [personalizedPattern, setPersonalizedPattern] = useState<PersonalizedPatterns | null>(null);
  const [patternLoading, setPatternLoading] = useState(false);

  /* Ref-based AbortController to cancel previous generation when a new one starts */
  const briefingAbortRef = useRef<AbortController | null>(null);

  /* ── Script / Briefing generation: call Edge Function ── */
  const fireScriptGeneration = useCallback(async (extraData?: Record<string, string>) => {
    // Abort any in-flight generation before starting a new one
    briefingAbortRef.current?.abort("superseded");

    setScriptGenStatus("loading");
    setScriptGenError(null);
    setGeneratedScript(null);
    setInterviewBriefing(null);
    setAnimationDone(false);
    setPreparationToolkit(null);

    // ── Fire personalized pattern generation in parallel (non-blocking) ──
    if (progressionPathId && progressionLevelId) {
      const levelDef = getLevelDefinition(progressionPathId, progressionLevelId);
      if (levelDef?.methodology?.pattern) {
        setPatternLoading(true);
        const allFieldsForPattern = { ...guidedFields, ...(extraData || extraContext) };
        personalizePatterns(
          progressionLevelId,
          levelDef.methodology.name,
          levelDef.methodology.pattern.bad.label,
          levelDef.methodology.pattern.good.label,
          allFieldsForPattern,
        )
          .then((data) => {
            setPersonalizedPattern(data);
            setPatternLoading(false);
          })
          .catch((err) => {
            console.warn("[PersonalizePatterns] ⚠️ Failed (will use static):", err.message);
            setPatternLoading(false);
          });
      }
    }

    const allFields = { ...guidedFields, ...(extraData || extraContext) };

    const abortController = new AbortController();
    briefingAbortRef.current = abortController;

    if (scenarioType === "interview") {
      try {
        const { briefing } = await generateInterviewBriefing(
          scenario,
          interlocutor,
          allFields,
          _detectedLocale,
          abortController.signal
        );
        setInterviewBriefing(briefing);
        // Content-aware cache key: same logic as the read path
        const fp = JSON.stringify(
          Object.entries(allFields).sort(([a], [b]) => a.localeCompare(b))
        );
        interviewBriefingCache.set(`${sKey}_${simpleHash(fp)}`, briefing);
        setScriptGenStatus("ready");
      } catch (err: any) {
        if (err instanceof DOMException && err.name === "AbortError") {
          console.log("[InterviewBriefing] ℹ️ Aborted (expected during navigation)");
          return;
        }
        const msg = err instanceof Error ? err.message : String(err);
        console.error("[InterviewBriefing] ❌ Failed:", msg);
        setScriptGenError(msg);
        setScriptGenStatus("error");
      }
      return; 
    }

    // ━━━ SALES / DEFAULT PATH: Existing script + toolkit parallel calls ━━━
    generateScript(scenario, interlocutor, scenarioType, allFields, _detectedLocale, abortController.signal)
      .then(({ sections }) => {
        setGeneratedScript(sections);
        scriptCache.set(sKey, sections);
        setScriptGenStatus("ready");
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        console.error("[GenerateScript] ❌ Failed:", err.message);
        setScriptGenError(err.message);
        setScriptGenStatus("error");
      });

    // ── Fire CV Match Analysis in parallel (non-blocking) ──
    const userCv = allFields["cvSummary"] || allFields["manualExperience"] || allFields["Your key experience"];
    const userJd = allFields["Job Description"];
    if (userCv && userJd && !cvMatchCacheV2.get(sKey)) {
      setCvMatchStatus("loading");
      analyzeCvMatch(userCv, userJd)
        .then((data) => {
          cvMatchCacheV2.set(sKey, data);
          setCvMatchData(data);
          setCvMatchStatus("success");
        })
        .catch((err) => {
          console.error("[CvMatchAnalysis] ❌ Failed:", err);
          setCvMatchStatus("error");
        });
    }

    // ── Fire preparation toolkit generation in parallel (non-blocking) ──
    generatePreparationToolkit(scenario, interlocutor, scenarioType, allFields, _detectedLocale)
      .then((toolkit) => {
        setPreparationToolkit(toolkit);
        toolkitCache.set(sKey, toolkit);
      })
      .catch((err) => {
        console.error("[PreparationToolkit] ❌ Failed:", err.message);
      });
  }, [scenario, interlocutor, scenarioType, guidedFields, extraContext, sKey]);

  /* ── Auto-transition: only when BOTH animation AND API are done ── */
  useEffect(() => {
    // In dev preview mode for generating-script, don't auto-transition (let user see the animation)
    if (isDevPreview && devInitialStep === "generating-script") return;
    const contentReady = generatedScript || interviewBriefing;
    if (step === "generating-script" && scriptGenStatus === "ready" && contentReady) {
      setStep("pre-briefing");
    }
  }, [step, scriptGenStatus, generatedScript, interviewBriefing, isDevPreview, devInitialStep]);

  /* ── Feedback analysis: call /analyze-feedback when entering "analyzing" step ──
   * Can be called early (when conversation ends) to pre-warm while the user is
   * still on the practice screen. Guarded by feedbackStatus to prevent double calls. */
  const fireFeedbackAnalysis = useCallback(async () => {
    if (!sessionId) return;
    // Guard: don't fire a second time if already loading/ready
    if (feedbackStatus === "loading" || feedbackStatus === "ready") return;
    setFeedbackStatus("loading");
    setRealFeedback(null);

    try {
      const fb = await analyzeFeedback(sessionId, scenarioType, _detectedLocale);
      setRealFeedback(fb);
      if (sessionId) feedbackCache.set(sessionId, fb);
      setFeedbackStatus("ready");
    } catch (err: any) {
      console.error("[AnalyzeFeedback] ❌ Failed:", err.message);
      setFeedbackStatus("error");
      // Don't block the flow — user can still see mock feedback
    }
  }, [sessionId, scenarioType, feedbackStatus]);

  /* ── Summary generation: call /generate-summary for session feedback ── */
  const fireSummaryGeneration = useCallback(async () => {
    if (!sessionId) return;
    setSessionSummary(null);
    setSummaryStatus("loading");

    try {
      const sum = await generateSummary(sessionId, scenarioType, _detectedLocale);
      setSessionSummary(sum);
      setSummaryStatus("ready");
      if (sessionId) summaryCache.set(sessionId, sum);
    } catch (err: any) {
      console.error("[GenerateSummary] ❌ Failed:", err.message);
      setSummaryStatus("error");
      // Non-blocking — report renders without summary
    }
  }, [sessionId, scenarioType]);

  /* ── Golden Script generation: call /generate-improved-script async ── */
  const fireImprovedScriptGeneration = useCallback(async () => {
    if (!sessionId) return;
    setImprovedScript(null);
    setImprovedScriptStatus("loading");

    try {
      const sections = await generateImprovedScript(sessionId, _detectedLocale);
      setImprovedScript(sections);
      improvedScriptCache.set(sessionId, sections);
      setImprovedScriptStatus("ready");
    } catch (err: any) {
      console.error("[GenerateImprovedScript] ❌ Failed:", err.message);
      setImprovedScriptStatus("error");
    }
  }, [sessionId]);

  /* ── Persist completed session to backend (fire-and-forget) ── */
  const sessionSavedRef = useRef(false);
  const saveSessionToBackend = useCallback(async () => {
    if (sessionSavedRef.current || !sessionId || isDevPreview) return;
    sessionSavedRef.current = true;

    const duration = `${Math.max(1, Math.round((Date.now() - sessionStartRef.current) / 60000))} min`;
    const payload = {
      scenario,
      interlocutor,
      scenarioType: scenarioType || "interview",
      duration,
      feedback: realFeedback ? {
        strengths: realFeedback.strengths,
        opportunities: realFeedback.opportunities,
        beforeAfter: realFeedback.beforeAfter,
        // Merge Azure pronunciation score into pillarScores for persistence
        pillarScores: realFeedback.pillarScores ? {
          ...realFeedback.pillarScores,
          Pronunciation: sessionPronData.length > 0
            ? Math.round(sessionPronData.reduce((s, t) => s + t.assessment.accuracyScore, 0) / sessionPronData.length)
            : (realFeedback.pillarScores.Pronunciation ?? 0),
        } : null,
        professionalProficiency: realFeedback.professionalProficiency ?? null,
      } : null,
      summary: sessionSummary ? {
        overallSentiment: sessionSummary.overallSentiment,
        nextSteps: sessionSummary.nextSteps,
        sessionHighlight: sessionSummary.sessionHighlight,
        pillarScores: sessionSummary.pillarScores || null,
        professionalProficiency: sessionSummary.professionalProficiency ?? null,
        cefrApprox: sessionSummary.cefrApprox || null,
      } : null,
      improvedScript: improvedScript || null,
      practiceSessionId: sessionId,
      // Include interview briefing data for dashboard cross-reference
      interviewBriefing: scenarioType === "interview" && interviewBriefing ? {
        anticipatedQuestions: interviewBriefing.anticipatedQuestions.map(q => ({
          id: String(q.id),
          question: q.question,
          approach: q.approach,
        })),
        questionsToAsk: interviewBriefing.questionsToAsk.map(q => ({
          question: q.question,
        })),
      } : null,
    };

    saveSession(payload).catch((err) => {
      console.error("[SaveSession] ❌ Failed (non-blocking):", err.message);
      sessionSavedRef.current = false; // Allow retry on next render
    });

    // If part of a progression path, tell backend to generate remedial lessons
    if (progressionLevelId && progressionPathId && realFeedback) {
      completeProgressionLevel(
        progressionPathId,
        progressionLevelId,
        realFeedback.professionalProficiency ?? 0,
        realFeedback.pillarScores || {}
      ).catch((err) => {
        console.error("[Progression] ❌ Failed to generate remedial content:", err.message);
      });
    }
  }, [sessionId, scenario, interlocutor, scenarioType, realFeedback, sessionSummary, sessionPronData, interviewBriefing, progressionLevelId, progressionPathId]);

  /* ── Auto-save session when entering interview-analysis with data ── */
  useEffect(() => {
    if ((step === "session-recap" || step === "interview-analysis") && sessionId && !sessionSavedRef.current) {
      if (
        (feedbackStatus === "ready" || feedbackStatus === "error") &&
        (summaryStatus === "ready" || summaryStatus === "error")
      ) {
        saveSessionToBackend();
      }
    }
  }, [step, sessionId, feedbackStatus, summaryStatus, saveSessionToBackend]);

  /* ── Seed "Phrases to Review" from feedback beforeAfter (first session bootstrap) ──
     When AI feedback is ready, extract professional versions as SR phrases
     so the Dashboard's SpacedRepetitionCard has initial content to show. */
  const srSeededRef = useRef(false);
  useEffect(() => {
    if (feedbackStatus !== "ready" || !realFeedback || srSeededRef.current) return;
    srSeededRef.current = true;

    const beforeAfter = realFeedback.beforeAfter || [];
    if (beforeAfter.length === 0) return;

    const srPhrases = beforeAfter.slice(0, 5).map((ba, i) => {
      // Extract a focus word (first word > 4 chars from the professional version)
      const words = ba.professionalVersion.split(/\s+/);
      const focusWord = words.find((w: string) => w.replace(/[^a-zA-Z]/g, "").length > 4) || words[0] || "";
      return createSRPhrase(
        `feedback-${sessionId}-${i}`,
        ba.professionalVersion,
        focusWord.replace(/[^a-zA-Z'-]/g, ""),
        "", // no IPA from feedback
        0,  // no initial score
        0,  // no attempts yet
        scenarioType || "interview",
        scenario || "Practice Session"
      );
    });

    flagPhrasesForReview(srPhrases).catch(err =>
      console.warn("[SR Seed] Failed to seed phrases from feedback:", err)
    );
  }, [feedbackStatus, realFeedback, sessionId, scenarioType, scenario]);

  /* ── Auto-transition for feedback: when BOTH animation AND API are done ── */
  useEffect(() => {
    if (step !== "analyzing" || !feedbackAnimDone) return;
    if (feedbackStatus === "ready" || feedbackStatus === "error") {
      // New flow: go to interview-analysis (replaces conversation-feedback → skill-drill → cp-unlock → session-recap)
      setStep("interview-analysis");
      // Fire session save + progression completion now (no longer gated behind skill drill)
      fireSummaryGeneration();
      if (progressionLevelId && progressionPathId && realFeedback) {
        const score = realFeedback.professionalProficiency ?? 0;
        const pillarScores = realFeedback.pillarScores || {};
        completeProgressionLevel(progressionPathId, progressionLevelId, score, pillarScores)
          .catch((err: any) => console.info("[Progression]", err));
      }
    } else if (feedbackStatus === "loading") {
      console.warn("[AnalyzeFeedback] ⚠️ Skip pressed while API loading — forcing transition");
      setFeedbackStatus("error");
    }
  }, [step, feedbackAnimDone, feedbackStatus, fireSummaryGeneration, progressionLevelId, progressionPathId, realFeedback, completeProgressionLevel]);

  /* ── Practice Again: repeat tracking ── */
  const [repeatCount, setRepeatCount] = useState(0);
  const [sessionVersion, setSessionVersion] = useState(0);
  const plan: UserPlan = userPlan ?? "free";
  const maxRepeats = MAX_REPEATS[plan];
  const canRepeat = repeatCount < maxRepeats;
  const repeatInfo: RepeatInfo = {
    attempt: repeatCount + 1,
    maxAttempts: maxRepeats + 1,
    canRepeat,
  };

  /* ── Usage gating & paywall ── */
  const usageGating = useUsageGating(plan);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [paywallReason, setPaywallReason] = useState<PaywallReason | null>(null);

  /** v9.0: Check if user can start a fresh attempt on current level */
  const gateResult = usageGating.canStartFreshAttempt(
    scenarioType || "interview",
    progressionLevelId || "default",
    repeatInfo.maxAttempts
  );

  const handlePaywallTriggered = useCallback((reason: PaywallReason) => {
    setPaywallReason(reason);
    setPaywallOpen(true);
  }, []);

  const handlePurchaseComplete = useCallback((purchaseType: import("../services/types").PurchaseType) => {
    // v9.0: Mark path as purchased
    usageGating.addPurchasedPath(scenarioType || "interview");
    setPaywallOpen(false);
    setPaywallReason(null);

    // After purchase, grant extra repeats
    if (paywallReason === "attempts-exhausted") {
      setRepeatCount(0);
      setSessionId(null);
      setServiceError(null);
      setSessionVersion((v) => v + 1);
      setStep("practice");
    }
  }, [paywallReason, usageGating, scenarioType]);

  /** Handle "Practice Again" from Conversation Feedback */
  const handlePracticeAgain = useCallback(() => {
    if (!canRepeat) return;
    setRepeatCount((c) => c + 1);
    setSessionId(null);
    setServiceError(null);
    setSessionVersion((v) => v + 1);
    // Go directly to practice — skip pre-briefing on repeat
    setStep("practice");
  }, [canRepeat]);

  useEffect(() => {
    // In dev preview mode, skip real session preparation
    if (isDevPreview) return;
    // For interview scenarios, defer until briefingForSession is ready (Gap A+B)
    // This ensures anticipated questions + user drafts are injected into the prompt.
    // On repeat (sessionVersion > 0), briefingForSession is already set so it fires immediately.
    if (scenarioType === "interview" && !briefingForSession) return;
    let cancelled = false;
    realConversationService
      .prepareSession({
        scenario,
        interlocutor,
        scenarioType,
        guidedFields: mergedGuidedFields,
        // Gap A+B: pass briefing data to assembler via SessionConfig
        interviewBriefing: briefingForSession ?? undefined,
      })
      .then((prepared) => {
        if (!cancelled) {
          setSessionId(prepared.sessionId);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          const serviceErr = toServiceError(err);
          console.error(`[PracticeSession] prepareSession failed:`, serviceErr.code, serviceErr.message, err);
          setServiceError(serviceErr);
        }
      });
    return () => { cancelled = true; };
  }, [scenario, interlocutor, scenarioType, mergedGuidedFields, sessionVersion, isDevPreview, briefingForSession]);

  /* Retry handler */
  const handleRetry = useCallback(() => {
    setServiceError(null);
  }, []);

  const handleDismissError = useCallback(() => {
    setServiceError(null);
  }, []);

  /* ── Scroll to top on step change ── */
  const stepContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // Immediate scroll on both the inner container and window
    stepContainerRef.current?.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
    // Deferred scroll — catches cases where AnimatePresence hasn't finished
    // the exit/enter transition yet, or async content just rendered.
    const raf = requestAnimationFrame(() => {
      stepContainerRef.current?.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
    });
    // Extra safety: a second pass after AnimatePresence (mode="wait") completes (~500ms)
    const timer = setTimeout(() => {
      stepContainerRef.current?.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
    }, 600);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
    };
  }, [step]);

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

  return (
    <ProgressionProvider value={{ levelTitle: progressionLevelTitle }}>
    <div className="size-full flex flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>
      <AppHeader
        variant="session"
        userName={userName}
        onLogout={onLogout}
        onNavigateToAccount={onNavigateToAccount}
      />

      {/* Step content (animated transitions) */}
      <div ref={stepContainerRef} className="flex-1 relative min-h-0 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${step}-${sessionVersion}`}
            className="w-full min-h-full"
            initial={{ opacity: 0, filter: "blur(4px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, filter: "blur(4px)" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Global error banner */}
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

            {step === "key-experience" && (
              <KeyExperienceScreen
                guidedFields={guidedFields}
                userProfile={userProfile}
                onProfileUpdate={onProfileUpdate}
                onContinue={() => setStep("cv-upload")}
                onBack={onFinish}
              />
            )}
            {step === "cv-upload" && (
              <CVUploadScreen
                scenarioType={scenarioType}
                userProfile={userProfile}
                onProfileUpdate={onProfileUpdate}
                onContinue={(cvData) => {
                  // Store CV data for later merging with extra-context
                  setExtraContext((prev) => ({ ...prev, ...cvData }));
                  setStep("extra-context");
                }}
                onBack={onFinish}
              />
            )}
            {step === "extra-context" && (
              <ExtraContextScreen
                scenarioType={scenarioType}
                userProfile={userProfile}
                onProfileUpdate={onProfileUpdate}
                onContinue={(extraData) => {
                  // Inject profile data into guided fields for AI generation
                  const enriched = { ...extraData };
                  if (scenarioType === "interview") {
                    // Inject keyExperience from profile
                    if (userProfile?.keyExperience) {
                      enriched["Your key experience"] = userProfile.keyExperience;
                    }
                    // Inject company from profile (Dashboard flow)
                    if (userProfile?.company && !guidedFields?.company) {
                      enriched["company"] = userProfile.company;
                    }
                    // Map "Role you're applying for" → "role" for AI prompt compatibility
                    if (enriched["Role you're applying for"] && !guidedFields?.role) {
                      enriched["role"] = enriched["Role you're applying for"];
                    }
                  }
                  setExtraContext(enriched);
                  /* ── Cache-hit fast path: skip GPT call if content is already cached ── */
                  if (scenarioType === "interview") {
                    // Use content-aware cache key: include user's actual input so
                    // different JD/experience combos produce different cache entries
                    const contentFingerprint = JSON.stringify(
                      Object.entries(enriched).sort(([a], [b]) => a.localeCompare(b))
                    );
                    const briefingCacheKey = `${sKey}_${simpleHash(contentFingerprint)}`;
                    const cachedBriefing = interviewBriefingCache.get(briefingCacheKey);
                    if (cachedBriefing && cachedBriefing.anticipatedQuestions?.length > 0) {
                      setInterviewBriefing(cachedBriefing);
                      setScriptGenStatus("ready");

                      // Ensure CV Match fires on cache-hit if it was missing or failed previously
                      const userCv = enriched["cvSummary"] || enriched["manualExperience"] || enriched["Your key experience"];
                      const userJd = enriched["Job Description"];
                      if (userCv && userJd && !cvMatchCacheV2.get(sKey)) {
                        setCvMatchStatus("loading");
                        analyzeCvMatch(userCv, userJd)
                          .then((data) => {
                            cvMatchCacheV2.set(sKey, data);
                            setCvMatchData(data);
                            setCvMatchStatus("success");
                          })
                          .catch((err) => {
                            console.error("[CvMatchAnalysis] ❌ Failed:", err);
                            setCvMatchStatus("error");
                          });
                      }

                      // If in a path session with methodology, show pre-brief first
                      if (progressionPathId && progressionLevelId) {
                        const levelDef = getLevelDefinition(progressionPathId, progressionLevelId);
                        if (levelDef?.methodology) {
                          setStep("pre-brief");
                          return;
                        }
                      }
                      setStep("pre-briefing");
                      return;
                    }
                  } else {
                    const cachedScript = scriptCache.get(sKey);
                    const cachedToolkit = toolkitCache.get(sKey);
                    if (cachedScript && cachedScript.length > 0) {
                      setGeneratedScript(cachedScript);
                      setScriptGenStatus("ready");
                      if (cachedToolkit) {
                        setPreparationToolkit(cachedToolkit);
                      }
                      // If in a path session with methodology, show pre-brief first
                      if (progressionPathId && progressionLevelId) {
                        const levelDef = getLevelDefinition(progressionPathId, progressionLevelId);
                        if (levelDef?.methodology) {
                          setStep("pre-brief");
                          return;
                        }
                      }
                      setStep("pre-briefing");
                      return;
                    }
                  }
                  // Fire script generation — if path session with methodology, show pre-brief
                  // while script generates in background (smart UX: no wasted time)
                  if (progressionPathId && progressionLevelId) {
                    const levelDef = getLevelDefinition(progressionPathId, progressionLevelId);
                    if (levelDef?.methodology) {
                      setStep("pre-brief");
                      fireScriptGeneration(enriched);
                      return;
                    }
                  }
                  setStep("generating-script");
                  fireScriptGeneration(enriched);
                }}
                onBack={() => setStep("cv-upload")}
              />
            )}

            {/* Pre-Session Brief — methodology/framework step (Conversational Path only) */}
            {step === "pre-brief" && progressionPathId && progressionLevelId && (() => {
              const levelDef = getLevelDefinition(progressionPathId, progressionLevelId);
              if (!levelDef?.methodology) return null;
              return (
                <div className="w-full min-h-[calc(100dvh-4rem)] bg-gradient-to-b from-[#f8fafc] to-white flex items-start justify-center px-4 py-8 md:py-12">
                  <PreSessionBrief
                    levelTitle={levelDef.title}
                    methodology={levelDef.methodology}
                    anchorPhrases={levelDef.anchorPhrases}
                    personalizedPattern={personalizedPattern}
                    patternLoading={patternLoading}
                    onReady={() => {
                      // Script may already be ready (cached or fast gen) — go to pre-briefing
                      if (scriptGenStatus === "ready") {
                        setStep("pre-briefing");
                      } else {
                        setStep("generating-script");
                      }
                    }}
                    onSkip={() => {
                      if (scriptGenStatus === "ready") {
                        setStep("pre-briefing");
                      } else {
                        setStep("generating-script");
                      }
                    }}
                  />
                </div>
              );
            })()}

            {step === "generating-script" && (
              <>
                {/* Animated loader — waits for API before transitioning */}
                {scriptGenStatus !== "error" && (
                  <AnalyzingScreen
                    variant="generating-script"
                    canComplete={scriptGenStatus === "ready"}
                    onComplete={() => setAnimationDone(true)}
                  />
                )}

                {/* Error state with retry */}
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
                          setStep("extra-context");
                          setScriptGenStatus("idle");
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

            {step === "pre-briefing" && interviewBriefing && scenarioType === "interview" && (
              <InterviewBriefingScreen
                interlocutor={interlocutor}
                briefingData={interviewBriefing}
                onStartSimulation={(userDrafts) => {
                  // Package briefing data for the interviewer prompt (Gap A+B)
                  const briefingPayload: SessionConfig["interviewBriefing"] = {
                    anticipatedQuestions: interviewBriefing.anticipatedQuestions.map((q) => ({
                      id: q.id,
                      question: q.question,
                      approach: q.approach,
                      suggestedOpener: q.suggestedOpener,
                      framework: q.framework,
                      keyPhrases: q.keyPhrases.map((kp) => kp.phrase),
                    })),
                    userDrafts: Object.keys(userDrafts).length > 0 ? userDrafts : undefined,
                  };
                  setBriefingForSession(briefingPayload);
                  // Persist drafts for PDF generation later
                  if (Object.keys(userDrafts).length > 0) {
                    setUserDrafts(userDrafts);
                  }
                  setStep("practice");
                }}
                onBack={() => setStep("extra-context")}
                scenario={scenario}
              />
            )}
            {step === "pre-briefing" && generatedScript && scenarioType === "sales" && (
              <InterviewBriefingScreen
                interlocutor={interlocutor}
                briefingData={scriptSectionsToBriefingData(generatedScript)}
                onStartSimulation={(userDrafts) => {
                  // Package sales briefing data for session
                  const salesBriefing = scriptSectionsToBriefingData(generatedScript);
                  const briefingPayload: SessionConfig["interviewBriefing"] = {
                    anticipatedQuestions: salesBriefing.anticipatedQuestions.map((q) => ({
                      id: q.id,
                      question: q.question,
                      approach: q.approach,
                      suggestedOpener: q.suggestedOpener,
                      framework: q.framework,
                      keyPhrases: q.keyPhrases.map((kp) => kp.phrase),
                    })),
                    userDrafts: Object.keys(userDrafts).length > 0 ? userDrafts : undefined,
                  };
                  setBriefingForSession(briefingPayload);
                  if (Object.keys(userDrafts).length > 0) {
                    setUserDrafts(userDrafts);
                  }
                  setStep("practice");
                }}
                onBack={() => setStep("extra-context")}
                scenario={scenario}
                scenarioType={scenarioType}
              />
            )}
            {step === "pre-briefing" && generatedScript && scenarioType !== "interview" && scenarioType !== "sales" && (
              <PreBriefingScreen
                scenarioType={scenarioType}
                interlocutor={interlocutor}
                onStartSimulation={() => setStep("practice")}
                onBack={() => setStep("extra-context")}
                generatedSections={generatedScript}
                preparationToolkit={preparationToolkit}
              />
            )}
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
                onConversationComplete={() => {
                  // Pre-warm: start feedback + improved script analysis while user
                  // is still reading the last AI message — before they click "Analyze".
                  fireFeedbackAnalysis();
                  fireImprovedScriptGeneration();
                }}
                onViewFeedback={async (pronData) => {
                  setSessionPronData(pronData);
                  if (sessionId && pronData.length > 0) pronDataCache.set(sessionId, pronData);
                  // fireFeedbackAnalysis() and fireImprovedScriptGeneration() were already
                  // called in onConversationComplete when the session ended. The guard in
                  // fireFeedbackAnalysis prevents double calls. Just transition the step.
                  setStep("analyzing");
                  // Save pronunciation data to KV in background (non-blocking)
                  if (pronData.length > 0 && sessionId) {
                    savePronunciationData(sessionId, pronData).catch(() => {});
                  }
                }}
                onEnd={onFinish}
              />
            )}
            {step === "analyzing" && (
              <AnalyzingScreen
                variant="feedback"
                canComplete={feedbackStatus === "ready" || feedbackStatus === "error"}
                onComplete={() => setFeedbackAnimDone(true)}
              />
            )}
            {step === "interview-analysis" && (
              <InterviewAnalysis
                scenarioType={scenarioType}
                realFeedback={realFeedback}
                pronunciationData={sessionPronData}
                onPracticeAgain={canRepeat ? handlePracticeAgain : undefined}
                onDownloadPdf={() => {
                  downloadSessionReportPdf({
                    briefing: scenarioType === "interview" ? interviewBriefing : null,
                    interlocutor,
                    scenario,
                    scenarioType,
                    feedback: realFeedback ? {
                      strengths: realFeedback.strengths,
                      opportunities: realFeedback.opportunities,
                      beforeAfter: realFeedback.beforeAfter,
                      pillarScores: realFeedback.pillarScores,
                      professionalProficiency: realFeedback.professionalProficiency,
                      contentScores: realFeedback.contentScores,
                      interviewReadinessScore: realFeedback.interviewReadinessScore,
                      preparationUtilization: realFeedback.preparationUtilization,
                      contentInsights: realFeedback.contentInsights,
                      languageInsights: realFeedback.languageInsights,
                    } : null,
                    summary: sessionSummary ? {
                      overallSentiment: sessionSummary.overallSentiment,
                      nextSteps: sessionSummary.nextSteps.map(s => `${s.title}: ${s.desc}`),
                      sessionHighlight: sessionSummary.sessionHighlight,
                    } : null,
                    sessionDuration: `${Math.round((Date.now() - sessionStartRef.current) / 60000)} min`,
                    userDrafts: scenarioType === "interview" && Object.keys(userDrafts).length > 0 ? userDrafts : undefined,
                    pronunciationData: sessionPronData.length > 0 ? sessionPronData : undefined,
                    improvedScript: improvedScript,
                    cvMatchData: (cvMatchStatus === "success" && cvMatchData) ? cvMatchData : null,
                  }).catch((err) => {
                    console.error("[InterviewAnalysis] PDF generation failed:", err);
                  });
                }}
                onFinish={() => {
                  onFinish();
                }}
                canRetryFree={canRepeat}
              />
            )}
            {step === "path-conversion" && (
              <PathConversionScreen
                scenarioType={scenarioType}
                proficiencyScore={realFeedback?.professionalProficiency ?? undefined}
                onPurchasePath={() => handlePaywallTriggered("path-required")}
                onContinue={onFinish}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Paywall Modal (v9.0 — Learning Path) ── */}
      <PathPurchaseModal
        open={paywallOpen}
        onClose={() => { setPaywallOpen(false); setPaywallReason(null); }}
        scenarioType={scenarioType || "interview"}
        paywallReason={paywallReason ?? "path-required"}
        onPurchaseComplete={handlePurchaseComplete}
      />
    </div>
    </ProgressionProvider>
  );
}