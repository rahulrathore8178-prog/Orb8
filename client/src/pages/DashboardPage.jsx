import React, { useCallback, useEffect, useMemo, useState } from "react";
import Header from '../components/LandingPage/Header.jsx';
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FaArrowRight,
  FaBell,
  FaClock,
  FaCrown,
  FaFilter,
  FaFlag,
  FaGraduationCap,
  FaMedal,
  FaPlayCircle,
  FaSearch,
  FaSortAmountDownAlt,
  FaTimes,
  FaUsers
} from "react-icons/fa";
import ParticleCanvas from "../components/LandingPage/ParticleCanvas.jsx";
import { courseCatalog } from "../data/courseCatalog.jsx";
import CalendarHeatmap from "../components/shared/CalendarHeatmap";
import { useDispatch, useSelector } from "react-redux";
import { setActivityData, setCurrentUser, setFriends, setIsClaimingReward, setIsEnrollingCourse, setOverviewError, setPendingRequestCount, setRewardBannerDismissed, setRewardClaimed, setShowCalenderModal } from "../redux/slices/dashboardSlice.js";
import { apiUrl, fetchLearningOverview, getAuthHeaders, getStoredUser, getUserDisplayName, getUserIdentifier } from "../utilites/DashboardHelper.js";

export default function Dashboard() {
  const featuredCourses = [
    {
      id: "java",
      title: "Java Core Track",
      topic: "Coding",
      description: "Object-oriented programming, APIs, and backend fundamentals.",
      cta: "Start Java",
      to: "/language/java"
    },
    {
      id: "python",
      title: "Python Fast Start",
      topic: "Coding",
      description: "Syntax, problem-solving, and practical scripting skills.",
      cta: "Start Python",
      to: "/language/python"
    },
    {
      id: "javascript",
      title: "JavaScript Web Path",
      topic: "Web",
      description: "Build interactive frontend experiences and full-stack basics.",
      cta: "Start JavaScript",
      to: "/language/javascript"
    },
    {
      id: "claude",
      title: "Claude App Building",
      topic: "AI",
      description: "Prompt design, tools, and assistant workflows.",
      cta: "Explore AI",
      to: "/language/claude"
    },
    {
      id: "aws",
      title: "AWS Cloud Essentials",
      topic: "Cloud",
      description: "Learn compute, storage, IAM, and deployment basics.",
      cta: "Explore Cloud",
      to: "/language/aws"
    }
  ];

  const fallbackLeaderboard = [
    { rank: 1, name: "ProCoder123", xp: 5420, medal: "🥇" },
    { rank: 2, name: "DevQueen99", xp: 5180, medal: "🥈" },
    { rank: 3, name: "ByteMaster", xp: 5010, medal: "🥉" }
  ];

  function CourseMarketColumn() {
    const spotlightCourses = ["python", "java", "claude", "aws"].map((key) => courseCatalog[key]);

    return (
      <div className="bg-[#1a2332] rounded-2xl p-5 border border-[#2a3a4a] shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">Course Market Snapshot</h3>
          <span className="text-xs text-gray-400">Live-style demo</span>
        </div>
        <div className="space-y-3">
          {spotlightCourses.map((course) => (
            <div key={course.id} className="rounded-xl border border-[#1f2a38] bg-[#141b24] p-3">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-semibold text-sm">{course.title}</h4>
                <span className="text-[11px] text-cyan-300">{course.marketHotness}</span>
              </div>
              <div className="text-xs text-gray-400">Enrolled: {course.enrolled}</div>
              <div className="text-xs text-gray-400">Salary: {course.salary}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentUser = useSelector(state => state.dashboard.currentUser);
  const showCalendarModal = useSelector(state => state.dashboard.showCalendarModal);
  const overviewError = useSelector(state => state.dashboard.overviewError);
  const learningOverview = useSelector(state => state.dashboard.learningOverview);
  const earnedBadges = useSelector(state => state.dashboard.earnedBadges);
  const isLoadingBadges = useSelector(state => state.dashboard.isLoadingBadges);
  const rewardClaimed = useSelector(state => state.dashboard.rewardClaimed);
  const isClaimingReward = useSelector(state => state.dashboard.isClaimingReward);
  const rewardBannerDismissed = useSelector(state => state.dashboard.rewardBannerDismissed);
  const activityData = useSelector(state => state.dashboard.activityData);
  const isEnrollingCourse = useSelector(state => state.dashboard.isEnrollingCourse);
  const friends = useSelector(state => state.dashboard.friends);
  const pendingRequestCount = useSelector(state => state.dashboard.pendingRequestCount);

  const [weeklyGoals] = useState([
    { title: "Complete 10 lessons", current: 7, total: 10 },
    { title: "Earn 500 XP", current: 320, total: 500 },
    { title: "Study 5 days", current: 3, total: 5 },
  ]);

  const enrolledCourses = useMemo(
    () => learningOverview.enrolledCourses || [],
    [learningOverview.enrolledCourses]
  );
  const enrolledCourseIds = useMemo(
    () => new Set(enrolledCourses.map((course) => course.id)),
    [enrolledCourses]
  );


  const _githubUsername = "your-username";

  const _formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  useEffect(() => {
    const syncUser = () => dispatch(setCurrentUser(getStoredUser()));
    window.addEventListener("storage", syncUser);
    window.addEventListener("auth:user-updated", syncUser);
    return () => {
      window.removeEventListener("storage", syncUser);
      window.removeEventListener("auth:user-updated", syncUser);
    };
  }, []);

  const totalXP = learningOverview.stats?.totalXp || currentUser?.totalXp || 0;
  const currentLevel = learningOverview.stats?.level || currentUser?.level || 1;
  const xpToNextLevel = learningOverview.stats?.xpToNextLevel || currentLevel * 500;
  const levelProgress = learningOverview.stats?.levelProgressPercent || 0;
  const userRank = learningOverview.stats?.rank || 0;
  const leaderboardData = (learningOverview.leaderboard || []).length
    ? learningOverview.leaderboard.map((player) => ({
      ...player,
      medal:
        player.rank === 1 ? "🥇" :
          player.rank === 2 ? "🥈" :
            player.rank === 3 ? "🥉" :
              "⭐",
      isUser: player.userId === (currentUser?.id || currentUser?._id)
    }))
    : fallbackLeaderboard;

  const languageProgressData = enrolledCourses.slice(0, 4).map((course) => ({
    id: course.id,
    title: course.title,
    icon: courseCatalog[course.id]?.icon || "📘",
    level: Math.max(1, Math.ceil((course.totalPoints || 0) / 120)),
    progress: course.progress,
    lessons: course.lessons
  }));
  // console.log("Enrolled Courses:", enrolledCourses);



  const fetchFriends = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      dispatch(setFriends([]));
      dispatch(setPendingRequestCount(0));
      return;
    }

    const [friendsResult, requestsResult] = await Promise.allSettled([
      axios.get(`${apiUrl}/api/social/friends`, {
        withCredentials: true,
        headers: getAuthHeaders()
      }),
      axios.get(`${apiUrl}/api/social/friend-requests`, {
        withCredentials: true,
        headers: getAuthHeaders()
      })
    ]);

    if (friendsResult.status === 'fulfilled') {
      dispatch(setFriends(friendsResult.value.data?.friends?.slice(0, 4) || []));
    } else {
      console.error('Failed to fetch friends:', friendsResult.reason);
      dispatch(setFriends([]));
    }

    if (requestsResult.status === 'fulfilled') {
      dispatch(setPendingRequestCount(requestsResult.value.data?.requests?.length || 0));
    } else {
      console.error('Failed to fetch friend requests:', requestsResult.reason);
      dispatch(setPendingRequestCount(0));
    }
  }, [apiUrl]);

  const fetchActivityHeatmap = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await axios.get(`${apiUrl}/api/learning/me/activity`, {
        withCredentials: true,
        headers: getAuthHeaders()
      });
      dispatch(setActivityData(Array.isArray(res.data?.activity) ? res.data.activity : []));
    } catch (error) {
      console.error('Failed to fetch activity heatmap:', error);
    }
  }, [apiUrl]);

  const handleEnrollAndStart = async (courseId) => {
    dispatch(setIsEnrollingCourse(courseId));
    dispatch(setOverviewError(""));

    try {
      await axios.post(
        `${apiUrl}/api/learning/courses/${courseId}/enroll`,
        {},
        {
          withCredentials: true,
          headers: getAuthHeaders()
        }
      );
      await dispatch(fetchLearningOverview());
      navigate(`/language/${courseId}`);
    } catch (error) {
      dispatch(setOverviewError(error.response?.data?.message || "Could not enroll in this course."));
    } finally {
      dispatch(setIsEnrollingCourse(""));
    }
  };

  // Check if monthly reward already claimed
  const userIdentifier = useMemo(() => {
    return getUserIdentifier(currentUser);
  }, [currentUser]);
  // console.log("User Identifier:", currentUser,'currentuser:', userIdentifier);

  const displayName = useMemo(() => {
    return getUserDisplayName(currentUser);
  }, [currentUser]);

  useEffect(() => {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const rewards = currentUser?.rewards || [];
    const alreadyClaimed = rewards.some(r => r.month === currentMonth && r.claimed);
    dispatch(setRewardClaimed(alreadyClaimed));
  }, [currentUser]);

  const handleClaimReward = async () => {
    dispatch(setIsClaimingReward(true));
    try {
      const res = await axios.post(
        `${apiUrl}/api/auth/user/rewards/claim`,
        {},
        { withCredentials: true, headers: getAuthHeaders() }
      );
      if (res.data?.user) {
        const merged = { ...(getStoredUser() || {}), ...res.data.user };
        localStorage.setItem("user", JSON.stringify(merged));
        dispatch(setCurrentUser(merged));
        window.dispatchEvent(new Event("auth:user-updated"));
      }
      dispatch(setRewardClaimed(true));
    } catch (error) {
      console.error("Failed to claim reward:", error);
    } finally {
      dispatch(setIsClaimingReward(false));
    }
  };

  useEffect(() => {
    dispatch(fetchLearningOverview());
  }, [dispatch, userIdentifier]);

  useEffect(() => {
    // fetchBadges();
    fetchFriends();
    fetchActivityHeatmap();
  }, [fetchFriends, fetchActivityHeatmap, userIdentifier]);

  const isFirstDashboardVisit = useMemo(() => {
    const firstVisitKey = `dashboard-first-visit:${userIdentifier}`;
    const hasVisited = localStorage.getItem(firstVisitKey) === "true";
    if (!hasVisited) localStorage.setItem(firstVisitKey, "true");
    return !hasVisited;
  }, [userIdentifier]);

  const greeting = isFirstDashboardVisit
    ? `Hello ${displayName}! 👋`
    : `Welcome Back, ${displayName}! 👋`;

  // const filteredCourses = useMemo(() => {
  //   const normalizedSearch = searchTerm.trim().toLowerCase();
  //   let list = enrolledCourses.filter((course) => {
  //     const matchesSearch = !normalizedSearch || course.title.toLowerCase().includes(normalizedSearch);
  //     const matchesStatus = statusFilter === "All" || course.tag === statusFilter;
  //     return matchesSearch && matchesStatus;
  //   });

  //   if (sortBy === "progress_asc") list = [...list].sort((a, b) => a.progress - b.progress);
  //   if (sortBy === "progress_desc") list = [...list].sort((a, b) => b.progress - a.progress);
  //   if (sortBy === "alpha") list = [...list].sort((a, b) => a.title.localeCompare(b.title));

  //   return list;
  // }, [enrolledCourses, searchTerm, sortBy, statusFilter]);

  const calendarData = useMemo(() => {
    // Build a map from activityData (real API data)
    const activityMap = new Map();
    for (const item of activityData) {
      const key = typeof item.date === 'string' ? item.date.slice(0, 10) : '';
      if (key) activityMap.set(key, item.count || 0);
    }

    const data = [];
    const today = new Date();
    const oneYearAgo = new Date(today);
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    let currentDate = new Date(oneYearAgo);
    while (currentDate <= today) {
      const y = currentDate.getFullYear();
      const m = String(currentDate.getMonth() + 1).padStart(2, '0');
      const d = String(currentDate.getDate()).padStart(2, '0');
      const key = `${y}-${m}-${d}`;
      data.push({ date: new Date(currentDate), count: activityMap.get(key) || 0 });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return data;
  }, [activityData]);

  return (
    <>
      <ParticleCanvas />

      {/* <div className="min-h-screen text-white pt-16 z-10 scroll-smooth flex font-sans bg-[#111113]">
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-none rounded-2xl p-6 border-[#2a3a4a] shadow-lg">
              <div className="flex flex-col sm:flex-row gap-3 mb-4 items-start sm:items-center">
                <div className="flex-1 flex gap-2"> */}

      <div className="min-h-screen bg-[#0f1419] font-sans text-white">
        <main className="p-3 sm:p-4 md:p-8">
          <header className="mb-7">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-2">{greeting}</h1>
            <p className="text-gray-400 text-sm sm:text-base">Continue your journey.</p>
          </header>

          {/* ── CONTINUE LEARNING HERO ──────────────────────────────────────── */}
          {/* {enrolledCourses.length > 0 && (() => {
            const recent = [...enrolledCourses].sort((a, b) => (b.progress || 0) - (a.progress || 0)).find(c => c.progress < 100) || enrolledCourses[0];
            const catalog = courseCatalog[recent.id] || {};
            return (
              <div className="mb-6 relative overflow-hidden rounded-2xl border border-cyan-500/20 bg-linear-to-r from-[#0d1b2a] via-[#1b2838] to-[#0d1b2a] p-5 sm:p-7 shadow-xl">
                <div className="absolute top-0 right-0 w-60 h-60 rounded-full bg-cyan-500/5 -translate-y-1/2 translate-x-1/3" />
                <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="text-5xl">{catalog.icon || '📘'}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-1">Continue Learning</p>
                    <h3 className="text-xl sm:text-2xl font-extrabold text-white truncate">{recent.title}</h3>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex-1 bg-[#0f1419] rounded-full h-2 overflow-hidden border border-[#1f2a38] max-w-xs">
                        <div className="bg-linear-to-r from-cyan-400 to-emerald-400 h-full rounded-full transition-all" style={{ width: `${recent.progress}%` }} />
                      </div>
                      <span className="text-xs text-gray-400 font-mono">{recent.progress}%</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{recent.lessons}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate(`/language/${recent.id}`)}
                    className="shrink-0 px-6 py-3 rounded-xl font-bold text-sm bg-linear-to-r from-cyan-500 to-emerald-500 text-white hover:brightness-110 transition shadow-lg shadow-cyan-500/20 flex items-center gap-2"
                  >
                    <FaPlayCircle /> Resume
                  </button>
                </div>
              </div>
            );
          })()} */}


          {/* Languages You're Learning */}
          <div className="bg-[#1a23325c] rounded-2xl p-6 border border-[#2a3a4a] shadow-lg mb-6">
            <h3 className="text-xl font-bold mb-4">Languages You're Learning</h3>
            <div className="grid grid-cols-1 gap-4">
              {languageProgressData.length === 0 ? (
                <div className="bg-[#141b24] rounded-xl p-4 border border-[#1f2a38] text-sm text-gray-400">
                  Enroll in a course to see your personal learning levels here.
                </div>
              ) : (
                languageProgressData.map((lang) => (
                  <div key={lang.id} className="mb-6 relative overflow-hidden rounded-2xl border border-cyan-500/20 bg-linear-to-r from-[#0d1b2a] via-[#1b2838] to-[#0d1b2a] p-5 sm:p-7 shadow-xl">
                    <div className="absolute top-0 right-0 w-60 h-60 rounded-full bg-cyan-500/5 -translate-y-1/2 translate-x-1/3" />
                    <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <div className="text-5xl">{lang.icon || '📘'}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-1">Continue Learning</p>
                        <h3 className="text-xl sm:text-2xl font-extrabold text-white truncate">{lang.title}</h3>
                        <div className="flex items-center gap-3 mt-2">
                          <div className="flex-1 bg-[#0f1419] rounded-full h-2 overflow-hidden border border-[#1f2a38] max-w-xs">
                            <div className="bg-linear-to-r from-cyan-400 to-emerald-400 h-full rounded-full transition-all" style={{ width: `${lang.progress}%` }} />
                          </div>
                          <span className="text-xs text-gray-400 font-mono">{lang.progress}%</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{lang.lessons}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => navigate(`/language/${lang.id}`)}
                        className="shrink-0 px-6 py-3 rounded-xl font-bold text-sm bg-linear-to-r from-cyan-500 to-emerald-500 text-white hover:brightness-110 transition shadow-lg shadow-cyan-500/20 flex items-center gap-2"
                      >
                        <FaPlayCircle /> Resume
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Your Courses Section */}
          {/* <div className="bg-[#1a2332] rounded-2xl p-6 border mb-6 border-[#2a3a4a] shadow-lg">
                <p className="text-xl font-mono uppercase tracking-widest text-cyan-400 mb-1">Enrolled Courses</p>
                <div className="align-center md:grid-cols-3 justify-between flex mb-5">
                  <div className="flex items-center gap-2 bg-[#141b24] border border-[#1f2a38] rounded-lg px-3 py-2 text-sm">
                    <FaSearch className="text-cyan-400" />

                    <input
                      type="text"
                      placeholder="Search courses..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="flex-1 bg-[#0f1419] border border-[#2a3a4a] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div className="text-xs text-gray-400">
                    {isOverviewLoading ? "Loading..." : `${filteredCourses.length} courses`}
                  </div>
                </div>

                {filteredCourses.length === 0 ? (
                  <div className="text-center text-sm text-gray-400 py-10">
                    {isOverviewLoading
                      ? "Loading your enrolled courses..."
                      : "No enrolled courses yet. Pick a course above to get started."}
                  </div>
                ) : (
                  <div className="grid  grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredCourses.map((course) => (
                      <div key={course.id} className=" rounded-xl bg-[#141b24] p-4 border border-[#1f2a38]">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-bold">{course.title}</h3>
                          <span className="text-xs font-semibold text-cyan-300 bg-cyan-600/20 border border-cyan-600/50 px-2 py-1 rounded-full">
                            {course.tag}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mb-3">{course.lessons}</p>
                        <div className="w-full bg-[#0f1419] rounded-full h-2 overflow-hidden border border-[#1f2a38]">
                          <div
                            className="bg-linear-to-r from-cyan-400 to-emerald-400 h-full rounded-full"
                            style={{ width: `${course.progress}%` }}
                          ></div>
                        </div>
                        <div className="mt-2 text-xs text-gray-400">{course.progress}% complete</div>
                        <button
                          className="mt-4 w-full bg-cyan-500 cursor-pointer hover:bg-cyan-600 text-white font-bold py-2 rounded-lg transition"
                          onClick={() => {
                            window.location.href = `/levels/${course.id}`;
                          }}
                          type="button"
                        >
                          Resume
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div> */}

          {/* ── MONTHLY REWARD BANNER ─────────────────────────────────────────── */}
          {!rewardClaimed && !rewardBannerDismissed && (
            <div className="mb-6 relative overflow-hidden rounded-2xl border border-amber-500/30 bg-linear-to-r from-amber-500/10 via-orange-500/10 to-rose-500/10 p-5 sm:p-6 shadow-lg">
              <div className="absolute top-0 right-0 w-40 h-40 bg-amber-400/5 rounded-full -translate-y-1/2 translate-x-1/3" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-orange-400/5 rounded-full translate-y-1/2 -translate-x-1/4" />
              <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="text-4xl sm:text-5xl" style={{ animation: 'rewardPulse 2s ease-in-out infinite' }}>🎁</div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-amber-200">Monthly Reward Available!</h3>
                    <p className="text-sm text-amber-200/60 mt-0.5">
                      Claim your <span className="text-amber-400 font-bold">+50 XP</span> bonus reward for this month
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleClaimReward}
                    disabled={isClaimingReward}
                    className="px-6 py-2.5 rounded-xl font-bold text-sm bg-linear-to-r from-amber-400 to-orange-400 text-gray-950 hover:brightness-110 transition disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-amber-500/20"
                  >
                    {isClaimingReward ? 'Claiming...' : '🎉 Claim Reward'}
                  </button>
                  <button
                    onClick={() => dispatch(setRewardBannerDismissed(true))}
                    className="p-2 text-amber-200/40 hover:text-amber-200/70 transition"
                    type="button"
                  >
                    <FaTimes />
                  </button>
                </div>
              </div>
              <style>{`
              @keyframes rewardPulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.1) rotate(5deg); }
              }
            `}</style>
            </div>
          )}

          {/* {rewardClaimed && !rewardBannerDismissed && (
          <div className="mb-6 relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-linear-to-r from-emerald-500/10 to-cyan-500/10 p-4 sm:p-5 shadow-lg">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">✅</span>
                <p className="text-sm text-emerald-300 font-semibold">Monthly reward claimed! +50 XP earned this month.</p>
              </div>
              <button
                onClick={() => setRewardBannerDismissed(true)}
                className="p-1.5 text-emerald-300/40 hover:text-emerald-300/70 transition shrink-0"
                type="button"
              >
                <FaTimes />
              </button>
            </div>
          </div>
        )} */}

          {/*Grid Divider*/}
          {/* <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6"> */}
          {/* <div className="rounded-xl border border-[#2a3a4a] bg-[#1a2332] p-4 text-center">
            <div className="text-2xl sm:text-3xl font-extrabold text-orange-400">{totalXP.toLocaleString()}</div>
            <div className="text-[0.68rem] uppercase tracking-wider text-gray-500 mt-1">Total XP</div>
          </div> */}
          {/* <div className="rounded-xl border border-[#2a3a4a] bg-[#1a2332] p-4 text-center">
            <div className="text-2xl sm:text-3xl font-extrabold text-orange-400">{learningOverview.stats?.league || "Bronze"}</div>
            <div className="text-[0.68rem] uppercase tracking-wider text-gray-500 mt-1">Total XP</div>
          </div>
          <div className="rounded-xl border border-[#2a3a4a] bg-[#1a2332] p-4 text-center">
            <div className="text-2xl sm:text-3xl font-extrabold text-cyan-400">Lv.{currentLevel}</div>
            <div className="text-[0.68rem] uppercase tracking-wider text-gray-500 mt-1">Level</div>
          </div>
          <div className="rounded-xl border border-[#2a3a4a] bg-[#1a2332] p-4 text-center">
            <div className="text-2xl sm:text-3xl font-extrabold text-red-400">🔥 {Number(currentUser?.streakCount || 0)}</div>
            <div className="text-[0.68rem] uppercase tracking-wider text-gray-500 mt-1">Day Streak</div>
          </div>
          <div className="rounded-xl border border-[#2a3a4a] bg-[#1a2332] p-4 text-center">
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">#{userRank || "-"}</div>
            <div className="text-[0.68rem] uppercase tracking-wider text-gray-500 mt-1">Rank</div>
          </div>
        </div> */}

          {/* Progress to level section */}
          <div className="bg-[#1a2332] rounded-2xl p-6 border border-[#2a3a4a] shadow-lg mb-6">
            <div className="mb-5">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-semibold">Progress to Level {currentLevel + 1}</span>
                <span className="text-xs text-gray-400">{totalXP}/{xpToNextLevel} XP</span>
              </div>
              <div className="w-full bg-[#0f1419] rounded-full h-3 overflow-hidden border border-[#1f2a38]">
                <div
                  className="bg-linear-to-r from-cyan-400 to-emerald-400 h-full rounded-full"
                  style={{ width: `${levelProgress}%` }}
                ></div>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="bg-[#141b24] rounded-xl p-4 text-center border border-[#1f2a38]">
                <div className={`text-3xl font-bold ${{ Bronze: 'text-amber-600', Silver: 'text-gray-300', Gold: 'text-yellow-400', Platinum: 'text-cyan-300' }[learningOverview.stats?.league] || 'text-amber-600'}`}>
                  {learningOverview.stats?.league || "Bronze"}
                </div>
                <div className="text-gray-400 text-xs mt-1">LEAGUE</div>
              </div>
              <div className="bg-[#141b24] rounded-xl p-4 text-center border border-[#1f2a38]">
                <div className="text-cyan-400 text-3xl font-bold">Lv. {currentLevel}</div>
                <div className="text-gray-400 text-xs mt-1">CURRENT LEVEL</div>
              </div>
              <div className="bg-[#141b24] rounded-xl p-4 text-center border border-[#1f2a38]">
                <div className="text-orange-400 text-3xl font-bold">🔥 {totalXP}</div>
                <div className="text-gray-400 text-xs mt-1">Total XP</div>
              </div>
              <div className="bg-[#141b24] rounded-xl p-4 text-center border border-[#1f2a38]">
                <div className="text-emerald-400 text-3xl font-bold">#{userRank || "-"}</div>
                <div className="text-gray-400 text-xs mt-1">YOUR GLOBAL RANK</div>
              </div>
            </div>
          </div>


          {/* Pick a course to begin with section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <section className="lg:col-span-2 space-y-6">
              <div className="bg-[#1a2332] rounded-2xl p-5 sm:p-6 border border-[#2a3a4a] shadow-lg">
                <div className="flex items-center justify-between mb-5 gap-3">
                  <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                    <FaGraduationCap className="text-cyan-400" /> Pick a Course to Begin With
                  </h2>
                  <button
                    type="button"
                    onClick={() => navigate("/learn")}
                    className="text-xs sm:text-sm text-cyan-300 hover:text-cyan-200 font-semibold flex items-center gap-1"
                  >
                    View all <FaArrowRight className="text-[11px]" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {featuredCourses.map((course) => (
                    <article key={course.id} className="rounded-xl p-4 border border-[#1f2a38] bg-[#141b24]">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-bold">{course.title}</h3>
                        <span className="text-[11px] px-2 py-1 rounded-full border border-cyan-600/40 bg-cyan-600/20 text-cyan-200">
                          {course.topic}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 min-h-12">{course.description}</p>
                      <button
                        type="button"
                        onClick={() => {
                          if (enrolledCourseIds.has(course.id)) {
                            navigate(course.to);
                            return;
                          }
                          handleEnrollAndStart(course.id);
                        }}
                        disabled={isEnrollingCourse === course.id}
                        className="mt-4 w-full py-2.5 rounded-lg bg-linear-to-r from-cyan-400 to-emerald-400 text-gray-950 font-bold hover:opacity-90 transition flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        <FaPlayCircle />
                        {isEnrollingCourse === course.id
                          ? "Enrolling..."
                          : enrolledCourseIds.has(course.id)
                            ? "Continue Course"
                            : course.cta}
                      </button>
                    </article>
                  ))}
                </div>

                {overviewError ? (
                  <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">
                    {overviewError}
                  </div>
                ) : null}
              </div>

              {/* Weekly Goals */}
              <div className="bg-[#1a2332] rounded-2xl p-6 border border-[#2a3a4a] shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <FaFlag className="text-emerald-400" /> Weekly Goals
                  </h3>
                </div>
                <div className="space-y-4">
                  {weeklyGoals.map((goal) => {
                    const percent = Math.round((goal.current / goal.total) * 100);
                    return (
                      <div key={goal.title} className="bg-[#141b24] rounded-lg p-3 border border-[#1f2a38]">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="font-semibold">{goal.title}</span>
                          <span className="text-gray-400">{goal.current}/{goal.total}</span>
                        </div>
                        <div className="w-full bg-[#0f1419] rounded-full h-2 overflow-hidden border border-[#1f2a38]">
                          <div
                            className="bg-linear-to-r from-emerald-400 to-cyan-400 h-full rounded-full"
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/*Upcoming lessons section*/}
              {/* <div className="bg-[#1a2332] rounded-2xl p-6 border border-[#2a3a4a] shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <FaClock className="text-cyan-400" /> Upcoming Lessons
                </h3>
                <button className="text-cyan-400 text-xs font-bold hover:underline" type="button">
                  View schedule →
                </button>
              </div>
              <div className="space-y-3">
                {upcomingLessons.map((lesson) => (
                  <div key={lesson.title} className="bg-[#141b24] rounded-lg p-3 border border-[#1f2a38]">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-semibold">{lesson.title}</div>
                        <div className="text-xs text-gray-400">{lesson.course}</div>
                      </div>
                      <div className="text-xs text-gray-400">{lesson.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div> */}

              <div className="bg-[#1a2332] rounded-2xl p-6 border border-[#2a3a4a] shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <FaCrown className="text-orange-400" /> Global Leaderboard
                  </h3>
                  <button className="text-cyan-400 text-xs font-bold hover:underline" type="button">VIEW ALL →</button>
                </div>
                <div className="space-y-3">
                  {leaderboardData.map((player) => (
                    <div
                      key={`${player.rank}-${player.name}`}
                      className={`flex items-center justify-between p-3 rounded-lg transition border ${player.isUser ? "bg-cyan-600/20 border-cyan-500/50" : "bg-[#141b24] hover:bg-[#1f2a38] border-[#1f2a38]"
                        }`}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className="text-xl font-bold text-orange-400 w-8 text-center">{player.medal}</div>
                        <div>
                          <div className="font-bold text-sm">{player.name}</div>
                          <div className="text-xs text-gray-500">#{player.rank}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-cyan-400">{player.xp}</div>
                        <div className="text-xs text-gray-500">XP</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>


            {/* Left Section */}
            <aside className="space-y-6">

              {/* <div className="bg-[#1a2332] rounded-2xl p-6 border border-[#2a3a4a] shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <FaBell className="text-cyan-400" /> Notifications
                  </h3>
                  <button className="text-cyan-400 text-xs font-bold hover:underline" type="button">See all</button>
                </div>
                <div className="space-y-3">
                  {userNotifications.length === 0 ? (
                    <div className="bg-[#141b24] rounded-lg p-3 border border-[#1f2a38] text-xs text-gray-500">
                      No notifications yet.
                    </div>
                  ) : (
                    userNotifications.map((note) => (
                      <div key={note._id || note.title} className="bg-[#141b24] rounded-lg p-3 border border-[#1f2a38]">
                        <div className="text-sm font-semibold">{note.title}</div>
                        <div className="text-xs text-gray-500">{note.detail}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {note.createdAt ? new Date(note.createdAt).toLocaleString() : "Latest"}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div> */}

              <div className="bg-[#1a2332] rounded-2xl p-6 border border-[#2a3a4a] shadow-lg">
                <div className="text-center mb-4">
                  <div className="text-5xl sm:text-6xl mb-2">🔥</div>
                  <h3 className="text-xl sm:text-2xl font-bold">{Number(currentUser?.streakCount || 0)} Day Streak!</h3>
                  <p className="text-gray-400 text-sm mt-1">Keep it going!</p>
                </div>
                <div className="bg-linear-to-b from-orange-600/30 to-red-600/30 border border-orange-600/50 rounded-xl p-4 mb-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold">{Number(currentUser?.streakCount || 0)}</div>
                    <div className="text-sm text-gray-300">Days in a row</div>
                  </div>
                </div>
                <button
                  className="w-full bg-[#141b24] hover:bg-[#1f2a38] text-cyan-400 font-bold py-2 rounded-lg transition border border-[#1f2a38]"
                  onClick={() => dispatch(setShowCalenderModal(true))}
                  type="button"
                >
                  View Calendar
                </button>
              </div>

              <CourseMarketColumn />

              <div className="bg-[#1a2332] rounded-2xl p-6 border border-[#2a3a4a] shadow-lg">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <FaMedal className="text-orange-400" />Achievements
                </h3>
                <div className="space-y-3">
                  {isLoadingBadges ? (
                    <div className="text-center py-4 text-gray-400 text-sm">Loading badges...</div>
                  ) : earnedBadges.length === 0 ? (
                    <div className="bg-[#141b24] rounded-lg p-3 text-center border border-[#1f2a38]">
                      <div className="text-3xl mb-1">🎯</div>
                      <div className="text-sm font-bold">Start Learning</div>
                      <div className="text-xs text-gray-500 mt-1">Complete lessons to earn badges</div>
                    </div>
                  ) : (
                    earnedBadges.slice(0, 3).map((badge, index) => (
                      <div key={badge.id || index} className="bg-[#141b24] rounded-lg p-3 text-center border border-[#1f2a38]">
                        <div className="text-3xl mb-1">{badge.icon}</div>
                        <div className="text-sm font-bold">{badge.name}</div>
                        <div className="text-xs text-gray-500 mt-1">{badge.description}</div>
                        <div className={`text-xs font-semibold mt-1 ${badge.rarity === 'Legendary' ? 'text-orange-400' :
                          badge.rarity === 'Epic' ? 'text-purple-400' :
                            badge.rarity === 'Rare' ? 'text-blue-400' :
                              'text-gray-400'
                          }`}>{badge.rarity}</div>
                      </div>
                    ))
                  )}
                </div>
                {earnedBadges.length > 0 && (
                  <button
                    type="button"
                    onClick={() => navigate('/profile')}
                    className="mt-4 w-full py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-sm font-semibold transition"
                  >
                    View All Badges ({earnedBadges.length})
                  </button>
                )}
              </div>

              <div className="bg-[#1a2332] rounded-2xl p-6 border border-[#2a3a4a] shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <FaUsers className="text-cyan-400" /> Friends
                    {pendingRequestCount > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {pendingRequestCount}
                      </span>
                    )}
                  </h3>
                  <button
                    onClick={() => navigate('/friends')}
                    className="text-cyan-400 text-xs font-bold hover:underline"
                    type="button"
                  >
                    View all
                  </button>
                </div>
                {friends.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <FaUsers className="text-4xl mx-auto mb-3 opacity-50" />
                    <p className="text-sm mb-2">No friends yet</p>
                    <button
                      onClick={() => navigate('/friends')}
                      className="text-cyan-400 text-sm hover:underline"
                    >
                      Find friends
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {friends.map((friend) => (
                      <div key={friend._id} className="bg-[#141b24] rounded-lg p-3 border border-[#1f2a38] hover:border-cyan-600/30 transition cursor-pointer" onClick={() => navigate('/friends')}>
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-full bg-linear-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-sm font-bold shrink-0">
                            {friend.profilePic ? (
                              <img src={friend.profilePic} alt={friend.username} className="w-full h-full rounded-full object-cover" />
                            ) : (
                              friend.username[0].toUpperCase()
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-sm truncate">{friend.username}</div>
                            <div className="text-xs text-gray-400">{friend.league}</div>
                          </div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>{friend.totalXp.toLocaleString()} XP</span>
                          <span>Level {friend.level}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Activity Feed */}
              {/* <div className="bg-[#1a2332] rounded-2xl p-6 border border-[#2a3a4a] shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold">Activity Feed</h3>
                  <button className="text-cyan-400 text-xs font-bold hover:underline" type="button">View all</button>
                </div>
                <div className="space-y-3">
                  {activityFeed.map((activity) => (
                    <div key={activity.title + activity.detail} className="bg-[#141b24] rounded-lg p-3 border border-[#1f2a38]">
                      <div className="text-sm font-semibold">{activity.title}</div>
                      <div className="text-xs text-gray-500">{activity.detail}</div>
                      <div className="text-xs text-gray-500 mt-1">{activity.time}</div>
                    </div>
                  ))}
                </div>
              </div> */}
            </aside>

          </div>
          {showCalendarModal && (
            <div
              className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
              onClick={() => dispatch(setShowCalenderModal(false))}
            >
              <div
                className="bg-[#1a2332] rounded-2xl border border-[#2a3a4a] p-4 sm:p-6 max-w-5xl w-full max-h-[90vh] overflow-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold mb-1">Your Learning Calendar</h2>
                    <p className="text-sm text-gray-400">
                      {calendarData.reduce((sum, d) => sum + d.count, 0)} submissions in the past year
                    </p>
                  </div>
                  <button onClick={() => dispatch(setShowCalenderModal(false))} className="text-gray-400 hover:text-white transition" type="button">
                    <FaTimes className="text-2xl" />
                  </button>
                </div>
                <CalendarHeatmap data={calendarData} />
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
};