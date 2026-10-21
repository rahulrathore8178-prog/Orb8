import React from "react";
const FOOTER_COLS = [
  { title:"Courses",  links:["HTML & CSS","JavaScript","Python","Java","C++","React"] },
  { title:"Platform", links:["How it Works","Pricing","Leaderboard","Changelog"] },
  { title:"Company",  links:["About","Careers","Community","Privacy Policy","Terms of Service"] },
];

export default function Footer() {
  return (
<footer className="bg-[#0a0a0d] border-t border-white/[0.07] pt-14 pb-8 px-8">
    <div className="max-w-[1280px] mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 pb-10 border-b border-white/[0.07] mb-7">
        <div>
          <div className="logo-glow font-black tracking-tight mb-3.5 select-none" style={{ fontFamily: "'Syne',sans-serif", fontSize: 22 }}>Codify</div>
          <p className="text-gray-500 leading-relaxed" style={{ fontSize: 13, maxWidth: 200 }}>Learn to code without the bore. Hands-on, interactive, gamified.</p>
        </div>
        {FOOTER_COLS.map(col => (
          <div key={col.title}>
            <div className="font-bold text-gray-100 mb-4" style={{ fontFamily: "'Syne',sans-serif", fontSize: 13 }}>{col.title}</div>
            <ul className="flex flex-col gap-2.5 list-none p-0 m-0">
              {col.links.map(l => <li key={l}><a className="text-gray-500 hover:text-gray-200 cursor-pointer transition-colors duration-200" style={{ fontSize: 13 }}>{l}</a></li>)}
            </ul>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between text-gray-600 flex-wrap gap-4" style={{ fontSize: 12 }}>
        <span>© 2025 Codify. Built for learners, by learners.</span>
        <div className="flex gap-5">
          {["Twitter","GitHub","Discord"].map(s => <a key={s} className="hover:text-blue-400 cursor-pointer transition-colors duration-200">{s}</a>)}
        </div>
      </div>
    </div>
  </footer>
  );
}