import React, { useState, useEffect, useRef, useMemo } from 'react';
import { X, Heart, Send, Mic, Smile, Play, Pause, MessageCircle, MoreHorizontal } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { setCapsuleInputText, setReplyText } from '../../redux/slices/capsuleSlice';
import { useSwipeable } from 'react-swipeable';

const AVATAR_COLORS = ['#52525b', '#57534e', '#3f3f46', '#44403c', '#525252', '#71717a', '#4b5563', '#5b5b62'];
const EMOJIS = ['😀', '😂', '😍', '🥰', '😎', '🤔', '👍', '👏', '🔥', '🎉', '❤️', '😢', '😮', '🙌', '💯', '😅', '🙏', '✨', '😁', '😊', '🥳', '😴', '👀', '💀'];

// function hashCode(str) {
//     let h = 0;
//     for (let i = 0; i < str.length; i++) { h = (h << 5) - h + str.charCodeAt(i); h |= 0; }
//     return h;
// }
// function pickColor(name) { return AVATAR_COLORS[Math.abs(hashCode(name)) % AVATAR_COLORS.length]; }
function formatLikes(n) { return n >= 1000 ? (n / 1000).toFixed(1) + 'k' : String(n); }
function formatTime(s) { const m = Math.floor(s / 60); const sec = s % 60; return `${m}:${sec < 10 ? '0' : ''}${sec}`; }
function parseDuration(str) { if (!str) return 0; const [m, s] = str.split(':').map(Number); return m * 60 + s; }
function genLiveBars() { return Array.from({ length: 20 }, () => 8 + Math.random() * 16); }

// Turns a backend createdAt ISO string into the short relative labels ("2h", "1d", etc.) the UI expects.
function formatRelativeTime(dateString) {
    if (!dateString) return '';
    const now = new Date();
    const date = new Date(dateString);
    const diffSec = Math.floor((now - date) / 1000);
    if (diffSec < 60) return 'now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour}h`;
    const diffDay = Math.floor(diffHour / 24);
    if (diffDay < 7) return `${diffDay}d`;
    return date.toLocaleDateString();
}

// Maps a raw backend comment (author id, content, likes[], createdAt, voiceNote, _id)
// into the shape CommentRow renders (id, user, text, time, likes, liked, replies, voice).
// function mapBackendComment(c) {
//   const hasVoice = !!(c.voiceNote && c.voiceNote.url);
//   return {
//     id: c.id ?? c._id, // some endpoints send _id, this shaped one sends id
//     user: { name: c.author?.username || 'Unknown' },
//     profilePic: c.author?.profilePic || '',
//     text: c.content,
//     time: formatRelativeTime(c.createdAt),
//     likes: c.likesCount ?? 0,
//     liked: !!c.isLikedByCurrentUser,
//     replies: Array.isArray(c.replies) ? c.replies.map(mapBackendComment) : [],
//     voice: hasVoice
//       ? {
//           duration: formatTime(c.voiceNote.duration || 0),
//           bars: Array.from({ length: 24 }, () => 25 + Math.random() * 70), // placeholder waveform, backend has no bar data
//         }
//       : undefined,
//   };
// }

// const SEED_TOP_LEVEL_COUNT = 7;

