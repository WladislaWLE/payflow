// api/rate.js — Vercel Serverless Function
// Получает курс ЦБ РФ серверно (без CORS проблем)

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=600");

  const today = new Date().toLocaleDateString("ru-RU", {
    timeZone: "Europe/Moscow",
    day: "2-digit", month: "2-digit", year: "numeric"
  });

  // Источник 1: cbr-xml-daily.ru — JSON зеркало ЦБ РФ
  try {
    const r = await fetch("https://www.cbr-xml-daily.ru/daily_json.js", {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; payflow/1.0)" },
      signal: AbortSignal.timeout(5000),
    });
    const d = await r.json();
    if (d?.Valute?.USD?.Value) {
      return res.status(200).json({
        rate: d.Valute.USD.Value,
        date: today,
        source: "cbr"
      });
    }
  } catch (e) {
    console.error("CBR JSON failed:", e.message);
  }

  // Источник 2: XML ЦБ РФ напрямую
  try {
    const r = await fetch("https://www.cbr.ru/scripts/XML_daily.asp", {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; payflow/1.0)",
        "Accept": "text/xml",
      },
      signal: AbortSignal.timeout(5000),
    });
    const xml = await r.text();
    // Ищем USD (код R01235)
    const match = xml.match(/R01235[\s\S]*?<Value>([\d,]+)<\/Value>/);
    if (match) {
      const rate = parseFloat(match[1].replace(",", "."));
      return res.status(200).json({ rate, date: today, source: "cbr-xml" });
    }
  } catch (e) {
    console.error("CBR XML failed:", e.message);
  }

  // Источник 3: exchangerate-api (резервный)
  try {
    const r = await fetch("https://api.exchangerate-api.com/v4/latest/USD", {
      signal: AbortSignal.timeout(5000),
    });
    const d = await r.json();
    if (d?.rates?.RUB) {
      return res.status(200).json({
        rate: d.rates.RUB,
        date: today,
        source: "exchangerate-api"
      });
    }
  } catch (e) {
    console.error("ExchangeRate failed:", e.message);
  }

  // Фоллбэк — последний известный курс
  return res.status(200).json({ rate: 84.5, date: today, source: "fallback" });
}