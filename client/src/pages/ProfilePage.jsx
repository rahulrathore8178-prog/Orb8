import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { 
  FaTrophy, 
  FaMedal, 
  FaStar, 
  FaFire, 
  FaCrown, 
  FaLock,
  FaCamera,
  FaEdit,
  FaSave,
  FaTimes,
  FaUsers,
  FaUserFriends
} from 'react-icons/fa';
import CalendarHeatmap from '../components/shared/CalendarHeatmap';


const RARITY_COLORS = {
  Common: 'bg-gray-600 text-gray-100',
  Rare: 'bg-blue-600 text-blue-100',
  Epic: 'bg-purple-600 text-purple-100',
  Legendary: 'bg-orange-600 text-orange-100'
};

const RARITY_BORDER = {
  Common: 'border-gray-500',
  Rare: 'border-blue-500',
  Epic: 'border-purple-500',
  Legendary: 'border-orange-500 shadow-lg shadow-orange-500/20'
};

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function getStoredUser() {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function 
ProfilePage() {
  const { userId } = useParams();
  const storedUser = getStoredUser();
  const isOwnProfile = !userId || userId === storedUser?.id;
  console.log('userId', userId)

  const [currentUser, setCurrentUser] = useState(isOwnProfile ? storedUser : null);
  const [allBadges, setAllBadges] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRarity, setSelectedRarity] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bio, setBio] = useState('');
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [editedUsername, setEditedUsername] = useState('');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [calendarData, setCalendarData] = useState([]);
  const fileInputRef = useRef(null);
  const apiUrl = import.meta.env.VITE_API_URL || '';

  useEffect(() => {
    if (isOwnProfile) {
      fetchBadges();
      fetchActivityData();
    }
    fetchUserProfile();
  }, [userId]);

  async function fetchUserProfile() {
    try {
      const url = isOwnProfile
        ? `${apiUrl}/api/auth/user/me`
        : `${apiUrl}/api/auth/user/${userId}/public`;

      const response = await axios.get(url, {
        withCredentials: true,
        headers: getAuthHeaders()
      });

      if (response.data?.user) {
        const userData = response.data.user;
        setCurrentUser(userData);
        setBio(userData.bio || '');
        setEditedUsername(userData.username || '');

        if (isOwnProfile) {
          localStorage.setItem('user', JSON.stringify(userData));
        } else {
          // Map public profile badges to the same format used by the badge grid
          const publicBadges = (userData.badges || [])
            .filter(b => b.badge)
            .map(b => ({
              id: String(b.badge._id || b.badge),
              name: b.badge.name || 'Badge',
              description: b.badge.description || '',
              icon: b.badge.icon || '🏅',
              rarity: b.badge.rarity || 'Common',
              xpBonus: b.badge.xpBonus || 0,
              earned: true,
              earnedAt: b.earnedAt || null
            }));
          setAllBadges(publicBadges);
          setIsLoading(false);
        }
      }
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
      setError('Failed to load profile.');
      setIsLoading(false);
    }
  }

  async function fetchBadges() {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${apiUrl}/api/badges`, {
        withCredentials: true,
        headers: getAuthHeaders()
      });

      setAllBadges(response.data?.badges || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load badges');
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchActivityData() {
    try {
      const response = await axios.get(`${apiUrl}/api/learning/me/activity`, {
        withCredentials: true,
        headers: getAuthHeaders()
      });

      const activityMap = {};
      for (const entry of (response.data?.activity || [])) {
        activityMap[entry.date] = entry.count;
      }

      // Build full year of data, filling in zeros for days with no activity
      const data = [];
      const today = new Date();
      const startDate = new Date(today);
      startDate.setFullYear(startDate.getFullYear() - 1);

      let currentDate = new Date(startDate);
      while (currentDate <= today) {
        const dateKey = currentDate.toISOString().slice(0, 10);
        data.push({
          date: new Date(currentDate),
          count: activityMap[dateKey] || 0
        });
        currentDate.setDate(currentDate.getDate() + 1);
      }

      setCalendarData(data);
    } catch (err) {
      console.error('Failed to fetch activity data:', err);
      setCalendarData([]);
    }
  }

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      setError('Image must be less than 3MB');
      return;
    }

    setIsUploadingAvatar(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await axios.patch(
        `${apiUrl}/api/auth/user/profile/image`,
        formData,
        {
          withCredentials: true,
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data?.user) {
        setCurrentUser(response.data.user);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        window.dispatchEvent(new Event('auth:user-updated'));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload avatar');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSaveBio = async () => {
    try {
      const response = await axios.patch(
        `${apiUrl}/api/auth/user/profile`,
        { bio },
        {
          withCredentials: true,
          headers: getAuthHeaders()
        }
      );

      if (response.data?.user) {
        setCurrentUser(response.data.user);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      setIsEditingBio(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update bio');
    }
  };

  const handleSaveUsername = async () => {
    const trimmed = editedUsername.trim();
    if (!trimmed || trimmed === currentUser?.username) {
      setIsEditingUsername(false);
      return;
    }

    try {
      setError(null);
      const response = await axios.patch(
        `${apiUrl}/api/auth/user/profile`,
        { username: trimmed },
        {
          withCredentials: true,
          headers: getAuthHeaders()
        }
      );

      if (response.data?.user) {
        setCurrentUser(response.data.user);
        setEditedUsername(response.data.user.username);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        window.dispatchEvent(new Event('auth:user-updated'));
      }
      setIsEditingUsername(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update username');
    }
  };

  const earnedBadges = allBadges.filter(b => b.earned);
  const lockedBadges = allBadges.filter(b => !b.earned);

  const filteredBadges = allBadges
    .filter(badge => {
      if (selectedRarity !== 'All' && badge.rarity !== selectedRarity) return false;
      if (selectedStatus === 'Earned' && !badge.earned) return false;
      if (selectedStatus === 'Locked' && badge.earned) return false;
      return true;
    });

  const rarityStats = {
    Common: earnedBadges.filter(b => b.rarity === 'Common').length,
    Rare: earnedBadges.filter(b => b.rarity === 'Rare').length,
    Epic: earnedBadges.filter(b => b.rarity === 'Epic').length,
    Legendary: earnedBadges.filter(b => b.rarity === 'Legendary').length
  };

  return (
    <div className="min-h-screen bg-[#0f1419] text-white p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Profile Header */}
        <div className="bg-[#1a2332] rounded-2xl p-6 border border-[#2a3a4a] shadow-lg mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              {isOwnProfile && (
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              )}
              <div className="relative group">
                {currentUser?.profilePic ? (
                  <img 
                    src={currentUser.profilePic} 
                    alt={currentUser.username} 
                    className="w-24 h-24 rounded-full border-4 border-cyan-500"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-3xl font-bold">
                    {currentUser?.username?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
                {isOwnProfile && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingAvatar}
                    className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                  >
                    {isUploadingAvatar ? (
                      <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full"></div>
                    ) : (
                    <FaCamera className="text-2xl text-white" />
                  )}
                </button>
                )}
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                {isOwnProfile && isEditingUsername ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editedUsername}
                      onChange={(e) => setEditedUsername(e.target.value)}
                      className="bg-[#0f1419] text-white text-2xl font-bold rounded-lg px-3 py-1 border border-[#1f2a38] focus:border-cyan-500 focus:outline-none"
                      maxLength={30}
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveUsername();
                        if (e.key === 'Escape') {
                          setEditedUsername(currentUser?.username || '');
                          setIsEditingUsername(false);
                        }
                      }}
                    />
                    <button type="button" onClick={handleSaveUsername} className="text-cyan-400 hover:text-cyan-300">
                      <FaSave />
                    </button>
                    <button type="button" onClick={() => { setEditedUsername(currentUser?.username || ''); setIsEditingUsername(false); }} className="text-gray-400 hover:text-gray-300">
                      <FaTimes />
                    </button>
                  </div>
                ) : (
                  <>
                    <h1 className="text-3xl font-bold">{currentUser?.username || 'Learner'}</h1>
                    {isOwnProfile && (
                      <button type="button" onClick={() => setIsEditingUsername(true)} className="text-cyan-400 hover:text-cyan-300">
                        <FaEdit className="text-sm" />
                      </button>
                    )}
                  </>
                )}
                {currentUser?.league?.includes('Diamond') && (
                  <FaCrown className="text-orange-400 text-2xl" />
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                <div className="flex items-center gap-2">
                  <FaTrophy className="text-cyan-400" />
                  <span>Level {currentUser?.level || 1}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaMedal className="text-yellow-400" />
                  <span>{currentUser?.league || 'Bronze 1'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaStar className="text-orange-400" />
                  <span>{currentUser?.totalXp || 0} XP</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaFire className="text-orange-500" />
                  <span>{currentUser?.streakCount || 0} day streak</span>
                </div>
              </div>

              {/* Bio */}
              <div className="bg-[#141b24] rounded-lg p-4 border border-[#1f2a38]">
                {isOwnProfile && isEditingBio ? (
                  <div>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Write something about yourself..."
                      className="w-full bg-[#0f1419] text-white rounded-lg p-3 border border-[#1f2a38] focus:border-cyan-500 focus:outline-none resize-none"
                      rows="3"
                      maxLength="200"
                    />
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500">{bio.length}/200</span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setBio(currentUser?.bio || '');
                            setIsEditingBio(false);
                          }}
                          className="px-3 py-1 bg-gray-600 hover:bg-gray-700 rounded-lg text-sm font-semibold transition"
                        >
                          <FaTimes className="inline mr-1" /> Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveBio}
                          className="px-3 py-1 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-sm font-semibold transition"
                        >
                          <FaSave className="inline mr-1" /> Save
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between">
                    <p className="text-gray-300 flex-1">
                      {bio || (isOwnProfile ? 'No bio yet. Click edit to add one.' : 'No bio yet.')}
                    </p>
                    {isOwnProfile && (
                      <button
                        type="button"
                        onClick={() => setIsEditingBio(true)}
                        className="text-cyan-400 hover:text-cyan-300 ml-4"
                      >
                        <FaEdit />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-4">
              <div className="bg-[#141b24] rounded-xl px-6 py-3 border border-[#1f2a38] text-center">
                <div className="text-2xl font-bold text-cyan-400">{earnedBadges.length}</div>
                <div className="text-xs text-gray-400">Badges</div>
              </div>
              <div className="bg-[#141b24] rounded-xl px-6 py-3 border border-[#1f2a38] text-center">
                <div className="text-2xl font-bold text-purple-400">{(currentUser?.friends || []).length}</div>
                <div className="text-xs text-gray-400">Friends</div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-600/20 border border-red-600 rounded-lg p-4 mb-6">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Activity Heatmap */}
        {/* {isOwnProfile && (
        <div className="bg-[#1a2332] rounded-2xl p-6 border border-[#2a3a4a] shadow-lg mb-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <FaFire className="text-orange-400" /> Activity Overview
          </h2>
          <CalendarHeatmap data={calendarData} />
        </div>
        )} */}

        {/* Rarity Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-[#1a2332] rounded-xl p-4 border border-gray-600">
            <div className="flex items-center gap-2 mb-2">
              <FaMedal className="text-gray-400" />
              <span className="text-sm font-semibold text-gray-300">Common</span>
            </div>
            <div className="text-2xl font-bold">{rarityStats.Common}</div>
          </div>
          <div className="bg-[#1a2332] rounded-xl p-4 border border-blue-600">
            <div className="flex items-center gap-2 mb-2">
              <FaStar className="text-blue-400" />
              <span className="text-sm font-semibold text-blue-300">Rare</span>
            </div>
            <div className="text-2xl font-bold">{rarityStats.Rare}</div>
          </div>
          <div className="bg-[#1a2332] rounded-xl p-4 border border-purple-600">
            <div className="flex items-center gap-2 mb-2">
              <FaFire className="text-purple-400" />
              <span className="text-sm font-semibold text-purple-300">Epic</span>
            </div>
            <div className="text-2xl font-bold">{rarityStats.Epic}</div>
          </div>
          <div className="bg-[#1a2332] rounded-xl p-4 border border-orange-600">
            <div className="flex items-center gap-2 mb-2">
              <FaTrophy className="text-orange-400" />
              <span className="text-sm font-semibold text-orange-300">Legendary</span>
            </div>
            <div className="text-2xl font-bold">{rarityStats.Legendary}</div>
          </div>
        </div>

        {/* Badge Filters */}
        <div className="bg-[#1a2332] rounded-2xl p-4 border border-[#2a3a4a] shadow-lg mb-6">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wide mb-2 block">Status</label>
              <div className="flex flex-wrap gap-2">
                {['All', 'Earned', 'Locked'].map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setSelectedStatus(status)}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${
                      selectedStatus === status
                        ? 'bg-cyan-600 text-white'
                        : 'bg-[#141b24] text-gray-400 hover:bg-[#1f2a38] border border-[#1f2a38]'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wide mb-2 block">Rarity</label>
              <div className="flex flex-wrap gap-2">
                {['All', 'Common', 'Rare', 'Epic', 'Legendary'].map((rarity) => (
                  <button
                    key={rarity}
                    type="button"
                    onClick={() => setSelectedRarity(rarity)}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${
                      selectedRarity === rarity
                        ? 'bg-cyan-600 text-white'
                        : 'bg-[#141b24] text-gray-400 hover:bg-[#1f2a38] border border-[#1f2a38]'
                    }`}
                  >
                    {rarity}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Badges Grid */}
        <div className="bg-[#1a2332] rounded-2xl p-6 border border-[#2a3a4a] shadow-lg">
          <h2 className="text-xl font-bold mb-4">Badges Collection</h2>
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-400">Loading badges...</p>
            </div>
          ) : filteredBadges.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              No badges match your filters.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {filteredBadges.map((badge) => (
                <div
                  key={badge.id}
                  className={`bg-[#141b24] rounded-xl p-4 border-2 ${
                    badge.earned ? RARITY_BORDER[badge.rarity] : 'border-[#1f2a38]'
                  } ${badge.earned ? '' : 'opacity-50'} transition hover:scale-105`}
                >
                  <div className="text-center">
                    {badge.earned ? (
                      <div className="text-5xl mb-2">{badge.icon}</div>
                    ) : (
                      <div className="text-5xl mb-2 filter grayscale">
                        <FaLock className="mx-auto text-gray-600" />
                      </div>
                    )}
                    <div className="text-sm font-bold mb-1">{badge.name}</div>
                    <div className="text-xs text-gray-500 mb-2">{badge.description}</div>
                    <div className={`text-xs font-semibold px-2 py-1 rounded-full inline-block ${RARITY_COLORS[badge.rarity]}`}>
                      {badge.rarity}
                    </div>
                    {badge.xpBonus > 0 && (
                      <div className="text-xs text-cyan-400 mt-2 font-semibold">+{badge.xpBonus} XP</div>
                    )}
                    {badge.earnedAt && (
                      <div className="text-xs text-gray-600 mt-1">
                        {new Date(badge.earnedAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
