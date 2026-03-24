// api/rate.js — Vercel Serverless Function
// Берёт курс напрямую с ЦБ РФ через XML API

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=600");

  const sources = [
    // 1. Официальный XML ЦБ РФ
    async () => {
      const r = await fetch("https://www.cbr.ru/scripts/XML_daily.asp", {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; payflow/1.0)",
          "Accept": "text/xml, application/xml",
        },
        signal: AbortSignal.timeout(5000),
      });
      const xml = await r.text();
      const match = xml.match(/<Valute ID="R01235">[\s\S]*?<Value>([\d,]+)<\/Value>/);
      if (!match) throw new Error("USD not found");
      const rate = parseFloat(match[1].replace(",", "."));
      const dateMatch = xml.match(/Date="(\d{2}\.\d{2}\.\d{4})"/);
      const date = dateMatch ? dateMatch[1] : "";
      return { rate, date, source: "cbr.ru" };
    },

    // 2. cbr-xml-daily.ru — зеркало ЦБ в JSON
    async () => {
      const r = await fetch("https://www.cbr-xml-daily.ru/daily_json.js", {
        headers: { "User-Agent": "Mozilla/5.0" },
        signal: AbortSignal.timeout(5000),
      });
      const d = await r.json();
      if (!d?.Valute?.USD?.Value) throw new Error("No USD");
      const rate = d.Valute.USD.Value;
      const date = new Date(d.Date).toLocaleDateString("ru-RU", { timeZone: "Europe/Moscow" });
      return { rate, date, source: "cbr-xml-daily.ru" };
    },
  ];

  for (const source of sources) {
    try {
      const result = await source();
      return res.status(200).json(result);
    } catch (e) {
      console.error("Source failed:", e.message);
    }
  }

  return res.status(500).json({ error: "All sources failed" });
}