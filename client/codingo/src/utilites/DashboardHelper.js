import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getStoredUser = () => {
    try {
        const raw = localStorage.getItem("user");
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

export const getUserDisplayName = (user) => {
    if (!user) return "Learner";
    if (typeof user.username === "string" && user.username.trim()) return user.username.trim();
    if (typeof user.email === "string" && user.email.includes("@")) return user.email.split("@")[0];
    return "Learner";
}

export const getUserIdentifier = (user) => {
    if (!user) return "guest";
    return user.id || user._id || user.email || user.username || "guest";
}

export const apiUrl = import.meta.env.VITE_ || "";

const fallbackLeaderboard = [
    { rank: 1, name: "ProCoder123", xp: 5420, medal: "🥇" },
    { rank: 2, name: "DevQueen99", xp: 5180, medal: "🥈" },
    { rank: 3, name: "ByteMaster", xp: 5010, medal: "🥉" }
];

export const fetchLearningOverview = createAsyncThunk(
    'learning/fetchOverview',
    async (_, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                return {
                    stats: {
                        totalXp: 0,
                        level: 1,
                        xpToNextLevel: 500,
                        levelProgressPercent: 0,
                        rank: 0,
                        totalUsers: 0
                    },
                    enrolledCourses: [],
                    leaderboard: fallbackLeaderboard,
                    user: null
                };
            };
            const res = await axios.get(`${apiUrl}/api/learning/me/overview`, {
                withCredentials: true,
                headers: getAuthHeaders()
            });
            const nextOverview = {
                stats: res.data?.stats || {
                    totalXp: 0,
                    level: 1,
                    xpToNextLevel: 500,
                    levelProgressPercent: 0,
                    rank: 0,
                    totalUsers: 0
                },
                enrolledCourses: Array.isArray(res.data?.enrolledCourses) ? res.data.enrolledCourses : [],
                leaderboard: Array.isArray(res.data?.leaderboard) ? res.data.leaderboard : [],
                user: res.data?.user || null
            };

            // Merge user info into localStorage if available
            if (nextOverview.user) {
                const mergedUser = {
                    ...(getStoredUser() || {}),
                    ...nextOverview.user,
                    totalXp: nextOverview.stats.totalXp,
                    level: nextOverview.stats.level
                };
                localStorage.setItem("user", JSON.stringify(mergedUser));
                window.dispatchEvent(new Event("auth:user-updated"));
            }

            return nextOverview;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch learning overview');
        }
    }
)