// src/pages/LegalPage.jsx
// Добавь в App.jsx: import LegalPage from "./pages/LegalPage";
// И в роутинг: if (page === "#legal") return <LegalPage go={go} t={t} />;
// В футере добавь: <button onClick={()=>go("#legal")}>Оферта</button>

import { useState } from "react";

const LEGAL_RU = `
## 1. Общие положения

**1.1.** Настоящий документ является публичной офертой в соответствии со ст. 435 и 437 ГК РФ и содержит условия договора об оказании посреднических услуг между сервисом **pay-flow** (далее — «Исполнитель») и пользователем (далее — «Пользователь»).

**1.2.** Акцептом оферты является регистрация на Сайте и/или оформление Заявки.

**1.3.** Исполнитель оказывает посреднические услуги по организации доступа к цифровым подпискам иностранных сервисов, недоступных для прямой оплаты с российских банковских карт. Исполнитель **не является** правообладателем или официальным партнёром указанных сервисов.

---

## 2. Предмет договора

**2.1.** Исполнитель по поручению Пользователя производит оплату выбранного Сервиса и обеспечивает передачу данных доступа.

**2.2.** Перечень Сервисов размещён на Сайте и может изменяться в одностороннем порядке.

---

## 3. Стоимость и порядок оплаты

**3.1.** Стоимость Услуг = стоимость подписки по актуальному курсу ЦБ РФ + вознаграждение Исполнителя **15%**.

**3.2.** Итоговая стоимость в рублях отображается до подтверждения Заявки.

**3.3.** Оплата производится банковским переводом (СБП или по номеру карты) по реквизитам, указанным в Заявке. Пользователь обязан указать номер Заявки в комментарии к переводу.

**3.4.** Возврат средств осуществляется в полном объёме в течение 5 рабочих дней в случае неисполнения Заявки по вине Исполнителя в течение 24 часов с момента подтверждения оплаты.

---

## 4. Гарантия активации

**4.1.** Исполнитель гарантирует активацию Заявки в течение **60 минут** с момента подтверждения поступления оплаты и загрузки чека.

**4.2.** В случае нарушения срока, указанного в п. 4.1, по вине Исполнителя, Пользователь вправе потребовать полного возврата средств.

**4.3.** Результат передаётся Пользователю в Личном кабинете на Сайте. При необходимости — через уведомление.

**4.4.** В нерабочее время (пн–пт 21:00–9:00 МСК, выходные и праздники) срок активации может составлять **до 24 часов**.

---

## 5. Права и обязанности сторон

**Исполнитель обязуется:** добросовестно исполнять Заявки в установленные сроки; обеспечивать конфиденциальность данных Пользователя; уведомлять об изменениях условий не менее чем за 3 дня.

**Исполнитель вправе:** отказать в исполнении Заявки с полным возвратом оплаты; изменять тарифы и перечень Сервисов; прекратить доступ к Сайту при нарушении условий Пользователем.

**Пользователь обязуется:** предоставлять достоверные данные; использовать подписки исключительно в личных некоммерческих целях; соблюдать условия использования приобретённых Сервисов третьих лиц.

---

## 6. Реферальная программа

**6.1.** Исполнитель предоставляет Пользователю возможность участвовать в реферальной программе «Приведи друга».

**6.2.** Условия начисления бонусов:
— Пользователь получает уникальную реферальную ссылку в Личном кабинете.
— За каждого нового Пользователя, прошедшего регистрацию по реферальной ссылке и выполнившего **первую оплаченную Заявку**, реферер получает бонус в размере **200 ₽** на внутренний счёт.
— Реферальный бонус начисляется не позднее 3 рабочих дней после выполнения условий.

**6.3.** Начисленный бонус применяется автоматически при оформлении следующей Заявки в качестве скидки и не может быть выведен денежными средствами.

**6.4.** Исполнитель вправе изменить условия реферальной программы с уведомлением за 7 дней. Ранее начисленные бонусы сохраняются.

**6.5.** Реферальная программа не распространяется на самореферирование (регистрацию с собственной ссылки).

---

## 7. Ответственность

**7.1.** Исполнитель не несёт ответственности за: изменение правил, тарифов и доступности Сервисов третьих лиц; блокировку аккаунта по вине Пользователя; недоступность Сервисов по техническим причинам, не зависящим от Исполнителя.

**7.2.** Совокупная ответственность Исполнителя не превышает стоимость конкретной Заявки.

---

## 8. Персональные данные

**8.1.** Регистрируясь на Сайте, Пользователь даёт согласие на обработку персональных данных (имя, email, данные о заявках, реферальная активность) в соответствии с ФЗ № 152-ФЗ «О персональных данных».

**8.2.** Исполнитель не передаёт данные третьим лицам, за исключением случаев, предусмотренных законодательством РФ.

**8.3.** Отзыв согласия: legal@pay-flow.ru

---

## 9. Разрешение споров

**9.1.** Претензии направляются на **legal@pay-flow.ru** и рассматриваются в течение 10 рабочих дней.

**9.2.** При недостижении согласия — споры рассматриваются в суде по месту нахождения Исполнителя согласно законодательству РФ.

---

## 10. Реквизиты

**Исполнитель:** Людвиг Владислав Евгеньевич
**Email:** legal@pay-flow.ru
**Поддержка:** support@pay-flow.ru
**Сайт:** pay-flow.ru

*Дата вступления в силу: 1 апреля 2026 г.*
`;

