/**
 * ══════════════════════════════════════════════════════════════
 *  MasteryTalk PRO — Biblioteca de workbooks (Etapa 1)
 *
 *  Public route: #biblioteca  (PRODUCT_SPEC §6.5.6)
 *  Distinta de LibraryPage (#library, microlecciones de la app).
 *
 *  Sin sesión: ofrece el acceso (enlace por correo o Google).
 *  Con sesión: workbooks publicados, e-book, botón aparte para avisarte
 *  de la herramienta y una sección reservada para extras.
 *  Español. Sin precios, sin suscripción, sin entrada a la práctica.
 * ══════════════════════════════════════════════════════════════
 */
import { useCallback, useEffect, useState } from "react";
import { BookOpen, Download, ExternalLink, Sparkles, CheckCircle2 } from "lucide-react";
import { BrandLogo, DotPattern, MiniFooter } from "@/shared/ui";
import { COLORS } from "@/shared/ui/design-tokens";
import { SUPABASE_URL, getAuthToken } from "@/services/supabase";
import type { User } from "@/services/types";
import { LibraryAccessForm } from "@/widgets/LibraryAccessForm";

const API = `${SUPABASE_URL}/functions/v1/make-server-08b8658d`;

interface WorkbookItem {
  id: string;
  video: number;
  title: string;
  framework: string | null;
  file: string;
  youtubeUrl: string | null;
}

interface LibraryData {
  workbooks: WorkbookItem[];
  ebookAvailable: boolean;
  toolInterest: boolean;
}

async function authedFetch(path: string, init?: RequestInit): Promise<Response> {
  const token = await getAuthToken();
  return fetch(`${API}${path}`, {
    ...init,
    headers: { ...(init?.headers ?? {}), Authorization: `Bearer ${token}` },
  });
}

interface WorkbookLibraryPageProps {
  authUser: User | null;
  onLogout: () => void;
}

