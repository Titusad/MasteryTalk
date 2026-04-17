import { useState, useRef, useEffect } from "react";
import { Wrench, ChevronDown, MonitorPlay } from "lucide-react";
import type { Step } from "./shared/session-types";
import type {
    Strength,
    Opportunity,
    BeforeAfterComparison,
    SessionSummary,
    TurnPronunciationData,
    ContentInsight,
    PracticeHistoryItem,
    ScriptSection,
    InterviewBriefingData,
} from "../../services/types";
import { downloadSessionReportPdf } from "../utils/cheatSheetPdf";

/* ═══════════════════════════════════════════════════════════
   DEV PREVIEW MENU — Floating dropdown for rapid UI testing
   Provides mock data & direct navigation to any app state
   ═══════════════════════════════════════════════════════════ */

/* ── Mock Data: Feedback ── */

export const MOCK_STRENGTHS: Strength[] = [
    { title: "Clear Value Proposition", desc: "You articulated the unique value of your solution with strong business vocabulary and confident delivery." },
    { title: "Professional Register", desc: "Consistent use of formal English appropriate for executive-level conversation. Natural transitions between ideas." },
    { title: "Data-Driven Arguments", desc: "Effective use of metrics and quantitative evidence to support your claims." },
];

export const MOCK_OPPORTUNITIES: Opportunity[] = [
    { title: "Hedging Language", tag: "Grammar", desc: "Replace 'I think maybe we could...' with assertive alternatives like 'Our recommendation is...' or 'The data suggests...'" },
    { title: "Filler Word Reduction", tag: "Fluency", desc: "Noticed frequent use of 'basically' and 'you know'. Practice pausing instead of filling silence." },
    { title: "Technical Vocabulary Precision", tag: "Vocabulary", desc: "Use 'scalable architecture' instead of 'big system' and 'competitive advantage' instead of 'what makes us better'." },
];

export const MOCK_BEFORE_AFTER: BeforeAfterComparison[] = [
    {
        userOriginal: "I think our product is good because it has many features that help companies save money.",
        professionalVersion: "Our platform delivers measurable ROI through three core capabilities: automated workflow optimization, predictive analytics, and seamless integration with existing enterprise systems.",
        technique: "Specificity & Value Framing",
    },
    {
        userOriginal: "We have been doing this for a long time and many companies use our product.",
        professionalVersion: "With over 8 years of market presence and 200+ enterprise clients across LATAM, we've refined our solution to address the unique challenges of the regional mid-market.",
        technique: "Social Proof & Authority",
    },
];

export const MOCK_PILLAR_SCORES: Record<string, number> = {
    Vocabulary: 78,
    Grammar: 72,
    Fluency: 65,
    Pronunciation: 0, // comes from Azure
    "Professional Tone": 81,
    Persuasion: 74,
};

export const MOCK_CONTENT_SCORES: Record<string, number> = {
    Relevance: 82,
    Structure: 70,
    Examples: 75,
    Impact: 68,
};

export const MOCK_CONTENT_INSIGHTS: ContentInsight[] = [
    { dimension: "Relevance", observation: "Your answers directly addressed what was asked 4 out of 5 times.", tip: "When asked about challenges, pivot back to the specific role requirements." },
    { dimension: "Structure", observation: "You used the STAR framework effectively in 2 answers but lost structure in behavioral questions.", tip: "Start every behavioral answer with 'In my role as X, I faced Y situation...'" },
    { dimension: "Examples", observation: "Good use of concrete numbers in your achievement examples.", tip: "Add more company-specific context to make examples more memorable." },
    { dimension: "Impact", observation: "Your closing statement was strong but could be more concise.", tip: "End each answer with a single-sentence impact statement tied to the role." },
];

export const MOCK_INTERVIEW_READINESS_SCORE = 74;

export const MOCK_LANGUAGE_INSIGHTS = [
    { dimension: "Vocabulary", observation: "You used general terms like 'good' and 'help' instead of industry-specific language.", tip: "Replace 'good solution' with 'cost-effective, scalable solution' to sound more authoritative." },
    { dimension: "Grammar", observation: "Inconsistent tense shifting between past and present when describing past achievements.", tip: "When narrating stories, commit to past tense: 'We delivered...' not 'We deliver...'" },
    { dimension: "Fluency", observation: "Several noticeable pauses and filler words ('basically', 'you know') interrupted your flow.", tip: "Practice replacing fillers with a brief pause — silence sounds more confident than 'um'." },
    { dimension: "Professional Tone", observation: "Occasional casual phrases ('yeah', 'pretty much') reduced the professional impact.", tip: "Replace 'Yeah, that's pretty much it' with 'That accurately reflects our approach.'" },
    { dimension: "Persuasion", observation: "Claims lacked supporting data. Statements felt opinion-based rather than evidence-backed.", tip: "Add metrics: 'Our platform reduced onboarding time by 40%' beats 'We help companies a lot.'" },
];

