import { useState } from "react";
import {
    FileText,
    TrendingUp,
    Lightbulb,
    Check,
    PenLine,
    Mic,
    Play,
    ArrowRight,
} from "lucide-react";
import { motion } from "motion/react";
import {
    COLORS,
    PastelBlobs,
    MiniFooter,
    PageTitleBlock,
    HighlightWithTooltip,
} from "../shared";
import { getScriptSectionsForScenario } from "../../../services/scenario-data";
import type { ScenarioType } from "../../../services/types";
import type { ValuePillar } from "../StrategyBuilder";

export function PreBriefingScreen({
    scenarioType,
    interlocutor,
    strategyPillars,
    onStartSimulation,
    onBack,
}: {
    scenarioType?: ScenarioType;
    interlocutor: string;
    strategyPillars?: ValuePillar[];
    onStartSimulation: () => void;
    onBack: () => void;
}) {
    const scriptSections = getScriptSectionsForScenario(scenarioType);
    const [isEditing, setIsEditing] = useState(false);

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

                {/* Strategy Pillars Summary */}
                {strategyPillars && strategyPillars.length > 0 && (
                    <motion.div
                        className="bg-gradient-to-r from-[#f0f9ff] to-[#eef2ff] rounded-2xl border border-[#bfdbfe]/40 p-6 mb-8"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.04 }}
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <Lightbulb className="w-5 h-5 text-[#6366f1]" />
                            <h3 className="text-[#0f172b]" style={{ fontWeight: 600 }}>
                                Your value strategy
                            </h3>
                        </div>
                        <div className="space-y-2">
                            {strategyPillars.map((p, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-start gap-3 text-sm text-[#314158]"
                                >
                                    <span className="w-5 h-5 rounded-full bg-[#6366f1] text-white flex items-center justify-center shrink-0 text-[10px]" style={{ fontWeight: 700 }}>
                                        {idx + 1}
                                    </span>
                                    <p className="leading-relaxed">{p.summary}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

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
                            className="bg-[#0f172b] text-white px-10 py-5 rounded-full flex items-center gap-3 shadow-lg hover:bg-[#1d293d] transition-colors text-xl mx-auto"
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
                            ← Back to strategy
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
        </div>
    );
}
