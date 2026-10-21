import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { FiBell, FiChevronDown, FiEdit2, FiImage, FiLogOut, FiSearch, FiUser } from 'react-icons/fi';
import { useLocation, useNavigate } from 'react-router-dom';
import Dashboard from '../../pages/DashboardPage';

function getStoredUser() {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

const LandingHeader = ({ onBack }) => {
  const location = useLocation();
  // const location = useLocation();
  const navigate = useNavigate();

  const [dashboardMode, setDashboardMode] = useState(
  localStorage.getItem('dashboardMode') || 'community'
);


const setModeAndNavigate = (mode) => {
  setDashboardMode(mode);
  localStorage.setItem('dashboardMode', mode);
  window.dispatchEvent(new Event('dashboardModeChanged')); // <-- add this
  navigate(mode === 'community' ? '/community' : '/dashboard');
};


  useEffect(() => {
    localStorage.setItem('dashboardMode', dashboardMode);
    }, [dashboardMode]);

  const handleRegister = () => {
    navigate("/Register");
  }

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);
  const apiUrl = import.meta.env.VITE_API_URL || '';
  const [searchVal, setSearchVal] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [currentUser, setCurrentUser] = useState(() => getStoredUser());
  const [notifications, setNotifications] = useState([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const imageInputRef = useRef(null);
  

  const MAX_IMAGE_UPLOAD_BYTES = 3 * 1024 * 1024;

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    if (token) {
      console.log('[AUTH] Using token from localStorage');
      return { Authorization: `Bearer ${token}` };
    }
    return {};
  };

  useEffect(() => {
    let isMounted = true;

    const syncUser = async () => {
      try {
        const token = localStorage.getItem('token');
        console.log('[SYNC USER] Token exists:', !!token);

        const response = await axios.get(`${apiUrl}/api/auth/user/me`, {
          withCredentials: true,
          headers: getAuthHeaders()
        });

        if (!isMounted) return;

        if (response.data?.user) {
          const user = response.data.user;
          console.log('[SYNC USER] Success:', { id: user.id, email: user.email });
          setCurrentUser(user);
          setNotifications(user.notifications || []);
          localStorage.setItem('user', JSON.stringify(user));
        }
      } catch (error) {
        if (!isMounted) return;
        console.error('[SYNC USER] Error:', error.response?.status, error.response?.data?.message);
        const localUser = getStoredUser();
        if (!localUser) {
          setCurrentUser(null);
          setNotifications([]);
        }
      }
    };

    syncUser();
    return () => {
      isMounted = false;
    };
  }, [apiUrl, location.pathname]);

  useEffect(() => {
    const onStorageChange = () => {
      const updated = getStoredUser();
      setCurrentUser(updated);
      setNotifications(updated?.notifications || []);
    };

    const onAuthChanged = () => {
      const updated = getStoredUser();
      setCurrentUser(updated);
      setNotifications(updated?.notifications || []);
    };

    window.addEventListener('storage', onStorageChange);
    window.addEventListener('auth:user-updated', onAuthChanged);
    return () => {
      window.removeEventListener('storage', onStorageChange);
      window.removeEventListener('auth:user-updated', onAuthChanged);
    };
  }, []);

  const username = currentUser?.username || (currentUser?.email ? currentUser.email.split('@')[0] : 'Learner');
  const avatarUrl = currentUser?.profilePic || '';
  const streakCount = Number(currentUser?.streakCount || 0);
  const unreadCount = notifications.filter((note) => !note.isRead).length;

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/auth/user/notifications`, {
        withCredentials: true,
        headers: getAuthHeaders()
      });

      if (Array.isArray(response.data?.notifications)) {
        setNotifications(response.data.notifications);
        const updatedUser = { ...(currentUser || {}), notifications: response.data.notifications };
        setCurrentUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        window.dispatchEvent(new Event('auth:user-updated'));
      }
    } catch {
      setNotifications([]);
    }
  };

  const handleMarkNotificationRead = async (notificationId) => {
    try {
      const response = await axios.patch(
        `${apiUrl}/api/auth/user/notifications/${notificationId}/read`,
        {},
        {
          withCredentials: true,
          headers: getAuthHeaders()
        }
      );

      if (Array.isArray(response.data?.notifications)) {
        setNotifications(response.data.notifications);
        const updatedUser = { ...(currentUser || {}), notifications: response.data.notifications };
        setCurrentUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        window.dispatchEvent(new Event('auth:user-updated'));
      }
    } catch {
      // Ignore UI-only failure to keep panel responsive.
    }
  };

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
    setNotifications([]);
    setIsDropdownOpen(false);
    setIsNotificationsOpen(false);
    window.dispatchEvent(new Event('auth:user-updated'));
    navigate('/login');
  };

  const handleChangeUsername = async () => {
    const nextName = window.prompt('Enter your new username', username);
    if (!nextName || !nextName.trim()) return;

    try {
      const response = await axios.patch(
        `${apiUrl}/api/auth/user/profile`,
        { username: nextName.trim() },
        {
          withCredentials: true,
          headers: getAuthHeaders()
        }
      );

      if (response.data?.user) {
        setCurrentUser(response.data.user);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        window.dispatchEvent(new Event('auth:user-updated'));
      }
      setIsDropdownOpen(false);
    } catch (error) {
      window.alert(error.response?.data?.message || 'Failed to update username.');
    }
  };

  const handleChangeProfilePic = () => {
    imageInputRef.current?.click();
  };

  const handleProfileImageSelected = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      window.alert('Please select a valid image file.');
      return;
    }

    if (file.size > MAX_IMAGE_UPLOAD_BYTES) {
      window.alert('Image too large. Please upload an image up to 3MB.');
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

    setIsUploadingImage(true);

    try {
      const response = await axios.patch(
        `${apiUrl}/api/auth/user/profile/image`,
        formData,
        {
          withCredentials: true,
          headers: getAuthHeaders()
        }
      );

      if (response.data?.user) {
        setCurrentUser(response.data.user);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        window.dispatchEvent(new Event('auth:user-updated'));
      }
      setIsDropdownOpen(false);
    } catch (error) {
      window.alert(error.response?.data?.message || 'Failed to upload profile picture.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleLogoClick = () => {
    if (typeof onBack === 'function') {
      onBack();
      return;
    }
    navigate('/');
  };

  const handleToggleNotifications = () => {
    const nextOpen = !isNotificationsOpen;
    setIsNotificationsOpen(nextOpen);
    if (nextOpen) {
      fetchNotifications();
    }
  };

  const formatNotificationDate = (createdAt) => {
    if (!createdAt) return '';
    try {
      return new Date(createdAt).toLocaleString();
    } catch {
      return '';
    }
  };

  return (
    <div className="sticky top-0 z-50 bg-gray-900/90 backdrop-blur border-b border-white/5">
      <div className="relative flex justify-between items-center gap-2 px-3 sm:px-4 lg:px-9 py-3 bg-gray-900 w-full">
        <div className="flex items-center justify-center">
          <button onClick={handleLogoClick} className="logo-glow text-[22px] font-black tracking-tight select-none shrink-0 cursor-pointer" style={{ fontFamily: "'Syne',sans-serif" }}>
            Codify
          </button>
        </div>
<div className="flex items-center bg-gray-800 rounded-lg p-1 border border-white/10">
  <button
    type="button"
    onClick={() => setModeAndNavigate('community')}
    className={`px-3 py-1 text-xs rounded-md transition ${
      dashboardMode === 'community' ? 'bg-cyan-500 text-black font-semibold' : 'text-gray-300'
    }`}
  >
    Community
  </button>

  <button
    type="button"
    onClick={() => setModeAndNavigate('lms')}
    className={`px-3 py-1 text-xs rounded-md transition ${
      dashboardMode === 'lms' ? 'bg-cyan-500 text-black font-semibold' : 'text-gray-300'
    }`}
  >
    LMS
  </button>
</div>


        <div className="flex items-center gap-3">
          <a className="hidden md:block hover:text-gray-300 font-medium text-gray-400 cursor-pointer hover:scale-110 transition">Contact Us</a>
          <a onClick={() => navigate(dashboardMode === 'community' ? '/community' : '/dashboard')} className="hidden md:block hover:text-gray-300 font-medium text-gray-400 cursor-pointer hover:scale-110 transition">Dashboard</a>
          {!currentUser ? (
            <nav className="flex gap-2 sm:gap-3 items-center text-xs sm:text-sm">
              <button
                className="sm:hidden h-9 w-9 rounded-full bg-gray-800/80 border border-white/10 text-cyan-300 hover:text-cyan-200 transition grid place-items-center"
                type="button"
                aria-label="Search"
              >
                <FiSearch className="text-base" />
              </button>
              <button
                className="a-glow btn-glow text-[13px] font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-[9px] px-4 py-2 border-none cursor-pointer ml-1"
                onClick={() => navigate('/login')}
                type="button"
              >
                Login
              </button>
              <button
                className="text-[13px] font-medium text-gray-200 border border-white/10 rounded-[9px] px-4 py-1.5 hover:border-blue-500/50 hover:bg-blue-900/20 hover:text-blue-400 transition-all duration-200 ml-1 bg-transparent cursor-pointer"
                onClick={() => navigate('/signup')}
                type="button"
              >
                Sign Up
              </button>
            </nav>
          ) : (
            <>
              <button
                type="button"
                onClick={handleToggleNotifications}
                className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-gray-800/80 border border-white/10 text-cyan-300 hover:text-cyan-200 transition relative grid place-items-center"
                aria-label="Notifications"
                title="Latest updates"
              >
                <FiBell className="text-lg" />
                {unreadCount > 0 ? (
                  <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-cyan-500 text-[10px] text-black font-bold grid place-items-center border border-gray-900">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                ) : null}
              </button>

              {isNotificationsOpen ? (
                <div className="absolute top-12 sm:top-14 right-0 w-[calc(100vw-1.5rem)] sm:w-80 max-h-96 overflow-y-auto bg-gray-900 border border-white/10 rounded-xl shadow-2xl p-2">
                  <div className="px-3 py-2 text-sm font-bold text-gray-100">Latest Updates</div>
                  {notifications.length === 0 ? (
                    <div className="px-3 py-6 text-sm text-gray-400">No notifications yet.</div>
                  ) : (
                    notifications.map((note) => (
                      <div key={note._id} className="px-3 py-2 rounded-lg hover:bg-gray-800 border border-transparent hover:border-white/10 mb-1">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className={`text-sm font-semibold ${note.isRead ? 'text-gray-300' : 'text-cyan-300'}`}>{note.title}</div>
                            <div className="text-xs text-gray-400 mt-1">{note.detail}</div>
                            <div className="text-[11px] text-gray-500 mt-1">{formatNotificationDate(note.createdAt)}</div>
                          </div>
                          {!note.isRead ? (
                            <button
                              type="button"
                              className="text-xs text-cyan-300 hover:text-cyan-200"
                              onClick={() => handleMarkNotificationRead(note._id)}
                            >
                              Mark read
                            </button>
                          ) : null}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : null}

              <div className="hidden sm:flex h-10 px-3 rounded-full bg-gray-800/70 border border-white/10 items-center text-sm text-cyan-300 font-semibold whitespace-nowrap">
                Streak: {streakCount}
              </div>

              <div
                className="relative"
                onMouseEnter={() => setIsDropdownOpen(true)}
                onMouseLeave={() => setIsDropdownOpen(false)}
              >
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen((prev) => !prev)}
                  className="h-10 pl-1 pr-2 rounded-full bg-gray-800/70 border border-white/10 hover:border-cyan-500/40 flex items-center gap-2 transition"
                >
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Profile"
                      className="w-8 h-8 rounded-full object-cover border border-cyan-500/40"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-linear-to-br from-cyan-500 to-blue-500 grid place-items-center text-white text-sm font-bold">
                      {username?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                  )}
                  <span className="hidden sm:block text-sm text-gray-200 font-semibold max-w-30 truncate">{username}</span>
                  <FiChevronDown className={`text-gray-400 transition ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-gray-900 border border-white/10 rounded-xl shadow-2xl p-2">
                    <input
                      ref={imageInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                      onChange={handleProfileImageSelected}
                    />
                    <button
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-200 hover:bg-gray-800 rounded-lg"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        navigate('/profile');
                      }}
                      type="button"
                    >
                      <FiUser /> My Profile
                    </button>
                    <button
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-200 hover:bg-gray-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={handleChangeProfilePic}
                      disabled={isUploadingImage}
                      type="button"
                    >
                      <FiImage /> {isUploadingImage ? 'Uploading...' : 'Change Profile Picture'}
                    </button>
                    <button
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-200 hover:bg-gray-800 rounded-lg"
                      onClick={handleChangeUsername}
                      type="button"
                    >
                      <FiEdit2 /> Change Username
                    </button>
                    <button
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-300 hover:bg-red-900/20 rounded-lg"
                      onClick={handleLogout}
                      type="button"
                    >
                      <FiLogOut /> Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default LandingHeader;