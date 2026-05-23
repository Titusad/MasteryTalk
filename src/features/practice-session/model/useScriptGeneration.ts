/**
 * useScriptGeneration — manages pre-session script / briefing generation
 *
 * Extracts from PracticeSessionPage:
 *  - generatedScript, scriptGenStatus, scriptGenError, animationDone
 *  - interviewBriefing, preparationToolkit, personalizedPattern, patternLoading
 *  - cvMatchData, cvMatchStatus
 *  - fireScriptGeneration callback
 *  - eager generation effect (fires at intro step)
 *  - auto-transition effect (generating → practice-prep)
 */

import { useState, useRef, useCallback, useEffect } from "react";
import type { ScenarioType, ScriptSection, OnboardingProfile } from "@/services/types";
import type { InterviewBriefingData } from "@/services/types";
import type { PathId } from "@/entities/progression";
import type { Step } from "@/entities/session";
import type { PersonalizedPatterns } from "./session-api";
import type { CVMatchResult } from "@/services/cvMatchService";
import {
  generateInterviewBriefing,
  generateSelfIntroBriefing,
  generateScript,
  generatePreparationToolkit,
  personalizePatterns,
} from "./session-api";
import { getLevelDefinition } from "@/entities/progression";
import {
  scriptCache,
  toolkitCache,
  cvMatchCacheV2,
  interviewBriefingCache,
  simpleHash,
} from "@/shared/lib/sessionCache";
import { detectLanguageBackground } from "@/services/locale-detect";
import { analyzeCvMatch } from "@/services/cvMatchService";

const _detectedLocale = detectLanguageBackground();

export type PreparationToolkit = {
  powerPhrases: Array<{ id: string; phrase: string; context: string; category: string }>;
  powerQuestions: Array<{ question: string; rationale: string; timing: string }>;
  culturalTips: Array<{ title: string; description: string; type: "do" | "avoid" }>;
};

interface UseScriptGenerationParams {
  effectiveScenario: string;
  effectiveInterlocutor: string;
  scenarioType?: ScenarioType;
  guidedFields?: Record<string, string>;
  extraContext: Record<string, string>;
  sKey: string;
  progressionPathId?: PathId;
  progressionLevelId?: string;
  startAtContext?: boolean;
  userProfile?: OnboardingProfile | null;
  step: Step;
  setStep: (step: Step) => void;
  setExtraContext: (fields: Record<string, string>) => void;
  challengeModeRef: React.MutableRefObject<boolean>;
}

