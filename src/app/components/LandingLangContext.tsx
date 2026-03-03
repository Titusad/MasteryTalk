import { createContext, useContext } from "react";
import type { LandingCopy, LandingLang } from "./landing-i18n";
import { ES } from "./landing-i18n";

interface LandingLangContextValue {
  lang: LandingLang;
  copy: LandingCopy;
}

const LandingLangCtx = createContext<LandingLangContextValue>({ lang: "es", copy: ES });

export const LandingLangProvider = LandingLangCtx.Provider;
export const useLandingCopy = () => useContext(LandingLangCtx);
