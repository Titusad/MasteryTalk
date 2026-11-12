import { useEffect, useMemo, useState } from "react";
import { Download, Mail, CheckCircle2 } from "lucide-react";
import { BrandLogo, DotPattern, MiniFooter } from "@/shared/ui";
import { COLORS } from "@/shared/ui/design-tokens";
import { SUPABASE_URL } from "@/services/supabase";

/**
 * Landing de la Etapa 1 (lista de espera) — VIDEO_PLAN.md "Landing de la Etapa 1".
 *
 * No vende, no muestra la app, no tiene precio. Hace tres cosas:
 *   1. Entrega el workbook del video que trajo a la persona (correo).
 *   2. Ofrece el e-book completo a cambio de unirse a la lista de espera.
 *   3. Recoge esa lista de espera.
 *
 * Reemplaza a LandingPage/Landing2Page/Landing3Page como ruta por defecto
 * mientras dure la Etapa 1 (ver App.tsx). Esas tres landings de venta
 * quedan intactas y alcanzables por hash para la Etapa 2.
 *
 * Captura de leads: ambos formularios llaman a `POST /waitlist` (PRODUCT_SPEC
 * §6.4 y §9.2), que guarda el contacto en Loops y dispara el correo en español.
 * El workbook se descarga igual aunque el backend falle — el lead magnet nunca
 * depende de él — pero la página solo dice "revisa tu correo" si la petición
 * funcionó.
 */

type VideoId = "1";

interface VideoContent {
  frameworkTitle: string;
  heroSub: string;
  before: string;
  afterPrefix: string;
  afterMark1: string;
  afterMid: string;
  afterMark2: string;
  workbookUrl: string;
  bg: string;
}

const VIDEOS: Record<VideoId, VideoContent> = {
  "1": {
    frameworkTitle: "El workbook de “The Three-Move Introduction” está listo",
    heroSub:
      "El framework del Video 1 para presentarte en tres movimientos, con espacio para escribir tu propia versión.",
    before: "“Hi, I’m David. I’m a UX designer from Colombia. I have 17 years of experience…”",
    afterPrefix: "I’m David. I design platforms that ",
    afterMark1: "make complex decisions simple",
    afterMid: ". On my last fintech project, I cut the client’s feedback cycle from weeks to days. ",
    afterMark2: "What’s slowing your team’s decisions down the most right now?",
    workbookUrl: "/workbooks/video-01-workbook.pdf",
    bg: COLORS.peach,
  },
};
const DEFAULT_VIDEO: VideoId = "1";

function currentVideoId(): VideoId {
  const v = new URLSearchParams(window.location.search).get("v");
  return (v as VideoId) in VIDEOS ? (v as VideoId) : DEFAULT_VIDEO;
}

function useCurrentVideo(): VideoContent {
  return useMemo(() => VIDEOS[currentVideoId()], []);
}

/** Carga Newsreader (frases en inglés) y Kalam (notas a mano) solo en esta página. */
function useRedlineFonts() {
  useEffect(() => {
    const id = "waitlist-redline-fonts";
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Newsreader:ital@1&family=Kalam:wght@400;700&display=swap";
    document.head.appendChild(link);
  }, []);
}

const WAITLIST_URL = `${SUPABASE_URL}/functions/v1/make-server-08b8658d/waitlist`;
const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content"] as const;

/** Envía el lead al backend. Devuelve true solo si el servidor lo aceptó y el correo quedó en cola. */
async function submitLead(payload: {
  name: string;
  email: string;
  wantsEbook: boolean;
  website: string;
}): Promise<boolean> {
  const params = new URLSearchParams(window.location.search);
  const utm: Record<string, string> = {};
  for (const key of UTM_KEYS) {
    const value = params.get(key);
    if (value) utm[key] = value;
  }
  try {
    const res = await fetch(WAITLIST_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, video: currentVideoId(), utm }),
    });
    if (!res.ok) {
      console.error("[WaitlistLandingPage] Failed to submit lead: HTTP", res.status);
    }
    return res.ok;
  } catch (err) {
    console.error("[WaitlistLandingPage] Failed to submit lead:", err);
    return false;
  }
}

