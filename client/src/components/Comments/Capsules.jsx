import { useState, useEffect, useMemo, useCallback } from "react";
import { FiPlus, FiRotateCcw } from 'react-icons/fi';
import CapsuleModal from './CapsuleModal';
import axios from "axios";
import { apiUrl, getAuthHeaders, getStoredUser } from "../../utilites/communityHelper";
import { useDispatch, useSelector } from "react-redux";
import { setCapsule } from "../../redux/slices/capsuleSlice";

/* ────────────────────────────────────────────────────────────────────────
   TIME CONSTANTS — the entire lifecycle is defined by these three numbers.
   Nothing else in the file hard-codes "24" or "48" — change these and the
   whole system (bars, badges, countdowns) follows.
   ──────────────────────────────────────────────────────────────────────── */
const HOUR = 60 * 60 * 1000;
const VISIBLE_DURATION = 24 * HOUR; // phase 1: fully visible, no revive option
const FADE_DURATION = 24 * HOUR; // phase 2: dims once per hour, revivable
const TOTAL_DURATION = VISIBLE_DURATION + FADE_DURATION; // 48h door-to-door

function getStoryPhase(cycleStart, now) {
  const elapsed = now - cycleStart;

  if (elapsed >= TOTAL_DURATION) {
    return { phase: "expired", opacity: 0, elapsed };
  }

  if (elapsed < VISIBLE_DURATION) {
    return {
      phase: "active",
      opacity: 1,
      elapsed,
      remaining: VISIBLE_DURATION - elapsed,
    };
  }

  const fadeElapsed = elapsed - VISIBLE_DURATION;
  const hourIndex = Math.min(23, Math.floor(fadeElapsed / HOUR)); // 0..23
  const opacity = Math.max(0, 1 - (hourIndex + 1) / 24); // steps down once/hr

  return {
    phase: "fading",
    opacity,
    elapsed,
    hourIndex,
    hoursLeft: 24 - hourIndex,
    remaining: TOTAL_DURATION - elapsed,
  };
}

// single-bar progress indicator: green while active, amber once fading.
function getProgress(elapsed) {
  const pct = Math.min(100, (elapsed / TOTAL_DURATION) * 100);
  const inFadePhase = elapsed >= VISIBLE_DURATION;
  return { pct, inFadePhase };
}

function formatDuration(ms) {
  if (ms <= 0) return "0m";
  const totalMin = Math.floor(ms / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function formatAge(ms) {
  const totalMin = Math.floor(ms / 60000);
  if (totalMin < 60) return `${Math.max(totalMin, 0)}m ago`;
  const h = Math.floor(totalMin / 60);
  return `${h}h ago`;
}

/* ────────────────────────────────────────────────────────────────────────
   PROGRESS BAR — thin, single-color-swap bar showing position across the
   48h cycle. Inset below the capsule's top curve rather than flush
   against it, since a stadium shape curves inward right at the very top —
   flush-to-edge would clip the bar's corners.
   ──────────────────────────────────────────────────────────────────────── */
function ProgressBar({ elapsed }) {
  const { pct, inFadePhase } = useMemo(() => getProgress(elapsed), [elapsed]);
  return (
    <div className="h-1 w-full overflow-hidden rounded-full bg-black/40">
      <div
        className="h-full rounded-full transition-all duration-500 ease-linear"
        style={{
          width: `${pct}%`,
          backgroundColor: inFadePhase
            ? "rgb(251 191 36)" /* amber-400 */
            : "rgb(52 211 153)" /* emerald-400 */,
        }}
      />
    </div>
  );
}

function CapsuleTile({ story, derived, index, onOpenCapsule, onRevive }) {
  const isFading = derived.phase === 'fading';
  const tileImageUrl = story?.mediaUrl || story?.user?.profilePic || '';

  const title = derived.phase === 'active' && derived.remaining != null
    ? `${formatDuration(derived.remaining)} left`
    : derived.phase === 'fading' && derived.remaining != null
      ? `Fading — ${formatDuration(derived.remaining)} left`
      : undefined;

  return (
    <button
      type="button"
      onClick={() => onOpenCapsule?.(story._id)}  // ✅ _id not id
      title={title}
      style={{ animationDelay: `${index * 70}ms` }}
      className={[
        'animate-capsule-pop group relative shrink-0',
        'w-[75px] h-[130px] mt-1 rounded-full overflow-hidden',
        'ring-2 transition-transform duration-200',
        'hover:scale-[1.04] active:scale-95',
        'focus-visible:outline-none cursor-pointer focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black focus-visible:ring-cyan-400/70',
        isFading ? 'ring-amber-400/50' : 'ring-emerald-400/50',
      ].join(' ')}
    >
      <div
        className="absolute inset-0 bg-cover bg-center transition-opacity duration-700"
        style={{
          backgroundImage: tileImageUrl ? `url('${tileImageUrl}')` : 'none',
          opacity: derived.opacity ?? 1,
        }}
      />

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black/90" />

      {derived.elapsed != null && (
        <div className="absolute top-7 left-2.5 right-2.5 z-10">
          <ProgressBar elapsed={derived.elapsed} />
        </div>
      )}

      {isFading && onRevive && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onRevive(story._id); }}  // ✅ _id not id
          title="Revive for another 24h"
          className="absolute top-1.5 right-1.5 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500 text-white transition hover:bg-indigo-400 active:scale-90"
        >
          <FiRotateCcw size={10} />
        </button>
      )}

      <span className="absolute inset-x-0 bottom-2.5 z-10 px-2 text-center text-[10px] text-white truncate">
        {story.user?.username || 'Unknown'}
      </span>
    </button>
  );
}

