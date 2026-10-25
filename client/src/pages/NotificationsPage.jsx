import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { apiUrl, getAuthHeaders } from '../utilites/DashboardHelper';
import { NOTIFICATIONS_CHANGED } from '../utilites/useUnreadNotifications';

function timeAgo(value) {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 1000));
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(value).toLocaleDateString();
}

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('loading');

  const request = useCallback(
    (method, path) =>
      axios({ method, url: `${apiUrl}/api/auth/user/notifications${path}`, withCredentials: true, headers: getAuthHeaders() }),
    [],
  );

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const response = await request('get', '');
      setItems(response.data?.notifications ?? []);
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  }, [request]);

  useEffect(() => {
    load();
  }, [load]);

  const markRead = async (item) => {
    if (item.isRead) return;
    setItems((current) => current.map((entry) => (entry._id === item._id ? { ...entry, isRead: true } : entry)));
    try {
      await request('patch', `/${item._id}/read`);
      window.dispatchEvent(new Event(NOTIFICATIONS_CHANGED));
    } catch {
      setItems((current) => current.map((entry) => (entry._id === item._id ? { ...entry, isRead: false } : entry)));
    }
  };

  const markAllRead = async () => {
    const previous = items;
    setItems((current) => current.map((entry) => ({ ...entry, isRead: true })));
    try {
      await request('patch', '/read-all');
      window.dispatchEvent(new Event(NOTIFICATIONS_CHANGED));
    } catch {
      setItems(previous);
    }
  };

  const hasUnread = items.some((item) => !item.isRead);

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-8 sm:py-10">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-light tracking-tight text-neutral-100">Notifications</h1>
        {hasUnread && (
          <button
            type="button"
            onClick={markAllRead}
            className="min-h-11 rounded-full border border-white/10 px-4 text-sm text-neutral-200 transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-white/50"
          >
            Mark all as read
          </button>
        )}
      </div>

      {status === 'loading' && (
        <ul aria-busy="true" className="space-y-2">
          {[0, 1, 2, 3].map((row) => (
            <li key={row} className="h-16 animate-pulse rounded-2xl bg-white/[0.05]" />
          ))}
        </ul>
      )}

      {status === 'error' && (
        <div role="alert" className="flex flex-col items-center gap-3 py-16 text-center">
          <p className="text-sm text-neutral-300">We could not load your notifications.</p>
          <button type="button" onClick={load} className="min-h-11 rounded-full bg-neutral-100 px-5 text-sm font-semibold text-black">
            Try again
          </button>
        </div>
      )}

      {status === 'ready' && items.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <p className="text-base text-neutral-200">You are all caught up</p>
          <p className="max-w-xs text-sm text-neutral-400">Likes, comments and friend requests will show up here.</p>
          <button
            type="button"
            onClick={() => navigate('/explore?tab=search')}
            className="mt-2 min-h-11 rounded-full bg-neutral-100 px-5 text-sm font-semibold text-black"
          >
            Find people
          </button>
        </div>
      )}

      {status === 'ready' && items.length > 0 && (
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item._id}>
              <button
                type="button"
                onClick={() => markRead(item)}
                className={`flex min-h-16 w-full items-start gap-3 rounded-2xl border px-4 py-3 text-left transition focus-visible:outline-2 focus-visible:outline-white/50 ${item.isRead ? 'border-white/[0.06] bg-white/[0.02]' : 'border-white/15 bg-white/[0.06]'}`}
              >
                <span
                  aria-hidden="true"
                  className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${item.isRead ? 'bg-transparent' : 'bg-rose-400'}`}
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-neutral-100">{item.title}</span>
                  {item.detail && <span className="mt-0.5 block text-sm text-neutral-400">{item.detail}</span>}
                  <span className="mt-1 block text-xs text-neutral-500">
                    {timeAgo(item.createdAt)}
                    {!item.isRead && <span className="sr-only"> (unread)</span>}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
