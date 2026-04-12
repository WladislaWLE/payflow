// src/components/shared.jsx — общие UI-компоненты
import { useState, useEffect } from "react";
import { SL, SC, SE } from "../lib/appConstants";

// ── IconDownload ─────────────────────────────────────────────
export const IconDownload = ({ size=16, color="currentColor" }) =>
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>;

// ── Skeleton loader ──────────────────────────────────────────
export function Skeleton({ width="100%", height=16, radius=8, style={} }) {
  return <div style={{
    width, height, borderRadius: radius,
    background: "linear-gradient(90deg,rgba(255,255,255,0.05) 25%,rgba(255,255,255,0.1) 50%,rgba(255,255,255,0.05) 75%)",
    backgroundSize: "200% 100%",
    animation: "shimmer 1.5s infinite",
    ...style,
  }}/>;
}

export function OrderSkeleton({ t }) {
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

// ── StatusBadge ──────────────────────────────────────────────
export function StatusBadge({ status, size=12 }) {
  return (
    <span style={{
      background: SC[status]+"22",
      border: `1px solid ${SC[status]}55`,
      color: SC[status],
      fontSize: size,
      padding: "4px 12px",
      borderRadius: 100,
      fontWeight: 700,
      whiteSpace: "nowrap",
    }}>
      {SE[status]} {SL[status]}
    </span>
  );
}

// ── FieldLabel ───────────────────────────────────────────────
export function FieldLabel({ children, t }) {
  return (
    <div style={{
      color: t.muted,
      fontSize: 11,
      marginBottom: 8,
      textTransform: "uppercase",
      letterSpacing: 1,
      fontWeight: 600,
    }}>
      {children}
    </div>
  );
}

// ── Alert ────────────────────────────────────────────────────
export function Alert({ type="info", children, t }) {
  const cfg = {
    error:   ["rgba(248,113,113,0.1)", "rgba(248,113,113,0.3)", "#f87171"],
    success: ["rgba(52,211,153,0.1)",  "rgba(52,211,153,0.3)",  "#6ee7b7"],
    info:    ["rgba(96,165,250,0.1)",  "rgba(96,165,250,0.3)",  "#93c5fd"],
  }[type];
  return (
    <div style={{
      background: cfg[0], border: `1px solid ${cfg[1]}`, color: cfg[2],
      borderRadius: 10, padding: "10px 14px", fontSize: 13, marginBottom: 12, lineHeight: 1.6,
    }}>
      {children}
    </div>
  );
}

// ── Badge ────────────────────────────────────────────────────
export function Badge({ active, color, children }) {
  const p = {
    blue:   ["rgba(96,165,250,0.15)",  "rgba(96,165,250,0.4)",  "#93c5fd"],
    green:  ["rgba(52,211,153,0.15)",  "rgba(52,211,153,0.4)",  "#6ee7b7"],
    purple: ["rgba(167,139,250,0.15)", "rgba(167,139,250,0.4)", "#c4b5fd"],
    yellow: ["rgba(251,191,36,0.15)",  "rgba(251,191,36,0.4)",  "#fde68a"],
  }[color];
  return (
    <span style={{
      fontSize: 10, padding: "2px 8px", borderRadius: 100, fontWeight: 600, whiteSpace: "nowrap",
      background: active ? p[0] : "rgba(128,128,128,0.08)",
      border: `1px solid ${active ? p[1] : "rgba(128,128,128,0.15)"}`,
      color: active ? p[2] : "rgba(128,128,128,0.35)",
    }}>
      {children}
    </span>
  );
}

// ── ActivationTimer ──────────────────────────────────────────
export function ActivationTimer({ createdAt, status }) {
  const GUARANTEE_MIN = 60;
  const [remaining, setRemaining] = useState(null);

  useEffect(() => {
    if (!["paid","processing"].includes(status)) return;
    const created  = new Date(createdAt).getTime();
    const deadline = created + GUARANTEE_MIN * 60 * 1000;
    const tick = () => {
      const diff = deadline - Date.now();
      setRemaining(diff > 0 ? diff : 0);
    };
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, [createdAt, status]);

  if (!["paid","processing"].includes(status) || remaining === null) return null;

  const mins    = Math.floor(remaining / 60000);
  const secs    = Math.floor((remaining % 60000) / 1000);
  const elapsed = remaining === 0;
  const pct     = Math.max(0, Math.min(100, (remaining / (GUARANTEE_MIN * 60000)) * 100));

  return (
    <div style={{ background:elapsed?"rgba(52,211,153,0.08)":"rgba(251,191,36,0.07)", border:`1px solid ${elapsed?"rgba(52,211,153,0.3)":"rgba(251,191,36,0.25)"}`, borderRadius:12, padding:"12px 14px", marginBottom:12 }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
        <div style={{ display:"flex", alignItems:"center", gap:7 }}>
          <span style={{ fontSize:14 }}>{elapsed?"🎯":"⏱"}</span>
          <span style={{ fontSize:12, fontWeight:700, color:elapsed?"#34d399":"#fbbf24" }}>
            {elapsed?"Активация задерживается — обрабатываем":"Гарантия активации"}
          </span>
        </div>
        {!elapsed && (
          <div style={{ fontFamily:"'Clash Display',sans-serif", fontWeight:900, fontSize:18, color:"#fbbf24", fontVariantNumeric:"tabular-nums", letterSpacing:-0.5 }}>
            {String(mins).padStart(2,"0")}:{String(secs).padStart(2,"0")}
          </div>
        )}
      </div>
      {!elapsed && (
        <div style={{ height:4, borderRadius:2, background:"rgba(251,191,36,0.15)", overflow:"hidden" }}>
          <div style={{ height:"100%", width:`${100-pct}%`, background:"linear-gradient(90deg,#f59e0b,#fbbf24)", borderRadius:2, transition:"width 1s linear" }}/>
        </div>
      )}
      {!elapsed && <div style={{ color:"rgba(251,191,36,0.6)", fontSize:11, marginTop:6 }}>Обязуемся активировать в течение 60 минут или вернём деньги</div>}
    </div>
  );
}

// ── OrderProgress ────────────────────────────────────────────
export function OrderProgress({ status }) {
  const steps = [
    { key:"new",        label:"Оплата",      icon:"💳" },
    { key:"processing", label:"Обработка",   icon:"⚙️" },
    { key:"done",       label:"Активирован", icon:"✅" },
  ];
  const order     = ["new","paid","processing","done","cancelled"];
  const cur       = order.indexOf(status);
  const cancelled = status === "cancelled";

  return (
    <div style={{ display:"flex", alignItems:"center", gap:0, marginBottom:12 }}>
      {steps.map((s, i) => {
        const stepIdx = order.indexOf(s.key);
        const done_   = !cancelled && cur >= stepIdx;
        const active  = !cancelled && (
          (s.key==="new"        && ["new","paid"].includes(status)) ||
          (s.key==="processing" && status==="processing") ||
          (s.key==="done"       && status==="done")
        );
        return (
          <div key={s.key} style={{ display:"flex", alignItems:"center", flex:i<steps.length-1?1:undefined }}>
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
              <div style={{ width:30, height:30, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, background:done_?(active?"linear-gradient(135deg,#f59e0b,#fbbf24)":"rgba(251,191,36,0.2)"):"rgba(255,255,255,0.06)", border:`1.5px solid ${done_?(active?"#fbbf24":"rgba(251,191,36,0.4)"):"rgba(255,255,255,0.12)"}`, transition:"all .3s", flexShrink:0 }}>
                {done_?(active?<span style={{ fontSize:11 }}>{s.icon}</span>:<span style={{ color:"#fbbf24",fontSize:11 }}>✓</span>):<span style={{ color:"rgba(255,255,255,0.2)",fontSize:10 }}>{i+1}</span>}
              </div>
              <span style={{ fontSize:10, color:done_?(active?"#fbbf24":"rgba(251,191,36,0.6)"):"rgba(255,255,255,0.25)", fontWeight:active?700:400, whiteSpace:"nowrap" }}>{s.label}</span>
            </div>
            {i < steps.length-1 && (
              <div style={{ flex:1, height:1.5, background:done_&&cur>stepIdx?"linear-gradient(90deg,rgba(251,191,36,0.5),rgba(251,191,36,0.2))":"rgba(255,255,255,0.08)", margin:"0 6px", marginBottom:20, transition:"background .3s" }}/>
            )}
          </div>
        );
      })}
    </div>
  );
}
