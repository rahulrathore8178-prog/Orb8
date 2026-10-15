import { createSlice } from "@reduxjs/toolkit";

const sideBarSlice = createSlice({
    name: 'sideBar',
    initialState: {
        isDesktopCollapsed: true,
        isMobileMenuOpen: false,
    },
    reducers: {
        setDesktopCollapsed: (state, action) => {
            state.isDesktopCollapsed = action.payload;
        },
        setMobileMenuOpen: (state, action) => {
            state.isMobileMenuOpen = action.payload;
        },
    }
})
export const { setDesktopCollapsed, setMobileMenuOpen } = sideBarSlice.actions;
export default sideBarSlice.reducer;