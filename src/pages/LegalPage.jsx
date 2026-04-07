// src/pages/LegalPage.jsx
// Добавь в App.jsx: import LegalPage from "./pages/LegalPage";
// И в роутинг: if (page === "#legal") return <LegalPage go={go} t={t} />;
// В футере добавь: <button onClick={()=>go("#legal")}>Оферта</button>

import { useState } from "react";

const LEGAL_RU = `
## 1. Общие положения

**1.1.** Настоящий документ является публичной офертой в соответствии со ст. 435 и 437 ГК РФ и содержит условия договора об оказании посреднических услуг между сервисом **payflow** (далее — «Исполнитель») и пользователем (далее — «Пользователь»).

**1.2.** Акцептом оферты является регистрация на Сайте и/или оформление Заявки.

**1.3.** Исполнитель оказывает посреднические услуги по организации доступа к цифровым подпискам иностранных сервисов, недоступных для прямой оплаты с российских банковских карт. Исполнитель **не является** правообладателем или официальным партнёром указанных сервисов.

---

## 2. Предмет договора

**2.1.** Исполнитель по поручению Пользователя производит оплату выбранного Сервиса и обеспечивает передачу данных доступа.

**2.2.** Перечень Сервисов размещён на Сайте и может изменяться в одностороннем порядке.

---

## 3. Стоимость и порядок оплаты

**3.1.** Стоимость Услуг = стоимость подписки по курсу ЦБ РФ + вознаграждение Исполнителя **10%**.

**3.2.** Итоговая стоимость в рублях отображается до подтверждения Заявки.

**3.3.** Оплата производится банковским переводом по реквизитам на Сайте. Пользователь обязан указать номер Заявки в назначении платежа.

**3.4.** Возврат средств возможен только при неисполнении Заявки по вине Исполнителя в течение 24 часов — в течение 5 рабочих дней в полном объёме.

---

## 4. Сроки оказания услуг

**4.1.** Выполнение Заявки: **до 1 часа** в рабочее время (пн–пт, 9:00–21:00 МСК), **до 24 часов** — в иное время.

**4.2.** Результат передаётся Пользователю в Личном кабинете на Сайте.

---

## 5. Права и обязанности сторон

**Исполнитель обязуется:** добросовестно исполнять Заявки; обеспечивать конфиденциальность данных; уведомлять об изменениях условий за 3 дня.

**Исполнитель вправе:** отказать в исполнении Заявки с возвратом оплаты; изменять тарифы и перечень Сервисов.

**Пользователь обязуется:** предоставлять достоверные данные; использовать подписки в личных целях; соблюдать условия использования приобретённых Сервисов.

---

## 6. Ответственность

**6.1.** Исполнитель не несёт ответственности за изменение правил и тарифов Сервисов третьих лиц; блокировку аккаунта по вине Пользователя; недоступность Сервисов по техническим причинам.

**6.2.** Совокупная ответственность Исполнителя не превышает стоимость конкретной Заявки.

---

## 7. Персональные данные

**7.1.** Регистрируясь на Сайте, Пользователь даёт согласие на обработку персональных данных (имя, email, данные о заявках) в соответствии с ФЗ № 152-ФЗ «О персональных данных».

**7.2.** Исполнитель не передаёт данные третьим лицам, за исключением случаев, предусмотренных законодательством РФ.

**7.3.** Отзыв согласия: legal@payflow.ru

---

## 8. Разрешение споров

**8.1.** Претензии направляются на **legal@payflow.ru** и рассматриваются в течение 10 рабочих дней.

**8.2.** При недостижении согласия — споры рассматриваются в суде по месту нахождения Исполнителя согласно законодательству РФ.

---

## 9. Реквизиты

**Исполнитель:** Людвиг Владислав Евгеньевич 
**Email:** legal@payflow.ru  
**Сайт:** payflow.ru

*Дата вступления в силу: 1 апреля 2026 г.*
`;

