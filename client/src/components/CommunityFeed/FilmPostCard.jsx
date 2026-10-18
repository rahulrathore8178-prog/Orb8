import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setHeartAnim, setLikeCount, setLiked, setShowModal } from '../../redux/slices/feedSlice';
import gsap from 'gsap';
import { formatTimeAgo } from '../../utilites/communityHelper';
import { FaHeart, FaHeartBroken, FaPlay, FaVolumeMute, FaVolumeUp, FaTrash } from 'react-icons/fa';
import { FiMessageCircle, FiSend } from 'react-icons/fi';
import Comments from '../../pages/CommentsModal';
import { AvatarInitial } from '../../pages/CommunityPage';
import { BarChart3 } from 'lucide-react';
import { Bookmark } from 'lucide-react';
import axios from 'axios';
import { getAuthHeaders } from '../../utilites/communityHelper';
import SharePostModal from './SharePostModal';

const ratioCache = new Map();

export default function FilmPostCard({ post, cardRef, textGradient, isOwn, isActive, onLike, onDelete }) {
        function getDisplayImageUrl(imageUrl) {
        if (!imageUrl) return '';
        const match = imageUrl.match(/[?&]id=([^&]+)/);
        if (match && imageUrl.includes('uc?id=')) {
            return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1000`;
        }
        return imageUrl;
    }
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const apiUrl = import.meta.env.VITE_API_URL || '';
    const heartIconRef = useRef(null);
    const videoRef = useRef(null);
    const mediaContainerRef = useRef(null);
    const audioRef = useRef(null);
    const [isAudioPlaying, setIsAudioPlaying] = useState(false);
    const [isSaved, setIsSaved] = useState(Boolean(post.isSavedByCurrentUser));
    const [shareOpen, setShareOpen] = useState(false);
    const [audioCurrentTime, setAudioCurrentTime] = useState(0);
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const sourceNodeRef = useRef(null);
    const canvasRef = useRef(null);
    const animationFrameRef = useRef(null);
    const viewRegisteredRef = useRef(false);
    const imageUrl = post.image?.startsWith('/') ? `${apiUrl}${post?.image}` : getDisplayImageUrl(post?.image);
    const videoUrl = post.video?.startsWith('/') ? `${apiUrl}${post.video}` : post.video;
    const audioUrl = post.voiceNote?.startsWith('/') ? `${apiUrl}${post.voiceNote}` : post.voiceNote;

    const hasImage = !!post.image;
    const hasVideo = !!post.video;
    const hasAudio = !!post.voiceNote;
    const hasMedia = hasImage || hasVideo || hasAudio;

    const MIN_RATIO = 9 / 16;
    const MAX_RATIO = 16 / 9;
    const DEFAULT_RATIO = 4 / 5;
    const CARD_MAX_HEIGHT = 'min(74dvh, 52rem)';
    const FRAME_CHROME = 168; // px used by header + caption + like row
    const toRatio = (w, h) =>
        w > 0 && h > 0 ? Math.min(MAX_RATIO, Math.max(MIN_RATIO, w / h)) : DEFAULT_RATIO;

    const mediaKey = videoUrl || imageUrl || '';
    const [mediaRatio, setMediaRatio] = useState(() => ratioCache.get(mediaKey) ?? DEFAULT_RATIO);
    const reportMediaSize = (w, h) => {
        const next = toRatio(w, h);
        if (mediaKey) ratioCache.set(mediaKey, next);
        setMediaRatio((prev) => (Math.abs(prev - next) < 0.005 ? prev : next));
    };
    const contentLength = (post.content || '').length;
    const textTypography =
        contentLength <= 100 ? 'text-[22px] leading-[1.45] text-center'
            : contentLength <= 280 ? 'text-[17px] leading-[1.6] text-center'
                : 'text-[15px] leading-[1.65] text-left';
    const isFramed = hasVideo || (!hasAudio && !!imageUrl);
    const cardWidth = isFramed
        ? `min(100%, 26.25rem, max(15rem, calc((${CARD_MAX_HEIGHT} - ${FRAME_CHROME}px) * ${mediaRatio} + 2rem)))`
        : undefined;
    const frameShadow = 'inset 0 0 0 1px rgba(255,255,255,0.4), 0 8px 24px rgba(0,0,0,0.25)';

    function ensureAudioGraph() {
        if (sourceNodeRef.current) return; // already wired up, don't redo it

        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        const audioContext = new AudioContextClass();
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256; // small + fast; plenty of resolution for a thin line

        const source = audioContext.createMediaElementSource(audioRef.current);
        source.connect(analyser);
        analyser.connect(audioContext.destination); // required, or you'll lose sound entirely

        audioContextRef.current = audioContext;
        analyserRef.current = analyser;
        sourceNodeRef.current = source;
    }

    function toggleAudioPlay() {
        const el = audioRef.current;
        if (!el) return;
        ensureAudioGraph();
        if (audioContextRef.current?.state === 'suspended') audioContextRef.current.resume();
        if (el.paused) el.play();
        else el.pause();
    }

    useEffect(() => {
        if (!isAudioPlaying) {
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
            return;
        }

        const canvas = canvasRef.current;
        const analyser = analyserRef.current;
        if (!canvas || !analyser) return;

        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.scale(dpr, dpr);

        const bufferLength = analyser.fftSize;
        const dataArray = new Uint8Array(bufferLength);

        function draw() {
            animationFrameRef.current = requestAnimationFrame(draw);
            analyser.getByteTimeDomainData(dataArray); // raw waveform samples, not frequency bins

            ctx.clearRect(0, 0, width, height);
            ctx.beginPath();

            const sliceWidth = width / bufferLength;
            let x = 0;
            for (let i = 0; i < bufferLength; i++) {
                const v = dataArray[i] / 128 - 1; // 0..255 -> -1..1
                const y = height / 2 + v * (height / 2) * 0.9;
                i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
                x += sliceWidth;
            }

            ctx.strokeStyle = 'rgba(255,255,255,0.9)';
            ctx.lineWidth = 1.5;
            ctx.lineJoin = 'round';
            ctx.stroke();
        }
        draw();

        return () => { if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current); };
    }, [isAudioPlaying]);

    // release the AudioContext when this post leaves the feed
    useEffect(() => {
        return () => {
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
            if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
                audioContextRef.current.close();
            }
        };
    }, []);
    // const audioUrl = post.voiceNote || '';
    // const hasAudio = Boolean(audioUrl);
    const audioProgress = post.voiceNoteDuration
        ? Math.min(100, (audioCurrentTime / post.voiceNoteDuration) * 100)
        : 0;

    // function toggleAudioPlay() {
    //   const el = audioRef.current;
    //   if (!el) return;
    //   if (el.paused) el.play();
    //   else el.pause();
    // }

    function formatDuration(seconds) {
        const total = Math.max(0, Math.floor(seconds || 0));
        const m = Math.floor(total / 60);
        const s = total % 60;
        return `${m}:${String(s).padStart(2, '0')}`;
    }

    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(true); // must start muted for autoplay to be allowed by browsers

    const liked = useSelector((state) => state.feed.liked[post.id] ?? post.isLikedByCurrentUser ?? false);
    const likeCount = useSelector((state) => state.feed.likeCounts[post.id] ?? post.likesCount ?? 0);
    const heartAnim = useSelector((state) => state.feed.heartAnim[post.id] ?? false);
    const showModal = useSelector((state) => state.feed.showModal[post.id] ?? false);

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

    useEffect(() => {
        const node = cardRef?.current;
        if (!node || viewRegisteredRef.current) return;
        const observer = new IntersectionObserver(([entry]) => {
            if (!entry.isIntersecting || entry.intersectionRatio < 0.6 || viewRegisteredRef.current) return;
            viewRegisteredRef.current = true;
            observer.disconnect();
            axios.post(`${apiUrl}/api/community/posts/${post.id}/views`, {}, {
                withCredentials: true,
                headers: getAuthHeaders(),
            }).catch(error => console.error('Register view error', error));
        }, { threshold: 0.6 });
        observer.observe(node);
        return () => observer.disconnect();
    }, [apiUrl, cardRef, post.id]);

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

    const toggleSaved = async () => {
        const nextSaved = !isSaved;
        setIsSaved(nextSaved);
        try {
            await axios({
                method: nextSaved ? 'post' : 'delete',
                url: `${apiUrl}/api/community/saved/${post.id}`,
                withCredentials: true,
                headers: getAuthHeaders(),
            });
        } catch (error) {
            setIsSaved(!nextSaved);
            console.error('Save post error', error);
        }
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
            className={`relative isolate mx-auto w-full max-w-[420px] transform-gpu transition-[transform,opacity] duration-200 ease-out motion-reduce:transition-none ${isActive ? 'scale-100 opacity-100' : 'scale-[0.82] opacity-[0.35]'}`}
            style={{ transformOrigin: 'center center', width: cardWidth }}
        >
            <div
                className="pointer-events-none absolute -inset-3 -z-10 rounded-[3rem] opacity-80 blur-2xl sm:-inset-5"
                style={{ background: glow }}
                aria-hidden="true"
            />
            <div
                className="relative flex w-full flex-col overflow-hidden rounded-[2rem] sm:rounded-[2.5rem]"
                style={{
                    maxHeight: CARD_MAX_HEIGHT,
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
                <div
                    className="pointer-events-none absolute inset-0 rounded-[inherit]"
                    style={{ background: 'radial-gradient(120% 55% at 0% 0%, rgba(255,255,255,0.16), rgba(255,255,255,0) 60%)' }}
                    aria-hidden="true"
                />

                {/* Header */}
                <div className="relative z-10 flex shrink-0 items-center gap-3 px-4 pb-3 pt-4 sm:px-5 sm:pb-4 sm:pt-5">
                    <div className="shrink-0 cursor-pointer">
                        {post.author.profilePic ? (
                            <img src={post.author.profilePic} alt="" className="h-9 w-9 rounded-full object-cover ring-2 ring-white/50" />
                        ) : (
                            <AvatarInitial name={post.author.username} size={36} />
                        )}
                    </div>
                    <div className="min-w-0 flex-1 cursor-pointer">
                        <span
                            onClick={() => post.author.id && navigate(`/socialprofile/${post.author.id}`)}
                            className="block truncate text-[14px] font-semibold text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.35)]"
                            style={{ fontFamily: "'Syne'" }}
                        >
                            {post.author.username}
                        </span>
                        <span className="text-[11px] text-white/70" style={{ fontFamily: "'DM Mono'" }}>
                            {formatTimeAgo(post.createdAt)} ago
                        </span>
                    </div>
                    {isOwn && (
                        <button
                            type="button"
                            onClick={() => onDelete && onDelete(post.id)}
                            className="shrink-0 rounded-full p-1.5 text-white/70 transition-colors hover:text-[#f87171]"
                            aria-label="Delete"
                        >
                            <FaTrash size={15} />
                        </button>
                    )}
                </div>

                {/* Body */}
                {hasVideo ? (
                    <div
                        ref={mediaContainerRef}
                        className="relative z-10 min-h-0 w-[calc(100%-1.5rem)] shrink self-center overflow-hidden rounded-[1.5rem] bg-black/40 sm:w-[calc(100%-2rem)] sm:rounded-[1.75rem]"
                        style={{ aspectRatio: mediaRatio, boxShadow: frameShadow }}
                    >
                        <video
                            ref={videoRef}
                            src={videoUrl}
                            className="absolute inset-0 h-full w-full cursor-pointer object-contain"
                            playsInline
                            loop
                            preload="metadata"
                            muted={isMuted}
                            onLoadedMetadata={(e) => reportMediaSize(e.currentTarget.videoWidth, e.currentTarget.videoHeight)}
                            onClick={toggleVideoPlay}
                            onPlay={() => setIsPlaying(true)}
                            onPause={() => setIsPlaying(false)}
                        />
                        {!isPlaying && (
                            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-black/40">
                                    <FaPlay size={18} color="white" style={{ marginLeft: 3 }} />
                                </div>
                            </div>
                        )}
                        <button
                            type="button"
                            onClick={toggleMute}
                            className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/45 text-white transition-colors hover:bg-black/65"
                            aria-label={isMuted ? 'Unmute' : 'Mute'}
                        >
                            {isMuted ? <FaVolumeMute size={13} /> : <FaVolumeUp size={13} />}
                        </button>
                    </div>
                ) : hasAudio ? (
                    <div
                        className="relative z-10 mx-3 shrink-0 overflow-hidden rounded-[1.5rem] sm:mx-4 sm:rounded-[1.75rem]"
                        style={{ boxShadow: frameShadow }}
                    >
                        {imageUrl ? (
                            <img src={imageUrl} alt="" className="absolute inset-0 h-full w-full scale-110 object-cover opacity-70 blur-md" loading="lazy" />
                        ) : (
                            <div className="absolute inset-0 bg-gradient-to-br from-[#2a2f3a] to-[#12161d]" />
                        )}
                        <div className="absolute inset-0 bg-black/35" />
                        <div className="relative z-10 flex items-center gap-3 px-3 py-3.5 sm:gap-4 sm:px-4 sm:py-4">
                            <button
                                type="button"
                                onClick={toggleAudioPlay}
                                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-black/40 text-white transition-colors hover:bg-black/55"
                                style={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.4)' }}
                                aria-label={isAudioPlaying ? 'Pause voice note' : 'Play voice note'}
                            >
                                {isAudioPlaying ? <PauseIcon size={18} /> : <FaPlay size={18} style={{ marginLeft: 3 }} />}
                            </button>
                            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                                <div className="relative h-9 w-full overflow-hidden rounded-full bg-white/10">
                                    <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" style={{ opacity: isAudioPlaying ? 1 : 0.35 }} />
                                    {!isAudioPlaying && <div className="absolute inset-x-2 top-1/2 h-px -translate-y-1/2 bg-white/40" />}
                                    <div
                                        className="absolute inset-y-0 w-[2px] bg-white shadow-[0_0_4px_rgba(255,255,255,0.8)] transition-[left] duration-100 ease-linear"
                                        style={{ left: `${audioProgress}%` }}
                                    />
                                </div>
                                <div className="flex items-center justify-between px-1 text-[11px] tabular-nums text-white [text-shadow:0_2px_8px_rgba(0,0,0,0.25)]">
                                    <span>{formatDuration(audioCurrentTime)}</span>
                                    <span>{formatDuration(post.voiceNoteDuration)}</span>
                                </div>
                            </div>
                        </div>
                        <audio
                            ref={audioRef}
                            src={audioUrl}
                            onPlay={() => setIsAudioPlaying(true)}
                            onPause={() => setIsAudioPlaying(false)}
                            onEnded={() => setIsAudioPlaying(false)}
                            onTimeUpdate={(e) => setAudioCurrentTime(e.currentTarget.currentTime)}
                            className="hidden"
                        />
                    </div>
                ) : imageUrl ? (
                    <div
                        ref={mediaContainerRef}
                        className="relative z-10 min-h-0 w-[calc(100%-1.5rem)] shrink self-center overflow-hidden rounded-[1.5rem] bg-black/30 sm:w-[calc(100%-2rem)] sm:rounded-[1.75rem]"
                        style={{ aspectRatio: mediaRatio, boxShadow: frameShadow }}
                    >
                        <img
                            src={imageUrl}
                            alt=""
                            aria-hidden="true"
                            className="absolute inset-0 h-full w-full scale-125 object-cover opacity-60 blur-xl"
                            loading="lazy"
                        />
                        <img
                            src={imageUrl}
                            alt={post.content ? post.content.slice(0, 100) : 'Post image'}
                            className="absolute inset-0 h-full w-full object-contain"
                            loading="lazy"
                            onLoad={(e) => reportMediaSize(e.currentTarget.naturalWidth, e.currentTarget.naturalHeight)}
                        />
                    </div>
                ) : (
                    <div className="relative z-10 min-h-0 overflow-y-auto overscroll-y-contain px-6 py-3 sm:px-8 [scrollbar-color:rgba(255,255,255,0.35)_transparent] [scrollbar-width:thin]">
                        <p
                            className={`whitespace-pre-wrap text-white [overflow-wrap:anywhere] [text-shadow:0_2px_8px_rgba(0,0,0,0.25)] ${textTypography}`}
                            style={{ fontFamily: "'Plus Jakarta Sans'" }}
                        >
                            {post.content}
                        </p>
                    </div>
                )}

                {/* Footer */}
                <div className={`relative z-10 shrink-0 px-4 pb-4 sm:px-5 sm:pb-5 ${hasMedia ? 'pt-3' : 'pt-2'}`}>
                    {hasMedia && post.content && (
                        <div className="mb-3 flex items-start gap-2">
                            <p
                                className="line-clamp-2 min-w-0 flex-1 text-[13px] leading-[1.5] text-white/95 [overflow-wrap:anywhere] [text-shadow:0_1px_2px_rgba(0,0,0,0.2)]"
                                style={{ fontFamily: "'Plus Jakarta Sans'" }}
                            >
                                {post.content}
                            </p>
                            <button type="button" onClick={() => setShareOpen(true)} className="mt-0.5 shrink-0 text-white/80 transition-colors hover:text-white" aria-label="Share">
                                <FiSend size={20} />
                            </button>
                        </div>
                    )}
                    <div className="flex items-center gap-5">
                        <button
                            type="button"
                            onClick={handleLikeClick}
                            className="flex items-center gap-1.5 rounded-full text-white/90 transition-colors hover:text-white focus-visible:outline-none"
                            aria-label="Like"
                        >
                            {!liked ? (
                                <span ref={heartIconRef} className="inline-flex" style={{ transform: heartAnim ? 'scale(1.25)' : 'scale(1)', transition: 'transform 0.18s ease' }}>
                                    <FaHeartBroken size={17} fill={liked ? '#fb7185' : 'currentColor'} color={liked ? '#fb7185' : 'currentColor'} />
                                </span>
                            ) : (
                                <span ref={heartIconRef} className="inline-flex" style={{ transform: heartAnim ? 'scale(1.25)' : 'scale(1)', transition: 'transform 0.18s ease' }}>
                                    <FaHeart size={17} fill={liked ? '#fb7185' : 'currentColor'} color={liked ? '#fb7185' : 'currentColor'} />
                                </span>
                            )}
                            <span className="text-[12.5px]" style={{ fontFamily: "'DM Mono'" }}>{likeCount.toLocaleString()}</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => dispatch(setShowModal({ postId: post.id, value: true }))}
                            className="flex items-center gap-1.5 rounded-full text-white/90 transition-colors hover:text-white focus-visible:outline-none"
                            aria-label="Comment"
                        >
                            <FiMessageCircle size={17} />
                            <span className="text-[12.5px]" style={{ fontFamily: "'DM Mono'" }}>{post.commentsCount}</span>
                        </button>
                        {showModal && <Comments post={post} />}
                        <div className="flex items-center gap-1.5 rounded-full text-white/90 transition-colors hover:text-white focus-visible:outline-none">
                        <span><BarChart3 size={20} /></span>
                        <span>Views: {post?.views}</span>
                        </div>
                        <button
                            type="button"
                            onClick={toggleSaved}
                            className={`ml-auto transition-colors ${isSaved ? 'text-cyan-400' : 'text-white/80 hover:text-white'}`}
                            aria-label={isSaved ? 'Remove from saved posts' : 'Save post'}
                        >
                            <Bookmark size={19} fill={isSaved ? 'currentColor' : 'none'} />
                        </button>
                        {!hasMedia && (
                            <button type="button" onClick={() => setShareOpen(true)} className="text-white/80 transition-colors hover:text-white" aria-label="Share">
                                <FiSend size={20} />
                            </button>
                        )}
                    </div>
                </div>
            </div>
            {shareOpen && <SharePostModal postId={post.id} onClose={() => setShareOpen(false)} />}
        </div>
    );
}