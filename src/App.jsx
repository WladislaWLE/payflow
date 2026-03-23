
import { useState, useEffect, useRef } from "react";

// ─── ТВОИ РЕКВИЗИТЫ ───────────────────────────────────────────
const REQUISITES_POOL = [
  { label: "Тинькофф", sbp: "+7 (900) 000-00-00", card: "2200 0000 0000 0001", holder: "Иван И." },
  { label: "Сбербанк",  sbp: "+7 (900) 000-00-01", card: "2202 0000 0000 0002", holder: "Иван И." },
  { label: "ВТБ",       sbp: "+7 (900) 000-00-02", card: "2200 0000 0000 0003", holder: "Иван И." },
];
function getRandomRequisites() {
  return REQUISITES_POOL[Math.floor(Math.random() * REQUISITES_POOL.length)];
}
const ADMIN_PASSWORD = "payflow2026";
// ──────────────────────────────────────────────────────────────

const MARGIN = 0.07;

const SERVICES = [
  { id: 1, name: "ChatGPT Plus", category: "AI", icon: "🤖", tiers: [{ name: "Plus", price: 20 }, { name: "Team", price: 25 }, { name: "Pro", price: 200 }], login: true, gift: false, family: true, newAcc: true },
  { id: 2, name: "Claude Pro", category: "AI", icon: "🧠", tiers: [{ name: "Pro", price: 20 }, { name: "Team", price: 30 }], login: true, gift: false, family: true, newAcc: true },
  { id: 3, name: "Perplexity Pro", category: "AI", icon: "🔍", tiers: [{ name: "Pro", price: 20 }], login: true, gift: false, family: false, newAcc: true },
  { id: 4, name: "Grok Premium", category: "AI", icon: "🐦", tiers: [{ name: "Premium", price: 8 }, { name: "Premium+", price: 16 }], login: true, gift: false, family: false, newAcc: false },
  { id: 5, name: "Gemini Advanced", category: "AI", icon: "💎", tiers: [{ name: "Google One AI", price: 19.99 }], login: true, gift: true, family: true, newAcc: false },
  { id: 6, name: "Midjourney", category: "AI", icon: "🎨", tiers: [{ name: "Basic", price: 10 }, { name: "Standard", price: 30 }, { name: "Pro", price: 60 }, { name: "Mega", price: 120 }], login: true, gift: false, family: false, newAcc: true },
  { id: 7, name: "Leonardo AI", category: "AI", icon: "🖼️", tiers: [{ name: "Apprentice", price: 10 }, { name: "Artisan", price: 24 }, { name: "Maestro", price: 48 }], login: true, gift: false, family: false, newAcc: true },
  { id: 8, name: "Runway ML", category: "AI", icon: "🎬", tiers: [{ name: "Standard", price: 15 }, { name: "Pro", price: 35 }, { name: "Unlimited", price: 95 }], login: true, gift: false, family: false, newAcc: true },
  { id: 9, name: "Kling AI", category: "AI", icon: "🎥", tiers: [{ name: "Starter", price: 8 }, { name: "Pro", price: 35 }, { name: "Premier", price: 88 }], login: true, gift: false, family: false, newAcc: true },
  { id: 10, name: "ElevenLabs", category: "AI", icon: "🎙️", tiers: [{ name: "Starter", price: 5 }, { name: "Creator", price: 22 }, { name: "Pro", price: 99 }], login: true, gift: false, family: false, newAcc: true },
  { id: 11, name: "Murf AI", category: "AI", icon: "🔊", tiers: [{ name: "Creator", price: 29 }, { name: "Business", price: 99 }], login: true, gift: false, family: false, newAcc: true },
  { id: 12, name: "Adobe Firefly", category: "Дизайн", icon: "🔥", tiers: [{ name: "Firefly", price: 9.99 }, { name: "All Apps", price: 54.99 }], login: true, gift: true, family: false, newAcc: false },
  { id: 13, name: "Cursor Pro", category: "Разработка", icon: "💻", tiers: [{ name: "Pro", price: 20 }, { name: "Ultra", price: 200 }], login: true, gift: false, family: false, newAcc: true },
  { id: 14, name: "GitHub Copilot", category: "Разработка", icon: "⚡", tiers: [{ name: "Pro", price: 10 }, { name: "Pro+", price: 39 }], login: true, gift: false, family: false, newAcc: false },
  { id: 15, name: "Windsurf", category: "Разработка", icon: "🏄", tiers: [{ name: "Pro", price: 15 }, { name: "Teams", price: 30 }], login: true, gift: false, family: false, newAcc: true },
  { id: 16, name: "Replit Core", category: "Разработка", icon: "🔧", tiers: [{ name: "Core", price: 20 }], login: true, gift: false, family: false, newAcc: true },
  { id: 17, name: "Vercel Pro", category: "Разработка", icon: "▲", tiers: [{ name: "Pro", price: 20 }], login: true, gift: false, family: false, newAcc: false },
  { id: 18, name: "Linear", category: "Разработка", icon: "📐", tiers: [{ name: "Plus", price: 8 }, { name: "Business", price: 14 }], login: true, gift: false, family: false, newAcc: false },
  { id: 19, name: "Figma", category: "Дизайн", icon: "✏️", tiers: [{ name: "Professional", price: 15 }, { name: "Organization", price: 45 }], login: true, gift: false, family: false, newAcc: false },
  { id: 20, name: "Canva Pro", category: "Дизайн", icon: "🖌️", tiers: [{ name: "Pro", price: 14.99 }, { name: "Teams", price: 29.99 }], login: true, gift: true, family: true, newAcc: false },
  { id: 21, name: "Adobe Creative Cloud", category: "Дизайн", icon: "🅰️", tiers: [{ name: "Photography", price: 19.99 }, { name: "Single App", price: 34.99 }, { name: "All Apps", price: 54.99 }], login: true, gift: true, family: false, newAcc: false },
  { id: 22, name: "Notion", category: "Продуктивность", icon: "📝", tiers: [{ name: "Plus", price: 10 }, { name: "Business", price: 15 }], login: true, gift: false, family: false, newAcc: false },
  { id: 23, name: "Notion AI", category: "Продуктивность", icon: "🤖", tiers: [{ name: "AI Add-on", price: 10 }], login: true, gift: false, family: false, newAcc: false },
  { id: 24, name: "Obsidian Sync", category: "Продуктивность", icon: "🔮", tiers: [{ name: "Sync", price: 10 }, { name: "Sync+Publish", price: 20 }], login: true, gift: false, family: false, newAcc: false },
  { id: 25, name: "Grammarly", category: "Продуктивность", icon: "📖", tiers: [{ name: "Premium", price: 30 }, { name: "Business", price: 25 }], login: true, gift: true, family: false, newAcc: false },
  { id: 26, name: "Otter.ai", category: "Продуктивность", icon: "🦦", tiers: [{ name: "Pro", price: 16.99 }, { name: "Business", price: 30 }], login: true, gift: false, family: false, newAcc: true },
  { id: 27, name: "Loom", category: "Продуктивность", icon: "📹", tiers: [{ name: "Starter", price: 12.5 }, { name: "Business+", price: 16 }], login: true, gift: false, family: false, newAcc: false },
  { id: 28, name: "Dropbox Plus", category: "Продуктивность", icon: "📦", tiers: [{ name: "Plus", price: 11.99 }, { name: "Professional", price: 19.99 }], login: true, gift: false, family: false, newAcc: false },
  { id: 29, name: "Netflix", category: "Стриминг", icon: "🎬", tiers: [{ name: "Standard", price: 15.49 }, { name: "Premium", price: 22.99 }], login: true, gift: true, family: true, newAcc: false },
  { id: 30, name: "YouTube Premium", category: "Стриминг", icon: "▶️", tiers: [{ name: "Individual", price: 13.99 }, { name: "Family", price: 22.99 }], login: true, gift: true, family: true, newAcc: false },
  { id: 31, name: "Disney+", category: "Стриминг", icon: "🏰", tiers: [{ name: "Basic", price: 7.99 }, { name: "Premium", price: 13.99 }], login: true, gift: true, family: false, newAcc: false },
  { id: 32, name: "Apple TV+", category: "Стриминг", icon: "🍎", tiers: [{ name: "Individual", price: 9.99 }], login: true, gift: true, family: true, newAcc: false },
  { id: 33, name: "HBO Max", category: "Стриминг", icon: "📺", tiers: [{ name: "With Ads", price: 9.99 }, { name: "Ad-Free", price: 15.99 }, { name: "Ultimate", price: 19.99 }], login: true, gift: true, family: false, newAcc: false },
  { id: 34, name: "Crunchyroll", category: "Стриминг", icon: "⛩️", tiers: [{ name: "Fan", price: 7.99 }, { name: "Mega Fan", price: 9.99 }, { name: "Ultimate Fan", price: 14.99 }], login: true, gift: true, family: false, newAcc: false },
  { id: 35, name: "Spotify Premium", category: "Музыка", icon: "🎵", tiers: [{ name: "Individual", price: 11.99 }, { name: "Duo", price: 16.99 }, { name: "Family", price: 19.99 }], login: true, gift: true, family: true, newAcc: false },
  { id: 36, name: "Apple Music", category: "Музыка", icon: "🎶", tiers: [{ name: "Individual", price: 10.99 }, { name: "Family", price: 16.99 }], login: true, gift: true, family: true, newAcc: false },
  { id: 37, name: "Tidal", category: "Музыка", icon: "🌊", tiers: [{ name: "Individual", price: 10.99 }, { name: "Family", price: 17.99 }], login: true, gift: false, family: true, newAcc: false },
  { id: 38, name: "Duolingo Super", category: "Обучение", icon: "🦉", tiers: [{ name: "Super", price: 12.99 }, { name: "Family", price: 119.99 }], login: true, gift: true, family: true, newAcc: false },
  { id: 39, name: "Coursera Plus", category: "Обучение", icon: "🎓", tiers: [{ name: "Monthly", price: 59 }, { name: "Annual", price: 399 }], login: true, gift: false, family: false, newAcc: false },
  { id: 40, name: "Skillshare", category: "Обучение", icon: "🎒", tiers: [{ name: "Individual", price: 32 }], login: true, gift: true, family: false, newAcc: false },
  { id: 41, name: "MasterClass", category: "Обучение", icon: "🏆", tiers: [{ name: "Individual", price: 10 }, { name: "Duo", price: 15 }, { name: "Family", price: 20 }], login: true, gift: true, family: true, newAcc: false },
  { id: 42, name: "Zoom Pro", category: "Инструменты", icon: "📞", tiers: [{ name: "Pro", price: 15.99 }, { name: "Business", price: 19.99 }], login: true, gift: false, family: false, newAcc: false },
  { id: 43, name: "Discord Nitro", category: "Инструменты", icon: "💬", tiers: [{ name: "Basic", price: 2.99 }, { name: "Nitro", price: 9.99 }], login: true, gift: true, family: false, newAcc: false },
  { id: 44, name: "Telegram Premium", category: "Инструменты", icon: "✈️", tiers: [{ name: "Premium", price: 4.99 }], login: true, gift: true, family: false, newAcc: false },
  { id: 45, name: "NordVPN", category: "Инструменты", icon: "🔒", tiers: [{ name: "Basic 1м", price: 12.99 }, { name: "Basic 1г", price: 53.88 }], login: true, gift: false, family: false, newAcc: false },
  { id: 46, name: "1Password", category: "Инструменты", icon: "🔑", tiers: [{ name: "Individual", price: 2.99 }, { name: "Families", price: 4.99 }], login: true, gift: false, family: true, newAcc: false },
  { id: 47, name: "Setapp", category: "Инструменты", icon: "📱", tiers: [{ name: "Individual", price: 9.99 }, { name: "Family", price: 14.99 }], login: true, gift: false, family: true, newAcc: false },
  { id: 48, name: "Xbox Game Pass", category: "Игры", icon: "🎮", tiers: [{ name: "Ultimate", price: 19.99 }], login: true, gift: true, family: false, newAcc: false },
  { id: 49, name: "PlayStation Plus", category: "Игры", icon: "🕹️", tiers: [{ name: "Essential", price: 9.99 }, { name: "Extra", price: 14.99 }, { name: "Premium", price: 17.99 }], login: true, gift: true, family: false, newAcc: false },
  { id: 50, name: "Steam (пополнение)", category: "Игры", icon: "🚂", tiers: [{ name: "$20", price: 20 }, { name: "$50", price: 50 }, { name: "$100", price: 100 }], login: false, gift: true, family: false, newAcc: false },
];

