import { useEffect, useMemo, useState } from "react";
import {
  Eye,
  FileText,
  Flame,
  Hash,
  Heart,
  Image as ImageIcon,
  MessageCircle,
  Mic,
  Type,
  Video,
} from "lucide-react";
import { glassRow, raised } from "../../utilites/cssUtility";

const COLORS = {
  posts: "#c084fc",
  likes: "#fb7185",
  comments: "#2dd4bf",
  views: "#fb923c",
};

const TYPE_META = [
  { key: "image", label: "Photos", color: "#fb923c", Icon: ImageIcon },
  { key: "video", label: "Videos", color: "#c084fc", Icon: Video },
  { key: "audio", label: "Voice", color: "#2dd4bf", Icon: Mic },
  { key: "text", label: "Text", color: "#a3a3a3", Icon: Type },
];

const RING_RADIUS = 52;
const RING_LENGTH = 2 * Math.PI * RING_RADIUS;
const DAYS = 14;

const STYLES = `
  @keyframes ins-grow { from { transform: scaleY(0); } }
  @keyframes ins-slide { from { transform: scaleX(0); } }
  @keyframes ins-pop { from { opacity: 0; transform: scale(0.6); } }
  @keyframes ins-pulse { 0%, 100% { opacity: 0.55; } 50% { opacity: 1; } }
  @keyframes ins-shimmer { to { background-position: -200% 0; } }

  .ins-bar { transform-origin: bottom; animation: ins-grow 0.9s cubic-bezier(0.22, 1, 0.36, 1) backwards; animation-delay: calc(var(--i) * 45ms + 250ms); }
  .ins-fill { transform-origin: left; animation: ins-slide 1.1s cubic-bezier(0.22, 1, 0.36, 1) backwards; animation-delay: calc(var(--i) * 90ms + 300ms); }
  .ins-chip { animation: ins-pop 0.5s cubic-bezier(0.22, 1, 0.36, 1) backwards; animation-delay: calc(var(--i) * 70ms + 350ms); }
  .ins-glow { animation: ins-pulse 3.4s ease-in-out infinite; }
  .ins-skeleton {
    background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.09) 37%, rgba(255,255,255,0.04) 63%);
    background-size: 200% 100%;
    animation: ins-shimmer 1.4s linear infinite;
  }
`;

function usePrefersReducedMotion() {
  return useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );
}

