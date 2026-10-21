import { useEffect } from 'react';
import axios from 'axios';
import { FaTrophy, FaMedal, FaFire, FaChevronLeft, FaChevronRight, FaStar, FaClock, FaInfinity } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { setIsLoading, setPage } from '../redux/slices/feedSlice';
import { setError } from '../redux/slices/postSlice';
import { setCurrentUserLeague, setCurrentUserRank, setLeaderboard, setPeriod, setSelectedLeague, setTotal, setTotalPages } from '../redux/slices/leaderboardSlice';

const LEAGUE_COLORS = {
  Bronze: 'text-amber-600',
  Silver: 'text-gray-300',
  Gold: 'text-yellow-400',
  Platinum: 'text-cyan-300',
  Diamond: 'text-blue-400'
};

const LEAGUE_BG = {
  Bronze: 'from-amber-900/30 to-amber-700/10 border-amber-700/40',
  Silver: 'from-gray-700/30 to-gray-500/10 border-gray-500/40',
  Gold: 'from-yellow-900/30 to-yellow-600/10 border-yellow-600/40',
  Platinum: 'from-cyan-900/30 to-cyan-600/10 border-cyan-600/40',
  Diamond: 'from-blue-900/30 to-blue-500/10 border-blue-500/40'
};

const LEAGUE_EMOJIS = {
  Bronze: '🥉',
  Silver: '🥈',
  Gold: '🥇',
  Platinum: '💠',
  Diamond: '💎'
};

