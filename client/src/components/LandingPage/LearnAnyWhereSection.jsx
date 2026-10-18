import React from "react";

export default function LearnAnywhereSection() {
  return (
    <section className="relative w-full bg-gray-900 py-20 overflow-hidden flex flex-col items-center">
      {/* Floating Images & Icons */}
      {/* Use your own SVGs or keep these emojis/placeholders */}
      {/* <div className="absolute left-0 top-1/3 w-24 h-24 hidden md:flex items-center justify-center animate-float-slow">
        <span className="text-5xl">📱</span>
      </div>
      <div className="absolute right-0 top-12 w-24 h-24 hidden md:flex items-center justify-center animate-float">
        <span className="text-5xl">💾</span>
      </div>
      <div className="absolute left-40 top-0 w-16 h-16 hidden md:flex items-center justify-center animate-float">
        <span className="text-4xl">💡</span>
      </div>
      <div className="absolute right-52 bottom-20 w-16 h-16 hidden md:flex items-center justify-center animate-float">
        <span className="text-4xl">🏆</span>
      </div>
      <div className="absolute left-1/4 bottom-10 w-16 h-16 hidden md:flex items-center justify-center animate-float-fast">
        <span className="text-4xl">💻</span>
      </div>
      <div className="absolute right-1/4 top-32 w-16 h-16 hidden md:flex items-center justify-center animate-float-slow">
        <span className="text-4xl">✨</span>
      </div> */}
        
      {/* Headline */}
      <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-cyan-200 text-center mb-10 z-10 select-none px-4" style={{fontFamily: 'Sora, Inter, sans-serif'}}>
        learn anytime,<br className="hidden md:block" /> anywhere
      </h2>
      {/* App store buttons (Replace with actual links/svg as you desire) */}
      <div className="flex flex-wrap justify-center gap-4 sm:gap-6 w-full max-w-4xl mb-10 z-10 px-4">
        <a
          href="#"
          className="flex items-center gap-3 bg-white rounded-xl px-4 sm:px-6 py-4 shadow-lg hover:scale-105 border border-gray-300 transition w-full sm:w-auto"
        >
          {/* <img
            src="https://upload.wikimedia.org/wikipedia/commons/a/ab/Apple-logo.png"
            alt="App Store"
            className="w-6 h-6"
          /> */}
          <svg fill="#000000" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M17.564 13.862c-.413.916-.612 1.325-1.144 2.135-.742 1.13-1.79 2.538-3.087 2.55-1.152.01-1.448-.75-3.013-.741-1.564.008-1.89.755-3.043.744-1.297-.012-2.29-1.283-3.033-2.414-2.077-3.16-2.294-6.87-1.013-8.843.91-1.401 2.347-2.221 3.697-2.221 1.375 0 2.24.754 3.376.754 1.103 0 1.775-.756 3.365-.756 1.2 0 2.474.655 3.381 1.785-2.972 1.629-2.49 5.873.514 7.007zM12.463 3.808c.577-.742 1.016-1.788.857-2.858-.944.065-2.047.665-2.692 1.448-.584.71-1.067 1.763-.88 2.787 1.03.031 2.096-.584 2.715-1.377z"></path></g></svg>
          <div className="flex flex-col items-start leading-tight">
            <span className="text-xs text-gray-600 font-semibold">Download on the</span>
            <span className="text-base font-bold text-gray-900 -mt-1">App Store</span>
          </div>
        </a>
        <a
          href="#"
          className="flex items-center gap-3 bg-white rounded-xl px-4 sm:px-6 py-4 shadow-lg hover:scale-105 border border-gray-300 transition w-full sm:w-auto"
        >
          {/* <img
            src="https://upload.wikimedia.org/wikipedia/commons/d/d0/Google_Play_Arrow_logo.png"
            alt="Google Play"
            className="w-6 h-6"
          /> */}
          <svg fill="#000000" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" stroke="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><title>ionicons-v5_logos</title><path d="M48,59.49v393a4.33,4.33,0,0,0,7.37,3.07L260,256,55.37,56.42A4.33,4.33,0,0,0,48,59.49Z"></path><path d="M345.8,174,89.22,32.64l-.16-.09c-4.42-2.4-8.62,3.58-5,7.06L285.19,231.93Z"></path><path d="M84.08,472.39c-3.64,3.48.56,9.46,5,7.06l.16-.09L345.8,338l-60.61-57.95Z"></path><path d="M449.38,231l-71.65-39.46L310.36,256l67.37,64.43L449.38,281C468.87,270.23,468.87,241.77,449.38,231Z"></path></g></svg>
          <div className="flex flex-col items-start leading-tight">
            <span className="text-xs text-gray-600 font-semibold">Get it on</span>
            <span className="text-base font-bold text-gray-900 -mt-1">Google Play</span>
          </div>
        </a>
      </div>
      {/* Extra mobile device placeholder bottom */}
      {/* <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-44 h-20 hidden md:flex animate-float-fast">
        <span className="text-7xl">📲</span>
      </div> */}
      {/* Animations */}
      <style>
        {`
        @keyframes float {
          0%, 100% { transform: translateY(0px);}
          50% { transform: translateY(-18px);}
        }
        .animate-float { animation: float 4s ease-in-out infinite; }
        .animate-float-slow { animation: float 8s ease-in-out infinite; }
        .animate-float-fast { animation: float 3s ease-in-out infinite; }
        `}
      </style>
    </section>
  );
}