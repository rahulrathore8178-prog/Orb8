import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';

const Header = () => {
    const navigate = useNavigate();

    const ClickLogo = () => {
        navigate("/ ");
    }
    const handleRegister = () => {
        navigate("/Register");
    }
    const Dashboard = () => {
        navigate("/Dashboard");
    }
    const [searchVal, setSearchVal] = useState("");
    const [scrolled, setScrolled] = useState(false);
    useEffect(() => {
        const fn = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", fn);
        return () => window.removeEventListener("scroll", fn);
    }, []);
    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 flex items-center gap-5 px-8 border-b border-white/[0.07] transition-all duration-100 ${scrolled ? "bg-gray-900/95 backdrop-blur-xl shadow-[0_4px_40px_rgba(0,0,0,0.65)]" : "bg-gray-900/80 backdrop-blur-lg"}`} style={{ height: 62 }}>
            <button onClick={ClickLogo} className="logo-glow text-[22px] font-black tracking-tight select-none shrink-0 cursor-pointer" style={{ fontFamily: "'Syne',sans-serif" }}>
                Codify
            </button>
            {/* <div className="flex-1 max-w-95 mx-auto relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
                <input
                    value={searchVal}
                    placeholder="Search courses, topics..."
                    onChange={e => setSearchVal(e.target.value)}
                    className="w-full bg-gray-800/70 border border-white/10 rounded-[10px] py-2 pl-9 pr-4 text-[13px] text-gray-100 placeholder-gray-600 outline-none focus:border-blue-500/40 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.08)] transition-all duration-200"
                    style={{ fontFamily: "'DM Sans',sans-serif" }}
                />
            </div> */}

            {/* <div className="flex items-center gap-1.5 ml-auto shrink-0">
                {["Courses", "Community"].map(l => (
                    <a key={l} className="text-[13px] font-medium text-gray-400 hover:text-gray-100 hover:bg-gray-800 px-3.5 py-1.5 rounded-lg cursor-pointer transition-all duration-200">{l}</a>
                ))}
                <button className="text-[13px] font-medium text-gray-200 border border-white/10 rounded-[9px] px-4 py-1.5 hover:border-blue-500/50 hover:bg-blue-900/20 hover:text-blue-400 transition-all duration-200 ml-1 bg-transparent cursor-pointer">Sign In</button>
                <button className="a-glow btn-glow text-[13px] font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-[9px] px-4 py-2 border-none cursor-pointer ml-1">Get Started</button>
            </div> */}

            <div className="flex items-center gap-1.5 ml-auto shrink-0">
                <nav className="md:flex gap-4 items-center text-sm ">
                    <a className="hover:text-gray-300 font-medium text-gray-400 cursor-pointer hover:scale-110 transition">Contact Us</a>
                    <a className="hover:text-gray-300 font-medium text-gray-400 cursor-pointer hover:scale-110 transition">Community</a>
                    <a onClick={Dashboard} className="hover:text-gray-300 font-medium text-gray-400 cursor-pointer hover:scale-110 transition">Dashboard</a>
                    <a className="text-[13px] font-medium text-gray-200 border border-white/10 rounded-[9px] px-4 py-1.5 hover:border-blue-500/50 hover:bg-blue-900/20 hover:text-blue-400 transition-all duration-200 ml-1 bg-transparent cursor-pointer">Sign In</a>
                    <button className="a-glow btn-glow text-[13px] font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-[9px] px-4 py-2 border-none cursor-pointer ml-1" onClick={handleRegister}>Get Started</button>
                    <a className="hover:text-gray-300 font-medium text-gray-400 cursor-pointer hover:scale-110 transition"><img src='notification.svg' alt="Notification" /></a>
                    {/* <a className="hover:text-white border-cyan-500 cursor-pointer hover:scale-110 transition" onClick={handleRegister}>Get Started</a> */}
                </nav>
            </div>
        </nav>
    );
}
export default Header




