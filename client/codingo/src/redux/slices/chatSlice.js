import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL || '';

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Fetch friends to use as contacts for chat
export const fetchContacts = createAsyncThunk('chat/fetchContacts', async (_, { rejectWithValue }) => {
  try {
    const res = await axios.get(`${apiUrl}/api/social/friends`, {
      withCredentials: true,
      headers: getAuthHeaders()
    });
    // normalize to simple contact objects expected by UI
    return (res.data.friends || []).map(f => ({
      id: f._id,
      name: f.username,
      initials: f.username ? f.username.slice(0, 2).toUpperCase() : '?',
      color: '#6C63FF',
      lastMsg: '',
      time: '',
      unread: 0,
      online: true,
      profilePic: f.profilePic || ''
    }));
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to load contacts');
  }
});

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    contacts: [],
    messages: {},
    activeContactId: null,
    inputText: '',
    searchQuery: '',
  },
  reducers: {
    setActiveContact: (state, action) => { state.activeContactId = action.payload; },
    setInputText: (state, action) => { state.inputText = action.payload; },
    setSearchQuery: (state, action) => { state.searchQuery = action.payload; },
    addMessage: (state, action) => {
      const { contactId, message } = action.payload;
      if (!state.messages[contactId]) state.messages[contactId] = [];
      if (!state.messages[contactId].some((existingMessage) => existingMessage.id === message.id)) {
        state.messages[contactId].push(message);
      }
    },
    setContacts: (state, action) => { state.contacts = action.payload; },
    clearMessages: (state, action) => {
      const { contactId } = action.payload;
      state.messages[contactId] = [];
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchContacts.fulfilled, (state, action) => {
      state.contacts = action.payload;
    });
  }
});

export const { setActiveContact, setInputText, setSearchQuery, addMessage, setContacts, clearMessages } = chatSlice.actions;
export default chatSlice.reducer;