import { useEffect, useRef } from "react";
import { Briefcase, Globe2, Heart } from "lucide-react";

const ORBITS = [
  { key: "personal", Icon: Heart, size: 44, duration: 18, reverse: false, accent: "#fb923c" },
  { key: "professional", Icon: Briefcase, size: 66, duration: 26, reverse: true, accent: "#2dd4bf" },
  { key: "social", Icon: Globe2, size: 88, duration: 38, reverse: false, accent: "#c084fc" },
];

const POSTS = [
  { text: "Weekend plans", orbit: "Personal", accent: "#fb923c", position: { left: "-3%", top: "13%" }, delay: "0s" },
  { text: "Shipped v2 today", orbit: "Professional", accent: "#2dd4bf", position: { right: "-3%", top: "47%" }, delay: "1.4s" },
  { text: "Synth set tonight", orbit: "Social", accent: "#c084fc", position: { left: "4%", bottom: "5%" }, delay: "2.8s" },
];

// [left %, top %, delay s]
const STARS = [
  [8, 18, 0], [22, 6, 1.2], [40, 11, 0.6], [71, 8, 1.8], [90, 22, 0.3], [96, 55, 2.1],
  [84, 82, 1.1], [60, 95, 0.4], [30, 91, 1.6], [5, 70, 0.9], [11, 44, 2.4], [52, 3, 1.4],
];

const STYLES = `
  .hero-stage { --mx: 0; --my: 0; }

  .hero-layer {
    position: absolute;
    inset: 0;
    transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
  }
  .hero-layer-orbits { transform: translate3d(calc(var(--mx) * -8px), calc(var(--my) * -8px), 0); }
  .hero-layer-cards { transform: translate3d(calc(var(--mx) * 14px), calc(var(--my) * 14px), 0); }
  .hero-layer-stars { transform: translate3d(calc(var(--mx) * -16px), calc(var(--my) * -16px), 0); }

  .hero-orbit {
    position: absolute;
    left: 50%;
    top: 50%;
    width: calc(var(--size) * 1%);
    height: calc(var(--size) * 1%);
    translate: -50% -50%;
  }
  .hero-ring {
    position: absolute;
    inset: 0;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 9999px;
  }
  .hero-orbit[data-reverse="true"] .hero-ring { border-style: dashed; border-color: rgba(255, 255, 255, 0.1); }

  .hero-carrier {
    position: absolute;
    inset: 0;
    animation: hero-spin var(--duration) linear infinite;
    animation-direction: var(--direction);
  }
  .hero-trail {
    position: absolute;
    inset: 0;
    border-radius: 9999px;
    background: conic-gradient(from 0deg, transparent 0deg 240deg, var(--accent) 360deg);
    -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 1.5px));
    mask: radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 1.5px));
    opacity: 0.55;
  }
  .hero-orbit[data-reverse="true"] .hero-trail { transform: scaleX(-1); }

  .hero-planet {
    position: absolute;
    left: 50%;
    top: 0;
    width: 42px;
    height: 42px;
    translate: -50% -50%;
    display: grid;
    place-items: center;
    border-radius: 9999px;
    color: var(--accent);
    background: linear-gradient(to bottom right, #262626, #0e0e0e);
    box-shadow: 5px 5px 12px rgba(0, 0, 0, 0.95), -3px -3px 9px rgba(255, 255, 255, 0.06),
      inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 0 22px -4px var(--accent);
    animation: hero-spin-back var(--duration) linear infinite;
    animation-direction: var(--direction);
  }
  .hero-planet svg { filter: drop-shadow(0 0 5px var(--accent)); }

  .hero-ripple {
    position: absolute;
    left: 50%;
    top: 50%;
    width: 17%;
    aspect-ratio: 1;
    translate: -50% -50%;
    border: 1px solid rgba(255, 255, 255, 0.35);
    border-radius: 9999px;
    opacity: 0;
    animation: hero-ripple 5.4s ease-out infinite;
  }

  .hero-core {
    position: absolute;
    left: 50%;
    top: 50%;
    width: 68px;
    height: 68px;
    translate: -50% -50%;
    display: grid;
    place-items: center;
    border-radius: 9999px;
    font-size: 0.875rem;
    font-weight: 600;
    letter-spacing: -0.01em;
    color: #f5f5f5;
    background: linear-gradient(to bottom right, #2c2c2c, #0e0e0e);
    box-shadow: 5px 5px 12px rgba(0, 0, 0, 0.95), -3px -3px 9px rgba(255, 255, 255, 0.07),
      inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 0 44px rgba(255, 255, 255, 0.09);
    animation: hero-breathe 3.6s ease-in-out infinite;
  }

  .hero-card {
    position: absolute;
    display: flex;
    align-items: center;
    gap: 9px;
    padding: 8px 13px 8px 11px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    font-size: 11px;
    line-height: 1.25;
    color: #e5e5e5;
    white-space: nowrap;
    background: linear-gradient(to bottom right, rgba(255, 255, 255, 0.09), rgba(255, 255, 255, 0.02));
    -webkit-backdrop-filter: blur(16px);
    backdrop-filter: blur(16px);
    box-shadow: 10px 10px 24px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.07);
    animation: hero-float 7s ease-in-out infinite;
  }
  .hero-card b { display: block; font-weight: 500; }
  .hero-card i { display: block; font-style: normal; font-size: 10px; color: #737373; }
  .hero-card-dot {
    flex: none;
    width: 8px;
    height: 8px;
    border-radius: 9999px;
    background: currentColor;
    animation: hero-ping 2.6s ease-out infinite;
  }

  .hero-star {
    position: absolute;
    width: 2px;
    height: 2px;
    border-radius: 9999px;
    background: #fff;
    animation: hero-twinkle 3.4s ease-in-out infinite;
  }
  .hero-shoot {
    position: absolute;
    top: 9%;
    right: 12%;
    width: 96px;
    height: 1px;
    background: linear-gradient(to left, rgba(255, 255, 255, 0.9), transparent);
    rotate: 35deg;
    opacity: 0;
    animation: hero-shoot 8s ease-in infinite 2s;
  }

  @keyframes hero-spin { to { transform: rotate(360deg); } }
  @keyframes hero-spin-back { to { transform: rotate(-360deg); } }
  @keyframes hero-ripple {
    0% { opacity: 0.5; transform: scale(1); }
    100% { opacity: 0; transform: scale(5.2); }
  }
  @keyframes hero-breathe {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.07); }
  }
  @keyframes hero-float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }
  @keyframes hero-ping {
    0% { box-shadow: 0 0 0 0 color-mix(in srgb, currentColor 55%, transparent); }
    100% { box-shadow: 0 0 0 9px transparent; }
  }
  @keyframes hero-twinkle {
    0%, 100% { opacity: 0.12; transform: scale(1); }
    50% { opacity: 0.95; transform: scale(1.8); }
  }
  @keyframes hero-shoot {
    0% { opacity: 0; transform: translate(0, 0); }
    3% { opacity: 1; }
    11% { opacity: 0; transform: translate(-170px, 120px); }
    100% { opacity: 0; transform: translate(-170px, 120px); }
  }

  @media (max-width: 480px) {
    .hero-planet { width: 34px; height: 34px; }
    .hero-core { width: 56px; height: 56px; }
    .hero-card { padding: 6px 10px 6px 9px; }
  }
`;

