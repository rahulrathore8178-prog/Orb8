import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { apiUrl, getAuthHeaders } from '../../utilites/DashboardHelper';

const NEW_ACCOUNT_DAYS = 7;

const readUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null');
  } catch {
    return null;
  }
};

const flagKey = (user) => `orbit:onboarded:${user?.id}`;

const shouldShow = () => {
  const user = readUser();
  if (!user?.id || !user.createdAt || localStorage.getItem(flagKey(user)) === '1') return false;
  return Date.now() - new Date(user.createdAt).getTime() < NEW_ACCOUNT_DAYS * 86400000;
};

const AUDIENCES = [
  { value: true, title: 'Friends only', detail: 'Only people you connect with can see your posts.' },
  { value: false, title: 'Everyone', detail: 'Anyone on Orb8 can see your posts and find you.' },
];

export default function OnboardingDialog() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(shouldShow);
  const [step, setStep] = useState(0);
  const [isPrivate, setIsPrivate] = useState(() => readUser()?.isPrivate ?? true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const finish = (destination) => {
    const user = readUser();
    if (user?.id) localStorage.setItem(flagKey(user), '1');
    setOpen(false);
    if (destination) navigate(destination);
  };

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') finish();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  if (!open) return null;

  const saveAudience = async () => {
    setSaving(true);
    setError('');
    try {
      await axios.patch(`${apiUrl}/api/social/privacy`, { isPrivate }, { withCredentials: true, headers: getAuthHeaders() });
      const user = readUser();
      if (user) localStorage.setItem('user', JSON.stringify({ ...user, isPrivate }));
      setStep(1);
    } catch {
      setError('We could not save that. You can change it later in Settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-black/80 p-4 backdrop-blur-sm">
      <div role="dialog" aria-modal="true" aria-labelledby="onboarding-title" className="w-full max-w-sm rounded-3xl border border-white/10 bg-[#0c0c0c] p-6 shadow-2xl">
        <p className="text-xs text-neutral-400">Step {step + 1} of 2</p>

        {step === 0 ? (
          <>
            <h2 id="onboarding-title" className="mt-1 text-xl font-semibold text-neutral-100">Welcome to Orb8</h2>
            <p className="mt-2 text-sm text-neutral-400">Who can see your posts?</p>
            <div role="radiogroup" aria-label="Who can see your posts" className="mt-4 space-y-2">
              {AUDIENCES.map((option) => (
                <button
                  key={String(option.value)}
                  type="button"
                  role="radio"
                  aria-checked={isPrivate === option.value}
                  onClick={() => setIsPrivate(option.value)}
                  className={`block min-h-14 w-full rounded-2xl border px-4 py-3 text-left transition focus-visible:outline-2 focus-visible:outline-white/60 ${isPrivate === option.value ? 'border-white/60 bg-white/10' : 'border-white/10 hover:bg-white/5'}`}
                >
                  <span className="block text-sm font-medium text-neutral-100">{option.title}</span>
                  <span className="mt-0.5 block text-xs text-neutral-400">{option.detail}</span>
                </button>
              ))}
            </div>
            {error && <p role="alert" className="mt-3 text-sm text-rose-300">{error}</p>}
            <div className="mt-5 flex items-center justify-between gap-3">
              <button type="button" onClick={() => finish()} className="min-h-11 px-2 text-sm text-neutral-400 hover:text-neutral-200">
                Skip for now
              </button>
              <button
                type="button"
                onClick={saveAudience}
                disabled={saving}
                autoFocus
                className="min-h-11 rounded-full bg-neutral-100 px-6 text-sm font-semibold text-black disabled:opacity-60"
              >
                {saving ? 'Saving...' : 'Continue'}
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 id="onboarding-title" className="mt-1 text-xl font-semibold text-neutral-100">Find your people</h2>
            <p className="mt-2 text-sm text-neutral-400">Your feed fills up with posts from the friends you connect with. Search for someone you know to get started.</p>
            <div className="mt-5 flex items-center justify-between gap-3">
              <button type="button" onClick={() => finish()} className="min-h-11 px-2 text-sm text-neutral-400 hover:text-neutral-200">
                Maybe later
              </button>
              <button
                type="button"
                onClick={() => finish('/explore?tab=search')}
                autoFocus
                className="min-h-11 rounded-full bg-neutral-100 px-6 text-sm font-semibold text-black"
              >
                Find people
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
