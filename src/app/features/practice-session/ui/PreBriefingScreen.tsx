import { useState, useMemo } from "react";
import {
    FileText,
    Play,
    TrendingUp,
    Check,
    PenLine,
    Mic,
    ArrowRight,
    Sparkles,
    HelpCircle,
    Globe,
    Zap,
    Headphones,
    RotateCcw,
} from "lucide-react";
import { motion } from "motion/react";
import {
    COLORS,
    PastelBlobs,
    MiniFooter,
    HighlightWithTooltip,
    PageTitleBlock,
} from "@/app/components/shared";
import type { ScenarioType, ScriptSection } from "@/services/types";
import { SessionProgressBar } from "@/widgets/SessionProgressBar";
import { ShadowingModal } from "@/app/features/practice-session/ui/ShadowingModal";
import type { ShadowingPhrase } from "@/app/features/shadowing/model/shadowing.computations";

/* ── Coaching Cue Formatter ──
   Detects coaching directives at the start of paragraph text
   and wraps them in indigo semibold for visual hierarchy. */
const COACHING_CUE_PATTERN = /^(Here's how you[^.:\n]*[:.:]|You'll want to[^.:\n]*[:.:]|Start by[^.:\n]*[:.:]|Lead with[^.:\n]*[:.:]|Open with[^.:\n]*[:.:]|Make sure to[^.:\n]*[:.:]|Try saying[^.:\n]*[:.:]|Your goal here is[^.:\n]*[:.:]|When they[^.:\n]*[:.:]|If they[^.:\n]*[:.:]|Pivot (?:to|by)[^.:\n]*[:.:]|Close by[^.:\n]*[:.:]|Wrap up by[^.:\n]*[:.:]|End with[^.:\n]*[:.:]|This positions you[^.:\n]*[:.:]|This is where you[^.:\n]*[:.:]|Now,?\s+(?:transition|shift|pivot|move)[^.:\n]*[:.:])/i;

function formatCoachingCues(text: string): React.ReactNode {
    const match = text.match(COACHING_CUE_PATTERN);
    if (!match) return text;
    const cue = match[0];
    const rest = text.slice(cue.length);
    return (
        <>
            <span className="text-[#6366f1]" style={{ fontWeight: 600 }}>{cue}</span>
            {rest}
        </>
    );
}



/* ═══════════════════════════════════════════════════════════
   PRE-BRIEFING: Narrative script / conversation strategy
   ═══════════════════════════════════════════════════════════ */