const LEGAL_EN = `
## 1. Introduction

**1.1.** These Terms of Service govern your use of **pay-flow** ("we", "Service Provider") and constitute a binding agreement between you ("User") and pay-flow.

**1.2.** By registering or placing an Order, you confirm acceptance of these Terms.

**1.3.** pay-flow provides **intermediary payment services** to help users access international digital subscriptions unavailable for direct payment. We are **not** the publisher or official distributor of any third-party service.

---

## 2. Services

**2.1.** We process payments for third-party digital services on your behalf and deliver access credentials to your personal account.

**2.2.** The list of supported services is shown on our website and may change at any time.

---

## 3. Pricing and Payment

**3.1.** Total cost = subscription price at current CBR exchange rate + our service fee of **15%**.

**3.2.** The final price in Russian Rubles is shown before order confirmation.

**3.3.** Payment is made by bank transfer (SBP or card) with your Order ID in the payment reference.

**3.4.** Refunds are available in full within 5 business days if we fail to fulfill an Order within 24 hours due to our fault.

---

## 4. Activation Guarantee

**4.1.** We guarantee activation within **60 minutes** from the moment payment is confirmed and receipt is uploaded.

**4.2.** If this deadline is missed due to our fault, you are entitled to a full refund.

**4.3.** Access credentials are delivered to your personal account on the website.

**4.4.** Outside business hours (Mon–Fri 21:00–09:00 Moscow, weekends and holidays), fulfillment time may extend to **24 hours**.

---

## 5. Referral Program

**5.1.** Users may participate in the "Refer a Friend" referral program.

**5.2.** Referral bonus conditions:
— You receive a unique referral link in your personal account.
— For each new user who registers via your link and completes their **first paid order**, you receive a bonus of **200 RUB** to your internal account.
— Bonuses are credited within 3 business days after conditions are met.

**5.3.** Credited bonuses are applied automatically as a discount on your next order and cannot be withdrawn as cash.

**5.4.** We may modify referral program terms with 7 days' notice. Previously credited bonuses are preserved.

**5.5.** Self-referral (registering using your own link) is prohibited.

---

## 6. User Obligations

You agree to: provide accurate information; use subscriptions for personal, non-commercial purposes; comply with third-party services' terms of use.

---

## 7. Limitation of Liability

**7.1.** We are not liable for: changes to third-party services; account suspension due to your actions; third-party service unavailability beyond our control.

**7.2.** Our total liability shall not exceed the amount paid for the specific Order.

**7.3. EU Consumer Rights:** Nothing in these Terms affects your statutory rights as a consumer under EU law, including rights under Directive 2011/83/EU.

---

## 8. Right of Withdrawal (EU Users)

**8.1.** EU consumers have a 14-day right of withdrawal. However, by placing an order for immediate digital activation, you expressly consent to immediate performance and acknowledge that you waive your right of withdrawal once activation begins.

---

## 9. Privacy and GDPR

**9.1.** We process: name, email, order data, referral activity. Legal basis: contract performance (Art. 6(1)(b) GDPR).

**9.2.** We do **not** sell your data. Data is retained for 5 years for legal compliance.

**9.3. Your GDPR rights:** access, rectification, erasure, portability, objection. Contact: legal@pay-flow.ru

---

## 10. Dispute Resolution

**10.1.** Contact **legal@pay-flow.ru** first — we resolve disputes within 10 business days.

**10.2. EU Users:** You may use the EU ODR platform: https://ec.europa.eu/consumers/odr

**10.3.** Governing law: Russian Federation law, with mandatory consumer protection rights preserved in your jurisdiction.

---

## 11. Contact

**Legal:** legal@pay-flow.ru
**Support:** support@pay-flow.ru
**Website:** pay-flow.ru

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
            <span>🌐 pay-flow.ru</span>
            <span>✉️ legal@pay-flow.ru</span>
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
