/**
 * Shared Step type used by PracticeSessionPage and SessionProgressBar.
 * Single source of truth for the MVP session flow.
 */
export type Step =
  | "extra-context"
  | "generating-script"
  | "pre-briefing"
  | "practice"
  | "analyzing"
  | "conversation-feedback"
  | "session-recap";