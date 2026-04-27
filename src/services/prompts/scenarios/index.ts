export { SCENARIO_ADAPTATION_INTERVIEW } from "./interview";
export { SCENARIO_ADAPTATION_SALES } from "./sales";
export { SCENARIO_ADAPTATION_MEETING } from "./meeting";
export { SCENARIO_ADAPTATION_PRESENTATION } from "./presentation";

import { SCENARIO_ADAPTATION_INTERVIEW } from "./interview";
import { SCENARIO_ADAPTATION_SALES } from "./sales";
import { SCENARIO_ADAPTATION_MEETING } from "./meeting";
import { SCENARIO_ADAPTATION_PRESENTATION } from "./presentation";

export const SCENARIO_ADAPTATION: Record<string, string> = {
  interview: SCENARIO_ADAPTATION_INTERVIEW,
  sales: SCENARIO_ADAPTATION_SALES,
  meeting: SCENARIO_ADAPTATION_MEETING,
  presentation: SCENARIO_ADAPTATION_PRESENTATION,
};
