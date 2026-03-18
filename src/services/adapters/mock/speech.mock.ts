/**
 * MockSpeechService — Simulates Azure Speech REST API + ElevenLabs
 *
 * Preserves current prototype behavior:
 * - transcribe: Returns scenario-specific dummy text after delay
 * - speak: Resolves after simulated duration based on text length
 * - scorePronunciation: Returns pre-determined scores from scenario-specific shadowing phrases
 * - getShadowingPhrases: Returns hardcoded phrases with stress markers
 *
 * Error simulation (when ?simulate_errors=true):
 * - transcribe → SpeechError("STT_TIMEOUT")
 * - speak → SpeechError("TTS_NETWORK_ERROR")
 * - scorePronunciation → SpeechError("PRONUNCIATION_TIMEOUT")
 */
import type { ISpeechService } from "../../interfaces";
import type {
  TranscriptionResult,
  PronunciationResult,
  ShadowingPhrase,
  AzurePronunciationAssessment,
} from "../../types";
import { SpeechError } from "../../errors";
import { MOCK_SHADOWING_PHRASES } from "./data/shadowing-data";
import { getShadowingForScenario } from "./data/shadowing-by-scenario";
import { delay, shouldSimulateError } from "./utils";

/* ══════════════════════════════════════════════════════════════
   Module-level scenario context for mock
   ══════════════════════════════════════════════════════════════ */
let _currentScenarioType: string | null = null;

/**
 * Call this from the UI layer before starting a practice session
 * so mock transcriptions and scoring align with the selected scenario.
 */
export function setMockSpeechScenario(scenarioType: string | null | undefined) {
  _currentScenarioType = scenarioType ?? null;
}

/* ══════════════════════════════════════════════════════════════
   Scenario-specific mock user transcriptions
   ══════════════════════════════════════════════════════════════ */

const MOCK_USER_TRANSCRIPTIONS: Record<string, string[]> = {
  sales: [
    "Of course. Our platform is specifically designed for mid-sized companies in Latin America. The main differentiator is that we offer bilingual support and integrations with local payment processors.",
    "For a team your size, our fastest deployment was 8 days. We assign a dedicated implementation specialist who handles 90% of the setup, so your team can stay focused on their day-to-day.",
    "That's a great question. We have a champion program where we identify 2-3 power users in your organization who become internal advocates. They get advanced training and direct access to our success team. That's what drove 95% adoption for our last three enterprise clients.",
  ],
  interview: [
    "Thank you. I'm a product leader with 8 years of experience building products for the LATAM market. Most recently, I led a team of 12 at a SaaS company where we grew revenue 3x in 18 months by focusing on the mid-market segment.",
    "When I joined, the team was missing targets by 40%. I restructured the sprint process, implemented weekly stakeholder check-ins, and created a shared OKR dashboard. Within two quarters, we were hitting 95% of targets consistently.",
    "I believe the best product decisions come from data, not hierarchy. I'd start by understanding the engineering lead's technical constraints, then present the user data that supports the priority. In my experience, when both sides see the same data, alignment happens naturally.",
  ],
  csuite: [
    "My recommendation is to reallocate 20% of acquisition spend to retention. Our cohort data shows that a 5% improvement in churn reduces CAC payback by 8 months. That translates to approximately 2.3 million dollars in annual savings.",
    "I've modeled three scenarios — conservative, moderate, and aggressive. Even in the conservative case, we break even by month 4. The key insight is that retained customers generate 3x more expansion revenue than new acquisitions in our segment.",
    "If retention doesn't improve as projected, we have a built-in circuit breaker. We run the pilot with the Brazil team only, measure at 90 days, and can reallocate the budget back to acquisition without any long-term commitment or sunk cost.",
  ],
  negotiation: [
    "I appreciate the transparency. Rather than reducing the price, I'd like to propose maintaining our current rate while adding 15% more licenses. That gives your growing team more value at the same investment level.",
    "That's a fair challenge. The switching cost alone — migration, training, and a 3-month productivity dip — would exceed any first-year savings from a competitor. Plus, our ROI data shows we've already delivered 4x the contract value this year.",
    "A two-year commitment changes the equation. If you can commit to 24 months, I can include the premium tier at no additional cost. That's an 85,000 dollar value add for your team, and it gives us the long-term partnership stability we value.",
  ],
  networking: [
    "Great to meet you! inFluentia is AI-powered communication coaching. We help LATAM professionals master executive conversations in English — not just grammar, but the communication patterns that win deals and accelerate promotions.",
    "It goes way beyond language training. We simulate real business scenarios — sales pitches, board presentations, negotiations — and give real-time feedback on executive presence. Our clients see a 35% improvement in deal close rates within 90 days.",
    "Our clients track three metrics: deal close rates, promotion velocity, and self-reported confidence scores. One enterprise client replaced their 200K annual workshop program with us and saw better results in just 90 days.",
  ],
};