function getBaseTier(league) {
  if (!league) return 'Bronze';
  return league.split(' ')[0];
}

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function LeaderboardPage() {
  const leaderboard = useSelector(state => state.leaderboard.leaderboard);
  const currentUserRank = useSelector(state => state.leaderboard.currentUserRank);
  const currentUserLeague = useSelector(state => state.leaderboard.currentUserLeague);
  const selectedLeague = useSelector(state => state.leaderboard.selectedLeague);
  const period = useSelector(state => state.leaderboard.period);
  const page = useSelector(state => state.leaderboard.page);
  const totalPages = useSelector(state => state.leaderboard.totalPages);
  const total = useSelector(state => state.leaderboard.total);
  const isLoading = useSelector(state => state.leaderboard.isLoading);
  const error = useSelector(state => state.leaderboard.error);
  const dispatch = useDispatch();

  const currentUserId = JSON.parse(localStorage.getItem('user') || '{}').id;

  useEffect(() => {
    fetchLeaderboard();
  }, [selectedLeague, page, period]);

   async function fetchLeaderboard() {
    dispatch(setIsLoading(true));
    dispatch(setError(null));
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const params = new URLSearchParams();
      if (selectedLeague !== 'All') params.append('league', selectedLeague);
      params.append('page', page);
      params.append('limit', 20);
      params.append('period', period);

      const response = await axios.get(`${apiUrl}/api/learning/leaderboard?${params.toString()}`, {
        withCredentials: true,
        headers: getAuthHeaders()
      });

      dispatch(setLeaderboard(response.data.leaderboard || []));
      dispatch(setCurrentUserRank(response.data.currentUserRank));
      dispatch(setCurrentUserLeague(response.data.currentUserLeague || 'Bronze'));
      dispatch(setTotal(response.data.total || 0));
      dispatch(setTotalPages(response.data.totalPages || 1));
    } catch (err) {
      dispatch(setError(err.response?.data?.message || 'Failed to load leaderboard'));
    } finally {
      dispatch(setIsLoading(false));
    }
  }

  function handleLeagueChange(league) {
    dispatch(setSelectedLeague(league));
    dispatch(setPage(1));
  }

  function handlePeriodChange(p) {
    dispatch(setPeriod(p));
    dispatch(setPage(1));
  }

  const leagues = ['All', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'];

  return (
    <div className="min-h-screen bg-[#0f1419] text-white p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-[#1a2332] rounded-2xl p-6 border border-[#2a3a4a] shadow-lg mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <FaTrophy className="text-4xl text-yellow-400" />
              <div>
                <h1 className="text-3xl font-bold">Leaderboard</h1>
                <p className="text-gray-400 text-sm">Compete with learners worldwide</p>
              </div>
            </div>
            {currentUserRank && (
              <div className="bg-[#141b24] rounded-xl px-6 py-3 border border-[#1f2a38]">
                <div className="text-xs text-gray-400 uppercase tracking-wide">Your Rank</div>
                <div className="text-2xl font-bold text-cyan-400">#{formatNumber(currentUserRank)}</div>
                <div className="text-xs text-gray-500 mt-1">{LEAGUE_EMOJIS[getBaseTier(currentUserLeague)]} {currentUserLeague}</div>
              </div>
            )}
          </div>
        </div>

        {/* Period Toggle + League Tabs */}
        <div className="bg-[#1a2332] rounded-2xl p-4 border border-[#2a3a4a] shadow-lg mb-6 space-y-4">
          {/* Period Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 uppercase tracking-wide font-semibold mr-2">Period</span>
            <button
              type="button"
              onClick={() => handlePeriodChange('alltime')}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition flex items-center gap-2 ${
                period === 'alltime'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                  : 'bg-[#141b24] text-gray-400 hover:bg-[#1f2a38] border border-[#1f2a38]'
              }`}
            >
              <FaInfinity /> All Time
            </button>
            <button
              type="button"
              onClick={() => handlePeriodChange('weekly')}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition flex items-center gap-2 ${
                period === 'weekly'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                  : 'bg-[#141b24] text-gray-400 hover:bg-[#1f2a38] border border-[#1f2a38]'
              }`}
            >
              <FaClock /> Weekly
            </button>
          </div>

          {/* League Tabs */}
          <div className="flex flex-wrap gap-2">
            {leagues.map((league) => {
              const tier = league !== 'All' ? league : null;
              return (
                <button
                  key={league}
                  type="button"
                  onClick={() => handleLeagueChange(league)}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${
                    selectedLeague === league
                      ? tier
                        ? `bg-gradient-to-r ${LEAGUE_BG[tier]} border text-white shadow-lg`
                        : 'bg-cyan-600 text-white shadow-lg'
                      : 'bg-[#141b24] text-gray-400 hover:bg-[#1f2a38] border border-[#1f2a38]'
                  }`}
                >
                  {tier && LEAGUE_EMOJIS[tier]} {league}
                </button>
              );
            })}
          </div>
        </div>

        {/* Top 3 Podium (only on page 1) */}
        {!isLoading && !error && page === 1 && leaderboard.length >= 3 && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[1, 0, 2].map((idx) => {
              const user = leaderboard[idx];
              if (!user) return null;
              const isCurrentUser = user.userId === currentUserId;
              const podiumColors = [
                'from-yellow-500/20 to-yellow-700/5 border-yellow-500/50',
                'from-gray-400/20 to-gray-600/5 border-gray-400/50',
                'from-amber-600/20 to-amber-800/5 border-amber-600/50'
              ];
              const medalColors = ['text-yellow-400', 'text-gray-300', 'text-amber-600'];
              const sizes = ['scale-110 z-10', '', ''];
              return (
                <div
                  key={user.userId}
                  className={`bg-gradient-to-b ${podiumColors[idx]} border rounded-2xl p-4 text-center transition-all duration-500 animate-[fadeSlideUp_0.5s_ease-out_both] ${sizes[idx]} ${
                    isCurrentUser ? 'ring-2 ring-cyan-400/60' : ''
                  }`}
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <FaMedal className={`text-3xl mx-auto mb-2 ${medalColors[idx]}`} />
                  <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-xl font-bold mb-2 border-2 border-[#2a3a4a] overflow-hidden">
                    {user.profilePic ? (
                      <img src={user.profilePic} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      user.name[0].toUpperCase()
                    )}
                  </div>
                  <div className="font-bold text-sm truncate">{user.name}</div>
                  <div className="text-cyan-400 font-bold text-lg">{formatNumber(user.xp)}</div>
                  <div className="text-xs text-gray-400">{period === 'weekly' ? 'Weekly' : ''} XP</div>
                  <div className="flex items-center justify-center gap-1 text-xs text-gray-500 mt-1">
                    <FaFire className="text-orange-500" /> {user.streakCount}d
                    <span className="mx-1">•</span>
                    Lv {user.level}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Leaderboard Table */}
        <div className="bg-[#1a2332] rounded-2xl border border-[#2a3a4a] shadow-lg overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="animate-spin w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-400">Loading leaderboard...</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center">
              <p className="text-red-400 mb-4">{error}</p>
              <button
                type="button"
                onClick={() => fetchLeaderboard()}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg font-semibold transition"
              >
                Retry
              </button>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <FaTrophy className="text-5xl mx-auto mb-4 opacity-30" />
              <p>{period === 'weekly' ? 'No activity this week yet. Start learning to claim the top spot!' : 'No users found in this league yet. Keep learning to be the first!'}</p>
            </div>
          ) : (
            <>
              {/* Table Header */}
              <div className="hidden sm:grid grid-cols-[80px_1fr_120px_100px_120px] gap-4 px-6 py-3 bg-[#141b24] border-b border-[#1f2a38] text-xs uppercase text-gray-500 font-semibold">
                <div>Rank</div>
                <div>User</div>
                <div>{period === 'weekly' ? 'Weekly XP' : 'XP'}</div>
                <div>Streak</div>
                <div>League</div>
              </div>

              {/* Table Body */}
              <div className="divide-y divide-[#1f2a38]">
                {leaderboard.map((user, i) => {
                  const isCurrentUser = user.userId === currentUserId;
                  const isTop3 = user.rank <= 3;
                  const tier = getBaseTier(user.league);
                  return (
                    <div
                      key={user.userId}
                      className={`grid grid-cols-1 sm:grid-cols-[80px_1fr_120px_100px_120px] gap-4 px-6 py-4 transition-all duration-300 animate-[fadeSlideUp_0.4s_ease-out_both] ${
                        isCurrentUser
                          ? 'bg-cyan-600/15 border-l-4 border-l-cyan-500 ring-1 ring-cyan-500/30'
                          : 'hover:bg-[#141b24]'
                      }`}
                      style={{ animationDelay: `${i * 40}ms` }}
                    >
                      {/* Rank */}
                      <div className="flex items-center gap-2">
                        {isTop3 ? (
                          <FaMedal className={`text-2xl ${user.rank === 1 ? 'text-yellow-400' : user.rank === 2 ? 'text-gray-300' : 'text-amber-600'}`} />
                        ) : (
                          <div className="text-lg font-bold text-gray-400">#{user.rank}</div>
                        )}
                      </div>

                      {/* User */}
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0 overflow-hidden">
                          {user.profilePic ? (
                            <img src={user.profilePic} alt={user.name} className="w-full h-full object-cover" />
                          ) : (
                            user.name[0].toUpperCase()
                          )}
                        </div>
                        <div>
                          <div className="font-semibold">{user.name}</div>
                          <div className="text-xs text-gray-500">Level {user.level}</div>
                        </div>
                      </div>

                      {/* XP */}
                      <div className="flex items-center">
                        <div>
                          <div className="font-bold text-cyan-400 flex items-center gap-1">
                            <FaStar className="text-xs" /> {formatNumber(user.xp)}
                          </div>
                          <div className="text-xs text-gray-500 sm:hidden">{period === 'weekly' ? 'Weekly XP' : 'XP'}</div>
                        </div>
                      </div>

                      {/* Streak */}
                      <div className="flex items-center gap-2">
                        <FaFire className="text-orange-500" />
                        <span className="font-semibold">{user.streakCount}</span>
                        <span className="text-xs text-gray-500">days</span>
                      </div>

                      {/* League */}
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{LEAGUE_EMOJIS[tier]}</span>
                        <span className={`font-semibold ${LEAGUE_COLORS[tier]}`}>{user.league}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              <div className="px-6 py-4 bg-[#141b24] border-t border-[#1f2a38] flex items-center justify-between flex-wrap gap-4">
                <div className="text-sm text-gray-400">
                  Showing {(page - 1) * 20 + 1} - {Math.min(page * 20, total)} of {formatNumber(total)} users
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => page > 1 && setPage(page - 1)}
                    disabled={page === 1}
                    className="px-4 py-2 rounded-lg bg-[#1f2a38] hover:bg-[#243547] disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
                  >
                    <FaChevronLeft /> Prev
                  </button>
                  <div className="px-3 py-2 text-sm text-gray-400">
                    Page {page} of {totalPages}
                  </div>
                  <button
                    type="button"
                    onClick={() => page < totalPages && setPage(page + 1)}
                    disabled={page === totalPages}
                    className="px-4 py-2 rounded-lg bg-[#1f2a38] hover:bg-[#243547] disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
                  >
                    Next <FaChevronRight />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Inline keyframes for staggered entrance animation */}
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
