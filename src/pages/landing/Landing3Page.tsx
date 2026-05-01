/**
 * Landing3Page — Rediseño con estructura de 5 secciones
 *
 * 1. Hero      — App mockup prominente + headline + CTA
 * 2. How it works — HowItWorksTabs (reutilizado)
 * 3. Por qué esto — sección oscura fusionando Benefits + Before/After
 * 4. Pricing   — layout limpio, "sin suscripción" como protagonista
 * 5. Final CTA — FAQ colapsable + CTA grande
 */

import { useState, useEffect, useRef } from "react";
import svgPaths from "@/imports/svg-tv6st9nzh5";
import {
  ArrowRight, Check, X, ChevronDown, Globe, LogOut,
  Sparkles, Mic, TrendingUp, User,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { BrandLogo, SectionHeading, CheckIcon, XIcon, DotPattern } from "@/shared/ui";
import { AuthModal, type AuthMode } from "./AuthModal";
import { HowItWorksTabs } from "./HowItWorksTabs";
import { LANDING_COPIES, type LandingLang } from "@/shared/i18n/landing-i18n";
import { LandingLangProvider } from "@/shared/i18n/LandingLangContext";
import type { SetupModalResult } from "./PracticeWidget";

/* ══════════════════════════════════════════════════════
   LANGUAGE SWITCHER
   ══════════════════════════════════════════════════════ */

const LANG_OPTIONS: { code: LandingLang; label: string; flag: string }[] = [
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "pt", label: "Português", flag: "🇧🇷" },
  { code: "en", label: "English", flag: "🇺🇸" },
];

