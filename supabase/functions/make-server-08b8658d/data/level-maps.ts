/**
 * Centralized level maps — SINGLE SOURCE OF TRUTH.
 * Adding a new learning path = edit THIS file only.
 */

export const LEVEL_TITLES: Record<string, string> = {
  // Interview Mastery
  "int-1": "Phone Screen", "int-2": "Behavioral Round",
  "int-3": "Storytelling & STAR Deep Dive", "int-4": "Technical Discussion",
  "int-5": "Salary Negotiation", "int-6": "Executive Presence Close",
  // Sales Champion
  "sal-1": "Discovery Call", "sal-2": "Product Demo",
  "sal-3": "Stakeholder Alignment", "sal-4": "Objection Handling",
  "sal-5": "Close the Deal", "sal-6": "Executive Presence & Account Expansion",
  // Remote Meeting Presence
  "meet-1": "Standup & Daily Sync", "meet-2": "Taking the Floor",
  "meet-3": "Disagreeing Professionally", "meet-4": "Leading a Meeting",
  "meet-5": "Presenting in a Call", "meet-6": "Following Up & Closing the Loop",
  // Presentations
  "pres-1": "Opening with Impact", "pres-2": "Structuring Your Narrative",
  "pres-3": "Data Storytelling", "pres-4": "Handling Q&A",
  "pres-5": "Virtual Presentation Presence", "pres-6": "The Executive Pitch",
  // Client-Facing Communication
  "cli-1": "First Client Call", "cli-2": "Setting Expectations",
  "cli-3": "Delivering Bad News", "cli-4": "Defending Your Work",
  "cli-5": "Managing a Difficult Client", "cli-6": "Growing the Relationship",
  // C-Suite Communication
  "cs-1": "Speaking Up in the Room", "cs-2": "Presenting to Leadership",
  "cs-3": "Asking for Resources", "cs-4": "Navigating Political Conversations",
  "cs-5": "Delivering Uncomfortable Truths", "cs-6": "Influencing Without Authority",
};

export const NEXT_LEVEL: Record<string, string> = {
  "int-1": "int-2", "int-2": "int-3", "int-3": "int-4",
  "int-4": "int-5", "int-5": "int-6",
  "sal-1": "sal-2", "sal-2": "sal-3", "sal-3": "sal-4",
  "sal-4": "sal-5", "sal-5": "sal-6",
  "meet-1": "meet-2", "meet-2": "meet-3", "meet-3": "meet-4",
  "meet-4": "meet-5", "meet-5": "meet-6",
  "pres-1": "pres-2", "pres-2": "pres-3", "pres-3": "pres-4",
  "pres-4": "pres-5", "pres-5": "pres-6",
  "cli-1": "cli-2", "cli-2": "cli-3", "cli-3": "cli-4",
  "cli-4": "cli-5", "cli-5": "cli-6",
  "cs-1": "cs-2", "cs-2": "cs-3", "cs-3": "cs-4",
  "cs-4": "cs-5", "cs-5": "cs-6",
};

export const LEVEL_ORDER = [
  "int-1", "int-2", "int-3", "int-4", "int-5", "int-6",
  "sal-1", "sal-2", "sal-3", "sal-4", "sal-5", "sal-6",
  "meet-1", "meet-2", "meet-3", "meet-4", "meet-5", "meet-6",
  "pres-1", "pres-2", "pres-3", "pres-4", "pres-5", "pres-6",
  "cli-1", "cli-2", "cli-3", "cli-4", "cli-5", "cli-6",
  "cs-1", "cs-2", "cs-3", "cs-4", "cs-5", "cs-6",
];

function makePath(prefix: string, count: number) {
  const state: Record<string, { status: string }> = {};
  for (let i = 1; i <= count; i++) {
    state[`${prefix}-${i}`] = { status: i === 1 ? "unlocked" : "locked" };
  }
  return state;
}

export function getDefaultProgressionState() {
  return {
    activeGoal: "interview",
    interview: makePath("int", 6),
    sales: makePath("sal", 6),
    meeting: makePath("meet", 6),
    presentation: makePath("pres", 6),
    client: makePath("cli", 6),
    csuite: makePath("cs", 6),
  };
}

export function getDomainLabel(pathId: string): string {
  switch (pathId) {
    case "interview": return "job interview";
    case "sales": return "B2B sales";
    case "meeting": return "remote meeting";
    case "presentation": return "professional presentation";
    case "client": return "client-facing communication";
    case "csuite": return "C-suite communication";
    default: return pathId;
  }
}
