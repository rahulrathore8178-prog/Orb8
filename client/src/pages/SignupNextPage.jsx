import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";


export default function SignupProfile() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  // Redirect unauthenticated users
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) navigate('/signup', { replace: true });
  }, [navigate]);

  // Validation: Only enable if email and pw not empty
  const valid = email.trim() && pw.length >= 6;

  const handleSubmit = async e => {
   e.preventDefault();
  if (!valid) return;
  setErrorMsg("");
  try {
    const apiUrl = import.meta.env.VITE_API_URL || "";
    const res = await axios.post(`${apiUrl}/api/auth/user/register`, {
      username: name, // or use a separate username field
      email,
      password: pw,
    }, {
      withCredentials: true,
    });
    if (res.data?.user) {
      localStorage.setItem("user", JSON.stringify(res.data.user));
    }
    if (res.data?.token) {
      localStorage.setItem("token", res.data.token);
    }
    window.dispatchEvent(new Event("auth:user-updated"));
    navigate("/community", { replace: true });
  } catch (err) {
    setErrorMsg(
      err.response?.data?.message ||
      err.message ||
      "Signup failed. Please try again."
    );
  }
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-[#0f1419] font-sans px-4 sm:px-6 py-8 sm:py-10 flex items-center justify-center">
      <div className="w-full max-w-md bg-[#1a2332] border border-[#2a3a4a] rounded-2xl shadow-lg p-5 sm:p-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="text-cyan-300 hover:text-white text-2xl font-bold transition"
            aria-label="Back"
            type="button"
          >
            &#8592;
          </button>
          <button
            onClick={() => navigate("/login")}
            className="bg-transparent border border-cyan-400/50 hover:border-cyan-300 px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold text-cyan-200 hover:text-white transition"
            type="button"
          >
            LOGIN
          </button>
        </div>

        <h1 className="text-3xl md:text-4xl font-extrabold text-center mb-8 mt-2 text-white">
          Create your profile
        </h1>

        {/* Error */}
        {errorMsg && (
          <div className="mb-4 w-full text-center text-sm font-bold text-red-300 bg-red-900/30 border border-red-800/40 py-2 rounded-lg">
            {errorMsg}
          </div>
        )}

        <form className="w-full flex flex-col gap-3" onSubmit={handleSubmit} autoComplete="off">
          <input
            className="w-full bg-[#141b24] border border-[#1f2a38] text-white text-base p-3.5 rounded-lg font-semibold placeholder-gray-500 outline-none focus:border-cyan-500 transition"
            type="text"
            placeholder="Name (optional)"
            value={name}
            onChange={e => setName(e.target.value)}
            autoComplete="off"
          />
          <input
            className="w-full bg-[#141b24] border border-[#1f2a38] text-white text-base p-3.5 rounded-lg font-semibold placeholder-gray-500 outline-none focus:border-cyan-500 transition"
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoComplete="off"
            required
          />
          {/* Password Input + Toggle */}
          <div className="relative">
            <input
              className="w-full bg-[#141b24] border border-[#1f2a38] text-white text-base p-3.5 rounded-lg font-semibold placeholder-gray-500 outline-none focus:border-cyan-500 transition pr-12"
              type={showPw ? "text" : "password"}
              placeholder="Password"
              value={pw}
              onChange={e => setPw(e.target.value)}
              autoComplete="off"
              required
              minLength={6}
            />
            <button
              type="button"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-cyan-400 hover:text-cyan-200"
              onClick={() => setShowPw(s => !s)}
              tabIndex={-1}
              aria-label={showPw ? "Hide password" : "Show password"}
            >
              {/* Eye SVG */}
              {showPw ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10a10 10 0 0119.542 2.783M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6.875 6.876L19.125 19.126" /></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19c-5.523 0-10-4.477-10-10S6.477 0 12 0s10 4.477 10 10-4.477 10-10 10z" /><circle cx="12" cy="10" r="3" /></svg>
              )}
            </button>
          </div>
          <button
            type="submit"
            className={`mt-4 w-full py-3 rounded-lg text-lg font-extrabold ${
              valid
                ? "bg-linear-to-r from-cyan-400 via-emerald-400 to-cyan-500 text-gray-950 hover:text-white shadow transition"
                : "bg-[#364757] bg-opacity-70 text-gray-400 cursor-not-allowed"
            }`}
            disabled={!valid}
          >
            CREATE ACCOUNT
          </button>
        </form>
        {/* Separator */}
        <div className="flex items-center w-full my-5">
          <div className="flex-1 border-t border-[#2a3a4a]" />
          <span className="text-[#4a5d6f] mx-3 text-xs font-bold">OR</span>
          <div className="flex-1 border-t border-[#2a3a4a]" />
        </div>
        {/* Social Logins */}
        <div className="flex gap-4 w-full">
          <button className="flex-1 flex items-center gap-2 py-3 rounded-lg bg-[#141b24] border border-[#1f2a38] text-white font-bold text-sm justify-center hover:bg-[#22344c] transition">
            <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="none"><path d="M21.805 10.023H12.18v3.996h5.488c-.236 1.209-1.386 3.563-5.488 3.563-3.299 0-5.995-2.75-5.995-6.145 0-3.395 2.696-6.145 5.995-6.145 1.88 0 3.142.803 3.862 1.496l2.646-2.582C18.109 3.52 15.733 2.25 12.18 2.25c-5.378 0-9.752 4.374-9.752 9.75 0 5.376 4.374 9.75 9.752 9.75 5.632 0 9.366-3.962 9.366-9.537 0-.641-.069-1.13-.159-1.59z" fill="#fff"/></svg>
            GOOGLE
          </button>
          <button className="flex-1 flex items-center gap-2 py-3 rounded-lg bg-[#141b24] border border-[#1f2a38] text-white font-bold text-sm justify-center hover:bg-[#22344c] transition">
             <svg className="w-6 h-6 mr-2" viewBox="0 0 20 20" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="#ffffff" stroke="#ffffff"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <title>microsoft [#ffffff150]</title> <desc>Created with Sketch.</desc> <defs> </defs> <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <g id="Dribbble-Light-Preview" transform="translate(-220.000000, -7519.000000)" fill="#ffffff"> <g id="icons" transform="translate(56.000000, 160.000000)"> <path d="M174,7379 L184,7379 L184,7370 L174,7370 L174,7379 Z M164,7379 L173,7379 L173,7370 L164,7370 L164,7379 Z M174,7369 L184,7369 L184,7359 L174,7359 L174,7369 Z M164,7369 L173,7369 L173,7359 L164,7359 L164,7369 Z" id="microsoft-[#ffffff150]"> </path> </g> </g> </g> </g></svg>
            MICROSOFT
          </button>
        </div>
        {/* Terms and Info */}
        <p className="text-xs text-gray-500 mt-6 mb-2 text-center leading-5 font-semibold">
          By signing in, you agree to our <span className="underline">Terms</span> and <span className="underline">Privacy Policy</span>.
        </p>
        <p className="text-xs text-gray-500 text-center leading-4">
          This site is protected by reCAPTCHA Enterprise and the Google <span className="underline">Privacy Policy</span> and <span className="underline">Terms of Service</span> apply.
        </p>
      </div>
    </div>
  );
}