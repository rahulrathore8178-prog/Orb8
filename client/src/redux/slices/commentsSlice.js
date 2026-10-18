import { createSlice } from "@reduxjs/toolkit";

const commentsSlice = createSlice({
    name: "comments",
    initialState: {
        playingVoiceNote: false,
    },
    reducers: {
       setPlayingVoiceNote : (state, acttion) => {
        state.playingVoiceNote = acttion.payload;
       }
    }
});

export const { setPlayingVoiceNote } = commentsSlice.actions;
export default commentsSlice.reducer;