// src/routes/LevelsRoute.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCourseData } from '../components/LandingPage/LevelData';
import ParticleCanvas from '../components/LandingPage/ParticleCanvas';
import axios from 'axios';
import CodeMirror from '@uiw/react-codemirror';
// import { javascript } from '@codemirror/lang-javascript';
// import { python } from '@codemirror/lang-python';
// import { oneDark } from '@codemirror/theme-one-dark';

const STORAGE_KEY_PREFIX = 'lms_levels_unlocked_v1_';
const ForeignObject = 'foreignObject';

// Format course ID to display name
const formatCourseName = (courseId) => {
  if (!courseId) return 'Course Map';
  return courseId
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

function LockIcon({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M7 10V8a5 5 0 0110 0v2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="4" y="10" width="16" height="10" rx="2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * LevelsRoute
 * - Use as the element for your /levels route.
 * - Renders a premium vertical level map with left/right side panels.
 * - Level 1 appears at the bottom. On load it scrolls to the last unlocked level.
 */
export default function LevelsRoute({ courseId, onBack }) {
  const apiUrl = import.meta.env.VITE_API_URL || '';
  const courseName = formatCourseName(courseId);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [testResults, setTestResults] = useState([]);
  const [dailyChallenges, setDailyChallenges] = useState([]);
  const storageKey = `${STORAGE_KEY_PREFIX}${(courseId || 'default').toLowerCase()}`;
  const [unlocked, setUnlocked] = useState(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return [1];
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length) return parsed;
      return [1];
    } catch {
      return [1];
    }
  });

  // Get the specific course data based on courseId
  const courseData = useMemo(() => getCourseData(courseId), [courseId]);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(unlocked));
  }, [unlocked, storageKey]);

  // Fetch backend progress on mount and compute unlocked levels
  useEffect(() => {
    if (!courseId) return;
    const token = localStorage.getItem('token');
    if (!token) return;

    async function fetchProgress() {
      try {
        const res = await axios.get(`${apiUrl}/api/learning/me/progress`, {
          withCredentials: true,
          headers: { Authorization: `Bearer ${token}` }
        });
        const courses = res.data?.courses || [];
        const match = courses.find(c => c.id?.toLowerCase() === courseId.toLowerCase());
        if (match && match.completedLectures > 0) {
          // Unlock all completed levels + the next one
          const newUnlocked = [];
          for (let i = 1; i <= match.completedLectures; i++) newUnlocked.push(i);
          const nextLevel = match.completedLectures + 1;
          if (nextLevel <= (match.totalLectures || courseData.totalChapters)) {
            newUnlocked.push(nextLevel);
          }
          setUnlocked(prev => {
            const merged = new Set([...prev, ...newUnlocked]);
            return Array.from(merged).sort((a, b) => a - b);
          });
        }
      } catch {
        // Fall back to localStorage state
      }
    }
    fetchProgress();
  }, [apiUrl, courseId, courseData.totalChapters]);

  const levels = useMemo(
    () => Array.from({ length: courseData.totalChapters }, (_, i) => ({ id: i + 1, title: `Level ${i + 1}` })),
    [courseData.totalChapters]
  );

  const isUnlocked = (id) => unlocked.includes(id);

  const navigate = useNavigate();
  // const courseName = formatCourseName(courseId);
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const syncProgressWithBackend = async (levelId) => {
    if (!courseId) return;
    const token = localStorage.getItem('token');
    if (!token) return;

    const chapter = courseData.chapters?.find(ch => ch.no === levelId);
    const chapterXP = chapter?.totalXP || 120;

    try {
      await axios.patch(
        `${apiUrl}/api/learning/courses/${courseId}/progress`,
        {
          lectureNumber: levelId,
          completed: true,
          points: chapterXP
        },
        {
          withCredentials: true,
          headers: getAuthHeaders()
        }
      );
    } catch {
      // Keep local UX smooth even if server sync fails.
    }
  };

  function handleEnterLevel(id) {
    if (!isUnlocked(id)) return;
    navigate(`/level/${courseId}/${id}`);
  }

  function markComplete(id) {
    const next = id + 1;
    setUnlocked((prev) => {
      const set = new Set(prev);
      if (!set.has(next) && next <= courseData.totalChapters) set.add(next);
      return Array.from(set).sort((a, b) => a - b);
    });

    syncProgressWithBackend(id);
  }

  // Layout constants for SVG
  const startY = 40;
  const step = 100;
  const totalHeight = startY + (courseData.totalChapters - 1) * step;

  // Refs for scrolling
  const scrollContainerRef = useRef(null);

  // compute last unlocked (highest unlocked id)
  const lastUnlocked = useMemo(() => Math.max(...unlocked), [unlocked]);

  // Scroll to the last unlocked node on mount and when unlocked changes
  useEffect(() => {
    // small delay to ensure SVG nodes are rendered
    const id = `node-${lastUnlocked}`;
    const t = setTimeout(() => {
      const el = document.getElementById(id);
      if (el && scrollContainerRef.current) {
        // scroll so the node is centered in the visible area
        el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
        // also nudge the container scrollTop for better centering in some browsers
        const container = scrollContainerRef.current;
        const rect = el.getBoundingClientRect();
        const cRect = container.getBoundingClientRect();
        const offset = rect.top - cRect.top - cRect.height / 2 + rect.height / 2;
        container.scrollTop += offset;
      }
    }, 120);
    return () => clearTimeout(t);
  }, [lastUnlocked]);

  // Fetch daily challenges
  useEffect(() => {
    async function fetchDailyChallenges() {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await axios.get(`${apiUrl}/api/challenges?type=daily`, {
          withCredentials: true,
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });

        setDailyChallenges(response.data.challenges || []);
      } catch (error) {
        console.error('Failed to fetch daily challenges:', error);
      }
    }

    fetchDailyChallenges();
  }, [apiUrl]);

  return (
    <>
    <ParticleCanvas />
  <div className="min-h-screen bg-[#111113] text-gray-100 p-6">
    <div className="max-w-7xl mx-auto">
      {/* Top header */}
      <header className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            {courseId && onBack && (
              <button
                onClick={onBack}
                className="text-gray-400 hover:text-white transition"
                title="Back to Dashboard"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M19 12H5M5 12l7 7m-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}
            <h1 className="text-3xl font-semibold tracking-tight">{courseName}</h1>
          </div>
          <p className="text-gray-400 mt-1">
            {courseId
              ? `Complete all levels to master ${courseName}`
              : "Vertical progression — first level starts at the bottom"
            }
          </p>
        </div>
      </header>

      {/* Main layout: left panel, center map, right panel */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left panel */}
        <aside className="col-span-3">
          <div
            className="sticky top-6 bg-gray-800/70 rounded-2xl p-4 border border-gray-700 shadow-[0_10px_30px_rgba(2,6,23,0.6)] transform-gpu"
            style={{ transform: 'perspective(800px) translateZ(0)', backfaceVisibility: 'hidden' }}
          >
            <div className="mb-4">
              <div className="text-sm text-gray-400">Profile</div>
              <div className="mt-3 flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-600 to-teal-400 flex items-center justify-center text-gray-900 font-bold">CS</div>
                <div>
                  <div className="text-sm font-medium">Codify</div>
                  <div className="text-xs text-gray-400">Level player</div>
                </div>
              </div>
            </div>

            <nav className="space-y-2">
              <button className="w-full text-left px-3 py-2 rounded-md bg-gray-700/40 hover:bg-gray-700 transition flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-indigo-500/80" /> <span className="text-sm">Learn</span>
              </button>
              <button className="w-full text-left px-3 py-2 rounded-md bg-gray-700/30 hover:bg-gray-700 transition flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-emerald-400/80" /> <span className="text-sm">Practice</span>
              </button>
              <button className="w-full text-left px-3 py-2 rounded-md bg-gray-700/30 hover:bg-gray-700 transition flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-amber-400/80" /> <span className="text-sm">Leaderboards</span>
              </button>
              <button className="w-full text-left px-3 py-2 rounded-md bg-gray-700/30 hover:bg-gray-700 transition flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-rose-400/80" /> <span className="text-sm">Quests</span>
              </button>
              <button className="w-full text-left px-3 py-2 rounded-md bg-gray-700/30 hover:bg-gray-700 transition flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-sky-400/80" /> <span className="text-sm">Shop</span>
              </button>
              <button className="w-full text-left px-3 py-2 rounded-md bg-gray-700/30 hover:bg-gray-700 transition flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-violet-400/80" /> <span className="text-sm">Profile</span>
              </button>
              <button className="w-full text-left px-3 py-2 rounded-md bg-gray-700/30 hover:bg-gray-700 transition flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-gray-400/80" /> <span className="text-sm">More</span>
              </button>
            </nav>
          </div>
        </aside>

        {/* Center map */}
        <main className="col-span-6">
          <div className="relative bg-gradient-to-b from-gray-800/40 to-transparent rounded-2xl p-6 shadow-2xl overflow-hidden">
            <div className="absolute -left-28 -top-28 w-72 h-72 bg-gradient-to-tr from-indigo-700/20 via-teal-400/10 to-transparent rounded-full pointer-events-none blur-3xl" />

            <div
              ref={scrollContainerRef}
              className="w-full overflow-y-auto py-6"
              style={{ maxHeight: '72vh', scrollBehavior: 'smooth' }}
            >
              <div className="mx-auto" style={{ minWidth: 220 }}>
                <svg
                  className="w-56 mx-auto"
                  viewBox={`0 0 220 ${totalHeight + 80}`}
                  preserveAspectRatio="xMidYMin meet"
                  aria-hidden
                >
                  <defs>
                    <linearGradient id="verticalPathGrad" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#cbd5e1" stopOpacity="0.95" />
                      <stop offset="100%" stopColor="#94a3b8" stopOpacity="0.6" />
                    </linearGradient>
                  </defs>

                  {/* Bold visible path line (vertical) */}
                  <line
                    x1="110"
                    y1={startY}
                    x2="110"
                    y2={totalHeight}
                    stroke="url(#verticalPathGrad)"
                    strokeWidth="14"
                    strokeLinecap="round"
                  />

                  {/* Subtle dashed guide */}
                  <line
                    x1="110"
                    y1={startY}
                    x2="110"
                    y2={totalHeight}
                    stroke="#374151"
                    strokeWidth="2"
                    strokeDasharray="6 10"
                    strokeLinecap="round"
                    opacity="0.28"
                  />

                  {/* Nodes rendered so the first level appears at the bottom */}
                  {levels.map((lvl, idx) => {
                    // place levels from bottom to top: idx 0 -> bottom
                    const cy = startY + (courseData.totalChapters - 1 - idx) * step;
                    const unlockedFlag = isUnlocked(lvl.id);

                    return (
                      <g id={`node-${lvl.id}`} key={lvl.id} transform={`translate(110, ${cy})`}>
                        {/* Outer ring */}
                        <circle
                          r="36"
                          fill="transparent"
                          stroke={unlockedFlag ? '#0ea5a4' : '#374151'}
                          strokeWidth="2.5"
                          opacity={unlockedFlag ? 0.95 : 0.7}
                        />

                        {/* Node background */}
                        <defs>
                          <radialGradient id={`nodeGradV${lvl.id}`} cx="30%" cy="30%">
                            <stop offset="0%" stopColor={unlockedFlag ? '#ecfeff' : '#f3f4f6'} stopOpacity={unlockedFlag ? 0.95 : 0.9} />
                            <stop offset="50%" stopColor={unlockedFlag ? '#06b6d4' : '#9ca3af'} stopOpacity={unlockedFlag ? 0.95 : 0.9} />
                            <stop offset="100%" stopColor={unlockedFlag ? '#0ea5a4' : '#6b7280'} stopOpacity={unlockedFlag ? 0.95 : 0.9} />
                          </radialGradient>
                        </defs>

                        <circle r="28" fill={unlockedFlag ? `url(#nodeGradV${lvl.id})` : '#6b7280'} opacity={unlockedFlag ? 1 : 0.95} />

                        {/* Clickable button */}
                        <ForeignObject x="-28" y="-28" width="56" height="56">
                          <div className="w-full h-full flex items-center justify-center">
                            <button
                              onClick={() => handleEnterLevel(lvl.id)}
                              title={unlockedFlag ? `Play ${lvl.title}` : `Locked`}
                              className={`w-14 h-14 rounded-full absolute flex items-center justify-center transition-transform transform ${unlockedFlag ? 'hover:scale-105' : 'opacity-85'}`}
                              style={{
                                background: unlockedFlag ? 'linear-gradient(135deg,#0ea5a4 0%,#06b6d4 100%)' : '#4b5563',
                                border: unlockedFlag ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(255,255,255,0.02)',
                                boxShadow: unlockedFlag ? '0 6px 18px rgba(6,182,212,0.12)' : 'none',
                              }}
                            >

                              {/* {Lock icon} */}
                              {!unlockedFlag && (
                                <ForeignObject x="-16" y="-64" width="32" height="32" style={{ pointerEvents: 'none' }}>
                                  <div
                                    className="w-8 h-8 rounded-full relative z-10 bg-gray-700/70 flex items-center justify-center border border-gray-600/60"
                                    style={{ opacity: 0.6 }}
                                  >
                                    <LockIcon className="w-4 h-4 text-gray-300" />
                                  </div>
                                </ForeignObject>
                              )}

                              <span className={`text-sm font-semibold ${unlockedFlag ? 'text-white' : 'text-gray-200'}`}>{lvl.id}</span>
                            </button>
                          </div>
                        </ForeignObject>

                        {/* Lock badge above the number (pointer-events none so it doesn't block clicks) */}

                        {/* {!unlockedFlag && (
                            <ForeignObject x="-16" y="-64" width="32" height="32" style={{ pointerEvents: 'none' }}>
                              <div
                                className="w-8 h-8 rounded-full bg-gray-700/70 flex items-center justify-center border border-gray-600/60"
                                style={{ opacity: 0.6 }}
                              >
                                <LockIcon className="w-4 h-4 text-gray-300" />
                              </div>
                            </ForeignObject>
                          )} */}

                        {/* Level label below */}

                        {/* <text
                            x="0"
                            y="64"
                            textAnchor="middle"
                            className={`text-xs fill-current ${unlockedFlag ? 'text-gray-100' : 'text-gray-400'}`}
                            style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                          >
                            {lvl.title}
                          </text> */}
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>
          </div>
        </main>

        {/* Right side panel */}
        <aside className="col-span-3">
          <div className="h-full overflow-y-auto rounded-2xl bg-gray-800/30 p-5 text-gray-200 space-y-6">
            <div>
              <div className="text-sm text-gray-400 mb-2">Daily Quests</div>
              <div className="space-y-3">
                {dailyChallenges.length === 0 ? (
                  <div className="p-3 rounded-md bg-gray-800/40 border border-gray-700 text-xs text-gray-400">
                    Loading challenges...
                  </div>
                ) : (
                  dailyChallenges.map((challenge) => {
                    const progressPercent = Math.min(100, Math.round((challenge.progress / challenge.goalValue) * 100));
                    const barColor = challenge.completed 
                      ? 'bg-emerald-400' 
                      : progressPercent > 66 
                      ? 'bg-amber-400' 
                      : 'bg-rose-400';

                    return (
                      <div key={challenge.id} className="p-3 rounded-md bg-gray-800/40 border border-gray-700">
                        <div className="text-xs text-gray-300">{challenge.title}</div>
                        <div className="text-sm font-medium text-gray-100">
                          {challenge.progress} / {challenge.goalValue}
                        </div>
                        <div className="w-full h-2 bg-gray-700 rounded mt-2 overflow-hidden">
                          <div className={`h-2 ${barColor}`} style={{ width: `${progressPercent}%` }} />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="mt-4">
              <button
                onClick={() => {
                  localStorage.removeItem(storageKey);
                  setUnlocked([1]);
                }}
                className="w-full px-3 py-2 rounded-md bg-gray-700 hover:bg-gray-600 transition text-sm text-gray-200"
              >
                Reset Progress
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  </div>
  </>
);
}