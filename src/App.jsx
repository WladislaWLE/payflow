import LegalPage from "./pages/LegalPage";
import { useState, useEffect, useRef, useCallback } from "react";
import { supabase, auth as sbAuth, profiles, orders as sbOrders, notifications as sbNotifs, storage as sbStorage } from "./lib/supabase";

// ══════════════════════════════════════════════════════════════
//  ПРОМОКОДЫ — helper
// ══════════════════════════════════════════════════════════════
async function checkPromocode(code) {
  const { data, error } = await supabase.rpc("apply_promocode", { promo_code_text: code });
  if (error) return { ok: false, error: error.message };
  return data;
}

// ── Настройки (ручной курс) ──────────────────────────────────
async function getSetting(key) {
  const { data } = await supabase.from("settings").select("value").eq("key", key).single();
  return data?.value ?? null;
}
async function setSetting(key, value) {
  await supabase.from("settings").upsert({ key, value, updated_at: new Date().toISOString() });
}

async function getPromocodes() {
  const { data } = await supabase.from("promocodes").select("*").order("created_at", { ascending: false });
  return data || [];
}

async function savePromocode(promo) {
  if (promo.id) {
    const { error } = await supabase.from("promocodes").update(promo).eq("id", promo.id);
    return { error };
  } else {
    const { error } = await supabase.from("promocodes").insert({ ...promo, code: promo.code.toUpperCase() });
    return { error };
  }
}

async function deletePromocode(id) {
  const { error } = await supabase.from("promocodes").delete().eq("id", id);
  return { error };
}

function calcDiscount(total, promo) {
  if (!promo) return 0;
  if (promo.type === "percent") return Math.round(total * promo.value / 100);
  if (promo.type === "fixed")   return Math.min(promo.value, total);
  if (promo.type === "free")    return Math.round(total * 0.10); // убираем нашу комиссию
  return 0;
}


