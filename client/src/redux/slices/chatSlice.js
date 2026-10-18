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

export const fetchConversation = createAsyncThunk('chat/fetchConversation', async (contactId, { rejectWithValue, getState }) => {
  try {
    const res = await axios.get(`${apiUrl}/api/chat/${contactId}`, {
      withCredentials: true,
      headers: getAuthHeaders()
    });
    const currentUserId = String(getState().dashboard.currentUser?.id || '');
    const messages = (res.data.messages || []).map(message => ({
      ...message,
      senderId: String(message.senderId),
      recipientId: String(message.recipientId),
      time: message.timestamp,
      from: String(message.senderId) === currentUserId ? 'me' : 'them',
    }));
    return { contactId, messages };
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to load conversation');
  }
});

export const sendChatMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ contactId, text, sharedPostId }, { rejectWithValue }) => {
    try {
      const res = await axios.post(
        `${apiUrl}/api/chat/${contactId}`,
        { text, sharedPostId },
        { withCredentials: true, headers: getAuthHeaders() }
      );
      return { contactId, message: res.data.message };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to send message');
    }
  }
);

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
    builder.addCase(fetchConversation.fulfilled, (state, action) => {
      state.messages[action.payload.contactId] = action.payload.messages;
    });
    builder.addCase(sendChatMessage.fulfilled, (state, action) => {
      if (!state.messages[action.payload.contactId]) state.messages[action.payload.contactId] = [];
      if (!state.messages[action.payload.contactId].some(message => message.id === action.payload.message.id)) {
        state.messages[action.payload.contactId].push({
          ...action.payload.message,
          time: action.payload.message.timestamp,
          from: 'me',
        });
      }
    });
  }
});

export const { setActiveContact, setInputText, setSearchQuery, addMessage, setContacts, clearMessages } = chatSlice.actions;
export default chatSlice.reducer;