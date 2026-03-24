import { useState, useEffect, useRef, useCallback } from "react";

// ─── РЕКВИЗИТЫ ────────────────────────────────────────────────
const REQUISITES_POOL = [
  { label: "Тинькофф",  sbp: "+7 (900) 000-00-00", card: "2200 0000 0000 0001", holder: "Иван И." },
  { label: "Сбербанк",  sbp: "+7 (900) 000-00-01", card: "2202 0000 0000 0002", holder: "Иван И." },
  { label: "ВТБ",       sbp: "+7 (900) 000-00-02", card: "2200 0000 0000 0003", holder: "Иван И." },
];
function getRandomRequisites() {
  return REQUISITES_POOL[Math.floor(Math.random() * REQUISITES_POOL.length)];
}
const ADMIN_PASSWORD = "payflow2026";
const MARGIN = 0.10; // 10% комиссия
// ──────────────────────────────────────────────────────────────

const SERVICES = [
  { id: 1,  name: "ChatGPT Plus",         category: "AI",            icon: "🤖", tiers: [{ name: "Plus", price: 20 }, { name: "Team", price: 25 }, { name: "Pro", price: 200 }], login: true,  gift: false, family: true,  newAcc: true  },
  { id: 2,  name: "Claude Pro",           category: "AI",            icon: "🧠", tiers: [{ name: "Pro", price: 20 }, { name: "Team", price: 30 }], login: true, gift: false, family: true, newAcc: true },
  { id: 3,  name: "Perplexity Pro",       category: "AI",            icon: "🔍", tiers: [{ name: "Pro", price: 20 }], login: true, gift: false, family: false, newAcc: true },
  { id: 4,  name: "Grok Premium",         category: "AI",            icon: "🐦", tiers: [{ name: "Premium", price: 8 }, { name: "Premium+", price: 16 }], login: true, gift: false, family: false, newAcc: false },
  { id: 5,  name: "Gemini Advanced",      category: "AI",            icon: "💎", tiers: [{ name: "Google One AI", price: 19.99 }], login: true, gift: true, family: true, newAcc: false },
  { id: 6,  name: "Midjourney",           category: "AI",            icon: "🎨", tiers: [{ name: "Basic", price: 10 }, { name: "Standard", price: 30 }, { name: "Pro", price: 60 }, { name: "Mega", price: 120 }], login: true, gift: false, family: false, newAcc: true },
  { id: 7,  name: "Leonardo AI",          category: "AI",            icon: "🖼️", tiers: [{ name: "Apprentice", price: 10 }, { name: "Artisan", price: 24 }, { name: "Maestro", price: 48 }], login: true, gift: false, family: false, newAcc: true },
  { id: 8,  name: "Runway ML",            category: "AI",            icon: "🎬", tiers: [{ name: "Standard", price: 15 }, { name: "Pro", price: 35 }, { name: "Unlimited", price: 95 }], login: true, gift: false, family: false, newAcc: true },
  { id: 9,  name: "Kling AI",             category: "AI",            icon: "🎥", tiers: [{ name: "Starter", price: 8 }, { name: "Pro", price: 35 }, { name: "Premier", price: 88 }], login: true, gift: false, family: false, newAcc: true },
  { id: 10, name: "ElevenLabs",           category: "AI",            icon: "🎙️", tiers: [{ name: "Starter", price: 5 }, { name: "Creator", price: 22 }, { name: "Pro", price: 99 }], login: true, gift: false, family: false, newAcc: true },
  { id: 11, name: "Murf AI",              category: "AI",            icon: "🔊", tiers: [{ name: "Creator", price: 29 }, { name: "Business", price: 99 }], login: true, gift: false, family: false, newAcc: true },
  { id: 12, name: "Adobe Firefly",        category: "Дизайн",        icon: "🔥", tiers: [{ name: "Firefly", price: 9.99 }, { name: "All Apps", price: 54.99 }], login: true, gift: true, family: false, newAcc: false },
  { id: 13, name: "Cursor Pro",           category: "Разработка",    icon: "💻", tiers: [{ name: "Pro", price: 20 }, { name: "Ultra", price: 200 }], login: true, gift: false, family: false, newAcc: true },
  { id: 14, name: "GitHub Copilot",       category: "Разработка",    icon: "⚡", tiers: [{ name: "Pro", price: 10 }, { name: "Pro+", price: 39 }], login: true, gift: false, family: false, newAcc: false },
  { id: 15, name: "Windsurf",             category: "Разработка",    icon: "🏄", tiers: [{ name: "Pro", price: 15 }, { name: "Teams", price: 30 }], login: true, gift: false, family: false, newAcc: true },
  { id: 16, name: "Replit Core",          category: "Разработка",    icon: "🔧", tiers: [{ name: "Core", price: 20 }], login: true, gift: false, family: false, newAcc: true },
  { id: 17, name: "Vercel Pro",           category: "Разработка",    icon: "▲",  tiers: [{ name: "Pro", price: 20 }], login: true, gift: false, family: false, newAcc: false },
  { id: 18, name: "Linear",              category: "Разработка",    icon: "📐", tiers: [{ name: "Plus", price: 8 }, { name: "Business", price: 14 }], login: true, gift: false, family: false, newAcc: false },
  { id: 19, name: "Figma",               category: "Дизайн",        icon: "✏️", tiers: [{ name: "Professional", price: 15 }, { name: "Organization", price: 45 }], login: true, gift: false, family: false, newAcc: false },
  { id: 20, name: "Canva Pro",            category: "Дизайн",        icon: "🖌️", tiers: [{ name: "Pro", price: 14.99 }, { name: "Teams", price: 29.99 }], login: true, gift: true, family: true, newAcc: false },
  { id: 21, name: "Adobe Creative Cloud", category: "Дизайн",       icon: "🅰️", tiers: [{ name: "Photography", price: 19.99 }, { name: "Single App", price: 34.99 }, { name: "All Apps", price: 54.99 }], login: true, gift: true, family: false, newAcc: false },
  { id: 22, name: "Notion",              category: "Продуктивность", icon: "📝", tiers: [{ name: "Plus", price: 10 }, { name: "Business", price: 15 }], login: true, gift: false, family: false, newAcc: false },
  { id: 23, name: "Grammarly",           category: "Продуктивность", icon: "📖", tiers: [{ name: "Premium", price: 30 }, { name: "Business", price: 25 }], login: true, gift: true, family: false, newAcc: false },
  { id: 24, name: "Dropbox Plus",        category: "Продуктивность", icon: "📦", tiers: [{ name: "Plus", price: 11.99 }, { name: "Professional", price: 19.99 }], login: true, gift: false, family: false, newAcc: false },
  { id: 25, name: "Loom",               category: "Продуктивность", icon: "📹", tiers: [{ name: "Starter", price: 12.5 }, { name: "Business+", price: 16 }], login: true, gift: false, family: false, newAcc: false },
  { id: 26, name: "Netflix",            category: "Стриминг",       icon: "🎬", tiers: [{ name: "Standard", price: 15.49 }, { name: "Premium", price: 22.99 }], login: true, gift: true, family: true, newAcc: false },
  { id: 27, name: "YouTube Premium",    category: "Стриминг",       icon: "▶️", tiers: [{ name: "Individual", price: 13.99 }, { name: "Family", price: 22.99 }], login: true, gift: true, family: true, newAcc: false },
  { id: 28, name: "Disney+",            category: "Стриминг",       icon: "🏰", tiers: [{ name: "Basic", price: 7.99 }, { name: "Premium", price: 13.99 }], login: true, gift: true, family: false, newAcc: false },
  { id: 29, name: "Apple TV+",          category: "Стриминг",       icon: "🍎", tiers: [{ name: "Individual", price: 9.99 }], login: true, gift: true, family: true, newAcc: false },
  { id: 30, name: "HBO Max",            category: "Стриминг",       icon: "📺", tiers: [{ name: "With Ads", price: 9.99 }, { name: "Ad-Free", price: 15.99 }, { name: "Ultimate", price: 19.99 }], login: true, gift: true, family: false, newAcc: false },
  { id: 31, name: "Crunchyroll",        category: "Стриминг",       icon: "⛩️", tiers: [{ name: "Fan", price: 7.99 }, { name: "Mega Fan", price: 9.99 }, { name: "Ultimate Fan", price: 14.99 }], login: true, gift: true, family: false, newAcc: false },
  { id: 32, name: "Spotify Premium",   category: "Музыка",          icon: "🎵", tiers: [{ name: "Individual", price: 11.99 }, { name: "Duo", price: 16.99 }, { name: "Family", price: 19.99 }], login: true, gift: true, family: true, newAcc: false },
  { id: 33, name: "Apple Music",       category: "Музыка",          icon: "🎶", tiers: [{ name: "Individual", price: 10.99 }, { name: "Family", price: 16.99 }], login: true, gift: true, family: true, newAcc: false },
  { id: 34, name: "Tidal",             category: "Музыка",          icon: "🌊", tiers: [{ name: "Individual", price: 10.99 }, { name: "Family", price: 17.99 }], login: true, gift: false, family: true, newAcc: false },
  { id: 35, name: "Duolingo Super",    category: "Обучение",         icon: "🦉", tiers: [{ name: "Super", price: 12.99 }, { name: "Family", price: 119.99 }], login: true, gift: true, family: true, newAcc: false },
  { id: 36, name: "Coursera Plus",     category: "Обучение",         icon: "🎓", tiers: [{ name: "Monthly", price: 59 }, { name: "Annual", price: 399 }], login: true, gift: false, family: false, newAcc: false },
  { id: 37, name: "MasterClass",       category: "Обучение",         icon: "🏆", tiers: [{ name: "Individual", price: 10 }, { name: "Duo", price: 15 }, { name: "Family", price: 20 }], login: true, gift: true, family: true, newAcc: false },
  { id: 38, name: "Discord Nitro",     category: "Инструменты",      icon: "💬", tiers: [{ name: "Basic", price: 2.99 }, { name: "Nitro", price: 9.99 }], login: true, gift: true, family: false, newAcc: false },
  { id: 39, name: "Telegram Premium",  category: "Инструменты",      icon: "✈️", tiers: [{ name: "Premium", price: 4.99 }], login: true, gift: true, family: false, newAcc: false },
  { id: 40, name: "NordVPN",           category: "Инструменты",      icon: "🔒", tiers: [{ name: "Basic 1м", price: 12.99 }, { name: "Basic 1г", price: 53.88 }], login: true, gift: false, family: false, newAcc: false },
  { id: 41, name: "1Password",         category: "Инструменты",      icon: "🔑", tiers: [{ name: "Individual", price: 2.99 }, { name: "Families", price: 4.99 }], login: true, gift: false, family: true, newAcc: false },
  { id: 42, name: "Setapp",            category: "Инструменты",      icon: "📱", tiers: [{ name: "Individual", price: 9.99 }, { name: "Family", price: 14.99 }], login: true, gift: false, family: true, newAcc: false },
  { id: 43, name: "Zoom Pro",          category: "Инструменты",      icon: "📞", tiers: [{ name: "Pro", price: 15.99 }, { name: "Business", price: 19.99 }], login: true, gift: false, family: false, newAcc: false },
  { id: 44, name: "Xbox Game Pass",    category: "Игры",             icon: "🎮", tiers: [{ name: "Ultimate", price: 19.99 }], login: true, gift: true, family: false, newAcc: false },
  { id: 45, name: "PlayStation Plus",  category: "Игры",             icon: "🕹️", tiers: [{ name: "Essential", price: 9.99 }, { name: "Extra", price: 14.99 }, { name: "Premium", price: 17.99 }], login: true, gift: true, family: false, newAcc: false },
  { id: 46, name: "Steam (пополнение)",category: "Игры",             icon: "🚂", tiers: [{ name: "$20", price: 20 }, { name: "$50", price: 50 }, { name: "$100", price: 100 }], login: false, gift: true, family: false, newAcc: false },
  { id: 47, name: "Notion AI",         category: "Продуктивность",   icon: "🤖", tiers: [{ name: "AI Add-on", price: 10 }], login: true, gift: false, family: false, newAcc: false },
  { id: 48, name: "Obsidian Sync",     category: "Продуктивность",   icon: "🔮", tiers: [{ name: "Sync", price: 10 }, { name: "Sync+Publish", price: 20 }], login: true, gift: false, family: false, newAcc: false },
  { id: 49, name: "Skillshare",        category: "Обучение",         icon: "🎒", tiers: [{ name: "Individual", price: 32 }], login: true, gift: true, family: false, newAcc: false },
  { id: 50, name: "Otter.ai",          category: "Продуктивность",   icon: "🦦", tiers: [{ name: "Pro", price: 16.99 }, { name: "Business", price: 30 }], login: true, gift: false, family: false, newAcc: true },
];

