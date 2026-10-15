import { createSlice } from "@reduxjs/toolkit";
import { fetchLearningOverview } from "../../utilites/DashboardHelper";

function getStoredUser() {
    try {
        const raw = localStorage.getItem("user");
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}
const dashboardSlice = createSlice({
    name: 'dashboard',
    initialState: {
        currentUser: getStoredUser(),
        searchTerm: '',
        statusFilter: 'all',
        sortBy: 'progress_desc',
        showCalenderModal: false,
        isOverviewLoading: false,
        isEnrollingCourse: '',
        overviewError: '',
        learningOverview: {
            stats: {
                totalXp: 0,
                level: 1,
                xpToNextLevel: 500,
                levelProgressPercent: 0,
                rank: 0,
                totalUsers: 0
            },
            enrolledCourses: [],
            leaderboard: []
        },
        friends: [],
        pendingRequestCount: 0,
        earnedBadges: [],
        isLoadingBadges: false,
        rewardClaimed: {},
        isClaimingReward: {},
        rewardBannerDismissed: false,
        activityData: [],
    },
    reducers: {
        setCurrentUser: (state, action) => {
            state.currentUser = action.payload;
        },
        setSearchTerm: (state, action) => {
            state.searchTerm = action.payload;
        },
        setStatusFilter: (state, action) => {
            state.statusFilter = action.payload;
        },
        setSortBy: (state, action) => {
            state.sortBy = action.payload;
        },
        setShowCalenderModal: (state, action) => {
            state.showCalenderModal = action.payload;
        },
        setIsOverviewLoading: (state, action) => {
            state.isOverviewLoading = action.payload;
        },
        setIsEnrollingCourse: (state, action) => {
            state.isEnrollingCourse = action.payload;
        },
        setOverviewError: (state, action) => {
            state.overviewError = action.payload;
        },
        setLearningOverview: (state, action) => {
            state.learningOverview = action.payload;
        },
        setFriends: (state, action) => {
            state.friends = action.payload;
        },
        setPendingRequestCount: (state, action) => {
            state.pendingRequestCount = action.payload;
        },
        setEarnedBadges: (state, action) => {
            state.earnedBadges = action.payload;
        },
        setIsLoadingBadges: (state, action) => {
            state.isLoadingBadges = action.payload;
        },
        setRewardClaimed: (state, action) => {
            const { rewardId, claimed } = action.payload;
            state.rewardClaimed[rewardId] = claimed;
        },
        setIsClaimingReward: (state, action) => {
            const { rewardId, isClaiming } = action.payload;
            state.isClaimingReward[rewardId] = isClaiming;
        },
        setRewardBannerDismissed: (state, action) => {
            state.rewardBannerDismissed = action.payload;
        },
        setActivityData: (state, action) => {
            state.activityData = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
        .addCase(fetchLearningOverview.pending, (state) => {
            state.isOverviewLoading = true;
            state.overviewError = '';
        })
        .addCase(fetchLearningOverview.fulfilled, (state, action) => {
            state.isOverviewLoading = false;
            state.learningOverview = action.payload;
            state.overviewError = '';
        })
        .addCase(fetchLearningOverview.rejected, (state, action) => {
            state.isOverviewLoading = false;
            state.overviewError = action.payload || 'Failed to fetch learning overview';
        });
    }
});
export const { setCurrentUser, setSearchTerm, setStatusFilter, setSortBy, setShowCalenderModal, setIsOverviewLoading, setIsEnrollingCourse, setOverviewError, setLearningOverview, setFriends, setPendingRequestCount, setEarnedBadges, setIsLoadingBadges, setRewardClaimed, setIsClaimingReward, setRewardBannerDismissed, setActivityData } = dashboardSlice.actions

export default dashboardSlice.reducer;