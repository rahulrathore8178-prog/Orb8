import React, { useEffect, useRef } from 'react'

const ParticleCanvas = () => {
 const cvs = useRef(null);
  const raf = useRef(null);
  useEffect(() => {
    const c = cvs.current; if (!c) return;
    const ctx = c.getContext("2d");
    const resize = () => { c.width = window.innerWidth; c.height = window.innerHeight; };
    resize(); window.addEventListener("resize", resize);
    const mk = () => ({
      x: Math.random() * c.width, y: Math.random() * c.height,
      vx: (Math.random() - .5) * .3, vy: (Math.random() - .5) * .3,
      r: Math.random() * 1.4 + .5, o: Math.random() * .3 + .07,
      blue: Math.random() > .82,
    });
    const ps = Array.from({ length: 100 }, mk);
    const draw = () => {
      ctx.clearRect(0, 0, c.width, c.height);
      ps.forEach((p, i) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > c.width) p.vx *= -1;
        if (p.y < 0 || p.y > c.height) p.vy *= -1;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.blue ? "#3b82f6" : "#fff";
        ctx.globalAlpha = p.o; ctx.fill();
        for (let j = i + 1; j < ps.length; j++) {
          const dx = p.x - ps[j].x, dy = p.y - ps[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 100) {
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(ps[j].x, ps[j].y);
            ctx.strokeStyle = "#3b82f6"; ctx.globalAlpha = (1 - d / 100) * .06;
            ctx.lineWidth = .5; ctx.stroke();
          }
        }
        ctx.globalAlpha = 1;
      });
      raf.current = requestAnimationFrame(draw);
    };
    draw();
    return () => { window.removeEventListener("resize", resize); cancelAnimationFrame(raf.current); };
  }, []);
  return <canvas ref={cvs} className="fixed inset-0 z-0 pointer-events-none opacity-50" />;
}

export default ParticleCanvas;
