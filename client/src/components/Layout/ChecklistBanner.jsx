import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { apiUrl, getAuthHeaders } from '../../utilites/DashboardHelper';

const dismissKey = () => {
  try {
    return `orbit:checklist-dismissed:${JSON.parse(localStorage.getItem('user') || '{}').id}`;
  } catch {
    return 'orbit:checklist-dismissed';
  }
};

export default function ChecklistBanner() {
  const navigate = useNavigate();
  const [checklist, setChecklist] = useState(null);
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(dismissKey()) === '1');

  useEffect(() => {
    if (dismissed) return undefined;
    let active = true;
    axios
      .get(`${apiUrl}/api/auth/user/checklist`, { withCredentials: true, headers: getAuthHeaders() })
      .then((response) => {
        if (active) setChecklist(response.data);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [dismissed]);

  if (dismissed || !checklist || checklist.daysLeft <= 0 || checklist.completed >= checklist.total) return null;

  const percent = Math.round((checklist.completed / checklist.total) * 100);

  const hide = () => {
    localStorage.setItem(dismissKey(), '1');
    setDismissed(true);
  };

  return (
    <div className="shrink-0 border-b border-white/[0.06] bg-black/50 px-4">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex min-h-11 w-full items-center gap-3 text-left focus-visible:outline-2 focus-visible:outline-white/50"
      >
        <span className="text-sm font-medium text-neutral-100">Get started</span>
        <span className="text-xs text-neutral-400">{checklist.completed} of {checklist.total} done</span>
        <span className="ml-auto h-1.5 w-20 overflow-hidden rounded-full bg-white/10" aria-hidden="true">
          <span className="block h-full rounded-full bg-neutral-200" style={{ width: `${percent}%` }} />
        </span>
      </button>

      {open && (
        <div className="pb-3">
          <ul className="divide-y divide-white/[0.06]">
            {checklist.items.map((item) => (
              <li key={item.key} className="flex min-h-11 items-center gap-3 py-1">
                <span
                  aria-hidden="true"
                  className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border text-xs ${item.done ? 'border-emerald-300/60 bg-emerald-300/20 text-emerald-200' : 'border-white/20 text-transparent'}`}
                >
                  ✓
                </span>
                <span className={`flex-1 text-sm ${item.done ? 'text-neutral-500 line-through' : 'text-neutral-200'}`}>
                  {item.label}
                  {item.done && <span className="sr-only"> (done)</span>}
                </span>
                {!item.done && (
                  <button
                    type="button"
                    onClick={() => navigate(item.to)}
                    className="min-h-11 rounded-full border border-white/15 px-4 text-sm text-neutral-100 transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-white/50"
                  >
                    Do it
                  </button>
                )}
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={hide}
            className="mt-1 min-h-11 text-sm text-neutral-400 underline-offset-2 hover:text-neutral-200 hover:underline"
          >
            Hide this checklist
          </button>
        </div>
      )}
    </div>
  );
}