export const MOCK_PRON_DATA: TurnPronunciationData[] = [
    {
        turnIndex: 0,
        timestamp: new Date().toISOString(),
        assessment: {
            accuracyScore: 82,
            fluencyScore: 75,
            completenessScore: 95,
            prosodyScore: 70,
            pronScore: 78,
            words: [
                { word: "Our", accuracyScore: 95, errorType: "None", phonemes: [{ phoneme: "aʊ", accuracyScore: 95 }, { phoneme: "ɚ", accuracyScore: 93 }] },
                { word: "platform", accuracyScore: 88, errorType: "None", phonemes: [{ phoneme: "p", accuracyScore: 90 }, { phoneme: "l", accuracyScore: 85 }] },
                { word: "delivers", accuracyScore: 72, errorType: "Mispronunciation", phonemes: [{ phoneme: "d", accuracyScore: 80 }, { phoneme: "ɪ", accuracyScore: 60 }] },
                { word: "measurable", accuracyScore: 65, errorType: "Mispronunciation", phonemes: [{ phoneme: "m", accuracyScore: 90 }, { phoneme: "ɛ", accuracyScore: 55 }] },
            ],
            recognizedText: "Our platform delivers measurable ROI through three core capabilities",
            wordCount: 9,
            problemWordCount: 2,
        },
    },
    {
        turnIndex: 1,
        timestamp: new Date().toISOString(),
        assessment: {
            accuracyScore: 85,
            fluencyScore: 80,
            completenessScore: 98,
            prosodyScore: 73,
            pronScore: 82,
            words: [
                { word: "We", accuracyScore: 98, errorType: "None", phonemes: [{ phoneme: "w", accuracyScore: 98 }] },
                { word: "integrate", accuracyScore: 70, errorType: "Mispronunciation", phonemes: [{ phoneme: "ɪ", accuracyScore: 65 }, { phoneme: "n", accuracyScore: 80 }] },
                { word: "seamlessly", accuracyScore: 68, errorType: "Mispronunciation", phonemes: [{ phoneme: "s", accuracyScore: 90 }, { phoneme: "iː", accuracyScore: 55 }] },
            ],
            recognizedText: "We integrate seamlessly with existing enterprise payment processors",
            wordCount: 8,
            problemWordCount: 2,
        },
    },
];

export const MOCK_SESSION_SUMMARY: SessionSummary = {
    overallSentiment: "Strong performance with clear communication skills. Your professional vocabulary is developing well, and your ability to structure arguments shows real progress.",
    nextSteps: [
        { title: "Practice Hedging Alternatives", desc: "Replace uncertain phrases with assertive business language.", pillar: "Grammar" },
        { title: "Reduce Filler Words", desc: "Practice strategic pausing instead of using 'basically' and 'you know'.", pillar: "Fluency" },
        { title: "Expand Technical Vocabulary", desc: "Build a personal glossary of industry-specific terms.", pillar: "Vocabulary" },
    ],
    sessionHighlight: "Your closing pitch was particularly effective — confident delivery with strong data points.",
    pillarScores: MOCK_PILLAR_SCORES,
    professionalProficiency: 74,
    cefrApprox: "B2+",
};

