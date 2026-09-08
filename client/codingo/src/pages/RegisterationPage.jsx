/**
 * PreferencesSetup.jsx
 * ------------------------------------------------------------------
 * Single-page "tell us about yourself" preferences screen shown right
 * after signup — this is what shapes the user's feed, not a dating bio.
 *
 * Dependencies:
 *   npm install gsap
 *   react-icons (already used elsewhere in the app)
 *
 * Usage:
 *   <PreferencesSetup
 *     onSubmit={(answers) => { ...save to your backend, then redirect }}
 *     onSkip={() => { ...route to feed with defaults }}
 *   />
 *
 *   `answers` shape:
 *   {
 *     profession: string,
 *     interests: string[],
 *     postAbout: string,
 *     location: string,
 *     communities: string[],
 *     talkForHours: string,
 *     describedAs: string,
 *     hopingFor: string,
 *   }
 * ------------------------------------------------------------------
 */

import React, { useState, useRef, useLayoutEffect, useEffect, useMemo, useCallback } from "react";
import { gsap } from "gsap";
import { FiBriefcase, FiZap, FiEdit3, FiMapPin, FiUsers, FiCoffee, FiSmile, FiCompass, FiX, FiArrowRight } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { Orbit, PlaneTakeoffIcon } from "lucide-react";

/* ------------------------------------------------------------------ */
/* Question configuration — edit freely, the UI adapts automatically   */
/* ------------------------------------------------------------------ */

const QUESTIONS = [
  {
    id: "postAbout",
    icon: FiEdit3,
    type: "text",
    question: "What do you usually post about?",
    placeholder: "Late-night thoughts, side projects, my dog...",
  },
  {
    id: "location",
    icon: FiMapPin,
    type: "text",
    question: "Where are you based?",
    placeholder: "City, country",
  },
  {
    id: "communities",
    icon: FiUsers,
    type: "tags",
    question: "What communities do you want to see more of?",
    placeholder: "Type one, press Enter",
  },
  {
    id: "talkForHours",
    icon: FiCoffee,
    type: "text",
    question: "What could you talk about for hours?",
    placeholder: "Give us your rabbit hole",
  },
  {
    id: "profession",
    icon: FiBriefcase,
    type: "text",
    question: "What do you do?",
    placeholder: "Product designer, student, chef, freelance everything...",
  },
];

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/* ------------------------------------------------------------------ */
/* Tag input — used for multi-answer questions (interests, communities) */
/* ------------------------------------------------------------------ */

