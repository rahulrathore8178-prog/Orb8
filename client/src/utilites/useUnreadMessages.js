import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { apiUrl, getAuthHeaders } from './DashboardHelper';

export const MESSAGES_CHANGED = 'messages:changed';
const POLL_MS = 60 * 1000;

export function useUnreadMessages() {
  const [unreadCount, setUnreadCount] = useState(0);

  const refresh = useCallback(async () => {
    if (!localStorage.getItem('token') || document.hidden) return;
    try {
      const response = await axios.get(`${apiUrl}/api/chat/unread`, {
        withCredentials: true,
        headers: getAuthHeaders(),
      });
      setUnreadCount(response.data?.total ?? 0);
    } catch {
      // The next poll retries; a failed badge refresh should stay silent.
    }
  }, []);

  useEffect(() => {
    refresh();
    const timer = setInterval(refresh, POLL_MS);
    window.addEventListener(MESSAGES_CHANGED, refresh);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      clearInterval(timer);
      window.removeEventListener(MESSAGES_CHANGED, refresh);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, [refresh]);

  return unreadCount;
}
