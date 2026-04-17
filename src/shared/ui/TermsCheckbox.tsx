/**
 * TermsCheckbox — Reusable legal acceptance checkbox.
 * Supports ES/PT/EN via the `lang` prop.
 *
 * Usage:
 *   <TermsCheckbox checked={accepted} onChange={setAccepted} lang="es" />
 */

type Lang = "es" | "pt" | "en";

const COPY: Record<Lang, { prefix: string; terms: string; and: string; privacy: string }> = {
  es: { prefix: "Al registrarme, acepto los", terms: "Términos de Servicio", and: "y la", privacy: "Política de Privacidad" },
  pt: { prefix: "Ao me cadastrar, aceito os", terms: "Termos de Serviço", and: "e a", privacy: "Política de Privacidade" },
  en: { prefix: "By signing up, I agree to the", terms: "Terms of Service", and: "and", privacy: "Privacy Policy" },
};

interface TermsCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  lang?: Lang;
}

export function TermsCheckbox({ checked, onChange, lang = "es" }: TermsCheckboxProps) {
  const c = COPY[lang];

  return (
    <label className="flex items-start gap-3 cursor-pointer select-none group">
      {/* Custom checkbox — larger and more visible */}
      <span
        className={`mt-0.5 flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
          checked
            ? "bg-[#0f172b] border-[#0f172b]"
            : "bg-white border-[#1e293b] group-hover:border-[#0f172b]"
        }`}
      >
        {checked && (
          <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2.5 6L5 8.5L9.5 3.5" />
          </svg>
        )}
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />
      <span className="text-[13px] text-[#475569] leading-relaxed">
        {c.prefix}{" "}
        <a
          href="#terms"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#0f172b] underline underline-offset-2 hover:text-[#6366f1] transition-colors"
          style={{ fontWeight: 600 }}
          onClick={(e) => e.stopPropagation()}
        >
          {c.terms}
        </a>{" "}
        {c.and}{" "}
        <a
          href="#privacy"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#0f172b] underline underline-offset-2 hover:text-[#6366f1] transition-colors"
          style={{ fontWeight: 600 }}
          onClick={(e) => e.stopPropagation()}
        >
          {c.privacy}
        </a>
        .
      </span>
    </label>
  );
}
