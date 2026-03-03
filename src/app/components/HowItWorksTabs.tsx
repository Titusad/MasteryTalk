import { useState, useEffect, useRef, useCallback } from "react";
import { Target, MessageSquare, Mic, ArrowRight, User, Sparkles, CheckCircle2, Globe, FileText, BarChart3, Lightbulb, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useLandingCopy } from "./LandingLangContext";

/* ═══════════════════════ STEP DATA ═══════════════════════ */
/* Steps are now dynamic — see useSteps() below */
function useSteps() {
  const { copy } = useLandingCopy();
  const steps = copy.howItWorks.steps;
  return [
    { id: "strategy", num: "01", icon: <Target className="w-5 h-5" />, title: steps[0].title, desc: steps[0].desc, accent: "#FFE9C7", accentDark: "#f5d4a0" },
    { id: "script", num: "02", icon: <FileText className="w-5 h-5" />, title: steps[1].title, desc: steps[1].desc, accent: "#E8E0F5", accentDark: "#d4c8e8" },
    { id: "practice", num: "03", icon: <MessageSquare className="w-5 h-5" />, title: steps[2].title, desc: steps[2].desc, accent: "#D9ECF0", accentDark: "#b8dce4" },
    { id: "feedback", num: "04", icon: <BarChart3 className="w-5 h-5" />, title: steps[3].title, desc: steps[3].desc, accent: "#DBEDDF", accentDark: "#b8dcc0" },
  ];
}

