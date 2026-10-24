import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import {
  FaUsers,
  FaLock,
  FaGlobe
} from 'react-icons/fa';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  setContent,
  setError,
  setImagePreview,
} from '../redux/slices/postSlice';
import {
  setPage,
  setPosts,
  addPostToTop,
  setActiveFeedType,
} from '../redux/slices/feedSlice';
import {
  fetchPosts,
  getAuthHeaders,
  handleLike,
  getStoredUser,
} from '../utilites/communityHelper';
import Capsules from '../components/Comments/Capsules';
import CapsulePostModal from '../components/Comments/CapsulePostModal';
import { Plus } from 'lucide-react';
import ComposerCard from '../components/CommunityFeed/ComposerCard';
import FilmPostCard from '../components/CommunityFeed/FilmPostCard';
import CreateOrbitalModal from '../components/Orbital/CreateOrbitalModal';
import gsap from 'gsap';
/* ─── Constants ───────────────────────────────────────────────── */

// Cycled per card — colored ambient glow
const GLOWS = [
  'radial-gradient(closest-side, rgba(217,70,239,0.4), rgba(56,189,248,0.2) 60%, transparent 78%)',
  'radial-gradient(closest-side, rgba(251,146,60,0.4), rgba(244,63,94,0.18) 60%, transparent 78%)',
  'radial-gradient(closest-side, rgba(52,211,153,0.38), rgba(56,189,248,0.18) 60%, transparent 78%)',
  'radial-gradient(closest-side, rgba(129,140,248,0.4), rgba(217,70,239,0.18) 60%, transparent 78%)',
  'radial-gradient(closest-side, rgba(250,204,21,0.38), rgba(251,113,133,0.18) 60%, transparent 78%)',
];

// Gradient backgrounds for text-only posts
const TEXT_GRADIENTS = [
  'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
  'linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)',
  'linear-gradient(135deg, #0d0d1a, #1a0533, #2d1b69)',
  'linear-gradient(135deg, #0a1628, #1a2a0a, #0a3d1c)',
  'linear-gradient(135deg, #1a0a00, #3a1a00, #4a2800)',
];

const AVATAR_PALETTE = [
  ['#00e5ff', '#003040'],
  ['#a78bfa', '#1a0a40'],
  ['#fb923c', '#3a1a00'],
  ['#34d399', '#003020'],
  ['#f472b6', '#40001a'],
];

const FEED_TYPES = [
  { value: 'feed', label: 'Your Feed' },
  { value: 'orbital', label: 'Orbital' },
];

export function AvatarInitial({ name, size = 44 }) {
  const initial = (name || '?')[0].toUpperCase();
  const [bg, text] = AVATAR_PALETTE[initial.charCodeAt(0) % AVATAR_PALETTE.length];
  return (
    <div
      className="flex items-center justify-center flex-shrink-0 rounded-full font-['Syne'] font-extrabold"
      style={{
        width: size,
        height: size,
        background: bg,
        color: text,
        fontSize: size * 0.38,
        border: `2px solid ${bg}66`,
      }}
    >
      {initial}
    </div>
  );
}

function ComposerModal({
  onPostCreated,
  onClose,
  composerFile,
  setComposerFile,
  composerPreview,
  setComposerPreview,
}) {
  const dispatch = useDispatch();

  // This is the ONLY way the modal closes. It always discards whatever
  // wasn't posted — draft text, selected file, preview — before closing.
  const handleDismiss = () => {
    if (composerPreview) URL.revokeObjectURL(composerPreview);
    setComposerFile(null);
    setComposerPreview(null);
    dispatch(setImagePreview(null));
    dispatch(setContent(''));
    dispatch(setError(''));
    onClose();
  };

  // Lock background scroll while the modal is open
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop — intentionally has no onClick, so it can't close the modal */}
      <div className="absolute inset-0 bg-black/65 backdrop-blur-md" />

      <div className="relative w-full max-w-[380px] sm:max-w-[420px] md:max-w-[440px] max-h-[92vh] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <ComposerCard
          onPostCreated={onPostCreated}
          onClose={handleDismiss}
          composerFile={composerFile}
          setComposerFile={setComposerFile}
          composerPreview={composerPreview}
          setComposerPreview={setComposerPreview}
        />
      </div>
    </div>
  );
}


/* ─────────────────────────────────────────────────────────────────
   Entrance animation keyframes, scoped to this page.
   Kept as a plain <style> tag instead of editing tailwind.config.js,
   so this drops in without touching your build config.
   Respects prefers-reduced-motion.
   ───────────────────────────────────────────────────────────────── */


