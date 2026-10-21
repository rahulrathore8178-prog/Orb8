export function ImageCard({ likes, comments }) {
  return (
    <div className="relative col-span-1 h-[260px] overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-neutral-700 via-neutral-800 to-black">
      {/* abstract product-shot placeholder */}
      <div className="absolute inset-0 flex items-center justify-center opacity-70">
        <svg viewBox="0 0 200 120" className="h-24 w-48">
          <rect x="10" y="35" width="80" height="50" rx="25" fill="#2b2b2b" stroke="#555" strokeWidth="1" />
          <rect x="95" y="20" width="55" height="80" rx="14" fill="#3a3a3a" stroke="#666" strokeWidth="1" />
          <circle cx="118" cy="35" r="4" fill="#111" />
          <circle cx="130" cy="35" r="4" fill="#111" />
        </svg>
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
      <div className="absolute bottom-5 left-6 flex items-center gap-2 text-sm text-neutral-200">
        <span className="font-medium">{likes} Likes</span>
        <span className="text-neutral-500">|</span>
        <span className="font-medium">{comments} Comments</span>
      </div>
    </div>
  );
}

export function TextCard({ title, body }) {
  return (
    <div className="col-span-1 flex h-[260px] flex-col justify-center rounded-2xl border border-white/10 bg-neutral-900/60 p-8">
      <h3 className="mb-3 text-xl font-bold text-white">{title}</h3>
      <p className="text-sm leading-relaxed text-neutral-400">{body}</p>
    </div>
  );
}
 