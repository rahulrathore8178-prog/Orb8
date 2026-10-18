import { createSlice } from "@reduxjs/toolkit";

const postSlice = createSlice({
    name: 'post',
    initialState: {
        content: '',
        focused: false,
        imagePreview: null,
        isPosting: false,
        error: '',
    },
    reducers: {
        setContent: (state, action) => {
            state.content = action.payload;
        },
        setFocused: (state, action) => {
            state.focused = action.payload;
        },
        // setImage: (state, action) => {
        //     state.image = action.payload;
        // },
        setImagePreview: (state, action) => {
            state.imagePreview = action.payload;
        },
        setIsPosting: (state, action) => {
            state.isPosting = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
        resetPost: (state) => {
            state.content = '';
            state.focused = false;
            state.image = null;
            state.imagePreview = null;
            state.isPosting = false;
            state.error = '';
        },
    },
});
 export const { setContent, setFocused, setImagePreview, setIsPosting, setError, resetPost } = postSlice.actions;
 export default postSlice.reducer;