function LanguageSwitcher({ lang, onChange }: { lang: LandingLang; onChange: (l: LandingLang) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);
  const cur = LANG_OPTIONS.find(o => o.code === lang) || LANG_OPTIONS[0];
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs border border-[#e2e8f0] bg-white hover:bg-[#f8fafc] transition-all" style={{ fontWeight: 500 }}>
        <Globe className="w-3.5 h-3.5 text-[#62748e]" />
        <span>{cur.flag}</span>
        <span className="text-[#334155]">{cur.code.toUpperCase()}</span>
        <ChevronDown className="w-3 h-3 text-[#94a3b8] transition-transform" style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -4, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -4, scale: 0.95 }} transition={{ duration: 0.15 }} className="absolute right-0 top-full mt-1.5 w-40 rounded-xl border border-[#e2e8f0] bg-white shadow-lg overflow-hidden z-50">
            {LANG_OPTIONS.map(opt => (
              <button key={opt.code} onClick={() => { onChange(opt.code); setOpen(false); }} className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-xs transition-colors ${lang === opt.code ? "bg-[#f1f5f9] text-[#0f172b]" : "text-[#475569] hover:bg-[#f8fafc] hover:text-[#0f172b]"}`} style={{ fontWeight: lang === opt.code ? 600 : 400 }}>
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
   HERO APP MOCKUP — Arena UI fiel a la app real
   ══════════════════════════════════════════════════════ */

function HeroAppMockup() {
  return (
    <div className="relative">
      <div className="rounded-2xl overflow-hidden shadow-2xl border border-[#e2e8f0] bg-white">

        {/* App header — igual que VoicePractice */}
        <div className="bg-white/90 backdrop-blur-sm border-b border-[#e2e8f0] px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#0f172b] flex items-center justify-center shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <div>
              <p className="text-xs text-[#0f172b]" style={{ fontWeight: 600 }}>David Chen · Hiring Manager</p>
              <p className="text-[10px] text-[#94a3b8]">Job Interview · Turn 3 of 8</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs text-[#50C878] bg-[#f0fdf4] px-2.5 py-1 rounded-full" style={{ fontWeight: 500 }}>
              <span className="w-1.5 h-1.5 rounded-full bg-[#50C878] animate-pulse" />
              En vivo
            </span>
          </div>
        </div>

        {/* Chat area — bg-[#f8fafc] igual que app real */}
        <div className="bg-[#f8fafc] px-5 py-5 space-y-4">

          {/* AI message 1 */}
          <div className="flex gap-2.5 items-start">
            <div className="w-7 h-7 rounded-full bg-[#0f172b] flex items-center justify-center shrink-0">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
            <div className="flex-1">
              <div className="bg-white border border-[#e2e8f0] rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-[#334155] leading-relaxed shadow-sm" style={{ maxWidth: 420 }}>
                Tell me about a time you led a cross-functional project under tight deadlines. What was your approach?
              </div>
              {/* Coaching hint — fiel al componente real */}
              <div className="mt-2 bg-[#f0fdf4] border border-[#b9f8cf] rounded-xl px-3.5 py-2.5" style={{ maxWidth: 400 }}>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Sparkles className="w-2.5 h-2.5 text-[#15803d]" />
                  <span className="text-[9px] text-[#15803d] uppercase tracking-wide" style={{ fontWeight: 600 }}>Coaching hint</span>
                </div>
                <p className="text-[10px] text-[#166534] italic mb-2">"The biggest challenge we faced was…"</p>
                <div className="flex flex-wrap gap-1.5">
                  {["STAR method", "cross-functional", "delivered on time"].map(kw => (
                    <span key={kw} className="bg-[#dcfce7] text-[#166534] px-2 py-0.5 rounded-md text-[9px]" style={{ fontWeight: 500 }}>{kw}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* User message */}
          <div className="flex gap-2.5 items-start justify-end">
            <div className="bg-[#0f172b] rounded-2xl rounded-tr-sm px-4 py-3 text-sm text-white leading-relaxed" style={{ maxWidth: 400 }}>
              The biggest challenge was aligning three teams across different time zones. I set up a shared dashboard and daily standups — we delivered two weeks ahead of schedule.
            </div>
            <div className="w-7 h-7 rounded-full bg-[#e2e8f0] flex items-center justify-center shrink-0">
              <User className="w-3 h-3 text-[#64748b]" />
            </div>
          </div>

          {/* Performance signal */}
          <div className="flex justify-center pt-1">
            <div className="inline-flex items-center gap-2 bg-white border border-[#e2e8f0] rounded-full px-4 py-1.5 shadow-sm">
              <TrendingUp className="w-3.5 h-3.5 text-[#00C950]" />
              <span className="text-xs text-[#64748b]">Performance</span>
              <span className="text-xs text-[#0f172b]" style={{ fontWeight: 700 }}>82/100</span>
            </div>
          </div>
        </div>

        {/* Mic bar — fiel a VoicePractice bottom bar */}
        <div className="bg-white border-t border-[#e2e8f0] px-5 py-4 flex items-center justify-center gap-4">
          <div className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg" style={{ background: "linear-gradient(135deg, #00D3F3, #50C878)" }}>
            <Mic className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm text-[#0f172b]" style={{ fontWeight: 500 }}>Speak your answer</p>
            <p className="text-xs text-[#94a3b8]">Tap when ready · Turn 4 of 8</p>
          </div>
        </div>
      </div>

      {/* Floating badge — readiness score */}
      <motion.div
        className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-xl border border-[#e2e8f0] px-3 py-2.5 flex items-center gap-2.5"
        animate={{ y: [0, -5, 0] }}
        transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
      >
        <div className="w-8 h-8 rounded-full bg-[#DBEDDF] flex items-center justify-center text-base">🎯</div>
        <div>
          <p className="text-[10px] text-[#62748e]">Interview Readiness</p>
          <p className="text-sm text-[#0f172b]" style={{ fontWeight: 700 }}>B2 → C1</p>
        </div>
      </motion.div>

      {/* Floating badge — session count */}
      <motion.div
        className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-xl border border-[#e2e8f0] px-3 py-2.5 flex items-center gap-2.5"
        animate={{ y: [0, 5, 0] }}
        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: 1 }}
      >
        <div className="w-8 h-8 rounded-full bg-[#D9ECF0] flex items-center justify-center text-base">⚡</div>
        <div>
          <p className="text-[10px] text-[#62748e]">Sesión 3 de 3</p>
          <p className="text-sm text-[#0f172b]" style={{ fontWeight: 700 }}>+12 puntos hoy</p>
        </div>
      </motion.div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════ */

export function Landing3Page({
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
  const toggleAuthMode = () => setAuthMode(p => p === "login" ? "registro" : "login");

  const handlePricingClick = () => {
    if (authUser) onPricingPurchase?.();
    else { sessionStorage.setItem("masterytalk_purchase_intent", "true"); openAuth("registro"); }
  };

  useEffect(() => {
    document.body.style.overflow = authOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [authOpen]);

  useEffect(() => { setOpenFaq(null); }, [lang]);

  return (
    <LandingLangProvider value={{ lang, copy }}>
      <div className="w-full min-h-full bg-white overflow-x-hidden">

        {/* ═══ HEADER ═══ */}
        <header className="fixed top-0 left-0 w-full z-50 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between px-6 md:px-8 h-16">
            <BrandLogo />
            <nav className="hidden md:flex items-center gap-8">
              <a href="#how"      className="text-[#4B505B] hover:text-gray-900 text-sm transition-colors">{copy.nav.howItWorks}</a>
              <a href="#why"      className="text-[#4B505B] hover:text-gray-900 text-sm transition-colors">{copy.nav.benefits}</a>
              <a href="#pricing"  className="text-[#4B505B] hover:text-gray-900 text-sm transition-colors">{copy.nav.pricing}</a>
            </nav>
            <div className="hidden md:flex items-center gap-3">
              <LanguageSwitcher lang={lang} onChange={setLang} />
              {authUser ? (
                <>
                  <span className="text-sm text-[#4B505B] font-medium mr-2 max-w-[150px] truncate">
                    Hola {authUser.displayName ? authUser.displayName.split(" ")[0] : "Usuario"}
                  </span>
                  <button className="text-[#4B505B] hover:text-gray-900 p-2" onClick={onLogout}><LogOut className="w-4 h-4" /></button>
                  <button className="bg-[#2d2d2d] text-white text-sm px-6 py-2.5 rounded-full hover:bg-[#1a1a1a] transition-colors" onClick={onGoToDashboard}>Dashboard</button>
                </>
              ) : (
                <>
                  <button className="text-[#4B505B] hover:text-gray-900 text-sm" onClick={() => openAuth("login")}>{copy.nav.login}</button>
                  <button className="bg-[#2d2d2d] text-white text-sm px-6 py-2.5 rounded-full hover:bg-[#1a1a1a] transition-colors" onClick={() => openAuth("registro")}>{copy.nav.cta}</button>
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
              <a href="#how"     className="block text-[#4B505B] py-2" onClick={() => setMobileMenuOpen(false)}>{copy.nav.howItWorks}</a>
              <a href="#why"     className="block text-[#4B505B] py-2" onClick={() => setMobileMenuOpen(false)}>{copy.nav.benefits}</a>
              <a href="#pricing" className="block text-[#4B505B] py-2" onClick={() => setMobileMenuOpen(false)}>{copy.nav.pricing}</a>
              {authUser ? (
                <button className="w-full bg-[#2d2d2d] text-white py-3 rounded-full mt-2" style={{ fontWeight: 500 }} onClick={() => { setMobileMenuOpen(false); onGoToDashboard?.(); }}>Dashboard</button>
              ) : (
                <button className="w-full bg-[#2d2d2d] text-white py-3 rounded-full mt-2" style={{ fontWeight: 500 }} onClick={() => { setMobileMenuOpen(false); openAuth("registro"); }}>{copy.nav.cta}</button>
              )}
            </div>
          )}
        </header>

        <AnimatePresence mode="wait">
          <motion.div key={lang} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>

            {/* ═══════════════════════════════════════════════
                SECCIÓN 1 — HERO
                Layout: headline izquierda · app mockup derecha
            ═══════════════════════════════════════════════ */}
            <section className="pt-16 pb-0 overflow-hidden bg-[#0f172b] relative">
              {/* Ambient blobs */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-20 -left-20 w-[500px] h-[500px] rounded-full opacity-20" style={{ background: "#D9ECF0", filter: "blur(120px)" }} />
                <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full opacity-10" style={{ background: "#E1D4FF", filter: "blur(100px)" }} />
              </div>

              <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                {/* Left — copy */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>

                  {/* Badge */}
                  <div className="inline-flex items-center gap-2 bg-white/8 rounded-full px-4 py-2 border border-white/15 mb-6">
                    <span className="text-sm text-white/70" style={{ fontWeight: 500 }}>{copy.hero.badge}</span>
                  </div>

                  {/* Headline */}
                  <h1 className="text-white mb-6 leading-[1.1]" style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}>
                    <span style={{ fontWeight: 300 }}>Entrena tu comunicación</span>
                    <br />
                    <span style={{ fontWeight: 700 }}>profesional en inglés.</span>
                  </h1>

                  {/* Outcomes — tres beneficios como pills */}
                  <div className="flex flex-wrap gap-2 mb-10">
                    {["Gana contratos", "Trabaja remoto", "Impacta en tus reuniones"].map(b => (
                      <span key={b} className="text-sm text-white/70 bg-white/8 border border-white/15 px-3 py-1 rounded-full" style={{ fontWeight: 500 }}>
                        {b}
                      </span>
                    ))}
                  </div>

                  {/* CTAs */}
                  <div className="flex flex-col sm:flex-row items-start gap-4">
                    <button
                      onClick={() => openAuth("registro", "cta")}
                      className="flex items-center gap-2.5 bg-white text-[#0f172b] px-8 py-3.5 rounded-full text-base hover:bg-gray-100 transition-colors shadow-lg"
                      style={{ fontWeight: 600 }}
                    >
                      {copy.nav.cta} <ArrowRight className="w-4 h-4" />
                    </button>
                    <p className="text-white/35 text-sm pt-3">{copy.widget.microcopy}</p>
                  </div>

                  {/* Social proof */}
                  <div className="flex items-center gap-3 mt-8 pt-8 border-t border-white/10">
                    <div className="flex -space-x-1">
                      {["🇲🇽","🇨🇴","🇧🇷","🇦🇷","🇵🇪"].map((f, i) => (
                        <span key={i} className="text-lg w-7 h-7 rounded-full bg-white/10 border border-white/5 flex items-center justify-center">{f}</span>
                      ))}
                    </div>
                    <p className="text-sm text-white/35">+2,400 profesionales LATAM</p>
                  </div>
                </motion.div>

                {/* Right — app mockup */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.15 }}
                  className="relative px-6"
                >
                  <HeroAppMockup />
                </motion.div>
              </div>

              {/* Gradiente de transición hacia el blanco del siguiente section */}
              <div className="h-20 bg-gradient-to-b from-[#0f172b] to-white relative z-10" />
            </section>

            {/* ═══════════════════════════════════════════════
                SECCIÓN 2 — CÓMO FUNCIONA
                Reutiliza HowItWorksTabs sin cambios
            ═══════════════════════════════════════════════ */}
            <section id="how" className="relative py-20 md:py-28 bg-white">
              <DotPattern />
              <div className="relative z-10 max-w-6xl mx-auto px-6">
                <SectionHeading title={copy.howItWorks.sectionTitle} />
                <HowItWorksTabs />
              </div>
            </section>

            {/* ═══════════════════════════════════════════════
                SECCIÓN 3 — POR QUÉ ESTO
                Sección oscura: Benefits + Before/After fusionados
            ═══════════════════════════════════════════════ */}
            <section id="why" className="bg-[#0f172b] py-20 md:py-28">
              <div className="max-w-6xl mx-auto px-6">

                {/* Título */}
                <div className="text-center mb-14">
                  <p className="text-xs text-[#50C878] uppercase tracking-widest mb-3" style={{ fontWeight: 600 }}>¿Para quién es esto?</p>
                  <h2 className="text-white" style={{ fontWeight: 300, fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)" }}>
                    {copy.benefits.sectionTitle}
                  </h2>
                </div>

                {/* Grid principal: sí/no izquierda · before/after derecha */}
                <div className="grid md:grid-cols-2 gap-8 items-start">

                  {/* Columna izquierda: lista Sí / No */}
                  <div className="space-y-6">
                    {/* Sí */}
                    <div>
                      <p className="text-xs text-[#50C878] uppercase tracking-widest mb-4" style={{ fontWeight: 600 }}>✓ Esto es para ti</p>
                      <div className="space-y-3">
                        {copy.benefits.yesList.map(item => (
                          <div key={item} className="flex items-start gap-3">
                            <div className="w-5 h-5 rounded-full bg-[#50C878]/15 flex items-center justify-center shrink-0 mt-0.5">
                              <Check className="w-3 h-3 text-[#50C878]" strokeWidth={3} />
                            </div>
                            <p className="text-white/80 text-sm leading-relaxed">{item}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Separador */}
                    <div className="border-t border-white/10 my-2" />

                    {/* No */}
                    <div>
                      <p className="text-xs text-white/30 uppercase tracking-widest mb-4" style={{ fontWeight: 600 }}>✕ Esto no es para ti si</p>
                      <div className="space-y-3">
                        {copy.benefits.noList.map(item => (
                          <div key={item} className="flex items-start gap-3">
                            <div className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center shrink-0 mt-0.5">
                              <X className="w-3 h-3 text-white/30" strokeWidth={2.5} />
                            </div>
                            <p className="text-white/35 text-sm leading-relaxed">{item}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Columna derecha: Before/After */}
                  <div className="space-y-4">
                    <p className="text-xs text-white/40 uppercase tracking-widest mb-6" style={{ fontWeight: 600 }}>
                      {copy.beforeAfter.sectionTitle}
                    </p>

                    {/* Sin MasteryTalk */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                          <X className="w-3.5 h-3.5 text-white/40" strokeWidth={2.5} />
                        </div>
                        <p className="text-white/50 text-sm" style={{ fontWeight: 600 }}>{copy.beforeAfter.withoutTitle}</p>
                      </div>
                      <div className="space-y-3">
                        {copy.beforeAfter.withoutList.map(item => (
                          <div key={item} className="flex items-start gap-2.5">
                            <div className="w-1 h-1 rounded-full bg-white/20 mt-2 shrink-0" />
                            <p className="text-white/40 text-sm">{item}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Con MasteryTalk */}
                    <div className="bg-[#DBEDDF]/10 border border-[#50C878]/20 rounded-2xl p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-6 h-6 rounded-full bg-[#50C878]/20 flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 text-[#50C878]" strokeWidth={2.5} />
                        </div>
                        <p className="text-white text-sm" style={{ fontWeight: 600 }}>{copy.beforeAfter.withTitle}</p>
                      </div>
                      <div className="space-y-3">
                        {copy.beforeAfter.withList.map(item => (
                          <div key={item} className="flex items-start gap-2.5">
                            <div className="w-1 h-1 rounded-full bg-[#50C878]/60 mt-2 shrink-0" />
                            <p className="text-white/85 text-sm">{item}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ═══════════════════════════════════════════════
                SECCIÓN 4 — PRICING
                "Sin suscripción" como protagonista
            ═══════════════════════════════════════════════ */}
            <section id="pricing" className="relative py-20 md:py-28 bg-[#f0f4f8]">
              <div className="max-w-3xl mx-auto px-6">

                {/* Headline de pricing */}
                <div className="text-center mb-4">
                  <h2 className="text-3xl md:text-4xl text-gray-900 mb-3" style={{ fontWeight: 700 }}>
                    {copy.pricing.headline}
                  </h2>
                  <span className="inline-block text-xs font-semibold bg-amber-100 text-amber-700 px-3 py-1 rounded-full mb-3">{copy.pricing.launchBadge}</span>
                  <p className="text-[#4B505B] max-w-lg mx-auto">{copy.pricing.subtitle}</p>
                </div>

                {/* Demo line destacada */}
                <div className="flex items-center justify-center my-10">
                  <div className="bg-white border border-[#50C878]/30 rounded-2xl px-6 py-4 text-center shadow-sm max-w-lg w-full" style={{ background: "linear-gradient(135deg, rgba(80,200,120,0.06), rgba(0,211,243,0.04))" }}>
                    <p className="text-[#0f172b] text-base" style={{ fontWeight: 600 }}>{copy.pricing.demoLine}</p>
                  </div>
                </div>

                {/* Pricing cards */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="relative rounded-3xl p-8 flex flex-col bg-[#2d2d2d] shadow-xl">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#50C878] text-white text-[10px] px-3 py-1 rounded-full whitespace-nowrap" style={{ fontWeight: 600 }}>{copy.pricing.launchBadge}</div>
                    <p className="text-sm text-white mb-3" style={{ fontWeight: 600 }}>{copy.pricing.monthly.label}</p>
                    <div className="mb-1">
                      <span className="text-5xl text-white" style={{ fontWeight: 800 }}>$12.99</span>
                      <span className="text-sm text-white/60 ml-1">{copy.pricing.monthly.period}</span>
                      <span className="ml-2 text-sm line-through text-white/30">$19.99</span>
                    </div>
                    <ul className="space-y-1.5 mb-8 mt-4">{copy.pricing.monthly.features.map(f => <li key={f} className="flex items-center gap-2 text-xs text-white/80"><span className="text-emerald-400">✓</span>{f}</li>)}</ul>
                    <button onClick={handlePricingClick} className="w-full py-3 rounded-full text-sm mt-auto bg-white text-[#2d2d2d] hover:bg-gray-100 shadow-md transition-colors" style={{ fontWeight: 500 }}>{copy.pricing.modal.cta}</button>
                  </div>
                  <div className="relative rounded-3xl p-8 flex flex-col bg-white border border-gray-200">
                    <span className="absolute -top-3 left-6 text-[10px] font-semibold bg-[#DBEDDF] text-[#0f172b] px-2.5 py-1 rounded-full">{copy.pricing.saveBadge}</span>
                    <p className="text-sm text-gray-900 mb-3" style={{ fontWeight: 600 }}>{copy.pricing.quarterly.label}</p>
                    <div className="mb-1">
                      <span className="text-5xl text-[#2d2d2d]" style={{ fontWeight: 800 }}>$29.99</span>
                      <span className="text-sm text-[#94a3b8] ml-1">{copy.pricing.quarterly.period}</span>
                      <span className="ml-2 text-sm line-through text-[#94a3b8]">$47.99</span>
                    </div>
                    <p className="text-xs text-[#62748e] mb-4">{copy.pricing.quarterly.perMonth.replace("{{price}}", "$9.99")}</p>
                    <ul className="space-y-1.5 mb-8">{copy.pricing.quarterly.features.map(f => <li key={f} className="flex items-center gap-2 text-xs text-[#45556c]"><span className="text-emerald-500">✓</span>{f}</li>)}</ul>
                    <button onClick={handlePricingClick} className="w-full py-3 rounded-full text-sm mt-auto border-2 border-[#2d2d2d] text-gray-900 hover:bg-gray-50 transition-colors" style={{ fontWeight: 500 }}>{copy.pricing.modal.cta}</button>
                  </div>
                </div>
              </div>
            </section>

            {/* ═══════════════════════════════════════════════
                SECCIÓN 5 — FAQ + FINAL CTA
                FAQ colapsable encima, CTA grande abajo
            ═══════════════════════════════════════════════ */}
            <section className="relative py-20 md:py-28 bg-white">
              <DotPattern />
              <div className="relative z-10 max-w-3xl mx-auto px-6">

                {/* FAQ */}
                <SectionHeading title={copy.faq.sectionTitle} />
                <div className="space-y-2 mb-20">
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

                {/* Final CTA */}
                <div className="text-center">
                  <h2 className="text-4xl md:text-5xl text-gray-900 mb-4" style={{ fontWeight: 300, lineHeight: 1.15 }}>
                    {copy.finalCta.headline1}<br />
                    <span style={{ fontWeight: 500 }}>{copy.finalCta.headline2}</span>
                  </h2>
                  <p className="text-xl text-[#4B505B] mb-10">{copy.finalCta.subline}</p>
                  <button
                    className="bg-[#2d2d2d] text-white px-10 py-4 rounded-full inline-flex items-center gap-2 hover:bg-[#1a1a1a] transition-colors shadow-lg text-lg mb-8"
                    style={{ fontWeight: 500 }}
                    onClick={() => openAuth("registro", "cta")}
                  >
                    {copy.finalCta.button} <ArrowRight className="w-5 h-5" />
                  </button>
                  <div className="flex flex-wrap items-center justify-center gap-6">
                    {copy.finalCta.badges.map(t => (
                      <span key={t} className="flex items-center gap-2 text-sm text-[#4B505B]"><CheckIcon />{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* ═══ FOOTER ═══ */}
            <footer className="bg-white py-16 border-t border-gray-200">
              <div className="max-w-6xl mx-auto px-6">
                <div className="grid md:grid-cols-4 gap-12 mb-12">
                  <div>
                    <BrandLogo />
                    <p className="text-[#4B505B] mt-4 leading-relaxed">{copy.footer.tagline}</p>
                  </div>
                  {copy.footer.columns.map(col => (
                    <div key={col.title}>
                      <h4 className="text-gray-900 mb-4" style={{ fontWeight: 500 }}>{col.title}</h4>
                      <div className="space-y-3">
                        {col.items.map(item => {
                          const legal: Record<string, string> = {
                            "Privacidad": "#privacy", "Privacy": "#privacy", "Privacidade": "#privacy",
                            "Términos": "#terms", "Terms": "#terms", "Termos": "#terms",
                          };
                          const href = legal[item];
                          return href
                            ? <a key={item} href={href} target="_blank" rel="noopener noreferrer" className="block text-[#4B505B] hover:text-gray-900 transition-colors">{item}</a>
                            : <a key={item} className="block text-[#4B505B] hover:text-gray-900 cursor-pointer transition-colors">{item}</a>;
                        })}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-200 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
                  <p className="text-[#4B505B] text-sm">{copy.footer.copyright}</p>
                  <div className="flex items-center gap-4">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="#4B505B"><path d={svgPaths.p3e7f1900} /></svg>
                    <div className="w-5 h-5"><svg width="20" height="16.26" viewBox="0 0 20 16.2554" fill="#4B505B"><path d={svgPaths.p186b65f0} /></svg></div>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="#4B505B"><path d={svgPaths.p9d76b80} /></svg>
                  </div>
                </div>
              </div>
            </footer>

          </motion.div>
        </AnimatePresence>

        {/* ═══ AUTH MODAL ═══ */}
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
