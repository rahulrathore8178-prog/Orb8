import { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react';
import {
  FaBars,
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
import { setDesktopCollapsed, setMobileMenuOpen } from '../../redux/slices/sideBarSlice';
import axios from 'axios';
import { apiUrl, getAuthHeaders } from '../../utilites/DashboardHelper';
import { setCurrentUser } from '../../redux/slices/dashboardSlice';
import { registerPushNotifications } from '../../notifications/registerPushNotifications';
import { ChevronRight, Settings, Users2Icon } from 'lucide-react';

const communityNavItems = [
  { key: 'home', label: 'Home', icon: FaHome, to: '/community', match: ['/community'] },
  { key: 'messages', label: 'Messages', icon: FaFacebookMessenger, to: '/messages', match: ['/messages'] },
  { key: 'askIgris', label: 'Ask Igris', icon: FaBrain, to: '/askIgris', match: ['/askIgris'] },
  { key: 'rememberIgris', label: 'Remember Igris', icon: FaBook, to: '/rememberIgris', match: ['/rememberIgris'] },
  { key: 'search', label: 'Search', icon: FaSearch, to: '/search', match: ['/search'] },
  { key: 'discover', label: 'Discover', icon: FaUserFriends, to: '/discover', match: ['/discover'] },
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
  const isDesktopCollapsed = useSelector((state) => state.sideBar.isDesktopCollapsed);
  const isMobileMenuOpen = useSelector((state) => state.sideBar.isMobileMenuOpen);

  // Personality mode
  const [activeMode, setActiveMode] = useState('Social');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

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

  return (
    <>
      {/* ───────────────────────── Desktop ───────────────────────── */}
      <aside className="hidden z-10 bg-black min-h-screen lg:block shrink-0">
        <div
          onMouseEnter={() => dispatch(setDesktopCollapsed(false))}
          onMouseLeave={() => { dispatch(setDesktopCollapsed(true)); setIsOpen(false); }}
          className={`sticky z-10 top-0 flex flex-col h-[95vh] mt-5 justify-between bg-[#2B2B2B] border-r border-white/10 py-4 rounded-2xl ml-4 transition-[width,padding] duration-200 ease-in-out will-change-[width] ${isDesktopCollapsed ? 'w-20  px-2' : 'w-45 px-2'
            }`}
        >
          <nav className="space-y-1">
            {isDesktopCollapsed === false && (
              <div ref={containerRef} className="relative mb-5 w-full">
                <button
                  onClick={() => setIsOpen((prev) => !prev)}
                  className="flex items-center justify-center gap-2 py-1 px-3 rounded-xl w-full text-white bg-white/10 hover:bg-white/15 active:bg-white/20 border border-white/15 backdrop-blur-md transition-colors duration-200"
                >
                  <span>{activeMode}</span>
                  <span className={`transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}>
                    <ChevronRight size={18} />
                  </span>
                </button>

                <div
                  className={`absolute left-0 right-0 top-full mt-1.5 rounded-xl bg-[#2B2B2B] border border-white/15 overflow-hidden z-50 origin-top shadow-lg transition-all duration-200 ease-out ${isOpen
                    ? 'opacity-100 scale-y-100 translate-y-0 pointer-events-auto'
                    : 'opacity-0 scale-y-95 -translate-y-1 pointer-events-none'
                    }`}
                >
                  {MODES.map((mode) => (
                    <button
                      key={mode}
                      onClick={() => handleSelect(mode)}
                      className={`w-full text-left px-3 py-2 text-sm transition-colors duration-150 ${activeMode === mode
                        ? 'bg-white/15 text-white font-medium'
                        : 'text-gray-200 hover:bg-white/10'
                        }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <NavList
              items={navItems}
              isActiveItem={isActiveItem}
              collapsed={isDesktopCollapsed}
              onNavigate={handleNavigate}
            />
          </nav>

          <div>
            <button
              onClick={handleEnableNotifications}
              className={`${GLASS_BTN} mb-2 bg-cyan-500/15 border-cyan-400/25 hover:bg-cyan-500/25`}
            >
              <span className="py-2"><FaBell /></span>
              {!isDesktopCollapsed && <span>Notifications</span>}
            </button>

            {/* settings */}
            <button
              type="button"
              onClick={() => handleNavigate('/settings')}
              title="Settings"
              className={`${GLASS_BTN} mb-2 bg-white/5 border-white/10 hover:bg-white/10`}
            >
              <span className="py-2"><Settings /></span>
              {!isDesktopCollapsed && <span>Settings</span>}
            </button>

            {/* Log Out */}
            <button
              onClick={handleLogout}
              className={`${GLASS_BTN} bg-red-500/15 border-red-400/25 hover:bg-red-500/25`}
            >
              <span className="py-2"><FaSignOutAlt /></span>
              {!isDesktopCollapsed && <span>Log-out</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* ─────────────────────── Mobile icon rail ─────────────────────── */}
      <aside className="fixed inset-y-0 left-0 z-30 w-10 lg:hidden bg-[#2B2B2B] border-r border-white/10">
        <div className="h-full min-h-screen py-3 px-1 flex flex-col gap-2 items-center">
          <button
            type="button"
            onClick={() => dispatch(setMobileMenuOpen(true))}
            className="h-10 w-10 rounded-lg text-[#A0A0A0] hover:bg-white/10 transition grid place-items-center"
            aria-label="Open sidebar menu"
            title="Open menu"
          >
            <FaBars />
          </button>

          <div className="flex flex-col justify-between">
            <NavList
              items={navItems}
              isActiveItem={isActiveItem}
              collapsed={false}
              onNavigate={handleNavigate}
              iconOnly
              keyPrefix="rail-"
            />

            <div>
              {/* Log Out — icon only, the rail is too narrow for a label */}
              <button
                onClick={handleLogout}
                aria-label="Log out"
                className={`${GLASS_BTN} bg-red-500/15 border-red-400/25 hover:bg-red-500/25`}
              >
                <span className="py-2"><FaSignOutAlt /></span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* ───────────────────────── Mobile drawer ───────────────────────── */}
      {isMobileMenuOpen ? (
        <div className="fixed top-16 left-0 right-0 bottom-0 z-40 lg:hidden">
          <button
            type="button"
            className="absolute min-h-screen inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => dispatch(setMobileMenuOpen(false))}
            aria-label="Close sidebar menu backdrop"
          />

          <div className="absolute bottom-0.5 min-h-screen h-full w-50 bg-[#2B2B2B] border-r border-white/10 p-3 shadow-2xl">
            <div className="flex items-center justify-between mb-5 px-1">
              <div className="text-xl font-extrabold text-cyan-400">Orbit</div>
              <button
                type="button"
                onClick={() => dispatch(setMobileMenuOpen(false))}
                className="h-9 w-9 rounded-lg text-[#A0A0A0] hover:bg-white/10 transition grid place-items-center"
                aria-label="Close sidebar menu"
              >
                <FaTimes />
              </button>
            </div>
            <div className="flex flex-col justify-between">
              <nav>
                <NavList
                  items={navItems}
                  isActiveItem={isActiveItem}
                  collapsed={false}
                  onNavigate={handleNavigate}
                  keyPrefix="mobile-"
                />
              </nav>

              <div>
                <button
                  onClick={handleEnableNotifications}
                  className={`${GLASS_BTN} mb-2 bg-cyan-500/15 border-cyan-400/25 hover:bg-cyan-500/25`}
                >
                  <span className="py-2"><FaBell /></span>
                  <span>Notifications</span>
                </button>

<<<<<<< HEAD
=======
                <button
                  type="button"
                  onClick={() => handleNavigate('/settings')}
                  className={`${GLASS_BTN} mb-2 bg-white/5 border-white/10 hover:bg-white/10`}
                >
                  <span className="py-2"><Settings /></span>
                  <span>Settings</span>
                </button>

>>>>>>> origin/main
                {/* Log Out */}
                <button
                  onClick={handleLogout}
                  className={`${GLASS_BTN} bg-red-500/15 border-red-400/25 hover:bg-red-500/25`}
                >
                  <span className="py-2"><FaSignOutAlt /></span>
                  <span>Log-Out</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}