-- ═══════════════════════════════════════════════════════════
--  Stage 1 library accounts (PRODUCT_SPEC §6.5, §4.1)
--
--  origin           — 'waitlist-es' for accounts created from the YouTube
--                     series library. Written ONCE by ensure-profile.
--  tool_interest_at — when the person pressed "Avísame cuando pueda
--                     practicar esto con inteligencia artificial".
--
--  Both are server-managed (service role); the app UI never sets them.
-- ═══════════════════════════════════════════════════════════

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS origin text,
  ADD COLUMN IF NOT EXISTS tool_interest_at timestamptz;

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_origin_check;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_origin_check CHECK (origin IS NULL OR origin IN ('waitlist-es'));
