/**
 * Landing2Page — A/B variant of LandingPage
 *
 * Diferencias vs Landing1:
 * - Hero: oscuro, dos columnas, mascota ilustrada + demo animada del Arena
 * - Sección extra "Demo" entre hero y How It Works
 * - Todo lo demás: idéntico a LandingPage (contenido, DS, copy)
 *
 * Para reemplazar el placeholder de la mascota con la ilustración final:
 * Busca <MascotPlaceholder /> y sustitúyelo por <img src="..." alt="..." />
 */

import { useState, useEffect, useRef } from "react";
import svgPaths from "@/imports/svg-tv6st9nzh5";
import {
  Check,
  X,
  ArrowRight,
  Sparkles,
  ChevronDown,
  Globe,
  LogOut,
  Mic,
  Target,
  FileText,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { PracticeWidget } from "./PracticeWidget";
import type { SetupModalResult } from "./PracticeWidget";
import { BrandLogo, SectionHeading, CheckIcon, XIcon, DotPattern } from "@/shared/ui";
import { AuthModal, type AuthMode } from "./AuthModal";
import { HowItWorksTabs } from "./HowItWorksTabs";
import { LANDING_COPIES, type LandingLang } from "@/shared/i18n/landing-i18n";
import { LandingLangProvider } from "@/shared/i18n/LandingLangContext";

/* ══════════════════════════════════════════════════════
   LANGUAGE SWITCHER (mismo que LandingPage)
   ══════════════════════════════════════════════════════ */

const LANG_OPTIONS: { code: LandingLang; label: string; flag: string }[] = [
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "pt", label: "Português", flag: "🇧🇷" },
  { code: "en", label: "English",  flag: "🇺🇸" },
];