const CATEGORIES = ["Все", "AI", "Разработка", "Дизайн", "Стриминг", "Музыка", "Продуктивность", "Инструменты", "Обучение", "Игры"];
const STATUS_LABELS = { new: "Новая", paid: "Оплачена", processing: "В обработке", done: "Выполнена", cancelled: "Отменена" };
const STATUS_COLORS = { new: "#fbbf24", paid: "#60a5fa", processing: "#a78bfa", done: "#34d399", cancelled: "#f87171" };

function calcPrice(usd, rate) { return Math.ceil(usd * rate * (1 + MARGIN)); }

// ─── BADGE ────────────────────────────────────────────────────
function Badge({ active, color, children }) {
  const c = { blue: ["rgba(96,165,250,0.15)", "rgba(96,165,250,0.4)", "#93c5fd"], green: ["rgba(52,211,153,0.15)", "rgba(52,211,153,0.4)", "#6ee7b7"], purple: ["rgba(167,139,250,0.15)", "rgba(167,139,250,0.4)", "#c4b5fd"], yellow: ["rgba(251,191,36,0.15)", "rgba(251,191,36,0.4)", "#fde68a"] }[color];
  return <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 100, fontWeight: 600, background: active ? c[0] : "rgba(255,255,255,0.04)", border: `1px solid ${active ? c[1] : "rgba(255,255,255,0.1)"}`, color: active ? c[2] : "rgba(255,255,255,0.2)" }}>{children}</span>;
}

