import { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react';
import {
  FaBell,
  FaBook,
  FaBrain,
  FaChartLine,
  FaEllipsisH,
  FaFacebookMessenger,
  FaFlagCheckered,
  FaGraduationCap,
  FaHome,
  FaMedal,
  FaPlus,
  FaRegStar,
  FaSearch,
  FaSignOutAlt,
  FaTimes,
  FaTrophy,
  FaUser,
  FaUserFriends,
  FaUsers
} from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { setMobileMenuOpen } from '../../redux/slices/sideBarSlice';
import axios from 'axios';
import { apiUrl, getAuthHeaders } from '../../utilites/DashboardHelper';
import { setCurrentUser } from '../../redux/slices/dashboardSlice';
import { registerPushNotifications } from '../../notifications/registerPushNotifications';
import { raised } from '../../utilites/cssUtility';
import { ChevronRight, Settings, Users2Icon } from 'lucide-react';

const communityNavItems = [
  { key: 'home', label: 'Home', icon: FaHome, to: '/community', match: ['/community'] },
  { key: 'messages', label: 'Messages', icon: FaFacebookMessenger, to: '/messages', match: ['/messages'] },
  { key: 'askIgris', label: 'Ask Igris', icon: FaBrain, to: '/askIgris', match: ['/askIgris'] },
  { key: 'rememberIgris', label: 'Remember Igris', icon: FaBook, to: '/rememberIgris', match: ['/rememberIgris'] },
  { key: 'search', label: 'Search', icon: FaSearch, to: '/search', match: ['/search'] },
  { key: 'discover', label: 'Discover', icon: FaUserFriends, to: '/discover', match: ['/discover'] },
  { key: 'cosmicDiscovery', label: 'Cosmic Discovery', icon: FaSearch, to: '/cosmic-discovery', match: ['/cosmic-discovery'] },
  { key: 'socialprofile', label: 'Social Profile', icon: FaUser, to: '/socialprofile', match: ['/socialprofile'] },
];

const lmsNavItems = [
  { key: 'dashboard', label: 'Dashboard', icon: FaRegStar, to: '/dashboard', match: ['/dashboard'] },
  { key: 'learn', label: 'Learn', icon: FaGraduationCap, to: '/learn', match: ['/learn', '/levels', '/language'] },
  { key: 'challenges', label: 'Challenges', icon: FaFlagCheckered, to: '/challenges', match: ['/challenges'] },
  { key: 'leaderboards', label: 'Leaderboards', icon: FaTrophy, to: '/leaderboard', match: ['/leaderboard'] },
  { key: 'profile', label: 'Profile', icon: FaMedal, to: '/profile', match: ['/profile'] },
  { key: 'progress', label: 'Progress', icon: FaChartLine, to: '/progress', match: ['/progress'] },
];

const MODES = ['Social', 'Professional', 'Private'];

function SidebarItem({ item, isActive, collapsed, onClick, iconOnly = false }) {
  const Icon = item.icon;

  return (
    <button
      type="button"
      title={item.label}
      onClick={() => onClick(item.to)}
      className={`w-full rounded-lg transition border text-[#cdcdcd] ${isActive ? 'bg-[#414141] border-[#414141]' : 'border-transparent hover:bg-[#4f4f4f]'
        } ${iconOnly || collapsed
          ? 'h-10 flex items-center justify-center'
          : 'h-10 px-3 flex items-center gap-3 text-sm font-semibold'
        }`}
    >
      <Icon className="text-sm" />
      {iconOnly || collapsed ? null : <span>{item.label}</span>}
    </button>
  );
}

/*  Glass styling tokens */
// Every icon eases between states instead of snapping.
const ICON_BASE =
  '[&_svg]:transition-[filter,transform,opacity] [&_svg]:duration-300 [&_svg]:ease-out motion-reduce:[&_svg]:transition-none';

// Inactive: slightly frosted, like it sits behind the glass. Hover "wipes" it a little clearer.
const ICON_IDLE =
  '[&_svg]:blur-[0.7px] [&_svg]:opacity-60 hover:[&_svg]:blur-[0.25px] hover:[&_svg]:opacity-90';

// Active: crisp, a touch bigger, with a faint cyan glow.
const ICON_ACTIVE =
  '[&_svg]:scale-[1.30] [&_svg]:opacity-100 [&_svg]:drop-shadow-[0_0_6px_rgba(34,211,238,0.45)]';

const GLASS_BTN =
  'text-white gap-3 flex justify-center w-full items-center text-center p-2 rounded-3xl cursor-pointer border backdrop-blur-md transition-colors duration-200';

/* ------------------------------------------------------------------ */
/*  NavList – renders the items + ONE shared sliding glass pill        */
/* ------------------------------------------------------------------ */

function NavList({
  items,
  isActiveItem,
  onNavigate,
  collapsed = false,
  iconOnly = false,
  keyPrefix = '',
}) {
  const listRef = useRef(null);
  const itemRefs = useRef([]);
  const [pill, setPill] = useState({ top: 0, height: 0, visible: false });
  // Skip the transition on first paint so the pill doesn't fly in from the top.
  const [animate, setAnimate] = useState(false);

  const activeIndex = items.findIndex(isActiveItem);

  const measure = useCallback(() => {
    const el = itemRefs.current[activeIndex];
    if (!el) {
      setPill((p) => (p.visible ? { ...p, visible: false } : p));
      return;
    }
    const next = { top: el.offsetTop, height: el.offsetHeight, visible: true };
    setPill((p) =>
      p.top === next.top && p.height === next.height && p.visible ? p : next
    );
  }, [activeIndex]);

  // Re-measure whenever the active tab, item set, or collapsed state changes.
  useLayoutEffect(() => {
    measure();
  }, [measure, items, collapsed]);

  // Re-measure if the list itself resizes (sidebar expanding, labels wrapping, etc.).
  useEffect(() => {
    if (!listRef.current || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(measure);
    ro.observe(listRef.current);
    return () => ro.disconnect();
  }, [measure]);

  useEffect(() => {
    const id = requestAnimationFrame(() => setAnimate(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div ref={listRef} className="relative flex flex-col gap-1">
      {/* The sliding glass pill */}
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute inset-x-0 top-0 z-0 rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.07] via-white/[0.03] to-black/30 backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.18),inset_0_-6px_10px_rgba(0,0,0,0.5),0_10px_18px_-4px_rgba(0,0,0,0.55),0_0_0_1px_rgba(0,0,0,0.25),0_0_20px_rgba(34,211,238,0.22)] motion-reduce:transition-none ${animate
          ? 'transition-[transform,height,opacity] duration-[350ms] ease-[cubic-bezier(0.34,1.35,0.64,1)]'
          : ''
          }`}
        style={{
          transform: `translateY(${pill.top}px)`,
          height: pill.height,
          opacity: pill.visible ? 1 : 0,
        }}
      />

      {items.map((item, i) => {
        const active = i === activeIndex;
        return (
          <div
            key={`${keyPrefix}${item.key}`}
            ref={(el) => {
              itemRefs.current[i] = el;
            }}
            className={`relative z-10 ${ICON_BASE} ${active ? ICON_ACTIVE : ICON_IDLE}`}
          >
            <SidebarItem
              item={item}
              isActive={active}
              collapsed={collapsed}
              onClick={onNavigate}
              iconOnly={iconOnly}
            />
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  AppSidebar                                                         */
/* ------------------------------------------------------------------ */

export default function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isMobileMenuOpen = useSelector((state) => state.sideBar.isMobileMenuOpen);
  const currentUser = useSelector((state) => state.dashboard.currentUser);

  // Personality mode
  const [activeMode, setActiveMode] = useState('Social');
  const [isOpen, setIsOpen] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const containerRef = useRef(null);
  const lastTouchPosition = useRef(null);

  useEffect(() => {
    const handleWheel = (event) => {
      if (Math.abs(event.deltaY) < 8) return;
      setIsHeaderVisible(event.deltaY < 0);
    };

    const handleTouchStart = (event) => {
      lastTouchPosition.current = event.touches[0]?.clientY ?? null;
    };

    const handleTouchMove = (event) => {
      const touchPosition = event.touches[0]?.clientY;
      if (touchPosition == null || lastTouchPosition.current == null) return;

      const scrollIntent = lastTouchPosition.current - touchPosition;
      if (Math.abs(scrollIntent) >= 8) {
        setIsHeaderVisible(scrollIntent < 0);
        lastTouchPosition.current = touchPosition;
      }
    };

    const clearTouchPosition = () => {
      lastTouchPosition.current = null;
    };

    document.addEventListener('wheel', handleWheel, { passive: true });
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', clearTouchPosition, { passive: true });
    document.addEventListener('touchcancel', clearTouchPosition, { passive: true });
    return () => {
      document.removeEventListener('wheel', handleWheel);
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', clearTouchPosition);
      document.removeEventListener('touchcancel', clearTouchPosition);
    };
  }, []);

  // closes the menu on outside tap/click — needed for mobile since there's no "mouse leave"
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, []);

  const handleSelect = (mode) => {
    setActiveMode(mode);
    setIsOpen(false);
  };

  const handleLogout = async () => {
    try {
      await axios.get(`${apiUrl}/api/auth/user/logout`, {
        withCredentials: true,
        headers: getAuthHeaders(),
      });
    } catch {
      // Continue local cleanup even if API request fails.
    }

    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
    window.dispatchEvent(new Event('auth:user-updated'));
    navigate('/login');
  };

  const handleNavigate = (to) => {
    dispatch(setMobileMenuOpen(false));
    setIsHeaderVisible(true);
    navigate(to);
  };

  const handleEnableNotifications = async () => {
    try {
      await registerPushNotifications();
      window.alert('Notifications enabled');
    } catch (error) {
      console.error('Failed to enable notifications:', error);
      window.alert(error.message || 'Unable to enable notifications');
    }
  };

  const isActiveItem = (item) =>
    item.match.some((routePrefix) => location.pathname.startsWith(routePrefix));

  const [dashboardMode, setDashboardMode] = useState(
    localStorage.getItem('dashboardMode') || 'community'
  );
  useEffect(() => {
    const syncMode = () =>
      setDashboardMode(localStorage.getItem('dashboardMode') || 'community');

    window.addEventListener('storage', syncMode);
    window.addEventListener('dashboardModeChanged', syncMode); // custom event for same tab
    return () => {
      window.removeEventListener('storage', syncMode);
      window.removeEventListener('dashboardModeChanged', syncMode);
    };
  }, []);
  const navItems = dashboardMode === 'community' ? communityNavItems : lmsNavItems;
  const pageLabel = [...communityNavItems, ...lmsNavItems].find(isActiveItem)?.label ?? 'Orbit';

  return (
    <>
      <div className={`relative z-40 w-full shrink-0 overflow-hidden transition-[height] duration-200 ease-out motion-reduce:transition-none ${isHeaderVisible ? 'h-14' : 'h-0'}`}>
        <header
          className={`app-topbar flex h-14 w-full items-center gap-3 border-b border-white/[0.06] bg-black/75 px-4 backdrop-blur-xl transition-transform duration-200 ease-out motion-reduce:transition-none ${isHeaderVisible ? 'translate-y-0' : '-translate-y-full pointer-events-none'}`}
        >
          <button
            type="button"
            onClick={() => dispatch(setMobileMenuOpen(true))}
            aria-label="Open navigation menu"
            aria-expanded={isMobileMenuOpen}
            aria-controls="orbit-navigation-drawer"
            className={`grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full p-[3px] text-sm font-semibold text-white transition duration-200 active:scale-95 focus-visible:outline-2 focus-visible:outline-white/60 ${raised}`}
          >
            {currentUser?.profilePic ? (
              <img src={currentUser.profilePic} alt="" className="h-full w-full rounded-full object-cover" />
            ) : (
              currentUser?.username?.charAt(0)?.toUpperCase() || <FaUser aria-hidden="true" />
            )}
          </button>
          <div className={`min-w-0 leading-tight ${location.pathname === '/search' ? 'hidden' : ''}`}>
            <p className="text-base font-semibold tracking-tight text-neutral-100">Orb8</p>
            <p className="truncate text-[11px] font-light text-neutral-500">{pageLabel}</p>
          </div>
        </header>
      </div>

          {isMobileMenuOpen && (
            <div className="fixed inset-0 z-50">
              <button
                type="button"
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={() => dispatch(setMobileMenuOpen(false))}
                aria-label="Close navigation menu"
              />
              <aside
                id="orbit-navigation-drawer"
                className="absolute inset-y-0 left-0 flex w-[min(20rem,calc(100vw-2.5rem))] flex-col border-r border-white/10 bg-[#090909]/95 p-4 shadow-2xl backdrop-blur-2xl"
                aria-label="Main navigation"
              >
                <div className="mb-6 flex items-center justify-between gap-3 border-b border-white/10 pb-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full border border-white/15 bg-white/10 text-sm font-semibold text-white">
                      {currentUser?.profilePic ? <img src={currentUser.profilePic} alt="" className="h-full w-full object-cover" /> : currentUser?.username?.charAt(0)?.toUpperCase() || <FaUser aria-hidden="true" />}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-white">{currentUser?.username || 'Orb8'}</span>
                      <span className="block text-xs text-neutral-500">Navigation</span>
                    </span>
                  </div>
                  <button type="button" onClick={() => dispatch(setMobileMenuOpen(false))} className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-neutral-400 transition hover:bg-white/10 hover:text-white" aria-label="Close navigation menu"><FaTimes /></button>
                </div>

                <div ref={containerRef} className="relative mb-4">
                  <button type="button" onClick={() => setIsOpen((previous) => !previous)} aria-expanded={isOpen} className="flex min-h-10 w-full items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-3 text-sm text-neutral-200 transition hover:bg-white/[0.08]">
                    <span>{activeMode}</span><ChevronRight size={18} className={`transition-transform ${isOpen ? 'rotate-90' : ''}`} />
                  </button>
                  {isOpen && <div className="absolute inset-x-0 top-full z-20 mt-1 overflow-hidden rounded-xl border border-white/10 bg-[#111111] shadow-xl">{MODES.map((mode) => <button key={mode} type="button" onClick={() => handleSelect(mode)} className={`w-full px-3 py-2.5 text-left text-sm transition ${activeMode === mode ? 'bg-white/10 text-white' : 'text-neutral-400 hover:bg-white/5 hover:text-white'}`}>{mode}</button>)}</div>}
                </div>

                <nav className="min-h-0 flex-1 overflow-y-auto" aria-label="Pages">
                  <NavList items={navItems} isActiveItem={isActiveItem} collapsed={false} onNavigate={handleNavigate} keyPrefix="drawer-" />
                </nav>

                <div className="mt-4 border-t border-white/10 pt-4">
                  <button type="button" onClick={handleEnableNotifications} className={`${GLASS_BTN} mb-2 border-white/10 bg-white/[0.04] hover:bg-white/10`}><span className="py-2"><FaBell /></span><span>Notifications</span></button>
                  <button type="button" onClick={() => handleNavigate('/settings')} className={`${GLASS_BTN} mb-2 border-white/10 bg-white/[0.04] hover:bg-white/10`}><span className="py-2"><Settings /></span><span>Settings</span></button>
                  <button type="button" onClick={handleLogout} className={`${GLASS_BTN} border-white/10 bg-white/[0.04] hover:bg-white/10`}><span className="py-2"><FaSignOutAlt /></span><span>Log out</span></button>
                </div>
              </aside>
            </div>
      )}
    </>
  );
}