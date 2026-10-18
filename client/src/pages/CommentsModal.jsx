import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { CommentCard } from "../components/Comments/CommentCard";
import { setCommentText, setIsCommenting, setShowModal, setPosts } from "../redux/slices/feedSlice";
import { useDispatch, useSelector } from "react-redux";
import { FaWindowClose } from "react-icons/fa";
import axios from "axios";
import { getAuthHeaders } from "../utilites/communityHelper";

/* ─── CSS Variables & base styles injected once ─── */
if (!document.getElementById("coder-styles")) {
  const style = document.createElement("style");
  style.id = "coder-styles";
  style.textContent = `
    :root {
      --bg: #0a0a0f;
      --surface: #111118;
      --surface2: #16161f;
      --surface3: #1c1c28;
      --border: #2a2a3a;
      --border2: #3a3a50;
      --accent: #7c6aff;
      --accent2: #a78bfa;
      --accent-glow: rgba(124,106,255,0.15);
      --green: #22d3a0;
      --red: #ff6b6b;
      --text: #e4e4f0;
      --text2: #9090a8;
      --text3: #5a5a70;
    }
    .font-mono-coder { font-family: 'JetBrains Mono', monospace; }
    .font-sans-coder { font-family: 'Syne', sans-serif; }
    .coder-bg {
      background-color: var(--bg);
      background-image:
        radial-gradient(ellipse 60% 40% at 80% 0%, rgba(124,106,255,0.07) 0%, transparent 60%),
        radial-gradient(ellipse 40% 30% at 10% 100%, rgba(34,211,160,0.05) 0%, transparent 50%);
    }
    .coder-surface { background-color: var(--surface); }
    .coder-surface2 { background-color: var(--surface2); }
    .coder-surface3 { background-color: var(--surface3); }
    .coder-border { border-color: var(--border); }
    .coder-border2 { border-color: var(--border2); }
    .coder-text { color: var(--text); }
    .coder-text2 { color: var(--text2); }
    .coder-text3 { color: var(--text3); }
    .coder-accent { color: var(--accent); }
    .coder-accent2 { color: var(--accent2); }
    .coder-green { color: var(--green); }
    .coder-red { color: var(--red); }
    .input-area-focus:focus-within {
      border-color: var(--accent) !important;
      box-shadow: 0 0 0 3px var(--accent-glow);
    }
    .reply-wrap-focus:focus-within {
      border-color: var(--accent) !important;
    }
    .like-btn.liked {
      color: var(--red);
      border-color: rgba(255,107,107,0.3);
      background: rgba(255,107,107,0.07);
    }
    .like-btn:not(.liked):hover {
      border-color: var(--border2);
      color: var(--text2);
      background: var(--surface3);
    }
    .reply-toggle-btn:hover {
      color: var(--accent2);
      border-color: rgba(124,106,255,0.3);
      background: var(--accent-glow);
    }
    .action-btn-hover:hover {
      border-color: var(--border2);
      color: var(--text2);
      background: var(--surface3);
    }
    .attach-btn-hover:hover {
      border-color: var(--accent);
      color: var(--accent2);
      background: var(--accent-glow);
    }
    .comment-card-hover:hover {
      border-color: var(--border2);
    }
    @keyframes recPulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
    .rec-pulse { animation: recPulse 1s infinite; }
    @keyframes heartBeat { 0%{transform:scale(1)} 50%{transform:scale(1.35)} 100%{transform:scale(1)} }
    .heart-beat { animation: heartBeat 0.3s ease; }
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: var(--bg); }
    ::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 2px; }
    code.inline-code {
      background: var(--surface3);
      border: 1px solid var(--border);
      border-radius: 4px;
      padding: 1px 6px;
      font-size: 12px;
      color: var(--accent2);
      font-family: 'JetBrains Mono', monospace;
    }
  `;
  document.head.appendChild(style);
}


