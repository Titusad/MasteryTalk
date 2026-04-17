/**
 * AppHeader — Canonical header component for all internal app pages.
 *
 * Variants:
 *   app     → Dashboard, History, Account — bg-white/90 backdrop-blur-md, max-w-[1440px]
 *   session → PracticeSession — same as app, optional SessionProgressBar row below
 *   minimal → Inline report views — bg-white, max-w-[860px], no user controls
 *
 * Sprint 1 FSD: canonical component. Pages with inline headers are migrated separately.
 * TODO (after "dividir shared/index.tsx"): update BrandLogo + SessionProgressBar imports to ./
 */

import { ArrowLeft, LogOut } from "lucide-react";
import type React from "react";
import { BrandLogo } from "./BrandLogo";

export interface AppHeaderProps {
  variant?: "app" | "session" | "minimal";
  showBackButton?: boolean;
  backLabel?: string;
  onBack?: () => void;
  /** Rendered below the top bar when variant="session" (e.g. <SessionProgressBar />) */
  progressBarSlot?: React.ReactNode;
  /** User display name — initials derived automatically */
  userName?: string;
  onLogout?: () => void;
  onNavigateToAccount?: () => void;
  /** Extra content rendered left of the avatar/logout cluster (e.g. CreditBadge) */
  rightSlot?: React.ReactNode;
}

export function AppHeader({
  variant = "app",
  showBackButton = false,
  backLabel = "Back",
  onBack,
  progressBarSlot,
  userName,
  onLogout,
  onNavigateToAccount,
  rightSlot,
}: AppHeaderProps) {
  const avatarInitials = userName
    ? userName.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  const isMinimal = variant === "minimal";
  const maxW = isMinimal ? "max-w-[860px]" : "max-w-[1440px]";
  const bg = isMinimal ? "bg-white" : "bg-white/90 backdrop-blur-md";

  return (
    <header className={`sticky top-0 z-50 ${bg} border-b border-[#e2e8f0] shrink-0`}>
      {/* Top bar — always h-14 */}
      <div className={`${maxW} mx-auto flex items-center justify-between px-6 md:px-8 h-14`}>

        {/* Left: logo + optional back button */}
        <div className="flex items-center gap-4">
          <BrandLogo />
          {showBackButton && onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 text-sm text-[#45556c] hover:text-[#0f172b] transition-colors"
              style={{ fontWeight: 500 }}
            >
              <ArrowLeft className="w-4 h-4" />
              {backLabel}
            </button>
          )}
        </div>

        {/* Right: rightSlot + user controls (hidden in minimal) */}
        {!isMinimal && (
          <div className="flex items-center gap-3">
            {rightSlot}
            {onLogout && (
              <button
                onClick={onLogout}
                className="text-[#45556c] hover:text-[#0f172b] transition-colors p-2 rounded-full flex items-center justify-center"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
            {userName !== undefined && (
              <div
                className={`w-8 h-8 rounded-full bg-[#0f172b] flex items-center justify-center ${
                  onNavigateToAccount ? "cursor-pointer" : ""
                }`}
                title="My account"
                onClick={() => onNavigateToAccount?.()}
              >
                <span className="text-white text-sm" style={{ fontWeight: 500 }}>
                  {avatarInitials}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Progress bar row — session variant only */}
      {variant === "session" && progressBarSlot && (
        <div className={`${maxW} mx-auto px-6 md:px-8`}>
          {progressBarSlot}
        </div>
      )}
    </header>
  );
}
