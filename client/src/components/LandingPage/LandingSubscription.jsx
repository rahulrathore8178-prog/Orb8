import React from "react";

export default function PowerUpSection() {
    return (
                <section className="bg-gray-900 max-w-full mx-auto flex flex-col md:flex-row py-8 px-4 sm:px-6 items-center justify-center gap-6 md:gap-0 overflow-hidden text-white">
                        <div className="w-full md:w-1/2 items-center justify-center flex md:items-start">

<svg className="w-20 h-20 sm:w-24 sm:h-24" version="1.1" id="_x32_" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512" xmlSpace="preserve" fill="#10b981">
    <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
    <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
  <g id="SVGRepo_iconCarrier">
    <g>
            <path className="st0" d="M127.083,247.824l50.031-76.906c0,0-74.734-29.688-109.547-3.078C32.755,194.465,0.005,268.184,0.005,268.184 l37.109,21.516C37.114,289.699,84.083,198.684,127.083,247.824z"></path>
            <path className="st0" d="M264.177,384.918l76.906-50.031c0,0,29.688,74.734,3.078,109.547 c-26.625,34.797-100.344,67.563-100.344,67.563l-21.5-37.109C222.317,474.887,313.333,427.918,264.177,384.918z"></path>
            <path className="st0" d="M206.692,362.887l-13.203-13.188c-24,62.375-80.375,49.188-80.375,49.188s-13.188-56.375,49.188-80.375 l-13.188-13.188c-34.797-6-79.188,35.984-86.391,76.766c-7.188,40.781-8.391,75.563-8.391,75.563s34.781-1.188,75.578-8.391 S212.692,397.684,206.692,362.887z"></path>
            <path className="st0" d="M505.224,6.777C450.786-18.738,312.927,28.98,236.255,130.668c-58.422,77.453-89.688,129.641-89.688,129.641 l46.406,46.406l12.313,12.313l46.391,46.391c0,0,52.219-31.25,129.672-89.656C483.005,199.074,530.739,61.215,505.224,6.777z M274.63,237.371c-12.813-12.813-12.813-33.594,0-46.406s33.578-12.813,46.406,0.016c12.813,12.813,12.813,33.578,0,46.391 C308.208,250.184,287.442,250.184,274.63,237.371z M351.552,160.465c-16.563-16.578-16.563-43.422,0-59.984 c16.547-16.563,43.406-16.563,59.969,0s16.563,43.406,0,59.984C394.958,177.012,368.099,177.012,351.552,160.465z"></path>
    </g>
  </g>
</svg> 
            </div>

            {/* Text/CTA */}
                        <div className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left">
                                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold uppercase tracking-tight">
                    POWER UP WITH
                </h2>
                                <div className="text-3xl sm:text-4xl md:text-5xl text-white font-extrabold uppercase tracking-wide mb-6 bg-clip-text">
                    SUPER CODIFY
                </div>
                <button
                    className="mt-2 px-7 py-3 rounded-md font-bold bg-white text-[#0753bf] hover:scale-110 transition"
                >
                    TRY 1 WEEK FREE
                </button>
            </div>
        </section>
    );
}