/**
 * ProgressionContext — Session-level context for progression level info.
 * Avoids prop-drilling through 7+ sub-components.
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
