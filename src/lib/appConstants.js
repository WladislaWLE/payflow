// src/lib/appConstants.js — общие константы и DB-хелперы
import { supabase } from "./supabase";

export const MARGIN = 0.15;

export const SL = {
  new:        "Новая",
  paid:       "Оплачена",
  processing: "В обработке",
  done:       "Выполнена",
  cancelled:  "Отменена",
};
export const SC = {
  new:        "#fbbf24",
  paid:       "#60a5fa",
  processing: "#a78bfa",
  done:       "#34d399",
  cancelled:  "#f87171",
};
export const SE = {
  new:        "⏳",
  paid:       "💳",
  processing: "🔧",
  done:       "✅",
  cancelled:  "❌",
};
export const POPULAR_NAMES = [
  "ChatGPT Plus", "Midjourney", "Netflix", "Spotify Premium", "Cursor Pro", "Claude Pro",
];

export const calc = (usd, r) => Math.round(usd * r * (1 + MARGIN));

export function calcDiscount(total, promo) {
  if (!promo) return 0;
  if (promo.type === "percent") return Math.round(total * promo.value / 100);
  if (promo.type === "fixed")   return Math.min(promo.value, total);
  if (promo.type === "free")    return Math.round(total * 0.10);
  return 0;
}

export async function checkPromocode(code) {
  const { data, error } = await supabase.rpc("apply_promocode", { promo_code_text: code });
  if (error) return { ok: false, error: error.message };
  return data;
}

export async function getSetting(key) {
  const { data } = await supabase.from("settings").select("value").eq("key", key).single();
  return data?.value ?? null;
}

export async function setSetting(key, value) {
  await supabase.from("settings").upsert({ key, value, updated_at: new Date().toISOString() });
}

export async function getPromocodes() {
  const { data } = await supabase.from("promocodes").select("*").order("created_at", { ascending: false });
  return data || [];
}

export async function savePromocode(promo) {
  if (promo.id) {
    const { error } = await supabase.from("promocodes").update(promo).eq("id", promo.id);
    return { error };
  }
  const { error } = await supabase.from("promocodes").insert({ ...promo, code: promo.code.toUpperCase() });
  return { error };
}

export async function deletePromocode(id) {
  const { error } = await supabase.from("promocodes").delete().eq("id", id);
  return { error };
}
