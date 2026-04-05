// api/tg-notify.js — Vercel Serverless Function
// Отправляет уведомление в Telegram когда создаётся новая заявка

export default async function handler(req, res) {
  // CORS — нужен чтобы браузер не блокировал запрос
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Preflight запрос от браузера
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { message } = req.body || {};
  if (!message) {
    return res.status(400).json({ error: "message is required" });
  }

  const token  = process.env.TG_BOT_TOKEN;
  const chatId = process.env.TG_ADMIN_CHAT_ID;

  if (!token || !chatId) {
    console.warn("tg-notify: TG_BOT_TOKEN или TG_ADMIN_CHAT_ID не заданы");
    return res.status(200).json({ ok: true, skipped: true, reason: "env not set" });
  }

  try {
    const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id:    chatId,
        text:       message,
        parse_mode: "HTML",
      }),
    });

    const data = await r.json();

    if (!data.ok) {
      console.error("Telegram API error:", data);
      return res.status(200).json({ ok: false, tg_error: data });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("tg-notify fetch error:", err);
    return res.status(200).json({ ok: false, error: String(err) });
  }
}
