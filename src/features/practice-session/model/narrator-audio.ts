/**
 * Narrator audio URLs — static files hosted on Cloudflare R2.
 * Empty strings = no audio yet. Swap with actual R2 URLs when ready.
 *
 * Scripts per screen:
 *
 * context.interview:
 *   "You have an interview coming up. Let's make sure you walk in ready —
 *    not just prepared, but confident."
 *
 * context.meeting:
 *   "Remote meetings are where careers are made or forgotten.
 *    Let's practice owning the room."
 *
 * context.presentation:
 *   "You're about to present to people who decide things.
 *    Let's make sure your message lands."
 *
 * context.sales:
 *   "Every pitch is a conversation. Let's practice the one that closes."
 *
 * generating:
 *   "I'm reviewing your context and building your personal strategy.
 *    I'll have your brief ready in a few seconds."
 *
 * analyzing:
 *   "Good work. I caught everything — the moments you nailed it
 *    and the ones worth revisiting. Give me a few seconds."
 *
 * interlocutor.recruiter:
 *   "You're speaking with a recruiter who sees 20 candidates a day.
 *    You have 60 seconds to make her remember you."
 *
 * interlocutor.hiring_manager:
 *   "David is the person who would manage you day to day.
 *    He speaks in outcomes, not activities. Be specific."
 *
 * interlocutor.sme:
 *   "You're talking to the expert who will work alongside you.
 *    He'll probe until he finds the edge of your knowledge."
 *
 * interlocutor.hr:
 *   "She evaluates whether you'll thrive in the team long-term.
 *    Be real — corporate answers will work against you."
 */

const STORAGE = "https://zkuryztcwmazspscomiu.supabase.co/storage/v1/object/public/narration";

