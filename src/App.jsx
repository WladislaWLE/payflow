// ── Настройки ──────────────────────────────────


import LegalPage from "./pages/LegalPage";
import { useState, useEffect, useRef, useCallback, memo, lazy, Suspense } from "react";
import { SVC, toSlug } from "./data/services";
import { supabase, auth as sbAuth, profiles, storage as sbStorage, referrals as sbReferrals, reviews as sbReviews } from "./lib/supabase";
import { POPULAR_NAMES, SL, SC, SE, calcDiscount, checkPromocode, getSetting } from "./lib/appConstants";
import { useOrders } from "./hooks/useOrders";
import { useNotifications } from "./hooks/useNotifications";
import { StatusBadge, Skeleton, OrderSkeleton, ActivationTimer, OrderProgress, Badge, Alert, FieldLabel, IconDownload } from "./components/shared";

const CabinetPage = lazy(() => import("./pages/CabinetPage"));
const AdminPage   = lazy(() => import("./pages/AdminPage"));


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

const IconTrendUp  = ({size=20,color="currentColor"}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>;
const IconZap      = ({size=20,color="currentColor"}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
const IconLock     = ({size=20,color="currentColor"}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const IconShield   = ({size=20,color="currentColor"}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const IconKey      = ({size=20,color="currentColor"}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>;
const IconCreditCard=({size=20,color="currentColor"}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="22" height="16" x="1" y="4" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>;
const IconRefund   = ({size=20,color="currentColor"}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>;

// ══════════════════════════════════════════════════════════════
//  КОНФИГ
// ══════════════════════════════════════════════════════════════
const CFG = {
  MARGIN: 0.15,
};

// Реквизиты хранятся в Supabase settings (ключ "requisites"), загружаются в App()
// Fallback — минимальный набор на случай ошибки загрузки
const DEFAULT_REQUISITES = [
  { label:"ВТБ",        sbp:"",  card:"", holder:"" },
  { label:"МТС Деньги", sbp:"",  card:"", holder:"" },
];

// ══════════════════════════════════════════════════════════════
//  УТИЛИТЫ
// ══════════════════════════════════════════════════════════════
const calc    = (usd, r) => Math.round(usd * r * (1 + CFG.MARGIN));
const ruDate  = () => new Date().toLocaleString("ru-RU", { timeZone: "Europe/Moscow" });
const randId  = () => "#" + Math.floor(10000 + Math.random() * 90000);
const randReq = (reqs) => reqs[Math.floor(Math.random() * reqs.length)];

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
//  СЕРВИСЫ — данные в src/data/services.js
// ══════════════════════════════════════════════════════════════
// SVC и toSlug импортированы из ./data/services

const CATS = ["Все","AI","Разработка","Дизайн","Стриминг","Музыка","Продуктивность","Инструменты","Обучение","Игры"];

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
  // Canonical fintech/crypto dark palette (UI/UX Pro Max: Fintech/Crypto color system)
  const t = {
    dark,
    bg:     dark ? "#0f172a"               : "#f1f5f9",
    card:   dark ? "rgba(34,39,53,0.6)"    : "rgba(255,255,255,0.85)",
    card2:  dark ? "#1e2537"               : "#ffffff",
    border: dark ? "#334155"               : "rgba(0,0,0,0.09)",
    borderH:dark ? "rgba(251,191,36,0.6)"  : "rgba(217,119,6,0.65)",
    text:   dark ? "#f8fafc"               : "#0f172a",
    sub:    dark ? "#94a3b8"               : "rgba(0,0,0,0.55)",
    muted:  dark ? "#64748b"               : "rgba(0,0,0,0.38)",
    nav:    dark ? "rgba(15,23,42,0.9)"    : "rgba(241,245,249,0.92)",
    inp:    dark ? "rgba(51,65,85,0.5)"    : "rgba(0,0,0,0.05)",
    gold:   "#fbbf24", goldD:"#f59e0b",
    goldDim:dark ? "rgba(251,191,36,0.1)"  : "rgba(217,119,6,0.08)",
    goldB:  dark ? "rgba(251,191,36,0.3)"  : "rgba(217,119,6,0.35)",
    shadow: dark ? "0 8px 40px rgba(0,0,0,0.5)" : "0 4px 24px rgba(0,0,0,0.08)",
    shadowG:"0 8px 32px rgba(251,191,36,0.22)",
  };
  return { t, toggle };
}

// ══════════════════════════════════════════════════════════════
//  HOOK: определяем мобильный экран (≤ 640px)
// ══════════════════════════════════════════════════════════════
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 640);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const fn = (e) => setIsMobile(e.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);
  return isMobile;
}

// UI primitives импортированы из ./components/shared

// ══════════════════════════════════════════════════════════════
//  HOOK: текущий пользователь + профиль
// ══════════════════════════════════════════════════════════════
function useUser() {
  const [session, setSession]   = useState(null);
  const [profile, setProfile]   = useState(null);
  const [loading, setLoading]   = useState(true);

  // Захватываем реф-код из URL (?ref=XXXXXX) при открытии сайта
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search || window.location.hash.split("?")[1] || "");
      const ref = params.get("ref");
      if (ref && /^[A-Z0-9]{4,12}$/.test(ref.toUpperCase())) {
        localStorage.setItem("pf_ref", ref.toUpperCase());
      }
    } catch {}
  }, []);

  useEffect(() => {
    // Подписываемся до getSession — чтобы не пропустить SIGNED_IN от email confirmation
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (session) {
        loadProfile(session.user.id);
        if (event === "SIGNED_IN") {
          // Сохраняем реф-код и имя сразу при наличии сессии
          // (корректно работает и при обычном входе, и после подтверждения email)
          const refCode = localStorage.getItem("pf_ref");
          const pendingName = localStorage.getItem("pf_pending_name");
          if (refCode || pendingName) {
            setTimeout(async () => {
              const updates = {};
              if (pendingName) { updates.name = pendingName; localStorage.removeItem("pf_pending_name"); }
              if (refCode)     { updates.referred_by_code = refCode; localStorage.removeItem("pf_ref"); }
              await profiles.update(session.user.id, updates);
            }, 800);
          }
          // После подтверждения почты или входа по magic link — редиректим на главную
          const params = new URLSearchParams(window.location.search);
          const isAuthCallback = params.has("token_hash") || params.has("code") ||
            window.location.hash.includes("access_token");
          if (isAuthCallback) {
            window.history.replaceState(null, "", window.location.pathname);
            window.location.hash = "#home";
          }
        }
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    // Получаем текущую сессию (если уже залогинен)
    // Таймаут-fallback на мобильных: если Supabase не ответил за 5с — снимаем заставку
    const sessionTimeout = setTimeout(() => setLoading(false), 5000);
    supabase.auth.getSession().then(({ data: { session } }) => {
      clearTimeout(sessionTimeout);
      setSession(session);
      if (session) loadProfile(session.user.id);
      else setLoading(false);
    }).catch(() => {
      clearTimeout(sessionTimeout);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadProfile = async (userId) => {
    try {
      const { data } = await profiles.get(userId);
      setProfile(data);
    } catch (e) {
      console.error("loadProfile error:", e);
    } finally {
      setLoading(false);
    }
  };

  const reloadProfile = async (userId) => {
    const { data } = await profiles.get(userId);
    setProfile(data);
  };

  const isAdmin = profile?.is_admin === true;

  const register = async (name, email, password) => {
    // Сохраняем имя в localStorage — применим при SIGNED_IN (после подтверждения email)
    localStorage.setItem("pf_pending_name", name.trim());
    const { data, error } = await sbAuth.signUp(email, password, name);
    if (error) {
      localStorage.removeItem("pf_pending_name");
      return { error: error.message };
    }
    return { ok: true };
  };

  const login = async (email, password) => {
    const { data, error } = await sbAuth.signIn(email, password);
    if (error) return { error: "Неверный email или пароль" };
    return { ok: true };
  };

  const logout = async () => { await sbAuth.signOut(); };

  return { session, profile, loading, isAdmin, register, login, logout, reloadProfile };
}

// ══════════════════════════════════════════════════════════════
//  HOOK: живые отзывы
// ══════════════════════════════════════════════════════════════
function useReviews() {
  const [reviewsList, setReviewsList] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  useEffect(() => {
    sbReviews.getApproved().then(({ data }) => {
      setReviewsList(data || []);
      setReviewsLoading(false);
    });
  }, []);
  return { reviewsList, reviewsLoading };
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

// useNotifications и useOrders импортированы из ./hooks/

// ══════════════════════════════════════════════════════════════
//  SERVICE CARD
// ══════════════════════════════════════════════════════════════
const SCard = memo(function SCard({ s, rate, onSelect, t }) {
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} onClick={()=>onSelect(s)}
      style={{ background:hov?t.card2:t.card,border:`1px solid ${hov?t.borderH:t.border}`,borderRadius:20,padding:22,cursor:"pointer",transition:"transform 250ms cubic-bezier(0.23,1,0.32,1),box-shadow 250ms cubic-bezier(0.23,1,0.32,1),border-color 250ms,background 250ms",transform:hov?"translateY(-5px)":"none",boxShadow:hov?`${t.shadow},0 0 0 1px ${t.borderH}`:"none",position:"relative",overflow:"hidden" }}>
      {hov && <div style={{ position:"absolute",top:0,left:0,right:0,height:2,background:"linear-gradient(90deg,transparent,rgba(251,191,36,0.6),transparent)",borderRadius:"20px 20px 0 0" }}/>}
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
      <div style={{ marginTop:10,display:"flex",justifyContent:"space-between",alignItems:"center" }}>
        <a href={`#service/${s.slug||toSlug(s.name)}`} onClick={e=>{e.stopPropagation();window.scrollTo(0,0);}} style={{ fontSize:11,color:t.muted,textDecoration:"none",transition:"color 150ms" }}
          onMouseEnter={e=>e.currentTarget.style.color=t.gold} onMouseLeave={e=>e.currentTarget.style.color=t.muted}>
          Подробнее →
        </a>
        <div style={{ display:"inline-flex",alignItems:"center",gap:4,padding:"5px 12px",borderRadius:100,fontSize:12,fontWeight:700,transition:"all .2s",background:hov?t.goldDim:"transparent",color:hov?t.gold:t.muted,border:`1px solid ${hov?t.goldB:"transparent"}` }}>
          {hov?"Оформить →":""}
        </div>
      </div>
    </div>
  );
});

// ══════════════════════════════════════════════════════════════
//  ORDER MODAL
// ══════════════════════════════════════════════════════════════
function OrderModal({ s, rate, user, profile, onClose, onSave, go, t, onBalanceUsed, requisites }) {
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
  const [useBalance, setUseBalance] = useState(false);

  const userBalance = profile?.referral_bonus_rub || 0;

  const fileRef = useRef();
  const req     = useRef(randReq(requisites?.length ? requisites : DEFAULT_REQUISITES)).current;
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

  const ALLOWED_MIME = ["image/jpeg","image/png","image/gif","image/webp","application/pdf"];
  const handleFileSelect = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) { setError("Файл слишком большой. Максимум 5 МБ."); return; }
    if (!ALLOWED_MIME.includes(f.type)) { setError("Недопустимый тип файла. Разрешены: JPEG, PNG, GIF, WebP, PDF."); return; }
    setReceiptFile(f);
    if (f.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = ev => setReceiptPreview(ev.target.result);
      reader.readAsDataURL(f);
    } else { setReceiptPreview(null); }
    setError("");
  };

  const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

  const handleCreate = async () => {
    if (!user) { setError("Необходимо войти в аккаунт"); return; }
    if (method === "login" && !loginV.trim()) { setError("Укажите логин/email аккаунта"); return; }
    if ((method === "gift" || method === "family") && !isValidEmail(emailV)) { setError("Укажите корректный email аккаунта"); return; }
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

      const promoDiscount = promoResult ? calcDiscount(total, promoResult) : 0;
      const balanceApplied = useBalance ? Math.min(userBalance, Math.max(0, total - promoDiscount)) : 0;
      const discount = promoDiscount;
      const finalTotal = Math.max(0, total - discount - balanceApplied);

      // Списываем бонусный баланс если используется
      if (balanceApplied > 0) {
        const { data: spendResult } = await sbReferrals.spendBalance(user.id, balanceApplied);
        if (!spendResult?.ok) { setError("Ошибка списания баланса"); setCreating(false); return; }
        onBalanceUsed && onBalanceUsed();
      }
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
        balance_used:     balanceApplied,
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
      <div onClick={e=>e.stopPropagation()} className="modal-inner" style={{ background:"#1e2537", border:"1px solid #334155", borderRadius:24, width:"100%", maxWidth:500, padding:28, margin:"auto", boxShadow:"0 32px 80px rgba(0,0,0,0.7)" }}>

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

          {/* Промокод */}
          <div style={{ marginBottom:14 }}>
            <div style={{ color:"rgba(255,255,255,0.4)", fontSize:11, marginBottom:8, textTransform:"uppercase", letterSpacing:1, fontWeight:600 }}>Промокод (необязательно)</div>
            <div style={{ display:"flex", gap:8 }}>
              <input value={promoInput} onChange={e=>{ setPromoInput(e.target.value.toUpperCase()); setPromoResult(null); setPromoError(""); }}
                placeholder="XXXXXXXX"
                style={{ flex:1, minWidth:0, background:"rgba(255,255,255,0.07)", border:`1px solid ${promoResult?"rgba(52,211,153,0.5)":promoError?"rgba(248,113,113,0.5)":"rgba(255,255,255,0.12)"}`, borderRadius:10, padding:"11px 14px", color:"white", fontSize:14, outline:"none", textTransform:"uppercase", letterSpacing:2 }}/>
              <button onClick={async()=>{ if(!promoInput.trim()) return; setPromoChecking(true); setPromoError(""); const r=await checkPromocode(promoInput); setPromoChecking(false); if(r.ok){setPromoResult(r);}else{setPromoError(r.error||"Промокод недействителен");setPromoResult(null);} }}
                disabled={promoChecking || !promoInput.trim()}
                style={{ padding:"11px 14px", borderRadius:10, background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.15)", color:"rgba(255,255,255,0.7)", cursor:"pointer", fontSize:13, fontWeight:600, whiteSpace:"nowrap", flexShrink:0 }}>
                {promoChecking ? "..." : "OK →"}
              </button>
            </div>
            {promoResult && <div style={{ color:"#6ee7b7", fontSize:12, marginTop:5 }}>✅ Скидка: {promoResult.type==="percent"?promoResult.value+"%":promoResult.type==="fixed"?promoResult.value+"₽":"комиссия снята"}</div>}
            {promoError && <div style={{ color:"#f87171", fontSize:12, marginTop:5 }}>❌ {promoError}</div>}
          </div>

          {/* Бонусный баланс */}
          {userBalance > 0 && (
            <div
              onClick={() => setUseBalance(v => !v)}
              style={{ display:"flex", alignItems:"center", justifyContent:"space-between", background:useBalance?"rgba(251,191,36,0.1)":"rgba(255,255,255,0.04)", border:`1px solid ${useBalance?"rgba(251,191,36,0.4)":"rgba(255,255,255,0.1)"}`, borderRadius:12, padding:"12px 14px", marginBottom:12, cursor:"pointer", transition:"all .2s" }}>
              <div style={{ display:"flex", alignItems:"center", gap:9 }}>
                <span style={{ fontSize:18 }}>🎁</span>
                <div>
                  <div style={{ color:"white", fontWeight:600, fontSize:13 }}>Бонусный баланс: {userBalance.toLocaleString("ru-RU")} ₽</div>
                  <div style={{ color:"rgba(255,255,255,0.4)", fontSize:11, marginTop:1 }}>Нажми чтобы применить как скидку</div>
                </div>
              </div>
              <div style={{ width:22, height:22, borderRadius:6, background:useBalance?"#fbbf24":"rgba(255,255,255,0.1)", border:`1.5px solid ${useBalance?"#fbbf24":"rgba(255,255,255,0.2)"}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"all .2s" }}>
                {useBalance && <span style={{ color:"#0a0a14", fontSize:13, fontWeight:800 }}>✓</span>}
              </div>
            </div>
          )}

          {/* Итог с учётом промокода и баланса */}
          {(() => {
            const promoDiscount = promoResult ? calcDiscount(total, promoResult) : 0;
            const balanceApplied = useBalance ? Math.min(userBalance, Math.max(0, total - promoDiscount)) : 0;
            const finalTotal = Math.max(0, total - promoDiscount - balanceApplied);
            return (
              <div style={{ background:"rgba(251,191,36,0.07)", border:"1px solid rgba(251,191,36,0.25)", borderRadius:14, padding:16, marginBottom:14 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}><span style={{ color:"rgba(255,255,255,0.5)", fontSize:13 }}>Курс ЦБ</span><span style={{ color:"rgba(255,255,255,0.5)", fontSize:13 }}>1$ = {rate?.toFixed(2)} ₽</span></div>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:(promoResult||balanceApplied)?8:10 }}><span style={{ color:"rgba(255,255,255,0.5)", fontSize:13 }}>Комиссия {Math.round(CFG.MARGIN*100)}%</span><span style={{ color:"rgba(255,255,255,0.5)", fontSize:13 }}>+ {comm.toLocaleString("ru-RU")} ₽</span></div>
                {promoResult && <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}><span style={{ color:"#6ee7b7", fontSize:13 }}>🎁 Промокод</span><span style={{ color:"#6ee7b7", fontSize:13, fontWeight:600 }}>− {promoDiscount.toLocaleString("ru-RU")} ₽</span></div>}
                {balanceApplied > 0 && <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}><span style={{ color:"#fbbf24", fontSize:13 }}>🎁 Бонусный баланс</span><span style={{ color:"#fbbf24", fontSize:13, fontWeight:600 }}>− {balanceApplied.toLocaleString("ru-RU")} ₽</span></div>}
                <div style={{ display:"flex", justifyContent:"space-between", borderTop:"1px solid rgba(255,255,255,0.1)", paddingTop:12 }}>
                  <span style={{ color:"white", fontWeight:700, fontSize:15 }}>К оплате</span>
                  <span style={{ color:"#fbbf24", fontWeight:900, fontSize:26, fontFamily:"'Clash Display',sans-serif" }}>{finalTotal.toLocaleString("ru-RU")} ₽</span>
                </div>
              </div>
            );
          })()}

          {error && <Alert type="error" t={t}>{error}</Alert>}

          <button onClick={handleCreate} disabled={creating || !user} style={{ width:"100%", padding:14, borderRadius:12, background: user ? "linear-gradient(135deg,#f59e0b,#fbbf24)" : "rgba(255,255,255,0.1)", border:"none", color: user ? "#0a0a14" : "rgba(255,255,255,0.3)", fontWeight:800, fontSize:15, cursor: user ? "pointer" : "not-allowed", boxShadow: user ? "0 4px 20px rgba(251,191,36,0.3)" : "none" }}>
            {uploading ? "Загружаем чек..." : creating ? "Создаём заявку..." : user ? "Создать заявку →" : "Войдите чтобы продолжить"}
          </button>
        </>}

        {step === 2 && <>
          {/* ── Celebration header ── */}
          <div style={{ margin:"-28px -28px 20px", padding:"28px 28px 22px", background:"linear-gradient(135deg,rgba(251,191,36,0.12) 0%,rgba(249,115,22,0.07) 100%)", borderBottom:"1px solid rgba(251,191,36,0.18)", borderRadius:"24px 24px 0 0", textAlign:"center", position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute",top:-30,right:-30,width:130,height:130,borderRadius:"50%",background:"radial-gradient(circle,rgba(251,191,36,0.15) 0%,transparent 70%)",pointerEvents:"none" }}/>
            <div style={{ fontSize:48, marginBottom:10, animation:"bounceIn .45s cubic-bezier(0.175,0.885,0.32,1.275)" }}>🎉</div>
            <div style={{ fontFamily:"'Clash Display',sans-serif", fontWeight:900, fontSize:22, color:"white", marginBottom:6 }}>Заявка принята!</div>
            <div style={{ color:"rgba(255,255,255,0.5)", fontSize:13, marginBottom:14 }}>{s.icon} {s.name} · {tier.n}</div>
            {/* Order ID badge */}
            <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(251,191,36,0.12)", border:"1px solid rgba(251,191,36,0.35)", borderRadius:12, padding:"10px 20px" }}>
              <span style={{ color:"rgba(255,255,255,0.45)", fontSize:12 }}>Номер заявки</span>
              <span style={{ color:"#fbbf24", fontWeight:900, fontSize:22, fontFamily:"'Clash Display',sans-serif", letterSpacing:1 }}>{orderId}</span>
            </div>
          </div>

          {/* ── Amount to pay ── */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", background:"rgba(251,191,36,0.07)", border:"1px solid rgba(251,191,36,0.2)", borderRadius:14, padding:"14px 18px", marginBottom:14 }}>
            <div>
              <div style={{ color:"rgba(255,255,255,0.4)", fontSize:11, textTransform:"uppercase", letterSpacing:1, fontWeight:600, marginBottom:3 }}>К оплате</div>
              <div style={{ color:"#fbbf24", fontWeight:900, fontSize:30, fontFamily:"'Clash Display',sans-serif", fontVariantNumeric:"tabular-nums" }}>{total.toLocaleString("ru-RU")} ₽</div>
            </div>
            <div style={{ textAlign:"right" }}>
              <div style={{ color:"rgba(255,255,255,0.35)", fontSize:11, marginBottom:2 }}>Укажи в комментарии</div>
              <div style={{ color:"white", fontWeight:800, fontSize:18, letterSpacing:1 }}>{orderId}</div>
            </div>
          </div>

          {/* ── Payment details ── */}
          <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:16, padding:18, marginBottom:14 }}>
            <div style={{ color:"rgba(255,255,255,0.3)", fontSize:10, marginBottom:14, textTransform:"uppercase", letterSpacing:1.5, fontWeight:600 }}>💳 Реквизиты · {req.label}</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
              <div style={{ background:"rgba(255,255,255,0.04)", borderRadius:12, padding:"12px 14px" }}>
                <div style={{ color:"rgba(255,255,255,0.3)", fontSize:10, textTransform:"uppercase", letterSpacing:1, fontWeight:600, marginBottom:6 }}>СБП</div>
                <div style={{ color:"white", fontWeight:700, fontSize:16, fontVariantNumeric:"tabular-nums" }}>{req.sbp}</div>
                <div style={{ color:"rgba(255,255,255,0.3)", fontSize:11, marginTop:3 }}>{req.holder}</div>
              </div>
              <div style={{ background:"rgba(255,255,255,0.04)", borderRadius:12, padding:"12px 14px" }}>
                <div style={{ color:"rgba(255,255,255,0.3)", fontSize:10, textTransform:"uppercase", letterSpacing:1, fontWeight:600, marginBottom:6 }}>Карта</div>
                <div style={{ color:"white", fontWeight:700, fontSize:16, fontVariantNumeric:"tabular-nums" }}>{req.card}</div>
                <div style={{ color:"rgba(255,255,255,0.3)", fontSize:11, marginTop:3 }}>{req.holder}</div>
              </div>
            </div>
          </div>

          {/* ── Activation guarantee ── */}
          <div style={{ background:"rgba(251,191,36,0.07)", border:"1px solid rgba(251,191,36,0.22)", borderRadius:12, padding:"12px 14px", marginBottom:14, display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ fontSize:20, flexShrink:0 }}>⏱</span>
            <div>
              <div style={{ color:"#fbbf24", fontWeight:700, fontSize:13 }}>Гарантия активации 60 минут</div>
              <div style={{ color:"rgba(255,255,255,0.4)", fontSize:12, marginTop:2 }}>После подтверждения оплаты активируем в течение часа. Не успели — полный возврат.</div>
            </div>
          </div>

          {/* ── Next steps ── */}
          <div style={{ background:"rgba(52,211,153,0.07)", border:"1px solid rgba(52,211,153,0.22)", borderRadius:12, padding:"12px 14px", marginBottom:16 }}>
            <div style={{ color:"#6ee7b7", fontSize:12, fontWeight:700, marginBottom:8, textTransform:"uppercase", letterSpacing:0.8 }}>Что сделать сейчас</div>
            <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
              {[
                { n:"1", text:"Переведи " + total.toLocaleString("ru-RU") + " ₽ по реквизитам выше" },
                { n:"2", text:'Укажи "' + orderId + '" в комментарии к переводу' },
                { n:"3", text:"Загрузи скриншот чека в Личном кабинете → Мои заявки" },
                { n:"4", text:"Данные аккаунта придут в кабинет — обычно до 60 минут" },
              ].map(s => (
                <div key={s.n} style={{ display:"flex", alignItems:"flex-start", gap:8 }}>
                  <div style={{ width:18, height:18, borderRadius:"50%", background:"rgba(52,211,153,0.2)", border:"1px solid rgba(52,211,153,0.35)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, color:"#6ee7b7", fontWeight:700, flexShrink:0, marginTop:1 }}>{s.n}</div>
                  <div style={{ color:"rgba(255,255,255,0.55)", fontSize:13, lineHeight:1.5 }}>{s.text}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display:"flex", gap:10 }}>
            <button onClick={()=>{ onClose(); go("#cabinet"); }} style={{ flex:1, padding:13, borderRadius:12, background:"linear-gradient(135deg,rgba(251,191,36,0.15),rgba(249,115,22,0.1))", border:"1px solid rgba(251,191,36,0.35)", color:"#fbbf24", cursor:"pointer", fontSize:13, fontWeight:700 }}>📋 Мои заявки</button>
            <button onClick={onClose} style={{ padding:"13px 18px", borderRadius:12, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", color:"rgba(255,255,255,0.4)", cursor:"pointer", fontSize:13 }}>✕</button>
          </div>
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
      <div onClick={e=>e.stopPropagation()} className="modal-inner" style={{ background:"#1e2537", border:"1px solid #334155", borderRadius:24, width:"100%", maxWidth:400, padding:32, boxShadow:"0 32px 80px rgba(0,0,0,0.7)" }}>
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

// ActivationTimer, OrderProgress импортированы из ./components/shared

// ReferralBlock перенесён в ./pages/CabinetPage.jsx

// ReferralBlock перенесён в ./pages/CabinetPage.jsx


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
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", borderTop:`1px solid rgba(251,191,36,0.2)`, paddingTop:16, marginTop:4 }}><span style={{ color:t.sub, fontWeight:600, fontSize:14 }}>Итого к оплате</span><span style={{ fontWeight:900, fontSize:38, fontFamily:"'Clash Display',sans-serif", letterSpacing:-1, background:"linear-gradient(135deg,#fbbf24,#f97316)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>{total.toLocaleString("ru-RU")} ₽</span></div>
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
      <div className="modal-inner" style={{ background:t.dark?t.card2:"#ffffff",border:`1px solid ${t.border}`,borderRadius:24,padding:28,maxWidth:480,width:"100%",boxShadow:"0 32px 80px rgba(0,0,0,0.5)" }} onClick={e=>e.stopPropagation()}>
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
//  REVIEW MODAL
// ══════════════════════════════════════════════════════════════
function ReviewModal({ onClose, user, profile, serviceName, orderId, onDone, t }) {
  const [rating, setRating]   = useState(5);
  const [hover, setHover]     = useState(null);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone]       = useState(false);

  const submit = async () => {
    if (!comment.trim()) return;
    setLoading(true);
    await sbReviews.insert({
      user_id:      user.id,
      user_name:    profile?.name || user.email?.split("@")[0] || "Пользователь",
      order_id:     orderId || null,
      service_id:   0,
      service_name: serviceName,
      rating,
      comment:      comment.trim(),
      is_approved:  false,
    });
    setLoading(false);
    setDone(true);
    if (onDone) onDone();
  };

  const ov = { position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",backdropFilter:"blur(6px)",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",padding:20 };
  const box = { background:t.card,border:`1px solid ${t.border}`,borderRadius:24,padding:"32px 28px",maxWidth:440,width:"100%",position:"relative" };
  const inp = { width:"100%",background:t.card2,border:`1px solid ${t.border}`,borderRadius:12,padding:"12px 14px",color:t.text,fontSize:14,outline:"none",resize:"vertical",minHeight:100,boxSizing:"border-box",fontFamily:"inherit" };

  return (
    <div style={ov} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={box}>
        <button onClick={onClose} style={{ position:"absolute",top:16,right:16,background:"none",border:"none",color:t.muted,cursor:"pointer",fontSize:20,lineHeight:1 }}>✕</button>
        {done ? (
          <div style={{ textAlign:"center",padding:"20px 0" }}>
            <div style={{ fontSize:48,marginBottom:12 }}>🙏</div>
            <div style={{ fontFamily:"'Clash Display',sans-serif",fontWeight:800,fontSize:20,color:t.text,marginBottom:8 }}>Спасибо за отзыв!</div>
            <div style={{ color:t.sub,fontSize:14 }}>Он появится на сайте после проверки.</div>
            <button onClick={onClose} style={{ marginTop:20,padding:"10px 28px",borderRadius:12,background:"linear-gradient(135deg,#f59e0b,#fbbf24)",border:"none",color:"#0a0a14",fontWeight:700,fontSize:14,cursor:"pointer" }}>Закрыть</button>
          </div>
        ) : (
          <>
            <div style={{ fontFamily:"'Clash Display',sans-serif",fontWeight:800,fontSize:20,color:t.text,marginBottom:4 }}>Оставить отзыв</div>
            <div style={{ color:t.sub,fontSize:13,marginBottom:24 }}>{serviceName}</div>
            <div style={{ display:"flex",gap:6,marginBottom:20 }}>
              {[1,2,3,4,5].map(s=>(
                <button key={s} onMouseEnter={()=>setHover(s)} onMouseLeave={()=>setHover(null)} onClick={()=>setRating(s)}
                  style={{ background:"none",border:"none",cursor:"pointer",fontSize:32,color:(hover||rating)>=s?"#fbbf24":"#334155",transition:"color 150ms,transform 150ms",transform:(hover||rating)>=s?"scale(1.15)":"scale(1)",padding:0 }}>★</button>
              ))}
            </div>
            <textarea value={comment} onChange={e=>setComment(e.target.value)} placeholder="Расскажите о вашем опыте..." style={inp}/>
            <button onClick={submit} disabled={loading||!comment.trim()} style={{ marginTop:14,width:"100%",padding:"13px 0",borderRadius:12,background:"linear-gradient(135deg,#f59e0b,#fbbf24)",border:"none",color:"#0a0a14",fontWeight:700,fontSize:15,cursor:loading||!comment.trim()?"not-allowed":"pointer",opacity:loading||!comment.trim()?0.6:1 }}>
              {loading?"Отправляем...":"Отправить отзыв"}
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
      <div style={{ display:"flex",flexDirection:"column",gap:6 }}>
        {items.map((item,i)=>(
          <div key={i} style={{ background:t.card2,border:`1px solid ${open===i?t.borderH:t.border}`,borderRadius:16,overflow:"hidden",transition:"border-color 280ms cubic-bezier(0.23,1,0.32,1),background 280ms" }}>
            <button onClick={()=>setOpen(open===i?null:i)} style={{ width:"100%",display:"flex",justifyContent:"space-between",alignItems:"center",padding:"20px 22px",background:"none",border:"none",color:t.text,cursor:"pointer",textAlign:"left",gap:12 }}>
              <span style={{ fontWeight:600,fontSize:14,lineHeight:1.45,letterSpacing:-0.2 }}>{item.q}</span>
              <span style={{ flexShrink:0,color:t.gold,transform:open===i?"rotate(180deg)":"none",transition:"transform 280ms cubic-bezier(0.23,1,0.32,1)",display:"inline-block" }}><IconChevronDown size={16} color={t.gold}/></span>
            </button>
            <div className={`faq-body${open===i?" open":""}`}>
              <div className="faq-inner">
                <div style={{ padding:"0 22px 20px",color:t.sub,fontSize:14,lineHeight:1.7 }}>{item.a}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  SERVICE PAGE
// ══════════════════════════════════════════════════════════════
function ServicePage({ svc, rate, rateLoading, go, toggle, t, session, profile, isMobile, userHook, requisites }) {
  const margin = 1.15;
  const rub = (usd) => rate ? Math.ceil(usd * rate * margin) : null;
  const [selSvc, setSelSvc] = useState(null);

  useEffect(() => { window.scrollTo(0, 0); }, [svc.slug]);

  useEffect(() => {
    document.title = `${svc.name} в России — оплата за рубли | Payflow`;
    const desc = document.querySelector("meta[name='description']");
    if (desc) desc.setAttribute("content", `Купить ${svc.name} в России за рубли. ${svc.desc?.slice(0,100)}... Комиссия 15%, активация за 1 час.`);
    return () => {
      document.title = "Payflow — Оплата ChatGPT, Midjourney, Netflix, Spotify за рубли | pay-flow.ru";
      if (desc) desc.setAttribute("content", "Платёжный посредник для оплаты зарубежных подписок в рублях. ChatGPT Plus, Midjourney, Claude Pro, Netflix, Spotify, Adobe и 50+ сервисов. Комиссия 15%, курс ЦБ РФ. Активация за 1 час — гарантия возврата.");
    };
  }, [svc]);

  const faq = [
    {q:`Как оплатить ${svc.name} в России?`, a:`Выберите тариф, оформите заявку на Payflow и оплатите в рублях через СБП или перевод на карту. Активируем в течение 1 часа в рабочее время.`},
    {q:"Нужно ли передавать пароль от аккаунта?", a:svc.family?"Нет — активируем через семейный план без доступа к вашему аккаунту.":svc.gift?"Нет — используем подарочный код, доступ к аккаунту не нужен.":"Для активации потребуется временный доступ к аккаунту. Все данные хранятся только в вашем личном кабинете."},
    {q:"Как быстро активируют подписку?", a:"В рабочее время (10:00–22:00 МСК) — до 1 часа. В остальное время — до 24 часов. Статус видите в личном кабинете."},
    {q:"Что если карты Visa/Mastercard не работают?", a:"Именно для этого существует Payflow. Принимаем оплату через СБП и перевод на карты любых российских банков."},
  ];

  return (
    <div style={{ background:t.bg, minHeight:"100vh", fontFamily:"'Satoshi',sans-serif", color:t.text }}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0}`}</style>

      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context":"https://schema.org",
        "@type":"Product",
        "name": svc.name,
        "description": svc.desc,
        "brand": {"@type":"Brand","name": svc.name},
        "offers": svc.tiers.map(tier => ({
          "@type":"Offer",
          "name": tier.n,
          "price": rub(tier.p) || tier.p * 90,
          "priceCurrency":"RUB",
          "availability":"https://schema.org/InStock",
          "seller":{"@type":"Organization","name":"Payflow"}
        }))
      })}}/>

      {/* Navbar */}
      <nav style={{ position:"fixed",top:0,left:0,right:0,zIndex:100,padding:isMobile?"0 12px":"0 28px",height:60,display:"flex",alignItems:"center",justifyContent:"space-between",background:t.nav,backdropFilter:"blur(20px)",borderBottom:`1px solid ${t.border}` }}>
        <div onClick={()=>go("#home")} style={{ fontFamily:"'Clash Display',sans-serif",fontWeight:900,fontSize:20,cursor:"pointer",color:t.text }}>pay<span style={{ color:t.gold }}>flow</span></div>
        <div style={{ display:"flex",gap:8,alignItems:"center" }}>
          <button onClick={()=>window.history.length>1?window.history.back():go("#catalog")} style={{ padding:"7px 16px",borderRadius:100,fontSize:13,fontWeight:600,cursor:"pointer",background:"transparent",border:`1px solid ${t.border}`,color:t.sub }}>← Назад</button>
          <button onClick={toggle} style={{ width:36,height:36,borderRadius:100,background:t.card,border:`1px solid ${t.border}`,cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center" }}>{t.dark?<IconSun color={t.sub}/>:<IconMoon color={t.sub}/>}</button>
        </div>
      </nav>

      <div style={{ maxWidth:800,margin:"0 auto",padding:isMobile?"80px 16px 60px":"90px 24px 80px" }}>

        {/* Hero */}
        <div style={{ marginBottom:40 }}>
          <div style={{ display:"flex",alignItems:"center",gap:14,marginBottom:16 }}>
            <span style={{ fontSize:48 }}>{svc.icon}</span>
            <div>
              <div style={{ color:t.gold,fontSize:11,textTransform:"uppercase",letterSpacing:3,fontWeight:600,marginBottom:4 }}>{svc.cat}</div>
              <h1 style={{ fontFamily:"'Clash Display',sans-serif",fontWeight:800,fontSize:isMobile?28:36,color:t.text,lineHeight:1.1 }}>{svc.name} в России</h1>
            </div>
          </div>
          <p style={{ color:t.sub,fontSize:16,lineHeight:1.7,marginBottom:24 }}>{svc.desc}</p>
          <div style={{ display:"flex",gap:10,flexWrap:"wrap" }}>
            <button onClick={()=>setSelSvc(svc)} style={{ padding:"13px 28px",borderRadius:14,background:"linear-gradient(135deg,#f59e0b,#fbbf24)",border:"none",color:"#0a0a14",fontWeight:700,fontSize:15,cursor:"pointer" }}>
              Оформить за рубли →
            </button>
            <div style={{ display:"flex",alignItems:"center",gap:6,padding:"13px 18px",borderRadius:14,background:t.card2,border:`1px solid ${t.border}`,color:t.sub,fontSize:13 }}>
              💳 СБП и карты РФ
            </div>
          </div>
        </div>

        {/* Тарифы */}
        <div style={{ marginBottom:40 }}>
          <h2 style={{ fontFamily:"'Clash Display',sans-serif",fontWeight:700,fontSize:22,color:t.text,marginBottom:16 }}>Тарифы и цены в рублях</h2>
          <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:12 }}>
            {svc.tiers.map((tier,i)=>(
              <div key={i} onClick={()=>setSelSvc(svc)} style={{ background:t.card2,border:`1px solid ${t.border}`,borderRadius:16,padding:"20px 18px",cursor:"pointer",transition:"border-color 200ms,transform 200ms" }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=t.goldB;e.currentTarget.style.transform="translateY(-2px)"}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor=t.border;e.currentTarget.style.transform="none"}}>
                <div style={{ color:t.sub,fontSize:12,marginBottom:6 }}>{tier.n}</div>
                <div style={{ color:t.gold,fontWeight:800,fontSize:22,marginBottom:2 }}>
                  {rateLoading?"..." : rub(tier.p) ? `${rub(tier.p).toLocaleString("ru-RU")} ₽` : `от ${Math.ceil(tier.p*90).toLocaleString("ru-RU")} ₽`}
                </div>
                <div style={{ color:t.muted,fontSize:11 }}>${tier.p} · комиссия 15%</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop:12,color:t.muted,fontSize:12 }}>* Цены в рублях рассчитаны по текущему курсу ЦБ РФ. Обновляются автоматически.</div>
        </div>

        {/* Преимущества */}
        <div style={{ background:t.card2,border:`1px solid ${t.border}`,borderRadius:18,padding:"24px",marginBottom:40,display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:14 }}>
          {[
            {i:"⚡",t:"Активация за 1 час",d:"В рабочее время 10:00–22:00 МСК"},
            {i:"💳",t:"Оплата СБП и картой",d:"Тинькофф, Сбер, ВТБ и другие банки РФ"},
            {i:"🔒",t:"Безопасно",d:"Данные в личном кабинете, без передачи третьим лицам"},
            {i:"↩️",t:"Гарантия возврата",d:"Вернём деньги если активация не прошла"},
          ].map((item,i)=>(
            <div key={i} style={{ display:"flex",gap:12,alignItems:"flex-start" }}>
              <span style={{ fontSize:22,flexShrink:0 }}>{item.i}</span>
              <div>
                <div style={{ fontWeight:700,fontSize:14,color:t.text,marginBottom:2 }}>{item.t}</div>
                <div style={{ color:t.muted,fontSize:12 }}>{item.d}</div>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div style={{ marginBottom:40 }}>
          <h2 style={{ fontFamily:"'Clash Display',sans-serif",fontWeight:700,fontSize:22,color:t.text,marginBottom:16 }}>Частые вопросы</h2>
          <ServiceFaq items={faq} t={t}/>
        </div>

        {/* CTA */}
        <div style={{ background:`linear-gradient(135deg,rgba(249,115,22,0.1),rgba(251,191,36,0.08))`,border:`1px solid ${t.goldB}`,borderRadius:20,padding:"28px 24px",textAlign:"center" }}>
          <div style={{ fontFamily:"'Clash Display',sans-serif",fontWeight:800,fontSize:22,color:t.text,marginBottom:8 }}>Готовы оформить?</div>
          <div style={{ color:t.sub,fontSize:14,marginBottom:20 }}>Оплата в рублях · Активация за 1 час · Гарантия возврата</div>
          <button onClick={()=>setSelSvc(svc)} style={{ padding:"14px 36px",borderRadius:14,background:"linear-gradient(135deg,#f59e0b,#fbbf24)",border:"none",color:"#0a0a14",fontWeight:700,fontSize:16,cursor:"pointer" }}>
            Оформить {svc.name} →
          </button>
        </div>
      </div>
      {selSvc && <OrderModal s={selSvc} rate={rate} user={session?.user} profile={profile} onClose={()=>setSelSvc(null)} onSave={async(order)=>{ const token=session?.access_token; const r=await fetch("/api/create-order",{method:"POST",headers:{"Content-Type":"application/json","Authorization":`Bearer ${token}`},body:JSON.stringify(order)}); const d=await r.json(); return {data:d.order,error:d.error?{message:d.error}:null}; }} onBalanceUsed={()=>userHook?.reloadProfile(session?.user?.id)} go={go} t={t} requisites={requisites}/>}
    </div>
  );
}

function ServiceFaq({ items, t }) {
  const [open, setOpen] = useState(null);
  return (
    <div style={{ display:"flex",flexDirection:"column",gap:6 }}>
      {items.map((item,i)=>(
        <div key={i} style={{ background:t.card2,border:`1px solid ${open===i?t.borderH:t.border}`,borderRadius:14,overflow:"hidden" }}>
          <button onClick={()=>setOpen(open===i?null:i)} style={{ width:"100%",display:"flex",justifyContent:"space-between",alignItems:"center",padding:"16px 18px",background:"none",border:"none",color:t.text,cursor:"pointer",textAlign:"left",gap:12 }}>
            <span style={{ fontWeight:600,fontSize:14 }}>{item.q}</span>
            <span style={{ flexShrink:0,color:t.gold,transform:open===i?"rotate(180deg)":"none",transition:"transform 280ms",display:"inline-block" }}>▾</span>
          </button>
          <div className={`faq-body${open===i?" open":""}`}>
            <div className="faq-inner">
              <div style={{ padding:"0 18px 16px",color:t.sub,fontSize:14,lineHeight:1.7 }}>{item.a}</div>
            </div>
          </div>
        </div>
      ))}
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
  const { reviewsList, reviewsLoading } = useReviews();
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewTarget, setReviewTarget]       = useState({ serviceName:"", orderId:"" });
  const [requisites, setRequisites]           = useState(DEFAULT_REQUISITES);
  const isMobile = useIsMobile();

  const page = hash.split("?")[0];

  useEffect(() => { setTimeout(() => setMounted(true), 80); }, []);

  // Загружаем реквизиты из settings
  useEffect(() => {
    getSetting("requisites").then(v => {
      if (v) try { setRequisites(JSON.parse(v)); } catch {}
    });
  }, []);

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
      <style>{`*{box-sizing:border-box;margin:0;padding:0}input::placeholder,textarea::placeholder{opacity:.4}`}</style>
      <Suspense fallback={<div style={{ padding:40, textAlign:"center", color:t.sub }}>Загрузка…</div>}>
        <AdminPage userHook={userHook} go={go} t={t}/>
      </Suspense>
    </div>
  );

  if (page === "#legal") return <LegalPage go={go} t={t} />;

  if (page.startsWith("#service/")) {
    const slug = page.replace("#service/","");
    const svc = SVC.find(s => (s.slug||toSlug(s.name)) === slug);
    if (!svc) { go("#catalog"); return null; }
    return <ServicePage svc={svc} rate={rate} rateLoading={rateLoading} go={go} toggle={toggle} t={t} session={session} profile={profile} isMobile={isMobile} userHook={userHook} requisites={requisites}/>;
  }
  if (page === "#cabinet") {
    if (!session) { go("#home"); return null; }
    return (
      <div style={{ background:t.bg, minHeight:"100vh", fontFamily:"'Satoshi',sans-serif", color:t.text }}>
        <style>{`*{box-sizing:border-box;margin:0;padding:0}input::placeholder,textarea::placeholder{opacity:.4}`}</style>
        <nav style={{ position:"fixed",top:0,left:0,right:0,zIndex:100,padding:"0 28px",height:60,display:"flex",alignItems:"center",justifyContent:"space-between",background:t.nav,backdropFilter:"blur(20px)",borderBottom:`1px solid ${t.border}` }}>
          <div onClick={()=>go("#home")} style={{ fontFamily:"'Clash Display',sans-serif",fontWeight:900,fontSize:20,cursor:"pointer",color:t.text }}>pay<span style={{ color:t.gold }}>flow</span></div>
          <div style={{ display:"flex",gap:8,alignItems:"center" }}>
            <button onClick={()=>go("#home")} style={{ padding:"7px 16px",borderRadius:100,fontSize:13,fontWeight:600,cursor:"pointer",background:"transparent",border:`1px solid ${t.border}`,color:t.sub }}>← Главная</button>
            <button onClick={toggle} style={{ width:36,height:36,borderRadius:100,background:t.card,border:`1px solid ${t.border}`,cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center" }}>{t.dark ? <IconSun color={t.sub}/> : <IconMoon color={t.sub}/>}</button>
          </div>
        </nav>
        <Suspense fallback={<div style={{ padding:40, textAlign:"center", color:t.sub }}>Загрузка…</div>}>
          <CabinetPage userHook={userHook} go={go} t={t} onReview={(serviceName,orderId,onDone)=>{ setReviewTarget({serviceName,orderId,onDone}); setShowReviewModal(true); }}/>
        </Suspense>
        {showReviewModal && <ReviewModal onClose={()=>setShowReviewModal(false)} user={session?.user} profile={profile} serviceName={reviewTarget.serviceName} orderId={reviewTarget.orderId} onDone={reviewTarget.onDone} t={t}/>}
      </div>
    );
  }

  // Основной layout
  return (
    <div style={{ background:t.bg, minHeight:"100vh", fontFamily:"'Satoshi',sans-serif", color:t.text, transition:"background .3s,color .3s", overflowX:"hidden", width:"100%" }}>
      <style>{`
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
        /* Bento cards (мобильные overrides — в index.css) */
        .bento-lg{grid-column:span 2;grid-row:span 2}
        .bento-md{grid-column:span 1;grid-row:span 2}
        .a1{animation:fadeUp .7s ease forwards}
        .a2{animation:fadeUp .7s .1s ease forwards;opacity:0}
        .a3{animation:fadeUp .7s .2s ease forwards;opacity:0}
        .a4{animation:fadeUp .7s .3s ease forwards;opacity:0}
        .a5{animation:fadeUp .7s .4s ease forwards;opacity:0}
        .cg:hover .ci{opacity:.55}.ci{transition:all .25s!important}.cg .ci:hover{opacity:1!important;transform:translateY(-4px)!important}
        /* Мобильные стили вынесены в index.css (загружаются до JS) */
        @media(max-width:640px){
          .mob-show{display:inline-flex!important;align-items:center}
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
        /* ── Tabular numerals for prices (UI/UX Pro Max: number-tabular) ── */
        .price-num{font-variant-numeric:tabular-nums;font-feature-settings:"tnum" 1}
        /* ── Prefers reduced motion ── */
        @media(prefers-reduced-motion:reduce){*{animation-duration:.01ms!important;transition-duration:.01ms!important}}
        /* ── Premium text selection ── */
        ::selection{background:rgba(251,191,36,0.18);color:inherit}
        /* ── Better text rendering ── */
        body{font-feature-settings:"kern" 1,"liga" 1;letter-spacing:-0.01em}
        h1,h2,h3{letter-spacing:-0.03em}
        /* ── Scrollbar — ultra thin gold ── */
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:rgba(251,191,36,0.35);border-radius:2px}
        /* ── Section divider accent ── */
        .section-divider{width:40px;height:3px;background:linear-gradient(90deg,#fbbf24,rgba(251,191,36,0));border-radius:2px;margin:0 auto 12px}
        /* ── Premium card inner border glow on hover ── */
        .card-hover{transition:all 250ms cubic-bezier(0.23,1,0.32,1)!important}
        .card-hover:hover{transform:translateY(-5px)!important;box-shadow:0 20px 60px rgba(0,0,0,0.4),0 0 0 1px rgba(251,191,36,0.15)!important}
        /* ── Gold gradient text ── */
        .gold-grad{background:linear-gradient(135deg,#fbbf24 0%,#f97316 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
        /* ── Smooth section fade ── */
        .section-fade{animation:fadeUp .8s ease both}
        /* ── nav pill border glow when scrolled ── */
        .nav-scrolled{box-shadow:0 0 0 1px rgba(251,191,36,0.12),0 8px 32px rgba(0,0,0,0.4)!important}
        /* ── Star rating ── */
        .star-filled{color:#fbbf24}
        /* ── FAQ smooth expand ── */
        .faq-body{display:grid;grid-template-rows:0fr;transition:grid-template-rows 280ms cubic-bezier(0.23,1,0.32,1)}
        .faq-body.open{grid-template-rows:1fr}
        .faq-inner{overflow:hidden;min-height:0}
      `}</style>

      {/* NAV */}
      <nav className={scrolled?"nav-scrolled":""} style={{ position:"fixed",top:0,left:0,right:0,zIndex:100,padding:isMobile?"0 12px":"0 24px",height:isMobile?58:64,display:"flex",alignItems:"center",justifyContent:"space-between",background:scrolled?t.nav:"transparent",backdropFilter:scrolled?"blur(28px) saturate(180%)":"none",borderBottom:scrolled?`1px solid ${t.border}`:"none",transition:"all .35s cubic-bezier(0.23,1,0.32,1)",overflowX:"hidden" }}>
        <div onClick={()=>go("#home")} style={{ fontFamily:"'Clash Display',sans-serif",fontWeight:900,fontSize:isMobile?19:21,cursor:"pointer",letterSpacing:-1,color:t.text,flexShrink:0,userSelect:"none" }}>pay<span style={{ background:"linear-gradient(135deg,#fbbf24,#f97316)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text" }}>flow</span></div>
        <div style={{ display:"flex",gap:4,alignItems:"center",flexShrink:0 }}>
          {/* Главная/Каталог — только на десктопе */}
          {!isMobile && [["#home","Главная",<IconHome size={15} color="currentColor"/>],["#catalog","Каталог",<IconGrid size={15} color="currentColor"/>]].map(([h,l,ic]) => (
            <button key={h} onClick={()=>go(h)} style={{ padding:"7px 12px",borderRadius:100,fontSize:13,fontWeight:600,cursor:"pointer",background:page===h?t.goldDim:"transparent",border:`1px solid ${page===h?t.goldB:"transparent"}`,color:page===h?t.gold:t.sub,display:"flex",alignItems:"center",gap:5,whiteSpace:"nowrap" }}>
              {ic}{l}
            </button>
          ))}
          {session ? (
            <>
              {isAdmin && (
                <button onClick={()=>go("#admin")} style={{ padding:"6px 10px",borderRadius:100,fontSize:12,fontWeight:600,cursor:"pointer",background:"rgba(167,139,250,0.15)",border:"1px solid rgba(167,139,250,0.35)",color:"#c4b5fd",display:"flex",alignItems:"center",gap:5 }}>
                  <IconSettings size={14} color="#c4b5fd"/>
                  {!isMobile && "Админ"}
                </button>
              )}
              {/* Колокольчик → кабинет */}
              <button onClick={()=>go("#cabinet")} style={{ width:40,height:40,borderRadius:100,background:t.card,border:`1px solid ${t.border}`,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",position:"relative",flexShrink:0 }}>
                <IconBell size={17} color={t.sub}/>
                {unread > 0 && (
                  <span style={{ background:"#f87171",color:"white",borderRadius:"50%",width:15,height:15,fontSize:8,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",position:"absolute",top:-2,right:-2,boxShadow:"0 0 0 2px "+t.bg }}>
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </button>
              {/* Иконка профиля — на мобиле только иконка, на десктопе с именем */}
              {isMobile && (
                <button onClick={()=>go("#cabinet")} style={{ width:40,height:40,borderRadius:100,background:t.card,border:`1px solid ${t.border}`,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                  <IconUser size={17} color={t.sub}/>
                </button>
              )}
              {!isMobile && (
                <button onClick={()=>go("#cabinet")} style={{ padding:"6px 10px",borderRadius:100,fontSize:13,fontWeight:600,cursor:"pointer",background:t.card,border:`1px solid ${t.border}`,color:t.sub,display:"flex",alignItems:"center",gap:4 }}>
                  <IconUser size={16} color={t.sub}/>{profile?.name?.split(" ")[0] || "Кабинет"}
                </button>
              )}
              {/* Выйти */}
              <button onClick={async()=>{ await userHook.logout(); go("#home"); }} style={{ padding:"6px 10px",borderRadius:100,fontSize:12,fontWeight:600,cursor:"pointer",background:"rgba(248,113,113,0.1)",border:"1px solid rgba(248,113,113,0.25)",color:"#f87171",display:"flex",alignItems:"center",gap:isMobile?0:5 }}>
                <IconLogout size={14} color="#f87171"/>
                {!isMobile && "Выйти"}
              </button>
            </>
          ) : (
            <button onClick={()=>setShowAuth(true)} style={{ padding:"7px 14px",borderRadius:100,fontSize:13,fontWeight:600,cursor:"pointer",background:t.goldDim,border:`1px solid ${t.goldB}`,color:t.gold,whiteSpace:"nowrap" }}>Войти</button>
          )}
          {/* Telegram */}
          <a href="https://t.me/payflowru" target="_blank" rel="noopener noreferrer" style={{ width:40,height:40,borderRadius:100,background:"rgba(34,197,94,0.08)",border:"1px solid rgba(34,197,94,0.25)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,textDecoration:"none",transition:"all 200ms" }}
            onMouseEnter={e=>{e.currentTarget.style.background="rgba(34,197,94,0.18)";e.currentTarget.style.borderColor="rgba(34,197,94,0.5)"}}
            onMouseLeave={e=>{e.currentTarget.style.background="rgba(34,197,94,0.08)";e.currentTarget.style.borderColor="rgba(34,197,94,0.25)"}}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8l-1.68 7.92c-.12.56-.46.7-.92.44l-2.56-1.88-1.23 1.18c-.14.14-.26.26-.52.26l.18-2.6 4.76-4.3c.2-.18-.04-.28-.32-.1L7.96 14.66l-2.5-.78c-.54-.17-.55-.54.12-.8l9.76-3.76c.46-.17.86.11.7.78l.6-.1z" fill="#22c55e"/></svg>
          </a>
          <button onClick={toggle} style={{ width:40,height:40,borderRadius:100,background:t.card,border:`1px solid ${t.border}`,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>{t.dark ? <IconSun color={t.sub}/> : <IconMoon color={t.sub}/>}</button>
        </div>
      </nav>

      {/* HOME */}
      {page==="#home" && (
        <div>
          {/* HERO */}
          <div className="hero-section" style={{ position:"relative",minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"90px 32px 60px",overflow:"hidden",width:"100%",boxSizing:"border-box" }}>
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
              <div className="hero-grid" style={{ display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:isMobile?28:60,maxWidth:1100,width:"100%",alignItems:"center",textAlign:"left" }}>
                {/* Left — text */}
                <div style={{ display:"flex",flexDirection:"column",gap:0 }}>
                  <div className="a1" style={{ display:"inline-flex",alignSelf:"flex-start",alignItems:"center",gap:8,background:t.dark?"rgba(255,255,255,0.06)":"rgba(255,255,255,0.9)",border:`1px solid ${t.border}`,backdropFilter:"blur(12px)",borderRadius:100,padding:"8px 16px",marginBottom:28,fontSize:12,boxShadow:t.shadow }}>
                    {rateLoading?<span style={{ width:10,height:10,border:`2px solid ${t.border}`,borderTopColor:t.gold,borderRadius:"50%",display:"inline-block",animation:"spin .8s linear infinite" }}/>:<span style={{ width:7,height:7,borderRadius:"50%",background:"#22c55e",display:"inline-block",animation:"pulse 2s infinite",boxShadow:"0 0 8px rgba(34,197,94,0.6)" }}/>}
                    <span style={{ color:t.sub }}>Курс ЦБ на {rateDate}:</span>
                    <span style={{ color:t.gold,fontWeight:700 }}>{rateLoading?"загрузка...":`1$ = ${rate?.toFixed(2)} ₽`}</span>
                  </div>

                  <h1 className="a2" style={{ fontFamily:"'Clash Display',sans-serif",fontWeight:900,fontSize:"clamp(34px,4vw,68px)",lineHeight:1.0,letterSpacing:-3,marginBottom:24,color:t.text }}>
                    Оплати любой<br/>
                    <span className="gold-grad">зарубежный</span>
                    {" "}сервис<br/>
                    <span style={{ color:t.text }}>за рубли</span>
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
                </div>
              </div>

              {/* Stats */}
              <div className="a5 stats-row" style={{ display:isMobile?"grid":"flex",gridTemplateColumns:isMobile?"1fr 1fr":undefined,gap:isMobile?8:10,flexWrap:"wrap",justifyContent:"flex-start",marginTop:isMobile?28:52,maxWidth:1100,width:"100%" }}>
                {[
                  {v:"50",suf:"+",l:"сервисов"},
                  {v:"15",suf:"%",l:"комиссия"},
                  {v:ordersCount !== null ? String(ordersCount) : "—",suf:"+",l:"за сегодня"},
                  {v:"~1",suf:" ч",l:"активация"},
                ].map(({v,suf,l},i)=>(
                  <div key={l} className={`stagger-${i+2}`} style={{ textAlign:"center",background:t.dark?"rgba(255,255,255,0.04)":"rgba(255,255,255,0.92)",border:`1px solid ${t.border}`,borderRadius:20,padding:isMobile?"14px 16px":"20px 28px",backdropFilter:"blur(16px)",boxShadow:t.shadow,transition:"transform 250ms cubic-bezier(0.23,1,0.32,1),box-shadow 250ms",minWidth:isMobile?undefined:100 }}
                    onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-5px)";e.currentTarget.style.boxShadow=t.shadowG;e.currentTarget.style.borderColor=t.borderH}}
                    onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow=t.shadow;e.currentTarget.style.borderColor=t.border}}>
                    <div style={{ fontFamily:"'Clash Display',sans-serif",fontSize:isMobile?24:32,fontWeight:900,letterSpacing:-1.5,background:"linear-gradient(135deg,#fbbf24,#f97316)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",lineHeight:1 }}>
                      {v}<span style={{ fontSize:isMobile?16:20 }}>{suf}</span>
                    </div>
                    <div style={{ color:t.muted,fontSize:11,marginTop:6,fontWeight:500,letterSpacing:0.5,textTransform:"uppercase" }}>{l}</div>
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
            <div className="bento-grid" style={{ display:"grid",gridTemplateColumns:isMobile?"1fr":"repeat(3,1fr)",gridTemplateRows:"auto",gap:14 }}>
              {POPULAR.map((s,i) => {
                const isBig = i === 0;
                const base = rate ? Math.round(s.tiers[0].p * rate * (1+CFG.MARGIN)) : 0;
                return (
                  <div key={s.id}
                    style={{ gridColumn:isMobile?"span 1":isBig?"span 2":"span 1",gridRow:isMobile?"span 1":isBig?"span 2":"span 1",background:t.dark?"rgba(255,255,255,0.04)":"rgba(255,255,255,0.85)",border:`1px solid ${t.border}`,borderRadius:isBig?22:18,padding:isBig?28:20,cursor:"pointer",transition:"transform 200ms cubic-bezier(0,0,.2,1),box-shadow 200ms,border-color 200ms",position:"relative",overflow:"hidden" }}
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
                    <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:isBig?4:0 }}>
                      <a href={`#service/${s.slug||toSlug(s.name)}`} onClick={e=>{e.stopPropagation();window.scrollTo(0,0);}} style={{ color:t.muted,fontSize:11,textDecoration:"none" }}
                        onMouseEnter={e=>e.currentTarget.style.color=t.gold} onMouseLeave={e=>e.currentTarget.style.color=t.muted}>Подробнее →</a>
                      <div style={{ display:"inline-flex",alignItems:"center",gap:5,padding:"7px 14px",borderRadius:100,background:t.goldDim,border:`1px solid ${t.goldB}`,color:t.gold,fontSize:12,fontWeight:700 }}>Выбрать →</div>
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
                {n:"01",svg:<IconUser size={18} color="#fbbf24"/>,title:"Регистрируешься",  desc:"Создаёшь кабинет — заявки, статусы и уведомления в одном месте."},
                {n:"02",svg:<IconSearch size={18} color="#fbbf24"/>,title:"Выбираешь сервис",  desc:"Находишь нужный сервис. Цена в рублях видна сразу."},
                {n:"03",svg:<IconCreditCard size={18} color="#fbbf24"/>,title:"Оплачиваешь",       desc:"Переводишь по СБП или карте. Загружаешь чек."},
                {n:"04",svg:<IconKey size={18} color="#fbbf24"/>,title:"Получаешь доступ",  desc:"Активируем до 1 часа. Данные приходят в личный кабинет."},
              ].map((s,i) => (
                <div key={s.n} className={`stagger-${i+1}`} style={{ background:t.card2,border:`1px solid ${t.border}`,borderRadius:20,padding:"28px 22px",position:"relative",overflow:"hidden",boxShadow:t.shadow,transition:"transform 200ms cubic-bezier(0,0,.2,1),box-shadow 200ms",margin:"0 6px" }}
                  onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-6px)";e.currentTarget.style.boxShadow=t.dark?"0 20px 60px rgba(251,191,36,0.1)":"0 20px 60px rgba(0,0,0,0.1)"}}
                  onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow=t.shadow}}>
                  {/* Step number + icon badge */}
                  <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:18 }}>
                    <div style={{ width:44,height:44,borderRadius:"50%",background:`linear-gradient(135deg,rgba(251,191,36,0.18),rgba(249,115,22,0.08))`,border:`1px solid rgba(251,191,36,0.3)`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>{s.svg}</div>
                    <span style={{ fontFamily:"'Clash Display',sans-serif",fontWeight:900,fontSize:13,background:"linear-gradient(135deg,#fbbf24,#f97316)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",letterSpacing:1 }}>{s.n}</span>
                  </div>
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

          {/* GUARANTEE BANNER */}
          <div style={{ padding:"0 24px 80px", maxWidth:940, margin:"0 auto" }}>
            <div style={{ background:"linear-gradient(135deg,rgba(251,191,36,0.08) 0%,rgba(249,115,22,0.05) 100%)", border:"1px solid rgba(251,191,36,0.2)", borderRadius:24, padding:isMobile?"28px 20px":"40px 48px", position:"relative", overflow:"hidden" }}>
              {/* bg glow */}
              <div style={{ position:"absolute",top:-60,right:-60,width:250,height:250,borderRadius:"50%",background:"radial-gradient(circle,rgba(251,191,36,0.12) 0%,transparent 70%)",pointerEvents:"none" }}/>
              <div style={{ display:"flex", flexDirection:isMobile?"column":"row", alignItems:isMobile?"flex-start":"center", gap:isMobile?24:40 }}>
                {/* Left: main promise */}
                <div style={{ flex:1 }}>
                  <div style={{ display:"inline-flex",alignItems:"center",gap:7,padding:"5px 14px",borderRadius:100,background:"rgba(251,191,36,0.12)",border:"1px solid rgba(251,191,36,0.3)",marginBottom:16 }}>
                    <span style={{ width:6,height:6,borderRadius:"50%",background:"#22c55e",display:"inline-block",animation:"pulse 2s infinite",boxShadow:"0 0 6px rgba(34,197,94,0.6)" }}/>
                    <span style={{ color:"#fbbf24",fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:2 }}>Гарантия активации</span>
                  </div>
                  <h3 style={{ fontFamily:"'Clash Display',sans-serif",fontWeight:900,fontSize:isMobile?26:32,color:"#f8fafc",marginBottom:12,letterSpacing:-0.8,lineHeight:1.1 }}>
                    Активируем за <span style={{ background:"linear-gradient(135deg,#fbbf24,#f97316)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text" }}>60 минут</span>
                  </h3>
                  <p style={{ color:"#94a3b8",fontSize:14,lineHeight:1.65,marginBottom:20 }}>
                    После оплаты и загрузки чека оператор активирует подписку в течение часа. Не успели — полный возврат без вопросов.
                  </p>
                  <div style={{ display:"flex",gap:10,flexWrap:"wrap" }}>
                    {[
                      {icon:"⚡",text:"Оплата по СБП"},
                      {icon:"🔒",text:"Безопасно"},
                      {icon:"↩️",text:"Возврат 24ч"},
                    ].map(b => (
                      <div key={b.text} style={{ display:"flex",alignItems:"center",gap:6,padding:"6px 12px",borderRadius:100,background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",fontSize:12,color:"#94a3b8",fontWeight:500 }}>
                        <span style={{ fontSize:13 }}>{b.icon}</span>{b.text}
                      </div>
                    ))}
                  </div>
                </div>
                {/* Right: live counter */}
                <div style={{ flexShrink:0, textAlign:"center", background:"rgba(15,23,42,0.6)", border:"1px solid rgba(251,191,36,0.2)", borderRadius:20, padding:"24px 32px", minWidth:160 }}>
                  <div style={{ fontFamily:"'Clash Display',sans-serif",fontWeight:900,fontSize:48,background:"linear-gradient(135deg,#fbbf24,#f97316)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",lineHeight:1,fontVariantNumeric:"tabular-nums" }}>
                    {ordersCount !== null ? ordersCount : "—"}
                  </div>
                  <div style={{ color:"#64748b",fontSize:11,marginTop:6,textTransform:"uppercase",letterSpacing:1.5,fontWeight:600 }}>активаций сегодня</div>
                  <div style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:5,marginTop:10,color:"#22c55e",fontSize:11,fontWeight:600 }}>
                    <span style={{ width:5,height:5,borderRadius:"50%",background:"#22c55e",display:"inline-block",animation:"pulse 2s infinite" }}/>
                    Работаем сейчас
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* TRUST BADGES */}
          <div style={{ padding:"0 24px 80px",maxWidth:940,margin:"0 auto" }}>
            <div style={{ textAlign:"center",marginBottom:32 }}>
              <div style={{ color:t.gold,fontSize:11,textTransform:"uppercase",letterSpacing:3,marginBottom:10,fontWeight:600 }}>Надёжность</div>
              <h2 style={{ fontFamily:"'Clash Display',sans-serif",fontWeight:800,fontSize:30,color:t.text }}>Почему доверяют нам</h2>
            </div>
            <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:14 }}>
              {[
                {svg:<IconTrendUp size={20} color="#fbbf24"/>,title:"Курс ЦБ РФ",desc:"Конвертируем по официальному курсу без накрутки"},
                {svg:<IconZap size={20} color="#fbbf24"/>,title:"Оплата по СБП",desc:"Мгновенный перевод через систему быстрых платежей"},
                {svg:<IconLock size={20} color="#fbbf24"/>,title:"Данные в кабинете",desc:"Доступ к сервису — в личном кабинете, не в Telegram"},
                {svg:<IconShield size={20} color="#fbbf24"/>,title:"Возврат за 24 часа",desc:"Если не активировали — полный возврат средств"},
                {svg:<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8l-1.68 7.92c-.12.56-.46.7-.92.44l-2.56-1.88-1.23 1.18c-.14.14-.26.26-.52.26l.18-2.6 4.76-4.3c.2-.18-.04-.28-.32-.1L7.96 14.66l-2.5-.78c-.54-.17-.55-.54.12-.8l9.76-3.76c.46-.17.86.11.7.78l.6-.1z" fill="#fbbf24"/></svg>,title:"Telegram-канал",desc:"Новости, акции и советы по подпискам", link:"https://t.me/payflowru"},
              ].map((b,i)=>{
                const inner = <>
                  <div style={{ width:44,height:44,borderRadius:14,background:`linear-gradient(135deg,rgba(251,191,36,0.15),rgba(249,115,22,0.08))`,border:`1px solid ${t.goldB}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>{b.svg}</div>
                  <div>
                    <div style={{ fontWeight:700,fontSize:14,color:t.text,marginBottom:5,letterSpacing:-0.3 }}>{b.title}</div>
                    <div style={{ color:t.sub,fontSize:13,lineHeight:1.6 }}>{b.desc}</div>
                  </div>
                </>;
                return b.link
                  ? <a key={i} href={b.link} target="_blank" rel="noopener noreferrer" style={{ background:t.card2,border:`1px solid ${t.border}`,borderRadius:20,padding:"24px 22px",display:"flex",alignItems:"flex-start",gap:14,transition:"border-color 250ms,transform 250ms cubic-bezier(0.23,1,0.32,1)",textDecoration:"none" }}
                      onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.borderColor=t.borderH}}
                      onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.borderColor=t.border}}>{inner}</a>
                  : <div key={i} style={{ background:t.card2,border:`1px solid ${t.border}`,borderRadius:20,padding:"24px 22px",display:"flex",alignItems:"flex-start",gap:14,transition:"border-color 250ms,transform 250ms cubic-bezier(0.23,1,0.32,1)" }}
                      onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.borderColor=t.borderH}}
                      onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.borderColor=t.border}}>{inner}</div>;
              })}
            </div>
          </div>

          {/* REVIEWS */}
          {!reviewsLoading && reviewsList.length > 0 && (
          <div style={{ padding:"0 24px 80px",maxWidth:940,margin:"0 auto" }}>
            <div style={{ textAlign:"center",marginBottom:36 }}>
              <div style={{ color:t.gold,fontSize:11,textTransform:"uppercase",letterSpacing:3,marginBottom:10,fontWeight:600 }}>Отзывы</div>
              <h2 style={{ fontFamily:"'Clash Display',sans-serif",fontWeight:800,fontSize:30,color:t.text }}>Что говорят пользователи</h2>
              <div style={{ display:"flex",justifyContent:"center",gap:3,marginTop:12 }}>
                {"★★★★★".split("").map((s,i)=><span key={i} style={{ color:"#fbbf24",fontSize:20 }}>{s}</span>)}
                <span style={{ color:t.sub,fontSize:14,marginLeft:8,lineHeight:"26px" }}>
                  {(reviewsList.reduce((a,r)=>a+r.rating,0)/reviewsList.length).toFixed(1)} / {reviewsList.length} отзывов
                </span>
              </div>
            </div>
            <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:14 }}>
              {reviewsList.map((r,i)=>(
                <div key={r.id||i} style={{ background:t.card2,border:`1px solid ${t.border}`,borderRadius:20,padding:"24px 22px",position:"relative",overflow:"hidden",transition:"border-color 250ms,transform 250ms cubic-bezier(0.23,1,0.32,1)" }}
                  onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.borderColor=t.borderH}}
                  onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.borderColor=t.border}}>
                  <div style={{ position:"absolute",top:14,right:18,fontFamily:"Georgia,serif",fontSize:64,color:t.gold,opacity:0.07,lineHeight:1,pointerEvents:"none",fontWeight:900 }}>"</div>
                  <div style={{ display:"flex",gap:3,marginBottom:14 }}>
                    {[1,2,3,4,5].map(s=><span key={s} style={{ color:s<=r.rating?"#fbbf24":"#334155",fontSize:15 }}>★</span>)}
                  </div>
                  <p style={{ color:t.sub,fontSize:14,lineHeight:1.7,marginBottom:16,fontStyle:"italic" }}>«{r.comment}»</p>
                  <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                    <div style={{ width:34,height:34,borderRadius:"50%",background:`linear-gradient(135deg,rgba(251,191,36,0.8),rgba(249,115,22,0.8))`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:13,color:"#0a0a14",flexShrink:0 }}>{(r.user_name||"?")[0].toUpperCase()}</div>
                    <div>
                      <div style={{ fontWeight:700,fontSize:13,color:t.text,letterSpacing:-0.3 }}>{r.user_name||"Пользователь"}</div>
                      <div style={{ color:t.muted,fontSize:11 }}>{r.service_name} · {new Date(r.created_at).toLocaleDateString("ru-RU",{month:"long",year:"numeric"})}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          )}

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
      {selSvc && <OrderModal s={selSvc} rate={rate} user={session?.user} profile={profile} onClose={()=>setSelSvc(null)} onSave={async(order)=>{ const token=session?.access_token; const r=await fetch("/api/create-order",{method:"POST",headers:{"Content-Type":"application/json","Authorization":`Bearer ${token}`},body:JSON.stringify(order)}); const d=await r.json(); return {data:d.order,error:d.error?{message:d.error}:null}; }} onBalanceUsed={()=>userHook.reloadProfile(session?.user?.id)} go={go} t={t} requisites={requisites}/>}
      {showAuth && <AuthModal onClose={()=>setShowAuth(false)} userHook={userHook} t={t}/>}
      {showReqSvc && <RequestServiceModal onClose={()=>setShowReqSvc(false)} user={session?.user} t={t}/>}
      {showReviewModal && <ReviewModal onClose={()=>setShowReviewModal(false)} user={session?.user} profile={profile} serviceName={reviewTarget.serviceName} orderId={reviewTarget.orderId} t={t}/>}

      {/* Scroll to top */}
      {scrolled && (
        <button onClick={()=>window.scrollTo({top:0,behavior:"smooth"})}
          style={{ position:"fixed",bottom:28,right:24,zIndex:200,width:44,height:44,borderRadius:"50%",background:"linear-gradient(135deg,#f59e0b,#fbbf24)",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 20px rgba(251,191,36,0.4)",transition:"transform 200ms",color:"#0a0a14",fontSize:20,fontWeight:700,lineHeight:1 }}
          onMouseEnter={e=>e.currentTarget.style.transform="scale(1.1)"}
          onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>
          ↑
        </button>
      )}

      {/* Footer */}
      <div style={{ position:"relative",padding:"40px 32px 32px",background:t.dark?"rgba(0,0,0,0.4)":"rgba(0,0,0,0.02)" }}>
        <div style={{ position:"absolute",top:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,${t.borderH},transparent)` }}/>
        <div style={{ maxWidth:1160,margin:"0 auto",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:16 }}>
          <div>
            <div onClick={()=>{ go("#home"); window.scrollTo({top:0,behavior:"smooth"}); }} style={{ fontFamily:"'Clash Display',sans-serif",fontWeight:900,fontSize:22,marginBottom:5,letterSpacing:-0.5,cursor:"pointer" }}>pay<span style={{ background:"linear-gradient(135deg,#fbbf24,#f97316)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text" }}>flow</span></div>
            <div style={{ color:t.muted,fontSize:12,marginBottom:4 }}>Оплата зарубежных сервисов · 2026</div>
            <button onClick={()=>go("#legal")} style={{ background:"none",border:"none",color:t.muted,fontSize:12,cursor:"pointer",padding:0,textDecoration:"underline",textUnderlineOffset:3 }}>Оферта</button>
          </div>
          <div style={{ display:"flex",gap:16,alignItems:"center",flexWrap:"wrap" }}>
            <button onClick={()=>go("#catalog")} style={{ background:"none",border:"none",color:t.muted,fontSize:13,cursor:"pointer",transition:"color 200ms" }} onMouseEnter={e=>e.currentTarget.style.color=t.text} onMouseLeave={e=>e.currentTarget.style.color=t.muted}>Каталог</button>
            <button onClick={()=>go("#legal")} style={{ background:"none",border:"none",color:t.muted,fontSize:13,cursor:"pointer",transition:"color 200ms" }} onMouseEnter={e=>e.currentTarget.style.color=t.text} onMouseLeave={e=>e.currentTarget.style.color=t.muted}>Оферта</button>
            <button onClick={()=>go("#cabinet")} style={{ background:"none",border:"none",color:t.muted,fontSize:13,cursor:"pointer",transition:"color 200ms" }} onMouseEnter={e=>e.currentTarget.style.color=t.text} onMouseLeave={e=>e.currentTarget.style.color=t.muted}>Личный кабинет</button>
            <a href="https://t.me/payflowru" target="_blank" rel="noopener noreferrer" style={{ display:"flex",alignItems:"center",gap:6,padding:"6px 12px",borderRadius:100,background:"rgba(34,197,94,0.08)",border:"1px solid rgba(34,197,94,0.25)",textDecoration:"none",transition:"all 200ms" }}
              onMouseEnter={e=>e.currentTarget.style.background="rgba(34,197,94,0.15)"}
              onMouseLeave={e=>e.currentTarget.style.background="rgba(34,197,94,0.08)"}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8l-1.68 7.92c-.12.56-.46.7-.92.44l-2.56-1.88-1.23 1.18c-.14.14-.26.26-.52.26l.18-2.6 4.76-4.3c.2-.18-.04-.28-.32-.1L7.96 14.66l-2.5-.78c-.54-.17-.55-.54.12-.8l9.76-3.76c.46-.17.86.11.7.78l.6-.1z" fill="#22c55e"/></svg>
              <span style={{ color:"#22c55e",fontSize:11,fontWeight:600 }}>Telegram</span>
            </a>
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
