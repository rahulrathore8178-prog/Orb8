import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { FaTrophy, FaFire, FaClock, FaCheckCircle, FaLock, FaBolt, FaBullseye, FaMedal } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { setChallenges, setIsLoading, setSelectedTab } from '../redux/slices/challengePageSlice';
import { setError } from '../redux/slices/postSlice';
 
/* ─── Design tokens ─────────────────────────────────────────── */
const TAB_META = {
  daily:   { label: 'Daily',   icon: FaBolt,      accent: '#00e5ff', glow: '0 0 24px #00e5ff44', ring: '#00e5ff33', dim: '#00e5ff18', tag: 'cyan'   },
  weekly:  { label: 'Weekly',  icon: FaBullseye,  accent: '#a78bfa', glow: '0 0 24px #a78bfa44', ring: '#a78bfa33', dim: '#a78bfa18', tag: 'violet' },
  monthly: { label: 'Monthly', icon: FaMedal,     accent: '#fb923c', glow: '0 0 24px #fb923c44', ring: '#fb923c33', dim: '#fb923c18', tag: 'orange' },
};
 
function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}
 
function getTimeRemaining(expiresAt) {
  const diff = new Date(expiresAt) - new Date();
  if (diff <= 0) return 'Expired';
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (d > 0) return `${d}d ${h}h left`;
  if (h > 0) return `${h}h ${m}m left`;
  return `${m}m left`;
}
 
/* ─── Animated progress bar ─────────────────────────────────── */
function ProgressBar({ pct, accent }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.width = '0%';
    requestAnimationFrame(() => {
      el.style.transition = 'width 0.9s cubic-bezier(0.22,1,0.36,1)';
      el.style.width = `${pct}%`;
    });
  }, [pct]);
 
  return (
    <div style={{
      height: 6,
      background: '#0d1520',
      borderRadius: 99,
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* track shimmer */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(90deg, transparent 0%, #ffffff08 50%, transparent 100%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 2s linear infinite',
      }} />
      <div ref={ref} style={{
        height: '100%',
        background: `linear-gradient(90deg, ${accent}99, ${accent})`,
        borderRadius: 99,
        boxShadow: `0 0 10px ${accent}88`,
        position: 'relative',
      }} />
    </div>
  );
}
 
/* ─── Challenge row (list format) ───────────────────────────── */
function ChallengeRow({ challenge, onClaim, accent, dim, ring, index }) {
  const pct = Math.min(100, Math.round((challenge.progress / challenge.goalValue) * 100));
  const canClaim = challenge.completed && !challenge.rewardClaimed;
  const [hover, setHover] = useState(false);
 
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        padding: '20px 24px',
        background: hover ? '#131e2e' : '#0e1825',
        border: `1px solid ${hover ? ring : '#1a2535'}`,
        borderRadius: 16,
        transition: 'all 0.25s ease',
        cursor: 'default',
        position: 'relative',
        overflow: 'hidden',
        animation: `fadeSlideIn 0.4s ease both`,
        animationDelay: `${index * 0.07}s`,
      }}
    >
      {/* Glow left accent strip */}
      <div style={{
        position: 'absolute', left: 0, top: '15%', bottom: '15%',
        width: 3, borderRadius: '0 3px 3px 0',
        background: challenge.completed ? accent : '#1a2535',
        boxShadow: challenge.completed ? `0 0 12px ${accent}` : 'none',
        transition: 'all 0.3s ease',
      }} />
 
      {/* Row: icon + info + badge */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, paddingLeft: 12 }}>
        {/* Icon bubble */}
        <div style={{
          width: 48, height: 48, borderRadius: 12, flexShrink: 0,
          background: dim,
          border: `1px solid ${ring}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20,
        }}>
          {challenge.type === 'daily' ? '⚡' : challenge.type === 'weekly' ? '🎯' : '🏆'}
        </div>
 
        {/* Title + desc */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 15, color: '#e8f0fe', letterSpacing: 0.2 }}>
              {challenge.title}
            </span>
            {challenge.completed && (
              <span style={{
                fontSize: 11, fontWeight: 700, letterSpacing: 1,
                color: accent, background: dim,
                border: `1px solid ${ring}`,
                padding: '2px 8px', borderRadius: 99,
                textTransform: 'uppercase',
              }}>
                {challenge.rewardClaimed ? 'Claimed' : 'Complete'}
              </span>
            )}
          </div>
          <p style={{ fontSize: 13, color: '#4a6080', margin: '3px 0 0', lineHeight: 1.5 }}>
            {challenge.description}
          </p>
        </div>
 
        {/* XP badge */}
        <div style={{
          flexShrink: 0,
          fontSize: 13, fontWeight: 800, fontFamily: "'Syne', sans-serif",
          color: accent,
          background: dim,
          border: `1px solid ${ring}`,
          padding: '5px 12px', borderRadius: 99,
          letterSpacing: 0.5,
          whiteSpace: 'nowrap',
        }}>
          +{challenge.xpReward} XP
        </div>
      </div>
 
      {/* Progress section */}
      <div style={{ paddingLeft: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: 13, color: '#3a5270', fontFamily: "'DM Mono', monospace" }}>
            {challenge.progress} / {challenge.goalValue}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontSize: 13, color: accent, fontWeight: 700 }}>{pct}%</span>
          </div>
        </div>
        <ProgressBar pct={pct} accent={accent} />
      </div>
 
      {/* Footer: time + action */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingLeft: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#2e4460', fontSize: 12 }}>
          <FaClock style={{ fontSize: 11 }} />
          <span>{getTimeRemaining(challenge.expiresAt)}</span>
        </div>
 
        {challenge.completed ? (
          canClaim ? (
            <button
              type="button"
              onClick={() => onClaim(challenge.id)}
              style={{
                padding: '8px 20px',
                background: `linear-gradient(135deg, #10b981, ${accent})`,
                border: 'none',
                borderRadius: 10,
                color: '#fff',
                fontWeight: 800,
                fontSize: 13,
                fontFamily: "'Syne', sans-serif",
                cursor: 'pointer',
                letterSpacing: 0.5,
                boxShadow: `0 4px 20px #10b98166`,
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
              }}
              onMouseEnter={e => { e.target.style.transform = 'translateY(-1px)'; e.target.style.boxShadow = `0 8px 28px #10b98188`; }}
              onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = `0 4px 20px #10b98166`; }}
            >
              Claim Reward →
            </button>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#10b981', fontSize: 13, fontWeight: 700 }}>
              <FaCheckCircle />
              <span>Reward Claimed</span>
            </div>
          )
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#2e4460', fontSize: 13 }}>
            <FaLock style={{ fontSize: 11 }} />
            <span>In Progress</span>
          </div>
        )}
      </div>
    </div>
  );
}
 
