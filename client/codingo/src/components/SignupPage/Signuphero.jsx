import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import gsap from "gsap";
import { User2Icon } from "lucide-react";

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.4" />
      <path d="M8 4.8v3.6M8 11.2h.01" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 20 20" fill="none">
      <path
        d="M1.5 10S4.5 4 10 4s8.5 6 8.5 6-3 6-8.5 6S1.5 10 1.5 10Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 20 20" fill="none">
      <path
        d="M2.5 2.5l15 15M8.3 8.4a2.5 2.5 0 0 0 3.4 3.4M5.6 5.7C3.3 7 1.5 10 1.5 10s3 6 8.5 6c1.6 0 2.9-.5 4-1.2M13.9 6.2C12.8 5.4 11.5 5 10 5c-.3 0-.6.02-.9.06M14.3 14.2c2.1-1.3 3.7-4.2 3.7-4.2s-1.2-2.4-3.4-4.1"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path className="opacity-90" d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M23.5 12.3c0-.85-.08-1.66-.22-2.44H12v4.62h6.46c-.28 1.5-1.13 2.77-2.4 3.62v3h3.89c2.28-2.1 3.55-5.2 3.55-8.8Z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.95-2.9l-3.89-3c-1.08.73-2.46 1.16-4.06 1.16-3.12 0-5.77-2.11-6.72-4.94H1.27v3.1A12 12 0 0 0 12 24Z" />
      <path fill="#FBBC05" d="M5.28 14.32a7.2 7.2 0 0 1 0-4.64v-3.1H1.27a12 12 0 0 0 0 10.84l4.01-3.1Z" />
      <path fill="#EA4335" d="M12 4.75c1.76 0 3.34.6 4.58 1.79l3.44-3.44C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.69 1.27 6.58l4.01 3.1c.95-2.83 3.6-4.93 6.72-4.93Z" />
    </svg>
  );
}

function OrbitMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <ellipse cx="12" cy="12" rx="10" ry="4.2" stroke="#5B7FFF" strokeWidth="1.4" />
      <circle cx="12" cy="12" r="2.4" fill="#5B7FFF" />
    </svg>
  );
}

