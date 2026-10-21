import { useEffect, useRef, useState } from "react";

const SectionHeader = ({ eyebrow, title, sub }) => (
  <div className="mb-12">
    <div className="flex items-center gap-3 text-blue-400 mb-3" style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase" }}>
      <span style={{ width: 24, height: 1, background: "#3b82f6", display: "inline-block" }} />{eyebrow}
    </div>
    <h2 className="font-black tracking-[-0.02em] leading-[1.15] mb-3" style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(28px,3.5vw,42px)" }}>{title}</h2>
    {sub && <p className="text-gray-500" style={{ fontSize: 15 }}>{sub}</p>}
  </div>
);

const useInView = (threshold = 0.15) => {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, vis];
};


const FadeUp = ({ children, delay = 0, className = "" }) => {
  const [ref, vis] = useInView(0.12);
  return (
    <div ref={ref} className={`fu-init ${vis ? "fu-vis" : ""} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
};

/* ─────────────────────────── LEARNING PATH ───────────────────────────────── */
const STEPS = [
  { n:"01", title:"Foundations",          desc:"Get comfortable with the web and how browsers work.",  langs:["HTML","CSS"],              c:"#22c55e", bg:"rgba(34,197,94,.08)"  },
  { n:"02", title:"Interactivity",        desc:"Bring pages to life with programming logic.",           langs:["JavaScript","TypeScript"], c:"#3b82f6", bg:"rgba(59,130,246,.08)" },
  { n:"03", title:"Frameworks",           desc:"Build real applications with industry-standard tools.", langs:["React","Node.js"],         c:"#a855f7", bg:"rgba(168,85,247,.08)" },
  { n:"04", title:"Systems & Algorithms", desc:"Crack interviews and level up with DSA.",               langs:["Python","C++","Java"],     c:"#60a5fa", bg:"rgba(96,165,250,.08)" },
];

const PROG = [
  { name:"HTML5",      pct:100, c:"#22c55e", done:true },
  { name:"CSS3",       pct:68,  c:"#3b82f6" },
  { name:"JavaScript", pct:32,  c:"#60a5fa" },
  { name:"Python",     pct:0,   c:"#22d3ee" },
];

export const PathSection = () => {
  const [ref, vis] = useInView(0.1);
  return (
    <FadeUp>
      <div className="py-20 px-8 max-w-[1280px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
          {/* Steps */}
          <div>
            <SectionHeader eyebrow="Roadmap" title={<>Your Journey to <span className="g-section">Dev Life</span></>} sub="A proven progression from zero to employed — no random jumping." />
            <div className="relative flex flex-col">
              <div className="absolute top-0 bottom-0 w-px opacity-40" style={{ left: 23, background: "linear-gradient(180deg,#22c55e,#3b82f6,#a855f7,transparent)" }} />
              {STEPS.map(s => (
                <div key={s.n} className="path-hov flex gap-6 items-start py-5 cursor-pointer">
                  <div className="w-[46px] h-[46px] rounded-full flex items-center justify-center border-2 shrink-0 relative z-[1] font-bold text-[13px]"
                    style={{ borderColor: s.c, background: s.bg, color: s.c, fontFamily: "'Space Mono',monospace" }}>{s.n}</div>
                  <div>
                    <div className="font-bold mb-1 text-gray-100" style={{ fontFamily: "'Syne',sans-serif", fontSize: 16 }}>{s.title}</div>
                    <div className="text-gray-500 mb-2" style={{ fontSize: 13 }}>{s.desc}</div>
                    <div className="flex gap-2 flex-wrap">
                      {s.langs.map(l => <span key={l} className="text-gray-500 bg-gray-800 border border-white/[0.07] rounded-full px-3 py-0.5" style={{ fontFamily: "'Space Mono',monospace", fontSize: 11 }}>{l}</span>)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Progress */}
          <div ref={ref}>
            <SectionHeader eyebrow="Your Progress" title={<>Track Every <span className="g-section">Win</span></>} />
            <div className="flex flex-col gap-4">
              {PROG.map((p, i) => (
                <div key={p.name} className="bg-gray-800/50 border border-white/[0.07] rounded-2xl px-5 py-4">
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="font-bold text-gray-100" style={{ fontFamily: "'Syne',sans-serif", fontSize: 14 }}>{p.name}</span>
                    <span className="font-bold" style={{ fontFamily: "'Space Mono',monospace", fontSize: 12, color: p.c }}>{p.pct}%{p.done ? " ✓" : ""}</span>
                  </div>
                  <div className="h-[4px] rounded-full bg-gray-700/80 overflow-hidden">
                    <div className="prog-bar h-full rounded-full" style={{ width: vis ? `${p.pct}%` : "0%", background: `linear-gradient(90deg,${p.c},${p.c}90)`, transitionDelay: `${i * 160}ms` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </FadeUp>
  );
};