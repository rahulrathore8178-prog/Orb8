import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { apiUrl, getAuthHeaders } from './DashboardHelper';

export const NOTIFICATIONS_CHANGED = 'notifications:changed';
const POLL_MS = 60 * 1000;

export function useUnreadNotifications() {
  const [unreadCount, setUnreadCount] = useState(0);

  const refresh = useCallback(async () => {
    if (!localStorage.getItem('token') || document.hidden) return;
    try {
      const response = await axios.get(`${apiUrl}/api/auth/user/notifications`, {
        withCredentials: true,
        headers: getAuthHeaders(),
      });
      setUnreadCount(response.data?.unreadCount ?? 0);
    } catch {
      // A failed poll should never surface to the user; the next one retries.
    }
  }, []);

  useEffect(() => {
    refresh();
    const timer = setInterval(refresh, POLL_MS);
    window.addEventListener(NOTIFICATIONS_CHANGED, refresh);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      clearInterval(timer);
      window.removeEventListener(NOTIFICATIONS_CHANGED, refresh);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, [refresh]);

  return unreadCount;
}
