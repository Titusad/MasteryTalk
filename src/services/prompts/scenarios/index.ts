export { SCENARIO_ADAPTATION_INTERVIEW } from "./interview";
export { SCENARIO_ADAPTATION_SALES } from "./sales";
export { SCENARIO_ADAPTATION_MEETING } from "./meeting";
export { SCENARIO_ADAPTATION_PRESENTATION } from "./presentation";
export { SCENARIO_ADAPTATION_CULTURE } from "./culture";
export { SCENARIO_ADAPTATION_SELF_INTRO } from "./self-intro";

import { SCENARIO_ADAPTATION_INTERVIEW } from "./interview";
import { SCENARIO_ADAPTATION_SALES } from "./sales";
import { SCENARIO_ADAPTATION_MEETING } from "./meeting";
import { SCENARIO_ADAPTATION_PRESENTATION } from "./presentation";
import { SCENARIO_ADAPTATION_CULTURE } from "./culture";
import { SCENARIO_ADAPTATION_SELF_INTRO } from "./self-intro";

export const SCENARIO_ADAPTATION: Record<string, string> = {
  interview: SCENARIO_ADAPTATION_INTERVIEW,
  sales: SCENARIO_ADAPTATION_SALES,
  meeting: SCENARIO_ADAPTATION_MEETING,
  presentation: SCENARIO_ADAPTATION_PRESENTATION,
  culture: SCENARIO_ADAPTATION_CULTURE,
  "self-intro": SCENARIO_ADAPTATION_SELF_INTRO,
};