const CATEGORIES = ["Все", "AI", "Разработка", "Дизайн", "Стриминг", "Музыка", "Продуктивность", "Инструменты", "Обучение", "Игры"];
const STATUS_LABELS = { new: "Новая", paid: "Оплачена", processing: "В обработке", done: "Выполнена", cancelled: "Отменена" };
const STATUS_COLORS = { new: "#fbbf24", paid: "#60a5fa", processing: "#a78bfa", done: "#34d399", cancelled: "#f87171" };

function calcPrice(usd, rate) {
  return Math.round(usd * rate * (1 + MARGIN));
}

function getMoscowDateStr() {
  return new Date().toLocaleDateString("ru-RU", { timeZone: "Europe/Moscow", day: "2-digit", month: "2-digit", year: "numeric" });
}

// ─── THEME CONTEXT ────────────────────────────────────────────
function useTheme() {
  const [dark, setDark] = useState(() => window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? true);
  const toggle = () => setDark(d => !d);
  const t = {
    dark,
    bg:        dark ? "#080810" : "#f5f5f7",
    surface:   dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.04)",
    surface2:  dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)",
    border:    dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)",
    borderHov: dark ? "rgba(251,191,36,0.4)"  : "rgba(217,119,6,0.5)",
    text:      dark ? "#ffffff"               : "#0f0f14",
    textSub:   dark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.5)",
    textMuted: dark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.3)",
    nav:       dark ? "rgba(8,8,16,0.96)"     : "rgba(245,245,247,0.96)",
    input:     dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
    gold:      "#fbbf24",
    goldDim:   dark ? "rgba(251,191,36,0.12)" : "rgba(217,119,6,0.12)",
    goldBorder:dark ? "rgba(251,191,36,0.3)"  : "rgba(217,119,6,0.4)",
  };
  return { t, toggle };
}

