import { createSlice } from "@reduxjs/toolkit";

const leaderboardSlice = createSlice({
  name: 'leaderboard',
  initialState: {
    leaderboard: [],
    currentUserRank: null,
    currentUserLeague: 'Bronze',
    selectedLeague: 'All',
    period: 'alltime',
    page: 1,
    totalPages: 1,
    total: 0,
    isLoading: false,
    error: null,
  },
  reducers: {
    setLeaderboard: (state, action) => {
      state.leaderboard = action.payload;
    },
    setCurrentUserRank: (state, action) => {
      state.currentUserRank = action.payload;
    },
    setCurrentUserLeague: (state, action) => {
      state.currentUserLeague = action.payload;
    },
    setSelectedLeague: (state, action) => {
      state.selectedLeague = action.payload;
    },
    setPeriod: (state, action) => {
      state.period = action.payload;
    },
    setPage: (state, action) => {
      state.page = action.payload;
    },
    setTotalPages: (state, action) => {
      state.totalPages = action.payload;
    },
    setTotal: (state, action) => {
      state.total = action.payload;
    },
    setIsLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    }
  }
});

export const {
  setLeaderboard,
  setCurrentUserRank,
  setCurrentUserLeague,
  setSelectedLeague,
  setPeriod,
  setPage,
  setTotalPages,
  setTotal,
  setIsLoading,
  setError
} = leaderboardSlice.actions;
export default leaderboardSlice.reducer;