export default function CommunityPage() {
  const posts = useSelector((state) => state.feed.posts);
  const page = useSelector((state) => state.feed.page);
  const hasMore = useSelector((state) => state.feed.hasMore);
  const isLoading = useSelector((state) => state.feed.isLoading);
  const error = useSelector((state) => state.feed.error);
  // console.log('localstorage:', localStorage)
  console.log('posts:', posts);

  const observerRef = useRef(null);
  const loadingRef = useRef(null);
  const scrollRef = useRef(null);
  const cardRefs = useRef([]);
  const activeIndexRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const apiUrl = import.meta.env.VITE_API_URL || '';
  const currentUser = getStoredUser();
  // console.log('currentUser', currentUser);
  const currentUserId = currentUser?.id || currentUser?._id || '';
  // console.log('currentUserId', currentUserId);
  const [showComposer, setShowComposer] = useState(false);
  const [composerFile, setComposerFile] = useState(null);
  const [composerPreview, setComposerPreview] = useState(null);
  const [showCapsules, setShowCapsules] = useState(true);
  const [showCreateOrbitalModal, setShowCreateOrbitalModal] = useState(false);
  const [trendingOrbitals, setTrendingOrbitals] = useState([]);
  const [myOrbitals, setMyOrbitals] = useState([]);
  // const [activeFeedType, setActiveFeedType] = useState('feed');
  const activeFeedType = useSelector((state) => state.feed.activeFeedType);
  const tabsRef = useRef({});
  const underlineRef = useRef(null);
  const lastScrollPos = useRef(0);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // The mobile bottom bar's Create button arrives here as ?compose=1.
  useEffect(() => {
    if (searchParams.get('compose') !== '1') return;
    setShowComposer(true);
    setSearchParams({}, { replace: true });
  }, [searchParams, setSearchParams]);

  // Crossfading ambient backdrop
  const [bgA, setBgA] = useState('');
  const [bgB, setBgB] = useState('');
  const [frontIsA, setFrontIsA] = useState(true);

  activeIndexRef.current = activeIndex;

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(setPage(1));
    dispatch(fetchPosts(1));
  }, [dispatch, activeFeedType]);

  const [showAddCapsule, setShowAddCapsule] = useState(false);

  useEffect(() => {
    const activeTab = tabsRef.current[activeFeedType];
    const underline = underlineRef.current;

    if (!activeTab || !underline) return;

    gsap.to(underline, {
      x: activeTab.offsetLeft,
      width: activeTab.offsetWidth,
      duration: 0.35,
      ease: 'power3.out',
    });
  }, [activeFeedType]);

  // Update crossfading backdrop when active post changes
  useEffect(() => {
    const post = posts[activeIndex];
    if (!post?.image) return;
    let nextImage = post.image;
    if (nextImage.startsWith('/')) nextImage = `${apiUrl}${nextImage}`;
    else if (nextImage.includes('uc?id=')) {
      const match = nextImage.match(/[?&]id=([^&]+)/);
      if (match) nextImage = `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1000`;
    }
    if (frontIsA) { setBgB(nextImage); } else { setBgA(nextImage); }
    setFrontIsA((f) => !f);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const SCROLL_THRESHOLD = 200;
    let raf = 0;
    const pickActive = () => {
      raf = 0;
      const count = posts.length;
      if (!count) return;
      const maxScroll = el.scrollHeight - el.clientHeight;
      let next = 0;
      if (maxScroll > 4 && el.scrollTop <= 2) {
        next = 0;
      } else if (maxScroll > 4 && el.scrollTop >= maxScroll - 2) {
        next = count - 1;
      } else {
        const box = el.getBoundingClientRect();
        const mid = box.top + box.height / 2;
        let best = Infinity;
        for (let i = 0; i < count; i++) {
          const card = cardRefs.current[i];
          if (!card) continue;
          const r = card.getBoundingClientRect();
          const dist = Math.abs(r.top + r.height / 2 - mid);
          if (dist < best) { best = dist; next = i; }
        }
      }
      if (next !== activeIndexRef.current) {
        activeIndexRef.current = next;
        setActiveIndex(next);
      }
    };
    const schedule = () => { if (!raf) raf = requestAnimationFrame(pickActive); };

    const onScroll = () => {
      const currentPos = el.scrollTop;
      const delta = currentPos - lastScrollPos.current;
      if (currentPos <= 0) {
        setShowCapsules(true);
        lastScrollPos.current = 0;
      } else if (Math.abs(delta) > SCROLL_THRESHOLD) {
        setShowCapsules(delta < 0);
        lastScrollPos.current = currentPos;
      }
      schedule();
    };

    el.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', schedule);
    schedule();
    return () => {
      if (raf) cancelAnimationFrame(raf);
      el.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', schedule);
    };
  }, [posts, activeIndex]);

  // Arrow-key navigation
  useEffect(() => {
    const onKeyDown = (e) => {
      if (!['ArrowDown', 'ArrowUp'].includes(e.key)) return;
      const dir = e.key === 'ArrowDown' ? 1 : -1;
      const target = Math.min(posts.length - 1, Math.max(0, activeIndex + dir));
      cardRefs.current[target]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeIndex, posts.length]);

  // Infinite scroll observer
  useEffect(() => {
    if (!loadingRef.current || !hasMore) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !isLoading && hasMore) {
        const next = page + 1;
        dispatch(setPage(next));
        dispatch(fetchPosts(next));
      }
    }, { threshold: 0.1 });
    observer.observe(loadingRef.current);
    observerRef.current = observer;
    return () => observerRef.current?.disconnect();
  }, [page, hasMore, isLoading, dispatch]);

  const handlePostCreated = (newPost) => {
    dispatch(addPostToTop(newPost));
    setShowComposer(false);

    window.scrollTo({
      top: 0,
      behavior: 'smooth' // optional: smooth animation
    });
  };

  const handleDelete = async (postId) => {
    if (!confirm('Delete this post?')) return;
    try {
      await axios.delete(`${apiUrl}/api/community/posts/${postId}`, {
        withCredentials: true,
        headers: getAuthHeaders(),
      });
      dispatch(setPosts((prev) => prev.filter((p) => p.id !== postId)));
    } catch (err) { console.error('Delete error:', err); }
  };

  const handleCapsulePost = async (file, caption = '') => {
    if (!file) { dispatch(setError('Please select an image to post')); return; }
    dispatch(setError(''));
    try {
      const formData = new FormData();
      formData.append('media', file);
      if (caption) formData.append('caption', caption);
      const res = await axios.post(`${apiUrl}/api/capsule/capsulepost`, formData, {
        withCredentials: true,
        headers: { ...getAuthHeaders() },
      });
      // clear local selection and preview
      dispatch(setImagePreview(null));
      setShowAddCapsule(false);
      return res.data;
    } catch (error) {
      const msg = error?.response?.data?.message || error.message || 'capsule posting error';
      dispatch(setError(msg));
      console.error('capsule posting error', error);
      throw error;
    }
  };

  const getOrbitals = async () => {
    // console.log('Fetching my orbital...');
    try {
      const resAll = await axios.get(`${apiUrl}/api/orbital/all`, {
        withCredentials: true,
        headers: getAuthHeaders(),
      });
      const resMy = await axios.get(`${apiUrl}/api/orbital/mine`, {
        withCredentials: true,
        headers: getAuthHeaders(),
      });
      console.log('All orbital data:', resAll.data?.orbitals);
      console.log('My orbital data:', resMy.data?.orbitals);
      setTrendingOrbitals(resAll.data?.orbitals || []);
      setMyOrbitals(resMy.data?.orbitals || []);
      return { my: resMy.data, all: resAll.data };
    } catch (error) {
      console.error('Error fetching my orbital:', error);
      throw error;
    }
  };

  useEffect(() => {
    getOrbitals()
  }, []);

  const showCreateOrbital = () => {
    // console.log('createOrbital clicked');
    setShowCreateOrbitalModal(true);
  };

  const openOrbital = (orbitalId) => {
    // console.log('openOrbital clicked', orbitalId);
    navigate(`/orbital/${orbitalId}`);
    console.log('openOrbital clicked', orbitalId);
  };

  return (
    <div className="relative h-screen overflow-hidden bg-black">
      {/* Crossfading ambient backdrop */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div
          className="absolute inset-0 bg-cover bg-center scale-125 blur-3xl transition-opacity duration-700 ease-out"
          style={{ backgroundImage: bgA ? `url('${bgA}')` : 'none', opacity: frontIsA ? 1 : 0 }}
        />
        <div
          className="absolute inset-0 bg-cover bg-center scale-125 blur-3xl transition-opacity duration-700 ease-out"
          style={{ backgroundImage: bgB ? `url('${bgB}')` : 'none', opacity: frontIsA ? 0 : 1 }}
        />
        <div className="absolute inset-0 bg-black/60" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr_300px] h-full">
        {/* Left: reserved for app nav sidebar */}
        <div className="hidden lg:block" aria-hidden="true" />

        {/* Middle: snap-scroll film-reel feed */}
        <div className="flex flex-col h-full overflow-hidden">
          {/* Capsules sticky strip */}
          <div className="flex-shrink-0 z-20 px-4 pt-4 pb-2 bg-black/50 border-b border-white/[0.06] transition-all duration-300 ease-out overflow-hidden" style={{ transform: showCapsules ? '' : 'translateY(-100%)', maxHeight: showCapsules ? '20%' : '0%' }}>
            <Capsules
              onAddCapsule={() => setShowAddCapsule(true)}
            />
          </div>

          {error && (
            <div className="flex-shrink-0 px-4 py-2">
              <div className="bg-[#f8717118] border border-[#f8717144] rounded-[12px] px-4 py-3 text-[#f87171] text-[13px]">{error}</div>
            </div>
          )}

          {/* Snap-scroll container */}
          {/* Composer now renders as a modal, outside the feed */}
          {showComposer && (
            <ComposerModal
              onPostCreated={handlePostCreated}
              onClose={() => setShowComposer(false)}
              composerFile={composerFile}
              setComposerFile={setComposerFile}
              composerPreview={composerPreview}
              setComposerPreview={setComposerPreview}
            />
          )}
          <div className="relative flex justify-around gap-4 px-4 pt-3 pb-2 sm:gap-8 sm:px-12 sm:pt-4 lg:px-24 bg-black/50 border-b border-white/[0.06] transition-all duration-300 ease-out overflow-hidden">
            {FEED_TYPES.map((tab) => {
              const active = tab.value === activeFeedType;

              return (
                <button
                  key={tab.value}
                  ref={(element) => {
                    tabsRef.current[tab.value] = element;
                  }}
                  type="button"
                  onClick={() => dispatch(setActiveFeedType(tab.value))}
                  className={`relative whitespace-nowrap px-2 pb-3 text-sm font-medium transition-colors sm:text-base lg:text-lg ${active
                    ? 'font-bold text-white'
                    : 'text-neutral-500 hover:text-neutral-300'
                    }`}
                >
                  {tab.label}
                </button>
              );
            })}
            <span
              ref={underlineRef}
              className="absolute bottom-0 left-0 h-0.5 bg-white"
            />
          </div>

          <div
            ref={scrollRef}
            className="flex-1 overflow-y-scroll snap-y snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {posts.length === 0 && !isLoading ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="text-[60px] mb-4">👩‍💻</div>
                  <p className="text-white/60 text-[15px] font-['Plus_Jakarta_Sans']">No posts yet — be the first to share!</p>
                </div>
              </div>
            ) : (
              posts.map((post, i) => (
                <div
                  key={post.id}
                  className="h-[73vh] z-10 snap-center flex items-center justify-center px-3 [content-visibility:auto] [contain-intrinsic-size:0_73vh]"
                >
                  <FilmPostCard
                    post={post}
                    cardRef={(el) => (cardRefs.current[i] = el)}
                    glow={GLOWS[i % GLOWS.length]}
                    textGradient={TEXT_GRADIENTS[i % TEXT_GRADIENTS.length]}
                    isOwn={post.author.id === currentUserId}
                    isActive={i === activeIndex}
                    onLike={handleLike}
                    onDelete={handleDelete}
                  />
                </div>
              ))
            )}

            {isLoading && (
              <div className="h-[30vh] snap-center flex items-center justify-center">
                <div className="w-9 h-9 border-[3px] border-[#00e5ff] border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {hasMore && !isLoading && <div ref={loadingRef} className="h-5" />}
          </div>
        </div>

        {/* Right: sticky sidebar */}
        <div className="hidden lg:flex flex-col h-full overflow-y-auto px-4 py-5 gap-3 [scrollbar-width:thin] [scrollbar-color:#333_transparent]">
          <div className="relative bg-gradient-to-b from-white/[0.06] to-white/[0.015] backdrop-blur-xl border border-white/[0.08] rounded-[18px] px-[18px] py-[16px] shadow-[0_10px_30px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.07),inset_0_-1px_0_rgba(0,0,0,0.35)] overflow-hidden">

            {/* glass edge highlight */}
            <div className="absolute top-0 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />

            {/* header */}
            <div className="flex items-center gap-[9px] mb-[14px]">
              <div className="w-[26px] h-[26px] flex items-center justify-center rounded-[8px] bg-white/[0.04] shadow-[inset_1px_1px_3px_rgba(0,0,0,0.5),inset_-1px_-1px_2px_rgba(255,255,255,0.06)] text-[13px]">
                📡
              </div>
              <span className="font-['Syne'] font-bold text-[13px] text-[#e8f0fe] tracking-[0.3px]">
                Orbital
              </span>
            </div>

            <div className="flex flex-col gap-[9px]">
              {[
                // { label: 'Posts today', val: posts.length, icon: '📝', live: false },
                { label: 'Your Orbitals', val: myOrbitals.length, icon: '✍️', accent: true },
                { label: 'Create your own orbital', val: '—', icon: <Plus />, live: false, onClick: () => showCreateOrbital() },
              ].map((row) => (
                <div
                  key={row.label}
                  onClick={row.onClick}
                  role={row.onClick ? 'button' : undefined}
                  tabIndex={row.onClick ? 0 : undefined}
                  className={`group cursor-pointer flex justify-between items-center px-[12px] py-[9px] rounded-[12px] border transition-colors duration-200 ${row.accent
                    ? 'bg-white/[0.05] border-white/[0.10] shadow-[inset_1px_1px_3px_rgba(0,0,0,0.4),inset_-1px_-1px_2px_rgba(255,255,255,0.05)]'
                    : 'bg-black/20 border-white/[0.04] shadow-[inset_1px_1px_3px_rgba(0,0,0,0.5),inset_-1px_-1px_2px_rgba(255,255,255,0.03)] hover:bg-white/[0.03] hover:border-white/[0.08]'
                    }`}
                >
                  <span className="flex items-center gap-[8px] text-[12px] text-[#aaaaaa]">
                    <span className="w-[20px] h-[20px] flex items-center justify-center rounded-[6px] bg-white/[0.05] text-[10px] shadow-[0_1px_2px_rgba(0,0,0,0.35)]">
                      {row.icon}
                    </span>
                    {row.label}
                    {row.live && (
                      <span className="w-[5px] h-[5px] rounded-full bg-emerald-400/80 shadow-[0_0_6px_rgba(52,211,153,0.7)] animate-pulse" />
                    )}
                  </span>
                  <span
                    className={`text-[14px] font-bold font-['DM_Mono'] ${row.accent ? 'text-[#e8f0fe]' : 'text-[#aaaaaa]'
                      }`}
                  >
                    {row.val}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* <TrendingTopics /> */}

          {/* Trending Orbitals */}
          <div className="bg-white/[0.04] overflow-auto backdrop-blur-xl border border-white/[0.08] rounded-[20px] px-[18px] py-[16px] shadow-[0_8px_32px_rgba(0,0,0,0.45)]">
            <div className="font-['Syne'] font-bold text-[13px] text-[#e8f0fe] mb-[14px] tracking-[0.3px] flex items-center">
              <FaUsers className="text-[#aaaaaa] text-[13px] mr-[7px]" /> Trending Orbitals
            </div>

            <div className="flex flex-col gap-[10px]">
              {trendingOrbitals.length === 0 && (
                <div className="text-[12px] text-[#777777] text-center py-[12px]">
                  No trending orbitals yet
                </div>
              )}

              {trendingOrbitals.map((orbital, i) => (
                <div
                  key={orbital._id}
                  onClick={() => openOrbital(orbital._id)}
                  className="flex items-center gap-[10px] bg-white/[0.03] backdrop-blur-md border border-white/[0.06] rounded-[14px] px-[12px] py-[10px] cursor-pointer transition-colors duration-200 hover:bg-white/[0.06]"
                >
                  <span className="text-[#777777] font-['DM_Mono'] text-[12px] w-[18px] shrink-0">
                    {String(i + 1).padStart(2, '0')}
                  </span>

                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold text-[#e8f0fe] truncate">
                      {orbital.name}
                    </div>
                    <div className="flex items-center gap-[8px] text-[11px] text-[#aaaaaa] mt-[2px]">
                      <span className="flex items-center gap-[4px]">
                        <FaUsers className="text-[10px]" />
                        {orbital.memberCount}
                      </span>
                      <span className="flex items-center gap-[4px]">
                        {orbital.visibility === 'private' ? (
                          <FaLock className="text-[9px]" />
                        ) : (
                          <FaGlobe className="text-[9px]" />
                        )}
                        {orbital.visibility}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="shrink-0 px-[14px] py-[6px] rounded-[10px] text-[11px] font-semibold text-[#e8f0fe] bg-[#161616] shadow-[5px_5px_10px_rgba(0,0,0,0.65),-3px_-3px_8px_rgba(255,255,255,0.05)] transition-all duration-150 hover:text-white active:shadow-[inset_3px_3px_6px_rgba(0,0,0,0.7),inset_-2px_-2px_5px_rgba(255,255,255,0.04)]"
                  >
                    {orbital.visibility === 'private' ? 'Request' : 'Join'}
                  </button>
                </div>
              ))}
            </div>
          </div>


          {/* My Orbitals */}
          <div className="bg-white/[0.04] overflow-auto backdrop-blur-xl border border-white/[0.08] rounded-[20px] px-[18px] py-[16px] shadow-[0_8px_32px_rgba(0,0,0,0.45)]">
            <div className="font-['Syne'] font-bold text-[13px] text-[#e8f0fe] mb-[14px] tracking-[0.3px] flex items-center">
              <FaUsers className="text-[#aaaaaa] text-[13px] mr-[7px]" /> My Orbitals
            </div>

            <div className="flex flex-col gap-[10px]">
              {myOrbitals.length === 0 && (
                <div className="text-[12px] text-[#777777] text-center py-[12px]">
                  No trending orbitals yet
                </div>
              )}

              {myOrbitals.map((orbital, i) => (
                <div
                  key={orbital._id}
                  onClick={() => openOrbital(orbital._id)}
                  className="flex items-center gap-[10px] bg-white/[0.03] backdrop-blur-md border border-white/[0.06] rounded-[14px] px-[12px] py-[10px] cursor-pointer transition-colors duration-200 hover:bg-white/[0.06]"
                >
                  <span className="text-[#777777] font-['DM_Mono'] text-[12px] w-[18px] shrink-0">
                    {String(i + 1).padStart(2, '0')}
                  </span>

                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold text-[#e8f0fe] truncate">
                      {orbital.name}
                    </div>
                    <div className="flex items-center gap-[8px] text-[11px] text-[#aaaaaa] mt-[2px]">
                      <span className="flex items-center gap-[4px]">
                        <FaUsers className="text-[10px]" />
                        {orbital.memberCount}
                      </span>
                      <span className="flex items-center gap-[4px]">
                        {orbital.visibility === 'private' ? (
                          <FaLock className="text-[9px]" />
                        ) : (
                          <FaGlobe className="text-[9px]" />
                        )}
                        {orbital.visibility}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="shrink-0 px-[14px] py-[6px] rounded-[10px] text-[11px] font-semibold text-[#e8f0fe] bg-[#161616] shadow-[5px_5px_10px_rgba(0,0,0,0.65),-3px_-3px_8px_rgba(255,255,255,0.05)] transition-all duration-150 hover:text-white active:shadow-[inset_3px_3px_6px_rgba(0,0,0,0.7),inset_-2px_-2px_5px_rgba(255,255,255,0.04)]"
                  >
                    {orbital.visibility === 'private' ? 'Request' : 'Join'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* FAB: new post (all screen sizes) */}
      <button
        onClick={() => {
          setShowComposer(true);
        }}
        className="fixed bottom-8 right-8 hidden md:flex w-14 h-14 rounded-full bg-gradient-to-br from-[#858585] to-[#656565] text-black items-center justify-center shadow-[0_4px_24px_#a6a6a6] z-50 transition-all duration-300 ease-out hover:shadow-[0_6px_32px_#a6a6a6] hover:scale-110 active:scale-95 ring-2 ring-[#858585] hover:ring-[#a6a6a6]"
        aria-label="New post"
      >
        <Plus size={26} strokeWidth={2.5} />
      </button>

      {showCreateOrbitalModal && (
        <CreateOrbitalModal
          isOpen={showCreateOrbitalModal}
          creatorId={currentUserId}
          onClose={() => setShowCreateOrbitalModal(false)}
          onSubmit={async (data) => {
            console.log('Create orbital data:', data);
            // call your API here
          }}
        />
      )}

      {/* Capsule modals */}
      {showAddCapsule && (
        <CapsulePostModal
          isOpen={showAddCapsule}
          story={{
            author: currentUser?.username || 'you',
            timestamp: 'just now',
            avatar: currentUser?.profilePic || '',
            caption: '',
          }}
          onClose={() => setShowAddCapsule(false)}
          onAddCapsule={handleCapsulePost}
          creatorId={currentUserId}
        />
      )}
    </div>
  );
}