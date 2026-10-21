import { useEffect, useRef, useState } from "react";

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

const StartSection = () => (
  <FadeUp>
    <div className="px-8 mb-20 max-w-[1280px] mx-auto">
      <div className="cta-blob relative overflow-hidden rounded-3xl px-16 py-16 text-center border border-blue-500/[0.13]"
        style={{ background: "linear-gradient(135deg,#080d1a 0%,#0a0e1a 40%,#040a18 100%)", boxShadow: "0 0 80px rgba(59,130,246,0.07),inset 0 1px 0 rgba(255,255,255,0.04)" }}>
        <h2 className="font-black tracking-[-0.02em] mb-4 relative z-[1]" style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(28px,4vw,48px)" }}>
          <span className="g-cta">Ready to Write Your First Line?</span>
        </h2>
        <p className="text-gray-400 mb-9 relative z-[1]" style={{ fontSize: 16 }}>Join 50,000+ developers who chose Codify. Free forever. No credit card needed.</p>
        <div className="flex justify-center gap-4 flex-wrap relative z-[1]">
          <button className="btn-glow inline-flex items-center gap-2 px-9 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl border-none cursor-pointer" style={{ fontFamily: "'Syne',sans-serif", fontSize: 15 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            Start Coding
          </button>
          <button className="inline-flex items-center gap-2 px-8 py-4 bg-transparent text-gray-200 font-semibold rounded-xl border border-white/10 hover:border-blue-500/50 hover:text-blue-400 hover:bg-blue-900/20 cursor-pointer transition-all duration-200" style={{ fontFamily: "'Syne',sans-serif", fontSize: 15 }}>
            Browse All Courses
          </button>
        </div>
      </div>
    </div>
  </FadeUp>
);

export default StartSection;