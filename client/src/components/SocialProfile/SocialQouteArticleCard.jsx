export function QuoteCard({ quote, author }) {
  return (
    <div className="col-span-1 flex h-[220px] flex-col justify-center rounded-2xl bg-neutral-100 p-8 text-neutral-900">
      <svg className="mb-3 h-6 w-6 text-neutral-400" viewBox="0 0 24 24" fill="currentColor">
        <path d="M9.983 3v7.391c0 5.704-3.731 9.57-8.983 10.609l-.995-2.151c2.432-.917 3.995-3.638 3.995-5.849h-4v-10h9.983zm14.017 0v7.391c0 5.704-3.748 9.571-9 10.609l-.996-2.151c2.433-.917 3.996-3.638 3.996-5.849h-3.983v-10h9.983z" />
      </svg>
      <p className="mb-4 text-lg font-bold leading-snug">{quote}</p>
      <p className="text-sm text-neutral-500">{author}</p>
    </div>
  );
}
 
export function ArticleCard({ title, body, author }) {
  return (
    <div className="col-span-1 flex h-[260px] gap-5 rounded-2xl border border-white/10 bg-neutral-900/60 p-6">
      <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-xl bg-neutral-800">
        <svg className="h-8 w-8 text-neutral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M6 4h9l3 3v13a1 1 0 01-1 1H6a1 1 0 01-1-1V5a1 1 0 011-1z" />
          <path d="M9 9h6M9 13h6M9 17h3" />
        </svg>
      </div>
      <div className="flex flex-col justify-center">
        <h3 className="mb-2 text-lg font-bold text-white">{title}</h3>
        <p className="mb-3 text-sm leading-relaxed text-neutral-400">{body}</p>
        <p className="text-sm font-medium text-neutral-500">{author}</p>
      </div>
    </div>
  );
}