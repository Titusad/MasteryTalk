/**
 * useStepGates — vocabulary and grammar step routing logic
 *
 * Extracts from PracticeSessionPage:
 *  - gateWithVocabulary: show vocabulary step if bank exists, else skip to nextStep
 *  - gateWithGrammar: show grammar step if bank exists, then gate through vocabulary
 *  - nextStepAfterVocabularyRef, nextStepAfterGrammarRef
 */

import { useRef, useCallback } from "react";
import type { PathId } from "@/entities/progression";
import type { Step } from "@/entities/session";
import { getLevelDefinition } from "@/entities/progression";
import { INTERVIEW_GRAMMAR_BANK } from "@/services/prompts/grammar/interview";

interface UseStepGatesParams {
  progressionPathId?: PathId;
  progressionLevelId?: string;
  startAtContext?: boolean;
  challengeModeRef: React.MutableRefObject<boolean>;
  setStep: (step: Step) => void;
}

export function useStepGates({
  progressionPathId,
  progressionLevelId,
  startAtContext,
  challengeModeRef,
  setStep,
}: UseStepGatesParams) {
  const nextStepAfterVocabularyRef = useRef<"generating" | "practice-prep">("generating");
  const nextStepAfterGrammarRef = useRef<Step>("vocabulary");

  const gateWithVocabulary = useCallback((nextStep: "generating" | "practice-prep") => {
    const levelDef = progressionPathId && progressionLevelId
      ? getLevelDefinition(progressionPathId, progressionLevelId)
      : null;
    const hasVocab = !!(levelDef?.vocabularyBank?.length);
    const showVocab = hasVocab && !challengeModeRef.current && !startAtContext;
    if (showVocab) {
      nextStepAfterVocabularyRef.current = nextStep;
      setStep("vocabulary");
    } else {
      setStep(nextStep);
    }
  }, [progressionPathId, progressionLevelId, startAtContext, challengeModeRef, setStep]);

  const gateWithGrammar = useCallback((finalStep: "generating" | "practice-prep") => {
    if (startAtContext || !progressionLevelId) {
      gateWithVocabulary(finalStep);
      return;
    }
    const bank = INTERVIEW_GRAMMAR_BANK[progressionLevelId];
    if (!bank?.length) {
      gateWithVocabulary(finalStep);
      return;
    }
    nextStepAfterGrammarRef.current = finalStep as Step;
    setStep("grammar");
  }, [startAtContext, progressionLevelId, gateWithVocabulary, setStep]);

  return {
    gateWithVocabulary,
    gateWithGrammar,
    nextStepAfterVocabularyRef,
    nextStepAfterGrammarRef,
  };
}
