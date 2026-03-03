/**
 * Mock shadowing phrases — Reduced to 3 for prototype demo
 *
 * Phrase 1: User retries until success (scores improve across attempts → passes on 3rd)
 * Phrase 2: Always fails → gets added to Spaced Repetition after 3 attempts
 * Phrase 3: Passes immediately with a high score
 */
import type { ShadowingPhrase } from "../../../types";

export const MOCK_SHADOWING_PHRASES: ShadowingPhrase[] = [
  /* ── Phrase 1: Retry until success ── */
  {
    text: 'Good **mor**ning! I under**stand** you\'re e**val**uating auto**ma**tion **plat**forms for your **mar**keting team.',
    feedback: {
      word: "evaluating",
      phonetic: "/\u026A\u02C8v\u00E6ljue\u026At\u026A\u014B/",
      tip: "Enfatiza la segunda s\u00EDlaba: e-VAL-u-ating. Suena m\u00E1s seguro.",
    },
    scores: [62, 71, 88],
  },

  /* ── Phrase 2: Always fails → Spaced Repetition ── */
  {
    text: 'The main dif**fe**rentiator is bi**lin**gual sup**port** and **seam**less inte**gra**tions with **lo**cal **pay**ment **pro**cessors.',
    feedback: {
      word: "differentiator",
      phonetic: "/\u02CCd\u026Af\u0259\u02C8ren\u0283ie\u026At\u0259r/",
      tip: "Cuatro s\u00EDlabas claras: dif-fer-EN-shi-ator. La tercera s\u00EDlaba lleva el \u00E9nfasis.",
    },
    scores: [45, 52, 60],
  },

  /* ── Phrase 3: Passes immediately ── */
  {
    text: 'Our **plat**form is spe**ci**fically de**signed** for mid-sized **com**panies in **La**tin A**me**rica.',
    feedback: {
      word: "specifically",
      phonetic: "/sp\u0259\u02C8s\u026Af\u026Akli/",
      tip: "Pausa ligeramente despu\u00E9s de esta palabra para dar peso.",
    },
    scores: [92],
  },
];

/** Max attempts per phrase before forcing next */
export const MAX_SHADOWING_ATTEMPTS = 3;