function LanguageSwitcher({ lang, onChange }: { lang: LandingLang; onChange: (l: LandingLang) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);
  const current = LANG_OPTIONS.find((o) => o.code === lang) || LANG_OPTIONS[0];
  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs border border-[#e2e8f0] bg-white hover:bg-[#f8fafc] transition-all"
        style={{ fontWeight: 500 }}
      >
        <Globe className="w-3.5 h-3.5 text-[#62748e]" />
        <span>{current.flag}</span>
        <span className="text-[#334155]">{current.code.toUpperCase()}</span>
        <ChevronDown className="w-3 h-3 text-[#94a3b8] transition-transform" style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-1.5 w-40 rounded-xl border border-[#e2e8f0] bg-white shadow-lg overflow-hidden z-50"
          >
            {LANG_OPTIONS.map((opt) => (
              <button
                key={opt.code}
                onClick={() => { onChange(opt.code); setOpen(false); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-xs transition-colors ${lang === opt.code ? "bg-[#f1f5f9] text-[#0f172b]" : "text-[#475569] hover:bg-[#f8fafc] hover:text-[#0f172b]"}`}
                style={{ fontWeight: lang === opt.code ? 600 : 400 }}
              >
                <span className="text-sm">{opt.flag}</span>
                <span className="flex-1 text-left">{opt.label}</span>
                {lang === opt.code && <Check className="w-3.5 h-3.5 text-[#6366f1]" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   MASCOT PLACEHOLDER
   Reemplazar con <img> cuando llegue la ilustración final.
   ══════════════════════════════════════════════════════ */

function MascotPlaceholder() {
  return (
    <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden bg-[#0d1b30] flex items-center justify-center">
      {/* Ambient glow */}
      <div className="absolute inset-0">
        <div className="absolute top-1/3 left-1/4 w-48 h-48 rounded-full bg-blue-600/15 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/3 w-40 h-40 rounded-full bg-emerald-500/10 blur-2xl" />
      </div>

      {/* Desk scene — geometric illustration */}
      <svg viewBox="0 0 480 360" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* City skyline */}
        <rect x="0"   y="150" width="480" height="210" fill="#07101f" />
        <rect x="20"  y="110" width="50"  height="80"  fill="#0c1a2e" />
        <rect x="75"  y="80"  width="70"  height="110" fill="#0a1728" />
        <rect x="150" y="100" width="40"  height="90"  fill="#0c1a2e" />
        <rect x="200" y="60"  width="80"  height="130" fill="#0d1e35" />
        <rect x="288" y="90"  width="55"  height="100" fill="#0a1728" />
        <rect x="348" y="70"  width="65"  height="120" fill="#0c1a2e" />
        <rect x="420" y="110" width="60"  height="80"  fill="#0a1728" />

        {/* Building windows */}
        {[
          [28,120],[42,120],[28,138],[42,138],
          [83,92],[97,92],[111,92],[83,110],[97,110],[83,128],
          [155,112],[165,112],[155,128],[165,128],
          [208,72],[222,72],[236,72],[208,90],[222,90],[236,90],[208,108],[236,108],
          [296,100],[310,100],[296,118],[310,118],[324,118],
          [356,82],[370,82],[384,82],[356,100],[384,100],[356,118],[370,118],
        ].map(([x,y],i)=>(
          <rect key={i} x={x} y={y} width="9" height="7" rx="1.5" fill="#fde68a" opacity="0.8" />
        ))}

        {/* Moon */}
        <circle cx="440" cy="40" r="20" fill="#e8dfc0" opacity="0.85" />
        <circle cx="451" cy="34" r="16" fill="#07101f" />

        {/* Desk */}
        <rect x="0"   y="270" width="480" height="12" rx="4" fill="#92683d" />
        <rect x="0"   y="282" width="480" height="78"  fill="#f5ebe0" />

        {/* Plant */}
        <rect x="32"  y="262" width="26" height="18" rx="3" fill="#b5672a" />
        <ellipse cx="45" cy="252" rx="18" ry="22" fill="#2d6a2d" />
        <ellipse cx="36" cy="256" rx="11" ry="15" fill="#1e5220" />
        <ellipse cx="54" cy="258" rx="11" ry="13" fill="#338833" />

        {/* Laptop base */}
        <rect x="145" y="262" width="190" height="10" rx="3" fill="#1c1c1e" />
        <rect x="180" y="264" width="50"  height="5"  rx="2" fill="#2d2d2d" />

        {/* Laptop screen */}
        <rect x="150" y="170" width="180" height="98" rx="8" fill="#1c1c1e" />
        <rect x="158" y="178" width="164" height="82" rx="5" fill="#0d1e35" />

        {/* Screen — video call grid */}
        <rect x="162" y="182" width="73" height="48" rx="4" fill="#0a1628" />
        <rect x="241" y="182" width="73" height="48" rx="4" fill="#0c1f38" />
        <rect x="162" y="235" width="73" height="20" rx="4" fill="#091524" />
        <rect x="241" y="235" width="73" height="20" rx="4" fill="#0b1d32" />
        {/* Face in call */}
        <circle cx="198" cy="202" r="10" fill="#f0c4a0" />
        <ellipse cx="198" cy="193" rx="10" ry="6" fill="#2d1a0e" />
        <rect x="190" y="211" width="16" height="8" rx="2" fill="#1e3a5f" />
        {/* Screen chrome */}
        <circle cx="162" cy="181" r="2.5" fill="#ff5f57" />
        <circle cx="169" cy="181" r="2.5" fill="#ffbd2e" />
        <circle cx="176" cy="181" r="2.5" fill="#28c840" />

        {/* Mug */}
        <rect x="348" y="256" width="32" height="24" rx="4" fill="#e8e8e8" />
        <ellipse cx="364" cy="256" rx="16" ry="5" fill="#d0d0d0" />
        <ellipse cx="364" cy="256" rx="12" ry="4" fill="#7c4a30" />
        <path d="M380 261 Q390 261 390 268 Q390 275 380 275" stroke="#d0d0d0" strokeWidth="3" fill="none" />
        {/* Steam */}
        <path d="M358 250 Q360 244 358 238" stroke="#ccc" strokeWidth="1.5" fill="none" opacity="0.6" />
        <path d="M365 248 Q367 241 365 236" stroke="#ccc" strokeWidth="1.5" fill="none" opacity="0.4" />

        {/* Person (simplified, centered) */}
        <rect x="208" y="280" width="8"  height="50" rx="3" fill="#111" />
        <rect x="264" y="280" width="8"  height="50" rx="3" fill="#111" />
        <rect x="208" y="275" width="64" height="24" rx="8" fill="#1e1e1e" />
        <rect x="220" y="275" width="40" height="48" rx="6" fill="#1e3a5f" />
        <circle cx="240" cy="258" r="22" fill="#f0c4a0" />
        <path d="M218 264 Q220 245 240 248 Q260 245 262 264" fill="#1a0e08" />
        <ellipse cx="240" cy="244" rx="22" ry="10" fill="#1a0e08" />
        <path d="M219 266 Q214 278 217 290" stroke="#1a0e08" strokeWidth="7" fill="none" strokeLinecap="round" />
        <path d="M261 266 Q266 278 263 290" stroke="#1a0e08" strokeWidth="7" fill="none" strokeLinecap="round" />
        {/* Headphones */}
        <path d="M224 270 Q240 282 256 270" stroke="#2d2d2d" strokeWidth="4" fill="none" />
        <circle cx="222" cy="268" r="5" fill="#333" />
        <circle cx="258" cy="268" r="5" fill="#333" />

        {/* Cat */}
        <ellipse cx="105" cy="278" rx="20" ry="14" fill="#b0b0b0" />
        <circle cx="105" cy="263" r="14" fill="#c0c0c0" />
        <polygon points="94,256 98,244 103,256" fill="#c0c0c0" />
        <polygon points="107,256 112,244 116,256" fill="#c0c0c0" />
        <polygon points="95,256 98,249 102,256" fill="#f9a8a8" />
        <polygon points="108,256 112,249 115,256" fill="#f9a8a8" />
        <circle cx="100" cy="262" r="3" fill="#1a1a1a" />
        <circle cx="110" cy="262" r="3" fill="#1a1a1a" />
        <circle cx="100" cy="261" r="1" fill="white" />
        <circle cx="110" cy="261" r="1" fill="white" />
        <ellipse cx="105" cy="267" rx="2.5" ry="2" fill="#f08080" />
        <line x1="88" y1="267" x2="102" y2="268" stroke="#999" strokeWidth="1" />
        <line x1="108" y1="268" x2="122" y2="267" stroke="#999" strokeWidth="1" />
        <path d="M86 285 Q72 298 78 312 Q84 326 95 316" stroke="#b0b0b0" strokeWidth="7" fill="none" strokeLinecap="round" />

        {/* Floating chat bubble from screen */}
        <rect x="340" y="190" width="120" height="36" rx="12" fill="white" opacity="0.95" />
        <rect x="340" y="202" width="120" height="0" fill="white" />
        <polygon points="340,212 330,218 340,218" fill="white" opacity="0.95" />
        <rect x="350" y="198" width="80" height="6" rx="3" fill="#e2e8f0" />
        <rect x="350" y="210" width="55" height="6" rx="3" fill="#e2e8f0" />

        <rect x="18"  y="195" width="110" height="32" rx="10" fill="#00C950" opacity="0.9" />
        <polygon points="128,204 138,210 128,210" fill="#00C950" opacity="0.9" />
        <rect x="28"  y="203" width="60" height="5" rx="2.5" fill="white" opacity="0.8" />
        <rect x="28"  y="213" width="85" height="5" rx="2.5" fill="white" opacity="0.6" />
      </svg>

      {/* Floating badge — score */}
      <motion.div
        className="absolute top-5 right-5 bg-white rounded-2xl shadow-xl px-3 py-2.5 flex items-center gap-2.5"
        animate={{ y: [0, -6, 0] }}
        transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
      >
        <div className="w-8 h-8 rounded-full bg-[#DBEDDF] flex items-center justify-center text-base">🎯</div>
        <div>
          <p className="text-[10px] text-[#62748e]">Readiness Score</p>
          <p className="text-sm font-bold text-[#0f172b]">B2 → C1</p>
        </div>
      </motion.div>

      {/* Floating badge — session */}
      <motion.div
        className="absolute bottom-5 left-5 bg-white rounded-2xl shadow-xl px-3 py-2.5 flex items-center gap-2.5"
        animate={{ y: [0, 6, 0] }}
        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: 1 }}
      >
        <div className="w-8 h-8 rounded-full bg-[#D9ECF0] flex items-center justify-center text-base">⚡</div>
        <div>
          <p className="text-[10px] text-[#62748e]">Sesión completada</p>
          <p className="text-sm font-bold text-[#0f172b]">3 de 3</p>
        </div>
      </motion.div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   ARENA DEMO — conversación animada
   ══════════════════════════════════════════════════════ */

interface DemoStep { type: "ai" | "user" | "hint" | "score"; text?: string; value?: number; }

const DEMO_STEPS: DemoStep[] = [
  { type: "ai",    text: "Walk me through your background in about a minute." },
  { type: "hint",  text: "Lead with impact → trajectory → why this role" },
  { type: "user",  text: "I've spent 4 years leading cross-functional teams at a U.S. SaaS company, delivering a 40% reduction in onboarding time…" },
  { type: "score", value: 74 },
  { type: "ai",    text: "Solid. Now — walk me through a decision you made under real pressure." },
];

const STEP_DELAYS = [500, 1900, 3400, 5000, 6600];

function ArenaDemo() {
  const [cycle, setCycle] = useState(0);
  const [visible, setVisible] = useState<number[]>([]);
  const [score, setScore] = useState(0);

  useEffect(() => {
    setVisible([]);
    setScore(0);
    const timers = STEP_DELAYS.map((d, i) =>
      setTimeout(() => setVisible((p) => [...p, i]), d)
    );
    const scoreTimer = setTimeout(() => {
      let n = 42;
      const iv = setInterval(() => { n += 2; setScore(n); if (n >= 74) clearInterval(iv); }, 22);
    }, STEP_DELAYS[3] + 80);
    const reset = setTimeout(() => setCycle((c) => c + 1), 10500);
    return () => { timers.forEach(clearTimeout); clearTimeout(scoreTimer); clearTimeout(reset); };
  }, [cycle]);

  return (
    <div className="w-full max-w-xl mx-auto rounded-2xl overflow-hidden border border-gray-200 shadow-xl">
      {/* Titlebar */}
      <div className="bg-[#0f172b] px-5 py-3 flex items-center gap-2">
        <div className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
        <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/70" />
        <div className="w-2.5 h-2.5 rounded-full bg-green-400/70" />
        <span className="ml-3 text-xs text-white/30 font-mono tracking-wide">Arena · Interview Practice</span>
      </div>

      {/* Chat area */}
      <div className="bg-[#07101f] px-6 pt-6 pb-4 min-h-[280px] flex flex-col gap-4">
        <AnimatePresence>
          {DEMO_STEPS.map((step, i) => {
            if (!visible.includes(i)) return null;
            if (step.type === "ai") return (
              <motion.div key={`${cycle}-ai-${i}`} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.35 }} className="flex gap-3 items-start">
                <div className="shrink-0 w-7 h-7 rounded-full bg-[#1e3a6a] flex items-center justify-center text-[10px] font-bold text-blue-300">AI</div>
                <div className="bg-[#111c2e] text-white/85 text-sm rounded-2xl rounded-tl-sm px-4 py-3 max-w-xs leading-relaxed">{step.text}</div>
              </motion.div>
            );
            if (step.type === "hint") return (
              <motion.div key={`${cycle}-hint-${i}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="self-center">
                <div className="flex items-center gap-2 bg-[#00C950]/10 border border-[#00C950]/25 text-[#00C950] text-xs px-3 py-1.5 rounded-full">
                  <Sparkles className="w-3 h-3 shrink-0" />{step.text}
                </div>
              </motion.div>
            );
            if (step.type === "user") return (
              <motion.div key={`${cycle}-user-${i}`} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.35 }} className="flex gap-3 items-start justify-end">
                <div className="bg-[#1e3a5f] text-white/85 text-sm rounded-2xl rounded-tr-sm px-4 py-3 max-w-xs leading-relaxed">{step.text}</div>
                <div className="shrink-0 w-7 h-7 rounded-full bg-[#1e3a5f] border border-blue-500/30 flex items-center justify-center">
                  <Mic className="w-3 h-3 text-blue-300" />
                </div>
              </motion.div>
            );
            if (step.type === "score") return (
              <motion.div key={`${cycle}-score-${i}`} initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }} className="self-center">
                <div className="flex items-center gap-2 bg-[#111c2e] border border-white/10 px-4 py-2 rounded-xl text-sm">
                  <span className="text-white/40">Performance</span>
                  <span className="text-[#00C950] font-bold tabular-nums">{score}/100</span>
                </div>
              </motion.div>
            );
            return null;
          })}
        </AnimatePresence>
      </div>

      {/* Input bar */}
      <div className="bg-[#07101f] px-6 pb-5">
        <div className="flex items-center gap-3 bg-[#111c2e] border border-white/8 rounded-xl px-4 py-3">
          <div className="w-5 h-5 rounded-full bg-[#00C950]/20 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-[#00C950] animate-pulse" />
          </div>
          <span className="text-white/25 text-xs flex-1">Speak your answer…</span>
          <div className="flex gap-0.5 items-end h-3.5">
            {[3,5,8,5,3,7,9,4,6].map((h,i) => (
              <motion.div key={i} className="w-0.5 bg-[#00C950]/50 rounded-full"
                animate={{ height:[`${h}px`,`${h*1.9}px`,`${h}px`] }}
                transition={{ repeat:Infinity, duration:0.6+i*0.1, ease:"easeInOut" }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════ */

export function Landing2Page({
  onAuthComplete,
  landingLang,
  onLangChange,
  authUser,
  onLogout,
  onGoToDashboard,
  onPricingPurchase,
}: {
  onAuthComplete?: (data: SetupModalResult, authMode?: "login" | "registro") => void;
  landingLang?: LandingLang;
  onLangChange?: (l: LandingLang) => void;
  authUser?: import("../../services/types").User | null;
  onLogout?: () => void;
  onGoToDashboard?: () => void;
  onPricingPurchase?: () => void;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [lang, setLangLocal] = useState<LandingLang>(landingLang ?? "es");
  const setLang = (l: LandingLang) => { setLangLocal(l); onLangChange?.(l); };
  const copy = LANDING_COPIES[lang];

  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("registro");
  const [authVariant, setAuthVariant] = useState<"default" | "cta">("default");

  const openAuth = (mode: AuthMode, variant: "default" | "cta" = "default") => {
    setAuthMode(mode); setAuthVariant(variant); setAuthOpen(true); setMobileMenuOpen(false);
  };
  const toggleAuthMode = () => setAuthMode((p) => (p === "login" ? "registro" : "login"));

  const handlePricingClick = () => {
    if (authUser) { onPricingPurchase?.(); }
    else {
      sessionStorage.setItem("masterytalk_purchase_intent", "true");
      openAuth("registro");
    }
  };

  useEffect(() => {
    document.body.style.overflow = authOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [authOpen]);

  useEffect(() => { setOpenFaq(null); }, [lang]);

  return (
    <LandingLangProvider value={{ lang, copy }}>
      <div className="w-full min-h-full bg-white overflow-x-hidden">

        {/* ═══════════════ HEADER (idéntico a LandingPage) ═══════════════ */}
        <header className="fixed top-0 left-0 w-full z-50 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between px-6 md:px-8 h-16">
            <BrandLogo />
            <nav className="hidden md:flex items-center gap-8">
              <a href="#how"      className="text-[#4B505B] hover:text-gray-900 text-sm transition-colors">{copy.nav.howItWorks}</a>
              <a href="#benefits" className="text-[#4B505B] hover:text-gray-900 text-sm transition-colors">{copy.nav.benefits}</a>
              <a href="#pricing"  className="text-[#4B505B] hover:text-gray-900 text-sm transition-colors">{copy.nav.pricing}</a>
            </nav>
            <div className="hidden md:flex items-center gap-3">
              <LanguageSwitcher lang={lang} onChange={setLang} />
              {authUser ? (
                <>
                  <span className="text-sm text-[#4B505B] font-medium mr-2 max-w-[150px] truncate">
                    Hola {authUser.displayName ? authUser.displayName.split(" ")[0] : "Usuario"}
                  </span>
                  <button className="text-[#4B505B] hover:text-gray-900 text-sm p-2 transition-colors" onClick={onLogout} title="Cerrar sesión">
                    <LogOut className="w-4 h-4" />
                  </button>
                  <button className="bg-[#2d2d2d] text-white text-sm px-6 py-2.5 rounded-full hover:bg-[#1a1a1a] transition-colors" onClick={onGoToDashboard}>
                    Dashboard
                  </button>
                </>
              ) : (
                <>
                  <button className="text-[#4B505B] hover:text-gray-900 text-sm transition-colors" onClick={() => openAuth("login")}>{copy.nav.login}</button>
                  <button className="bg-[#2d2d2d] text-white text-sm px-6 py-2.5 rounded-full hover:bg-[#1a1a1a] transition-colors" onClick={() => openAuth("registro")}>
                    {copy.nav.cta}
                  </button>
                </>
              )}
            </div>
            <div className="flex md:hidden items-center gap-3">
              <LanguageSwitcher lang={lang} onChange={setLang} />
              <button className="text-[#4B505B]" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18" /></svg>
              </button>
            </div>
          </div>
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 bg-white px-6 py-4 space-y-3">
              <a href="#how"      className="block text-[#4B505B] py-2" onClick={() => setMobileMenuOpen(false)}>{copy.nav.howItWorks}</a>
              <a href="#benefits" className="block text-[#4B505B] py-2" onClick={() => setMobileMenuOpen(false)}>{copy.nav.benefits}</a>
              <a href="#pricing"  className="block text-[#4B505B] py-2" onClick={() => setMobileMenuOpen(false)}>{copy.nav.pricing}</a>
              {authUser ? (
                <>
                  <span className="block text-[#4B505B] font-medium py-2 border-t border-gray-100 mt-2 pt-4">
                    Hola {authUser.displayName ? authUser.displayName.split(" ")[0] : "Usuario"}
                  </span>
                  <button className="w-full text-left text-[#4B505B] py-2 flex items-center gap-2" onClick={() => { setMobileMenuOpen(false); onLogout?.(); }}>
                    <LogOut className="w-4 h-4" /> Cerrar sesión
                  </button>
                  <button className="w-full bg-[#2d2d2d] text-white py-3 rounded-full mt-2" style={{ fontWeight: 500 }} onClick={() => { setMobileMenuOpen(false); onGoToDashboard?.(); }}>
                    Dashboard
                  </button>
                </>
              ) : (
                <button className="w-full bg-[#2d2d2d] text-white py-3 rounded-full mt-2" style={{ fontWeight: 500 }} onClick={() => { setMobileMenuOpen(false); openAuth("registro"); }}>
                  {copy.nav.cta}
                </button>
              )}
            </div>
          )}
        </header>

        <AnimatePresence mode="wait">
          <motion.div key={lang} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>

            {/* ═══════════════ HERO — NUEVO (oscuro, mascota + headline) ═══════════════ */}
            <section className="bg-[#0f172b] pt-16 pb-0 overflow-hidden relative min-h-screen flex items-center">
              {/* Ambient blobs */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/3 left-0 w-[500px] h-[500px] rounded-full opacity-20" style={{ background: "#D9ECF0", filter: "blur(120px)" }} />
                <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full opacity-15" style={{ background: "#E1D4FF", filter: "blur(100px)" }} />
              </div>

              <div className="relative z-10 w-full max-w-6xl mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                {/* Left — copy */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
                  <div className="inline-flex items-center gap-2 bg-white/8 border border-white/15 text-white/70 text-xs px-3 py-1.5 rounded-full mb-6">
                    <Sparkles className="w-3 h-3 text-[#00C950]" />
                    {copy.hero.badge}
                  </div>

                  <h1 className="text-white mb-6 leading-[1.15]" style={{ fontWeight: 300, fontSize: "clamp(2.2rem, 4.5vw, 3.4rem)" }}>
                    {copy.hero.headline}
                    <br />
                    <span className="text-white/50" style={{ fontWeight: 300 }}>{copy.hero.subheadline}</span>
                  </h1>

                  <div className="flex flex-col sm:flex-row items-start gap-4 mt-10">
                    <button
                      onClick={() => openAuth("registro", "cta")}
                      className="flex items-center gap-2.5 bg-[#2d2d2d] text-white px-8 py-3.5 rounded-full text-base hover:bg-[#1a1a1a] transition-colors shadow-lg"
                      style={{ fontWeight: 500 }}
                    >
                      {copy.nav.cta} <ArrowRight className="w-4 h-4" />
                    </button>
                    <p className="text-white/35 text-sm pt-3">{copy.widget.microcopy}</p>
                  </div>

                  {/* Social proof */}
                  <div className="flex items-center gap-3 mt-10 pt-10 border-t border-white/10">
                    <div className="flex -space-x-1.5">
                      {["🇲🇽","🇨🇴","🇧🇷","🇦🇷","🇵🇪"].map((f, i) => (
                        <span key={i} className="text-lg w-7 h-7 rounded-full bg-white/10 flex items-center justify-center">{f}</span>
                      ))}
                    </div>
                    <p className="text-white/40 text-sm">+2,400 profesionales LATAM</p>
                  </div>
                </motion.div>

                {/* Right — mascot */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.15 }}
                >
                  <MascotPlaceholder />
                </motion.div>
              </div>
            </section>

            {/* ═══════════════ DEMO — NUEVA sección ═══════════════ */}
            <section className="relative py-20 md:py-28 bg-[#f0f4f8]">
              <div className="max-w-6xl mx-auto px-6">
                <SectionHeading title="Así se siente una sesión real" />
                <p className="text-center text-[#4B505B] max-w-xl mx-auto mb-14 -mt-6">
                  El AI no te ayuda — te desafía. Como un ejecutivo con 15 minutos antes de su siguiente reunión.
                </p>
                <ArenaDemo />
              </div>
            </section>

            {/* ═══════════════ HOW IT WORKS (idéntico) ═══════════════ */}
            <section id="how" className="relative py-20 md:py-28 bg-white">
              <DotPattern />
              <div className="relative z-10 max-w-6xl mx-auto px-6">
                <SectionHeading title={copy.howItWorks.sectionTitle} />
                <HowItWorksTabs />
              </div>
            </section>

            {/* ═══════════════ DIFFERENTIATORS (idéntico) ═══════════════ */}
            <section className="py-20 md:py-28 bg-[#f0f4f8]">
              <div className="max-w-6xl mx-auto px-6">
                <SectionHeading title={copy.differentiators.sectionTitle} />
                <div className="grid md:grid-cols-2 gap-6">
                  {copy.differentiators.items.map((item, i) => (
                    <div key={item.title} className="bg-white rounded-3xl p-8 border border-gray-200">
                      <div className="w-10 h-10 rounded-full bg-[#0f172b] flex items-center justify-center mb-5">
                        <span className="text-white text-sm" style={{ fontWeight: 700 }}>{i + 1}</span>
                      </div>
                      <h3 className="text-lg text-gray-900 mb-3" style={{ fontWeight: 600 }}>{item.title}</h3>
                      <p className="text-[#4B505B] leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* ═══════════════ BENEFITS (idéntico) ═══════════════ */}
            <section id="benefits" className="relative py-20 md:py-28 bg-white">
              <DotPattern />
              <div className="relative z-10 max-w-6xl mx-auto px-6">
                <SectionHeading title={copy.benefits.sectionTitle} />
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-[#DBEDDF] rounded-3xl p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-full bg-[#00C950] flex items-center justify-center">
                        <Check className="w-5 h-5 text-white" strokeWidth={3} />
                      </div>
                    </div>
                    <div className="space-y-4">
                      {copy.benefits.yesList.map((item) => (
                        <div key={item} className="flex items-start gap-3"><CheckIcon /><p className="text-gray-600">{item}</p></div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-[#f0f4f8] rounded-3xl p-8 border border-gray-200">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-full bg-[#cad5e2] flex items-center justify-center">
                        <X className="w-5 h-5 text-[#45556C]" strokeWidth={3} />
                      </div>
                    </div>
                    <div className="space-y-4">
                      {copy.benefits.noList.map((item) => (
                        <div key={item} className="flex items-start gap-3"><XIcon /><p className="text-gray-600">{item}</p></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ═══════════════ BEFORE & AFTER (idéntico) ═══════════════ */}
            <section className="py-20 md:py-28 bg-[#f0f4f8]">
              <div className="max-w-6xl mx-auto px-6">
                <SectionHeading title={copy.beforeAfter.sectionTitle} />
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-[#FFE9C7] rounded-3xl p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-full bg-[#2d2d2d] flex items-center justify-center">
                        <X className="w-5 h-5 text-white" strokeWidth={2.5} />
                      </div>
                      <h3 className="text-xl text-gray-900" style={{ fontWeight: 600 }}>{copy.beforeAfter.withoutTitle}</h3>
                    </div>
                    <div className="space-y-4">
                      {copy.beforeAfter.withoutList.map((item) => (
                        <div key={item} className="flex items-start gap-3"><XIcon /><p className="text-gray-600">{item}</p></div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-[#DBEDDF] rounded-3xl p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-full bg-[#2d2d2d] flex items-center justify-center">
                        <Check className="w-5 h-5 text-white" strokeWidth={2.5} />
                      </div>
                      <h3 className="text-xl text-gray-900" style={{ fontWeight: 600 }}>{copy.beforeAfter.withTitle}</h3>
                    </div>
                    <div className="space-y-4">
                      {copy.beforeAfter.withList.map((item) => (
                        <div key={item} className="flex items-start gap-3"><CheckIcon /><p className="text-gray-600">{item}</p></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ═══════════════ SESSION TAKEAWAYS (idéntico) ═══════════════ */}
            <section className="relative py-20 md:py-28 bg-white">
              <DotPattern />
              <div className="relative z-10 max-w-6xl mx-auto px-6">
                <SectionHeading title={copy.sessionTakeaways.sectionTitle} />
                <div className="grid md:grid-cols-3 gap-6">
                  {copy.sessionTakeaways.items.map((item, i) => {
                    const icons = [Mic, Target, FileText];
                    const colors = ["#E1D5F8", "#D9ECF0", "#DBEDDF"];
                    const Icon = icons[i];
                    return (
                      <div key={item.metric} className="rounded-3xl p-8" style={{ backgroundColor: colors[i] }}>
                        <div className="w-12 h-12 rounded-full bg-[#2d2d2d] flex items-center justify-center mb-5">
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <p className="text-2xl text-[#2d2d2d] mb-2" style={{ fontWeight: 700 }}>{item.metric}</p>
                        <p className="text-[#4B505B]">{item.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* ═══════════════ ROUTES (idéntico) ═══════════════ */}
            <section className="py-20 md:py-28 bg-[#f0f4f8]">
              <div className="max-w-6xl mx-auto px-6">
                <SectionHeading title={copy.routes.sectionTitle} />
                <p className="text-center text-[#4B505B] max-w-2xl mx-auto mb-12 -mt-6">{copy.routes.subtitle}</p>
                <div className="grid md:grid-cols-3 gap-6">
                  {copy.routes.items.map((route) => (
                    <div key={route.name} className="bg-white rounded-3xl p-8 border border-gray-200 hover:shadow-md transition-shadow">
                      <h3 className="text-lg text-gray-900 mb-3" style={{ fontWeight: 600 }}>{route.name}</h3>
                      <p className="text-[#4B505B] leading-relaxed">{route.hook}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* ═══════════════ PRICING (idéntico) ═══════════════ */}
            <section id="pricing" className="relative py-20 md:py-28 bg-white">
              <DotPattern />
              <div className="relative z-10 max-w-4xl mx-auto px-6">
                <div className="text-center mb-4">
                  <h2 className="text-3xl md:text-4xl text-gray-900 mb-2" style={{ fontWeight: 700 }}>{copy.pricing.headline}</h2>
                  <span className="inline-block text-xs font-semibold bg-amber-100 text-amber-700 px-3 py-1 rounded-full mb-3">{copy.pricing.launchBadge}</span>
                </div>
                <p className="text-center text-[#4B505B] mb-12">{copy.pricing.subtitle}</p>
                <div className="grid md:grid-cols-2 gap-6 mb-10 max-w-3xl mx-auto">
                  <div className="relative rounded-2xl p-6 md:p-8 flex flex-col bg-[#2d2d2d] shadow-xl ring-2 ring-[#50C878]/30">
                    <p className="text-sm text-white mb-3" style={{ fontWeight: 600 }}>{copy.pricing.monthly.label}</p>
                    <div className="mb-1">
                      <span className="text-4xl md:text-5xl text-white" style={{ fontWeight: 800 }}>$12.99</span>
                      <span className="text-sm text-white/60 ml-1">{copy.pricing.monthly.period}</span>
                      <span className="ml-2 text-sm line-through text-white/30">$19.99</span>
                    </div>
                    <ul className="space-y-1.5 mb-6 mt-4">{copy.pricing.monthly.features.map(f => <li key={f} className="flex items-center gap-2 text-xs text-white/80"><span className="text-emerald-400">✓</span>{f}</li>)}</ul>
                    <button className="w-full py-3 rounded-full text-sm bg-white text-[#2d2d2d] hover:bg-gray-100 transition-colors mt-auto shadow-lg" style={{ fontWeight: 500 }} onClick={handlePricingClick}>{copy.pricing.modal.cta}</button>
                  </div>
                  <div className="relative rounded-2xl p-6 md:p-8 flex flex-col bg-white border border-gray-200 hover:shadow-md transition-shadow">
                    <span className="absolute -top-3 left-6 text-[10px] font-semibold bg-[#DBEDDF] text-[#0f172b] px-2.5 py-1 rounded-full">{copy.pricing.saveBadge}</span>
                    <p className="text-sm text-gray-900 mb-3" style={{ fontWeight: 600 }}>{copy.pricing.quarterly.label}</p>
                    <div className="mb-1">
                      <span className="text-4xl md:text-5xl text-[#2d2d2d]" style={{ fontWeight: 800 }}>$29.99</span>
                      <span className="text-sm text-[#94a3b8] ml-1">{copy.pricing.quarterly.period}</span>
                      <span className="ml-2 text-sm line-through text-[#94a3b8]">$47.99</span>
                    </div>
                    <p className="text-xs text-[#62748e] mb-4">{copy.pricing.quarterly.perMonth.replace("{{price}}", "$9.99")}</p>
                    <ul className="space-y-1.5 mb-6">{copy.pricing.quarterly.features.map(f => <li key={f} className="flex items-center gap-2 text-xs text-[#45556c]"><span className="text-emerald-500">✓</span>{f}</li>)}</ul>
                    <button className="w-full py-3 rounded-full text-sm border-2 border-[#2d2d2d] text-gray-900 hover:bg-gray-50 transition-colors mt-auto" style={{ fontWeight: 500 }} onClick={handlePricingClick}>{copy.pricing.modal.cta}</button>
                  </div>
                </div>
                <div className="rounded-2xl px-6 py-4 text-center border border-[#50C878]/20 max-w-3xl mx-auto" style={{ background: "linear-gradient(135deg, rgba(80,200,120,0.08), rgba(0,211,243,0.06))" }}>
                  <p className="text-sm text-[#4B505B]" style={{ fontWeight: 500 }}>{copy.pricing.demoLine}</p>
                </div>
              </div>
            </section>

            {/* ═══════════════ FAQ (idéntico) ═══════════════ */}
            <section className="py-20 md:py-28 bg-[#f0f4f8]">
              <div className="max-w-3xl mx-auto px-6">
                <SectionHeading title={copy.faq.sectionTitle} />
                <div className="space-y-3">
                  {copy.faq.items.map((faq, i) => (
                    <div key={`${lang}-${i}`} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                      <button className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                        <span className="text-gray-900" style={{ fontWeight: 500 }}>{faq.q}</span>
                        <ChevronDown className={`w-5 h-5 text-[#4B505B] shrink-0 transition-transform duration-300 ${openFaq === i ? "rotate-180" : ""}`} />
                      </button>
                      <div className="grid transition-all duration-300 ease-in-out" style={{ gridTemplateRows: openFaq === i ? "1fr" : "0fr" }}>
                        <div className="overflow-hidden">
                          <p className="px-6 pb-5 text-[#4B505B] leading-relaxed">{faq.a}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* ═══════════════ FINAL CTA (idéntico) ═══════════════ */}
            <section className="relative py-24 md:py-32 bg-white -mt-px">
              <DotPattern />
              <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
                <h2 className="text-4xl md:text-5xl text-gray-900 mb-4" style={{ fontWeight: 300, lineHeight: 1.15 }}>
                  {copy.finalCta.headline1}<br />
                  <span style={{ fontWeight: 500 }}>{copy.finalCta.headline2}</span>
                </h2>
                <p className="text-xl text-[#4B505B] mb-10">{copy.finalCta.subline}</p>
                <button className="bg-[#2d2d2d] text-white px-10 py-4 rounded-full inline-flex items-center gap-2 hover:bg-[#1a1a1a] transition-colors shadow-lg text-lg mb-8" style={{ fontWeight: 500 }} onClick={() => openAuth("registro", "cta")}>
                  {copy.finalCta.button} <ArrowRight className="w-5 h-5" />
                </button>
                <div className="flex flex-wrap items-center justify-center gap-6">
                  {copy.finalCta.badges.map((t) => (
                    <span key={t} className="flex items-center gap-2 text-sm text-[#4B505B]"><CheckIcon />{t}</span>
                  ))}
                </div>
              </div>
            </section>

            {/* ═══════════════ FOOTER (idéntico) ═══════════════ */}
            <footer className="bg-white py-16 border-t border-gray-200">
              <div className="max-w-6xl mx-auto px-6">
                <div className="grid md:grid-cols-4 gap-12 mb-12">
                  <div>
                    <BrandLogo />
                    <p className="text-[#4B505B] mt-4 leading-relaxed">{copy.footer.tagline}</p>
                  </div>
                  {copy.footer.columns.map((col) => (
                    <div key={col.title}>
                      <h4 className="text-gray-900 mb-4" style={{ fontWeight: 500 }}>{col.title}</h4>
                      <div className="space-y-3">
                        {col.items.map((item) => {
                          const legalRoutes: Record<string, string> = {
                            "Privacidad": "#privacy", "Privacy": "#privacy", "Privacidade": "#privacy",
                            "Términos": "#terms", "Terms": "#terms", "Termos": "#terms",
                          };
                          const href = legalRoutes[item];
                          return href ? (
                            <a key={item} href={href} target="_blank" rel="noopener noreferrer" className="block text-[#4B505B] hover:text-gray-900 cursor-pointer transition-colors">{item}</a>
                          ) : (
                            <a key={item} className="block text-[#4B505B] hover:text-gray-900 cursor-pointer transition-colors">{item}</a>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-200 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
                  <p className="text-[#4B505B] text-sm">{copy.footer.copyright}</p>
                  <div className="flex items-center gap-4">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="#4B505B"><path d={svgPaths.p3e7f1900} /></svg>
                    <div className="w-5 h-5 relative"><svg width="20" height="16.26" viewBox="0 0 20 16.2554" fill="#4B505B"><path d={svgPaths.p186b65f0} /></svg></div>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="#4B505B"><path d={svgPaths.p9d76b80} /></svg>
                  </div>
                </div>
              </div>
            </footer>

          </motion.div>
        </AnimatePresence>

        {/* ═══════════════ AUTH MODAL (idéntico) ═══════════════ */}
        <AuthModal
          open={authOpen}
          mode={authMode}
          variant={authVariant}
          onClose={() => setAuthOpen(false)}
          onToggleMode={toggleAuthMode}
          onAuthComplete={() => setAuthOpen(false)}
        />
      </div>
    </LandingLangProvider>
  );
}
