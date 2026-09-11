/*
  =========================================================================
  NOVA — AI Productivity Platform
  Landing page — single-file build (App.jsx)
  =========================================================================

  Stack: React (function components + hooks), Tailwind CSS (utility classes,
  arbitrary values used freely — needs Tailwind v3+ with the default JIT
  engine, no config changes required to run this file), GSAP + ScrollTrigger
  for motion, lucide-react for icons.

  Install (in your real project):
    npm install gsap lucide-react

  Note on animation: all GSAP calls are wrapped in try/catch and cleaned up
  with gsap.context(...).revert(). If GSAP is ever unavailable at runtime,
  every section still renders and works — GSAP only adds motion on top of a
  fully functional, static-safe layout.

  -------------------------------------------------------------------------
  INTENDED FILE STRUCTURE once you segregate this (each block below is
  banner-commented with its future home so it can be lifted out verbatim):

    src/
      data/
        siteData.js         <- everything in the "DATA" block
      hooks/
        useTheme.js
        useScrollPosition.js
      components/
        ui/
          Button.jsx
          Container.jsx
          SectionIntro.jsx
          IconBadge.jsx
        layout/
          GlobalStyles.jsx
          Navbar.jsx
          Footer.jsx
          BackToTop.jsx
          DemoModal.jsx
        sections/
          Hero.jsx (+ HeroCodePanel.jsx)
          TrustedBy.jsx
          Features.jsx
          Courses.jsx
          About.jsx
          HowItWorks.jsx
          Statistics.jsx
          Solutions.jsx
          Testimonials.jsx
          Pricing.jsx
          FAQ.jsx
          FinalCTA.jsx
      App.jsx                <- the default export at the bottom of this file

  Each component below only reads from the DATA/HOOKS/UI blocks above it and
  its own local state, so moving it to its own file just means adding the
  matching imports.
  =========================================================================
*/

import React, {
  useState,
  useEffect,
  useLayoutEffect,
  useRef,
  useCallback,
} from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Menu,
  X,
  Sun,
  Moon,
  Play,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  ArrowUp,
  Star,
  Users,
  BookOpen,
  Trophy,
  Zap,
  Target,
  TrendingUp,
  Award,
  Globe,
  Sparkles,
  Clock,
  Flame,
  Code2,
  Layers,
  Languages,
  Brain,
  FileCode2,
  Cloud,
} from "lucide-react";

try {
  gsap.registerPlugin(ScrollTrigger);
} catch (e) {
  /* GSAP not resolvable in this environment — sections still render statically. */
}

/* =========================================================================
   DATA  ->  src/data/siteData.js
   ========================================================================= */