/* ─── Avatar gradient map ─── */
const AV_GRADIENTS = [
  "linear-gradient(135deg,#7c6aff,#a78bfa)",
  "linear-gradient(135deg,#22d3a0,#34d399)",
  "linear-gradient(135deg,#f59e0b,#f97316)",
  "linear-gradient(135deg,#ec4899,#f43f5e)",
  "linear-gradient(135deg,#3b82f6,#06b6d4)",
  "linear-gradient(135deg,#8b5cf6,#ec4899)",
];
const SELF_GRADIENT = "linear-gradient(135deg,#7c6aff,#22d3a0)";

const EMOJIS = ["😂", "🔥", "💀", "🚀", "👀", "✅", "❌", "💯", "🤔", "⚡", "🎉", "🛠", "👾", "🐛", "📦", "🧠"];

const VN_BARS = [8, 18, 12, 24, 10, 20, 14, 8, 22, 16, 10, 18];

/* ─── Avatar ─── */
// export function Avatar({ initials, gradientIdx, size = 36, self = false }) {
//   const bg = self ? SELF_GRADIENT : AV_GRADIENTS[gradientIdx % AV_GRADIENTS.length];
//   return (
//     <div
//       className="flex items-center justify-center font-sans-coder font-bold text-red-900 shrink-0 rounded-full"
//       style={{ width: size, height: size, background: bg, fontSize: size * 0.36 }}
//     >
//       {initials}
//     </div>
//   );
// }

/* ─── Badge ─── */
export function Badge({ badge }) {
  if (!badge) return null;
  const isMod = badge.type === "mod";
  return (
    <span
      className="text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-widest font-mono-coder"
      style={{
        fontSize: 9,
        background: isMod ? "rgba(124,106,255,0.15)" : "rgba(34,211,160,0.12)",
        color: isMod ? "var(--accent2)" : "var(--green)",
        border: `1px solid ${isMod ? "rgba(124,106,255,0.3)" : "rgba(34,211,160,0.25)"}`,
      }}
    >
      {badge.label}
    </span>
  );
}

/* ─── Voice Note Player ─── */
export function VoiceNote({ duration }) {
  const [playing, setPlaying] = useState(false);
  function handlePlay() {
    setPlaying(true);
    setTimeout(() => setPlaying(false), 2000);
  }
  return (
    <div
      className="flex items-center gap-2 rounded-xl px-3 py-2 mb-3"
      style={{ background: "var(--surface3)", border: "1px solid var(--border)", maxWidth: 260 }}
    >
      <button
        onClick={handlePlay}
        className="flex items-center justify-center rounded-full text-white text-xs transition-opacity hover:opacity-85"
        style={{ width: 30, height: 30, background: "var(--accent)", border: "none", cursor: "pointer" }}
      >
        {playing ? "⏸" : "▶"}
      </button>
      <div className="flex items-center gap-0.5 flex-1">
        {VN_BARS.map((h, i) => (
          <div
            key={i}
            className="rounded"
            style={{ width: 3, height: h, background: "var(--accent2)", opacity: playing ? 1 : 0.5, transition: "opacity 0.3s" }}
          />
        ))}
      </div>
      <span className="font-mono-coder coder-text3" style={{ fontSize: 11 }}>{duration}</span>
    </div>
  );
}