/** Text scripts matching each narration audio — shown as subtitle captions. */
export const NARRATOR_SCRIPTS = {
  context: {
    interview:    "You have an interview coming up. Let's make sure you walk in ready — not just prepared, but confident.",
    meeting:      "Remote meetings are where careers are made or forgotten. Let's practice owning the room.",
    presentation: "You're about to present to people who decide things. Let's make sure your message lands.",
    sales:        "Every pitch is a conversation. Let's practice the one that closes.",
    culture:      "U.S. professional culture has rules that aren't written down. Let's make sure you know them.",
    client:       "Client conversations define how long relationships last. Let's practice the ones that matter.",
    csuite:       "You're going into a room where every word carries weight. Let's make sure yours do.",
  },
  generating: "I'm reviewing your context and building your personal strategy. I'll have your brief ready in a few seconds.",
  analyzing:  "Good work. I caught everything — the moments you nailed it and the ones worth revisiting. Give me a few seconds.",
  interlocutor: {
    recruiter:           "You're speaking with a recruiter who sees 20 candidates a day. You have 60 seconds to make her remember you.",
    hiring_manager:      "This is the person who would manage you day to day. He speaks in outcomes, not activities. Be specific.",
    sme:                 "You're talking to the expert who will work alongside you. He'll probe until he finds the edge of your knowledge.",
    hr:                  "She evaluates whether you'll thrive in the team long-term. Be real — corporate answers will work against you.",
    gatekeeper:          "You have a skeptical prospect with a short attention span. Make your opening relevant in the first 30 seconds.",
    technical_buyer:     "The technical buyer evaluates risk, not features. Lead with reliability, security, and integration.",
    champion:            "Your champion already believes in you. Today we practice giving them the ammunition to sell internally.",
    decision_maker:      "The economic buyer moves fast and cares about one thing: ROI. Skip the product tour — get to the business case.",
    meeting_facilitator: "This meeting has a facilitator who keeps things moving. Make your contributions count — be clear and brief.",
    senior_stakeholder:  "A senior stakeholder is listening for authority and clarity. Don't hedge — state your position and back it up.",
  },
  strategy: {
    "int-1": "The Elevator Pitch. Three beats — who you are, what you do, why this role. That's it. Let me show you what it sounds like.",
    "int-2": "STAR Method. Situation, Task, Action, Result. The ratio that works: 10% setup, 60% action, 20% result.",
    "int-3": "You know STAR. Now we go deeper — adding the layer that separates a good answer from one that makes the interviewer lean in.",
    "int-4": "Technical discussions aren't about right answers — they're about how you reason. Think out loud.",
    "int-5": "Salary negotiation starts before the conversation. Know your anchor, your target, and your walk-away.",
    "int-6": "The Reverse Interview. Your questions at the end aren't small talk — they're your last and best impression.",
    "sal-1": "Problem-First Discovery. Your job in this call is to understand, not pitch. The best discovery calls are 70% listening.",
    "sal-2": "Feature, Benefit, Impact. Every demo point needs to land at a business outcome — in the client's own words.",
    "sal-3": "Your champion is selling for you when you're not in the room. Give them everything they need to win that conversation.",
    "sal-4": "Every objection is a request for more information. Respond with curiosity, not defense.",
    "sal-5": "The close is a clear, calm ask. Know what you want, say it directly, and hold the silence after.",
    "sal-6": "An executive business review is not a status update — it's a strategic conversation about what's next.",
  },
  intro: {
    "int-1": "Welcome to your Phone Screen practice. This is the first gate in any interview process. Let's open it confidently.",
    "int-2": "Behavioral interviews reveal how you actually work. Today we practice turning experience into evidence.",
    "int-3": "At this level, STAR isn't enough. Today we add the layer that makes a senior interviewer sit up.",
    "int-4": "Technical discussions test how you think, not just what you know. Today we make that thinking visible.",
    "int-5": "Salary negotiation is a skill, not a personality trait. Today we practice it with data and conviction.",
    "int-6": "The final interview is your best remaining opportunity to make a strategic impression. Let's own it.",
    "sal-1": "Discovery is the foundation of every successful sale. Today we practice the questions that make clients sell themselves.",
    "sal-2": "A great demo is a proof, not a tour. Today we connect every feature to a business outcome that matters.",
    "sal-3": "The champion is your most valuable asset in any deal. Today we practice enabling them to win internally.",
    "sal-4": "Objections are part of the process. Today we handle the toughest ones without flinching or discounting.",
    "sal-5": "The close is a moment of commitment — for both sides. Today we practice asking for it clearly.",
    "sal-6": "Executive conversations require a different register. Today we practice results and expansion at the C-level.",
  },
  feedback: {
    interview:    "That was real practice. Let me show you what worked, what to refine, and the one phrase that will make your next answer stronger.",
    sales:        "Good session. Let me break down your discovery, your positioning, and the moments where a single word change would have shifted the dynamic.",
    meeting:      "Here's what I noticed — the moments you owned the conversation and the ones where a sharper phrase would have changed the outcome.",
    presentation: "Let me show you what your audience heard — the moments that landed and the ones where delivery left impact on the table.",
  },
  prep: {
    interview:    "Let's go through the questions your interviewer will likely ask. For each one, I'll show you what to say — and what not to say.",
    sales:        "These are the key moments in your sales conversation. Let's review each section and prepare your approach.",
    meeting:      "Here are the key moments in this meeting where your communication will define the outcome. Let's prepare.",
    presentation: "Let's review the challenges your audience will throw at you — and how to respond with structure and confidence.",
  },
} as const;

export const FEEDBACK_URLS: Record<string, string> = {
  interview:    `${STORAGE}/feedback-interview.mp3`,
  sales:        `${STORAGE}/feedback-sales.mp3`,
  meeting:      `${STORAGE}/feedback-meeting.mp3`,
  presentation: `${STORAGE}/feedback-presentation.mp3`,
};

