-- ═══════════════════════════════════════════════════════════════════
--  Payflow — SQL миграция для Phase 2 (security improvements)
--  Запускать в Supabase Dashboard → SQL Editor
-- ═══════════════════════════════════════════════════════════════════

-- 1. Таблица settings (если ещё не создана)
-- ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS settings (
  key        text PRIMARY KEY,
  value      text,
  updated_at timestamptz DEFAULT now()
);

-- RLS: все читают, только admin пишет
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "settings_read_all" ON settings
  FOR SELECT USING (true);

CREATE POLICY "settings_admin_write" ON settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- 2. Реквизиты карт — перенос из исходного кода в БД
-- ────────────────────────────────────────────────────────────────────
-- ⚠️  Замени значения ниже на РЕАЛЬНЫЕ реквизиты перед выполнением!
-- После выполнения удали карточные данные из src/App.jsx (DEFAULT_REQUISITES).

INSERT INTO settings (key, value) VALUES (
  'requisites',
  '[
    {"label":"ВТБ","sbp":"+7 (XXX) XXX-XX-XX","card":"XXXX XXXX XXXX XXXX","holder":"Имя Фамилия"},
    {"label":"МТС Деньги","sbp":"+7 (XXX) XXX-XX-XX","card":"XXXX XXXX XXXX XXXX","holder":"Имя Фамилия"}
  ]'
)
ON CONFLICT (key) DO UPDATE SET
  value      = EXCLUDED.value,
  updated_at = now();

-- ═══════════════════════════════════════════════════════════════════
--  VERCEL ENVIRONMENT VARIABLES
--  Добавить в Vercel Dashboard → Settings → Environment Variables
-- ═══════════════════════════════════════════════════════════════════
--
--  TG_BOT_TOKEN              Токен Telegram-бота (уже должен быть задан)
--  TG_ADMIN_CHAT_ID          ID чата для уведомлений (уже должен быть задан)
--
--  SUPABASE_URL              Тот же URL что и VITE_SUPABASE_URL
--  SUPABASE_SERVICE_ROLE_KEY В Supabase: Settings → API → service_role key
--                            ⚠️  НЕ путать с anon key!
--
--  ENCRYPTION_KEY            64 hex-символа = 32 случайных байта
--                            Сгенерировать в терминале:
--                            node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
--
--  ⚠️  ВАЖНО: ENCRYPTION_KEY должен быть одинаковым во всех deployments.
--             Смена ключа делает ранее зашифрованные данные нечитаемыми.
--             Храни ключ в безопасном месте (менеджер паролей).

-- ═══════════════════════════════════════════════════════════════════
--  КАК РАБОТАЕТ ШИФРОВАНИЕ
-- ═══════════════════════════════════════════════════════════════════
--
--  Новые заявки:
--    1. Браузер отправляет POST /api/create-order с login_data в открытом виде
--    2. Serverless функция шифрует login_data алгоритмом AES-256-GCM
--    3. В БД хранится строка вида: ENC:<iv>:<ciphertext>:<tag>
--
--  Просмотр в AdminPanel:
--    - Если login_data начинается с "ENC:" → показывает кнопку "🔓 Расшифровать"
--    - При клике: POST /api/decrypt-login → возвращает plaintext
--    - Старые заявки (без "ENC:") показываются как есть (обратная совместимость)
