/**
 * ImagePreviewModal.jsx
 * ------------------------------------------------------------------
 * Glassmorphic "gallery" preview modal for a post feed.
 *
 * Dependencies (make sure these are installed in your project):
 *   npm install gsap
 *   react-icons  (already used in your PostCard, so likely present)
 *
 * Usage:
 *   const [preview, setPreview] = useState({ open: false, index: 0 });
 *   <ImagePreviewModal
 *     posts={posts}                // your real posts array
 *     initialIndex={preview.index}
 *     isOpen={preview.open}
 *     onClose={() => setPreview({ open: false, index: 0 })}
 *   />
 *
 * If you don't pass `posts`, SAMPLE_POSTS below is used automatically
 * so you can drop this straight into a page and see it working.
 * ------------------------------------------------------------------
 */

import React, { useState, useRef, useLayoutEffect, useCallback, useEffect } from "react";
import { gsap } from "gsap";
import { FaHeart, FaPlay, FaVolumeMute, FaVolumeUp, FaChevronLeft, FaChevronRight, FaTimes } from "react-icons/fa";
import { FiSend, FiMessageCircle } from "react-icons/fi";

/* ------------------------------------------------------------------ */
/* Small helpers                                                       */
/* ------------------------------------------------------------------ */

const formatTimeAgo = (date) => {
    const diff = Math.max(0, Math.floor((Date.now() - new Date(date).getTime()) / 1000));
    if (diff < 60) return `${diff}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
};

const getDisplayName = (value) => {
    if (typeof value === "string") return value;
    if (value && typeof value === "object") {
        return value.username || value.name || value.displayName || "?";
    }
    return "?";
};

const AvatarInitial = ({ name = "?", size = 36 }) => {
    const displayName = getDisplayName(name);

    return (
        <div
            className="flex shrink-0 items-center justify-center rounded-full font-semibold text-white"
            style={{
                width: size,
                height: size,
                fontSize: size * 0.42,
                background: "linear-gradient(135deg,#8b5cf6,#ec4899)",
            }}
        >
            {displayName.charAt(0).toUpperCase()}
        </div>
    );
};

const prefersReducedMotion = () =>
    typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/* ------------------------------------------------------------------ */
/* Sample data — remove once you wire in real posts                    */
/* ------------------------------------------------------------------ */

const SAMPLE_POSTS = [
    {
        id: "p1",
        author: { id: "u1", username: "wanderlust.mia", profilePic: null },
        createdAt: Date.now() - 1000 * 60 * 42,
        content: "Golden hour on the cliffs. Somehow the photo still doesn't do it justice.",
        mediaType: "image",
        mediaUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80",
        likeCount: 2481,
        comments: [
            { id: "c1", author: "theo.codes", text: "This is unreal, where is this?!" },
            { id: "c2", author: "avaonwheels", text: "Adding this to my bucket list right now." },
            { id: "c3", author: "nilsen.k", text: "The color grading on this is so good." },
            { id: "c4", author: "priya.shoots", text: "Golden hour never misses." },
        ],
    },
    {
        id: "p2",
        author: { id: "u2", username: "cafe.diaries", profilePic: null },
        createdAt: Date.now() - 1000 * 60 * 60 * 5,
        content: "Slow mornings are the best mornings.",
        mediaType: "video",
        mediaUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
        likeCount: 963,
        comments: [
            { id: "c1", author: "matcha.mel", text: "That plating is so satisfying to watch." },
            { id: "c2", author: "jrn.wanders", text: "Need this energy on a Monday." },
        ],
    },
    {
        id: "p3",
        author: { id: "u3", username: "urban.sketches", profilePic: null },
        createdAt: Date.now() - 1000 * 60 * 60 * 24,
        content: "Some days the city just paints itself.",
        mediaType: "image",
        mediaUrl: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1400&q=80",
        likeCount: 1204,
        comments: [
            { id: "c1", author: "leo.frames", text: "That skyline though." },
            { id: "c2", author: "sana_writes", text: "Saving this for a phone wallpaper." },
            { id: "c3", author: "kb.travels", text: "Which lens did you use for this?" },
        ],
    },
    {
        id: "p4",
        author: { id: "u4", username: "notes.by.arjun", profilePic: null },
        createdAt: Date.now() - 1000 * 60 * 60 * 30,
        content:
            "Reminder: the version of your plan that survives contact with reality is always messier than the one in your head, and that's fine.",
        mediaType: null,
        mediaUrl: null,
        likeCount: 3110,
        comments: [
            { id: "c1", author: "dee.builds", text: "Needed to read this today." },
            { id: "c2", author: "farhan.k", text: "Screenshotting this." },
        ],
    },
];

/* ------------------------------------------------------------------ */
/* Main component                                                      */
/* ------------------------------------------------------------------ */

export default function PostPreview({ posts, initialIndex = 0, isOpen, onClose }) {
    const apiUrl = import.meta.env.VITE_API_URL || '';
    const previewPosts = Array.isArray(posts) ? posts : [];
    const [index, setIndex] = useState(initialIndex);
    const [isClosing, setIsClosing] = useState(false);
    const [isMuted, setIsMuted] = useState(true);
    const [isPlaying, setIsPlaying] = useState(false);
    const [mediaLoaded, setMediaLoaded] = useState(false);

    const backdropRef = useRef(null);
    const cardRef = useRef(null);
    const glowRef = useRef(null);
    const slideRef = useRef(null); // animated on prev/next
    const videoRef = useRef(null);

    const post = previewPosts[index];
    const imageUrl = post?.image?.startsWith('/') ? `${apiUrl}${post.image}` : post?.image;
    const videoUrl = post?.video?.startsWith('/') ? `${apiUrl}${post.video}` : post?.video;
    const hasImage = !!imageUrl;
    const hasVideo = !!videoUrl;
    const hasMedia = hasImage || hasVideo;

    // Keep the requested index in sync if the caller opens the modal on a different post
    useEffect(() => {
        if (isOpen) setIndex(initialIndex);
    }, [isOpen, initialIndex]);

    useEffect(() => setMediaLoaded(false), [index]);

    /* ---------------- open animation ---------------- */
    useLayoutEffect(() => {
        if (!isOpen) return;
        const reduced = prefersReducedMotion();
        const ctx = gsap.context(() => {
            gsap.set(backdropRef.current, { opacity: 0 });
            gsap.set(cardRef.current, { opacity: 0, scale: 0.9, y: 28 });
            const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
            tl.to(backdropRef.current, { opacity: 1, duration: reduced ? 0.01 : 0.35 }).to(
                cardRef.current,
                { opacity: 1, scale: 1, y: 0, duration: reduced ? 0.01 : 0.5 },
                "-=0.2"
            );
        });
        return () => ctx.revert();
    }, [isOpen]);

    /* ---------------- close animation ---------------- */
    const handleClose = useCallback(() => {
        if (isClosing) return;
        setIsClosing(true);
        const reduced = prefersReducedMotion();
        const tl = gsap.timeline({
            defaults: { ease: "power2.in" },
            onComplete: () => {
                setIsClosing(false);
                onClose && onClose();
            },
        });
        tl.to(cardRef.current, { opacity: 0, scale: 0.92, y: 18, duration: reduced ? 0.01 : 0.28 }).to(
            backdropRef.current,
            { opacity: 0, duration: reduced ? 0.01 : 0.22 },
            "-=0.12"
        );
    }, [isClosing, onClose]);

    /* ---------------- gallery slide transition ---------------- */
    const goTo = useCallback(
        (nextIndex, direction) => {
            if (nextIndex < 0 || nextIndex >= previewPosts.length || nextIndex === index) return;
            const reduced = prefersReducedMotion();
            setIsPlaying(false);
            const el = slideRef.current;
            const outX = direction === 1 ? -36 : 36;
            const inX = direction === 1 ? 36 : -36;

            const tl = gsap.timeline();
            tl.to(el, { x: outX, opacity: 0, duration: reduced ? 0.01 : 0.2, ease: "power2.in" }).call(() => {
                setIndex(nextIndex);
                gsap.set(el, { x: inX });
                gsap.to(el, { x: 0, opacity: 1, duration: reduced ? 0.01 : 0.35, ease: "power3.out" });
            });

            // subtle glow re-tint per post, just for visual variety
            const palette = ["#8b5cf6", "#ec4899", "#22d3ee", "#f59e0b"];
            gsap.to(glowRef.current, {
                backgroundColor: palette[nextIndex % palette.length],
                duration: 0.6,
                ease: "power2.out",
            });
        },
        [index, previewPosts.length]
    );

    const handlePrev = useCallback(() => goTo(index - 1, -1), [goTo, index]);
    const handleNext = useCallback(() => goTo(index + 1, 1), [goTo, index]);

    /* ---------------- keyboard support ---------------- */
    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e) => {
            if (e.key === "Escape") handleClose();
            if (e.key === "ArrowLeft") handlePrev();
            if (e.key === "ArrowRight") handleNext();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [isOpen, handleClose, handlePrev, handleNext]);

    const toggleVideoPlay = () => {
        const v = videoRef.current;
        if (!v) return;
        v.paused ? v.play() : v.pause();
    };

    if (!isOpen || !post) return null;

    return (
        <div
            ref={backdropRef}
            onClick={handleClose}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-0 backdrop-blur-md sm:p-4"
        >
            {/* ambient glow behind the card */}
            <div
                ref={glowRef}
                aria-hidden="true"
                className="pointer-events-none absolute -z-10 h-[40%] w-[55%] rounded-full opacity-40 blur-[110px]"
                style={{ backgroundColor: "#8b5cf6" }}
            />

            {/* card */}
            <div
                ref={cardRef}
                onClick={(e) => e.stopPropagation()}
                className="relative flex h-[92vh] w-[90vw] left-5 flex-col overflow-hidden rounded-[1.75rem]
                    sm:h-[85vh] sm:w-[80vw] sm:rounded-[2.25rem]
                    lg:h-[80vh] lg:w-[60vw] lg:flex-row lg:rounded-[2.5rem]"
                style={{
                    background: "linear-gradient(160deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.04) 100%)",
                    backdropFilter: "blur(28px) saturate(160%)",
                    WebkitBackdropFilter: "blur(28px) saturate(160%)",
                    border: "1px solid rgba(255,255,255,0.25)",
                    boxShadow: "0 30px 90px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.4)",
                }}
            >
                {/* close */}
                <button
                    type="button"
                    onClick={handleClose}
                    aria-label="Close preview"
                    className="absolute right-4 top-4 z-30 flex h-9 w-9 items-center justify-center rounded-full
                        bg-black/30 text-white/90 backdrop-blur-md transition-colors hover:bg-black/50 hover:text-white
                        focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/60"
                >
                    <FaTimes size={15} />
                </button>

                {/* prev / next — buttons only, no swipe logic */}
                {index > 0 && (
                    <button
                        type="button"
                        onClick={handlePrev}
                        aria-label="Previous post"
                        className="absolute left-2 top-1/2 z-30 -translate-y-1/2 flex h-10 w-10 items-center justify-center
                        rounded-full bg-black/30 text-white backdrop-blur-md transition-all
                        hover:scale-105 hover:bg-black/50 active:scale-95 sm:left-4 sm:h-11 sm:w-11"
                    >
                        <FaChevronLeft size={16} />
                    </button>
                )}
                {index < previewPosts.length - 1 && (
                    <button
                        type="button"
                        onClick={handleNext}
                        aria-label="Next post"
                        className="absolute right-2 top-1/2 z-30 -translate-y-1/2 flex h-10 w-10 items-center justify-center
                        rounded-full bg-black/30 text-white backdrop-blur-md transition-all
                        hover:scale-105 hover:bg-black/50 active:scale-95 sm:right-4 sm:h-11 sm:w-11"
                    >
                        <FaChevronRight size={16} />
                    </button>
                )}

                <div
                    className="absolute lg:left-60 sm:left-50 top-4 z-30 rounded-full bg-black/30 px-3 py-1 text-[11px] font-medium text-white/80 backdrop-blur-md"
                    style={{ fontFamily: "'DM Mono', monospace" }}
                >
                    {index + 1} / {previewPosts.length} posts
                </div>

                {/* ---------------- main / post column ---------------- */}
                <div className="relative flex min-h-0 w-full flex-col overflow-y-auto lg:h-full lg:w-[62%]">
                    <div ref={slideRef} className="flex min-h-full flex-col">
                        {/* header */}
                        <div className="flex shrink-0 items-center gap-3 px-5 pb-3 pt-14 sm:pt-5">
                            {post.author.profilePic ? (
                                <img
                                    src={post.author.profilePic}
                                    alt=""
                                    className="h-9 w-9 rounded-full object-cover ring-2 ring-white/50"
                                />
                            ) : (
                                <AvatarInitial name={post.author.username} size={36} />
                            )}
                            <div className="min-w-0 flex-1">
                                <span
                                    className="block truncate text-[14px] font-semibold text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.35)]"
                                    style={{ fontFamily: "'Syne', sans-serif" }}
                                >
                                    {post.author.username}
                                </span>
                                <span className="text-[11px] text-white/70" style={{ fontFamily: "'DM Mono', monospace" }}>
                                    {formatTimeAgo(post.createdAt)} ago
                                </span>
                            </div>
                        </div>

                        {/* media / text body */}
                        {hasMedia ? (
                            <div
                                className="relative mx-4 flex flex-none items-center justify-center sm:mx-5"
                            >
                                {/* loading skeleton */}
                                {!mediaLoaded && (
                                    <div className="absolute justify-center inset-0 animate-pulse bg-gradient-to-br from-white/10 to-white/[0.03]" />
                                )}

                                {hasVideo ? (
                                    <>
                                        <video
                                            key={post.id}
                                            ref={videoRef}
                                            src={videoUrl}
                                            className="relative block h-auto max-h-[58vh] w-auto max-w-full cursor-pointer rounded-[clamp(1rem,3vw,1.5rem)] object-contain"
                                            playsInline
                                            loop
                                            muted={isMuted}
                                            onClick={toggleVideoPlay}
                                            onPlay={() => setIsPlaying(true)}
                                            onPause={() => setIsPlaying(false)}
                                            onLoadedData={() => setMediaLoaded(true)}
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
                                            onClick={() => setIsMuted((m) => !m)}
                                            aria-label={isMuted ? "Unmute" : "Mute"}
                                            className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full
                                            bg-black/45 text-white transition-colors hover:bg-black/65"
                                        >
                                            {isMuted ? <FaVolumeMute size={13} /> : <FaVolumeUp size={13} />}
                                        </button>
                                    </>
                                ) : (
                                    <img
                                        key={post.id}
                                        src={imageUrl}
                                        alt=""
                                        className="relative block h-auto max-h-[58vh] w-auto max-w-full rounded-[clamp(1rem,3vw,1.5rem)] object-contain"
                                        onLoad={() => setMediaLoaded(true)}
                                    />
                                )}
                            </div>
                        ) : (
                            <div className="relative flex min-h-0 flex-1 items-center justify-center px-8">
                                <p
                                    className="text-center text-[18px] leading-[1.7] text-white [text-shadow:0_2px_8px_rgba(0,0,0,0.25)]"
                                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                                >
                                    {post.content}
                                </p>
                            </div>
                        )}

                        {/* caption + actions */}
                        <div className="flex-shrink-0 px-5 pb-6 pt-3 sm:pb-5">
                            {hasMedia && post.content && (
                                <p
                                    className="mb-3 text-[13px] leading-[1.5] text-white/95 [text-shadow:0_1px_2px_rgba(0,0,0,0.2)]"
                                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                                >
                                    {post.content}
                                </p>
                            )}
                        </div>
                    </div>

                </div>

                {/* ---------------- separator (desktop only) ---------------- */}
                <div className="my-6 hidden w-px bg-white/15 lg:block" />

                {/* ---------------- comments column (desktop only) ---------------- */}
                <div className="flex px-5 items-center gap-5">
                    <button
                        type="button"
                        aria-label="Like"
                        className="flex items-center gap-1.5 rounded-full text-white/90 transition-colors hover:text-white"
                    >
                        <FaHeart size={20} />
                        <span className="text-[12.5px]" style={{ fontFamily: "'DM Mono', monospace" }}>
                            {(post.likesCount ?? post.likes?.length ?? 0).toLocaleString()}
                        </span>
                    </button>

                    <button
                        type="button"
                        aria-label="Comments"
                        className="flex items-center gap-1.5 rounded-full text-white/90 transition-colors hover:text-white lg:hidden"
                    >
                        <FiMessageCircle size={20} />
                        <span className="text-[12.5px]" style={{ fontFamily: "'DM Mono', monospace" }}>
                            {post.commentsCount ?? post.comments?.length ?? 0}
                        </span>
                    </button>

                    <button
                        type="button"
                        aria-label="Share"
                        className="ml-auto text-white/80 transition-colors hover:text-white"
                    >
                        <FiSend size={20} />
                    </button>
                </div>
            </div>

            {/* scoped scrollbar styling for the comments panel */}
            <style>{`
        .preview-comments::-webkit-scrollbar { width: 5px; }
        .preview-comments::-webkit-scrollbar-track { background: transparent; }
        .preview-comments::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.18);
          border-radius: 9999px;
        }
        .preview-comments { scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.18) transparent; }
      `}</style>
        </div>
    );
}