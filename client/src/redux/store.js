import { configureStore } from '@reduxjs/toolkit';
import postReducer from './slices/postSlice';
import feedReducer from './slices/feedSlice';
import sideBarReducer from './slices/sideBarSlice';
import challengePageSlice from './slices/challengePageSlice';
import dashboardSlice from './slices/dashboardSlice'
import forgotPasswordSlice from './slices/forgotPasswordSlice';
import friendsSlice from './slices/friendsSlice';
import chatSlice from './slices/chatSlice';
import commentsSlice from './slices/commentsSlice';
import leaderboardSlice from './slices/leaderboardSlice';
import capsuleSlice from './slices/capsuleSlice';
import discoverReducer from './slices/discoverSlice';

const store = configureStore({
    reducer: {
        post: postReducer,
        feed: feedReducer,
        sideBar: sideBarReducer,
        challengePage: challengePageSlice,
        dashboard: dashboardSlice,
        forgotPassword: forgotPasswordSlice,
        friends: friendsSlice,
        chat: chatSlice,
        comments: commentsSlice,
        leaderboard: leaderboardSlice,
        capsule: capsuleSlice
        ,discover: discoverReducer
    }
});
export default store;