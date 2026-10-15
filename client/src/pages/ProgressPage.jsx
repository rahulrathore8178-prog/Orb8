import { useEffect, useState, useCallback, useMemo } from 'react';
import axios from 'axios';
import { 
  FaChartLine, 
  FaTrophy, 
  FaFire, 
  FaStar,
  FaGraduationCap,
  FaClock,
  FaCheckCircle,
  FaChartBar,
  FaMedal,
  FaBolt
} from 'react-icons/fa';
import CalendarHeatmap from '../components/shared/CalendarHeatmap';

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function ProgressPage() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [calendarData, setCalendarData] = useState([]);
  const apiUrl = import.meta.env.VITE_API_URL || '';

  const fetchProgress = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${apiUrl}/api/learning/me/progress`, {
        withCredentials: true,
        headers: getAuthHeaders()
      });
      setData(res.data);

      // Build calendar heatmap data from daily activity
      const activityMap = {};
      for (const entry of (res.data?.daily || [])) {
        activityMap[entry.date] = { count: entry.count || 0, xp: entry.xp || 0 };
      }
      const days = [];
      const today = new Date();
      const startDate = new Date(today);
      startDate.setFullYear(startDate.getFullYear() - 1);
      let cur = new Date(startDate);
      while (cur <= today) {
        const key = cur.toISOString().slice(0, 10);
        days.push({ date: new Date(cur), count: activityMap[key]?.count || 0 });
        cur.setDate(cur.getDate() + 1);
      }
      setCalendarData(days);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load progress data');
    } finally {
      setIsLoading(false);
    }
  }, [apiUrl]);

  useEffect(() => { fetchProgress(); }, [fetchProgress]);

  const stats = data?.stats || {};
  const courses = data?.courses || [];
  const weeklyXp = data?.weeklyXp || [];

  // Derived stats
  const totalXp = stats.totalXp || 0;
  const level = stats.level || 1;
  const levelProgress = stats.levelProgressPercent || 0;
  const xpToNextLevel = stats.xpToNextLevel || 500;
  const currentLevelMinXp = (level - 1) * 500;
  const xpInCurrentLevel = totalXp - currentLevelMinXp;
  const completedCourses = stats.coursesCompleted || 0;

  // SVG ring
  const radius = 78;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset = circumference - (levelProgress / 100) * circumference;

  // Weekly chart scaling
  const maxWeeklyXp = useMemo(() => Math.max(...weeklyXp.map(w => w.xp), 1), [weeklyXp]);
  const totalWeeklyXp = useMemo(() => weeklyXp.reduce((s, w) => s + w.xp, 0), [weeklyXp]);

  // Streak milestones
  const streak = stats.streakCount || 0;
  const streakMilestones = [
    { days: 3,   label: '3 Days',   icon: '🔥', reached: streak >= 3 },
    { days: 7,   label: '1 Week',   icon: '⚡', reached: streak >= 7 },
    { days: 14,  label: '2 Weeks',  icon: '💪', reached: streak >= 14 },
    { days: 30,  label: '1 Month',  icon: '🏅', reached: streak >= 30 },
    { days: 60,  label: '2 Months', icon: '🌟', reached: streak >= 60 },
    { days: 100, label: '100 Days', icon: '💯', reached: streak >= 100 },
    { days: 365, label: '1 Year',   icon: '🏆', reached: streak >= 365 },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f1419] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-400">Loading your progress…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f1419] text-white p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ─── Header ──────────────────────────────────────────────────────── */}
        <div className="bg-[#1a2332] rounded-2xl p-6 border border-[#2a3a4a] shadow-lg flex items-center gap-4">
          <FaChartLine className="text-4xl text-cyan-400 shrink-0" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold">Your Progress</h1>
            <p className="text-gray-400 text-sm">Track every step of your learning journey</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-600/20 border border-red-600/50 rounded-xl p-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* ─── Stat Cards ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={<FaStar className="text-amber-400" />} label="Total XP" value={totalXp.toLocaleString()} sub={`Rank #${stats.rank || '–'}`} />
          <StatCard icon={<FaCheckCircle className="text-emerald-400" />} label="Courses Completed" value={completedCourses} sub={`${courses.length} enrolled`} accent="emerald" />
          <StatCard icon={<FaFire className="text-orange-500" />} label="Day Streak" value={streak} sub="consecutive days" accent="orange" />
          <StatCard icon={<FaBolt className="text-purple-400" />} label="Lessons Done" value={stats.totalLessonsCompleted || 0} sub={`Level ${level} · ${stats.league || 'Bronze 1'}`} accent="purple" />
        </div>

        {/* ─── Level Ring + Weekly XP Chart ─────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Level ring */}
          <div className="bg-[#1a2332] rounded-2xl p-6 border border-[#2a3a4a] shadow-lg flex flex-col items-center">
            <h2 className="text-lg font-bold mb-5 flex items-center gap-2 self-start">
              <FaTrophy className="text-yellow-400" /> Level Progress
            </h2>
            <div className="relative">
              <svg width="190" height="190" className="transform -rotate-90">
                <circle cx="95" cy="95" r={radius} stroke="#1f2a38" strokeWidth="12" fill="none" />
                <circle
                  cx="95" cy="95" r={radius}
                  stroke="url(#lvlGrad)" strokeWidth="12" fill="none"
                  strokeDasharray={circumference} strokeDashoffset={strokeOffset}
                  strokeLinecap="round" className="transition-all duration-700"
                />
                <defs>
                  <linearGradient id="lvlGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#06b6d4" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-black text-cyan-400">{level}</span>
                <span className="text-xs text-gray-400">Level</span>
              </div>
            </div>
            <div className="w-full mt-5 space-y-1">
              <div className="flex justify-between text-xs text-gray-400">
                <span>{xpInCurrentLevel} XP</span>
                <span>{xpToNextLevel - currentLevelMinXp} XP</span>
              </div>
              <div className="w-full bg-[#141b24] rounded-full h-2 overflow-hidden">
                <div
                  className="h-2 rounded-full bg-linear-to-r from-cyan-500 to-purple-500 transition-all duration-500"
                  style={{ width: `${levelProgress}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 text-center mt-1">{xpToNextLevel - totalXp} XP to Level {level + 1}</p>
            </div>
          </div>

          {/* Weekly XP Bar Chart */}
          <div className="lg:col-span-2 bg-[#1a2332] rounded-2xl p-6 border border-[#2a3a4a] shadow-lg flex flex-col">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <FaChartBar className="text-cyan-400" /> Weekly XP (Last 12 Weeks)
              </h2>
              <span className="text-xs text-gray-500">{totalWeeklyXp.toLocaleString()} XP total</span>
            </div>

            <div className="flex-1 flex items-end gap-2 min-h-50">
              {weeklyXp.map((week, i) => {
                const pct = maxWeeklyXp > 0 ? (week.xp / maxWeeklyXp) * 100 : 0;
                return (
                  <div key={i} className="flex-1 min-w-0 flex flex-col items-center gap-1 group">
                    <div className="relative w-full flex justify-center">
                      {/* Tooltip */}
                      <div className="absolute -top-10 hidden group-hover:flex bg-[#0f1419] border border-[#2a3a4a] rounded-lg px-2 py-1 text-xs text-cyan-300 whitespace-nowrap z-10 shadow-lg">
                        {week.xp} XP · {week.lessons} lessons
                      </div>
                      <div
                        className="w-full max-w-10 rounded-t-md bg-linear-to-t from-cyan-600 to-purple-500 transition-all duration-300 hover:from-cyan-500 hover:to-purple-400 cursor-pointer"
                        style={{ height: `${Math.max(pct, 2)}%`, minHeight: week.xp > 0 ? '8px' : '3px' }}
                      />
                    </div>
                    <span className="text-[10px] text-gray-500 leading-tight text-center truncate w-full">
                      {week.weekLabel}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-3 text-center text-sm text-gray-400">
              Average: <span className="text-cyan-400 font-semibold">{weeklyXp.length > 0 ? Math.round(totalWeeklyXp / weeklyXp.length) : 0}</span> XP / week
            </div>
          </div>
        </div>

        {/* ─── Streak History ──────────────────────────────────────────────── */}
        <div className="bg-[#1a2332] rounded-2xl p-6 border border-[#2a3a4a] shadow-lg">
          <h2 className="text-lg font-bold mb-5 flex items-center gap-2">
            <FaFire className="text-orange-400" /> Streak Milestones
          </h2>
          <div className="flex items-center gap-2 mb-4">
            <div className="text-3xl font-black text-orange-500">{streak}</div>
            <span className="text-gray-400 text-sm">day streak</span>
          </div>
          {/* milestone track */}
          <div className="relative">
            <div className="absolute top-5 left-0 right-0 h-1 bg-[#141b24] rounded-full" />
            <div
              className="absolute top-5 left-0 h-1 bg-linear-to-r from-orange-500 to-amber-400 rounded-full transition-all duration-700"
              style={{ width: `${Math.min((streak / 365) * 100, 100)}%` }}
            />
            <div className="relative flex justify-between">
              {streakMilestones.map((m) => (
                <div key={m.days} className="flex flex-col items-center z-10">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 transition-all ${
                      m.reached
                        ? 'bg-orange-500/20 border-orange-400 shadow-lg shadow-orange-500/20'
                        : 'bg-[#141b24] border-[#2a3a4a]'
                    }`}
                  >
                    {m.reached ? m.icon : <span className="text-gray-600 text-sm">🔒</span>}
                  </div>
                  <span className={`text-[10px] mt-1.5 font-semibold ${m.reached ? 'text-orange-300' : 'text-gray-600'}`}>
                    {m.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ─── Activity Heatmap ────────────────────────────────────────────── */}
        <div className="bg-[#1a2332] rounded-2xl p-6 border border-[#2a3a4a] shadow-lg">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <FaMedal className="text-emerald-400" /> Activity Heatmap
          </h2>
          {calendarData.length > 0 ? (
            <CalendarHeatmap data={calendarData} />
          ) : (
            <p className="text-gray-500 text-sm text-center py-8">Complete lessons to see your activity.</p>
          )}
        </div>

        {/* ─── Per-Course Progress ────────────────────────────────────────── */}
        <div className="bg-[#1a2332] rounded-2xl p-6 border border-[#2a3a4a] shadow-lg">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <FaGraduationCap className="text-purple-400" /> Course Breakdown
          </h2>
          {courses.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p>You haven't enrolled in any courses yet.</p>
              <a href="/learn" className="text-cyan-400 hover:underline mt-2 inline-block">Browse courses</a>
            </div>
          ) : (
            <div className="space-y-4">
              {courses.map((course) => (
                <div key={course.id} className="bg-[#141b24] rounded-xl p-4 border border-[#1f2a38]">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-lg bg-linear-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-lg font-black shrink-0">
                        {course.title[0]}
                      </div>
                      <div>
                        <h3 className="font-bold">{course.title}</h3>
                        <p className="text-xs text-gray-500">{course.domain} · {course.level}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="flex items-center gap-1.5 text-sm">
                        {course.status === 'completed'
                          ? <FaCheckCircle className="text-emerald-500" />
                          : <FaClock className="text-orange-400" />}
                        <span className={`font-semibold ${course.status === 'completed' ? 'text-emerald-500' : 'text-orange-400'}`}>
                          {course.tag}
                        </span>
                      </div>
                      <div className="text-[11px] text-gray-500 mt-0.5">
                        {course.completedLectures}/{course.totalLectures} lessons
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mb-1">
                    <div className="flex-1 bg-[#0f1419] rounded-full h-2.5 overflow-hidden">
                      <div
                        className="h-2.5 rounded-full bg-linear-to-r from-cyan-500 to-purple-500 transition-all duration-500"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-cyan-400 w-10 text-right">{course.progress}%</span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                    <span className="flex items-center gap-1">
                      <FaStar className="text-amber-400" /> {(course.totalPoints || 0).toLocaleString()} XP
                    </span>
                    <a href={`/levels/${course.id}`} className="text-cyan-400 hover:text-cyan-300 font-semibold">
                      Continue →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Reusable stat card ───────────────────────────────────────────────────── */
function StatCard({ icon, label, value, sub, accent = 'cyan' }) {
  const colors = {
    cyan:    'text-cyan-400',
    emerald: 'text-emerald-400',
    orange:  'text-orange-500',
    purple:  'text-purple-400',
  };
  return (
    <div className="bg-[#1a2332] rounded-xl p-5 border border-[#2a3a4a] shadow-lg">
      <div className="flex items-center gap-3 mb-1.5">
        <span className="text-2xl">{icon}</span>
        <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">{label}</span>
      </div>
      <div className={`text-3xl font-black ${colors[accent]}`}>{value}</div>
      {sub && <div className="text-xs text-gray-500 mt-1">{sub}</div>}
    </div>
  );
}
