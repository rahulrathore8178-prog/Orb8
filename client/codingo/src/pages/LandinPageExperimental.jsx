import { useLayoutEffect, useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

/* ---------- icons ---------- */
const Icon = ({ children, className = "h-5 w-5" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    {children}
  </svg>
);
const ClockIcon = (p) => <Icon {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></Icon>;
const SearchIcon = (p) => <Icon {...p}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></Icon>;
const CloseIcon = (p) => <Icon {...p}><path d="M6 6l12 12M18 6 6 18" /></Icon>;
const FillIcon = (p) => <Icon {...p}><path d="M17 17 7 7M7 15V7h8" /></Icon>;
const OrbitMark = (p) => <Icon {...p}><circle cx="12" cy="12" r="3" /><ellipse cx="12" cy="12" rx="10" ry="4.5" transform="rotate(-25 12 12)" /></Icon>;

const SEED = [
  "neon photography walks",
  "@mira.vale",
  "#lowlightcity",
  "late night synth sets",
  "Lisbon rooftops",
  "@kairo",
  "#analogfilm",
];

/* ---------- shared surface classes ---------- */
const raised =
  "bg-gradient-to-br from-[#262626] to-[#0e0e0e] shadow-[5px_5px_12px_rgba(0,0,0,0.95),-3px_-3px_9px_rgba(255,255,255,0.06),inset_0_1px_0_rgba(255,255,255,0.08)]";
const glassRow =
  "border border-white/[0.07] bg-gradient-to-br from-white/[0.06] to-white/[0.015] backdrop-blur-xl shadow-[10px_10px_24px_rgba(0,0,0,0.85),-3px_-3px_12px_rgba(255,255,255,0.03),inset_0_1px_0_rgba(255,255,255,0.06)]";

export default function OrbitSearch() {
  const root = useRef(null);
  const listRef = useRef(null);
  const mounted = useRef(false);
  const [query, setQuery] = useState("");
  const [history, setHistory] = useState(SEED);

  const q = query.trim().toLowerCase();
  const shown = q ? history.filter((h) => h.toLowerCase().includes(q)) : history;

  /* first page-load sequence */
  useLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      gsap.to(".orbiter", { rotation: 360, duration: (i) => 28 + i * 14, repeat: -1, ease: "none", transformOrigin: "50% 50%" });
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from(".ring", { scale: 0.55, opacity: 0, duration: 1.6, stagger: 0.18, ease: "expo.out" })
        .from(".glow", { opacity: 0, duration: 1.4 }, 0)
        .from(".head", { y: -24, opacity: 0, filter: "blur(10px)", duration: 0.9 }, 0.35)
        .from(".hist-title", { opacity: 0, x: -16, duration: 0.6 }, 0.7)
        .from(".hist-item", { y: 28, opacity: 0, scale: 0.97, duration: 0.7, stagger: 0.07 }, 0.8)
        .from(".bar", { y: 110, opacity: 0, duration: 1, ease: "back.out(1.5)" }, 0.9);
    }, root);
    return () => ctx.revert();
  }, []);

  /* answer to a new search: newest row drops in */
  useEffect(() => {
    if (!mounted.current) { mounted.current = true; return; }
    const first = listRef.current?.firstElementChild;
    if (first) gsap.fromTo(first, { y: -18, opacity: 0, scale: 0.96 }, { y: 0, opacity: 1, scale: 1, duration: 0.5, ease: "power3.out" });
  }, [history[0]]); // eslint-disable-line react-hooks/exhaustive-deps

  const submit = (e) => {
    e.preventDefault();
    const term = query.trim();
    if (!term) return;
    setHistory((h) => [term, ...h.filter((x) => x.toLowerCase() !== term.toLowerCase())]);
    setQuery("");
  };
  const remove = (term) => setHistory((h) => h.filter((x) => x !== term));

  return (
    <main ref={root} className="relative flex h-[100dvh] w-full flex-col overflow-hidden bg-black font-['Sora',system-ui,sans-serif] text-neutral-200 selection:bg-white/20">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600&display=swap');`}</style>

      {/* orbit backdrop */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-30 grid place-items-center">
        <div className="glow col-start-1 row-start-1 h-full w-full bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,0.07),transparent_55%)]" />
        {[52, 84, 122].map((size, i) => (
          <div key={size} className="ring relative col-start-1 row-start-1 rounded-full border border-white/[0.06]" style={{ width: `${size}vmin`, height: `${size}vmin` }}>
            <div className="orbiter absolute inset-0">
              <span className={`absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-neutral-300 shadow-[0_0_14px_3px_rgba(255,255,255,0.35)] ${i === 1 ? "h-2 w-2" : "h-1.5 w-1.5"}`} />
            </div>
          </div>
        ))}
      </div>

      {/* header */}
      <header className="head relative z-10 mx-auto flex w-full max-w-2xl items-center justify-between px-5 pt-[max(1.25rem,env(safe-area-inset-top))] sm:px-8 sm:pt-8">
        <div className="flex items-center gap-3">
          <span className={`grid h-11 w-11 place-items-center rounded-2xl text-neutral-100 ${raised}`}><OrbitMark /></span>
          <div className="leading-tight">
            <p className="text-lg font-semibold tracking-tight text-neutral-100">On Orbit</p>
            <p className="text-xs font-light text-neutral-500">Search</p>
          </div>
        </div>
      </header>

      {/* history */}
      <section className="relative z-10 mx-auto flex min-h-0 w-full max-w-2xl flex-1 flex-col px-5 pt-6 sm:px-8 sm:pt-8" aria-label="Search history">
        <div className="hist-title mb-3 flex items-center justify-between">
          <h1 className="text-2xl font-light tracking-tight text-neutral-100 sm:text-3xl">Recent searches</h1>
          {history.length > 0 && (
            <button onClick={() => setHistory([])} className="rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs text-neutral-400 backdrop-blur-md transition hover:bg-white/10 hover:text-neutral-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/40">
              Clear all
            </button>
          )}
        </div>

        <div className="-mx-2 min-h-0 flex-1 overflow-y-auto px-2 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [mask-image:linear-gradient(to_bottom,transparent,black_18px,black_calc(100%-18px),transparent)]">
          {shown.length === 0 ? (
            <div className={`mt-6 rounded-3xl px-6 py-10 text-center ${glassRow}`}>
              <p className="text-base text-neutral-200">{history.length === 0 ? "No searches yet" : `No history matches “${query.trim()}”`}</p>
              <p className="mt-1.5 text-sm font-light text-neutral-500">{history.length === 0 ? "Search for people, #tags or places on Orbit." : "Press enter to search it on Orbit."}</p>
            </div>
          ) : (
            <ul ref={listRef} className="flex flex-col gap-3.5">
              {shown.map((term) => (
                <li key={term} className="hist-item">
                  <div className={`group flex items-center gap-3 rounded-2xl p-2.5 pr-3 transition duration-300 hover:border-white/15 hover:from-white/[0.09] sm:gap-4 sm:p-3 ${glassRow}`}>
                    <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-neutral-400 sm:h-11 sm:w-11 ${raised}`}><ClockIcon className="h-[18px] w-[18px]" /></span>
                    <button onClick={() => setQuery(term)} className="min-w-0 flex-1 truncate rounded-md text-left text-[15px] text-neutral-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/40" title={`Use “${term}”`}>
                      {term}
                    </button>
                    <button onClick={() => setQuery(term)} aria-label={`Use ${term} in search`} className="hidden h-9 w-9 place-items-center rounded-full text-neutral-500 transition hover:bg-white/10 hover:text-neutral-100 sm:grid">
                      <FillIcon className="h-4 w-4" />
                    </button>
                    <button onClick={() => remove(term)} aria-label={`Remove ${term} from history`} className="grid h-9 w-9 place-items-center rounded-full text-neutral-500 transition hover:bg-white/10 hover:text-neutral-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/40">
                      <CloseIcon className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* search bar */}
      <div className="relative z-10 mx-auto w-full max-w-2xl px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2 sm:px-8 sm:pb-8">
        <form onSubmit={submit} role="search" className="bar rounded-[30px] border border-white/10 bg-white/[0.045] p-2 backdrop-blur-2xl shadow-[0_24px_70px_rgba(0,0,0,0.95),inset_0_1px_0_rgba(255,255,255,0.09)] transition-[border-color,box-shadow] duration-300 focus-within:border-white/25 focus-within:shadow-[0_24px_70px_rgba(0,0,0,0.95),0_0_38px_rgba(255,255,255,0.07),inset_0_1px_0_rgba(255,255,255,0.12)]">
          <div className="flex items-center gap-2 rounded-[24px] bg-[#050505] py-1.5 pl-4 pr-1.5 shadow-[inset_5px_5px_12px_rgba(0,0,0,0.95),inset_-3px_-3px_9px_rgba(255,255,255,0.045)] sm:pl-5">
            <SearchIcon className="h-5 w-5 shrink-0 text-neutral-500" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search anything on orbit"
              aria-label="Search anything on orbit"
              enterKeyHint="search"
              autoComplete="off"
              className="min-w-0 flex-1 bg-transparent py-2.5 text-[15px] text-neutral-100 placeholder:text-neutral-600 focus:outline-none [&::-webkit-search-cancel-button]:hidden"
            />
            <button type="submit" aria-label="Search" className={`grid h-11 w-11 shrink-0 place-items-center rounded-full text-neutral-100 transition duration-200 hover:text-white active:scale-95 active:shadow-[inset_3px_3px_8px_rgba(0,0,0,0.9),inset_-2px_-2px_6px_rgba(255,255,255,0.05)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/40 sm:h-12 sm:w-12 ${raised}`}>
              <SearchIcon className="h-5 w-5" />
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}