function PreBriefingScreen({
    scenarioType,
    interlocutor,
    onStartSimulation,
    onBack,
    generatedSections,
    preparationToolkit,
}: {
    scenarioType?: ScenarioType;
    interlocutor: string;
    onStartSimulation: () => void;
    onBack: () => void;
    generatedSections: ScriptSection[];
    preparationToolkit?: {
        powerPhrases: Array<{ id: string; phrase: string; context: string; category: string }>;
        powerQuestions: Array<{ question: string; rationale: string; timing: string }>;
        culturalTips: Array<{ title: string; description: string; type: "do" | "avoid" }>;
    } | null;
}) {
    /* Always use AI-generated sections — no mock fallback */
    const scriptSections = generatedSections;

    /* Shadowing for Power Phrases */
    const [activePhraseIdx, setActivePhraseIdx] = useState<number | null>(null);
    const [practicedPhrases, setPracticedPhrases] = useState<Set<number>>(new Set());

    const activeShadowingPhrases = useMemo((): ShadowingPhrase[] => {
        if (activePhraseIdx === null || !preparationToolkit) return [];
        const pp = preparationToolkit.powerPhrases[activePhraseIdx];
        if (!pp) return [];
        return [{
            id: `pp-${activePhraseIdx}`,
            sentence: pp.phrase,
            focusWord: pp.phrase.split(" ")[0],
            ipa: "",
            originalScore: 0,
            problemWords: [],
            turnIndex: 0,
        }];
    }, [activePhraseIdx, preparationToolkit]);
    const [isEditing, setIsEditing] = useState(false);



    /* Narrative structure label per scenario */
    const narrativeLabels: Record<string, string> = {
        sales: "Opening → Objection handling → Close with value",
        interview: "Personal pitch → STAR Story → Strategic close",
        csuite: "Executive summary → Data-backed support → Call to decision",
        negotiation: "Position → Counter-offer → Conditional close",
        networking: "Elevator pitch → Value exchange → Follow-up hook",
        meeting: "Status update → Strategic contribution → Aligned close",
        presentation: "Hook → Structured argument → Call to action",
        client: "Expectation alignment → Value delivery → Next steps",
    };
    const narrativeStructure = scenarioType
        ? narrativeLabels[scenarioType] ?? "Opening → Development → Close"
        : "Opening → Development → Close";

    return (
        <div
            className="w-full min-h-full flex flex-col bg-[#f0f4f8] relative overflow-hidden"
            style={{ fontFamily: "'Inter', sans-serif" }}
        >
            <PastelBlobs />

            <main className="relative w-full max-w-[800px] mx-auto px-6 pt-6 pb-20">
                <div className="w-full mb-5">
                    <SessionProgressBar currentStep="pre-briefing" />
                </div>
                {/* Title */}
                <PageTitleBlock
                    title="Your Game Plan"
                    subtitle="Here's the strategy I've built for you. Read it, own it — then we'll put it to the test."
                />

                {/* 1. Narrative Structure Badge */}
                <motion.div
                    className="flex items-center gap-3 mb-8"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.03 }}
                >
                    <div className="w-8 h-8 rounded-xl bg-[#0f172b] flex items-center justify-center">
                        <TrendingUp className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <p className="text-sm text-[#45556c]" style={{ fontWeight: 500 }}>Your play-by-play</p>
                        <p className="text-sm text-[#0f172b]" style={{ fontWeight: 600 }}>
                            {narrativeStructure}
                        </p>
                    </div>
                </motion.div>

                {/* 2. Highlight Legend */}
                <motion.div
                    className="flex items-center gap-4 mb-8 flex-wrap"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.05 }}
                >
                    {[
                        { color: COLORS.softPurple, label: "Structure" },
                        { color: COLORS.peach, label: "Impact" },
                        { color: COLORS.blue, label: "Engagement" },
                    ].map((item, i) => (
                        <div key={i} className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: item.color }} />
                            <span className="text-sm text-[#45556c]" style={{ fontWeight: 500 }}>{item.label}</span>
                        </div>
                    ))}
                    <span className="text-sm text-[#62748e] italic">— Hover over text for tips</span>
                </motion.div>



                {/* 3. Script Sections */}
                <motion.div
                    className="bg-white rounded-3xl border border-[#e2e8f0] p-8 mb-8 space-y-10 relative"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.08 }}
                >
                    {/* Edit toggle */}
                    <button
                        onClick={() => setIsEditing(!isEditing)}
                        className={`absolute -top-4 right-6 z-10 flex items-center gap-2 px-4 py-1.5 rounded-full text-sm shadow-sm transition-all ${isEditing
                            ? "bg-[#dcfce7] text-[#15803d] border border-[#bbf7d0]"
                            : "bg-white border border-[#e2e8f0] text-[#45556c] hover:bg-[#f8fafc]"
                            }`}
                        style={{ fontWeight: 500 }}
                    >
                        {isEditing ? (
                            <>
                                <Check className="w-3.5 h-3.5" />
                                Save changes
                            </>
                        ) : (
                            <>
                                <PenLine className="w-3.5 h-3.5" />
                                Edit script
                            </>
                        )}
                    </button>

                    {scriptSections.map((section, si) => (
                        <motion.div
                            key={section.num}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.15 + si * 0.1, ease: [0.22, 1, 0.36, 1] }}
                            className="border-l-[3px] border-l-transparent pl-5"
                        >
                            <div className="flex items-center gap-3 mb-5">
                                <span
                                    className="w-8 h-8 rounded-xl bg-[#6366f1]/10 flex items-center justify-center text-sm text-[#6366f1]"
                                    style={{ fontWeight: 700 }}
                                >
                                    {section.num}
                                </span>
                                <h3
                                    className="text-xl text-[#0f172b]"
                                    style={{ fontWeight: 600 }}
                                >
                                    {section.title}
                                </h3>
                            </div>
                            <div className="space-y-4">
                                {section.paragraphs.map((p, pi) => (
                                    <p
                                        key={pi}
                                        className={`text-[#314158] leading-relaxed ${isEditing
                                            ? "bg-[#f8fafc] rounded-xl px-4 py-3 border border-[#e2e8f0] focus:outline-none focus:border-[#6366f1] transition-colors"
                                            : ""
                                            }`}
                                        contentEditable={isEditing}
                                        suppressContentEditableWarning
                                    >
                                        {formatCoachingCues(p.text)}
                                        {p.highlights?.map((h, hi) => (
                                            <HighlightWithTooltip
                                                key={hi}
                                                phrase={h.phrase}
                                                color={h.color}
                                                tooltip={h.tooltip}
                                            />
                                        ))}
                                        {p.suffix}
                                    </p>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* ═══════════════════════════════════════════════
           PREPARATION TOOLKIT — AI-generated, contextual
           Power Phrases + Power Questions + Cultural Intelligence
           ═══════════════════════════════════════════════ */}
                {preparationToolkit ? (
                    <motion.div
                        className="space-y-6 mb-10"
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.12 }}
                    >
                        {/* Section header */}
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6366f1] to-[#818cf8] flex items-center justify-center">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl text-[#0f172b]" style={{ fontWeight: 600 }}>
                                    Your Preparation Toolkit
                                </h2>
                                <p className="text-sm text-[#45556c]">
                                    AI-generated resources tailored to your scenario
                                </p>
                            </div>
                            <span className="ml-auto text-[10px] bg-[#6366f1]/10 text-[#6366f1] px-2.5 py-1 rounded-full" style={{ fontWeight: 600 }}>
                                AI-Personalized
                            </span>
                        </div>

                        {/* Power Phrases */}
                        {preparationToolkit.powerPhrases.length > 0 && (
                            <motion.div
                                className="bg-gradient-to-br from-[#0f172b] to-[#1e293b] rounded-3xl p-6 md:p-8"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: 0.15 }}
                            >
                                <div className="flex items-center gap-2 mb-5">
                                    <Zap className="w-4 h-4 text-[#fbbf24]" />
                                    <p className="text-sm text-white/80" style={{ fontWeight: 600 }}>Power Phrases</p>
                                    <span className="text-[10px] bg-white/10 text-white/50 px-2 py-0.5 rounded-full ml-auto">
                                        {preparationToolkit.powerPhrases.length} phrases
                                    </span>
                                </div>
                                <div className="space-y-2.5">
                                    {preparationToolkit.powerPhrases.map((p, i) => {
                                        const practiced = practicedPhrases.has(i);
                                        return (
                                            <motion.div
                                                key={p.id || i}
                                                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3"
                                                initial={{ opacity: 0, x: -8 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.2 + i * 0.04 }}
                                            >
                                                <p className="text-white text-sm" style={{ fontWeight: 500 }}>
                                                    "{p.phrase}"
                                                </p>
                                                <div className="flex items-center gap-2 mt-1.5">
                                                    <span className="text-[10px] bg-[#fbbf24]/20 text-[#fbbf24] px-2 py-0.5 rounded-full" style={{ fontWeight: 500 }}>
                                                        {p.category}
                                                    </span>
                                                    <p className="text-white/40 text-xs flex-1">{p.context}</p>
                                                    {practiced ? (
                                                        <div className="flex items-center gap-1.5 shrink-0">
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 text-[10px] text-emerald-400" style={{ fontWeight: 500 }}>
                                                                <Check className="w-2.5 h-2.5" /> Done
                                                            </span>
                                                            <button
                                                                onClick={() => setActivePhraseIdx(i)}
                                                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] border border-white/20 text-white/60 hover:bg-white/10 transition-all"
                                                                style={{ fontWeight: 500 }}
                                                            >
                                                                <RotateCcw className="w-2.5 h-2.5" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => setActivePhraseIdx(i)}
                                                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] bg-white/10 text-white/80 hover:bg-white/20 transition-all shrink-0"
                                                            style={{ fontWeight: 500 }}
                                                        >
                                                            <Headphones className="w-2.5 h-2.5" />
                                                            Practice
                                                        </button>
                                                    )}
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        )}

                        {/* Power Questions */}
                        {preparationToolkit.powerQuestions.length > 0 && (
                            <motion.div
                                className="bg-white rounded-3xl border border-[#e2e8f0] p-6 md:p-8"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: 0.2 }}
                            >
                                <div className="flex items-center gap-2 mb-5">
                                    <HelpCircle className="w-4 h-4 text-[#6366f1]" />
                                    <p className="text-sm text-[#0f172b]" style={{ fontWeight: 600 }}>Power Questions</p>
                                    <p className="text-xs text-[#62748e] ml-1">Strategic questions to ask your counterpart</p>
                                </div>
                                <div className="space-y-3">
                                    {preparationToolkit.powerQuestions.map((q, i) => (
                                        <motion.div
                                            key={i}
                                            className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-5 py-4"
                                            initial={{ opacity: 0, x: -8 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.25 + i * 0.05 }}
                                        >
                                            <p className="text-[#0f172b] text-sm" style={{ fontWeight: 500 }}>
                                                "{q.question}"
                                            </p>
                                            <p className="text-xs text-[#45556c] mt-1.5 leading-relaxed">
                                                {q.rationale}
                                            </p>
                                            <div className="flex items-center gap-1.5 mt-2">
                                                <span className="text-[10px] bg-[#6366f1]/10 text-[#6366f1] px-2 py-0.5 rounded-full" style={{ fontWeight: 500 }}>
                                                    {q.timing}
                                                </span>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* Cultural Intelligence */}
                        {preparationToolkit.culturalTips.length > 0 && (
                            <motion.div
                                className="bg-white rounded-3xl border border-[#e2e8f0] p-6 md:p-8"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: 0.25 }}
                            >
                                <div className="flex items-center gap-2 mb-5">
                                    <Globe className="w-4 h-4 text-[#50C878]" />
                                    <p className="text-sm text-[#0f172b]" style={{ fontWeight: 600 }}>Cultural Intelligence</p>
                                    <span className="text-[10px] bg-[#50C878]/15 text-[#16a34a] px-2.5 py-0.5 rounded-full" style={{ fontWeight: 600 }}>
                                        LATAM → US
                                    </span>
                                </div>
                                <div className="space-y-2.5">
                                    {preparationToolkit.culturalTips
                                        .filter((t) => t.type === "do")
                                        .map((tip, i) => (
                                            <div
                                                key={`do-${i}`}
                                                className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl px-5 py-4 flex items-start gap-3"
                                            >
                                                <span
                                                    className="text-[10px] bg-[#16a34a]/15 text-[#16a34a] rounded-full px-2 py-0.5 shrink-0 mt-0.5"
                                                    style={{ fontWeight: 600 }}
                                                >
                                                    DO
                                                </span>
                                                <div>
                                                    <p className="text-sm text-[#0f172b]" style={{ fontWeight: 500 }}>
                                                        {tip.title}
                                                    </p>
                                                    <p className="text-xs text-[#45556c] mt-0.5">{tip.description}</p>
                                                </div>
                                            </div>
                                        ))}
                                    {preparationToolkit.culturalTips
                                        .filter((t) => t.type === "avoid")
                                        .map((tip, i) => (
                                            <div
                                                key={`avoid-${i}`}
                                                className="bg-[#fef2f2] border border-[#fecaca] rounded-xl px-5 py-4 flex items-start gap-3"
                                            >
                                                <span
                                                    className="text-[10px] bg-red-500/15 text-red-600 rounded-full px-2 py-0.5 shrink-0 mt-0.5"
                                                    style={{ fontWeight: 600 }}
                                                >
                                                    AVOID
                                                </span>
                                                <div>
                                                    <p className="text-sm text-[#0f172b]" style={{ fontWeight: 500 }}>
                                                        {tip.title}
                                                    </p>
                                                    <p className="text-xs text-[#45556c] mt-0.5">{tip.description}</p>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                ) : (
                    /* Skeleton loader while toolkit is loading */
                    <motion.div
                        className="mb-10"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3, delay: 0.15 }}
                    >
                        <div className="bg-white rounded-3xl border border-[#e2e8f0] p-6 md:p-8">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="w-10 h-10 rounded-xl bg-[#f1f5f9] animate-pulse" />
                                <div className="space-y-1.5">
                                    <div className="w-40 h-4 bg-[#f1f5f9] rounded animate-pulse" />
                                    <div className="w-56 h-3 bg-[#f1f5f9] rounded animate-pulse" />
                                </div>
                            </div>
                            <div className="space-y-3">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="bg-[#f8fafc] rounded-xl px-5 py-4 animate-pulse">
                                        <div className="w-3/4 h-4 bg-[#e2e8f0] rounded mb-2" />
                                        <div className="w-1/2 h-3 bg-[#e2e8f0] rounded" />
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs text-[#94a3b8] text-center mt-4">
                                Generating your personalized toolkit...
                            </p>
                        </div>
                    </motion.div>
                )}

                {/* CTA: Start Simulation */}
                <motion.div
                    className="text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                >
                    <div className="bg-gradient-to-br from-[#f0f9ff] to-[#eef2ff] rounded-3xl border border-[#bfdbfe]/50 p-10 mb-6">
                        <div className="w-16 h-16 rounded-2xl bg-[#0f172b] flex items-center justify-center mx-auto mb-6">
                            <Mic className="w-8 h-8 text-white" />
                        </div>
                        <h3
                            className="text-2xl md:text-[28px] text-[#0f172b] mb-3"
                            style={{ fontWeight: 300, lineHeight: 1.3 }}
                        >
                            Ready to put this to the test?
                        </h3>
                        <p className="text-[#45556c] text-lg max-w-md mx-auto mb-8">
                            I'm going to simulate a real conversation — you'll respond as if it's the real thing. Let's see what you've got.
                        </p>
                        <button
                            onClick={onStartSimulation}
                            className="bg-[#0f172b] text-white px-10 py-5 rounded-full flex items-center gap-3 shadow-lg hover:bg-[#1d293d] transition-colors text-xl mx-auto"
                            style={{ fontWeight: 500 }}
                        >
                            <Play className="w-5 h-5" />
                            Let's do this
                            <ArrowRight className="w-5 h-5" />
                        </button>
                        <button
                            onClick={onBack}
                            className="mt-4 text-sm text-[#45556c] hover:text-[#0f172b] transition-colors mx-auto block"
                        >
                            ← Back to game plan
                        </button>
                    </div>
                    <p className="text-sm text-[#45556c]/70">
                        Estimated reading time:{" "}
                        <span style={{ fontWeight: 500 }}>
                            {Math.max(2, Math.ceil(scriptSections.reduce((acc, s) => acc + s.paragraphs.length, 0) * 0.8))} min
                        </span>
                    </p>
                </motion.div>
            </main>
            <MiniFooter />

            {/* Shadowing Modal for Power Phrases */}
            {activePhraseIdx !== null && activeShadowingPhrases.length > 0 && (
                <ShadowingModal
                    phrases={activeShadowingPhrases}
                    scenarioLabel={preparationToolkit?.powerPhrases[activePhraseIdx]?.phrase.slice(0, 40) + "…"}
                    scenarioType={scenarioType}
                    onClose={() => {
                        setPracticedPhrases(prev => new Set([...prev, activePhraseIdx]));
                        setActivePhraseIdx(null);
                    }}
                />
            )}
        </div>
    );
}

export { PreBriefingScreen };