const LEGAL_EN = `
## 1. Introduction

**1.1.** These Terms of Service govern your use of **payflow** ("we", "Service Provider") and constitute a binding agreement between you ("User") and payflow.

**1.2.** By registering or placing an Order, you confirm acceptance of these Terms.

**1.3.** payflow provides **intermediary payment services** to help users access international digital subscriptions unavailable for direct payment. We are **not** the publisher or official distributor of any third-party service.

---

## 2. Services

**2.1.** We process payments for third-party digital services on your behalf and deliver access credentials to your personal account.

**2.2.** The list of supported services is shown on our website and may change at any time.

---

## 3. Pricing and Payment

**3.1.** Total cost = subscription price at CBR exchange rate + our fee of **10%**.

**3.2.** The final price in Russian Rubles is shown before order confirmation.

**3.3.** Payment is made by bank transfer with your Order ID in the payment reference.

**3.4.** Refunds are available if we fail to fulfill an Order within 24 hours due to our fault, processed within 5 business days.

---

## 4. Order Fulfillment

**4.1.** Orders are fulfilled within **1 hour** (business hours: Mon–Fri 9:00–21:00 Moscow) or **24 hours** otherwise.

**4.2.** Access credentials are delivered to your personal account on the website.

---

## 5. User Obligations

You agree to: provide accurate information; use subscriptions for personal purposes; comply with third-party services' terms of use.

---

## 6. Limitation of Liability

**6.1.** We are not liable for: changes to third-party services; account suspension due to your actions; third-party service unavailability.

**6.2.** Our total liability shall not exceed the amount paid for the specific Order.

**6.3. EU Consumer Rights:** Nothing in these Terms affects your statutory rights as a consumer under EU law, including rights under Directive 2011/83/EU.

---

## 7. Right of Withdrawal (EU Users)

**7.1.** EU consumers have a 14-day right of withdrawal. However, by placing an order for immediate digital activation, you expressly consent to immediate performance and acknowledge that you waive your right of withdrawal once activation begins.

---

## 8. Privacy and GDPR

**8.1.** We process: name, email, order data. Legal basis: contract performance (Art. 6(1)(b) GDPR).

**8.2.** We do **not** sell your data. Data is retained for 5 years for legal compliance.

**8.3. Your GDPR rights:** access, rectification, erasure, portability, objection. Contact: legal@payflow.ru

---

## 9. Dispute Resolution

**9.1.** Contact **legal@payflow.ru** first — we resolve disputes within 10 business days.

**9.2. EU Users:** You may use the EU ODR platform: https://ec.europa.eu/consumers/odr

**9.3.** Governing law: Russian Federation law, with mandatory consumer protection rights preserved in your jurisdiction.

---

## 10. Contact

**Legal:** legal@payflow.ru  
**Support:** support@payflow.ru  
**Website:** payflow.ru

*Effective: April 1, 2026*
`;

function renderMarkdown(text, t) {
  return text.split("\n").map((line, i) => {
    if (line.startsWith("## ")) return (
      <h2 key={i} style={{ fontFamily:"'Clash Display',sans-serif", fontWeight:700, fontSize:20, color:t.text, marginTop:32, marginBottom:12, paddingBottom:8, borderBottom:`1px solid ${t.border}` }}>
        {line.replace("## ", "")}
      </h2>
    );
    if (line.startsWith("---")) return <hr key={i} style={{ border:"none", borderTop:`1px solid ${t.border}`, margin:"24px 0" }}/>;
    if (!line.trim()) return <div key={i} style={{ height:8 }}/>;

    // Bold text
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    return (
      <p key={i} style={{ color: line.startsWith("*") ? t.muted : t.sub, fontSize:14, lineHeight:1.8, marginBottom:6 }}>
        {parts.map((p, j) =>
          p.startsWith("**") && p.endsWith("**")
            ? <strong key={j} style={{ color:t.text, fontWeight:600 }}>{p.slice(2,-2)}</strong>
            : p
        )}
      </p>
    );
  });
}

