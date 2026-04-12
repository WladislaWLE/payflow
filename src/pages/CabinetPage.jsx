// src/pages/CabinetPage.jsx — Личный кабинет + Реферальная программа
import { useState, useEffect, useRef } from "react";
import {
  supabase,
  orders as sbOrders,
  notifications as sbNotifs,
  storage as sbStorage,
  referrals as sbReferrals,
  reviews as sbReviews,
} from "../lib/supabase";
import { StatusBadge, OrderSkeleton, ActivationTimer, OrderProgress } from "../components/shared";
import { useOrders } from "../hooks/useOrders";
import { useNotifications } from "../hooks/useNotifications";

// ─── ReferralBlock ───────────────────────────────────────────
function ReferralBlock({ userId, profile, t, go }) {
  const [copied, setCopied] = useState(false);
  const [events, setEvents] = useState([]);
  const refCode = profile?.referral_code || (userId ? userId.slice(0,8).toUpperCase() : "------");
  const refLink = `https://pay-flow.ru/#home?ref=${refCode}`;
  const balance = profile?.referral_bonus_rub || 0;

  useEffect(() => {
    if (!userId) return;
    sbReferrals.getByReferrer(userId).then(({ data }) => setEvents(data || []));
  }, [userId]);

  const copy = () => {
    navigator.clipboard.writeText(refLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <div style={{ background:t.card2, border:`1px solid ${t.border}`, borderRadius:18, padding:24, position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute",top:-40,right:-40,width:160,height:160,borderRadius:"50%",background:"radial-gradient(circle,rgba(251,191,36,0.07) 0%,transparent 70%)",pointerEvents:"none" }}/>

      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
        <div style={{ width:44,height:44,borderRadius:14,background:t.goldDim,border:`1px solid ${t.goldB}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0 }}>🎁</div>
        <div>
          <div style={{ fontWeight:800, fontSize:16, color:t.text, letterSpacing:-0.3 }}>Реферальная программа</div>
          <div style={{ color:t.muted, fontSize:12, marginTop:2 }}>Получай 200 ₽ за каждого приглашённого друга</div>
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:18 }}>
        {[
          { icon:"👥", val:"200 ₽",    desc:"за каждого реферала" },
          { icon:"🎯", val:"без лимита", desc:"рефералов у вас" },
          { icon:"⚡", val:"3 дня",    desc:"до начисления бонуса" },
        ].map(b => (
          <div key={b.val} style={{ textAlign:"center", padding:"14px 8px", borderRadius:14, background:t.goldDim, border:`1px solid ${t.goldB}` }}>
            <div style={{ fontSize:18, marginBottom:5 }}>{b.icon}</div>
            <div style={{ fontFamily:"'Clash Display',sans-serif", fontWeight:800, fontSize:13, color:t.gold, marginBottom:3 }}>{b.val}</div>
            <div style={{ color:t.muted, fontSize:10, lineHeight:1.4 }}>{b.desc}</div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom:18 }}>
        <div style={{ color:t.muted, fontSize:11, textTransform:"uppercase", letterSpacing:1.5, fontWeight:600, marginBottom:12 }}>Как работает</div>
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {[
            { n:"1", title:"Поделись ссылкой",  desc:"Скопируй реферальную ссылку ниже и отправь другу" },
            { n:"2", title:"Друг делает заказ", desc:"Он регистрируется и оформляет первую оплаченную заявку" },
            { n:"3", title:"Бонус 200 ₽",       desc:"Зачисляем на твой счёт — применяется как скидка на следующий заказ" },
          ].map(s => (
            <div key={s.n} style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
              <div style={{ width:24,height:24,borderRadius:"50%",background:t.goldDim,border:`1px solid ${t.goldB}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontFamily:"'Clash Display',sans-serif",fontWeight:800,fontSize:11,color:t.gold }}>{s.n}</div>
              <div>
                <div style={{ color:t.text, fontWeight:600, fontSize:13 }}>{s.title}</div>
                <div style={{ color:t.sub, fontSize:12, marginTop:1, lineHeight:1.5 }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background:"rgba(15,23,42,0.6)", border:`1px solid ${t.border}`, borderRadius:14, padding:"14px 16px", marginBottom:14 }}>
        <div style={{ color:t.muted, fontSize:11, marginBottom:8, textTransform:"uppercase", letterSpacing:1, fontWeight:600 }}>Твоя ссылка · код {refCode}</div>
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          <div style={{ flex:1, color:t.sub, fontSize:12, fontFamily:"monospace", wordBreak:"break-all", lineHeight:1.5 }}>{refLink}</div>
          <button onClick={copy} style={{ padding:"9px 16px", borderRadius:10, background:copied?"rgba(52,211,153,0.15)":"rgba(251,191,36,0.12)", border:`1px solid ${copied?"rgba(52,211,153,0.4)":t.goldB}`, color:copied?"#34d399":t.gold, cursor:"pointer", fontSize:12, fontWeight:700, whiteSpace:"nowrap", flexShrink:0, transition:"all .2s" }}>
            {copied ? "✓ Скопировано" : "Копировать"}
          </button>
        </div>
      </div>

      {balance > 0 && (
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", background:t.goldDim, border:`1px solid ${t.goldB}`, borderRadius:14, padding:"14px 16px", marginBottom:14 }}>
          <div>
            <div style={{ color:t.muted, fontSize:11, textTransform:"uppercase", letterSpacing:1, fontWeight:600, marginBottom:3 }}>Твой бонусный баланс</div>
            <div style={{ fontFamily:"'Clash Display',sans-serif", fontWeight:900, fontSize:26, color:t.gold }}>{balance.toLocaleString("ru-RU")} ₽</div>
          </div>
          <div style={{ color:t.sub, fontSize:12, maxWidth:140, textAlign:"right", lineHeight:1.5 }}>Автоматически применяется при следующем заказе</div>
        </div>
      )}

      {events.length > 0 && (
        <div style={{ marginBottom:14 }}>
          <div style={{ color:t.muted, fontSize:11, textTransform:"uppercase", letterSpacing:1.5, fontWeight:600, marginBottom:10 }}>История начислений</div>
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            {events.map(e => (
              <div key={e.id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", background:"rgba(255,255,255,0.03)", border:`1px solid ${t.border}`, borderRadius:10, padding:"10px 14px" }}>
                <div>
                  <div style={{ color:t.text, fontSize:13, fontWeight:600 }}>Реферал {e.referred?.name || "—"}</div>
                  <div style={{ color:t.muted, fontSize:11, marginTop:1 }}>{new Date(e.created_at).toLocaleDateString("ru-RU")} · заявка {e.order_id}</div>
                </div>
                <div style={{ color:"#34d399", fontWeight:800, fontSize:15 }}>+{e.bonus_amount} ₽</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ padding:"10px 14px", borderRadius:10, background:"rgba(96,165,250,0.07)", border:"1px solid rgba(96,165,250,0.18)" }}>
        <div style={{ color:"#93c5fd", fontSize:12, lineHeight:1.6 }}>
          <strong>Условия:</strong> бонус начисляется после первой <em>выполненной</em> заявки реферала. Самореферирование не засчитывается. Бонус действует как скидка — на вывод не предназначен. Подробнее в <button onClick={()=>go&&go("#legal")} style={{ background:"none", border:"none", color:"#60a5fa", cursor:"pointer", fontSize:12, padding:0, textDecoration:"underline" }}>Оферте (п. 6)</button>.
        </div>
      </div>
    </div>
  );
}

// ─── Cabinet (default export) ────────────────────────────────
export default function Cabinet({ userHook, go, t, onReview }) {
  const { session, profile, logout } = userHook;
  const [tab, setTab]               = useState("orders");
  const [expandedId, setExpandedId] = useState(null);
  const [receiptModal, setReceiptModal]   = useState(null);
  const [receiptFiles, setReceiptFiles]   = useState({});
  const [uploadingFor, setUploadingFor]   = useState(null);

  const { orders, loading, reload }   = useOrders(session?.user?.id, false);
  const { notifs, unread, markRead }  = useNotifications(session?.user?.id);
  const [reviewedServices, setReviewedServices] = useState(new Set());

  useEffect(() => { if (tab === "notifs") markRead(); }, [tab]);

  useEffect(() => {
    if (!session?.user?.id) return;
    sbReviews.getByUser(session.user.id).then(({ data }) => {
      if (data) setReviewedServices(new Set(data.map(r => r.service_name)));
    });
  }, [session?.user?.id]);

  const openReceipt = async (o) => {
    if (!o.receipt_url) return;
    const url = await sbStorage.getSignedUrl(o.receipt_url);
    setReceiptModal({ url, name: o.receipt_name });
  };

  const uploadReceiptForOrder = async (orderId, userId) => {
    const file = receiptFiles[orderId];
    if (!file) return;
    setUploadingFor(orderId);
    try {
      const path = await sbStorage.uploadReceipt(userId, orderId, file);
      await sbOrders.update(orderId, { receipt_url: path, receipt_name: file.name });
      setReceiptFiles(prev => { const n = {...prev}; delete n[orderId]; return n; });
      await reload();
    } catch (e) { alert("Ошибка загрузки: " + e.message); }
    setUploadingFor(null);
  };

  const tabs = [
    { id:"orders",  label:"Заявки",      icon:"📋", count: orders.length },
    { id:"notifs",  label:"Уведомления", icon:"🔔", count: unread },
    { id:"profile", label:"Профиль",     icon:"👤" },
  ];

  const stats = {
    total:   orders.length,
    done:    orders.filter(o=>o.status==="done").length,
    spent:   orders.filter(o=>o.status==="done").reduce((s,o)=>s+(o.price_rub||0),0),
    pending: orders.filter(o=>["new","paid","processing"].includes(o.status)).length,
    balance: profile?.referral_bonus_rub || 0,
  };

  return (
    <div style={{ maxWidth:820, margin:"0 auto", padding:"80px 20px 60px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:32, flexWrap:"wrap", gap:12 }}>
        <div>
          <div style={{ color:t.muted, fontSize:13, marginBottom:4 }}>Личный кабинет</div>
          <div style={{ fontFamily:"'Clash Display',sans-serif", fontWeight:800, fontSize:28, color:t.text }}>Привет, {profile?.name || ""}! 👋</div>
        </div>
        <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
          {stats.balance > 0 && (
            <div style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 16px", borderRadius:100, background:t.goldDim, border:`1px solid ${t.goldB}`, fontSize:13, fontWeight:700, color:t.gold }}>
              🎁 Баланс: {stats.balance.toLocaleString("ru-RU")} ₽
            </div>
          )}
          <button onClick={()=>go("#catalog")} style={{ padding:"10px 20px", borderRadius:100, background:t.card, border:`1px solid ${t.border}`, color:t.sub, cursor:"pointer", fontSize:14, fontWeight:600 }}>🛍 Заказать ещё</button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))", gap:10, marginBottom:28 }}>
        {[
          {l:"Всего заявок",      v:stats.total,  c:t.gold,    i:"📋"},
          {l:"Выполнено",         v:stats.done,   c:"#34d399", i:"✅"},
          {l:"Потрачено",         v:stats.spent.toLocaleString("ru-RU")+" ₽", c:"#60a5fa", i:"💰"},
          {l:"В обработке",       v:stats.pending,c:"#a78bfa", i:"🔧"},
          {l:"Бонусный баланс",   v:stats.balance.toLocaleString("ru-RU")+" ₽", c:t.gold, i:"🎁"},
        ].map(s => (
          <div key={s.l} style={{ background:s.l==="Бонусный баланс"?t.goldDim:t.card2, border:`1px solid ${s.l==="Бонусный баланс"?t.goldB:t.border}`, borderRadius:16, padding:"16px 18px", boxShadow:t.shadow }}>
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
                      {o.status === "new" && (
                        <div style={{ background:t.goldDim, border:`1px solid ${t.goldB}`, borderRadius:12, padding:14, marginBottom:12 }}>
                          <div style={{ color:t.gold, fontWeight:600, fontSize:12, marginBottom:8 }}>💳 Реквизиты · {o.requisite_label}</div>
                          <div style={{ color:t.text, fontSize:14, marginBottom:4 }}>СБП: <strong>{o.requisite_sbp}</strong></div>
                          <div style={{ color:t.text, fontSize:14, marginBottom:6 }}>Карта: <strong>{o.requisite_card}</strong></div>
                          <div style={{ color:t.muted, fontSize:12 }}>Комментарий: <strong style={{ color:t.gold }}>{o.id}</strong></div>
                        </div>
                      )}
                      {o.operator_note && (
                        <div style={{ background:"rgba(52,211,153,0.08)", border:"1px solid rgba(52,211,153,0.3)", borderRadius:12, padding:14, marginBottom:12 }}>
                          <div style={{ color:"#6ee7b7", fontWeight:700, fontSize:13, marginBottom:8 }}>📩 Сообщение от оператора</div>
                          <div style={{ color:t.text, fontSize:14, lineHeight:1.7, whiteSpace:"pre-wrap", fontFamily:"monospace", background:"rgba(0,0,0,0.2)", borderRadius:8, padding:"10px 12px" }}>{o.operator_note}</div>
                        </div>
                      )}
                      {!o.receipt_url && (
                        <div style={{ marginBottom:12 }}>
                          <div style={{ color:t.sub, fontSize:12, marginBottom:6 }}>📎 Загрузить чек об оплате:</div>
                          <input type="file" accept="image/*,.pdf" style={{ display:"none" }} id={`file_${o.id}`}
                            onChange={e=>{ const f=e.target.files[0]; if(f) setReceiptFiles(prev=>({...prev,[o.id]:f})); }}/>
                          <div style={{ display:"flex", gap:8 }}>
                            <label htmlFor={`file_${o.id}`} style={{ flex:1, padding:"9px 14px", borderRadius:10, cursor:"pointer", background:t.inp, border:`1px dashed ${t.border}`, color:t.sub, fontSize:13, textAlign:"center", display:"block" }}>
                              {receiptFiles[o.id] ? receiptFiles[o.id].name : "📤 Выбрать файл"}
                            </label>
                            {receiptFiles[o.id] && (
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
                      <ActivationTimer createdAt={o.created_at} status={o.status}/>
                      <OrderProgress status={o.status}/>
                      {o.status === "done" && (
                        reviewedServices.has(o.service)
                          ? <div style={{ marginTop:10,width:"100%",padding:"9px 0",textAlign:"center",color:t.muted,fontSize:13 }}>✓ Отзыв оставлен</div>
                          : <button type="button" onClick={(e)=>{ e.stopPropagation(); if(onReview) onReview(o.service, o.id, ()=>setReviewedServices(prev=>new Set([...prev,o.service]))); }}
                              style={{ marginTop:10,width:"100%",padding:"9px 0",borderRadius:10,background:"rgba(251,191,36,0.08)",border:"1px solid rgba(251,191,36,0.25)",color:t.gold,fontSize:13,fontWeight:600,cursor:"pointer" }}>
                              ★ Оставить отзыв
                            </button>
                      )}
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
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
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
          <ReferralBlock userId={session?.user?.id} profile={profile} t={t} go={go}/>
        </div>
      )}

      {/* Receipt modal */}
      {receiptModal && (
        <div style={{ position:"fixed",inset:0,zIndex:400,background:"rgba(0,0,0,0.9)",display:"flex",alignItems:"center",justifyContent:"center",padding:20 }} onClick={()=>setReceiptModal(null)}>
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
          </div>
        </div>
      )}
    </div>
  );
}
