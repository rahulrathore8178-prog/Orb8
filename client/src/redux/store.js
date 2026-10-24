import { configureStore } from '@reduxjs/toolkit';
import postReducer from './slices/postSlice';
import feedReducer from './slices/feedSlice';
import sideBarReducer from './slices/sideBarSlice';
import dashboardSlice from './slices/dashboardSlice'
import forgotPasswordSlice from './slices/forgotPasswordSlice';
import friendsSlice from './slices/friendsSlice';
import chatSlice from './slices/chatSlice';
import commentsSlice from './slices/commentsSlice';
import capsuleSlice from './slices/capsuleSlice';
import discoverReducer from './slices/discoverSlice';

const store = configureStore({
    reducer: {
        post: postReducer,
        feed: feedReducer,
        sideBar: sideBarReducer,
        dashboard: dashboardSlice,
        forgotPassword: forgotPasswordSlice,
        friends: friendsSlice,
        chat: chatSlice,
        comments: commentsSlice,
        capsule: capsuleSlice
        ,discover: discoverReducer
    }
});
export default store;