/**
 * DashboardHeader — Top navigation bar
 * Presentational component (web-specific).
 * v9.0: Replaced credit display with path access indicator.
 */
import {
  LogOut,
  BookOpen,
  Sparkles,
} from "lucide-react";
import { BrandLogo } from "@/shared/ui";
import { authService } from "@/services";
import type { LandingLang } from "@/shared/i18n/landing-i18n";

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
  // v9.0: credits now represents number of purchased paths
  const pathCount = credits ?? 0;

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#e2e8f0] relative">
      <div aria-label=\"DashboardHeader" className="max-w-[1440px] mx-auto flex items-center justify-between px-6 md:px-8 h-16 md:h-20">
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

          {/* v9.0: Path access indicator */}
          <button
            onClick={onOpenUpsell}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
              pathCount > 0
                ? "bg-[#f0fdf4] border border-[#bbf7d0] text-[#16a34a] hover:bg-[#dcfce7]"
                : freeSessionAvailable
                  ? "bg-[#f1f5f9] border border-[#e2e8f0] text-[#45556c] hover:bg-[#e2e8f0]"
                  : "bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100"
            }`}
            style={{ fontWeight: 500 }}
          >
            <Sparkles
              className={`w-3 h-3 ${
                pathCount > 0 ? "text-[#22c55e]" : "text-amber-500"
              }`}
            />
            {pathCount > 0
              ? `${pathCount} ${pathCount === 1 ? "Path" : "Paths"}`
              : freeSessionAvailable
                ? lang === "pt" ? "Demo grátis" : "Demo gratis"
                : lang === "pt" ? "Obter acesso" : "Get access"}
          </button>

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
