import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import type { StructuredLesson, LessonStep } from "../../../../../services/types";
import { fetchLessonContent } from "../../model/progression.api";

import { ConceptStep } from "./steps/ConceptStep";
import { ScenarioStep } from "./steps/ScenarioStep";
import { ComparisonStep } from "./steps/ComparisonStep";
import { ToolkitStep } from "./steps/ToolkitStep";
import { VoiceExerciseStep } from "./steps/VoiceExerciseStep";

interface LessonStepperProps {
  pathId: string;
  levelId: string;
  onComplete: () => void;
}

const STEP_LABELS = ["Concept", "Scenario", "Comparison", "Toolkit", "Exercise"];

export function LessonStepper({ pathId, levelId, onComplete }: LessonStepperProps) {
  const [lesson, setLesson] = useState<StructuredLesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setCurrentStep(0);

    fetchLessonContent(pathId, levelId)
      .then((data) => {
        if (!cancelled) setLesson(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Failed to load lesson");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [pathId, levelId]);

  const goNext = useCallback(() => {
    if (!lesson) return;
    if (currentStep < lesson.steps.length - 1) {
      setDirection(1);
      setCurrentStep((s) => s + 1);
    }
  }, [currentStep, lesson]);

  const goBack = useCallback(() => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep((s) => s - 1);
    }
  }, [currentStep]);

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 14 }}>
        <Loader2 size={28} color="#6366f1" style={{ animation: "spin 1s linear infinite" }} />
        <p style={{ margin: 0, fontSize: 14, color: "#62748e" }}>Preparing your personalized lesson...</p>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div style={{ padding: "40px 24px", textAlign: "center" }}>
        <p style={{ fontSize: 14, color: "#ef4444", marginBottom: 8 }}>
          {error || "Lesson content not available yet."}
        </p>
        <p style={{ fontSize: 12, color: "#94a3b8" }}>
          Complete a practice session to generate your study lesson.
        </p>
      </div>
    );
  }

  const totalSteps = lesson.steps.length;
  const step = lesson.steps[currentStep];
  const isLast = currentStep === totalSteps - 1;
  const isFirst = currentStep === 0;
  const stepLabels = STEP_LABELS.slice(0, totalSteps);

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>

      {/* Lesson title + pillar context */}
      <div style={{ padding: "48px 48px 0", flexShrink: 0, textAlign: "center" }}>
        <h2 style={{ margin: "0 0 6px", fontSize: 28, fontWeight: 500, color: "#0f172b", lineHeight: 1.3 }}>
          {lesson.lessonTitle}
        </h2>
        <p style={{ margin: "0 0 4px", fontSize: 15, color: "#64748b" }}>
          Preparing you for: <strong style={{ color: "#0f172b", fontWeight: 600 }}>{lesson.nextLevelPrep}</strong>
        </p>


        {/* Elegant dot stepper — full width */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", marginTop: 24, marginBottom: 4 }}>
          {stepLabels.map((label, i) => {
            const isCompleted = i < currentStep;
            const isCurrent = i === currentStep;

            return (
              <div key={i} style={{ display: "flex", alignItems: "center" }}>
                {/* Connector line before each dot (not before the first) */}
                {i > 0 && (
                  <div style={{
                    flex: 1, height: 2,
                    background: i <= currentStep ? "#0f172b" : "#e2e8f0",
                    transition: "background 0.3s",
                    minWidth: 16,
                  }} />
                )}

                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flexShrink: 0 }}>
                  {/* Dot */}
                  <div style={{
                    width: isCurrent ? 10 : 8,
                    height: isCurrent ? 10 : 8,
                    borderRadius: "50%",
                    background: isCompleted ? "#0f172b" : isCurrent ? "#0f172b" : "#e2e8f0",
                    border: isCurrent ? "2px solid #0f172b" : "none",
                    boxShadow: isCurrent ? "0 0 0 3px rgba(15,23,43,0.12)" : "none",
                    transition: "all 0.3s",
                  }} />
                  {/* Label below dot */}
                  <span style={{
                    fontSize: 10,
                    fontWeight: isCurrent ? 700 : 500,
                    color: isCurrent ? "#0f172b" : isCompleted ? "#0f172b" : "#94a3b8",
                    whiteSpace: "nowrap",
                    transition: "color 0.3s",
                  }}>
                    {label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step content — scrollable */}
      <div style={{ flex: 1, overflow: "auto", padding: "20px 24px 32px" }}>
        {/* Content constrained width for readability */}
        <div style={{ maxWidth: 820, margin: "0 auto" }}>
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              initial={{ opacity: 0, x: direction >= 0 ? 50 : -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction >= 0 ? -50 : 50 }}
              transition={{ duration: 0.22, ease: "easeInOut" }}
            >
              {renderStep(step, onComplete, (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "16px 24px",
                    borderTop: "1px solid #f1f5f9",
                    background: "#ffffff",
                    marginTop: "auto"
                  }}
                >
                  {isFirst ? (
                    <div />
                  ) : (
                    <button
                      onClick={goBack}
                      style={{
                        display: "flex", alignItems: "center", gap: 6,
                        padding: 0, background: "none", border: "none",
                        cursor: "pointer", color: "#45556c",
                        fontSize: 14, fontWeight: 500,
                        transition: "color 0.15s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "#0f172b")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "#45556c")}
                    >
                      <ChevronLeft size={16} /> Previous
                    </button>
                  )}

                  {/* Step counter centered */}
                  <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500 }}>
                    {currentStep + 1} / {totalSteps}
                  </span>

                  {!isLast && (
                    <button
                      onClick={goNext}
                      style={{
                        display: "flex", alignItems: "center", gap: 6,
                        padding: 0, background: "none", border: "none",
                        cursor: "pointer", color: "#0f172b",
                        fontSize: 14, fontWeight: 500,
                        transition: "color 0.15s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "#000000")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "#0f172b")}
                    >
                      Next <ChevronRight size={16} />
                    </button>
                  )}
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function renderStep(step: LessonStep, onComplete: () => void, footer: React.ReactNode) {
  switch (step.id) {
    case "concept":
      return <ConceptStep data={step} footer={footer} />;
    case "scenario":
      return <ScenarioStep data={step} footer={footer} />;
    case "comparison":
      return <ComparisonStep data={step} footer={footer} />;
    case "toolkit":
      return <ToolkitStep data={step} footer={footer} />;
    case "exercise":
      return <VoiceExerciseStep data={step} onComplete={onComplete} footer={footer} />;
    default:
      return <p>Unknown step</p>;
  }
}
