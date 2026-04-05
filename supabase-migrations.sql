-- ================================================
-- Payflow — SQL миграции для Supabase
-- Запустите эти команды в Supabase SQL Editor
-- https://supabase.com/dashboard → SQL Editor
-- ================================================


-- ── Фаза 1.4: Запросы новых сервисов ─────────────────────────
CREATE TABLE IF NOT EXISTS service_requests (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email   text,
  service_name text NOT NULL,
  service_url  text,
  comment      text,
  votes        integer DEFAULT 1,
  status       text DEFAULT 'pending'
                    CHECK (status IN ('pending','reviewing','added','declined')),
  created_at   timestamptz DEFAULT now()
);

-- RLS: авторизованные могут добавлять, все могут читать
ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_requests_insert" ON service_requests
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "service_requests_select" ON service_requests
  FOR SELECT USING (true);

CREATE POLICY "service_requests_admin_update" ON service_requests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true
    )
  );


-- ── Фаза 2.2: Отзывы и рейтинги ──────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  user_name    text,
  order_id     text REFERENCES orders(id) ON DELETE SET NULL,
  service_id   integer NOT NULL,
  service_name text NOT NULL,
  rating       smallint NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment      text,
  is_approved  boolean DEFAULT false,
  created_at   timestamptz DEFAULT now(),
  UNIQUE(user_id, service_id)
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reviews_insert_own" ON reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "reviews_select_approved" ON reviews
  FOR SELECT USING (is_approved = true);

CREATE POLICY "reviews_admin_all" ON reviews
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true
    )
  );


-- ── Фаза 2.1: Реферальная программа ──────────────────────────
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS referral_code      text UNIQUE,
  ADD COLUMN IF NOT EXISTS referral_bonus_rub integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS referred_by        uuid REFERENCES profiles(id);

CREATE TABLE IF NOT EXISTS referral_events (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id   uuid REFERENCES profiles(id) NOT NULL,
  referred_id   uuid REFERENCES profiles(id) NOT NULL,
  order_id      text REFERENCES orders(id) ON DELETE SET NULL,
  bonus_amount  integer NOT NULL,
  status        text DEFAULT 'pending'
                     CHECK (status IN ('pending','credited','used')),
  created_at    timestamptz DEFAULT now()
);

ALTER TABLE referral_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "referral_events_select_own" ON referral_events
  FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

-- Функция генерации реферального кода при регистрации
CREATE OR REPLACE FUNCTION generate_referral_code_for_user()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  UPDATE profiles
  SET referral_code = upper(substring(md5(NEW.id::text || clock_timestamp()::text) FROM 1 FOR 6))
  WHERE id = NEW.id AND referral_code IS NULL;
  RETURN NEW;
END;
$$;

-- Триггер: генерировать код при создании профиля
DROP TRIGGER IF EXISTS trg_generate_referral_code ON profiles;
CREATE TRIGGER trg_generate_referral_code
  AFTER INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION generate_referral_code_for_user();
