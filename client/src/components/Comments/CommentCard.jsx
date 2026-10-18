import gsap from "gsap";
import { useEffect, useRef, useState } from "react";
import { Badge, VoiceNote } from "../../pages/CommentsModal";
import { ReplyCard } from "./ReplyCard";
import axios from "axios";
import { setCommentLiked, setCommentLikedCount, setLocalCommentReplies, setRepliesOpen, setReplyText } from "../../redux/slices/feedSlice";
import { useDispatch, useSelector } from "react-redux";
import { formatTimeAgo, getAuthHeaders } from "../../utilites/communityHelper";
import { FaHeart, FaRegHeart, FaTrash } from "react-icons/fa";

const SELF_GRADIENT = "linear-gradient(135deg,#7c6aff,#22d3a0)";

/* ─── Sample data ─── */
const INITIAL_COMMENTS = [
];

/* ─── Comment Card ─── */
export const CommentCard = ({ postId, comment }) => {
  const commentId = comment.id
  const apiUrl = import.meta.env.VITE_API_URL || '';
  // const [repliesOpen, setRepliesOpen] = useState(comment.replies);
  const heartAnim = useSelector(state => state.feed.heartAnim[comment.id] ?? false);
  const localCommentReplies = useSelector(state => state.feed.localCommentReplies[commentId] ?? comment.replies ?? [])
  const repliesOpen = useSelector(state => state.feed.repliesOpen[commentId] ?? true);
  const replyText = useSelector(state => state.feed.replyText[commentId] ?? '')
  const commentReplying = useSelector(state => state.feed.commentReplying[commentId] ?? false);
  const isCommentLiked = useSelector(state => state.feed.isCommentLiked[commentId] ?? comment.isLikedByCurrentUser ?? false);
  const commentLikedCount = useSelector(state => state.feed.commentLikedCount[commentId] ?? 0);
  const submittingReply = useSelector(state => state.feed.submittingReply[commentId] ?? false);
  const isLiked = useSelector(state => state.feed.commentLiked[comment.id] ?? comment.isLikedByCurrentUser ?? false);
  const currentCount = useSelector(state => state.feed.commentLiked[comment.id] ?? comment.likedCount ?? 0);
  const [replyInputOpen, setReplyInputOpen] = useState(false);
  const cardRef = useRef(null);
  const repliesRef = useRef(null);
  const replyWrapRef = useRef(null);
  const dispatch = useDispatch();

  useEffect(() => {
    if (cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" }
      );
    }
  }, []);

  function handleToggleReply() {
    setReplyInputOpen(true);
    dispatch(setRepliesOpen(true));
  }

  const handleCommentReply = async () => {
    if (!replyText.trim()) return;
    try {
      const res = await axios.post(
        `${apiUrl}/api/community/posts/${postId}/${commentId}/commentReplies`,
        { content: replyText.trim() },
        { withCredentials: true, headers: getAuthHeaders() }
      );
      dispatch(setReplyText({ commentId, value: '' }));
      dispatch(setLocalCommentReplies({}))
    } catch (error) {
      console.error('Comment reply error:', error)
    }
  };

  const getCommentReplies = async () => {
    try {
      const res = await axios.get(
        `${apiUrl}/api/community/posts/${postId}`,
        { withCredentials: true, headers: getAuthHeaders() }
      )
      const repliesMap = res.data.post.comments.reduce((acc, comment) => {
        acc[comment.id] = comment.replies || [];
        return acc;
      }, {});

      const finalReplies = repliesMap[commentId];
      console.log('finalreplies:', finalReplies)

      const repliesAuthorMap = finalReplies.reduce((acc, replies) => {
        acc[replies.id] = replies.author.username || [];
        return acc;
      }, {});

      console.log('repliesAuthor:', repliesAuthorMap)

      // console.log('first reply:', repliesMap[commentId][0]?.content)

      const allContents = repliesMap[commentId].map(reply => reply.content);

      console.log('all reply contents:', allContents);

      // console.log(res.data.post.comment.{...replies})
      dispatch(setLocalCommentReplies({ commentId, replies: finalReplies }));
    } catch (error) {
      console.error('Comment Fetching problem:', error)
    }
  };

  useEffect(() => {
    getCommentReplies();
  }, [postId]);

  // useEffect(() => {
  //   if (comment.replies?.length > 0) {
  //     dispatch(setLocalCommentReplies({ commentId, replies: comment.replies }));
  //   }
  // })

  const handleDeleteComment = async () => {
    try {
      await axios.delete(
        `${apiUrl}/api/community/posts/${postId}/comments/${commentId}`,
        { withCredentials: true, headers: getAuthHeaders() }
      );
    } catch (err) {
      console.error('Delete comment error:', err);
      alert('You can only delete your posted comment!')
    }
  };


  /* ─── Like ─── */
  const handleCommentLike = async () => {
    const commentId = comment.id
    // optimistic update
    dispatch(setCommentLiked({ commentId, value: !isLiked }));
    dispatch(setCommentLikedCount({ commentId, value: isLiked ? currentCount - 1 : currentCount + 1 }));

    try {
      await axios.post(
        `${apiUrl}/api/community/posts/${postId}/${commentId}/likeComment`,
        {},
        { withCredentials: true, headers: getAuthHeaders() }
      );
    } catch (error) {
      dispatch(setCommentLiked({ commentId, value: isLiked }));
      dispatch(setCommentLikedCount({ commentId, value: commentLikedCount }));

      console.error('Comment like error', error);
    };
  };

  return (
    <div
      ref={cardRef}
      className="comment-card-hover rounded-2xl p-4 transition-colors"
      style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
    >
      {/* Head */}
      <div className="flex items-center gap-2.5 mb-2.5">
        {/* <Avatar initials={comment.initials} gradientIdx={comment.avatarIdx} size={36} /> */}
        <div className="flex-1">
          <div className="flex justify-between font-mono-coder items-center gap-2">
            <span className="font-sans-coder font-bold coder-text" style={{ fontSize: 13 }}>{comment.author.username}</span>
            {/* <Badge badge={comment.badge} /> */}
            <button onClick={handleDeleteComment} className="cursor-pointer">
              <FaTrash />
            </button>
          </div>
          <div className="text-gray-400 font-mono-coder" style={{ fontSize: 10, marginTop: 1 }}>{formatTimeAgo(comment?.createdAt)}</div>
        </div>
      </div>

      {/* Voice Note */}
      {/* {comment.voiceNote && <VoiceNote duration={comment.voiceNote.duration} />} */}

      {/* Image */}
      {/* {comment.image && (
        <div className="mb-3 rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)", maxWidth: 320 }}>
          <img src={comment.image} alt="attachment" className="w-full block" onError={e => e.target.parentElement.style.display = "none"} />
        </div>
      )} */}

      {/* Body */}
      <div
        className="font-mono-coder coder-text mb-3"
        style={{ fontSize: 13, lineHeight: 1.7 }}
      // dangerouslySetInnerHTML={{ __html: comment.content }}
      >{comment.content}</div>

      {/* Footer */}
      <div className="flex items-center gap-1.5">
        <button type="button" onClick={handleCommentLike} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'none', border: 'none', cursor: 'pointer',
          color: isCommentLiked ? '#ed0202' : '#2e4460',
          fontFamily: "'DM Mono', monospace", fontSize: 13, fontWeight: 500,
          padding: '8px 12px', borderRadius: 10,
          transition: 'all 0.15s',
          transform: heartAnim ? 'scale(1.25)' : 'scale(1)',
        }}
          onMouseEnter={e => !isCommentLiked && (e.currentTarget.style.color = '#fb7185')}
          onMouseLeave={e => !isCommentLiked && (e.currentTarget.style.color = '#2e4460')}
        >
          {isCommentLiked ? <FaHeart /> : <FaRegHeart />}
          <span>{commentLikedCount}</span>
        </button>

        <button
          onClick={handleToggleReply}
          className="reply-toggle-btn flex items-center gap-1 rounded-lg px-2.5 py-1 font-mono-coder transition-all border border-transparent coder-text3"
          style={{ fontSize: 11, cursor: "pointer", background: "none" }}
        >
          ↩ Reply
        </button>

        {comment.replies && (
          <button
            onClick={setRepliesOpen}
            className="flex items-center gap-1 rounded-lg px-2.5 py-1 font-mono-coder transition-all border border-transparent coder-accent2 action-btn-hover"
            style={{ fontSize: 11, cursor: "pointer", background: "none", marginLeft: "auto" }}
          >
            {/* {repliesOpen ? "▾" : "▸"} {comment.replies.length} {comment.replies.length === 1 ? "reply" : "replies"} */}
          </button>
        )}
      </div>

      {/* Replies */}
      {repliesOpen && (
        <div
          // ref={repliesRef}
          className="mt-3 pt-3 flex flex-col gap-2.5"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          {/* reply mapping */}
          {localCommentReplies?.map(reply => (
            // <div key={reply.id}>
            //   {/* <pre>{JSON.stringify(reply.author, null, 2)}</pre>  ← see exact shape */}
            //   <div className="mb-4">{reply.author?.username}</div>
            //   <div>{reply.content}</div>
            // </div>
            <ReplyCard
              reply={reply} />
          ))}
        </div>
      )}


      {/* Reply Input */}
      {replyInputOpen && (
        <div
          ref={replyWrapRef}
          className="reply-wrap-focus flex gap-2 items-start mt-2.5 p-2.5 rounded-xl transition-colors"
          style={{ border: "1px solid var(--border)", background: "var(--surface2)" }}
        >
          {/* <Avatar initials="Y" size={28} self /> */}
          <textarea
            className="flex-1 bg-transparent border-none outline-none coder-text font-mono-coder resize-none"
            style={{ fontSize: 12, lineHeight: 1.6, minHeight: 40 }}
            placeholder="Write a reply..."
            value={replyText}
            onChange={e => dispatch(setReplyText({ commentId: comment.id, value: e.target.value }))}
            autoFocus
          />
          <button
            onClick={handleCommentReply}
            className="text-white rounded-lg px-3 py-1.5 font-mono-coder transition-opacity hover:opacity-85"
            style={{ fontSize: 11, background: "var(--accent)", border: "none", cursor: "pointer" }}
          >
            ↩
          </button>
        </div>
      )}
    </div>
  );
}