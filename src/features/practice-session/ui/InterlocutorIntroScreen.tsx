import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { useNarration } from "@/shared/lib/useNarration";
import type { InterlocutorKey } from "@/features/practice-session/model/narrator-audio";

/* ── Interlocutor metadata ── */

interface InterlocutorMeta {
  name: string;
  role: string;
  hook: string;
  initials: string;
}

const INTERLOCUTOR_META: Record<string, InterlocutorMeta> = {
  recruiter: {
    name: "The Recruiter",
    role: "Corporate Talent Acquisition",
    hook: "15-20 candidates a day. You have 60 seconds to make her remember you.",
    initials: "RC",
  },
  hiring_manager: {
    name: "The Hiring Manager",
    role: "Your Future Direct Manager",
    hook: "He speaks in outcomes. Show him what you've delivered, not what you've done.",
    initials: "HM",
  },
  sme: {
    name: "The Subject Matter Expert",
    role: "Senior Technical Evaluator",
    hook: "He'll probe until he finds the edge of your knowledge. Don't fake it.",
    initials: "SM",
  },
  hr: {
    name: "HR / People & Culture",
    role: "Culture & Sustainability Evaluator",
    hook: "She wants the real story. Corporate answers will work against you.",
    initials: "HR",
  },
  gatekeeper: {
    name: "The Gatekeeper",
    role: "Sales Development Representative",
    hook: "He filters 15 vendors a day. You have 5 minutes. Lead with value.",
    initials: "GK",
  },
  technical_buyer: {
    name: "The Technical Buyer",
    role: "Internal Technical Specialist",
    hook: "Marketing promises mean nothing. She wants proof of concept.",
    initials: "TB",
  },
  champion: {
    name: "The Champion",
    role: "Department Head & Internal Ally",
    hook: "She wants to buy. Help her build the business case for her VP.",
    initials: "CH",
  },
  decision_maker: {
    name: "The Decision Maker",
    role: "C-Level Executive",
    hook: "15 minutes. Cost, savings, risk. That's all she wants to hear.",
    initials: "DM",
  },
  meeting_facilitator: {
    name: "The Meeting Facilitator",
    role: "Structured Timekeeper",
    hook: "He keeps the agenda moving. Ramble and he'll cut you off.",
    initials: "MF",
  },
  senior_stakeholder: {
    name: "The Senior Stakeholder",
    role: "VP / Director",
    hook: "She goes on tangents. Your job: redirect diplomatically and close with decisions.",
    initials: "SS",
  },
};

/* ── Waveform bars — animate while audio plays ── */

function Waveform({ active }: { active: boolean }) {
  const bars = [4, 8, 14, 10, 6, 12, 8, 5, 11, 7, 13, 9, 5];
  return (
    <div className="flex items-center gap-[3px] h-8">
      {bars.map((h, i) => (
        <motion.div
          key={i}
          className="w-[3px] rounded-full bg-white/60"
          animate={active
            ? { height: [`${h}px`, `${h * 2.2}px`, `${h}px`] }
            : { height: "3px" }
          }
          transition={{
            repeat: active ? Infinity : 0,
            duration: 0.5 + i * 0.07,
            ease: "easeInOut",
            delay: i * 0.04,
          }}
        />
      ))}
    </div>
  );
}

/* ── Main component ── */

export function InterlocutorIntroScreen({
  interlocutor,
  narratorUrl,
  onReady,
}: {
  interlocutor: string;
  narratorUrl?: string;
  onReady: () => void;
}) {
  const meta = INTERLOCUTOR_META[interlocutor] ?? INTERLOCUTOR_META.recruiter;
  const { isPlaying, isDone } = useNarration(narratorUrl || null);

  // Allow proceeding after 3s even if audio hasn't started (autoplay blocked)
  const [canProceed, setCanProceed] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setCanProceed(true), 3000);
    return () => clearTimeout(t);
  }, []);

  const ready = isDone || canProceed;

  return (
    <div
      className="w-full min-h-[calc(100dvh-4rem)] bg-[#0f172b] flex flex-col items-center justify-center px-6"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <motion.div
        className="text-center max-w-md w-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        {/* Label */}
        <motion.p
          className="text-white/35 text-xs uppercase tracking-widest mb-8"
          style={{ fontWeight: 500 }}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          You're about to speak with
        </motion.p>

        {/* Avatar */}
        <motion.div
          className="relative w-24 h-24 mx-auto mb-6"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.35, type: "spring", stiffness: 200 }}
        >
          {/* Pulse ring */}
          <motion.div
            className="absolute inset-0 rounded-full border border-white/15"
            animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0, 0.4] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute -inset-2 rounded-full border border-white/8"
            animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0, 0.2] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut", delay: 0.4 }}
          />
          {/* Avatar circle */}
          <div className="w-24 h-24 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
            <span className="text-white text-xl" style={{ fontWeight: 600 }}>
              {meta.initials}
            </span>
          </div>
        </motion.div>

        {/* Name */}
        <motion.h1
          className="text-white text-2xl mb-1"
          style={{ fontWeight: 600 }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          {meta.name}
        </motion.h1>

        {/* Role */}
        <motion.p
          className="text-white/45 text-sm mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.65 }}
        >
          {meta.role}
        </motion.p>

        {/* Waveform or hook text */}
        <motion.div
          className="flex flex-col items-center gap-4 mb-10 min-h-[60px] justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          {isPlaying ? (
            <Waveform active={isPlaying} />
          ) : (
            <p className="text-white/60 text-base leading-relaxed max-w-sm mx-auto italic" style={{ fontWeight: 300 }}>
              "{meta.hook}"
            </p>
          )}
        </motion.div>

        {/* CTA */}
        <motion.button
          onClick={onReady}
          disabled={!ready}
          className={`flex items-center gap-2.5 mx-auto px-8 py-3.5 rounded-full text-base transition-all ${
            ready
              ? "bg-white text-[#0f172b] hover:bg-gray-100 shadow-lg cursor-pointer"
              : "bg-white/10 text-white/25 cursor-not-allowed"
          }`}
          style={{ fontWeight: 600 }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1 }}
        >
          I'm ready — Start the session
          <ArrowRight className="w-4 h-4" />
        </motion.button>

        {!ready && (
          <motion.p
            className="text-white/20 text-xs mt-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            Listen to the briefing first
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}
