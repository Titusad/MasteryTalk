import { useState } from "react";
import {
  Check,
  X,
  Target,
  MessageSquare,
  TrendingUp,
  ArrowRight,
  Zap,
  Sparkles,
  ChevronDown,
  Copy,
  ArrowLeft,
  Palette,
  Type,
  Layout,
  Box,
  Grid3x3,
  Mic,
  CheckCircle2,
  Star,
  Shield,
} from "lucide-react";
import { motion } from "motion/react";
import {
  BrandLogo,
  SectionHeading,
  CheckIcon,
  XIcon,
  DotPattern,
  PastelBlobs,
  MiniFooter,
  PricingCard,
  COLORS,
  PageTitleBlock,
  AccuracyRing,
  HighlightWithTooltip,
  StageBadge,
  SubtleTextLink,
  RecordButton,
  RecordingWaveformBars,
  RecordingTimer,
  highlightEnglish,
  renderStressedPhrase,
} from "./shared";
import {
  PhaseIndicator,
  ArenaProgressBar,
} from "./arena/ArenaSystem";
import { ServiceErrorBanner } from "./shared/ServiceErrorBanner";
import { ServiceError } from "../../services/errors";

/* ══════════════════════════════════════════════════════════════
   DESIGN SYSTEM HELPERS
   ══════════════════════════════════════════════════════════════ */

