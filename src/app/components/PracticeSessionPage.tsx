import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { BrandLogo, AnalyzingScreen } from "./shared";
import { realConversationService } from "../../services";
import { toServiceError } from "../../services/errors";
import type { ServiceError } from "../../services/errors";
import { ServiceErrorBanner } from "./shared/ServiceErrorBanner";
import { getBeforeAfterForScenario, getStrengthsForScenario } from "../../services/scenario-data";
import { useMediaRecorder } from "../hooks/useMediaRecorder";
import { projectId, publicAnonKey } from "../../../utils/supabase/info";
import { getAuthToken } from "../../services/supabase";
import type {
  ScenarioType,
  ScriptSection,
  UserPlan,
  CreditPack,
  SessionSummary,
  TurnPronunciationData,
  SessionConfig,
} from "../../services/types";
import { SessionProgressBar } from "./SessionProgressBar";
import { SessionReport } from "./SessionReport";
import { InterviewBriefingScreen } from "./InterviewBriefingScreen";
import type { Step } from "./shared/session-types";
import { VoicePractice } from "./session/VoicePractice";
import { ConversationFeedback, type RealFeedbackData, type RepeatInfo } from "./session/ConversationFeedback";
import { CreditUpsellModal } from "./CreditUpsellModal";
import { useUsageGating } from "../hooks/useUsageGating";
import type { PaywallReason } from "../hooks/useUsageGating";
import type { InterviewBriefingData, OnboardingProfile } from "../../services/types";
import {
  scenarioKey,
  scriptCache,
  toolkitCache,
  cvMatchCache,
  interviewBriefingCache,
  feedbackCache,
  summaryCache,
  improvedScriptCache,
  pronDataCache,
  cleanupExpiredCache,
} from "../utils/sessionCache";
import { detectLanguageBackground } from "../../services/locale-detect";
import { downloadSessionReportPdf } from "../utils/cheatSheetPdf";
import { analyzeCvMatch, type CVMatchResult } from "../../services/cvMatchService";

/** Detect locale once at module level — stable across renders */
const _detectedLocale = detectLanguageBackground();

/* ── Sub-screens extracted to session/ ── */
import { PreBriefingScreen } from "./session/PreBriefingScreen";
import { ExtraContextScreen } from "./session/ExtraContextScreen";
import { KeyExperienceScreen } from "./session/KeyExperienceScreen";

/* ═══════════════════════════════════════════════════════════
   TYPES & DATA (MVP-simplified)
   ═══════════════════════════════════════════════════════════ */

interface PracticeSessionPageProps {
  scenario: string;
  interlocutor: string;
  scenarioType?: ScenarioType;
  guidedFields?: Record<string, string>;
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
}

/** Repeat limits: free tier gets 1 repeat (2 total), paid gets 2 repeats (3 total) */
const MAX_REPEATS: Record<UserPlan, number> = {
  free: 1,
  "per-session": 2,
};

/** RepeatInfo imported from ./session/ConversationFeedback */

const SCENARIO_LABELS_MAP: Record<string, string> = {
  sales: "Sales Pitch",
  interview: "Job Interview",
  csuite: "Executive Presentation",
  negotiation: "Negotiation",
  networking: "Networking",
};

/* ═══════════════════════════════════════════════════════════
   MAIN ORCHESTRATOR (MVP-simplified flow)
   extra-context → generating-script → pre-briefing →
   practice → analyzing → conversation-feedback → session-recap → Dashboard
   ═══════════════════════════════════════════════════════════ */
