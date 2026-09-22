import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import {
  FaHeart,
  FaRegHeart,
  FaComment,
  FaPaperPlane,
  FaImage,
  FaTimes,
  FaTrash,
  FaFire,
  FaCode,
  FaHeartBroken,
  FaVideo,
  FaPlay,
  FaVolumeMute,
  FaVolumeUp
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
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
} from '../redux/slices/feedSlice';
import {
  fetchPosts,
  getAuthHeaders,
  handleLike,
  getStoredUser,
} from '../utilites/communityHelper';
import gsap from 'gsap';
import Capsules from '../components/Comments/Capsules';
import CapsulePostModal from '../components/Comments/CapsulePostModal';
import { FiMessageCircle, FiSend } from 'react-icons/fi';
import { Mic, Pause, PauseIcon, Play, Plus, RefreshCw, StopCircle, Trash2 } from 'lucide-react';
import ComposerCard from '../components/CommunityFeed/ComposerCard';
import FilmPostCard from '../components/CommunityFeed/FilmPostCard';
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
  console.log('currentUser', currentUser);
  const currentUserId = currentUser?.id || currentUser?._id || '';
  const [showComposer, setShowComposer] = useState(false);
  const [composerFile, setComposerFile] = useState(null);
  const [composerPreview, setComposerPreview] = useState(null);
  const [showCapsules, setShowCapsules] = useState(true);
  const lastScrollPos = useRef(0);
  
  // Crossfading ambient backdrop
  const [bgA, setBgA] = useState('');
  const [bgB, setBgB] = useState('');
  const [frontIsA, setFrontIsA] = useState(true);

  activeIndexRef.current = activeIndex;

  const dispatch = useDispatch();
  useEffect(() => { dispatch(fetchPosts(1)); }, [dispatch]);

  const [showAddCapsule, setShowAddCapsule] = useState(false);

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
  }, [posts]);

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
          <div className="bg-black/40 backdrop-blur-md border border-white/[0.08] rounded-[16px] px-[18px] py-[16px]">
            <div className="font-['Syne'] font-bold text-[13px] text-[#e8f0fe] mb-[14px] tracking-[0.3px]">📡 Community</div>
            <div className="flex flex-col gap-[10px]">
              {[
                { label: 'Posts today', val: posts.length, icon: '📝' },
                { label: 'Active devs', val: '—', icon: '👥' },
                { label: 'Your posts', val: posts.filter((p) => p.author.id === currentUserId).length, icon: '✍️' },
              ].map((row) => (
                <div key={row.label} className="flex justify-between items-center px-[12px] py-[8px] bg-white/[0.05] rounded-[10px]">
                  <span className="text-[12px] text-[#aaaaaa]">{row.icon} {row.label}</span>
                  <span className="text-[14px] font-bold font-['DM_Mono'] text-[#aaaaaa]">{row.val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* <TrendingTopics /> */}

          <div className="bg-black/40 backdrop-blur-md border border-white/[0.08] rounded-[16px] px-[18px] py-[16px]">
            <div className="font-['Syne'] font-bold text-[13px] text-[#e8f0fe] mb-[12px] tracking-[0.3px] flex items-center">
              <FaCode className="text-[#aaaaaa] text-[13px] mr-[7px]" /> Dev Code
            </div>
            {["Share what you're building", 'Help each other debug', 'Celebrate small wins', 'Keep it constructive'].map((rule, i) => (
              <div key={i} className="flex gap-[8px] items-start mb-[8px] text-[12px] text-[#aaaaaa] leading-[1.5]">
                <span className="text-[#aaaaaa] font-['DM_Mono'] mt-[1px]">{String(i + 1).padStart(2, '0')}</span>
                {rule}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAB: new post (all screen sizes) */}
      <button
        onClick={() => {
          setShowComposer(true);
        }}
        className="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-gradient-to-br from-[#858585] to-[#656565] text-black flex items-center justify-center shadow-[0_4px_24px_#a6a6a6] z-50 transition-all duration-300 ease-out hover:shadow-[0_6px_32px_#a6a6a6] hover:scale-110 active:scale-95 ring-2 ring-[#858585] hover:ring-[#a6a6a6]"
        aria-label="New post"
      >
        <Plus size={26} strokeWidth={2.5} />
      </button>

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
        />
      )}
    </div>
  );
}