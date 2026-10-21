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

const TESTIS = [
  { text:"I tried three other platforms before Codify. The live editor and instant feedback loop is just different. Got my first dev job in 8 months.", name:"Rahul S.",  role:"Frontend Dev @ Razorpay", i:"R", c:"#3b82f6", bg:"rgba(59,130,246,.15)" },
  { text:"The gamification keeps me coming back every day. 90-day streak and I genuinely look forward to my daily challenge.",                          name:"Priya M.",  role:"CS Student, IIT Delhi",   i:"P", c:"#a855f7", bg:"rgba(168,85,247,.15)" },
  { text:"As someone who switched careers from finance, Codify's roadmaps removed all the anxiety about what to learn and in what order.",             name:"Arjun K.",  role:"Full Stack Dev @ Swiggy",  i:"A", c:"#22c55e", bg:"rgba(34,197,94,.15)"  },
];

 const TestimonialsSection = () => (
  <FadeUp>
    <div className="py-20 px-8 max-w-[1280px] mx-auto">
      <SectionHeader eyebrow="Reviews" title={<>From Learners <span className="g-section">Like You</span></>} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {TESTIS.map(t => (
          <div key={t.name} className="feat-hov bg-gray-800/50 border border-white/[0.07] hover:border-white/[0.13] rounded-2xl p-7">
            <div className="flex gap-1 mb-4">{Array.from({length:5}).map((_,i)=><span key={i} className="text-blue-400" style={{fontSize:14}}>★</span>)}</div>
            <p className="text-gray-400 leading-[1.75] italic mb-5" style={{ fontSize: 14 }}>
              <span className="text-blue-400 not-italic" style={{ fontSize: 20 }}>&ldquo;</span>{t.text}
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0" style={{ background: t.bg, color: t.c, fontFamily: "'Syne',sans-serif", fontSize: 16 }}>{t.i}</div>
              <div>
                <div className="font-semibold text-gray-100" style={{ fontSize: 14 }}>{t.name}</div>
                <div className="text-gray-600" style={{ fontSize: 12 }}>{t.role}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </FadeUp>
);

export default TestimonialsSection