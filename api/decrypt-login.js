// api/decrypt-login.js — Vercel Serverless Function
// Расшифровывает login_data для администратора

import { createClient } from "@supabase/supabase-js";
import { createDecipheriv } from "crypto";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Расшифровывает строку вида ENC:<iv_hex>:<ciphertext_hex>:<tag_hex>.
 * Если строка не начинается с "ENC:" — возвращает как есть (обратная совместимость).
 */
function decrypt(encrypted) {
  if (!encrypted || !encrypted.startsWith("ENC:")) return encrypted;
  const keyHex = process.env.ENCRYPTION_KEY || "";
  if (keyHex.length !== 64) throw new Error("ENCRYPTION_KEY must be 64 hex chars");
  const key    = Buffer.from(keyHex, "hex");
  const parts  = encrypted.slice(4).split(":");
  if (parts.length !== 3) throw new Error("Invalid encrypted format");
  const iv       = Buffer.from(parts[0], "hex");
  const cipherBuf = Buffer.from(parts[1], "hex");
  const tag      = Buffer.from(parts[2], "hex");
  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(cipherBuf), decipher.final()]).toString("utf8");
}

export default async function handler(req, res) {
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

  // Верификация токена
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
  if (authErr || !user) return res.status(401).json({ error: "Invalid token" });

  // Проверяем что пользователь — администратор
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();
  if (!profile?.is_admin) return res.status(403).json({ error: "Forbidden" });

  const { orderId } = req.body || {};
  if (!orderId) return res.status(400).json({ error: "orderId required" });

  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .select("login_data")
    .eq("id", orderId)
    .single();
  if (orderErr || !order) return res.status(404).json({ error: "Order not found" });
  if (!order.login_data) return res.status(200).json({ login_data: "" });

  try {
    const plaintext = decrypt(order.login_data);
    return res.status(200).json({ login_data: plaintext });
  } catch (e) {
    console.error("Decrypt error:", e.message);
    return res.status(500).json({ error: "Decryption failed" });
  }
}