export default function SignupHero() {
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL || "";

  // If we arrived here via the Google redirect for an incomplete account,
  // the backend put a token in the URL — that's our signal to switch modes.
  const [oauthToken] = useState(() => new URLSearchParams(window.location.search).get("token"));
  const isCompletingProfile = Boolean(oauthToken);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profilePic, setProfilePic] = useState(null);
  const [profilePicPreview, setProfilePicPreview] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleEnabled, setGoogleEnabled] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  useEffect(() => {
    if (isCompletingProfile) return; // already authenticated via Google, no need to check
    axios.get(`${apiUrl}/api/auth/oauth/status`).then(r => {
      if (r.data?.google) setGoogleEnabled(true);
    }).catch(() => {});
  }, [apiUrl, isCompletingProfile]);

  const usernameShrink = focusedField === "username" || username.length > 0;
  const emailShrink = focusedField === "email" || email.length > 0;
  const passwordShrink = focusedField === "password" || password.length > 0;
  const confirmShrink = focusedField === "confirm" || confirmPassword.length > 0;

  const passwordsMismatch = !isCompletingProfile && confirmPassword.length > 0 && password !== confirmPassword;

  const isValid = isCompletingProfile
    ? username.trim().length >= 3 && password.length >= 6
    : username.trim().length >= 3 && email.includes("@") && password.length >= 6 && password === confirmPassword;

  function handlePicChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setProfilePic(file);
    setProfilePicPreview(URL.createObjectURL(file));
  }

  // release the object URL when it's replaced or the component unmounts
  useEffect(() => {
    return () => { if (profilePicPreview) URL.revokeObjectURL(profilePicPreview); };
  }, [profilePicPreview]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) return;
    setErrorMsg("");
    setLoading(true);

    try {
      if (isCompletingProfile) {
        const formData = new FormData();
        formData.append("username", username.trim());
        formData.append("password", password);
        if (profilePic) formData.append("profilePic", profilePic);

        // Don't set Content-Type manually — axios handles the multipart
        // boundary itself when the body is a FormData instance.
        const res = await axios.patch(`${apiUrl}/api/auth/complete-profile`, formData, {
          headers: { Authorization: `Bearer ${oauthToken}` },
        });

        localStorage.setItem("token", oauthToken);
        if (res.data?.user) localStorage.setItem("user", JSON.stringify(res.data.user));
        window.dispatchEvent(new Event("auth:user-updated"));
        navigate("/community", { replace: true });
      } else {
        const res = await axios.post(
          `${apiUrl}/api/auth/user/register`,
          { username: username.trim(), email: email.trim().toLowerCase(), password },
          { withCredentials: true }
        );
        if (res.data?.token) localStorage.setItem("token", res.data.token);
        if (res.data?.user) localStorage.setItem("user", JSON.stringify(res.data.user));
        window.dispatchEvent(new Event("auth:user-updated"));
        navigate("/register");
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ----- GSAP: unchanged from before -----
  const cardRef = useRef(null);
  const glowARef = useRef(null);
  const glowBRef = useRef(null);
  const errorRef = useRef(null);
  const fieldsRef = useRef([]);
  const collectField = useCallback((el) => {
    if (el && !fieldsRef.current.includes(el)) fieldsRef.current.push(el);
  }, []);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = gsap.context(() => {
      if (reduceMotion) {
        gsap.set([cardRef.current, ...fieldsRef.current], { opacity: 1, y: 0 });
        return;
      }
      gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .from(cardRef.current, { opacity: 0, y: 16, duration: 0.55 })
        .from(fieldsRef.current, { opacity: 0, y: 10, duration: 0.4, stagger: 0.06 }, "-=0.25");

      gsap.to([glowARef.current, glowBRef.current], {
        opacity: 0.55, scale: 1.06, duration: 3.6, ease: "sine.inOut", repeat: -1, yoyo: true, stagger: 0.6,
      });
    });
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!errorMsg || !errorRef.current) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;
    gsap.timeline()
      .to(errorRef.current, { x: -3, duration: 0.05 })
      .to(errorRef.current, { x: 3, duration: 0.05 })
      .to(errorRef.current, { x: -2, duration: 0.05 })
      .to(errorRef.current, { x: 2, duration: 0.05 })
      .to(errorRef.current, { x: 0, duration: 0.05 });
  }, [errorMsg]);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0A0D12] px-4 py-10 font-sans sm:px-6 sm:py-12">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div ref={glowARef} className="absolute -left-24 -top-32 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(91,127,255,0.35),transparent_70%)] opacity-[0.35] blur-3xl" />
        <div ref={glowBRef} className="absolute -bottom-40 -right-24 h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(91,127,255,0.25),transparent_70%)] opacity-[0.3] blur-3xl" />
      </div>

      <div ref={cardRef} className="relative w-full max-w-[420px] rounded-2xl border border-white/[0.06] bg-[#12161D]/90 p-6 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.65)] backdrop-blur-xl sm:p-8">
        <div className="mb-7 flex items-center justify-between">
          <button onClick={() => navigate("/")} aria-label="Close" className="flex h-8 w-8 items-center justify-center rounded-full text-[#8891A0] transition-colors hover:bg-white/5 hover:text-[#E7EAEF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B7FFF]/50">
            <CloseIcon />
          </button>
          {!isCompletingProfile && (
            <button type="button" onClick={() => navigate("/login")} className="rounded-full border border-white/10 px-3.5 py-1.5 text-[11px] font-semibold tracking-wide text-[#8891A0] transition-colors hover:border-white/20 hover:text-[#E7EAEF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B7FFF]/50">
              LOG IN
            </button>
          )}
        </div>

        <div ref={collectField} className="mb-7 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#151B24] ring-1 ring-white/5">
            <OrbitMark />
          </div>
          <div>
            <h1 className="text-[15px] font-semibold tracking-tight text-[#E7EAEF]">
              {isCompletingProfile ? "Finish setting up your account" : "Create your account"}
            </h1>
            <p className="text-[12.5px] font-medium text-[#5B6472]">
              {isCompletingProfile
                ? "Add a username, password, and photo to finish signing in with Google."
                : "Start your learning journey today"}
            </p>
          </div>
        </div>

        {errorMsg && (
          <div ref={errorRef} role="alert" className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-500/[0.08] px-3.5 py-2.5 text-[13px] font-medium leading-snug text-[#F2939A]">
            <AlertIcon />
            <span>{errorMsg}</span>
          </div>
        )}

        <form className="flex w-full flex-col gap-4" onSubmit={handleSubmit}>
          {isCompletingProfile && (
            <div ref={collectField} className="flex items-center gap-4">
              <div className="flex h-26 w-26 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-[#0D1117]">
                {profilePicPreview ? (
                  <img src={profilePicPreview} alt="Profile preview" className="h-full w-full object-cover" />
                ) : (
                  <User2Icon />
                )}
              </div>
              <label htmlFor="profilePic" className="cursor-pointer rounded-xl border border-white/10 bg-[#0D1117] px-4 py-2 text-[13px] font-semibold text-[#E7EAEF] transition-colors hover:border-white/20 hover:bg-[#151B24]">
                {profilePicPreview ? "Change photo" : "Upload photo (optional)"}
              </label>
              <input id="profilePic" type="file" accept="image/*" onChange={handlePicChange} className="hidden" />
            </div>
          )}

          <div ref={collectField} className="relative">
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onFocus={() => setFocusedField("username")}
              onBlur={() => setFocusedField(null)}
              required
              minLength={3}
              className="peer w-full rounded-xl border border-white/10 bg-[#0D1117] px-4 pb-2 pt-5 text-[15px] font-medium text-[#E7EAEF] outline-none transition-colors focus:border-[#5B7FFF]/60 focus:ring-2 focus:ring-[#5B7FFF]/15"
            />
            <label htmlFor="username" className={`pointer-events-none absolute left-4 font-medium transition-all duration-150 ${focusedField === "username" ? "text-[#7C97FF]" : "text-[#5B6472]"} ${usernameShrink ? "top-3.5 text-[11px]" : "top-1/2 -translate-y-1/2 text-[15px]"}`}>
              Username
            </label>
          </div>

          {!isCompletingProfile && (
            <div ref={collectField} className="relative">
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocusedField("email")}
                onBlur={() => setFocusedField(null)}
                required
                className="peer w-full rounded-xl border border-white/10 bg-[#0D1117] px-4 pb-2 pt-5 text-[15px] font-medium text-[#E7EAEF] outline-none transition-colors focus:border-[#5B7FFF]/60 focus:ring-2 focus:ring-[#5B7FFF]/15"
              />
              <label htmlFor="email" className={`pointer-events-none absolute left-4 font-medium transition-all duration-150 ${focusedField === "email" ? "text-[#7C97FF]" : "text-[#5B6472]"} ${emailShrink ? "top-3.5 text-[11px]" : "top-1/2 -translate-y-1/2 text-[15px]"}`}>
                Email address
              </label>
            </div>
          )}

          <div ref={collectField} className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setFocusedField("password")}
              onBlur={() => setFocusedField(null)}
              required
              minLength={6}
              className="peer w-full rounded-xl border border-white/10 bg-[#0D1117] px-4 pb-2 pt-5 pr-11 text-[15px] font-medium text-[#E7EAEF] outline-none transition-colors focus:border-[#5B7FFF]/60 focus:ring-2 focus:ring-[#5B7FFF]/15"
            />
            <label htmlFor="password" className={`pointer-events-none absolute left-4 font-medium transition-all duration-150 ${focusedField === "password" ? "text-[#7C97FF]" : "text-[#5B6472]"} ${passwordShrink ? "top-3.5 text-[11px]" : "top-1/2 -translate-y-1/2 text-[15px]"}`}>
              Password
            </label>
            <button type="button" tabIndex={-1} onClick={() => setShowPassword((s) => !s)} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-[#5B6472] transition-colors hover:text-[#8891A0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B7FFF]/50">
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>

          {!isCompletingProfile && (
            <div ref={collectField} className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onFocus={() => setFocusedField("confirm")}
                onBlur={() => setFocusedField(null)}
                required
                className="peer w-full rounded-xl border border-white/10 bg-[#0D1117] px-4 pb-2 pt-5 pr-11 text-[15px] font-medium text-[#E7EAEF] outline-none transition-colors focus:border-[#5B7FFF]/60 focus:ring-2 focus:ring-[#5B7FFF]/15"
              />
              <label htmlFor="confirmPassword" className={`pointer-events-none absolute left-4 font-medium transition-all duration-150 ${focusedField === "confirm" ? "text-[#7C97FF]" : "text-[#5B6472]"} ${confirmShrink ? "top-3.5 text-[11px]" : "top-1/2 -translate-y-1/2 text-[15px]"}`}>
                Confirm password
              </label>
              <button type="button" tabIndex={-1} onClick={() => setShowConfirmPassword((s) => !s)} aria-label={showConfirmPassword ? "Hide password" : "Show password"} className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-[#5B6472] transition-colors hover:text-[#8891A0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B7FFF]/50">
                {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          )}

          {passwordsMismatch && (
            <p className="-mt-1.5 px-1 text-[12.5px] font-medium text-[#F2939A]">Passwords do not match.</p>
          )}

          <button className="group relative mt-1 flex h-[46px] w-full items-center justify-center gap-2 rounded-xl bg-[#5B7FFF] text-[14.5px] font-semibold text-white transition-all hover:bg-[#6C8CFF] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B7FFF]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#12161D]" type="submit" disabled={!isValid || loading}>
            {loading && <SpinnerIcon />}
            {loading ? "Saving…" : isCompletingProfile ? "Save and continue" : "Create account"}
          </button>
        </form>

        {!isCompletingProfile && (
          <>
            <div ref={collectField} className="my-6 flex w-full items-center">
              <div className="flex-1 border-t border-white/10" />
              <span className="mx-3 text-[11px] font-medium uppercase tracking-wider text-[#5B6472]">or continue with</span>
              <div className="flex-1 border-t border-white/10" />
            </div>
            <div ref={collectField} className="flex w-full gap-4">
              <button type="button" onClick={() => { if (googleEnabled) window.location.href = `${apiUrl}/api/auth/google`; }} disabled={!googleEnabled} className={`flex h-[46px] flex-1 items-center justify-center gap-2.5 rounded-xl border text-[14px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B7FFF]/50 ${googleEnabled ? "border-white/10 bg-[#0D1117] text-[#E7EAEF] hover:border-white/20 hover:bg-[#151B24]" : "cursor-not-allowed border-white/5 bg-[#0D1117]/60 text-[#5B6472]"}`}>
                <GoogleIcon />
                Continue with Google
              </button>
            </div>
          </>
        )}

        <p ref={collectField} className="mb-2 mt-6 text-center text-[12px] font-medium leading-5 text-[#5B6472]">
          By signing up, you agree to our{" "}
          <span className="text-[#8891A0] underline decoration-white/20 underline-offset-2">Terms</span> and{" "}
          <span className="text-[#8891A0] underline decoration-white/20 underline-offset-2">Privacy Policy</span>.
        </p>
      </div>
    </div>
  );
}