function TagInput({ id, value, onChange, placeholder }) {
  const [draft, setDraft] = useState("");

  const commit = (raw) => {
    const tag = raw.trim();
    if (!tag) return;
    if (value.includes(tag)) {
      setDraft("");
      return;
    }
    onChange([...value, tag]);
    setDraft("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commit(draft);
    } else if (e.key === "Backspace" && !draft && value.length) {
      onChange(value.slice(0, -1));
    }
  };

  const removeTag = (tag) => onChange(value.filter((t) => t !== tag));

  return (
    <div className="flex flex-wrap items-center gap-2">
      {value.map((tag) => (
        <span
          key={tag}
          className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 py-1.5 pl-3 pr-2 text-[13px] text-white/90"
        >
          {tag}
          <button
            type="button"
            onClick={() => removeTag(tag)}
            aria-label={`Remove ${tag}`}
            className="rounded-full p-0.5 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
          >
            <FiX size={12} />
          </button>
        </span>
      ))}
      <input
        id={id}
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => commit(draft)}
        placeholder={value.length ? "" : placeholder}
        className="min-w-[140px] flex-1 bg-transparent py-1.5 text-[14px] text-white placeholder-white/30 outline-none"
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Question card shell — icon badge + label + input area               */
/* ------------------------------------------------------------------ */

function QuestionCard({ icon: Icon, question, htmlFor, children, answered }) {
  return (
    <div
      className="pref-card relative rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-5
                 backdrop-blur-xl transition-colors duration-300 hover:border-white/20
                 focus-within:border-violet-400/40 focus-within:bg-white/[0.06] sm:px-6 sm:py-6"
      style={{ boxShadow: "inset 0 1px 1px rgba(255,255,255,0.06)" }}
    >
      <div className="flex items-start gap-4">
        <div
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-white shadow-lg shadow-violet-950/40"
          style={{ background: "linear-gradient(135deg,#8b5cf6,#ec4899)" }}
        >
          <Icon size={17} />
        </div>

        <div className="min-w-0 flex-1">
          <label
            htmlFor={htmlFor}
            className="mb-3 block text-[15px] font-medium text-white sm:text-base"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            {question}
          </label>
          {children}
        </div>

        {/* quiet answered indicator, not a required-field nag */}
        <span
          aria-hidden="true"
          className={`mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full transition-colors duration-300 ${
            answered ? "bg-emerald-400/80" : "bg-white/10"
          }`}
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main page                                                           */
/* ------------------------------------------------------------------ */

export default function PreferencesSetup({ onSubmit }) {
  const [text, setText] = useState(() =>
    Object.fromEntries(QUESTIONS.filter((q) => q.type === "text").map((q) => [q.id, ""]))
  );
  const [tags, setTags] = useState(() =>
    Object.fromEntries(QUESTIONS.filter((q) => q.type === "tags").map((q) => [q.id, []]))
  );
  const navigate = useNavigate();

  const containerRef = useRef(null);
  const blobARef = useRef(null);
  const blobBRef = useRef(null);
  const progressFillRef = useRef(null);

  /* ---- entrance stagger + ambient background drift ---- */
  useLayoutEffect(() => {
    const reduced = prefersReducedMotion();
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from(".pref-hero > *", {
        opacity: 0,
        y: 16,
        duration: reduced ? 0.01 : 0.5,
        stagger: reduced ? 0 : 0.08,
      }).from(
        ".pref-card",
        {
          opacity: 0,
          y: 20,
          duration: reduced ? 0.01 : 0.45,
          stagger: reduced ? 0 : 0.06,
        },
        "-=0.25"
      );

      if (!reduced) {
        gsap.to(blobARef.current, {
          x: 40,
          y: -30,
          duration: 9,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
        gsap.to(blobBRef.current, {
          x: -30,
          y: 25,
          duration: 11,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  /* ---- progress ---- */
  const answeredCount = useMemo(() => {
    const textDone = Object.values(text).filter((v) => v.trim().length > 0).length;
    const tagDone = Object.values(tags).filter((arr) => arr.length > 0).length;
    return textDone + tagDone;
  }, [text, tags]);

  const total = QUESTIONS.length;
  const isAnswered = useCallback(
    (q) => (q.type === "text" ? text[q.id].trim().length > 0 : tags[q.id].length > 0),
    [text, tags]
  );

  useEffect(() => {
    const pct = (answeredCount / total) * 100;
    gsap.to(progressFillRef.current, {
      width: `${pct}%`,
      duration: 0.5,
      ease: "power2.out",
    });
  }, [answeredCount, total]);

  /* ---- handlers ---- */
  const handleTextChange = (id, value) => setText((prev) => ({ ...prev, [id]: value }));
  const handleTagsChange = (id, value) => setTags((prev) => ({ ...prev, [id]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.({ ...text, ...tags });
  };

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen w-full overflow-hidden bg-[#0b0b0e] px-4 py-10 sm:px-6 sm:py-16"
    >
      {/* ambient background blobs — quiet, on-brand, not distracting */}
      <div
        ref={blobARef}
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-[10%] h-[26rem] w-[26rem] rounded-full opacity-20 blur-[120px]"
        style={{ background: "radial-gradient(circle, #8b5cf6, transparent 70%)" }}
      />
      <div
        ref={blobBRef}
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[-8rem] right-[8%] h-[24rem] w-[24rem] rounded-full opacity-[0.15] blur-[120px]"
        style={{ background: "radial-gradient(circle, #ec4899, transparent 70%)" }}
      />

      <form onSubmit={handleSubmit} className="relative mx-auto flex w-full max-w-[640px] flex-col gap-8 pb-28">
        {/* ---- hero / header ---- */}
        <div className="pref-hero flex flex-col gap-4">
          {/* replace with your app's actual logo / wordmark */}
          {/* <div
            className="h-8 w-8 rounded-lg"
            style={{ background: "linear-gradient(135deg,#8b5cf6,#ec4899)" }}
            aria-hidden="true"
          /> */}
          <div>
            <Orbit className="h-8 w-8 text-white rounded-lg" />  
          </div>
          
          {/* <image
            src="../assets/logo.png"
            alt="Codify Logo"
            className="h-8 w-8 text-white rounded-lg"
          /> */}

          <h1
            className="text-3xl font-extrabold leading-[1.15] tracking-tight text-white sm:text-4xl"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            A feed that actually gets you starts here.
          </h1>

          <p className="max-w-md text-[14px] leading-relaxed text-white/50 sm:text-[15px]">
            Not a dating profile — just the raw material for a feed that feels like yours. Eight quick things, answer
            however loosely you like.
          </p>

          <div className="flex items-center gap-3 pt-1">
            <div className="h-1 w-28 overflow-hidden rounded-full bg-white/10">
              <div ref={progressFillRef} className="h-full w-0 rounded-full" style={{ background: "linear-gradient(90deg,#8b5cf6,#ec4899)" }} />
            </div>
            <span className="text-[12px] text-white/40" style={{ fontFamily: "'DM Mono', monospace" }}>
              {answeredCount} / {total} answered
            </span>
          </div>
        </div>

        {/* ---- questions ---- */}
        <div className="flex flex-col gap-4">
          {QUESTIONS.map((q) => (
            <QuestionCard key={q.id} icon={q.icon} question={q.question} htmlFor={q.id} answered={isAnswered(q)}>
              {q.type === "text" ? (
                <input
                  id={q.id}
                  type="text"
                  value={text[q.id]}
                  onChange={(e) => handleTextChange(q.id, e.target.value)}
                  placeholder={q.placeholder}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-[14px]
                              text-white placeholder-white/30 outline-none transition-colors
                              focus:border-violet-400/50"
                />
              ) : (
                <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 transition-colors focus-within:border-violet-400/50">
                  <TagInput id={q.id} value={tags[q.id]} onChange={(v) => handleTagsChange(q.id, v)} placeholder={q.placeholder} />
                </div>
              )}
            </QuestionCard>
          ))}
        </div>
      </form>

      {/* ---- sticky footer action bar ---- */}
      <div
        className="fixed inset-x-0 bottom-0 z-20 border-t border-white/10 bg-[#0b0b0e]/80 px-4 py-4 backdrop-blur-xl sm:px-6"
      >
        <div className="mx-auto flex w-full max-w-[640px] items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => navigate('/community')}
            className="text-[13px] text-white/40 transition-colors hover:text-white/70"
          >
            Skip for now
          </button>

          <button
            type="submit"
            onClick={handleSubmit}
            className="flex items-center gap-2 rounded-full px-6 py-3 text-[14px] font-semibold text-white
                        shadow-lg shadow-violet-950/40 transition-transform active:scale-[0.98]"
            style={{ background: "linear-gradient(135deg,#8b5cf6,#ec4899)" }}
          >
            Continue
            <FiArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}