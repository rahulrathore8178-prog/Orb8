import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from "react-router-dom";
import Robo from './Robo';
import CodeEditor from '../CodeEditor';

const useCounter = (target, suffix = "", dur = 1800, active = false) => {
  const [val, setVal] = useState("0");
  useEffect(() => {
    if (!active) return;
    const t0 = performance.now();
    const id = setTimeout(() => {
      const tick = (now) => {
        const t = Math.min((now - t0) / dur, 1);
        setVal(Math.floor((1 - Math.pow(1 - t, 3)) * target).toLocaleString() + suffix);
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, 350);
    return () => clearTimeout(id);
  }, [active, target, suffix, dur]);
  return val;
};

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


const LandingSection = () => {
  const navigate = useNavigate();
  const handleLogin = () => {
    navigate("/Login");
  };
  const handleRegister = () => {
    navigate("/Register");
  }

  const [ref, vis] = useInView(0.05);
  const c0 = useCounter(52000, "+", 1800, vis);
  const c1 = useCounter(18, "+", 1200, vis);
  const c2 = useCounter(1200000, "+", 2200, vis);

  return (
    <div className="min-h-screen justify-between flex flex-col text-white">
      <div className='max-w-lg mx-25 mt-25'></div>
      {/* ---------- HERO ---------- */}
      <section ref={ref} className="min-h-screen pb-20 grid grid-cols-1 lg:grid-cols-2 gap-1 items-center max-w-7xl mx-auto">
        {/* Left */}
        <div className={`fu-init ${vis ? "fu-vis" : ""}`} style={{ transitionDelay: "100ms" }}>
          <h1 className="font-black leading-[1.05] tracking-[-0.03em] mb-5" style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(42px,5vw,68px)" }}>
            Learn to Code<br />
            <span className="g-hero">Without the Bore.</span>
          </h1>

          <p className="text-gray-400 leading-[1.75] max-w-110 mb-9" style={{ fontSize: 16 }}>
            Master HTML, CSS, JavaScript, Python and more through hands-on challenges, live code editors, and a curriculum designed to keep you hooked.
          </p>

          <div className="flex items-center gap-4 flex-wrap">
            <button onClick={handleRegister} className="btn-glow inline-flex items-center gap-2 px-7 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl border-none cursor-pointer" style={{ fontFamily: "'Syne',sans-serif", fontSize: 14 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="5 3 19 12 5 21 5 3" /></svg>
              Start Learning
            </button>
            <button className="inline-flex items-center gap-2 px-6 py-3.5 bg-transparent text-gray-200 font-semibold rounded-xl border border-white/10 hover:border-blue-500/50 hover:text-blue-400 hover:bg-blue-900/20 cursor-pointer transition-all duration-200" style={{ fontFamily: "'Syne',sans-serif", fontSize: 14 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polygon points="10 8 16 12 10 16 10 8" /></svg>
              Watch Demo
            </button>
          </div>

          <div className="flex gap-8 mt-11 pt-8 border-t border-white/[0.07]">
            {[{ v: c0, l: "Active Learners" }, { v: c1, l: "Courses Available" }, { v: c2, l: "Challenges Solved" }].map(s => (
              <div key={s.l}>
                <div className="font-black text-blue-400" style={{ fontFamily: "'Syne',sans-serif", fontSize: 26 }}>{s.v}</div>
                <div className="text-gray-500 mt-0.5" style={{ fontSize: 12 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right editor */}
        <div className={`fu-init absolute right-20 bottom-30 ${vis ? "fu-vis" : ""} hidden lg:block`} style={{ transitionDelay: "300ms" }}>
          <div className="absolute inset-0 blur-2xl animate-pulse bg-cyan-800"></div>
          <CodeEditor />
        </div>
      </section>
    </div>
  )
}

export default LandingSection