export const MOCK_SCRIPT_SECTIONS: ScriptSection[] = [
    {
        num: 1,
        title: "Opening & Personal Pitch",
        paragraphs: [
            {
                text: "Start with a confident self-introduction that positions you as the ideal candidate.",
                highlights: [
                    { phrase: "Thank you for this opportunity. I'm excited to discuss how my experience in B2B SaaS aligns perfectly with this role.", color: "#dcfce7", tooltip: "Key opener — sets professional tone" },
                ],
                suffix: "Pause briefly to let the interviewer acknowledge before continuing.",
            },
            {
                text: "Transition into your value proposition by connecting your background to the role requirements.",
                highlights: [
                    { phrase: "Over the past five years, I've led cross-functional teams that delivered 40% revenue growth in the LATAM market.", color: "#dbeafe", tooltip: "Quantified achievement — creates credibility" },
                ],
            },
        ],
    },
    {
        num: 2,
        title: "STAR Story — Key Achievement",
        paragraphs: [
            {
                text: "Here's how you present your strongest career story using the STAR framework:",
                highlights: [
                    { phrase: "When our team faced a critical deadline for the Mexico launch, I implemented an agile sprint methodology that reduced delivery time by 30%.", color: "#f3e8ff", tooltip: "STAR: Situation + Action" },
                    { phrase: "As a result, we launched two weeks ahead of schedule and exceeded our Q3 targets by 15%.", color: "#dcfce7", tooltip: "STAR: Result with metrics" },
                ],
            },
        ],
    },
    {
        num: 3,
        title: "Strategic Close",
        paragraphs: [
            {
                text: "Close by reaffirming your fit and demonstrating forward-thinking.",
                highlights: [
                    { phrase: "I'm particularly drawn to your company's expansion into Brazil, and I believe my bilingual capabilities and regional market expertise would accelerate that growth.", color: "#fef3c7", tooltip: "Shows research + value alignment" },
                ],
                suffix: "Follow up with a thoughtful question about team dynamics or strategic priorities.",
            },
        ],
    },
];