// ─── SERVICE CARD ─────────────────────────────────────────────
function ServiceCard({ service, rate, onSelect }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onClick={() => onSelect(service)}
      style={{ background: hovered ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.03)", border: `1px solid ${hovered ? "rgba(251,191,36,0.4)" : "rgba(255,255,255,0.08)"}`, transform: hovered ? "translateY(-2px)" : "none", transition: "all .2s", cursor: "pointer", borderRadius: 16, padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 26 }}>{service.icon}</span>
          <div>
            <div style={{ color: "white", fontWeight: 700, fontSize: 14, fontFamily: "'Syne',sans-serif" }}>{service.name}</div>
            <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, marginTop: 1 }}>{service.category}</div>
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
        {service.tiers.map((t, i) => (
          <div key={i} style={{ background: "rgba(251,191,36,0.07)", border: "1px solid rgba(251,191,36,0.18)", borderRadius: 8, padding: "5px 10px" }}>
            <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 10 }}>{t.name}</div>
            <div style={{ color: "#fbbf24", fontWeight: 700, fontSize: 12 }}>
              ${t.price} <span style={{ color: "rgba(255,255,255,0.28)", fontWeight: 400, fontSize: 10 }}>= {rate ? calcPrice(t.price, rate).toLocaleString() : "..."}₽</span>
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 4, textAlign: "right" }}><span style={{ fontSize: 10, color: "rgba(255,255,255,0.18)" }}>* цена с комиссией 7%</span></div>
      <div style={{ marginTop: 10, padding: "7px 12px", borderRadius: 8, fontSize: 12, textAlign: "center", transition: "all .2s", fontWeight: 600, background: hovered ? "rgba(251,191,36,0.15)" : "rgba(255,255,255,0.04)", color: hovered ? "#fbbf24" : "rgba(255,255,255,0.35)" }}>
        {hovered ? "→ Оформить заявку" : "Нажмите чтобы выбрать"}
      </div>
    </div>
  );
}

