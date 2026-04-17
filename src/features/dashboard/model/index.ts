/**
 * Dashboard Model — Public API (Shared Layer)
 * Re-exports everything needed by UI components.
 */
export * from "./dashboard.constants";
export * from "./dashboard.computations";
export { useDashboardData } from "./useDashboardData";
export type { UseDashboardDataProps, DashboardData } from "./useDashboardData";