function useCountUp(target, duration = 1200) {
  const reduced = usePrefersReducedMotion();
  const [value, setValue] = useState(0);

  useEffect(() => {
    let frame;
    const start = performance.now();
    const tick = (now) => {
      const progress = reduced ? 1 : Math.min(1, (now - start) / duration);
      setValue(target * (1 - (1 - progress) ** 3));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration, reduced]);

  return value;
}

const formatCompact = (value) =>
  new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(value);

function dayKey(date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function buildDays(postDates = [], commentDates = []) {
  const today = new Date();
  const days = Array.from({ length: DAYS }, (_, index) => {
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - (DAYS - 1 - index));
    return { date, key: dayKey(date), posts: 0, comments: 0 };
  });
  const lookup = new Map(days.map((day) => [day.key, day]));
  postDates.forEach((value) => {
    const day = lookup.get(dayKey(value));
    if (day) day.posts += 1;
  });
  commentDates.forEach((value) => {
    const day = lookup.get(dayKey(value));
    if (day) day.comments += 1;
  });
  return days;
}

function engagementTier(rate) {
  if (rate >= 30) return "Magnetic";
  if (rate >= 15) return "Strong pull";
  if (rate >= 5) return "Getting noticed";
  return "Warming up";
}

function StatTile({ label, value, hint, color, Icon, index }) {
  const animated = useCountUp(value);

  return (
    <div className={`relative overflow-hidden rounded-2xl p-4 sm:p-5 ${glassRow}`}>
      <span
        aria-hidden="true"
        className="ins-glow pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-60"
        style={{ background: `radial-gradient(circle, ${color}33, transparent 70%)`, animationDelay: `${index * 0.4}s` }}
      />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-3xl font-light tracking-tight text-white tabular-nums sm:text-4xl">
            {Math.round(animated).toLocaleString()}
          </div>
          <div className="mt-1 text-xs font-medium uppercase tracking-[0.14em] text-neutral-400">{label}</div>
        </div>
        <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${raised}`} style={{ color }}>
          <Icon size={18} />
        </span>
      </div>
      <div className="relative mt-3 text-[11px] text-neutral-500">{hint}</div>
    </div>
  );
}

function EngagementRing({ rate, hasViews }) {
  const [ready, setReady] = useState(false);
  const animatedRate = useCountUp(rate);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const offset = ready ? RING_LENGTH * (1 - Math.min(rate, 100) / 100) : RING_LENGTH;

  return (
    <div className={`flex flex-col items-center justify-between rounded-2xl p-5 text-center ${glassRow}`}>
      <h3 className="self-start text-sm font-medium text-neutral-200">Engagement</h3>
      <div className="relative my-4 h-36 w-36">
        <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90" aria-hidden="true">
          <defs>
            <linearGradient id="ins-ring" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fb923c" />
              <stop offset="55%" stopColor="#fb7185" />
              <stop offset="100%" stopColor="#c084fc" />
            </linearGradient>
          </defs>
          <circle cx="60" cy="60" r={RING_RADIUS} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="9" />
          <circle
            cx="60"
            cy="60"
            r={RING_RADIUS}
            fill="none"
            stroke="url(#ins-ring)"
            strokeWidth="9"
            strokeLinecap="round"
            strokeDasharray={RING_LENGTH}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 1.5s cubic-bezier(0.22, 1, 0.36, 1)", filter: "drop-shadow(0 0 6px rgba(251,113,133,0.55))" }}
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center">
          <div>
            <div className="text-3xl font-light tracking-tight text-white tabular-nums">
              {hasViews ? `${animatedRate.toFixed(rate < 10 ? 1 : 0)}%` : "—"}
            </div>
            <div className="text-[10px] uppercase tracking-[0.16em] text-neutral-500">engaged</div>
          </div>
        </div>
      </div>
      <div className="space-y-1">
        <div className="flex items-center justify-center gap-1.5 text-sm font-medium text-neutral-100">
          <Flame size={14} className="text-orange-400" />
          {hasViews ? engagementTier(rate) : "Awaiting viewers"}
        </div>
        <p className="text-[11px] leading-relaxed text-neutral-500">Likes and comments as a share of unique views.</p>
      </div>
    </div>
  );
}

function ActivityChart({ days }) {
  const max = Math.max(1, ...days.map((day) => Math.max(day.posts, day.comments)));
  const hasActivity = days.some((day) => day.posts || day.comments);
  const todayKey = dayKey(new Date());

  return (
    <div className={`rounded-2xl p-5 lg:col-span-2 ${glassRow}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-medium text-neutral-200">Activity · last {DAYS} days</h3>
        <div className="flex items-center gap-4 text-[11px] text-neutral-400">
          <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full" style={{ background: COLORS.posts }} />Posts</span>
          <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full" style={{ background: COLORS.comments }} />Comments</span>
        </div>
      </div>

      <div className="relative mt-5 h-40">
        {[0, 1, 2].map((line) => (
          <span key={line} aria-hidden="true" className="absolute inset-x-0 border-t border-dashed border-white/[0.06]" style={{ top: `${line * 50}%` }} />
        ))}
        <div className="absolute inset-0 flex items-end gap-1 sm:gap-1.5">
          {days.map((day, index) => (
            <div
              key={day.key}
              className="group relative flex h-full flex-1 items-end justify-center gap-0.5"
              title={`${day.date.toLocaleDateString(undefined, { month: "short", day: "numeric" })}: ${day.posts} posts, ${day.comments} comments`}
            >
              <span
                className="ins-bar w-full max-w-[10px] rounded-t-md"
                style={{ "--i": index, height: `${day.posts ? Math.max(8, (day.posts / max) * 100) : 2}%`, background: day.posts ? COLORS.posts : "rgba(255,255,255,0.08)", boxShadow: day.posts ? `0 0 14px ${COLORS.posts}66` : "none" }}
              />
              <span
                className="ins-bar w-full max-w-[10px] rounded-t-md"
                style={{ "--i": index, height: `${day.comments ? Math.max(8, (day.comments / max) * 100) : 2}%`, background: day.comments ? COLORS.comments : "rgba(255,255,255,0.08)", boxShadow: day.comments ? `0 0 14px ${COLORS.comments}66` : "none" }}
              />
            </div>
          ))}
        </div>
        {!hasActivity && (
          <p className="absolute inset-0 grid place-items-center px-6 text-center text-xs text-neutral-500">
            Quiet orbit lately. Post something to light this up.
          </p>
        )}
      </div>

      <div className="mt-2 flex gap-1 sm:gap-1.5">
        {days.map((day) => (
          <span
            key={day.key}
            className={`flex-1 text-center text-[10px] ${day.key === todayKey ? "font-semibold text-white" : "text-neutral-600"}`}
          >
            {day.date.toLocaleDateString(undefined, { weekday: "narrow" })}
          </span>
        ))}
      </div>
    </div>
  );
}

function ContentMix({ postTypes = {}, total }) {
  const items = TYPE_META.map((meta) => ({ ...meta, count: postTypes[meta.key] || 0 }));

  return (
    <div className={`rounded-2xl p-5 ${glassRow}`}>
      <h3 className="text-sm font-medium text-neutral-200">Content mix</h3>
      {total === 0 ? (
        <p className="mt-6 text-xs text-neutral-500">Nothing posted yet.</p>
      ) : (
        <>
          <div className="mt-4 flex h-3 w-full overflow-hidden rounded-full bg-white/[0.06]">
            {items.filter((item) => item.count).map((item, index) => (
              <span
                key={item.key}
                className="ins-fill h-full"
                style={{ "--i": index, width: `${(item.count / total) * 100}%`, background: item.color }}
                title={`${item.label}: ${item.count}`}
              />
            ))}
          </div>
          <ul className="mt-5 grid grid-cols-2 gap-3">
            {items.map((item) => (
              <li key={item.key} className="flex items-center gap-2.5">
                <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${raised}`} style={{ color: item.color }}>
                  <item.Icon size={14} />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium tabular-nums text-neutral-100">{item.count}</span>
                  <span className="block text-[11px] text-neutral-500">{item.label}</span>
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

function TopHashtags({ tags = [] }) {
  return (
    <div className={`rounded-2xl p-5 ${glassRow}`}>
      <h3 className="flex items-center gap-1.5 text-sm font-medium text-neutral-200">
        <Hash size={14} className="text-neutral-500" />
        Top hashtags
      </h3>
      {tags.length === 0 ? (
        <p className="mt-6 text-xs text-neutral-500">Add hashtags to your posts to see what you&apos;re known for.</p>
      ) : (
        <div className="mt-4 flex flex-wrap gap-2">
          {tags.map(({ tag, count }, index) => (
            <span
              key={tag}
              className="ins-chip inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-neutral-200"
              style={{ "--i": index, fontSize: `${Math.max(11, 14 - index)}px` }}
            >
              #{tag.replace(/^#/, "")}
              <b className="rounded-full bg-white/10 px-1.5 py-px text-[10px] font-medium text-neutral-400">{count}</b>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function TopPosts({ posts = [], resolveImage }) {
  const best = Math.max(1, ...posts.map((post) => post.score));
  const toSrc = (value) => {
    const driveId = value.includes("uc?id=") ? value.match(/[?&]id=([^&]+)/)?.[1] : null;
    return driveId ? `https://drive.google.com/thumbnail?id=${driveId}&sz=w200` : resolveImage(value);
  };

  return (
    <div className={`rounded-2xl p-5 ${glassRow}`}>
      <h3 className="text-sm font-medium text-neutral-200">Top posts</h3>
      {posts.length === 0 ? (
        <p className="mt-6 text-xs text-neutral-500">Once people react, your best posts will rise here.</p>
      ) : (
        <ol className="mt-4 space-y-3">
          {posts.map((post, index) => {
            const image = post.image ? toSrc(post.image) : "";
            return (
              <li key={post.id} className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] p-2.5">
                <span className="w-5 shrink-0 text-center text-sm font-light text-neutral-500 tabular-nums">{index + 1}</span>
                {image ? (
                  <img src={image} alt="" loading="lazy" referrerPolicy="no-referrer" className="h-12 w-12 shrink-0 rounded-lg object-cover" />
                ) : (
                  <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-lg text-neutral-400 ${raised}`}>
                    <FileText size={18} />
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-neutral-100">{post.snippet || (post.image ? "Photo post" : "Untitled post")}</p>
                  <div className="mt-1 flex items-center gap-3 text-[11px] text-neutral-400">
                    <span className="flex items-center gap-1"><Heart size={11} style={{ color: COLORS.likes }} />{post.likes}</span>
                    <span className="flex items-center gap-1"><MessageCircle size={11} style={{ color: COLORS.comments }} />{post.comments}</span>
                    <span className="flex items-center gap-1"><Eye size={11} style={{ color: COLORS.views }} />{post.views}</span>
                  </div>
                  <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/[0.07]">
                    <span
                      className="ins-fill block h-full rounded-full"
                      style={{ "--i": index, width: `${(post.score / best) * 100}%`, background: "linear-gradient(90deg, #fb923c, #fb7185, #c084fc)" }}
                    />
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

function InsightsSkeleton() {
  return (
    <div className="mt-8 space-y-4" aria-busy="true" aria-label="Loading insights">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[0, 1, 2, 3].map((item) => <div key={item} className="ins-skeleton h-28 rounded-2xl" />)}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="ins-skeleton h-64 rounded-2xl" />
        <div className="ins-skeleton h-64 rounded-2xl lg:col-span-2" />
      </div>
    </div>
  );
}

export default function InsightsPanel({ insights: rawInsights, loading, resolveImage }) {
  const insights = rawInsights || {};
  const days = useMemo(
    () => buildDays(insights.postDates, insights.commentDates),
    [insights.postDates, insights.commentDates],
  );

  if (loading) {
    return (
      <>
        <style>{STYLES}</style>
        <InsightsSkeleton />
      </>
    );
  }

  const posts = insights.posts || 0;
  const likes = insights.likes || 0;
  const comments = insights.comments || 0;
  const views = insights.views || 0;
  const perPost = (value) => (posts ? (value / posts).toFixed(1).replace(/\.0$/, "") : "0");
  const rate = views ? Math.min(100, ((likes + comments) / views) * 100) : 0;

  const tiles = [
    { label: "Posts", value: posts, hint: "published on your orbit", color: COLORS.posts, Icon: FileText },
    { label: "Likes", value: likes, hint: `${perPost(likes)} per post`, color: COLORS.likes, Icon: Heart },
    { label: "Comments", value: comments, hint: `${perPost(comments)} per post`, color: COLORS.comments, Icon: MessageCircle },
    { label: "Unique views", value: views, hint: `${formatCompact(views)} people reached`, color: COLORS.views, Icon: Eye },
  ];

  return (
    <div className="mt-8 space-y-4">
      <style>{STYLES}</style>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {tiles.map((tile, index) => <StatTile key={tile.label} index={index} {...tile} />)}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <EngagementRing rate={rate} hasViews={views > 0} />
        <ActivityChart days={days} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ContentMix postTypes={insights.postTypes} total={posts} />
        <TopHashtags tags={insights.topHashtags} />
      </div>

      <TopPosts posts={insights.topPosts} resolveImage={resolveImage} />
    </div>
  );
}
