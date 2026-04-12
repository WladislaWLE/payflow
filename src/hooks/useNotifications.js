// src/hooks/useNotifications.js
import { useState, useEffect } from "react";
import { notifications as sbNotifs } from "../lib/supabase";

export function useNotifications(userId) {
  const [notifs, setNotifs] = useState([]);

  const load = async () => {
    if (!userId) return;
    const { data } = await sbNotifs.getByUser(userId);
    setNotifs(data || []);
  };

  useEffect(() => {
    load();
    if (!userId) return;
    const interval = setInterval(load, 60000);
    return () => clearInterval(interval);
  }, [userId]);

  const markRead = async () => {
    await sbNotifs.markRead(userId);
    setNotifs(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const unread = notifs.filter(n => !n.is_read).length;
  return { notifs, unread, markRead, reload: load };
}