// ─── ORDER MODAL ──────────────────────────────────────────────
function OrderModal({ service, rate, onClose, onSaveOrder }) {
  const [selectedTier, setSelectedTier] = useState(service.tiers[0]);
  const [method, setMethod] = useState(service.gift ? "gift" : service.newAcc ? "newAcc" : "login");
  const [login, setLogin] = useState("");
  const [pass, setPass] = useState("");
  const [email, setEmail] = useState("");
  const [step, setStep] = useState(1); // 1=form, 2=payment+receipt
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptName, setReceiptName] = useState("");
  const orderId = useRef(`#${Math.floor(10000 + Math.random() * 90000)}`).current;
  const requisites = useRef(getRandomRequisites()).current;
  const fileRef = useRef();

  const finalPrice = calcPrice(selectedTier.price, rate);

  const methods = [];
  if (service.login) methods.push({ id: "login", icon: "🔐", label: "Войти в аккаунт", desc: "Укажите логин и пароль — мы зайдём и активируем" });
  if (service.gift) methods.push({ id: "gift", icon: "🎁", label: "Gift-карта", desc: "Без доступа к аккаунту — пришлём код на email" });
  if (service.family) methods.push({ id: "family", icon: "👨‍👩‍👧", label: "Family / Team план", desc: "Добавим вас по email — остаётесь в своём аккаунте" });
  if (service.newAcc) methods.push({ id: "newAcc", icon: "✨", label: "Новый аккаунт", desc: "Мы создадим аккаунт и передадим логин и пароль" });

  const handleCreateOrder = () => {
    const order = {
      id: orderId,
      service: service.name,
      tier: selectedTier.name,
      priceUsd: selectedTier.price,
      priceRub: finalPrice,
      method,
      login: method === "login" ? login : "",
      email: (method === "gift" || method === "family") ? email : "",
      status: "new",
      receipt: null,
      createdAt: new Date().toISOString(),
    };
    onSaveOrder(order);
    setStep(2);
  };

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f) { setReceiptFile(f); setReceiptName(f.name); }
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#0d0d12", border: "1px solid rgba(251,191,36,0.2)", borderRadius: 20, width: "100%", maxWidth: 480, padding: 28, maxHeight: "90vh", overflowY: "auto" }}>

        {step === 1 && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 22 }}>
              <div>
                <div style={{ fontSize: 20, fontFamily: "'Syne',sans-serif", fontWeight: 800 }}>{service.icon} {service.name}</div>
                <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, marginTop: 2 }}>Оформление заявки</div>
              </div>
              <button onClick={onClose} style={{ color: "rgba(255,255,255,0.3)", fontSize: 20, background: "none", border: "none", cursor: "pointer" }}>✕</button>
            </div>

            {/* Тариф */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Тариф</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {service.tiers.map((t, i) => (
                  <button key={i} onClick={() => setSelectedTier(t)} style={{ padding: "10px 14px", borderRadius: 10, cursor: "pointer", background: selectedTier.name === t.name ? "rgba(251,191,36,0.15)" : "rgba(255,255,255,0.05)", border: `1px solid ${selectedTier.name === t.name ? "#fbbf24" : "rgba(255,255,255,0.1)"}`, color: selectedTier.name === t.name ? "#fbbf24" : "rgba(255,255,255,0.5)", fontWeight: 600, fontSize: 13, transition: "all .15s" }}>
                    {t.name} — ${t.price}
                  </button>
                ))}
              </div>
            </div>

            {/* Способ */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Способ активации</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {methods.map(m => (
                  <button key={m.id} onClick={() => setMethod(m.id)} style={{ padding: "11px 14px", borderRadius: 10, cursor: "pointer", textAlign: "left", background: method === m.id ? "rgba(251,191,36,0.08)" : "rgba(255,255,255,0.03)", border: `1px solid ${method === m.id ? "rgba(251,191,36,0.5)" : "rgba(255,255,255,0.07)"}`, transition: "all .15s" }}>
                    <div style={{ color: "white", fontWeight: 600, fontSize: 13 }}>{m.icon} {m.label}</div>
                    <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, marginTop: 2 }}>{m.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Данные */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Ваши данные</div>
              {(method === "gift" || method === "family") && (
                <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email от аккаунта" style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "12px 14px", color: "white", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
              )}
              {method === "login" && (
                <>
                  <input value={login} onChange={e => setLogin(e.target.value)} placeholder="Логин / Email" style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "12px 14px", color: "white", fontSize: 14, outline: "none", marginBottom: 8, boxSizing: "border-box" }} />
                  <input value={pass} onChange={e => setPass(e.target.value)} placeholder="Пароль" type="password" style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "12px 14px", color: "white", fontSize: 14, outline: "none", marginBottom: 8, boxSizing: "border-box" }} />
                  <div style={{ background: "rgba(251,191,36,0.07)", border: "1px solid rgba(251,191,36,0.2)", borderRadius: 8, padding: "8px 12px", fontSize: 11, color: "rgba(255,255,255,0.45)" }}>
                    ⚠️ Если включена 2FA — будьте онлайн. Запросим код в течение нескольких минут.
                  </div>
                </>
              )}
              {method === "newAcc" && (
                <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: 14, fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>
                  ✨ Мы создадим аккаунт и пришлём логин и пароль после оплаты. Ничего указывать не нужно.
                </div>
              )}
            </div>

            {/* Итог */}
            <div style={{ background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.2)", borderRadius: 12, padding: 16, marginBottom: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>Курс ЦБ</span>
                <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>1$ = {rate?.toFixed(2)} ₽</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>Базовая сумма</span>
                <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>{Math.ceil(selectedTier.price * rate).toLocaleString()} ₽</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>Наша комиссия 7%</span>
                <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>+ {Math.ceil(selectedTier.price * rate * MARGIN).toLocaleString()} ₽</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 10 }}>
                <span style={{ color: "white", fontWeight: 700, fontSize: 15 }}>К оплате</span>
                <span style={{ color: "#fbbf24", fontWeight: 800, fontSize: 22 }}>{finalPrice.toLocaleString()} ₽</span>
              </div>
            </div>

            <button onClick={handleCreateOrder} style={{ width: "100%", padding: 14, borderRadius: 12, background: "linear-gradient(135deg,#f59e0b,#fbbf24)", border: "none", color: "#0d0d12", fontWeight: 800, fontSize: 15, cursor: "pointer" }}>
              Создать заявку →
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
              <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 20, marginBottom: 6 }}>Заявка создана!</div>
              <div style={{ background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.3)", borderRadius: 10, padding: "8px 20px", display: "inline-block", color: "#fbbf24", fontWeight: 800, fontSize: 22 }}>{orderId}</div>
            </div>

            <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 13, marginBottom: 18, textAlign: "center", lineHeight: 1.6 }}>
              Переведите <strong style={{ color: "white" }}>{finalPrice.toLocaleString()} ₽</strong> и укажи номер заявки в комментарии
            </div>

            {/* Реквизиты */}
            <div style={{ background: "rgba(255,255,255,0.04)", border: "1px dashed rgba(255,255,255,0.12)", borderRadius: 12, padding: 16, marginBottom: 16 }}>
              <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>Реквизиты ({requisites.label})</div>
              <div style={{ marginBottom: 10 }}>
                <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, marginBottom: 2 }}>По СБП</div>
                <div style={{ color: "white", fontWeight: 600, fontSize: 15 }}>{requisites.sbp}</div>
                <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 11 }}>{requisites.holder}</div>
              </div>
              <div style={{ marginBottom: 10 }}>
                <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, marginBottom: 2 }}>По номеру карты</div>
                <div style={{ color: "white", fontWeight: 600, fontSize: 15 }}>{requisites.card}</div>
                <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 11 }}>{requisites.label} · {requisites.holder}</div>
              </div>
              <div style={{ paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.3)", fontSize: 11 }}>
                Комментарий к переводу: <strong style={{ color: "#fbbf24" }}>{orderId}</strong>
              </div>
            </div>

            {/* Загрузка чека */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, marginBottom: 8 }}>
                📎 Загрузите чек об оплате — это ускорит обработку заявки и защитит вас в случае спора
              </div>
              <input ref={fileRef} type="file" accept="image/*,.pdf" onChange={handleFileChange} style={{ display: "none" }} />
              <button onClick={() => fileRef.current.click()} style={{
                width: "100%", padding: "12px", borderRadius: 10, cursor: "pointer",
                background: receiptFile ? "rgba(52,211,153,0.1)" : "rgba(255,255,255,0.05)",
                border: `1px dashed ${receiptFile ? "rgba(52,211,153,0.4)" : "rgba(255,255,255,0.15)"}`,
                color: receiptFile ? "#6ee7b7" : "rgba(255,255,255,0.45)", fontSize: 13,
              }}>
                {receiptFile ? `✅ ${receiptName}` : "📤 Нажмите чтобы загрузить чек"}
              </button>
              {receiptFile && <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, marginTop: 6, textAlign: "center" }}>Чек прикреплён к заявке {orderId}</div>}
            </div>

            <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, marginBottom: 16, textAlign: "center", lineHeight: 1.6 }}>
              ⏱ Обрабатываем в рабочее время. Обычно до 1 часа.<br />В редких случаях до 24 ч — напишем если задержимся.
            </div>

            <button onClick={onClose} style={{ width: "100%", padding: 12, borderRadius: 10, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)", cursor: "pointer", fontSize: 13 }}>
              Закрыть
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── ADMIN PANEL ──────────────────────────────────────────────
function AdminPanel({ orders, onUpdateStatus, onBack }) {
  const [password, setPassword] = useState("");
  const [auth, setAuth] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");

  if (!auth) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#080810" }}>
      <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, padding: 32, width: 340 }}>
        <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 22, marginBottom: 6 }}>🔐 Админка</div>
        <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, marginBottom: 20 }}>Введите пароль для входа</div>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === "Enter" && password === ADMIN_PASSWORD && setAuth(true)}
          placeholder="Пароль" style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "12px 14px", color: "white", fontSize: 14, outline: "none", marginBottom: 12, boxSizing: "border-box" }} />
        <button onClick={() => password === ADMIN_PASSWORD ? setAuth(true) : alert("Неверный пароль")}
          style={{ width: "100%", padding: 12, borderRadius: 10, background: "linear-gradient(135deg,#f59e0b,#fbbf24)", border: "none", color: "#080810", fontWeight: 800, fontSize: 14, cursor: "pointer" }}>
          Войти
        </button>
        <button onClick={onBack} style={{ width: "100%", padding: 10, borderRadius: 10, background: "transparent", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", fontSize: 13, marginTop: 8 }}>
          ← Назад на сайт
        </button>
      </div>
    </div>
  );

  const filtered = filterStatus === "all" ? orders : orders.filter(o => o.status === filterStatus);

  return (
    <div style={{ background: "#080810", minHeight: "100vh", padding: "24px 20px", maxWidth: 900, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 24 }}>📋 Заявки</div>
          <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 13 }}>Всего: {orders.length}</div>
        </div>
        <button onClick={onBack} style={{ padding: "8px 18px", borderRadius: 100, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)", cursor: "pointer", fontSize: 13 }}>← На сайт</button>
      </div>

      {/* Фильтр по статусу */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
        {[["all", "Все"], ...Object.entries(STATUS_LABELS)].map(([key, label]) => (
          <button key={key} onClick={() => setFilterStatus(key)} style={{
            padding: "6px 14px", borderRadius: 100, fontSize: 12, fontWeight: 600, cursor: "pointer",
            background: filterStatus === key ? "rgba(251,191,36,0.15)" : "rgba(255,255,255,0.04)",
            border: `1px solid ${filterStatus === key ? "rgba(251,191,36,0.4)" : "rgba(255,255,255,0.08)"}`,
            color: filterStatus === key ? "#fbbf24" : "rgba(255,255,255,0.4)",
          }}>{label} {key === "all" ? `(${orders.length})` : `(${orders.filter(o => o.status === key).length})`}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "rgba(255,255,255,0.25)" }}>
          {orders.length === 0 ? "Заявок пока нет" : "Нет заявок с таким статусом"}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[...filtered].reverse().map(order => (
            <div key={order.id} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                    <span style={{ color: "#fbbf24", fontWeight: 800, fontSize: 15 }}>{order.id}</span>
                    <span style={{ background: STATUS_COLORS[order.status] + "22", border: `1px solid ${STATUS_COLORS[order.status]}66`, color: STATUS_COLORS[order.status], fontSize: 11, padding: "2px 10px", borderRadius: 100, fontWeight: 600 }}>
                      {STATUS_LABELS[order.status]}
                    </span>
                  </div>
                  <div style={{ color: "white", fontWeight: 600, fontSize: 14 }}>{order.service} · {order.tier}</div>
                  <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, marginTop: 3 }}>
                    {order.method === "login" && `🔐 Логин: ${order.login}`}
                    {order.method === "gift" && `🎁 Gift → ${order.email}`}
                    {order.method === "family" && `👨‍👩‍👧 Family → ${order.email}`}
                    {order.method === "newAcc" && `✨ Новый аккаунт`}
                  </div>
                  <div style={{ color: "rgba(255,255,255,0.25)", fontSize: 11, marginTop: 3 }}>
                    {new Date(order.createdAt).toLocaleString("ru-RU")}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ color: "#fbbf24", fontWeight: 800, fontSize: 18 }}>{order.priceRub.toLocaleString()} ₽</div>
                  <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 12 }}>${order.priceUsd}</div>
                </div>
              </div>

              {/* Смена статуса */}
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 14, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                {Object.entries(STATUS_LABELS).map(([key, label]) => (
                  <button key={key} onClick={() => onUpdateStatus(order.id, key)} style={{
                    padding: "5px 12px", borderRadius: 100, fontSize: 11, fontWeight: 600, cursor: "pointer",
                    background: order.status === key ? STATUS_COLORS[key] + "22" : "rgba(255,255,255,0.04)",
                    border: `1px solid ${order.status === key ? STATUS_COLORS[key] + "66" : "rgba(255,255,255,0.08)"}`,
                    color: order.status === key ? STATUS_COLORS[key] : "rgba(255,255,255,0.35)",
                  }}>{label}</button>
                ))}
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
  const [page, setPage] = useState("home");
  const [category, setCategory] = useState("Все");
  const [search, setSearch] = useState("");
  const [selectedService, setSelectedService] = useState(null);
  const [usdAmount, setUsdAmount] = useState(20);
  const [scrolled, setScrolled] = useState(false);
  const [rate, setRate] = useState(null);
  const [rateLoading, setRateLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const howRef = useRef(null);

  // Загружаем курс ЦБ через API
  useEffect(() => {
    async function fetchRate() {
      try {
        const res = await fetch("https://open.er-api.com/v6/latest/USD");
        const data = await res.json();
        if (data?.rates?.RUB) { setRate(data.rates.RUB); }
        else { setRate(84.0); }
      } catch { setRate(84.0); }
      finally { setRateLoading(false); }
    }
    fetchRate();
  }, []);

  // Загружаем заявки из storage
  useEffect(() => {
    async function loadOrders() {
      try {
        const result = await window.storage.get("orders");
        if (result?.value) setOrders(JSON.parse(result.value));
      } catch { setOrders([]); }
    }
    loadOrders();
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

  if (page === "admin") return <AdminPanel orders={orders} onUpdateStatus={updateStatus} onBack={() => setPage("home")} />;

  const finalRate = rate ? rate * (1 + MARGIN) : null;

  return (
    <div style={{ background: "#080810", minHeight: "100vh", fontFamily: "'DM Sans',sans-serif", color: "white" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:6px} ::-webkit-scrollbar-track{background:#0f0f14} ::-webkit-scrollbar-thumb{background:rgba(251,191,36,0.3);border-radius:3px}
        input::placeholder{color:rgba(255,255,255,0.25)}
        @keyframes pulse{0%,100%{opacity:.5}50%{opacity:1}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:none}}
        .fu1{animation:fadeUp .6s ease forwards} .fu2{animation:fadeUp .6s .12s ease forwards;opacity:0} .fu3{animation:fadeUp .6s .24s ease forwards;opacity:0}
      `}</style>

      {/* NAV */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, padding: "0 28px", height: 58, display: "flex", alignItems: "center", justifyContent: "space-between", background: scrolled ? "rgba(8,8,16,0.96)" : "transparent", backdropFilter: scrolled ? "blur(14px)" : "none", borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "none", transition: "all .3s" }}>
        <div onClick={() => setPage("home")} style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 18, cursor: "pointer", letterSpacing: -0.5 }}>
          pay<span style={{ color: "#fbbf24" }}>flow</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {[["home","Главная"],["catalog","Каталог"]].map(([p,label]) => (
            <button key={p} onClick={() => setPage(p)} style={{ padding: "7px 16px", borderRadius: 100, fontSize: 13, fontWeight: 600, cursor: "pointer", background: page===p ? "rgba(251,191,36,0.12)" : "transparent", border: `1px solid ${page===p ? "rgba(251,191,36,0.35)" : "transparent"}`, color: page===p ? "#fbbf24" : "rgba(255,255,255,0.45)", transition: "all .2s" }}>{label}</button>
          ))}
          <button onClick={() => setPage("admin")} style={{ padding: "7px 14px", borderRadius: 100, fontSize: 13, cursor: "pointer", background: "transparent", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.25)", transition: "all .2s" }}>⚙️</button>
        </div>
      </nav>

      {page === "home" && (
        <div>
          {/* HERO */}
          <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "80px 24px 40px", background: "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(251,191,36,0.07) 0%, transparent 70%)" }}>
            <div className="fu1" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 100, padding: "7px 16px", marginBottom: 28, fontSize: 12 }}>
              {rateLoading ? (
                <span style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.2)", borderTopColor: "#fbbf24", borderRadius: "50%", display: "inline-block", animation: "spin 0.8s linear infinite" }} />
              ) : (
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", display: "inline-block", animation: "pulse 2s infinite" }} />
              )}
              <span style={{ color: "rgba(255,255,255,0.5)" }}>Курс ЦБ сейчас:</span>
              <span style={{ color: "#fbbf24", fontWeight: 700 }}>{rateLoading ? "загрузка..." : `1$ = ${rate?.toFixed(2)} ₽`}</span>
            </div>

            <h1 className="fu2" style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "clamp(34px,6.5vw,68px)", lineHeight: 1.06, letterSpacing: -2, marginBottom: 18 }}>
              Оплати любой<br /><span style={{ color: "#fbbf24" }}>зарубежный сервис</span><br />за рубли
            </h1>
            <p className="fu3" style={{ color: "rgba(255,255,255,0.4)", fontSize: 16, maxWidth: 460, marginBottom: 10, lineHeight: 1.6 }}>ChatGPT, Midjourney, Netflix, Spotify и ещё 47 сервисов.</p>
            <p className="fu3" style={{ color: "rgba(251,191,36,0.65)", fontSize: 14, maxWidth: 400, marginBottom: 34, lineHeight: 1.5 }}>Минимальная комиссия — без скрытых платежей и процентов.</p>

            <div className="fu3" style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
              <button onClick={() => setPage("catalog")} style={{ padding: "15px 30px", borderRadius: 14, background: "linear-gradient(135deg,#f59e0b,#fbbf24)", border: "none", color: "#080810", fontWeight: 800, fontSize: 15, cursor: "pointer" }}>Смотреть сервисы →</button>
              <button onClick={() => howRef.current?.scrollIntoView({ behavior: "smooth" })} style={{ padding: "15px 30px", borderRadius: 14, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.65)", fontWeight: 600, fontSize: 15, cursor: "pointer" }}>Как это работает?</button>
            </div>

            <div className="fu3" style={{ display: "flex", gap: 28, marginTop: 52, flexWrap: "wrap", justifyContent: "center" }}>
              {[["50+","сервисов"],["7%","комиссия"],["без скрытых","доплат"]].map(([v,l]) => (
                <div key={l} style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 24, fontWeight: 800, color: "#fbbf24" }}>{v}</div>
                  <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 12 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* CALCULATOR */}
          <div style={{ padding: "70px 24px", maxWidth: 540, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <div style={{ color: "#fbbf24", fontSize: 11, textTransform: "uppercase", letterSpacing: 2, marginBottom: 8 }}>Калькулятор</div>
              <h2 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 26 }}>Сколько это стоит в рублях?</h2>
            </div>
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: 26 }}>
              <label style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, marginBottom: 8, display: "block" }}>Сумма в долларах</label>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 20 }}>$</span>
                <input type="number" value={usdAmount} onChange={e => setUsdAmount(Number(e.target.value))} style={{ flex: 1, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, padding: "13px 16px", color: "white", fontSize: 22, fontWeight: 700, outline: "none" }} />
              </div>
              <input type="range" min={1} max={200} value={usdAmount} onChange={e => setUsdAmount(Number(e.target.value))} style={{ width: "100%", marginTop: 12, marginBottom: 18, accentColor: "#fbbf24" }} />

              <div style={{ background: "rgba(251,191,36,0.07)", border: "1px solid rgba(251,191,36,0.2)", borderRadius: 14, padding: "16px 20px" }}>
                {rateLoading ? (
                  <div style={{ textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 13, padding: "10px 0" }}>Загружаем актуальный курс ЦБ...</div>
                ) : (
                  <>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                      <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>Курс ЦБ</span>
                      <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>1$ = {rate?.toFixed(2)} ₽</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                      <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>Базовая сумма</span>
                      <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>{Math.ceil(usdAmount * rate).toLocaleString()} ₽</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                      <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>Наша комиссия 7%</span>
                      <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>+ {Math.ceil(usdAmount * rate * MARGIN).toLocaleString()} ₽</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 12 }}>
                      <span style={{ color: "white", fontWeight: 700, fontSize: 15 }}>Итого к оплате</span>
                      <span style={{ color: "#fbbf24", fontWeight: 800, fontSize: 26 }}>{calcPrice(usdAmount, rate).toLocaleString()} ₽</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* HOW IT WORKS */}
          <div ref={howRef} style={{ padding: "60px 24px 100px", maxWidth: 840, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 44 }}>
              <div style={{ color: "#fbbf24", fontSize: 11, textTransform: "uppercase", letterSpacing: 2, marginBottom: 8 }}>Процесс</div>
              <h2 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 28 }}>Как это работает</h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 14 }}>
              {[
                { n:"01", title:"Выбираешь сервис", desc:"Находишь нужный сервис и тариф в каталоге. Цена в рублях видна сразу — без сюрпризов." },
                { n:"02", title:"Оформляешь заявку", desc:"Выбираешь способ: логин/пароль, Gift-карта, Family/Team план или новый аккаунт от нас. Получаешь номер заявки." },
                { n:"03", title:"Переводишь рубли", desc:"Переводишь по СБП или номеру карты. В комментарии укажи номер заявки. Загружаешь чек — это ускоряет обработку." },
                { n:"04", title:"Получаешь доступ", desc:"Активируем в рабочее время — обычно в течение часа. В редких случаях до 24 ч. Напишем если задержимся." },
              ].map(s => (
                <div key={s.n} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "22px 18px" }}>
                  <div style={{ fontFamily: "'Syne',sans-serif", color: "rgba(251,191,36,0.35)", fontSize: 26, fontWeight: 800, marginBottom: 12 }}>{s.n}</div>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>{s.title}</div>
                  <div style={{ color: "rgba(255,255,255,0.38)", fontSize: 12, lineHeight: 1.6 }}>{s.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CATALOG */}
      {page === "catalog" && (
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "78px 20px 60px" }}>
          <div style={{ marginBottom: 28 }}>
            <div style={{ color: "#fbbf24", fontSize: 11, textTransform: "uppercase", letterSpacing: 2, marginBottom: 8 }}>Каталог</div>
            <h2 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 30, marginBottom: 4 }}>Все сервисы</h2>
            <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 13 }}>
              {SERVICES.length} сервисов · Курс ЦБ: {rateLoading ? "загрузка..." : `1$ = ${rate?.toFixed(2)} ₽`} · <span style={{ color: "rgba(255,255,255,0.22)" }}>цены в карточках с комиссией 7%</span>
            </div>
          </div>

          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍  Поиск сервиса..." style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "13px 16px", color: "white", fontSize: 14, outline: "none", marginBottom: 14 }} />

          <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 24 }}>
            {CATEGORIES.map(c => {
              const cnt = SERVICES.filter(s => c==="Все" || s.category===c).length;
              return <button key={c} onClick={() => setCategory(c)} style={{ padding: "7px 14px", borderRadius: 100, fontSize: 12, fontWeight: 600, cursor: "pointer", background: category===c ? "rgba(251,191,36,0.12)" : "rgba(255,255,255,0.04)", border: `1px solid ${category===c ? "rgba(251,191,36,0.45)" : "rgba(255,255,255,0.08)"}`, color: category===c ? "#fbbf24" : "rgba(255,255,255,0.45)", transition: "all .15s" }}>
                {c} <span style={{ opacity: 0.55 }}>({cnt})</span>
              </button>;
            })}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 12 }}>
            {filtered.map(s => <ServiceCard key={s.id} service={s} rate={rate} onSelect={setSelectedService} />)}
          </div>
          {filtered.length === 0 && <div style={{ textAlign: "center", padding: "60px 0", color: "rgba(255,255,255,0.25)" }}>Ничего не найдено</div>}
        </div>
      )}

      {selectedService && <OrderModal service={selectedService} rate={rate} onClose={() => setSelectedService(null)} onSaveOrder={saveOrder} />}

      <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", padding: "22px 28px", textAlign: "center", color: "rgba(255,255,255,0.18)", fontSize: 12 }}>
        payflow · Оплата зарубежных сервисов · 2026
      </div>
    </div>
  );
}