export function PracticeSessionPage({
  scenario,
  interlocutor,
  scenarioType,
  guidedFields,
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
}: PracticeSessionPageProps) {
  const isDevPreview = !!devInitialStep;

  /* Recover session state from browser history if navigating Back/Forward */
  const initialHistoryState = useMemo(() => {
    if (typeof window !== "undefined" && window.history.state?.influSession) {
      return window.history.state.influSession as { step: Step; sessionId: string };
    }
    return null;
  }, []);

  /* Determine initial step: if interview + no keyExperience in profile → key-experience first */
  const needsKeyExperience = scenarioType === "interview" && !userProfile?.keyExperience;
  const [step, setStep] = useState<Step>(() => {
    if (devInitialStep) return devInitialStep;
    if (initialHistoryState?.step) return initialHistoryState.step;
    return needsKeyExperience ? "key-experience" : "extra-context";
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
    if (initialHistoryState?.step === "conversation-feedback" || initialHistoryState?.step === "session-recap") return "ready";
    return "idle";
  });
  const [feedbackAnimDone, setFeedbackAnimDone] = useState(() => {
    if (isDevPreview) return true;
    if (initialHistoryState?.step === "conversation-feedback" || initialHistoryState?.step === "session-recap") return true;
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
    if (initialHistoryState?.step === "session-recap") return "ready";
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
    if (initialHistoryState?.step === "session-recap") return "ready";
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
  const [cvMatchData, setCvMatchData] = useState<CVMatchResult | null>(() => cvMatchCache.get(sKey));
  const [cvMatchStatus, setCvMatchStatus] = useState<"idle" | "loading" | "success" | "error">(
    cvMatchCache.get(sKey) ? "success" : "idle"
  );

  /* ── Script / Briefing generation: call Edge Function ── */
  const fireScriptGeneration = useCallback(async (extraData?: Record<string, string>) => {
    setScriptGenStatus("loading");
    setScriptGenError(null);
    setGeneratedScript(null);
    setInterviewBriefing(null);
    setAnimationDone(false);
    setPreparationToolkit(null);

    const allFields = { ...guidedFields, ...(extraData || extraContext) };

    // ━━━ INTERVIEW PATH: Single call → card-based briefing ━━━
    if (scenarioType === "interview") {
      const briefingUrl = `https://${projectId}.supabase.co/functions/v1/make-server-08b8658d/generate-interview-briefing`;

      fetch(briefingUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await getAuthToken()}`,
        },
        body: JSON.stringify({
          scenario,
          interlocutor,
          guidedFields: allFields,
          locale: _detectedLocale,
        }),
      })
        .then(async (res) => {
          if (!res.ok) {
            const errBody = await res.text();
            throw new Error(`Server ${res.status}: ${errBody.slice(0, 200)}`);
          }
          return res.json();
        })
        .then((data) => {
          const questions = data.anticipatedQuestions || [];
          if (questions.length === 0) {
            throw new Error("No anticipated questions generated");
          }
          const briefing: InterviewBriefingData = {
            anticipatedQuestions: questions,
            questionsToAsk: data.questionsToAsk || [],
            culturalTips: data.culturalTips || [],
          };
          setInterviewBriefing(briefing);
          interviewBriefingCache.set(sKey, briefing);
          setScriptGenStatus("ready");
        })
        .catch((err) => {
          console.error("[InterviewBriefing] ❌ Failed:", err.message);
          setScriptGenError(err.message);
          setScriptGenStatus("error");
        });

      return; // Interview uses single endpoint — no separate toolkit call
    }

    // ━━━ SALES / DEFAULT PATH: Existing script + toolkit parallel calls ━━━
    const serverUrl = `https://${projectId}.supabase.co/functions/v1/make-server-08b8658d/generate-script`;


    fetch(serverUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${await getAuthToken()}`,
      },
      body: JSON.stringify({
        scenario,
        interlocutor,
        scenarioType,
        guidedFields: allFields,
        locale: _detectedLocale,
      }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const errBody = await res.text();
          throw new Error(`Server ${res.status}: ${errBody.slice(0, 200)}`);
        }
        return res.json();
      })
      .then((data) => {
        if (data.sections && Array.isArray(data.sections) && data.sections.length > 0) {
          if (data._debug) {
          }
          setGeneratedScript(data.sections);
          scriptCache.set(sKey, data.sections);
          setScriptGenStatus("ready");
        } else {
          throw new Error("Response missing valid sections array");
        }
      })
      .catch((err) => {
        console.error("[GenerateScript] ❌ Failed:", err.message);
        setScriptGenError(err.message);
        setScriptGenStatus("error");
      });

    // ── Fire CV Match Analysis in parallel (non-blocking) ──
    const userCv = allFields["cvSummary"] || allFields["manualExperience"] || allFields["Your key experience"];
    const userJd = allFields["Job Description"];
    if (userCv && userJd && !cvMatchCache.get(sKey)) {
      setCvMatchStatus("loading");
      analyzeCvMatch(userCv, userJd)
        .then((data) => {
          cvMatchCache.set(sKey, data);
          setCvMatchData(data);
          setCvMatchStatus("success");
        })
        .catch((err) => {
          console.error("[CvMatchAnalysis] ❌ Failed:", err);
          setCvMatchStatus("error");
        });
    }

    // ── Fire preparation toolkit generation in parallel (non-blocking) ──
    const toolkitUrl = `https://${projectId}.supabase.co/functions/v1/make-server-08b8658d/generate-preparation-toolkit`;
    fetch(toolkitUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${await getAuthToken()}`,
      },
      body: JSON.stringify({
        scenario,
        interlocutor,
        scenarioType,
        guidedFields: allFields,
        locale: _detectedLocale,
      }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const errBody = await res.text();
          throw new Error(`Toolkit server ${res.status}: ${errBody.slice(0, 200)}`);
        }
        return res.json();
      })
      .then((data) => {
        const toolkit = {
          powerPhrases: data.powerPhrases || [],
          powerQuestions: data.powerQuestions || [],
          culturalTips: data.culturalTips || [],
        };
        setPreparationToolkit(toolkit);
        toolkitCache.set(sKey, toolkit);
      })
      .catch((err) => {
      });
  }, [scenario, interlocutor, scenarioType, guidedFields, extraContext, sKey]);

  /* ── Auto-transition: only when BOTH animation AND API are done ── */
  useEffect(() => {
    // In dev preview mode for generating-script, don't auto-transition (let user see the animation)
    if (isDevPreview && devInitialStep === "generating-script") return;
    const contentReady = generatedScript || interviewBriefing;
    if (step === "generating-script" && animationDone && scriptGenStatus === "ready" && contentReady) {
      setStep("pre-briefing");
    }
  }, [step, animationDone, scriptGenStatus, generatedScript, interviewBriefing, isDevPreview, devInitialStep]);

  /* ── Feedback analysis: call /analyze-feedback when entering "analyzing" step ── */
  const fireFeedbackAnalysis = useCallback(async () => {
    if (!sessionId) return;
    setFeedbackStatus("loading");
    setRealFeedback(null);
    setFeedbackAnimDone(false);

    const serverUrl = `https://${projectId}.supabase.co/functions/v1/make-server-08b8658d/analyze-feedback`;

    fetch(serverUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${await getAuthToken()}`,
      },
      body: JSON.stringify({
        sessionId,
        scenarioType,
        locale: _detectedLocale,
      }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const errBody = await res.text();
          throw new Error(`Server ${res.status}: ${errBody.slice(0, 200)}`);
        }
        return res.json();
      })
      .then((data) => {
        if (data._debug) {
        }
        const fb: RealFeedbackData = {
          strengths: data.strengths || [],
          opportunities: data.opportunities || [],
          beforeAfter: data.beforeAfter || [],
          pillarScores: data.pillarScores || null,
          professionalProficiency: typeof data.professionalProficiency === "number" ? data.professionalProficiency : null,
          // Interview-specific Content Quality fields
          contentScores: data.contentScores || null,
          interviewReadinessScore: typeof data.interviewReadinessScore === "number" ? data.interviewReadinessScore : null,
          contentInsights: data.contentInsights || null,
          preparationUtilization: data.preparationUtilization || null,
        };
        setRealFeedback(fb);
        if (sessionId) feedbackCache.set(sessionId, fb);
        setFeedbackStatus("ready");
      })
      .catch((err) => {
        console.error("[AnalyzeFeedback] ❌ Failed:", err.message);
        setFeedbackStatus("error");
        // Don't block the flow — user can still see mock feedback
      });
  }, [sessionId, scenarioType]);

  /* ── Summary generation: call /generate-summary for session feedback ── */
  const fireSummaryGeneration = useCallback(async () => {
    if (!sessionId) return;
    setSessionSummary(null);
    setSummaryStatus("loading");

    const serverUrl = `https://${projectId}.supabase.co/functions/v1/make-server-08b8658d/generate-summary`;

    fetch(serverUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${await getAuthToken()}`,
      },
      body: JSON.stringify({
        sessionId,
        scenarioType: scenarioType || "interview",
        locale: _detectedLocale,
      }),
    })
      .then((res) => {
        if (!res.ok) return res.text().then((t) => { throw new Error(`Summary ${res.status}: ${t.slice(0, 200)}`); });
        return res.json();
      })
      .then((data) => {
        const sum = {
          overallSentiment: data.overallSentiment || "",
          nextSteps: data.nextSteps || [],
          sessionHighlight: data.sessionHighlight || "",
          pillarScores: data.pillarScores || null,
          professionalProficiency: typeof data.professionalProficiency === "number" ? data.professionalProficiency : null,
          cefrApprox: data.cefrApprox || null,
        };
        setSessionSummary(sum);
        setSummaryStatus("ready");
        if (sessionId) summaryCache.set(sessionId, sum);
      })
      .catch((err) => {
        console.error("[GenerateSummary] ❌ Failed:", err.message);
        setSummaryStatus("error");
        // Non-blocking — report renders without summary
      });
  }, [sessionId, scenarioType]);

  /* ── Golden Script generation: call /generate-improved-script async ── */
  const fireImprovedScriptGeneration = useCallback(async () => {
    if (!sessionId) return;
    setImprovedScript(null);
    setImprovedScriptStatus("loading");

    const serverUrl = `https://${projectId}.supabase.co/functions/v1/make-server-08b8658d/generate-improved-script`;

    fetch(serverUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${await getAuthToken()}`,
      },
      body: JSON.stringify({
        sessionId,
        locale: _detectedLocale,
      }),
    })
      .then((res) => {
        if (!res.ok) return res.text().then((t) => { throw new Error(`Script ${res.status}: ${t.slice(0, 200)}`); });
        return res.json();
      })
      .then((data) => {
        if (data && data.sections) {
          setImprovedScript(data.sections);
          improvedScriptCache.set(sessionId, data.sections);
          setImprovedScriptStatus("ready");
        } else {
          setImprovedScriptStatus("error");
        }
      })
      .catch((err) => {
        console.error("[GenerateImprovedScript] ❌ Failed:", err.message);
        setImprovedScriptStatus("error");
      });
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
          id: q.id,
          question: q.question,
          approach: q.approach,
        })),
        questionsToAsk: interviewBriefing.questionsToAsk.map(q => ({
          question: q.question,
        })),
      } : null,
    };

    const serverUrl = `https://${projectId}.supabase.co/functions/v1/make-server-08b8658d/sessions`;

    fetch(serverUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${await getAuthToken()}`,
      },
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        if (!res.ok) {
          const errBody = await res.text();
          throw new Error(`Server ${res.status}: ${errBody.slice(0, 200)}`);
        }
        return res.json();
      })
      .then((data) => {
      })
      .catch((err) => {
        console.error("[SaveSession] ❌ Failed (non-blocking):", err.message);
        sessionSavedRef.current = false; // Allow retry on next render
      });
  }, [sessionId, scenario, interlocutor, scenarioType, realFeedback, sessionSummary, sessionPronData, interviewBriefing]);

  /* ── Auto-save session when entering session-recap with data ── */
  useEffect(() => {
    if (step === "session-recap" && sessionId && !sessionSavedRef.current) {
      if (
        (feedbackStatus === "ready" || feedbackStatus === "error") &&
        (summaryStatus === "ready" || summaryStatus === "error")
      ) {
        saveSessionToBackend();
      }
    }
  }, [step, sessionId, feedbackStatus, summaryStatus, saveSessionToBackend]);

  /* ── Auto-transition for feedback: when BOTH animation AND API are done ── */
  useEffect(() => {
    if (step === "analyzing" && feedbackAnimDone && (feedbackStatus === "ready" || feedbackStatus === "error")) {
      setStep("conversation-feedback");
    }
  }, [step, feedbackAnimDone, feedbackStatus]);

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

  /** Determine if free user should see paywall on repeat limit */
  const gateResult = usageGating.canPracticeAgain(repeatInfo.attempt, repeatInfo.maxAttempts);
  const showPaywallOnRepeat = !repeatInfo.canRepeat && gateResult.reason === "extra-practice";

  const handlePaywallTriggered = useCallback((reason: PaywallReason) => {
    setPaywallReason(reason);
    setPaywallOpen(true);
  }, []);

  const handlePurchaseComplete = useCallback((_pack: CreditPack, creditsAdded: number) => {
    usageGating.addCredits(creditsAdded);
    setPaywallOpen(false);
    setPaywallReason(null);

    // After purchase, grant extra repeats based on what was bought
    if (paywallReason === "extra-practice") {
      // Immediately allow practice again
      setRepeatCount(0); // Reset attempts
      setSessionId(null);
      setServiceError(null);
      setSessionVersion((v) => v + 1);
      setStep("practice");
    }
  }, [paywallReason, usageGating]);

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

  return (
    <div className="size-full flex flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Persistent header: BrandLogo + inline stepper */}
      <header className="sticky top-0 z-50 bg-white border-b border-[#e2e8f0] shrink-0">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-6 h-16">
          <BrandLogo />
          <div className="max-w-xs w-full -translate-y-2">
            <SessionProgressBar currentStep={step} />
          </div>
        </div>
      </header>

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
                onContinue={() => setStep("extra-context")}
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
                    const cachedBriefing = interviewBriefingCache.get(sKey);
                    if (cachedBriefing && cachedBriefing.anticipatedQuestions?.length > 0) {
                      setInterviewBriefing(cachedBriefing);
                      setScriptGenStatus("ready");
                      setStep("pre-briefing");

                      // Ensure CV Match fires on cache-hit if it was missing or failed previously
                      const userCv = enriched["cvSummary"] || enriched["manualExperience"] || enriched["Your key experience"];
                      const userJd = enriched["Job Description"];
                      if (userCv && userJd && !cvMatchCache.get(sKey)) {
                        setCvMatchStatus("loading");
                        analyzeCvMatch(userCv, userJd)
                          .then((data) => {
                            cvMatchCache.set(sKey, data);
                            setCvMatchData(data);
                            setCvMatchStatus("success");
                          })
                          .catch((err) => {
                            console.error("[CvMatchAnalysis] ❌ Failed:", err);
                            setCvMatchStatus("error");
                          });
                      }

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
                      setStep("pre-briefing");
                      return;
                    }
                  }
                  setStep("generating-script");
                  fireScriptGeneration(enriched);
                }}
                onBack={needsKeyExperience ? () => setStep("key-experience") : onFinish}
              />
            )}
            {step === "generating-script" && (
              <>
                {/* Show animation while loading OR while waiting for animation to finish */}
                {scriptGenStatus !== "error" && (
                  <AnalyzingScreen
                    variant="generating-script"
                    canComplete={scriptGenStatus === "ready" && !!(generatedScript || interviewBriefing)}
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
                        {scenarioType === "interview" ? "Briefing generation failed" : "Script generation failed"}
                      </h3>
                      <p className="text-sm text-[#94a3b8] mb-1">
                        {scenarioType === "interview"
                          ? "We couldn't generate your interview briefing. This is usually a temporary issue."
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
                    anticipatedQuestions: interviewBriefing.anticipatedQuestions.map(q => ({
                      id: q.id,
                      question: q.question,
                      approach: q.approach,
                      suggestedOpener: q.suggestedOpener,
                      framework: q.framework,
                      keyPhrases: q.keyPhrases.map(kp => kp.phrase),
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
                cvMatchData={cvMatchData}
                cvMatchStatus={cvMatchStatus}
              />
            )}
            {step === "pre-briefing" && generatedScript && scenarioType !== "interview" && (
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
                onViewFeedback={(pronData) => {
                  setSessionPronData(pronData);
                  if (sessionId && pronData.length > 0) pronDataCache.set(sessionId, pronData);
                  setStep("analyzing");
                  fireFeedbackAnalysis();
                  fireImprovedScriptGeneration(); // Fire in parallel!
                  // Save pronunciation data to KV in background (non-blocking)
                  if (pronData.length > 0 && sessionId) {
                    const saveUrl = `https://${projectId}.supabase.co/functions/v1/make-server-08b8658d/save-pronunciation`;
                    fetch(saveUrl, {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${await getAuthToken()}`,
                      },
                      body: JSON.stringify({ sessionId, turns: pronData }),
                    })
                      .then(async (res) => {
                        if (!res.ok) throw new Error(`Save pronunciation ${res.status}`);
                        const data = await res.json();
                      })
                      .catch((err) => {
                      });
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
            {step === "conversation-feedback" && (
              <ConversationFeedback
                scenarioType={scenarioType}
                onGenerateReport={() => {
                  fireSummaryGeneration();
                  setStep("session-recap");
                }}
                onPracticeAgain={handlePracticeAgain}
                repeatInfo={repeatInfo}
                onPaywallTriggered={handlePaywallTriggered}
                showPaywallOnRepeat={showPaywallOnRepeat}
                realFeedback={realFeedback}
                pronunciationData={sessionPronData}
                sessionId={sessionId}
              />
            )}
            {step === "session-recap" && (
              <SessionReport
                scenarioType={scenarioType}
                guidedFields={mergedGuidedFields}
                realFeedback={realFeedback}
                sessionSummary={sessionSummary}
                generatedScript={generatedScript}
                sessionDuration={`${Math.round((Date.now() - sessionStartRef.current) / 60000)} min`}
                pronunciationData={sessionPronData}
                onFinish={onFinish}
                finishLabel="Go To Dashboard"
                onDownloadReport={() => {
                  // bypass gating to offer free tests
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
                    }).catch((err) => {
                      console.error("[SessionReport] PDF generation failed:", err);
                    });
                }}
                userPlan={plan}
                interviewBriefing={scenarioType === "interview" ? interviewBriefing : null}
                interlocutor={interlocutor}
                scenario={scenario}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Paywall Modal (shared across all triggers) ── */}
      <CreditUpsellModal
        open={paywallOpen}
        onClose={() => { setPaywallOpen(false); setPaywallReason(null); }}
        onPurchaseComplete={handlePurchaseComplete}
        paywallReason={paywallReason ?? undefined}
        creditsRemaining={usageGating.credits}
      />
    </div>
  );
}