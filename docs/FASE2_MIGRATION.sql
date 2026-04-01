-- ══════════════════════════════════════════════════════════════
-- inFluentia PRO — FASE 2 MIGRATION (v8.0)
-- 
-- Cambios: 
-- 1. profiles: arreglos para Conversational Path / Free sessions
-- 2. sessions: campos para el Skill Drill result
-- 3. sr_cards: origin='drill'
-- 4. Nuevas tablas de pagos (subscriptions, session_purchases)
-- ══════════════════════════════════════════════════════════════

-- ==========================================
-- 1. Modificar 'profiles'
-- ==========================================

-- Añadir nuevas columnas si no existen
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS conversational_unlocked text[] DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS free_sessions_used text[] DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_active boolean DEFAULT false;

-- Actualizar constraint the 'plan' de forma segura
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_plan_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_plan_check 
  CHECK (plan IN ('free', 'per-session', 'subscription'));

-- ==========================================
-- 2. Modificar 'sessions'
-- ==========================================

-- Añadir nuevas columnas si no existen
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS drill_result jsonb;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS session_type text;

-- ==========================================
-- 3. Modificar 'sr_cards'
-- ==========================================

-- Dado que 'origin' era un simple campo text (según FASE1_MIGRATION original default 'session'), 
-- si tuviera un check constraint habría que dropearlo. Asumiendo que era text libre, no se 
-- requiere alter constraint, pero por si acaso tenía un CHECK, intentamos dropearlo de forma segura.
-- ALTER TABLE sr_cards DROP CONSTRAINT IF EXISTS sr_cards_origin_check;

-- ==========================================
-- 4. Nuevas Tablas de Pagos (Suscripciones)
-- ==========================================

-- Tabla de suscripciones
CREATE TABLE IF NOT EXISTS subscriptions (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  status            text DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
  payment_provider  text NOT NULL CHECK (payment_provider IN ('mercadopago', 'stripe')),
  payment_id        text,
  current_period_start timestamptz,
  current_period_end   timestamptz,
  created_at        timestamptz DEFAULT now()
);

-- Tabla de pagos por sesión (Pay-per-session)
CREATE TABLE IF NOT EXISTS session_purchases (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  amount_usd      numeric(10,2) NOT NULL DEFAULT 4.99,
  scenario_type   text,
  payment_provider text NOT NULL CHECK (payment_provider IN ('mercadopago', 'stripe')),
  payment_id      text,
  status          text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
  created_at      timestamptz DEFAULT now()
);

-- ==========================================
-- 5. Row Level Security (RLS)
-- ==========================================

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_purchases ENABLE ROW LEVEL SECURITY;

-- Políticas para subscriptions: el usuario solo lee sus propias suscripciones
CREATE POLICY "Users can view their own subscriptions"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Políticas para session_purchases: el usuario solo lee sus propias compras
CREATE POLICY "Users can view their own session purchases"
  ON session_purchases FOR SELECT
  USING (auth.uid() = user_id);

-- Los INSERT / UPDATE usualmente ocurrirán a través de webhooks o Edge Functions con Service Role Key.
-- De todos modos, podemos permitir inserts si el cliente dispara la creación del intento de pago:
CREATE POLICY "Users can insert their own session purchases"
  ON session_purchases FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscriptions"
  ON subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ==========================================
-- FIN DE LA MIGRACIÓN
-- ==========================================
