import { useState, useEffect, useRef } from "react";

const REQUISITES_POOL = [
  { label:"Тинькофф", sbp:"+7 (900) 000-00-00", card:"2200 0000 0000 0001", holder:"Иван И." },
  { label:"Сбербанк",  sbp:"+7 (900) 000-00-01", card:"2202 0000 0000 0002", holder:"Иван И." },
  { label:"ВТБ",       sbp:"+7 (900) 000-00-02", card:"2200 0000 0000 0003", holder:"Иван И." },
];
const ADMIN_PASSWORD = "payflow2026";
const TELEGRAM_LINK = "https://t.me/wladislaw_le"; // замени на свой Telegram
const MARGIN = 0.10;
const getReq = () => REQUISITES_POOL[Math.floor(Math.random()*REQUISITES_POOL.length)];
const calc = (usd, rate) => Math.round(usd * rate * (1 + MARGIN));
const mosDate = () => new Date().toLocaleDateString("ru-RU", { timeZone:"Europe/Moscow", day:"2-digit", month:"2-digit", year:"numeric" });

const SVC = [
  {id:1,  name:"ChatGPT Plus",          cat:"AI",             icon:"🤖", tiers:[{n:"Plus",p:20},{n:"Team",p:25},{n:"Pro",p:200}],        login:true, gift:false,family:true, newAcc:true},
  {id:2,  name:"Claude Pro",            cat:"AI",             icon:"🧠", tiers:[{n:"Pro",p:20},{n:"Team",p:30}],                         login:true, gift:false,family:true, newAcc:true},
  {id:3,  name:"Perplexity Pro",        cat:"AI",             icon:"🔍", tiers:[{n:"Pro",p:20}],                                         login:true, gift:false,family:false,newAcc:true},
  {id:4,  name:"Grok Premium",          cat:"AI",             icon:"🐦", tiers:[{n:"Premium",p:8},{n:"Premium+",p:16}],                  login:true, gift:false,family:false,newAcc:false},
  {id:5,  name:"Gemini Advanced",       cat:"AI",             icon:"💎", tiers:[{n:"Google One",p:19.99}],                              login:true, gift:true, family:true, newAcc:false},
  {id:6,  name:"Midjourney",            cat:"AI",             icon:"🎨", tiers:[{n:"Basic",p:10},{n:"Standard",p:30},{n:"Pro",p:60},{n:"Mega",p:120}], login:true,gift:false,family:false,newAcc:true},
  {id:7,  name:"Leonardo AI",           cat:"AI",             icon:"🖼️", tiers:[{n:"Apprentice",p:10},{n:"Artisan",p:24},{n:"Maestro",p:48}],login:true,gift:false,family:false,newAcc:true},
  {id:8,  name:"Runway ML",             cat:"AI",             icon:"🎬", tiers:[{n:"Standard",p:15},{n:"Pro",p:35},{n:"Unlimited",p:95}], login:true,gift:false,family:false,newAcc:true},
  {id:9,  name:"ElevenLabs",            cat:"AI",             icon:"🎙️", tiers:[{n:"Starter",p:5},{n:"Creator",p:22},{n:"Pro",p:99}],    login:true,gift:false,family:false,newAcc:true},
  {id:10, name:"Kling AI",              cat:"AI",             icon:"🎥", tiers:[{n:"Starter",p:8},{n:"Pro",p:35},{n:"Premier",p:88}],   login:true,gift:false,family:false,newAcc:true},
  {id:11, name:"Murf AI",               cat:"AI",             icon:"🔊", tiers:[{n:"Creator",p:29},{n:"Business",p:99}],                login:true,gift:false,family:false,newAcc:true},
  {id:12, name:"Cursor Pro",            cat:"Разработка",     icon:"💻", tiers:[{n:"Pro",p:20},{n:"Ultra",p:200}],                       login:true,gift:false,family:false,newAcc:true},
  {id:13, name:"GitHub Copilot",        cat:"Разработка",     icon:"⚡", tiers:[{n:"Pro",p:10},{n:"Pro+",p:39}],                         login:true,gift:false,family:false,newAcc:false},
  {id:14, name:"Windsurf",              cat:"Разработка",     icon:"🏄", tiers:[{n:"Pro",p:15},{n:"Teams",p:30}],                        login:true,gift:false,family:false,newAcc:true},
  {id:15, name:"Replit Core",           cat:"Разработка",     icon:"🔧", tiers:[{n:"Core",p:20}],                                        login:true,gift:false,family:false,newAcc:true},
  {id:16, name:"Vercel Pro",            cat:"Разработка",     icon:"▲",  tiers:[{n:"Pro",p:20}],                                         login:true,gift:false,family:false,newAcc:false},
  {id:17, name:"Linear",               cat:"Разработка",     icon:"📐", tiers:[{n:"Plus",p:8},{n:"Business",p:14}],                    login:true,gift:false,family:false,newAcc:false},
  {id:18, name:"Figma",                cat:"Дизайн",          icon:"✏️", tiers:[{n:"Professional",p:15},{n:"Organization",p:45}],        login:true,gift:false,family:false,newAcc:false},
  {id:19, name:"Canva Pro",            cat:"Дизайн",          icon:"🖌️", tiers:[{n:"Pro",p:14.99},{n:"Teams",p:29.99}],                  login:true,gift:true, family:true, newAcc:false},
  {id:20, name:"Adobe Creative Cloud", cat:"Дизайн",          icon:"🅰️", tiers:[{n:"Photography",p:19.99},{n:"All Apps",p:54.99}],      login:true,gift:true, family:false,newAcc:false},
  {id:21, name:"Adobe Firefly",        cat:"Дизайн",          icon:"🔥", tiers:[{n:"Firefly",p:9.99},{n:"All Apps",p:54.99}],           login:true,gift:true, family:false,newAcc:false},
  {id:22, name:"Notion",               cat:"Продуктивность",  icon:"📝", tiers:[{n:"Plus",p:10},{n:"Business",p:15}],                  login:true,gift:false,family:false,newAcc:false},
  {id:23, name:"Notion AI",            cat:"Продуктивность",  icon:"🤖", tiers:[{n:"AI Add-on",p:10}],                                 login:true,gift:false,family:false,newAcc:false},
  {id:24, name:"Grammarly",            cat:"Продуктивность",  icon:"📖", tiers:[{n:"Premium",p:30},{n:"Business",p:25}],               login:true,gift:true, family:false,newAcc:false},
  {id:25, name:"Dropbox Plus",         cat:"Продуктивность",  icon:"📦", tiers:[{n:"Plus",p:11.99},{n:"Professional",p:19.99}],        login:true,gift:false,family:false,newAcc:false},
  {id:26, name:"Obsidian Sync",        cat:"Продуктивность",  icon:"🔮", tiers:[{n:"Sync",p:10},{n:"Sync+Publish",p:20}],              login:true,gift:false,family:false,newAcc:false},
  {id:27, name:"Loom",                 cat:"Продуктивность",  icon:"📹", tiers:[{n:"Starter",p:12.5},{n:"Business+",p:16}],            login:true,gift:false,family:false,newAcc:false},
  {id:28, name:"Otter.ai",             cat:"Продуктивность",  icon:"🦦", tiers:[{n:"Pro",p:16.99},{n:"Business",p:30}],                login:true,gift:false,family:false,newAcc:true},
  {id:29, name:"Netflix",              cat:"Стриминг",        icon:"🎬", tiers:[{n:"Standard",p:15.49},{n:"Premium",p:22.99}],          login:true,gift:true, family:true, newAcc:false},
  {id:30, name:"YouTube Premium",      cat:"Стриминг",        icon:"▶️", tiers:[{n:"Individual",p:13.99},{n:"Family",p:22.99}],         login:true,gift:true, family:true, newAcc:false},
  {id:31, name:"Disney+",              cat:"Стриминг",        icon:"🏰", tiers:[{n:"Basic",p:7.99},{n:"Premium",p:13.99}],              login:true,gift:true, family:false,newAcc:false},
  {id:32, name:"Apple TV+",            cat:"Стриминг",        icon:"🍎", tiers:[{n:"Individual",p:9.99}],                               login:true,gift:true, family:true, newAcc:false},
  {id:33, name:"HBO Max",              cat:"Стриминг",        icon:"📺", tiers:[{n:"With Ads",p:9.99},{n:"Ad-Free",p:15.99},{n:"Ultimate",p:19.99}], login:true,gift:true,family:false,newAcc:false},
  {id:34, name:"Crunchyroll",          cat:"Стриминг",        icon:"⛩️", tiers:[{n:"Fan",p:7.99},{n:"Mega Fan",p:9.99},{n:"Ultimate Fan",p:14.99}],  login:true,gift:true,family:false,newAcc:false},
  {id:35, name:"Spotify Premium",      cat:"Музыка",          icon:"🎵", tiers:[{n:"Individual",p:11.99},{n:"Duo",p:16.99},{n:"Family",p:19.99}], login:true,gift:true,family:true,newAcc:false},
  {id:36, name:"Apple Music",          cat:"Музыка",          icon:"🎶", tiers:[{n:"Individual",p:10.99},{n:"Family",p:16.99}],         login:true,gift:true, family:true, newAcc:false},
  {id:37, name:"Tidal",               cat:"Музыка",          icon:"🌊", tiers:[{n:"Individual",p:10.99},{n:"Family",p:17.99}],         login:true,gift:false,family:true, newAcc:false},
  {id:38, name:"Duolingo Super",       cat:"Обучение",        icon:"🦉", tiers:[{n:"Super",p:12.99},{n:"Family",p:119.99}],             login:true,gift:true, family:true, newAcc:false},
  {id:39, name:"Coursera Plus",        cat:"Обучение",        icon:"🎓", tiers:[{n:"Monthly",p:59},{n:"Annual",p:399}],                 login:true,gift:false,family:false,newAcc:false},
  {id:40, name:"MasterClass",          cat:"Обучение",        icon:"🏆", tiers:[{n:"Individual",p:10},{n:"Duo",p:15},{n:"Family",p:20}],login:true,gift:true, family:true, newAcc:false},
  {id:41, name:"Skillshare",           cat:"Обучение",        icon:"🎒", tiers:[{n:"Individual",p:32}],                                 login:true,gift:true, family:false,newAcc:false},
  {id:42, name:"Discord Nitro",        cat:"Инструменты",     icon:"💬", tiers:[{n:"Basic",p:2.99},{n:"Nitro",p:9.99}],                login:true,gift:true, family:false,newAcc:false},
  {id:43, name:"Telegram Premium",     cat:"Инструменты",     icon:"✈️", tiers:[{n:"Premium",p:4.99}],                                  login:true,gift:true, family:false,newAcc:false},
  {id:44, name:"NordVPN",              cat:"Инструменты",     icon:"🔒", tiers:[{n:"Basic 1м",p:12.99},{n:"Basic 1г",p:53.88}],         login:true,gift:false,family:false,newAcc:false},
  {id:45, name:"1Password",            cat:"Инструменты",     icon:"🔑", tiers:[{n:"Individual",p:2.99},{n:"Families",p:4.99}],         login:true,gift:false,family:true, newAcc:false},
  {id:46, name:"Setapp",               cat:"Инструменты",     icon:"📱", tiers:[{n:"Individual",p:9.99},{n:"Family",p:14.99}],          login:true,gift:false,family:true, newAcc:false},
  {id:47, name:"Zoom Pro",             cat:"Инструменты",     icon:"📞", tiers:[{n:"Pro",p:15.99},{n:"Business",p:19.99}],              login:true,gift:false,family:false,newAcc:false},
  {id:48, name:"Xbox Game Pass",       cat:"Игры",            icon:"🎮", tiers:[{n:"Ultimate",p:19.99}],                                login:true,gift:true, family:false,newAcc:false},
  {id:49, name:"PlayStation Plus",     cat:"Игры",            icon:"🕹️", tiers:[{n:"Essential",p:9.99},{n:"Extra",p:14.99},{n:"Premium",p:17.99}], login:true,gift:true,family:false,newAcc:false},
  {id:50, name:"Steam (пополнение)",   cat:"Игры",            icon:"🚂", tiers:[{n:"$20",p:20},{n:"$50",p:50},{n:"$100",p:100}],       login:false,gift:true, family:false,newAcc:false},
];

