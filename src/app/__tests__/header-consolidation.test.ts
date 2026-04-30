// @ts-nocheck
/**
 * Header Consolidation QA — Static verification
 * Validates that all pages use the correct AppHeader variant
 * and no duplicate/inline headers remain.
 */
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

const ROOT = resolve(__dirname, "../../..");

function readSrc(path: string): string {
  const full = resolve(ROOT, "src", path);
  if (!existsSync(full)) return "";
  return readFileSync(full, "utf-8");
}

describe("Header Consolidation QA", () => {
  // ── 1. AppHeader has exactly 3 variants ──
  test("AppHeader supports 3 variants: public, dashboard, session", () => {
    const src = readSrc("shared/ui/AppHeader.tsx");
    expect(src).toContain('variant: "public" | "dashboard" | "session"');
    expect(src).toContain('if (variant === "public")');
    expect(src).toContain('if (variant === "dashboard")');
    // session is the fallback (no if check, just return)
    expect(src).toContain("/* ── Session variant");
  });

  // ── 2. DashboardHeader.tsx is deleted ──
  test("DashboardHeader.tsx no longer exists", () => {
    expect(existsSync(resolve(ROOT, "src/features/dashboard/ui/DashboardHeader.tsx"))).toBe(false);
  });

  test("DashboardHeader is not exported from barrel", () => {
    const src = readSrc("features/dashboard/ui/index.ts");
    expect(src).not.toContain("DashboardHeader");
  });

  // ── 3. No inline headers in dashboard-family pages ──
  test("DashboardPage has no inline header", () => {
    const src = readSrc("features/dashboard/ui/DashboardPage.tsx");
    expect(src).not.toContain("DashboardHeader");
    expect(src).not.toContain('<header');
  });

  test("AccountPage has no AppHeader render", () => {
    const src = readSrc("pages/AccountPage.tsx");
    expect(src).not.toContain("<AppHeader");
    expect(src).not.toContain("onBack");
  });

  test("PracticeHistoryPage main view has no AppHeader (only report overlay)", () => {
    const src = readSrc("pages/PracticeHistoryPage.tsx");
    // Should NOT have an AppHeader in the main page body
    // but SHOULD have one inside the report overlay (variant="public")
    const lines = src.split("\n");
    const appHeaderLines = lines.filter(l => l.includes("<AppHeader"));
    expect(appHeaderLines.length).toBe(1); // Only the report overlay
    expect(src).toContain('variant="public"'); // Report overlay uses public variant
  });

  test("LibraryPage has no inline header", () => {
    const src = readSrc("pages/LibraryPage.tsx");
    expect(src).not.toContain("<header");
    expect(src).not.toContain("ArrowLeft");
    expect(src).not.toContain("BrandLogo");
    expect(src).not.toContain("onBack");
  });

  // ── 4. Legal pages use public variant ──
  test("TermsPage uses AppHeader variant='public'", () => {
    const src = readSrc("pages/legal/TermsPage.tsx");
    expect(src).toContain('<AppHeader');
    expect(src).toContain('variant="public"');
    expect(src).not.toContain("<header");
    expect(src).not.toContain("ArrowLeft");
  });

  test("PrivacyPage uses AppHeader variant='public'", () => {
    const src = readSrc("pages/legal/PrivacyPage.tsx");
    expect(src).toContain('<AppHeader');
    expect(src).toContain('variant="public"');
    expect(src).not.toContain("<header");
    expect(src).not.toContain("ArrowLeft");
  });

  // ── 5. Persistent dashboard layout in App.tsx ──
  test("App.tsx renders persistent dashboard header for family pages", () => {
    const src = readSrc("app/App.tsx");
    expect(src).toContain('variant="dashboard"');
    expect(src).toContain("onNavigateToDashboard");
    expect(src).toContain("onNavigateToAccount");
    expect(src).toContain("handleLogout");
    // Dashboard family grouping
    expect(src).toContain('"dashboard" || page === "account" || page === "practice-history" || page === "library"');
  });

  // ── 6. PracticeSessionPage has exit confirmation ──
  test("PracticeSessionPage uses session variant with exit confirm", () => {
    const src = readSrc("pages/PracticeSessionPage.tsx");
    expect(src).toContain('variant="session"');
    expect(src).toContain("onGoToDashboard");
    expect(src).toContain("showExitConfirm");
    expect(src).toContain("Leave session?");
    // Old header props should be gone
    expect(src).not.toContain("onNavigateToAccount");
  });

  // ── 7. No stale variant names ──
  test("No stale variant names exist (app, minimal)", () => {
    const files = [
      "shared/ui/AppHeader.tsx",
      "pages/AccountPage.tsx",
      "pages/PracticeSessionPage.tsx",
      "features/dashboard/ui/DashboardPage.tsx",
    ];
    for (const f of files) {
      const src = readSrc(f);
      expect(src).not.toContain('variant="app"');
      expect(src).not.toContain('variant="minimal"');
    }
  });
});
