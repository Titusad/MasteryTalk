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
    <div aria-label="LandingPage" ref={ref} className="relative">
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
  onGoToDashboard,
  onPricingPurchase,
}: {
  onAuthComplete?: (data: SetupModalResult, authMode?: "login" | "registro") => void;
  landingLang?: LandingLang;
  onLangChange?: (l: LandingLang) => void;
  authUser?: import("../../services/types").User | null;
  onLogout?: () => void;
  onGoToDashboard?: () => void;
  /** Triggered when an authenticated user clicks a pricing CTA */
  onPricingPurchase?: () => void;
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

  /** Pricing CTA handler: if logged in → show purchase modal, else auth first */
  const handlePricingClick = () => {
    if (authUser) {
      onPricingPurchase?.();
    } else {
      // Flag the purchase intent so App.tsx can open the modal after auth
      sessionStorage.setItem("masterytalk_purchase_intent", "true");
      openAuth("registro");
    }
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
      <div className="w-full min-h-full bg-white overflow-x-hidden">
        {/* ───── HEADER ───── */}
        <header className="fixed top-0 left-0 w-full z-50 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between px-6 md:px-8 h-16">
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
                  <button className="bg-[#2d2d2d] text-white text-sm px-6 py-2.5 rounded-full hover:bg-[#1a1a1a] transition-colors" onClick={() => openAuth("registro")}>
                    {copy.nav.cta}
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
                <button className="w-full bg-[#2d2d2d] text-white py-3 rounded-full mt-2" style={{ fontWeight: 500 }} onClick={() => { setMobileMenuOpen(false); openAuth("registro"); }}>{copy.nav.cta}</button>
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
                <PracticeWidget onAuthComplete={onAuthComplete} onOpenAuth={() => openAuth("registro")} />

                {/* Microcopy */}
                <p className="text-center text-sm text-[#4B505B] mt-6">
                  {copy.widget.microcopy}
                </p>
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

            {/* ───── EL PROGRAMA ───── */}
            <section className="py-20 md:py-28 bg-[#f0f4f8]">
              <div className="max-w-6xl mx-auto px-6">
                <SectionHeading title={copy.programa.sectionTitle} />
                <p className="text-center text-[#4B505B] max-w-2xl mx-auto mb-14 -mt-6">{copy.programa.subtitle}</p>
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  {copy.programa.blocks.map((block, i) => (
                    <div key={block.phase} className="bg-white rounded-2xl border border-[#e2e8f0] p-8 flex flex-col gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-medium text-[#0f172b] bg-[#f0f4f8] px-2.5 py-1 rounded-full">{block.phase}</span>
                        <span className="text-[11px] text-[#94a3b8]">{block.duration}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-[#0f172b] text-white text-sm font-medium flex items-center justify-center shrink-0">{i + 1}</span>
                        <h3 className="font-medium text-[#0f172b]">{block.title}</h3>
                      </div>
                      <p className="text-sm text-[#4B505B] leading-relaxed">{block.desc}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-[#0f172b] rounded-2xl px-8 py-6 flex flex-col md:flex-row items-start md:items-center gap-4">
                  <div className="flex-1">
                    <p className="text-white font-medium text-sm">{copy.programa.warRoom.label}</p>
                    <p className="text-[#94a3b8] text-sm mt-1">{copy.programa.warRoom.desc}</p>
                  </div>
                </div>
              </div>
            </section>

            {/* ───── DIFFERENTIATORS ───── */}
            <section className="py-20 md:py-28 bg-white">
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

            {/* ───── FOR YOU / BENEFITS ───── */}
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

            {/* ───── BEFORE & AFTER ───── */}
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

            {/* ───── SESSION TAKEAWAYS ───── */}
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

            {/* ───── ROUTES ───── */}
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

            {/* ───── PRICING ───── */}
            <section id="pricing" className="relative py-20 md:py-28 bg-white">
              <DotPattern />
              <div className="relative z-10 max-w-4xl mx-auto px-6">
                <div className="text-center mb-4">
                  <h2 className="text-3xl md:text-4xl text-gray-900 mb-2" style={{ fontWeight: 700 }}>{copy.pricing.headline}</h2>
                  <span className="inline-block text-xs font-semibold bg-amber-100 text-amber-700 px-3 py-1 rounded-full mb-3">{copy.pricing.launchBadge}</span>
                </div>
                <p className="text-center text-[#4B505B] mb-12">{copy.pricing.subtitle}</p>

                {/* Pricing cards */}
                <div className="grid md:grid-cols-2 gap-6 mb-10 max-w-3xl mx-auto">
                  {/* Monthly */}
                  <div className="relative rounded-2xl p-6 md:p-8 flex flex-col bg-[#2d2d2d] shadow-xl ring-2 ring-[#50C878]/30">
                    <p className="text-sm text-white mb-3" style={{ fontWeight: 600 }}>{copy.pricing.monthly.label}</p>
                    <div className="mb-1">
                      <span className="text-4xl md:text-5xl text-white" style={{ fontWeight: 800 }}>$12.99</span>
                      <span className="text-sm text-white/60 ml-1">{copy.pricing.monthly.period}</span>
                      <span className="ml-2 text-sm line-through text-white/30">$19.99</span>
                    </div>
                    <ul className="space-y-1.5 mb-6 mt-4">
                      {copy.pricing.monthly.features.map(f => (
                        <li key={f} className="flex items-center gap-2 text-xs text-white/80">
                          <span className="text-emerald-400">✓</span>{f}
                        </li>
                      ))}
                    </ul>
                    <button className="w-full py-3 rounded-full text-sm bg-white text-[#2d2d2d] hover:bg-gray-100 transition-colors mt-auto shadow-lg" style={{ fontWeight: 500 }} onClick={handlePricingClick}>
                      {copy.pricing.modal.cta}
                    </button>
                  </div>

                  {/* Quarterly */}
                  <div className="relative rounded-2xl p-6 md:p-8 flex flex-col bg-white border border-gray-200 hover:shadow-md transition-shadow">
                    <span className="absolute -top-3 left-6 text-[10px] font-semibold bg-[#DBEDDF] text-[#0f172b] px-2.5 py-1 rounded-full">{copy.pricing.saveBadge}</span>
                    <p className="text-sm text-gray-900 mb-3" style={{ fontWeight: 600 }}>{copy.pricing.quarterly.label}</p>
                    <div className="mb-1">
                      <span className="text-4xl md:text-5xl text-[#2d2d2d]" style={{ fontWeight: 800 }}>$29.99</span>
                      <span className="text-sm text-[#94a3b8] ml-1">{copy.pricing.quarterly.period}</span>
                      <span className="ml-2 text-sm line-through text-[#94a3b8]">$47.99</span>
                    </div>
                    <p className="text-xs text-[#62748e] mb-4">{copy.pricing.quarterly.perMonth.replace("{{price}}", "$9.99")}</p>
                    <ul className="space-y-1.5 mb-6">
                      {copy.pricing.quarterly.features.map(f => (
                        <li key={f} className="flex items-center gap-2 text-xs text-[#45556c]">
                          <span className="text-emerald-500">✓</span>{f}
                        </li>
                      ))}
                    </ul>
                    <button className="w-full py-3 rounded-full text-sm border-2 border-[#2d2d2d] text-gray-900 hover:bg-gray-50 transition-colors mt-auto" style={{ fontWeight: 500 }} onClick={handlePricingClick}>
                      {copy.pricing.modal.cta}
                    </button>
                  </div>
                </div>

                {/* Demo reinforcement */}
                <div
                  className="rounded-2xl px-6 py-4 text-center border border-[#50C878]/20 max-w-3xl mx-auto"
                  style={{ background: "linear-gradient(135deg, rgba(80,200,120,0.08), rgba(0,211,243,0.06))" }}
                >
                  <p className="text-sm text-[#4B505B]" style={{ fontWeight: 500 }}>{copy.pricing.demoLine}</p>
                </div>
              </div>
            </section>

            {/* ───── FAQ ───── */}
            <section className="py-20 md:py-28 bg-[#f0f4f8]">
              <div className="max-w-3xl mx-auto px-6">
                <SectionHeading title={copy.faq.sectionTitle} />
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
                        {col.items.map((item) => {
                          // Wire Legal column items to actual routes
                          const legalRoutes: Record<string, string> = {
                            "Privacidad": "#privacy", "Privacy": "#privacy", "Privacidade": "#privacy",
                            "Términos": "#terms", "Terms": "#terms", "Termos": "#terms",
                            "Cookies": "#cookies",
                            "Transparencia IA": "#transparency", "AI Transparency": "#transparency", "Transparência IA": "#transparency",
                          };
                          const href = legalRoutes[item];
                          return href ? (
                            <a key={item} href={href} className="block text-[#4B505B] hover:text-gray-900 cursor-pointer transition-colors">{item}</a>
                          ) : (
                            <a key={item} className="block text-[#4B505B] hover:text-gray-900 cursor-pointer transition-colors">{item}</a>
                          );
                        })}
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