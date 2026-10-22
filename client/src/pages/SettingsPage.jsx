import { useState } from 'react';
import axios from 'axios';
import {
  Accessibility,
  ArrowLeft,
  Bell,
  Check,
  ChevronRight,
  CircleHelp,
  LockKeyhole,
  Search,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiUrl, getAuthHeaders } from '../utilites/DashboardHelper';
import { registerPushNotifications } from '../notifications/registerPushNotifications';

const sections = [
  { id: 'account', label: 'Your account', summary: 'Account information and profile', icon: UserRound },
  { id: 'privacy', label: 'Privacy and safety', summary: 'Control who can see your profile', icon: LockKeyhole },
  { id: 'notifications', label: 'Notifications', summary: 'Choose how Orbit reaches you', icon: Bell },
  { id: 'accessibility', label: 'Accessibility', summary: 'Motion and display preferences', icon: Accessibility },
  { id: 'about', label: 'About Orbit', summary: 'Help and app information', icon: CircleHelp },
];

function readStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null');
  } catch {
    return null;
  }
}

export default function SettingsPage() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('account');
  const [query, setQuery] = useState('');
  const [user, setUser] = useState(readStoredUser);
  const [privacySaving, setPrivacySaving] = useState(false);
  const [notificationsSaving, setNotificationsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const active = sections.find(section => section.id === activeSection) || sections[0];
  const ActiveIcon = active.icon;
  const filteredSections = sections.filter(section =>
    `${section.label} ${section.summary}`.toLowerCase().includes(query.trim().toLowerCase()),
  );

  const updatePrivacy = async () => {
    if (privacySaving) return;
    setPrivacySaving(true);
    setMessage('');
    try {
      const response = await axios.patch(`${apiUrl}/api/social/privacy`, {
        isPrivate: !user?.isPrivate,
      }, {
        withCredentials: true,
        headers: getAuthHeaders(),
      });
      const updatedUser = { ...user, isPrivate: response.data.isPrivate };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      window.dispatchEvent(new Event('auth:user-updated'));
      setMessage('Privacy settings saved.');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Could not update privacy settings.');
    } finally {
      setPrivacySaving(false);
    }
  };

  const enableNotifications = async () => {
    if (notificationsSaving) return;
    setNotificationsSaving(true);
    setMessage('');
    try {
      await registerPushNotifications();
      setMessage('Push notifications are enabled.');
    } catch (error) {
      setMessage(error.message || 'Could not enable push notifications.');
    } finally {
      setNotificationsSaving(false);
    }
  };

  return (
    <main className="h-screen overflow-y-auto bg-[#111315] text-white">
      <div className="mx-auto min-h-full max-w-5xl border-x border-white/10">
        <header className="sticky top-0 z-20 border-b border-white/10 bg-[#111315]/95 px-4 py-4 backdrop-blur-md sm:px-7">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="grid h-9 w-9 place-items-center rounded-full text-neutral-300 transition hover:bg-white/10 hover:text-white"
              aria-label="Go back"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-cyan-300">Orbit</p>
              <h1 className="text-xl font-bold">Settings</h1>
            </div>
          </div>
        </header>

        <div className="grid min-h-[calc(100vh-73px)] md:grid-cols-[280px_minmax(0,1fr)]">
          <nav aria-label="Settings sections" className="border-b border-white/10 p-3 md:border-b-0 md:border-r md:p-5">
            <label className="relative mb-3 block">
              <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input
                value={query}
                onChange={event => setQuery(event.target.value)}
                placeholder="Search settings"
                className="h-10 w-full border border-white/10 bg-white/[0.04] pl-9 pr-3 text-sm text-white outline-none placeholder:text-neutral-500 focus:border-cyan-400/50"
                aria-label="Search settings"
              />
            </label>
            <div className="flex gap-2 overflow-x-auto md:flex-col md:gap-1">
              {filteredSections.map(section => {
                const Icon = section.icon;
                const selected = section.id === activeSection;
                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => { setActiveSection(section.id); setMessage(''); }}
                    aria-current={selected ? 'page' : undefined}
                    className={`flex min-w-max items-center gap-3 px-3 py-3 text-left transition md:w-full ${selected ? 'bg-white/[0.09] text-white' : 'text-neutral-400 hover:bg-white/[0.05] hover:text-white'}`}
                  >
                    <Icon size={17} className={selected ? 'text-cyan-300' : ''} />
                    <span className="text-sm font-medium">{section.label}</span>
                    <ChevronRight size={15} className="ml-auto hidden text-neutral-600 md:block" />
                  </button>
                );
              })}
              {filteredSections.length === 0 && <p className="px-3 py-4 text-sm text-neutral-500">No matching settings.</p>}
            </div>
          </nav>

          <section className="min-w-0 px-4 py-6 sm:px-7 sm:py-8" aria-labelledby="settings-section-title">
            <div className="mb-7 border-b border-white/10 pb-5">
              <div className="mb-3 grid h-10 w-10 place-items-center border border-cyan-300/20 bg-cyan-300/10 text-cyan-200">
                <ActiveIcon size={19} />
              </div>
              <h2 id="settings-section-title" className="text-2xl font-bold">{active.label}</h2>
              <p className="mt-1 text-sm text-neutral-400">{active.summary}</p>
            </div>

            {activeSection === 'account' && (
              <div>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">Account information</h3>
                <div className="divide-y divide-white/10 border-y border-white/10">
                  <div className="flex items-center justify-between gap-4 py-4">
                    <div className="min-w-0">
                      <p className="text-sm font-medium">Username</p>
                      <p className="mt-1 truncate text-sm text-neutral-400">{user?.username || 'Not set'}</p>
                    </div>
                    <button type="button" onClick={() => navigate('/socialprofile')} className="p-2 text-neutral-400 transition hover:text-white" aria-label="Open your profile">
                      <ChevronRight size={18} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between gap-4 py-4">
                    <div className="min-w-0">
                      <p className="text-sm font-medium">Email</p>
                      <p className="mt-1 truncate text-sm text-neutral-400">{user?.email || 'Not available'}</p>
                    </div>
                    <ShieldCheck size={17} className="shrink-0 text-neutral-500" />
                  </div>
                  <button type="button" onClick={() => navigate('/socialprofile')} className="flex w-full items-center justify-between py-4 text-left text-sm transition hover:text-cyan-200">
                    <span>Manage your profile</span><ChevronRight size={18} className="text-neutral-500" />
                  </button>
                </div>
              </div>
            )}

            {activeSection === 'privacy' && (
              <div>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">Audience and visibility</h3>
                <div className="flex items-center justify-between gap-5 border-y border-white/10 py-5">
                  <div>
                    <p className="text-sm font-semibold">Protect your posts</p>
                    <p className="mt-1 max-w-md text-sm leading-6 text-neutral-400">{user?.isPrivate ? 'Only approved followers can see your posts.' : 'Anyone can see your public posts.'}</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={Boolean(user?.isPrivate)}
                    aria-label="Protect your posts"
                    onClick={updatePrivacy}
                    disabled={privacySaving}
                    className={`relative h-6 w-11 shrink-0 transition-colors disabled:opacity-60 ${user?.isPrivate ? 'bg-cyan-500' : 'bg-neutral-700'}`}
                  >
                    <span className={`absolute top-0.5 grid h-5 w-5 place-items-center bg-white transition-transform ${user?.isPrivate ? 'translate-x-[22px]' : 'translate-x-0.5'}`}>
                      {privacySaving && <span className="h-2.5 w-2.5 animate-spin border border-neutral-500 border-t-transparent" />}
                    </span>
                  </button>
                </div>
                <button type="button" onClick={() => navigate('/socialprofile')} className="flex w-full items-center justify-between border-b border-white/10 py-4 text-left text-sm transition hover:text-cyan-200">
                  <span>Review profile visibility</span><ChevronRight size={18} className="text-neutral-500" />
                </button>
              </div>
            )}

            {activeSection === 'notifications' && (
              <div>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">Push notifications</h3>
                <div className="flex flex-col gap-4 border-y border-white/10 py-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold">Browser notifications</p>
                    <p className="mt-1 max-w-md text-sm leading-6 text-neutral-400">Get Orbit updates on this device. Your browser may ask you to allow notifications.</p>
                  </div>
                  <button type="button" onClick={enableNotifications} disabled={notificationsSaving} className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 bg-cyan-400 px-4 text-sm font-semibold text-black transition hover:bg-cyan-300 disabled:opacity-60">
                    {notificationsSaving ? 'Enabling…' : <><Bell size={16} /> Enable</>}
                  </button>
                </div>
              </div>
            )}

            {activeSection === 'accessibility' && (
              <div className="divide-y divide-white/10 border-y border-white/10">
                <div className="py-4">
                  <p className="text-sm font-medium">Motion</p>
                  <p className="mt-1 text-sm leading-6 text-neutral-400">Orbit respects your device’s reduced-motion preference when available.</p>
                  <p className="mt-2 text-xs text-neutral-500">Current device preference: {window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'Reduced motion' : 'Standard motion'}</p>
                </div>
                <div className="py-4">
                  <p className="text-sm font-medium">Display</p>
                  <p className="mt-1 text-sm leading-6 text-neutral-400">Orbit currently uses its standard dark interface.</p>
                </div>
              </div>
            )}

            {activeSection === 'about' && (
              <div className="divide-y divide-white/10 border-y border-white/10">
                <div className="py-4">
                  <p className="text-sm font-medium">About Orbit</p>
                  <p className="mt-1 text-sm text-neutral-400">Your learning and community space.</p>
                </div>
                <div className="py-4 text-sm text-neutral-400">For account help, contact your Orbit administrator.</div>
              </div>
            )}

            {message && (
              <p role="status" className={`mt-4 flex items-center gap-2 text-sm ${message.includes('Could not') ? 'text-rose-300' : 'text-emerald-300'}`}>
                {!message.includes('Could not') && <Check size={16} />}{message}
              </p>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}