import React, { useEffect, useState } from "react";
import {
  Menu,
  X,
  Heart,
  Users,
  Compass,
  Sparkles,
  ArrowRight,
  MessageCircle,
} from "lucide-react";
import { FaInstagram, FaTwitter, FaYoutube } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import HeroOrbits from "../components/LandingPage/HeroOrbits";

export default function OrbitLanding() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";
    return () => {
      document.documentElement.style.scrollBehavior = "";
    };
  }, []);

  const navLink =
    "text-sm text-slate-300 hover:text-slate-50 transition-colors";

  return (
    <div className="bg-slate-950 text-slate-50 min-h-screen font-body">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&display=swap');

        .font-display { font-family: 'Space Grotesk', sans-serif; }
        .font-body { font-family: 'Inter', sans-serif; }

        @keyframes orbit-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes orbit-spin-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        @keyframes float-up {
          from { opacity: 0; transform: translateY(22px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes core-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(167,139,250,0.35); }
          50% { box-shadow: 0 0 0 18px rgba(167,139,250,0); }
        }

        .ring-1 { animation: orbit-spin 20s linear infinite; transform-origin: 200px 200px; }
        .ring-2 { animation: orbit-spin-reverse 28s linear infinite; transform-origin: 200px 200px; }
        .ring-3 { animation: orbit-spin 40s linear infinite; transform-origin: 200px 200px; }

        .reveal { opacity: 0; animation: float-up 0.8s ease forwards; }
        .core-pulse { animation: core-pulse 3.2s ease-out infinite; }

        @media (prefers-reduced-motion: reduce) {
          .ring-1, .ring-2, .ring-3, .reveal, .core-pulse {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
            box-shadow: none !important;
          }
        }
      `}</style>

      {/* NAVBAR */}
      <header
        className={
          "fixed top-0 inset-x-0 z-50 transition-all duration-300 " +
          (scrolled
            ? "bg-slate-950/80 backdrop-blur-md border-b border-slate-800"
            : "bg-transparent border-b border-transparent")
        }
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="font-display font-bold text-xl tracking-tight">
            orb8
          </span>

          <nav className="hidden md:flex items-center gap-8">
            <a href="#orbits" className={navLink}>
              Features
            </a>
            <a href="#how" className={navLink}>
              How it works
            </a>
            <a href="#ingress" className={navLink}>
              Igris AI
            </a>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {/* <button className="text-sm text-slate-200 hover:text-white px-4 py-2 transition-colors">
              Log in
            </button> */}
            <button onClick={() => navigate("/login")} className="text-sm font-medium px-4 py-2 rounded-full bg-gradient-to-r from-orange-400 via-teal-400 to-violet-400 text-slate-950 hover:opacity-90 transition-opacity">
              Get started
            </button>
          </div>

          <button
            className="md:hidden text-slate-200"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden bg-slate-950 border-t border-slate-800 px-6 py-5 flex flex-col gap-4">
            <a
              href="#orbits"
              className={navLink}
              onClick={() => setMobileOpen(false)}
            >
              Features
            </a>
            <a
              href="#how"
              className={navLink}
              onClick={() => setMobileOpen(false)}
            >
              How it works
            </a>
            <a
              href="#ingress"
              className={navLink}
              onClick={() => setMobileOpen(false)}
            >
              Igris AI
            </a>
            <div className="flex gap-3 pt-2">
              {/* <button className="flex-1 text-sm text-slate-200 border border-slate-700 rounded-full py-2">
                Log in
              </button> */}
              <button  onClick={() => navigate("/login")} className="flex-1 text-sm font-medium rounded-full py-2 bg-gradient-to-r from-orange-400 via-teal-400 to-violet-400 text-slate-950">
                Get started
              </button>
            </div>
          </div>
        )}
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden px-6 pt-40 pb-24 sm:pt-48 sm:pb-32">
        <div
          className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full opacity-20"
          style={{
            background:
              "radial-gradient(circle, rgba(167,139,250,0.35) 0%, rgba(45,212,191,0.15) 40%, transparent 70%)",
          }}
        />

        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 lg:gap-16 items-center relative">
          <div>
            <h1
              className="reveal font-display font-semibold text-4xl sm:text-5xl lg:text-6xl leading-[1.1] tracking-tight"
              style={{ animationDelay: "0.05s" }}
            >
              A social space built around the people you choose
            </h1>

            <p
              className="reveal mt-6 text-slate-400 text-lg max-w-md leading-relaxed"
              style={{ animationDelay: "0.2s" }}
            >
              Share with friends, join communities called Orbitals around what
              you care about, message people directly, and find new people
              nearby, only when you choose to be found.
            </p>

            <div
              className="reveal mt-9 flex flex-col sm:flex-row gap-4"
              style={{ animationDelay: "0.35s" }}
            >
              <button onClick={() => navigate("/login")} className="inline-flex items-center justify-center gap-2 px-25 py-3 rounded-full bg-gradient-to-r from-orange-400 via-teal-400 to-violet-400 text-slate-950 font-medium hover:opacity-90 transition-opacity">
                Get started
                <ArrowRight size={16} />
              </button>
              {/* <button className="px-6 py-3 rounded-full border border-slate-700 text-slate-200 hover:border-slate-500 transition-colors">
                Log in
              </button> */}
            </div>

            <p
              className="reveal mt-8 text-sm text-slate-500"
              style={{ animationDelay: "0.5s" }}
            >
              Feed · Orbitals · Messages · Igris AI included
            </p>
          </div>

          {/* Orbit graphic */}
          <HeroOrbits />
        </div>
      </section>

      {/* THREE ORBITS */}
      <section id="orbits" className="px-6 py-24 border-t border-slate-900">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-xl">
            <h2 className="font-display font-semibold text-3xl sm:text-4xl tracking-tight">
              Three ways to connect
            </h2>
            <p className="mt-4 text-slate-400 leading-relaxed">
              Keep up with friends, join communities that match your
              interests, and discover people you haven't met yet. You decide
              who sees what.
            </p>
          </div>

          <div className="mt-14 grid md:grid-cols-3 gap-6">
            {/* Personal */}
            <div className="group rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden hover:border-orange-400/40 hover:-translate-y-1 transition-all duration-300">
              <div className="relative grid h-44 w-full place-items-center overflow-hidden bg-linear-to-br from-orange-400/15 via-slate-900 to-slate-950" aria-hidden="true">
                <Heart size={64} strokeWidth={1.2} className="text-orange-400/70" />
              </div>
              <div className="p-6">
                <div className="w-9 h-9 rounded-full bg-orange-400/10 flex items-center justify-center mb-4">
                  <Heart size={16} className="text-orange-400" />
                </div>
                <h3 className="font-display font-semibold text-lg">
                  Friends
                </h3>
                <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                  Post to your feed, share photos and short videos, and chat
                  one-to-one with the people you actually know.
                </p>
                <ul className="mt-4 space-y-1.5 text-sm text-slate-500">
                  <li>Friend requests you control</li>
                  <li>Direct messages</li>
                </ul>
              </div>
            </div>

            {/* Professional */}
            <div className="group rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden hover:border-teal-400/40 hover:-translate-y-1 transition-all duration-300">
              <div className="relative grid h-44 w-full place-items-center overflow-hidden bg-linear-to-br from-teal-400/15 via-slate-900 to-slate-950" aria-hidden="true">
                <Users size={64} strokeWidth={1.2} className="text-teal-400/70" />
              </div>
              <div className="p-6">
                <div className="w-9 h-9 rounded-full bg-teal-400/10 flex items-center justify-center mb-4">
                  <Users size={16} className="text-teal-400" />
                </div>
                <h3 className="font-display font-semibold text-lg">
                  Orbitals
                </h3>
                <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                  Communities built around a topic or a crowd. Start one, join
                  one, and post to it or to your own feed.
                </p>
                <ul className="mt-4 space-y-1.5 text-sm text-slate-500">
                  <li>Public or private</li>
                  <li>Request to join private ones</li>
                </ul>
              </div>
            </div>

            {/* Social */}
            <div className="group rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden hover:border-violet-400/40 hover:-translate-y-1 transition-all duration-300">
              <div className="relative grid h-44 w-full place-items-center overflow-hidden bg-linear-to-br from-violet-400/15 via-slate-900 to-slate-950" aria-hidden="true">
                <Compass size={64} strokeWidth={1.2} className="text-violet-400/70" />
              </div>
              <div className="p-6">
                <div className="w-9 h-9 rounded-full bg-violet-400/10 flex items-center justify-center mb-4">
                  <Compass size={16} className="text-violet-400" />
                </div>
                <h3 className="font-display font-semibold text-lg">
                  Explore
                </h3>
                <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                  Search for people, find communities beyond your circle, and
                  see who's nearby.
                </p>
                <ul className="mt-4 space-y-1.5 text-sm text-slate-500">
                  <li>Nearby is opt-in and expires in 30 minutes</li>
                  <li>Stop sharing any time</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="px-6 py-24 border-t border-slate-900">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display font-semibold text-3xl sm:text-4xl tracking-tight max-w-xl">
            How orb8 works
          </h2>

          <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                n: "1",
                t: "Create your profile",
                d: "Sign up with email or Google, pick a username and add a photo. That's all you need to start.",
              },
              {
                n: "2",
                t: "Find your people",
                d: "Search for friends, join Orbitals that match your interests, and follow what's happening in your feed.",
              },
              {
                n: "3",
                t: "Share and talk",
                d: "Post photos and videos to your feed or an Orbital, and message friends directly.",
              },
              {
                n: "4",
                t: "Ask Igris",
                d: "Chat with the built-in AI assistant, and teach it your own notes and files so it remembers them.",
              },
            ].map((step) => (
              <div key={step.n}>
                <span className="font-display text-sm text-slate-600">
                  {step.n}
                </span>
                <h3 className="mt-3 font-display font-semibold text-base">
                  {step.t}
                </h3>
                <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                  {step.d}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INGRESS AI */}
      <section
        id="ingress"
        className="px-6 py-24 border-t border-slate-900"
      >
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center mb-6">
              <Sparkles size={17} className="text-slate-200" />
            </div>
            <h2 className="font-display font-semibold text-3xl sm:text-4xl tracking-tight max-w-md">
              Igris AI is an assistant that learns what you teach it
            </h2>
            <p className="mt-5 text-slate-400 leading-relaxed max-w-md">
              Igris AI is the assistant built into orb8. Ask it questions in
              a chat, share an image for it to describe, or upload your own
              files so it can remember them and answer from them later.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-slate-500">
              <li>Chat history you can search and reopen</li>
              <li>Describes images you send it</li>
              <li>Remembers the files you upload</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-800">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-400 via-teal-400 to-violet-400" />
              <span className="text-sm font-medium text-slate-200">
                Igris AI
              </span>
            </div>

            <div className="mt-5 space-y-4">
              <div className="ml-auto max-w-[80%] rounded-2xl rounded-tr-sm bg-slate-800 px-4 py-2.5 text-sm text-slate-200">
                What did the notes I uploaded say about my trip plans?
              </div>
              <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-slate-800/60 border border-slate-800 px-4 py-2.5 text-sm text-slate-300">
                Igris answers from the files you've taught it, so you don't
                have to dig through them yourself.
              </div>
              <div className="ml-auto max-w-[80%] rounded-2xl rounded-tr-sm bg-slate-800 px-4 py-2.5 text-sm text-slate-200">
                Describe this photo for me
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="px-6 py-24 border-t border-slate-900">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display font-semibold text-3xl sm:text-4xl tracking-tight">
            Find your orbit
          </h2>
          <p className="mt-4 text-slate-400">
            Create your profile in a couple of minutes. No credit card
            needed.
          </p>
          <button  onClick={() => navigate("/login")} className="mt-8 inline-flex items-center gap-2 px-20 py-3.5 rounded-full bg-gradient-to-r from-orange-400 via-teal-400 to-violet-400 text-slate-950 font-medium hover:opacity-90 transition-opacity">
            Get started
            <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="px-6 py-14 border-t border-slate-900">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-start md:justify-between gap-10">
          <div>
            <span className="font-display font-bold text-lg">orb8</span>
            <p className="mt-3 text-sm text-slate-500 max-w-xs leading-relaxed">
              Friends, communities and discovery, on your terms.
            </p>
            <div className="mt-5 flex gap-4 text-slate-500">
              <FaInstagram size={18} className="hover:text-slate-200 transition-colors cursor-pointer" />
              <FaTwitter size={18} className="hover:text-slate-200 transition-colors cursor-pointer" />
              {/* <Linkedin size={18} className="hover:text-slate-200 transition-colors cursor-pointer" /> */}
              <FaYoutube size={18} className="hover:text-slate-200 transition-colors cursor-pointer" />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-10 text-sm">
            <div>
              <p className="text-slate-300 mb-3">Product</p>
              <ul className="space-y-2 text-slate-500">
                <li>Feed</li>
                <li>Orbitals</li>
                <li>Explore</li>
                <li>Igris AI</li>
              </ul>
            </div>
            <div>
              <p className="text-slate-300 mb-3">Company</p>
              <ul className="space-y-2 text-slate-500">
                <li>About</li>
                <li>Careers</li>
                <li>Contact</li>
              </ul>
            </div>
            <div>
              <p className="text-slate-300 mb-3">Legal</p>
              <ul className="space-y-2 text-slate-500">
                <li>Privacy</li>
                <li>Terms</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto mt-12 pt-6 border-t border-slate-900 text-xs text-slate-600">
          © 2026 orb8. All rights reserved.
        </div>
      </footer>
    </div>
  );
}