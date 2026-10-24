export default function EmptyState({ title, description, actionLabel, onAction, className = '' }) {
  return (
    <div className={`flex flex-col items-center gap-3 px-6 py-14 text-center ${className}`}>
      <p className="text-base font-medium text-neutral-100">{title}</p>
      {description && <p className="max-w-xs text-sm text-neutral-400">{description}</p>}
      {actionLabel && (
        <button
          type="button"
          onClick={onAction}
          className="mt-2 min-h-11 rounded-full bg-neutral-100 px-5 text-sm font-semibold text-black transition hover:bg-white focus-visible:outline-2 focus-visible:outline-white/60"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
