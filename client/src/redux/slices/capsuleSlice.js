import { createSlice } from "@reduxjs/toolkit";

const capsuleSlice = createSlice ({
    name: 'capsule',
    initialState: {
        capsule: [],
        caption: '',
        capsuleInputText: '',
        isCapsulePosting: false,
        capsuleCommenting: false,
        replyText: '',
        error: null
    },
    reducers: {
        setCapsule: (state, action) => {
            state.capsule = action.payload;
        },
        setCaption: (state, action) => {
            state.caption = action.payload
        },
        setCapsuleInputText: (state, action) =>{
            state.capsuleInputText = action.payload
        },
        setIsCapsulePosting: (state, action) => {
            state.isCapsulePosting = action.payload;
        },
        setCapsuleCommenting: (state, action) => {
            state.capsuleCommenting = action.payload;
        },
        setReplyText: (state, action) => {
            state.replyText = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload
        }
    },
})

export const {setCapsule, setCaption, setCapsuleInputText, setCapsuleCommenting, setIsCapsulePosting, setError, setReplyText} = capsuleSlice.actions;
export default capsuleSlice.reducer;