// ─── SVG ICONS (no emoji for structural UI per no-emoji-icons rule) ────────
const IconHome = ({size=18,color="currentColor"}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const IconGrid = ({size=18,color="currentColor"}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>;
const IconBell = ({size=18,color="currentColor"}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>;
const IconUser = ({size=18,color="currentColor"}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 1 0-16 0"/></svg>;
const IconLogout = ({size=16,color="currentColor"}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
const IconSun = ({size=17,color="currentColor"}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>;
const IconMoon = ({size=17,color="currentColor"}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>;
const IconSettings = ({size=17,color="currentColor"}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>;
const IconCheck = ({size=16,color="currentColor"}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const IconX = ({size=16,color="currentColor"}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IconChevronDown = ({size=14,color="currentColor"}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>;
const IconSearch = ({size=16,color="currentColor"}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const IconDownload = ({size=16,color="currentColor"}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;

// ══════════════════════════════════════════════════════════════
//  КОНФИГ
// ══════════════════════════════════════════════════════════════
const CFG = {
  MARGIN:       0.10,
  ADMIN_EMAIL:  "admin@payflow.ru",   // ← замени на свой email
  REQUISITES: [
    { label:"Тинькофф", sbp:"+7 (900) 000-00-00", card:"2200 0000 0000 0001", holder:"Иван И." },
    { label:"Сбербанк",  sbp:"+7 (900) 000-00-01", card:"2202 0000 0000 0002", holder:"Иван И." },
    { label:"ВТБ",       sbp:"+7 (900) 000-00-02", card:"2200 0000 0000 0003", holder:"Иван И." },
  ],
};

// ══════════════════════════════════════════════════════════════
//  УТИЛИТЫ
// ══════════════════════════════════════════════════════════════
const calc    = (usd, r) => Math.round(usd * r * (1 + CFG.MARGIN));
const ruDate  = () => new Date().toLocaleString("ru-RU", { timeZone: "Europe/Moscow" });
const randId  = () => "#" + Math.floor(10000 + Math.random() * 90000);
const randReq = () => CFG.REQUISITES[Math.floor(Math.random() * CFG.REQUISITES.length)];

// Hash router
function useHash() {
  const [hash, setHash] = useState(() => window.location.hash || "#home");
  useEffect(() => {
    const fn = () => setHash(window.location.hash || "#home");
    window.addEventListener("hashchange", fn);
    return () => window.removeEventListener("hashchange", fn);
  }, []);
  const go = useCallback((h) => { window.location.hash = h; }, []);
  return [hash, go];
}

// ══════════════════════════════════════════════════════════════
//  СЕРВИСЫ
// ══════════════════════════════════════════════════════════════
const SVC = [
  {id:1,  name:"ChatGPT Plus",          cat:"AI",            icon:"🤖", tiers:[{n:"Plus",p:20},{n:"Team",p:25},{n:"Pro",p:200}],        login:true, gift:false,family:true, newAcc:true},
  {id:2,  name:"Claude Pro",            cat:"AI",            icon:"🧠", tiers:[{n:"Pro",p:20},{n:"Team",p:30}],                         login:true, gift:false,family:true, newAcc:true},
  {id:3,  name:"Perplexity Pro",        cat:"AI",            icon:"🔍", tiers:[{n:"Pro",p:20}],                                         login:true, gift:false,family:false,newAcc:true},
  {id:4,  name:"Grok Premium",          cat:"AI",            icon:"🐦", tiers:[{n:"Premium",p:8},{n:"Premium+",p:16}],                  login:true, gift:false,family:false,newAcc:false},
  {id:5,  name:"Gemini Advanced",       cat:"AI",            icon:"💎", tiers:[{n:"Google One",p:19.99}],                              login:true, gift:true, family:true, newAcc:false},
  {id:6,  name:"Midjourney",            cat:"AI",            icon:"🎨", tiers:[{n:"Basic",p:10},{n:"Standard",p:30},{n:"Pro",p:60},{n:"Mega",p:120}],login:true,gift:false,family:false,newAcc:true},
  {id:7,  name:"Leonardo AI",           cat:"AI",            icon:"🖼️", tiers:[{n:"Apprentice",p:10},{n:"Artisan",p:24},{n:"Maestro",p:48}],login:true,gift:false,family:false,newAcc:true},
  {id:8,  name:"Runway ML",             cat:"AI",            icon:"🎬", tiers:[{n:"Standard",p:15},{n:"Pro",p:35},{n:"Unlimited",p:95}], login:true,gift:false,family:false,newAcc:true},
  {id:9,  name:"ElevenLabs",            cat:"AI",            icon:"🎙️", tiers:[{n:"Starter",p:5},{n:"Creator",p:22},{n:"Pro",p:99}],    login:true,gift:false,family:false,newAcc:true},
  {id:10, name:"Kling AI",              cat:"AI",            icon:"🎥", tiers:[{n:"Starter",p:8},{n:"Pro",p:35},{n:"Premier",p:88}],   login:true,gift:false,family:false,newAcc:true},
  {id:11, name:"Cursor Pro",            cat:"Разработка",    icon:"💻", tiers:[{n:"Pro",p:20},{n:"Ultra",p:200}],                       login:true,gift:false,family:false,newAcc:true},
  {id:12, name:"GitHub Copilot",        cat:"Разработка",    icon:"⚡", tiers:[{n:"Pro",p:10},{n:"Pro+",p:39}],                         login:true,gift:false,family:false,newAcc:false},
  {id:13, name:"Windsurf",              cat:"Разработка",    icon:"🏄", tiers:[{n:"Pro",p:15},{n:"Teams",p:30}],                        login:true,gift:false,family:false,newAcc:true},
  {id:14, name:"Replit Core",           cat:"Разработка",    icon:"🔧", tiers:[{n:"Core",p:20}],                                        login:true,gift:false,family:false,newAcc:true},
  {id:15, name:"Vercel Pro",            cat:"Разработка",    icon:"▲",  tiers:[{n:"Pro",p:20}],                                         login:true,gift:false,family:false,newAcc:false},
  {id:16, name:"Linear",               cat:"Разработка",    icon:"📐", tiers:[{n:"Plus",p:8},{n:"Business",p:14}],                    login:true,gift:false,family:false,newAcc:false},
  {id:17, name:"Figma",                cat:"Дизайн",         icon:"✏️", tiers:[{n:"Professional",p:15},{n:"Organization",p:45}],        login:true,gift:false,family:false,newAcc:false},
  {id:18, name:"Canva Pro",            cat:"Дизайн",         icon:"🖌️", tiers:[{n:"Pro",p:14.99},{n:"Teams",p:29.99}],                  login:true,gift:true, family:true, newAcc:false},
  {id:19, name:"Adobe Creative Cloud", cat:"Дизайн",         icon:"🅰️", tiers:[{n:"Photography",p:19.99},{n:"All Apps",p:54.99}],      login:true,gift:true, family:false,newAcc:false},
  {id:20, name:"Adobe Firefly",        cat:"Дизайн",         icon:"🔥", tiers:[{n:"Firefly",p:9.99},{n:"All Apps",p:54.99}],           login:true,gift:true, family:false,newAcc:false},
  {id:21, name:"Notion",              cat:"Продуктивность",  icon:"📝", tiers:[{n:"Plus",p:10},{n:"Business",p:15}],                  login:true,gift:false,family:false,newAcc:false},
  {id:22, name:"Grammarly",           cat:"Продуктивность",  icon:"📖", tiers:[{n:"Premium",p:30},{n:"Business",p:25}],               login:true,gift:true, family:false,newAcc:false},
  {id:23, name:"Dropbox Plus",        cat:"Продуктивность",  icon:"📦", tiers:[{n:"Plus",p:11.99},{n:"Professional",p:19.99}],        login:true,gift:false,family:false,newAcc:false},
  {id:24, name:"Loom",               cat:"Продуктивность",  icon:"📹", tiers:[{n:"Starter",p:12.5},{n:"Business+",p:16}],            login:true,gift:false,family:false,newAcc:false},
  {id:25, name:"Obsidian Sync",       cat:"Продуктивность",  icon:"🔮", tiers:[{n:"Sync",p:10},{n:"Sync+Publish",p:20}],              login:true,gift:false,family:false,newAcc:false},
  {id:26, name:"Netflix",            cat:"Стриминг",         icon:"🎬", tiers:[{n:"Standard",p:15.49},{n:"Premium",p:22.99}],          login:true,gift:true, family:true, newAcc:false},
  {id:27, name:"YouTube Premium",    cat:"Стриминг",         icon:"▶️", tiers:[{n:"Individual",p:13.99},{n:"Family",p:22.99}],         login:true,gift:true, family:true, newAcc:false},
  {id:28, name:"Disney+",            cat:"Стриминг",         icon:"🏰", tiers:[{n:"Basic",p:7.99},{n:"Premium",p:13.99}],              login:true,gift:true, family:false,newAcc:false},
  {id:29, name:"Apple TV+",          cat:"Стриминг",         icon:"🍎", tiers:[{n:"Individual",p:9.99}],                               login:true,gift:true, family:true, newAcc:false},
  {id:30, name:"HBO Max",            cat:"Стриминг",         icon:"📺", tiers:[{n:"With Ads",p:9.99},{n:"Ad-Free",p:15.99},{n:"Ultimate",p:19.99}],login:true,gift:true,family:false,newAcc:false},
  {id:31, name:"Crunchyroll",        cat:"Стриминг",         icon:"⛩️", tiers:[{n:"Fan",p:7.99},{n:"Mega Fan",p:9.99},{n:"Ultimate Fan",p:14.99}], login:true,gift:true,family:false,newAcc:false},
  {id:32, name:"Spotify Premium",    cat:"Музыка",           icon:"🎵", tiers:[{n:"Individual",p:11.99},{n:"Duo",p:16.99},{n:"Family",p:19.99}], login:true,gift:true,family:true,newAcc:false},
  {id:33, name:"Apple Music",        cat:"Музыка",           icon:"🎶", tiers:[{n:"Individual",p:10.99},{n:"Family",p:16.99}],         login:true,gift:true, family:true, newAcc:false},
  {id:34, name:"Tidal",             cat:"Музыка",            icon:"🌊", tiers:[{n:"Individual",p:10.99},{n:"Family",p:17.99}],         login:true,gift:false,family:true, newAcc:false},
  {id:35, name:"Duolingo Super",    cat:"Обучение",           icon:"🦉", tiers:[{n:"Super",p:12.99},{n:"Family",p:119.99}],             login:true,gift:true, family:true, newAcc:false},
  {id:36, name:"Coursera Plus",     cat:"Обучение",           icon:"🎓", tiers:[{n:"Monthly",p:59},{n:"Annual",p:399}],                 login:true,gift:false,family:false,newAcc:false},
  {id:37, name:"MasterClass",       cat:"Обучение",           icon:"🏆", tiers:[{n:"Individual",p:10},{n:"Duo",p:15},{n:"Family",p:20}],login:true,gift:true, family:true, newAcc:false},
  {id:38, name:"Skillshare",        cat:"Обучение",           icon:"🎒", tiers:[{n:"Individual",p:32}],                                 login:true,gift:true, family:false,newAcc:false},
  {id:39, name:"Discord Nitro",     cat:"Инструменты",        icon:"💬", tiers:[{n:"Basic",p:2.99},{n:"Nitro",p:9.99}],                login:true,gift:true, family:false,newAcc:false},
  {id:40, name:"Telegram Premium",  cat:"Инструменты",        icon:"✈️", tiers:[{n:"Premium",p:4.99}],                                  login:true,gift:true, family:false,newAcc:false},
  {id:41, name:"NordVPN",           cat:"Инструменты",        icon:"🔒", tiers:[{n:"Basic 1м",p:12.99},{n:"Basic 1г",p:53.88}],         login:true,gift:false,family:false,newAcc:false},
  {id:42, name:"1Password",         cat:"Инструменты",        icon:"🔑", tiers:[{n:"Individual",p:2.99},{n:"Families",p:4.99}],         login:true,gift:false,family:true, newAcc:false},
  {id:43, name:"Setapp",            cat:"Инструменты",        icon:"📱", tiers:[{n:"Individual",p:9.99},{n:"Family",p:14.99}],          login:true,gift:false,family:true, newAcc:false},
  {id:44, name:"Zoom Pro",          cat:"Инструменты",        icon:"📞", tiers:[{n:"Pro",p:15.99},{n:"Business",p:19.99}],              login:true,gift:false,family:false,newAcc:false},
  {id:45, name:"Xbox Game Pass",    cat:"Игры",               icon:"🎮", tiers:[{n:"Ultimate",p:19.99}],                                login:true,gift:true, family:false,newAcc:false},
  {id:46, name:"PlayStation Plus",  cat:"Игры",               icon:"🕹️", tiers:[{n:"Essential",p:9.99},{n:"Extra",p:14.99},{n:"Premium",p:17.99}],login:true,gift:true,family:false,newAcc:false},
  {id:47, name:"Steam (пополнение)",cat:"Игры",               icon:"🚂", tiers:[{n:"$20",p:20},{n:"$50",p:50},{n:"$100",p:100}],       login:false,gift:true,family:false,newAcc:false},
  {id:48, name:"ElevenLabs",        cat:"AI",                 icon:"🎙️", tiers:[{n:"Starter",p:5},{n:"Creator",p:22},{n:"Pro",p:99}],  login:true,gift:false,family:false,newAcc:true},
  {id:49, name:"Murf AI",           cat:"AI",                 icon:"🔊", tiers:[{n:"Creator",p:29},{n:"Business",p:99}],                login:true,gift:false,family:false,newAcc:true},
  {id:50, name:"Otter.ai",          cat:"Продуктивность",     icon:"🦦", tiers:[{n:"Pro",p:16.99},{n:"Business",p:30}],                login:true,gift:false,family:false,newAcc:true},
];

const CATS = ["Все","AI","Разработка","Дизайн","Стриминг","Музыка","Продуктивность","Инструменты","Обучение","Игры"];
const SL = {new:"Новая",paid:"Оплачена",processing:"В обработке",done:"Выполнена",cancelled:"Отменена"};
const SC = {new:"#fbbf24",paid:"#60a5fa",processing:"#a78bfa",done:"#34d399",cancelled:"#f87171"};
const SE = {new:"⏳",paid:"💳",processing:"🔧",done:"✅",cancelled:"❌"};
const POPULAR_NAMES = ["ChatGPT Plus","Midjourney","Netflix","Spotify Premium","Cursor Pro","Claude Pro"];

// ══════════════════════════════════════════════════════════════
//  THEME
// ══════════════════════════════════════════════════════════════
function useTheme() {
  const [dark, setDark] = useState(() => {
    const s = localStorage.getItem("pf_theme");
    if (s) return s === "dark";
    try { return window.matchMedia("(prefers-color-scheme: dark)").matches; } catch { return true; }
  });
  const toggle = () => setDark(d => { localStorage.setItem("pf_theme", !d ? "dark" : "light"); return !d; });
  const t = {
    dark,
    bg:     dark ? "#07070f"               : "#ebebf0",
    card:   dark ? "rgba(255,255,255,0.04)": "rgba(255,255,255,0.85)",
    card2:  dark ? "rgba(255,255,255,0.07)": "#ffffff",
    border: dark ? "rgba(255,255,255,0.09)": "rgba(0,0,0,0.1)",
    borderH:dark ? "rgba(251,191,36,0.55)" : "rgba(217,119,6,0.6)",
    text:   dark ? "#ffffff"               : "#111118",
    sub:    dark ? "rgba(255,255,255,0.52)": "rgba(0,0,0,0.55)",
    muted:  dark ? "rgba(255,255,255,0.26)": "rgba(0,0,0,0.35)",
    nav:    dark ? "rgba(7,7,15,0.93)"     : "rgba(235,235,240,0.93)",
    inp:    dark ? "rgba(255,255,255,0.07)": "rgba(0,0,0,0.06)",
    gold:   "#fbbf24", goldD:"#f59e0b",
    goldDim:dark ? "rgba(251,191,36,0.1)"  : "rgba(217,119,6,0.09)",
    goldB:  dark ? "rgba(251,191,36,0.35)" : "rgba(217,119,6,0.4)",
    shadow: dark ? "0 8px 32px rgba(0,0,0,0.5)" : "0 4px 24px rgba(0,0,0,0.1)",
    shadowG:"0 6px 28px rgba(251,191,36,0.3)",
  };
  return { t, toggle };
}

// ══════════════════════════════════════════════════════════════
//  UI PRIMITIVES
// ══════════════════════════════════════════════════════════════
// ─── SKELETON LOADER (progressive loading per UX skill) ─────────
function Skeleton({ width="100%", height=16, radius=8, style={} }) {
  return <div style={{ width, height, borderRadius:radius, background:"linear-gradient(90deg,rgba(255,255,255,0.05) 25%,rgba(255,255,255,0.1) 50%,rgba(255,255,255,0.05) 75%)", backgroundSize:"200% 100%", animation:"shimmer 1.5s infinite", ...style }}/>;
}

function OrderSkeleton({ t }) {
  return (
    <div style={{ background:t.card2, border:`1px solid ${t.border}`, borderRadius:16, padding:18 }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
        <div style={{ display:"flex", gap:10, alignItems:"center" }}>
          <Skeleton width={60} height={20} radius={100}/>
          <Skeleton width={80} height={20} radius={100}/>
        </div>
        <Skeleton width={80} height={24} radius={8}/>
      </div>
      <Skeleton width="60%" height={16} radius={6} style={{ marginBottom:8 }}/>
      <Skeleton width="40%" height={12} radius={6}/>
    </div>
  );
}

function StatusBadge({ status, size=12 }) {
  return <span style={{ background:SC[status]+"22", border:`1px solid ${SC[status]}55`, color:SC[status], fontSize:size, padding:"4px 12px", borderRadius:100, fontWeight:700, whiteSpace:"nowrap" }}>{SE[status]} {SL[status]}</span>;
}

function FieldLabel({ children, t }) {
  return <div style={{ color:t.muted, fontSize:11, marginBottom:8, textTransform:"uppercase", letterSpacing:1, fontWeight:600 }}>{children}</div>;
}

function Alert({ type="info", children, t }) {
  const cfg = {
    error:   ["rgba(248,113,113,0.1)","rgba(248,113,113,0.3)","#f87171"],
    success: ["rgba(52,211,153,0.1)", "rgba(52,211,153,0.3)", "#6ee7b7"],
    info:    ["rgba(96,165,250,0.1)", "rgba(96,165,250,0.3)", "#93c5fd"],
  }[type];
  return <div style={{ background:cfg[0], border:`1px solid ${cfg[1]}`, color:cfg[2], borderRadius:10, padding:"10px 14px", fontSize:13, marginBottom:12, lineHeight:1.6 }}>{children}</div>;
}

function Badge({ active, color, children }) {
  const p = {
    blue:  ["rgba(96,165,250,0.15)","rgba(96,165,250,0.4)","#93c5fd"],
    green: ["rgba(52,211,153,0.15)","rgba(52,211,153,0.4)","#6ee7b7"],
    purple:["rgba(167,139,250,0.15)","rgba(167,139,250,0.4)","#c4b5fd"],
    yellow:["rgba(251,191,36,0.15)","rgba(251,191,36,0.4)","#fde68a"],
  }[color];
  return <span style={{ fontSize:10, padding:"2px 8px", borderRadius:100, fontWeight:600, whiteSpace:"nowrap", background:active?p[0]:"rgba(128,128,128,0.08)", border:`1px solid ${active?p[1]:"rgba(128,128,128,0.15)"}`, color:active?p[2]:"rgba(128,128,128,0.35)" }}>{children}</span>;
}

// ══════════════════════════════════════════════════════════════
//  HOOK: текущий пользователь + профиль
// ══════════════════════════════════════════════════════════════
function useUser() {
  const [session, setSession]   = useState(null);
  const [profile, setProfile]   = useState(null);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    // Получаем текущую сессию
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) loadProfile(session.user.id);
      else setLoading(false);
    });
    // Подписываемся на изменения
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) loadProfile(session.user.id);
      else { setProfile(null); setLoading(false); }
    });
    return () => subscription.unsubscribe();
  }, []);

  const loadProfile = async (userId) => {
    const { data } = await profiles.get(userId);
    setProfile(data);
    setLoading(false);
  };

  const isAdmin = profile?.is_admin || session?.user?.email === CFG.ADMIN_EMAIL;

  const register = async (name, email, password) => {
    const { data, error } = await sbAuth.signUp(email, password, name);
    if (error) return { error: error.message };
    return { ok: true };
  };

  const login = async (email, password) => {
    const { data, error } = await sbAuth.signIn(email, password);
    if (error) return { error: "Неверный email или пароль" };
    return { ok: true };
  };

  const logout = async () => { await sbAuth.signOut(); };

  return { session, profile, loading, isAdmin, register, login, logout };
}

// ══════════════════════════════════════════════════════════════
//  HOOK: публичная статистика
// ══════════════════════════════════════════════════════════════
function usePublicStats() {
  const [ordersCount, setOrdersCount] = useState(null);
  useEffect(() => {
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("status", "done")
      .then(({ count }) => setOrdersCount(count || 0));
  }, []);
  return { ordersCount };
}

// ══════════════════════════════════════════════════════════════
//  HOOK: уведомления
// ══════════════════════════════════════════════════════════════
function useNotifications(userId) {
  const [notifs, setNotifs] = useState([]);

  const load = async () => {
    if (!userId) return;
    const { data } = await sbNotifs.getByUser(userId);
    setNotifs(data || []);
  };

  useEffect(() => {
    load();
    if (!userId) return;
    // Realtime
    const channel = sbNotifs.subscribeByUser(userId, () => load());
    return () => supabase.removeChannel(channel);
  }, [userId]);

  const markRead = async () => {
    await sbNotifs.markRead(userId);
    setNotifs(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const unread = notifs.filter(n => !n.is_read).length;
  return { notifs, unread, markRead, reload: load };
}

// ══════════════════════════════════════════════════════════════
//  HOOK: заявки (для admin и cabinet)
// ══════════════════════════════════════════════════════════════
function useOrders(userId, isAdmin) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = isAdmin
      ? await sbOrders.getAll()
      : await sbOrders.getByUser(userId);
    setOrders(data || []);
    setLoading(false);
  };

  useEffect(() => {
    if (!userId && !isAdmin) return;
    load();
    // Realtime
    const channel = isAdmin
      ? sbOrders.subscribeAll(() => load())
      : sbOrders.subscribeToOrder("*", () => load());
    return () => supabase.removeChannel(channel);
  }, [userId, isAdmin]);

  const addOrder = async (order) => {
    const { data, error } = await sbOrders.insert(order);
    if (!error) setOrders(prev => [data, ...prev]);
    return { data, error };
  };

  const updateOrder = async (orderId, updates, notifText) => {
    const { data, error } = await sbOrders.update(orderId, updates);
    if (!error) {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...updates } : o));
      // Уведомление клиенту — только если явно передан текст
      if (notifText) {
        const order = orders.find(o => o.id === orderId);
        if (order?.user_id) {
          // Проверяем что такого уведомления ещё нет (защита от дублей)
          const { data: existing } = await supabase
            .from("notifications")
            .select("id")
            .eq("user_id", order.user_id)
            .eq("order_id", orderId)
            .eq("text", notifText)
            .gte("created_at", new Date(Date.now() - 5000).toISOString());
          if (!existing?.length) {
            await sbNotifs.insert({ user_id: order.user_id, order_id: orderId, text: notifText });
          }
        }
      }
    }
    return { data, error };
  };

  return { orders, loading, addOrder, updateOrder, reload: load };
}

// ══════════════════════════════════════════════════════════════
//  SERVICE CARD
// ══════════════════════════════════════════════════════════════
function SCard({ s, rate, onSelect, t }) {
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} onClick={()=>onSelect(s)}
      style={{ background:hov?t.card2:t.card, border:`1px solid ${hov?t.borderH:t.border}`, borderRadius:18, padding:20, cursor:"pointer", transition:"transform 200ms cubic-bezier(0,0,.2,1), box-shadow 200ms cubic-bezier(0,0,.2,1), border-color 200ms cubic-bezier(0,0,.2,1), background 200ms cubic-bezier(0,0,.2,1)", transform:hov?"translateY(-4px)":"none", boxShadow:hov?t.shadow:"none" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:26, transition:"filter .2s", filter:hov?"drop-shadow(0 0 8px rgba(251,191,36,0.5))":"none" }}>{s.icon}</span>
          <div>
            <div style={{ color:t.text, fontWeight:700, fontSize:14, fontFamily:"'Clash Display',sans-serif" }}>{s.name}</div>
            <div style={{ color:t.muted, fontSize:11, marginTop:1 }}>{s.cat}</div>
          </div>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:3, alignItems:"flex-end" }}>
          <Badge active={s.login}  color="blue">🔐 Лог/пас</Badge>
          <Badge active={s.gift}   color="green">🎁 Gift</Badge>
          <Badge active={s.family} color="purple">👨‍👩‍👧 Family</Badge>
          <Badge active={s.newAcc} color="yellow">✨ Новый акк</Badge>
        </div>
      </div>
      <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginTop:8 }}>
        {s.tiers.map((tier,i) => (
          <div key={i} style={{ background:t.goldDim, border:`1px solid ${t.goldB}`, borderRadius:9, padding:"5px 10px" }}>
            <div style={{ color:t.muted, fontSize:10 }}>{tier.n}</div>
            <div style={{ color:t.gold, fontWeight:700, fontSize:12 }}>
              ${tier.p} <span style={{ color:t.muted, fontWeight:400, fontSize:10 }}>≈ {rate ? calc(tier.p, rate).toLocaleString("ru-RU") : "..."}₽</span>
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop:3, textAlign:"right" }}><span style={{ fontSize:10, color:t.muted }}>* с комиссией {Math.round(CFG.MARGIN*100)}%</span></div>
      <div style={{ marginTop:10, padding:"8px 12px", borderRadius:9, fontSize:13, textAlign:"center", fontWeight:600, transition:"all .2s", background:hov?t.goldDim:"transparent", color:hov?t.gold:t.muted, border:`1px solid ${hov?t.goldB:"transparent"}` }}>
        {hov ? "→ Оформить заявку" : "Нажмите для заказа"}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  ORDER MODAL
// ══════════════════════════════════════════════════════════════
function OrderModal({ s, rate, user, profile, onClose, onSave, go, t }) {
  const [tier, setTier]     = useState(s.tiers[0]);
  const [method, setMethod] = useState(s.gift?"gift":s.newAcc?"newAcc":"login");
  const [loginV, setLoginV] = useState("");
  const [passV, setPassV]   = useState("");
  const [emailV, setEmailV] = useState(user?.email || "");
  const [step, setStep]     = useState(1);
  const [uploading, setUploading] = useState(false);
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [promoInput, setPromoInput] = useState("");
  const [promoResult, setPromoResult] = useState(null);
  const [promoError, setPromoError] = useState("");
  const [promoChecking, setPromoChecking] = useState(false);

  const fileRef = useRef();
  const req     = useRef(randReq()).current;
  const orderId = useRef(randId()).current;
  const base    = rate ? Math.round(tier.p * rate) : 0;
  const comm    = rate ? Math.round(tier.p * rate * CFG.MARGIN) : 0;
  const total   = base + comm;

  const methods = [];
  if(s.login)  methods.push({id:"login",  icon:"🔐", label:"Войти в аккаунт",   desc:"Укажите логин/пароль — зайдём и активируем"});
  if(s.gift)   methods.push({id:"gift",   icon:"🎁", label:"Gift-карта",         desc:"Без доступа к аккаунту — пришлём код"});
  if(s.family) methods.push({id:"family", icon:"👨‍👩‍👧", label:"Family/Team план",  desc:"Добавим по email — остаётесь в своём аккаунте"});
  if(s.newAcc) methods.push({id:"newAcc", icon:"✨", label:"Новый аккаунт",      desc:"Создадим и передадим готовые данные"});

  const inp = { width:"100%", background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:10, padding:"12px 14px", color:"white", fontSize:14, outline:"none", marginBottom:8, boxSizing:"border-box" };

  const handleFileSelect = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) { setError("Файл слишком большой. Максимум 5 МБ."); return; }
    setReceiptFile(f);
    if (f.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = ev => setReceiptPreview(ev.target.result);
      reader.readAsDataURL(f);
    } else { setReceiptPreview(null); }
    setError("");
  };

  const handleCreate = async () => {
    if (!user) { setError("Необходимо войти в аккаунт"); return; }
    setCreating(true); setError("");
    try {
      let receiptUrl = "";
      let receiptName = "";
      // Загружаем чек в Supabase Storage
      if (receiptFile) {
        setUploading(true);
        const path = await sbStorage.uploadReceipt(user.id, orderId, receiptFile);
        receiptUrl = path;
        receiptName = receiptFile.name;
        setUploading(false);
      }

      const discount = promoResult ? calcDiscount(total, promoResult) : 0;
      const finalTotal = Math.max(0, total - discount);
      const orderData = {
        id:               orderId,
        user_id:          user.id,
        user_name:        profile?.name || user.email,
        user_email:       user.email,
        service:          s.name,
        service_icon:     s.icon,
        tier:             tier.n,
        price_usd:        tier.p,
        price_rub:        finalTotal,
        promo_code:       promoResult ? promoInput : '',
        promo_discount:   discount,
        method,
        login_data:       method === "login" ? loginV : "",
        email_data:       (method === "gift" || method === "family") ? emailV : "",
        requisite_label:  req.label,
        requisite_sbp:    req.sbp,
        requisite_card:   req.card,
        requisite_holder: req.holder,
        status:           "new",
        operator_note:    "",
        receipt_url:      receiptUrl,
        receipt_name:     receiptName,
        cbr_rate:         rate,
      };

      const { error: saveErr } = await onSave(orderData);
      if (saveErr) { setError("Ошибка создания заявки: " + saveErr.message); setCreating(false); return; }
      setStep(2);
    } catch (e) {
      setError("Ошибка: " + e.message);
    } finally { setCreating(false); setUploading(false); }
  };

  return (
    <div style={{ position:"fixed",inset:0,zIndex:200,background:"rgba(0,0,0,0.8)",backdropFilter:"blur(16px)",display:"flex",alignItems:"center",justifyContent:"center",padding:20,overflowY:"auto" }} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} className="modal-inner" style={{ background:"#0e0e1a", border:"1px solid rgba(251,191,36,0.25)", borderRadius:22, width:"100%", maxWidth:500, padding:28, margin:"auto", boxShadow:"0 24px 80px rgba(0,0,0,0.6)" }}>

        {step === 1 && <>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:22 }}>
            <div>
              <div style={{ fontSize:20, fontFamily:"'Clash Display',sans-serif", fontWeight:800, color:"white" }}>{s.icon} {s.name}</div>
              <div style={{ color:"rgba(255,255,255,0.4)", fontSize:12, marginTop:2 }}>Оформление заявки</div>
            </div>
            <button onClick={onClose} style={{ color:"rgba(255,255,255,0.4)", fontSize:22, background:"none", border:"none", cursor:"pointer" }}>✕</button>
          </div>

          {!user && <Alert type="info" t={t}><strong>Войдите в аккаунт</strong> чтобы оформить заявку — так вы сможете отслеживать статус и получить уведомление с данными аккаунта.</Alert>}

          {/* Тариф */}
          <div style={{ marginBottom:18 }}>
            <FieldLabel t={{muted:"rgba(255,255,255,0.4)"}}>Тариф</FieldLabel>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              {s.tiers.map((ti,i) => <button key={i} onClick={()=>setTier(ti)} style={{ padding:"10px 14px", borderRadius:10, cursor:"pointer", background:tier.n===ti.n?"rgba(251,191,36,0.15)":"rgba(255,255,255,0.06)", border:`1px solid ${tier.n===ti.n?"#fbbf24":"rgba(255,255,255,0.1)"}`, color:tier.n===ti.n?"#fbbf24":"rgba(255,255,255,0.5)", fontWeight:600, fontSize:13, transition:"all .15s" }}>{ti.n} — ${ti.p}</button>)}
            </div>
          </div>

          {/* Способ */}
          <div style={{ marginBottom:18 }}>
            <FieldLabel t={{muted:"rgba(255,255,255,0.4)"}}>Способ активации</FieldLabel>
            {methods.map(m => <button key={m.id} onClick={()=>setMethod(m.id)} style={{ width:"100%", padding:"11px 14px", borderRadius:10, cursor:"pointer", textAlign:"left", background:method===m.id?"rgba(251,191,36,0.08)":"rgba(255,255,255,0.04)", border:`1px solid ${method===m.id?"rgba(251,191,36,0.4)":"rgba(255,255,255,0.08)"}`, marginBottom:7, transition:"all .15s" }}>
              <div style={{ color:"white", fontWeight:600, fontSize:13 }}>{m.icon} {m.label}</div>
              <div style={{ color:"rgba(255,255,255,0.4)", fontSize:11, marginTop:2 }}>{m.desc}</div>
            </button>)}
          </div>

          {/* Данные */}
          <div style={{ marginBottom:18 }}>
            <FieldLabel t={{muted:"rgba(255,255,255,0.4)"}}>Ваши данные</FieldLabel>
            {(method==="gift"||method==="family") && <input value={emailV} onChange={e=>setEmailV(e.target.value)} placeholder="Email аккаунта" style={inp}/>}
            {method==="login" && <>
              <input value={loginV} onChange={e=>setLoginV(e.target.value)} placeholder="Логин / Email" style={inp}/>
              <input value={passV} onChange={e=>setPassV(e.target.value)} placeholder="Пароль" type="password" style={inp}/>
              <div style={{ background:"rgba(251,191,36,0.08)", border:"1px solid rgba(251,191,36,0.25)", borderRadius:10, padding:"10px 14px", fontSize:12, color:"rgba(255,255,255,0.5)", lineHeight:1.6, marginBottom:8 }}>
                ⚠️ Если включена 2FA — будьте онлайн после оплаты. Мы свяжемся с вами через личный кабинет.
              </div>
            </>}
            {method==="newAcc" && <div style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, padding:14, fontSize:13, color:"rgba(255,255,255,0.5)", lineHeight:1.6 }}>✨ Создадим аккаунт и пришлём данные в ваш личный кабинет.</div>}
          </div>

          {/* Загрузка чека заранее (опционально) */}
          <div style={{ marginBottom:18 }}>
            <FieldLabel t={{muted:"rgba(255,255,255,0.4)"}}>Чек об оплате (можно загрузить после перевода)</FieldLabel>
            <input ref={fileRef} type="file" accept="image/*,.pdf" onChange={handleFileSelect} style={{ display:"none" }}/>
            <button onClick={()=>fileRef.current.click()} style={{ width:"100%", padding:12, borderRadius:10, cursor:"pointer", background:receiptFile?"rgba(52,211,153,0.12)":"rgba(255,255,255,0.05)", border:`1px dashed ${receiptFile?"rgba(52,211,153,0.4)":"rgba(255,255,255,0.2)"}`, color:receiptFile?"#6ee7b7":"rgba(255,255,255,0.45)", fontSize:13, fontWeight:500 }}>
              {receiptFile ? `✅ ${receiptFile.name}` : "📤 Загрузить чек (необязательно)"}
            </button>
            {receiptPreview && <img src={receiptPreview} alt="preview" style={{ width:"100%", maxHeight:200, objectFit:"contain", borderRadius:10, marginTop:8, border:"1px solid rgba(255,255,255,0.1)" }}/>}
          </div>

          {/* Итог */}
          <div style={{ background:"rgba(251,191,36,0.07)", border:"1px solid rgba(251,191,36,0.25)", borderRadius:14, padding:16, marginBottom:18 }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}><span style={{ color:"rgba(255,255,255,0.5)", fontSize:13 }}>Курс ЦБ</span><span style={{ color:"rgba(255,255,255,0.5)", fontSize:13 }}>1$ = {rate?.toFixed(2)} ₽</span></div>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}><span style={{ color:"rgba(255,255,255,0.5)", fontSize:13 }}>Комиссия {Math.round(CFG.MARGIN*100)}%</span><span style={{ color:"rgba(255,255,255,0.5)", fontSize:13 }}>+ {comm.toLocaleString("ru-RU")} ₽</span></div>
            <div style={{ display:"flex", justifyContent:"space-between", borderTop:"1px solid rgba(255,255,255,0.08)", paddingTop:12 }}><span style={{ color:"white", fontWeight:700, fontSize:15 }}>К оплате</span><span style={{ color:"#fbbf24", fontWeight:900, fontSize:26, fontFamily:"'Clash Display',sans-serif" }}>{total.toLocaleString("ru-RU")} ₽</span></div>
          </div>

          {/* Промокод */}
          <div style={{ marginBottom:14 }}>
            <div style={{ color:"rgba(255,255,255,0.4)", fontSize:11, marginBottom:8, textTransform:"uppercase", letterSpacing:1, fontWeight:600 }}>Промокод (необязательно)</div>
            <div style={{ display:"flex", gap:8 }}>
              <input value={promoInput} onChange={e=>{ setPromoInput(e.target.value.toUpperCase()); setPromoResult(null); setPromoError(""); }}
                placeholder="WELCOME10"
                style={{ flex:1, background:"rgba(255,255,255,0.07)", border:`1px solid ${promoResult?"rgba(52,211,153,0.5)":promoError?"rgba(248,113,113,0.5)":"rgba(255,255,255,0.12)"}`, borderRadius:10, padding:"11px 14px", color:"white", fontSize:14, outline:"none", textTransform:"uppercase", letterSpacing:2 }}/>
              <button onClick={async()=>{ if(!promoInput.trim()) return; setPromoChecking(true); setPromoError(""); const r=await checkPromocode(promoInput); setPromoChecking(false); if(r.ok){setPromoResult(r);}else{setPromoError(r.error||"Промокод недействителен");setPromoResult(null);} }}
                disabled={promoChecking || !promoInput.trim()}
                style={{ padding:"11px 16px", borderRadius:10, background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.15)", color:"rgba(255,255,255,0.7)", cursor:"pointer", fontSize:13, fontWeight:600, whiteSpace:"nowrap" }}>
                {promoChecking ? "..." : "Применить"}
              </button>
            </div>
            {promoResult && <div style={{ color:"#6ee7b7", fontSize:12, marginTop:5 }}>✅ Скидка: {promoResult.type==="percent"?promoResult.value+"%":promoResult.type==="fixed"?promoResult.value+"₽":"комиссия снята"}</div>}
            {promoError && <div style={{ color:"#f87171", fontSize:12, marginTop:5 }}>❌ {promoError}</div>}
          </div>

          {/* Итог с учётом промокода */}
          <div style={{ background:"rgba(251,191,36,0.07)", border:"1px solid rgba(251,191,36,0.25)", borderRadius:14, padding:16, marginBottom:14 }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}><span style={{ color:"rgba(255,255,255,0.5)", fontSize:13 }}>Курс ЦБ</span><span style={{ color:"rgba(255,255,255,0.5)", fontSize:13 }}>1$ = {rate?.toFixed(2)} ₽</span></div>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom: promoResult ? 8 : 10 }}><span style={{ color:"rgba(255,255,255,0.5)", fontSize:13 }}>Комиссия {Math.round(CFG.MARGIN*100)}%</span><span style={{ color:"rgba(255,255,255,0.5)", fontSize:13 }}>+ {comm.toLocaleString("ru-RU")} ₽</span></div>
            {promoResult && <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}><span style={{ color:"#6ee7b7", fontSize:13 }}>🎁 Скидка промокода</span><span style={{ color:"#6ee7b7", fontSize:13, fontWeight:600 }}>− {calcDiscount(total,promoResult).toLocaleString("ru-RU")} ₽</span></div>}
            <div style={{ display:"flex", justifyContent:"space-between", borderTop:"1px solid rgba(255,255,255,0.1)", paddingTop:12 }}>
              <span style={{ color:"white", fontWeight:700, fontSize:15 }}>К оплате</span>
              <span style={{ color:"#fbbf24", fontWeight:900, fontSize:26, fontFamily:"'Clash Display',sans-serif" }}>{Math.max(0, total - (promoResult ? calcDiscount(total,promoResult) : 0)).toLocaleString("ru-RU")} ₽</span>
            </div>
          </div>

          {error && <Alert type="error" t={t}>{error}</Alert>}

          <button onClick={handleCreate} disabled={creating || !user} style={{ width:"100%", padding:14, borderRadius:12, background: user ? "linear-gradient(135deg,#f59e0b,#fbbf24)" : "rgba(255,255,255,0.1)", border:"none", color: user ? "#0a0a14" : "rgba(255,255,255,0.3)", fontWeight:800, fontSize:15, cursor: user ? "pointer" : "not-allowed", boxShadow: user ? "0 4px 20px rgba(251,191,36,0.3)" : "none" }}>
            {uploading ? "Загружаем чек..." : creating ? "Создаём заявку..." : user ? "Создать заявку →" : "Войдите чтобы продолжить"}
          </button>
        </>}

        {step === 2 && <>
          <div style={{ textAlign:"center", marginBottom:22 }}>
            <div style={{ fontSize:52, marginBottom:12, animation:"bounceIn .4s cubic-bezier(0.175,0.885,0.32,1.275)" }}>✅</div>
            <div style={{ fontFamily:"'Clash Display',sans-serif", fontWeight:800, fontSize:22, color:"white", marginBottom:8 }}>Заявка создана!</div>
            <div style={{ background:"rgba(251,191,36,0.1)", border:"1px solid rgba(251,191,36,0.3)", borderRadius:12, padding:"10px 24px", display:"inline-block", color:"#fbbf24", fontWeight:800, fontSize:28 }}>{orderId}</div>
          </div>

          <div style={{ color:"rgba(255,255,255,0.55)", fontSize:14, marginBottom:20, textAlign:"center", lineHeight:1.7 }}>
            Переведите <strong style={{ color:"white", fontSize:16 }}>{total.toLocaleString("ru-RU")} ₽</strong><br/>
            и укажи номер заявки в комментарии к переводу
          </div>

          {/* Реквизиты */}
          <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:16, padding:20, marginBottom:16 }}>
            <div style={{ color:"rgba(255,255,255,0.3)", fontSize:10, marginBottom:12, textTransform:"uppercase", letterSpacing:1, fontWeight:600 }}>💳 Реквизиты · {req.label}</div>
            <div style={{ marginBottom:12 }}>
              <div style={{ color:"rgba(255,255,255,0.35)", fontSize:11, marginBottom:4 }}>По СБП</div>
              <div style={{ color:"white", fontWeight:700, fontSize:18 }}>{req.sbp}</div>
              <div style={{ color:"rgba(255,255,255,0.35)", fontSize:12 }}>{req.holder}</div>
            </div>
            <div style={{ paddingTop:12, borderTop:"1px solid rgba(255,255,255,0.08)", marginBottom:12 }}>
              <div style={{ color:"rgba(255,255,255,0.35)", fontSize:11, marginBottom:4 }}>По номеру карты</div>
              <div style={{ color:"white", fontWeight:700, fontSize:18 }}>{req.card}</div>
              <div style={{ color:"rgba(255,255,255,0.35)", fontSize:12 }}>{req.label} · {req.holder}</div>
            </div>
            <div style={{ paddingTop:12, borderTop:"1px solid rgba(255,255,255,0.08)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <span style={{ color:"rgba(255,255,255,0.35)", fontSize:12 }}>Комментарий:</span>
              <strong style={{ color:"#fbbf24", fontSize:18 }}>{orderId}</strong>
            </div>
          </div>

          <div style={{ background:"rgba(52,211,153,0.08)", border:"1px solid rgba(52,211,153,0.25)", borderRadius:12, padding:14, marginBottom:16 }}>
            <div style={{ color:"#6ee7b7", fontSize:13, fontWeight:600, marginBottom:4 }}>📋 Что дальше?</div>
            <div style={{ color:"rgba(255,255,255,0.5)", fontSize:13, lineHeight:1.7 }}>
              • Переведите деньги по реквизитам выше<br/>
              • Обязательно загрузите скриншот чека в личном кабинете<br/>
              • Данные аккаунта придут в личный кабинет → Мои заявки<br/>
              • Если включена 2FA — будьте онлайн, мы свяжемся через кабинет
            </div>
          </div>

          <div style={{ display:"flex", gap:10 }}>
            <button onClick={()=>{ onClose(); go("#cabinet"); }} style={{ flex:1, padding:12, borderRadius:10, background:"rgba(251,191,36,0.1)", border:"1px solid rgba(251,191,36,0.3)", color:"#fbbf24", cursor:"pointer", fontSize:13, fontWeight:600 }}>📋 Мои заявки</button>
            <button onClick={onClose} style={{ flex:1, padding:12, borderRadius:10, background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", color:"rgba(255,255,255,0.5)", cursor:"pointer", fontSize:13 }}>Закрыть</button>
          </div>
          <div style={{ color:"rgba(255,255,255,0.25)", fontSize:11, marginTop:12, textAlign:"center" }}>⏱ Обрабатываем в рабочее время — обычно до 1 часа</div>
        </>}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  AUTH MODAL
// ══════════════════════════════════════════════════════════════
function AuthModal({ onClose, userHook, t }) {
  const [mode, setMode]   = useState("login");
  const [name, setName]   = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass]   = useState("");
  const [pass2, setPass2] = useState("");
  const [err, setErr]     = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handle = async () => {
    setErr(""); setLoading(true);
    if (!email || !pass) { setErr("Заполните все поля"); setLoading(false); return; }
    if (mode === "register") {
      if (!name.trim()) { setErr("Введите имя"); setLoading(false); return; }
      if (pass !== pass2) { setErr("Пароли не совпадают"); setLoading(false); return; }
      if (pass.length < 6) { setErr("Пароль минимум 6 символов"); setLoading(false); return; }
      const r = await userHook.register(name.trim(), email, pass);
      if (r.error) { setErr(r.error); setLoading(false); return; }
      setErr(""); setLoading(false);
      onClose();
    } else {
      const r = await userHook.login(email, pass);
      if (r.error) { setErr(r.error); setLoading(false); return; }
      setLoading(false); onClose();
    }
  };

  const inp = { width:"100%", background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:10, padding:"12px 16px", color:"white", fontSize:14, outline:"none", marginBottom:12, boxSizing:"border-box" };

  return (
    <div style={{ position:"fixed",inset:0,zIndex:300,background:"rgba(0,0,0,0.85)",backdropFilter:"blur(16px)",display:"flex",alignItems:"center",justifyContent:"center",padding:20 }} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} className="modal-inner" style={{ background:"#0e0e1a", border:"1px solid rgba(255,255,255,0.12)", borderRadius:22, width:"100%", maxWidth:400, padding:32, boxShadow:"0 24px 80px rgba(0,0,0,0.7)" }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:24 }}>
          <div style={{ fontFamily:"'Clash Display',sans-serif", fontWeight:800, fontSize:22, color:"white" }}>{mode==="login"?"👋 Вход":"🚀 Регистрация"}</div>
          <button onClick={onClose} style={{ color:"rgba(255,255,255,0.4)", fontSize:20, background:"none", border:"none", cursor:"pointer" }}>✕</button>
        </div>
        <div style={{ display:"flex", background:"rgba(255,255,255,0.05)", borderRadius:12, padding:4, marginBottom:24 }}>
          {[["login","Войти"],["register","Регистрация"]].map(([m,l]) => (
            <button key={m} onClick={()=>setMode(m)} style={{ flex:1, padding:"9px", borderRadius:9, border:"none", cursor:"pointer", background:mode===m?"rgba(251,191,36,0.2)":"transparent", color:mode===m?"#fbbf24":"rgba(255,255,255,0.4)", fontWeight:600, fontSize:13, transition:"all .2s" }}>{l}</button>
          ))}
        </div>
        {mode==="register" && <input value={name} onChange={e=>setName(e.target.value)} placeholder="Ваше имя" style={inp}/>}
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" type="email" style={inp}/>
        <div style={{ position:"relative", marginBottom:12 }}>
          <input value={pass} onChange={e=>setPass(e.target.value)} placeholder="Пароль" type={showPass?"text":"password"}
            style={{ ...inp, marginBottom:0, paddingRight:44 }} onKeyDown={e=>e.key==="Enter"&&handle()}/>
          <button type="button" onClick={()=>setShowPass(s=>!s)}
            style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", color:"rgba(255,255,255,0.4)", cursor:"pointer", fontSize:13, padding:4 }}>
            {showPass?"Скрыть":"Показать"}
          </button>
        </div>
        {mode==="register" && <input value={pass2} onChange={e=>setPass2(e.target.value)} placeholder="Повторите пароль" type="password" style={inp}/>}
        {err && <div style={{ background:"rgba(248,113,113,0.1)", border:"1px solid rgba(248,113,113,0.3)", color:"#f87171", borderRadius:8, padding:"8px 12px", fontSize:12, marginBottom:12 }}>{err}</div>}
        <button onClick={handle} disabled={loading} style={{ width:"100%", padding:13, borderRadius:12, background:"linear-gradient(135deg,#f59e0b,#fbbf24)", border:"none", color:"#0a0a14", fontWeight:800, fontSize:15, cursor:"pointer", opacity:loading?.7:1 }}>
          {loading ? "..." : mode==="login" ? "Войти" : "Создать аккаунт"}
        </button>

        {/* Восстановление пароля */}
        {mode==="login" && (
          <div style={{ textAlign:"center", marginTop:10 }}>
            <button onClick={async()=>{
              if (!email) { setErr("Введите email для восстановления пароля"); return; }
              const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + "/#reset" });
              if (error) setErr(error.message);
              else setErr(""); alert("Письмо с ссылкой для сброса пароля отправлено на " + email);
            }} style={{ background:"none", border:"none", color:"rgba(255,255,255,0.4)", cursor:"pointer", fontSize:12, textDecoration:"underline" }}>
              Забыли пароль?
            </button>
          </div>
        )}

        {/* Сообщение о подтверждении email после регистрации */}
        {mode==="register" && (
          <div style={{ background:"rgba(96,165,250,0.08)", border:"1px solid rgba(96,165,250,0.25)", borderRadius:10, padding:"10px 14px", marginTop:10, fontSize:12, color:"rgba(255,255,255,0.5)", lineHeight:1.6 }}>
            📧 После регистрации проверьте почту — нужно подтвердить email чтобы войти в аккаунт.
          </div>
        )}

        <div style={{ color:"rgba(255,255,255,0.3)", fontSize:12, textAlign:"center", marginTop:12 }}>
          {mode==="login"?"Нет аккаунта? ":"Уже есть аккаунт? "}
          <button onClick={()=>setMode(mode==="login"?"register":"login")} style={{ background:"none", border:"none", color:"#fbbf24", cursor:"pointer", fontSize:12, fontWeight:600 }}>
            {mode==="login"?"Зарегистрироваться":"Войти"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  PERSONAL CABINET
// ══════════════════════════════════════════════════════════════
function Cabinet({ userHook, go, t }) {
  const { session, profile, logout } = userHook;
  const [tab, setTab] = useState("orders");
  const [expandedId, setExpandedId] = useState(null);
  const [receiptModal, setReceiptModal] = useState(null);
  const [receiptFile, setReceiptFile] = useState(null);
  const [uploadingFor, setUploadingFor] = useState(null);
  const fileRef = useRef();

  const { orders, loading } = useOrders(session?.user?.id, false);
  const { notifs, unread, markRead } = useNotifications(session?.user?.id);

  useEffect(() => { if (tab === "notifs") markRead(); }, [tab]);

  const openReceipt = async (o) => {
    if (!o.receipt_url) return;
    const url = await sbStorage.getSignedUrl(o.receipt_url);
    setReceiptModal({ url, name: o.receipt_name });
  };

  const uploadReceiptForOrder = async (orderId, userId) => {
    if (!receiptFile) return;
    setUploadingFor(orderId);
    try {
      const path = await sbStorage.uploadReceipt(userId, orderId, receiptFile);
      await sbOrders.update(orderId, { receipt_url: path, receipt_name: receiptFile.name });
      setReceiptFile(null);
    } catch (e) { alert("Ошибка загрузки: " + e.message); }
    setUploadingFor(null);
  };

  const tabs = [
    { id:"orders",  label:"Заявки",        icon:"📋", count: orders.length },
    { id:"notifs",  label:"Уведомления",   icon:"🔔", count: unread },
    { id:"profile", label:"Профиль",       icon:"👤" },
  ];

  const stats = {
    total:   orders.length,
    done:    orders.filter(o=>o.status==="done").length,
    spent:   orders.filter(o=>o.status==="done").reduce((s,o)=>s+(o.price_rub||0),0),
    pending: orders.filter(o=>["new","paid","processing"].includes(o.status)).length,
  };

  return (
    <div style={{ maxWidth:820, margin:"0 auto", padding:"80px 20px 60px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:32, flexWrap:"wrap", gap:12 }}>
        <div>
          <div style={{ color:t.muted, fontSize:13, marginBottom:4 }}>Личный кабинет</div>
          <div style={{ fontFamily:"'Clash Display',sans-serif", fontWeight:800, fontSize:28, color:t.text }}>Привет, {profile?.name || ""}! 👋</div>
        </div>
        <button onClick={()=>go("#catalog")} style={{ padding:"10px 20px", borderRadius:100, background:t.card, border:`1px solid ${t.border}`, color:t.sub, cursor:"pointer", fontSize:14, fontWeight:600 }}>🛍 Заказать ещё</button>
      </div>

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))", gap:10, marginBottom:28 }}>
        {[
          {l:"Всего заявок", v:stats.total,  c:t.gold,   i:"📋"},
          {l:"Выполнено",    v:stats.done,   c:"#34d399",i:"✅"},
          {l:"Потрачено",    v:stats.spent.toLocaleString("ru-RU")+" ₽", c:"#60a5fa",i:"💰"},
          {l:"В обработке",  v:stats.pending,c:"#a78bfa",i:"🔧"},
        ].map(s => (
          <div key={s.l} style={{ background:t.card2, border:`1px solid ${t.border}`, borderRadius:16, padding:"16px 18px", boxShadow:t.shadow }}>
            <div style={{ fontSize:22, marginBottom:6 }}>{s.i}</div>
            <div style={{ color:t.muted, fontSize:12, marginBottom:4 }}>{s.l}</div>
            <div style={{ color:s.c, fontWeight:800, fontSize:22, fontFamily:"'Clash Display',sans-serif" }}>{s.v}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display:"flex", gap:8, marginBottom:20, flexWrap:"wrap" }}>
        {tabs.map(tab_ => (
          <button key={tab_.id} onClick={()=>setTab(tab_.id)} style={{ padding:"9px 18px", borderRadius:100, fontSize:13, fontWeight:600, cursor:"pointer", background:tab===tab_.id?t.goldDim:t.card, border:`1px solid ${tab===tab_.id?t.goldB:t.border}`, color:tab===tab_.id?t.gold:t.sub }}>
            {tab_.icon} {tab_.label}
            {tab_.count > 0 && <span style={{ marginLeft:6, background:tab_.id==="notifs"?"#f87171":t.gold, color:tab_.id==="notifs"?"white":"#0a0a14", borderRadius:100, padding:"1px 7px", fontSize:11, fontWeight:700 }}>{tab_.count}</span>}
          </button>
        ))}
      </div>

      {/* Orders */}
      {tab==="orders" && (loading
        ? <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {[1,2,3].map(i => <OrderSkeleton key={i} t={t}/>)}
          </div>
        : orders.length === 0
          ? <div style={{ textAlign:"center", padding:"60px 0", color:t.muted }}>
              <div style={{ fontSize:48, marginBottom:12 }}>📭</div>
              <div style={{ marginBottom:16 }}>У вас пока нет заявок</div>
              <button onClick={()=>go("#catalog")} style={{ padding:"12px 24px", borderRadius:12, background:"linear-gradient(135deg,#f59e0b,#fbbf24)", border:"none", color:"#0a0a14", fontWeight:700, cursor:"pointer" }}>Перейти в каталог →</button>
            </div>
          : <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {orders.map(o => (
              <div key={o.id} style={{ background:t.card2, border:`1px solid ${t.border}`, borderRadius:16, boxShadow:t.shadow }}>
                <div style={{ padding:18 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:10 }}>
                    <div>
                      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6, flexWrap:"wrap" }}>
                        <span style={{ fontSize:18 }}>{o.service_icon}</span>
                        <span style={{ color:t.gold, fontWeight:800, fontSize:15 }}>{o.id}</span>
                        <StatusBadge status={o.status} />
                      </div>
                      <div style={{ color:t.text, fontWeight:600, fontSize:14, marginBottom:2 }}>{o.service} · {o.tier}</div>
                      <div style={{ color:t.muted, fontSize:12 }}>{new Date(o.created_at).toLocaleString("ru-RU")}</div>
                    </div>
                    <div style={{ textAlign:"right" }}>
                      <div style={{ color:t.gold, fontWeight:800, fontSize:20 }}>{(o.price_rub||0).toLocaleString("ru-RU")} ₽</div>
                      <div style={{ color:t.muted, fontSize:12 }}>${o.price_usd}</div>
                      <button onClick={()=>setExpandedId(expandedId===o.id?null:o.id)} style={{ marginTop:6, padding:"4px 12px", borderRadius:100, background:t.inp, border:`1px solid ${t.border}`, color:t.sub, fontSize:11, cursor:"pointer" }}>
                        {expandedId===o.id?"▲ скрыть":"▼ подробнее"}
                      </button>
                    </div>
                  </div>

                  {expandedId===o.id && (
                    <div style={{ marginTop:16, paddingTop:14, borderTop:`1px solid ${t.border}` }}>

                      {/* Реквизиты если новая */}
                      {o.status === "new" && (
                        <div style={{ background:t.goldDim, border:`1px solid ${t.goldB}`, borderRadius:12, padding:14, marginBottom:12 }}>
                          <div style={{ color:t.gold, fontWeight:600, fontSize:12, marginBottom:8 }}>💳 Реквизиты · {o.requisite_label}</div>
                          <div style={{ color:t.text, fontSize:14, marginBottom:4 }}>СБП: <strong>{o.requisite_sbp}</strong></div>
                          <div style={{ color:t.text, fontSize:14, marginBottom:6 }}>Карта: <strong>{o.requisite_card}</strong></div>
                          <div style={{ color:t.muted, fontSize:12 }}>Комментарий: <strong style={{ color:t.gold }}>{o.id}</strong></div>
                        </div>
                      )}

                      {/* Сообщение от оператора */}
                      {o.operator_note && (
                        <div style={{ background:"rgba(52,211,153,0.08)", border:"1px solid rgba(52,211,153,0.3)", borderRadius:12, padding:14, marginBottom:12 }}>
                          <div style={{ color:"#6ee7b7", fontWeight:700, fontSize:13, marginBottom:8 }}>📩 Сообщение от оператора</div>
                          <div style={{ color:t.text, fontSize:14, lineHeight:1.7, whiteSpace:"pre-wrap", fontFamily:"monospace", background:"rgba(0,0,0,0.2)", borderRadius:8, padding:"10px 12px" }}>{o.operator_note}</div>
                        </div>
                      )}

                      {/* Загрузить чек */}
                      {!o.receipt_url && (
                        <div style={{ marginBottom:12 }}>
                          <div style={{ color:t.sub, fontSize:12, marginBottom:6 }}>📎 Загрузить чек об оплате:</div>
                          <input type="file" accept="image/*,.pdf" style={{ display:"none" }} id={`file_${o.id}`}
                            onChange={e=>setReceiptFile(e.target.files[0])}/>
                          <div style={{ display:"flex", gap:8 }}>
                            <label htmlFor={`file_${o.id}`} style={{ flex:1, padding:"9px 14px", borderRadius:10, cursor:"pointer", background:t.inp, border:`1px dashed ${t.border}`, color:t.sub, fontSize:13, textAlign:"center", display:"block" }}>
                              {receiptFile ? receiptFile.name : "📤 Выбрать файл"}
                            </label>
                            {receiptFile && (
                              <button onClick={()=>uploadReceiptForOrder(o.id, session.user.id)} disabled={!!uploadingFor} style={{ padding:"9px 16px", borderRadius:10, background:"rgba(52,211,153,0.15)", border:"1px solid rgba(52,211,153,0.35)", color:"#6ee7b7", cursor:"pointer", fontSize:13, fontWeight:600 }}>
                                {uploadingFor===o.id ? "..." : "Загрузить"}
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                      {o.receipt_url && (
                        <div style={{ marginBottom:12 }}>
                          <button onClick={()=>openReceipt(o)} style={{ padding:"8px 14px", borderRadius:10, background:"rgba(52,211,153,0.12)", border:"1px solid rgba(52,211,153,0.3)", color:"#6ee7b7", cursor:"pointer", fontSize:13, fontWeight:600 }}>
                            📎 Посмотреть чек
                          </button>
                        </div>
                      )}

                      {/* Таймлайн */}
                      <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                        {["new","paid","processing","done"].map(st => {
                          const idx = ["new","paid","processing","done"].indexOf(o.status);
                          const sIdx = ["new","paid","processing","done"].indexOf(st);
                          const done_ = sIdx <= idx && o.status !== "cancelled";
                          const cur = st === o.status;
                          return <div key={st} style={{ padding:"5px 10px", borderRadius:100, background:cur?SC[st]+"22":"rgba(128,128,128,0.08)", border:`1px solid ${cur?SC[st]+"55":"rgba(128,128,128,0.15)"}`, fontSize:11, color:done_?(SC[st]||"#34d399"):"rgba(128,128,128,0.4)", fontWeight:cur?700:400 }}>{done_?"✓":""} {SL[st]}</div>;
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
      )}

      {/* Notifications */}
      {tab==="notifs" && (
        notifs.length === 0
          ? <div style={{ textAlign:"center", padding:"60px 0", color:t.muted }}><div style={{ fontSize:48, marginBottom:12 }}>🔔</div>Уведомлений пока нет</div>
          : <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {notifs.map(n => (
              <div key={n.id} style={{ background:n.is_read?t.card:t.card2, border:`1px solid ${n.is_read?t.border:"rgba(251,191,36,0.25)"}`, borderRadius:14, padding:16, display:"flex", gap:12, alignItems:"flex-start" }}>
                <div style={{ fontSize:20 }}>🔔</div>
                <div style={{ flex:1 }}>
                  <div style={{ color:t.text, fontSize:14, lineHeight:1.6 }}>{n.text}</div>
                  <div style={{ color:t.muted, fontSize:12, marginTop:4 }}>{new Date(n.created_at).toLocaleString("ru-RU")}</div>
                </div>
                {!n.is_read && <div style={{ width:8, height:8, borderRadius:"50%", background:"#fbbf24", flexShrink:0, marginTop:4 }}/>}
              </div>
            ))}
          </div>
      )}

      {/* Profile */}
      {tab==="profile" && (
        <div style={{ background:t.card2, border:`1px solid ${t.border}`, borderRadius:18, padding:28 }}>
          <div style={{ textAlign:"center", marginBottom:24 }}>
            <div style={{ width:80, height:80, borderRadius:"50%", background:t.goldDim, border:`2px solid ${t.goldB}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:32, margin:"0 auto 12px" }}>👤</div>
            <div style={{ fontFamily:"'Clash Display',sans-serif", fontWeight:700, fontSize:22, color:t.text }}>{profile?.name}</div>
            <div style={{ color:t.muted, fontSize:14, marginTop:4 }}>{session?.user?.email}</div>
            <div style={{ color:t.muted, fontSize:12, marginTop:2 }}>Зарегистрирован: {profile?.created_at ? new Date(profile.created_at).toLocaleDateString("ru-RU") : ""}</div>
          </div>
          <div style={{ borderTop:`1px solid ${t.border}`, paddingTop:20, textAlign:"center" }}>
            <button onClick={async()=>{ await logout(); go("#home"); }} style={{ padding:"10px 24px", borderRadius:12, background:"rgba(248,113,113,0.15)", border:"1px solid rgba(248,113,113,0.3)", color:"#f87171", cursor:"pointer", fontSize:14, fontWeight:600 }}>
              Выйти из аккаунта
            </button>
          </div>
        </div>
      )}

      {/* Receipt modal */}
      {receiptModal && (
        <div style={{ position:"fixed",inset:0,zIndex:400,background:"rgba(0,0,0,0.9)",display:"flex",alignItems:"center",justifyContent:"center",padding:20 }} onClick={()=>setReceiptModal(null)}>
          <div onClick={e=>e.stopPropagation()} style={{ position:"relative", maxWidth:"90vw" }}>
            <button onClick={()=>setReceiptModal(null)} style={{ position:"absolute",top:-14,right:-14,background:"#f87171",border:"none",borderRadius:"50%",width:32,height:32,color:"white",cursor:"pointer",fontSize:16,fontWeight:700 }}>✕</button>
            <img src={receiptModal.url} alt="чек" style={{ maxWidth:"85vw", maxHeight:"85vh", borderRadius:12 }}/>
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  ADMIN PANEL
// ══════════════════════════════════════════════════════════════
function AdminPanel({ userHook, go, t }) {
  const { session, isAdmin } = userHook;
  const { orders, loading, updateOrder } = useOrders(session?.user?.id, true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [noteValues, setNoteValues] = useState({});
  const [receiptModal, setReceiptModal] = useState(null);
  const [saving, setSaving] = useState(null);
  const [adminTab, setAdminTab] = useState("orders");
  const [promos, setPromos] = useState([]);
  const [serviceReqs, setServiceReqs] = useState([]);
  const [serviceReqsLoading, setServiceReqsLoading] = useState(false);
  const [manualRate, setManualRate] = useState("");
  const [manualRateEnabled, setManualRateEnabled] = useState(false);
  const [rateSaving, setRateSaving] = useState(false);
  const [rateLoaded, setRateLoaded] = useState(false);
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoForm, setPromoForm] = useState({ code:"", type:"percent", value:"", max_uses:-1, description:"", min_amount:0 });
  const [promoFormOpen, setPromoFormOpen] = useState(false);
  const [promoSaving, setPromoSaving] = useState(false);

  useEffect(() => {
    if (isAdmin && adminTab === "promos") {
      setPromoLoading(true);
      getPromocodes().then(d => { setPromos(d); setPromoLoading(false); });
    }
    if (isAdmin && adminTab === "requests") {
      setServiceReqsLoading(true);
      supabase.from("service_requests").select("*").order("created_at", { ascending: false })
        .then(({ data }) => { setServiceReqs(data || []); setServiceReqsLoading(false); });
    }
    if (isAdmin && adminTab === "settings" && !rateLoaded) {
      setRateLoaded(true);
      getSetting("manual_rate").then(v => { if(v) setManualRate(v); });
      getSetting("manual_rate_enabled").then(v => setManualRateEnabled(v === "true"));
    }
  }, [isAdmin, adminTab]);

  const handleSavePromo = async () => {
    if (!promoForm.code || !promoForm.value) return;
    setPromoSaving(true);
    const { error } = await savePromocode({
      code: promoForm.code.toUpperCase(),
      type: promoForm.type,
      value: parseFloat(promoForm.value),
      max_uses: parseInt(promoForm.max_uses) || -1,
      min_amount: parseInt(promoForm.min_amount) || 0,
      description: promoForm.description,
    });
    if (!error) {
      setPromoForm({ code:"", type:"percent", value:"", max_uses:-1, description:"", min_amount:0 });
      setPromoFormOpen(false);
      const d = await getPromocodes(); setPromos(d);
    }
    setPromoSaving(false);
  };

  const handleDeletePromo = async (id) => {
    if (!confirm("Удалить промокод?")) return;
    await deletePromocode(id);
    const d = await getPromocodes(); setPromos(d);
  };

  const PROMO_TYPE_LABELS = { percent:"% скидка", fixed:"Фикс. скидка ₽", free:"Без комиссии" };

  if (!isAdmin) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:t.bg }}>
      <div style={{ textAlign:"center", color:t.muted }}>
        <div style={{ fontSize:48, marginBottom:12 }}>🚫</div>
        <div style={{ marginBottom:16, color:t.text, fontSize:16 }}>Нет доступа</div>
        <button onClick={()=>go("#home")} style={{ padding:"10px 20px", borderRadius:10, background:t.card, border:`1px solid ${t.border}`, color:t.sub, cursor:"pointer" }}>На главную</button>
      </div>
    </div>
  );

  const filtered = orders.filter(o => {
    const ms = filter==="all" || o.status===filter;
    const mq = o.id?.includes(search) || o.service?.toLowerCase().includes(search.toLowerCase()) || (o.user_email||"").includes(search);
    return ms && mq;
  });

  const stats = {
    total:  orders.length,
    new_:   orders.filter(o=>o.status==="new").length,
    done:   orders.filter(o=>o.status==="done").length,
    earned: orders.filter(o=>o.status==="done").reduce((s,o)=>s+(o.price_rub||0),0),
    pending:orders.filter(o=>["new","paid","processing"].includes(o.status)).length,
  };

  const handleStatusChange = async (orderId, status) => {
    const notifText = `Заявка ${orderId}: статус изменён на "${SL[status]}"`;
    await updateOrder(orderId, { status }, notifText);
  };

  const handleNoteSave = async (orderId, note) => {
    setSaving(orderId);
    const notifText = note ? `Заявка ${orderId}: оператор отправил сообщение` : null;
    await updateOrder(orderId, { operator_note: note }, notifText);
    setSaving(null);
  };

  const openReceipt = async (o) => {
    if (!o.receipt_url) return;
    try {
      const url = await sbStorage.getSignedUrl(o.receipt_url);
      setReceiptModal({ url, name: o.receipt_name });
    } catch (e) { alert("Ошибка: " + e.message); }
  };

  const exportCSV = () => {
    const h = ["ID","Сервис","Тариф","$","₽","Метод","Статус","Клиент","Email","Сообщение","Дата"];
    const rows = orders.map(o => [o.id,o.service,o.tier,o.price_usd,o.price_rub,o.method,SL[o.status],o.user_name,o.user_email,o.operator_note||"",new Date(o.created_at).toLocaleString("ru-RU")]);
    const csv = [h,...rows].map(r=>r.map(v=>'"'+String(v||"").replace(/"/g,'""')+'"').join(",")).join("\n");
    const a = document.createElement("a"); a.href=URL.createObjectURL(new Blob(["\uFEFF"+csv],{type:"text/csv;charset=utf-8;"})); a.download=`payflow_${Date.now()}.csv`; a.click();
  };

  const inp = { background:t.inp, border:`1px solid ${t.border}`, borderRadius:10, padding:"10px 14px", color:t.text, fontSize:14, outline:"none", boxSizing:"border-box" };

  return (
    <div style={{ background:t.bg, minHeight:"100vh", padding:"24px 20px" }}>
      <div style={{ maxWidth:1020, margin:"0 auto" }}>

        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:28, flexWrap:"wrap", gap:12 }}>
          <div>
            <div style={{ fontFamily:"'Clash Display',sans-serif", fontWeight:800, fontSize:28, color:t.text }}>📋 Панель управления</div>
            <div style={{ color:t.sub, fontSize:13, marginTop:2 }}>{new Date().toLocaleString("ru-RU")}</div>
          </div>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            <button onClick={exportCSV} style={{ padding:"9px 16px", borderRadius:10, background:t.goldDim, border:`1px solid ${t.goldB}`, color:t.gold, cursor:"pointer", fontSize:13, fontWeight:600 }}>↓ CSV</button>
            <button onClick={()=>go("#home")} style={{ padding:"9px 16px", borderRadius:10, background:t.card, border:`1px solid ${t.border}`, color:t.sub, cursor:"pointer", fontSize:13 }}>← Сайт</button>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:12, marginBottom:24 }}>
          {[
            {l:"Всего",      v:stats.total,  c:t.gold,   i:"📋"},
            {l:"Новых",      v:stats.new_,   c:"#fbbf24",i:"🆕"},
            {l:"Выполнено",  v:stats.done,   c:"#34d399",i:"✅"},
            {l:"Заработано", v:stats.earned.toLocaleString("ru-RU")+" ₽",c:"#60a5fa",i:"💰"},
            {l:"В работе",   v:stats.pending,c:"#a78bfa",i:"🔧"},
          ].map(s => (
            <div key={s.l} style={{ background:t.card2, border:`1px solid ${t.border}`, borderRadius:16, padding:"16px 18px", boxShadow:t.shadow }}>
              <div style={{ fontSize:20, marginBottom:6 }}>{s.i}</div>
              <div style={{ color:t.sub, fontSize:12, marginBottom:4 }}>{s.l}</div>
              <div style={{ color:s.c, fontWeight:800, fontSize:22, fontFamily:"'Clash Display',sans-serif" }}>{s.v}</div>
            </div>
          ))}
        </div>

        {/* Admin tabs */}
        <div style={{ display:"flex", gap:8, marginBottom:24, flexWrap:"wrap" }}>
          {[["orders","Заявки","📋"],["promos","Промокоды","🎁"],["requests","Запросы","💡"],["settings","Настройки","⚙️"]].map(([id,label,icon]) => (
            <button key={id} onClick={()=>setAdminTab(id)} style={{ padding:"9px 20px", borderRadius:100, fontSize:13, fontWeight:600, cursor:"pointer", background:adminTab===id?t.goldDim:t.card, border:`1px solid ${adminTab===id?t.goldB:t.border}`, color:adminTab===id?t.gold:t.sub }}>
              {icon} {label}
              {id==="orders" && <span style={{ marginLeft:6, opacity:.6, fontSize:11 }}>({orders.length})</span>}
              {id==="requests" && serviceReqs.filter(r=>r.status==="pending").length > 0 && <span style={{ marginLeft:6, background:"#f87171", color:"white", borderRadius:"50%", width:16, height:16, fontSize:9, fontWeight:700, display:"inline-flex", alignItems:"center", justifyContent:"center" }}>{serviceReqs.filter(r=>r.status==="pending").length}</span>}
            </button>
          ))}
        </div>

        {/* PROMOCODES TAB */}
        {adminTab === "promos" && (
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
              <div style={{ color:t.sub, fontSize:14 }}>Управление промокодами</div>
              <button onClick={()=>setPromoFormOpen(o=>!o)} style={{ padding:"9px 18px", borderRadius:10, background:t.goldDim, border:`1px solid ${t.goldB}`, color:t.gold, cursor:"pointer", fontSize:13, fontWeight:600 }}>
                {promoFormOpen ? "Закрыть" : "+ Создать промокод"}
              </button>
            </div>

            {/* Create form */}
            {promoFormOpen && (
              <div style={{ background:t.card2, border:`1px solid ${t.border}`, borderRadius:16, padding:22, marginBottom:16 }}>
                <div style={{ fontWeight:700, color:t.text, fontSize:15, marginBottom:16 }}>Новый промокод</div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:12, marginBottom:12 }}>
                  <div>
                    <div style={{ color:t.muted, fontSize:11, marginBottom:6 }}>КОД</div>
                    <input value={promoForm.code} onChange={e=>setPromoForm(f=>({...f,code:e.target.value.toUpperCase()}))} placeholder="SUMMER20" style={{ ...inp, width:"100%", textTransform:"uppercase", letterSpacing:2 }}/>
                  </div>
                  <div>
                    <div style={{ color:t.muted, fontSize:11, marginBottom:6 }}>ТИП</div>
                    <select value={promoForm.type} onChange={e=>setPromoForm(f=>({...f,type:e.target.value}))} style={{ ...inp, width:"100%", appearance:"none" }}>
                      <option value="percent">% скидка от суммы</option>
                      <option value="fixed">Фикс. скидка ₽</option>
                      <option value="free">Без комиссии</option>
                    </select>
                  </div>
                  {promoForm.type !== "free" && <div>
                    <div style={{ color:t.muted, fontSize:11, marginBottom:6 }}>{promoForm.type==="percent"?"ПРОЦЕНТ %":"СУММА ₽"}</div>
                    <input value={promoForm.value} onChange={e=>setPromoForm(f=>({...f,value:e.target.value}))} placeholder={promoForm.type==="percent"?"10":"500"} type="number" style={{ ...inp, width:"100%" }}/>
                  </div>}
                  <div>
                    <div style={{ color:t.muted, fontSize:11, marginBottom:6 }}>МАК. ИСПОЛЬЗОВАНИЙ (-1 = ∞)</div>
                    <input value={promoForm.max_uses} onChange={e=>setPromoForm(f=>({...f,max_uses:e.target.value}))} type="number" style={{ ...inp, width:"100%" }}/>
                  </div>
                  <div>
                    <div style={{ color:t.muted, fontSize:11, marginBottom:6 }}>МИН. СУММА ЗАКАЗА ₽</div>
                    <input value={promoForm.min_amount} onChange={e=>setPromoForm(f=>({...f,min_amount:e.target.value}))} type="number" placeholder="0" style={{ ...inp, width:"100%" }}/>
                  </div>
                  <div>
                    <div style={{ color:t.muted, fontSize:11, marginBottom:6 }}>ЗАМЕТКА</div>
                    <input value={promoForm.description} onChange={e=>setPromoForm(f=>({...f,description:e.target.value}))} placeholder="Для новых пользователей" style={{ ...inp, width:"100%" }}/>
                  </div>
                </div>
                <button onClick={handleSavePromo} disabled={promoSaving} style={{ padding:"10px 24px", borderRadius:10, background:"linear-gradient(135deg,#f59e0b,#fbbf24)", border:"none", color:"#0a0a14", fontWeight:700, cursor:"pointer", fontSize:14 }}>
                  {promoSaving ? "Сохранение..." : "💾 Создать промокод"}
                </button>
              </div>
            )}

            {/* Promos list */}
            {promoLoading ? <div style={{ color:t.muted, textAlign:"center", padding:"40px" }}>Загрузка...</div> :
            promos.length === 0 ? <div style={{ color:t.muted, textAlign:"center", padding:"60px" }}><div style={{ fontSize:40, marginBottom:12 }}>🎁</div>Промокодов пока нет</div> :
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {promos.map(p => (
                <div key={p.id} style={{ background:t.card2, border:`1px solid ${p.is_active?t.border:"rgba(248,113,113,0.2)"}`, borderRadius:14, padding:16, display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:10 }}>
                  <div>
                    <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:4 }}>
                      <span style={{ color:t.gold, fontWeight:800, fontSize:16, letterSpacing:2 }}>{p.code}</span>
                      <span style={{ background: p.is_active?"rgba(52,211,153,0.15)":"rgba(248,113,113,0.15)", border:`1px solid ${p.is_active?"rgba(52,211,153,0.3)":"rgba(248,113,113,0.3)"}`, color: p.is_active?"#6ee7b7":"#f87171", fontSize:11, padding:"2px 8px", borderRadius:100, fontWeight:600 }}>
                        {p.is_active?"Активен":"Отключён"}
                      </span>
                    </div>
                    <div style={{ color:t.text, fontSize:13, marginBottom:2 }}>
                      {PROMO_TYPE_LABELS[p.type]}{p.type!=="free" && `: ${p.value}${p.type==="percent"?"%":"₽"}`}
                      {p.min_amount > 0 && ` · мин. ${p.min_amount}₽`}
                    </div>
                    <div style={{ color:t.muted, fontSize:12 }}>
                      Использований: {p.uses_count}{p.max_uses!==-1?`/${p.max_uses}`:""} · {p.description}
                    </div>
                  </div>
                  <div style={{ display:"flex", gap:8 }}>
                    <button onClick={async()=>{ await supabase.from("promocodes").update({is_active:!p.is_active}).eq("id",p.id); const d=await getPromocodes(); setPromos(d); }} style={{ padding:"7px 14px", borderRadius:8, background:t.inp, border:`1px solid ${t.border}`, color:t.sub, cursor:"pointer", fontSize:12 }}>
                      {p.is_active?"Отключить":"Включить"}
                    </button>
                    <button onClick={()=>handleDeletePromo(p.id)} style={{ padding:"7px 14px", borderRadius:8, background:"rgba(248,113,113,0.1)", border:"1px solid rgba(248,113,113,0.3)", color:"#f87171", cursor:"pointer", fontSize:12 }}>
                      Удалить
                    </button>
                  </div>
                </div>
              ))}
            </div>}
          </div>
        )}

        {/* SETTINGS TAB */}
        {adminTab === "settings" && (
          <div style={{ maxWidth:520 }}>
            {/* Ручной курс */}
            <div style={{ background:t.card2, border:`1px solid ${t.border}`, borderRadius:18, padding:24, marginBottom:16 }}>
              <div style={{ fontFamily:"'Clash Display',sans-serif", fontWeight:700, fontSize:18, color:t.text, marginBottom:6 }}>💱 Курс доллара</div>
              <div style={{ color:t.sub, fontSize:13, marginBottom:20, lineHeight:1.6 }}>
                По умолчанию курс берётся автоматически с ЦБ РФ. Ты можешь задать свой курс — он будет применяться ко всем расчётам на сайте.
              </div>

              {/* Toggle */}
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16, padding:"12px 16px", background:t.inp, borderRadius:12 }}>
                <div>
                  <div style={{ color:t.text, fontWeight:600, fontSize:14 }}>Ручной курс</div>
                  <div style={{ color:t.muted, fontSize:12 }}>{manualRateEnabled ? "Включён — используется твой курс" : "Выключен — курс берётся с ЦБ РФ"}</div>
                </div>
                <button onClick={async () => {
                  const newVal = !manualRateEnabled;
                  setManualRateEnabled(newVal);
                  await setSetting("manual_rate_enabled", String(newVal));
                }} style={{ width:48, height:26, borderRadius:100, border:"none", cursor:"pointer", background:manualRateEnabled?"#fbbf24":"rgba(128,128,128,0.3)", position:"relative", transition:"all .2s", flexShrink:0 }}>
                  <span style={{ width:20, height:20, borderRadius:"50%", background:"white", position:"absolute", top:3, transition:"all .2s", left:manualRateEnabled?24:3 }}/>
                </button>
              </div>

              {/* Rate input */}
              <div style={{ marginBottom:16 }}>
                <div style={{ color:t.muted, fontSize:12, marginBottom:8 }}>Курс 1$ в рублях</div>
                <div style={{ display:"flex", gap:10 }}>
                  <div style={{ display:"flex", flex:1, alignItems:"center", background:t.inp, border:`1px solid ${manualRateEnabled?t.goldB:t.border}`, borderRadius:12, padding:"0 16px", gap:8 }}>
                    <span style={{ color:t.muted, fontSize:14 }}>1$ =</span>
                    <input
                      type="number"
                      value={manualRate}
                      onChange={e => setManualRate(e.target.value)}
                      placeholder="84.50"
                      step="0.01"
                      style={{ flex:1, background:"none", border:"none", color:t.text, fontSize:20, fontWeight:700, outline:"none", padding:"12px 0" }}
                    />
                    <span style={{ color:t.muted, fontSize:14 }}>₽</span>
                  </div>
                  <button
                    onClick={async () => {
                      if (!manualRate || parseFloat(manualRate) <= 0) return;
                      setRateSaving(true);
                      await setSetting("manual_rate", manualRate);
                      if (!manualRateEnabled) {
                        setManualRateEnabled(true);
                        await setSetting("manual_rate_enabled", "true");
                      }
                      setRateSaving(false);
                      alert("✅ Курс сохранён: 1$ = " + manualRate + " ₽");
                    }}
                    disabled={rateSaving || !manualRate}
                    style={{ padding:"12px 20px", borderRadius:12, background:"linear-gradient(135deg,#f59e0b,#fbbf24)", border:"none", color:"#0a0a14", fontWeight:700, cursor:"pointer", fontSize:14, opacity:rateSaving||!manualRate?0.6:1, whiteSpace:"nowrap" }}>
                    {rateSaving ? "..." : "💾 Сохранить"}
                  </button>
                </div>
              </div>

              {/* Status */}
              <div style={{ padding:"10px 14px", borderRadius:10, background:manualRateEnabled?t.goldDim:"rgba(52,211,153,0.08)", border:`1px solid ${manualRateEnabled?t.goldB:"rgba(52,211,153,0.25)"}`, fontSize:13, color:manualRateEnabled?t.gold:"#6ee7b7" }}>
                {manualRateEnabled
                  ? `⚠️ Сейчас применяется твой курс: 1$ = ${manualRate || "не задан"} ₽`
                  : "✅ Сейчас применяется автоматический курс ЦБ РФ"}
              </div>
            </div>

            {/* Комиссия — информационно */}
            <div style={{ background:t.card2, border:`1px solid ${t.border}`, borderRadius:18, padding:24 }}>
              <div style={{ fontFamily:"'Clash Display',sans-serif", fontWeight:700, fontSize:18, color:t.text, marginBottom:6 }}>💸 Комиссия</div>
              <div style={{ color:t.sub, fontSize:13, lineHeight:1.6, marginBottom:12 }}>
                Текущая комиссия задана в коде: <strong style={{ color:t.gold }}>10%</strong>. Чтобы изменить — поправь константу <code style={{ background:t.inp, padding:"2px 6px", borderRadius:4, fontSize:12 }}>CFG.MARGIN</code> в файле <code style={{ background:t.inp, padding:"2px 6px", borderRadius:4, fontSize:12 }}>src/App.jsx</code>.
              </div>
            </div>
          </div>
        )}

        {/* REQUESTS TAB */}
        {adminTab === "requests" && (
          <div>
            <div style={{ marginBottom:16, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div style={{ color:t.sub, fontSize:14 }}>Запросы пользователей на добавление новых сервисов</div>
              <div style={{ color:t.muted, fontSize:12 }}>{serviceReqs.length} запросов</div>
            </div>
            {serviceReqsLoading
              ? <div style={{ textAlign:"center", padding:40, color:t.muted }}>Загрузка...</div>
              : serviceReqs.length === 0
                ? <div style={{ textAlign:"center", padding:"60px 0", color:t.muted }}><div style={{ fontSize:40, marginBottom:12 }}>💡</div>Запросов пока нет</div>
                : <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                    {serviceReqs.map(req => (
                      <div key={req.id} style={{ background:t.card2, border:`1px solid ${t.border}`, borderRadius:14, padding:18 }}>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12, flexWrap:"wrap" }}>
                          <div style={{ flex:1 }}>
                            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                              <span style={{ fontWeight:700, fontSize:15, color:t.text }}>{req.service_name}</span>
                              <span style={{ fontSize:11, padding:"2px 8px", borderRadius:100, background:req.status==="pending"?"rgba(251,191,36,0.15)":req.status==="added"?"rgba(52,211,153,0.15)":"rgba(128,128,128,0.1)", border:`1px solid ${req.status==="pending"?"rgba(251,191,36,0.4)":req.status==="added"?"rgba(52,211,153,0.4)":"rgba(128,128,128,0.2)"}`, color:req.status==="pending"?t.gold:req.status==="added"?"#6ee7b7":t.muted, fontWeight:600 }}>
                                {req.status==="pending"?"На рассмотрении":req.status==="added"?"Добавлен":req.status==="reviewing"?"В работе":"Отклонён"}
                              </span>
                            </div>
                            {req.service_url && <div style={{ color:t.muted, fontSize:12, marginBottom:4 }}>🔗 {req.service_url}</div>}
                            {req.comment && <div style={{ color:t.sub, fontSize:13, marginBottom:4 }}>{req.comment}</div>}
                            <div style={{ color:t.muted, fontSize:11 }}>{req.user_email} · {new Date(req.created_at).toLocaleDateString("ru-RU")}</div>
                          </div>
                          <select
                            value={req.status}
                            onChange={async (e) => {
                              const newStatus = e.target.value;
                              await supabase.from("service_requests").update({ status: newStatus }).eq("id", req.id);
                              setServiceReqs(prev => prev.map(r => r.id === req.id ? { ...r, status: newStatus } : r));
                            }}
                            style={{ padding:"6px 10px", borderRadius:8, background:t.inp, border:`1px solid ${t.border}`, color:t.text, fontSize:12, cursor:"pointer" }}>
                            <option value="pending">На рассмотрении</option>
                            <option value="reviewing">В работе</option>
                            <option value="added">Добавлен</option>
                            <option value="declined">Отклонён</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
            }
          </div>
        )}

        {adminTab === "orders" && <>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Поиск по ID, сервису или email" style={{ ...inp, width:"100%", marginBottom:12 }}/>
        <div style={{ display:"flex", gap:7, flexWrap:"wrap", marginBottom:20 }}>
          {[["all","Все"],...Object.entries(SL)].map(([k,l]) => {
            const cnt = k==="all" ? orders.length : orders.filter(o=>o.status===k).length;
            return <button key={k} onClick={()=>setFilter(k)} style={{ padding:"7px 14px", borderRadius:100, fontSize:12, fontWeight:600, cursor:"pointer", background:filter===k?(SC[k]||t.gold)+"22":t.card, border:`1px solid ${filter===k?(SC[k]||t.gold)+"55":t.border}`, color:filter===k?(SC[k]||t.gold):t.sub }}>{l} ({cnt})</button>;
          })}
        </div>

        {loading
          ? <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {[1,2,3].map(i => <OrderSkeleton key={i} t={t}/>)}
            </div>
          : filtered.length === 0
            ? <div style={{ textAlign:"center", padding:"80px 0", color:t.muted }}><div style={{ fontSize:48, marginBottom:12 }}>📭</div>{orders.length===0?"Заявок пока нет":"Ничего не найдено"}</div>
            : <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {filtered.map(o => (
                <div key={o.id} style={{ background:t.card2, border:`1px solid ${t.border}`, borderRadius:16, boxShadow:t.shadow }}>
                  <div style={{ padding:20 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:10 }}>
                      <div>
                        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6, flexWrap:"wrap" }}>
                          <span style={{ color:t.gold, fontWeight:800, fontSize:16 }}>{o.id}</span>
                          <StatusBadge status={o.status} />
                          {o.receipt_url && <button onClick={()=>openReceipt(o)} style={{ background:"rgba(52,211,153,0.15)", border:"1px solid rgba(52,211,153,0.4)", color:"#6ee7b7", fontSize:11, padding:"2px 8px", borderRadius:100, cursor:"pointer", fontWeight:600 }}>📎 Чек</button>}
                        </div>
                        <div style={{ color:t.text, fontWeight:600, fontSize:14, marginBottom:3 }}>{o.service_icon} {o.service} · {o.tier}</div>
                        <div style={{ color:t.sub, fontSize:12, marginBottom:2 }}>👤 {o.user_name} · {o.user_email}</div>
                        <div style={{ color:t.sub, fontSize:12, marginBottom:2 }}>
                          {o.method==="login"  && `🔐 Логин: ${o.login_data}`}
                          {o.method==="gift"   && `🎁 Gift → ${o.email_data}`}
                          {o.method==="family" && `👨‍👩‍👧 Family → ${o.email_data}`}
                          {o.method==="newAcc" && `✨ Новый аккаунт`}
                        </div>
                        <div style={{ color:t.muted, fontSize:11 }}>🕒 {new Date(o.created_at).toLocaleString("ru-RU")}</div>
                      </div>
                      <div style={{ textAlign:"right" }}>
                        <div style={{ color:t.gold, fontWeight:800, fontSize:22 }}>{(o.price_rub||0).toLocaleString("ru-RU")} ₽</div>
                        <div style={{ color:t.muted, fontSize:12, marginBottom:8 }}>${o.price_usd}</div>
                        <button onClick={()=>setExpanded(expanded===o.id?null:o.id)} style={{ padding:"6px 14px", borderRadius:100, background:t.inp, border:`1px solid ${t.border}`, color:t.sub, fontSize:12, cursor:"pointer" }}>
                          {expanded===o.id?"▲ скрыть":"▼ действия"}
                        </button>
                      </div>
                    </div>

                    {expanded===o.id && (
                      <div style={{ marginTop:16, paddingTop:16, borderTop:`1px solid ${t.border}` }}>
                        {/* Статус */}
                        <div style={{ marginBottom:16 }}>
                          <div style={{ color:t.sub, fontSize:12, marginBottom:8, fontWeight:600 }}>Изменить статус:</div>
                          <div style={{ display:"flex", gap:7, flexWrap:"wrap" }}>
                            {Object.entries(SL).map(([k,l]) => (
                              <button key={k} onClick={()=>handleStatusChange(o.id,k)} style={{ padding:"7px 16px", borderRadius:100, fontSize:12, fontWeight:600, cursor:"pointer", background:o.status===k?SC[k]+"22":t.inp, border:`1px solid ${o.status===k?SC[k]+"66":t.border}`, color:o.status===k?SC[k]:t.sub, transition:"all .15s" }}>
                                {o.status===k?"✓ ":""}{l}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Сообщение клиенту */}
                        <div>
                          <div style={{ color:t.sub, fontSize:12, marginBottom:6, fontWeight:600 }}>📩 Сообщение клиенту (данные аккаунта, Gift-код и т.д.):</div>
                          <textarea
                            value={noteValues[o.id] !== undefined ? noteValues[o.id] : (o.operator_note || "")}
                            onChange={e => setNoteValues(prev => ({ ...prev, [o.id]: e.target.value }))}
                            placeholder={"Логин: user@mail.com\nПароль: SecurePass123\n\nили Gift-код: XXXX-XXXX-XXXX"}
                            rows={4}
                            style={{ width:"100%", background:t.inp, border:`1px solid ${t.border}`, borderRadius:10, padding:"10px 12px", color:t.text, fontSize:13, outline:"none", resize:"vertical", fontFamily:"monospace", lineHeight:1.6, boxSizing:"border-box", marginBottom:8 }}
                          />
                          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                            <button
                              onClick={()=>handleNoteSave(o.id, noteValues[o.id] ?? o.operator_note)}
                              disabled={saving===o.id}
                              style={{ padding:"9px 18px", borderRadius:10, background:"rgba(52,211,153,0.15)", border:"1px solid rgba(52,211,153,0.35)", color:"#6ee7b7", cursor:"pointer", fontSize:13, fontWeight:600, opacity:saving===o.id?.7:1 }}>
                              {saving===o.id ? "Сохраняем..." : "💾 Сохранить и уведомить клиента"}
                            </button>
                            <span style={{ color:t.muted, fontSize:11 }}>Клиент получит уведомление</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
        }
        </>}
      </div>

      {receiptModal && (
        <div style={{ position:"fixed",inset:0,zIndex:400,background:"rgba(0,0,0,0.92)",display:"flex",alignItems:"center",justifyContent:"center",padding:20 }} onClick={()=>setReceiptModal(null)}>
          <div onClick={e=>e.stopPropagation()} style={{ position:"relative", maxWidth:"90vw" }}>
            <button onClick={()=>setReceiptModal(null)} style={{ position:"absolute",top:-14,right:-14,background:"#f87171",border:"none",borderRadius:"50%",width:32,height:32,color:"white",cursor:"pointer",fontSize:16,fontWeight:700 }}>✕</button>
            <img src={receiptModal.url} alt="чек" style={{ maxWidth:"85vw", maxHeight:"85vh", borderRadius:12 }}/>
            <div style={{ textAlign:"center", marginTop:10 }}>
              <a href={receiptModal.url} download={receiptModal.name} style={{ color:"#fbbf24", fontSize:13, textDecoration:"none" }}>↓ Скачать</a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  CALCULATOR
// ══════════════════════════════════════════════════════════════
function Calculator({ rate, rateDate, rateLoading, t }) {
  const [usd, setUsd] = useState(20);
  const base  = rate ? Math.round(usd * rate) : 0;
  const comm  = rate ? Math.round(usd * rate * CFG.MARGIN) : 0;
  const total = base + comm;
  return (
    <div style={{ padding:"70px 24px", background:t.dark?"rgba(251,191,36,0.02)":"rgba(0,0,0,0.02)", borderTop:`1px solid ${t.border}`, borderBottom:`1px solid ${t.border}` }}>
      <div style={{ maxWidth:560, margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <div style={{ color:t.gold, fontSize:11, textTransform:"uppercase", letterSpacing:3, marginBottom:10, fontWeight:600 }}>Калькулятор</div>
          <h2 style={{ fontFamily:"'Clash Display',sans-serif", fontWeight:800, fontSize:30, color:t.text }}>Сколько это стоит?</h2>
        </div>
        <div style={{ background:t.card2, border:`1px solid ${t.border}`, borderRadius:22, padding:28, boxShadow:t.shadow }}>
          <label style={{ color:t.sub, fontSize:14, marginBottom:10, display:"block", fontWeight:500 }}>Сумма в долларах</label>
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:8 }}>
            <div style={{ background:t.goldDim, border:`1px solid ${t.goldB}`, borderRadius:12, padding:"13px 18px", color:t.gold, fontWeight:900, fontSize:20 }}>$</div>
            <input type="number" value={usd} min={1} max={5000} onChange={e=>setUsd(Math.max(1,Number(e.target.value)))}
              style={{ flex:1, background:t.inp, border:`1px solid ${t.border}`, borderRadius:12, padding:"13px 18px", color:t.text, fontSize:28, fontWeight:800, outline:"none" }}/>
          </div>
          <input type="range" min={1} max={2000} value={Math.min(usd,2000)} onChange={e=>setUsd(Number(e.target.value))} style={{ width:"100%", marginBottom:22, accentColor:t.gold }}/>
          <div style={{ background:t.goldDim, border:`1px solid ${t.goldB}`, borderRadius:16, padding:"20px 22px" }}>
            {rateLoading
              ? <div style={{ textAlign:"center", color:t.sub, padding:"12px 0" }}>⏳ Загружаем курс ЦБ...</div>
              : <>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}><span style={{ color:t.sub, fontSize:14 }}>Курс ЦБ на {rateDate}</span><span style={{ color:t.sub, fontSize:14, fontWeight:600 }}>1$ = {rate?.toFixed(2)} ₽</span></div>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:14 }}><span style={{ color:t.sub, fontSize:14 }}>Комиссия {Math.round(CFG.MARGIN*100)}%</span><span style={{ color:t.sub, fontSize:14, fontWeight:600 }}>+ {comm.toLocaleString("ru-RU")} ₽</span></div>
                <div style={{ display:"flex", justifyContent:"space-between", borderTop:`2px solid ${t.goldB}`, paddingTop:14 }}><span style={{ color:t.text, fontWeight:700, fontSize:16 }}>Итого к оплате</span><span style={{ color:t.gold, fontWeight:900, fontSize:34, fontFamily:"'Clash Display',sans-serif" }}>{total.toLocaleString("ru-RU")} ₽</span></div>
              </>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  REQUEST SERVICE MODAL
// ══════════════════════════════════════════════════════════════
function RequestServiceModal({ onClose, user, t }) {
  const [name, setName] = useState("");
  const [url, setUrl]   = useState("");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr]   = useState("");

  const submit = async () => {
    if (!name.trim()) { setErr("Укажите название сервиса"); return; }
    setLoading(true);
    setErr("");
    const { error } = await supabase.from("service_requests").insert({
      user_id:      user?.id || null,
      user_email:   user?.email || null,
      service_name: name.trim(),
      service_url:  url.trim() || null,
      comment:      comment.trim() || null,
    });
    setLoading(false);
    if (error) { setErr("Ошибка: " + error.message); return; }
    setDone(true);
  };

  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",backdropFilter:"blur(12px)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:16 }} onClick={onClose}>
      <div className="modal-inner" style={{ background:t.dark?"#12121f":"#ffffff",border:`1px solid ${t.border}`,borderRadius:24,padding:28,maxWidth:480,width:"100%",boxShadow:"0 24px 80px rgba(0,0,0,0.5)" }} onClick={e=>e.stopPropagation()}>
        {done ? (
          <div style={{ textAlign:"center",padding:"16px 0" }}>
            <div style={{ fontSize:48,marginBottom:16 }}>✅</div>
            <div style={{ fontFamily:"'Clash Display',sans-serif",fontWeight:800,fontSize:20,color:t.text,marginBottom:8 }}>Запрос отправлен!</div>
            <div style={{ color:t.sub,fontSize:14,marginBottom:24,lineHeight:1.6 }}>Мы рассмотрим его и добавим сервис в каталог.</div>
            <button onClick={onClose} style={{ padding:"12px 28px",borderRadius:12,background:"linear-gradient(135deg,#f59e0b,#fbbf24)",border:"none",color:"#0a0a14",fontWeight:700,fontSize:14,cursor:"pointer" }}>Отлично</button>
          </div>
        ) : (
          <>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}>
              <div style={{ fontFamily:"'Clash Display',sans-serif",fontWeight:800,fontSize:20,color:t.text }}>💡 Запросить сервис</div>
              <button onClick={onClose} style={{ background:"none",border:"none",cursor:"pointer",color:t.muted,fontSize:20,lineHeight:1 }}>×</button>
            </div>
            <div style={{ color:t.sub,fontSize:13,marginBottom:20 }}>Не нашли нужный сервис? Оставьте запрос — мы добавим его в каталог.</div>
            {err && <Alert type="error" t={t}>{err}</Alert>}
            <div style={{ marginBottom:12 }}>
              <FieldLabel t={t}>Название сервиса *</FieldLabel>
              <input value={name} onChange={e=>setName(e.target.value)} placeholder="Например: Notion AI" style={{ width:"100%",background:t.inp,border:`1px solid ${t.border}`,borderRadius:10,padding:"12px 14px",color:t.text,fontSize:14,outline:"none",boxSizing:"border-box" }}/>
            </div>
            <div style={{ marginBottom:12 }}>
              <FieldLabel t={t}>Ссылка на сайт (необязательно)</FieldLabel>
              <input value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://notion.so" style={{ width:"100%",background:t.inp,border:`1px solid ${t.border}`,borderRadius:10,padding:"12px 14px",color:t.text,fontSize:14,outline:"none",boxSizing:"border-box" }}/>
            </div>
            <div style={{ marginBottom:20 }}>
              <FieldLabel t={t}>Комментарий (необязательно)</FieldLabel>
              <textarea value={comment} onChange={e=>setComment(e.target.value)} placeholder="Какой тариф нужен? Для чего используете?" rows={3} style={{ width:"100%",background:t.inp,border:`1px solid ${t.border}`,borderRadius:10,padding:"12px 14px",color:t.text,fontSize:14,outline:"none",resize:"vertical",boxSizing:"border-box" }}/>
            </div>
            <button onClick={submit} disabled={loading||!name.trim()} style={{ width:"100%",padding:"14px",borderRadius:12,background:loading||!name.trim()?"rgba(251,191,36,0.3)":"linear-gradient(135deg,#f59e0b,#fbbf24)",border:"none",color:"#0a0a14",fontWeight:700,fontSize:15,cursor:loading||!name.trim()?"not-allowed":"pointer" }}>
              {loading ? "Отправляем..." : "Отправить запрос"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  FAQ SECTION
// ══════════════════════════════════════════════════════════════
function FaqSection({ t }) {
  const [open, setOpen] = useState(null);
  const items = [
    {q:"Как оплатить ChatGPT Plus в России?",a:"Выберите ChatGPT Plus в каталоге, оформите заявку и оплатите в рублях через СБП или перевод на карту. Активируем в течение 1 часа в рабочее время."},
    {q:"Безопасно ли передавать данные от аккаунта?",a:"Да. Данные хранятся в вашем личном кабинете и не передаются третьим лицам. При наличии 2FA можно выбрать активацию через подарочный код или добавление в семейный план."},
    {q:"Сколько ждать активации?",a:"В рабочее время — до 1 часа. В ночное время или выходные — до 24 часов. После активации придёт уведомление в кабинете."},
    {q:"Можно ли оплатить без регистрации?",a:"Нет. Регистрация нужна для отслеживания статуса заказа и хранения данных доступа в личном кабинете."},
    {q:"Что делать, если включена двухфакторная аутентификация (2FA)?",a:"Для сервисов с 2FA активируем через подарочный код (gift card) или добавление в семейный/командный план — без доступа к вашему аккаунту."},
    {q:"Какие банки поддерживаются для оплаты?",a:"Принимаем оплату через СБП и переводом на карту. Поддерживаются Тинькофф, Сбербанк, ВТБ и большинство российских банков."},
  ];
  return (
    <div style={{ padding:"0 24px 100px",maxWidth:740,margin:"0 auto" }}>
      <div style={{ textAlign:"center",marginBottom:36 }}>
        <div style={{ color:t.gold,fontSize:11,textTransform:"uppercase",letterSpacing:3,marginBottom:10,fontWeight:600 }}>FAQ</div>
        <h2 style={{ fontFamily:"'Clash Display',sans-serif",fontWeight:800,fontSize:30,color:t.text }}>Частые вопросы</h2>
      </div>
      <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
        {items.map((item,i)=>(
          <div key={i} style={{ background:t.card2,border:`1px solid ${open===i?t.borderH:t.border}`,borderRadius:14,overflow:"hidden",transition:"border-color 200ms" }}>
            <button onClick={()=>setOpen(open===i?null:i)} style={{ width:"100%",display:"flex",justifyContent:"space-between",alignItems:"center",padding:"18px 20px",background:"none",border:"none",color:t.text,cursor:"pointer",textAlign:"left",gap:12 }}>
              <span style={{ fontWeight:600,fontSize:14,lineHeight:1.4 }}>{item.q}</span>
              <span style={{ flexShrink:0,color:t.gold,transform:open===i?"rotate(180deg)":"none",transition:"transform 200ms",display:"inline-block" }}><IconChevronDown size={16} color={t.gold}/></span>
            </button>
            {open===i && (
              <div style={{ padding:"0 20px 18px",color:t.sub,fontSize:14,lineHeight:1.65 }}>{item.a}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  MAIN APP
// ══════════════════════════════════════════════════════════════
export default function App() {
  const { t, toggle } = useTheme();
  const [hash, go]    = useHash();
  const userHook      = useUser();
  const { session, profile, loading: userLoading, isAdmin } = userHook;

  const [scrolled, setScrolled]       = useState(false);
  const [rate, setRate]               = useState(null);
  const [rateLoading, setRateLoading] = useState(true);
  const [rateDate, setRateDate]       = useState("");
  const [search, setSearch]           = useState("");
  const [cat, setCat]                 = useState("Все");
  const [selSvc, setSelSvc]           = useState(null);
  const [showAuth, setShowAuth]       = useState(false);
  const [showReqSvc, setShowReqSvc]   = useState(false);
  const [mounted, setMounted]         = useState(false);
  const howRef = useRef(null);

  const { notifs, unread } = useNotifications(session?.user?.id);
  const { ordersCount } = usePublicStats();

  const page = hash.split("?")[0];

  useEffect(() => { setTimeout(() => setMounted(true), 80); }, []);

  // Курс ЦБ
  useEffect(() => {
    async function fetchRate() {
      setRateLoading(true);
      try {
        const r = await fetch("/api/rate");
        const d = await r.json();
        if (d?.rate) {
          setRate(parseFloat(d.rate));
          setRateDate(new Date().toLocaleDateString("ru-RU", { timeZone:"Europe/Moscow", day:"2-digit", month:"2-digit", year:"numeric" }));
        } else throw 0;
      } catch {
        try {
          const r2 = await fetch("https://api.exchangerate-api.com/v4/latest/USD");
          const d2 = await r2.json();
          if (d2?.rates?.RUB) { setRate(d2.rates.RUB); setRateDate(new Date().toLocaleDateString("ru-RU")); }
          else setRate(84.5);
        } catch { setRate(84.5); setRateDate(new Date().toLocaleDateString("ru-RU")); }
      } finally { setRateLoading(false); }
    }
    fetchRate();
    const iv = setInterval(fetchRate, 30 * 60 * 1000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const filteredSvc = SVC.filter(s => (cat==="Все"||s.cat===cat) && s.name.toLowerCase().includes(search.toLowerCase()));
  const POPULAR = SVC.filter(s => POPULAR_NAMES.includes(s.name));

  // Показываем заглушку пока грузится auth
  if (userLoading) return (
    <div style={{ minHeight:"100vh", background:"#07070f", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ fontFamily:"'Clash Display',sans-serif", color:"#fbbf24", fontSize:24, fontWeight:800 }}>pay<span style={{ color:"white" }}>flow</span></div>
    </div>
  );

  // Отдельные страницы
  if (page === "#admin") return (
    <div style={{ background:t.bg, minHeight:"100vh", fontFamily:"'Satoshi',sans-serif", color:t.text }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@400;500;600;700&display=swap');*{box-sizing:border-box;margin:0;padding:0}input::placeholder,textarea::placeholder{opacity:.4}`}</style>
      <AdminPanel userHook={userHook} go={go} t={t}/>
    </div>
  );

  if (page === "#legal") return <LegalPage go={go} t={t} />;
  if (page === "#cabinet") {
    if (!session) { go("#home"); return null; }
    return (
      <div style={{ background:t.bg, minHeight:"100vh", fontFamily:"'Satoshi',sans-serif", color:t.text }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@400;500;600;700&display=swap');*{box-sizing:border-box;margin:0;padding:0}input::placeholder,textarea::placeholder{opacity:.4}`}</style>
        <nav style={{ position:"fixed",top:0,left:0,right:0,zIndex:100,padding:"0 28px",height:60,display:"flex",alignItems:"center",justifyContent:"space-between",background:t.nav,backdropFilter:"blur(20px)",borderBottom:`1px solid ${t.border}` }}>
          <div onClick={()=>go("#home")} style={{ fontFamily:"'Clash Display',sans-serif",fontWeight:900,fontSize:20,cursor:"pointer",color:t.text }}>pay<span style={{ color:t.gold }}>flow</span></div>
          <div style={{ display:"flex",gap:8,alignItems:"center" }}>
            <button onClick={()=>go("#home")} style={{ padding:"7px 16px",borderRadius:100,fontSize:13,fontWeight:600,cursor:"pointer",background:"transparent",border:`1px solid ${t.border}`,color:t.sub }}>← Главная</button>
            <button onClick={toggle} style={{ width:36,height:36,borderRadius:100,background:t.card,border:`1px solid ${t.border}`,cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center" }}>{t.dark ? <IconSun color={t.sub}/> : <IconMoon color={t.sub}/>}</button>
          </div>
        </nav>
        <Cabinet userHook={userHook} go={go} t={t}/>
      </div>
    );
  }

  // Основной layout
  return (
    <div style={{ background:t.bg, minHeight:"100vh", fontFamily:"'Satoshi',sans-serif", color:t.text, transition:"background .3s,color .3s", overflowX:"hidden", width:"100%" }}>
      <style>{`
        @import url('https://api.fontshare.com/v2/css?f[]=clash-display@400,500,600,700&f[]=satoshi@400,500,700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:rgba(251,191,36,0.4);border-radius:3px}
        input::placeholder,textarea::placeholder{opacity:.4}
        @keyframes pulse{0%,100%{opacity:.4}50%{opacity:1}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-20px)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:none}}
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        @keyframes meshFloat1{0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(30px,-20px) scale(1.05)}66%{transform:translate(-20px,15px) scale(0.97)}}
        @keyframes meshFloat2{0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(-25px,20px) scale(1.03)}66%{transform:translate(15px,-25px) scale(0.98)}}
        @keyframes gradientBorder{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
        @keyframes countUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
        @keyframes cursorGlow{0%,100%{opacity:.6}50%{opacity:1}}
        @keyframes borderFlow{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
        @keyframes bounceIn{0%{transform:scale(0) rotate(-10deg)}60%{transform:scale(1.15) rotate(3deg)}80%{transform:scale(0.95)}100%{transform:scale(1) rotate(0deg)}}
        @keyframes slideInRight{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:none}}
        /* Stagger classes */
        .stagger-1{animation:fadeUp .6s .05s ease forwards;opacity:0}
        .stagger-2{animation:fadeUp .6s .1s ease forwards;opacity:0}
        .stagger-3{animation:fadeUp .6s .15s ease forwards;opacity:0}
        .stagger-4{animation:fadeUp .6s .2s ease forwards;opacity:0}
        .stagger-5{animation:fadeUp .6s .25s ease forwards;opacity:0}
        .stagger-6{animation:fadeUp .6s .3s ease forwards;opacity:0}
        /* Animated gradient border on CTA */
        .cta-primary{background:linear-gradient(135deg,#f59e0b,#fbbf24)!important;position:relative!important;isolation:isolate!important}
        .cta-primary::before{content:"";position:absolute;inset:-2px;borderRadius:inherit;background:linear-gradient(270deg,#f59e0b,#fde68a,#fbbf24,#f97316,#fbbf24);backgroundSize:300% 300%;animation:borderFlow 3s ease infinite;zIndex:-1;filter:blur(6px);opacity:.7}
        /* Magnetic button */
        .btn-magnetic{transition:transform 200ms cubic-bezier(0,0,.2,1)!important}
        /* Bento cards */
        .bento-lg{grid-column:span 2;grid-row:span 2}
        .bento-md{grid-column:span 1;grid-row:span 2}
        @media(max-width:640px){.bento-lg,.bento-md{grid-column:span 1!important;grid-row:span 1!important}}
        .a1{animation:fadeUp .7s ease forwards}
        .a2{animation:fadeUp .7s .1s ease forwards;opacity:0}
        .a3{animation:fadeUp .7s .2s ease forwards;opacity:0}
        .a4{animation:fadeUp .7s .3s ease forwards;opacity:0}
        .a5{animation:fadeUp .7s .4s ease forwards;opacity:0}
        .cg:hover .ci{opacity:.55}.ci{transition:all .25s!important}.cg .ci:hover{opacity:1!important;transform:translateY(-4px)!important}
        /* ── Mobile First (UI/UX skill: mobile-first, no horizontal scroll) ── */
        @media(max-width:640px){
          html,body,#root{overflow-x:hidden!important;max-width:100dvw!important;width:100%!important}
          /* Asymmetric hero → single column on mobile */
          [style*="gridTemplateColumns:"1fr 1fr""]{grid-template-columns:1fr!important}
          /* Bento grid → single col on mobile */
          [style*="gridTemplateColumns:"repeat(3"]{grid-template-columns:1fr!important}
          /* Hide/show classes */
          .mob-hide{display:none!important}
          .mob-show{display:inline-flex!important;align-items:center}
          /* Layout */
          .mob-col{flex-direction:column!important}
          .mob-full{width:100%!important;max-width:100%!important;box-sizing:border-box!important}
          /* Typography scale - min 16px on mobile (prevents iOS zoom) */
          body{font-size:16px!important}
          input,select,textarea{font-size:16px!important} /* Prevent iOS auto-zoom */
          h1{font-size:clamp(28px,7.5vw,52px)!important;letter-spacing:-1.5px!important;line-height:1.05!important}
          h2{font-size:clamp(22px,5.5vw,32px)!important}
          /* Nav - compact with 44px touch targets */
          nav{padding:0 10px!important}
          /* Modals - full-width minus padding */
          .modal-inner{max-width:calc(100dvw - 20px)!important;width:calc(100dvw - 20px)!important;padding:20px!important}
          /* Cards grid - single column */
          .card-grid,[class*="grid"]{grid-template-columns:1fr!important}
          /* Spacing */
          .mob-pad-sm{padding:76px 14px 40px!important}
        }
        @media(min-width:641px){
          .mob-show{display:none!important}
        }
        /* ── Focus states (accessibility: visible focus rings) ── */
        button:focus-visible,a:focus-visible,input:focus-visible,select:focus-visible,textarea:focus-visible{
          outline:2px solid #fbbf24!important;
          outline-offset:2px!important;
        }
        /* ── Cursor pointer on all interactive elements ── */
        button{cursor:pointer}
        /* ── Smooth scroll ── */
        html{scroll-behavior:smooth}
        /* ── Touch action for faster tap ── */
        button,a,[role="button"]{touch-action:manipulation}
      `}</style>

      {/* NAV */}
      <nav style={{ position:"fixed",top:0,left:0,right:0,zIndex:100,padding:"0 16px",height:60,display:"flex",alignItems:"center",justifyContent:"space-between",background:scrolled?t.nav:"transparent",backdropFilter:scrolled?"blur(20px)":"none",borderBottom:scrolled?`1px solid ${t.border}`:"none",transition:"all .3s",overflowX:"hidden" }}>
        <div onClick={()=>go("#home")} style={{ fontFamily:"'Clash Display',sans-serif",fontWeight:900,fontSize:20,cursor:"pointer",letterSpacing:-.5,color:t.text,flexShrink:0 }}>pay<span style={{ color:t.gold }}>flow</span></div>
        <div style={{ display:"flex",gap:4,alignItems:"center",flexShrink:0,flexWrap:"nowrap" }}>
          {/* Главная и Каталог — скрываем текст на мобиле */}
          {[["#home","🏠","Главная"],["#catalog","🔍","Каталог"]].map(([h,ic,l]) => (
            <button key={h} onClick={()=>go(h)} style={{ padding:"7px 12px",borderRadius:100,fontSize:13,fontWeight:600,cursor:"pointer",background:page===h?t.goldDim:"transparent",border:`1px solid ${page===h?t.goldB:"transparent"}`,color:page===h?t.gold:t.sub,transition:"all .2s",whiteSpace:"nowrap" }}>
              <span className="mob-hide">{l}</span>
              <span className="mob-show" style={{display:"flex",alignItems:"center"}}>{h==="#home"?<IconHome size={16} color="currentColor"/>:<IconGrid size={16} color="currentColor"/>}</span>
            </button>
          ))}
          {session ? (
            <>
              {isAdmin && <button onClick={()=>go("#admin")} style={{ padding:"6px 10px",borderRadius:100,fontSize:12,fontWeight:600,cursor:"pointer",background:"rgba(167,139,250,0.15)",border:"1px solid rgba(167,139,250,0.35)",color:"#c4b5fd",whiteSpace:"nowrap" }}>
                <span className="mob-hide" style={{display:"flex",alignItems:"center",gap:5}}><IconSettings size={14} color="currentColor"/> Админ</span>
                <span className="mob-show" style={{display:"flex"}}><IconSettings size={16} color="currentColor"/></span>
              </button>}
              {/* Колокольчик */}
              <button onClick={()=>go("#cabinet")} aria-label={`Уведомления${unread>0?" ("+unread+" непрочитанных)":""}`} style={{ width:44,height:44,borderRadius:100,background:t.card,border:`1px solid ${t.border}`,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",position:"relative",flexShrink:0 }}>
                <IconBell size={17} color={t.sub}/>
                {unread > 0 && (
                  <span style={{ background:"#f87171",color:"white",borderRadius:"50%",width:15,height:15,fontSize:8,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",position:"absolute",top:-2,right:-2,boxShadow:"0 0 0 2px "+t.bg }}>
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </button>
              {/* Кабинет */}
              <button onClick={()=>go("#cabinet")} style={{ padding:"6px 10px",borderRadius:100,fontSize:13,fontWeight:600,cursor:"pointer",background:t.card,border:`1px solid ${t.border}`,color:t.sub,display:"flex",alignItems:"center",gap:4,flexShrink:0 }}>
                <IconUser size={16} color={t.sub}/><span className="mob-hide" style={{ marginLeft:2 }}>{profile?.name?.split(" ")[0] || ""}</span>
              </button>
              {/* Выйти */}
              <button onClick={async()=>{ await userHook.logout(); go("#home"); }} style={{ padding:"6px 10px",borderRadius:100,fontSize:12,fontWeight:600,cursor:"pointer",background:"rgba(248,113,113,0.1)",border:"1px solid rgba(248,113,113,0.25)",color:"#f87171",flexShrink:0 }}>
                <span className="mob-hide" style={{display:"flex",alignItems:"center",gap:5}}><IconLogout size={14} color="#f87171"/> Выйти</span>
                <span className="mob-show" style={{display:"flex"}}><IconLogout size={16} color="#f87171"/></span>
              </button>
            </>
          ) : (
            <button onClick={()=>setShowAuth(true)} aria-label="Войти в аккаунт" style={{ padding:"7px 12px",borderRadius:100,fontSize:13,fontWeight:600,cursor:"pointer",background:t.goldDim,border:`1px solid ${t.goldB}`,color:t.gold,whiteSpace:"nowrap",minHeight:36 }}>Войти</button>
          )}
          <button onClick={toggle} aria-label={t.dark?"Переключить на светлую тему":"Переключить на тёмную тему"} style={{ width:44,height:44,borderRadius:100,background:t.card,border:`1px solid ${t.border}`,cursor:"pointer",fontSize:15,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>{t.dark ? <IconSun color={t.sub}/> : <IconMoon color={t.sub}/>}</button>
        </div>
      </nav>

      {/* HOME */}
      {page==="#home" && (
        <div>
          {/* HERO */}
          <div style={{ position:"relative",minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"90px 32px 60px",overflow:"hidden",width:"100%",boxSizing:"border-box" }}>
            <div style={{ position:"absolute",inset:0,pointerEvents:"none",overflow:"hidden" }}>
              {/* Gradient mesh orbs */}
              <div style={{ position:"absolute",top:"-10%",left:"-5%",width:700,height:700,borderRadius:"50%",background:t.dark?"radial-gradient(circle,rgba(251,191,36,0.09) 0%,transparent 65%)":"radial-gradient(circle,rgba(217,119,6,0.07) 0%,transparent 65%)",animation:"meshFloat1 12s ease-in-out infinite",filter:"blur(40px)" }}/>
              <div style={{ position:"absolute",top:"20%",right:"-10%",width:600,height:600,borderRadius:"50%",background:t.dark?"radial-gradient(circle,rgba(96,165,250,0.07) 0%,transparent 65%)":"radial-gradient(circle,rgba(59,130,246,0.05) 0%,transparent 65%)",animation:"meshFloat2 15s ease-in-out infinite",animationDelay:"-5s",filter:"blur(40px)" }}/>
              <div style={{ position:"absolute",bottom:"-5%",left:"30%",width:500,height:500,borderRadius:"50%",background:t.dark?"radial-gradient(circle,rgba(167,139,250,0.06) 0%,transparent 65%)":"radial-gradient(circle,rgba(139,92,246,0.04) 0%,transparent 65%)",animation:"meshFloat1 18s ease-in-out infinite",animationDelay:"-9s",filter:"blur(40px)" }}/>
              {/* Noise texture overlay */}
              <div style={{ position:"absolute",inset:0,opacity:t.dark?0.035:0.02,backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,backgroundSize:"128px 128px" }}/>
              {/* Grid */}
              <div style={{ position:"absolute",inset:0,backgroundImage:t.dark?"linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px)":"linear-gradient(rgba(0,0,0,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,0.04) 1px,transparent 1px)",backgroundSize:"64px 64px",maskImage:"radial-gradient(ellipse 80% 60% at 50% 50%,black 40%,transparent 100%)" }}/>
              {/* Floating service icons with parallax */}
              {[
                {ic:"🤖",x:"6%",y:"16%",size:32,speed:8,delay:0},
                {ic:"🎨",x:"88%",y:"12%",size:28,speed:10,delay:1.2},
                {ic:"🎬",x:"3%",y:"60%",size:24,speed:12,delay:2.1},
                {ic:"🎵",x:"92%",y:"55%",size:26,speed:9,delay:0.6},
                {ic:"💻",x:"12%",y:"82%",size:30,speed:11,delay:1.8},
                {ic:"🔒",x:"84%",y:"78%",size:22,speed:13,delay:3.2},
                {ic:"🦉",x:"48%",y:"6%",size:28,speed:7,delay:0.4},
                {ic:"💎",x:"52%",y:"92%",size:26,speed:14,delay:2.6},
              ].map((f,i) => (
                <div key={i} style={{ position:"absolute",left:f.x,top:f.y,fontSize:f.size,animation:`float ${f.speed}s ease-in-out infinite`,animationDelay:`${f.delay}s`,opacity:t.dark?.15:.1,filter:"drop-shadow(0 4px 8px rgba(0,0,0,0.3))",transition:"opacity .3s" }}>{f.ic}</div>
              ))}
            </div>

            {mounted && <>
              {/* ASYMMETRIC HERO */}
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:60,maxWidth:1100,width:"100%",alignItems:"center",textAlign:"left" }}>
                {/* Left — text */}
                <div style={{ display:"flex",flexDirection:"column",gap:0 }}>
                  <div className="a1" style={{ display:"inline-flex",alignSelf:"flex-start",alignItems:"center",gap:8,background:t.dark?"rgba(255,255,255,0.06)":"rgba(255,255,255,0.9)",border:`1px solid ${t.border}`,backdropFilter:"blur(12px)",borderRadius:100,padding:"8px 16px",marginBottom:28,fontSize:12,boxShadow:t.shadow }}>
                    {rateLoading?<span style={{ width:10,height:10,border:`2px solid ${t.border}`,borderTopColor:t.gold,borderRadius:"50%",display:"inline-block",animation:"spin .8s linear infinite" }}/>:<span style={{ width:7,height:7,borderRadius:"50%",background:"#22c55e",display:"inline-block",animation:"pulse 2s infinite",boxShadow:"0 0 8px rgba(34,197,94,0.6)" }}/>}
                    <span style={{ color:t.sub }}>Курс ЦБ на {rateDate}:</span>
                    <span style={{ color:t.gold,fontWeight:700 }}>{rateLoading?"загрузка...":`1$ = ${rate?.toFixed(2)} ₽`}</span>
                  </div>

                  <h1 className="a2" style={{ fontFamily:"'Clash Display',sans-serif",fontWeight:900,fontSize:"clamp(32px,3.8vw,64px)",lineHeight:1.03,letterSpacing:-2.5,marginBottom:20,color:t.text }}>
                    Оплати любой<br/>
                    <span style={{ color:t.gold,position:"relative",display:"inline-block" }}>
                      зарубежный
                      <span style={{ position:"absolute",bottom:0,left:0,right:0,height:4,background:`linear-gradient(90deg,${t.gold},rgba(251,191,36,0))`,borderRadius:2 }}/>
                    </span>
                    {" "}сервис<br/>за рубли
                  </h1>

                  <p className="a3" style={{ color:t.sub,fontSize:16,maxWidth:400,marginBottom:8,lineHeight:1.65 }}>ChatGPT, Midjourney, Netflix, Spotify и ещё 47 сервисов.</p>
                  <p className="a3" style={{ color:t.dark?"rgba(251,191,36,0.7)":"rgba(180,83,9,0.8)",fontSize:14,maxWidth:380,marginBottom:36,lineHeight:1.5,fontWeight:500 }}>
                    Комиссия {Math.round(CFG.MARGIN*100)}% — без скрытых платежей.
                  </p>

                  <div className="a4" style={{ display:"flex",gap:12,flexWrap:"wrap" }}>
                    <div style={{ position:"relative",display:"inline-block" }}>
                      <div style={{ position:"absolute",inset:-3,borderRadius:18,background:"linear-gradient(270deg,#f59e0b,#fde68a,#fbbf24,#f97316,#fbbf24)",backgroundSize:"300% 300%",animation:"borderFlow 3s ease infinite",filter:"blur(10px)",opacity:.8,zIndex:0 }}/>
                      <button onClick={()=>go("#catalog")} style={{ position:"relative",padding:"14px 28px",borderRadius:14,background:"linear-gradient(135deg,#f59e0b,#fbbf24)",border:"none",color:"#0a0a14",fontWeight:800,fontSize:15,cursor:"pointer",zIndex:1,transition:"transform 200ms" }}
                        onMouseEnter={e=>e.currentTarget.style.transform="translateY(-2px) scale(1.02)"}
                        onMouseLeave={e=>e.currentTarget.style.transform="none"}>
                        Смотреть сервисы →
                      </button>
                    </div>
                    <button onClick={()=>howRef.current?.scrollIntoView({behavior:"smooth"})} style={{ padding:"14px 28px",borderRadius:14,background:t.card,border:`1px solid ${t.border}`,color:t.sub,fontWeight:600,fontSize:15,cursor:"pointer",backdropFilter:"blur(10px)",transition:"all 200ms" }}
                      onMouseEnter={e=>{e.currentTarget.style.borderColor=t.borderH;e.currentTarget.style.color=t.text}}
                      onMouseLeave={e=>{e.currentTarget.style.borderColor=t.border;e.currentTarget.style.color=t.sub}}>
                      Как это работает?
                    </button>
                  </div>
                </div>

                {/* Right — floating service cards */}
                <div className="a3 mob-hide" style={{ position:"relative",height:400 }}>
                  <div style={{ position:"absolute",top:"10%",left:"50%",transform:"translateX(-50%)",width:280,height:280,borderRadius:"50%",background:t.dark?"radial-gradient(circle,rgba(251,191,36,0.08) 0%,transparent 70%)":"radial-gradient(circle,rgba(217,119,6,0.06) 0%,transparent 70%)",filter:"blur(20px)",animation:"meshFloat1 8s ease-in-out infinite" }}/>
                  {[
                    {name:"ChatGPT Plus",icon:"🤖",price:20,top:"2%",left:"5%",rotate:"-4deg",delay:"0s"},
                    {name:"Midjourney",icon:"🎨",price:10,top:"25%",left:"38%",rotate:"3deg",delay:"0.2s"},
                    {name:"Spotify",icon:"🎵",price:11.99,top:"52%",left:"2%",rotate:"-2deg",delay:"0.4s"},
                    {name:"Netflix",icon:"🎬",price:15.49,top:"68%",left:"35%",rotate:"4deg",delay:"0.6s"},
                  ].map((card,i)=>(
                    <div key={i} style={{ position:"absolute",top:card.top,left:card.left,transform:`rotate(${card.rotate})`,animation:`fadeUp .7s ${card.delay} ease forwards`,opacity:0,transition:"transform 250ms cubic-bezier(0,0,.2,1)" }}
                      onMouseEnter={e=>e.currentTarget.style.transform="scale(1.05) rotate(0deg)"}
                      onMouseLeave={e=>e.currentTarget.style.transform=`rotate(${card.rotate})`}>
                      <div style={{ background:t.dark?"rgba(14,14,26,0.95)":"rgba(255,255,255,0.97)",border:`1px solid ${t.border}`,borderRadius:16,padding:"14px 18px",backdropFilter:"blur(20px)",boxShadow:t.dark?"0 12px 40px rgba(0,0,0,0.6)":"0 8px 30px rgba(0,0,0,0.12)",minWidth:190 }}>
                        <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:10 }}>
                          <span style={{ fontSize:22 }}>{card.icon}</span>
                          <span style={{ fontFamily:"'Clash Display',sans-serif",fontWeight:700,fontSize:14,color:t.text }}>{card.name}</span>
                        </div>
                        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                          <span style={{ color:t.muted,fontSize:11 }}>от ${card.price}</span>
                          <span style={{ color:t.gold,fontWeight:800,fontSize:17,fontFamily:"'Clash Display',sans-serif" }}>
                            {rate?Math.round(card.price*rate*1.1).toLocaleString("ru-RU"):"—"} ₽
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div style={{ position:"absolute",bottom:"8%",right:"8%",width:64,height:64,borderRadius:"50%",background:`linear-gradient(135deg,rgba(251,191,36,0.9),rgba(245,158,11,0.7))`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,animation:"float 5s ease-in-out infinite",boxShadow:"0 8px 24px rgba(251,191,36,0.25)" }}>✅</div>
                </div>
              </div>

              {/* Stats */}
              <div className="a5" style={{ display:"flex",gap:10,flexWrap:"wrap",justifyContent:"flex-start",marginTop:52,maxWidth:1100,width:"100%" }}>
              <style>{`@media(max-width:640px){.stats-row{justify-content:center!important;margin-top:36px!important}}`}</style>
                {[
                  {v:"50 ",suf:"+",l:"сервисов",ic:"🌍"},
                  {v:"10" ,suf:"%",l:"комиссия",ic:"💸"},
                  {v:ordersCount !== null ? String(ordersCount) : "...", suf:"+",l:"заявок выполнено",ic:"✅"},
                  {v:"1 ",suf:" час",l:"среднее время",ic:"⚡"}
                ].map(({v,suf,l,ic},i)=>(
                  <div key={l} className={`stagger-${i+2}`} style={{ textAlign:"center",background:t.dark?"rgba(255,255,255,0.05)":"rgba(255,255,255,0.9)",border:`1px solid ${t.border}`,borderRadius:18,padding:"18px 24px",backdropFilter:"blur(12px)",boxShadow:t.shadow,transition:"transform 200ms cubic-bezier(0,0,.2,1),box-shadow 200ms" }}
                    onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-4px)";e.currentTarget.style.boxShadow=t.shadowG}}
                    onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow=t.shadow}}>
                    <div style={{ fontSize:24,marginBottom:8 }}>{ic}</div>
                    <div style={{ fontFamily:"'Clash Display',sans-serif",fontSize:26,fontWeight:800,color:t.gold,letterSpacing:-1 }}>
                      {v}{suf}
                    </div>
                    <div style={{ color:t.muted,fontSize:13,marginTop:3,fontWeight:500 }}>{l}</div>
                  </div>
                ))}
              </div>
            </>}
          </div>

          {/* POPULAR — Bento Grid */}
          <div style={{ padding:"0 24px 80px",maxWidth:1140,margin:"0 auto" }}>
            <div style={{ textAlign:"center",marginBottom:40 }}>
              <div style={{ color:t.gold,fontSize:11,textTransform:"uppercase",letterSpacing:3,marginBottom:10,fontWeight:600 }}>Популярное</div>
              <h2 style={{ fontFamily:"'Clash Display',sans-serif",fontWeight:800,fontSize:32,color:t.text,marginBottom:8 }}>Часто заказывают</h2>
              <p style={{ color:t.muted,fontSize:15 }}>Нажмите чтобы оформить заявку</p>
            </div>
            {/* Bento layout — first card big, rest normal */}
            <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gridTemplateRows:"auto",gap:14 }}>
              {POPULAR.map((s,i) => {
                const isBig = i === 0;
                const base = rate ? Math.round(s.tiers[0].p * rate * (1+CFG.MARGIN)) : 0;
                return (
                  <div key={s.id}
                    style={{ gridColumn:isBig?"span 2":"span 1",gridRow:isBig?"span 2":"span 1",background:t.dark?"rgba(255,255,255,0.04)":"rgba(255,255,255,0.85)",border:`1px solid ${t.border}`,borderRadius:isBig?22:18,padding:isBig?28:20,cursor:"pointer",transition:"transform 200ms cubic-bezier(0,0,.2,1),box-shadow 200ms,border-color 200ms",position:"relative",overflow:"hidden" }}
                    onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow=t.dark?"0 12px 40px rgba(251,191,36,0.12)":"0 12px 40px rgba(0,0,0,0.12)";e.currentTarget.style.borderColor=t.borderH}}
                    onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="none";e.currentTarget.style.borderColor=t.border}}
                    onClick={()=>setSelSvc(s)}>
                    {/* Bg glow on big card */}
                    {isBig && <div style={{ position:"absolute",top:-40,right:-40,width:200,height:200,borderRadius:"50%",background:"radial-gradient(circle,rgba(251,191,36,0.1) 0%,transparent 70%)",pointerEvents:"none" }}/>}
                    <div style={{ display:"flex",alignItems:"flex-start",gap:12,marginBottom:isBig?20:12 }}>
                      <span style={{ fontSize:isBig?40:26,filter:t.dark?"drop-shadow(0 2px 8px rgba(251,191,36,0.3))":"none" }}>{s.icon}</span>
                      <div>
                        <div style={{ fontFamily:"'Clash Display',sans-serif",fontWeight:700,fontSize:isBig?20:15,color:t.text }}>{s.name}</div>
                        <div style={{ color:t.muted,fontSize:12,marginTop:2 }}>{s.cat}</div>
                      </div>
                    </div>
                    {isBig && <p style={{ color:t.sub,fontSize:14,lineHeight:1.6,marginBottom:20 }}>Самый популярный сервис. Активируем через логин/пароль или создадим новый аккаунт.</p>}
                    <div style={{ display:"flex",gap:6,flexWrap:"wrap",marginBottom:isBig?20:12 }}>
                      {s.tiers.slice(0, isBig?3:2).map((tier,j) => (
                        <div key={j} style={{ background:t.goldDim,border:`1px solid ${t.goldB}`,borderRadius:8,padding:"5px 10px" }}>
                          <div style={{ color:t.muted,fontSize:10 }}>{tier.n}</div>
                          <div style={{ color:t.gold,fontWeight:700,fontSize:12 }}>${tier.p} <span style={{ color:t.muted,fontWeight:400,fontSize:10 }}>≈{rate?Math.round(tier.p*rate*(1+CFG.MARGIN)).toLocaleString("ru-RU"):"..."}₽</span></div>
                        </div>
                      ))}
                    </div>
                    <div style={{ display:"inline-flex",alignItems:"center",gap:6,padding:isBig?"10px 18px":"7px 14px",borderRadius:100,background:t.goldDim,border:`1px solid ${t.goldB}`,color:t.gold,fontSize:isBig?14:12,fontWeight:600 }}>
                      Оформить заявку →
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ textAlign:"center",marginTop:28 }}>
              <button onClick={()=>go("#catalog")}
                style={{ padding:"12px 28px",borderRadius:100,background:t.goldDim,border:`1px solid ${t.goldB}`,color:t.gold,cursor:"pointer",fontSize:14,fontWeight:600,transition:"all 200ms" }}
                onMouseEnter={e=>{e.currentTarget.style.background=t.gold;e.currentTarget.style.color="#0a0a14"}}
                onMouseLeave={e=>{e.currentTarget.style.background=t.goldDim;e.currentTarget.style.color=t.gold}}>
                Все {SVC.length} сервисов →
              </button>
            </div>
          </div>

          <Calculator rate={rate} rateDate={rateDate} rateLoading={rateLoading} t={t}/>

          {/* HOW IT WORKS */}
          <div ref={howRef} style={{ padding:"80px 24px 100px",maxWidth:940,margin:"0 auto" }}>
            <div style={{ textAlign:"center",marginBottom:50 }}>
              <div style={{ color:t.gold,fontSize:11,textTransform:"uppercase",letterSpacing:3,marginBottom:10,fontWeight:600 }}>Процесс</div>
              <h2 style={{ fontFamily:"'Clash Display',sans-serif",fontWeight:800,fontSize:34,color:t.text }}>Как это работает</h2>
            </div>
            <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:2,position:"relative" }}>
              {/* Connecting line */}
              <div style={{ position:"absolute",top:40,left:"12%",right:"12%",height:1,background:`linear-gradient(90deg,transparent,${t.goldB},transparent)`,display:"block" }} className="mob-hide"/>
              {[
                {n:"01",icon:"🔐",title:"Регистрируешься",  desc:"Создаёшь кабинет — заявки, статусы и уведомления в одном месте."},
                {n:"02",icon:"🔍",title:"Выбираешь сервис",  desc:"Находишь нужный сервис. Цена в рублях видна сразу."},
                {n:"03",icon:"💳",title:"Оплачиваешь",       desc:"Переводишь по СБП или карте. Загружаешь чек."},
                {n:"04",icon:"🚀",title:"Получаешь доступ",  desc:"Активируем до 1 часа. Данные приходят в личный кабинет."},
              ].map((s,i) => (
                <div key={s.n} className={`stagger-${i+1}`} style={{ background:t.card2,border:`1px solid ${t.border}`,borderRadius:20,padding:"28px 22px",position:"relative",overflow:"hidden",boxShadow:t.shadow,transition:"transform 200ms cubic-bezier(0,0,.2,1),box-shadow 200ms",margin:"0 6px" }}
                  onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-6px)";e.currentTarget.style.boxShadow=t.dark?"0 20px 60px rgba(251,191,36,0.1)":"0 20px 60px rgba(0,0,0,0.1)"}}
                  onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow=t.shadow}}>
                  {/* Step number badge */}
                  <div style={{ width:44,height:44,borderRadius:"50%",background:t.goldDim,border:`1px solid ${t.goldB}`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Clash Display',sans-serif",fontWeight:800,fontSize:15,color:t.gold,marginBottom:18 }}>{s.n}</div>
                  {/* Background number watermark */}
                  <div style={{ position:"absolute",top:8,right:12,fontFamily:"'Clash Display',sans-serif",color:t.dark?"rgba(251,191,36,0.06)":"rgba(217,119,6,0.07)",fontSize:72,fontWeight:900,lineHeight:1,pointerEvents:"none" }}>{s.n}</div>
                  <div style={{ fontWeight:700,fontSize:16,marginBottom:10,color:t.text,letterSpacing:-0.3 }}>{s.title}</div>
                  <div style={{ color:t.sub,fontSize:14,lineHeight:1.65 }}>{s.desc}</div>
                  {/* Accent dot */}
                  <div style={{ position:"absolute",bottom:0,left:0,right:0,height:3,background:`linear-gradient(90deg,${t.gold},rgba(251,191,36,0))`,borderRadius:"0 0 20px 20px",opacity:0.6 }}/>
                </div>
              ))}
            </div>
          </div>

          {/* TRUST BADGES */}
          <div style={{ padding:"0 24px 80px",maxWidth:940,margin:"0 auto" }}>
            <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:14 }}>
              {[
                {icon:"📊",title:"Курс ЦБ РФ",desc:"Конвертируем по официальному курсу без накрутки на курс"},
                {icon:"⚡",title:"Оплата по СБП",desc:"Мгновенный перевод через систему быстрых платежей"},
                {icon:"🔐",title:"Данные в кабинете",desc:"Доступ к сервису появляется в личном кабинете, не в Telegram"},
                {icon:"🛡️",title:"Возврат за 24 часа",desc:"Если не активировали — полный возврат средств"},
              ].map((b,i)=>(
                <div key={i} style={{ background:t.card2,border:`1px solid ${t.border}`,borderRadius:18,padding:"22px 20px",display:"flex",alignItems:"flex-start",gap:14 }}>
                  <div style={{ width:42,height:42,borderRadius:12,background:t.goldDim,border:`1px solid ${t.goldB}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0 }}>{b.icon}</div>
                  <div>
                    <div style={{ fontWeight:700,fontSize:14,color:t.text,marginBottom:4 }}>{b.title}</div>
                    <div style={{ color:t.sub,fontSize:13,lineHeight:1.55 }}>{b.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* REVIEWS */}
          <div style={{ padding:"0 24px 80px",maxWidth:940,margin:"0 auto" }}>
            <div style={{ textAlign:"center",marginBottom:36 }}>
              <div style={{ color:t.gold,fontSize:11,textTransform:"uppercase",letterSpacing:3,marginBottom:10,fontWeight:600 }}>Отзывы</div>
              <h2 style={{ fontFamily:"'Clash Display',sans-serif",fontWeight:800,fontSize:30,color:t.text }}>Что говорят пользователи</h2>
            </div>
            <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:14 }}>
              {[
                {name:"Алексей М.",svc:"ChatGPT Plus",rating:5,text:"Оформил за 20 минут, всё чётко. Уже 3-й раз покупаю — каждый раз быстро и без проблем.",date:"март 2026"},
                {name:"Дарья К.",svc:"Midjourney",rating:5,text:"Искала где купить Midjourney в России — нашла здесь. Активировали за полчаса, всё работает.",date:"март 2026"},
                {name:"Игорь В.",svc:"Cursor Pro",rating:5,text:"Удобно, что цена сразу в рублях. Оплатил по СБП, через 40 минут пришли данные в кабинет.",date:"апрель 2026"},
              ].map((r,i)=>(
                <div key={i} style={{ background:t.card2,border:`1px solid ${t.border}`,borderRadius:18,padding:"22px 20px" }}>
                  <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12 }}>
                    <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                      <div style={{ width:36,height:36,borderRadius:"50%",background:`linear-gradient(135deg,${t.gold},#f97316)`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:14,color:"#0a0a14",flexShrink:0 }}>{r.name[0]}</div>
                      <div>
                        <div style={{ fontWeight:700,fontSize:13,color:t.text }}>{r.name}</div>
                        <div style={{ color:t.muted,fontSize:11 }}>{r.svc}</div>
                      </div>
                    </div>
                    <div style={{ color:t.gold,fontSize:13,letterSpacing:1 }}>{"★".repeat(r.rating)}</div>
                  </div>
                  <p style={{ color:t.sub,fontSize:13,lineHeight:1.65,marginBottom:10 }}>{r.text}</p>
                  <div style={{ color:t.muted,fontSize:11 }}>{r.date}</div>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ */}
          <FaqSection t={t}/>

        </div>
      )}

      {/* CATALOG */}
      {page==="#catalog" && (
        <div style={{ maxWidth:1160,margin:"0 auto",padding:"80px 14px 60px",width:"100%",boxSizing:"border-box" }}>
          <div style={{ marginBottom:30, display:"flex", justifyContent:"space-between", alignItems:"flex-end", flexWrap:"wrap", gap:12 }}>
            <div>
              <div style={{ color:t.gold,fontSize:11,textTransform:"uppercase",letterSpacing:3,marginBottom:8,fontWeight:600 }}>Каталог</div>
              <h2 style={{ fontFamily:"'Clash Display',sans-serif",fontWeight:800,fontSize:32,marginBottom:6,color:t.text }}>Все сервисы</h2>
              <div style={{ color:t.sub,fontSize:14 }}>{SVC.length} сервисов · <span style={{ color:t.gold, fontWeight:600 }}>1$ = {rateLoading?"...":`${rate?.toFixed(2)} ₽`}</span> · <span style={{ color:t.muted }}>с комиссией {Math.round(CFG.MARGIN*100)}%</span></div>
            </div>
            {/* Live indicator */}
            <div style={{ display:"inline-flex",alignItems:"center",gap:6,padding:"6px 14px",borderRadius:100,background:t.goldDim,border:`1px solid ${t.goldB}`,fontSize:12,color:t.gold,fontWeight:600 }}>
              <span style={{ width:6,height:6,borderRadius:"50%",background:"#22c55e",display:"inline-block",animation:"pulse 2s infinite",boxShadow:"0 0 6px rgba(34,197,94,0.6)" }}/>
              Цены обновлены сегодня
            </div>
          </div>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍  Поиск по названию..." style={{ width:"100%",background:t.card2,border:`1px solid ${t.border}`,borderRadius:14,padding:"14px 18px",color:t.text,fontSize:15,outline:"none",marginBottom:16,boxShadow:t.shadow }}/>
          <div style={{ display:"flex",gap:8,flexWrap:"wrap",marginBottom:26 }}>
            {CATS.map(c=>{ const cnt=SVC.filter(s=>c==="Все"||s.cat===c).length; return <button key={c} onClick={()=>setCat(c)} style={{ padding:"8px 16px",borderRadius:100,fontSize:13,fontWeight:600,cursor:"pointer",background:cat===c?t.goldDim:t.card,border:`1px solid ${cat===c?t.goldB:t.border}`,color:cat===c?t.gold:t.sub,transition:"all .15s" }}>{c} <span style={{ opacity:.55 }}>({cnt})</span></button>; })}
          </div>
          <div className="cg card-grid" style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:14 }}>
            {filteredSvc.map(s=><div key={s.id} className="ci"><SCard s={s} rate={rate} onSelect={setSelSvc} t={t}/></div>)}
          </div>
          {filteredSvc.length===0 && <div style={{ textAlign:"center",padding:"80px 0",color:t.muted }}><div style={{ fontSize:48,marginBottom:12 }}>🔍</div>Ничего не найдено</div>}

          {/* Баннер запроса сервиса */}
          <div style={{ marginTop:40,background:t.dark?"rgba(251,191,36,0.06)":"rgba(251,191,36,0.08)",border:`1px solid ${t.goldB}`,borderRadius:18,padding:"24px 28px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:16,flexWrap:"wrap" }}>
            <div>
              <div style={{ fontWeight:700,fontSize:15,color:t.text,marginBottom:4 }}>Не нашли нужный сервис?</div>
              <div style={{ color:t.sub,fontSize:13 }}>Оставьте запрос — добавим в каталог в течение нескольких дней.</div>
            </div>
            <button onClick={()=>session?setShowReqSvc(true):setShowAuth(true)} style={{ padding:"11px 22px",borderRadius:12,background:"linear-gradient(135deg,#f59e0b,#fbbf24)",border:"none",color:"#0a0a14",fontWeight:700,fontSize:13,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0 }}>
              💡 Запросить сервис
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      {selSvc && <OrderModal s={selSvc} rate={rate} user={session?.user} profile={profile} onClose={()=>setSelSvc(null)} onSave={async(order)=>{ const {data,error}=await sbOrders.insert(order); if(!error&&data){ fetch("/api/tg-notify",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message:`🆕 <b>Новая заявка</b> ${data.id}\n📦 ${data.service} · ${data.tier}\n💰 ${data.price_rub?.toLocaleString("ru-RU")} ₽\n👤 ${data.user_email}`})}).catch(()=>{}); } return {data,error}; }} go={go} t={t}/>}
      {showAuth && <AuthModal onClose={()=>setShowAuth(false)} userHook={userHook} t={t}/>}
      {showReqSvc && <RequestServiceModal onClose={()=>setShowReqSvc(false)} user={session?.user} t={t}/>}

      {/* Footer */}
      <div style={{ borderTop:`1px solid ${t.border}`,padding:"32px",background:t.dark?"rgba(0,0,0,0.3)":"rgba(0,0,0,0.02)" }}>
        <div style={{ maxWidth:1160,margin:"0 auto",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:16 }}>
          <div>
            <div style={{ fontFamily:"'Clash Display',sans-serif",fontWeight:800,fontSize:20,color:t.text,marginBottom:4 }}>pay<span style={{ color:t.gold }}>flow</span></div>
            <div style={{ color:t.muted,fontSize:12 }}>Оплата зарубежных сервисов · 2026</div>
	      <button onClick={()=>go("#legal")} style={{ background:"none", border:"none", color:t.muted, fontSize:13, cursor:"pointer", textDecoration:"underline" }}>Оферта</button>
          </div>
          <div style={{ display:"flex",gap:16,alignItems:"center",flexWrap:"wrap" }}>
            <button onClick={()=>go("#catalog")} style={{ background:"none",border:"none",color:t.muted,fontSize:13,cursor:"pointer",transition:"color 200ms" }} onMouseEnter={e=>e.currentTarget.style.color=t.text} onMouseLeave={e=>e.currentTarget.style.color=t.muted}>Каталог</button>
            <button onClick={()=>go("#legal")} style={{ background:"none",border:"none",color:t.muted,fontSize:13,cursor:"pointer",transition:"color 200ms" }} onMouseEnter={e=>e.currentTarget.style.color=t.text} onMouseLeave={e=>e.currentTarget.style.color=t.muted}>Оферта</button>
            <button onClick={()=>go("#cabinet")} style={{ background:"none",border:"none",color:t.muted,fontSize:13,cursor:"pointer",transition:"color 200ms" }} onMouseEnter={e=>e.currentTarget.style.color=t.text} onMouseLeave={e=>e.currentTarget.style.color=t.muted}>Личный кабинет</button>
            <div style={{ display:"flex",alignItems:"center",gap:6,padding:"6px 12px",borderRadius:100,background:t.goldDim,border:`1px solid ${t.goldB}` }}>
              <span style={{ width:6,height:6,borderRadius:"50%",background:"#22c55e",display:"inline-block",animation:"pulse 2s infinite" }}/>
              <span style={{ color:t.gold,fontSize:11,fontWeight:600 }}>Работаем 7/24</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
