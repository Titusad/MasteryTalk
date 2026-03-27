import { useState, useEffect, useRef } from "react";
import svgPaths from "../../imports/svg-tv6st9nzh5";
import {
  Check,
  X,
  ArrowRight,
  Sparkles,
  ChevronDown,
  Zap,
  Gift,
  Globe,
  LogOut,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { PracticeWidget } from "./PracticeWidget";
import type { SetupModalResult } from "./PracticeWidget";
import { BrandLogo, SectionHeading, CheckIcon, XIcon, DotPattern } from "../../app/components/shared";
import { AuthModal, type AuthMode } from "./AuthModal";
import { HowItWorksTabs } from "./HowItWorksTabs";
import { LANDING_COPIES, type LandingLang } from "../shared/i18n/landing-i18n";
import { LandingLangProvider } from "../../shared/i18n/LandingLangContext";

/* ═══════════════ LANGUAGE SWITCHER ═══════════════ */
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
        <ChevronDown
          className="w-3 h-3 text-[#94a3b8] transition-transform"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        />
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
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-xs transition-colors ${lang === opt.code
                    ? "bg-[#f1f5f9] text-[#0f172b]"
                    : "text-[#475569] hover:bg-[#f8fafc] hover:text-[#0f172b]"
                  }`}
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

/* ═══════════════════════ MAIN COMPONENT ═══════════════════════ */
export function LandingPage({
  onAuthComplete,
  landingLang,
  onLangChange,
  authUser,
  onLogout,
  onGoToDashboard
}: {
  onAuthComplete?: (data: SetupModalResult, authMode?: "login" | "registro") => void;
  landingLang?: LandingLang;
  onLangChange?: (l: LandingLang) => void;
  authUser?: import("../../services/types").User | null;
  onLogout?: () => void;
  onGoToDashboard?: () => void;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [lang, setLangLocal] = useState<LandingLang>(landingLang ?? "es");
  const setLang = (l: LandingLang) => { setLangLocal(l); onLangChange?.(l); };
  const copy = LANDING_COPIES[lang];

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

  const toggleAuthMode = () => {
    setAuthMode((prev) => (prev === "login" ? "registro" : "login"));
  };

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
              <a href="#how" className="text-[#4B505B] hover:text-gray-900 text-sm transition-colors">{copy.nav.howItWorks}</a>
              <a href="#benefits" className="text-[#4B505B] hover:text-gray-900 text-sm transition-colors">{copy.nav.benefits}</a>
              <a href="#pricing" className="text-[#4B505B] hover:text-gray-900 text-sm transition-colors">{copy.nav.pricing}</a>
            </nav>
            <div className="hidden md:flex items-center gap-3">
              <LanguageSwitcher lang={lang} onChange={setLang} />
              {authUser ? (
                <>
                  <span className="text-sm text-[#4B505B] font-medium mr-2 max-w-[150px] truncate" title={authUser.email || ""}>
                    Hola {authUser.displayName ? authUser.displayName.split(" ")[0] : "Usuario"}
                  </span>
                  <button className="text-[#4B505B] hover:text-gray-900 text-sm transition-colors p-2" onClick={onLogout} title="Cerrar sesión">
                    <LogOut className="w-4 h-4" />
                  </button>
                  <button className="bg-[#2d2d2d] text-white text-sm px-6 py-2.5 rounded-full hover:bg-[#1a1a1a] transition-colors" onClick={onGoToDashboard}>
                    Dashboard
                  </button>
                </>
              ) : (
                <>
                  <button className="text-[#4B505B] hover:text-gray-900 text-sm transition-colors" onClick={() => openAuth("login")}>{copy.nav.login}</button>
                  <button className="bg-[#2d2d2d] text-white text-sm px-6 py-2.5 rounded-full hover:bg-[#1a1a1a] transition-colors" onClick={() => {
                    document.querySelector('#hero')?.scrollIntoView({ behavior: 'smooth' });
                  }}>
                    {copy.nav.register}
                  </button>
                </>
              )}
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
              <a href="#how" className="block text-[#4B505B] py-2" onClick={() => setMobileMenuOpen(false)}>{copy.nav.howItWorks}</a>
              <a href="#benefits" className="block text-[#4B505B] py-2" onClick={() => setMobileMenuOpen(false)}>{copy.nav.benefits}</a>
              <a href="#pricing" className="block text-[#4B505B] py-2" onClick={() => setMobileMenuOpen(false)}>{copy.nav.pricing}</a>
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
                <button className="w-full bg-[#2d2d2d] text-white py-3 rounded-full mt-2" style={{ fontWeight: 500 }} onClick={() => { setMobileMenuOpen(false); document.querySelector('#hero')?.scrollIntoView({ behavior: 'smooth' }); }}>{copy.nav.register}</button>
              )}
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
            <section id="hero" className="bg-[#f0f4f8] pt-20 md:pt-[126px] pb-20 md:pb-28 overflow-hidden relative">
              {/* ── Abstract pastel blobs ── */}
              <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
                <div className="absolute -top-20 -left-24 w-[420px] h-[420px] rounded-full opacity-60" style={{ background: "#FFE9C7", filter: "blur(80px)" }} />
                <div className="absolute -top-10 -right-32 w-[380px] h-[380px] rounded-full opacity-50" style={{ background: "#D9ECF0", filter: "blur(90px)" }} />
                <div className="absolute top-1/2 -left-16 w-[300px] h-[300px] rounded-full opacity-50" style={{ background: "#DBEDDF", filter: "blur(80px)" }} />
                <div className="absolute bottom-0 right-0 w-[350px] h-[350px] rounded-full opacity-40" style={{ background: "#E1D4FF", filter: "blur(100px)" }} />
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[200px] rounded-full opacity-25" style={{ background: "#E1D5F8", filter: "blur(100px)" }} />
              </div>

              {/* ── Value Proposition ── */}
              <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
                <div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm border border-gray-200 mb-8">
                  <Sparkles className="w-4 h-4 text-[#2d2d2d]" />
                  <span className="text-sm text-[#4B505B]" style={{ fontWeight: 500 }}>
                    {copy.hero.badge}
                  </span>
                </div>

                <div className="mb-10">
                  <h1
                    className="text-3xl md:text-[2rem] text-gray-900 mb-1"
                    style={{ fontWeight: 600, lineHeight: 1.3 }}
                  >
                    {copy.hero.headline}
                  </h1>
                  <p
                    className="text-[24px] text-[#4B505B]"
                    style={{ fontWeight: 400, lineHeight: 1.3 }}
                  >
                    {copy.hero.subheadline}
                  </p>
                </div>
              </div>

              {/* ── Practice Widget ── */}
              <div className="relative z-10 max-w-5xl mx-auto px-6">
                <PracticeWidget onAuthComplete={onAuthComplete} />

                {/* Trust badges */}
                <div className="flex flex-wrap items-center justify-center gap-5 mt-6">
                  {copy.hero.trustBadges.map((t) => (
                    <span key={t} className="flex items-center gap-2 text-sm text-[#4B505B]">
                      <CheckIcon />
                      {t}
                    </span>
                  ))}
                </div>

                {/* Social proof */}
                <div className="flex items-center justify-center gap-3 mt-6">
                  <div className="flex -space-x-2">
                    {[
                      "https://images.unsplash.com/photo-1589220286904-3dcef62c68ee?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYXRpbiUyMHByb2Zlc3Npb25hbCUyMHdvbWFuJTIwaGVhZHNob3R8ZW58MXx8fHwxNzcwODQ3MTk4fDA&ixlib=rb-4.1.0&q=80&w=1080",
                      "https://images.unsplash.com/photo-1766169776624-24399cc458ed?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYXRpbiUyMHByb2Zlc3Npb25hbCUyMG1hbiUyMHBvcnRyYWl0fGVufDF8fHx8MTc3MDg0NzE5OHww&ixlib=rb-4.1.0&q=80&w=1080",
                      "https://images.unsplash.com/photo-1652471949169-9c587e8898cd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b21hbiUyMGJ1c2luZXNzJTIwaGVhZHNob3R8ZW58MXx8fHwxNzcwNzUxNDcyfDA&ixlib=rb-4.1.0&q=80&w=1080",
                      "https://images.unsplash.com/photo-1629507208649-70919ca33793?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBtYW4lMjBidXNpbmVzcyUyMHBvcnRyYWl0fGVufDF8fHx8MTc3MDc5MDUzNXww&ixlib=rb-4.1.0&q=80&w=1080",
                    ].map((src, i) => (
                      <img key={i} src={src} alt="" className="w-7 h-7 rounded-full object-cover border-2 border-[#f0f4f8]" />
                    ))}
                  </div>
                  <p className="text-sm text-[#4B505B]">
                    <span className="text-gray-900" style={{ fontWeight: 600 }}>{copy.hero.socialProofHighlight}</span> {copy.hero.socialProof}
                  </p>
                </div>
              </div>
            </section>

            {/* ───── HOW IT WORKS ───── */}
            <section id="how" className="relative py-20 md:py-28 bg-white">
              <DotPattern />
              <div className="relative z-10 max-w-6xl mx-auto px-6">
                <SectionHeading title={copy.howItWorks.sectionTitle} />
                <HowItWorksTabs />
              </div>
            </section>

            {/* ───── FOR YOU ───── */}
            <section id="benefits" className="py-20 md:py-28 bg-[#f0f4f8]">
              <div className="max-w-6xl mx-auto px-6">
                <SectionHeading title={copy.benefits.sectionTitle} subtitle={copy.benefits.sectionSubtitle} />
                <div className="grid md:grid-cols-2 gap-6 mb-12">
                  <div className="bg-white rounded-3xl p-8 border border-gray-200">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-full bg-[#00C950] flex items-center justify-center">
                        <Check className="w-5 h-5 text-white" strokeWidth={3} />
                      </div>
                      <h3 className="text-xl text-gray-900" style={{ fontWeight: 600 }}>{copy.benefits.yesTitle}</h3>
                    </div>
                    <div className="space-y-4">
                      {copy.benefits.yesList.map((item) => (
                        <div key={item} className="flex items-start gap-3"><CheckIcon /><p className="text-gray-600">{item}</p></div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white rounded-3xl p-8 border border-gray-200">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-full bg-[#cad5e2] flex items-center justify-center">
                        <X className="w-5 h-5 text-[#45556C]" strokeWidth={3} />
                      </div>
                      <h3 className="text-xl text-gray-900" style={{ fontWeight: 600 }}>{copy.benefits.noTitle}</h3>
                    </div>
                    <div className="space-y-4">
                      {copy.benefits.noList.map((item) => (
                        <div key={item} className="flex items-start gap-3"><XIcon /><p className="text-gray-600">{item}</p></div>
                      ))}
                    </div>
                  </div>
                </div>
                <div
                  className="bg-white rounded-2xl p-6 border border-[#50C87833] text-center"
                  style={{ background: "linear-gradient(90deg, rgba(80,200,120,0.06), rgba(0,184,219,0.06), rgba(80,200,120,0.06))" }}
                >
                  <p className="text-gray-600">
                    <span className="text-[#50C878]" style={{ fontWeight: 600 }}>{copy.benefits.levelLabel}</span>{" "}
                    {copy.benefits.levelDesc}
                  </p>
                </div>
              </div>
            </section>

            {/* ───── BEFORE & AFTER ───── */}
            <section className="relative py-20 md:py-28 bg-white">
              <DotPattern />
              <div className="relative z-10 max-w-6xl mx-auto px-6">
                <SectionHeading title={copy.beforeAfter.sectionTitle} subtitle={copy.beforeAfter.sectionSubtitle} />
                <div className="grid md:grid-cols-2 gap-6">
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
                </div>
              </div>
            </section>

            {/* ───── IMPACT ───── */}
            <section className="py-20 md:py-28 bg-[#f0f4f8]">
              <div className="max-w-6xl mx-auto px-6">
                <SectionHeading title={copy.impact.sectionTitle} subtitle={copy.impact.sectionSubtitle} />
                <div className="grid md:grid-cols-3 gap-6">
                  {copy.impact.cards.map((card, i) => (
                    <div key={card.stat} className={`${["bg-[#E1D5F8]", "bg-[#D9ECF0]", "bg-[#E1D5F8]"][i]} rounded-3xl p-8`}>
                      <p className="text-6xl text-[#2d2d2d] mb-4" style={{ fontWeight: 800 }}>{card.stat}</p>
                      <p className="text-lg text-gray-900 mb-1" style={{ fontWeight: 500 }}>{card.label}</p>
                      <p className="text-[#4B505B]">{card.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* ───── PRICING ───── */}
            <section id="pricing" className="relative py-20 md:py-28 bg-white">
              <DotPattern />
              <div className="relative z-10 max-w-6xl mx-auto px-6">
                <SectionHeading title={copy.pricing.sectionTitle} subtitle={copy.pricing.sectionSubtitle} />

                {/* Free session banner */}
                <div
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
                    <button
                      className="px-6 py-2.5 rounded-full text-sm text-white transition-colors mt-0.5"
                      style={{ fontWeight: 500, background: "linear-gradient(135deg, #00D3F3, #50C878)" }}
                      onClick={() => openAuth("registro", "cta")}
                    >
                      {copy.pricing.freeSession.button}
                      <ArrowRight className="w-4 h-4 inline ml-1.5" />
                    </button>
                  </div>
                </div>

                {/* Credit packs grid */}
                <div className="grid md:grid-cols-3 gap-4 md:gap-5 max-w-5xl mx-auto mb-10">
                  {copy.pricing.packs.map((pack) => {
                    const isFeatured = pack.featured;
                    return (
                      <div
                        key={pack.sessions}
                        className={`relative rounded-2xl p-5 md:p-6 flex flex-col transition-shadow ${isFeatured
                            ? "bg-[#2d2d2d] shadow-xl ring-2 ring-[#50C878]/30 md:-mt-2 md:mb-[-8px]"
                            : "bg-white border border-gray-200 hover:shadow-md"
                          }`}
                      >
                        {/* Badge */}
                        {pack.discount && (
                          <div className={`absolute -top-2.5 right-4 px-2.5 py-1 rounded-full text-[10px] ${isFeatured
                              ? "bg-[#50C878] text-white"
                              : "bg-[#f0f4f8] text-[#2d2d2d] border border-gray-200"
                            }`} style={{ fontWeight: 600 }}>
                            -{pack.discount}
                          </div>
                        )}

                        {/* Pack name */}
                        <p className={`text-sm mb-3 ${isFeatured ? "text-gray-400" : "text-[#4B505B]"}`} style={{ fontWeight: 500 }}>
                          {pack.name}
                        </p>

                        {/* Price */}
                        <div className="mb-1">
                          <span className={`text-3xl md:text-4xl ${isFeatured ? "text-white" : "text-[#2d2d2d]"}`} style={{ fontWeight: 800 }}>
                            {pack.price}
                          </span>
                          <span className={`text-xs ml-1 ${isFeatured ? "text-gray-400" : "text-[#4B505B]"}`}>USD</span>
                        </div>

                        {/* Per-session */}
                        <div className={`flex items-center gap-1.5 mb-5 ${isFeatured ? "text-emerald-300" : "text-[#4B505B]"}`}>
                          <Zap className="w-3 h-3" />
                          <span className="text-xs" style={{ fontWeight: 500 }}>
                            {pack.perSession} {copy.pricing.perSessionLabel}
                          </span>
                        </div>

                        {/* CTA */}
                        <button
                          className={`w-full py-2.5 rounded-full text-sm mb-5 transition-colors ${isFeatured
                              ? "bg-white text-[#2d2d2d] hover:bg-gray-100 shadow-lg"
                              : "border-2 border-[#2d2d2d] text-gray-900 hover:bg-gray-50"
                            }`}
                          style={{ fontWeight: 500 }}
                          onClick={() => openAuth("registro")}
                        >
                          {pack.button}
                        </button>

                        {/* Features */}
                        <div className={`border-t pt-4 space-y-2.5 mt-auto ${isFeatured ? "border-white/20" : "border-gray-200/60"}`}>
                          {pack.features.map((f) => (
                            <div key={f} className="flex items-start gap-2">
                              <CheckIcon color={isFeatured ? "#ffffff" : "#2d2d2d"} />
                              <p className={`text-xs ${isFeatured ? "text-gray-300" : "text-gray-600"}`}>{f}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <p className="text-center text-[#4B505B] text-sm mb-10">
                  <span style={{ fontWeight: 500 }}>{copy.pricing.freeTrialNote}</span>
                </p>
                <div className="bg-[#f0f4f8] rounded-3xl p-10 md:p-14">
                  <div className="grid grid-cols-3 gap-10 text-center">
                    {copy.pricing.statsBar.map((s) => (
                      <div key={s.value}>
                        <p className="text-4xl md:text-5xl text-[#2d2d2d] mb-3" style={{ fontWeight: 800 }}>{s.value}</p>
                        <p className="text-base text-[#4B505B]">{s.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* ───── FAQ ───── */}
            <section className="py-20 md:py-28 bg-[#f0f4f8]">
              <div className="max-w-3xl mx-auto px-6">
                <SectionHeading title={copy.faq.sectionTitle} subtitle={copy.faq.sectionSubtitle} />
                <div className="space-y-3">
                  {copy.faq.items.map((faq, i) => (
                    <div
                      key={`${lang}-${i}`}
                      className="bg-white rounded-2xl border border-gray-200 overflow-hidden"
                    >
                      <button
                        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
                        onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      >
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

            {/* ───── FINAL CTA ───── */}
            <section className="relative py-24 md:py-32 bg-white -mt-px">
              <DotPattern />
              <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
                <h2 className="text-4xl md:text-5xl text-gray-900 mb-4" style={{ fontWeight: 300, lineHeight: 1.15 }}>
                  {copy.finalCta.headline1}
                  <br />
                  <span style={{ fontWeight: 500 }}>{copy.finalCta.headline2}</span>
                </h2>
                <p className="text-xl text-[#4B505B] mb-10">{copy.finalCta.subline}</p>
                <button className="bg-[#2d2d2d] text-white px-10 py-4 rounded-full inline-flex items-center gap-2 hover:bg-[#1a1a1a] transition-colors shadow-lg text-lg mb-8" style={{ fontWeight: 500 }} onClick={() => openAuth("registro", "cta")}>
                  {copy.finalCta.button}
                  <ArrowRight className="w-5 h-5" />
                </button>
                <div className="flex flex-wrap items-center justify-center gap-6">
                  {copy.finalCta.badges.map((t) => (
                    <span key={t} className="flex items-center gap-2 text-sm text-[#4B505B]">
                      <CheckIcon />
                      {t}
                    </span>
                  ))}
                </div>
              </div>
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
      </div>
    </LandingLangProvider>
  );
}