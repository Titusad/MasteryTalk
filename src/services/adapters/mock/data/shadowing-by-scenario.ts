/**
 * Scenario-specific Shadowing Phrases (Phase 4 — Shadowing Scripts)
 *
 * Each scenario has phrases tailored to its communication context.
 * Falls back to default (sales) for unknown scenario types.
 *
 * Each phrase has:
 * - text: with **stress** markers for pronunciation emphasis
 * - feedback: key word with phonetic + tip
 * - scores: mock progression per attempt
 */
import type { ShadowingPhrase, ScenarioType } from "../../../types";
import { MOCK_SHADOWING_PHRASES } from "./shadowing-data";

const SHADOWING_BY_SCENARIO: Record<string, ShadowingPhrase[]> = {
  /* ── Interview ── */
  interview: [
    {
      text: 'In my pre**vi**ous role, I **led** a cross-func**tion**al team that de**li**vered a **thir**ty per**cent** in**crease** in re**ten**tion.',
      feedback: {
        word: "cross-functional",
        phonetic: "/krɔːs ˈfʌŋkʃənəl/",
        tip: "Enfatiza la primera sílaba de 'functional': FUNC-tional. Es una palabra clave en entrevistas de liderazgo.",
      },
      scores: [58, 72, 86],
    },
    {
      text: 'The ap**proach** I would take in your en**vi**ronment would be to pri**o**ritize stake**hol**der a**lign**ment.',
      feedback: {
        word: "prioritize",
        phonetic: "/praɪˈɒrɪtaɪz/",
        tip: "Cuatro sílabas claras: pry-OR-i-tize. La segunda sílaba lleva el énfasis principal.",
      },
      scores: [44, 55, 63],
    },
    {
      text: 'What at**trac**ted me to this role spe**ci**fically is the op**por**tunity to **scale** o**pe**rations a**cross** e**mer**ging **mar**kets.',
      feedback: {
        word: "specifically",
        phonetic: "/spəˈsɪfɪkli/",
        tip: "Pausa ligeramente después de 'specifically' para dar peso a lo que sigue.",
      },
      scores: [91],
    },
  ],

  /* ── C-Suite ── */
  csuite: [
    {
      text: 'My re**com**men**da**tion is to re**al**locate **twen**ty per**cent** of ac**qui**sition **spend** to re**ten**tion.',
      feedback: {
        word: "recommendation",
        phonetic: "/ˌrekəmenˈdeɪʃən/",
        tip: "Cinco sílabas: rec-o-men-DAY-tion. Pronúnciala con autoridad — es tu palabra de poder ante el C-Suite.",
      },
      scores: [55, 68, 83],
    },
    {
      text: "I've **mo**deled three sce**na**rios. **E**ven in the con**ser**vative case, we **break** **e**ven by **month** four.",
      feedback: {
        word: "scenarios",
        phonetic: "/sɪˈnɛərioʊz/",
        tip: "Tres sílabas: si-NAIR-ee-ohs. No digas 'es-cenarios' — suena como traducción directa.",
      },
      scores: [48, 56, 61],
    },
    {
      text: 'The **cost** of in**ac**tion here is ap**pro**ximately two **point** three **mil**lion in an**nu**al **sav**ings **for**gone.',
      feedback: {
        word: "approximately",
        phonetic: "/əˈprɒksɪmətli/",
        tip: "Cuatro sílabas: a-PROX-i-mate-ly. Úsala antes de números para sonar preciso pero no rígido.",
      },
      scores: [89],
    },
  ],

  /* ── Negotiation ── */
  negotiation: [
    {
      text: 'Based on the **mar**ket **da**ta, a **fair** range would be be**tween** **eight**y and **nine**ty **thou**sand.',
      feedback: {
        word: "between",
        phonetic: "/bɪˈtwiːn/",
        tip: "Enfatiza ligeramente 'between' cuando presentas un rango — ancla ambos extremos con confianza.",
      },
      scores: [65, 78, 87],
    },
    {
      text: "I'm **flex**ible on the **time**line if we can a**gree** on the **core** **terms** of the en**gage**ment.",
      feedback: {
        word: "flexible",
        phonetic: "/ˈfleksəbəl/",
        tip: "FLEX-i-ble. Pronúnciala con calma — la flexibilidad se demuestra con tono, no con prisa.",
      },
      scores: [42, 51, 58],
    },
    {
      text: "Let me be trans**pa**rent a**bout** my con**straints** so we can find a so**lu**tion that **works** for **both** sides.",
      feedback: {
        word: "transparent",
        phonetic: "/trænsˈpærənt/",
        tip: "trans-PAR-ent. La honestidad estratégica requiere pronunciación clara y directa.",
      },
      scores: [90],
    },
  ],

  /* ── Networking ── */
  networking: [
    {
      text: 'I **help** **La**tin A**me**rican com**pa**nies **break** into the **U.S.** **mar**ket using **AI**-powered com**mu**ni**ca**tion coach**ing**.',
      feedback: {
        word: "communication",
        phonetic: "/kəˌmjuːnɪˈkeɪʃən/",
        tip: "Cinco sílabas: co-myu-ni-KAY-shun. La cuarta sílaba lleva el énfasis. Es tu palabra de marca.",
      },
      scores: [60, 74, 85],
    },
    {
      text: "I'd **love** to ex**plore** whe**ther** there's a way we could col**la**borate on some**thing** mu**tu**ally bene**fi**cial.",
      feedback: {
        word: "collaborate",
        phonetic: "/kəˈlæbəreɪt/",
        tip: "co-LAB-o-rate. La segunda sílaba lleva el énfasis. Suena más profesional que 'work together'.",
      },
      scores: [47, 53, 62],
    },
    {
      text: 'Can I **grab** your **e**mail? I\'ll **fo**llow up **Tues**day with that **case** **stu**dy and a **cof**fee in**vite**.',
      feedback: {
        word: "follow up",
        phonetic: "/ˈfɒloʊ ʌp/",
        tip: "FOL-low up. Dos palabras separadas, énfasis en FOL. El follow-up concreto es lo que convierte un contacto en una conexión.",
      },
      scores: [93],
    },
  ],
};

/**
 * Get shadowing phrases for a given scenario type.
 * Falls back to default sales phrases if scenario is unknown.
 */
export function getShadowingForScenario(
  scenarioType?: ScenarioType | null
): ShadowingPhrase[] {
  if (scenarioType && SHADOWING_BY_SCENARIO[scenarioType]) {
    return SHADOWING_BY_SCENARIO[scenarioType];
  }
  return MOCK_SHADOWING_PHRASES;
}
