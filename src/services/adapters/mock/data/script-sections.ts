/**
 * Mock improved script — extracted from PracticeSessionPage ImprovedScript
 */
import type { ScriptSection } from "../../../types";

export const MOCK_SCRIPT_SECTIONS: ScriptSection[] = [
  {
    num: 1,
    title: "Opening",
    paragraphs: [
      {
        text: '"Good morning! I understand you\'re evaluating automation platforms for your marketing team. I appreciate you taking the time to meet with me today."',
        highlights: [],
      },
      {
        text: '"Our platform is specifically designed for mid-sized companies in Latin America. The main differentiator is bilingual support and seamless integrations with local payment processors\u2014something most global platforms don\'t offer."',
        highlights: [],
      },
    ],
  },
  {
    num: 2,
    title: "Handling Implementation Concerns",
    paragraphs: [
      {
        text: '"Great question about the timeline.',
        highlights: [
          {
            phrase: "Let me break this into three parts",
            color: "#E1D5F8",
            tooltip:
              "Dividir en partes facilita la comprensión y demuestra dominio del tema.",
          },
        ],
        suffix:
          ': initial setup, team training, and going fully operational."',
      },
      {
        text: "",
        highlights: [
          {
            phrase: "most companies see results within 48 hours",
            color: "#FFE9C7",
            tooltip:
              "Los datos específicos generan credibilidad y crean urgencia positiva.",
          },
        ],
        suffix: "",
        isHighlightBlock: true,
      },
      {
        text: '"We also assign a dedicated implementation specialist for the first 30 days, so your team never feels stuck."',
        highlights: [],
      },
      {
        text: '"',
        highlights: [
          {
            phrase: "Does this align with what you're looking for?",
            color: "#D9ECF0",
            tooltip:
              "Las preguntas abiertas invitan al diálogo y confirman comprensión mutua.",
          },
        ],
        suffix: ' "',
      },
    ],
  },
  {
    num: 3,
    title: "Closing with Value",
    paragraphs: [
      {
        text: '"Just to recap: you get bilingual support, local integrations, a 48-hour implementation, and a dedicated specialist for your first month."',
        highlights: [],
      },
      {
        text: '"What questions do you still have that would help you move forward?"',
        highlights: [],
      },
    ],
  },
];