/* ═══════════════════════ SCREENSHOT MOCKUPS ═══════════════════════ */
function ScreenSetup() {
  const { copy } = useLandingCopy();
  const s = copy.screens.setup;
  return (
    <div className="w-full h-full flex flex-col">
      {/* Browser chrome */}
      <div className="bg-[#f8fafc] rounded-t-xl border-b border-[#e2e8f0] px-4 py-2.5 flex items-center gap-2">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#fca5a5]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#fcd34d]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#86efac]" />
        </div>
        <div className="flex-1 bg-white rounded-md px-3 py-1 text-[10px] text-[#94a3b8] border border-[#e2e8f0] ml-2">
          app.influentiapro.com/practice/setup
        </div>
      </div>
      {/* Content */}
      <div className="flex-1 bg-white rounded-b-xl p-6 flex flex-col gap-5 overflow-hidden">
        <div>
          <p className="text-sm text-[#0f172b] mb-2.5" style={{ fontWeight: 600 }}>{s.whoLabel}</p>
          <div className="flex flex-wrap gap-2">
            {s.pills.map((label, i) => (
              <div key={label} className={`rounded-full px-3 py-1.5 text-xs transition-colors ${i === 0 ? "bg-[#0f172b] text-white" : "bg-[#f1f5f9] text-[#45556c] border border-[#e2e8f0]"}`} style={{ fontWeight: i === 0 ? 500 : 400 }}>{label}</div>
            ))}
          </div>
        </div>
        <div>
          <p className="text-sm text-[#0f172b] mb-2" style={{ fontWeight: 600 }}>{s.objectiveLabel}</p>
          <div className="flex flex-wrap gap-2">
            {s.objectives.map((label, i) => (
              <div key={label} className={`rounded-lg px-3 py-1.5 text-xs ${i === 0 ? "bg-[#eff6ff] text-[#2563eb] border border-[#bfdbfe]" : "bg-[#f1f5f9] text-[#64748b] border border-[#e2e8f0]"}`} style={{ fontWeight: i === 0 ? 500 : 400 }}>{label}</div>
            ))}
          </div>
        </div>
        <div className="flex-1 flex flex-col gap-2">
          <p className="text-sm text-[#0f172b]" style={{ fontWeight: 600 }}>{s.contextLabel}</p>
          <div className="flex gap-1 bg-[#f1f5f9] rounded-lg p-0.5 w-fit">
            {[{ label: s.tabWrite, icon: <FileText className="w-3 h-3" /> }, { label: s.tabUrl, icon: <Globe className="w-3 h-3" /> }].map((tab, i) => (
              <div key={tab.label} className={`rounded-md px-2.5 py-1 text-[10px] flex items-center gap-1 ${i === 0 ? "bg-white shadow-sm text-[#0f172b]" : "text-[#64748b]"}`} style={{ fontWeight: i === 0 ? 500 : 400 }}>{tab.icon}{tab.label}</div>
            ))}
          </div>
          <div className="flex-1 rounded-xl border border-[#e2e8f0] bg-[#fafbfc] p-3.5">
            <p className="text-xs text-[#334155] leading-relaxed">{s.contextBody}</p>
            <div className="mt-2 h-px bg-[#e2e8f0]" />
            <p className="text-[10px] text-[#94a3b8] mt-2">{s.contextHint}</p>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-[10px] text-[#94a3b8]">{s.aiHint}</p>
          <div className="bg-[#0f172b] text-white rounded-full px-5 py-2.5 text-xs flex items-center gap-2 shrink-0" style={{ fontWeight: 500 }}>
            {s.cta}
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ScreenScript() {
  const { copy } = useLandingCopy();
  const s = copy.screens.script;
  return (
    <div className="w-full h-full flex flex-col">
      {/* Browser chrome */}
      <div className="bg-[#f8fafc] rounded-t-xl border-b border-[#e2e8f0] px-4 py-2.5 flex items-center gap-2">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#fca5a5]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#fcd34d]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#86efac]" />
        </div>
        <div className="flex-1 bg-white rounded-md px-3 py-1 text-[10px] text-[#94a3b8] border border-[#e2e8f0] ml-2">
          app.influentiapro.com/practice/script
        </div>
      </div>
      {/* Content */}
      <div className="flex-1 bg-white rounded-b-xl p-5 flex flex-col gap-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#0f172b] flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-xs text-[#0f172b]" style={{ fontWeight: 600 }}>{s.title}</p>
            <p className="text-[9px] text-[#94a3b8]">{s.subtitle}</p>
          </div>
        </div>

        {/* Pillar 1 */}
        <div className="bg-[#f8fafc] rounded-xl p-4 border border-[#e2e8f0]">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-5 h-5 rounded-full bg-[#eff6ff] flex items-center justify-center">
              <span className="text-[9px] text-[#2563eb]" style={{ fontWeight: 700 }}>1</span>
            </div>
            <p className="text-xs text-[#0f172b]" style={{ fontWeight: 600 }}>{s.pillar1}</p>
          </div>
          <p className="text-[11px] text-[#45556c] leading-relaxed">{s.pillar1Body}</p>
        </div>

        {/* Pillar 2 */}
        <div className="bg-[#f8fafc] rounded-xl p-4 border border-[#e2e8f0]">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-5 h-5 rounded-full bg-[#faf5ff] flex items-center justify-center">
              <span className="text-[9px] text-[#7c3aed]" style={{ fontWeight: 700 }}>2</span>
            </div>
            <p className="text-xs text-[#0f172b]" style={{ fontWeight: 600 }}>{s.pillar2}</p>
          </div>
          <p className="text-[11px] text-[#45556c] leading-relaxed">{s.pillar2Body}</p>
        </div>

        {/* Tips clave */}
        <div className="bg-gradient-to-br from-[#0f172b] to-[#1e293b] rounded-xl p-4">
          <div className="flex items-center gap-1.5 mb-2.5">
            <Lightbulb className="w-3.5 h-3.5 text-[#fbbf24]" />
            <p className="text-[10px] text-white/80" style={{ fontWeight: 600 }}>{s.tipsTitle}</p>
          </div>
          <div className="flex flex-col gap-2">
            {s.tips.map((tip, i) => (
              <div key={i} className="flex items-start gap-2">
                <Check className="w-3 h-3 text-[#50C878] mt-0.5 shrink-0" />
                <p className="text-[10px] text-white/70 leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="flex items-center justify-end mt-auto">
          <div className="bg-[#0f172b] text-white rounded-full px-5 py-2.5 text-xs flex items-center gap-2" style={{ fontWeight: 500 }}>
            {s.cta}
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ScreenChat() {
  const { copy } = useLandingCopy();
  const s = copy.screens.chat;
  return (
    <div className="w-full h-full flex flex-col">
      {/* Browser chrome */}
      <div className="bg-[#f8fafc] rounded-t-xl border-b border-[#e2e8f0] px-4 py-2.5 flex items-center gap-2">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#fca5a5]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#fcd34d]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#86efac]" />
        </div>
        <div className="flex-1 bg-white rounded-md px-3 py-1 text-[10px] text-[#94a3b8] border border-[#e2e8f0] ml-2">
          app.influentiapro.com/practice/session
        </div>
      </div>
      {/* Session header */}
      <div className="bg-white border-b border-[#e2e8f0] px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-[#0f172b] flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-white" />
          </div>
          <div>
            <p className="text-[11px] text-[#0f172b]" style={{ fontWeight: 600 }}>Sarah Mitchell · CTO</p>
            <p className="text-[9px] text-[#94a3b8]">{s.role}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
          <span className="text-[9px] text-[#64748b]">{s.live}</span>
        </div>
      </div>
      {/* Chat content */}
      <div className="flex-1 bg-[#f8fafc] p-4 flex flex-col gap-3 overflow-hidden">
        {/* AI message 1 */}
        <div className="flex gap-2 items-start">
          <div className="w-7 h-7 rounded-full bg-[#0f172b] flex items-center justify-center shrink-0">
            <Sparkles className="w-3 h-3 text-white" />
          </div>
          <div className="bg-white rounded-2xl rounded-tl-sm px-3.5 py-2.5 text-xs text-[#334155] leading-relaxed max-w-[85%] shadow-sm border border-[#e2e8f0]">
            Hi! Thanks for taking the time to meet today. I've been looking forward to hearing about your team. Could you start by giving me an overview of what you do?
          </div>
        </div>

        {/* User message 1 */}
        <div className="flex gap-2 items-start justify-end">
          <div className="bg-[#0f172b] rounded-2xl rounded-tr-sm px-3.5 py-2.5 text-xs text-white leading-relaxed max-w-[85%]">
            Absolutely! We specialize in full-stack development with a focus on scalable SaaS platforms. We've delivered over 50 enterprise projects in the last three years.
          </div>
          <div className="w-7 h-7 rounded-full bg-[#e2e8f0] flex items-center justify-center shrink-0">
            <User className="w-3 h-3 text-[#64748b]" />
          </div>
        </div>

        {/* AI message 2 */}
        <div className="flex gap-2 items-start">
          <div className="w-7 h-7 rounded-full bg-[#0f172b] flex items-center justify-center shrink-0">
            <Sparkles className="w-3 h-3 text-white" />
          </div>
          <div className="bg-white rounded-2xl rounded-tl-sm px-3.5 py-2.5 text-xs text-[#334155] leading-relaxed max-w-[85%] shadow-sm border border-[#e2e8f0]">
            That's impressive. What's your typical timeline for a project like ours, and how do you handle scope changes mid-project?
          </div>
        </div>

        {/* User message 2 */}
        <div className="flex gap-2 items-start justify-end">
          <div className="bg-[#0f172b] rounded-2xl rounded-tr-sm px-3.5 py-2.5 text-xs text-white leading-relaxed max-w-[85%]">
            Great question. For a project of this scope, we typically estimate 12 to 16 weeks. We use agile sprints, so scope adjustments are built into the process.
          </div>
          <div className="w-7 h-7 rounded-full bg-[#e2e8f0] flex items-center justify-center shrink-0">
            <User className="w-3 h-3 text-[#64748b]" />
          </div>
        </div>

        {/* AI typing indicator */}
        <div className="flex gap-2 items-start">
          <div className="w-7 h-7 rounded-full bg-[#0f172b] flex items-center justify-center shrink-0">
            <Sparkles className="w-3 h-3 text-white" />
          </div>
          <div className="bg-white rounded-2xl rounded-tl-sm px-3.5 py-2.5 shadow-sm border border-[#e2e8f0] flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-[#94a3b8] animate-pulse" />
            <div className="w-1.5 h-1.5 rounded-full bg-[#94a3b8] animate-pulse" style={{ animationDelay: "0.2s" }} />
            <div className="w-1.5 h-1.5 rounded-full bg-[#94a3b8] animate-pulse" style={{ animationDelay: "0.4s" }} />
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Input area */}
        <div className="flex justify-center">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg"
            style={{ background: "linear-gradient(135deg, #00D3F3, #50C878)" }}
          >
            <Mic className="w-7 h-7 text-white" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ScreenFeedback() {
  const { copy } = useLandingCopy();
  const s = copy.screens.feedback;
  return (
    <div className="w-full h-full flex flex-col">
      {/* Browser chrome */}
      <div className="bg-[#f8fafc] rounded-t-xl border-b border-[#e2e8f0] px-4 py-2.5 flex items-center gap-2">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#fca5a5]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#fcd34d]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#86efac]" />
        </div>
        <div className="flex-1 bg-white rounded-md px-3 py-1 text-[10px] text-[#94a3b8] border border-[#e2e8f0] ml-2">
          app.influentiapro.com/practice/feedback
        </div>
      </div>
      {/* Feedback content */}
      <div className="flex-1 bg-white rounded-b-xl p-5 flex flex-col gap-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#dcfce7] to-[#d1fae5] flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4 text-[#15803d]" />
          </div>
          <div>
            <p className="text-xs text-[#0f172b]" style={{ fontWeight: 600 }}>Session Feedback</p>
            <p className="text-[9px] text-[#94a3b8]">{s.subline}</p>
          </div>
        </div>

        {/* Dimension scores */}
        {[
          { name: "Clarity", score: 82, color: "#3b82f6", desc: "Well-structured arguments with clear transitions" },
          { name: "Persuasion", score: 74, color: "#8b5cf6", desc: "Strong proof points; could improve closing urgency" },
          { name: "Executive Presence", score: 68, color: "#f59e0b", desc: "Confident tone; work on pace during objection handling" },
        ].map((dim) => (
          <div key={dim.name} className="bg-[#f8fafc] rounded-xl p-4 border border-[#e2e8f0]">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-[#0f172b]" style={{ fontWeight: 600 }}>{dim.name}</p>
              <span className="text-sm" style={{ fontWeight: 700, color: dim.color }}>{dim.score}</span>
            </div>
            <div className="h-1.5 bg-[#e2e8f0] rounded-full overflow-hidden mb-2">
              <div className="h-full rounded-full" style={{ width: `${dim.score}%`, backgroundColor: dim.color }} />
            </div>
            <p className="text-[10px] text-[#64748b]">{dim.desc}</p>
          </div>
        ))}

        {/* Correction example */}
        <div className="bg-gradient-to-br from-[#0f172b] to-[#1e293b] rounded-xl p-4">
          <div className="flex items-center gap-1.5 mb-2">
            <Sparkles className="w-3 h-3 text-[#fbbf24]" />
            <p className="text-[10px] text-white/70" style={{ fontWeight: 500 }}>{s.keyCorrection}</p>
          </div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[9px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded" style={{ fontWeight: 500 }}>Before</span>
            <p className="text-[11px] text-white/50 line-through">We have a lot of experience doing this</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[9px] bg-[#50C878]/20 text-[#50C878] px-1.5 py-0.5 rounded" style={{ fontWeight: 500 }}>After</span>
            <p className="text-[11px] text-white" style={{ fontWeight: 500 }}>We've delivered 50+ enterprise platforms</p>
          </div>
        </div>

        {/* CTA */}
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-3.5 h-3.5 text-[#94a3b8]" />
            <span className="text-[10px] text-[#94a3b8]">{s.reportAvailable}</span>
          </div>
          <div className="bg-[#0f172b] text-white rounded-full px-5 py-2.5 text-xs flex items-center gap-2" style={{ fontWeight: 500 }}>
            {s.viewReport}
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>
      </div>
    </div>
  );
}

const SCREEN_COMPONENTS = [ScreenSetup, ScreenScript, ScreenChat, ScreenFeedback];

const AUTOPLAY_INTERVAL = 6000; // ms per tab

/* ═══════════════════════ MAIN COMPONENT ═══════════════════════ */
export function HowItWorksTabs() {
  const [active, setActive] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pausedRef = useRef(false);
  const STEPS = useSteps();
  const TOTAL = STEPS.length;

  const scheduleNext = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (!pausedRef.current) {
        setActive((prev) => (prev + 1) % TOTAL);
      }
      scheduleNext();
    }, AUTOPLAY_INTERVAL);
  }, [TOTAL]);

  /* Pause on hover */
  const pause = useCallback(() => {
    pausedRef.current = true;
  }, []);

  const resume = useCallback(() => {
    pausedRef.current = false;
  }, []);

  /* Manual tab click resets autoplay */
  const handleTabClick = useCallback(
    (i: number) => {
      setActive(i);
      pausedRef.current = false;
      scheduleNext();
    },
    [scheduleNext],
  );

  useEffect(() => {
    scheduleNext();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [scheduleNext]);

  return (
    <div onMouseEnter={pause} onMouseLeave={resume}>
      {/* ── Mobile: horizontal pills ── */}
      <div className="flex md:hidden gap-2 mb-5 overflow-x-auto pb-2 -mx-1 px-1">
        {STEPS.map((step, i) => (
          <button
            key={step.id}
            onClick={() => handleTabClick(i)}
            className={`shrink-0 flex items-center gap-2 rounded-full px-4 py-2.5 text-sm transition-all duration-300 border ${
              active === i
                ? "bg-[#2d2d2d] text-white border-[#2d2d2d] shadow-sm"
                : "bg-white text-[#4B505B] border-[#e2e8f0]"
            }`}
            style={{ fontWeight: active === i ? 500 : 400 }}
          >
            <span className="opacity-60">{step.num}</span>
            {step.title}
          </button>
        ))}
      </div>

      {/* ── Mobile: screenshot ── */}
      <div className="md:hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <div
              className="rounded-2xl p-2 mb-4 shadow-lg border border-black/5"
              style={{ backgroundColor: STEPS[active].accent }}
            >
              <div className="rounded-xl overflow-hidden shadow-sm" style={{ height: 320 }}>
                {SCREEN_COMPONENTS[active]()}
              </div>
            </div>
            <h3 className="text-lg text-gray-900 mb-1.5" style={{ fontWeight: 600 }}>
              {STEPS[active].title}
            </h3>
            <p className="text-[#4B505B] text-sm leading-relaxed">
              {STEPS[active].desc}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Desktop: vertical tabs left + screenshot right ── */}
      <div className="hidden md:grid md:grid-cols-[320px_1fr] gap-6 items-stretch">
        {/* Tabs */}
        <div className="flex flex-col gap-2">
          {STEPS.map((step, i) => {
            const isActive = active === i;
            return (
              <button
                key={step.id}
                onClick={() => handleTabClick(i)}
                className={`group relative text-left rounded-2xl p-5 transition-all duration-300 border ${
                  isActive
                    ? "border-[#2d2d2d]/10 shadow-md"
                    : "bg-white border-[#e2e8f0] hover:border-[#cbd5e1] hover:shadow-sm"
                }`}
                style={{
                  backgroundColor: isActive ? step.accent : undefined,
                }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-300 ${
                      isActive
                        ? "bg-[#2d2d2d] text-white"
                        : "bg-[#f1f5f9] text-[#64748b] group-hover:bg-[#e2e8f0]"
                    }`}
                  >
                    {step.icon}
                  </div>
                  <span
                    className={`text-2xl transition-colors duration-300 ${
                      isActive ? "text-[#2d2d2d]" : "text-[#cbd5e1]"
                    }`}
                    style={{ fontWeight: 800 }}
                  >
                    {step.num}
                  </span>
                </div>
                <h3
                  className={`text-base mb-1 transition-colors duration-300 ${
                    isActive ? "text-gray-900" : "text-[#64748b]"
                  }`}
                  style={{ fontWeight: 600 }}
                >
                  {step.title}
                </h3>
                <p
                  className={`text-sm leading-relaxed transition-colors duration-300 ${
                    isActive ? "text-[#4B505B]" : "text-[#94a3b8]"
                  }`}
                >
                  {step.desc}
                </p>
              </button>
            );
          })}
        </div>

        {/* Screenshot area — matches tab column height */}
        <div className="flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              className="rounded-2xl overflow-hidden shadow-xl border border-black/5 w-full h-full"
            >
              {SCREEN_COMPONENTS[active]()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}