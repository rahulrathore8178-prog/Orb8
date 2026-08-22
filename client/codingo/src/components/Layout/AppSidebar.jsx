import { useState, useEffect } from 'react';
import {
  FaBars,
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

const communityNavItems = [
  { key: 'home', label: 'Home', icon: FaHome, to: '/community', match: ['/community'] },
  { key: 'messages', label: 'Messages', icon: FaFacebookMessenger, to: '/messages', match: ['/messages'] },
  { key: 'askIgris', label: 'Ask Igris', icon: FaBrain, to: '/askIgris', match: ['/askIgris'] },
  { key: 'rememberIgris', label: 'Remember Igris', icon: FaBook, to: '/rememberIgris', match: ['/rememberIgris'] },
  { key: 'friends', label: 'Friends', icon: FaUserFriends, to: '/friends', match: ['/friends'] },
  { key: 'discover', label: 'Discover', icon: FaSearch, to: '/discover', match: ['/discover'] },
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

export default function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isDesktopCollapsed = useSelector(state => state.sideBar.isDesktopCollapsed);
  const isMobileMenuOpen = useSelector(state => state.sideBar.isMobileMenuOpen);

  const handleLogout = async () => {
    try {
      await axios.get(`${apiUrl}/api/auth/user/logout`, {
        withCredentials: true,
        headers: getAuthHeaders()
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

  const isActiveItem = (item) => item.match.some((routePrefix) => location.pathname.startsWith(routePrefix));

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
  // console.log('Current dashboardMode:', dashboardMode, 'Nav items:', navItems.map(item => item.key));
  return (
    <>
      <aside className="hidden z-10 max-h-screen lg:block shrink-0">
        <div
          onMouseEnter={() => dispatch(setDesktopCollapsed(false))}
          onMouseLeave={() => dispatch(setDesktopCollapsed(true))}
          className={`sticky flex flex-col justify-between h-screen bg-[#2B2B2B] border-r border-[#414141] py-4 transition-width duration-200 ease-in-out will-change-[width] ${isDesktopCollapsed ? 'w-20 px-2' : 'w-45 px-2'
            }`}
        >

          <nav className="space-y-1">
            {navItems.map((item) => (
              <SidebarItem
                key={item.key}
                item={item}
                isActive={isActiveItem(item)}
                collapsed={isDesktopCollapsed}
                onClick={handleNavigate}
              />
            ))}
          </nav>

          <div>
            {/* New Post */}
            {/* <button className=' flex justify-center w-full cursor-pointer items-center gap-3 text-white mb-5 text-center bg-gray-700 p-2 rounded-3xl'>
              <span className='py-2'><FaPlus /></span>
              {!isDesktopCollapsed && (
                <span>New Post</span>)}
            </button> */}

            {/* Log Out */}
            <button onClick={handleLogout} className='text-white gap-3 flex justify-center w-full items-center bg-red-700 text-center p-2 rounded-3xl cursor-pointer'>
              <span className='py-2'><FaSignOutAlt /></span>
              {!isDesktopCollapsed && (
                <span>Log-out</span>)}
            </button>
          </div>
        </div>
      </aside>

      <aside className="fixed inset-y-0 left-0 z-30 w-10 lg:hidden bg-[#2B2B2B] border-r border-[#414141]">
        <div className="h-full py-3 px-1 flex flex-col gap-2 items-center">
          <button
            type="button"
            onClick={() => dispatch(setMobileMenuOpen(true))}
            className="h-10 w-10 rounded-lg text-[#A0A0A0] hover:bg-[#515151] transition grid place-items-center"
            aria-label="Open sidebar menu"
            title="Open menu"
          >
            <FaBars />
          </button>

          <div className='flex flex-col justify-between'>
            <div>
            {navItems.map((item) => (
              <SidebarItem
                key={item.key}
                item={item}
                isActive={isActiveItem(item)}
                collapsed={false}
                onClick={handleNavigate}
                iconOnly
              />
            ))}
            </div>

            <div>
              {/* New Post */}
              {/* <button className=' flex justify-center w-full cursor-pointer items-center gap-3 text-white mb-5 text-center bg-gray-700 p-2 rounded-3xl'>
                <span className='py-2'><FaPlus /></span>
                {!isDesktopCollapsed && (
                  <span>New Post</span>)}
              </button> */}

              {/* Log Out */}
              <button onClick={handleLogout} className='text-white gap-3 flex justify-center w-full items-center bg-red-700 text-center p-2 rounded-3xl cursor-pointer'>
                <span className='py-2'><FaSignOutAlt /></span>
                {!isDesktopCollapsed && (
                  <span>Log-out</span>)}
              </button>
            </div>
          </div>
        </div>
      </aside>

      {isMobileMenuOpen ? (
        <div className="fixed top-16 left-0 right-0 bottom-0 z-40 lg:hidden">
          <button
            type="button"
            className="absolute min-h-screen inset-0 bg-black/60"
            onClick={() => dispatch(setMobileMenuOpen(false))}
            aria-label="Close sidebar menu backdrop"
          />

          <div className="absolute bottom-0.5 min-h-screen h-full w-50 bg-[#2B2B2B] border-r border-[#414141] p-3 shadow-2xl">
            <div className="flex items-center justify-between mb-5 px-1">
              <div className="text-xl font-extrabold text-cyan-400">Orbit</div>
              <button
                type="button"
                onClick={() => dispatch(setMobileMenuOpen(false))}
                className="h-9 w-9 rounded-lg text-[#A0A0A0] hover:bg-[#515151] transition grid place-items-center"
                aria-label="Close sidebar menu"
              >
                <FaTimes />
              </button>
            </div>
            <div className=' flex flex-col justify-between'>
              <nav className="space-y-1">
                {navItems.map((item) => (
                  <SidebarItem
                    key={`mobile-${item.key}`}
                    item={item}
                    isActive={isActiveItem(item)}
                    collapsed={false}
                    onClick={handleNavigate}
                  />
                ))}
              </nav>


              <div>
                {/* New Post */}
                {/* <button className=' flex justify-center w-full cursor-pointer items-center gap-3 text-white mb-5 text-center bg-gray-700 p-2 rounded-3xl'>
                  <span className='py-2'><FaPlus /></span>
                  <span>New Post</span>
                </button> */}

                {/* Log Out */}
                <button onClick={handleLogout} className='text-white flex gap-3 justify-center w-full items-center bg-red-700 text-center p-2 rounded-3xl cursor-pointer'>
                  <span className='py-2'><FaSignOutAlt /></span>
                  {/* {!isDesktopCollapsed && (
            <span>Log-out</span>)} */}
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