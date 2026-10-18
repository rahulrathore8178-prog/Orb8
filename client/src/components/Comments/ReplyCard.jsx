import gsap from "gsap";
import { useEffect, useRef } from "react";
import { formatTimeAgo } from "../../utilites/communityHelper";

/* ─── Reply Card ─── */
 export const ReplyCard = ({ reply, onLike }) => {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) {
      gsap.fromTo(ref.current, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.28, ease: "power2.out" });
    }
  }, []);
  return (
    <div
      ref={ref}
      className="flex gap-2 rounded-xl px-3 py-2"
      style={{ background: "var(--surface2)", borderLeft: "2px solid var(--border2)" }}
    >
      <div className="flex-1">
        <div className="font-sans-coder font-bold coder-text" style={{ fontSize: 12 }}>{reply.author.username}</div>
        <div className="coder-text3 font-mono-coder" style={{ fontSize: 10, marginTop: 1 }}>{formatTimeAgo(reply.createdAt)}</div>
        <div
          className="coder-text2 font-mono-coder mt-1"
          style={{ fontSize: 12, lineHeight: 1.6 }}
          dangerouslySetInnerHTML={{ __html: reply.content }}
        />
        <div className="flex items-center gap-1 mt-1.5">
          <button
            // onClick={() => onLike(reply.id)}
            className={`like-btn flex items-center gap-1 rounded-lg px-2 py-1 font-mono-coder transition-all border border-transparent coder-text3`}
            style={{ fontSize: 11, cursor: "pointer", background: "none" }}
          >
            <span>♥</span>
            <span>{reply.likes}</span>
          </button>
        </div>
      </div>
    </div>
  );
}