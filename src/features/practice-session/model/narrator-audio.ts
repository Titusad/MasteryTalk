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

const R2 = "https://pub-8e06617bc009468c9a26c5ddccc28a74.r2.dev/narration";

export const NARRATOR_URLS = {
  context: {
    interview:    R2 ? `${R2}/context-interview.mp3`    : "",
    sales:        R2 ? `${R2}/context-sales.mp3`        : "",
    meeting:      R2 ? `${R2}/context-meeting.mp3`      : "",
    presentation: R2 ? `${R2}/context-presentation.mp3` : "",
  },
  generating: R2 ? `${R2}/generating.mp3`  : "",
  analyzing:  R2 ? `${R2}/analyzing.mp3`   : "",
  interlocutor: {
    recruiter:          R2 ? `${R2}/interlocutor-recruiter.mp3`          : "",
    hiring_manager:     R2 ? `${R2}/interlocutor-hiring-manager.mp3`     : "",
    sme:                R2 ? `${R2}/interlocutor-sme.mp3`                : "",
    hr:                 R2 ? `${R2}/interlocutor-hr.mp3`                 : "",
    gatekeeper:         R2 ? `${R2}/interlocutor-gatekeeper.mp3`         : "",
    technical_buyer:    R2 ? `${R2}/interlocutor-technical-buyer.mp3`    : "",
    champion:           R2 ? `${R2}/interlocutor-champion.mp3`           : "",
    decision_maker:     R2 ? `${R2}/interlocutor-decision-maker.mp3`     : "",
    meeting_facilitator:R2 ? `${R2}/interlocutor-meeting-facilitator.mp3`: "",
    senior_stakeholder: R2 ? `${R2}/interlocutor-senior-stakeholder.mp3` : "",
  },
} as const;

export type InterlocutorKey = keyof typeof NARRATOR_URLS.interlocutor;
