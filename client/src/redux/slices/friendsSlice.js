import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { searchUsers } from "../../pages/FriendsPage";
import { apiUrl, getAuthHeaders } from "../../utilites/DashboardHelper";
import axios from "axios";

const friendsSlice = createSlice({
    name: 'friends',
    initialState: {
        activeTab: 'friends',
        friends: [],
        friendRequests: [],
        searchQuery: '',
        searchResults: [],
        isLoading: false,
        error: null,
        successMessage: null,
        isSearching: false,
        confirmRemoveId: null,
    },
    reducers: {
        setActiveTab: (state, action) => {
            state.activeTab = action.payload;
        },
        setFriends: (state, action) => {
            state.friends = action.payload;
        },
        setFriendRequests: (state, action) => {
            state.friendRequests = action.payload;
        },
        setSearchQuery: (state, action) => {
            state.searchQuery = action.payload;
        },
        setSearchResults: (state, action) => {
            state.searchResults = action.payload;
        },
        setIsLoading: (state, action) => {
            state.isLoading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
        setSuccessMessage: (state, action) => {
            state.successMessage = action.payload;
        },
        setIsSearching: (state, action) => {
            state.isSearching = action.payload;
        },
        setConfirmRemoveId: (state, action) => {
            state.confirmRemoveId = action.payload;
        },
    },
    extraReducers: (builder) => {
        // Handle fetchFriends thunk
        builder.addCase(fetchFriends.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(fetchFriends.fulfilled, (state, action) => {
            state.isLoading = false;
            state.friends = action.payload;
        });
        builder.addCase(fetchFriends.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload;
        });

        // Handle fetchFriendRequests thunk
        builder.addCase(fetchFriendRequests.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(fetchFriendRequests.fulfilled, (state, action) => {
            state.isLoading = false;
            state.friendRequests = action.payload;
        });
        builder.addCase(fetchFriendRequests.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload;
        });

        // Handle searchUsers thunk
        builder.addCase(searchUsers.pending, (state) => {
            state.isSearching = true;
            state.error = null;
        });
        builder.addCase(searchUsers.fulfilled, (state, action) => {
            state.isSearching = false;
            state.searchResults = action.payload;
        });
        builder.addCase(searchUsers.rejected, (state, action) => {
            state.isSearching = false;
            state.error = action.payload;
        });
    }
});

// Fetch friends list
export const fetchFriends = createAsyncThunk('friends/fetchFriends', async (_, { rejectWithValue }) => {
    try {
        const response = await axios.get(`${apiUrl}/api/social/friends`, {
            withCredentials: true,
            headers: getAuthHeaders()
        });
        setFriends(response.data.friends);
        return response.data.friends;
        // console.log('Fetched friends:', response.data.friends);
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to load friends');
    }
});

// Fetch friend requests
export const fetchFriendRequests = createAsyncThunk('friends/fetchFriendRequests', async (_, { rejectWithValue }) => {
    try {
        const response = await axios.get(`${apiUrl}/api/social/friend-requests`, {
            withCredentials: true,
            headers: getAuthHeaders()
        });
        setFriendRequests(response.data.requests);
        return response.data.requests;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Failed to load friend requests');
    }
});
export const { setActiveTab, setFriends, setFriendRequests, setSearchQuery, setSearchResults, setIsLoading, setError, setSuccessMessage, setIsSearching, setConfirmRemoveId } = friendsSlice.actions;
export default friendsSlice.reducer;