/**
 * shared/lib/self-intro-contexts — Self-Introduction warm-up context data
 *
 * Canonical data store for the 3 self-intro scenarios.
 * Lives in shared/ so both features/practice-session and features/dashboard can import it.
 */
import type { SelfIntroContext } from "@/entities/session";

export const SELF_INTRO_CONTEXTS: SelfIntroContext[] = [
  {
    id: "networking",
    label: "Networking Event",
    description: "30-60 second pitch at a professional event",
    icon: "globe",
    scenario: "Professional self-introduction at a networking event. The user must deliver a concise, memorable elevator pitch in 30-60 seconds that communicates who they are, what they do, and why it matters — then transition into a natural conversation.",
    interlocutorBehavior: "Friendly but busy professional at a conference. They're curious but have limited time — they'll judge whether the conversation is worth continuing within the first 30 seconds. If the introduction is vague or too long, they'll politely disengage. If it's sharp and relevant, they'll ask follow-up questions.",
    interlocutor: "senior_stakeholder",
    methodology: {
      name: "The Elevator Pitch",
      tagline: "30 seconds. 4 beats. One lasting impression.",
      explanation: `Most professionals ramble when asked "What do you do?" They list job titles, company names, and responsibilities — and lose the other person in seconds.\n\nThe Elevator Pitch is a **4-beat structure** that turns your introduction into a conversation starter:\n\n**Beat 1 — The Hook.** Open with something unexpected or relatable. Not your job title. A problem you solve, a result you've achieved, or a question that makes them lean in.\n\n**Beat 2 — What you do.** Now give the context: your role, your company, your focus area. Keep it to one sentence.\n\n**Beat 3 — Why it matters.** Connect your work to something the listener cares about. Impact, results, a recognizable name. This is where credibility lives.\n\n**Beat 4 — The Open.** End with a question or a bridge that invites the other person to respond. Never end on yourself — end on them.`,
      pattern: {
        bad: {
          label: "The Résumé Dump",
          script: "Hi, I'm Maria. I'm a Senior Product Manager at TechCorp. I've been there for 4 years. Before that I was at StartupX for 3 years. I studied Industrial Engineering at UNAM. I manage a team of 6 and we work on the B2B platform.",
        },
        good: {
          label: "The Elevator Pitch",
          script: "You know how enterprise teams waste hours switching between tools that don't talk to each other? I lead the product team at TechCorp that's fixing that — we recently cut onboarding time by 40% for companies like Mercado Libre. What's your biggest workflow headache right now?",
        },
      },
      anchorPhrases: [
        "You know how [relatable problem]? I [solve that] at [company].",
        "We recently [specific result] for [recognizable client/metric].",
        "What's your take on [relevant topic]?",
        "I'd love to hear how you're approaching [their challenge].",
      ],
      coachTip: "People remember how you made them feel, not what you said. End with genuine curiosity about THEM, not another fact about you.",
    },
    introHeadline: "deliver a sharp, memorable elevator pitch at a networking event",
  },
  {
    id: "team",
    label: "Team Introduction",
    description: "First day with a new team — build rapport fast",
    icon: "users",
    scenario: "Professional self-introduction to a new team. The user is joining a new team (first day or first meeting) and must introduce themselves in a way that's professional yet approachable — establishing both competence and likability. The goal is to build trust and rapport quickly.",
    interlocutorBehavior: "A friendly but evaluative team member. They're welcoming but silently assessing: 'Will this person be easy to work with? Are they competent? Will they fit our culture?' They'll ask casual follow-up questions about work style, past projects, and personal interests.",
    interlocutor: "meeting_facilitator",
    methodology: {
      name: "Building Liking",
      tagline: "Be remembered as competent AND someone people want to work with.",
      explanation: `When you join a new team, the temptation is to prove your credentials. But research shows that **liking precedes trust** — people decide if they want to work with you before they assess your skills.\n\nThe Building Liking framework uses **3 layers** to create an introduction that's both credible and human:\n\n**Layer 1 — Your Role (The Professional You).** State your role and one thing you're excited to contribute. Keep it brief — this isn't a pitch, it's context.\n\n**Layer 2 — Something Personal (Calibrated Vulnerability).** Share one non-work detail that makes you relatable. Not your whole life story — just enough to feel human. A hobby, where you're from, what you do on weekends.\n\n**Layer 3 — How You Work (The Collaboration Signal).** Tell them how you like to work with others. This is the most strategic part — it sets expectations and shows emotional intelligence. "I'm a morning person, I over-communicate on Slack, and I love pair reviews."`,
      pattern: {
        bad: {
          label: "The LinkedIn Profile",
          script: "Hi everyone, I'm Carlos. I have 7 years of experience in backend engineering. I worked at Amazon for 3 years and then at Rappi for 2. I have a Master's in Computer Science from Tecnológico de Monterrey. I'm excited to be here.",
        },
        good: {
          label: "The Team Player",
          script: "Hey everyone, I'm Carlos — I'll be joining as a backend engineer. I'm really excited about the migration project you're working on, I did something similar at Rappi and learned a ton. Outside of work, I'm a terrible but enthusiastic soccer player. One thing about how I work — I tend to over-communicate, especially early on. I'd rather ask a 'dumb' question than make a wrong assumption. Looking forward to working with all of you.",
        },
      },
      anchorPhrases: [
        "I'm really excited about [specific project/initiative they're working on].",
        "Outside of work, I [relatable personal detail].",
        "One thing about how I work — I [collaboration style].",
        "I'd rather [positive work habit] than [negative alternative].",
      ],
      coachTip: "Don't try to impress. People don't remember your credentials on your first day — they remember whether they liked you. Be genuine and show curiosity about THEM.",
    },
    introHeadline: "introduce yourself to a new team and build trust from day one",
  },
  {
    id: "client",
    label: "Client Meeting",
    description: "Establish credibility before the first slide",
    icon: "handshake",
    scenario: "Professional self-introduction at the start of a client meeting. The user must establish credibility and relevance within the first 60 seconds — before any slides or agenda. The goal is to make the client think 'This person understands my problem and can help.'",
    interlocutorBehavior: "A busy, skeptical client who's met dozens of vendors/consultants. They're evaluating whether this person is worth their time. They respond well to specificity and relevance, but tune out if the introduction sounds generic or self-serving. They'll probe if interested, or redirect to the agenda if not.",
    interlocutor: "senior_stakeholder",
    methodology: {
      name: "The Credibility Opening",
      tagline: "Lead with their problem, not your résumé.",
      explanation: `Most professionals introduce themselves to clients by listing credentials: years of experience, past companies, degrees. The client nods politely — and forgets everything immediately.\n\nThe Credibility Opening flips the script with a **3-part structure** that makes the client feel understood before you've shown a single slide:\n\n**Part 1 — Their Problem (The Mirror).** Start by referencing something specific about the client's situation. Show that you've done your homework. "I know your team has been dealing with [specific challenge]..."\n\n**Part 2 — Your Relevant Experience (The Bridge).** Connect YOUR experience specifically to THEIR problem. Not your whole career — just the piece that's relevant. "We worked through something very similar with [comparable client/situation]..."\n\n**Part 3 — How You Work (The Commitment).** Tell them what working with you looks like. This reduces uncertainty and builds trust. "What I like to do is [approach] — so you always know [benefit for them]."`,
      pattern: {
        bad: {
          label: "The Credentials List",
          script: "Thanks for having us. I'm Ana, Senior Consultant at Deloitte. I've been in consulting for 12 years, specializing in digital transformation. I've worked with companies across LATAM and the US. I have an MBA from IE Business School.",
        },
        good: {
          label: "The Credibility Opening",
          script: "Thanks for making time today. I know your team has been scaling fast and the onboarding bottleneck is costing you — I think 3 weeks per new hire, right? We tackled exactly that with a fintech in Colombia last year and got it down to 5 days. I'm Ana, I lead this type of engagement at Deloitte. The way I like to work is transparent — no surprises, weekly check-ins, and you'll always see where we are before I do.",
        },
      },
      anchorPhrases: [
        "I know your team has been dealing with [specific challenge].",
        "We worked through something very similar with [comparable company/situation].",
        "The way I like to work is [approach] — so you always [benefit for them].",
        "Before we jump into the agenda, I want to make sure we're aligned on [key concern].",
      ],
      coachTip: "The client doesn't want to know who you are. They want to know if you understand their problem. The first 30 seconds should be about THEM, not about you.",
    },
    introHeadline: "open a client meeting with credibility and connection",
  },
];