export default function HeroOrbits() {
  const stageRef = useRef(null);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;

    const clamp = (value) => Math.max(-1, Math.min(1, value));
    const handleMove = (event) => {
      const rect = stage.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
      stage.style.setProperty("--mx", clamp(x).toFixed(3));
      stage.style.setProperty("--my", clamp(y).toFixed(3));
    };

    window.addEventListener("pointermove", handleMove, { passive: true });
    return () => window.removeEventListener("pointermove", handleMove);
  }, []);

  return (
    <div
      ref={stageRef}
      aria-hidden="true"
      className="hero-stage reveal relative mx-auto aspect-square w-full max-w-md"
      style={{ animationDelay: "0.25s" }}
    >
      <style>{STYLES}</style>

      <div className="hero-layer hero-layer-stars">
        {STARS.map(([left, top, delay]) => (
          <span key={`${left}-${top}`} className="hero-star" style={{ left: `${left}%`, top: `${top}%`, animationDelay: `${delay}s` }} />
        ))}
        <span className="hero-shoot" />
      </div>

      <div className="hero-layer hero-layer-orbits">
        {[0, 1.8, 3.6].map((delay) => (
          <span key={delay} className="hero-ripple" style={{ animationDelay: `${delay}s` }} />
        ))}

        {ORBITS.map(({ key, Icon, size, duration, reverse, accent }) => (
          <div
            key={key}
            className="hero-orbit"
            data-reverse={reverse}
            style={{ "--size": size, "--duration": `${duration}s`, "--direction": reverse ? "reverse" : "normal", "--accent": accent }}
          >
            <span className="hero-ring" />
            <div className="hero-carrier">
              <span className="hero-trail" />
              <span className="hero-planet">
                <Icon size={17} />
              </span>
            </div>
          </div>
        ))}

        <div className="hero-core">You</div>
      </div>

      <div className="hero-layer hero-layer-cards">
        {POSTS.map(({ text, orbit, accent, position, delay }) => (
          <div key={text} className="hero-card" style={{ ...position, animationDelay: delay }}>
            <span className="hero-card-dot" style={{ color: accent }} />
            <span>
              <b>{text}</b>
              <i>posted to {orbit}</i>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
