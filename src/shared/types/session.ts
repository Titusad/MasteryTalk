/**
 * shared/types/session — Cross-cutting session types
 *
 * Sprint 1 FSD: Step is a simple string-union used across all layers.
 * Defined here so shared components can consume it without importing
 * from upper layers (entities, features, etc.).
 */

export type Step =
  | "intro"
  | "experience"
  | "context"
  | "strategy"
  | "generating"
  | "practice-prep"
  | "practice"
  | "analyzing"
  | "feedback"
  | "upsell";