const CATS = ["Все","AI","Разработка","Дизайн","Стриминг","Музыка","Продуктивность","Инструменты","Обучение","Игры"];
const SL = {new:"Новая",paid:"Оплачена",processing:"В обработке",done:"Выполнена",cancelled:"Отменена"};
const SC = {new:"#fbbf24",paid:"#60a5fa",processing:"#a78bfa",done:"#34d399",cancelled:"#f87171"};
const POPULAR_NAMES = ["ChatGPT Plus","Midjourney","Netflix","Spotify Premium","Cursor Pro","Claude Pro"];

// ─── THEME ────────────────────────────────────────────────────
function useTheme() {
  const [dark, setDark] = useState(() => { try { return window.matchMedia("(prefers-color-scheme: dark)").matches; } catch { return true; } });
  const toggle = () => setDark(d => !d);
  const t = {
    dark,
    bg:        dark ? "#07070f"               : "#eeeef3",
    card:      dark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.9)",
    card2:     dark ? "rgba(255,255,255,0.08)" : "#ffffff",
    border:    dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)",
    borderH:   dark ? "rgba(251,191,36,0.5)"  : "rgba(217,119,6,0.6)",
    text:      dark ? "#ffffff"               : "#111118",
    sub:       dark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.55)",
    muted:     dark ? "rgba(255,255,255,0.25)": "rgba(0,0,0,0.35)",
    nav:       dark ? "rgba(7,7,15,0.92)"     : "rgba(238,238,243,0.92)",
    inp:       dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)",
    gold:      "#fbbf24",
    goldD:     "#f59e0b",
    goldDim:   dark ? "rgba(251,191,36,0.1)"  : "rgba(217,119,6,0.1)",
    goldB:     dark ? "rgba(251,191,36,0.35)" : "rgba(217,119,6,0.4)",
    shadow:    dark ? "0 8px 32px rgba(0,0,0,0.5)" : "0 4px 24px rgba(0,0,0,0.1)",
    shadowG:   "0 6px 28px rgba(251,191,36,0.3)",
  };
  return { t, toggle };
}

// ─── BADGE ────────────────────────────────────────────────────
function Badge({ active, color, children }) {
  const p = {
    blue:   ["rgba(96,165,250,0.15)","rgba(96,165,250,0.4)","#93c5fd"],
    green:  ["rgba(52,211,153,0.15)","rgba(52,211,153,0.4)","#6ee7b7"],
    purple: ["rgba(167,139,250,0.15)","rgba(167,139,250,0.4)","#c4b5fd"],
    yellow: ["rgba(251,191,36,0.15)","rgba(251,191,36,0.4)","#fde68a"],
  }[color];
  return <span style={{ fontSize:10, padding:"2px 8px", borderRadius:100, fontWeight:600, whiteSpace:"nowrap", background:active?p[0]:"rgba(128,128,128,0.08)", border:`1px solid ${active?p[1]:"rgba(128,128,128,0.15)"}`, color:active?p[2]:"rgba(128,128,128,0.35)" }}>{children}</span>;
}

// ─── SERVICE CARD ─────────────────────────────────────────────
function SCard({ s, rate, onSelect, t }) {
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} onClick={()=>onSelect(s)}
      style={{ background:hov?t.card2:t.card, border:`1px solid ${hov?t.borderH:t.border}`, borderRadius:18, padding:20, cursor:"pointer", transition:"all .25s cubic-bezier(.4,0,.2,1)", transform:hov?"translateY(-4px)":"none", boxShadow:hov?t.shadow:"none" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:26, transition:"filter .2s", filter:hov?"drop-shadow(0 0 8px rgba(251,191,36,0.5))":"none" }}>{s.icon}</span>
          <div>
            <div style={{ color:t.text, fontWeight:700, fontSize:14, fontFamily:"'Syne',sans-serif" }}>{s.name}</div>
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
        {s.tiers.map((tier,i)=>(
          <div key={i} style={{ background:t.goldDim, border:`1px solid ${t.goldB}`, borderRadius:9, padding:"5px 10px" }}>
            <div style={{ color:t.muted, fontSize:10 }}>{tier.n}</div>
            <div style={{ color:t.gold, fontWeight:700, fontSize:12 }}>${tier.p} <span style={{ color:t.muted, fontWeight:400, fontSize:10 }}>= {rate?calc(tier.p,rate).toLocaleString("ru-RU"):"..."}₽</span></div>
          </div>
        ))}
      </div>
      <div style={{ marginTop:3, textAlign:"right" }}><span style={{ fontSize:10, color:t.muted }}>* с комиссией 10%</span></div>
      <div style={{ marginTop:10, padding:"8px 12px", borderRadius:9, fontSize:12, textAlign:"center", fontWeight:600, transition:"all .2s", background:hov?t.goldDim:"transparent", color:hov?t.gold:t.muted, border:`1px solid ${hov?t.goldB:"transparent"}` }}>
        {hov ? "→ Оформить заявку" : "Нажмите для заказа"}
      </div>
    </div>
  );
}

