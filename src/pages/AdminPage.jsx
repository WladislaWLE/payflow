// src/pages/AdminPage.jsx — Панель администратора
import { useState, useEffect } from "react";
import {
  supabase,
  referrals as sbReferrals,
  reviews as sbReviews,
  storage as sbStorage,
} from "../lib/supabase";
import {
  SL, SC, SE,
  getSetting, setSetting,
  getPromocodes, savePromocode, deletePromocode,
} from "../lib/appConstants";
import { StatusBadge, OrderSkeleton, IconDownload } from "../components/shared";
import { useOrders } from "../hooks/useOrders";

export default function AdminPanel({ userHook, go, t }) {
  const { session, isAdmin } = userHook;
  const { orders, loading, updateOrder } = useOrders(session?.user?.id, true);
  const [filter, setFilter]       = useState("all");
  const [search, setSearch]       = useState("");
  const [expanded, setExpanded]   = useState(null);
  const [noteValues, setNoteValues] = useState({});
  const [receiptModal, setReceiptModal] = useState(null);
  const [saving, setSaving]       = useState(null);
  const [saved, setSaved]         = useState(null);
  const [adminTab, setAdminTab]   = useState("orders");
  const [promos, setPromos]       = useState([]);
  const [serviceReqs, setServiceReqs]       = useState([]);
  const [serviceReqsLoading, setServiceReqsLoading] = useState(false);
  const [adminReviews, setAdminReviews]       = useState([]);
  const [adminReviewsLoading, setAdminReviewsLoading] = useState(false);
  const [manualRate, setManualRate]           = useState("");
  const [manualRateEnabled, setManualRateEnabled] = useState(false);
  const [rateSaving, setRateSaving]           = useState(false);
  const [rateLoaded, setRateLoaded]           = useState(false);
  const [promoLoading, setPromoLoading]       = useState(false);
  const [promoForm, setPromoForm]             = useState({ code:"", type:"percent", value:"", max_uses:-1, description:"", min_amount:0 });
  const [promoFormOpen, setPromoFormOpen]     = useState(false);
  const [promoSaving, setPromoSaving]         = useState(false);

  // Decrypt state per order
  const [decrypted, setDecrypted]   = useState({});
  const [decrypting, setDecrypting] = useState({});

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
    if (isAdmin && adminTab === "reviews") {
      setAdminReviewsLoading(true);
      sbReviews.getAll().then(({ data }) => { setAdminReviews(data || []); setAdminReviewsLoading(false); });
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
      code:        promoForm.code.toUpperCase(),
      type:        promoForm.type,
      value:       parseFloat(promoForm.value),
      discount:    parseFloat(promoForm.value),
      max_uses:    parseInt(promoForm.max_uses) || -1,
      min_amount:  parseInt(promoForm.min_amount) || 0,
      description: promoForm.description,
    });
    if (!error) {
      setPromoForm({ code:"", type:"percent", value:"", max_uses:-1, description:"", min_amount:0 });
      setPromoFormOpen(false);
      const d = await getPromocodes(); setPromos(d);
    } else {
      alert("Ошибка создания промокода: " + error.message);
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
    total:   orders.length,
    new_:    orders.filter(o=>o.status==="new").length,
    done:    orders.filter(o=>o.status==="done").length,
    earned:  orders.filter(o=>o.status==="done").reduce((s,o)=>s+(o.price_rub||0),0),
    pending: orders.filter(o=>["new","paid","processing"].includes(o.status)).length,
  };

  const sendTg = (message) =>
    fetch("/api/tg-notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    }).catch(() => {});

  const handleStatusChange = async (orderId, status) => {
    const notifText = `Заявка ${orderId}: статус изменён на "${SL[status]}"`;
    await updateOrder(orderId, { status }, notifText);
    if (status === "done") {
      const { data } = await sbReferrals.processReferral(orderId);
      if (data?.ok) {
        sendTg(
          `🎁 <b>Реферальный бонус начислен!</b>\n\n` +
          `👤 <b>Пригласил:</b> ${data.referrer_name||"—"} (${data.referrer_email||"—"})\n` +
          `👥 <b>Друг:</b> ${data.referee_name||"—"} (${data.referee_email||"—"})\n\n` +
          `📦 <b>Заказал:</b> ${data.service} · ${data.tier}\n` +
          `💰 <b>Сумма заказа:</b> ${(data.price_rub||0).toLocaleString("ru-RU")} ₽\n` +
          `🏆 <b>Бонус начислен:</b> +${data.bonus} ₽ на счёт пригласившего\n\n` +
          `🔖 Заявка: <code>${data.order_id}</code>`
        );
      }
    }
  };

  const handleNoteSave = async (orderId, note) => {
    setSaving(orderId);
    const notifText = note ? `Заявка ${orderId}: оператор отправил сообщение` : null;
    await updateOrder(orderId, { operator_note: note }, notifText);
    setSaving(null); setSaved(orderId);
    setTimeout(() => setSaved(null), 3000);
  };

  const openReceipt = async (o) => {
    if (!o.receipt_url) return;
    try {
      const url = await sbStorage.getSignedUrl(o.receipt_url);
      setReceiptModal({ url, name: o.receipt_name });
    } catch (e) { alert("Ошибка: " + e.message); }
  };

  const decryptLogin = async (orderId) => {
    setDecrypting(prev => ({ ...prev, [orderId]: true }));
    try {
      const { data: { session: sess } } = await supabase.auth.getSession();
      const r = await fetch("/api/decrypt-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${sess?.access_token || ""}`,
        },
        body: JSON.stringify({ orderId }),
      });
      const result = await r.json();
      if (result.login_data !== undefined) {
        setDecrypted(prev => ({ ...prev, [orderId]: result.login_data }));
      }
    } catch (e) { console.error("decrypt error:", e); }
    setDecrypting(prev => ({ ...prev, [orderId]: false }));
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
            {l:"Всего",      v:stats.total,  c:t.gold,    i:"📋"},
            {l:"Новых",      v:stats.new_,   c:"#fbbf24", i:"🆕"},
            {l:"Выполнено",  v:stats.done,   c:"#34d399", i:"✅"},
            {l:"Заработано", v:stats.earned.toLocaleString("ru-RU")+" ₽", c:"#60a5fa", i:"💰"},
            {l:"В работе",   v:stats.pending,c:"#a78bfa", i:"🔧"},
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
          {[["orders","Заявки","📋"],["promos","Промокоды","🎁"],["requests","Запросы","💡"],["reviews","Отзывы","⭐"],["settings","Настройки","⚙️"]].map(([id,label,icon]) => (
            <button key={id} onClick={()=>setAdminTab(id)} style={{ padding:"9px 20px", borderRadius:100, fontSize:13, fontWeight:600, cursor:"pointer", background:adminTab===id?t.goldDim:t.card, border:`1px solid ${adminTab===id?t.goldB:t.border}`, color:adminTab===id?t.gold:t.sub }}>
              {icon} {label}
              {id==="orders" && <span style={{ marginLeft:6, opacity:.6, fontSize:11 }}>({orders.length})</span>}
              {id==="requests" && serviceReqs.filter(r=>r.status==="pending").length > 0 && <span style={{ marginLeft:6, background:"#f87171", color:"white", borderRadius:"50%", width:16, height:16, fontSize:9, fontWeight:700, display:"inline-flex", alignItems:"center", justifyContent:"center" }}>{serviceReqs.filter(r=>r.status==="pending").length}</span>}
              {id==="reviews" && adminReviews.filter(r=>!r.is_approved).length > 0 && <span style={{ marginLeft:6, background:"#f87171", color:"white", borderRadius:"50%", width:16, height:16, fontSize:9, fontWeight:700, display:"inline-flex", alignItems:"center", justifyContent:"center" }}>{adminReviews.filter(r=>!r.is_approved).length}</span>}
            </button>
          ))}
        </div>

        {/* PROMOCODES */}
        {adminTab === "promos" && (
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
              <div style={{ color:t.sub, fontSize:14 }}>Управление промокодами</div>
              <button onClick={()=>setPromoFormOpen(o=>!o)} style={{ padding:"9px 18px", borderRadius:10, background:t.goldDim, border:`1px solid ${t.goldB}`, color:t.gold, cursor:"pointer", fontSize:13, fontWeight:600 }}>
                {promoFormOpen ? "Закрыть" : "+ Создать промокод"}
              </button>
            </div>
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
            {promoLoading ? <div style={{ color:t.muted, textAlign:"center", padding:"40px" }}>Загрузка...</div> :
            promos.length === 0 ? <div style={{ color:t.muted, textAlign:"center", padding:"60px" }}><div style={{ fontSize:40, marginBottom:12 }}>🎁</div>Промокодов пока нет</div> :
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {promos.map(p => (
                <div key={p.id} style={{ background:t.card2, border:`1px solid ${p.is_active?t.border:"rgba(248,113,113,0.2)"}`, borderRadius:14, padding:16, display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:10 }}>
                  <div>
                    <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:4 }}>
                      <span style={{ color:t.gold, fontWeight:800, fontSize:16, letterSpacing:2 }}>{p.code}</span>
                      <span style={{ background:p.is_active?"rgba(52,211,153,0.15)":"rgba(248,113,113,0.15)", border:`1px solid ${p.is_active?"rgba(52,211,153,0.3)":"rgba(248,113,113,0.3)"}`, color:p.is_active?"#6ee7b7":"#f87171", fontSize:11, padding:"2px 8px", borderRadius:100, fontWeight:600 }}>
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

        {/* SETTINGS */}
        {adminTab === "settings" && (
          <div style={{ maxWidth:520 }}>
            <div style={{ background:t.card2, border:`1px solid ${t.border}`, borderRadius:18, padding:24, marginBottom:16 }}>
              <div style={{ fontFamily:"'Clash Display',sans-serif", fontWeight:700, fontSize:18, color:t.text, marginBottom:6 }}>💱 Курс доллара</div>
              <div style={{ color:t.sub, fontSize:13, marginBottom:20, lineHeight:1.6 }}>
                По умолчанию курс берётся автоматически с ЦБ РФ. Ты можешь задать свой курс — он будет применяться ко всем расчётам на сайте.
              </div>
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
              <div style={{ marginBottom:16 }}>
                <div style={{ color:t.muted, fontSize:12, marginBottom:8 }}>Курс 1$ в рублях</div>
                <div style={{ display:"flex", gap:10 }}>
                  <div style={{ display:"flex", flex:1, alignItems:"center", background:t.inp, border:`1px solid ${manualRateEnabled?t.goldB:t.border}`, borderRadius:12, padding:"0 16px", gap:8 }}>
                    <span style={{ color:t.muted, fontSize:14 }}>1$ =</span>
                    <input type="number" value={manualRate} onChange={e=>setManualRate(e.target.value)} placeholder="84.50" step="0.01" style={{ flex:1, background:"none", border:"none", color:t.text, fontSize:20, fontWeight:700, outline:"none", padding:"12px 0" }}/>
                    <span style={{ color:t.muted, fontSize:14 }}>₽</span>
                  </div>
                  <button onClick={async () => {
                    if (!manualRate || parseFloat(manualRate) <= 0) return;
                    setRateSaving(true);
                    await setSetting("manual_rate", manualRate);
                    if (!manualRateEnabled) { setManualRateEnabled(true); await setSetting("manual_rate_enabled", "true"); }
                    setRateSaving(false);
                    alert("✅ Курс сохранён: 1$ = " + manualRate + " ₽");
                  }} disabled={rateSaving || !manualRate} style={{ padding:"12px 20px", borderRadius:12, background:"linear-gradient(135deg,#f59e0b,#fbbf24)", border:"none", color:"#0a0a14", fontWeight:700, cursor:"pointer", fontSize:14, opacity:rateSaving||!manualRate?0.6:1, whiteSpace:"nowrap" }}>
                    {rateSaving ? "..." : "💾 Сохранить"}
                  </button>
                </div>
              </div>
              <div style={{ padding:"10px 14px", borderRadius:10, background:manualRateEnabled?t.goldDim:"rgba(52,211,153,0.08)", border:`1px solid ${manualRateEnabled?t.goldB:"rgba(52,211,153,0.25)"}`, fontSize:13, color:manualRateEnabled?t.gold:"#6ee7b7" }}>
                {manualRateEnabled ? `⚠️ Сейчас применяется твой курс: 1$ = ${manualRate||"не задан"} ₽` : "✅ Сейчас применяется автоматический курс ЦБ РФ"}
              </div>
            </div>
            <div style={{ background:t.card2, border:`1px solid ${t.border}`, borderRadius:18, padding:24 }}>
              <div style={{ fontFamily:"'Clash Display',sans-serif", fontWeight:700, fontSize:18, color:t.text, marginBottom:6 }}>💸 Комиссия</div>
              <div style={{ color:t.sub, fontSize:13, lineHeight:1.6, marginBottom:12 }}>
                Текущая комиссия задана в коде: <strong style={{ color:t.gold }}>15%</strong>. Чтобы изменить — поправь константу <code style={{ background:t.inp, padding:"2px 6px", borderRadius:4, fontSize:12 }}>MARGIN</code> в файле <code style={{ background:t.inp, padding:"2px 6px", borderRadius:4, fontSize:12 }}>src/lib/appConstants.js</code>.
              </div>
            </div>
          </div>
        )}

        {/* REQUESTS */}
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
                          <select value={req.status} onChange={async (e) => {
                            const newStatus = e.target.value;
                            await supabase.from("service_requests").update({ status: newStatus }).eq("id", req.id);
                            setServiceReqs(prev => prev.map(r => r.id===req.id ? {...r,status:newStatus} : r));
                          }} style={{ padding:"6px 10px", borderRadius:8, background:t.inp, border:`1px solid ${t.border}`, color:t.text, fontSize:12, cursor:"pointer" }}>
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

        {/* REVIEWS */}
        {adminTab === "reviews" && (
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
              <div style={{ color:t.text, fontWeight:700, fontSize:16 }}>Модерация отзывов</div>
              <div style={{ color:t.muted, fontSize:12 }}>{adminReviews.length} всего · {adminReviews.filter(r=>!r.is_approved).length} на проверке</div>
            </div>
            {adminReviewsLoading
              ? <div style={{ textAlign:"center", padding:"40px 0", color:t.muted }}>Загрузка...</div>
              : adminReviews.length === 0
                ? <div style={{ textAlign:"center", padding:"60px 0", color:t.muted }}><div style={{ fontSize:40, marginBottom:12 }}>⭐</div>Отзывов пока нет</div>
                : <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                    {adminReviews.map(r => (
                      <div key={r.id} style={{ background:t.card2, border:`1px solid ${r.is_approved?t.border:"rgba(251,191,36,0.3)"}`, borderRadius:14, padding:"16px 18px" }}>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12, flexWrap:"wrap" }}>
                          <div style={{ flex:1 }}>
                            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                              <div style={{ display:"flex", gap:2 }}>{[1,2,3,4,5].map(s=><span key={s} style={{ color:s<=r.rating?"#fbbf24":"#334155",fontSize:14 }}>★</span>)}</div>
                              <span style={{ color:t.gold, fontWeight:700, fontSize:13 }}>{r.service_name}</span>
                              <span style={{ background:r.is_approved?"rgba(52,211,153,0.15)":"rgba(251,191,36,0.1)", color:r.is_approved?"#34d399":t.gold, padding:"2px 8px", borderRadius:6, fontSize:11, fontWeight:600 }}>{r.is_approved?"Опубликован":"На проверке"}</span>
                            </div>
                            <div style={{ color:t.sub, fontSize:13, lineHeight:1.6, marginBottom:6 }}>«{r.comment}»</div>
                            <div style={{ color:t.muted, fontSize:11 }}>{r.user_name} · {new Date(r.created_at).toLocaleDateString("ru-RU")}</div>
                          </div>
                          <div style={{ display:"flex", gap:8, flexShrink:0 }}>
                            {!r.is_approved && (
                              <button onClick={async()=>{ await sbReviews.approve(r.id); setAdminReviews(prev=>prev.map(x=>x.id===r.id?{...x,is_approved:true}:x)); }}
                                style={{ padding:"7px 16px", borderRadius:8, background:"rgba(52,211,153,0.15)", border:"1px solid rgba(52,211,153,0.3)", color:"#34d399", fontSize:12, fontWeight:600, cursor:"pointer" }}>
                                Одобрить
                              </button>
                            )}
                            <button onClick={async()=>{ await sbReviews.reject(r.id); setAdminReviews(prev=>prev.filter(x=>x.id!==r.id)); }}
                              style={{ padding:"7px 16px", borderRadius:8, background:"rgba(248,113,113,0.1)", border:"1px solid rgba(248,113,113,0.25)", color:"#f87171", fontSize:12, fontWeight:600, cursor:"pointer" }}>
                              Удалить
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
            }
          </div>
        )}

        {/* ORDERS */}
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
                          {o.method==="login" && (
                            <span>🔐 Логин: {
                              decrypted[o.id] !== undefined
                                ? decrypted[o.id] || "—"
                                : o.login_data?.startsWith("ENC:")
                                  ? <button onClick={()=>decryptLogin(o.id)} disabled={decrypting[o.id]} style={{ background:"rgba(251,191,36,0.12)", border:"1px solid rgba(251,191,36,0.3)", color:"#fbbf24", borderRadius:6, padding:"2px 8px", fontSize:11, cursor:"pointer", fontWeight:600 }}>
                                      {decrypting[o.id] ? "..." : "🔓 Расшифровать"}
                                    </button>
                                  : o.login_data
                            }</span>
                          )}
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
                        {o.receipt_url ? (
                          <div style={{ marginBottom:16 }}>
                            <button onClick={()=>openReceipt(o)} style={{ display:"flex",alignItems:"center",gap:7,padding:"9px 16px",borderRadius:10,background:"rgba(52,211,153,0.12)",border:"1px solid rgba(52,211,153,0.3)",color:"#6ee7b7",cursor:"pointer",fontSize:13,fontWeight:600 }}>
                              <IconDownload size={14} color="#6ee7b7"/>Посмотреть чек клиента
                            </button>
                          </div>
                        ) : (
                          <div style={{ marginBottom:16,padding:"10px 14px",borderRadius:10,background:"rgba(248,113,113,0.07)",border:"1px solid rgba(248,113,113,0.2)",color:"#f87171",fontSize:12 }}>
                            Чек не загружен
                          </div>
                        )}
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
                              style={{ padding:"9px 18px", borderRadius:10, background:saved===o.id?"rgba(52,211,153,0.25)":"rgba(52,211,153,0.15)", border:`1px solid ${saved===o.id?"rgba(52,211,153,0.6)":"rgba(52,211,153,0.35)"}`, color:"#6ee7b7", cursor:"pointer", fontSize:13, fontWeight:600, opacity:saving===o.id?.7:1, transition:"all .2s" }}>
                              {saving===o.id ? "Сохраняем..." : saved===o.id ? "✅ Сохранено и отправлено" : "💾 Сохранить и уведомить клиента"}
                            </button>
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
          <div onClick={e=>e.stopPropagation()} style={{ position:"relative", maxWidth:"90vw", textAlign:"center" }}>
            <button onClick={()=>setReceiptModal(null)} style={{ position:"absolute",top:-14,right:-14,background:"#f87171",border:"none",borderRadius:"50%",width:32,height:32,color:"white",cursor:"pointer",fontSize:16,fontWeight:700 }}>✕</button>
            {receiptModal.name?.toLowerCase().endsWith(".pdf")
              ? <div style={{ color:"white", padding:40 }}>
                  <div style={{ fontSize:48, marginBottom:16 }}>📄</div>
                  <div style={{ marginBottom:16 }}>PDF-файл: {receiptModal.name}</div>
                  <a href={receiptModal.url} target="_blank" rel="noreferrer" style={{ color:"#fbbf24", fontWeight:700, fontSize:15 }}>Открыть PDF ↗</a>
                </div>
              : <img src={receiptModal.url} alt="чек" style={{ maxWidth:"85vw", maxHeight:"85vh", borderRadius:12 }}/>
            }
            <div style={{ marginTop:10 }}>
              <a href={receiptModal.url} target="_blank" rel="noreferrer" style={{ color:"#fbbf24", fontSize:13, textDecoration:"none" }}>↓ Открыть / скачать</a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
