import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import {
  FaUserFriends,
  FaSearch,
  FaTrophy,
  FaStar,
  FaFire,
  FaUserPlus,
  FaCheck,
  FaTimes,
  FaTrash,
  FaMedal
} from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { setActiveTab, setConfirmRemoveId, setFriendRequests, setIsSearching, setSearchQuery, setSearchResults, setSuccessMessage, setError, setIsLoading, setFriends, fetchFriends } from '../redux/slices/friendsSlice';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { useNavigate } from 'react-router-dom';

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

const apiUrl = import.meta.env.VITE_API_URL || '';

// Search users
export const searchUsers = createAsyncThunk('friends/searchUsers', async (query, { rejectWithValue }) => {
  if (!query.trim()) {
    return [];
  }
  try {
    const response = await axios.get(`${apiUrl}/api/social/search`, {
      params: { q: query },
      withCredentials: true,
      headers: getAuthHeaders()
    });
    console.log('Search response:', response?.data?.users);
    return response.data.users;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Search failed');
  }
});

export function FriendsPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const activeTab = useSelector(state => state.friends.activeTab);
  const friends = useSelector(state => state.friends.friends);
  const friendRequests = useSelector(state => state.friends.friendRequests);
  const searchQuery = useSelector(state => state.friends.searchQuery);
  const searchResults = useSelector(state => state.friends.searchResults ?? []);
  const isLoading = useSelector(state => state.friends.isLoading);
  const error = useSelector(state => state.friends.error);
  const successMessage = useSelector(state => state.friends.successMessage);
  const isSearching = useSelector(state => state.friends.isSearching);
  const confirmRemoveId = useSelector(state => state.friends.confirmRemoveId);

  // Load friends when tab changes to friends
  useEffect(() => {
    if (activeTab === 'friends') {
      dispatch(fetchFriends());
    } else if (activeTab === 'requests') {
      dispatch(fetchFriendRequests());
    }
  }, [activeTab, dispatch]);

  // Search users with debounce