function LeadForm({
  idPrefix,
  placeholder,
  ctaLabel,
  wantsEbook,
  accentBg,
  onSubmitted,
}: {
  idPrefix: string;
  placeholder: string;
  ctaLabel: string;
  wantsEbook: boolean;
  accentBg?: string;
  onSubmitted?: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState(""); // honeypot: las personas no lo ven ni lo llenan
  const [status, setStatus] = useState<"idle" | "error" | "sending" | "done" | "failed">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "sending") return;
    if (!email.includes("@")) {
      setStatus("error");
      return;
    }
    setStatus("sending");
    // La descarga empieza ya: no depende de que el backend responda.
    onSubmitted?.();
    const ok = await submitLead({ name: name.trim(), email: email.trim(), wantsEbook, website });
    setStatus(ok ? "done" : "failed");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 flex flex-col gap-3"
      style={accentBg ? { background: accentBg } : undefined}
    >
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Tu nombre"
        autoComplete="name"
        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm placeholder:text-[#94a3b8] focus:outline-none focus:border-[#2d2d2d]"
      />
      <input
        type="text"
        name="website"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute -left-[9999px] w-px h-px opacity-0"
      />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={placeholder}
        autoComplete="email"
        required
        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm placeholder:text-[#94a3b8] focus:outline-none focus:border-[#2d2d2d]"
      />
      <button
        type="submit"
        disabled={status === "sending"}
        className="inline-flex items-center justify-center gap-2 bg-[#2d2d2d] text-white px-6 py-3.5 rounded-full text-sm font-medium hover:bg-[#1a1a1a] transition-colors shadow-lg disabled:opacity-60"
      >
        {status === "done" ? <CheckCircle2 className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
        {ctaLabel}
      </button>
      {status === "error" && (
        <p className="text-xs text-[#b45309]">Escribe un correo válido.</p>
      )}
      {status === "done" && (
        <p className="text-xs text-[#1f8f55]">Listo. Revisa tu correo (y el spam, por si acaso).</p>
      )}
      {status === "failed" && (
        <p className="text-xs text-[#b45309]">
          {wantsEbook
            ? "No pudimos guardar tu correo. Inténtalo de nuevo en unos minutos."
            : "Tu descarga ya empezó, pero no pudimos enviarte el correo. Inténtalo de nuevo en unos minutos."}
        </p>
      )}
      <p className="text-xs text-[#94a3b8] leading-relaxed">
        Usamos tu correo solo para esto y, si quieres, novedades de la serie. Nada de spam. Ver el{" "}
        <a href="#privacy" className="underline hover:text-[#62748e]">aviso de tratamiento de datos</a>.
      </p>
    </form>
  );
}

export function WaitlistLandingPage() {
  useRedlineFonts();
  const video = useCurrentVideo();
  const [downloaded, setDownloaded] = useState(false);

  const downloadWorkbook = () => {
    const a = document.createElement("a");
    a.href = video.workbookUrl;
    a.download = "";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setDownloaded(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header — solo la marca, sin menú de venta */}
      <header className="w-full px-6 py-6">
        <BrandLogo />
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden px-6 py-14" style={{ background: video.bg }}>
        <DotPattern />
        <div className="relative max-w-2xl mx-auto flex flex-col items-center text-center gap-5">
          <span
            className="inline-flex items-center px-4 py-2 rounded-full bg-white border border-gray-200 text-xs font-medium text-[#45556c]"
            style={{ fontFamily: "'Kalam', cursive" }}
          >
            en construcción
          </span>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[#0f172b]">
            {video.frameworkTitle}
          </h1>
          <p className="text-base text-[#45556c] max-w-lg">{video.heroSub}</p>

          {/* Demo Redline */}
          <div className="w-full max-w-md bg-white rounded-3xl border border-gray-200 shadow-sm p-6 text-left mt-2">
            <span className="text-xs font-medium uppercase tracking-wide text-[#94a3b8]">
              Así suena este video
            </span>
            <div className="mt-3 rounded-2xl bg-[#f8fafc] p-4">
              <span className="text-xs font-medium uppercase tracking-wide text-[#94a3b8]">Versión inicial</span>
              <p className="mt-1.5 text-base leading-snug text-[#62748e]" style={{ fontFamily: "'Newsreader', serif", fontStyle: "italic" }}>
                <span
                  style={{
                    backgroundImage: "url(/redline/tachado.svg)",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center 56%",
                    backgroundSize: "100% 42%",
                    WebkitBoxDecorationBreak: "clone",
                    boxDecorationBreak: "clone",
                  }}
                >
                  {video.before}
                </span>
              </p>
            </div>
            <div className="mt-3 rounded-2xl p-4" style={{ background: COLORS.green, border: `1.5px solid ${COLORS.softEmerald}` }}>
              <span className="text-xs font-medium uppercase tracking-wide text-[#1f8f55]">Versión ajustada</span>
              <p className="mt-1.5 text-base leading-relaxed" style={{ fontFamily: "'Newsreader', serif", fontStyle: "italic" }}>
                {video.afterPrefix}
                <mark
                  className="bg-transparent"
                  style={{
                    backgroundImage: "url(/redline/marcador.svg)",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center 58%",
                    backgroundSize: "100% 70%",
                    padding: "0 4px",
                    color: "inherit",
                    WebkitBoxDecorationBreak: "clone",
                    boxDecorationBreak: "clone",
                  }}
                >
                  {video.afterMark1}
                </mark>
                {video.afterMid}
                <mark
                  className="bg-transparent"
                  style={{
                    backgroundImage: "url(/redline/marcador.svg)",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center 58%",
                    backgroundSize: "100% 70%",
                    padding: "0 4px",
                    color: "inherit",
                    WebkitBoxDecorationBreak: "clone",
                    boxDecorationBreak: "clone",
                  }}
                >
                  {video.afterMark2}
                </mark>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Workbook */}
      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-10 items-center">
          <div>
            <span className="text-xs font-medium uppercase tracking-wide text-[#1f8f55]">
              Gratis · para imprimir
            </span>
            <h2 className="mt-2 text-2xl font-semibold text-[#0f172b]">
              Descarga el workbook de este video
            </h2>
            <p className="mt-2 text-sm text-[#45556c] max-w-sm">
              Dos páginas en blanco y negro: el framework del video y un espacio para escribir tu propia
              versión. Déjanos tu correo y te lo mandamos directo.
            </p>
          </div>
          <LeadForm
            idPrefix="wb"
            placeholder="Tu correo"
            ctaLabel="Enviarme el workbook"
            wantsEbook={false}
            onSubmitted={downloadWorkbook}
          />
        </div>
      </section>

      {/* Lo que viene */}
      <section className="relative overflow-hidden px-6 py-16" style={{ background: COLORS.blue }}>
        <DotPattern />
        <div className="relative max-w-xl mx-auto flex flex-col items-center text-center gap-4">
          <h2 className="text-2xl font-semibold text-[#0f172b]">Lo que se viene</h2>
          <p className="text-sm text-[#45556c] leading-relaxed">
            Estoy construyendo una herramienta para practicar esto en voz alta: hablas con una
            inteligencia artificial que te responde como lo haría un entrevistador o un cliente
            real, y te da feedback después. Todavía no está lista para el público — por ahora, la
            serie de videos y los workbooks son la forma de empezar a practicar.
          </p>
          <div className="mt-1 flex items-center gap-3 bg-white rounded-full border border-gray-200 pl-2 pr-5 py-2">
            <img
              src="/redline/autor-david.jpg"
              alt="David Castrillón"
              className="w-10 h-10 rounded-full object-cover"
              style={{ boxShadow: `0 0 0 3px ${COLORS.green}` }}
            />
            <span className="text-xs text-[#45556c] text-left">
              David Castrillón — 17 años en tech, cerrando en público su propio gap de
              comunicación ejecutiva.
            </span>
          </div>
        </div>
      </section>

      {/* E-book + lista de espera */}
      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-10 items-center">
          <div>
            <span className="text-xs font-medium uppercase tracking-wide text-[#6d28d9]">
              Gratis durante esta etapa
            </span>
            <h2 className="mt-2 text-2xl font-semibold text-[#0f172b]">
              El e-book completo + avisarte cuando esté lista
            </h2>
            <p className="mt-2 text-sm text-[#45556c] max-w-sm">
              Todos los workbooks, todos los slides en PDF a color y los enlaces a todos los videos
              de la serie, en un solo archivo. Y cuando la herramienta de práctica esté lista, te
              escribimos primero.
            </p>
          </div>
          <LeadForm
            idPrefix="eb"
            placeholder="Tu correo"
            ctaLabel="Quiero el e-book y la lista de espera"
            wantsEbook={true}
            accentBg="#f8fafc"
          />
        </div>
      </section>

      <MiniFooter />

      {downloaded && (
        <div className="fixed bottom-6 right-6 bg-[#0f172b] text-white rounded-2xl px-5 py-3 flex items-center gap-2 text-sm shadow-lg">
          <Download className="w-4 h-4" />
          Tu workbook se está descargando
        </div>
      )}
    </div>
  );
}