// ─── BADGE ────────────────────────────────────────────────────
function Badge({ active, color, children }) {
  const palettes = {
    blue:   ["rgba(96,165,250,0.15)",  "rgba(96,165,250,0.4)",  "#93c5fd"],
    green:  ["rgba(52,211,153,0.15)",  "rgba(52,211,153,0.4)",  "#6ee7b7"],
    purple: ["rgba(167,139,250,0.15)", "rgba(167,139,250,0.4)", "#c4b5fd"],
    yellow: ["rgba(251,191,36,0.15)",  "rgba(251,191,36,0.4)",  "#fde68a"],
  };
  const c = palettes[color];
  return (
    <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 100, fontWeight: 600, background: active ? c[0] : "rgba(128,128,128,0.1)", border: `1px solid ${active ? c[1] : "rgba(128,128,128,0.2)"}`, color: active ? c[2] : "rgba(128,128,128,0.4)" }}>
      {children}
    </span>
  );
}

// ─── SERVICE CARD ─────────────────────────────────────────────
function ServiceCard({ service, rate, onSelect, t }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onClick={() => onSelect(service)}
      style={{ background: hovered ? t.surface2 : t.surface, border: `1px solid ${hovered ? t.borderHov : t.border}`, transform: hovered ? "translateY(-3px)" : "none", boxShadow: hovered ? "0 8px 32px rgba(251,191,36,0.08)" : "none", transition: "all .2s", cursor: "pointer", borderRadius: 16, padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 26 }}>{service.icon}</span>
          <div>
            <div style={{ color: t.text, fontWeight: 700, fontSize: 14, fontFamily: "'Syne',sans-serif" }}>{service.name}</div>
            <div style={{ color: t.textMuted, fontSize: 11, marginTop: 1 }}>{service.category}</div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 3, alignItems: "flex-end" }}>
          <Badge active={service.login} color="blue">🔐 Лог/пас</Badge>
          <Badge active={service.gift} color="green">🎁 Gift</Badge>
          <Badge active={service.family} color="purple">👨‍👩‍👧 Family</Badge>
          <Badge active={service.newAcc} color="yellow">✨ Новый акк</Badge>
        </div>
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
        {service.tiers.map((tier, i) => (
          <div key={i} style={{ background: t.goldDim, border: `1px solid ${t.goldBorder}`, borderRadius: 8, padding: "5px 10px" }}>
            <div style={{ color: t.textSub, fontSize: 10 }}>{tier.name}</div>
            <div style={{ color: t.gold, fontWeight: 700, fontSize: 12 }}>
              ${tier.price}
              <span style={{ color: t.textMuted, fontWeight: 400, fontSize: 10 }}> = {rate ? calcPrice(tier.price, rate).toLocaleString("ru-RU") : "..."}₽</span>
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 4, textAlign: "right" }}>
        <span style={{ fontSize: 10, color: t.textMuted }}>* цена с комиссией {Math.round(MARGIN * 100)}%</span>
      </div>
      <div style={{ marginTop: 10, padding: "7px 12px", borderRadius: 8, fontSize: 12, textAlign: "center", transition: "all .2s", fontWeight: 600, background: hovered ? t.goldDim : t.surface, color: hovered ? t.gold : t.textSub }}>
        {hovered ? "→ Оформить заявку" : "Нажмите чтобы выбрать"}
      </div>
    </div>
  );
}