export class MockSpeechService implements ISpeechService {
  /** Track transcription calls to cycle through mock user messages */
  private transcribeCallCount = 0;

  async transcribe(audioDurationMs: number): Promise<TranscriptionResult> {
    // Simulate processing: ~1s in prototype
    await delay(Math.max(800, Math.min(audioDurationMs * 0.3, 2000)));

    /* ── Error simulation ── */
    if (shouldSimulateError("speech")) {
      const codes = ["STT_TIMEOUT", "STT_NETWORK_ERROR", "MICROPHONE_DENIED"] as const;
      throw new SpeechError(codes[Math.floor(Math.random() * codes.length)]);
    }

    // Pick scenario-specific transcriptions
    const scenario = _currentScenarioType ?? "sales";
    const transcriptions = MOCK_USER_TRANSCRIPTIONS[scenario] ?? MOCK_USER_TRANSCRIPTIONS.sales;

    const text = transcriptions[this.transcribeCallCount % transcriptions.length];
    this.transcribeCallCount++;

    return {
      text,
      confidence: 0.92,
    };
  }

  async speak(
    text: string
  ): Promise<{ stop: () => void; duration: number }> {
    // Simulate TTS duration based on text length (same as prototype)
    const duration = 1800 + text.length * 18;
    let stopped = false;

    /* ── Error simulation ── */
    if (shouldSimulateError("speech")) {
      throw new SpeechError("TTS_NETWORK_ERROR");
    }

    const playbackPromise = new Promise<void>((resolve) => {
      const timer = setTimeout(() => {
        if (!stopped) resolve();
      }, duration);

      // Attach stop to cleanup
      (playbackPromise as any).__timer = timer;
    });

    // Start "playback" (just waits)
    playbackPromise.catch(() => { });

    return {
      stop: () => {
        stopped = true;
        clearTimeout((playbackPromise as any).__timer);
      },
      duration,
    };
  }

  async scorePronunciation(
    phraseIndex: number,
    attemptIndex: number
  ): Promise<PronunciationResult> {
    // Simulate analysis delay (~1.5s in prototype)
    await delay(1500);

    /* ── Error simulation ── */
    if (shouldSimulateError("speech")) {
      throw new SpeechError("PRONUNCIATION_TIMEOUT");
    }

    // Use scenario-specific shadowing phrases for scoring
    const scenario = _currentScenarioType ?? null;
    const phrases = scenario
      ? getShadowingForScenario(scenario as any)
      : MOCK_SHADOWING_PHRASES;

    const phrase = phrases[phraseIndex];
    if (!phrase) {
      return {
        score: 70,
        wordFeedback: {
          word: "unknown",
          phonetic: "",
          tip: "Keep practicing!",
        },
      };
    }

    const score =
      phrase.scores[Math.min(attemptIndex, phrase.scores.length - 1)];

    return {
      score,
      wordFeedback: { ...phrase.feedback },
    };
  }

  async getShadowingPhrases(_sessionId: string): Promise<ShadowingPhrase[]> {
    await delay(200);
    // Use scenario-specific shadowing phrases
    const scenario = _currentScenarioType ?? null;
    const phrases = scenario
      ? getShadowingForScenario(scenario as any)
      : MOCK_SHADOWING_PHRASES;
    return phrases.map((p) => ({ ...p }));
  }

  async assessPronunciation(
    _audioBlob: Blob,
    _referenceText: string
  ): Promise<AzurePronunciationAssessment | null> {
    // Mock: return null (no pronunciation assessment in mock mode)
    return null;
  }
}