function CommentRow({
    comment, isReply, delay, expanded, onToggleExpand, onReplyClick,
    replyOpen, onReplySubmit,
    onLikeById, pulseId, playingVoiceId, onTogglePlay,
}) {
    const dispatch = useDispatch()
    const replyText = useSelector((state) => state.capsule.replyText ?? '');
    // console.log('text:', replyText)
    // const c = comment;
    const pulsing = pulseId === comment.id;
    const avatarSize = isReply ? 'w-7 h-7' : 'w-9 h-9';
    const capsuleInputText = useSelector((state) => state.capsule.capsuleInputText ?? '');
    console.log('text:', replyText);

    return (
        <div className={`flex gap-2.5 ${isReply ? 'py-1.5 pl-3 border-l border-neutral-800 ml-1' : 'py-2'} comment-pop-anim`} style={{ animationDelay: `${delay}ms` }}>
            <div className={`${avatarSize} flex-shrink-0 rounded-full overflow-hidden`}>
                {comment?.author?.profilePic ? (
                    <img
                        src={comment?.author?.profilePic}
                        alt={comment?.author?.username}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div
                        className="w-full h-full flex items-center justify-center font-semibold text-xs text-white"
                        style={{ background: comment?.author?.username }}
                    >
                        {comment?.author?.username?.[0]?.toUpperCase()}
                    </div>
                )}
            </div>

            <div className="flex-1 min-w-0">
                {comment.voice ? (
                    <div className="bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2.5 w-64 max-w-full">
                        <div className="text-xs font-semibold mb-1.5">{comment.user.name}</div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => onTogglePlay(comment.id, comment.voice.duration)}
                                aria-label={playingVoiceId === comment.id ? 'Pause voice note' : 'Play voice note'}
                                className="w-7 h-7 flex-shrink-0 rounded-full bg-neutral-700 border border-neutral-600 flex items-center justify-center text-neutral-100"
                            >
                                {playingVoiceId === comment.id ? <Pause size={11} /> : <Play size={11} fill="currentColor" />}
                            </button>
                            <div className="flex-1 flex items-center h-6 min-w-0 overflow-hidden" style={{ gap: '2px' }}>
                                {comment.voice.bars.map((h, i) => (
                                    <span
                                        key={i}
                                        className={`flex-shrink-0 rounded-sm ${playingVoiceId === comment.id ? 'bg-neutral-300 wave-bar-anim' : 'bg-neutral-500'}`}
                                        style={{ width: '2.5px', height: `${h}%`, animationDelay: playingVoiceId === comment.id ? `${-(i * 0.05)}s` : undefined }}
                                    />
                                ))}
                            </div>
                            <span className="text-xs text-neutral-500 flex-shrink-0">{comment.voice.duration}</span>
                        </div>
                    </div>
                ) : (
                    <div className="text-sm leading-relaxed break-words">
                        <span className="font-semibold mr-1">{comment?.author?.username}</span>{comment.content}
                    </div>
                )}

                <div className="flex items-center gap-3 mt-1 text-xs text-neutral-500">
                    <span>{comment.time}</span>
                    {comment.likes > 0 && <span className="font-semibold text-neutral-500">{formatLikes(comment.likes)} likes</span>}
                    {!isReply && (
                        <button onClick={onReplyClick} className="font-semibold hover:text-neutral-300 transition-colors">Reply</button>
                    )}
                </div>

                {!isReply && comment.replies && comment.replies.length > 0 && (
                    <button onClick={onToggleExpand} className="block mt-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-300 transition-colors">
                        {expanded ? '— Hide replies' : `— View ${comment.replies.length} ${comment.replies.length === 1 ? 'reply' : 'replies'}`}
                    </button>
                )}

                {!isReply && expanded && comment.replies && comment.replies.map((r, i) => (
                    <CommentRow
                        key={r.id}
                        comment={r}
                        isReply={true}
                        delay={i * 60}
                        onLikeById={onLikeById}
                        pulseId={pulseId}
                        playingVoiceId={playingVoiceId}
                        onTogglePlay={onTogglePlay}
                    />
                ))}

                {!isReply && (
                    <div className={`items-center gap-2 mt-2.5 ${replyOpen ? 'flex' : 'hidden'}`}>
                        {/* <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-semibold" style={{ background: 'You' }}>Y</div> */}
                        <input
                            autoFocus={replyOpen}
                            value={replyText}
                            onChange={(e) => dispatch(setReplyText(e.target.value))}
                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); onReplySubmit(); } }}
                            placeholder={`Reply to ${comment?.author?.username}...`}
                            type="text"
                            className="flex-1 min-w-0 bg-neutral-800 border border-neutral-700 text-neutral-100 placeholder-neutral-500 text-xs rounded-full px-3 py-1.5 focus:outline-none focus:border-neutral-500"
                        />
                        <button onClick={onReplySubmit} className="text-xs font-bold text-red-500 shrink-0 px-1">Post</button>
                    </div>
                )}
            </div>

            <span>{comment.likes ?? 0}</span>
            <button
                onClick={() => onLikeById}
                aria-label={isReply ? 'Like reply' : 'Like comment'}
                className={`flex-shrink-0 self-start mt-0.5 p-1 transition-colors ${comment.liked ? 'text-red-500' : 'text-neutral-500 hover:text-neutral-300'} ${pulsing ? 'heart-pop-anim' : ''}`}
            >
                <Heart size={isReply ? 13 : 15} fill={comment.liked ? 'currentColor' : 'none'} />
            </button>
        </div>
    );
}