// ─── ORDER MODAL ──────────────────────────────────────────────
function OrderModal({ service, rate, onClose, onSaveOrder, t }) {
  const [selectedTier, setSelectedTier] = useState(service.tiers[0]);
  const [method, setMethod] = useState(service.gift ? "gift" : service.newAcc ? "newAcc" : "login");
  const [loginVal, setLoginVal] = useState("");
  const [passVal, setPassVal] = useState("");
  const [email, setEmail] = useState("");
  const [step, setStep] = useState(1);
  const [receiptFile, setReceiptFile] = useState(null);
  const orderId = useRef(`#${Math.floor(10000 + Math.random() * 90000)}`).current;
  const requisites = useRef(getRandomRequisites()).current;
  const fileRef = useRef();

  const base = Math.round(selectedTier.price * rate);
  const commission = Math.round(selectedTier.price * rate * MARGIN);
  const finalPrice = base + commission;

  const methods = [];
  if (service.login) methods.push({ id: "login",  icon: "🔐", label: "Войти в аккаунт",   desc: "Укажите логин и пароль — мы зайдём и активируем" });
  if (service.gift)  methods.push({ id: "gift",   icon: "🎁", label: "Gift-карта",          desc: "Без доступа к аккаунту — пришлём код на email" });
  if (service.family)methods.push({ id: "family", icon: "👨‍👩‍👧", label: "Family / Team план", desc: "Добавим вас по email — остаётесь в своём аккаунте" });
  if (service.newAcc)methods.push({ id: "newAcc", icon: "✨", label: "Новый аккаунт",       desc: "Создадим аккаунт и передадим логин и пароль" });

  const inputStyle = { width: "100%", background: t.input, border: `1px solid ${t.border}`, borderRadius: 10, padding: "12px 14px", color: t.text, fontSize: 14, outline: "none", marginBottom: 8, boxSizing: "border-box" };

  const handleCreate = () => {
    onSaveOrder({ id: orderId, service: service.name, tier: selectedTier.name, priceUsd: selectedTier.price, priceRub: finalPrice, method, login: loginVal, email, status: "new", createdAt: new Date().toISOString() });
    setStep(2);
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(12px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: t.dark ? "#0d0d14" : "#ffffff", border: `1px solid ${t.goldBorder}`, borderRadius: 20, width: "100%", maxWidth: 480, padding: 28, maxHeight: "90vh", overflowY: "auto" }}>
        {step === 1 ? (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 22 }}>
              <div>
                <div style={{ fontSize: 20, fontFamily: "'Syne',sans-serif", fontWeight: 800, color: t.text }}>{service.icon} {service.name}</div>
                <div style={{ color: t.textSub, fontSize: 12, marginTop: 2 }}>Оформление заявки</div>
              </div>
              <button onClick={onClose} style={{ color: t.textSub, fontSize: 20, background: "none", border: "none", cursor: "pointer" }}>✕</button>
            </div>

            <div style={{ marginBottom: 18 }}>
              <div style={{ color: t.textSub, fontSize: 11, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Тариф</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {service.tiers.map((tier, i) => (
                  <button key={i} onClick={() => setSelectedTier(tier)} style={{ padding: "10px 14px", borderRadius: 10, cursor: "pointer", background: selectedTier.name === tier.name ? t.goldDim : t.surface, border: `1px solid ${selectedTier.name === tier.name ? t.gold : t.border}`, color: selectedTier.name === tier.name ? t.gold : t.textSub, fontWeight: 600, fontSize: 13, transition: "all .15s" }}>
                    {tier.name} — ${tier.price}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 18 }}>
              <div style={{ color: t.textSub, fontSize: 11, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Способ активации</div>
              {methods.map(m => (
                <button key={m.id} onClick={() => setMethod(m.id)} style={{ width: "100%", padding: "11px 14px", borderRadius: 10, cursor: "pointer", textAlign: "left", background: method === m.id ? t.goldDim : t.surface, border: `1px solid ${method === m.id ? t.goldBorder : t.border}`, marginBottom: 7, transition: "all .15s" }}>
                  <div style={{ color: t.text, fontWeight: 600, fontSize: 13 }}>{m.icon} {m.label}</div>
                  <div style={{ color: t.textSub, fontSize: 11, marginTop: 2 }}>{m.desc}</div>
                </button>
              ))}
            </div>

            <div style={{ marginBottom: 18 }}>
              <div style={{ color: t.textSub, fontSize: 11, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Ваши данные</div>
              {(method === "gift" || method === "family") && <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email от аккаунта" style={inputStyle} />}
              {method === "login" && (
                <>
                  <input value={loginVal} onChange={e => setLoginVal(e.target.value)} placeholder="Логин / Email" style={inputStyle} />
                  <input value={passVal} onChange={e => setPassVal(e.target.value)} placeholder="Пароль" type="password" style={inputStyle} />
                  <div style={{ background: t.goldDim, border: `1px solid ${t.goldBorder}`, borderRadius: 8, padding: "8px 12px", fontSize: 11, color: t.textSub }}>
                    ⚠️ Если включена 2FA — будьте онлайн. Запросим код сразу после оплаты.
                  </div>
                </>
              )}
              {method === "newAcc" && <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 10, padding: 14, fontSize: 12, color: t.textSub, lineHeight: 1.6 }}>✨ Создадим аккаунт и пришлём логин и пароль после оплаты.</div>}
            </div>

            <div style={{ background: t.goldDim, border: `1px solid ${t.goldBorder}`, borderRadius: 12, padding: 16, marginBottom: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ color: t.textSub, fontSize: 13 }}>Курс ЦБ</span>
                <span style={{ color: t.textSub, fontSize: 13 }}>1$ = {rate?.toFixed(2)} ₽</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ color: t.textSub, fontSize: 13 }}>Комиссия {Math.round(MARGIN * 100)}%</span>
                <span style={{ color: t.textSub, fontSize: 13 }}>+ {commission.toLocaleString("ru-RU")} ₽</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderTop: `1px solid ${t.border}`, paddingTop: 10, marginTop: 4 }}>
                <span style={{ color: t.text, fontWeight: 700, fontSize: 15 }}>К оплате</span>
                <span style={{ color: t.gold, fontWeight: 800, fontSize: 22 }}>{finalPrice.toLocaleString("ru-RU")} ₽</span>
              </div>
            </div>

            <button onClick={handleCreate} style={{ width: "100%", padding: 14, borderRadius: 12, background: "linear-gradient(135deg,#f59e0b,#fbbf24)", border: "none", color: "#0d0d12", fontWeight: 800, fontSize: 15, cursor: "pointer" }}>
              Создать заявку →
            </button>
          </>
        ) : (
          <>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
              <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 20, color: t.text, marginBottom: 8 }}>Заявка создана!</div>
              <div style={{ background: t.goldDim, border: `1px solid ${t.goldBorder}`, borderRadius: 10, padding: "8px 20px", display: "inline-block", color: t.gold, fontWeight: 800, fontSize: 22 }}>{orderId}</div>
            </div>
            <div style={{ color: t.textSub, fontSize: 13, marginBottom: 18, textAlign: "center", lineHeight: 1.6 }}>
              Переведите <strong style={{ color: t.text }}>{finalPrice.toLocaleString("ru-RU")} ₽</strong> и укажи номер заявки в комментарии
            </div>
            <div style={{ background: t.surface, border: `1px dashed ${t.border}`, borderRadius: 12, padding: 16, marginBottom: 16 }}>
              <div style={{ color: t.textMuted, fontSize: 10, marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>Реквизиты · {requisites.label}</div>
              <div style={{ marginBottom: 10 }}>
                <div style={{ color: t.textMuted, fontSize: 11, marginBottom: 2 }}>По СБП</div>
                <div style={{ color: t.text, fontWeight: 600, fontSize: 15 }}>{requisites.sbp}</div>
                <div style={{ color: t.textMuted, fontSize: 11 }}>{requisites.holder}</div>
              </div>
              <div style={{ marginBottom: 10 }}>
                <div style={{ color: t.textMuted, fontSize: 11, marginBottom: 2 }}>По номеру карты</div>
                <div style={{ color: t.text, fontWeight: 600, fontSize: 15 }}>{requisites.card}</div>
                <div style={{ color: t.textMuted, fontSize: 11 }}>{requisites.label} · {requisites.holder}</div>
              </div>
              <div style={{ paddingTop: 10, borderTop: `1px solid ${t.border}`, color: t.textMuted, fontSize: 11 }}>
                Комментарий: <strong style={{ color: t.gold }}>{orderId}</strong>
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ color: t.textSub, fontSize: 12, marginBottom: 8 }}>📎 Загрузите чек — ускорит обработку и защитит вас</div>
              <input ref={fileRef} type="file" accept="image/*,.pdf" onChange={e => setReceiptFile(e.target.files[0])} style={{ display: "none" }} />
              <button onClick={() => fileRef.current.click()} style={{ width: "100%", padding: "12px", borderRadius: 10, cursor: "pointer", background: receiptFile ? "rgba(52,211,153,0.1)" : t.surface, border: `1px dashed ${receiptFile ? "rgba(52,211,153,0.4)" : t.border}`, color: receiptFile ? "#6ee7b7" : t.textSub, fontSize: 13 }}>
                {receiptFile ? `✅ ${receiptFile.name}` : "📤 Нажмите чтобы загрузить чек"}
              </button>
            </div>
            <div style={{ color: t.textMuted, fontSize: 11, marginBottom: 16, textAlign: "center", lineHeight: 1.6 }}>
              ⏱ Обрабатываем в рабочее время. Обычно до 1 часа.<br />В редких случаях до 24 ч — напишем если задержимся.
            </div>
            <button onClick={onClose} style={{ width: "100%", padding: 12, borderRadius: 10, background: t.surface, border: `1px solid ${t.border}`, color: t.textSub, cursor: "pointer", fontSize: 13 }}>Закрыть</button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── ADMIN PANEL ──────────────────────────────────────────────
function AdminPanel({ orders, onUpdateStatus, onBack, t }) {
  const [password, setPassword] = useState("");
  const [auth, setAuth] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  const exportCSV = () => {
    const headers = ["ID", "Сервис", "Тариф", "$", "₽", "Метод", "Статус", "Дата"];
    const rows = orders.map(o => [o.id, o.service, o.tier, o.priceUsd, o.priceRub, o.method, STATUS_LABELS[o.status], new Date(o.createdAt).toLocaleString("ru-RU")]);
    const csv = [headers, ...rows].map(r => r.join(";")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `payflow_orders_${Date.now()}.csv`; a.click();
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(orders, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `payflow_orders_${Date.now()}.json`; a.click();
  };

  const filtered = orders.filter(o => {
    const matchStatus = filterStatus === "all" || o.status === filterStatus;
    const matchSearch = o.id.includes(search) || o.service.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const stats = {
    total: orders.length,
    done: orders.filter(o => o.status === "done").length,
    totalRub: orders.filter(o => o.status === "done").reduce((s, o) => s + o.priceRub, 0),
    pending: orders.filter(o => o.status === "new" || o.status === "paid").length,
  };

  const inputStyle = { background: t.input, border: `1px solid ${t.border}`, borderRadius: 10, padding: "10px 14px", color: t.text, fontSize: 14, outline: "none", boxSizing: "border-box" };

  if (!auth) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: t.bg }}>
      <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 20, padding: 32, width: 340 }}>
        <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 22, color: t.text, marginBottom: 6 }}>🔐 Админка</div>
        <div style={{ color: t.textSub, fontSize: 13, marginBottom: 20 }}>Введите пароль для входа</div>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && (password === ADMIN_PASSWORD ? setAuth(true) : alert("Неверный пароль"))} placeholder="Пароль" style={{ ...inputStyle, width: "100%", marginBottom: 12 }} />
        <button onClick={() => password === ADMIN_PASSWORD ? setAuth(true) : alert("Неверный пароль")} style={{ width: "100%", padding: 12, borderRadius: 10, background: "linear-gradient(135deg,#f59e0b,#fbbf24)", border: "none", color: "#080810", fontWeight: 800, fontSize: 14, cursor: "pointer" }}>Войти</button>
        <button onClick={onBack} style={{ width: "100%", padding: 10, borderRadius: 10, background: "transparent", border: "none", color: t.textSub, cursor: "pointer", fontSize: 13, marginTop: 8 }}>← Назад</button>
      </div>
    </div>
  );

  return (
    <div style={{ background: t.bg, minHeight: "100vh", padding: "24px 20px", maxWidth: 960, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 26, color: t.text }}>📋 Заявки</div>
          <div style={{ color: t.textSub, fontSize: 13 }}>{getMoscowDateStr()} · Москва</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={exportCSV} style={{ padding: "8px 16px", borderRadius: 10, background: t.goldDim, border: `1px solid ${t.goldBorder}`, color: t.gold, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>↓ CSV</button>
          <button onClick={exportJSON} style={{ padding: "8px 16px", borderRadius: 10, background: t.surface, border: `1px solid ${t.border}`, color: t.textSub, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>↓ JSON</button>
          <button onClick={onBack} style={{ padding: "8px 16px", borderRadius: 10, background: t.surface, border: `1px solid ${t.border}`, color: t.textSub, cursor: "pointer", fontSize: 13 }}>← На сайт</button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12, marginBottom: 24 }}>
        {[
          { label: "Всего заявок", value: stats.total, color: t.gold },
          { label: "Выполнено", value: stats.done, color: "#34d399" },
          { label: "Заработано", value: stats.totalRub.toLocaleString("ru-RU") + " ₽", color: "#60a5fa" },
          { label: "Ожидают", value: stats.pending, color: "#f87171" },
        ].map(s => (
          <div key={s.label} style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 14, padding: "16px 18px" }}>
            <div style={{ color: t.textSub, fontSize: 11, marginBottom: 4 }}>{s.label}</div>
            <div style={{ color: s.color, fontWeight: 800, fontSize: 22, fontFamily: "'Syne',sans-serif" }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14, alignItems: "center" }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Поиск по ID или сервису" style={{ ...inputStyle, flex: 1, minWidth: 180 }} />
      </div>
      <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 20 }}>
        {[["all", "Все"], ...Object.entries(STATUS_LABELS)].map(([key, label]) => {
          const cnt = key === "all" ? orders.length : orders.filter(o => o.status === key).length;
          return (
            <button key={key} onClick={() => setFilterStatus(key)} style={{ padding: "6px 14px", borderRadius: 100, fontSize: 12, fontWeight: 600, cursor: "pointer", background: filterStatus === key ? t.goldDim : t.surface, border: `1px solid ${filterStatus === key ? t.goldBorder : t.border}`, color: filterStatus === key ? t.gold : t.textSub }}>
              {label} ({cnt})
            </button>
          );
        })}
      </div>

      {/* Orders */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: t.textMuted }}>{orders.length === 0 ? "Заявок пока нет" : "Ничего не найдено"}</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[...filtered].reverse().map(order => (
            <div key={order.id} style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 14, overflow: "hidden" }}>
              <div style={{ padding: 18 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                      <span style={{ color: t.gold, fontWeight: 800, fontSize: 15 }}>{order.id}</span>
                      <span style={{ background: STATUS_COLORS[order.status] + "22", border: `1px solid ${STATUS_COLORS[order.status]}66`, color: STATUS_COLORS[order.status], fontSize: 11, padding: "2px 10px", borderRadius: 100, fontWeight: 600 }}>
                        {STATUS_LABELS[order.status]}
                      </span>
                    </div>
                    <div style={{ color: t.text, fontWeight: 600, fontSize: 14, marginBottom: 3 }}>{order.service} · {order.tier}</div>
                    <div style={{ color: t.textSub, fontSize: 12, marginBottom: 3 }}>
                      {order.method === "login"  && `🔐 ${order.login}`}
                      {order.method === "gift"   && `🎁 Gift → ${order.email}`}
                      {order.method === "family" && `👨‍👩‍👧 Family → ${order.email}`}
                      {order.method === "newAcc" && `✨ Новый аккаунт`}
                    </div>
                    <div style={{ color: t.textMuted, fontSize: 11 }}>{new Date(order.createdAt).toLocaleString("ru-RU")}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ color: t.gold, fontWeight: 800, fontSize: 20 }}>{order.priceRub.toLocaleString("ru-RU")} ₽</div>
                    <div style={{ color: t.textMuted, fontSize: 12 }}>${order.priceUsd}</div>
                    <button onClick={() => setExpandedId(expandedId === order.id ? null : order.id)} style={{ marginTop: 6, padding: "4px 12px", borderRadius: 100, background: t.surface2, border: `1px solid ${t.border}`, color: t.textSub, fontSize: 11, cursor: "pointer" }}>
                      {expandedId === order.id ? "▲ свернуть" : "▼ действия"}
                    </button>
                  </div>
                </div>

                {expandedId === order.id && (
                  <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${t.border}` }}>
                    <div style={{ color: t.textSub, fontSize: 11, marginBottom: 8 }}>Изменить статус:</div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {Object.entries(STATUS_LABELS).map(([key, label]) => (
                        <button key={key} onClick={() => onUpdateStatus(order.id, key)} style={{ padding: "6px 14px", borderRadius: 100, fontSize: 12, fontWeight: 600, cursor: "pointer", background: order.status === key ? STATUS_COLORS[key] + "22" : t.surface2, border: `1px solid ${order.status === key ? STATUS_COLORS[key] + "66" : t.border}`, color: order.status === key ? STATUS_COLORS[key] : t.textSub, transition: "all .15s" }}>
                          {order.status === key ? "✓ " : ""}{label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────
export default function App() {
  const { t, toggle } = useTheme();
  const [page, setPage] = useState("home");
  const [category, setCategory] = useState("Все");
  const [search, setSearch] = useState("");
  const [selectedService, setSelectedService] = useState(null);
  const [usdAmount, setUsdAmount] = useState(20);
  const [scrolled, setScrolled] = useState(false);
  const [rate, setRate] = useState(null);
  const [rateLoading, setRateLoading] = useState(true);
  const [rateDate, setRateDate] = useState("");
  const [orders, setOrders] = useState([]);
  const howRef = useRef(null);

  // Курс ЦБ — через наш Vercel API Route (нет CORS проблем)
  useEffect(() => {
    async function fetchRate() {
      setRateLoading(true);
      try {
        const res = await fetch("/api/rate");
        const data = await res.json();
        if (data?.rate) {
          setRate(parseFloat(data.rate.toFixed(4)));
          // Дата из ЦБ РФ, показываем по московскому времени
          setRateDate(getMoscowDateStr());
        } else throw new Error("no rate");
      } catch {
        // Fallback если API не работает
        setRate(84.5);
        setRateDate(getMoscowDateStr());
      } finally {
        setRateLoading(false);
      }
    }
    fetchRate();
    // Обновляем каждые 30 минут
    const interval = setInterval(fetchRate, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function load() {
      try { const r = await window.storage.get("orders"); if (r?.value) setOrders(JSON.parse(r.value)); } catch {}
    }
    load();
  }, []);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const saveOrder = async (order) => {
    const updated = [...orders, order];
    setOrders(updated);
    try { await window.storage.set("orders", JSON.stringify(updated)); } catch {}
  };

  const updateStatus = async (id, status) => {
    const updated = orders.map(o => o.id === id ? { ...o, status } : o);
    setOrders(updated);
    try { await window.storage.set("orders", JSON.stringify(updated)); } catch {}
  };

  const filtered = SERVICES.filter(s =>
    (category === "Все" || s.category === category) &&
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const base     = rate ? Math.round(usdAmount * rate) : 0;
  const comm     = rate ? Math.round(usdAmount * rate * MARGIN) : 0;
  const total    = base + comm;

  if (page === "admin") return <AdminPanel orders={orders} onUpdateStatus={updateStatus} onBack={() => setPage("home")} t={t} />;

  return (
    <div style={{ background: t.bg, minHeight: "100vh", fontFamily: "'DM Sans',sans-serif", color: t.text, transition: "background .3s,color .3s" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:6px} ::-webkit-scrollbar-track{background:transparent} ::-webkit-scrollbar-thumb{background:rgba(251,191,36,0.3);border-radius:3px}
        input::placeholder{color:inherit;opacity:.4}
        @keyframes pulse{0%,100%{opacity:.5}50%{opacity:1}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:none}}
        @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
        .fu1{animation:fadeUp .6s ease forwards}
        .fu2{animation:fadeUp .6s .1s ease forwards;opacity:0}
        .fu3{animation:fadeUp .6s .2s ease forwards;opacity:0}
        .fu4{animation:fadeUp .6s .3s ease forwards;opacity:0}
      `}</style>

      {/* NAV */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, padding: "0 28px", height: 58, display: "flex", alignItems: "center", justifyContent: "space-between", background: scrolled ? t.nav : "transparent", backdropFilter: scrolled ? "blur(16px)" : "none", borderBottom: scrolled ? `1px solid ${t.border}` : "none", transition: "all .3s" }}>
        <div onClick={() => setPage("home")} style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 18, cursor: "pointer", letterSpacing: -0.5, color: t.text }}>
          pay<span style={{ color: t.gold }}>flow</span>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {[["home","Главная"],["catalog","Каталог"]].map(([p,label]) => (
            <button key={p} onClick={() => setPage(p)} style={{ padding: "7px 16px", borderRadius: 100, fontSize: 13, fontWeight: 600, cursor: "pointer", background: page===p ? t.goldDim : "transparent", border: `1px solid ${page===p ? t.goldBorder : "transparent"}`, color: page===p ? t.gold : t.textSub, transition: "all .2s" }}>{label}</button>
          ))}
          {/* Theme toggle */}
          <button onClick={toggle} style={{ width: 36, height: 36, borderRadius: 100, background: t.surface, border: `1px solid ${t.border}`, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {t.dark ? "☀️" : "🌙"}
          </button>
          <button onClick={() => setPage("admin")} style={{ width: 36, height: 36, borderRadius: 100, background: t.surface, border: `1px solid ${t.border}`, cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", color: t.textMuted }}>⚙️</button>
        </div>
      </nav>

      {/* HOME */}
      {page === "home" && (
        <div>
          {/* HERO */}
          <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "80px 24px 40px", background: t.dark ? "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(251,191,36,0.07) 0%, transparent 70%)" : "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(217,119,6,0.06) 0%, transparent 70%)" }}>
            <div className="fu1" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: t.surface, border: `1px solid ${t.border}`, borderRadius: 100, padding: "7px 16px", marginBottom: 28, fontSize: 12 }}>
              {rateLoading
                ? <span style={{ width: 12, height: 12, border: `2px solid ${t.border}`, borderTopColor: t.gold, borderRadius: "50%", display: "inline-block", animation: "spin .8s linear infinite" }} />
                : <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", display: "inline-block", animation: "pulse 2s infinite" }} />}
              <span style={{ color: t.textSub }}>Курс ЦБ на {rateDate || "сегодня"}:</span>
              <span style={{ color: t.gold, fontWeight: 700 }}>{rateLoading ? "загрузка..." : `1$ = ${rate?.toFixed(2)} ₽`}</span>
            </div>

            <h1 className="fu2" style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "clamp(32px,6vw,66px)", lineHeight: 1.06, letterSpacing: -2, marginBottom: 18, color: t.text }}>
              Оплати любой<br /><span style={{ color: t.gold }}>зарубежный сервис</span><br />за рубли
            </h1>
            <p className="fu3" style={{ color: t.textSub, fontSize: 16, maxWidth: 460, marginBottom: 10, lineHeight: 1.6 }}>ChatGPT, Midjourney, Netflix, Spotify и ещё 47 сервисов.</p>
            <p className="fu3" style={{ color: t.dark ? "rgba(251,191,36,0.7)" : "rgba(180,83,9,0.8)", fontSize: 14, maxWidth: 420, marginBottom: 36, lineHeight: 1.5 }}>
              Комиссия {Math.round(MARGIN * 100)}% — без скрытых платежей и процентов за пополнение.
            </p>

            <div className="fu3" style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
              <button onClick={() => setPage("catalog")} style={{ padding: "15px 32px", borderRadius: 14, background: "linear-gradient(135deg,#f59e0b,#fbbf24)", border: "none", color: "#080810", fontWeight: 800, fontSize: 15, cursor: "pointer", boxShadow: "0 4px 24px rgba(251,191,36,0.3)" }}>
                Смотреть сервисы →
              </button>
              <button onClick={() => howRef.current?.scrollIntoView({ behavior: "smooth" })} style={{ padding: "15px 32px", borderRadius: 14, background: t.surface, border: `1px solid ${t.border}`, color: t.textSub, fontWeight: 600, fontSize: 15, cursor: "pointer" }}>
                Как это работает?
              </button>
            </div>

            <div className="fu4" style={{ display: "flex", gap: 32, marginTop: 56, flexWrap: "wrap", justifyContent: "center" }}>
              {[["50+","сервисов"],[`${Math.round(MARGIN*100)}%`,"комиссия"],["без скрытых","доплат"]].map(([v,l]) => (
                <div key={l} style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 24, fontWeight: 800, color: t.gold }}>{v}</div>
                  <div style={{ color: t.textMuted, fontSize: 12 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* CALCULATOR */}
          <div style={{ padding: "70px 24px", maxWidth: 560, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <div style={{ color: t.gold, fontSize: 11, textTransform: "uppercase", letterSpacing: 2, marginBottom: 8 }}>Калькулятор</div>
              <h2 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 26, color: t.text }}>Сколько это стоит в рублях?</h2>
            </div>
            <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 20, padding: 26 }}>
              <label style={{ color: t.textSub, fontSize: 12, marginBottom: 8, display: "block" }}>Сумма в долларах</label>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                <span style={{ color: t.textSub, fontSize: 22, fontWeight: 700 }}>$</span>
                <input type="number" value={usdAmount} min={1} max={5000}
                  onChange={e => setUsdAmount(Math.max(1, Number(e.target.value)))}
                  style={{ flex: 1, background: t.input, border: `1px solid ${t.border}`, borderRadius: 12, padding: "13px 16px", color: t.text, fontSize: 24, fontWeight: 800, outline: "none" }} />
              </div>
              <input type="range" min={1} max={2000} value={Math.min(usdAmount, 2000)} onChange={e => setUsdAmount(Number(e.target.value))}
                style={{ width: "100%", marginTop: 10, marginBottom: 18, accentColor: t.gold }} />

              <div style={{ background: t.goldDim, border: `1px solid ${t.goldBorder}`, borderRadius: 14, padding: "18px 20px" }}>
                {rateLoading ? (
                  <div style={{ textAlign: "center", color: t.textSub, fontSize: 13, padding: "10px 0" }}>⏳ Загружаем актуальный курс ЦБ...</div>
                ) : (
                  <>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                      <span style={{ color: t.textSub, fontSize: 13 }}>Курс ЦБ на {rateDate}</span>
                      <span style={{ color: t.textSub, fontSize: 13 }}>1$ = {rate?.toFixed(2)} ₽</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                      <span style={{ color: t.textSub, fontSize: 13 }}>Наша комиссия {Math.round(MARGIN * 100)}%</span>
                      <span style={{ color: t.textSub, fontSize: 13 }}>+ {comm.toLocaleString("ru-RU")} ₽</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", borderTop: `1px solid ${t.border}`, paddingTop: 12 }}>
                      <span style={{ color: t.text, fontWeight: 700, fontSize: 15 }}>Итого к оплате</span>
                      <span style={{ color: t.gold, fontWeight: 800, fontSize: 28 }}>{total.toLocaleString("ru-RU")} ₽</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* HOW IT WORKS */}
          <div ref={howRef} style={{ padding: "60px 24px 100px", maxWidth: 880, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 44 }}>
              <div style={{ color: t.gold, fontSize: 11, textTransform: "uppercase", letterSpacing: 2, marginBottom: 8 }}>Процесс</div>
              <h2 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 28, color: t.text }}>Как это работает</h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 14 }}>
              {[
                { n:"01", title:"Выбираешь сервис",    desc:"Находишь нужный сервис и тариф в каталоге. Цена в рублях видна сразу." },
                { n:"02", title:"Оформляешь заявку",   desc:"Выбираешь способ: логин/пароль, Gift-карта, Family/Team план или новый аккаунт от нас." },
                { n:"03", title:"Переводишь рубли",    desc:"По СБП или номеру карты. В комментарии к переводу укажи номер заявки и загрузи чек." },
                { n:"04", title:"Получаешь доступ",    desc:"Активируем в рабочее время — обычно в течение часа. В редких случаях до 24 ч." },
              ].map(s => (
                <div key={s.n} style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 16, padding: "22px 18px" }}>
                  <div style={{ fontFamily: "'Syne',sans-serif", color: t.dark ? "rgba(251,191,36,0.3)" : "rgba(180,83,9,0.3)", fontSize: 30, fontWeight: 800, marginBottom: 12 }}>{s.n}</div>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6, color: t.text }}>{s.title}</div>
                  <div style={{ color: t.textSub, fontSize: 12, lineHeight: 1.6 }}>{s.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CATALOG */}
      {page === "catalog" && (
        <div style={{ maxWidth: 1140, margin: "0 auto", padding: "78px 20px 60px" }}>
          <div style={{ marginBottom: 28 }}>
            <div style={{ color: t.gold, fontSize: 11, textTransform: "uppercase", letterSpacing: 2, marginBottom: 8 }}>Каталог</div>
            <h2 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 30, marginBottom: 4, color: t.text }}>Все сервисы</h2>
            <div style={{ color: t.textSub, fontSize: 13 }}>
              {SERVICES.length} сервисов · Курс ЦБ: {rateLoading ? "загрузка..." : `1$ = ${rate?.toFixed(2)} ₽`} · <span style={{ color: t.textMuted }}>цены с комиссией {Math.round(MARGIN*100)}%</span>
            </div>
          </div>

          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍  Поиск сервиса..."
            style={{ width: "100%", background: t.input, border: `1px solid ${t.border}`, borderRadius: 12, padding: "13px 16px", color: t.text, fontSize: 14, outline: "none", marginBottom: 14 }} />

          <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 24 }}>
            {CATEGORIES.map(c => {
              const cnt = SERVICES.filter(s => c==="Все" || s.category===c).length;
              return <button key={c} onClick={() => setCategory(c)} style={{ padding: "7px 14px", borderRadius: 100, fontSize: 12, fontWeight: 600, cursor: "pointer", background: category===c ? t.goldDim : t.surface, border: `1px solid ${category===c ? t.goldBorder : t.border}`, color: category===c ? t.gold : t.textSub, transition: "all .15s" }}>
                {c} <span style={{ opacity: 0.55 }}>({cnt})</span>
              </button>;
            })}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 12 }}>
            {filtered.map(s => <ServiceCard key={s.id} service={s} rate={rate} onSelect={setSelectedService} t={t} />)}
          </div>
          {filtered.length === 0 && <div style={{ textAlign: "center", padding: "60px 0", color: t.textMuted }}>Ничего не найдено</div>}
        </div>
      )}

      {selectedService && <OrderModal service={selectedService} rate={rate} onClose={() => setSelectedService(null)} onSaveOrder={saveOrder} t={t} />}

      <div style={{ borderTop: `1px solid ${t.border}`, padding: "22px 28px", textAlign: "center", color: t.textMuted, fontSize: 12 }}>
        payflow · Оплата зарубежных сервисов · 2026
      </div>
    </div>
  );
}