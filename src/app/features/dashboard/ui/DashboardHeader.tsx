/**
 * DashboardHeader — Top navigation bar
 * Presentational component (web-specific).
 */
import {
  LogOut,
  BookOpen,
  Zap,
} from "lucide-react";
import { BrandLogo } from "../../../components/shared";
import { authService } from "../../../../services";
import { getCreditsLabel } from "../../../components/CreditUpsellModal";
import type { LandingLang } from "../../../components/landing-i18n";

interface DashboardHeaderProps {
  avatarInitials: string;
  credits: number | null;
  freeSessionAvailable: boolean;
  lang: LandingLang;
  dc: { history: string };
  onNavigateToHistory?: () => void;
  onNavigateToLibrary?: () => void;
  onNavigateToAccount?: () => void;
  onLogout?: () => void;
  onOpenUpsell: () => void;
}

export function DashboardHeader({
  avatarInitials,
  credits,
  freeSessionAvailable,
  lang,
  dc,
  onNavigateToHistory,
  onNavigateToLibrary,
  onNavigateToAccount,
  onLogout,
  onOpenUpsell,
}: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#e2e8f0] relative">
      <div className="max-w-[1440px] mx-auto flex items-center justify-between px-6 md:px-8 h-16 md:h-20">
        <BrandLogo />
        <div className="flex items-center gap-4 md:gap-6">
          <button
            onClick={() => onNavigateToHistory?.()}
            className="text-[#45556c] hover:text-[#0f172b] transition-colors text-sm hidden sm:block"
            style={{ fontWeight: 500 }}
          >
            {dc.history}
          </button>

          <button
            onClick={() => onNavigateToLibrary?.()}
            className="text-[#45556c] hover:text-[#0f172b] transition-colors text-sm hidden sm:flex items-center gap-1.5"
            style={{ fontWeight: 500 }}
          >
            <BookOpen className="w-4 h-4" />
            Library
          </button>

          {credits !== null && (
            <button
              onClick={onOpenUpsell}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all cursor-pointer ${
                credits === 0 && !freeSessionAvailable
                  ? "bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100"
                  : "bg-[#f1f5f9] border border-[#e2e8f0] text-[#45556c] hover:bg-[#e2e8f0]"
              }`}
              style={{ fontWeight: 600 }}
            >
              <Zap
                className={`w-3 h-3 ${
                  credits === 0 && !freeSessionAvailable
                    ? "text-amber-500"
                    : "text-[#50C878]"
                }`}
              />
              {freeSessionAvailable && credits === 0
                ? lang === "pt"
                  ? "1 sessao gratis"
                  : "1 sesion gratis"
                : `${credits} ${getCreditsLabel(credits, lang)}`}
            </button>
          )}

          <div className="flex items-center gap-3">
            <button
              className="text-[#45556c] hover:text-[#0f172b] transition-colors p-2 rounded-full cursor-pointer flex items-center justify-center"
              onClick={() => {
                authService.signOut().catch(() => {});
                onLogout?.();
              }}
              title="Sign out"
            >
              <LogOut className="w-5 h-5" />
            </button>
            <div
              className="w-10 h-10 rounded-full bg-[#0f172b] flex items-center justify-center cursor-pointer"
              title="My account"
              onClick={() => onNavigateToAccount?.()}
            >
              <span
                className="text-white text-sm"
                style={{ fontWeight: 500 }}
              >
                {avatarInitials}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