/* ─── Stats summary bar ─────────────────────────────────────── */
function StatsBar({ challenges, accent }) {
  const total = challenges.length;
  const done = challenges.filter(c => c.completed).length;
  const claimed = challenges.filter(c => c.rewardClaimed).length;
  const totalXP = challenges.filter(c => c.rewardClaimed).reduce((s, c) => s + c.xpReward, 0);
 
  const stats = [
    { label: 'Total', value: total },
    { label: 'Completed', value: done },
    { label: 'Claimed', value: claimed },
    { label: 'XP Earned', value: `+${totalXP}` },
  ];
 
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: 1,
      background: '#1a2535',
      borderRadius: 14,
      overflow: 'hidden',
      border: '1px solid #1a2535',
      marginBottom: 20,
    }}>
      {stats.map((s, i) => (
        <div key={i} style={{
          padding: '14px 20px',
          background: '#0e1825',
          textAlign: 'center',
        }}>
          <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 20, color: accent }}>{s.value}</div>
          <div style={{ fontSize: 11, color: '#3a5270', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', marginTop: 2 }}>{s.label}</div>
        </div>
      ))}
    </div>
  );
}
 
/* ─── Main page ─────────────────────────────────────────────── */
export default function ChallengePage() {
  // const [selectedTab, setSelectedTab] = useState('daily');
  // const [challenges, setChallenges] = useState([]);
  // const [isLoading, setIsLoading] = useState(true);
  // const [error, setError] = useState(null);
  const dispatch = useDispatch();
  const selectedTab = useSelector(state => state.challengePage.selectedTab);
  const challenges = useSelector(state => state.challengePage.challenges);
  const isLoading = useSelector(state => state.challengePage.isLoading);
  const error = useSelector(state => state.challengePage.error);

  const meta = TAB_META[selectedTab];
 
  useEffect(() => {
    fetchChallenges();
    const interval = setInterval(fetchChallenges, 60000);
    return () => clearInterval(interval);
  }, [selectedTab]);
 
  async function fetchChallenges() {
    dispatch(setIsLoading(true));
    dispatch(setError(null));
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const res = await axios.get(`${apiUrl}/api/challenges?type=${selectedTab}`, {
        withCredentials: true,
        headers: getAuthHeaders(),
      });
      dispatch(setChallenges(res.data.challenges || []));
    } catch (err) {
      dispatch(setError(err.response?.data?.message || 'Failed to load challenges'));
    } finally {
      dispatch(setIsLoading(false));
    }
  }
 
  async function handleClaimReward(challengeId) {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const res = await axios.post(
        `${apiUrl}/api/challenges/${challengeId}/claim`,
        {},
        { withCredentials: true, headers: getAuthHeaders() }
      );
      alert(`🎉 ${res.data.message}\n+${res.data.xpEarned} XP earned!`);
      fetchChallenges();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to claim reward');
    }
  }
 
  return (
    <>
      {/* Global keyframes injected via style tag */}
      {/* <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Mono:wght@400;500&family=Inter:wght@400;500;600&display=swap');
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @keyframes fadeSlideIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulseGlow { 0%,100%{opacity:0.6} 50%{opacity:1} }
        @keyframes rotateSlow { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        * { box-sizing: border-box; }
      `}</style>
  */}
      <div className="min-h-screen bg-[#0f1419] font-sans text-white">
        {/* Background radial glow (decorative) */}
        <div style={{
          position: 'fixed', top: -200, right: -200,
          width: 600, height: 600, borderRadius: '50%',
          background: `radial-gradient(circle, ${meta.accent}0d 0%, transparent 70%)`,
          pointerEvents: 'none',
          transition: 'background 0.5s ease',
        }} />
        <div style={{
          position: 'fixed', bottom: -300, left: -100,
          width: 700, height: 700, borderRadius: '50%',
          background: 'radial-gradient(circle, #1a2535 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
 
        <div style={{ maxWidth: 780, margin: '0 auto', position: 'relative' }}>
 
          {/* ── Header ─────────────────────────────────────────── */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 6 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14,
                background: '#f59e0b18',
                border: '1px solid #f59e0b33',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22,
              }}>
                🏆
              </div>
              <div>
                <h1 style={{
                  margin: 0,
                  fontFamily: "'Syne', sans-serif",
                  fontWeight: 800,
                  fontSize: 28,
                  letterSpacing: -0.5,
                  color: '#e8f0fe',
                }}>
                  Challenges
                </h1>
                <p style={{ margin: 0, fontSize: 13, color: '#3a5270' }}>
                  Complete missions to earn bonus XP
                </p>
              </div>
            </div>
          </div>
 
          {/* ── Tabs ───────────────────────────────────────────── */}
          <div style={{
            display: 'flex',
            gap: 8,
            marginBottom: 24,
            background: '#0b1420',
            padding: 6,
            borderRadius: 14,
            border: '1px solid #1a2535',
          }}>
            {Object.entries(TAB_META).map(([key, t]) => {
              const active = selectedTab === key;
              const Icon = t.icon;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => dispatch(setSelectedTab(key))}
                  style={{
                    flex: 1,
                    padding: '10px 0',
                    background: active ? t.dim : 'transparent',
                    border: active ? `1px solid ${t.ring}` : '1px solid transparent',
                    borderRadius: 10,
                    color: active ? t.accent : '#2e4460',
                    fontFamily: "'Syne', sans-serif",
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                    transition: 'all 0.2s ease',
                    letterSpacing: 0.3,
                    boxShadow: active ? t.glow : 'none',
                  }}
                >
                  <Icon style={{ fontSize: 13 }} />
                  {t.label}
                </button>
              );
            })}
          </div>
 
          {/* ── Stats bar ─────────────────────────────────────── */}
          {!isLoading && !error && challenges.length > 0 && (
            <StatsBar challenges={challenges} accent={meta.accent} />
          )}
 
          {/* ── Challenge list ─────────────────────────────────── */}
          <div>
            {isLoading ? (
              <div style={{ textAlign: 'center', padding: '64px 0' }}>
                <div style={{
                  width: 44, height: 44,
                  border: `3px solid ${meta.accent}`,
                  borderTopColor: 'transparent',
                  borderRadius: '50%',
                  margin: '0 auto 16px',
                  animation: 'rotateSlow 0.8s linear infinite',
                }} />
                <p style={{ color: '#2e4460', fontSize: 14 }}>Loading challenges...</p>
              </div>
            ) : error ? (
              <div style={{ textAlign: 'center', padding: '64px 0' }}>
                <p style={{ color: '#f87171', marginBottom: 16 }}>{error}</p>
                <button
                  type="button"
                  onClick={fetchChallenges}
                  style={{
                    padding: '9px 24px',
                    background: '#0e1825',
                    border: `1px solid ${meta.ring}`,
                    borderRadius: 10,
                    color: meta.accent,
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontFamily: "'Syne', sans-serif",
                  }}
                >
                  Retry
                </button>
              </div>
            ) : challenges.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '64px 0', color: '#2e4460', fontSize: 14 }}>
                No {selectedTab} challenges available right now.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {challenges.map((c, i) => (
                  <ChallengeRow
                    key={c.id}
                    challenge={c}
                    onClaim={handleClaimReward}
                    accent={meta.accent}
                    dim={meta.dim}
                    ring={meta.ring}
                    index={i}
                  />
                ))}
              </div>
            )}
          </div>
 
          {/* ── Pro Tip banner ─────────────────────────────────── */}
          <div style={{
            marginTop: 28,
            padding: '16px 20px',
            background: '#0b1420',
            border: '1px solid #1a2535',
            borderRadius: 14,
            display: 'flex',
            gap: 14,
            alignItems: 'flex-start',
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, flexShrink: 0,
              background: '#fb923c18',
              border: '1px solid #fb923c33',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <FaFire style={{ color: '#fb923c', fontSize: 14 }} />
            </div>
            <div>
              <p style={{ margin: '0 0 4px', fontSize: 13, fontWeight: 700, color: '#e8f0fe', fontFamily: "'Syne', sans-serif" }}>
                Pro Tip
              </p>
              <p style={{ margin: 0, fontSize: 12.5, color: '#2e4460', lineHeight: 1.7 }}>
                Challenges reset automatically — daily every 24h, weekly every Monday, monthly on the 1st. Claim before they expire!
              </p>
            </div>
          </div>
 
        </div>
      </div>
    </>
  );
}