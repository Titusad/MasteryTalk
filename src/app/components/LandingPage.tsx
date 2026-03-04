import { useState, useEffect } from "react";
import svgPaths from "../../imports/svg-tv6st9nzh5";
import {
  Check,
  X,
  ArrowRight,
  Sparkles,
  ChevronDown,
  Zap,
  Gift,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { PracticeWidget } from "./PracticeWidget";
import type { SetupModalResult } from "./PracticeWidget";
import { BrandLogo, SectionHeading, CheckIcon, XIcon, DotPattern } from "./shared";
import { AuthModal, type AuthMode } from "./AuthModal";
import { HowItWorksTabs } from "./HowItWorksTabs";
import { LANDING_COPIES, type LandingLang } from "./landing-i18n";
import { LandingLangProvider } from "./LandingLangContext";

/* ═══════════════ LANGUAGE SWITCHER ═══════════════ */
function LanguageSwitcher({ lang, onChange }: { lang: LandingLang; onChange: (l: LandingLang) => void }) {
  return (
    <div className="flex items-center bg-[#f1f5f9] rounded-full p-0.5 gap-0.5">
      {(["es", "pt", "en"] as const).map((l) => (
        <button
          key={l}
          onClick={() => onChange(l)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all ${lang === l
            ? "bg-white shadow-sm text-[#0f172b]"
            : "text-[#62748e] hover:text-[#0f172b]"
            }`}
          style={{ fontWeight: lang === l ? 600 : 400 }}
        >
          <span>{l === "es" ? "🇪🇸" : l === "pt" ? "🇧🇷" : "🇺🇸"}</span>
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

/* ═══════════════════════ MAIN COMPONENT ═══════════════════════ */
export function LandingPage({ onAuthComplete, landingLang, onLangChange }: { onAuthComplete?: (data: SetupModalResult, authMode?: "login" | "registro") => void; landingLang?: LandingLang; onLangChange?: (l: LandingLang) => void }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [lang, setLangLocal] = useState<LandingLang>(landingLang ?? "es");
  const setLang = (l: LandingLang) => { setLangLocal(l); onLangChange?.(l); };
  const copy = LANDING_COPIES[lang];

  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setMobileMenuOpen(false);
  };

  /* ── Auth modal state ── */
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("registro");
  const [authVariant, setAuthVariant] = useState<"default" | "cta">("default");

  const openAuth = (mode: AuthMode, variant: "default" | "cta" = "default") => {
    setAuthMode(mode);
    setAuthVariant(variant);
    setAuthOpen(true);
    setMobileMenuOpen(false);
  };

  const toggleAuthMode = () =>
    setAuthMode((prev) => (prev === "login" ? "registro" : "login"));

  /* Lock body scroll when auth modal is open */
  useEffect(() => {
    if (authOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [authOpen]);

  /* Close open FAQ when language changes */
  useEffect(() => {
    setOpenFaq(null);
  }, [lang]);

  return (
    <LandingLangProvider value={{ lang, copy }}>
      <div className="w-full min-h-full bg-white overflow-x-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
        {/* ───── HEADER ───── */}
        <header className="fixed top-0 left-0 w-full z-50 bg-white border-b border-gray-200">
          <div className="max-w-6xl mx-auto flex items-center justify-between px-6 h-16">
            <BrandLogo />
            <nav className="hidden md:flex items-center gap-8">
              <a href="#como-funciona" onClick={(e) => handleScrollTo(e, 'como-funciona')} className="text-[#4B505B] hover:text-gray-900 text-sm transition-colors">{copy.nav.howItWorks}</a>
              <a href="#beneficios" onClick={(e) => handleScrollTo(e, 'beneficios')} className="text-[#4B505B] hover:text-gray-900 text-sm transition-colors">{copy.nav.benefits}</a>
              <a href="#pricing" onClick={(e) => handleScrollTo(e, 'pricing')} className="text-[#4B505B] hover:text-gray-900 text-sm transition-colors">{copy.nav.pricing}</a>
            </nav>
            <div className="hidden md:flex items-center gap-3">
              <LanguageSwitcher lang={lang} onChange={setLang} />
              <button className="text-[#4B505B] hover:text-gray-900 text-sm transition-colors" onClick={() => openAuth("login")}>{copy.nav.login}</button>
              <button
                onClick={() => {
                  setAuthMode("registro");
                  setAuthOpen(true);
                }}
                className="text-sm bg-[#0f172b] text-white px-5 py-2.5 rounded-full hover:bg-[#1e293b] transition-all shadow-sm hover:shadow-md hover:-translate-y-[1px] active:translate-y-0"
                style={{ fontWeight: 500 }}
              >
                {copy.nav.register}
              </button>
            </div>
            <div className="flex md:hidden items-center gap-3">
              <LanguageSwitcher lang={lang} onChange={setLang} />
              <button className="text-[#4B505B]" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 12h18M3 6h18M3 18h18" />
                </svg>
              </button>
            </div>
          </div>
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 bg-white px-6 py-4 space-y-3">
              <a href="#como-funciona" onClick={(e) => handleScrollTo(e, 'como-funciona')} className="block text-[#4B505B] py-2">{copy.nav.howItWorks}</a>
              <a href="#beneficios" onClick={(e) => handleScrollTo(e, 'beneficios')} className="block text-[#4B505B] py-2">{copy.nav.benefits}</a>
              <a href="#pricing" onClick={(e) => handleScrollTo(e, 'pricing')} className="block text-[#4B505B] py-2">{copy.nav.pricing}</a>
              <button className="w-full bg-[#2d2d2d] text-white py-3 rounded-full mt-2" style={{ fontWeight: 500 }} onClick={() => openAuth("registro")}>{copy.nav.register}</button>
            </div>
          )}
        </header>

        {/* ═══════════════ CROSSFADE WRAPPER ═══════════════ */}
        <AnimatePresence mode="wait">
          <motion.div
            key={lang}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >

            {/* ═══════════════ HERO ═══════════════ */}
            <section className="bg-white pt-24 md:pt-[140px] pb-20 md:pb-32 overflow-hidden relative">
              {/* ── Subtle background mesh gradient matching Figma ── */}
              <div className="absolute inset-0 pointer-events-none" aria-hidden="true" style={{ background: "linear-gradient(140deg, #FAF7F2 0%, #F0F6F9 50%, #FAF7F2 100%)" }}>
                <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full opacity-40 mix-blend-multiply" style={{ background: "radial-gradient(circle, rgba(225,238,255,0.8) 0%, rgba(225,238,255,0) 70%)", transform: "translate(20%, -20%)" }} />
                <div className="absolute top-[20%] left-0 w-[500px] h-[500px] rounded-full opacity-40 mix-blend-multiply" style={{ background: "radial-gradient(circle, rgba(255,245,235,0.8) 0%, rgba(255,245,235,0) 70%)", transform: "translate(-30%, 0)" }} />
              </div>

              {/* ── Value Proposition ── */}
              <div className="relative z-10 max-w-[1000px] mx-auto px-6 text-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="inline-flex items-center gap-2 bg-white/70 backdrop-blur-md rounded-full px-5 py-2.5 shadow-sm border border-gray-200/60 mb-8"
                >
                  <Sparkles className="w-4 h-4 text-[#45556C]" />
                  <span className="text-[15px] text-[#45556C]" style={{ fontWeight: 500 }}>
                    {copy.hero.badge}
                  </span>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className="mb-12"
                >
                  <h1
                    className="text-5xl sm:text-6xl md:text-[68px] text-[#0f172b] mb-6 tracking-tighter"
                    style={{ fontWeight: 800, lineHeight: 1.1 }}
                  >
                    {copy.hero.headline}
                  </h1>
                  <p
                    className="text-xl sm:text-[24px] md:text-[28px] text-[#4B505B]"
                    style={{ fontWeight: 400, lineHeight: 1.4 }}
                  >
                    {copy.hero.subheadline}
                  </p>
                </motion.div>
              </div>

              {/* ── Practice Widget ── */}
              <motion.div
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 max-w-5xl mx-auto px-6"
              >
                <PracticeWidget onAuthComplete={onAuthComplete} />

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                >
                  {/* Trust badges */}
                  <div className="flex flex-wrap items-center justify-center gap-6 mt-8">
                    {copy.hero.trustBadges.map((t) => (
                      <span key={t} className="flex items-center gap-2 text-[15px] text-[#45556C]">
                        <CheckIcon color="#10B981" />
                        {t}
                      </span>
                    ))}
                  </div>

                  {/* Social proof */}
                  {/* <div className="flex items-center justify-center gap-3 mt-6">
              ... removing this to match Figma since it's not present in the current screenshot
            </div> */}
                </motion.div>
              </motion.div>
            </section>

            {/* ───── HOW IT WORKS ───── */}
            <section id="como-funciona" className="relative py-24 md:py-32 bg-white">
              <DotPattern />
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 max-w-[1200px] mx-auto px-6"
              >
                <SectionHeading
                  title={copy.howItWorks.sectionTitle}
                />
                <div className="mt-16 md:mt-24">
                  <HowItWorksTabs />
                </div>
              </motion.div>
            </section>

            {/* ───── BENEFITS ("Es para ti si...") ───── */}
            <section id="beneficios" className="py-24 md:py-32 bg-[#0f172b] text-white">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="max-w-6xl mx-auto px-6"
              >
                <SectionHeading
                  title={copy.benefits.sectionTitle}
                  subtitle={copy.benefits.sectionSubtitle}
                  light={true}
                />

                <div className="mt-16 grid md:grid-cols-2 gap-6 md:gap-8">
                  {/* Column: For you if */}
                  <motion.div
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="bg-[#1e293b]/80 backdrop-blur-sm rounded-[2rem] p-8 md:p-12 border border-white/10 shadow-2xl"
                  >
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/20 mb-8">
                      <CheckIcon color="#10B981" />
                    </div>
                    <h3 className="text-2xl text-white mb-8" style={{ fontWeight: 600 }}>
                      {copy.benefits.yesTitle}
                    </h3>
                    <ul className="space-y-6">
                      {copy.benefits.yesList.map((item, i) => (
                        <li key={i} className="flex gap-4">
                          <CheckIcon color="#10B981" />
                          <span className="text-[#cbd5e1] leading-relaxed" style={{ fontWeight: 400 }}>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>

                  {/* Column: NOT for you if */}
                  <motion.div
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="bg-[#0f172b] rounded-[2rem] p-8 md:p-12 border border-white/10 opacity-80"
                  >
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-500/10 mb-8">
                      <X className="w-5 h-5 text-red-500" />
                    </div>
                    <h3 className="text-2xl text-white mb-8" style={{ fontWeight: 600 }}>
                      {copy.benefits.noTitle}
                    </h3>
                    <ul className="space-y-6">
                      {copy.benefits.noList.map((item, i) => (
                        <li key={i} className="flex gap-4">
                          <X className="w-5 h-5 text-[#64748b]" />
                          <span className="text-[#94a3b8] leading-relaxed" style={{ fontWeight: 400 }}>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                </div>
              </motion.div>
            </section>

            {/* ───── BEFORE & AFTER ───── */}
            <section className="relative py-24 md:py-32 bg-white">
              <DotPattern />
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 max-w-[1000px] mx-auto px-6"
              >
                <SectionHeading title={copy.beforeAfter.sectionTitle} subtitle={copy.beforeAfter.sectionSubtitle} />
                <div className="mt-16 grid md:grid-cols-2 gap-8 md:gap-10">
                  <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.4 }} className="bg-[#DBEDDF] rounded-[2rem] p-8 md:p-12 shadow-sm border border-[#DBEDDF]/50">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="w-12 h-12 rounded-full bg-[#0f172b] flex items-center justify-center shadow-lg">
                        <Check className="w-6 h-6 text-white" strokeWidth={2.5} />
                      </div>
                      <h3 className="text-2xl text-[#0f172b]" style={{ fontWeight: 600 }}>{copy.beforeAfter.withTitle}</h3>
                    </div>
                    <div className="space-y-6">
                      {copy.beforeAfter.withList.map((item) => (
                        <div key={item} className="flex items-start gap-4">
                          <CheckIcon color="#10B981" />
                          <p className="text-[#334155] leading-relaxed text-[15px]">{item}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                  <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.4 }} className="bg-[#FFE9C7] rounded-[2rem] p-8 md:p-12 shadow-sm border border-[#FFE9C7]/50">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="w-12 h-12 rounded-full bg-[#0f172b]/10 flex items-center justify-center shadow-sm">
                        <X className="w-6 h-6 text-[#0f172b]" strokeWidth={2.5} />
                      </div>
                      <h3 className="text-2xl text-[#0f172b]" style={{ fontWeight: 600 }}>{copy.beforeAfter.withoutTitle}</h3>
                    </div>
                    <div className="space-y-6">
                      {copy.beforeAfter.withoutList.map((item) => (
                        <div key={item} className="flex items-start gap-4">
                          <X className="w-5 h-5 text-[#94a3b8]" />
                          <p className="text-[#475569] leading-relaxed text-[15px]">{item}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </section>

            {/* ───── IMPACT ───── */}
            <section className="py-24 md:py-32 bg-[#f8fafc]">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="max-w-6xl mx-auto px-6"
              >
                <SectionHeading title={copy.impact.sectionTitle} subtitle={copy.impact.sectionSubtitle} />
                <div className="mt-16 grid md:grid-cols-3 gap-6 md:gap-8">
                  {copy.impact.cards.map((card, i) => (
                    <motion.div
                      key={card.stat}
                      whileHover={{ y: -4 }}
                      transition={{ duration: 0.4 }}
                      className={`${["bg-[#E1D5F8]", "bg-[#D9ECF0]", "bg-[#FFE9C7]"][i]} rounded-[2rem] p-8 md:p-10 shadow-sm transition-shadow hover:shadow-md`}
                    >
                      <p className="text-[56px] text-[#0f172b] mb-4 tracking-tight" style={{ fontWeight: 800, lineHeight: 1 }}>{card.stat}</p>
                      <p className="text-[19px] text-[#0f172b] mb-2" style={{ fontWeight: 600 }}>{card.label}</p>
                      <p className="text-[15px] text-[#475569] leading-relaxed">{card.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </section>

            {/* ───── PRICING ───── */}
            <section id="pricing" className="relative py-24 md:py-32 bg-white">
              <DotPattern />
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 max-w-[1000px] mx-auto px-6"
              >
                <SectionHeading title={copy.pricing.sectionTitle} subtitle={copy.pricing.sectionSubtitle} />

                {/* Free session banner */}
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  transition={{ duration: 0.3 }}
                  className="rounded-2xl px-6 py-4 md:px-8 md:py-5 mb-10 max-w-5xl mx-auto border border-[#50C878]/20"
                  style={{ background: "linear-gradient(135deg, rgba(80,200,120,0.08), rgba(0,211,243,0.06))" }}
                >
                  <div className="flex flex-col items-center text-center gap-2.5">
                    {/* Row 1: Title */}
                    <h3 className="text-lg text-gray-900" style={{ fontWeight: 600 }}>{copy.pricing.freeSession.title}</h3>
                    {/* Row 2: Description */}
                    <p className="text-sm text-[#4B505B]">{copy.pricing.freeSession.desc}</p>
                    {/* Row 3: Icon + Features */}
                    <div className="flex items-center justify-center gap-4 flex-wrap">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "linear-gradient(135deg, #00D3F3, #50C878)" }}>
                        <Gift className="w-4.5 h-4.5 text-white" />
                      </div>
                      {copy.pricing.freeSession.features.map((f) => (
                        <span key={f} className="flex items-center gap-1.5 text-xs text-[#4B505B]">
                          <CheckIcon color="#50C878" />
                          {f}
                        </span>
                      ))}
                    </div>
                    {/* Row 4: CTA */}
                    <motion.button
                      whileTap={{ scale: 0.96 }}
                      className="px-6 py-2.5 rounded-full text-sm text-white transition-colors mt-0.5"
                      style={{ fontWeight: 500, background: "linear-gradient(135deg, #00D3F3, #50C878)" }}
                      onClick={() => openAuth("registro", "cta")}
                    >
                      {copy.pricing.freeSession.button}
                      <ArrowRight className="w-4 h-4 inline ml-1.5" />
                    </motion.button>
                  </div>
                </motion.div>

                {/* Credit packs grid */}
                <div className="grid md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto mb-12">
                  {copy.pricing.packs.map((pack) => {
                    const isFeatured = pack.featured;
                    return (
                      <motion.div
                        key={pack.sessions}
                        whileHover={{ y: -6 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className={`relative rounded-3xl p-6 md:p-8 flex flex-col transition-shadow ${isFeatured
                          ? "bg-[#0f172b] shadow-2xl ring-2 ring-[#00D3F3]/30 md:-mt-4 md:mb-[-16px]"
                          : "bg-white border border-[#e2e8f0] hover:shadow-xl"
                          }`}
                      >
                        {/* Badge */}
                        {pack.discount && (
                          <div className={`absolute -top-3 right-6 px-3 py-1.5 rounded-full text-xs shadow-sm ${isFeatured
                            ? "bg-[#50C878] text-white"
                            : "bg-[#f1f5f9] text-[#0f172b] border border-[#e2e8f0]"
                            }`} style={{ fontWeight: 700 }}>
                            -{pack.discount}
                          </div>
                        )}

                        {/* Pack name */}
                        <p className={`text-[15px] mb-4 ${isFeatured ? "text-slate-300" : "text-[#475569]"}`} style={{ fontWeight: 600 }}>
                          {pack.name}
                        </p>

                        {/* Price */}
                        <div className="mb-2">
                          <span className={`text-4xl md:text-5xl ${isFeatured ? "text-white" : "text-[#0f172b]"}`} style={{ fontWeight: 800, letterSpacing: "-0.02em" }}>
                            {pack.price}
                          </span>
                          <span className={`text-sm ml-1.5 ${isFeatured ? "text-slate-400" : "text-[#64748b]"}`} style={{ fontWeight: 500 }}>USD</span>
                        </div>

                        {/* Per-session */}
                        <div className={`flex items-center gap-2 mb-6 ${isFeatured ? "text-[#00D3F3]" : "text-[#10B981]"}`}>
                          <Zap className="w-3.5 h-3.5" />
                          <span className="text-[13px]" style={{ fontWeight: 600 }}>
                            {pack.perSession} {copy.pricing.perSessionLabel}
                          </span>
                        </div>

                        {/* CTA */}
                        <motion.button
                          whileTap={{ scale: 0.97 }}
                          className={`w-full py-3 rounded-full text-[15px] mb-6 transition-all ${isFeatured
                            ? "bg-white text-[#0f172b] hover:bg-gray-100 shadow-md"
                            : "bg-[#f8fafc] border border-[#cbd5e1] text-[#0f172b] hover:border-[#94a3b8] hover:bg-white"
                            }`}
                          style={{ fontWeight: 600 }}
                          onClick={() => openAuth("registro")}
                        >
                          {pack.button}
                        </motion.button>

                        {/* Features */}
                        <div className={`border-t pt-5 space-y-3 mt-auto ${isFeatured ? "border-white/10" : "border-[#e2e8f0]"}`}>
                          {pack.features.map((f) => (
                            <div key={f} className="flex items-start gap-2.5">
                              <CheckIcon color={isFeatured ? "#38bdf8" : "#10B981"} />
                              <p className={`text-[13px] leading-relaxed ${isFeatured ? "text-slate-300" : "text-[#475569]"}`}>{f}</p>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                <p className="text-center text-[#475569] text-[15px] mb-12">
                  <span style={{ fontWeight: 500 }}>{copy.pricing.freeTrialNote}</span>
                </p>
                <div className="bg-[#f8fafc] rounded-[2rem] p-10 md:p-14 border border-[#e2e8f0]">
                  <div className="grid grid-cols-3 gap-10 text-center">
                    {copy.pricing.statsBar.map((s) => (
                      <div key={s.value}>
                        <p className="text-4xl md:text-5xl text-[#0f172b] mb-3" style={{ fontWeight: 800, letterSpacing: "-0.02em" }}>{s.value}</p>
                        <p className="text-[15px] text-[#475569]" style={{ fontWeight: 500 }}>{s.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </section>

            {/* ───── FAQ ───── */}
            <section className="py-24 md:py-32 bg-[#f8fafc]">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="max-w-3xl mx-auto px-6"
              >
                <SectionHeading title={copy.faq.sectionTitle} subtitle={copy.faq.sectionSubtitle} />
                <div className="space-y-4">
                  {copy.faq.items.map((faq, i) => (
                    <div
                      key={`${lang}-${i}`}
                      className={`bg-white rounded-2xl border transition-colors duration-300 overflow-hidden ${openFaq === i ? "border-[#00D3F3]/50 shadow-sm" : "border-[#e2e8f0] hover:border-[#cbd5e1]"}`}
                    >
                      <button
                        className="w-full flex items-center justify-between gap-4 px-6 md:px-8 py-6 text-left"
                        onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      >
                        <span className="text-[17px] text-[#0f172b]" style={{ fontWeight: 600 }}>{faq.q}</span>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${openFaq === i ? "bg-[#00D3F3]/10" : "bg-[#f1f5f9]"}`}>
                          <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${openFaq === i ? "rotate-180 text-[#00D3F3]" : "text-[#64748b]"}`} />
                        </div>
                      </button>
                      <div className="grid transition-all duration-300 ease-in-out" style={{ gridTemplateRows: openFaq === i ? "1fr" : "0fr" }}>
                        <div className="overflow-hidden">
                          <p className="px-6 md:px-8 pb-6 text-[15px] text-[#475569] leading-relaxed">{faq.a}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </section>

            {/* ───── FINAL CTA ───── */}
            <section className="relative py-24 md:py-32 bg-white -mt-px">
              <DotPattern />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 max-w-4xl mx-auto px-6 text-center"
              >
                <h2 className="text-4xl md:text-[56px] text-[#0f172b] mb-6 tracking-tight" style={{ fontWeight: 600, lineHeight: 1.15 }}>
                  {copy.finalCta.headline1}
                  <br />
                  <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, #00D3F3 0%, #50C878 100%)" }}>{copy.finalCta.headline2}</span>
                </h2>
                <p className="text-xl md:text-[22px] text-[#475569] mb-12" style={{ fontWeight: 400 }}>{copy.finalCta.subline}</p>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  className="bg-[#0f172b] text-white px-10 py-4 rounded-full inline-flex items-center gap-2 hover:bg-[#1e293b] transition-colors shadow-lg shadow-[#0f172b]/20 text-[17px] mb-10"
                  style={{ fontWeight: 600 }}
                  onClick={() => openAuth("registro", "cta")}
                >
                  {copy.finalCta.button}
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
                <div className="flex flex-wrap items-center justify-center gap-8">
                  {copy.finalCta.badges.map((t) => (
                    <span key={t} className="flex items-center gap-2 text-[15px] text-[#475569]" style={{ fontWeight: 500 }}>
                      <CheckIcon color="#10B981" />
                      {t}
                    </span>
                  ))}
                </div>
              </motion.div>
            </section>

            {/* ───── FOOTER ───── */}
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
                        {col.items.map((item) => (
                          <a key={item} className="block text-[#4B505B] hover:text-gray-900 cursor-pointer transition-colors">{item}</a>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-200 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <p className="text-[#4B505B] text-sm">{copy.footer.copyright}</p>
                    <a href="#design-system" className="text-[#4B505B]/50 hover:text-[#4B505B] text-xs transition-colors">Design System</a>
                    <a href="#dashboard" className="text-[#4B505B]/50 hover:text-[#4B505B] text-xs transition-colors">{copy.footer.dashboardLink}</a>
                  </div>
                  <div className="flex items-center gap-4">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="#4B505B"><path d={svgPaths.p3e7f1900} /></svg>
                    <div className="w-5 h-5 relative">
                      <svg width="20" height="16.26" viewBox="0 0 20 16.2554" fill="#4B505B"><path d={svgPaths.p186b65f0} /></svg>
                    </div>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="#4B505B"><path d={svgPaths.p9d76b80} /></svg>
                  </div>
                </div>
              </div>
            </footer>

          </motion.div>
        </AnimatePresence>

        {/* ───── AUTH MODAL ───── */}
        <AuthModal
          open={authOpen}
          mode={authMode}
          variant={authVariant}
          onClose={() => setAuthOpen(false)}
          onToggleMode={toggleAuthMode}
          onAuthComplete={() => {
            setAuthOpen(false);
          }}
        />
      </div >
    </LandingLangProvider >
  );
}