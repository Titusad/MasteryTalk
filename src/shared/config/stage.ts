/**
 * Product stage (PRODUCT_SPEC §6.5.5).
 *
 * 1 = YouTube series + workbooks + library. The app is not launched: accounts
 *     created from the library (`origin = "waitlist-es"`) only see `#biblioteca`.
 * 2 = App launched. Set this to 2 to remove the Stage 1 redirects.
 */
export const STAGE: 1 | 2 = 1;

/** Value of `profiles.origin` for accounts created from the Stage 1 library. */
export const WAITLIST_ORIGIN = "waitlist-es" as const;

/** sessionStorage key set before the Google OAuth redirect from the library. */
export const LIBRARY_ORIGIN_FLAG_KEY = "masterytalk_origin";

/** Product routes hidden from Stage 1 library accounts. */
export const STAGE_ONE_BLOCKED_HASHES = ["#dashboard", "#practice-session", "#practice-history"] as const;
