/**
 * Scenario-specific Improved Script sections (Phase 4 of Master Prompt)
 *
 * Each scenario has a structurally different script:
 * - Sales: Opening → Objection Handling → Closing with Value
 * - Interview: Personal Pitch → STAR Story → Ask & Close
 * - C-Suite: Executive Summary → Data Backing → Decision Ask
 * - Negotiation: Position Statement → Counter-offer Framework → Conditional Close
 * - Networking: Elevator Pitch → Value Exchange → Follow-up Hook
 *
 * Falls back to MOCK_SCRIPT_SECTIONS (sales) for unknown scenario types.
 */
import type { ScriptSection, ScenarioType } from "../../../types";
import { MOCK_SCRIPT_SECTIONS } from "./script-sections";

const SCRIPT_SECTIONS_BY_SCENARIO: Record<string, ScriptSection[]> = {
  /* ── Interview ── */
  interview: [
    {
      num: 1,
      title: "Personal Pitch",
      paragraphs: [
        {
          text: '"Thank you for meeting with me today. I\'m excited about this role because it sits at the intersection of two things I\'m passionate about — product strategy and emerging markets."',
          highlights: [],
        },
        {
          text: '"In my current role, I lead a team of 12 building products for the LATAM mid-market. We\'ve grown revenue 3x in 18 months, and I\'d love to bring that playbook here."',
          highlights: [
            {
              phrase: "grown revenue 3x in 18 months",
              color: "#FFE9C7",
              tooltip: "Specific numbers make your claims credible. Always quantify your impact.",
            },
          ],
          suffix: "",
        },
      ],
    },
    {
      num: 2,
      title: "STAR Story — Leadership Challenge",
      paragraphs: [
        {
          text: '"Let me give you a specific example.',
          highlights: [
            {
              phrase: "When I joined, the team was missing targets by 40%",
              color: "#E1D5F8",
              tooltip: "Starting with the problem creates a compelling narrative arc.",
            },
          ],
          suffix: '."',
        },
        {
          text: '"I restructured the sprint process, implemented weekly stakeholder check-ins, and created a shared OKR dashboard.',
          highlights: [
            {
              phrase: "Within two quarters, we were hitting 95% of targets consistently",
              color: "#FFE9C7",
              tooltip: "The result completes the STAR framework with measurable impact.",
            },
          ],
          suffix: '."',
        },
      ],
    },
    {
      num: 3,
      title: "Strategic Close",
      paragraphs: [
        {
          text: '"Based on what you\'ve shared about the team\'s current challenges, I believe my experience in scaling cross-functional teams in LATAM maps directly to what you need."',
          highlights: [],
        },
        {
          text: '"',
          highlights: [
            {
              phrase: "What does the ideal first 90 days look like for this role?",
              color: "#D9ECF0",
              tooltip: "Closing with a forward-looking question shows you're already thinking as a team member.",
            },
          ],
          suffix: '"',
        },
      ],
    },
  ],

  /* ── C-Suite ── */
  csuite: [
    {
      num: 1,
      title: "Executive Summary",
      paragraphs: [
        {
          text: '"I\'ll keep this brief.',
          highlights: [
            {
              phrase: "My recommendation is to reallocate 20% of acquisition spend to retention",
              color: "#E1D5F8",
              tooltip: "Lead with the recommendation. Executives want the conclusion first.",
            },
          ],
          suffix: '. Here\'s why."',
        },
        {
          text: '"Our retention cohort data shows that a 5% improvement in churn reduces CAC payback by 8 months. That\'s $2.3M in annual savings."',
          highlights: [
            {
              phrase: "$2.3M in annual savings",
              color: "#FFE9C7",
              tooltip: "One unforgettable number. This is what the board will remember.",
            },
          ],
          suffix: "",
        },
      ],
    },
    {
      num: 2,
      title: "Risk Acknowledgment",
      paragraphs: [
        {
          text: '"I know the concern: reducing paid acquisition could impact pipeline in Q2.',
          highlights: [
            {
              phrase: "I've modeled three scenarios",
              color: "#E1D5F8",
              tooltip: "Anticipating objections builds executive confidence in your thinking.",
            },
          ],
          suffix: '. Even in the conservative case, we break even by month 4."',
        },
      ],
    },
    {
      num: 3,
      title: "Decision Ask",
      paragraphs: [
        {
          text: '"I need approval to run a controlled pilot in Q2 with the Brazil team.',
          highlights: [
            {
              phrase: "The investment is $180K with a projected return of 4.2x",
              color: "#FFE9C7",
              tooltip: "Concrete ask + projected return removes ambiguity from the decision.",
            },
          ],
          suffix: '."',
        },
        {
          text: '"',
          highlights: [
            {
              phrase: "Do I have the green light to proceed, or do you need additional data?",
              color: "#D9ECF0",
              tooltip: "Binary close — eliminates 'let me think about it' as an option.",
            },
          ],
          suffix: '"',
        },
      ],
    },
  ],

  /* ── Negotiation ── */
  negotiation: [
    {
      num: 1,
      title: "Position Statement",
      paragraphs: [
        {
          text: '"Thank you for making time to discuss the renewal.',
          highlights: [
            {
              phrase: "Based on the value we've delivered this year, I'd like to propose maintaining the current rate with an additional 15% in licenses",
              color: "#E1D5F8",
              tooltip: "Anchor high but justify with value delivered. This sets the negotiation range.",
            },
          ],
          suffix: '."',
        },
      ],
    },
    {
      num: 2,
      title: "Counter-offer Framework",
      paragraphs: [
        {
          text: '"I understand your budget constraints.',
          highlights: [
            {
              phrase: "What if we restructure this as a quarterly commitment instead of annual?",
              color: "#E1D5F8",
              tooltip: "Creative restructuring signals flexibility without lowering your price.",
            },
          ],
          suffix: '"',
        },
        {
          text: '"That reduces your upfront commitment while giving us the predictability we need.',
          highlights: [
            {
              phrase: "Would that work within your current approval threshold?",
              color: "#D9ECF0",
              tooltip: "Asking about their internal process shows sophistication and uncovers real constraints.",
            },
          ],
          suffix: '"',
        },
      ],
    },
    {
      num: 3,
      title: "Conditional Close",
      paragraphs: [
        {
          text: '"So here\'s what I can do:',
          highlights: [
            {
              phrase: "If you can commit to a 2-year term, I can include the premium tier at no additional cost",
              color: "#FFE9C7",
              tooltip: "Conditional concession — your concession is tied to their commitment. Never give without getting.",
            },
          ],
          suffix: '."',
        },
        {
          text: '"That gives your team access to the full feature set and gives us the long-term partnership we\'re looking for. Fair?"',
          highlights: [],
        },
      ],
    },
  ],

  /* ── Networking ── */
  networking: [
    {
      num: 1,
      title: "Elevator Pitch",
      paragraphs: [
        {
          text: '"',
          highlights: [
            {
              phrase: "I help LATAM companies break into the US market using AI-powered communication coaching",
              color: "#E1D5F8",
              tooltip: "Problem-first framing. 'I help X do Y' is the most effective networking opener.",
            },
          ],
          suffix: '."',
        },
        {
          text: '"We\'re working with about 40 companies right now, mostly in the SaaS space. The biggest insight is that the language barrier isn\'t vocabulary — it\'s executive presence."',
          highlights: [],
        },
      ],
    },
    {
      num: 2,
      title: "Value Exchange",
      paragraphs: [
        {
          text: '"That\'s fascinating — your work in partnerships sounds like it overlaps with what our clients need.',
          highlights: [
            {
              phrase: "I'd love to explore whether there's a way we could collaborate",
              color: "#D9ECF0",
              tooltip: "Suggesting collaboration is more memorable than asking for a favor.",
            },
          ],
          suffix: '."',
        },
      ],
    },
    {
      num: 3,
      title: "Follow-up Hook",
      paragraphs: [
        {
          text: '"Let me send you our case study on the LATAM SaaS expansion — I think it\'d be relevant to what you\'re building.',
          highlights: [
            {
              phrase: "Can I grab your email? I'll follow up Tuesday with that and a coffee invite",
              color: "#FFE9C7",
              tooltip: "Specific day + specific action = 10x more likely to actually happen.",
            },
          ],
          suffix: '."',
        },
      ],
    },
  ],
};

/**
 * Get script sections for a given scenario type.
 * Falls back to default sales script if scenario is unknown.
 */
export function getScriptSectionsForScenario(
  scenarioType?: ScenarioType | null
): ScriptSection[] {
  if (scenarioType && SCRIPT_SECTIONS_BY_SCENARIO[scenarioType]) {
    return SCRIPT_SECTIONS_BY_SCENARIO[scenarioType];
  }
  // Default: original sales script
  return MOCK_SCRIPT_SECTIONS;
}