/* ─── Main Component ─── */
export default function Comments({ post, onComment }) {
  const apiUrl = import.meta.env.VITE_API_URL || '';
  const [pendingFiles, setPendingFiles] = useState([]);
  const [localComments, setLocalComments] = useState(() => post?.comments || []);
  const [commentsError, setCommentsError] = useState('');
  const [hasVoice, setHasVoice] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recSeconds, setRecSeconds] = useState(0);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [voiceDuration, setVoiceDuration] = useState(0);
  const commentText = useSelector(state => state.feed.commentText[post?.id] ?? '');
  const isCommenting = useSelector(state => state.feed.isCommenting[post?.id] ?? false);

  const dispatch = useDispatch();
  const mainInputRef = useRef(null);
  const recIntervalRef = useRef(null);
  const inputAreaRef = useRef(null);
  const threadRef = useRef(null);
  const emojiPanelRef = useRef(null);

  useEffect(() => {
    let isActive = true;

    async function loadComments() {
      if (!post?.id) return;
      setCommentsError('');
      try {
        const res = await axios.get(`${apiUrl}/api/community/posts/${post.id}`, {
          withCredentials: true,
          headers: getAuthHeaders(),
        });
        if (isActive) setLocalComments(Array.isArray(res.data?.post?.comments) ? res.data.post.comments : []);
      } catch (error) {
        if (isActive) {
          setCommentsError(error?.response?.data?.message || 'Unable to load comments');
          setLocalComments(Array.isArray(post.comments) ? post.comments : []);
        }
      }
    }

    setLocalComments(Array.isArray(post?.comments) ? post.comments : []);
    loadComments();

    return () => {
      isActive = false;
    };
  }, [apiUrl, post?.id]);

  const handleComment = async () => {
    if (!commentText.trim()) return;
    setCommentsError('');
    dispatch(setIsCommenting({ postId: post.id, value: true }));
    try {
      const res = await axios.post(
        `${apiUrl}/api/community/posts/${post.id}/comments`,
        { content: commentText.trim() },
        { withCredentials: true, headers: getAuthHeaders() }
      );
      const newComment = res.data?.comment;
      if (!newComment) throw new Error('The server did not return the new comment');

      setLocalComments(prev => [...(Array.isArray(prev) ? prev : []), newComment]);
      dispatch(setPosts(posts => posts.map(currentPost => (
        currentPost.id === post.id
          ? {
            ...currentPost,
            comments: [...(currentPost.comments || []), newComment],
            commentsCount: res.data.commentsCount ?? (currentPost.commentsCount || 0) + 1,
          }
          : currentPost
      ))));

      dispatch(setCommentText({ postId: post.id, value: '' }));
      if (onComment) onComment(post.id);
      console.log('new comment:', res);
    } catch (err) {
      setCommentsError(err?.response?.data?.message || 'Unable to post comment');
      console.error('Comment error:', err);
    } finally {
      dispatch(setIsCommenting({ postId: post.id, value: false }));
    }
  };

  /* Page-load GSAP stagger */
  // useEffect(() => {
  //   const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
  //   tl.fromTo(headerRef.current, { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.5 })
  //     .fromTo(inputAreaRef.current, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.4 }, "-=0.2")
  //     .fromTo(
  //       threadRef.current?.children ? Array.from(threadRef.current.children) : [],
  //       { opacity: 0, y: 20 },
  //       { opacity: 1, y: 0, duration: 0.35, stagger: 0.08 },
  //       "-=0.1"
  //     );
  // }, []);

  /* Close emoji on outside click */
  useEffect(() => {
    function handler(e) {
      if (emojiPanelRef.current && !emojiPanelRef.current.contains(e.target)) setEmojiOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!post) return null;

  /* ─── Recording ─── */
  function startRecording() {
    setIsRecording(true);
    setRecSeconds(0);
    recIntervalRef.current = setInterval(() => setRecSeconds(s => s + 1), 1000);
  }
  function stopRecording() {
    setIsRecording(false);
    clearInterval(recIntervalRef.current);
    setHasVoice(true);
    setVoiceDuration(recSeconds);
  }
  function toggleRecording() {
    if (isRecording) stopRecording(); else startRecording();
  }
  function removeVoice() {
    setHasVoice(false);
    setVoiceDuration(0);
  }
  const fmtTime = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  /* ─── File upload ─── */
  function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    setPendingFiles(p => [...p, { file, url: URL.createObjectURL(file) }]);
    e.target.value = "";
  }
  function removeFile(name) {
    setPendingFiles(p => p.filter(f => f.file.name !== name));
  }

  /* ─── Emoji ─── */
  function insertEmoji(em) {
    const inp = mainInputRef.current;
    const pos = inp.selectionStart;
    const next = commentText.slice(0, pos) + em + commentText.slice(pos);
    dispatch(setCommentText({ postId: post.id, value: next }));
    setEmojiOpen(false);
    setTimeout(() => {
      inp.focus();
      inp.setSelectionRange(pos + em.length, pos + em.length);
    }, 0);
  }

  const showPreviewBar = pendingFiles.length > 0 || hasVoice;

  return createPortal((
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4"
      style={{
        background: "rgba(0, 0, 0, 0.18)",
        // no blur
      }}
      onClick={() => dispatch(setShowModal({ postId: post.id, value: false }))}
    >
      <div
        className="font-mono-coder relative flex h-[90vh] w-full overflow-hidden rounded-[20px] border border-white/10 coder-text shadow-[0_25px_80px_rgba(0,0,0,0.28)] sm:h-[70vh] sm:w-[80vw] sm:max-w-[1200px] sm:rounded-[24px]"
        style={{
          background: "rgba(10, 12, 18, 0.94)",
        }}
        onClick={e => e.stopPropagation()}
      >
        <div className="absolute right-0 top-0 z-20 flex justify-end p-3">
          <FaWindowClose
            className="text-xl cursor-pointer hover:opacity-80"
            onClick={() => dispatch(setShowModal({ postId: post.id, value: false }))}
          />
        </div>
        <div className="w-full overflow-y-auto px-3 py-14 pb-8 sm:px-8 sm:py-5 sm:pb-10">
          {/* ─── INPUT AREA ─── */}
          <div
            ref={inputAreaRef}
            className="input-area-focus rounded-2xl p-4 mb-7 transition-all"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <div className="flex gap-3 items-start">
              <textarea
                ref={mainInputRef}
                className="flex-1 bg-transparent border-none outline-none coder-text font-mono-coder resize-none"
                style={{ fontSize: 13, lineHeight: 1.6, minHeight: 60 }}
                placeholder="add your comment"
                value={commentText}
                onChange={e => dispatch(setCommentText({ postId: post.id, value: e.target.value }))}
              />
            </div>

            {/* Preview Bar */}
            {showPreviewBar && (
              <div className="flex flex-wrap gap-2 mt-2.5">
                {pendingFiles.map(f => (
                  <div
                    key={f.file.name}
                    className="flex items-center gap-1.5 font-mono-coder coder-text2 rounded-lg px-2.5 py-1"
                    style={{ fontSize: 11, background: "var(--surface3)", border: "1px solid var(--border)" }}
                  >
                    🖼 {f.file.name}
                    <span className="coder-red cursor-pointer" onClick={() => removeFile(f.file.name)}>✕</span>
                  </div>
                ))}
                {hasVoice && (
                  <div
                    className="flex items-center gap-1.5 font-mono-coder coder-text2 rounded-lg px-2.5 py-1"
                    style={{ fontSize: 11, background: "var(--surface3)", border: "1px solid var(--border)" }}
                  >
                    🎙 Voice note ({fmtTime(voiceDuration)})
                    <span className="coder-red cursor-pointer" onClick={removeVoice}>✕</span>
                  </div>
                )}
              </div>
            )}

            {/* Voice Recording Bar */}
            {isRecording && (
              <div
                className="flex items-center gap-2.5 mt-2.5 rounded-xl px-3 py-2"
                style={{ background: "rgba(255,107,107,0.07)", border: "1px solid rgba(255,107,107,0.25)" }}
              >
                <div className="rec-pulse rounded-full" style={{ width: 8, height: 8, background: "var(--red)" }} />
                <span className="coder-red font-mono-coder flex-1" style={{ fontSize: 12 }}>{fmtTime(recSeconds)}</span>
                <button
                  onClick={stopRecording}
                  className="text-white font-mono-coder rounded-lg px-2.5 py-1"
                  style={{ fontSize: 11, background: "var(--red)", border: "none", cursor: "pointer" }}
                >
                  ■ Stop
                </button>
              </div>
            )}

            {/* Action Bar */}
            <div
              className="flex items-center gap-2 mt-3 pt-3"
              style={{ borderTop: "1px solid var(--border)" }}
            >
              <label
                className="attach-btn-hover flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 coder-text2 font-mono-coder transition-all cursor-pointer"
                style={{ fontSize: 13, background: "var(--surface2)", border: "1px solid var(--border)" }}
                title="Image / GIF"
              >
                🖼 <span style={{ fontSize: 11 }}>IMG</span>
                <input type="file" accept="image/*,image/gif" className="hidden" onChange={handleFile} />
              </label>

              <div className="relative" ref={emojiPanelRef}>
                <button
                  className="attach-btn-hover flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 coder-text2 font-mono-coder transition-all"
                  style={{ fontSize: 13, background: "var(--surface2)", border: "1px solid var(--border)", cursor: "pointer" }}
                  onClick={() => setEmojiOpen(o => !o)}
                  title="Emoji"
                >
                  😊 <span style={{ fontSize: 11 }}>EMO</span>
                </button>
                {emojiOpen && (
                  <div
                    className="absolute z-50 rounded-xl p-2.5"
                    style={{
                      bottom: 42,
                      left: 0,
                      background: "var(--surface2)",
                      border: "1px solid var(--border2)",
                      boxShadow: "0 8px 30px rgba(0,0,0,0.5)",
                      width: 260,
                      display: "grid",
                      gridTemplateColumns: "repeat(8,1fr)",
                      gap: 4,
                    }}
                  >
                    {EMOJIS.map(em => (
                      <button
                        key={em}
                        onClick={() => insertEmoji(em)}
                        className="rounded-lg transition-colors hover:bg-gray-700"
                        style={{ fontSize: 18, padding: 4, background: "none", border: "none", cursor: "pointer" }}
                      >
                        {em}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={toggleRecording}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-mono-coder transition-all ${isRecording ? "rec-pulse" : "attach-btn-hover"}`}
                style={{
                  fontSize: 13,
                  background: "var(--surface2)",
                  border: `1px solid ${isRecording ? "var(--red)" : "var(--border)"}`,
                  color: isRecording ? "var(--red)" : "var(--text2)",
                  cursor: "pointer",
                }}
                title="Voice Note"
              >
                🎙 <span style={{ fontSize: 11 }}>{isRecording ? "REC..." : "VOICE"}</span>
              </button>

              <button
                onClick={handleComment}
                disabled={isCommenting || !commentText.trim()}
                className="ml-auto text-white font-mono-coder font-semibold rounded-lg px-4 py-1.5 transition-all hover:opacity-90 hover:-translate-y-px active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
                style={{
                  fontSize: 12,
                  letterSpacing: 0.3,
                  background: "linear-gradient(135deg,var(--accent),#9f7aea)",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                {isCommenting ? 'Posting...' : 'Post →'}
              </button>
            </div>
          </div>

          <div
            className="font-sans-coder font-bold coder-text3 uppercase tracking-widest mb-4"
            style={{ fontSize: 12, letterSpacing: "1.5px" }}
          >
            — Comments
          </div>

          {commentsError && (
            <div className="mb-4 rounded-xl border border-red-400/30 bg-red-400/10 px-3 py-2 text-xs text-red-300">
              {commentsError}
            </div>
          )}

          <div ref={threadRef} className="flex flex-col gap-3.5">
            {[...(Array.isArray(localComments) ? localComments : [])].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map(c => (
              <CommentCard
                key={c.id}
                comment={c}
                onComment={handleComment}
                postId={post.id}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  ), document.body);
}