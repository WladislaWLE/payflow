export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: "message is required" });
  }

  const token  = process.env.TG_BOT_TOKEN;
  const chatId = process.env.TG_ADMIN_CHAT_ID;

  if (!token || !chatId) {
    // Не ломаем приложение если переменные не настроены
    return res.status(200).json({ ok: true, skipped: true });
  }

  try {
    const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: "HTML" }),
    });
    const data = await r.json();
    return res.status(200).json({ ok: data.ok });
  } catch (err) {
    // Тихая ошибка — не мешаем основному флоу
    console.error("tg-notify error:", err);
    return res.status(200).json({ ok: false, error: String(err) });
  }
}
