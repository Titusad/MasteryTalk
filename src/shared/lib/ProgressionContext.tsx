/**
 * shared/lib/ProgressionContext — Session-level context for progression level info.
 *
 * Sprint 1 FSD: Moved from app/components/shared/ to shared/lib/.
 * This is a pure React context with zero domain dependencies —
 * it only passes a string (level title) to avoid prop-drilling.
 */

import { createContext, useContext } from "react";

interface ProgressionContextValue {
  levelTitle: string | null;
}

const ProgressionContext = createContext<ProgressionContextValue>({ levelTitle: null });

export const ProgressionProvider = ProgressionContext.Provider;

export function useProgressionLevel(): string | null {
  return useContext(ProgressionContext).levelTitle;
}
