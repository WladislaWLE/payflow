// middleware.js — Vercel Edge Middleware
// Защита API: проверка Origin + rate limiting по IP (burst protection)
//
// Размещается в корне проекта (рядом с vercel.json).
// Работает на Edge Runtime — быстро, до достижения серверлесс-функции.
//
// Для продакшн rate limiting с персистентным состоянием используйте
// Upstash Redis: https://upstash.com + @upstash/ratelimit

export const config = {
  matcher: ["/api/:path*"],
};

// In-memory хранилище по IP (persists на время жизни Edge-воркера — burst protection)
const rateStore = new Map();
const WINDOW_MS = 60_000; // 1 минута
const MAX_REQS  = 30;     // запросов с одного IP в окне

const ALLOWED_ORIGINS = [
  "https://pay-flow.ru",
  "https://www.pay-flow.ru",
  "http://localhost:5173",
  "http://localhost:4173",
];

export default function middleware(request) {
  const origin = request.headers.get("origin") ?? "";

  // Preflight OPTIONS — пропускаем без проверок (CORS обрабатывается в хендлерах)
  if (request.method === "OPTIONS") return;

  // Блокируем браузерные запросы с неизвестного Origin
  if (origin && !ALLOWED_ORIGINS.includes(origin)) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Rate limiting по IP
  const ip  = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const now = Date.now();
  const rec = rateStore.get(ip);

  if (!rec || now > rec.reset) {
    rateStore.set(ip, { count: 1, reset: now + WINDOW_MS });
  } else {
    rec.count++;
    if (rec.count > MAX_REQS) {
      return new Response(JSON.stringify({ error: "Too many requests" }), {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": "60",
        },
      });
    }
  }

  // Очищаем устаревшие записи раз в ~100 запросов
  if (Math.random() < 0.01) {
    for (const [key, val] of rateStore) {
      if (now > val.reset) rateStore.delete(key);
    }
  }
}
