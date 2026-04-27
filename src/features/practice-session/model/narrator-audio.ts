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
    interview:    `${STORAGE}/context-interview.mp3`,
    sales:        `${STORAGE}/context-sales.mp3`,
    meeting:      `${STORAGE}/context-meeting.mp3`,
    presentation: `${STORAGE}/context-presentation.mp3`,
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