function AddCapsuleTile({ onAddCapsule }) {
  return (
    <button
      type="button"
      onClick={onAddCapsule}
      className={[
        'animate-capsule-pop shrink-0',
        'w-[75px] h-[130px] mt-1 rounded-full',
        'border border-dashed border-white/15 bg-white/[0.02]',
        'flex flex-col items-center justify-center gap-1.5',
        'transition-colors duration-200 hover:bg-white/[0.05] hover:border-white/25',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black focus-visible:ring-cyan-400/70',
      ].join(' ')}
      aria-label="Add a story"
    >
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10">
        <FiPlus className="text-[14px] text-zinc-200" />
      </span>
      <span className="text-[9px] text-zinc-500">Add</span>
    </button>
  );
}

export default function Capsules({ onAddCapsule, onOpenCapsule, onRevive }) {
  const [now, setNow] = useState(() => Date.now());
  const capsule = useSelector(state => state.capsule?.capsule ?? []);
  const dispatch = useDispatch();
  const storedUser = getStoredUser();


  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(id);
  }, []);

  const fetchCapsules = async () => {  // ✅ async function inside useEffect
    try {
      const res = await axios.get(`${apiUrl}/api/capsule/feed`, {  // ✅ await
        withCredentials: true, headers: getAuthHeaders()
      });
      dispatch(setCapsule(res.data))
    } catch (err) {
      console.error('capsule error', err);
    }
  };

  const items = capsule.length ? capsule : [];

  useEffect(() => {
    fetchCapsules();
  }, []);

  // One pass: compute live phase per story, then drop any that expired.
const visible = useMemo(() => {
  return items
    .map((story) => {
      const cycleStart = story.streakStartsFrom || story.createdAt;
      return {
        story,
        derived: cycleStart
          ? getStoryPhase(new Date(cycleStart).getTime(), now)
          : { phase: 'expired', opacity: 0, elapsed: null, remaining: null },
        isOwner: String(story.user?._id) === String(storedUser?.id),
      };
    })
    .filter(({ derived }) => derived.phase !== 'expired');
}, [items, now, storedUser?.id]);

  const [openIndex, setOpenIndex] = useState(null); // null = modal closed

  const handleOpen = useCallback((storyId) => {
      console.log('handleOpen called:', storyId);

      onOpenCapsule?.(storyId);
      setOpenIndex(visible.findIndex(({ story }) => story._id === storyId));  // ✅ _id not id
    }, [onOpenCapsule, visible]);

    const handleDeleteCapsule = useCallback(async (storyToDelete) => {
      const capsuleId = storyToDelete?._id;
      if (!capsuleId) return;

      const ok = window.confirm('Delete this capsule? This will also remove its media.');
      if (!ok) return;

      try {
        await axios.delete(`${apiUrl}/api/capsule/${capsuleId}`, {
          withCredentials: true,
          headers: getAuthHeaders(),
        });

        const nextCapsules = (capsule || []).filter((item) => item?._id !== capsuleId);
        dispatch(setCapsule(nextCapsules));

        // Always close modal after deleting a capsule.
        setOpenIndex(null);
      } catch (err) {
        console.error('Failed to delete capsule:', err);
        window.alert(err?.response?.data?.message || 'Failed to delete capsule');
      }
    }, [capsule, dispatch]);

    const activeEntry = openIndex !== null ? visible[openIndex] : null;
    const modalStory = activeEntry
      ? {
        ...activeEntry.story,
        timestamp: activeEntry.derived.elapsed != null
          ? formatAge(activeEntry.derived.elapsed)
          : undefined,
        opacity: activeEntry.derived.opacity ?? 1,
        isOwner: activeEntry.isOwner,
      }
      : null;


    return (
      <>
        <div
          className="flex items-start gap-3 z-10 overflow-x-auto pb-1 mb-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="list"
          aria-label="Stories"
        >
          <AddCapsuleTile onAddCapsule={onAddCapsule} />

          {visible.map(({ story, derived }, i) => (
            <CapsuleTile
              key={`${story._id}-${i}`}
              story={story}
              derived={derived}
              index={i + 1}
              onOpenCapsule={handleOpen}
              onRevive={onRevive}
            />
          ))}
        </div>

        <CapsuleModal
          isOpen={openIndex !== null}
          story={modalStory}
          onClose={() => setOpenIndex(null)}
          onPrev={openIndex > 0 ? () => setOpenIndex((i) => i - 1) : undefined}
          onNext={openIndex !== null && openIndex < visible.length - 1 ? () => setOpenIndex((i) => i + 1) : undefined}
          onDelete={handleDeleteCapsule}
        />
      </>
    );
  }