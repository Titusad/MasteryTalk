-- ══════════════════════════════════════════════════════════════
--  MasteryTalk PRO — Phase 5: WhatsApp SR & Subscription Migration
--
--  Updates profiles for subscription plan, adds whatsapp tracking
--  Creates wa_pending_reviews for matching async audio replies.
-- ══════════════════════════════════════════════════════════════

-- 1. Updates to Profiles Table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS whatsapp_number text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS whatsapp_verified boolean DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS monthly_sessions_used int DEFAULT 0;

-- Update the plan checks to support 'pro' subscription
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_plan_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_plan_check
  CHECK (plan IN ('free', 'per-session', 'pro'));

-- 2. New Table: wa_pending_reviews
CREATE TABLE IF NOT EXISTS public.wa_pending_reviews (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  sr_card_id       uuid REFERENCES public.sr_cards(id) ON DELETE CASCADE NOT NULL,
  message_sid      text, -- Twilio outgoing message SID
  status           text DEFAULT 'pending' 
                     CHECK (status IN ('pending', 'completed', 'expired')),
  sent_at          timestamptz DEFAULT now(),
  expires_at       timestamptz DEFAULT (now() + interval '24 hours')
);

COMMENT ON TABLE public.wa_pending_reviews IS 'Tracks outgoing WhatsApp SR challenges waiting for user audio reply.';

-- RLS for wa_pending_reviews
ALTER TABLE public.wa_pending_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own pending reviews"
  ON public.wa_pending_reviews FOR SELECT
  USING (auth.uid() = user_id);

-- Only Edge Functions should insert or update these usually, but for app fallback we allow it:
CREATE POLICY "Users can insert own pending reviews"
  ON public.wa_pending_reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pending reviews"
  ON public.wa_pending_reviews FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 3. pg_cron Setup for Daily SR
-- Note: 'pg_cron' and 'pg_net' extensions must be enabled in the Supabase Dashboard.
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- (The actual cron job to call the Edge Function will be scheduled via the Supabase Dashboard or API to insert your Edge Function URL securely).
-- Example syntax:
-- SELECT cron.schedule(
--   'invoke-daily-sr',
--   '0 9 * * *', -- Every day at 9 AM
--   $$
--   SELECT net.http_post(
--       url:='https://<project-ref>.supabase.co/functions/v1/cron-daily-sr',
--       headers:='{"Authorization": "Bearer <anon_key>"}'::jsonb
--   )
--   $$
-- );