export const MOCK_INTERVIEW_BRIEFING: InterviewBriefingData = {
    anticipatedQuestions: [
        {
            id: 1,
            question: "Tell me about a time you led a cross-functional team to deliver a complex project under tight deadlines.",
            why: "Tests your leadership style and ability to handle pressure — critical for senior roles in nearshoring environments.",
            approach: "Use STAR format. Lead with the challenge scope, then your specific actions, then quantified results.",
            suggestedOpener: "In my previous role as [position], we had [X weeks] to deliver [project]. I took the lead by [first action you took]…",
            framework: { name: "STAR", description: "Situación → Tarea → Acción → Resultado: narra primero el contexto, luego tu responsabilidad específica, qué hiciste concretamente y el resultado medible." },
            keyPhrases: [
                { phrase: "I spearheaded the initiative by...", color: "#E1D5F8", tooltip: "Verbo de liderazgo — demuestra ownership" },
                { phrase: "This resulted in a 30% reduction in delivery time", color: "#FFE9C7", tooltip: "Impacto cuantificado" },
                { phrase: "I coordinated daily stand-ups across three time zones", color: "#D9ECF0", tooltip: "Demuestra gestión de equipos distribuidos" },
                { phrase: "The client renewed the contract based on our delivery track record", color: "#FFE9C7", tooltip: "Resultado de negocio concreto" },
            ],
            pivot: "If they probe deeper on team conflicts, transition to your conflict resolution example.",
        },
        {
            id: 2,
            question: "How do you handle communication challenges in a distributed, multilingual team?",
            why: "Directly relevant to nearshoring — they want to see you've navigated cultural and language barriers successfully.",
            approach: "Share a specific example where clear communication led to project success. Mention tools and processes you implemented.",
            suggestedOpener: "When I joined [company/team], communication across [X offices/timezones] was a real challenge. I addressed it by [specific process you introduced]…",
            framework: { name: "Problem-Solution", description: "Problema → Solución → Impacto: presenta el dolor que existía, la solución concreta que implementaste y el resultado medible que generó." },
            keyPhrases: [
                { phrase: "I established a bilingual documentation framework", color: "#E1D5F8", tooltip: "Solución orientada a procesos" },
                { phrase: "which improved cross-team alignment by 45%", color: "#FFE9C7", tooltip: "Resultado medible" },
                { phrase: "I introduced async video updates to bridge the timezone gap", color: "#D9ECF0", tooltip: "Herramienta práctica y moderna" },
                { phrase: "This reduced miscommunication incidents from weekly to near-zero", color: "#FFE9C7", tooltip: "Impacto específico y creíble" },
            ],
            pivot: "Connect to how this skill applies to their specific team structure.",
        },
        {
            id: 3,
            question: "What's your approach to stakeholder management when priorities conflict?",
            why: "Senior roles require navigating competing interests — this tests your diplomacy and strategic thinking.",
            approach: "Describe your framework for prioritization and how you communicate trade-offs transparently.",
            suggestedOpener: "I've found that conflicting priorities usually stem from [root cause]. My approach is to [your framework], which has consistently [outcome]…",
            framework: { name: "Direct Pitch", description: "Afirmación → Evidencia → Impacto: abre con tu conclusión o método principal, respáldalo con un ejemplo concreto y cierra con el resultado." },
            keyPhrases: [
                { phrase: "I use a value-impact matrix to align stakeholders", color: "#E1D5F8", tooltip: "Muestra pensamiento estructurado" },
                { phrase: "ensuring transparency while maintaining momentum", color: "#D9ECF0", tooltip: "Balancea múltiples preocupaciones" },
                { phrase: "I schedule brief alignment syncs before escalation", color: "#D9ECF0", tooltip: "Proactividad en resolución de conflictos" },
                { phrase: "which cut priority disputes by 60% last quarter", color: "#FFE9C7", tooltip: "Dato concreto de mejora" },
            ],
            pivot: "If pressed on a specific conflict, share the outcome and what you learned.",
        },
        {
            id: 4,
            question: "Can you walk me through a situation where you had to quickly adapt to a major change in project scope or technology?",
            why: "Evaluates agility and resilience — critical in fast-paced nearshoring environments where client priorities shift frequently.",
            approach: "Use a concrete example. Show the before/after: what changed, how you adapted, and the positive outcome.",
            suggestedOpener: "Midway through [project name], we learned that [what changed]. Within [timeframe], I [first action you took to adapt]…",
            framework: { name: "STAR", description: "Situación → Tarea → Acción → Resultado: narra primero el contexto, luego tu responsabilidad específica, qué hiciste concretamente y el resultado medible." },
            keyPhrases: [
                { phrase: "I pivoted the team's approach within 48 hours by...", color: "#E1D5F8", tooltip: "Demuestra velocidad de reacción y liderazgo" },
                { phrase: "which ultimately delivered 20% more value than the original plan", color: "#FFE9C7", tooltip: "Convierte un problema en resultado positivo" },
                { phrase: "I ran a rapid spike to de-risk the new technology choice", color: "#D9ECF0", tooltip: "Método técnico para reducir incertidumbre" },
                { phrase: "The team shipped on the original deadline despite the pivot", color: "#FFE9C7", tooltip: "Demuestra resiliencia y compromiso" },
            ],
            pivot: "If they ask about failures during the transition, acknowledge the learning and pivot to the final result.",
        },
        {
            id: 5,
            question: "Where do you see yourself contributing the most in the first 90 days?",
            why: "Tests strategic thinking and self-awareness — they want to know you've researched the role and have a realistic onboarding plan.",
            approach: "Structure your answer in 30-60-90 day phases. Show you understand the role's priorities and how you'll create early wins.",
            suggestedOpener: "In the first 30 days, my priority would be [learning focus]. By day 60, I'd aim to [early contribution]. And by 90 days, [measurable impact]…",
            framework: { name: "30-60-90", description: "30 días (aprender) → 60 días (contribuir) → 90 días (impactar): estructura tu plan en tres fases que van de escuchar y entender a entregar resultados concretos." },
            keyPhrases: [
                { phrase: "In the first 30 days, I'd focus on understanding the team dynamics and current architecture", color: "#E1D5F8", tooltip: "Muestra humildad y enfoque en aprendizaje" },
                { phrase: "By day 90, I aim to have delivered at least one measurable improvement to the delivery pipeline", color: "#FFE9C7", tooltip: "Compromiso concreto con resultados" },
                { phrase: "I'd identify quick wins in the first two weeks to build trust", color: "#D9ECF0", tooltip: "Estrategia para generar credibilidad rápida" },
                { phrase: "I'll set up weekly 1:1s with key stakeholders from day one", color: "#D9ECF0", tooltip: "Proactividad en construir relaciones" },
            ],
            pivot: "If they challenge the timeline, show flexibility while maintaining commitment to early impact.",
        },
    ],
    questionsToAsk: [
        { question: "How does the team balance velocity with technical debt in the current sprint cycle?", why: "Shows you think about sustainable engineering practices, not just shipping features." },
        { question: "What does success look like for this role in the first 90 days?", why: "Demonstrates you're already thinking about delivering value quickly." },
    ],
    culturalTips: [
        { title: "Lead with data, not opinions", description: "US hiring managers expect evidence-based arguments. Quantify every achievement.", type: "do" as const },
        { title: "Avoid overly formal language", description: "While respectful, US interviews tend to be more conversational than LATAM ones. Match their energy.", type: "do" as const },
        { title: "Don't undersell yourself", description: "LATAM professionals often use modest language. In US interviews, own your achievements confidently.", type: "avoid" as const },
    ],
};

