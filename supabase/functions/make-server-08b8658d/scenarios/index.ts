export {
  INTERVIEW_DUAL_AXIS_BLOCK,
  INTERVIEW_OUTPUT_FIELDS,
  buildInterviewBriefingBlock,
  getInterviewGapAnalysis,
  type InterviewBriefingData,
} from "./interview.ts";

export {
  SALES_DUAL_AXIS_BLOCK,
  SALES_OUTPUT_FIELDS,
  getSalesGapAnalysis,
} from "./sales.ts";

export {
  MEETING_DUAL_AXIS_BLOCK,
  MEETING_OUTPUT_FIELDS,
  getMeetingGapAnalysis,
} from "./meeting.ts";

export {
  PRESENTATION_DUAL_AXIS_BLOCK,
  PRESENTATION_OUTPUT_FIELDS,
  getPresentationGapAnalysis,
} from "./presentation.ts";

export {
  CULTURE_DUAL_AXIS_BLOCK,
  CULTURE_OUTPUT_FIELDS,
  getCultureGapAnalysis,
} from "./culture.ts";

export {
  SELF_INTRO_DUAL_AXIS_BLOCK,
  SELF_INTRO_OUTPUT_FIELDS,
  getSelfIntroGapAnalysis,
} from "./self-intro.ts";

import { getInterviewGapAnalysis } from "./interview.ts";
import { getSalesGapAnalysis } from "./sales.ts";
import { getMeetingGapAnalysis } from "./meeting.ts";
import { getPresentationGapAnalysis } from "./presentation.ts";
import { getCultureGapAnalysis } from "./culture.ts";
import { getSelfIntroGapAnalysis } from "./self-intro.ts";

export function getScenarioGapAnalysis(
  scenarioType: string,
  filledKeys: string[]
): string[] {
  switch (scenarioType) {
    case "interview":    return getInterviewGapAnalysis(filledKeys);
    case "meeting":      return getMeetingGapAnalysis(filledKeys);
    case "presentation": return getPresentationGapAnalysis(filledKeys);
    case "culture":      return getCultureGapAnalysis(filledKeys);
    case "self-intro":   return getSelfIntroGapAnalysis(filledKeys);
    default:             return getSalesGapAnalysis(filledKeys);
  }
}
