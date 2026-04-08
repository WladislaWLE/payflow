-- ================================================
-- Payflow — SQL миграции для Supabase
-- Запустите эти команды в Supabase SQL Editor
-- https://supabase.com/dashboard → SQL Editor
-- ================================================


-- ════════════════════════════════════════════════
-- ФИХ: "Database error saving new user"
-- Запустите этот блок ПЕРВЫМ если регистрация не работает
-- ════════════════════════════════════════════════

-- 1. Убедимся что таблица profiles существует со всеми нужными колонками
CREATE TABLE IF NOT EXISTS public.profiles (
  id                  uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name                text,
  email               text,
  is_admin            boolean DEFAULT false,
  created_at          timestamptz DEFAULT now(),
  referral_code       text UNIQUE,
  referral_bonus_rub  integer DEFAULT 0,
  referred_by         uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  referred_by_code    text
);

-- Добавляем колонки если их нет (идемпотентно)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS name               text,
  ADD COLUMN IF NOT EXISTS email              text,
  ADD COLUMN IF NOT EXISTS is_admin           boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS referral_code      text UNIQUE,
  ADD COLUMN IF NOT EXISTS referral_bonus_rub integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS referred_by_code   text;

-- 2. RLS: включаем и задаём политики
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_admin_all" ON public.profiles;
CREATE POLICY "profiles_admin_all" ON public.profiles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- 3. Функция создания профиля при регистрации
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, created_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- 4. Триггер: создаём профиль при регистрации через auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Заполняем реферальный код сразу при создании профиля
CREATE OR REPLACE FUNCTION public.generate_referral_code_for_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET referral_code = upper(substring(md5(NEW.id::text || clock_timestamp()::text) FROM 1 FOR 6))
  WHERE id = NEW.id AND referral_code IS NULL;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_generate_referral_code ON public.profiles;
CREATE TRIGGER trg_generate_referral_code
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.generate_referral_code_for_user();

-- 6. Заполнить реф-коды для уже существующих пользователей
UPDATE public.profiles
SET referral_code = upper(substring(md5(id::text || clock_timestamp()::text) FROM 1 FOR 6))
WHERE referral_code IS NULL;

-- ════════════════════════════════════════════════
-- КОНЕЦ БЛОКА ФИКСА
-- ════════════════════════════════════════════════


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

DROP POLICY IF EXISTS "service_requests_insert" ON service_requests;
CREATE POLICY "service_requests_insert" ON service_requests
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "service_requests_select" ON service_requests;
CREATE POLICY "service_requests_select" ON service_requests
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "service_requests_admin_update" ON service_requests;
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

DROP POLICY IF EXISTS "reviews_insert_own" ON reviews;
CREATE POLICY "reviews_insert_own" ON reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "reviews_select_approved" ON reviews;
CREATE POLICY "reviews_select_approved" ON reviews
  FOR SELECT USING (is_approved = true);

DROP POLICY IF EXISTS "reviews_admin_all" ON reviews;
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

DROP POLICY IF EXISTS "referral_events_select_own" ON referral_events;
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


-- ── Фаза 2.3: Баланс и отслеживание рефералов ────────────────

-- Добавляем колонку referred_by_code: хранит текстовый реф-код реферера
-- (заполняется фронтендом при регистрации из localStorage)
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS referred_by_code TEXT;

-- Для быстрого поиска по коду
CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON profiles(referral_code);

-- Политика: пользователь может видеть свой профиль полностью
-- (referral_bonus_rub уже есть, используем его как balance)