export function useScriptGeneration({
  effectiveScenario,
  effectiveInterlocutor,
  scenarioType,
  guidedFields,
  extraContext,
  sKey,
  progressionPathId,
  progressionLevelId,
  startAtContext,
  userProfile,
  step,
  setStep,
  setExtraContext,
  challengeModeRef,
}: UseScriptGenerationParams) {
  const [generatedScript, setGeneratedScript] = useState<ScriptSection[] | null>(
    () => scriptCache.get(sKey)
  );
  const [scriptGenStatus, setScriptGenStatus] = useState<"idle" | "loading" | "ready" | "error">(() =>
    (scenarioType === "interview" ? interviewBriefingCache.get(sKey) : scriptCache.get(sKey)) ? "ready" : "idle"
  );
  const [scriptGenError, setScriptGenError] = useState<string | null>(null);
  const [animationDone, setAnimationDone] = useState(false);

  const [interviewBriefing, setInterviewBriefing] = useState<InterviewBriefingData | null>(
    () => scenarioType === "interview" ? interviewBriefingCache.get(sKey) : null
  );
  const [preparationToolkit, setPreparationToolkit] = useState<PreparationToolkit | null>(
    () => toolkitCache.get(sKey)
  );
  const [personalizedPattern, setPersonalizedPattern] = useState<PersonalizedPatterns | null>(null);
  const [patternLoading, setPatternLoading] = useState(false);

  const [cvMatchData, setCvMatchData] = useState<CVMatchResult | null>(
    () => cvMatchCacheV2.get(sKey)
  );
  const [cvMatchStatus, setCvMatchStatus] = useState<"idle" | "loading" | "success" | "error">(
    cvMatchCacheV2.get(sKey) ? "success" : "idle"
  );

  const briefingAbortRef = useRef<AbortController | null>(null);

  const fireScriptGeneration = useCallback(async (extraData?: Record<string, string>) => {
    briefingAbortRef.current?.abort("superseded");
    setScriptGenStatus("loading");
    setScriptGenError(null);
    setGeneratedScript(null);
    setInterviewBriefing(null);
    setAnimationDone(false);
    setPreparationToolkit(null);

    // Fire personalized pattern generation in parallel (non-blocking)
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

    // ━━━ SELF-INTRO: dedicated 3-beat briefing ━━━
    if (scenarioType === "self-intro") {
      try {
        const briefing = await generateSelfIntroBriefing(
          allFields,
          progressionLevelId ?? undefined,
          abortController.signal,
        );
        setInterviewBriefing(briefing);
        interviewBriefingCache.set(sKey, briefing);
        setScriptGenStatus("ready");
      } catch (err: any) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        const msg = err instanceof Error ? err.message : String(err);
        console.error("[SelfIntroBriefing] ❌ Failed:", msg);
        setScriptGenError(msg);
        setScriptGenStatus("error");
      }
      return;
    }

    // ━━━ INTERVIEW: card-based briefing ━━━
    if (scenarioType === "interview") {
      try {
        const { briefing } = await generateInterviewBriefing(
          effectiveScenario,
          effectiveInterlocutor,
          allFields,
          _detectedLocale,
          abortController.signal,
          progressionPathId ?? undefined,
          progressionLevelId ?? undefined,
        );
        setInterviewBriefing(briefing);
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

    // ━━━ SALES / DEFAULT: script + toolkit in parallel ━━━
    generateScript(
      effectiveScenario, effectiveInterlocutor, scenarioType,
      allFields, _detectedLocale, abortController.signal,
      progressionPathId ?? undefined, progressionLevelId ?? undefined,
    )
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

    generatePreparationToolkit(effectiveScenario, effectiveInterlocutor, scenarioType, allFields, _detectedLocale)
      .then((toolkit) => {
        setPreparationToolkit(toolkit);
        toolkitCache.set(sKey, toolkit);
      })
      .catch((err) => {
        console.error("[PreparationToolkit] ❌ Failed:", err.message);
      });
  }, [effectiveScenario, effectiveInterlocutor, scenarioType, guidedFields, extraContext, sKey, progressionPathId, progressionLevelId]);

  // Eager script generation: fire at intro step start for path sessions (not War Room)
  useEffect(() => {
    if (step !== "intro") return;
    if (startAtContext) return;
    if (!progressionPathId || !progressionLevelId) return;
    if (scriptGenStatus !== "idle") return;

    const profileFields: Record<string, string> = {};
    if (userProfile?.cvSummary) profileFields.cvSummary = userProfile.cvSummary;
    if (userProfile?.position) profileFields.manualExperience = `${userProfile.position} in ${userProfile.industry || "tech"}, ${userProfile.seniority || "mid-level"}.`.trim();
    if (userProfile?.keyExperience) profileFields["Your key experience"] = userProfile.keyExperience;
    setExtraContext(profileFields);
    fireScriptGeneration(profileFields);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  // Auto-transition: generating → practice-prep (when both animation and API done)
  useEffect(() => {
    const contentReady = generatedScript || interviewBriefing;
    if (step === "generating" && scriptGenStatus === "ready" && contentReady) {
      if (challengeModeRef.current) {
        setStep(scenarioType === "interview" ? "interlocutor-intro" : "practice");
      } else {
        setStep("practice-prep");
      }
    }
  }, [step, scriptGenStatus, generatedScript, interviewBriefing, scenarioType, setStep, challengeModeRef]);

  return {
    generatedScript,
    scriptGenStatus,
    scriptGenError,
    animationDone,
    interviewBriefing,
    preparationToolkit,
    personalizedPattern,
    patternLoading,
    cvMatchData,
    cvMatchStatus,
    fireScriptGeneration,
    setScriptGenStatus,
    setInterviewBriefing,
    setGeneratedScript,
    setPreparationToolkit,
    setCvMatchData,
    setCvMatchStatus,
  };
}
