/**
 * LoginHero.jsx
 * -----------------------------------------------------------------------
 * Design notes (kept here rather than scattered as inline comments):
 *
 * Palette (dark, neutral gray, single restrained blue accent):
 *   canvas   #0A0D12   page background
 *   panel    #12161D   card surface
 *   inset    #0D1117   input fields / recessed surfaces
 *   line     #1F252E   hairline borders (used as white/5–white/10 washes)
 *   ink      #E7EAEF   primary text
 *   mist     #8891A0   secondary text
 *   faint    #5B6472   tertiary text / resting label
 *   signal   #5B7FFF   the one accent — focus rings, primary button, links
 *
 * Type: "Space Grotesk" for the wordmark + heading only (used with
 * restraint), "Inter" for everything else (labels, inputs, buttons, copy).
 *
 * Signature element: a small "momentum" mark (three ascending bars) next
 * to the wordmark, echoed by a soft ambient blue glow behind the card —
 * a quiet nod to the "learning streak" copy without leaning on a literal
 * flame/badge icon. "Ascent" is a placeholder wordmark — swap it for your
 * actual product name.
 *
 * Every piece of state, every handler, every API call, every navigate()
 * target, and every localStorage/event side effect below is IDENTICAL to
 * the original file. Only presentation changed, plus two new purely
 * presentational state values (`showPassword`, `focusedField`) that don't
 * touch your auth logic at all.
 * -----------------------------------------------------------------------
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import axios from "axios";

/* ---------------------------------------------------------------------
   Small inline icons (no icon-library dependency, matches the original
   file's approach of hand-written SVGs).
--------------------------------------------------------------------- */
const CloseIcon = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 3L13 13M13 3L3 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

const EyeIcon = () => (
  <svg width="17" height="17" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M1.5 10S4.5 4 10 4s8.5 6 8.5 6-3 6-8.5 6-8.5-6-8.5-6Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

const EyeOffIcon = () => (
  <svg width="17" height="17" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2.5 2.5l15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M8.3 4.4A8.9 8.9 0 0 1 10 4.25c5.5 0 8.5 6 8.5 6a15.6 15.6 0 0 1-2.9 3.7M5.4 5.9C3 7.5 1.5 10 1.5 10s3 6 8.5 6c1 0 1.9-.16 2.7-.44" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8.1 8.2a2.5 2.5 0 0 0 3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const SpinnerIcon = () => (
  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
    <path className="opacity-90" d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

const GoogleIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21.805 10.023H12.18v3.996h5.488c-.236 1.209-1.386 3.563-5.488 3.563-3.299 0-5.995-2.75-5.995-6.145 0-3.395 2.696-6.145 5.995-6.145 1.88 0 3.142.803 3.862 1.496l2.646-2.582C18.109 3.52 15.733 2.25 12.18 2.25c-5.378 0-9.752 4.374-9.752 9.75 0 5.376 4.374 9.75 9.752 9.75 5.632 0 9.366-3.962 9.366-9.537 0-.641-.069-1.13-.159-1.59z" fill="currentColor" />
  </svg>
);

const MomentumMark = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="1" y="9" width="3" height="6" rx="1" fill="#5B7FFF" />
    <rect x="6.5" y="5" width="3" height="10" rx="1" fill="#5B7FFF" opacity="0.75" />
    <rect x="12" y="1" width="3" height="14" rx="1" fill="#5B7FFF" opacity="0.5" />
  </svg>
);

