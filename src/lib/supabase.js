// src/lib/supabase.js
// ────────────────────────────────────────────────────────────
// Замени VITE_SUPABASE_URL и VITE_SUPABASE_ANON_KEY
// в файле .env (и в Vercel → Settings → Environment Variables)
// ────────────────────────────────────────────────────────────

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON) {
  console.error("❌ Не заданы VITE_SUPABASE_URL и VITE_SUPABASE_ANON_KEY в .env");
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON, {
  auth: {
    autoRefreshToken: true,
    persistSession:   true,
    detectSessionInUrl: true,
  },
});

// ── Auth helpers ─────────────────────────────────────────────
export const auth = {
  signUp: (email, password, name) =>
    supabase.auth.signUp({ email, password, options: { data: { name } } }),

  signIn: (email, password) =>
    supabase.auth.signInWithPassword({ email, password }),

  signOut: () => supabase.auth.signOut(),

  getUser: () => supabase.auth.getUser(),

  onAuthChange: (cb) => supabase.auth.onAuthStateChange(cb),
};

// ── Profile helpers ──────────────────────────────────────────
export const profiles = {
  get: (userId) =>
    supabase.from("profiles").select("*").eq("id", userId).single(),

  update: (userId, data) =>
    supabase.from("profiles").update(data).eq("id", userId),
};

// ── Orders helpers ───────────────────────────────────────────
export const orders = {
  insert: (order) =>
    supabase.from("orders").insert(order).select().single(),

  getByUser: (userId) =>
    supabase.from("orders")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),

  getAll: () =>
    supabase.from("orders")
      .select("*")
      .order("created_at", { ascending: false }),

  update: (orderId, data) =>
    supabase.from("orders").update(data).eq("id", orderId).select().single(),

  // Real-time подписка на изменения заявки
  subscribeToOrder: (orderId, cb) =>
    supabase.channel(`order_${orderId}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "orders", filter: `id=eq.${orderId}` }, cb)
      .subscribe(),

  // Real-time для admin — все изменения
  subscribeAll: (cb) =>
    supabase.channel("all_orders")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, cb)
      .subscribe(),
};

// ── Notifications helpers ────────────────────────────────────
export const notifications = {
  getByUser: (userId) =>
    supabase.from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),

  insert: (notification) =>
    supabase.from("notifications").insert(notification),

  markRead: (userId) =>
    supabase.from("notifications").update({ is_read: true }).eq("user_id", userId).eq("is_read", false),

  subscribeByUser: (userId, cb) =>
    supabase.channel(`notifs_${userId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` }, cb)
      .subscribe(),
};

// ── Storage helpers ──────────────────────────────────────────
export const storage = {
  uploadReceipt: async (userId, orderId, file) => {
    const ext  = file.name.split(".").pop();
    const path = `${userId}/${orderId}.${ext}`;
    const { data, error } = await supabase.storage
      .from("receipts")
      .upload(path, file, { upsert: true, contentType: file.type });
    if (error) throw error;
    return path;
  },

  getReceiptUrl: (path) => {
    const { data } = supabase.storage.from("receipts").getPublicUrl(path);
    return data.publicUrl;
  },

  // Для admin — signed URL (временная ссылка)
  getSignedUrl: async (path) => {
    const { data, error } = await supabase.storage
      .from("receipts")
      .createSignedUrl(path, 60 * 60); // 1 час
    if (error) throw error;
    return data.signedUrl;
  },
};

// ── Referral helpers ─────────────────────────────────────────
export const referrals = {
  // Список рефералов пользователя (кого он привёл)
  getByReferrer: (userId) =>
    supabase
      .from("referral_events")
      .select("*, referred:referred_id(name, created_at)")
      .eq("referrer_id", userId)
      .order("created_at", { ascending: false }),

  // Обработать реферала при выполнении заказа (SECURITY DEFINER — только сервер)
  processReferral: (orderId) =>
    supabase.rpc("process_referral", { p_order_id: orderId }),

  // Списать бонус с баланса пользователя при оформлении заказа
  spendBalance: (userId, amount) =>
    supabase.rpc("spend_balance", { p_user_id: userId, p_amount: amount }),
};

// ── Promocodes helpers ───────────────────────────────────────
export const promocodes = {
  validate: async (code) => {
    const { data, error } = await supabase
      .from("promocodes")
      .select("*")
      .eq("code", code.toUpperCase())
      .eq("is_active", true)
      .single();
    if (error || !data) return null;
    if (data.expires_at && new Date(data.expires_at) < new Date()) return null;
    if (data.uses_left === 0) return null;
    return data;
  },

  use: (id) =>
    supabase.rpc("use_promocode", { promo_id: id }),
};
