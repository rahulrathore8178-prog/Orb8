// src/routes/LevelsRoute.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCourseData } from './components/LandingPage/LevelData.js';

const STORAGE_KEY = 'lms_levels_unlocked_v1_vertical';

function LockIcon({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M7 10V8a5 5 0 0110 0v2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect
        x="4" y="10" width="16" height="10" rx="2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * LevelsRoute
 * Props:
 *   courseId  — string matching a key in COURSE_REGISTRY  e.g. "python"
 *   onBack    — optional callback for the back button
 */
export default function LevelsRoute({ courseId, onBack }) {
  const navigate   = useNavigate();
  const courseData = getCourseData(courseId);
  // const getCourseData = courseData.totalChapters;

  // ── Unlocked state ──────────────────────────────────────────────────────────
  const [unlocked, setUnlocked] = useState(() => {
    try {
      // Use a per-course storage key so different courses don't share progress
      const raw = localStorage.getItem(`${STORAGE_KEY}_${courseId}`);
      if (!raw) return [1];
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length) return parsed;
      return [1];
    } catch {
      return [1];
    }
  });

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_${courseId}`, JSON.stringify(unlocked));
  }, [unlocked, courseId]);

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const levels = useMemo(
    () => Array.from({ length: courseData.totalChapters }, (_, i) => ({
      id:    i + 1,
      title: courseData.chapters[i]?.name ?? `Level ${i + 1}`,
    })),
    [courseData.totalChapters, courseData.chapters]
  );

  const isUnlocked = (id) => unlocked.includes(id);

  // Navigate to the level content page
  function handleEnterLevel(id) {
    if (!isUnlocked(id)) return;
    navigate(`/level/${courseId}/${id}`);
  }

  // ── SVG layout constants ────────────────────────────────────────────────────
  const startY      = 40;
  const step        = 100;
  const totalHeight = startY + (courseData.totalChapters - 1) * step;

  // ── Scroll to last unlocked on mount ────────────────────────────────────────
  const scrollContainerRef = useRef(null);
  const lastUnlocked = useMemo(() => Math.max(...unlocked), [unlocked]);

  useEffect(() => {
    const t = setTimeout(() => {
      const el = document.getElementById(`node-${lastUnlocked}`);
      if (el && scrollContainerRef.current) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
        const container = scrollContainerRef.current;
        const rect  = el.getBoundingClientRect();
        const cRect = container.getBoundingClientRect();
        container.scrollTop += rect.top - cRect.top - cRect.height / 2 + rect.height / 2;
      }
    }, 120);
    return () => clearTimeout(t);
  }, [lastUnlocked]);

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
      <div className="max-w-7xl mx-auto">

        {/* ── Header ── */}
        <header className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3">
              {courseId && onBack && (
                <button
                  onClick={onBack}
                  className="text-gray-400 hover:text-white transition"
                  title="Back"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M19 12H5M5 12l7 7m-7-7 7-7"
                      stroke="currentColor" strokeWidth="2"
                      strokeLinecap="round" strokeLinejoin="round"
                    />
                  </svg>
                </button>
              )}
              <h1 className="text-3xl font-semibold tracking-tight">
                {courseData.language}
              </h1>
            </div>
            <p className="text-gray-400 mt-1">
              Complete all {LEVEL_COUNT} levels to master {courseData.language}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-300">Progress</div>
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg"
              style={{
                background: `linear-gradient(135deg, ${courseData.accentColor}, ${courseData.accentLight})`,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-white">
                <path
                  d="M20 6L9 17l-5-5"
                  stroke="currentColor" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </header>

        {/* ── Three-column layout ── */}
        <div className="grid grid-cols-12 gap-6">

          {/* Left panel */}
          <aside className="col-span-3">
            <div className="sticky top-6 bg-gray-800/70 rounded-2xl p-4 border border-gray-700 shadow-[0_10px_30px_rgba(2,6,23,0.6)]">
              <div className="mb-4">
                <div className="text-sm text-gray-400">Profile</div>
                <div className="mt-3 flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-gray-900 font-bold"
                    style={{
                      background: `linear-gradient(135deg, ${courseData.accentColor}, ${courseData.accentLight})`,
                    }}
                  >
                    CS
                  </div>
                  <div>
                    <div className="text-sm font-medium">Codify</div>
                    <div className="text-xs text-gray-400">Level player</div>
                  </div>
                </div>
              </div>

              <nav className="space-y-2">
                {[
                  { label: 'Learn',        color: 'bg-indigo-500/80' },
                  { label: 'Practice',     color: 'bg-emerald-400/80' },
                  { label: 'Leaderboards', color: 'bg-amber-400/80' },
                  { label: 'Quests',       color: 'bg-rose-400/80' },
                  { label: 'Shop',         color: 'bg-sky-400/80' },
                  { label: 'Profile',      color: 'bg-violet-400/80' },
                  { label: 'More',         color: 'bg-gray-400/80' },
                ].map(({ label, color }) => (
                  <button
                    key={label}
                    className="w-full text-left px-3 py-2 rounded-md bg-gray-700/30 hover:bg-gray-700 transition flex items-center gap-3"
                  >
                    <span className={`w-3 h-3 rounded-full ${color}`} />
                    <span className="text-sm">{label}</span>
                  </button>
                ))}
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
                        <stop offset="0%"   stopColor="#cbd5e1" stopOpacity="0.95" />
                        <stop offset="100%" stopColor="#94a3b8" stopOpacity="0.6" />
                      </linearGradient>
                    </defs>

                    {/* Path line */}
                    <line
                      x1="110" y1={startY} x2="110" y2={totalHeight}
                      stroke="url(#verticalPathGrad)"
                      strokeWidth="14" strokeLinecap="round"
                    />
                    <line
                      x1="110" y1={startY} x2="110" y2={totalHeight}
                      stroke="#374151" strokeWidth="2"
                      strokeDasharray="6 10" strokeLinecap="round" opacity="0.28"
                    />

                    {/* Level nodes — level 1 at the bottom */}
                    {levels.map((lvl, idx) => {
                      const cy           = startY + (LEVEL_COUNT - 1 - idx) * step;
                      const unlockedFlag = isUnlocked(lvl.id);

                      return (
                        <g id={`node-${lvl.id}`} key={lvl.id} transform={`translate(110, ${cy})`}>
                          {/* Outer ring */}
                          <circle
                            r="36"
                            fill="transparent"
                            stroke={unlockedFlag ? courseData.accentColor : '#374151'}
                            strokeWidth="2.5"
                            opacity={unlockedFlag ? 0.95 : 0.7}
                          />

                          {/* Node fill */}
                          <defs>
                            <radialGradient id={`nodeGrad${lvl.id}`} cx="30%" cy="30%">
                              <stop offset="0%"   stopColor={unlockedFlag ? '#ecfeff' : '#f3f4f6'} stopOpacity="0.95" />
                              <stop offset="50%"  stopColor={unlockedFlag ? courseData.accentColor : '#9ca3af'} stopOpacity="0.95" />
                              <stop offset="100%" stopColor={unlockedFlag ? courseData.accentLight : '#6b7280'} stopOpacity="0.95" />
                            </radialGradient>
                          </defs>
                          <circle
                            r="28"
                            fill={unlockedFlag ? `url(#nodeGrad${lvl.id})` : '#6b7280'}
                            opacity={unlockedFlag ? 1 : 0.95}
                          />

                          {/* Clickable button via foreignObject */}
                          <foreignObject x="-28" y="-28" width="56" height="56">
                            <div className="w-full h-full flex items-center justify-center">
                              <button
                                onClick={() => handleEnterLevel(lvl.id)}
                                title={unlockedFlag ? `Start ${lvl.title}` : 'Locked'}
                                className={`w-14 h-14 rounded-full flex items-center justify-center transition-transform ${
                                  unlockedFlag ? 'hover:scale-105 cursor-pointer' : 'cursor-not-allowed opacity-80'
                                }`}
                                style={{
                                  background: unlockedFlag
                                    ? `linear-gradient(135deg, ${courseData.accentColor}, ${courseData.accentLight})`
                                    : '#4b5563',
                                  border: unlockedFlag
                                    ? '1px solid rgba(255,255,255,0.1)'
                                    : '1px solid rgba(255,255,255,0.02)',
                                  boxShadow: unlockedFlag
                                    ? `0 6px 18px ${courseData.accentColor}33`
                                    : 'none',
                                }}
                              >
                                {unlockedFlag ? (
                                  <span className="text-sm font-bold text-white">{lvl.id}</span>
                                ) : (
                                  <LockIcon className="w-4 h-4 text-gray-300" />
                                )}
                              </button>
                            </div>
                          </foreignObject>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>
            </div>
          </main>

          {/* Right panel */}
          <aside className="col-span-3">
            <div className="sticky top-6 bg-gray-800/70 rounded-2xl p-4 border border-gray-700 shadow-[0_10px_30px_rgba(2,6,23,0.6)]">
              <div className="mb-4">
                <div className="text-sm text-gray-400">Standings</div>
                <div className="mt-3 p-3 rounded-md bg-gray-800/40 border border-gray-700">
                  <div className="text-sm font-medium">You're ranked #4</div>
                  <div className="text-xs text-gray-400 mt-1">Almost at the top 3!</div>
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-400 mb-2">Daily Quests</div>
                <div className="space-y-3">
                  {[
                    { label: 'Earn 50 XP',                          val: '50 / 50',  pct: 100, color: 'bg-emerald-400' },
                    { label: 'Score 90%+ in 3 lessons',             val: '3 / 3',    pct: 100, color: 'bg-amber-400'   },
                    { label: 'Get 10 in a row correct in 4 lessons', val: '4 / 4',   pct: 100, color: 'bg-rose-400'    },
                  ].map(({ label, val, pct, color }) => (
                    <div key={label} className="p-3 rounded-md bg-gray-800/40 border border-gray-700">
                      <div className="text-xs text-gray-300">{label}</div>
                      <div className="text-sm font-medium text-gray-100">{val}</div>
                      <div className="w-full h-2 bg-gray-700 rounded mt-2 overflow-hidden">
                        <div className={`h-2 ${color}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Course progress */}
              <div className="mt-4 p-3 rounded-md bg-gray-800/40 border border-gray-700">
                <div className="text-xs text-gray-400 mb-2">
                  {courseData.language} Progress
                </div>
                <div className="flex justify-between text-xs text-gray-300 mb-1">
                  <span>{unlocked.length} / {LEVEL_COUNT} unlocked</span>
                  <span>{Math.round((unlocked.length / LEVEL_COUNT) * 100)}%</span>
                </div>
                <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${(unlocked.length / LEVEL_COUNT) * 100}%`,
                      background: `linear-gradient(90deg, ${courseData.accentColor}, ${courseData.accentLight})`,
                    }}
                  />
                </div>
              </div>

              <div className="mt-4">
                <button
                  onClick={() => {
                    localStorage.removeItem(`${STORAGE_KEY}_${courseId}`);
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
  );
}