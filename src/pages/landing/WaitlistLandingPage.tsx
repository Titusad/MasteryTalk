import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Download } from "lucide-react";
import { BrandLogo, DotPattern, MiniFooter } from "@/shared/ui";
import { COLORS } from "@/shared/ui/design-tokens";
import { SUPABASE_URL } from "@/services/supabase";
import { LibraryAccessForm } from "@/widgets/LibraryAccessForm";

/**
 * Landing de la Etapa 1 — VIDEO_PLAN.md "Landing de la Etapa 1", PRODUCT_SPEC §6.5.
 *
 * No vende, no muestra la app, no tiene precio. Hace dos cosas:
 *   1. Entrega el workbook del video que trajo a la persona: descarga directa,
 *      sin registro (con `dl=1` en el enlace, empieza al cargar). Después, un panel
 *      corto y no bloqueante invita a crear la cuenta gratis.
 *   2. Ofrece la biblioteca (todos los workbooks + e-book + extras) a cambio de
 *      una cuenta gratis sin contraseña (LibraryAccessForm).
 *
 * El aviso de la herramienta NO vive aquí: es un botón aparte dentro de la
 * biblioteca (#biblioteca), para no mezclar interés en el contenido con interés
 * en la herramienta.
 *
 * La descarga nunca depende del backend; el conteo (`POST /workbook-download`)
 * es fire-and-forget.
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

const WORKBOOK_DOWNLOAD_URL = `${SUPABASE_URL}/functions/v1/make-server-08b8658d/workbook-download`;
const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content"] as const;

/** Cuenta la descarga (aproximado, §6.5.7). Fire-and-forget: nunca bloquea ni avisa a la persona. */
function countDownload(): void {
  const params = new URLSearchParams(window.location.search);
  const utm: Record<string, string> = {};
  for (const key of UTM_KEYS) {
    const value = params.get(key);
    if (value) utm[key] = value;
  }
  fetch(WORKBOOK_DOWNLOAD_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ video: currentVideoId(), utm }),
  }).catch((err) => console.error("[WaitlistLandingPage] Failed to count download:", err));
}

export function WaitlistLandingPage() {
  useRedlineFonts();
  const video = useCurrentVideo();
  const [downloaded, setDownloaded] = useState(false);
  const autoStarted = useRef(false);

  const downloadWorkbook = useCallback((count: boolean) => {
    const a = document.createElement("a");
    a.href = video.workbookUrl;
    a.download = "";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setDownloaded(true);
    if (count) countDownload();
  }, [video.workbookUrl]);

  // Enlace de la descripción del video (?dl=1): la descarga empieza sola. El navegador
  // puede bloquearla, por eso el panel siempre trae "Descargar de nuevo" (§6.5.2).
  useEffect(() => {
    if (autoStarted.current) return;
    if (new URLSearchParams(window.location.search).get("dl") !== "1") return;
    autoStarted.current = true;
    downloadWorkbook(true);
  }, [downloadWorkbook]);

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
              versión. Sin registro, directo.
            </p>
          </div>
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 flex flex-col gap-3">
            <button
              type="button"
              onClick={() => downloadWorkbook(true)}
              className="inline-flex items-center justify-center gap-2 bg-[#2d2d2d] text-white px-6 py-3.5 rounded-full text-sm font-medium hover:bg-[#1a1a1a] transition-colors shadow-lg"
            >
              <Download className="w-4 h-4" />
              {downloaded ? "Descargar de nuevo" : "Descargar el workbook"}
            </button>
            {downloaded && (
              <p className="text-xs text-[#1f8f55]">
                Tu workbook se está descargando. Si no empezó, pulsa de nuevo el botón.{" "}
                <a href="#biblioteca" className="underline">Crea tu cuenta gratis</a> para entrar a la
                biblioteca con todos los workbooks y el e-book.
              </p>
            )}
          </div>
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

      {/* Biblioteca (cuenta gratis) */}
      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-10 items-center">
          <div>
            <span className="text-xs font-medium uppercase tracking-wide text-[#6d28d9]">
              Gratis durante esta etapa
            </span>
            <h2 className="mt-2 text-2xl font-semibold text-[#0f172b]">
              La biblioteca completa: workbooks, e-book y más
            </h2>
            <p className="mt-2 text-sm text-[#45556c] max-w-sm">
              Todos los workbooks de la serie, el e-book con los slides en PDF a color y los enlaces a
              todos los videos. Crea tu cuenta gratis, sin contraseña, y entra cuando quieras.
            </p>
          </div>
          <LibraryAccessForm idPrefix="landing" />
        </div>
      </section>

      <MiniFooter />

    </div>
  );
}
