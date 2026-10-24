import { useSearchParams } from 'react-router-dom';

export default function TabbedPage({ label, tabs }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const active = tabs.find((tab) => tab.id === searchParams.get('tab')) || tabs[0];
  const ActivePage = active.Component;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 border-b border-white/10 px-4 pt-3 sm:px-8">
        <div role="tablist" aria-label={label} className="mx-auto flex max-w-2xl gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`${label}-tab-${tab.id}`}
              aria-selected={active.id === tab.id}
              aria-controls={`${label}-panel`}
              onClick={() => setSearchParams({ tab: tab.id }, { replace: true })}
              className={`min-h-11 flex-1 border-b-2 px-3 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-white/60 ${active.id === tab.id ? 'border-white text-white' : 'border-transparent text-neutral-400 hover:text-white'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <p className="mx-auto max-w-2xl py-2 text-xs text-neutral-400">{active.hint}</p>
      </div>
      <div id={`${label}-panel`} role="tabpanel" aria-labelledby={`${label}-tab-${active.id}`} className="min-h-0 flex-1 overflow-y-auto">
        <ActivePage />
      </div>
    </div>
  );
}
