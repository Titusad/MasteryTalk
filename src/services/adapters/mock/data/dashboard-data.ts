/**
 * Mock dashboard data — extracted from DashboardPage
 */
import type { PracticeHistoryItem, PowerPhrase, SRCard, SRInterval } from "../../../types";

export const MOCK_PRACTICE_HISTORY: PracticeHistoryItem[] = [
  {
    title: "Sales pitch: Producto B2B SaaS para LATAM",
    date: "10 feb 2026",
    duration: "14 min",
    tag: "VP of Sales",
    arenaPhaseReached: "guidance",
    powerPhrasesUsed: 4,
    srCardsPending: 2,
    srCardsMastered: 1,
    beforeAfterHighlight: {
      userOriginal: "We can do it in like two weeks, more or less.",
      professionalVersion:
        "Our standard implementation runs 10-14 business days, with the timeline primarily influenced by team size and integration complexity.",
      technique: "Precision framing",
    },
  },
  {
    title: "Entrevista: Senior PM en fintech",
    date: "8 feb 2026",
    duration: "18 min",
    tag: "Recruiter",
    arenaPhaseReached: "support",
    powerPhrasesUsed: 2,
    srCardsPending: 1,
    srCardsMastered: 1,
    beforeAfterHighlight: {
      userOriginal:
        "I managed a team of like ten people and we did a lot of projects.",
      professionalVersion:
        "I led a cross-functional team of 10, delivering 3 high-impact product launches within a 6-month window.",
      technique: "Quantified impact",
    },
  },
  {
    title: "Negociaci\u00F3n de contrato Q2",
    date: "6 feb 2026",
    duration: "12 min",
    tag: "Client",
    arenaPhaseReached: "challenge",
    powerPhrasesUsed: 3,
    srCardsPending: 0,
    srCardsMastered: 2,
    beforeAfterHighlight: {
      userOriginal: "I think maybe we could adjust the price a little bit.",
      professionalVersion:
        "I\u2019d like to propose a revised pricing structure that better reflects the expanded scope we discussed.",
      technique: "Value elevation",
    },
  },
  {
    title: "Presentaci\u00F3n de resultados Q4",
    date: "3 feb 2026",
    duration: "9 min",
    tag: "Leadership",
    arenaPhaseReached: "support",
    powerPhrasesUsed: 2,
    srCardsPending: 1,
    srCardsMastered: 0,
    beforeAfterHighlight: {
      userOriginal:
        "The numbers went up a lot this quarter, which is good for us.",
      professionalVersion:
        "We\u2019ve consistently exceeded our quarterly targets, driven by cross-functional collaboration and a sharper go-to-market strategy.",
      technique: "Executive framing",
    },
  },
];

export const MOCK_POWER_PHRASES: PowerPhrase[] = [
  {
    phrase: '"Let me walk you through the key takeaways"',
    category: "Presentaciones",
    whenToUse: "Para introducir puntos principales",
    situation: "Al iniciar o resumir una presentaci\u00F3n",
    accentColor: "#D9ECF0",
  },
  {
    phrase: '"I\'d like to propose a different approach"',
    category: "Negociaci\u00F3n",
    whenToUse: "Para presentar una alternativa",
    situation: "Cuando necesitas redirigir la conversaci\u00F3n",
    accentColor: "#FFE9C7",
  },
  {
    phrase: '"Based on the data, I recommend we..."',
    category: "Reuniones",
    whenToUse: "Para apoyar con evidencia",
    situation: "Al defender una propuesta con m\u00E9tricas",
    accentColor: "#DBEDDF",
  },
];

export const MOCK_SR_CARDS: SRCard[] = [
  {
    id: "sr-1",
    phrase:
      "I'd like to **high**light the **mea**surable **im**pact this ini**tia**tive has had on our **quar**terly **rev**enue.",
    word: "measurable",
    phonetic: "/\u02C8me\u0292\u0259r\u0259bl/",
    lastScore: 58,
    intervalStep: 1,
    origin: "Pr\u00E1ctica: Sales pitch",
  },
  {
    id: "sr-2",
    phrase:
      'Our **plat**form is spe**ci**fically de**signed** for **mid**-sized **com**panies in Latin A**me**rica.',
    word: "specifically",
    phonetic: "/sp\u0259\u02C8s\u026Af\u026Akli/",
    lastScore: 62,
    intervalStep: 1,
    origin: "Pr\u00E1ctica: Sales pitch",
  },
  {
    id: "sr-3",
    phrase:
      'We can **ab**solutely ac**com**modate that **time**line if we ad**just** the **scope** **slight**ly.',
    word: "accommodate",
    phonetic: "/\u0259\u02C8k\u0252m\u0259de\u026At/",
    lastScore: 67,
    intervalStep: 1,
    origin: "Pr\u00E1ctica: Negociaci\u00F3n Q2",
  },
  {
    id: "sr-4",
    phrase:
      'The **main** diffe**ren**tiator is bi**lin**gual sup**port** and **seam**less inte**gra**tions with **lo**cal **pay**ment **pro**cessors.',
    word: "differentiator",
    phonetic: "/\u02CCd\u026Af\u0259\u02C8ren\u0283ie\u026At\u0259r/",
    lastScore: 71,
    intervalStep: 1,
    origin: "Pr\u00E1ctica: Sales pitch",
  },
  {
    id: "sr-5",
    phrase:
      "We've con**sis**tently ex**cee**ded our **tar**gets by **le**veraging cross-**func**tional colla**bo**ration.",
    word: "consistently",
    phonetic: "/k\u0259n\u02C8s\u026Ast\u0259ntli/",
    lastScore: 73,
    intervalStep: 1,
    origin: "Pr\u00E1ctica: Presentaci\u00F3n Q4",
  },
  {
    id: "sr-6",
    phrase:
      'Our pre**li**minary a**na**lysis sug**gests** a sig**ni**ficant oppor**tu**nity in the **en**terprise **seg**ment.',
    word: "preliminary",
    phonetic: "/pr\u026A\u02C8l\u026Am\u026An\u0259ri/",
    lastScore: 82,
    intervalStep: 2,
    origin: "Pr\u00E1ctica: Entrevista PM",
  },
  {
    id: "sr-7",
    phrase:
      'Great **ques**tion a**bout** the **time**line. Let me **break** this into **three** **parts**.',
    word: "timeline",
    phonetic: "/\u02C8ta\u026Amla\u026An/",
    lastScore: 88,
    intervalStep: 3,
    origin: "Pr\u00E1ctica: Sales pitch",
  },
];

export const SR_INTERVALS: SRInterval[] = [
  { step: 1, days: 1, label: "24h" },
  { step: 2, days: 3, label: "3 d\u00EDas" },
  { step: 3, days: 7, label: "7 d\u00EDas" },
  { step: 4, days: 14, label: "14 d\u00EDas" },
];

export const MAX_DAILY_CARDS = 5;
export const MIN_PASSING_SCORE = 80;
export const MASTERY_SCORE = 85;