const CapsuleCommentModal = ({ ogcomments, onComment, onCommentReply, onCommentLike, onClose }) => {
    const replyText = useSelector((state) => state.capsule.replyText ?? '');
    const [comments, setComments] = useState([]);
    const [entered, setEntered] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [expandedReplies, setExpandedReplies] = useState(() => new Set());
    const [activeReplyId, setActiveReplyId] = useState(null);
    const [emojiOpen, setEmojiOpen] = useState(false);
    const [pulseId, setPulseId] = useState(null);
    const [playingVoiceId, setPlayingVoiceId] = useState(null);
    const [recording, setRecording] = useState(false);
    const [recordSeconds, setRecordSeconds] = useState(0);
    const [liveBars, setLiveBars] = useState(genLiveBars);

    const capsuleInputText = useSelector((state) => state.capsule.capsuleInputText ?? '');
    console.log('text', capsuleInputText);
    // const replyText = useSelector((state) => state.capsule.replyText ?? '');
    const dispatch = useDispatch();

    const idCounter = useRef(100);
    const newId = () => { idCounter.current += 1; return idCounter.current; };

    const listRef = useRef(null);
    const firstRenderRef = useRef(true);
    const emojiRef = useRef(null);
    const emojiBtnRef = useRef(null);
    const closeTimeoutRef = useRef(null);

    // --- swipe-to-close (mobile bottom sheet) ---
    const sheetRef = useRef(null);
    const overlayRef = useRef(null);
    const rafRef = useRef(null);
    const closingRef = useRef(false);

    const DISMISS_DISTANCE = 120; // px of drag before we treat it as a close
    const DISMISS_VELOCITY = 0.5; // px/ms flick speed that also counts as a close
    const SHEET_HEIGHT_FOR_FADE = 400; // rough px used to scale the backdrop fade

    const setSheetStyles = (translateY, opacity, transition) => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(() => {
            if (sheetRef.current) {
                if (transition !== undefined) sheetRef.current.style.transition = transition;
                sheetRef.current.style.transform = `translateY(${translateY}px)`;
            }
            if (overlayRef.current) {
                if (transition !== undefined) overlayRef.current.style.transition = transition;
                overlayRef.current.style.opacity = String(opacity);
            }
        });
    };

    const resetSheetInlineStyles = () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        if (sheetRef.current) {
            sheetRef.current.style.transition = '';
            sheetRef.current.style.transform = '';
        }
        if (overlayRef.current) {
            overlayRef.current.style.transition = '';
            overlayRef.current.style.opacity = '';
        }
    };

    const swipeHandlers = useSwipeable({
        onSwiping: (e) => {
            if (!isMobile || closingRef.current) return;
            // Only follow downward drags; ignore upward/sideways movement.
            const dy = Math.max(0, e.deltaY);
            const fade = Math.max(0.4, 1 - dy / SHEET_HEIGHT_FOR_FADE);
            setSheetStyles(dy, fade, 'none');
        },
        onSwiped: (e) => {
            if (!isMobile || closingRef.current) return;
            const dy = Math.max(0, e.deltaY);
            const isFastFlickDown = e.dir === 'Down' && e.velocity > DISMISS_VELOCITY;

            if (dy > DISMISS_DISTANCE || isFastFlickDown) {
                closingRef.current = true;
                setSheetStyles(window.innerHeight, 0, 'transform 200ms cubic-bezier(0.32, 0.72, 0, 1), opacity 200ms ease-out');
                closeTimeoutRef.current = setTimeout(() => {
                    onClose();
                }, 200);
            } else {
                setSheetStyles(0, 1, 'transform 220ms cubic-bezier(0.32, 0.72, 0, 1), opacity 220ms ease-out');
                setTimeout(resetSheetInlineStyles, 220);
            }
        },
        trackTouch: true,
        trackMouse: false,
        preventScrollOnSwipe: true,
        delta: 8,
    });

    useEffect(() => {
        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
        };
    }, []);
    // --- end swipe-to-close ---

    // Loads/refreshes comments whenever the backend data prop changes.
    useEffect(() => {
        if (Array.isArray(ogcomments)) {
            setComments(ogcomments);
        }
    }, [ogcomments]);

    const totalCount = useMemo(
        () => comments.reduce((sum, c) => sum + 1 + (c.replies ? c.replies.length : 0), 0),
        [comments]
    );

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth <= 640);
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);

    const openModal = () => {
        if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
        // setIsOpen(true);
        requestAnimationFrame(() => requestAnimationFrame(() => setEntered(true)));
    };

    useEffect(() => {
        const t = setTimeout(openModal, 100);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (firstRenderRef.current) { firstRenderRef.current = false; return; }
        if (listRef.current) listRef.current.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
    }, [comments.length]);

    useEffect(() => {
        if (!emojiOpen) return undefined;
        const onClick = (e) => {
            if (
                emojiRef.current && !emojiRef.current.contains(e.target) &&
                emojiBtnRef.current && !emojiBtnRef.current.contains(e.target)
            ) setEmojiOpen(false);
        };
        document.addEventListener('mousedown', onClick);
        return () => document.removeEventListener('mousedown', onClick);
    }, [emojiOpen]);

    useEffect(() => {
        if (!recording) return undefined;
        const t = setInterval(() => setRecordSeconds((s) => s + 1), 1000);
        return () => clearInterval(t);
    }, [recording]);

    const toggleExpand = (id) => {
        setExpandedReplies((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    };

    const togglePlay = (id, durationStr) => {
        if (playingVoiceId === id) {
            setPlayingVoiceId(null);
            return;
        }
        setPlayingVoiceId(id);
        const secs = parseDuration(durationStr) || 1;
        setTimeout(() => setPlayingVoiceId((curr) => (curr === id ? null : curr)), secs * 1000);
    };

    const openReplyBox = (id) => {
        setActiveReplyId((prev) => (prev === id ? null : id));
        dispatch(setReplyText(''));
    };

    const startRecording = () => { setRecording(true); setRecordSeconds(0); setLiveBars(genLiveBars()); };
    const cancelRecording = () => { setRecording(false); setRecordSeconds(0); };
    const sendRecording = () => {
        const secs = recordSeconds || 1;
        const bars = Array.from({ length: 24 }, () => 25 + Math.random() * 70);
        const c = { id: newId(), user: { name: 'You' }, time: 'now', likes: 0, liked: false, replies: [], voice: { duration: formatTime(secs), bars } };
        setComments((prev) => [...prev, c]);
        setRecording(false);
        setRecordSeconds(0);
    };

    const modalStyle = isMobile
        ? { width: '100%', height: '82vh', maxHeight: '88vh', willChange: 'transform' }
        : { width: 'clamp(380px, 27vw, 460px)', maxWidth: '92vw', height: 'clamp(500px, 64vh, 720px)', maxHeight: '90vh' };

    const modalTransformClass = isMobile
        ? (entered ? 'translate-y-0' : 'translate-y-full')
        : (entered ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-2');

    console.log('comment', comments)
    console.log('og', ogcomments)

    const submitReply = async (parentId) => {
        await onCommentReply(parentId);
        dispatch(setReplyText(''));
    };

    const toggleLike = async (parentId) => {
        await onCommentLike(parentId);
    };

    return (
        <div>
            <div
                ref={overlayRef}
                className={`fixed inset-0 z-50 flex ${isMobile ? 'items-end' : 'items-center'} justify-center text-white z-10 bg-black/20 bg-opacity-60 backdrop-blur-sm transition-opacity duration-300 ${entered ? 'opacity-100' : 'opacity-0'}`}
            // onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
            >
                <div
                    ref={sheetRef}
                    role="dialog"
                    aria-modal="true"
                    aria-label="Comments"
                    style={modalStyle}
                    className={`relative flex flex-col bg-neutral-900 border border-neutral-800 shadow-2xl overflow-hidden transition-all duration-300 ease-out ${isMobile ? 'rounded-t-3xl' : 'rounded-3xl'} ${modalTransformClass}`}
                >
                    {/* Drag handle + header double as the swipe-to-dismiss zone, so the comment list below keeps normal scroll behavior */}
                    <div {...(isMobile ? swipeHandlers : {})} style={isMobile ? { touchAction: 'none' } : undefined}>
                        {isMobile && <div className="w-9 h-1 rounded-full bg-neutral-700 mx-auto mt-2.5 flex-shrink-0" />}

                        <div className="flex items-center justify-between px-4 py-3.5 border-b border-neutral-800 flex-shrink-0">
                            <h2 className="text-sm font-semibold flex items-baseline gap-1.5 m-0">
                                Comments <span className="text-neutral-500 font-medium text-xs">{totalCount}</span>
                            </h2>
                            <button onClick={onClose} aria-label="Close comments" className="w-8 h-8 flex items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100 transition-colors">
                                <X size={18} />
                            </button>
                        </div>
                    </div>

                    <div ref={listRef} className="comments-scroll flex-1 min-h-0 overflow-y-auto px-4 pt-3 pb-1">
                        {comments.map((c, idx) => (
                            <CommentRow
                                key={c?.author?.id}
                                test={c}
                                comment={c}
                                isReply={false}
                                // delay={idx < SEED_TOP_LEVEL_COUNT ? 150 + idx * 70 : 0}
                                expanded={expandedReplies.has(c.id)}
                                onToggleExpand={() => toggleExpand(c.id)}
                                onReplyClick={() => openReplyBox(c.id)}
                                replyOpen={activeReplyId === c.id}
                                onReplySubmit={() => submitReply(c.id)}
                                onLikeById={toggleLike(c.id)}
                                pulseId={pulseId}
                                playingVoiceId={playingVoiceId}
                                onTogglePlay={togglePlay}
                            />
                        ))}
                    </div>

                    <div className="flex-shrink-0 border-t border-neutral-800 bg-neutral-900 px-3 py-2.5 relative">
                        {emojiOpen && (
                            <div ref={emojiRef} className="absolute left-3 right-3 bottom-full mb-2 bg-neutral-800 border border-neutral-700 rounded-2xl p-2.5 grid grid-cols-6 gap-1 shadow-xl">
                                {EMOJIS.map((e) => (
                                    <button key={e} onClick={() => dispatch(setCapsuleInputText((v) => v + e))} className="text-lg py-1.5 rounded-lg hover:bg-neutral-700 leading-none">
                                        {e}
                                    </button>
                                ))}
                            </div>
                        )}

                        {!recording ? (
                            <div className="flex items-center gap-1.5">
                                <button ref={emojiBtnRef} onClick={() => setEmojiOpen((o) => !o)} aria-label="Add emoji" className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100 transition-colors">
                                    <Smile size={19} />
                                </button>
                                <input
                                    value={capsuleInputText}
                                    onChange={(e) => dispatch(setCapsuleInputText(e.target.value))}
                                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); onComment } }}
                                    type="text"
                                    placeholder="Add a comment..."
                                    className="flex-1 min-w-0 bg-neutral-800 border border-neutral-700 text-neutral-100 placeholder-neutral-500 text-sm rounded-full px-3.5 py-2 focus:outline-none focus:border-neutral-500"
                                />
                                <button onClick={startRecording} aria-label="Record voice note" className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100 transition-colors">
                                    <Mic size={18} />
                                </button>
                                <button
                                    onClick={onComment}
                                    disabled={!capsuleInputText.trim()}
                                    aria-label="Post comment"
                                    className={`w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full transition-colors ${capsuleInputText.trim() ? 'text-red-500 hover:bg-neutral-800' : 'text-neutral-600'}`}
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2.5 px-1">
                                <button onClick={cancelRecording} aria-label="Cancel recording" className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full bg-neutral-800 text-neutral-400 hover:text-neutral-100 transition-colors">
                                    <X size={15} />
                                </button>
                                <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0 rec-dot-anim" />
                                <div className="flex-1 flex items-center h-6 min-w-0 overflow-hidden" style={{ gap: '2px' }}>
                                    {liveBars.map((h, i) => (
                                        <span key={i} className="flex-shrink-0 rounded-sm bg-red-500 rec-bar-anim" style={{ width: '2.5px', height: `${h}px`, animationDelay: `${-(i * 0.05)}s` }} />
                                    ))}
                                </div>
                                <span className="text-xs text-neutral-400 flex-shrink-0 tabular-nums w-9">{formatTime(recordSeconds)}</span>
                                <button onClick={sendRecording} aria-label="Send voice note" className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full bg-red-500 bg-opacity-20 text-red-500">
                                    <Send size={15} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CapsuleCommentModal;