const LoginHero = () => {
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleEnabled, setGoogleEnabled] = useState(false);
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL || "";

  // Presentational-only state (floating labels + password visibility).
  // Neither of these touches auth logic, requests, or stored values.
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null); // "email" | "password" | null

  useEffect(() => {
    axios.get(`${apiUrl}/api/auth/oauth/status`).then(r => {
      if (r.data?.google) setGoogleEnabled(true);
    }).catch(() => {});
  }, [apiUrl]);

  const handleExitLogin = () => {
    navigate("/");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);
    try {
      // Update with your backend login API endpoint
      const res = await axios.post(`${apiUrl}/api/auth/user/login`, {
        emailOrUsername,
        password,
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
      setLoading(false);
      // Redirect on success
      navigate("/community", { replace: true });
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message ||
        err.message ||
        "Login failed. Please check your credentials."
      );
      setLoading(false);
    }
  };

  const emailShrink = focusedField === "email" || emailOrUsername.length > 0;
  const passwordShrink = focusedField === "password" || password.length > 0;

  return (
    <div className="font-body relative min-h-screen overflow-hidden bg-[#0A0D12] px-4 py-10 sm:px-6 sm:py-12 flex items-center justify-center">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap');
        .font-display { font-family: 'Space Grotesk', ui-sans-serif, system-ui, sans-serif; }
        .font-body { font-family: 'Inter', ui-sans-serif, system-ui, sans-serif; }

        @keyframes ambientBreathe { 0%, 100% { opacity: .35; transform: scale(1); } 50% { opacity: .55; transform: scale(1.06); } }
        .ambient-glow { animation: ambientBreathe 7s ease-in-out infinite; }

        @keyframes cardRise { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        .card-enter { animation: cardRise .5s cubic-bezier(.16,1,.3,1) both; }

        @keyframes shakeX {
          10%, 90% { transform: translateX(-1px); }
          20%, 80% { transform: translateX(2px); }
          30%, 50%, 70% { transform: translateX(-3px); }
          40%, 60% { transform: translateX(3px); }
        }
        .error-shake { animation: shakeX .4s ease; }

        @media (prefers-reduced-motion: reduce) {
          .ambient-glow, .card-enter, .error-shake { animation: none !important; }
        }
      `}</style>

      {/* Ambient background glow — the one aesthetic risk, kept quiet */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="ambient-glow absolute -top-32 -left-24 h-80 w-80 rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(91,127,255,0.35), transparent 70%)" }}
        />
        <div
          className="absolute -bottom-40 -right-24 h-96 w-96 rounded-full opacity-30 blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(91,127,255,0.25), transparent 70%)" }}
        />
      </div>

      <div className="card-enter relative w-full max-w-[420px] rounded-2xl border border-white/[0.06] bg-[#12161D]/90 p-6 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.65)] backdrop-blur-xl sm:p-8">
        {/* Top row: close + sign up */}
        <div className="mb-7 flex items-center justify-between">
          <button
            onClick={handleExitLogin}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full text-[#8891A0] transition-colors hover:bg-white/5 hover:text-[#E7EAEF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B7FFF]/50"
          >
            <CloseIcon />
          </button>
          <button
            type="button"
            onClick={() => navigate("/signup")}
            className="rounded-full border border-white/10 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-[#9AA3B2] transition-colors hover:border-white/20 hover:text-[#E7EAEF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B7FFF]/50"
          >
            SIGN UP
          </button>
        </div>

        {/* Wordmark + momentum mark */}
        <div className="mb-7 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#151B24] ring-1 ring-white/5">
            <MomentumMark />
          </div>
          <h1 className="font-display font-semibold tracking-tight text-[#E7EAEF]">Welcome to Orbit</h1>
        </div>

        {/* <h1 className="font-display mb-1.5 text-[26px] font-semibold tracking-tight text-[#E7EAEF] sm:text-[28px]">
          Welcome
        </h1> */}
        {/* <p className="mb-7 text-sm text-[#8891A0]">Continue your learning streak</p> */}

        {/* Error */}
        {errorMsg && (
          <div
            role="alert"
            className="error-shake mb-5 flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-500/[0.08] px-3.5 py-2.5 text-[13px] font-medium leading-snug text-[#F2939A]"
          >
            <svg className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.4" />
              <path d="M8 4.8v3.6M8 11.2h.01" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form className="flex w-full flex-col gap-4" onSubmit={handleSubmit}>
          {/* Email or username — floating label */}
          <div className="relative">
            <input
              id="emailOrUsername"
              type="text"
              value={emailOrUsername}
              onChange={e => setEmailOrUsername(e.target.value)}
              onFocus={() => setFocusedField("email")}
              onBlur={() => setFocusedField(null)}
              required
              className="peer w-full rounded-xl border border-white/10 bg-[#0D1117] px-4 pb-2 pt-5 text-[15px] font-medium text-[#E7EAEF] outline-none transition-colors focus:border-[#5B7FFF]/60 focus:ring-2 focus:ring-[#5B7FFF]/15"
            />
            <label
              htmlFor="emailOrUsername"
              className={`pointer-events-none absolute left-4 font-medium transition-all duration-150 ${
                focusedField === "email" ? "text-[#7C97FF]" : "text-[#5B6472]"
              } ${emailShrink ? "top-3.5 text-xs" : "top-1/2 -translate-y-1/2 text-[15px]"}`}
            >
              Email or username
            </label>
          </div>

          {/* Password — floating label + show/hide toggle */}
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={e => setPassword(e.target.value)}
              onFocus={() => setFocusedField("password")}
              onBlur={() => setFocusedField(null)}
              required
              className="peer w-full rounded-xl border border-white/10 bg-[#0D1117] px-4 pb-2 pt-5 pr-11 text-[15px] font-medium text-[#E7EAEF] outline-none transition-colors focus:border-[#5B7FFF]/60 focus:ring-2 focus:ring-[#5B7FFF]/15"
            />
            <label
              htmlFor="password"
              className={`pointer-events-none absolute left-4 font-medium transition-all duration-150 ${
                focusedField === "password" ? "text-[#7C97FF]" : "text-[#5B6472]"
              } ${passwordShrink ? "top-3.5 text-xs" : "top-1/2 -translate-y-1/2 text-[15px]"}`}
            >
              Password
            </label>
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword(s => !s)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-[#5B6472] transition-colors hover:text-[#8891A0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B7FFF]/50"
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>

          <div className="-mt-1.5 flex justify-end">
            <button
              className="text-[12.5px] font-semibold text-[#5B7FFF] transition-colors hover:text-[#7C97FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B7FFF]/50 rounded"
              type="button"
              tabIndex={-1}
              onClick={() => navigate('/forgot-password')}
            >
              Forgot password?
            </button>
          </div>

          <button
            className="group relative mt-1 flex h-[46px] w-full items-center justify-center gap-2 rounded-xl bg-[#5B7FFF] text-[14.5px] font-semibold text-white transition-all hover:bg-[#6C8CFF] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B7FFF]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#12161D]"
            type="submit"
            disabled={loading}
          >
            {loading && <SpinnerIcon />}
            {loading ? "Logging in…" : "Log in"}
          </button>
        </form>

        {/* Separator */}
        <div className="my-6 flex w-full items-center">
          <div className="flex-1 border-t border-white/10" />
          <span className="mx-3 text-xs font-medium uppercase tracking-wider text-[#8C96A6]">or continue with</span>
          <div className="flex-1 border-t border-white/10" />
        </div>

        {/* Social Logins */}
        <div className="flex w-full gap-4">
          <button
            type="button"
            onClick={() => { if (googleEnabled) window.location.href = `${apiUrl}/api/auth/google?return=${encodeURIComponent(window.location.origin)}`; }}
            disabled={!googleEnabled}
            className={`flex h-[46px] flex-1 items-center justify-center gap-2.5 rounded-xl border text-[14px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B7FFF]/50 ${
              googleEnabled
                ? "border-white/10 bg-[#0D1117] text-[#E7EAEF] hover:border-white/20 hover:bg-[#151B24]"
                : "cursor-not-allowed border-white/5 bg-[#0D1117]/60 text-[#5B6472]"
            }`}
          >
            <GoogleIcon />
            Continue with Google
          </button>
        </div>

        {/* Terms and Info */}
        <p className="mb-2 mt-6 text-center text-[12px] font-medium leading-5 text-[#5B6472]">
          By signing in, you agree to our{" "}
          <span className="text-[#8891A0] underline decoration-white/20 underline-offset-2">Terms</span> and{" "}
          <span className="text-[#8891A0] underline decoration-white/20 underline-offset-2">Privacy Policy</span>.
        </p>
        <p className="text-center text-xs leading-[1.5] text-[#8C96A6]">
          This site is protected by reCAPTCHA Enterprise and the Google{" "}
          <span className="underline decoration-white/10 underline-offset-2">Privacy Policy</span> and{" "}
          <span className="underline decoration-white/10 underline-offset-2">Terms of Service</span> apply.
        </p>
      </div>
    </div>
  );
};

export default LoginHero;