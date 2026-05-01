/**
 * AppHeader — Canonical header component for all internal app pages.
 *
 * Three variants:
 *   public    → Terms, Privacy — white bg, back button + BrandLogo (right)
 *   dashboard → Dashboard, Account, History, Library — persistent nav bar
 *   session   → PracticeSession — minimal: hamburger + logo + "Go to Dashboard"
 *
 * Landing page header is a separate marketing component (per DESIGN_SYSTEM §6.1).
 */

import { ArrowLeft, LogOut, BookOpen, User, ChevronDown } from "lucide-react";
import type React from "react";
import { useState, useRef, useEffect } from "react";
import { BrandLogo } from "./BrandLogo";
import { NarrationToggle } from "./NarrationToggle";

/* ── Profile dropdown — extracted as a proper component so hooks are always
   called in the same order regardless of the parent's conditional render. ── */
function ProfileDropdown({
  initials,
  onNavigateToAccount,
  onLogout,
}: {
  initials: string;
  onNavigateToAccount?: () => void;
  onLogout?: () => void;
}) {
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

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(o => !o)} className="flex items-center gap-1.5 group">
        <div className="w-8 h-8 rounded-full bg-[#0f172b] flex items-center justify-center">
          <span className="text-white text-sm font-medium">{initials}</span>
        </div>
        <ChevronDown
          className="w-3.5 h-3.5 text-[#94a3b8] group-hover:text-[#0f172b] transition-all"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-44 bg-white rounded-xl border border-[#e2e8f0] shadow-lg overflow-hidden z-50">
          {onNavigateToAccount && (
            <button
              onClick={() => { setOpen(false); onNavigateToAccount(); }}
              className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-[#0f172b] hover:bg-[#f8fafc] transition-colors text-left"
              style={{ fontWeight: 500 }}
            >
              <User className="w-4 h-4 text-[#62748e]" />
              My Profile
            </button>
          )}
          {onLogout && (
            <button
              onClick={() => { setOpen(false); onLogout(); }}
              className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors text-left border-t border-[#f1f5f9]"
              style={{ fontWeight: 500 }}
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export interface AppHeaderProps {
  variant: "public" | "dashboard" | "session";

  /** public: show a back arrow + label */
  showBackButton?: boolean;
  backLabel?: string;
  onBack?: () => void;

  /** dashboard: navigate to main dashboard (← Dashboard link) */
  onNavigateToDashboard?: () => void;
  /** dashboard/session: logo click → navigate to home/landing */
  onLogoClick?: () => void;
  /** dashboard: user display name — initials derived automatically */
  userName?: string;
  onLogout?: () => void;
  onNavigateToAccount?: () => void;
  onNavigateToHistory?: () => void;
  onNavigateToLibrary?: () => void;
  /** Extra content rendered left of the avatar/logout cluster (e.g. PathBadge) */
  rightSlot?: React.ReactNode;

  /** session: extra content in the left area (e.g. mobile menu toggle) */
  leftSlot?: React.ReactNode;
  /** session: navigates to dashboard (caller handles confirmation dialog) */
  onGoToDashboard?: () => void;
}

export function AppHeader({
  variant,
  showBackButton = false,
  backLabel = "Back",
  onBack,
  onNavigateToDashboard,
  onLogoClick,
  userName,
  onLogout,
  onNavigateToAccount,
  onNavigateToHistory,
  onNavigateToLibrary,
  rightSlot,
  leftSlot,
  onGoToDashboard,
}: AppHeaderProps) {
  /* ── Public variant ── */
  if (variant === "public") {
    return (
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto flex items-center justify-between px-6 h-16">
          {showBackButton && onBack ? (
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-sm text-[#45556c] hover:text-[#0f172b] transition-colors font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              {backLabel}
            </button>
          ) : (
            <div />
          )}
          <BrandLogo />
        </div>
      </header>
    );
  }

  /* ── Dashboard variant (persistent) ── */
  if (variant === "dashboard") {
    const avatarInitials = userName
      ? userName.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
      : "U";

    return (
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#e2e8f0] shrink-0">
        <div
          aria-label="AppHeader"
          className="flex items-center justify-between px-6 md:px-8 h-14"
        >
          <div className="flex items-center gap-3">
            {onLogoClick ? (
              <button onClick={onLogoClick} className="cursor-pointer">
                <BrandLogo />
              </button>
            ) : (
              <BrandLogo />
            )}
            {onNavigateToDashboard && (
              <button
                onClick={onNavigateToDashboard}
                className="flex items-center gap-1.5 text-sm text-[#45556c] hover:text-[#0f172b] transition-colors font-medium"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Dashboard
              </button>
            )}
          </div>

          <div className="flex items-center gap-4 md:gap-6">
            {onNavigateToHistory && (
              <button
                onClick={onNavigateToHistory}
                className="text-[#45556c] hover:text-[#0f172b] transition-colors text-sm hidden sm:block font-medium"
              >
                History
              </button>
            )}
            {onNavigateToLibrary && (
              <button
                onClick={onNavigateToLibrary}
                className="text-[#45556c] hover:text-[#0f172b] transition-colors text-sm hidden sm:flex items-center gap-1.5 font-medium"
              >
                <BookOpen className="w-4 h-4" />
                Lessons Library
              </button>
            )}

            {rightSlot}

            {/* Profile dropdown — shows whenever user is authenticated (has logout handler)
                regardless of whether displayName has loaded yet */}
            {(userName !== undefined || onLogout !== undefined) && (
              <ProfileDropdown
                initials={avatarInitials || "•"}
                onNavigateToAccount={onNavigateToAccount}
                onLogout={onLogout}
              />
            )}
          </div>
        </div>
      </header>
    );
  }

  /* ── Session variant (minimal) ── */
  return (
    <header className="z-50 bg-white/90 backdrop-blur-md border-b border-[#e2e8f0] shrink-0">
      <div
        aria-label="AppHeader"
        className="flex items-center justify-between px-6 md:px-8 h-14"
      >
        <div className="flex items-center gap-4">
          {leftSlot}
          <BrandLogo />
        </div>
        <div className="flex items-center gap-3">
          <NarrationToggle />
          {onGoToDashboard && (
            <button
              onClick={onGoToDashboard}
              className="text-sm text-[#45556c] hover:text-[#0f172b] transition-colors font-medium"
            >
              Go to Dashboard
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