/** Mock user drafts for "Your Response" tab — keyed by question id */
export const MOCK_USER_DRAFTS: Record<number, string> = {
    1: "In my previous role as Engineering Lead at a fintech startup, we had 6 weeks to migrate our entire payment platform to a new provider. I spearheaded the initiative by breaking it into 3 parallel workstreams and coordinating daily stand-ups across São Paulo and Mexico City. This resulted in a 30% reduction in delivery time versus the original estimate, and the client renewed their contract based on our track record.",
    2: "When I joined the distributed team at my last company, communication across 3 offices in different timezones was a real challenge. I established a bilingual documentation framework and introduced async video updates to bridge the timezone gap. This reduced miscommunication incidents from weekly occurrences to near-zero within two months, which improved cross-team alignment by 45%.",
    3: "I've found that conflicting priorities usually stem from misaligned success metrics. My approach is to use a value-impact matrix to align stakeholders, ensuring transparency while maintaining momentum. I schedule brief alignment syncs before escalation, which cut priority disputes by 60% last quarter while keeping all projects on track.",
    4: "Midway through our biggest client project, we learned that the core API we depended on was being deprecated in 30 days. Within 48 hours, I pivoted the team's approach by running a rapid spike to de-risk the new technology choice. The team shipped on the original deadline despite the pivot, which ultimately delivered 20% more value than the original plan because the new stack was more performant.",
    5: "In the first 30 days, my priority would be understanding the team dynamics and current architecture through 1:1s with every team member. By day 60, I'd aim to have identified and started executing on quick wins in the delivery pipeline. By day 90, I aim to have delivered at least one measurable improvement — like reducing deployment time or improving test coverage — to build trust and demonstrate impact.",
};

export const MOCK_PRACTICE_HISTORY: PracticeHistoryItem[] = [
    {
        title: "Technical Interview: Senior Frontend Developer at Toptal",
        date: "Mar 12, 2026",
        duration: "12 min",
        tag: "Interview",
        beforeAfterHighlight: {
            userOriginal: "I have experience with React and I know how to make components.",
            professionalVersion: "I architect scalable React applications using component-driven development, with expertise in performance optimization and state management patterns.",
            technique: "Technical specificity",
        },
    },
    {
        title: "Sales Pitch: Enterprise SaaS for Mexican Mid-Market",
        date: "Mar 11, 2026",
        duration: "9 min",
        tag: "Sales",
        beforeAfterHighlight: {
            userOriginal: "Our product helps companies save money and be more efficient.",
            professionalVersion: "Our platform delivers an average 35% reduction in operational costs through automated workflow optimization and predictive resource allocation.",
            technique: "Quantified value proposition",
        },
    },
    {
        title: "Behavioral Interview: Product Manager at VTEX",
        date: "Mar 10, 2026",
        duration: "11 min",
        tag: "Interview",
    },
    {
        title: "Sales Pitch: Fintech Payment Solution for Colombia",
        date: "Mar 8, 2026",
        duration: "8 min",
        tag: "Sales",
    },
];

/* ── Mock Feedback Object (reusable) ── */

export interface DevMockData {
    feedback: {
        strengths: Strength[];
        opportunities: Opportunity[];
        beforeAfter: BeforeAfterComparison[];
        pillarScores: Record<string, number>;
        professionalProficiency: number;
        contentScores?: Record<string, number>;
        interviewReadinessScore?: number;
        contentInsights?: ContentInsight[];
    };
    summary: SessionSummary;
    pronData: TurnPronunciationData[];
    script: ScriptSection[];
    interviewBriefing: InterviewBriefingData;
    practiceHistory: PracticeHistoryItem[];
}

