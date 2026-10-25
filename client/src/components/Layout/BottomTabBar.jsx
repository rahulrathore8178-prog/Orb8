import { FaFacebookMessenger, FaHome, FaPlus, FaSearch, FaUser } from 'react-icons/fa';
import { useLocation, useNavigate } from 'react-router-dom';
import { raised } from '../../utilites/cssUtility';
import { useUnreadMessages } from '../../utilites/useUnreadMessages';

const TABS = [
  { key: 'home', label: 'Home', icon: FaHome, to: '/community', match: ['/community'] },
  { key: 'explore', label: 'Explore', icon: FaSearch, to: '/explore', match: ['/explore'] },
  { key: 'create', label: 'Create', icon: FaPlus, to: '/community?compose=1', match: [] },
  { key: 'messages', label: 'Messages', icon: FaFacebookMessenger, to: '/messages', match: ['/messages'] },
  { key: 'profile', label: 'Profile', icon: FaUser, to: '/profile', match: ['/profile', '/socialprofile'] },
];

export default function BottomTabBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const unreadMessages = useUnreadMessages();

  return (
    <div className="relative z-20 shrink-0 px-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 md:hidden">
      <nav
        aria-label="Primary"
        className="rounded-[30px] border border-white/10 bg-white/[0.045] p-1.5 shadow-[0_24px_70px_rgba(0,0,0,0.95),inset_0_1px_0_rgba(255,255,255,0.09)] backdrop-blur-2xl"
      >
        <div className="grid grid-cols-5 items-center gap-0.5 rounded-[24px] bg-[#050505] p-1 shadow-[inset_5px_5px_12px_rgba(0,0,0,0.95),inset_-3px_-3px_9px_rgba(255,255,255,0.045)]">
          {TABS.map(({ key, label, icon: Icon, to, match }) => {
            const isActive = match.some((prefix) => location.pathname.startsWith(prefix));
            const isCreate = key === 'create';
            return (
              <button
                key={key}
                type="button"
                onClick={() => navigate(to)}
                aria-current={isActive ? 'page' : undefined}
                className={`flex min-h-16 flex-col items-center justify-center rounded-[20px] transition duration-200 active:scale-95 focus-visible:outline-2 focus-visible:outline-white/50 ${isActive ? `${raised} text-white` : 'text-neutral-500 hover:text-neutral-200'}`}
              >
                {isCreate ? (
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-neutral-100 text-black shadow-[0_0_18px_rgba(255,255,255,0.18)]" aria-hidden="true">
                    <Icon size={13} />
                  </span>
                ) : (
                  <span className="relative grid h-8 w-8 place-items-center" aria-hidden="true">
                    <Icon size={17} />
                    {key === 'messages' && unreadMessages > 0 && (
                      <span className="absolute right-0.5 top-0.5 h-2.5 w-2.5 rounded-full bg-rose-400 ring-2 ring-[#050505]" />
                    )}
                  </span>
                )}
                <span className="text-xs">{label}{key === 'messages' && unreadMessages > 0 && <span className="sr-only">, {unreadMessages} unread</span>}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
