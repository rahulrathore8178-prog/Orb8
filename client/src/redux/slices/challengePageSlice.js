import { createSlice } from "@reduxjs/toolkit";

const challengePageSlice = createSlice({
    name: 'challengePage',
    initialState: {
        selectedTab: 'daily',
        challenges: [],
        isLoading: false,
        error: null,
    },
    reducers: {
        setSelectedTab: (state, action) => {
            state.selectedTab = action.payload;
        },
        setChallenges: (state, action) => {
            state.challenges = action.payload;
        },
        setIsLoading: (state, action) => {
            state.isLoading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
    }
});
export const { setSelectedTab, setChallenges, setIsLoading, setError } = challengePageSlice.actions;
export default challengePageSlice.reducer;