export function getDevMockData(isInterview: boolean): DevMockData {
    return {
        feedback: {
            strengths: MOCK_STRENGTHS,
            opportunities: MOCK_OPPORTUNITIES,
            beforeAfter: MOCK_BEFORE_AFTER,
            pillarScores: MOCK_PILLAR_SCORES,
            professionalProficiency: 74,
            ...(isInterview
                ? {
                    contentScores: MOCK_CONTENT_SCORES,
                    interviewReadinessScore: MOCK_INTERVIEW_READINESS_SCORE,
                    contentInsights: MOCK_CONTENT_INSIGHTS,
                }
                : {
                    languageInsights: MOCK_LANGUAGE_INSIGHTS,
                }),
        },
        summary: MOCK_SESSION_SUMMARY,
        pronData: MOCK_PRON_DATA,
        script: MOCK_SCRIPT_SECTIONS,
        interviewBriefing: MOCK_INTERVIEW_BRIEFING,
        practiceHistory: MOCK_PRACTICE_HISTORY,
    };
}

/* ═══════════════════════════════════════════════════════════
   DEV PREVIEW MENU COMPONENT
   ═══════════════════════════════════════════════════════════ */

export interface DevPreviewOption {
    id: string;
    label: string;
    group: string;
    icon?: string;
}

const DEV_OPTIONS: DevPreviewOption[] = [
    // Pages
    { id: "landing", label: "Landing Page", group: "Pages", icon: "🏠" },
    { id: "dashboard", label: "Dashboard", group: "Pages", icon: "📊" },
    { id: "practice-history", label: "Practice History", group: "Pages", icon: "📋" },
    // Practice Session Steps
    { id: "ps:extra-context-interview", label: "Extra Context", group: "Practice (Interview)", icon: "📝" },
    { id: "ps:generating-script", label: "Generating Script", group: "Practice (Interview)", icon: "⏳" },
    { id: "ps:pre-briefing-interview", label: "Pre-Briefing (Interview Cards)", group: "Practice (Interview)", icon: "🎯" },
    { id: "ps:pre-briefing-sales", label: "Pre-Briefing (Sales Script)", group: "Practice (Sales)", icon: "📄" },
    { id: "ps:conversation-feedback-interview", label: "Feedback (Interview Dual-Axis)", group: "Practice (Interview)", icon: "🔍" },
    { id: "ps:conversation-feedback-sales", label: "Feedback (Sales)", group: "Practice (Sales)", icon: "🔍" },
    { id: "ps:session-recap-interview", label: "Session Recap (Interview)", group: "Practice (Interview)", icon: "📈" },
    { id: "ps:session-recap-sales", label: "Session Recap (Sales)", group: "Practice (Sales)", icon: "📈" },
    // Tools
    { id: "tool:download-pdf-interview", label: "Download PDF (Interview Mock)", group: "Tools", icon: "📥" },
    { id: "tool:download-pdf-sales", label: "Download PDF (Sales Mock)", group: "Tools", icon: "📥" },
];

interface DevPreviewMenuProps {
    onNavigate: (optionId: string) => void;
}