useEffect(() => {
  if (activeTab !== 'search') return;

  const q = searchQuery.trim();
  if (!q) {
    dispatch(setSearchResults([]));
    return;
  }

  let request;
  const timer = setTimeout(() => {
    request = dispatch(searchUsers(q));
  }, 200); // 200-300ms is fine

  return () => {
    clearTimeout(timer);   // cancels a request that hasn't started
    request?.abort();      // cancels one that's already in flight
  };
}, [searchQuery, activeTab, dispatch]);

  const handleSendRequest = async (userId) => {
    try {
      const response = await axios.post(
        `${apiUrl}/api/social/friend-request/${userId}`,
        {},
        { withCredentials: true, headers: getAuthHeaders() }
      );
      dispatch(setSuccessMessage(response.data.message));
      setTimeout(() => dispatch(setSuccessMessage(null)), 3000);

      // If auto-accepted, refresh friends list
      if (response.data.status === 'friends') {
        dispatch(fetchFriends());
      }

      // Update search results to show Pending state instead of removing
      const updatedResults = searchResults.map(user =>
        user._id === userId ? { ...user, hasPendingRequest: true } : user
      );
      dispatch(setSearchResults(updatedResults));
    } catch (err) {
      dispatch(setError(err.response?.data?.message || 'Failed to send friend request'));
      setTimeout(() => dispatch(setError(null)), 3000);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      await axios.post(
        `${apiUrl}/api/social/friend-request/${requestId}/accept`,
        {},
        { withCredentials: true, headers: getAuthHeaders() }
      );
      dispatch(setSuccessMessage('Friend request accepted!'));
      setTimeout(() => dispatch(setSuccessMessage(null)), 3000);
      dispatch(fetchFriendRequests());
      dispatch(fetchFriends());
    } catch (err) {
      dispatch(setError(err.response?.data?.message || 'Failed to accept request'));
      setTimeout(() => dispatch(setError(null)), 3000);
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      await axios.post(
        `${apiUrl}/api/social/friend-request/${requestId}/reject`,
        {},
        { withCredentials: true, headers: getAuthHeaders() }
      );
      dispatch(setSuccessMessage('Friend request rejected'));
      setTimeout(() => dispatch(setSuccessMessage(null)), 3000);
      dispatch(fetchFriendRequests());
    } catch (err) {
      dispatch(setError(err.response?.data?.message || 'Failed to reject request'));
      setTimeout(() => dispatch(setError(null)), 3000);
    }
  };

  const handleRemoveFriend = async (friendId) => {
    try {
      await axios.delete(`${apiUrl}/api/social/friends/${friendId}`, {
        withCredentials: true,
        headers: getAuthHeaders()
      });
      dispatch(setSuccessMessage('Friend removed'));
      setTimeout(() => dispatch(setSuccessMessage(null)), 3000);
      dispatch(setConfirmRemoveId(null));
      dispatch(fetchFriends());
    } catch (err) {
      dispatch(setError(err.response?.data?.message || 'Failed to remove friend'));
      setTimeout(() => dispatch(setError(null)), 3000);
      dispatch(setConfirmRemoveId(null));
    }
  };
  const renderFriendCard = (friend, showRank = false, rank = 0) => (
    <div
      key={friend._id}
      className="bg-[#0f1620] rounded-lg p-3 sm:p-4 border border-white/5 hover:border-white/10 transition"
    >
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap">
        {showRank && (
          <div className="text-xl sm:text-2xl font-light text-white/60 w-6 sm:w-8 shrink-0">
            #{rank}
          </div>
        )}
        <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-white/20 to-white/10 flex items-center justify-center text-sm sm:text-xl font-light shrink-0">
          {friend.profilePic ? (
            <img src={friend.profilePic} alt={friend.username} className="w-full h-full rounded-full object-cover" />
          ) : (
            friend.username[0].toUpperCase()
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div onClick={() => friend._id && navigate(`/socialprofile/${friend._id}`)} className="font-light text-sm sm:text-lg truncate hover:text-white/80 transition">{friend.username}</div>
        </div>
        <div className="text-right shrink-0">
          <button
            onClick={() => dispatch(setConfirmRemoveId(friend._id))}
            className="px-2 sm:px-3 py-1 sm:py-2 bg-transparent hover:bg-white/10 text-white/60 hover:text-white rounded-lg text-xs sm:text-sm font-light transition flex items-center justify-center gap-1 sm:gap-2 border border-white/10"
          >
            <FaTrash size={10} className="sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>
      {!showRank && confirmRemoveId === friend._id && (
        <div className="mt-3 flex gap-2">
          <span className="flex-1 text-xs sm:text-sm text-white/60 flex items-center font-light">Sure?</span>
          <button
            onClick={() => handleRemoveFriend(friend._id)}
            className="px-2 sm:px-3 py-1 sm:py-2 cursor-pointer bg-white/10 hover:bg-white/15 text-white rounded-lg text-xs sm:text-sm font-light transition border border-white/10"
          >
            Yes
          </button>
          <button
            onClick={() => dispatch(setConfirmRemoveId(null))}
            className="px-2 sm:px-3 py-1 sm:py-2 bg-transparent hover:bg-white/5 cursor-pointer text-white/60 hover:text-white rounded-lg text-xs sm:text-sm font-light transition border border-white/10"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0e14] text-white p-3 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#111820] to-[#0f1620] rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/5 mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <FaUserFriends className="text-2xl sm:text-3xl md:text-4xl text-white/60" />
            <div>
              <h1 className="text-2xl sm:text-3xl font-light tracking-tight">Friends</h1>
              <p className="text-white/40 text-xs sm:text-sm font-light">Manage your connections</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4">
            <p className="text-red-300 text-sm sm:text-base font-light">{error}</p>
          </div>
        )}
        {successMessage && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4">
            <p className="text-emerald-300 text-sm sm:text-base font-light">{successMessage}</p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 sm:gap-2 mb-4 sm:mb-6 overflow-x-auto pb-2 scrollbar-hide border-b border-white/5">
          <button
            onClick={() => dispatch(setActiveTab('friends'))}
            className={`px-2 sm:px-4 py-2 rounded-none font-light transition whitespace-nowrap text-xs sm:text-sm border-b-2 ${
              activeTab === 'friends'
                ? 'text-white border-white/60'
                : 'text-white/40 border-transparent hover:text-white/60'
            }`}
          >
            <FaUserFriends className="inline mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Friends ({friends.length})</span>
            <span className="sm:hidden">({friends.length})</span>
          </button>
          <button
            onClick={() => dispatch(setActiveTab('requests'))}
            className={`px-2 sm:px-4 py-2 rounded-none font-light transition whitespace-nowrap text-xs sm:text-sm border-b-2 relative ${
              activeTab === 'requests'
                ? 'text-white border-white/60'
                : 'text-white/40 border-transparent hover:text-white/60'
            }`}
          >
            <FaMedal className="inline mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Requests</span>
            <span className="sm:hidden">Req</span>
            {friendRequests.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-white/30 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-light">
                {friendRequests.length}
              </span>
            )}
          </button>
          <button
            onClick={() => dispatch(setActiveTab('search'))}
            className={`px-2 sm:px-4 py-2 rounded-none font-light transition whitespace-nowrap text-xs sm:text-sm border-b-2 ${
              activeTab === 'search'
                ? 'text-white border-white/60'
                : 'text-white/40 border-transparent hover:text-white/60'
            }`}
          >
            <FaSearch className="inline mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Search</span>
            <span className="sm:hidden">Find</span>
          </button>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-2">
            {/* Friends Tab */}
            {activeTab === 'friends' && (
              <div className="bg-gradient-to-br from-[#111820] to-[#0f1620] rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/5">
                <h2 className="text-lg sm:text-xl font-light mb-4 tracking-tight">Your Friends</h2>
                {isLoading ? (
                  <div className="text-center py-8 sm:py-12">
                    <div className="animate-spin w-10 h-10 sm:w-12 sm:h-12 border border-white/20 border-t-white/60 rounded-full mx-auto mb-4"></div>
                    <p className="text-white/50 text-sm sm:text-base font-light">Loading friends...</p>
                  </div>
                ) : friends.length === 0 ? (
                  <div className="text-center py-8 sm:py-12 text-white/50">
                    <FaUserFriends className="text-3xl sm:text-5xl mx-auto mb-4 opacity-30" />
                    <p className="text-sm sm:text-base font-light">No friends yet</p>
                  </div>
                ) : (
                  <div className="space-y-2 sm:space-y-3">
                    {friends.map(friend => renderFriendCard(friend))}
                  </div>
                )}
              </div>
            )}

            {/* Friend Requests Tab */}
            {activeTab === 'requests' && (
              <div className="bg-gradient-to-br from-[#111820] to-[#0f1620] rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/5">
                <h2 className="text-lg sm:text-xl font-light mb-4 tracking-tight">Requests</h2>
                {isLoading ? (
                  <div className="text-center py-8 sm:py-12">
                    <div className="animate-spin w-10 h-10 sm:w-12 sm:h-12 border border-white/20 border-t-white/60 rounded-full mx-auto mb-4"></div>
                    <p className="text-white/50 text-sm sm:text-base font-light">Loading requests...</p>
                  </div>
                ) : friendRequests.length === 0 ? (
                  <div className="text-center py-8 sm:py-12 text-white/50">
                    <FaMedal className="text-3xl sm:text-5xl mx-auto mb-4 opacity-30" />
                    <p className="text-sm sm:text-base font-light">No pending requests</p>
                  </div>
                ) : (
                  <div className="space-y-2 sm:space-y-3">
                    {friendRequests.map(request => (
                      <div
                        key={request._id}
                        className="bg-[#0f1620] rounded-lg p-3 sm:p-4 border border-white/5 hover:border-white/10 transition"
                      >
                        <div className="flex items-center gap-2 sm:gap-3 mb-3 flex-wrap sm:flex-nowrap">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-white/20 to-white/10 flex items-center justify-center text-sm sm:text-lg font-light flex-shrink-0">
                            {request.from.profilePic ? (
                              <img src={request.from.profilePic} alt={request.from.username} className="w-full h-full rounded-full object-cover" />
                            ) : (
                              request.from.username[0].toUpperCase()
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-light text-sm sm:text-base truncate">{request.from.username}</div>
                            <div className="text-xs sm:text-sm text-white/40 font-light">
                              Level {request.from.level}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAcceptRequest(request._id)}
                            className="flex-1 px-2 sm:px-3 py-2 bg-white/10 hover:bg-white/15 text-white rounded-lg text-xs sm:text-sm font-light transition flex items-center justify-center gap-1 sm:gap-2 border border-white/10"
                          >
                            <FaCheck size={12} className="sm:w-4 sm:h-4" /> Accept
                          </button>
                          <button
                            onClick={() => handleRejectRequest(request._id)}
                            className="flex-1 px-2 sm:px-3 py-2 bg-transparent hover:bg-white/5 text-white/60 hover:text-white rounded-lg text-xs sm:text-sm font-light transition flex items-center justify-center gap-1 sm:gap-2 border border-white/10"
                          >
                            <FaTimes size={12} className="sm:w-4 sm:h-4" /> Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Search Tab */}
            {activeTab === 'search' && (
              <div className="bg-gradient-to-br from-[#111820] to-[#0f1620] rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/5">
                <h2 className="text-lg sm:text-xl font-light mb-4 tracking-tight">Find Friends</h2>
                <div className="relative mb-4">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/30" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => dispatch(setSearchQuery(e.target.value))}
                    placeholder="Search username..."
                    className="w-full pl-10 pr-4 py-2 sm:py-3 bg-[#0f1620] border border-white/10 rounded-lg focus:outline-none focus:border-white/30 text-white text-sm sm:text-base font-light placeholder-white/30"
                  />
                </div>
                {isSearching ? (
                  <div className="text-center py-8 sm:py-12">
                    <div className="animate-spin w-10 h-10 sm:w-12 sm:h-12 border border-white/20 border-t-white/60 rounded-full mx-auto mb-4"></div>
                    <p className="text-white/50 text-sm sm:text-base font-light">Searching...</p>
                  </div>
                ) : searchResults.length === 0 && searchQuery.trim() ? (
                  <div className="text-center py-8 sm:py-12 text-white/50">
                    <p className="text-sm sm:text-base font-light">No users found</p>
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="text-center py-8 sm:py-12 text-white/50">
                    <FaSearch className="text-3xl sm:text-5xl mx-auto mb-4 opacity-30" />
                    <p className="text-sm sm:text-base font-light">Start typing to search</p>
                  </div>
                ) : (
                  <div className="space-y-2 sm:space-y-3">
                    {searchResults.map(user => (
                      <div
                        key={user._id}
                        className="bg-[#0f1620] rounded-lg p-3 sm:p-4 border border-white/5 hover:border-white/10 transition"
                      >
                        <div className="flex items-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-white/20 to-white/10 flex items-center justify-center text-sm sm:text-lg font-light flex-shrink-0">
                            {user.profilePic ? (
                              <img src={user.profilePic} alt={user.username} className="w-full h-full rounded-full object-cover" />
                            ) : (
                              user.username[0].toUpperCase()
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-light text-sm sm:text-base truncate">{user.username}</div>
                            <div className="text-xs sm:text-sm text-white/40 font-light">
                              Level {user.level}
                            </div>
                          </div>
                          {user.isFriend ? (
                            <div className="px-2 sm:px-4 py-1 sm:py-2 bg-white/10 text-white rounded-lg text-xs sm:text-sm font-light whitespace-nowrap border border-white/10">
                              Friends
                            </div>
                          ) : user.hasPendingRequest ? (
                            <div className="px-2 sm:px-4 py-1 sm:py-2 bg-white/5 text-white/60 rounded-lg text-xs sm:text-sm font-light cursor-default whitespace-nowrap border border-white/10">
                              Pending
                            </div>
                          ) : (
                            <button
                              onClick={() => handleSendRequest(user._id)}
                              className="px-2 sm:px-4 py-1 sm:py-2 bg-white/15 hover:bg-white/20 text-white rounded-lg text-xs sm:text-sm font-light transition flex items-center gap-1 sm:gap-2 whitespace-nowrap border border-white/10"
                            >
                              <FaUserPlus size={12} className="sm:w-4 sm:h-4" /> Add
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