export default function LegalPage({ go, t }) {
  const [lang, setLang] = useState("ru");

  return (
    <div style={{ background:t.bg, minHeight:"100vh", fontFamily:"'Satoshi',sans-serif" }}>
      {/* Header */}
      <div style={{ background:t.card2, borderBottom:`1px solid ${t.border}`, padding:"16px 24px", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
        <button onClick={()=>go("#home")} style={{ background:"none", border:"none", color:t.sub, cursor:"pointer", fontSize:14, display:"flex", alignItems:"center", gap:6 }}>
          ← На главную
        </button>
        <div style={{ fontFamily:"'Clash Display',sans-serif", fontWeight:700, fontSize:18, color:t.text }}>
          pay<span style={{ color:"#fbbf24" }}>flow</span> · {lang === "ru" ? "Публичная оферта" : "Terms of Service"}
        </div>
        {/* Lang toggle */}
        <div style={{ display:"flex", background:t.inp, borderRadius:10, padding:3, gap:2 }}>
          {[["ru","🇷🇺 RU"],["en","🇬🇧 EN"]].map(([l,label]) => (
            <button key={l} onClick={()=>setLang(l)} style={{ padding:"6px 14px", borderRadius:8, border:"none", cursor:"pointer", fontSize:13, fontWeight:600, background:lang===l?"#fbbf24":"transparent", color:lang===l?"#0a0a14":t.sub, transition:"all .2s" }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth:760, margin:"0 auto", padding:"48px 24px 80px" }}>

        {/* Title */}
        <div style={{ marginBottom:40 }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(251,191,36,0.1)", border:"1px solid rgba(251,191,36,0.3)", borderRadius:100, padding:"6px 16px", marginBottom:16, fontSize:12, color:"#fbbf24", fontWeight:600 }}>
            📋 {lang === "ru" ? "Публичная оферта" : "Public Offer · Terms of Service"}
          </div>
          <h1 style={{ fontFamily:"'Clash Display',sans-serif", fontWeight:700, fontSize:32, color:t.text, marginBottom:8 }}>
            {lang === "ru" ? "Договор об оказании посреднических услуг" : "Intermediary Services Agreement"}
          </h1>
          <div style={{ display:"flex", flexWrap:"wrap", gap:16, color:t.muted, fontSize:13 }}>
            <span>📅 {lang === "ru" ? "Вступает в силу:" : "Effective:"} 1 апреля 2026</span>
            <span>🌐 payflow.ru</span>
            <span>✉️ legal@payflow.ru</span>
          </div>
        </div>

        {/* Notice box */}
        <div style={{ background:"rgba(96,165,250,0.08)", border:"1px solid rgba(96,165,250,0.25)", borderRadius:14, padding:16, marginBottom:36 }}>
          <div style={{ color:"#93c5fd", fontWeight:600, fontSize:13, marginBottom:6 }}>
            ℹ️ {lang === "ru" ? "Важно" : "Important"}
          </div>
          <div style={{ color:t.sub, fontSize:13, lineHeight:1.7 }}>
            {lang === "ru"
              ? "Используя сервис payflow, вы соглашаетесь с условиями настоящей оферты. Рекомендуем внимательно ознакомиться с документом перед оформлением заказа."
              : "By using payflow, you agree to these Terms. Please read carefully before placing an order. EU consumers retain all mandatory statutory rights regardless of these Terms."}
          </div>
        </div>

        {/* Legal text */}
        <div style={{ background:t.card2, border:`1px solid ${t.border}`, borderRadius:18, padding:"32px 36px", boxShadow:t.shadow }}>
          {renderMarkdown(lang === "ru" ? LEGAL_RU : LEGAL_EN, t)}
        </div>

        {/* Download */}
        <div style={{ display:"flex", gap:12, marginTop:24, justifyContent:"center", flexWrap:"wrap" }}>
          <button
            onClick={() => {
              const text = lang === "ru" ? LEGAL_RU : LEGAL_EN;
              const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
              const a = document.createElement("a");
              a.href = URL.createObjectURL(blob);
              a.download = lang === "ru" ? "payflow-оферта.txt" : "payflow-terms.txt";
              a.click();
            }}
            style={{ padding:"11px 22px", borderRadius:12, background:t.goldDim, border:`1px solid rgba(251,191,36,0.35)`, color:"#fbbf24", cursor:"pointer", fontSize:13, fontWeight:600 }}>
            ↓ {lang === "ru" ? "Скачать оферту" : "Download Terms"}
          </button>
          <button onClick={()=>go("#home")} style={{ padding:"11px 22px", borderRadius:12, background:t.card, border:`1px solid ${t.border}`, color:t.sub, cursor:"pointer", fontSize:13 }}>
            ← {lang === "ru" ? "На главную" : "Back to Home"}
          </button>
        </div>
      </div>
    </div>
  );
}