export function DevPreviewMenu({ onNavigate }: DevPreviewMenuProps) {
    const [open, setOpen] = useState(false);
    const [pdfGenerating, setPdfGenerating] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        if (open) document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [open]);

    // Close on Escape
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpen(false);
        };
        if (open) document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, [open]);

    // Group options
    const groups = DEV_OPTIONS.reduce<Record<string, DevPreviewOption[]>>((acc, opt) => {
        if (!acc[opt.group]) acc[opt.group] = [];
        acc[opt.group].push(opt);
        return acc;
    }, {});

    /** Handle tool actions locally (PDF download) without navigating */
    const handleOptionClick = (optId: string) => {
        if (optId.startsWith("tool:download-pdf")) {
            const isInterview = optId.includes("interview");
            const mockData = getDevMockData(isInterview);
            setPdfGenerating(true);
            downloadSessionReportPdf({
                briefing: isInterview ? mockData.interviewBriefing : null,
                interlocutor: isInterview ? "recruiter" : "decision_maker",
                scenario: isInterview
                    ? "Technical Interview: Senior Frontend Developer at Toptal"
                    : "Sales pitch: Producto B2B SaaS para LATAM",
                scenarioType: isInterview ? "interview" : "sales",
                feedback: {
                    strengths: mockData.feedback.strengths,
                    opportunities: mockData.feedback.opportunities,
                    beforeAfter: mockData.feedback.beforeAfter,
                    pillarScores: mockData.feedback.pillarScores,
                    professionalProficiency: mockData.feedback.professionalProficiency,
                    contentScores: mockData.feedback.contentScores,
                    interviewReadinessScore: mockData.feedback.interviewReadinessScore,
                    contentInsights: mockData.feedback.contentInsights,
                    languageInsights: (mockData.feedback as any).languageInsights,
                    preparationUtilization: isInterview ? {
                        score: 78,
                        verdict: "Strong preparation leverage",
                        insights: [
                            { aspect: "Key Phrases", observation: "Used 4 of 5 suggested key phrases naturally in conversation.", rating: "strong" as const },
                            { aspect: "STAR Framework", observation: "Applied STAR structure in 2 of 3 behavioral answers.", rating: "partial" as const },
                            { aspect: "Cultural Tips", observation: "Missed opportunity to quantify achievements in the closing.", rating: "missed" as const },
                        ],
                    } : null,
                },
                summary: {
                    overallSentiment: mockData.summary.overallSentiment,
                    nextSteps: mockData.summary.nextSteps.map(s => `${s.title}: ${s.desc}`),
                    sessionHighlight: mockData.summary.sessionHighlight,
                },
                sessionDuration: "8 min",
                userDrafts: isInterview ? MOCK_USER_DRAFTS : undefined,
                pronunciationData: mockData.pronData.length > 0 ? mockData.pronData : undefined,
            })
                .then(() => setPdfGenerating(false))
                .catch((err) => {
                    console.error("[DevPreviewMenu] Mock PDF generation failed:", err);
                    setPdfGenerating(false);
                });
            setOpen(false);
            return;
        }
        onNavigate(optId);
        setOpen(false);
    };

    return (
        <div ref={menuRef} className="fixed top-3 right-3 z-[9999]" style={{ fontFamily: "'Inter', sans-serif" }}>
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs shadow-lg border transition-all"
                style={{
                    fontWeight: 600,
                    background: open ? "#0f172b" : "rgba(15, 23, 43, 0.9)",
                    color: "#fff",
                    borderColor: "rgba(255,255,255,0.15)",
                    backdropFilter: "blur(12px)",
                }}
            >
                <Wrench className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Dev Preview</span>
                <ChevronDown
                    className="w-3 h-3 transition-transform"
                    style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
                />
            </button>

            {open && (
                <div
                    className="absolute top-full right-0 mt-2 w-72 rounded-2xl shadow-2xl border overflow-hidden"
                    style={{
                        background: "rgba(255,255,255,0.97)",
                        borderColor: "#e2e8f0",
                        backdropFilter: "blur(20px)",
                    }}
                >
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-[#f1f5f9] flex items-center gap-2">
                        <MonitorPlay className="w-4 h-4 text-[#6366f1]" />
                        <span className="text-xs text-[#0f172b]" style={{ fontWeight: 700 }}>
                            UI Preview Mode
                        </span>
                        <span className="ml-auto text-[10px] text-[#94a3b8] bg-[#f1f5f9] px-2 py-0.5 rounded-full" style={{ fontWeight: 500 }}>
                            Mock Data
                        </span>
                    </div>

                    {/* Options */}
                    <div className="max-h-[60vh] overflow-y-auto py-1">
                        {Object.entries(groups).map(([group, opts]) => (
                            <div key={group}>
                                <div
                                    className="px-4 py-2 text-[10px] uppercase tracking-wider text-[#94a3b8]"
                                    style={{ fontWeight: 700 }}
                                >
                                    {group}
                                </div>
                                {opts.map((opt) => (
                                    <button
                                        key={opt.id}
                                        className="w-full text-left px-4 py-2.5 flex items-center gap-3 hover:bg-[#f8fafc] transition-colors group"
                                        onClick={() => handleOptionClick(opt.id)}
                                        disabled={pdfGenerating && opt.id.startsWith("tool:")}
                                    >
                                        <span className="text-sm">{opt.icon}</span>
                                        <span
                                            className="text-xs text-[#334155] group-hover:text-[#0f172b] transition-colors"
                                            style={{ fontWeight: 500 }}
                                        >
                                            {pdfGenerating && opt.id.startsWith("tool:") ? "Generating..." : opt.label}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        ))}
                    </div>

                    {/* Footer */}
                    <div className="px-4 py-2.5 border-t border-[#f1f5f9] bg-[#f8fafc]">
                        <p className="text-[10px] text-[#94a3b8]" style={{ fontWeight: 400 }}>
                            Navega directo a cualquier estado con datos mock. No requiere login ni pipeline real.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}