-- ── RPC: начислить реферальный бонус при выполнении заказа ───
-- Вызывается из AdminPanel когда статус заявки меняется на "done"
-- Возвращает детали для Telegram-уведомления
CREATE OR REPLACE FUNCTION process_referral(p_order_id TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id         UUID;
  v_ref_code        TEXT;
  v_referrer_id     UUID;
  v_done_count      INT;
  v_already         INT;
  v_bonus           INT := 200;
  v_referrer_name   TEXT;
  v_referrer_email  TEXT;
  v_referee_name    TEXT;
  v_referee_email   TEXT;
  v_service         TEXT;
  v_tier            TEXT;
  v_price_rub       INT;
BEGIN
  -- 1. Находим пользователя и детали заказа
  SELECT o.user_id, o.service, o.tier, o.price_rub::INT
    INTO v_user_id, v_service, v_tier, v_price_rub
    FROM orders o WHERE o.id = p_order_id;
  IF NOT FOUND THEN
    RETURN '{"ok":false,"reason":"order_not_found"}'::JSONB;
  END IF;

  -- 2. Читаем referred_by_code реферала + его данные
  SELECT p.referred_by_code, p.name, p.email
    INTO v_ref_code, v_referee_name, v_referee_email
    FROM profiles p WHERE p.id = v_user_id;
  IF v_ref_code IS NULL OR v_ref_code = '' THEN
    RETURN '{"ok":false,"reason":"not_referred"}'::JSONB;
  END IF;

  -- 3. Это первый выполненный заказ реферала?
  SELECT COUNT(*) INTO v_done_count
    FROM orders
   WHERE user_id = v_user_id
     AND status = 'done'
     AND id != p_order_id;
  IF v_done_count > 0 THEN
    RETURN '{"ok":false,"reason":"not_first_order"}'::JSONB;
  END IF;

  -- 4. Бонус ещё не был начислен по этому рефералу?
  SELECT COUNT(*) INTO v_already
    FROM referral_events WHERE referred_id = v_user_id;
  IF v_already > 0 THEN
    RETURN '{"ok":false,"reason":"already_credited"}'::JSONB;
  END IF;

  -- 5. Находим реферера по коду
  SELECT id, name, email
    INTO v_referrer_id, v_referrer_name, v_referrer_email
    FROM profiles WHERE referral_code = v_ref_code;
  IF NOT FOUND THEN
    RETURN '{"ok":false,"reason":"referrer_not_found"}'::JSONB;
  END IF;

  -- 6. Запрещаем самореферирование
  IF v_referrer_id = v_user_id THEN
    RETURN '{"ok":false,"reason":"self_referral"}'::JSONB;
  END IF;

  -- 7. Начисляем бонус рефереру
  UPDATE profiles
     SET referral_bonus_rub = referral_bonus_rub + v_bonus
   WHERE id = v_referrer_id;

  -- 8. Фиксируем событие
  INSERT INTO referral_events
    (referrer_id, referred_id, order_id, bonus_amount, status)
  VALUES
    (v_referrer_id, v_user_id, p_order_id, v_bonus, 'credited');

  -- 9. Возвращаем все данные для TG-уведомления
  RETURN jsonb_build_object(
    'ok',             true,
    'bonus',          v_bonus,
    'referrer_id',    v_referrer_id,
    'referrer_name',  v_referrer_name,
    'referrer_email', v_referrer_email,
    'referee_name',   v_referee_name,
    'referee_email',  v_referee_email,
    'service',        v_service,
    'tier',           v_tier,
    'price_rub',      v_price_rub,
    'order_id',       p_order_id
  );
END;
$$;


-- ── RPC: списать баланс при создании заказа ──────────────────
-- Вызывается из фронтенда при оформлении заказа с использованием бонуса
CREATE OR REPLACE FUNCTION spend_balance(p_user_id UUID, p_amount INT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current INT;
BEGIN
  SELECT referral_bonus_rub INTO v_current
    FROM profiles WHERE id = p_user_id;
  IF NOT FOUND THEN
    RETURN '{"ok":false,"reason":"user_not_found"}'::JSONB;
  END IF;
  IF v_current < p_amount THEN
    RETURN '{"ok":false,"reason":"insufficient_balance"}'::JSONB;
  END IF;

  UPDATE profiles
     SET referral_bonus_rub = referral_bonus_rub - p_amount
   WHERE id = p_user_id;

  RETURN jsonb_build_object('ok', true, 'spent', p_amount, 'remaining', v_current - p_amount);
END;
$$;
