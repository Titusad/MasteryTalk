/**
 * ══════════════════════════════════════════════════════════════
 *  inFluentia PRO — Voice Mapping (ElevenLabs)
 *
 *  Maps interlocutor → ElevenLabs voice ID for TTS consistency.
 *  10 interlocutors: 4 interview + 4 sales + 2 meeting.
 *
 *  Voice design principle: Each persona gets a voice that
 *  reinforces their psychological profile. Interview personas
 *  share some voice archetypes with sales personas where the
 *  personality overlaps (e.g., analytical evaluators).
 *
 *  Reference: /docs/SYSTEM_PROMPTS.md §10
 *
 *  v3.0: Expanded from 4 to 8 interlocutor voice profiles
 * ══════════════════════════════════════════════════════════════
 */

import type { InterlocutorType } from "./personas";

/**
 * Voice profile metadata (for documentation/UI purposes).
 */
export interface VoiceProfile {
  voiceId: string;
  label: string;
  description: string;
}

/**
 * Default voice IDs — resolved from environment variables in production.
 *
 * In production (Supabase Edge Functions), these are read from Deno.env:
 *   Interview:
 *   - ELEVENLABS_VOICE_RECRUITER
 *   - ELEVENLABS_VOICE_SME
 *   - ELEVENLABS_VOICE_HIRING_MANAGER
 *   - ELEVENLABS_VOICE_HR
 *   Sales:
 *   - ELEVENLABS_VOICE_GATEKEEPER
 *   - ELEVENLABS_VOICE_TECHNICAL_BUYER
 *   - ELEVENLABS_VOICE_CHAMPION
 *   - ELEVENLABS_VOICE_DECISION_MAKER
 *
 * In Vite dev/build, prefix with VITE_ (e.g., VITE_ELEVENLABS_VOICE_RECRUITER).
 *
 * Replace the fallback IDs with real ElevenLabs voice IDs from your account.
 */
const FALLBACK_VOICE_ID = "21m00Tcm4TlvDq8ikWAM"; // ElevenLabs "Rachel" — public default

function resolveVoiceId(envKey: string): string {
  try {
    const val = (import.meta.env as Record<string, string | undefined>)[envKey];
    return val || FALLBACK_VOICE_ID;
  } catch {
    return FALLBACK_VOICE_ID;
  }
}

const VOICE_PROFILES: Record<InterlocutorType, VoiceProfile> = {
  /* ── Interview Voices ── */
  recruiter: {
    voiceId: resolveVoiceId("VITE_ELEVENLABS_VOICE_RECRUITER"),
    label: "Cordial, rhythmic (gender-flexible)",
    description: "Corporate recruiter: efficient, warm but structured pace",
  },
  sme: {
    voiceId: resolveVoiceId("VITE_ELEVENLABS_VOICE_SME"),
    label: "Analytical, measured",
    description: "Technical evaluator: precise, inquisitive, peer-level",
  },
  hiring_manager: {
    voiceId: resolveVoiceId("VITE_ELEVENLABS_VOICE_HIRING_MANAGER"),
    label: "Direct, pragmatic",
    description: "Hiring manager: authoritative, outcome-oriented, American directness",
  },
  hr: {
    voiceId: resolveVoiceId("VITE_ELEVENLABS_VOICE_HR"),
    label: "Warm, empathetic",
    description: "People & Culture: reflective, open, emotionally intelligent",
  },

  /* ── Sales Voices ── */
  gatekeeper: {
    voiceId: resolveVoiceId("VITE_ELEVENLABS_VOICE_GATEKEEPER"),
    label: "Curt, professional",
    description: "SDR/Gatekeeper: skeptical, busy, time-constrained filter",
  },
  technical_buyer: {
    voiceId: resolveVoiceId("VITE_ELEVENLABS_VOICE_TECHNICAL_BUYER"),
    label: "Analytical, probing",
    description: "Technical buyer: detail-oriented, proof-seeking, no marketing tolerance",
  },
  champion: {
    voiceId: resolveVoiceId("VITE_ELEVENLABS_VOICE_CHAMPION"),
    label: "Collaborative, energetic",
    description: "Internal champion: ally-minded, results-driven, needs ammunition",
  },
  decision_maker: {
    voiceId: resolveVoiceId("VITE_ELEVENLABS_VOICE_DECISION_MAKER"),
    label: "Authoritative, strategic",
    description: "C-Level: ROI-obsessed, time-scarce, executive gravitas",
  },

  /* ── Meeting Voices ── */
  meeting_facilitator: {
    voiceId: resolveVoiceId("VITE_ELEVENLABS_VOICE_MEETING_FACILITATOR"),
    label: "Friendly, structured",
    description: "Scrum master / meeting host: efficient, keeps things on track",
  },
  senior_stakeholder: {
    voiceId: resolveVoiceId("VITE_ELEVENLABS_VOICE_SENIOR_STAKEHOLDER"),
    label: "Authoritative, commanding",
    description: "VP/Director: confident, tangent-prone, expects you to manage up",
  },
};

/**
 * Get the voice ID for an interlocutor.
 * In mock mode, returns a placeholder.
 * In production, the Edge Function reads from Deno.env.
 */
export function getVoiceId(interlocutor: InterlocutorType): string {
  return VOICE_PROFILES[interlocutor]?.voiceId ?? FALLBACK_VOICE_ID;
}

/**
 * Get the full voice profile (for UI display or debugging).
 */
export function getVoiceProfile(interlocutor: InterlocutorType): VoiceProfile {
  return VOICE_PROFILES[interlocutor] ?? VOICE_PROFILES.recruiter;
}

/**
 * ElevenLabs TTS settings (consistent across all voices).
 *
 * - stability: 0.5 — Natural variation (not robotic)
 * - similarity_boost: 0.75 — High consistency with original voice
 * - style: 0.0 — No exaggeration
 * - use_speaker_boost: true — Clarity (important for learners)
 */
export const ELEVENLABS_VOICE_SETTINGS = {
  stability: 0.5,
  similarity_boost: 0.75,
  style: 0.0,
  use_speaker_boost: true,
} as const;
