/**
 * shared/types/session — Cross-cutting session types
 *
 * Sprint 1 FSD: Step is a simple string-union used across all layers.
 * Defined here so shared components can consume it without importing
 * from upper layers (entities, features, etc.).
 */

export type Step =
  | "key-experience"
  | "cv-upload"
  | "extra-context"
  | "pre-brief"
  | "generating-script"
  | "pre-briefing"
  | "practice"
  | "analyzing"
  | "interview-analysis"
  | "path-conversion"
  | "conversation-feedback"
  | "skill-drill"
  | "cp-unlock"
  | "remedial"
  | "session-recap";
