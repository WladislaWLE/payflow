// api/create-order.js — Vercel Serverless Function
// Создаёт заявку с шифрованием login_data (AES-256-GCM)

import { createClient } from "@supabase/supabase-js";
import { createCipheriv, randomBytes } from "crypto";

// Service-role клиент для обхода RLS при вставке заявки
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Шифрует строку алгоритмом AES-256-GCM.
 * Формат: ENC:<iv_hex>:<ciphertext_hex>:<tag_hex>
 * ENCRYPTION_KEY — 64 hex-символа (32 байта), задаётся в Vercel env vars.
 */
function encrypt(plaintext) {
  const keyHex = process.env.ENCRYPTION_KEY || "";
  if (keyHex.length !== 64) throw new Error("ENCRYPTION_KEY must be 64 hex chars (32 bytes)");
  const key    = Buffer.from(keyHex, "hex");
  const iv     = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const enc    = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag    = cipher.getAuthTag();
  return `ENC:${iv.toString("hex")}:${enc.toString("hex")}:${tag.toString("hex")}`;
}

export default async function handler(req, res) {
  // CORS
  const origin = req.headers.origin;
  const allowedOrigins = [
    "https://pay-flow.ru",
    "https://www.pay-flow.ru",
    "http://localhost:5173",
    "http://localhost:4173",
  ];
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  // Верификация JWT-токена пользователя
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
  if (authErr || !user) return res.status(401).json({ error: "Invalid token" });

  const order = req.body;
  if (!order?.id || !order?.user_id) {
    return res.status(400).json({ error: "Invalid order data" });
  }

  // Убеждаемся, что заявка создаётся от имени авторизованного пользователя
  if (order.user_id !== user.id) {
    return res.status(403).json({ error: "Forbidden" });
  }

  // Шифруем login_data если задан ключ шифрования
  if (order.login_data && process.env.ENCRYPTION_KEY) {
    try {
      order.login_data = encrypt(order.login_data);
    } catch (e) {
      console.warn("Encryption skipped:", e.message);
      // Продолжаем без шифрования если ключ задан неверно
    }
  }

  // Вставляем заявку через service-role (обходит RLS)
  const { data, error } = await supabase.from("orders").insert(order).select();
  if (error) {
    console.error("order insert error:", error);
    return res.status(500).json({ error: error.message });
  }

  const o = data?.[0];

  // Telegram уведомление администратору
  if (o && process.env.TG_BOT_TOKEN && process.env.TG_ADMIN_CHAT_ID) {
    fetch(`https://api.telegram.org/bot${process.env.TG_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id:    process.env.TG_ADMIN_CHAT_ID,
        text:       `🆕 <b>Новая заявка</b> ${o.id}\n📦 ${o.service} · ${o.tier}\n💰 ${(o.price_rub || 0).toLocaleString("ru-RU")} ₽\n👤 ${o.user_email}`,
        parse_mode: "HTML",
      }),
    }).catch(() => {});
  }

  return res.status(200).json({ order: o });
}