const NAV_LINKS = [
  { label: "Product", href: "#features" },
  { label: "Courses", href: "#courses" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

const TRUSTED_COMPANIES = [
  "Vertex Labs",
  "Northwind Systems",
  "Cobalt & Co",
  "Hallmark Dynamics",
  "Fenwick Digital",
  "Arcadia Health",
  "Solstice Robotics",
  "Meridian Bank",
  "Ironclad Freight",
  "Brightline Media",
];

const FEATURES = [
  {
    icon: Sparkles,
    title: "AI mentor & live supervision",
    desc: "An AI mentor reviews your code, your quiz answers and your spoken practice in real time — catching mistakes before they turn into habits.",
  },
  {
    icon: Zap,
    title: "Gamified XP & streaks",
    desc: "Every lesson earns XP, every day extends a streak, and every chapter unlocks the next level. Progress finally feels like progress.",
  },
  {
    icon: TrendingUp,
    title: "Real-time progress tracking",
    desc: "Dashboards update the moment you finish a lesson, so you and your team always know exactly where mastery stands.",
  },
  {
    icon: BookOpen,
    title: "Interactive chapter builder",
    desc: "Assemble custom chapters from a library of lessons, quizzes and coding challenges — no engineering help required.",
  },
  {
    icon: Trophy,
    title: "Leaderboards & challenges",
    desc: "Weekly leaderboards and timed team challenges turn solo practice into something you actually want to show up for.",
  },
  {
    icon: Target,
    title: "Adaptive learning paths",
    desc: "NOVA reorders upcoming lessons on the fly based on where you're strong and where you keep getting stuck.",
  },
  {
    icon: Globe,
    title: "Any language, any subject",
    desc: "Study tech skills in English, or learn Spanish, French and Japanese from scratch — the same AI mentor covers both.",
  },
];

const COURSES = [
  {
    title: "Python for Data Science",
    category: "Technology",
    level: "Intermediate",
    duration: "8 weeks",
    learners: "42.3K learners",
    icon: Code2,
    tone: "accent",
  },
  {
    title: "Full-Stack Web Development",
    category: "Technology",
    level: "Beginner",
    duration: "12 weeks",
    learners: "58.9K learners",
    icon: Layers,
    tone: "accent2",
  },
  {
    title: "Conversational Spanish",
    category: "Language",
    level: "Beginner",
    duration: "6 weeks",
    learners: "31.1K learners",
    icon: Languages,
    tone: "accent",
  },
  {
    title: "Machine Learning Foundations",
    category: "Technology",
    level: "Intermediate",
    duration: "10 weeks",
    learners: "27.4K learners",
    icon: Brain,
    tone: "accent2",
  },
  {
    title: "JavaScript & TypeScript Mastery",
    category: "Technology",
    level: "Intermediate",
    duration: "8 weeks",
    learners: "39.8K learners",
    icon: FileCode2,
    tone: "accent",
  },
  {
    title: "Business French",
    category: "Language",
    level: "Beginner",
    duration: "6 weeks",
    learners: "18.3K learners",
    icon: Languages,
    tone: "accent2",
  },
  {
    title: "Cloud & DevOps with AWS",
    category: "Technology",
    level: "Advanced",
    duration: "9 weeks",
    learners: "21.6K learners",
    icon: Cloud,
    tone: "accent",
  },
  {
    title: "Japanese for Travelers",
    category: "Language",
    level: "Beginner",
    duration: "5 weeks",
    learners: "15.9K learners",
    icon: Languages,
    tone: "accent2",
  },
];

const STEPS = [
  {
    title: "Take the skill assessment",
    desc: "A 3-minute placement test finds your real starting point — no guessing which course to pick.",
  },
  {
    title: "Get your AI-personalized path",
    desc: "NOVA builds a chapter sequence around your goal, your pace and the time you actually have.",
  },
  {
    title: "Learn with your AI mentor",
    desc: "Practice lessons, coding challenges and speaking drills, with feedback the moment you submit.",
  },
  {
    title: "Track mastery & get certified",
    desc: "Finish a chapter and it's reflected on your dashboard instantly, building toward a shareable certificate.",
  },
];

const STATS = [
  { label: "Active learners", value: 240000, suffix: "+" },
  { label: "Interactive chapters", value: 1200, suffix: "+" },
  { label: "Course completion rate", value: 94, suffix: "%" },
  { label: "Countries reached", value: 35, suffix: "+" },
];

const SOLUTIONS = [
  {
    audience: "For individuals",
    title: "Learn on your own schedule",
    desc: "Pick a technical skill or a language, get a personalized path, and let streaks keep you honest.",
    points: [
      "Unlimited AI mentor feedback",
      "Progress synced across devices",
      "Certificates you can share",
    ],
  },
  {
    audience: "For teams",
    title: "Onboard and upskill faster",
    desc: "Assign chapters, track completion across your org, and replace static onboarding docs with something people finish.",
    points: [
      "Team dashboards & seat management",
      "Assign existing or custom chapters",
      "Manager-level progress reports",
    ],
  },
  {
    audience: "For educators & schools",
    title: "Build your own curriculum",
    desc: "Turn a syllabus into gamified chapters your students actually want to open, with grading handled automatically.",
    points: [
      "Drag-and-drop chapter builder",
      "Auto-graded quizzes & challenges",
      "Class-wide progress overview",
    ],
  },
];

const TESTIMONIALS = [
  {
    quote:
      "I finally kept a coding streak going for 90 days straight — the AI feedback made every session feel worth showing up for.",
    name: "Maya R.",
    role: "Software apprentice",
    initials: "MR",
  },
  {
    quote:
      "Our team's onboarding time dropped by a third once we started building our own chapters in NOVA instead of static docs.",
    name: "Daniel K.",
    role: "Head of L&D, Fenwick Digital",
    initials: "DK",
  },
  {
    quote:
      "Other apps got me speaking basic Spanish. NOVA got me comfortable running client calls in Spanish.",
    name: "Priya S.",
    role: "Product manager",
    initials: "PS",
  },
  {
    quote:
      "The leaderboard is the reason I still open the app every morning before coffee. Small thing, huge difference.",
    name: "Jonah T.",
    role: "Bootcamp student",
    initials: "JT",
  },
];

const PRICING_PLANS = [
  {
    name: "Starter",
    tagline: "For getting started",
    monthly: 0,
    annual: 0,
    highlighted: false,
    cta: "Start free",
    features: [
      "Access to 6 starter courses",
      "1 active learning path",
      "Community leaderboard",
      "Limited AI mentor feedback",
    ],
  },
  {
    name: "Pro",
    tagline: "For serious learners",
    monthly: 19,
    annual: 15,
    highlighted: true,
    cta: "Start Pro trial",
    features: [
      "Every course, tech and language",
      "Unlimited AI mentor feedback",
      "Custom chapter builder",
      "Shareable certificates",
      "Priority leaderboard placement",
    ],
  },
  {
    name: "Team",
    tagline: "For teams & organizations",
    monthly: 39,
    annual: 31,
    highlighted: false,
    cta: "Talk to sales",
    features: [
      "Everything in Pro, per seat",
      "Team dashboards & reporting",
      "Seat management & SSO",
      "Dedicated success manager",
    ],
  },
];

const FAQS = [
  {
    q: "What makes NOVA different from other learning platforms?",
    a: "Most platforms track completion. NOVA's AI mentor actively reviews your work — code, quiz answers, even spoken language practice — and reshapes your path in real time, wrapped in the same XP and streak mechanics that make games hard to put down.",
  },
  {
    q: "How does the AI mentor actually supervise my learning?",
    a: "As you complete lessons, the mentor checks your submissions against the chapter's goals, flags specific mistakes, and suggests the next best lesson — instead of just moving you to the next item in a fixed list.",
  },
  {
    q: "Can I learn both technical skills and languages on the same account?",
    a: "Yes. Your XP, streak and dashboard are shared across every course, so a Python chapter and a Spanish chapter count toward the same progress.",
  },
  {
    q: "Can my team build and assign our own chapters?",
    a: "Team and Pro plans include the chapter builder, so you can turn internal docs, SOPs or a syllabus into gamified chapters and assign them directly to your team or class.",
  },
  {
    q: "What happens to my streak and XP if I switch plans?",
    a: "Nothing — your streak, XP and completed chapters stay attached to your account regardless of plan changes, upgrades or downgrades.",
  },
  {
    q: "Is there a free plan, and what's included?",
    a: "Starter is free permanently and includes six courses, one active learning path and community leaderboard access, so you can try the core loop before upgrading.",
  },
];

const FOOTER_LINKS = {
  Product: ["Features", "Courses", "Pricing", "Watch demo"],
  Company: ["About", "Careers", "Blog", "Contact"],
  Resources: ["FAQ", "Documentation", "Community", "Support"],
  Legal: ["Privacy policy", "Terms of service", "Security"],
};

const DEMO_CODE_LINES = [
  "function nextLevel(xp) {",
  "  const thresholds = [0, 100, 250, 500, 900, 1400];",
  "  return thresholds.filter((t) => xp >= t).length;",
  "}",
  "",
  'const learner = { name: "Alex", xp: 620 };',
  "const level = nextLevel(learner.xp);",
  "",
  "console.log(`Level ${level} reached`);",
  "console.log(`${900 - learner.xp} XP to next level`);",
];
const DEMO_CODE = DEMO_CODE_LINES.join("\n");

const DEMO_OUTPUT_LINES = [
  "> Level 4 reached",
  "> 280 XP to next level",
  '> Achievement unlocked: "Consistent Learner"',
];

/* =========================================================================
   HOOKS  ->  src/hooks/*.js
   ========================================================================= */

function useTheme() {
  const [theme, setTheme] = useState("dark");
  const toggleTheme = useCallback(
    () => setTheme((t) => (t === "dark" ? "light" : "dark")),
    []
  );
  return { theme, toggleTheme };
}

function useScrollPosition(threshold = 400) {
  const [pastThreshold, setPastThreshold] = useState(false);
  useEffect(() => {
    const onScroll = () => setPastThreshold(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);
  return pastThreshold;
}

/* =========================================================================
   UI PRIMITIVES  ->  src/components/ui/*.jsx
   ========================================================================= */

function Container({ className = "", children }) {
  return (
    <div className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  );
}

function Button({
  as: Comp = "button",
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-200 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] disabled:opacity-50 disabled:pointer-events-none";
  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-5 py-2.5 text-sm",
    lg: "px-7 py-3.5 text-base",
  };
  const variants = {
    primary:
      "bg-[var(--accent)] text-[#151004] hover:bg-[var(--accent-hover)] hover:-translate-y-0.5 hover:shadow-[0_10px_30px_-10px_var(--accent)] active:translate-y-0",
    secondary:
      "bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border-strong)] hover:border-[var(--accent)] hover:-translate-y-0.5",
    ghost:
      "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]",
  };
  return (
    <Comp
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </Comp>
  );
}

function SectionIntro({ title, description, center = false, className = "" }) {
  return (
    <div
      className={`reveal-on-scroll max-w-2xl ${
        center ? "mx-auto text-center" : ""
      } ${className}`}
    >
      <h2
        className="text-3xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-4xl"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {title}
      </h2>
      {description ? (
        <p className="mt-4 text-base leading-relaxed text-[var(--text-secondary)]">
          {description}
        </p>
      ) : null}
    </div>
  );
}

function IconBadge({ icon: Icon, tone = "accent" }) {
  const toneClass =
    tone === "accent"
      ? "bg-[var(--accent-soft)] text-[var(--accent)]"
      : "bg-[var(--accent-2-soft)] text-[var(--accent-2)]";
  return (
    <span
      className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${toneClass}`}
    >
      <Icon className="h-5 w-5" strokeWidth={1.75} />
    </span>
  );
}

/* =========================================================================
   GLOBAL STYLES & THEME TOKENS  ->  src/components/layout/GlobalStyles.jsx
   (in a segregated project, move the :root / .light-mode tokens into your
   index.css instead of an injected <style> tag)
   ========================================================================= */

function GlobalStyles() {
  useEffect(() => {
    if (document.getElementById("nova-fonts")) return;
    const link = document.createElement("link");
    link.id = "nova-fonts";
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap";
    document.head.appendChild(link);
  }, []);

  return (
    <style>{`
      :root {
        --font-display: "Space Grotesk", ui-sans-serif, system-ui, sans-serif;
        --font-body: "Inter", ui-sans-serif, system-ui, sans-serif;
        --bg: #0A0D14;
        --bg-elevated: #10141D;
        --surface: #141925;
        --surface-hover: #1A2030;
        --border: #232A38;
        --border-strong: #2E3646;
        --text-primary: #EEF1F7;
        --text-secondary: #9AA3B8;
        --text-muted: #6B7386;
        --accent: #F5A623;
        --accent-hover: #FFB84D;
        --accent-soft: rgba(245,166,35,0.12);
        --accent-2: #4CC9F0;
        --accent-2-soft: rgba(76,201,240,0.12);
      }
      .light-mode {
        --bg: #FAFAF9;
        --bg-elevated: #FFFFFF;
        --surface: #FFFFFF;
        --surface-hover: #F3F4F6;
        --border: #E7E5E1;
        --border-strong: #D8D5CE;
        --text-primary: #14171F;
        --text-secondary: #4B5566;
        --text-muted: #7C8598;
        --accent: #C7740A;
        --accent-hover: #AD6608;
        --accent-soft: rgba(199,116,10,0.10);
        --accent-2: #0891B2;
        --accent-2-soft: rgba(8,145,178,0.10);
      }
      html { scroll-behavior: smooth; }
      body { font-family: var(--font-body); }
      section[id] { scroll-margin-top: 88px; }
      .marquee-track { animation: nova-marquee 42s linear infinite; }
      .marquee-mask:hover .marquee-track { animation-play-state: paused; }
      @keyframes nova-marquee {
        from { transform: translateX(0); }
        to { transform: translateX(-50%); }
      }
      .marquee-mask {
        -webkit-mask-image: linear-gradient(to right, transparent, black 8%, black 92%, transparent);
        mask-image: linear-gradient(to right, transparent, black 8%, black 92%, transparent);
      }
      @media (prefers-reduced-motion: reduce) {
        html { scroll-behavior: auto; }
        .marquee-track { animation: none; }
      }
    `}</style>
  );
}

/* =========================================================================
   LAYOUT  ->  src/components/layout/*.jsx
   ========================================================================= */

function Navbar({ theme, toggleTheme, mobileOpen, setMobileOpen }) {
  const closeMobile = () => setMobileOpen(false);

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--bg)]/80 backdrop-blur-md">
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8"
        aria-label="Primary"
      >
        <a
          href="#top"
          className="flex items-center gap-2 text-lg font-semibold tracking-tight text-[var(--text-primary)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent)] text-[#151004]">
            <Sparkles className="h-4 w-4" strokeWidth={2} />
          </span>
          NOVA
        </a>

        <ul className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-3 md:flex">
          <button
            onClick={toggleTheme}
            aria-label={
              theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
            }
            className="rounded-full p-2 text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </button>
          <a
            href="#pricing"
            className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            Log in
          </a>
          <Button as="a" href="#pricing" size="md">
            Start free
          </Button>
        </div>

        <button
          className="rounded-lg p-2 text-[var(--text-primary)] md:hidden"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((o) => !o)}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {mobileOpen && (
        <div className="border-t border-[var(--border)] bg-[var(--bg)] px-4 pb-6 pt-2 md:hidden">
          <ul className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={closeMobile}
                  className="block rounded-lg px-3 py-3 text-base text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex items-center justify-between border-t border-[var(--border)] pt-4">
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-[var(--text-secondary)]"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
              Switch theme
            </button>
            <a
              href="#pricing"
              onClick={closeMobile}
              className="text-sm font-medium text-[var(--text-secondary)]"
            >
              Log in
            </a>
          </div>
          <Button as="a" href="#pricing" onClick={closeMobile} className="mt-4 w-full">
            Start free
          </Button>
        </div>
      )}
    </header>
  );
}

function Footer() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");

  const handleSubmit = (e) => {
    e.preventDefault();
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    if (!isValid) {
      setStatus("error");
      return;
    }
    setStatus("success");
    setEmail("");
  };

  return (
    <footer className="border-t border-[var(--border)] bg-[var(--bg-elevated)]">
      <Container className="py-16">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_2fr]">
          <div>
            <a
              href="#top"
              className="flex items-center gap-2 text-lg font-semibold text-[var(--text-primary)]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent)] text-[#151004]">
                <Sparkles className="h-4 w-4" />
              </span>
              NOVA
            </a>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-[var(--text-secondary)]">
              Gamified, AI-supervised courses for tech skills and languages.
            </p>
            <form onSubmit={handleSubmit} className="mt-6 max-w-xs" noValidate>
              <label
                htmlFor="newsletter-email"
                className="text-sm font-medium text-[var(--text-primary)]"
              >
                Get product updates
              </label>
              <div className="mt-2 flex gap-2">
                <input
                  id="newsletter-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (status !== "idle") setStatus("idle");
                  }}
                  placeholder="you@email.com"
                  className="w-full min-w-0 rounded-lg border border-[var(--border-strong)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
                />
                <Button type="submit" size="sm" className="shrink-0">
                  Join
                </Button>
              </div>
              <p className="mt-2 min-h-[1rem] text-xs" role="status">
                {status === "error" && (
                  <span className="text-[#F87171]">
                    Enter a valid email address.
                  </span>
                )}
                {status === "success" && (
                  <span className="text-[var(--accent-2)]">
                    You're subscribed — welcome aboard.
                  </span>
                )}
              </p>
            </form>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {Object.entries(FOOTER_LINKS).map(([column, links]) => (
              <div key={column}>
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                  {column}
                </h3>
                <ul className="mt-4 space-y-3">
                  {links.map((l) => (
                    <li key={l}>
                      <a
                        href="#top"
                        className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                      >
                        {l}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-[var(--border)] pt-8 sm:flex-row">
          <p className="text-xs text-[var(--text-muted)]">
            © {new Date().getFullYear()} NOVA Labs, Inc. All rights reserved.
          </p>
          <p className="text-xs text-[var(--text-muted)]">
            Made for learners who like finishing what they start.
          </p>
        </div>
      </Container>
    </footer>
  );
}

function BackToTop() {
  const visible = useScrollPosition(480);
  return (
    <button
      aria-label="Back to top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={`fixed bottom-6 right-6 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border-strong)] bg-[var(--surface)] text-[var(--text-secondary)] shadow-lg transition-all duration-300 hover:border-[var(--accent)] hover:text-[var(--text-primary)] ${
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-4 opacity-0"
      }`}
    >
      <ArrowUp className="h-4 w-4" />
    </button>
  );
}

function DemoModal({ open, onClose }) {
  const closeBtnRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    closeBtnRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="demo-modal-title"
        className="w-full max-w-2xl rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-2xl sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2
            id="demo-modal-title"
            className="text-lg font-semibold text-[var(--text-primary)]"
          >
            See NOVA in action
          </h2>
          <button
            ref={closeBtnRef}
            onClick={onClose}
            aria-label="Close demo"
            className="rounded-full p-2 text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-6 flex aspect-video items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)]">
          <div className="text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--accent)] text-[#151004]">
              <Play className="h-6 w-6" fill="currentColor" />
            </span>
            <p className="mt-4 text-sm text-[var(--text-muted)]">
              Full walkthrough video — coming soon
            </p>
          </div>
        </div>
        <p className="mt-6 text-sm leading-relaxed text-[var(--text-secondary)]">
          In the meantime, start a free chapter and see the AI mentor and XP
          system for yourself — no credit card needed.
        </p>
        <Button as="a" href="#pricing" onClick={onClose} className="mt-6 w-full">
          Start learning free
        </Button>
      </div>
    </div>
  );
}

/* =========================================================================
   SECTIONS  ->  src/components/sections/*.jsx
   ========================================================================= */

function HeroCodePanel() {
  const [lines, setLines] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const timeoutsRef = useRef([]);

  useEffect(() => {
    return () => timeoutsRef.current.forEach(clearTimeout);
  }, []);

  const handleRun = () => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    setLines([]);
    setIsRunning(true);
    DEMO_OUTPUT_LINES.forEach((line, i) => {
      const t = setTimeout(() => {
        setLines((prev) => [...prev, line]);
        if (i === DEMO_OUTPUT_LINES.length - 1) setIsRunning(false);
      }, (i + 1) * 450);
      timeoutsRef.current.push(t);
    });
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl shadow-black/40">
      <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#F87171]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#FBBF24]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#4ADE80]" />
          <span className="ml-3 font-mono text-xs text-[var(--text-muted)]">
            level-up.js
          </span>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={handleRun}
          disabled={isRunning}
          aria-label="Run code example"
        >
          <Play className="h-3.5 w-3.5" />
          {isRunning ? "Running…" : "Run"}
        </Button>
      </div>
      <pre className="overflow-x-auto px-5 py-4 font-mono text-[13px] leading-relaxed text-[var(--text-secondary)]">
        <code>{DEMO_CODE}</code>
      </pre>
      <div className="min-h-[110px] border-t border-[var(--border)] bg-[var(--bg-elevated)] px-5 py-4 font-mono text-[13px]">
        {lines.length === 0 && !isRunning ? (
          <p className="text-[var(--text-muted)]">// output will appear here</p>
        ) : null}
        {lines.map((line, i) => (
          <p key={i} className="text-[var(--accent-2)]">
            {line}
          </p>
        ))}
      </div>
    </div>
  );
}

function Hero({ onOpenDemo }) {
  const heroRef = useRef(null);

  useLayoutEffect(() => {
    let ctx;
    try {
      ctx = gsap.context(() => {
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
        tl.from(".hero-badge", { opacity: 0, y: 14, duration: 0.5 })
          .from(".hero-heading", { opacity: 0, y: 26, duration: 0.7 }, "-=0.25")
          .from(".hero-subtext", { opacity: 0, y: 16, duration: 0.6 }, "-=0.4")
          .from(".hero-ctas", { opacity: 0, y: 14, duration: 0.5 }, "-=0.35")
          .from(".hero-stats", { opacity: 0, y: 14, duration: 0.5 }, "-=0.3")
          .from(
            ".hero-codepanel",
            { opacity: 0, y: 26, scale: 0.98, duration: 0.7 },
            "-=0.6"
          );
      }, heroRef);
    } catch (e) {
      /* animation skipped, content remains visible */
    }
    return () => ctx && ctx.revert();
  }, []);

  return (
    <section id="top" ref={heroRef} className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 [background:radial-gradient(60%_50%_at_80%_0%,var(--accent-soft),transparent_60%)]"
      />
      <Container className="relative grid gap-14 pb-20 pt-16 sm:pb-28 sm:pt-20 lg:grid-cols-2 lg:items-center lg:pt-28">
        <div>
          <span className="hero-badge inline-flex items-center gap-2 rounded-full border border-[var(--border-strong)] bg-[var(--surface)] px-4 py-1.5 text-xs font-medium text-[var(--text-secondary)]">
            <Sparkles className="h-3.5 w-3.5 text-[var(--accent)]" />
            Now generating full chapters from a single prompt
          </span>
          <h1
            className="hero-heading mt-6 text-4xl font-semibold leading-[1.1] tracking-tight text-[var(--text-primary)] sm:text-5xl lg:text-[3.4rem]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Your next skill, gamified and AI-coached.
          </h1>
          <p className="hero-subtext mt-6 max-w-lg text-lg leading-relaxed text-[var(--text-secondary)]">
            NOVA turns tech and language courses into levels, streaks and
            real-time feedback — with an AI mentor watching your progress
            every step of the way.
          </p>
          <div className="hero-ctas mt-8 flex flex-col gap-3 sm:flex-row">
            <Button as="a" href="#pricing" size="lg">
              Start learning free <ArrowRight className="h-4 w-4" />
            </Button>
            <Button variant="secondary" size="lg" onClick={onOpenDemo}>
              Watch demo
            </Button>
          </div>
          <dl className="hero-stats mt-10 grid max-w-md grid-cols-3 gap-6 border-t border-[var(--border)] pt-6">
            <div>
              <dt className="text-xs text-[var(--text-muted)]">Learners</dt>
              <dd className="mt-1 text-xl font-semibold text-[var(--text-primary)]">
                240K+
              </dd>
            </div>
            <div>
              <dt className="text-xs text-[var(--text-muted)]">Chapters</dt>
              <dd className="mt-1 text-xl font-semibold text-[var(--text-primary)]">
                1,200+
              </dd>
            </div>
            <div>
              <dt className="text-xs text-[var(--text-muted)]">Completion</dt>
              <dd className="mt-1 text-xl font-semibold text-[var(--text-primary)]">
                94%
              </dd>
            </div>
          </dl>
        </div>
        <div className="hero-codepanel">
          <HeroCodePanel />
        </div>
      </Container>
    </section>
  );
}

function TrustedBy() {
  const companies = [...TRUSTED_COMPANIES, ...TRUSTED_COMPANIES];
  return (
    <section className="border-y border-[var(--border)] bg-[var(--bg-elevated)] py-10">
      <Container>
        <p className="reveal-on-scroll text-center text-sm text-[var(--text-muted)]">
          Trusted by learning and L&amp;D teams at
        </p>
        <div className="marquee-mask relative mt-6 overflow-hidden">
          <div className="marquee-track flex w-max items-center gap-14">
            {companies.map((name, i) => (
              <span
                key={`${name}-${i}`}
                className="whitespace-nowrap text-lg font-semibold tracking-tight text-[var(--text-muted)] opacity-70 transition-opacity hover:opacity-100"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

function Features() {
  return (
    <section id="features" className="py-24">
      <Container>
        <SectionIntro
          title="Everything a course needs to actually stick."
          description="NOVA combines an AI mentor, game mechanics and real course-building tools into one platform — for individuals, teams and schools alike."
        />
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className={`reveal-on-scroll group rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-7 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--accent)]/40 hover:shadow-xl hover:shadow-black/20 ${
                i === 0 ? "sm:col-span-2 lg:col-span-1" : ""
              }`}
            >
              <IconBadge icon={f.icon} tone={i % 2 === 0 ? "accent" : "accent2"} />
              <h3 className="mt-5 text-lg font-semibold text-[var(--text-primary)]">
                {f.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

function Courses() {
  return (
    <section
      id="courses"
      className="border-y border-[var(--border)] bg-[var(--bg-elevated)] py-24"
    >
      <Container>
        <div className="reveal-on-scroll flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div className="max-w-xl">
            <h2
              className="text-3xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-4xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              High-demand courses, ready when you are.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-[var(--text-secondary)]">
              From data science to conversational Spanish, every course is
              broken into gamified chapters your AI mentor can guide you
              through.
            </p>
          </div>
          <a
            href="#pricing"
            className="hidden shrink-0 items-center gap-1 text-sm font-medium text-[var(--accent)] hover:underline sm:flex"
          >
            View all courses <ArrowRight className="h-4 w-4" />
          </a>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {COURSES.map((c) => (
            <article
              key={c.title}
              className="reveal-on-scroll group overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] transition-all duration-300 hover:-translate-y-1 hover:border-[var(--border-strong)]"
            >
              <div
                className={`flex h-28 items-center justify-center ${
                  c.tone === "accent"
                    ? "bg-[var(--accent-soft)]"
                    : "bg-[var(--accent-2-soft)]"
                }`}
              >
                <c.icon
                  className={`h-9 w-9 ${
                    c.tone === "accent"
                      ? "text-[var(--accent)]"
                      : "text-[var(--accent-2)]"
                  }`}
                  strokeWidth={1.5}
                />
              </div>
              <div className="p-6">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-[var(--accent-soft)] px-2.5 py-1 text-[11px] font-medium text-[var(--accent)]">
                    {c.category}
                  </span>
                  <span className="rounded-full bg-[var(--surface-hover)] px-2.5 py-1 text-[11px] text-[var(--text-muted)]">
                    {c.level}
                  </span>
                </div>
                <h3 className="mt-3 text-base font-semibold text-[var(--text-primary)]">
                  {c.title}
                </h3>
                <div className="mt-4 flex items-center justify-between text-xs text-[var(--text-muted)]">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {c.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {c.learners}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}

function About() {
  const progressRows = [
    { name: "Python Fundamentals", pct: 82 },
    { name: "Conversational Spanish", pct: 64 },
    { name: "React & Component Design", pct: 41 },
  ];
  return (
    <section id="about" className="py-24">
      <Container>
        <div className="grid gap-14 lg:grid-cols-2 lg:items-center">
          <div className="reveal-on-scroll">
            <h2
              className="text-3xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-4xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Built for people who quit courses halfway through.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[var(--text-secondary)]">
              Most learners don't fail because the material is too hard —
              they fail because nothing tells them they're making progress.
              NOVA pairs genuine AI feedback with the same reward loops that
              make games hard to put down, so people keep going.
            </p>
            <p className="mt-4 text-base leading-relaxed text-[var(--text-secondary)]">
              Today, individuals, bootcamps and internal L&amp;D teams use
              NOVA to turn static course content into chapters that track
              mastery automatically — no manual grading required.
            </p>
            <div className="mt-8 flex flex-wrap gap-8">
              <div>
                <p className="text-2xl font-semibold text-[var(--text-primary)]">
                  2021
                </p>
                <p className="text-sm text-[var(--text-muted)]">Founded</p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-[var(--text-primary)]">
                  35
                </p>
                <p className="text-sm text-[var(--text-muted)]">
                  Countries reached
                </p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-[var(--text-primary)]">
                  120+
                </p>
                <p className="text-sm text-[var(--text-muted)]">
                  Team members
                </p>
              </div>
            </div>
          </div>
          <div className="reveal-on-scroll rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text-muted)]">
                  Today's streak
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-2xl font-semibold text-[var(--text-primary)]">
                  <Flame className="h-5 w-5 text-[var(--accent)]" />
                  18 days
                </p>
              </div>
              <span className="rounded-full bg-[var(--accent-2-soft)] px-3 py-1 text-xs font-medium text-[var(--accent-2)]">
                Level 7
              </span>
            </div>
            <div className="mt-6 space-y-4">
              {progressRows.map((row) => (
                <div key={row.name}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--text-secondary)]">
                      {row.name}
                    </span>
                    <span className="text-[var(--text-muted)]">{row.pct}%</span>
                  </div>
                  <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-[var(--surface-hover)]">
                    <div
                      className="h-full rounded-full bg-[var(--accent)]"
                      style={{ width: `${row.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="border-y border-[var(--border)] bg-[var(--bg-elevated)] py-24"
    >
      <Container>
        <SectionIntro
          title="How NOVA works"
          description="Four steps between 'I want to learn this' and your first certificate."
        />
        <ol className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <li key={s.title} className="reveal-on-scroll relative">
              <span
                className="text-4xl font-semibold text-[var(--accent)]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-4 text-base font-semibold text-[var(--text-primary)]">
                {s.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
                {s.desc}
              </p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}

function Statistics() {
  const sectionRef = useRef(null);

  useEffect(() => {
    let ctx;
    try {
      ctx = gsap.context(() => {
        const counters = gsap.utils.toArray(".stat-counter");
        counters.forEach((el) => {
          const target = Number(el.getAttribute("data-value"));
          const proxy = { val: 0 };
          ScrollTrigger.create({
            trigger: el,
            start: "top 88%",
            once: true,
            onEnter: () =>
              gsap.to(proxy, {
                val: target,
                duration: 1.6,
                ease: "power2.out",
                onUpdate: () => {
                  el.textContent = Math.round(proxy.val).toLocaleString();
                },
              }),
          });
        });
      }, sectionRef);
    } catch (e) {
      /* counters remain static at 0 if GSAP/ScrollTrigger is unavailable */
    }
    return () => ctx && ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-24">
      <Container>
        <div className="grid gap-10 rounded-3xl border border-[var(--border)] bg-[var(--surface)] px-8 py-14 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="reveal-on-scroll text-center">
              <p
                className="text-4xl font-semibold text-[var(--text-primary)]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                <span className="stat-counter" data-value={s.value}>
                  0
                </span>
                {s.suffix}
              </p>
              <p className="mt-2 text-sm text-[var(--text-muted)]">{s.label}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

function Solutions() {
  return (
    <section
      id="solutions"
      className="border-y border-[var(--border)] bg-[var(--bg-elevated)] py-24"
    >
      <Container>
        <SectionIntro
          title="One platform, three ways to use it"
          description="Whether you're learning solo, rolling out training to a team, or teaching a class, NOVA adapts to how the work actually happens."
        />
        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {SOLUTIONS.map((sol) => (
            <div
              key={sol.title}
              className="reveal-on-scroll rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8"
            >
              <span className="text-xs font-medium text-[var(--accent)]">
                {sol.audience}
              </span>
              <h3 className="mt-2 text-lg font-semibold text-[var(--text-primary)]">
                {sol.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
                {sol.desc}
              </p>
              <ul className="mt-5 space-y-2.5">
                {sol.points.map((p) => (
                  <li
                    key={p}
                    className="flex items-start gap-2 text-sm text-[var(--text-secondary)]"
                  >
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent-2)]" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

function Testimonials() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = TESTIMONIALS.length;

  useEffect(() => {
    if (paused) return undefined;
    const id = setInterval(() => setIndex((i) => (i + 1) % count), 6000);
    return () => clearInterval(id);
  }, [paused, count]);

  const goTo = (i) => setIndex(((i % count) + count) % count);
  const active = TESTIMONIALS[index];

  return (
    <section id="testimonials" className="py-24">
      <Container>
        <SectionIntro
          title="Learners and teams building real streaks"
          center
          className="mx-auto"
        />
        <div
          className="reveal-on-scroll relative mx-auto mt-14 max-w-3xl"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-8 py-12 text-center sm:px-14">
            <Star className="mx-auto h-6 w-6 text-[var(--accent)]" fill="currentColor" />
            <p
              key={index}
              className="mt-6 text-xl font-medium leading-relaxed text-[var(--text-primary)]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              "{active.quote}"
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--accent-soft)] text-sm font-semibold text-[var(--accent)]">
                {active.initials}
              </span>
              <div className="text-left">
                <p className="text-sm font-medium text-[var(--text-primary)]">
                  {active.name}
                </p>
                <p className="text-xs text-[var(--text-muted)]">{active.role}</p>
              </div>
            </div>
          </div>
          <button
            aria-label="Previous testimonial"
            onClick={() => goTo(index - 1)}
            className="absolute left-0 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 rounded-full border border-[var(--border-strong)] bg-[var(--surface)] p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] sm:flex"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            aria-label="Next testimonial"
            onClick={() => goTo(index + 1)}
            className="absolute right-0 top-1/2 hidden -translate-y-1/2 translate-x-1/2 rounded-full border border-[var(--border-strong)] bg-[var(--surface)] p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] sm:flex"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <div className="mt-6 flex justify-center gap-2">
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                aria-label={`Go to testimonial ${i + 1}`}
                onClick={() => goTo(i)}
                className={`h-2 rounded-full transition-all ${
                  i === index
                    ? "w-6 bg-[var(--accent)]"
                    : "w-2 bg-[var(--border-strong)]"
                }`}
              />
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

function Pricing() {
  const [annual, setAnnual] = useState(false);
  return (
    <section
      id="pricing"
      className="border-y border-[var(--border)] bg-[var(--bg-elevated)] py-24"
    >
      <Container>
        <SectionIntro
          title="Simple pricing that grows with you"
          description="Start free. Upgrade when the AI mentor becomes part of your routine."
          center
          className="mx-auto"
        />
        <div className="reveal-on-scroll mt-8 flex justify-center">
          <div className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--surface)] p-1.5">
            <button
              onClick={() => setAnnual(false)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                !annual
                  ? "bg-[var(--accent)] text-[#151004]"
                  : "text-[var(--text-secondary)]"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                annual
                  ? "bg-[var(--accent)] text-[#151004]"
                  : "text-[var(--text-secondary)]"
              }`}
            >
              Annual <span className="opacity-75">− 20%</span>
            </button>
          </div>
        </div>
        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {PRICING_PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`reveal-on-scroll relative rounded-2xl border p-8 ${
                plan.highlighted
                  ? "border-[var(--accent)] bg-[var(--surface)] shadow-2xl shadow-black/30 lg:-translate-y-3"
                  : "border-[var(--border)] bg-[var(--surface)]"
              }`}
            >
              {plan.highlighted ? (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[var(--accent)] px-3 py-1 text-xs font-semibold text-[#151004]">
                  Most popular
                </span>
              ) : null}
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                {plan.name}
              </h3>
              <p className="mt-1 text-sm text-[var(--text-muted)]">
                {plan.tagline}
              </p>
              <p className="mt-6 flex items-baseline gap-1">
                <span
                  className="text-4xl font-semibold text-[var(--text-primary)]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  ${annual ? plan.annual : plan.monthly}
                </span>
                <span className="text-sm text-[var(--text-muted)]">
                  {plan.monthly === 0 ? "" : "/mo"}
                </span>
              </p>
              <Button
                as="a"
                href="#faq"
                variant={plan.highlighted ? "primary" : "secondary"}
                className="mt-6 w-full"
              >
                {plan.cta}
              </Button>
              <ul className="mt-8 space-y-3">
                {plan.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-2 text-sm text-[var(--text-secondary)]"
                  >
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent-2)]" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);
  return (
    <section id="faq" className="py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <SectionIntro title="Questions, answered" center className="mx-auto" />
        <div className="mt-12 divide-y divide-[var(--border)] border-y border-[var(--border)]">
          {FAQS.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <div key={item.q} className="reveal-on-scroll">
                <button
                  className="flex w-full items-center justify-between gap-4 py-5 text-left"
                  aria-expanded={isOpen}
                  onClick={() => setOpenIndex(isOpen ? -1 : i)}
                >
                  <span className="text-base font-medium text-[var(--text-primary)]">
                    {item.q}
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-[var(--text-muted)] transition-transform duration-300 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <div
                  className={`grid overflow-hidden transition-all duration-300 ease-out ${
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="pb-5 text-sm leading-relaxed text-[var(--text-secondary)]">
                      {item.a}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function FinalCTA({ onOpenDemo }) {
  return (
    <section className="py-24">
      <Container>
        <div className="reveal-on-scroll relative overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] px-8 py-16 text-center sm:px-16">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 [background:radial-gradient(50%_60%_at_50%_0%,var(--accent-soft),transparent_65%)]"
          />
          <div className="relative">
            <h2
              className="text-3xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-4xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Start your first chapter today
            </h2>
            <p className="mx-auto mt-4 max-w-md text-base text-[var(--text-secondary)]">
              No credit card required. Cancel anytime — your streak stays
              yours either way.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button as="a" href="#pricing" size="lg">
                Start learning free <ArrowRight className="h-4 w-4" />
              </Button>
              <Button variant="secondary" size="lg" onClick={onOpenDemo}>
                Watch demo
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

/* =========================================================================
   APP  ->  src/App.jsx
   ========================================================================= */

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);

  useEffect(() => {
    let ctx;
    try {
      ctx = gsap.context(() => {
        const items = gsap.utils.toArray(".reveal-on-scroll");
        items.forEach((el) => {
          gsap.fromTo(
            el,
            { opacity: 0, y: 28 },
            {
              opacity: 1,
              y: 0,
              duration: 0.7,
              ease: "power2.out",
              scrollTrigger: { trigger: el, start: "top 85%", once: true },
            }
          );
        });
      });
    } catch (e) {
      /* sections remain fully visible without scroll-reveal motion */
    }
    return () => ctx && ctx.revert();
  }, []);

  return (
    <div
      className={`min-h-screen overflow-x-hidden bg-[var(--bg)] text-[var(--text-primary)] antialiased ${
        theme === "light" ? "light-mode" : ""
      }`}
      style={{ fontFamily: "var(--font-body)" }}
    >
      <GlobalStyles />
      <Navbar
        theme={theme}
        toggleTheme={toggleTheme}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />
      <main>
        <Hero onOpenDemo={() => setDemoOpen(true)} />
        <TrustedBy />
        <Features />
        <Courses />
        <About />
        <HowItWorks />
        <Statistics />
        <Solutions />
        <Testimonials />
        <Pricing />
        <FAQ />
        <FinalCTA onOpenDemo={() => setDemoOpen(true)} />
      </main>
      <Footer />
      <BackToTop />
      <DemoModal open={demoOpen} onClose={() => setDemoOpen(false)} />
    </div>
  );
}