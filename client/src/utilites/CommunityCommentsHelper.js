import { useDispatch, useSelector } from "react-redux";
import { setPlayingVoiceNote } from "../redux/slices/commentsSlice";

const VN_BARS = [8, 18, 12, 24, 10, 20, 14, 8, 22, 16, 10, 18];

/* ─── Voice Note Player ─── */
export function VoiceNote({ duration }) {
  const playing = useSelector(state => state.comments.playingVoiceNote);
  const dispatch = useDispatch();
  function handlePlay() {
    dispatch(setPlayingVoiceNote(true));
    setTimeout(() => dispatch(setPlayingVoiceNote(false)), 2000);
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