// ─── ORDER MODAL ──────────────────────────────────────────────
function OrderModal({ s, rate, onClose, onSave, t, onGoStatus }) {
  const [tier, setTier] = useState(s.tiers[0]);
  const [method, setMethod] = useState(s.gift?"gift":s.newAcc?"newAcc":"login");
  const [login, setLogin] = useState(""); const [pass, setPass] = useState(""); const [email, setEmail] = useState("");
  const [step, setStep] = useState(1); const [file, setFile] = useState(null);
  const orderId = useRef(`#${Math.floor(10000+Math.random()*90000)}`).current;
  const req = useRef(getReq()).current;
  const fileRef = useRef();
  const base = rate?Math.round(tier.p*rate):0;
  const comm = rate?Math.round(tier.p*rate*MARGIN):0;
  const total = base+comm;
  const methods = [];
  if(s.login)  methods.push({id:"login",  icon:"🔐", label:"Войти в аккаунт",   desc:"Укажите логин/пароль — зайдём и активируем"});
  if(s.gift)   methods.push({id:"gift",   icon:"🎁", label:"Gift-карта",         desc:"Без доступа к аккаунту — пришлём код"});
  if(s.family) methods.push({id:"family", icon:"👨‍👩‍👧", label:"Family/Team план",  desc:"Добавим по email — в своём аккаунте"});
  if(s.newAcc) methods.push({id:"newAcc", icon:"✨", label:"Новый аккаунт",      desc:"Создадим и передадим готовые данные"});
  const inp = {width:"100%",background:t.inp,border:`1px solid ${t.border}`,borderRadius:10,padding:"12px 14px",color:t.text,fontSize:14,outline:"none",marginBottom:8,boxSizing:"border-box"};
  const handleCreate = () => { onSave({id:orderId,service:s.name,tier:tier.n,priceUsd:tier.p,priceRub:total,method,login,email,status:"new",operatorNote:"",receipt:false,createdAt:new Date().toISOString()}); setStep(2); };
  return (
    <div style={{ position:"fixed",inset:0,zIndex:200,background:"rgba(0,0,0,0.8)",backdropFilter:"blur(16px)",display:"flex",alignItems:"center",justifyContent:"center",padding:20 }} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{ background:t.dark?"#0c0c1a":"#ffffff", border:`1px solid ${t.goldB}`, borderRadius:22, width:"100%", maxWidth:490, padding:28, maxHeight:"90vh", overflowY:"auto", boxShadow:"0 24px 80px rgba(0,0,0,0.5)" }}>
        {step===1 ? (
          <>
            <div style={{ display:"flex",justifyContent:"space-between",marginBottom:22 }}>
              <div><div style={{ fontSize:20,fontFamily:"'Syne',sans-serif",fontWeight:800,color:t.text }}>{s.icon} {s.name}</div><div style={{ color:t.sub,fontSize:12,marginTop:2 }}>Оформление заявки</div></div>
              <button onClick={onClose} style={{ color:t.sub,fontSize:22,background:"none",border:"none",cursor:"pointer" }}>✕</button>
            </div>
            <div style={{ marginBottom:18 }}>
              <div style={{ color:t.muted,fontSize:11,marginBottom:8,textTransform:"uppercase",letterSpacing:1 }}>Тариф</div>
              <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
                {s.tiers.map((ti,i)=><button key={i} onClick={()=>setTier(ti)} style={{ padding:"10px 14px",borderRadius:10,cursor:"pointer",background:tier.n===ti.n?t.goldDim:t.inp,border:`1px solid ${tier.n===ti.n?t.gold:t.border}`,color:tier.n===ti.n?t.gold:t.sub,fontWeight:600,fontSize:13,transition:"all .15s" }}>{ti.n} — ${ti.p}</button>)}
              </div>
            </div>
            <div style={{ marginBottom:18 }}>
              <div style={{ color:t.muted,fontSize:11,marginBottom:8,textTransform:"uppercase",letterSpacing:1 }}>Способ активации</div>
              {methods.map(m=><button key={m.id} onClick={()=>setMethod(m.id)} style={{ width:"100%",padding:"11px 14px",borderRadius:10,cursor:"pointer",textAlign:"left",background:method===m.id?t.goldDim:t.inp,border:`1px solid ${method===m.id?t.goldB:t.border}`,marginBottom:7,transition:"all .15s" }}>
                <div style={{ color:t.text,fontWeight:600,fontSize:13 }}>{m.icon} {m.label}</div>
                <div style={{ color:t.sub,fontSize:11,marginTop:2 }}>{m.desc}</div>
              </button>)}
            </div>
            <div style={{ marginBottom:18 }}>
              <div style={{ color:t.muted,fontSize:11,marginBottom:8,textTransform:"uppercase",letterSpacing:1 }}>Ваши данные</div>
              {(method==="gift"||method==="family")&&<input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email от аккаунта" style={inp}/>}
              {method==="login"&&<><input value={login} onChange={e=>setLogin(e.target.value)} placeholder="Логин / Email" style={inp}/><input value={pass} onChange={e=>setPass(e.target.value)} placeholder="Пароль" type="password" style={inp}/><div style={{ background:t.goldDim,border:`1px solid ${t.goldB}`,borderRadius:10,padding:"12px 14px",fontSize:12,color:t.sub,lineHeight:1.6 }}>
                    ⚠️ Если включена 2FA — после оплаты напишите нам в Telegram, мы запросим код и введём вместе с вами.
                    <a href={TELEGRAM_LINK} target="_blank" rel="noopener" style={{ display:"block",marginTop:8,padding:"8px 14px",borderRadius:8,background:"rgba(0,136,204,0.15)",border:"1px solid rgba(0,136,204,0.3)",color:"#29b6f6",fontWeight:600,fontSize:12,textDecoration:"none",textAlign:"center" }}>
                      ✈️ Написать в Telegram →
                    </a>
                  </div></>}
              {method==="newAcc"&&<div style={{ background:t.inp,border:`1px solid ${t.border}`,borderRadius:10,padding:14,fontSize:12,color:t.sub,lineHeight:1.6 }}>✨ Создадим аккаунт и пришлём логин/пароль после оплаты. Ничего вводить не нужно.</div>}
            </div>
            <div style={{ background:t.goldDim,border:`1px solid ${t.goldB}`,borderRadius:14,padding:16,marginBottom:18 }}>
              <div style={{ display:"flex",justifyContent:"space-between",marginBottom:6 }}><span style={{ color:t.sub,fontSize:13 }}>Курс ЦБ</span><span style={{ color:t.sub,fontSize:13 }}>1$ = {rate?.toFixed(2)} ₽</span></div>
              <div style={{ display:"flex",justifyContent:"space-between",marginBottom:10 }}><span style={{ color:t.sub,fontSize:13 }}>Комиссия 10%</span><span style={{ color:t.sub,fontSize:13 }}>+ {comm.toLocaleString("ru-RU")} ₽</span></div>
              <div style={{ display:"flex",justifyContent:"space-between",borderTop:`1px solid ${t.border}`,paddingTop:12 }}><span style={{ color:t.text,fontWeight:700,fontSize:15 }}>К оплате</span><span style={{ color:t.gold,fontWeight:900,fontSize:26,fontFamily:"'Syne',sans-serif" }}>{total.toLocaleString("ru-RU")} ₽</span></div>
            </div>
            <button onClick={handleCreate} style={{ width:"100%",padding:14,borderRadius:12,background:"linear-gradient(135deg,#f59e0b,#fbbf24)",border:"none",color:"#0a0a14",fontWeight:800,fontSize:15,cursor:"pointer",boxShadow:t.shadowG }}>Создать заявку →</button>
          </>
        ) : (
          <div style={{ textAlign:"center" }}>
            {/* Заявка создана */}
            <div style={{ textAlign:"center",marginBottom:20 }}>
              <div style={{ fontSize:52,marginBottom:12 }}>✅</div>
              <div style={{ fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:22,color:t.text,marginBottom:8 }}>Заявка создана!</div>
              <div style={{ background:t.goldDim,border:`1px solid ${t.goldB}`,borderRadius:12,padding:"10px 24px",display:"inline-block",color:t.gold,fontWeight:800,fontSize:28 }}>{orderId}</div>
            </div>
            <div style={{ color:t.sub,fontSize:14,marginBottom:20,lineHeight:1.7,textAlign:"center" }}>
              Переведите <strong style={{ color:t.text,fontSize:16 }}>{total.toLocaleString("ru-RU")} ₽</strong><br/>
              и укажи номер заявки в комментарии к переводу
            </div>

            {/* Реквизиты */}
            <div style={{ background:t.card,border:`1px solid ${t.border}`,borderRadius:16,padding:20,marginBottom:16 }}>
              <div style={{ color:t.muted,fontSize:10,marginBottom:12,textTransform:"uppercase",letterSpacing:1,fontWeight:600 }}>💳 Реквизиты · {req.label}</div>
              <div style={{ marginBottom:12 }}>
                <div style={{ color:t.muted,fontSize:11,marginBottom:4 }}>По СБП</div>
                <div style={{ color:t.text,fontWeight:700,fontSize:17 }}>{req.sbp}</div>
                <div style={{ color:t.muted,fontSize:12 }}>{req.holder}</div>
              </div>
              <div style={{ marginBottom:12,paddingTop:12,borderTop:`1px solid ${t.border}` }}>
                <div style={{ color:t.muted,fontSize:11,marginBottom:4 }}>По номеру карты</div>
                <div style={{ color:t.text,fontWeight:700,fontSize:17 }}>{req.card}</div>
                <div style={{ color:t.muted,fontSize:12 }}>{req.label} · {req.holder}</div>
              </div>
              <div style={{ paddingTop:12,borderTop:`1px solid ${t.border}`,display:"flex",alignItems:"center",justifyContent:"space-between" }}>
                <span style={{ color:t.muted,fontSize:12 }}>Комментарий к переводу:</span>
                <strong style={{ color:t.gold,fontSize:18 }}>{orderId}</strong>
              </div>
            </div>

            {/* Telegram для чека и коммуникации */}
            <div style={{ background:"rgba(0,136,204,0.08)",border:"1px solid rgba(0,136,204,0.25)",borderRadius:14,padding:16,marginBottom:16 }}>
              <div style={{ fontWeight:600,fontSize:13,color:"#29b6f6",marginBottom:6 }}>✈️ После оплаты напишите нам в Telegram</div>
              <div style={{ color:t.sub,fontSize:12,marginBottom:12,lineHeight:1.6 }}>
                • Пришлите скриншот чека об оплате<br/>
                • Если нужна 2FA — введём код вместе<br/>
                • Туда же отправим данные аккаунта
              </div>
              <a href={TELEGRAM_LINK} target="_blank" rel="noopener" style={{ display:"block",padding:"11px 16px",borderRadius:10,background:"rgba(0,136,204,0.2)",border:"1px solid rgba(0,136,204,0.4)",color:"#29b6f6",fontWeight:700,fontSize:14,textDecoration:"none",textAlign:"center" }}>
                Написать в Telegram →
              </a>
            </div>

            {/* Статус заявки */}
            <div style={{ background:t.goldDim,border:`1px solid ${t.goldB}`,borderRadius:12,padding:"12px 16px",marginBottom:16,display:"flex",alignItems:"center",justifyContent:"space-between" }}>
              <span style={{ color:t.sub,fontSize:13 }}>Статус заявки {orderId}</span>
              <button onClick={()=>onGoStatus&&onGoStatus()} style={{ padding:"6px 14px",borderRadius:8,background:t.goldDim,border:`1px solid ${t.goldB}`,color:t.gold,cursor:"pointer",fontSize:12,fontWeight:600 }}>
                Следить за статусом →
              </button>
            </div>

            <div style={{ color:t.muted,fontSize:12,marginBottom:16,textAlign:"center",lineHeight:1.7 }}>
              ⏱ Обрабатываем до 1 часа в рабочее время.<br/>В редких случаях до 24 ч — предупредим в Telegram.
            </div>
            <button onClick={onClose} style={{ width:"100%",padding:12,borderRadius:10,background:t.inp,border:`1px solid ${t.border}`,color:t.sub,cursor:"pointer",fontSize:14 }}>Закрыть</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ORDER STATUS PAGE ───────────────────────────────────────
function OrderStatus({ orders, t, onBack }) {
  const [query, setQuery] = useState("");
  const [found, setFound] = useState(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = () => {
    const q = query.trim().toUpperCase().replace("#","");
    const order = orders.find(o => o.id.replace("#","") === q);
    setFound(order || null);
    setSearched(true);
  };

  const statusEmoji = { new:"⏳", paid:"💰", processing:"🔧", done:"✅", cancelled:"❌" };

  return (
    <div style={{ minHeight:"100vh", background:t.bg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"80px 20px" }}>
      <div style={{ width:"100%", maxWidth:500 }}>
        <button onClick={onBack} style={{ background:"none", border:"none", color:t.sub, cursor:"pointer", fontSize:14, marginBottom:24, display:"flex", alignItems:"center", gap:6 }}>← Назад</button>
        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:28, color:t.text, marginBottom:6 }}>🔍 Статус заявки</div>
        <div style={{ color:t.sub, fontSize:14, marginBottom:28 }}>Введите номер заявки чтобы узнать статус</div>

        <div style={{ display:"flex", gap:10, marginBottom:24 }}>
          <input
            value={query}
            onChange={e=>setQuery(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&handleSearch()}
            placeholder="Например: #12345"
            style={{ flex:1, background:t.card2, border:`1px solid ${t.border}`, borderRadius:12, padding:"13px 16px", color:t.text, fontSize:16, outline:"none", fontWeight:600 }}
          />
          <button onClick={handleSearch} style={{ padding:"13px 22px", borderRadius:12, background:"linear-gradient(135deg,#f59e0b,#fbbf24)", border:"none", color:"#0a0a14", fontWeight:800, fontSize:15, cursor:"pointer" }}>
            Найти
          </button>
        </div>

        {searched && !found && (
          <div style={{ background:t.card2, border:`1px solid ${t.border}`, borderRadius:16, padding:24, textAlign:"center" }}>
            <div style={{ fontSize:40, marginBottom:12 }}>😕</div>
            <div style={{ color:t.text, fontWeight:600, fontSize:15 }}>Заявка не найдена</div>
            <div style={{ color:t.sub, fontSize:13, marginTop:6 }}>Проверьте номер и попробуйте снова</div>
          </div>
        )}

        {found && (
          <div style={{ background:t.card2, border:`1px solid ${t.border}`, borderRadius:18, padding:24, boxShadow:t.shadow }}>
            {/* Header */}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20 }}>
              <div>
                <div style={{ color:t.gold, fontWeight:800, fontSize:22, fontFamily:"'Syne',sans-serif" }}>{found.id}</div>
                <div style={{ color:t.sub, fontSize:13, marginTop:2 }}>{new Date(found.createdAt).toLocaleString("ru-RU")}</div>
              </div>
              <div style={{ background:SC[found.status]+"22", border:`1px solid ${SC[found.status]}55`, color:SC[found.status], fontSize:14, padding:"6px 14px", borderRadius:100, fontWeight:700 }}>
                {statusEmoji[found.status]} {SL[found.status]}
              </div>
            </div>

            {/* Order details */}
            <div style={{ background:t.goldDim, border:`1px solid ${t.goldB}`, borderRadius:12, padding:"14px 16px", marginBottom:16 }}>
              <div style={{ color:t.sub, fontSize:12, marginBottom:4 }}>Сервис</div>
              <div style={{ color:t.text, fontWeight:700, fontSize:15 }}>{found.service} · {found.tier}</div>
              <div style={{ color:t.gold, fontWeight:800, fontSize:20, marginTop:4 }}>{found.priceRub.toLocaleString("ru-RU")} ₽</div>
            </div>

            {/* Status timeline */}
            <div style={{ marginBottom:16 }}>
              {[
                {key:"new",       label:"Заявка создана"},
                {key:"paid",      label:"Оплата получена"},
                {key:"processing",label:"В обработке"},
                {key:"done",      label:"Выполнена"},
              ].map((step, i) => {
                const statuses = ["new","paid","processing","done"];
                const currentIdx = statuses.indexOf(found.status);
                const stepIdx = statuses.indexOf(step.key);
                const isActive = stepIdx <= currentIdx && found.status !== "cancelled";
                const isCurrent = step.key === found.status;
                return (
                  <div key={step.key} style={{ display:"flex", alignItems:"center", gap:12, marginBottom:8 }}>
                    <div style={{ width:28, height:28, borderRadius:"50%", background:isActive?(isCurrent?t.gold:"rgba(52,211,153,0.8)"):t.inp, border:`2px solid ${isActive?(isCurrent?t.gold:"#34d399"):t.border}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, flexShrink:0 }}>
                      {isActive ? (isCurrent ? "●" : "✓") : "○"}
                    </div>
                    <div style={{ color:isActive?t.text:t.muted, fontWeight:isCurrent?700:400, fontSize:14 }}>{step.label}</div>
                    {isCurrent && found.status !== "done" && <span style={{ fontSize:11, color:t.muted }}>← сейчас</span>}
                  </div>
                );
              })}
              {found.status === "cancelled" && (
                <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <div style={{ width:28, height:28, borderRadius:"50%", background:"rgba(248,113,113,0.2)", border:"2px solid #f87171", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, flexShrink:0 }}>✕</div>
                  <div style={{ color:"#f87171", fontWeight:700, fontSize:14 }}>Отменена</div>
                </div>
              )}
            </div>

            {/* Operator message - account credentials */}
            {found.operatorNote && (
              <div style={{ background:"rgba(52,211,153,0.08)", border:"1px solid rgba(52,211,153,0.3)", borderRadius:14, padding:16, marginBottom:16 }}>
                <div style={{ color:"#6ee7b7", fontWeight:700, fontSize:13, marginBottom:8 }}>📩 Сообщение от оператора:</div>
                <div style={{ color:t.text, fontSize:14, lineHeight:1.7, whiteSpace:"pre-wrap", fontFamily:"monospace", background:t.inp, borderRadius:8, padding:"10px 12px" }}>{found.operatorNote}</div>
              </div>
            )}

            {!found.operatorNote && found.status !== "done" && (
              <div style={{ color:t.sub, fontSize:13, textAlign:"center", padding:"8px 0", marginBottom:8 }}>Данные аккаунта появятся здесь после выполнения заявки</div>
            )}

            {/* Telegram */}
            <a href={TELEGRAM_LINK} target="_blank" rel="noopener" style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, padding:"11px 16px", borderRadius:12, background:"rgba(0,136,204,0.1)", border:"1px solid rgba(0,136,204,0.3)", color:"#29b6f6", fontWeight:600, fontSize:14, textDecoration:"none" }}>
              ✈️ Написать оператору в Telegram
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ADMIN ────────────────────────────────────────────────────
function Admin({ orders, onStatus, onNote, onBack, t }) {
  const [pw,setPw]=useState(""); const [auth,setAuth]=useState(false);
  const [fil,setFil]=useState("all"); const [q,setQ]=useState(""); const [exp,setExp]=useState(null);
  const exportCSV=()=>{ const h=["ID","Сервис","Тариф","$","₽","Метод","Статус","Дата"]; const rows=orders.map(o=>[o.id,o.service,o.tier,o.priceUsd,o.priceRub,o.method,SL[o.status],new Date(o.createdAt).toLocaleString("ru-RU")]); const csv=[h,...rows].map(r=>r.join(";")).join("\n"); const a=document.createElement("a");a.href=URL.createObjectURL(new Blob(["\uFEFF"+csv],{type:"text/csv;charset=utf-8;"}));a.download=`payflow_${Date.now()}.csv`;a.click(); };
  const exportJSON=()=>{ const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify(orders,null,2)],{type:"application/json"}));a.download=`payflow_${Date.now()}.json`;a.click(); };
  const stats={ total:orders.length, done:orders.filter(o=>o.status==="done").length, earned:orders.filter(o=>o.status==="done").reduce((s,o)=>s+o.priceRub,0), pending:orders.filter(o=>o.status==="new"||o.status==="paid").length };
  const filtered=orders.filter(o=>(fil==="all"||o.status===fil)&&(o.id.includes(q)||o.service.toLowerCase().includes(q.toLowerCase())));
  const inp={background:t.inp,border:`1px solid ${t.border}`,borderRadius:10,padding:"10px 14px",color:t.text,fontSize:14,outline:"none",boxSizing:"border-box"};
  if(!auth) return (
    <div style={{ minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:t.bg }}>
      <div style={{ background:t.card2,border:`1px solid ${t.border}`,borderRadius:22,padding:36,width:360,boxShadow:t.shadow }}>
        <div style={{ textAlign:"center",marginBottom:24 }}><div style={{ fontSize:44,marginBottom:10 }}>🔐</div><div style={{ fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:24,color:t.text }}>Панель управления</div><div style={{ color:t.sub,fontSize:13,marginTop:4 }}>Введите пароль</div></div>
        <input type="password" value={pw} onChange={e=>setPw(e.target.value)} onKeyDown={e=>e.key==="Enter"&&(pw===ADMIN_PASSWORD?setAuth(true):alert("Неверный пароль"))} placeholder="Пароль" style={{ ...inp,width:"100%",marginBottom:12 }}/>
        <button onClick={()=>pw===ADMIN_PASSWORD?setAuth(true):alert("Неверный пароль")} style={{ width:"100%",padding:13,borderRadius:12,background:"linear-gradient(135deg,#f59e0b,#fbbf24)",border:"none",color:"#0a0a14",fontWeight:800,fontSize:15,cursor:"pointer" }}>Войти</button>
        <button onClick={onBack} style={{ width:"100%",padding:10,borderRadius:10,background:"transparent",border:"none",color:t.sub,cursor:"pointer",fontSize:13,marginTop:8 }}>← Назад</button>
      </div>
    </div>
  );
  return (
    <div style={{ background:t.bg,minHeight:"100vh",padding:"24px 20px" }}>
      <div style={{ maxWidth:980,margin:"0 auto" }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:28,flexWrap:"wrap",gap:12 }}>
          <div><div style={{ fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:28,color:t.text }}>📋 Заявки</div><div style={{ color:t.sub,fontSize:13,marginTop:2 }}>{mosDate()} · Москва</div></div>
          <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
            <button onClick={exportCSV} style={{ padding:"9px 18px",borderRadius:10,background:t.goldDim,border:`1px solid ${t.goldB}`,color:t.gold,cursor:"pointer",fontSize:13,fontWeight:600 }}>↓ CSV</button>
            <button onClick={exportJSON} style={{ padding:"9px 18px",borderRadius:10,background:t.card,border:`1px solid ${t.border}`,color:t.sub,cursor:"pointer",fontSize:13,fontWeight:600 }}>↓ JSON</button>
            <button onClick={onBack} style={{ padding:"9px 18px",borderRadius:10,background:t.card,border:`1px solid ${t.border}`,color:t.sub,cursor:"pointer",fontSize:13 }}>← На сайт</button>
          </div>
        </div>
        <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:12,marginBottom:24 }}>
          {[{l:"Всего",v:stats.total,c:t.gold,i:"📋"},{l:"Выполнено",v:stats.done,c:"#34d399",i:"✅"},{l:"Заработано",v:stats.earned.toLocaleString("ru-RU")+" ₽",c:"#60a5fa",i:"💰"},{l:"Ожидают",v:stats.pending,c:"#f87171",i:"⏳"}].map(s=>(
            <div key={s.l} style={{ background:t.card2,border:`1px solid ${t.border}`,borderRadius:16,padding:"18px 20px",boxShadow:t.shadow }}>
              <div style={{ fontSize:22,marginBottom:6 }}>{s.i}</div>
              <div style={{ color:t.sub,fontSize:12,marginBottom:4 }}>{s.l}</div>
              <div style={{ color:s.c,fontWeight:800,fontSize:24,fontFamily:"'Syne',sans-serif" }}>{s.v}</div>
            </div>
          ))}
        </div>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="🔍 Поиск по ID или сервису" style={{ ...inp,width:"100%",marginBottom:12 }}/>
        <div style={{ display:"flex",gap:7,flexWrap:"wrap",marginBottom:20 }}>
          {[["all","Все"],...Object.entries(SL)].map(([k,l])=>{ const cnt=k==="all"?orders.length:orders.filter(o=>o.status===k).length; return <button key={k} onClick={()=>setFil(k)} style={{ padding:"7px 14px",borderRadius:100,fontSize:12,fontWeight:600,cursor:"pointer",background:fil===k?(SC[k]||t.gold)+"22":t.card,border:`1px solid ${fil===k?(SC[k]||t.gold)+"55":t.border}`,color:fil===k?(SC[k]||t.gold):t.sub }}>{l} ({cnt})</button>; })}
        </div>
        {filtered.length===0
          ? <div style={{ textAlign:"center",padding:"80px 0",color:t.muted }}><div style={{ fontSize:48,marginBottom:12 }}>📭</div>{orders.length===0?"Заявок пока нет":"Ничего не найдено"}</div>
          : <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
            {[...filtered].reverse().map(o=>(
              <div key={o.id} style={{ background:t.card2,border:`1px solid ${t.border}`,borderRadius:16,boxShadow:t.shadow }}>
                <div style={{ padding:18 }}>
                  <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:10 }}>
                    <div>
                      <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:6 }}>
                        <span style={{ color:t.gold,fontWeight:800,fontSize:16 }}>{o.id}</span>
                        <span style={{ background:SC[o.status]+"22",border:`1px solid ${SC[o.status]}55`,color:SC[o.status],fontSize:11,padding:"3px 10px",borderRadius:100,fontWeight:600 }}>{SL[o.status]}</span>
                      </div>
                      <div style={{ color:t.text,fontWeight:600,fontSize:14,marginBottom:3 }}>{o.service} · {o.tier}</div>
                      <div style={{ color:t.sub,fontSize:12,marginBottom:3 }}>{o.method==="login"&&`🔐 ${o.login}`}{o.method==="gift"&&`🎁 Gift → ${o.email}`}{o.method==="family"&&`👨‍👩‍👧 Family → ${o.email}`}{o.method==="newAcc"&&"✨ Новый аккаунт"}</div>
                      <div style={{ color:t.muted,fontSize:11 }}>{new Date(o.createdAt).toLocaleString("ru-RU")}</div>
                    </div>
                    <div style={{ textAlign:"right" }}>
                      <div style={{ color:t.gold,fontWeight:800,fontSize:22 }}>{o.priceRub.toLocaleString("ru-RU")} ₽</div>
                      <div style={{ color:t.muted,fontSize:12 }}>${o.priceUsd}</div>
                      <button onClick={()=>setExp(exp===o.id?null:o.id)} style={{ marginTop:8,padding:"5px 14px",borderRadius:100,background:t.inp,border:`1px solid ${t.border}`,color:t.sub,fontSize:11,cursor:"pointer" }}>{exp===o.id?"▲ скрыть":"▼ действия"}</button>
                    </div>
                  </div>
                  {exp===o.id&&(
                    <div style={{ marginTop:14,paddingTop:12,borderTop:`1px solid ${t.border}` }}>
                      <div style={{ color:t.sub,fontSize:11,marginBottom:8 }}>Изменить статус:</div>
                      <div style={{ display:"flex",gap:7,flexWrap:"wrap",marginBottom:16 }}>
                        {Object.entries(SL).map(([k,l])=><button key={k} onClick={()=>onStatus(o.id,k)} style={{ padding:"7px 16px",borderRadius:100,fontSize:12,fontWeight:600,cursor:"pointer",background:o.status===k?SC[k]+"22":t.inp,border:`1px solid ${o.status===k?SC[k]+"66":t.border}`,color:o.status===k?SC[k]:t.sub,transition:"all .15s" }}>{o.status===k?"✓ ":""}{l}</button>)}
                      </div>
                      {/* Сообщение клиенту — данные аккаунта, инфо */}
                      <div>
                        <div style={{ color:t.sub,fontSize:11,marginBottom:6,fontWeight:600 }}>📩 Сообщение клиенту (данные аккаунта, Gift-код и т.д.):</div>
                        <textarea
                          defaultValue={o.operatorNote||""}
                          onBlur={e=>onNote(o.id, e.target.value)}
                          placeholder="Напр: логин: test@mail.com / пароль: Abc12345"
                          rows={3}
                          style={{ width:"100%",background:t.inp,border:`1px solid ${t.border}`,borderRadius:10,padding:"10px 12px",color:t.text,fontSize:13,outline:"none",resize:"vertical",fontFamily:"monospace",lineHeight:1.5 }}
                        />
                        <div style={{ color:t.muted,fontSize:11,marginTop:4 }}>Клиент увидит это сообщение на странице статуса заявки</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        }
      </div>
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────
export default function App() {
  const { t, toggle } = useTheme();
  const [page, setPage] = useState("home"); // home | catalog | admin | status
  const [cat, setCat] = useState("Все");
  const [search, setSearch] = useState("");
  const [sel, setSel] = useState(null);
  const [usd, setUsd] = useState(20);
  const [scrolled, setScrolled] = useState(false);
  const [rate, setRate] = useState(null);
  const [rateLoading, setRateLoading] = useState(true);
  const [rateDate, setRateDate] = useState("");
  const [orders, setOrders] = useState([]);
  const [in_, setIn] = useState(false);
  const howRef = useRef(null);

  useEffect(()=>{ setTimeout(()=>setIn(true),80); },[]);

  useEffect(()=>{
    async function fetch_() {
      setRateLoading(true);
      try { const r=await fetch("/api/rate"); const d=await r.json(); if(d?.rate){setRate(parseFloat(d.rate));setRateDate(mosDate());} else throw 0; }
      catch { setRate(84.5); setRateDate(mosDate()); }
      finally { setRateLoading(false); }
    }
    fetch_();
    const iv=setInterval(fetch_,30*60*1000);
    return ()=>clearInterval(iv);
  },[]);

  useEffect(()=>{ (async()=>{ try{const r=await window.storage.get("orders");if(r?.value)setOrders(JSON.parse(r.value));}catch{} })(); },[]);
  useEffect(()=>{ const fn=()=>setScrolled(window.scrollY>40); window.addEventListener("scroll",fn); return()=>window.removeEventListener("scroll",fn); },[]);

  const saveOrder=async(order)=>{ const u=[...orders,order]; setOrders(u); try{await window.storage.set("orders",JSON.stringify(u));}catch{} };
  const updateStatus=async(id,status)=>{ const u=orders.map(o=>o.id===id?{...o,status}:o); setOrders(u); try{await window.storage.set("orders",JSON.stringify(u));}catch{} };
  const updateNote=async(id,note)=>{ const u=orders.map(o=>o.id===id?{...o,operatorNote:note}:o); setOrders(u); try{await window.storage.set("orders",JSON.stringify(u));}catch{} };

  const filtered=SVC.filter(s=>(cat==="Все"||s.cat===cat)&&s.name.toLowerCase().includes(search.toLowerCase()));
  const base=rate?Math.round(usd*rate):0;
  const comm=rate?Math.round(usd*rate*MARGIN):0;
  const total=base+comm;
  const POPULAR=SVC.filter(s=>POPULAR_NAMES.includes(s.name));

  if(page==="admin") return <Admin orders={orders} onStatus={updateStatus} onNote={updateNote} onBack={()=>setPage("home")} t={t}/>;
  if(page==="status") return <OrderStatus orders={orders} t={t} onBack={()=>setPage("home")}/>;

  const navBtn=(p,l)=><button onClick={()=>setPage(p)} style={{ padding:"7px 18px",borderRadius:100,fontSize:13,fontWeight:600,cursor:"pointer",background:page===p?t.goldDim:"transparent",border:`1px solid ${page===p?t.goldB:"transparent"}`,color:page===p?t.gold:t.sub,transition:"all .2s" }}>{l}</button>;

  return (
    <div style={{ background:t.bg,minHeight:"100vh",fontFamily:"'DM Sans',sans-serif",color:t.text,transition:"background .3s,color .3s" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@400;500;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:rgba(251,191,36,0.4);border-radius:3px}
        input::placeholder{opacity:.4}
        @keyframes pulse{0%,100%{opacity:.4}50%{opacity:1}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes float{0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-24px) rotate(3deg)}}
        @keyframes floatB{0%,100%{transform:translateY(0)}50%{transform:translateY(-16px)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:none}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        .a1{animation:fadeUp .7s ease forwards}
        .a2{animation:fadeUp .7s .1s ease forwards;opacity:0}
        .a3{animation:fadeUp .7s .2s ease forwards;opacity:0}
        .a4{animation:fadeUp .7s .3s ease forwards;opacity:0}
        .a5{animation:fadeUp .7s .4s ease forwards;opacity:0}
        .cg:hover .ci{opacity:.55;transform:none}
        .ci{transition:all .25s!important}
        .cg .ci:hover{opacity:1!important;transform:translateY(-4px)!important}
      `}</style>

      {/* NAV */}
      <nav style={{ position:"fixed",top:0,left:0,right:0,zIndex:100,padding:"0 28px",height:60,display:"flex",alignItems:"center",justifyContent:"space-between",background:scrolled?t.nav:"transparent",backdropFilter:scrolled?"blur(20px)":"none",borderBottom:scrolled?`1px solid ${t.border}`:"none",transition:"all .3s" }}>
        <div onClick={()=>{setPage("home");window.scrollTo({top:0,behavior:"smooth"})}} style={{ fontFamily:"'Syne',sans-serif",fontWeight:900,fontSize:20,cursor:"pointer",letterSpacing:-.5,color:t.text }}>pay<span style={{ color:t.gold }}>flow</span></div>
        <div style={{ display:"flex",gap:6,alignItems:"center" }}>
          {navBtn("home","Главная")}{navBtn("catalog","Каталог")}{navBtn("status","Мои заявки")}
          <button onClick={toggle} style={{ width:38,height:38,borderRadius:100,background:t.card,border:`1px solid ${t.border}`,cursor:"pointer",fontSize:17,display:"flex",alignItems:"center",justifyContent:"center" }}>{t.dark?"☀️":"🌙"}</button>
          <button onClick={()=>setPage("admin")} style={{ width:38,height:38,borderRadius:100,background:t.card,border:`1px solid ${t.border}`,cursor:"pointer",fontSize:15,display:"flex",alignItems:"center",justifyContent:"center",color:t.muted }}>⚙️</button>
        </div>
      </nav>

      {/* ══ HOME ══ */}
      {page==="home"&&(
        <div>
          {/* HERO */}
          <div style={{ position:"relative",minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center",padding:"90px 24px 70px",overflow:"hidden" }}>
            {/* BG */}
            <div style={{ position:"absolute",inset:0,pointerEvents:"none",overflow:"hidden" }}>
              <div style={{ position:"absolute",top:"8%",left:"12%",width:500,height:500,borderRadius:"50%",background:t.dark?"radial-gradient(circle,rgba(251,191,36,0.07) 0%,transparent 70%)":"radial-gradient(circle,rgba(217,119,6,0.05) 0%,transparent 70%)",animation:"floatB 9s ease-in-out infinite" }}/>
              <div style={{ position:"absolute",top:"35%",right:"8%",width:350,height:350,borderRadius:"50%",background:t.dark?"radial-gradient(circle,rgba(96,165,250,0.05) 0%,transparent 70%)":"radial-gradient(circle,rgba(59,130,246,0.04) 0%,transparent 70%)",animation:"floatB 11s ease-in-out infinite",animationDelay:"-4s" }}/>
              <div style={{ position:"absolute",bottom:"10%",left:"20%",width:280,height:280,borderRadius:"50%",background:t.dark?"radial-gradient(circle,rgba(167,139,250,0.05) 0%,transparent 70%)":"radial-gradient(circle,rgba(139,92,246,0.03) 0%,transparent 70%)",animation:"floatB 13s ease-in-out infinite",animationDelay:"-7s" }}/>
              <div style={{ position:"absolute",inset:0,backgroundImage:t.dark?"linear-gradient(rgba(255,255,255,0.015) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.015) 1px,transparent 1px)":"linear-gradient(rgba(0,0,0,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,0.025) 1px,transparent 1px)",backgroundSize:"64px 64px" }}/>
              {[{s:"🤖",x:"7%",y:"18%",d:"0s"},{s:"🎨",x:"87%",y:"14%",d:"1.2s"},{s:"🎬",x:"4%",y:"62%",d:"2.1s"},{s:"🎵",x:"91%",y:"58%",d:.7+"s"},{s:"💻",x:"13%",y:"84%",d:"1.8s"},{s:"🔒",x:"82%",y:"78%",d:"3.2s"},{s:"🦉",x:"50%",y:"8%",d:"0.5s"},{s:"📝",x:"50%",y:"90%",d:"2.5s"}].map((f,i)=>(
                <div key={i} style={{ position:"absolute",left:f.x,top:f.y,fontSize:30,animation:`float 7s ease-in-out infinite`,animationDelay:f.d,opacity:t.dark?.12:.09 }}>{f.s}</div>
              ))}
            </div>

            {/* Content */}
            {in_&&<div className="a1" style={{ display:"inline-flex",alignItems:"center",gap:8,background:t.card,border:`1px solid ${t.border}`,backdropFilter:"blur(12px)",borderRadius:100,padding:"8px 18px",marginBottom:28,fontSize:12,boxShadow:t.shadow }}>
              {rateLoading?<span style={{ width:12,height:12,border:`2px solid ${t.border}`,borderTopColor:t.gold,borderRadius:"50%",display:"inline-block",animation:"spin .8s linear infinite" }}/>:<span style={{ width:7,height:7,borderRadius:"50%",background:"#22c55e",display:"inline-block",animation:"pulse 2s infinite" }}/>}
              <span style={{ color:t.sub }}>Курс ЦБ на {rateDate||mosDate()}:</span>
              <span style={{ color:t.gold,fontWeight:700 }}>{rateLoading?"загрузка...":`1$ = ${rate?.toFixed(2)} ₽`}</span>
            </div>}

            {in_&&<h1 className="a2" style={{ fontFamily:"'Syne',sans-serif",fontWeight:900,fontSize:"clamp(38px,6.5vw,74px)",lineHeight:1.03,letterSpacing:-3,marginBottom:22,color:t.text }}>
              Оплати любой<br/><span style={{ color:t.gold,position:"relative" }}>зарубежный сервис
                <span style={{ position:"absolute",bottom:-4,left:0,right:0,height:3,background:`linear-gradient(90deg,${t.gold},transparent)`,borderRadius:2,opacity:.6 }}/>
              </span><br/>за рубли
            </h1>}
            {in_&&<p className="a3" style={{ color:t.sub,fontSize:17,maxWidth:500,marginBottom:10,lineHeight:1.6 }}>ChatGPT, Midjourney, Netflix, Spotify и ещё 47 сервисов.</p>}
            {in_&&<p className="a3" style={{ color:t.dark?"rgba(251,191,36,0.75)":"rgba(180,83,9,0.85)",fontSize:14,maxWidth:420,marginBottom:40,lineHeight:1.5,fontWeight:500 }}>Комиссия 10% — без скрытых платежей и процентов.</p>}

            {in_&&<div className="a4" style={{ display:"flex",gap:12,flexWrap:"wrap",justifyContent:"center",marginBottom:60 }}>
              <button onClick={()=>setPage("catalog")}
                style={{ padding:"16px 36px",borderRadius:14,background:"linear-gradient(135deg,#f59e0b,#fbbf24)",border:"none",color:"#0a0a14",fontWeight:800,fontSize:16,cursor:"pointer",boxShadow:"0 6px 28px rgba(251,191,36,0.35)" }}
                onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 12px 40px rgba(251,191,36,0.45)"}}
                onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="0 6px 28px rgba(251,191,36,0.35)"}}>
                Смотреть сервисы →
              </button>
              <button onClick={()=>howRef.current?.scrollIntoView({behavior:"smooth"})}
                style={{ padding:"16px 36px",borderRadius:14,background:t.card,border:`1px solid ${t.border}`,color:t.sub,fontWeight:600,fontSize:16,cursor:"pointer",backdropFilter:"blur(10px)" }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=t.borderH;e.currentTarget.style.color=t.text}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor=t.border;e.currentTarget.style.color=t.sub}}>
                Как это работает?
              </button>
            </div>}

            {in_&&<div className="a5" style={{ display:"flex",gap:10,flexWrap:"wrap",justifyContent:"center" }}>
              {[["50+","сервисов","🌍"],["10%","комиссия","💸"],["без скрытых","доплат","✅"],["~1 час","среднее время","⚡"]].map(([v,l,ic])=>(
                <div key={l} style={{ textAlign:"center",background:t.card,border:`1px solid ${t.border}`,borderRadius:18,padding:"16px 22px",backdropFilter:"blur(10px)" }}>
                  <div style={{ fontSize:22,marginBottom:6 }}>{ic}</div>
                  <div style={{ fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:800,color:t.gold }}>{v}</div>
                  <div style={{ color:t.muted,fontSize:13,marginTop:2 }}>{l}</div>
                </div>
              ))}
            </div>}
          </div>

          {/* POPULAR */}
          <div style={{ padding:"0 24px 80px",maxWidth:1100,margin:"0 auto" }}>
            <div style={{ textAlign:"center",marginBottom:36 }}>
              <div style={{ color:t.gold,fontSize:11,textTransform:"uppercase",letterSpacing:3,marginBottom:10,fontWeight:600 }}>Популярное</div>
              <h2 style={{ fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:32,color:t.text,marginBottom:8 }}>Часто заказывают</h2>
              <p style={{ color:t.sub,fontSize:15 }}>Нажмите на любой сервис чтобы оформить заявку</p>
            </div>
            <div className="cg" style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(290px,1fr))",gap:14 }}>
              {POPULAR.map(s=><div key={s.id} className="ci"><SCard s={s} rate={rate} onSelect={setSel} t={t}/></div>)}
            </div>
            <div style={{ textAlign:"center",marginTop:28 }}>
              <button onClick={()=>setPage("catalog")} style={{ padding:"12px 28px",borderRadius:100,background:t.goldDim,border:`1px solid ${t.goldB}`,color:t.gold,cursor:"pointer",fontSize:14,fontWeight:600 }}>
                Смотреть все {SVC.length} сервисов →
              </button>
            </div>
          </div>

          {/* CALC */}
          <div style={{ padding:"70px 24px",background:t.dark?"rgba(251,191,36,0.02)":"rgba(0,0,0,0.02)",borderTop:`1px solid ${t.border}`,borderBottom:`1px solid ${t.border}` }}>
            <div style={{ maxWidth:580,margin:"0 auto" }}>
              <div style={{ textAlign:"center",marginBottom:32 }}>
                <div style={{ color:t.gold,fontSize:11,textTransform:"uppercase",letterSpacing:3,marginBottom:10,fontWeight:600 }}>Калькулятор</div>
                <h2 style={{ fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:32,color:t.text }}>Сколько это стоит?</h2>
              </div>
              <div style={{ background:t.card2,border:`1px solid ${t.border}`,borderRadius:22,padding:28,boxShadow:t.shadow }}>
                <label style={{ color:t.sub,fontSize:13,marginBottom:10,display:"block",fontWeight:500 }}>Сумма в долларах</label>
                <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:8 }}>
                  <div style={{ background:t.goldDim,border:`1px solid ${t.goldB}`,borderRadius:12,padding:"13px 18px",color:t.gold,fontWeight:900,fontSize:20,minWidth:52,textAlign:"center" }}>$</div>
                  <input type="number" value={usd} min={1} max={5000} onChange={e=>setUsd(Math.max(1,Number(e.target.value)))}
                    style={{ flex:1,background:t.inp,border:`1px solid ${t.border}`,borderRadius:12,padding:"13px 18px",color:t.text,fontSize:28,fontWeight:800,outline:"none" }}/>
                </div>
                <input type="range" min={1} max={2000} value={Math.min(usd,2000)} onChange={e=>setUsd(Number(e.target.value))}
                  style={{ width:"100%",marginBottom:22,accentColor:t.gold }}/>
                <div style={{ background:t.goldDim,border:`1px solid ${t.goldB}`,borderRadius:16,padding:"20px 24px" }}>
                  {rateLoading?<div style={{ textAlign:"center",color:t.sub,padding:"12px 0" }}>⏳ Загружаем курс ЦБ...</div>:<>
                    <div style={{ display:"flex",justifyContent:"space-between",marginBottom:10 }}><span style={{ color:t.sub,fontSize:14 }}>Курс ЦБ на {rateDate}</span><span style={{ color:t.sub,fontSize:14,fontWeight:600 }}>1$ = {rate?.toFixed(2)} ₽</span></div>
                    <div style={{ display:"flex",justifyContent:"space-between",marginBottom:14 }}><span style={{ color:t.sub,fontSize:14 }}>Наша комиссия 10%</span><span style={{ color:t.sub,fontSize:14,fontWeight:600 }}>+ {comm.toLocaleString("ru-RU")} ₽</span></div>
                    <div style={{ display:"flex",justifyContent:"space-between",borderTop:`2px solid ${t.goldB}`,paddingTop:14 }}><span style={{ color:t.text,fontWeight:700,fontSize:16 }}>Итого к оплате</span><span style={{ color:t.gold,fontWeight:900,fontSize:34,fontFamily:"'Syne',sans-serif" }}>{total.toLocaleString("ru-RU")} ₽</span></div>
                  </>}
                </div>
              </div>
            </div>
          </div>

          {/* HOW */}
          <div ref={howRef} style={{ padding:"80px 24px 100px",maxWidth:940,margin:"0 auto" }}>
            <div style={{ textAlign:"center",marginBottom:50 }}>
              <div style={{ color:t.gold,fontSize:11,textTransform:"uppercase",letterSpacing:3,marginBottom:10,fontWeight:600 }}>Процесс</div>
              <h2 style={{ fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:34,color:t.text }}>Как это работает</h2>
            </div>
            <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:16 }}>
              {[
                {n:"01",icon:"🔍",title:"Выбираешь сервис",    desc:"Находишь нужный сервис в каталоге. Цена в рублях видна сразу."},
                {n:"02",icon:"📝",title:"Оформляешь заявку",   desc:"Выбираешь способ: логин/пароль, Gift, Family/Team или новый аккаунт."},
                {n:"03",icon:"💳",title:"Переводишь рубли",    desc:"По СБП или карте. Указываешь номер заявки и загружаешь чек."},
                {n:"04",icon:"🚀",title:"Получаешь доступ",    desc:"Активируем до 1 часа в рабочее время. В редких случаях до 24 ч."},
              ].map(s=>(
                <div key={s.n} style={{ background:t.card2,border:`1px solid ${t.border}`,borderRadius:18,padding:"26px 22px",position:"relative",overflow:"hidden",boxShadow:t.shadow }}>
                  <div style={{ position:"absolute",top:14,right:16,fontFamily:"'Syne',sans-serif",color:t.dark?"rgba(251,191,36,0.1)":"rgba(217,119,6,0.1)",fontSize:48,fontWeight:900,lineHeight:1 }}>{s.n}</div>
                  <div style={{ fontSize:34,marginBottom:14 }}>{s.icon}</div>
                  <div style={{ fontWeight:700,fontSize:15,marginBottom:8,color:t.text }}>{s.title}</div>
                  <div style={{ color:t.sub,fontSize:14,lineHeight:1.6 }}>{s.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══ CATALOG ══ */}
      {page==="catalog"&&(
        <div style={{ maxWidth:1160,margin:"0 auto",padding:"78px 20px 60px" }}>
          <div style={{ marginBottom:30 }}>
            <div style={{ color:t.gold,fontSize:11,textTransform:"uppercase",letterSpacing:3,marginBottom:8,fontWeight:600 }}>Каталог</div>
            <h2 style={{ fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:32,marginBottom:6,color:t.text }}>Все сервисы</h2>
            <div style={{ color:t.sub,fontSize:14 }}>{SVC.length} сервисов · Курс ЦБ: {rateLoading?"загрузка...":`1$ = ${rate?.toFixed(2)} ₽`} · <span style={{ color:t.muted }}>цены с комиссией 10%</span></div>
          </div>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍  Поиск по названию..."
            style={{ width:"100%",background:t.card2,border:`1px solid ${t.border}`,borderRadius:14,padding:"14px 18px",color:t.text,fontSize:15,outline:"none",marginBottom:16,boxShadow:t.shadow }}/>
          <div style={{ display:"flex",gap:8,flexWrap:"wrap",marginBottom:26 }}>
            {CATS.map(c=>{ const cnt=SVC.filter(s=>c==="Все"||s.cat===c).length; return <button key={c} onClick={()=>setCat(c)} style={{ padding:"8px 16px",borderRadius:100,fontSize:13,fontWeight:600,cursor:"pointer",background:cat===c?t.goldDim:t.card,border:`1px solid ${cat===c?t.goldB:t.border}`,color:cat===c?t.gold:t.sub,transition:"all .15s" }}>{c} <span style={{ opacity:.55 }}>({cnt})</span></button>; })}
          </div>
          <div className="cg" style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:14 }}>
            {filtered.map(s=><div key={s.id} className="ci"><SCard s={s} rate={rate} onSelect={setSel} t={t}/></div>)}
          </div>
          {filtered.length===0&&<div style={{ textAlign:"center",padding:"80px 0",color:t.muted }}><div style={{ fontSize:48,marginBottom:12 }}>🔍</div>Ничего не найдено</div>}
        </div>
      )}

      {sel&&<OrderModal s={sel} rate={rate} onClose={()=>setSel(null)} onSave={saveOrder} t={t} onGoStatus={()=>{setSel(null);setPage("status");}}/>}

      <div style={{ borderTop:`1px solid ${t.border}`,padding:"24px 32px",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8 }}>
        <div style={{ fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:15,color:t.text }}>pay<span style={{ color:t.gold }}>flow</span></div>
        <div style={{ color:t.muted,fontSize:12 }}>Оплата зарубежных сервисов · 2026</div>
      </div>
    </div>
  );
}