export const READINESS_URLS: Record<string, string> = {
  interview:    `${STORAGE}/readiness-interview.mp3`,
  sales:        `${STORAGE}/readiness-sales.mp3`,
  meeting:      `${STORAGE}/readiness-meeting.mp3`,
  presentation: `${STORAGE}/readiness-presentation.mp3`,
};

export const PREP_URLS: Record<string, string> = {
  interview:    `${STORAGE}/prep-interview.mp3`,
  sales:        `${STORAGE}/prep-sales.mp3`,
  meeting:      `${STORAGE}/prep-meeting.mp3`,
  presentation: `${STORAGE}/prep-presentation.mp3`,
};

export const STRATEGY_URLS: Record<string, string> = {
  "int-1": `${STORAGE}/strategy-int-1.mp3`,
  "int-2": `${STORAGE}/strategy-int-2.mp3`,
  "int-3": `${STORAGE}/strategy-int-3.mp3`,
  "int-4": `${STORAGE}/strategy-int-4.mp3`,
  "int-5": `${STORAGE}/strategy-int-5.mp3`,
  "int-6": `${STORAGE}/strategy-int-6.mp3`,
  "sal-1": `${STORAGE}/strategy-sal-1.mp3`,
  "sal-2": `${STORAGE}/strategy-sal-2.mp3`,
  "sal-3": `${STORAGE}/strategy-sal-3.mp3`,
  "sal-4": `${STORAGE}/strategy-sal-4.mp3`,
  "sal-5": `${STORAGE}/strategy-sal-5.mp3`,
  "sal-6": `${STORAGE}/strategy-sal-6.mp3`,
};

export const INTRO_URLS: Record<string, string> = {
  "int-1": `${STORAGE}/intro-int-1.mp3`,
  "int-2": `${STORAGE}/intro-int-2.mp3`,
  "int-3": `${STORAGE}/intro-int-3.mp3`,
  "int-4": `${STORAGE}/intro-int-4.mp3`,
  "int-5": `${STORAGE}/intro-int-5.mp3`,
  "int-6": `${STORAGE}/intro-int-6.mp3`,
  "sal-1": `${STORAGE}/intro-sal-1.mp3`,
  "sal-2": `${STORAGE}/intro-sal-2.mp3`,
  "sal-3": `${STORAGE}/intro-sal-3.mp3`,
  "sal-4": `${STORAGE}/intro-sal-4.mp3`,
  "sal-5": `${STORAGE}/intro-sal-5.mp3`,
  "sal-6": `${STORAGE}/intro-sal-6.mp3`,
};

export const NARRATOR_URLS = {
  context: {
    interview:    `${STORAGE}/context-screen.mp3`,
    sales:        `${STORAGE}/context-screen.mp3`,
    meeting:      `${STORAGE}/context-screen.mp3`,
    presentation: `${STORAGE}/context-screen.mp3`,
  },
  generating: `${STORAGE}/generating.mp3`,
  analyzing:  `${STORAGE}/analyzing.mp3`,
  interlocutor: {
    recruiter:           `${STORAGE}/interlocutor-recruiter.mp3`,
    hiring_manager:      `${STORAGE}/interlocutor-hiring-manager.mp3`,
    sme:                 `${STORAGE}/interlocutor-sme.mp3`,
    hr:                  `${STORAGE}/interlocutor-hr.mp3`,
    gatekeeper:          `${STORAGE}/interlocutor-gatekeeper.mp3`,
    technical_buyer:     `${STORAGE}/interlocutor-technical-buyer.mp3`,
    champion:            `${STORAGE}/interlocutor-champion.mp3`,
    decision_maker:      `${STORAGE}/interlocutor-decision-maker.mp3`,
    meeting_facilitator: `${STORAGE}/interlocutor-meeting-facilitator.mp3`,
    senior_stakeholder:  `${STORAGE}/interlocutor-senior-stakeholder.mp3`,
  },
} as const;

export type InterlocutorKey = keyof typeof NARRATOR_URLS.interlocutor;
