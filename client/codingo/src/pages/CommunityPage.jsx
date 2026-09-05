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
  setFocused,
  setImagePreview,
  setIsPosting,
} from '../redux/slices/postSlice';
import {
  setHeartAnim,
  setLikeCount,
  setLiked,
  setPage,
  setPosts,
  setShowModal,
  addPostToTop,
} from '../redux/slices/feedSlice';
import {
  fetchPosts,
  getAuthHeaders,
  handleLike,
  getStoredUser,
  formatTimeAgo,
} from '../utilites/communityHelper';
import gsap from 'gsap';
import Capsules from '../components/Comments/Capsules';
import CapsulePostModal from '../components/Comments/CapsulePostModal';
import { FiMessageCircle, FiSend } from 'react-icons/fi';
import Comments from './CommentsModal';
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

function AvatarInitial({ name, size = 44 }) {
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


const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/heic', 'image/heif'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime', 'video/mov'];
const MAX_IMAGE_SIZE = 8 * 1024 * 1024;   // 8MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024;  // 50MB — match your multer limit

export function PostComposer({
  onPostCreated,
  composerFile,
  setComposerFile,
  composerPreview,
  setComposerPreview,
}) {
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const imageInputId = useRef(`post-image-input-${Math.random().toString(36).slice(2)}`);
  const videoInputId = useRef(`post-video-input-${Math.random().toString(36).slice(2)}`);
  const apiUrl = import.meta.env.VITE_API_URL || '';
  const currentUser = getStoredUser();
  const dispatch = useDispatch();

  const content = useSelector((state) => state.post.content);
  const focused = useSelector((state) => state.post.focused);
  const isPosting = useSelector((state) => state.post.isPosting);
  const error = useSelector((state) => state.post.error);

  const isVideoFile = composerFile?.type?.startsWith('video/');

  const handleMediaSelect = (e) => {
    const file = e.target?.files?.[0] || null;
    if (!file) return;

    const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
    const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);

    if (!isImage && !isVideo) {
      dispatch(setError(`Unsupported type: ${file.type || 'unknown'}`));
      e.target.value = '';
      return;
    }

    const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
    if (file.size > maxSize) {
      dispatch(setError(isVideo ? 'Video must be < 50MB' : 'Image must be < 8MB'));
      e.target.value = '';
      return;
    }

    if (composerPreview) URL.revokeObjectURL(composerPreview);

    const objectUrl = URL.createObjectURL(file);
    setComposerFile(file);
    setComposerPreview(objectUrl);
    dispatch(setImagePreview(objectUrl));
    dispatch(setError(''));

    e.target.value = ''; // allow re-selecting the same file later
  };

  const removeMedia = () => {
    setComposerFile(null);
    if (composerPreview) URL.revokeObjectURL(composerPreview);
    setComposerPreview(null);
    dispatch(setImagePreview(null));
    if (imageInputRef.current) imageInputRef.current.value = '';
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  const handlePost = async () => {
    const trimmedContent = content.trim();
    const fileToSend =
      composerFile ||
      imageInputRef.current?.files?.[0] ||
      videoInputRef.current?.files?.[0] ||
      null;

    if (!trimmedContent && !fileToSend) {
      return dispatch(setError('Write something or attach an image/video'));
    }
    if (content.length > 2000) return dispatch(setError('Exceeds 2000 chars'));

    dispatch(setIsPosting(true));
    dispatch(setError(''));

    try {
      const formData = new FormData();
      if (trimmedContent) formData.append('content', trimmedContent);

      if (fileToSend) {
        formData.append('media', fileToSend, fileToSend.name || 'upload');
      }

      const res = await axios.post(`${apiUrl}/api/community/posts`, formData, {
        withCredentials: true,
        headers: { ...getAuthHeaders() },
      });

      dispatch(setContent(''));
      dispatch(setFocused(false));
      if (composerPreview) URL.revokeObjectURL(composerPreview);
      setComposerFile(null);
      setComposerPreview(null);
      dispatch(setImagePreview(null));
      if (imageInputRef.current) imageInputRef.current.value = '';
      if (videoInputRef.current) videoInputRef.current.value = '';

      if (onPostCreated) onPostCreated(res.data.post);
    } catch (err) {
      dispatch(setError(err?.response?.data?.message || 'Post failed'));
    } finally {
      dispatch(setIsPosting(false));
    }
  };

  const canPost = (content.trim().length > 0 || !!composerFile) && !isPosting;

  return (
    <div
      className={`bg-[#2B2B2B] rounded-[20px] px-[20px] pt-[20px] pb-[16px] mb-[8px] transition-colors duration-200 ease-in-out ${focused ? 'border border-[#aaaaaa]' : 'border border-[#2B2B2B]'
        }`}
    >
      <div className="flex gap-[14px]">
        {currentUser?.username ? (
          <AvatarInitial name={currentUser.username} size={44} />
        ) : (
          <div className="w-[44px] h-[44px] rounded-full bg-[#1a2535] flex-shrink-0" />
        )}

        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => dispatch(setContent(e.target.value))}
            onFocus={() => dispatch(setFocused(true))}
            onBlur={() => dispatch(setFocused(false))}
            placeholder="Share what you're building, learning, or breaking... 🚀"
            maxLength={2000}
            rows={focused || content ? 4 : 2}
            className="w-full bg-transparent border-none outline-none resize-none text-[#e8f0fe] text-[15px] font-['Plus_Jakarta_Sans'] leading-[1.6] caret-[#00e5ff] transition-[height] duration-200 ease-in-out"
          />

          {composerPreview && (
            <div className="relative inline-block mb-3">
              {isVideoFile ? (
                <video
                  src={composerPreview}
                  controls
                  className="max-w-full max-h-[240px] rounded-xl border border-[#1a2535] block"
                />
              ) : (
                <img
                  src={composerPreview}
                  alt="Preview"
                  className="max-w-full max-h-[240px] rounded-xl border border-[#1a2535] block"
                />
              )}
              <button
                type="button"
                onClick={removeMedia}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center"
              >
                <FaTimes />
              </button>
            </div>
          )}

          {error && <p className="text-[#f87171] text-xs mb-2">{error}</p>}

          <div className="flex items-center justify-between pt-3 border-t border-[#1a2535]">
            <div className="flex items-center gap-2">
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                onChange={handleMediaSelect}
                className="hidden"
                id={imageInputId.current}
              />
              <label
                htmlFor={imageInputId.current}
                className="flex items-center gap-[6px] px-[14px] py-[7px] bg-[#404040] rounded-[10px] cursor-pointer text-[#aaaaaa] text-[13px] font-semibold font-['Plus_Jakarta_Sans'] transition-all duration-150 hover:text-white"
              >
                <FaImage className="text-[13px]" /> Image
              </label>

              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                onChange={handleMediaSelect}
                className="hidden"
                id={videoInputId.current}
              />
              <label
                htmlFor={videoInputId.current}
                className="flex items-center gap-[6px] px-[14px] py-[7px] bg-[#404040] rounded-[10px] cursor-pointer text-[#aaaaaa] text-[13px] font-semibold font-['Plus_Jakarta_Sans'] transition-all duration-150 hover:text-white"
              >
                <FaVideo className="text-[13px]" /> Video
              </label>

              <span className="text-[11px] text-[#aaaaaa] font-['DM_Mono']">
                {content.length}/2000
              </span>
            </div>

            <button
              type="button"
              onClick={handlePost}
              disabled={!canPost}
              className={`flex items-center gap-[7px] px-[20px] py-[8px] border-none rounded-[10px] font-['Syne'] font-extrabold text-[13px] tracking-[0.3px] transition-all duration-200 ease-in-out ${canPost
                ? 'bg-gradient-to-br from-[#00b4cc] to-[#00e5ff] text-black cursor-pointer shadow-[0_4px_16px_#00e5ff33]'
                : 'bg-[#404040] text-[#aaaaaa] cursor-not-allowed'
                }`}
            >
              {isPosting ? 'Posting' : <><FaPaperPlane style={{ fontSize: 12 }} /> Post</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FilmPostCard({ post, cardRef, textGradient, isOwn, isActive, onLike, onDelete }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const apiUrl = import.meta.env.VITE_API_URL || '';
  const heartIconRef = useRef(null);
  const videoRef = useRef(null);
  const mediaContainerRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true); // must start muted for autoplay to be allowed by browsers

  const liked = useSelector((state) => state.feed.liked[post.id] ?? post.isLikedByCurrentUser ?? false);
  const likeCount = useSelector((state) => state.feed.likeCounts[post.id] ?? post.likesCount ?? 0);
  const heartAnim = useSelector((state) => state.feed.heartAnim[post.id] ?? false);
  const showModal = useSelector((state) => state.feed.showModal[post.id] ?? false);

  function getDisplayImageUrl(imageUrl) {
    if (!imageUrl) return '';
    const match = imageUrl.match(/[?&]id=([^&]+)/);
    if (match && imageUrl.includes('uc?id=')) {
      return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1000`;
    }
    return imageUrl;
  }

  const imageUrl = post.image?.startsWith('/') ? `${apiUrl}${post.image}` : getDisplayImageUrl(post.image);
  const videoUrl = post.video?.startsWith('/') ? `${apiUrl}${post.video}` : post.video;

  const hasImage = !!post.image;
  const hasVideo = !!post.video;
  const hasMedia = hasImage || hasVideo;

  // Autoplay when the video scrolls into view, pause when it leaves
  useEffect(() => {
    if (!hasVideo || !mediaContainerRef.current) return;

    const node = mediaContainerRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const vid = videoRef.current;
          if (!vid) return;
          if (entry.isIntersecting) {
            vid.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
          } else {
            vid.pause();
            setIsPlaying(false);
          }
        });
      },
      { threshold: 0.6 } // video needs to be ~60% visible to trigger
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasVideo]);

  const toggleVideoPlay = () => {
    const vid = videoRef.current;
    if (!vid) return;
    if (vid.paused) {
      vid.play().then(() => setIsPlaying(true)).catch(() => { });
    } else {
      vid.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = (e) => {
    e.stopPropagation(); // don't let this bubble into toggleVideoPlay
    const vid = videoRef.current;
    if (!vid) return;
    vid.muted = !vid.muted;
    setIsMuted(vid.muted);
  };

  const handleLikeClick = () => {
    dispatch(setLiked({ postId: post.id, value: !liked }));
    dispatch(setLikeCount({ postId: post.id, value: liked ? likeCount - 1 : likeCount + 1 }));
    if (!liked) {
      dispatch(setHeartAnim({ postId: post.id, value: true }));
      setTimeout(() => dispatch(setHeartAnim({ postId: post.id, value: false })), 600);
      if (heartIconRef.current) {
        gsap.fromTo(heartIconRef.current, { scale: 1 }, { scale: 1.4, duration: 0.16, ease: 'power2.out', yoyo: true, repeat: 1 });
      }
    }
    onLike(post.id);
  };

  const glow = hasMedia
    ? 'radial-gradient(circle, rgba(124,108,240,0.35), transparent 70%)'
    : post.glow || 'radial-gradient(circle, rgba(244,114,182,0.35), transparent 70%)';

  return (
    <div
      ref={cardRef}
      className={`relative h-165 w-full max-w-[420px] z-10 mx-auto rounded-[2.5rem] overflow-hidden transform-gpu transition-[transform,opacity] duration-200 ease-out ${isActive ? 'scale-100 opacity-100' : 'scale-[0.82] opacity-[0.35]'}`}
      style={{ transformOrigin: 'center center' }}
    >
      <div
        className="pointer-events-none absolute -inset-6 -z-10 blur-2xl"
        style={{ background: glow }}
        aria-hidden="true"
      />

      <div
        className="relative h-full w-full rounded-[2.5rem] overflow-hidden flex flex-col"
        style={{
          background: hasMedia
            ? 'linear-gradient(160deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.05) 100%)'
            : textGradient,
          backdropFilter: 'blur(24px) saturate(160%)',
          WebkitBackdropFilter: 'blur(24px) saturate(160%)',
          border: '1px solid rgba(255,255,255,0.35)',
          boxShadow:
            '0 25px 70px rgba(0,0,0,0.45), inset 0 1px 1px rgba(255,255,255,0.5), inset 0 0 0 1px rgba(255,255,255,0.12)',
        }}
      >
        <div className="relative z-10 flex items-center gap-3 px-5 pt-5 pb-4 flex-shrink-0">
          <div className="cursor-pointer flex-shrink-0">
            {post.author.profilePic ? (
              <img
                src={post.author.profilePic}
                alt=""
                className="h-9 w-9 rounded-full object-cover ring-2 ring-white/50"
              />
            ) : (
              <AvatarInitial name={post.author.username} size={36} />
            )}
          </div>
          <div className="flex-1 cursor-pointer min-w-0">
            <span
              onClick={() => post.author.id && navigate(`/socialprofile/${post.author.id}`)}
              className="text-[14px] font-semibold text-white block truncate [text-shadow:0_1px_3px_rgba(0,0,0,0.35)]"
              style={{ fontFamily: "'Syne'" }}
            >
              {post.author.username}
            </span>
            <span
              className={`text-[11px] text-white/70 ${hasMedia ? 'ml-auto' : ''}`}
              style={{ fontFamily: "'DM Mono'" }}
            >
              {formatTimeAgo(post.createdAt)} ago
            </span>
          </div>
          {isOwn && (
            <button
              type="button"
              onClick={() => onDelete && onDelete(post.id)}
              className="text-white/70 hover:text-[#f87171] transition-colors flex-shrink-0 rounded-full p-1.5"
              aria-label="Delete"
            >
              <FaTrash size={15} />
            </button>
          )}
        </div>

        {/* Media — image, video, or text-only */}
        {hasMedia ? (
          <div
            ref={mediaContainerRef}
            className="relative mx-4 flex-1 min-h-0 rounded-[1.75rem] overflow-hidden"
            style={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.4), 0 8px 24px rgba(0,0,0,0.25)' }}
          >
            {hasVideo ? (
              <>
                <video
                  ref={videoRef}
                  src={videoUrl}
                  className="absolute inset-0 h-full w-full object-cover cursor-pointer"
                  playsInline
                  loop
                  muted={isMuted}
                  onClick={toggleVideoPlay}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />

                {!isPlaying && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="h-14 w-14 rounded-full bg-black/40 flex items-center justify-center">
                      <FaPlay size={18} color="white" style={{ marginLeft: 3 }} />
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={toggleMute}
                  className="absolute bottom-3 right-3 h-8 w-8 rounded-full bg-black/45 flex items-center justify-center text-white hover:bg-black/65 transition-colors"
                  aria-label={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <FaVolumeMute size={13} /> : <FaVolumeUp size={13} />}
                </button>
              </>
            ) : (
              <img src={imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
            )}
          </div>
        ) : (
          <div className="relative flex-1 min-h-0 flex items-center justify-center px-8">
            <p
              className="text-white text-[18px] leading-[1.7] text-center line-clamp-6 [text-shadow:0_2px_8px_rgba(0,0,0,0.25)]"
              style={{ fontFamily: "'Plus Jakarta Sans'" }}
            >
              {post.content}
            </p>
          </div>
        )}

        <div className="relative z-10 flex-shrink-0 px-5 pt-3 pb-5">
          {hasMedia && post.content && (
            <div className="flex items-start gap-2 mb-3">
              <p
                className="text-[13px] leading-[1.5] text-white/95 [text-shadow:0_1px_2px_rgba(0,0,0,0.2)] line-clamp-2 flex-1"
                style={{ fontFamily: "'Plus Jakarta Sans'" }}
              >
                {post.content}
              </p>
              <button type="button" className="text-white/80 hover:text-white transition-colors flex-shrink-0 mt-0.5" aria-label="Share">
                <FiSend size={14} />
              </button>
            </div>
          )}

          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={handleLikeClick}
              className="flex items-center gap-1.5 text-white/90 hover:text-white transition-colors focus-visible:outline-none rounded-full"
              aria-label="Like"
            >
              {!liked ? (
                <span ref={heartIconRef} className="inline-flex" style={{ transform: heartAnim ? 'scale(1.25)' : 'scale(1)', transition: 'transform 0.18s ease' }}>
                  <FaHeartBroken size={17} fill={liked ? '#fb7185' : 'currentColor'} color={liked ? '#fb7185' : 'currentColor'} />
                </span>
              ) : (
                <span ref={heartIconRef} className="inline-flex" style={{ transform: heartAnim ? 'scale(1.25)' : 'scale(1)', transition: 'transform 0.18s ease' }}>
                  <FaHeart size={17} fill={liked ? '#fb7185' : 'currentColor'} color={liked ? '#fb7185' : 'currentColor'} />
                </span>)}
              <span className="text-[12.5px]" style={{ fontFamily: "'DM Mono'" }}>{likeCount.toLocaleString()}</span>
            </button>

            <button
              type="button"
              onClick={() => { setShowModal(true) }}
              className="flex items-center gap-1.5 text-white/90 hover:text-white transition-colors focus-visible:outline-none rounded-full"
              aria-label="Comment"
            >
              <FiMessageCircle size={17} />
              <span className="text-[12.5px]" style={{ fontFamily: "'DM Mono'" }}>{post.commentsCount}</span>
            </button>

            {showModal && (
              <Comments />
            )}

            {!hasMedia && (
              <button type="button" className="text-white/80 hover:text-white transition-colors ml-auto" aria-label="Share">
                <FiSend size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function TrendingTopics() {
  const topics = ['#JavaScript', '#ReactJS', '#WebDev', '#CSS', '#NodeJS', '#TypeScript', '#OpenSource', '#API'];
  return (
    <div className="bg-[#2B2B2B] border border-[#1a2535] rounded-[16px] px-[18px] py-[16px] mb-[12px]">
      <div className="flex items-center gap-[8px] mb-[14px] font-['Syne'] font-bold text-[13px] text-[#e8f0fe] tracking-[0.3px]">
        <FaFire className="text-[#fb923c] text-[14px]" /> Trending
      </div>
      <div className="flex flex-wrap gap-[6px]">
        {topics.map((t) => (
          <span key={t} className="px-[10px] py-[4px] bg-[#404040] rounded-[8px] text-[12px] text-[#aaaaaa] font-['DM_Mono'] hover:text-white">
            {t}
          </span>
        ))}
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
  console.log('localstorage:', localStorage)

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
    const visibilityRatios = new Map();
    const SCROLL_THRESHOLD = 200; // px of movement needed before we react

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
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const index = cardRefs.current.indexOf(entry.target);
        if (index !== -1) {
          visibilityRatios.set(index, entry.isIntersecting ? entry.intersectionRatio : 0);
        }
      });

      let nextIndex = activeIndexRef.current;
      let highestRatio = visibilityRatios.get(nextIndex) || 0;
      visibilityRatios.forEach((ratio, index) => {
        if (ratio > highestRatio) {
          highestRatio = ratio;
          nextIndex = index;
        }
      });
      setActiveIndex((previous) => {
        if (previous === nextIndex) return previous;
        activeIndexRef.current = nextIndex;
        return nextIndex;
      });
    }, { root: el, threshold: [0, 0.6, 0.8, 1] });

    cardRefs.current.forEach((card) => card && observer.observe(card));
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      observer.disconnect();
      el.removeEventListener('scroll', onScroll);
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

          <TrendingTopics />

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
        onClick={() => setShowComposer(true)}
        className="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-gradient-to-br from-[#00b4cc] to-[#00e5ff] text-black text-[28px] font-bold flex items-center justify-center shadow-[0_4px_24px_#00e5ff55] z-50 active:scale-95 transition-transform"
        aria-label="New post"
      >
        +
      </button>

      {/* Composer modal */}
      {showComposer && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-end sm:items-center justify-center">
          <div className="w-full sm:max-w-md bg-[#111] rounded-t-[20px] sm:rounded-[20px] p-4 relative border border-white/[0.08]">
            <button
              onClick={() => setShowComposer(false)}
              className="absolute top-3 right-4 text-[#aaaaaa] text-[20px]"
              aria-label="Close"
            >✕</button>
            <PostComposer
              onPostCreated={handlePostCreated}
              composerFile={composerFile}
              setComposerFile={setComposerFile}
              composerPreview={composerPreview}
              setComposerPreview={setComposerPreview}
            />
          </div>
        </div>
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
        />
      )}
    </div>
  );
}