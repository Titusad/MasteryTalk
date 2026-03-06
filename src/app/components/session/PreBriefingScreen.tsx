import { useState, useEffect } from "react";
import {
    FileText,
    TrendingUp,
    Check,
    PenLine,
    Mic,
    Play,
    ArrowRight,
    Loader2
} from "lucide-react";
import { motion } from "motion/react";
import {
    COLORS,
    PastelBlobs,
    MiniFooter,
    PageTitleBlock,
    HighlightWithTooltip,
} from "../shared";
import type { ScenarioType, ScriptSection } from "../../../services/types";

import { conversationService } from "../../../services";

export function PreBriefingScreen({
    scenarioType,
    scenario,
    interlocutor,

    extraContext,
    onStartSimulation,
    onBack,
}: {
    scenarioType?: ScenarioType;
    scenario: string;
    interlocutor: string;

    extraContext?: string;
    onStartSimulation: () => void;
    onBack: () => void;
}) {
    const [scriptSections, setScriptSections] = useState<ScriptSection[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        let cancelled = false;
        setIsLoading(true);

        if (!scenarioType || !scenario || !interlocutor) {
            setError("Missing required scenario information to generate script.");
            setIsLoading(false);
            return;
        }

        conversationService.generatePreBriefing({
            scenarioType,
            scenario,
            interlocutor,
            extraContext
        })
            .then(data => {
                if (!cancelled) {
                    setScriptSections(data.sections);
                    setIsLoading(false);
                }
            })
            .catch(err => {
                if (!cancelled) {
                    console.error("Failed to generate pre-briefing script:", err);
                    setError(`Error: ${err.message || 'Unknown error'}. You can still practice using your strategy pillars.`);
                    setIsLoading(false);
                }
            });

        return () => { cancelled = true; };
    }, [scenarioType, scenario, interlocutor, extraContext]);


    const narrativeLabels: Record<string, string> = {
        sales: "Opening → Objection handling → Close with value",
        interview: "Personal pitch → STAR Story → Strategic close",
        csuite: "Executive summary → Data-backed support → Call to decision",
        negotiation: "Position → Counter-offer → Conditional close",
        networking: "Elevator pitch → Value exchange → Follow-up hook",
    };
    const narrativeStructure = scenarioType
        ? narrativeLabels[scenarioType] ?? "Apertura → Desarrollo → Cierre"
        : "Apertura → Desarrollo → Cierre";

    return (
        <div
            className="w-full min-h-full flex flex-col bg-[#f0f4f8] relative overflow-hidden"
            style={{ fontFamily: "'Inter', sans-serif" }}
        >
            <PastelBlobs />

            <main className="relative w-full max-w-[800px] mx-auto px-6 pt-12 pb-20">
                <PageTitleBlock
                    icon={<FileText className="w-8 h-8 text-white" />}
                    title="Your Conversation Script"
                    subtitle="A structured script gives you clarity and confidence — turn your ideas into a persuasive and natural message."
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
                        <p className="text-sm text-[#45556c]" style={{ fontWeight: 500 }}>Narrative structure</p>
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

                {/* 3. Script Loading & Content */}
                {isLoading ? (
                    <motion.div
                        className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl shadow-sm border border-[#e2e8f0] mb-8"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <Loader2 className="w-8 h-8 mb-4 animate-spin text-[#0f172b]" />
                        <p className="text-[#62748e]" style={{ fontWeight: 500 }}>
                            Crafting your personalized conversation script...
                        </p>
                    </motion.div>
                ) : error ? (
                    <motion.div
                        className="p-6 bg-red-50 text-red-600 rounded-3xl text-center mb-8"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <p>{error}</p>
                    </motion.div>
                ) : scriptSections.length > 0 ? (
                    <motion.div
                        className="bg-white rounded-3xl border border-[#e2e8f0] p-8 mb-8 space-y-10 relative"
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.08 }}
                    >
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
                                            {p.text}
                                            {p.highlights?.map((h, hi) => (
                                                <HighlightWithTooltip
                                                    key={hi}
                                                    phrase={h.phrase}
                                                    color={h.color || COLORS.blue}
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
                ) : null}

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
                            Want to practice your conversation?
                        </h3>
                        <p className="text-[#45556c] text-lg max-w-md mx-auto mb-8">
                            Put this script into practice in a realistic AI conversation to get feedback.
                        </p>
                        <button
                            onClick={onStartSimulation}
                            disabled={isLoading}
                            className="bg-[#0f172b] text-white px-10 py-5 rounded-full flex items-center gap-3 shadow-lg hover:bg-[#1d293d] transition-colors text-xl mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ fontWeight: 500 }}
                        >
                            <Play className="w-5 h-5" />
                            Start Practice
                            <ArrowRight className="w-5 h-5" />
                        </button>
                        <button
                            onClick={onBack}
                            className="mt-4 text-sm text-[#45556c] hover:text-[#0f172b] transition-colors mx-auto block"
                        >
                            ← Back to context
                        </button>
                    </div>
                    {!isLoading && scriptSections.length > 0 && (
                        <p className="text-sm text-[#45556c]/70">
                            Estimated reading time:{" "}
                            <span style={{ fontWeight: 500 }}>
                                {Math.max(2, Math.ceil(scriptSections.reduce((acc, s) => acc + s.paragraphs.length, 0) * 0.8))} min
                            </span>
                        </p>
                    )}
                </motion.div>
            </main>
            <MiniFooter />
        </div>
    );
}