export function WorkbookLibraryPage({ authUser, onLogout }: WorkbookLibraryPageProps) {
  const [data, setData] = useState<LibraryData | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [interestStatus, setInterestStatus] = useState<"idle" | "sending" | "done" | "failed">("idle");
  const [ebookStatus, setEbookStatus] = useState<"idle" | "loading" | "failed">("idle");

  const uid = authUser?.uid;

  useEffect(() => {
    if (!uid) {
      setData(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await authedFetch("/library");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const body = (await res.json()) as LibraryData;
        if (!cancelled) {
          setData(body);
          setLoadFailed(false);
          if (body.toolInterest) setInterestStatus("done");
        }
      } catch (err) {
        console.error("[WorkbookLibraryPage] Failed to load library:", err);
        if (!cancelled) setLoadFailed(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [uid]);

  const handleEbook = useCallback(async () => {
    setEbookStatus("loading");
    try {
      const res = await authedFetch("/library/ebook");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const { url } = (await res.json()) as { url: string };
      window.location.assign(url);
      setEbookStatus("idle");
    } catch (err) {
      console.error("[WorkbookLibraryPage] Failed to get e-book link:", err);
      setEbookStatus("failed");
    }
  }, []);

  const handleToolInterest = useCallback(async () => {
    setInterestStatus("sending");
    try {
      const res = await authedFetch("/library/tool-interest", { method: "POST" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setInterestStatus("done");
    } catch (err) {
      console.error("[WorkbookLibraryPage] Failed to save tool interest:", err);
      setInterestStatus("failed");
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="w-full px-6 py-6 flex items-center justify-between">
        <a href="/" aria-label="Ir al inicio"><BrandLogo /></a>
        {authUser && (
          <button
            type="button"
            onClick={onLogout}
            className="text-sm text-[#62748e] hover:text-[#0f172b] transition-colors"
          >
            Salir
          </button>
        )}
      </header>

      <section className="relative overflow-hidden px-6 py-14" style={{ background: COLORS.peach }}>
        <DotPattern />
        <div className="relative max-w-2xl mx-auto flex flex-col items-center text-center gap-4">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[#0f172b]">
            Biblioteca de MasteryTalk
          </h1>
          <p className="text-base text-[#45556c] max-w-lg">
            {authUser
              ? "Todos los workbooks de la serie, el e-book completo y lo que vayamos sumando."
              : "Crea tu cuenta gratis para entrar a todos los workbooks, al e-book completo y a los recursos que vayamos sumando."}
          </p>
        </div>
      </section>

      <main className="flex-1 px-6 py-12">
        <div className="max-w-3xl mx-auto flex flex-col gap-8">
          {!authUser && (
            <div className="max-w-md w-full mx-auto">
              <LibraryAccessForm idPrefix="lib" />
            </div>
          )}

          {authUser && loadFailed && (
            <p className="text-sm text-[#b45309] text-center">
              No pudimos cargar la biblioteca. Recarga la página en unos minutos.
            </p>
          )}

          {authUser && !data && !loadFailed && (
            <p className="text-sm text-[#62748e] text-center">Cargando…</p>
          )}

          {authUser && data && (
            <>
              <section aria-label="Workbooks" className="flex flex-col gap-4">
                <h2 className="text-xl font-semibold text-[#0f172b]">Workbooks</h2>
                {data.workbooks.map((wb) => (
                  <article
                    key={wb.id}
                    className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 flex flex-col sm:flex-row sm:items-center gap-4"
                  >
                    <div className="flex-1">
                      <span className="text-xs font-medium uppercase tracking-wide text-[#94a3b8]">
                        Video {wb.video}
                      </span>
                      <h3 className="mt-1 text-lg font-medium text-[#0f172b]">{wb.title}</h3>
                      {wb.framework && <p className="text-sm text-[#45556c]">{wb.framework}</p>}
                    </div>
                    <div className="flex items-center gap-3">
                      {wb.youtubeUrl && (
                        <a
                          href={wb.youtubeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-sm text-[#62748e] hover:text-[#0f172b]"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Ver el video
                        </a>
                      )}
                      <a
                        href={wb.file}
                        download
                        className="inline-flex items-center gap-2 bg-[#2d2d2d] text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-[#1a1a1a] transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        Descargar
                      </a>
                    </div>
                  </article>
                ))}
              </section>

              <section aria-label="E-book" className="flex flex-col gap-4">
                <h2 className="text-xl font-semibold text-[#0f172b]">E-book</h2>
                <article className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-[#0f172b] flex items-center gap-2">
                      <BookOpen className="w-5 h-5" />
                      El e-book completo
                    </h3>
                    <p className="text-sm text-[#45556c]">
                      Todos los workbooks, los slides en PDF a color y los enlaces a los videos de la serie.
                    </p>
                  </div>
                  {data.ebookAvailable ? (
                    <button
                      type="button"
                      onClick={handleEbook}
                      disabled={ebookStatus === "loading"}
                      className="inline-flex items-center gap-2 bg-[#2d2d2d] text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-[#1a1a1a] transition-colors disabled:opacity-60"
                    >
                      <Download className="w-4 h-4" />
                      Descargar e-book
                    </button>
                  ) : (
                    <span className="text-sm text-[#62748e]">Disponible después del Video 2</span>
                  )}
                </article>
                {ebookStatus === "failed" && (
                  <p className="text-xs text-[#b45309]">No pudimos generar la descarga. Inténtalo de nuevo.</p>
                )}
              </section>

              <section aria-label="Más recursos" className="flex flex-col gap-4">
                <h2 className="text-xl font-semibold text-[#0f172b]">Más recursos</h2>
                <p className="text-sm text-[#62748e]">Aquí iremos sumando material extra de la serie.</p>
              </section>

              <section
                aria-label="Herramienta de práctica"
                className="rounded-3xl border border-gray-200 p-6 flex flex-col gap-3"
                style={{ background: COLORS.blue }}
              >
                <h2 className="text-xl font-semibold text-[#0f172b] flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Lo que se viene
                </h2>
                <p className="text-sm text-[#45556c]">
                  Estoy construyendo una herramienta para practicar en voz alta con una inteligencia
                  artificial que te responde como un entrevistador o un cliente real. Todavía no está
                  lista. Si quieres que te escriba primero cuando lo esté, avísame aquí.
                </p>
                {interestStatus === "done" ? (
                  <p className="inline-flex items-center gap-2 text-sm text-[#1f8f55]">
                    <CheckCircle2 className="w-4 h-4" />
                    Listo, te aviso cuando puedas practicar.
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleToolInterest}
                    disabled={interestStatus === "sending"}
                    className="self-start inline-flex items-center justify-center bg-white text-[#2d2d2d] border border-gray-200 px-5 py-2.5 rounded-full text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-60"
                  >
                    Avísame cuando pueda practicar esto con inteligencia artificial
                  </button>
                )}
                {interestStatus === "failed" && (
                  <p className="text-xs text-[#b45309]">No pudimos guardarlo. Inténtalo de nuevo.</p>
                )}
              </section>
            </>
          )}
        </div>
      </main>

      <MiniFooter />
    </div>
  );
}
