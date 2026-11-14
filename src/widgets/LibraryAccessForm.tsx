import { useState } from "react";
import { Mail, CheckCircle2 } from "lucide-react";
import { SUPABASE_URL } from "@/services/supabase";
import { authService } from "@/services";
import { LIBRARY_ORIGIN_FLAG_KEY, WAITLIST_ORIGIN } from "@/shared/config/stage";

/**
 * Acceso a la biblioteca de la Etapa 1 (PRODUCT_SPEC §6.5.4): enlace por correo
 * (sin contraseña) o Google. Crea una cuenta real del producto; NO apunta a la
 * lista de la herramienta (eso es un botón aparte dentro de la biblioteca).
 */

const ACCESS_LINK_URL = `${SUPABASE_URL}/functions/v1/make-server-08b8658d/library/access-link`;
const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content"] as const;

async function requestAccessLink(payload: { email: string; website: string }): Promise<boolean> {
  const params = new URLSearchParams(window.location.search);
  const utm: Record<string, string> = {};
  for (const key of UTM_KEYS) {
    const value = params.get(key);
    if (value) utm[key] = value;
  }
  try {
    const res = await fetch(ACCESS_LINK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, utm }),
    });
    if (!res.ok) {
      console.error("[LibraryAccessForm] Failed to request access link: HTTP", res.status);
    }
    return res.ok;
  } catch (err) {
    console.error("[LibraryAccessForm] Failed to request access link:", err);
    return false;
  }
}

export function LibraryAccessForm({ idPrefix }: { idPrefix: string }) {
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState(""); // honeypot: las personas no lo ven ni lo llenan
  const [status, setStatus] = useState<"idle" | "invalid" | "sending" | "done" | "failed">("idle");
  const [googleFailed, setGoogleFailed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "sending") return;
    if (!email.includes("@")) {
      setStatus("invalid");
      return;
    }
    setStatus("sending");
    const ok = await requestAccessLink({ email: email.trim(), website });
    setStatus(ok ? "done" : "failed");
  };

  const handleGoogle = async () => {
    setGoogleFailed(false);
    try {
      sessionStorage.setItem(LIBRARY_ORIGIN_FLAG_KEY, WAITLIST_ORIGIN);
      await authService.signIn("google");
    } catch (err) {
      console.error("[LibraryAccessForm] Google sign-in failed:", err);
      sessionStorage.removeItem(LIBRARY_ORIGIN_FLAG_KEY);
      sessionStorage.removeItem("masterytalk_auth_loading");
      setGoogleFailed(true);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 flex flex-col gap-3">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <label htmlFor={`${idPrefix}-email`} className="sr-only">Tu correo</label>
        <input
          id={`${idPrefix}-email`}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Tu correo"
          autoComplete="email"
          required
          className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm placeholder:text-[#94a3b8] focus:outline-none focus:border-[#2d2d2d]"
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
        <button
          type="submit"
          disabled={status === "sending"}
          className="inline-flex items-center justify-center gap-2 bg-[#2d2d2d] text-white px-6 py-3.5 rounded-full text-sm font-medium hover:bg-[#1a1a1a] transition-colors shadow-lg disabled:opacity-60"
        >
          {status === "done" ? <CheckCircle2 className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
          Enviarme el enlace de acceso
        </button>
      </form>

      {status === "invalid" && <p className="text-xs text-[#b45309]">Escribe un correo válido.</p>}
      {status === "done" && (
        <p className="text-xs text-[#1f8f55]">
          Listo. Te enviamos un enlace a tu correo (revisa también el spam). Caduca en una hora.
        </p>
      )}
      {status === "failed" && (
        <p className="text-xs text-[#b45309]">
          No pudimos enviarte el enlace. Inténtalo de nuevo en unos minutos.
        </p>
      )}

      <div className="flex items-center gap-3 text-xs text-[#94a3b8]">
        <span className="h-px flex-1 bg-gray-200" />
        o
        <span className="h-px flex-1 bg-gray-200" />
      </div>

      <button
        type="button"
        onClick={handleGoogle}
        className="inline-flex items-center justify-center gap-2 bg-white text-[#2d2d2d] border border-gray-200 px-6 py-3.5 rounded-full text-sm font-medium hover:bg-gray-50 transition-colors"
      >
        Continuar con Google
      </button>
      {googleFailed && (
        <p className="text-xs text-[#b45309]">No pudimos abrir Google. Inténtalo de nuevo o usa el correo.</p>
      )}

      <p className="text-xs text-[#94a3b8] leading-relaxed">
        Crea tu cuenta gratis: sin contraseña, sin tarjeta. Usamos tu correo para darte acceso y,
        si quieres, novedades de la serie. Ver el{" "}
        <a href="#privacy" className="underline hover:text-[#62748e]">aviso de tratamiento de datos</a>.
      </p>
    </div>
  );
}