function DSSection({
  id,
  icon,
  title,
  description,
  children,
  bg = "bg-white",
}: {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
  bg?: string;
}) {
  return (
    <section id={id} className={`py-16 md:py-20 ${bg}`}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-xl bg-[#2d2d2d] flex items-center justify-center shrink-0">
            {icon}
          </div>
          <h2 className="text-2xl text-gray-900" style={{ fontWeight: 600 }}>
            {title}
          </h2>
        </div>
        <p className="text-[#4B505B] mb-10 ml-12">{description}</p>
        {children}
      </div>
    </section>
  );
}

function ColorSwatch({
  name,
  hex,
  usage,
  textColor = "text-gray-700",
}: {
  name: string;
  hex: string;
  usage: string;
  textColor?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(hex);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="group cursor-pointer" onClick={handleCopy}>
      <div
        className="h-20 rounded-2xl mb-3 border border-black/5 relative overflow-hidden transition-transform group-hover:scale-[1.02]"
        style={{ backgroundColor: hex }}
      >
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10">
          {copied ? (
            <Check className="w-5 h-5 text-white drop-shadow" />
          ) : (
            <Copy className="w-4 h-4 text-white drop-shadow" />
          )}
        </div>
      </div>
      <p className={`text-sm ${textColor} mb-0.5`} style={{ fontWeight: 600 }}>
        {name}
      </p>
      <p className="text-xs text-[#4B505B] font-mono mb-0.5">{hex}</p>
      <p className="text-xs text-[#4B505B]/70">{usage}</p>
    </div>
  );
}

function TokenRow({ token, value }: { token: string; value: string }) {
  return (
    <div className="flex items-center gap-4 py-3 border-b border-gray-100 last:border-b-0">
      <code className="text-sm text-[#2d2d2d] bg-gray-100 rounded-lg px-3 py-1 font-mono min-w-[200px]">
        {token}
      </code>
      <span className="text-sm text-[#4B505B] flex-1">{value}</span>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN DESIGN SYSTEM PAGE
   ══════════════════════════════════════════════════════════════ */

export function DesignSystemPage() {
  const [openFaqDemo, setOpenFaqDemo] = useState<number | null>(null);

  return (
    <div
      className="w-full min-h-full bg-white overflow-x-hidden"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* ───── HEADER ───── */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 h-16">
          <div className="flex items-center gap-4">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                window.location.hash = "";
              }}
              className="text-[#4B505B] hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </a>
            <BrandLogo />
            <span className="text-sm text-[#4B505B] border-l border-gray-200 pl-4 hidden sm:inline">
              Design System v3.0
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            {[
              { label: "Colores", href: "#colors" },
              { label: "Tipografía", href: "#typography" },
              { label: "Componentes", href: "#components" },
              { label: "Sesión", href: "#session" },
              { label: "Arena", href: "#arena" },
              { label: "Patrones", href: "#patterns" },
              { label: "Layouts", href: "#layouts" },
            ].map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-[#4B505B] hover:text-gray-900 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      {/* ───── HERO ───── */}
      <section className="bg-[#f0f4f8] py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute -top-20 -left-24 w-[320px] h-[320px] rounded-full opacity-40" style={{ background: COLORS.lavender, filter: "blur(80px)" }} />
          <div className="absolute -bottom-10 -right-20 w-[280px] h-[280px] rounded-full opacity-40" style={{ background: COLORS.blue, filter: "blur(80px)" }} />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm border border-gray-200 mb-6"
          >
            <Palette className="w-4 h-4 text-[#2d2d2d]" />
            <span className="text-sm text-[#4B505B]" style={{ fontWeight: 500 }}>
              Sistema de Diseño
            </span>
          </motion.div>

          <motion.h1
            className="text-3xl md:text-4xl text-gray-900 mb-4"
            style={{ fontWeight: 300, lineHeight: 1.2 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            inFluentia PRO{" "}
            <span style={{ fontWeight: 600 }}>Design System</span>
          </motion.h1>

          <motion.p
            className="text-lg text-[#4B505B] max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Tokens visuales, componentes, patrones y el sistema Arena que definen la identidad de la marca.
            Guía de referencia para mantener consistencia en todas las páginas.
          </motion.p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          1. COLORES
         ═══════════════════════════════════════════════════════ */}
      <DSSection
        id="colors"
        icon={<Palette className="w-4 h-4 text-white" />}
        title="Paleta de Colores"
        description="Todos los colores del sistema, organizados por función y uso."
      >
        {/* Core */}
        <h3 className="text-lg text-gray-900 mb-4" style={{ fontWeight: 600 }}>
          Colores Base
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 mb-12">
          <ColorSwatch name="Dark Primary" hex={COLORS.darkPrimary} usage="Botones CTA, cards dark, texto principal" textColor="text-gray-900" />
          <ColorSwatch name="Text Primary" hex="#111827" usage="gray-900 — Títulos" textColor="text-gray-900" />
          <ColorSwatch name="Text Secondary" hex="#4B505B" usage="Cuerpo de texto, subtítulos" textColor="text-gray-900" />
          <ColorSwatch name="Section BG" hex={COLORS.sectionAlt} usage="Fondo secciones alternas" textColor="text-gray-900" />
          <ColorSwatch name="White" hex={COLORS.white} usage="Fondo principal, cards" textColor="text-gray-900" />
          <ColorSwatch name="Border" hex="#E5E7EB" usage="gray-200 — Bordes, divisores" textColor="text-gray-900" />
        </div>

        {/* Brand Gradient */}
        <h3 className="text-lg text-gray-900 mb-4" style={{ fontWeight: 600 }}>
          Gradiente de Marca
        </h3>
        <div className="mb-12">
          <div
            className="h-20 rounded-2xl mb-3 border border-black/5"
            style={{ background: COLORS.brandGradient }}
          />
          <div className="flex gap-8">
            <div>
              <p className="text-sm text-gray-900" style={{ fontWeight: 600 }}>Brand Gradient</p>
              <p className="text-xs text-[#4B505B] font-mono">{COLORS.brandCyan} → {COLORS.brandGreen}</p>
              <p className="text-xs text-[#4B505B]/70">Logo "PRO" — solo para branding</p>
            </div>
            <div className="flex gap-4">
              <div>
                <div className="w-12 h-12 rounded-xl border border-black/5" style={{ backgroundColor: COLORS.brandCyan }} />
                <p className="text-xs text-[#4B505B] font-mono mt-1">{COLORS.brandCyan}</p>
              </div>
              <div>
                <div className="w-12 h-12 rounded-xl border border-black/5" style={{ backgroundColor: COLORS.brandGreen }} />
                <p className="text-xs text-[#4B505B] font-mono mt-1">{COLORS.brandGreen}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pastel Palette */}
        <h3 className="text-lg text-gray-900 mb-4" style={{ fontWeight: 600 }}>
          Paleta Pastel — Decorativa
        </h3>
        <p className="text-sm text-[#4B505B] mb-4">
          Usados para tarjetas informativas, blobs decorativos y acentos visuales. <strong>No</strong> para pricing ni elementos interactivos.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-12">
          <ColorSwatch name="Peach" hex={COLORS.peach} usage="Hero, Cómo funciona, Antes/Después" />
          <ColorSwatch name="Blue" hex={COLORS.blue} usage="Hero, Cómo funciona, Impacto, Pricing stats" />
          <ColorSwatch name="Green" hex={COLORS.green} usage="Hero, Cómo funciona, Antes/Después" />
          <ColorSwatch name="Lavender" hex={COLORS.lavender} usage="Hero, Impacto" />
          <ColorSwatch name="Soft Purple" hex={COLORS.softPurple} usage="Hero, Impacto (reemplazó #F7E2FB)" />
        </div>

        {/* Semantic */}
        <h3 className="text-lg text-gray-900 mb-4" style={{ fontWeight: 600 }}>
          Colores Semánticos
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
          <ColorSwatch name="Success" hex={COLORS.success} usage="Checks, validaciones positivas" />
          <ColorSwatch name="Success Alt" hex={COLORS.successAlt} usage="Badges de equivalencia" />
          <ColorSwatch name="Muted Icon" hex={COLORS.mutedIcon} usage="X icons, elementos deshabilitados" />
          <ColorSwatch name="Simulation BG" hex={COLORS.simulationBg} usage="Modal de simulación (PracticeWidget)" />
        </div>

        {/* Primary Color Contexts */}
        <h3 className="text-lg text-gray-900 mb-4" style={{ fontWeight: 600 }}>
          Contextos de Color Primario
        </h3>
        <p className="text-sm text-[#4B505B] mb-6">
          El sistema usa <strong>dos colores primarios distintos</strong> según el contexto de página.
          Nunca se mezclan en un mismo contexto.
        </p>
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Landing / Marketing */}
          <div className="rounded-3xl overflow-hidden border border-gray-200">
            <div className="h-16 flex items-center justify-center" style={{ backgroundColor: "#2d2d2d" }}>
              <span className="text-white text-sm" style={{ fontWeight: 600 }}>
                #2d2d2d
              </span>
            </div>
            <div className="bg-white p-6">
              <p className="text-sm text-gray-900 mb-2" style={{ fontWeight: 600 }}>
                Landing & Marketing
              </p>
              <p className="text-sm text-[#4B505B] mb-4">
                Usado en la landing page, pricing, header público, y CTAs de marketing.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <button className="bg-[#2d2d2d] text-white text-xs px-4 py-2 rounded-full" style={{ fontWeight: 500 }}>
                    CTA Primario
                  </button>
                  <span className="text-xs text-[#4B505B]">Botones</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#2d2d2d] flex items-center justify-center">
                    <Target className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-xs text-[#4B505B]">Icon containers</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-[#2d2d2d] text-white text-xs px-3 py-1 rounded-full" style={{ fontWeight: 500 }}>
                    Pill
                  </div>
                  <span className="text-xs text-[#4B505B]">Scenario pills, badges</span>
                </div>
              </div>
              <div className="mt-4 text-sm">
                <TokenRow token="bg-[#2d2d2d]" value="Fondo" />
                <TokenRow token="hover:bg-[#1a1a1a]" value="Hover" />
                <TokenRow token="text-gray-900" value="Texto sobre fondos claros" />
              </div>
            </div>
          </div>

          {/* Internal / Session */}
          <div className="rounded-3xl overflow-hidden border border-gray-200">
            <div className="h-16 flex items-center justify-center" style={{ backgroundColor: "#0f172b" }}>
              <span className="text-white text-sm" style={{ fontWeight: 600 }}>
                #0f172b
              </span>
            </div>
            <div className="bg-white p-6">
              <p className="text-sm text-gray-900 mb-2" style={{ fontWeight: 600 }}>
                Internal & Session Pages
              </p>
              <p className="text-sm text-[#4B505B] mb-4">
                Usado en onboarding, practice setup, dashboard, session, y todas las pantallas post-login.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <button className="bg-[#0f172b] text-white text-xs px-4 py-2 rounded-xl" style={{ fontWeight: 500 }}>
                    Siguiente
                  </button>
                  <span className="text-xs text-[#4B505B]">Botones internos</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="px-3 py-1 rounded-xl border-2 border-[#0f172b] bg-[#0f172b]/5">
                    <span className="text-xs text-[#0f172b]" style={{ fontWeight: 600 }}>Seleccionado</span>
                  </div>
                  <span className="text-xs text-[#4B505B]">Selection state</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-[#0f172b] rounded-2xl px-3 py-1.5">
                    <span className="text-xs text-white" style={{ fontWeight: 500 }}>Tab activo</span>
                  </div>
                  <span className="text-xs text-[#4B505B]">Tabs, filtros</span>
                </div>
              </div>
              <div className="mt-4 text-sm">
                <TokenRow token="bg-[#0f172b]" value="Fondo (slate-900)" />
                <TokenRow token="hover:bg-[#1d293d]" value="Hover" />
                <TokenRow token="text-[#0f172b]" value="Títulos internos" />
                <TokenRow token="text-[#45556c]" value="Texto body interno" />
              </div>
            </div>
          </div>
        </div>
        <div className="bg-[#fffbeb] border border-[#fde68a] rounded-2xl px-5 py-4 mb-4">
          <p className="text-sm text-[#78350f]">
            <strong>Regla:</strong> Si la página tiene <code className="bg-white/60 rounded px-1.5 py-0.5 font-mono text-xs">PastelBlobs</code> y{" "}
            <code className="bg-white/60 rounded px-1.5 py-0.5 font-mono text-xs">MiniFooter</code>, usa <code className="bg-white/60 rounded px-1.5 py-0.5 font-mono text-xs">#0f172b</code>.
            Si tiene <code className="bg-white/60 rounded px-1.5 py-0.5 font-mono text-xs">DotPattern</code> y footer completo, usa <code className="bg-white/60 rounded px-1.5 py-0.5 font-mono text-xs">#2d2d2d</code>.
          </p>
        </div>
      </DSSection>

      {/* ═══════════════════════════════════════════���═══════════
          2. TIPOGRAFÍA
         ═══════════════════════════════════════════════════════ */}
      <DSSection
        id="typography"
        icon={<Type className="w-4 h-4 text-white" />}
        title="Tipografía"
        description="Familias tipográficas, pesos y escalas usados en la marca."
        bg="bg-[#f0f4f8]"
      >
        {/* Font Families */}
        <h3 className="text-lg text-gray-900 mb-6" style={{ fontWeight: 600 }}>
          Familias Tipográficas
        </h3>
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="bg-white rounded-3xl p-8 border border-gray-200">
            <p className="text-xs text-[#4B505B] mb-3 uppercase tracking-wider" style={{ fontWeight: 600 }}>Principal</p>
            <p className="text-4xl text-gray-900 mb-2" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300 }}>
              Inter
            </p>
            <p className="text-sm text-[#4B505B] mb-4">Toda la UI: encabezados, cuerpo, botones, labels</p>
            <p className="text-sm text-gray-900 font-mono bg-gray-50 rounded-lg px-3 py-2">
              font-family: 'Inter', sans-serif
            </p>
          </div>
          <div className="bg-white rounded-3xl p-8 border border-gray-200">
            <p className="text-xs text-[#4B505B] mb-3 uppercase tracking-wider" style={{ fontWeight: 600 }}>Branding</p>
            <p className="text-4xl text-gray-900 mb-2" style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 700 }}>
              Montserrat
            </p>
            <p className="text-sm text-[#4B505B] mb-4">Exclusivo para el texto "pro" en el logo</p>
            <p className="text-sm text-gray-900 font-mono bg-gray-50 rounded-lg px-3 py-2">
              font-family: 'Montserrat', sans-serif
            </p>
          </div>
        </div>

        {/* Weight Scale */}
        <h3 className="text-lg text-gray-900 mb-6" style={{ fontWeight: 600 }}>
          Escala de Pesos
        </h3>
        <div className="bg-white rounded-3xl p-8 border border-gray-200 mb-12">
          <div className="space-y-6">
            {[
              { weight: 300, label: "Light", usage: "Títulos de sección (SectionHeading)", sample: "Invierte en tu ventaja competitiva" },
              { weight: 400, label: "Regular", usage: "Texto de cuerpo, descripciones", sample: "Coaching profesional impulsado por IA" },
              { weight: 500, label: "Medium", usage: "Subtítulos, nav links, badges, botones", sample: "Empezar entrenamiento" },
              { weight: 600, label: "SemiBold", usage: "Títulos de card, subheadings, badge text", sample: "Resultados reales en menos de 90 días" },
              { weight: 700, label: "Bold", usage: "Logo 'pro' (Montserrat)", sample: "pro" },
              { weight: 800, label: "ExtraBold", usage: "Precios, estadísticas grandes", sample: "$39.99" },
            ].map((w) => (
              <div key={w.weight} className="flex flex-col md:flex-row md:items-baseline gap-2 md:gap-6 pb-4 border-b border-gray-100 last:border-b-0 last:pb-0">
                <div className="flex items-center gap-3 md:min-w-[160px] shrink-0">
                  <span className="text-sm font-mono text-[#2d2d2d] bg-gray-100 rounded-lg px-2 py-1">
                    {w.weight}
                  </span>
                  <span className="text-sm text-[#4B505B]" style={{ fontWeight: 500 }}>{w.label}</span>
                </div>
                <p
                  className="text-2xl text-gray-900 flex-1"
                  style={{ fontWeight: w.weight, fontFamily: w.weight === 700 ? "'Montserrat', sans-serif" : "'Inter', sans-serif" }}
                >
                  {w.sample}
                </p>
                <span className="text-xs text-[#4B505B]/70 md:min-w-[240px] md:text-right">{w.usage}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Type Scale */}
        <h3 className="text-lg text-gray-900 mb-6" style={{ fontWeight: 600 }}>
          Escala Tipográfica
        </h3>
        <div className="bg-white rounded-3xl p-8 border border-gray-200">
          <div className="space-y-8">
            {[
              { cls: "text-4xl md:text-5xl", label: "CTA Final", sample: "Tu próxima conversación", weight: 300, lh: 1.15 },
              { cls: "text-3xl md:text-4xl", label: "Section Headings", sample: "Invierte en tu ventaja competitiva", weight: 300, lh: 1.2 },
              { cls: "text-xl", label: "Card Titles", sample: "Trimestral", weight: 600, lh: 1.5 },
              { cls: "text-lg", label: "Subtítulos de sección", sample: "Coaching profesional de comunicación impulsado por IA", weight: 400, lh: 1.5 },
              { cls: "text-base", label: "Body default (16px)", sample: "La IA entiende tu contexto y prepara un interlocutor realista.", weight: 400, lh: 1.5 },
              { cls: "text-sm", label: "Features, labels, nav", sample: "Acceso completo a todas las funciones", weight: 400, lh: 1.5 },
              { cls: "text-xs", label: "Badges, etiquetas", sample: "Más popular", weight: 600, lh: 1.5 },
            ].map((t) => (
              <div key={t.cls}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-mono text-[#4B505B] bg-gray-100 rounded px-2 py-0.5">{t.cls}</span>
                  <span className="text-xs text-[#4B505B]/70">{t.label}</span>
                </div>
                <p className={`${t.cls} ${t.label === "Subtítulos de sección" ? "text-[#4B505B]" : "text-gray-900"}`} style={{ fontWeight: t.weight, lineHeight: t.lh }}>
                  {t.sample}
                </p>
              </div>
            ))}
          </div>
        </div>
      </DSSection>

      {/* ═══════════════════════════════════════════════════════
          3. COMPONENTES
         ═══════════════════════════════════════════════════════ */}
      <DSSection
        id="components"
        icon={<Box className="w-4 h-4 text-white" />}
        title="Componentes"
        description="Elementos reutilizables que componen las páginas del producto."
      >
        {/* --- Buttons --- */}
        <h3 className="text-lg text-gray-900 mb-6" style={{ fontWeight: 600 }}>
          Botones
        </h3>
        <div className="bg-gray-50 rounded-3xl p-8 mb-12 border border-gray-100">
          <div className="flex flex-wrap items-center gap-4 mb-8">
            <button className="bg-[#2d2d2d] text-white px-8 py-3.5 rounded-full hover:bg-[#1a1a1a] transition-colors inline-flex items-center gap-2 shadow-lg" style={{ fontWeight: 500 }}>
              CTA Primario
              <ArrowRight className="w-5 h-5" />
            </button>
            <button className="bg-[#2d2d2d] text-white text-sm px-6 py-2.5 rounded-full hover:bg-[#1a1a1a] transition-colors" style={{ fontWeight: 500 }}>
              Header CTA
            </button>
            <button className="border-2 border-[#2d2d2d] text-gray-900 px-8 py-3.5 rounded-full hover:bg-gray-50 transition-colors" style={{ fontWeight: 500 }}>
              Secundario
            </button>
            <button className="bg-white text-[#2d2d2d] px-8 py-3.5 rounded-full hover:bg-gray-100 transition-colors shadow-lg" style={{ fontWeight: 500 }}>
              Invertido (dark card)
            </button>
          </div>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <TokenRow token="rounded-full" value="Siempre pill shape — nunca rectangulares" />
            <TokenRow token="bg-[#2d2d2d]" value="Color primario de botón" />
            <TokenRow token="hover:bg-[#1a1a1a]" value="Hover state oscuro" />
            <TokenRow token="shadow-lg" value="Solo en CTAs prominentes" />
          </div>
        </div>

        {/* --- Badges & Pills --- */}
        <h3 className="text-lg text-gray-900 mb-6" style={{ fontWeight: 600 }}>
          Badges y Pills
        </h3>
        <div className="bg-gray-50 rounded-3xl p-8 mb-12 border border-gray-100">
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm border border-gray-200">
              <Sparkles className="w-4 h-4 text-[#2d2d2d]" />
              <span className="text-sm text-[#4B505B]" style={{ fontWeight: 500 }}>Hero Pill Badge</span>
            </div>
            <div className="px-4 py-1.5 rounded-full text-xs shadow-lg border bg-[#2d2d2d] text-white border-[#2d2d2d]" style={{ fontWeight: 600 }}>
              Mejor valor
            </div>
            <div className="px-4 py-1.5 rounded-full text-xs shadow-lg border bg-white text-[#2d2d2d] border-gray-200" style={{ fontWeight: 600 }}>
              Más popular
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs bg-gray-100 text-[#008236]">
              <Zap className="w-3 h-3" />
              <span style={{ fontWeight: 500 }}>Equivale a $8.33/mes</span>
            </div>
            <div className="bg-[#2d2d2d] text-white text-sm px-4 py-2 rounded-full" style={{ fontWeight: 500 }}>
              Scenario Pill
            </div>
          </div>
          <p className="text-sm text-[#4B505B]">
            Todos los badges usan <code className="bg-gray-100 rounded px-1.5 py-0.5 font-mono text-xs">rounded-full</code>.
            Los del Hero llevan <code className="bg-gray-100 rounded px-1.5 py-0.5 font-mono text-xs">shadow-sm</code>,
            los de pricing <code className="bg-gray-100 rounded px-1.5 py-0.5 font-mono text-xs">shadow-lg</code>.
          </p>
        </div>

        {/* --- Cards --- */}
        <h3 className="text-lg text-gray-900 mb-6" style={{ fontWeight: 600 }}>
          Tarjetas
        </h3>

        {/* Informative Cards (Pastel) */}
        <p className="text-sm text-[#4B505B] mb-4" style={{ fontWeight: 500 }}>
          Informativas — Fondo pastel, sin interacción principal
        </p>
        <div className="grid md:grid-cols-3 gap-5 mb-8">
          {[
            { bg: "bg-[#FFE9C7]", title: "Card Peach", icon: <Target className="w-6 h-6 text-white" /> },
            { bg: "bg-[#D9ECF0]", title: "Card Blue", icon: <MessageSquare className="w-6 h-6 text-white" /> },
            { bg: "bg-[#DBEDDF]", title: "Card Green", icon: <TrendingUp className="w-6 h-6 text-white" /> },
          ].map((c) => (
            <div key={c.title} className={`${c.bg} rounded-3xl p-7`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-xl bg-[#2d2d2d] flex items-center justify-center shrink-0">
                  {c.icon}
                </div>
              </div>
              <h3 className="text-lg text-gray-900 mb-2" style={{ fontWeight: 600 }}>
                {c.title}
              </h3>
              <p className="text-[#4B505B] text-sm leading-relaxed">
                Contenido descriptivo de la tarjeta. Sin botones de acción, solo informativa.
              </p>
            </div>
          ))}
        </div>

        {/* Pricing Cards — using shared PricingCard */}
        <p className="text-sm text-[#4B505B] mb-4" style={{ fontWeight: 500 }}>
          Pricing — Neutras (white / dark), con interacción
        </p>
        <div className="grid md:grid-cols-3 gap-6 items-stretch max-w-4xl mb-12">
          <PricingCard
            name="Plan Light"
            desc="Card clara con borde"
            price="$14.99"
            bg="bg-white"
            features={["Feature uno", "Feature dos"]}
          />
          <PricingCard
            name="Plan Dark"
            desc="Card oscura featured"
            price="$39.99"
            equivalent="Equivale a $8.33/mes"
            badge="Destacado"
            featured
            bg="bg-[#2d2d2d]"
            features={["Feature uno", "Feature dos"]}
          />
          <PricingCard
            name="Light + Badge"
            desc="Badge oscuro sobre card clara"
            price="$129.99"
            equivalent="Equivale a $10.83/mes"
            badge="Badge Dark"
            bg="bg-white"
            features={["Feature uno", "Feature dos"]}
          />
        </div>

        {/* --- Section Heading --- */}
        <h3 className="text-lg text-gray-900 mb-6" style={{ fontWeight: 600 }}>
          Section Heading
        </h3>
        <div className="bg-gray-50 rounded-3xl p-8 mb-12 border border-gray-100">
          <div className="mb-8">
            <SectionHeading
              title="Título de sección ejemplo"
              subtitle="Subtítulo descriptivo que acompaña al título de cada sección"
            />
          </div>
          <div className="text-sm space-y-2">
            <TokenRow token="text-3xl md:text-4xl" value="Tamaño responsive del título" />
            <TokenRow token="fontWeight: 300" value="Light — estilo editorial" />
            <TokenRow token="text-lg" value="Tamaño del subtítulo" />
            <TokenRow token="max-w-2xl mx-auto" value="Centrado con ancho máximo" />
          </div>
        </div>

        {/* --- Icons --- */}
        <h3 className="text-lg text-gray-900 mb-6" style={{ fontWeight: 600 }}>
          Iconografía
        </h3>
        <div className="bg-gray-50 rounded-3xl p-8 mb-12 border border-gray-100">
          <div className="flex flex-wrap items-center gap-6 mb-6">
            <div className="flex flex-col items-center gap-2">
              <div className="w-11 h-11 rounded-xl bg-[#2d2d2d] flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs text-[#4B505B]">Contenedor XL</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-[#00C950] flex items-center justify-center">
                <Check className="w-5 h-5 text-white" strokeWidth={3} />
              </div>
              <span className="text-xs text-[#4B505B]">Check Circle</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-[#cad5e2] flex items-center justify-center">
                <X className="w-5 h-5 text-[#45556C]" strokeWidth={3} />
              </div>
              <span className="text-xs text-[#4B505B]">X Circle</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <CheckIcon />
              <span className="text-xs text-[#4B505B]">Check inline</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <CheckIcon color="#2d2d2d" />
              <span className="text-xs text-[#4B505B]">Check dark</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <CheckIcon color="#ffffff" />
              <span className="text-xs text-[#4B505B] bg-[#2d2d2d] rounded px-1.5 py-0.5">Check white</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <XIcon />
              <span className="text-xs text-[#4B505B]">X inline</span>
            </div>
          </div>
          <p className="text-sm text-[#4B505B]">
            Iconos de <code className="bg-gray-100 rounded px-1.5 py-0.5 font-mono text-xs">lucide-react</code>.
            Contenedores: <code className="bg-gray-100 rounded px-1.5 py-0.5 font-mono text-xs">rounded-xl</code> para cuadrados,{" "}
            <code className="bg-gray-100 rounded px-1.5 py-0.5 font-mono text-xs">rounded-full</code> para círculos.
          </p>
        </div>

        {/* --- FAQ Accordion --- */}
        <h3 className="text-lg text-gray-900 mb-6" style={{ fontWeight: 600 }}>
          Acordeón FAQ
        </h3>
        <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100 mb-12">
          <div className="space-y-3 max-w-2xl">
            {[
              { q: "¿Pregunta de ejemplo uno?", a: "Respuesta con texto descriptivo que explica el tema con claridad." },
              { q: "¿Pregunta de ejemplo dos?", a: "Otra respuesta que muestra el comportamiento de apertura y cierre con animación CSS grid." },
            ].map((faq, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <button
                  className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
                  onClick={() => setOpenFaqDemo(openFaqDemo === i ? null : i)}
                >
                  <span className="text-gray-900" style={{ fontWeight: 500 }}>{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-[#4B505B] shrink-0 transition-transform duration-300 ${
                      openFaqDemo === i ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <div
                  className="grid transition-all duration-300 ease-in-out"
                  style={{ gridTemplateRows: openFaqDemo === i ? "1fr" : "0fr" }}
                >
                  <div className="overflow-hidden">
                    <p className="px-6 pb-5 text-[#4B505B] leading-relaxed">{faq.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 text-sm space-y-2">
            <TokenRow token="rounded-2xl" value="FAQ items radius" />
            <TokenRow token="border-gray-200" value="Borde consistente con el sistema" />
            <TokenRow token="gridTemplateRows" value="CSS grid trick para animar altura" />
            <TokenRow token="duration-300" value="Duración de transición" />
          </div>
        </div>

        {/* --- Brand Logo --- */}
        <h3 className="text-lg text-gray-900 mb-6" style={{ fontWeight: 600 }}>
          Logo
        </h3>
        <div className="grid md:grid-cols-2 gap-6 mb-4">
          <div className="bg-white rounded-3xl p-8 border border-gray-200 flex flex-col items-center justify-center gap-4">
            <BrandLogo />
            <span className="text-xs text-[#4B505B]">Modo claro — fondo blanco</span>
          </div>
          <div className="bg-[#2d2d2d] rounded-3xl p-8 flex flex-col items-center justify-center gap-4">
            <BrandLogo light />
            <span className="text-xs text-gray-400">Modo oscuro — fondo dark</span>
          </div>
        </div>
      </DSSection>

      {/* ═══════════════════════════════════════════════════════
          3b. SESSION COMPONENTS
         ═══════════════════════════════════════════════════════ */}
      <DSSection
        id="session"
        icon={<Mic className="w-4 h-4 text-white" />}
        title="Componentes de Sesión"
        description="Elementos reutilizables usados en las pantallas de práctica, feedback y análisis."
        bg="bg-[#f0f4f8]"
      >
        {/* --- Page Title Block --- */}
        <h3 className="text-lg text-gray-900 mb-6" style={{ fontWeight: 600 }}>
          PageTitleBlock
        </h3>
        <div className="bg-white rounded-3xl p-8 mb-12 border border-gray-200">
          <div className="grid md:grid-cols-2 gap-8">
            <PageTitleBlock
              icon={<CheckCircle2 className="w-8 h-8 text-white" />}
              title="Análisis de tu presentación"
              subtitle="12 minutos · Sales pitch con Client"
            />
            <PageTitleBlock
              icon={<Star className="w-8 h-8 text-white" />}
              title="Tu guión mejorado"
              subtitle="Hemos reorganizado tu contenido con las técnicas más efectivas."
            />
          </div>
          <div className="mt-6 space-y-2 text-sm">
            <TokenRow token="w-16 h-16 rounded-full" value="Contenedor circular del ícono" />
            <TokenRow token="text-3xl md:text-[48px]" value="Tamaño responsive del título" />
            <TokenRow token="fontWeight: 300" value="Light — estilo editorial consistente" />
            <TokenRow token="text-xl text-[#45556c]" value="Subtítulo descriptivo" />
          </div>
        </div>

        {/* --- Accuracy Ring --- */}
        <h3 className="text-lg text-gray-900 mb-6" style={{ fontWeight: 600 }}>
          AccuracyRing
        </h3>
        <div className="bg-white rounded-3xl p-8 mb-12 border border-gray-200">
          <p className="text-sm text-[#4B505B] mb-6">
            Score circular animado con umbrales de color: ≥80% verde, ≥60% ámbar, &lt;60% rojo.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-10 mb-6">
            <div className="flex flex-col items-center gap-2">
              <AccuracyRing score={92} />
              <span className="text-xs text-[#4B505B]">≥80% — verde</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <AccuracyRing score={68} />
              <span className="text-xs text-[#4B505B]">≥60% — ámbar</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <AccuracyRing score={45} />
              <span className="text-xs text-[#4B505B]">&lt;60% — rojo</span>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <TokenRow token="w-28 h-28" value="Tamaño fijo del ring (112px)" />
            <TokenRow token="strokeDasharray" value="Animación SVG de llenado progresivo" />
            <TokenRow token="#22c55e / #f59e0b / #ef4444" value="Colores por umbral de score" />
          </div>
        </div>

        {/* --- Stage Badge --- */}
        <h3 className="text-lg text-gray-900 mb-6" style={{ fontWeight: 600 }}>
          StageBadge
        </h3>
        <div className="bg-white rounded-3xl p-8 mb-12 border border-gray-200">
          <p className="text-sm text-[#4B505B] mb-6">
            Pills de estado coloreados usados durante la práctica y análisis de voz.
          </p>
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <StageBadge variant="idle">Escucha la frase y luego repite</StageBadge>
            <StageBadge variant="active">Escuchando frase...</StageBadge>
            <StageBadge variant="warning">Intento 2 de 3 — intenta de nuevo</StageBadge>
            <StageBadge variant="success">¡Excelente! Puedes avanzar</StageBadge>
            <StageBadge variant="recording">Grabando...</StageBadge>
            <StageBadge variant="analyzing">Analizando pronunciación...</StageBadge>
          </div>
          <div className="space-y-2 text-sm">
            <TokenRow token="rounded-full px-5 py-2" value="Pill shape consistente" />
            <TokenRow token="idle" value="bg-[#f8fafc] / border-[#e2e8f0] / text-[#45556c]" />
            <TokenRow token="active" value="bg-[#eff6ff] / border-[#bfdbfe] / text-[#2563eb]" />
            <TokenRow token="success" value="bg-[#f0fdf4] / border-[#bbf7d0] / text-[#15803d]" />
            <TokenRow token="recording" value="bg-[#fef2f2] / border-[#fecaca] / text-[#dc2626]" />
            <TokenRow token="analyzing" value="bg-[#f5f3ff] / border-[#ddd6fe] / text-[#6366f1]" />
          </div>
        </div>

        {/* --- HighlightWithTooltip --- */}
        <h3 className="text-lg text-gray-900 mb-6" style={{ fontWeight: 600 }}>
          HighlightWithTooltip
        </h3>
        <div className="bg-white rounded-3xl p-8 mb-12 border border-gray-200">
          <p className="text-sm text-[#4B505B] mb-6">
            Texto resaltado con tooltip al hover/tap. Tres categorías por color pastel. Pasa el cursor sobre el texto destacado.
          </p>
          <div className="bg-[#f8fafc] rounded-2xl p-6 mb-6">
            <p className="text-[#314158] leading-relaxed">
              "Great question about the timeline.{" "}
              <HighlightWithTooltip
                phrase="Let me break this into three parts"
                color="#E1D5F8"
                tooltip="Dividir en partes facilita la comprensión y demuestra dominio del tema."
              />
              : initial setup, team training, and going fully operational."
            </p>
            <p className="text-[#314158] leading-relaxed mt-4">
              "We also know that{" "}
              <HighlightWithTooltip
                phrase="most companies see results within 48 hours"
                color="#FFE9C7"
                tooltip="Los datos específicos generan credibilidad y crean urgencia positiva."
              />
              ."
            </p>
            <p className="text-[#314158] leading-relaxed mt-4">
              "{" "}
              <HighlightWithTooltip
                phrase="Does this align with what you're looking for?"
                color="#D9ECF0"
                tooltip="Las preguntas abiertas invitan al diálogo y confirman comprensión mutua."
              />
              "
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4 mb-4">
            {[
              { color: COLORS.softPurple, label: "Estructura" },
              { color: COLORS.peach, label: "Impacto" },
              { color: COLORS.blue, label: "Engagement" },
            ].map((c) => (
              <div key={c.label} className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: c.color }} />
                <span className="text-sm text-[#0f172b]" style={{ fontWeight: 500 }}>{c.label}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-[#4B505B]/70">
            El tooltip se ajusta automáticamente para no salirse del viewport (nudge). En móvil, tap para abrir/cerrar.
          </p>
        </div>

        {/* --- highlightEnglish --- */}
        <h3 className="text-lg text-gray-900 mb-6" style={{ fontWeight: 600 }}>
          highlightEnglish & renderStressedPhrase
        </h3>
        <div className="bg-white rounded-3xl p-8 mb-12 border border-gray-200">
          <p className="text-sm text-[#4B505B] mb-6">
            Helpers de texto: <code className="bg-gray-100 rounded px-1.5 py-0.5 font-mono text-xs">highlightEnglish</code> renderiza
            frases entre comillas simples en morado (#6366f1); <code className="bg-gray-100 rounded px-1.5 py-0.5 font-mono text-xs">renderStressedPhrase</code> renderiza
            sílabas entre **doble asterisco** con fontWeight 600.
          </p>
          <div className="space-y-4 bg-[#f8fafc] rounded-2xl p-6">
            <div>
              <span className="text-[10px] text-[#62748e] uppercase tracking-wider mb-1 block">highlightEnglish</span>
              <p className="text-[#314158] leading-relaxed">
                {highlightEnglish("Podrías usar: 'Great question. Let me break this into three parts.' Esto da control y claridad.")}
              </p>
            </div>
            <div className="border-t border-[#e2e8f0] pt-4">
              <span className="text-[10px] text-[#62748e] uppercase tracking-wider mb-1 block">renderStressedPhrase</span>
              <p className="text-xl text-[#0f172b]" style={{ fontWeight: 300 }}>
                {renderStressedPhrase("Good **mor**ning! I under**stand** you're e**val**uating auto**ma**tion **plat**forms.")}
              </p>
            </div>
          </div>
        </div>

        {/* --- Recording Components --- */}
        <h3 className="text-lg text-gray-900 mb-6" style={{ fontWeight: 600 }}>
          Recording Components
        </h3>
        <div className="bg-white rounded-3xl p-8 mb-12 border border-gray-200">
          <p className="text-sm text-[#4B505B] mb-6">
            Componentes unificados de grabación: <code className="bg-gray-100 rounded px-1.5 py-0.5 font-mono text-xs">RecordButton</code> (idle/recording × lg/sm),{" "}
            <code className="bg-gray-100 rounded px-1.5 py-0.5 font-mono text-xs">RecordingWaveformBars</code>, y{" "}
            <code className="bg-gray-100 rounded px-1.5 py-0.5 font-mono text-xs">RecordingTimer</code>.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-12 mb-8">
            <div className="flex flex-col items-center gap-2">
              <RecordButton isRecording={false} onClick={() => {}} size="lg" label="Pulsa para hablar" />
              <span className="text-xs text-[#4B505B]">size="lg" · idle</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <RecordButton isRecording={false} onClick={() => {}} size="sm" />
              <span className="text-xs text-[#4B505B]">size="sm" · idle</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-10 mb-6">
            <div className="flex flex-col items-center gap-2">
              <RecordingWaveformBars color="#ef4444" count={7} />
              <span className="text-xs text-[#4B505B]">Waveform rojo (recording)</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <RecordingWaveformBars color="#2563eb" count={7} />
              <span className="text-xs text-[#4B505B]">Waveform azul (AI speaking)</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <RecordingTimer timeMs={73000} />
              <span className="text-xs text-[#4B505B]">Recording Timer</span>
            </div>
          </div>
        </div>

        {/* --- SubtleTextLink --- */}
        <h3 className="text-lg text-gray-900 mb-6" style={{ fontWeight: 600 }}>
          SubtleTextLink
        </h3>
        <div className="bg-white rounded-3xl p-8 mb-12 border border-gray-200">
          <p className="text-sm text-[#4B505B] mb-4">
            Enlace discreto subrayado para acciones secundarias (ej. "Finalizar práctica").
          </p>
          <div className="flex items-center justify-center gap-8">
            <SubtleTextLink onClick={() => {}}>Finalizar práctica</SubtleTextLink>
            <SubtleTextLink onClick={() => {}}>Volver al dashboard</SubtleTextLink>
          </div>
          <div className="mt-4 space-y-2 text-sm">
            <TokenRow token="text-sm" value="Tamaño pequeño, no compite con CTAs" />
            <TokenRow token="text-[#45556c]/70" value="Color apagado, hover: text-[#0f172b]" />
            <TokenRow token="underline underline-offset-2" value="Subrayado sutil" />
          </div>
        </div>

        {/* --- AnalyzingScreen (descriptive) --- */}
        <h3 className="text-lg text-gray-900 mb-6" style={{ fontWeight: 600 }}>
          AnalyzingScreen
        </h3>
        <div className="bg-white rounded-3xl p-8 border border-gray-200">
          <p className="text-sm text-[#4B505B] mb-6">
            Pantalla de transición dark (full-screen) con barra de progreso animada y pasos secuenciales.
            Tres variantes configuradas:
          </p>
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            {[
              {
                variant: "feedback",
                title: "Analizando tu presentación",
                steps: ["Transcribiendo...", "Pronunciación...", "Vocabulario...", "Feedback..."],
              },
              {
                variant: "script",
                title: "Preparando guión mejorado",
                steps: ["Estructura...", "Áreas de mejora...", "Vocabulario...", "Guión optimizado..."],
              },
              {
                variant: "results",
                title: "Calculando resultados",
                steps: ["Precisión...", "Comparación...", "Métricas...", "Resumen final..."],
              },
            ].map((v) => (
              <div key={v.variant} className="bg-[#0f172b] rounded-2xl p-5">
                <span className="text-[10px] text-white/40 uppercase tracking-wider">{v.variant}</span>
                <p className="text-white text-sm mt-2 mb-3" style={{ fontWeight: 500 }}>{v.title}</p>
                <div className="space-y-1.5">
                  {v.steps.map((s, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#50C878]" />
                      <span className="text-xs text-white/60">{s}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 h-1 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ background: `linear-gradient(90deg, ${COLORS.brandCyan}, ${COLORS.brandGreen})`, width: "75%" }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-2 text-sm">
            <TokenRow token="bg-[#0f172b]" value="Fondo dark — pantalla completa" />
            <TokenRow token="brandCyan → brandGreen" value="Gradiente de marca en progress bar" />
            <TokenRow token="~4.7s total" value="Duración promedio de la animación" />
            <TokenRow token="onComplete callback" value="Avanza automáticamente al finalizar" />
          </div>
        </div>
      </DSSection>

      {/* ═════════════════════���═════════════════════════════════
          3c. ARENA SYSTEM
         ═══════════════════════════════════════════════════════ */}
      <DSSection
        id="arena"
        icon={<Shield className="w-4 h-4 text-white" />}
        title="Arena System"
        description="Componentes del sistema de andamiaje progresivo (Support → Guidance → Challenge) y flujos multi-step."
      >
        {/* --- Phase Indicator --- */}
        <h3 className="text-lg text-gray-900 mb-6" style={{ fontWeight: 600 }}>
          PhaseIndicator
        </h3>
        <div className="bg-white rounded-3xl p-8 mb-12 border border-gray-200">
          <p className="text-sm text-[#4B505B] mb-6">
            Badge de fase que muestra el nivel actual del Arena. Cada fase tiene ícono, color y sublabel propios.
          </p>
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <PhaseIndicator phase="support" />
            <PhaseIndicator phase="guidance" />
            <PhaseIndicator phase="challenge" />
          </div>
          <div className="space-y-2 text-sm">
            <TokenRow token="support" value="bg azul (#2563eb) / Shield icon" />
            <TokenRow token="guidance" value="bg ámbar (#d97706) / Zap icon" />
            <TokenRow token="challenge" value="bg púrpura (#7c3aed) / Swords icon" />
            <TokenRow token="rounded-full" value="Pill shape consistente" />
          </div>
        </div>

        {/* --- ArenaProgressBar --- */}
        <h3 className="text-lg text-gray-900 mb-6" style={{ fontWeight: 600 }}>
          ArenaProgressBar
        </h3>
        <div className="bg-white rounded-3xl p-8 mb-12 border border-gray-200">
          <p className="text-sm text-[#4B505B] mb-6">
            Indicador discreto de 3 puntos que muestra el progreso entre fases. El punto activo se expande.
          </p>
          <div className="flex flex-wrap items-center gap-10 mb-6">
            <div className="flex flex-col items-center gap-2">
              <ArenaProgressBar phase="support" />
              <span className="text-xs text-[#4B505B]">Support</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <ArenaProgressBar phase="guidance" />
              <span className="text-xs text-[#4B505B]">Guidance</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <ArenaProgressBar phase="challenge" />
              <span className="text-xs text-[#4B505B]">Challenge</span>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <TokenRow token="w-20 / w-6" value="Dot activo expandido vs. inactivo" />
            <TokenRow token="h-6" value="Altura fija del dot" />
            <TokenRow token="ease: [0.22, 1, 0.36, 1]" value="Easing spring-like" />
          </div>
        </div>

        {/* --- Phase Transition Toast (descriptive) --- */}
        <h3 className="text-lg text-gray-900 mb-6" style={{ fontWeight: 600 }}>
          PhaseTransitionToast
        </h3>
        <div className="bg-white rounded-3xl p-8 mb-12 border border-gray-200">
          <p className="text-sm text-[#4B505B] mb-6">
            Notificación flotante que aparece durante 4 segundos al subir de fase. Gradiente sutil del color de fase.
          </p>
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            {[
              {
                phase: "guidance" as const,
                title: "Your confidence is growing",
                desc: "Stepping up the challenge — fewer hints, more strategy",
                color: "#d97706",
                bg: "rgba(217,119,6,0.08)",
                border: "rgba(217,119,6,0.15)",
              },
              {
                phase: "challenge" as const,
                title: "You're ready for the real thing",
                desc: "Full professional mode — show what you've got",
                color: "#7c3aed",
                bg: "rgba(124,58,237,0.08)",
                border: "rgba(124,58,237,0.15)",
              },
            ].map((toast) => (
              <div
                key={toast.phase}
                className="rounded-2xl p-4 backdrop-blur-md flex items-start gap-3"
                style={{
                  background: `linear-gradient(135deg, ${toast.bg}, rgba(255,255,255,0.95))`,
                  border: `1px solid ${toast.border}`,
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: toast.bg }}
                >
                  <Sparkles className="w-5 h-5" style={{ color: toast.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4
                    className="text-sm text-[#0f172b] mb-0.5"
                    style={{ fontWeight: 600 }}
                  >
                    {toast.title}
                  </h4>
                  <p className="text-xs text-[#45556c]">{toast.desc}</p>
                </div>
                <X className="w-3.5 h-3.5 text-[#94a3b8] flex-shrink-0" />
              </div>
            ))}
          </div>
          <div className="space-y-2 text-sm">
            <TokenRow token="fixed top-20" value="Posición fija arriba del contenido" />
            <TokenRow token="auto-dismiss 4s" value="Se cierra automáticamente" />
            <TokenRow token="backdrop-blur-md" value="Glassmorphism sutil" />
          </div>
        </div>

        {/* --- PowerPhrasesPanel (descriptive) --- */}
        <h3 className="text-lg text-gray-900 mb-6" style={{ fontWeight: 600 }}>
          PowerPhrasesPanel
        </h3>
        <div className="bg-white rounded-3xl p-8 mb-12 border border-gray-200">
          <p className="text-sm text-[#4B505B] mb-6">
            Panel contextual de frases sugeridas. Varía según la fase: visible en Support (azul), colapsable en Guidance (ámbar), oculto en Challenge.
          </p>
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            {/* Support variant */}
            <div className="rounded-2xl border overflow-hidden bg-[#eff6ff]/50 border-[#bfdbfe]/50">
              <div className="w-full flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#2563eb]" />
                  <span className="text-xs" style={{ fontWeight: 600, color: "#1e40af" }}>
                    Power Phrases
                  </span>
                </div>
              </div>
              <div className="px-3 pb-3 flex flex-wrap gap-2">
                <div className="text-xs px-3 py-2 rounded-xl border bg-white/80 border-[#bfdbfe] text-[#1e3a5f]" style={{ fontWeight: 500 }}>
                  "Let me break this down"
                  <span className="text-[10px] block mt-1 text-[#3b82f6] opacity-70">Structuring ideas</span>
                </div>
                <div className="text-xs px-3 py-2 rounded-xl border bg-[#f0fdf4] border-[#86efac] text-[#166534]" style={{ fontWeight: 500 }}>
                  "Great question" <Check className="w-3 h-3 inline ml-1" />
                  <span className="text-[10px] block mt-1 text-[#16a34a]">Added to SR queue</span>
                </div>
              </div>
            </div>
            {/* Guidance variant */}
            <div className="rounded-2xl border overflow-hidden bg-[#fffbeb]/50 border-[#fde68a]/50">
              <div className="w-full flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#d97706]" />
                  <span className="text-xs" style={{ fontWeight: 600, color: "#92400e" }}>
                    Power Phrases
                  </span>
                  <span className="text-[10px] text-[#92400e]/60">(tap to expand)</span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-[#d97706]" />
              </div>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <TokenRow token="support" value="bg-[#eff6ff]/50 border-[#bfdbfe]/50 — siempre visible" />
            <TokenRow token="guidance" value="bg-[#fffbeb]/50 border-[#fde68a]/50 — colapsable" />
            <TokenRow token="challenge" value="No renderiza — el usuario está solo" />
            <TokenRow token="used state" value="bg-[#f0fdf4] border-[#86efac] + Check icon" />
          </div>
        </div>

        {/* --- BeforeAfterSection (descriptive) --- */}
        <h3 className="text-lg text-gray-900 mb-6" style={{ fontWeight: 600 }}>
          BeforeAfterSection
        </h3>
        <div className="bg-white rounded-3xl p-8 mb-12 border border-gray-200">
          <p className="text-sm text-[#4B505B] mb-6">
            Acordeón de comparación Antes/Después que muestra la versión original del usuario vs. la versión profesional,
            con técnica aplicada. Aparece en el SessionFeedback.
          </p>
          <div className="bg-[#f8fafc] rounded-2xl p-5 mb-6">
            <div className="bg-white border border-[#e2e8f0] rounded-2xl overflow-hidden">
              <div className="w-full text-left px-5 py-4 flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[#fee2e2] text-[#991b1b]" style={{ fontWeight: 500 }}>Antes</span>
                  </div>
                  <p className="text-sm text-[#64748b] italic">"I think our product is good for your company..."</p>
                </div>
                <ArrowRight className="w-4 h-4 text-[#94a3b8] mt-3 flex-shrink-0" />
              </div>
              <div className="px-5 pb-5 border-t border-[#f1f5f9]">
                <div className="pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[#dcfce7] text-[#166534]" style={{ fontWeight: 500 }}>Después</span>
                    <Sparkles className="w-3 h-3 text-[#22c55e]" />
                  </div>
                  <p className="text-sm text-[#0f172b] leading-relaxed mb-3" style={{ fontWeight: 500 }}>
                    "Our solution addresses your specific pain point in supply chain visibility..."
                  </p>
                  <div className="bg-[#f8fafc] rounded-xl px-4 py-3 border border-[#e2e8f0]">
                    <p className="text-xs text-[#45556c]">
                      <span style={{ fontWeight: 600, color: "#0f172b" }}>Técnica:</span>{" "}
                      Specificity — reemplaza generalizaciones con datos concretos
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <TokenRow token="Antes badge" value="bg-[#fee2e2] text-[#991b1b] — rojo suave" />
            <TokenRow token="Después badge" value="bg-[#dcfce7] text-[#166534] — verde suave" />
            <TokenRow token="Técnica box" value="bg-[#f8fafc] border-[#e2e8f0] — nested info" />
            <TokenRow token="AnimatePresence" value="Expand/collapse con height: auto" />
          </div>
        </div>

        {/* --- ServiceErrorBanner --- */}
        <h3 className="text-lg text-gray-900 mb-6" style={{ fontWeight: 600 }}>
          ServiceErrorBanner
        </h3>
        <div className="bg-white rounded-3xl p-8 mb-12 border border-gray-200">
          <p className="text-sm text-[#4B505B] mb-6">
            Banner inline para errores de servicio con 3 niveles de severidad y acciones de recuperación configurables.
          </p>
          <div className="space-y-4 mb-6">
            {([
              { severity: "warning" as const, code: "NETWORK_SLOW", msg: "La conexión parece lenta. Algunos datos podrían tardar en cargar.", recovery: "retry" as const },
              { severity: "error" as const, code: "MICROPHONE_BLOCKED", msg: "No se pudo acceder al micrófono. Revisa los permisos del navegador.", recovery: "user-action" as const },
              { severity: "fatal" as const, code: "API_DOWN", msg: "El servicio no está disponible en este momento. Intenta más tarde.", recovery: "none" as const },
            ]).map((e) => (
              <ServiceErrorBanner
                key={e.code}
                error={new ServiceError({
                  code: e.code,
                  message: e.msg,
                  userMessage: e.msg,
                  severity: e.severity,
                  recovery: e.recovery,
                })}
                onRetry={() => {}}
                onDismiss={() => {}}
              />
            ))}
          </div>
          <div className="space-y-2 text-sm">
            <TokenRow token="warning" value="bg-[#FFF8E1] border-[#FFE082] — ámbar" />
            <TokenRow token="error" value="bg-[#FFF0F0] border-[#FFCDD2] — rojo" />
            <TokenRow token="fatal" value="bg-[#FBE9E7] border-[#FF8A65] — naranja grave" />
            <TokenRow token="recovery" value="retry | user-action | navigate | degrade | none" />
          </div>
        </div>

        {/* --- MiniFooter --- */}
        <h3 className="text-lg text-gray-900 mb-6" style={{ fontWeight: 600 }}>
          MiniFooter
        </h3>
        <div className="bg-white rounded-3xl p-8 mb-12 border border-gray-200">
          <p className="text-sm text-[#4B505B] mb-6">
            Footer compacto para páginas internas (onboarding, setup, sesión). Incluye logo reducido y copyright.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-[#f0f4f8] rounded-2xl overflow-hidden">
              <MiniFooter />
            </div>
            <div className="bg-[#0f172b] rounded-2xl overflow-hidden">
              <MiniFooter light />
            </div>
          </div>
          <div className="mt-6 space-y-2 text-sm">
            <TokenRow token="light={false}" value="Modo claro — border-[#e2e8f0]" />
            <TokenRow token="light={true}" value="Modo oscuro — border-white/10" />
            <TokenRow token="scale-75 opacity-60" value="Logo reducido" />
          </div>
        </div>

        {/* --- PastelBlobs --- */}
        <h3 className="text-lg text-gray-900 mb-6" style={{ fontWeight: 600 }}>
          PastelBlobs
        </h3>
        <div className="bg-white rounded-3xl p-8 border border-gray-200">
          <p className="text-sm text-[#4B505B] mb-6">
            Fondo decorativo de blobs pastel usado en páginas internas (Onboarding, PracticeSetup, SessionReport).
            Más suave que los blobs del Hero de la landing.
          </p>
          <div className="relative h-48 rounded-2xl overflow-hidden bg-[#f0f4f8] border border-gray-200 mb-6">
            <PastelBlobs />
            <div className="relative z-10 h-full flex items-center justify-center">
              <p className="text-sm text-[#4B505B] bg-white/80 backdrop-blur-sm rounded-full px-4 py-2" style={{ fontWeight: 500 }}>
                5 blobs: peach, blue, green, lavender, softPurple
              </p>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <TokenRow token="blur(100-120px)" value="Más blur que los blobs del landing hero" />
            <TokenRow token="opacity 0.20-0.40" value="Más suave que el hero" />
            <TokenRow token="overflow-hidden" value="Contenido no se desborda" />
            <TokenRow token="aria-hidden" value="Oculto para screen readers" />
          </div>
        </div>
      </DSSection>

      {/* ═══════════════════════════════════════════════════════
          4. PATRONES DECORATIVOS
         ═══════════════════════════════════════════════════════ */}
      <DSSection
        id="patterns"
        icon={<Grid3x3 className="w-4 h-4 text-white" />}
        title="Patrones Decorativos"
        description="Elementos de fondo que dan profundidad visual sin distraer."
        bg="bg-[#f0f4f8]"
      >
        {/* Dot Pattern */}
        <h3 className="text-lg text-gray-900 mb-6" style={{ fontWeight: 600 }}>
          DotPattern
        </h3>
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="relative h-48 rounded-3xl overflow-hidden bg-white border border-gray-200">
            <DotPattern />
            <div className="relative z-10 h-full flex items-center justify-center">
              <p className="text-sm text-[#4B505B]" style={{ fontWeight: 500 }}>Sobre fondo blanco</p>
            </div>
          </div>
          <div className="bg-white rounded-3xl p-6 border border-gray-200">
            <p className="text-sm text-gray-900 mb-3" style={{ fontWeight: 600 }}>Especificaciones</p>
            <div className="space-y-2 text-sm">
              <TokenRow token="radial-gradient" value="rgba(0,0,0,0.12) — 1px dots" />
              <TokenRow token="backgroundSize" value="24px × 24px grid" />
              <TokenRow token="position" value="absolute inset-0, pointer-events-none" />
            </div>
            <p className="text-xs text-[#4B505B]/70 mt-3">
              Usar sobre fondos blancos. Secciones: Cómo funciona, Pricing, CTA Final, Antes/Después.
            </p>
          </div>
        </div>

        {/* Blobs */}
        <h3 className="text-lg text-gray-900 mb-6" style={{ fontWeight: 600 }}>
          Blobs Decorativos (Hero)
        </h3>
        <div className="relative h-64 rounded-3xl overflow-hidden bg-[#f0f4f8] border border-gray-200 mb-6">
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
            <div className="absolute -top-10 -left-12 w-[220px] h-[220px] rounded-full opacity-60" style={{ background: COLORS.peach, filter: "blur(60px)" }} />
            <div className="absolute -top-5 -right-16 w-[200px] h-[200px] rounded-full opacity-50" style={{ background: COLORS.blue, filter: "blur(70px)" }} />
            <div className="absolute top-1/2 -left-8 w-[160px] h-[160px] rounded-full opacity-50" style={{ background: COLORS.green, filter: "blur(60px)" }} />
            <div className="absolute bottom-0 right-0 w-[180px] h-[180px] rounded-full opacity-40" style={{ background: COLORS.lavender, filter: "blur(80px)" }} />
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[260px] h-[100px] rounded-full opacity-25" style={{ background: COLORS.softPurple, filter: "blur(80px)" }} />
          </div>
          <div className="relative z-10 h-full flex items-center justify-center">
            <p className="text-sm text-[#4B505B] bg-white/80 backdrop-blur-sm rounded-full px-4 py-2" style={{ fontWeight: 500 }}>5 blobs con blur(80-100px) y baja opacidad</p>
          </div>
        </div>
        <div className="bg-white rounded-3xl p-6 border border-gray-200">
          <p className="text-sm text-gray-900 mb-3" style={{ fontWeight: 600 }}>Guía de Blobs</p>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <TokenRow token="filter: blur(80-100px)" value="Suavizado extremo" />
              <TokenRow token="opacity" value="0.25 – 0.60 según blob" />
              <TokenRow token="rounded-full" value="Siempre circular" />
            </div>
            <div className="space-y-2">
              <TokenRow token="width" value="300px – 500px típico" />
              <TokenRow token="position" value="absolute, fuera del viewport parcial" />
              <TokenRow token="z-index" value="Bajo el contenido (z-0)" />
            </div>
          </div>
        </div>
      </DSSection>

      {/* ═══════════════════════════════════════════════════════
          5. LAYOUTS Y ESPACIADO
         ═══════════════════════════════════════════════════════ */}
      <DSSection
        id="layouts"
        icon={<Layout className="w-4 h-4 text-white" />}
        title="Layouts y Espaciado"
        description="Estructura de página, contenedores y sistema de espaciado."
      >
        {/* Landing Page Structure */}
        <h3 className="text-lg text-gray-900 mb-6" style={{ fontWeight: 600 }}>
          Estructura — Landing Page
        </h3>
        <div className="bg-gray-50 rounded-3xl p-8 mb-12 border border-gray-100">
          <div className="flex flex-col gap-2 max-w-lg mx-auto mb-8">
            <div className="h-8 bg-white rounded-lg border border-gray-200 flex items-center px-3">
              <span className="text-[10px] text-[#4B505B]">Header — fixed, white, border-b gray-200</span>
            </div>
            <div className="h-16 bg-[#f0f4f8] rounded-lg flex items-center justify-center">
              <span className="text-[10px] text-[#4B505B]">Hero — bg-[#f0f4f8] + blobs</span>
            </div>
            <div className="h-12 bg-white rounded-lg border border-gray-200 flex items-center justify-center relative overflow-hidden">
              <DotPattern />
              <span className="text-[10px] text-[#4B505B] relative z-10">Sección — white + DotPattern</span>
            </div>
            <div className="h-12 bg-[#f0f4f8] rounded-lg flex items-center justify-center">
              <span className="text-[10px] text-[#4B505B]">Sección — bg-[#f0f4f8]</span>
            </div>
            <div className="h-12 bg-white rounded-lg border border-gray-200 flex items-center justify-center relative overflow-hidden">
              <DotPattern />
              <span className="text-[10px] text-[#4B505B] relative z-10">Sección — white + DotPattern</span>
            </div>
            <div className="h-12 bg-[#f0f4f8] rounded-lg flex items-center justify-center">
              <span className="text-[10px] text-[#4B505B]">Sección — bg-[#f0f4f8]</span>
            </div>
            <div className="h-12 bg-white rounded-lg border border-gray-200 flex items-center justify-center relative overflow-hidden">
              <DotPattern />
              <span className="text-[10px] text-[#4B505B] relative z-10">CTA Final — white + DotPattern</span>
            </div>
            <div className="h-8 bg-white rounded-lg border-t-2 border-gray-200 flex items-center px-3">
              <span className="text-[10px] text-[#4B505B]">Footer — white, border-t gray-200</span>
            </div>
          </div>
          <p className="text-sm text-[#4B505B] text-center">
            Las secciones alternan entre <code className="bg-gray-100 rounded px-1.5 py-0.5 font-mono text-xs">white + DotPattern</code> y{" "}
            <code className="bg-gray-100 rounded px-1.5 py-0.5 font-mono text-xs">bg-[#f0f4f8]</code>
          </p>
        </div>

        {/* Internal Pages Layout */}
        <h3 className="text-lg text-gray-900 mb-6" style={{ fontWeight: 600 }}>
          Estructura — Internal Pages
        </h3>
        <div className="bg-gray-50 rounded-3xl p-8 mb-12 border border-gray-100">
          <p className="text-sm text-[#4B505B] mb-6">
            Todas las páginas internas (post-login) comparten un layout consistente con fondo <code className="bg-gray-100 rounded px-1.5 py-0.5 font-mono text-xs">bg-[#f0f4f8]</code>,
            blobs decorativos, y footer compacto. Aplica a: Onboarding, PracticeSetup, SessionReport, PracticeHistory.
          </p>
          <div className="flex flex-col gap-2 max-w-lg mx-auto mb-8">
            {/* Header */}
            <div className="h-10 bg-white rounded-lg border border-gray-200 flex items-center justify-between px-3">
              <div className="flex items-center gap-1.5">
                <div className="w-14 h-3 rounded bg-[#0f172b]/80" />
                <div className="w-6 h-3 rounded" style={{ background: COLORS.brandGradient }} />
              </div>
              <div className="w-12 h-3 rounded bg-[#45556c]/30" />
            </div>
            <div className="text-[10px] text-[#4B505B] -mt-0.5 mb-0.5 flex items-center justify-between px-1">
              <span>Header — BrandLogo + acción (Cancelar / Omitir / Salir)</span>
              <span className="font-mono text-[#62748e]">h-20, max-w-5xl</span>
            </div>
            {/* Content zone with blobs hint */}
            <div className="relative bg-[#f0f4f8] rounded-lg overflow-hidden">
              {/* Simulated blobs */}
              <div className="absolute -top-4 -left-6 w-20 h-20 rounded-full opacity-30" style={{ background: COLORS.peach, filter: "blur(20px)" }} />
              <div className="absolute -bottom-2 -right-4 w-16 h-16 rounded-full opacity-25" style={{ background: COLORS.blue, filter: "blur(18px)" }} />
              {/* Title block */}
              <div className="relative z-10 flex flex-col items-center py-6 px-4 gap-2">
                <div className="w-8 h-8 rounded-full bg-white/60 border border-white/80 flex items-center justify-center">
                  <div className="w-4 h-4 rounded-full bg-[#f5f3ff]" />
                </div>
                <div className="w-40 h-3 rounded bg-[#0f172b]/15" />
                <div className="w-28 h-2 rounded bg-[#45556c]/15" />
              </div>
              <div className="text-[10px] text-[#4B505B] text-center pb-1">
                PageTitleBlock + PastelBlobs
              </div>
            </div>
            {/* Main card */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-[#f5f3ff]" />
                  <div>
                    <div className="w-20 h-2 rounded bg-[#0f172b]/20 mb-1" />
                    <div className="w-16 h-1.5 rounded bg-[#62748e]/15" />
                  </div>
                </div>
                <div className="w-8 h-1.5 rounded bg-[#94a3b8]/20" />
              </div>
              {/* Progress bar */}
              <div className="flex gap-1 mb-3">
                <div className="h-1 flex-1 rounded-full bg-[#0f172b]/70" />
                <div className="h-1 flex-1 rounded-full bg-[#0f172b]/70" />
                <div className="h-1 flex-1 rounded-full bg-[#e2e8f0]" />
              </div>
              {/* Grid options */}
              <div className="grid grid-cols-2 gap-1.5 mb-3">
                <div className="h-6 rounded-lg border-2 border-[#0f172b] bg-[#0f172b]/5" />
                <div className="h-6 rounded-lg border border-[#e2e8f0]" />
                <div className="h-6 rounded-lg border border-[#e2e8f0]" />
                <div className="h-6 rounded-lg border border-[#e2e8f0]" />
              </div>
              {/* Button */}
              <div className="h-7 rounded-xl bg-[#0f172b] flex items-center justify-center">
                <div className="w-14 h-2 rounded bg-white/40" />
              </div>
            </div>
            <div className="text-[10px] text-[#4B505B] text-center -mt-0.5">
              Multi-step card (rounded-2xl, border-[#e2e8f0]) — max-w-lg o max-w-[768px]
            </div>
            {/* Mini Footer */}
            <div className="h-6 bg-white rounded-lg border-t border-gray-200 flex items-center justify-between px-3 mt-1">
              <div className="w-10 h-2 rounded bg-[#0f172b]/15 scale-75 origin-left" />
              <div className="w-14 h-1.5 rounded bg-[#90A1B9]/20" />
            </div>
            <div className="text-[10px] text-[#4B505B] text-center -mt-0.5">
              MiniFooter — logo 75% + copyright
            </div>
          </div>

          <div className="space-y-2 text-sm mb-6">
            <TokenRow token="bg-[#f0f4f8]" value="Fondo uniforme (sectionAlt)" />
            <TokenRow token="PastelBlobs" value="Componente decorativo absolute inset-0" />
            <TokenRow token="header h-20" value="Logo + acción contextual a la derecha" />
            <TokenRow token="max-w-5xl mx-auto px-6" value="Contenedor del header" />
            <TokenRow token="max-w-lg / max-w-[768px]" value="Ancho del contenido principal" />
            <TokenRow token="pt-10 / pt-12 pb-20" value="Padding del contenido principal" />
            <TokenRow token="MiniFooter" value="Cierre compacto con mt-auto" />
          </div>

          <p className="text-sm text-[#4B505B] mb-3" style={{ fontWeight: 500 }}>
            Páginas que usan este layout:
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              "SessionReportPage",
              "PracticeHistoryPage",
              "DashboardPage",
            ].map((page) => (
              <span
                key={page}
                className="text-xs bg-white rounded-full px-3 py-1.5 border border-gray-200 text-[#0f172b]"
                style={{ fontWeight: 500 }}
              >
                {page}
              </span>
            ))}
          </div>
        </div>

        {/* Containers */}
        <h3 className="text-lg text-gray-900 mb-6" style={{ fontWeight: 600 }}>
          Contenedores
        </h3>
        <div className="bg-gray-50 rounded-3xl p-8 mb-12 border border-gray-100">
          <div className="space-y-2 text-sm">
            <TokenRow token="max-w-6xl mx-auto px-6" value="Contenedor principal de página (1152px)" />
            <TokenRow token="max-w-5xl mx-auto" value="Grids de cards (1024px)" />
            <TokenRow token="max-w-4xl mx-auto" value="Stats bar, contenido estrecho (896px)" />
            <TokenRow token="max-w-3xl mx-auto" value="FAQ section (768px)" />
            <TokenRow token="max-w-2xl mx-auto" value="Section headings, centrado (672px)" />
          </div>
        </div>

        {/* Spacing */}
        <h3 className="text-lg text-gray-900 mb-6" style={{ fontWeight: 600 }}>
          Espaciado
        </h3>
        <div className="bg-gray-50 rounded-3xl p-8 mb-12 border border-gray-100">
          <p className="text-sm text-[#4B505B] mb-4" style={{ fontWeight: 500 }}>Secciones</p>
          <div className="space-y-2 text-sm mb-6">
            <TokenRow token="py-20 md:py-28" value="Padding vertical de secciones estándar" />
            <TokenRow token="py-24 md:py-32" value="Padding vertical del CTA Final" />
            <TokenRow token="pt-32 md:pt-44 pb-20 md:pb-28" value="Hero (compensa header fixed)" />
            <TokenRow token="mb-12" value="Espacio entre SectionHeading y contenido" />
          </div>
          <p className="text-sm text-[#4B505B] mb-4" style={{ fontWeight: 500 }}>Cards y grids</p>
          <div className="space-y-2 text-sm mb-6">
            <TokenRow token="gap-5" value="Grid de Cómo Funciona (3 cols)" />
            <TokenRow token="gap-6" value="Grid de Pricing, Impacto, For You, Before/After" />
            <TokenRow token="p-7" value="Padding de cards informativas (pastel)" />
            <TokenRow token="p-8" value="Padding de pricing cards y list cards" />
          </div>
          <p className="text-sm text-[#4B505B] mb-4" style={{ fontWeight: 500 }}>Border Radius</p>
          <div className="flex flex-wrap gap-6 mb-4">
            {[
              { r: "rounded-full", label: "Full", example: "Botones, badges, pills, avatares" },
              { r: "rounded-3xl", label: "3xl (24px)", example: "Cards, stats bar, secciones internas" },
              { r: "rounded-2xl", label: "2xl (16px)", example: "FAQ items, banners" },
              { r: "rounded-xl", label: "xl (12px)", example: "Icon containers" },
              { r: "rounded-lg", label: "lg (8px)", example: "Code blocks, tags" },
            ].map((item) => (
              <div key={item.r} className="flex flex-col items-center gap-2">
                <div className={`w-16 h-16 bg-[#2d2d2d] ${item.r}`} />
                <span className="text-xs font-mono text-[#4B505B]">{item.r}</span>
                <span className="text-[10px] text-[#4B505B]/70 text-center max-w-[100px]">{item.example}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Color Distribution Map */}
        <h3 className="text-lg text-gray-900 mb-6" style={{ fontWeight: 600 }}>
          Mapa de Distribución de Colores Pastel
        </h3>
        <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100">
          <div className="space-y-4">
            {[
              { section: "Hero (blobs)", colors: [COLORS.peach, COLORS.blue, COLORS.green, COLORS.lavender, COLORS.softPurple] },
              { section: "Cómo funciona", colors: [COLORS.peach, COLORS.blue, COLORS.green] },
              { section: "Antes y Después", colors: [COLORS.green, COLORS.peach] },
              { section: "Impacto", colors: [COLORS.softPurple, COLORS.blue, COLORS.softPurple] },
              { section: "Pricing", colors: [COLORS.white, COLORS.darkPrimary, COLORS.white] },
            ].map((row) => (
              <div key={row.section} className="flex items-center gap-4">
                <span className="text-sm text-[#4B505B] min-w-[140px]" style={{ fontWeight: 500 }}>
                  {row.section}
                </span>
                <div className="flex gap-2">
                  {row.colors.map((c, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-lg border border-black/10"
                      style={{ backgroundColor: c }}
                      title={c}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </DSSection>

      {/* ───── FOOTER ───── */}
      <footer className="bg-white py-12 border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <BrandLogo />
          <p className="text-sm text-[#4B505B] mt-4">
            Design System v3.0 — Referencia interna para inFluentia PRO
          </p>
        </div>
      </footer>
    </div>
  );
}
