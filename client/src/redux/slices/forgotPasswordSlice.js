import { createSlice } from "@reduxjs/toolkit";

const forgotPasswordSlice = createSlice({
    name: 'forgotPassword',
    initialState: {
        email: '',
        error: '',
        loading: false,
        sent: false,
        devToken: '',
    },
    reducers: {
        setEmail: (state, action) => {
            state.email = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setSent: (state, action) => {
            state.sent = action.payload;
        },
        setDevToken: (state, action) => {
            state.devToken = action.payload;
        },
    }
})
export const { setEmail, setError, setLoading, setSent, setDevToken } = forgotPasswordSlice.actions;
export default forgotPasswordSlice.reducer;