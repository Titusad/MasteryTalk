/**
 * ══════════════════════════════════════════════════════════════
 *  inFluentia PRO — Voice Mapping (ElevenLabs)
 *
 *  Maps interlocutor → ElevenLabs voice ID for TTS consistency.
 *  Reference: /docs/SYSTEM_PROMPTS.md §10
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
 *   - ELEVENLABS_VOICE_CLIENT
 *   - ELEVENLABS_VOICE_MANAGER
 *   - ELEVENLABS_VOICE_RECRUITER
 *   - ELEVENLABS_VOICE_PEER
 *
 * In Vite dev/build, they can be set via:
 *   - VITE_ELEVENLABS_VOICE_CLIENT
 *   - VITE_ELEVENLABS_VOICE_MANAGER
 *   - VITE_ELEVENLABS_VOICE_RECRUITER
 *   - VITE_ELEVENLABS_VOICE_PEER
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
  client: {
    voiceId: resolveVoiceId("VITE_ELEVENLABS_VOICE_CLIENT"),
    label: "Masculine, authoritative",
    description: "CEO/VP buying: confidence, gravitas",
  },
  manager: {
    voiceId: resolveVoiceId("VITE_ELEVENLABS_VOICE_MANAGER"),
    label: "Feminine, direct",
    description: "Your boss: direct, executive, no-nonsense",
  },
  recruiter: {
    voiceId: resolveVoiceId("VITE_ELEVENLABS_VOICE_RECRUITER"),
    label: "Analytical, probing (gender-flexible)",
    description: "Evaluative but approachable: analytical precision",
  },
  peer: {
    voiceId: resolveVoiceId("VITE_ELEVENLABS_VOICE_PEER"),
    label: "Casual, confident",
    description: "Networking peer: relaxed but sharp, evaluating your pitch",
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
  return VOICE_PROFILES[interlocutor] ?? VOICE_PROFILES.client;
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