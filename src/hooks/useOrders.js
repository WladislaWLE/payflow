// src/hooks/useOrders.js
import { useState, useEffect, useRef } from "react";
import { supabase, orders as sbOrders, notifications as sbNotifs } from "../lib/supabase";

export function useOrders(userId, isAdmin) {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const ordersRef             = useRef([]);

  const load = async () => {
    setLoading(true);
    const { data } = isAdmin
      ? await sbOrders.getAll()
      : await sbOrders.getByUser(userId);
    const loaded = data || [];
    ordersRef.current = loaded;
    setOrders(loaded);
    setLoading(false);
  };

  useEffect(() => {
    if (!userId && !isAdmin) return;
    load();
    const interval = setInterval(load, isAdmin ? 30000 : 60000);
    return () => clearInterval(interval);
  }, [userId, isAdmin]);

  const addOrder = async (order) => {
    const { data, error } = await sbOrders.insert(order);
    if (!error && data?.[0]) {
      const updated = [data[0], ...ordersRef.current];
      ordersRef.current = updated;
      setOrders(updated);
    }
    return { data: data?.[0], error };
  };

  const updateOrder = async (orderId, updates, notifText) => {
    const { data, error } = await sbOrders.update(orderId, updates);
    if (!error) {
      const updated = ordersRef.current.map(o => o.id === orderId ? { ...o, ...updates } : o);
      ordersRef.current = updated;
      setOrders(updated);
      if (notifText) {
        const order = ordersRef.current.find(o => o.id === orderId);
        if (order?.user_id) {
          const { data: existing } = await supabase
            .from("notifications")
            .select("id")
            .eq("user_id", order.user_id)
            .eq("order_id", orderId)
            .eq("text", notifText)
            .gte("created_at", new Date(Date.now() - 60000).toISOString());
          if (!existing?.length) {
            await sbNotifs.insert({ user_id: order.user_id, order_id: orderId, text: notifText });
          }
        }
      }
    }
    return { data, error };
  };

  return { orders, loading, addOrder, updateOrder, reload: load };
}
