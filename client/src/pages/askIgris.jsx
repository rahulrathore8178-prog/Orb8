import {
    useState,
    useRef,
    useEffect,
    useLayoutEffect,
    useCallback,
    useMemo,
} from "react";
import {
    Paperclip, Image as ImageIcon, FileText, X, ArrowUp, Copy, Check,
    Image,
    Menu,
    Search,
    MessageSquare,
} from "lucide-react";
import { apiUrl, getAuthHeaders } from "../utilites/DashboardHelper";
import gsap from "gsap";
import axios from "axios";
import { getStoredUser } from "../utilites/communityHelper";

// ---------------------------------------------------------------------
// Rotating headline. Add/remove lines freely — one is picked at random
// each time the component mounts (i.e. every reload/new load).
// ---------------------------------------------------------------------
const GREETINGS = [
    "What's on your mind?",
    "What can I help with?",
    "Where should we start?",
    "What are we figuring out today?",
    "Ready when you are.",
    "What's the plan?",
    "What are we working on?",
    "How can I help today?",
    "What's up?",
    "Let's get into it.",
    "What do you need?",
    "Something on your mind?",
    "What are we building today?",
    "How can I be useful?",
    "What's the task?",
    "Where do we begin?",
];

function getRandomGreeting() {
    return GREETINGS[Math.floor(Math.random() * GREETINGS.length)];
}

const MAX_TEXTAREA_HEIGHT = 200;
export const API_URL = `${import.meta.env.VITE_PYTHON_API_URL || "http://localhost:8000"}`;

const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

// Respect the user's OS-level motion preference for the hand-rolled GSAP
// entrances below (CSS already has its own reduced-motion block).
// const prefersReducedMotion = () =>
//     typeof window !== "undefined" &&
//     window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

// ---------------------------------------------------------------------
// Small shared style tokens so the panels/pills stay visually consistent
// without repeating long class strings everywhere.
// ---------------------------------------------------------------------
const PANEL = "bg-[#131316] border border-white/[0.08]";
const SUBTLE_PANEL = "bg-white/[0.04] border border-white/[0.08]";

// ---------------------------------------------------------------------
// Reusable round icon button — used for the hamburger, attach clip,
// close buttons, etc. so every tappable icon in the UI behaves & feels
// the same.
// ---------------------------------------------------------------------
function IconButton({ label, children, className = "", ...props }) {
    return (
        <button
            type="button"
            aria-label={label}
            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.06] transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}

// ---------------------------------------------------------------------
// Igris mark — an abstract, monochrome glyph standing in for the brand
// face. Self-contained and reusable (drop it anywhere), with a soft
// pulse so it feels alive without being busy. Swap the paths out later
// for the final artwork.
// ---------------------------------------------------------------------
function IgrisMark({ className = "", size, powerOnDelay = 900, onPowerOn }) {
    const rootRef = useRef(null);
    const sphereRef = useRef(null);
    const frameRef = useRef(null);
    const particlesRef = useRef(null);
    const eyesRef = useRef(null);
    const eyeGlowRef = useRef(null);

    const particles = useMemo(() => generateParticles(), []);

    useLayoutEffect(() => {
        const reduced = prefersReducedMotion();

        const ctx = gsap.context(() => {
            if (reduced) {
                gsap.set(
                    [sphereRef.current, frameRef.current, particlesRef.current, eyesRef.current, eyeGlowRef.current],
                    { opacity: 1 }
                );
                gsap.set(eyeGlowRef.current, { scale: 1 });
                onPowerOn?.();
                return;
            }

            gsap.set(sphereRef.current, { opacity: 0 });
            gsap.set(frameRef.current, { opacity: 0 });
            gsap.set(particlesRef.current, { opacity: 0 });
            gsap.set(eyesRef.current, { opacity: 0 });
            gsap.set(eyeGlowRef.current, { opacity: 0, scale: 0.5, transformOrigin: "50% 50%" });

            const tl = gsap.timeline({ delay: powerOnDelay / 1000 });

            // the shell materializes first, dark and mostly still
            tl.to(sphereRef.current, { opacity: 1, duration: 1.3, ease: "sine.out" }, 0)
                .to(particlesRef.current, { opacity: 1, duration: 1.6, ease: "sine.out" }, 0.15)
                .to(frameRef.current, { opacity: 1, duration: 1.0, ease: "sine.out" }, 0.35)
                // power-on flicker, then the eyes hold steady white
                .to(eyesRef.current, { opacity: 1, duration: 0.05 }, 1.1)
                .to(eyesRef.current, { opacity: 0.1, duration: 0.06 }, 1.2)
                .to(eyesRef.current, { opacity: 1, duration: 0.07 }, 1.32)
                .to(eyesRef.current, { opacity: 0.25, duration: 0.05 }, 1.45)
                .to(eyesRef.current, { opacity: 1, duration: 0.4, ease: "sine.out" }, 1.55)
                .to(eyeGlowRef.current, { opacity: 1, scale: 1, duration: 0.7, ease: "sine.out" }, 1.55)
                .call(() => onPowerOn?.(), [], 1.6)
                // idle loops, chained in only after ignition finishes
                .to(
                    rootRef.current,
                    { scale: 1.015, duration: 3.6, ease: "sine.inOut", repeat: -1, yoyo: true, transformOrigin: "50% 50%" },
                    1.9
                )
                .to(eyesRef.current, { opacity: 0.55, duration: 2.2, ease: "sine.inOut", repeat: -1, yoyo: true }, 1.9)
                .to(eyeGlowRef.current, { opacity: 0.55, duration: 2.2, ease: "sine.inOut", repeat: -1, yoyo: true }, 1.9);
        }, rootRef);

        return () => ctx.revert();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const style = size ? { width: size, height: size } : undefined;

    return (
        <div className={`relative flex items-center justify-center select-none ${className}`} style={style}>
            <style>{PARTICLE_STYLES}</style>

            {/* ambient glow, scoped tightly to the mark, never bleeds into the page bg */}
            <div
                className="absolute inset-0 rounded-full pointer-events-none"
                style={{
                    background: "radial-gradient(circle, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0) 65%)",
                    filter: "blur(8px)",
                }}
            />

            <svg ref={rootRef} viewBox="0 0 200 200" className="relative w-full h-full overflow-visible">
                <defs>
                    <radialGradient id="igris-core" cx="50%" cy="48%" r="55%">
                        <stop offset="0%" stopColor="rgba(255,255,255,0.05)" />
                        <stop offset="70%" stopColor="rgba(255,255,255,0.015)" />
                        <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                    </radialGradient>
                    <filter id="igris-soft-blur" x="-60%" y="-60%" width="220%" height="220%">
                        <feGaussianBlur stdDeviation="2.2" />
                    </filter>
                    <filter id="igris-wide-blur" x="-120%" y="-120%" width="340%" height="340%">
                        <feGaussianBlur stdDeviation="7" />
                    </filter>
                    <filter id="igris-rim-blur" x="-30%" y="-30%" width="160%" height="160%">
                        <feGaussianBlur stdDeviation="3" />
                    </filter>
                </defs>

                {/* ---- glass energy sphere ---- */}
                <g ref={sphereRef}>
                    <circle cx="100" cy="100" r="92" fill="url(#igris-core)" />
                    <circle cx="100" cy="100" r="92" fill="none" stroke="rgba(255,255,255,0.16)" strokeWidth="1" />
                    <circle
                        cx="100"
                        cy="100"
                        r="93"
                        fill="none"
                        stroke="rgba(255,255,255,0.28)"
                        strokeWidth="2.5"
                        filter="url(#igris-rim-blur)"
                    />
                    {/* faint refraction arcs */}
                    <path d="M42,52 A98,98 0 0 1 42,148" fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="0.75" />
                    <path d="M158,52 A98,98 0 0 0 158,148" fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="0.75" />
                    {/* cracked-glass energy network reaching toward the rim */}
                    {CRACK_LINES.map((l, i) => (
                        <g key={i}>
                            <line x1={l[0]} y1={l[1]} x2={l[2]} y2={l[3]} stroke="rgba(255,255,255,0.14)" strokeWidth="0.6" />
                            <circle cx={l[2]} cy={l[3]} r="1.1" fill="rgba(255,255,255,0.4)" />
                        </g>
                    ))}
                </g>

                {/* ---- drifting particle field, crown-heavy, thinning toward the jaw ---- */}
                <g ref={particlesRef}>
                    {particles.map((p) => (
                        <circle
                            key={p.id}
                            cx={p.x}
                            cy={p.y}
                            r={p.r}
                            fill="#fff"
                            className={p.drift ? "igris-particle igris-particle-drift" : "igris-particle"}
                            style={{ "--igris-o": p.o, animationDelay: `${p.delay}s`, animationDuration: `${p.dur}s`, opacity: p.o }}
                        />
                    ))}
                </g>

                {/* ---- helmet frame ---- */}
                <g ref={frameRef}>
                    <path
                        d={HELMET_PATH}
                        fill="rgba(10,10,12,0.55)"
                        stroke="rgba(255,255,255,0.34)"
                        strokeWidth="1.4"
                        strokeLinejoin="round"
                    />
                    {/* central ridge blade, broken around the brow accent */}
                    <path d="M100,10 L100,86" stroke="rgba(255,255,255,0.22)" strokeWidth="1" />
                    <path d="M100,110 L100,192" stroke="rgba(255,255,255,0.22)" strokeWidth="1" />
                    <path
                        d="M100,88 L104,94 L100,100 L96,94 Z"
                        fill="rgba(255,255,255,0.12)"
                        stroke="rgba(255,255,255,0.3)"
                        strokeWidth="0.6"
                    />
                    {/* facet seams across the cheek plates */}
                    <path d="M108,34 L140,100" stroke="rgba(255,255,255,0.09)" strokeWidth="0.75" />
                    <path d="M92,34 L60,100" stroke="rgba(255,255,255,0.09)" strokeWidth="0.75" />
                    <path d="M152,78 L122,148" stroke="rgba(255,255,255,0.09)" strokeWidth="0.75" />
                    <path d="M48,78 L78,148" stroke="rgba(255,255,255,0.09)" strokeWidth="0.75" />
                </g>

                {/* ---- eyes: dark until ignition, then bright white with bloom ---- */}
                <ellipse
                    ref={eyeGlowRef}
                    cx="100"
                    cy="98"
                    rx="66"
                    ry="26"
                    fill="rgba(255,255,255,0.35)"
                    filter="url(#igris-wide-blur)"
                />
                <g ref={eyesRef}>
                    <path d={EYE_LEFT} fill="rgba(255,255,255,0.95)" filter="url(#igris-soft-blur)" opacity="0.6" />
                    <path d={EYE_RIGHT} fill="rgba(255,255,255,0.95)" filter="url(#igris-soft-blur)" opacity="0.6" />
                    <path d={EYE_LEFT} fill="#ffffff" />
                    <path d={EYE_RIGHT} fill="#ffffff" />
                </g>
            </svg>
        </div>
    );
}

const HELMET_PATH =
    "M100,10 L108,34 L128,46 L152,78 L140,100 L146,118 L122,148 L110,172 L100,192 " +
    "L90,172 L78,148 L54,118 L60,100 L48,78 L72,46 L92,34 Z";

const EYE_LEFT = "M58,100 L80,93 L94,97 L80,104 Z";
const EYE_RIGHT = "M142,100 L120,93 L106,97 L120,104 Z";

const CRACK_LINES = [
    [152, 78, 178, 68],
    [48, 78, 22, 68],
    [140, 100, 172, 106],
    [60, 100, 28, 106],
    [122, 148, 144, 168],
    [78, 148, 56, 168],
];

function generateParticles(count = 50) {
    // deterministic pseudo-random so the field looks identical on every render
    let seed = 42;
    const rand = () => {
        seed = (seed * 16807) % 2147483647;
        return (seed % 10000) / 10000;
    };

    const particles = [];
    for (let i = 0; i < count; i++) {
        const heightBias = Math.pow(rand(), 2.2); // skews values toward the crown
        const y = 4 + heightBias * 172;
        const spread = 28 + heightBias * 58;
        const x = 100 + (rand() - 0.5) * spread * 2;
        particles.push({
            id: i,
            x,
            y,
            r: 0.35 + rand() * 1.05,
            o: 0.12 + (1 - heightBias) * 0.55,
            delay: rand() * 5,
            dur: 3 + rand() * 3,
            drift: rand() < 0.22 && heightBias < 0.4,
        });
    }
    return particles;
}

function prefersReducedMotion() {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

const PARTICLE_STYLES = `
  .igris-particle { animation: igris-twinkle 4s ease-in-out infinite; }
  .igris-particle-drift { animation: igris-drift 6s ease-in infinite; }
  @keyframes igris-twinkle {
    0%, 100% { opacity: var(--igris-o, 0.3); }
    50% { opacity: calc(var(--igris-o, 0.3) * 0.25); }
  }
  @keyframes igris-drift {
    0% { transform: translateY(0); opacity: 0; }
    12% { opacity: var(--igris-o, 0.4); }
    75% { opacity: var(--igris-o, 0.4); }
    100% { transform: translateY(-16px); opacity: 0; }
  }
  @media (prefers-reduced-motion: reduce) {
    .igris-particle, .igris-particle-drift { animation: none; opacity: var(--igris-o, 0.3); }
  }
`;

// ---------------------------------------------------------------------
// Sidebar — search box + chat list. Purely presentational; animation
// (open/close) is driven by the parent via the refs it's given.
// History stays on the RIGHT, unchanged.
// ---------------------------------------------------------------------
function Sidebar({ sidebarRef, backdropRef, onClose, chats, onSelectChat, newConversation }) {
    const [query, setQuery] = useState("");

    return (
        <>
            {/* backdrop — click to close, also dims the page behind the drawer */}
            <div
                ref={backdropRef}
                onClick={onClose}
                className="fixed inset-0 bg-black/70 z-40"
                style={{ opacity: 0, pointerEvents: "none" }}
            />

            {/* panel */}
            <div
                ref={sidebarRef}
                className="fixed top-0 right-0 h-full w-[280px] max-w-[82vw] bg-[#101012] border-l border-white/[0.08] z-50 flex flex-col will-change-transform"
            >
                {/* header */}
                <div className="flex items-center justify-between px-4 h-14 border-b border-white/[0.08] shrink-0">
                    <span className="text-zinc-200 text-sm font-medium">Chats</span>
                    <IconButton label="Close sidebar" onClick={onClose}>
                        <X className="w-[18px] h-[18px]" />
                    </IconButton>
                </div>

                {/* search history */}
                <div className="px-3 pt-3 shrink-0">
                    <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 focus-within:border-white/20 transition-colors">
                        <Search className="w-4 h-4 text-zinc-500 shrink-0" />
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search history..."
                            className="w-full bg-transparent text-sm text-zinc-200 placeholder-zinc-500 outline-none"
                        />
                    </div>
                    <button
                        className="w-full flex items-center justify-center mt-3 bg-white/[0.06] rounded-2xl gap-2 px-3 py-2.5 text-sm text-zinc-200 hover:bg-white/[0.09] transition-colors"
                        onClick={newConversation}
                    >
                        Start New Conversation
                    </button>
                </div>

                {/* chat list */}
                <div className="flex-1 overflow-y-auto px-2 py-3 flex flex-col gap-0.5">
                    {chats.length > 0 ? (
                        chats.map((chat) => (
                            <button
                                key={chat._id}
                                type="button"
                                onClick={() => onSelectChat?.(chat)}
                                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-sm text-zinc-300 hover:bg-white/[0.05] hover:text-zinc-100 transition-colors"
                            >
                                <MessageSquare className="w-4 h-4 text-zinc-500 shrink-0" />
                                <span className="truncate">{chat.title}</span>
                            </button>
                        ))
                    ) : (
                        <p className="px-3 py-4 text-sm text-zinc-500 text-center">
                            Start a chat by asking a question!
                        </p>
                    )}
                </div>
            </div>
        </>
    );
}

// ---------------------------------------------------------------------
// Composer — the message input pill (attachment chip, textarea, attach
// menu, send button). Pulled out on its own so it's reusable and the
// main component isn't one giant render.
// ---------------------------------------------------------------------
function Composer({
    text,
    setText,
    attachment,
    onRemoveAttachment,
    onKeyDown,
    onSend,
    canSend,
    isLoading,
    formatSize,
    menuOpen,
    setMenuOpen,
    menuRef,
    clipRef,
    textareaRef,
    imageInputRef,
    pdfInputRef,
    onPickFile,
}) {
    return (
        <div className={`w-full ${PANEL} rounded-[26px] shadow-2xl shadow-black/40 px-4 pt-4 pb-3 relative transition-colors duration-200 focus-within:border-white/20`}>
            {/* attached file chip */}
            {attachment && (
                <div className={`mb-3 inline-flex items-center gap-2 ${SUBTLE_PANEL} rounded-2xl pl-2 pr-3 py-2 max-w-full`}>
                    <div className="w-9 h-9 rounded-xl overflow-hidden bg-white/10 flex items-center justify-center shrink-0">
                        {attachment.kind === "image" ? (
                            <img
                                src={attachment.preview}
                                alt={attachment.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <FileText className="w-4 h-4 text-zinc-300" />
                        )}
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm text-zinc-200 truncate max-w-[180px] sm:max-w-[220px]">{attachment.name}</p>
                        <p className="text-xs text-zinc-500">{formatSize(attachment.size)}</p>
                    </div>
                    <IconButton
                        label="Remove attachment"
                        onClick={onRemoveAttachment}
                        className="w-6 h-6 sm:w-6 sm:h-6 ml-1 shrink-0"
                    >
                        <X className="w-4 h-4" />
                    </IconButton>
                </div>
            )}

            {/* text input */}
            <textarea
                ref={textareaRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={onKeyDown}
                rows={1}
                placeholder="Ask something..."
                disabled={isLoading}
                className="w-full resize-none bg-transparent text-zinc-100 placeholder-zinc-500 text-base sm:text-[15px] leading-6 outline-none max-h-[200px] disabled:opacity-60"
            />

            {/* bottom row: attach + send */}
            <div className="flex items-center justify-between mt-2">
                <div className="relative">
                    <IconButton
                        label="Attach a file"
                        onClick={() => setMenuOpen((o) => !o)}
                        disabled={isLoading}
                    >
                        <span ref={clipRef} className="flex items-center justify-center">
                            <Paperclip className="w-[18px] h-[18px]" />
                        </span>
                    </IconButton>

                    {menuOpen && (
                        <div
                            ref={menuRef}
                            className="absolute bottom-11 left-0 w-44 bg-[#1a1a1e] border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden py-1 z-10"
                            style={{ animation: "menuIn 160ms ease" }}
                        >
                            <button
                                type="button"
                                onClick={() => {
                                    imageInputRef.current?.click();
                                    setMenuOpen(false);
                                }}
                                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-zinc-200 hover:bg-white/[0.05] transition-colors"
                            >
                                <ImageIcon className="w-4 h-4 text-zinc-400" />
                                Image
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    pdfInputRef.current?.click();
                                    setMenuOpen(false);
                                }}
                                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-zinc-200 hover:bg-white/[0.05] transition-colors"
                            >
                                <FileText className="w-4 h-4 text-zinc-400" />
                                PDF
                            </button>
                        </div>
                    )}
                </div>

                <button
                    type="button"
                    onClick={onSend}
                    disabled={!canSend || isLoading}
                    aria-label="Send message"
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ${canSend && !isLoading
                        ? "bg-zinc-100 text-zinc-900 hover:bg-white"
                        : "bg-white/10 text-zinc-600 cursor-not-allowed"
                        }`}
                >
                    <ArrowUp className="w-[18px] h-[18px]" strokeWidth={2.5} />
                </button>
            </div>

            {/* hidden file inputs */}
            <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                    onPickFile(e.target.files?.[0], "image");
                    e.target.value = "";
                }}
            />
            <input
                ref={pdfInputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) => {
                    onPickFile(e.target.files?.[0], "pdf");
                    e.target.value = "";
                }}
            />
        </div>
    );
}

export default function AskIgris({ onSend } = {}) {
    // conversation state
    const IGRIS_API_URL = `${apiUrl}/api/askigris`;
    const [messages, setMessages] = useState([]); // { id, role, text, attachment?, isError? }
    const [text, setText] = useState("");
    const [attachment, setAttachment] = useState(null); // { name, size, kind: 'image' | 'pdf', preview? }
    console.log('attachment:', attachment?.kind);
    const [menuOpen, setMenuOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [greeting] = useState(getRandomGreeting);

    const hasStarted = messages.length > 0;

    const textareaRef = useRef(null);
    const imageInputRef = useRef(null);
    const pdfInputRef = useRef(null);
    const menuRef = useRef(null);
    const clipRef = useRef(null);
    const composerWrapRef = useRef(null);
    const prevRectRef = useRef(null);
    const bottomRef = useRef(null);
    const [IgrisHistory, setIgrisHistory] = useState([]);
    const [activeConversationId, setActiveConversationId] = useState(null);
    const currentUser = getStoredUser();
    const currentUserId = currentUser?.id || currentUser?._id || '';
    console.log('Current user ID:', currentUserId);

    const getIgrisHistory = async () => {
        const token = localStorage.getItem("token");
        if (!token || !currentUserId) return;
        // console.log('Fetching token:', token);
        console.log('Fetching Igris history for user ID:', currentUserId);
        try {
            const response = await axios.get(`${IGRIS_API_URL}/history/${currentUserId}`, {
                withCredentials: true,
                headers: getAuthHeaders(),
            });
            console.log('Fetching Igris history for user:', currentUserId);
            const data = response.data;
            console.log("Igris history data:", data);
            setIgrisHistory(data);
        } catch (error) {
            if (error.response?.status === 401) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                window.dispatchEvent(new Event("auth:user-updated"));
                return;
            }
            console.error("Error fetching Igris history:", error);
        }
    };

    useEffect(() => {
        getIgrisHistory();
    }, []);

    const openIgrisChat = async (chat) => {
        if (!chat?._id) return;

        console.log("IgrisHistory id:", chat._id);
        try {
            const response = await axios.get(`${IGRIS_API_URL}/history/${currentUserId}/${chat._id}`, {
                headers: getAuthHeaders(),
            });
            const history = response.data?.chatHistory || [];
            const loadedMessages = history.flatMap((entry) => {
                if (entry.role && entry.content) {
                    return [{ id: uid(), role: entry.role, text: entry.content }];
                }
                return [
                    entry.question && { id: uid(), role: "user", text: entry.question },
                    entry.answer && { id: uid(), role: "assistant", text: entry.answer },
                ].filter(Boolean);
            });

            setActiveConversationId(chat._id);
            setMessages(loadedMessages);
            setSidebarOpen(false);
        } catch (error) {
            console.error("Error opening Igris chat:", error);
        }
    }

    // force a dark background on the page itself, so the theme holds even if
    // this component sits inside a host page/container with a light background
    useEffect(() => {
        const prevBody = document.body.style.backgroundColor;
        const prevHtml = document.documentElement.style.backgroundColor;
        document.body.style.backgroundColor = "#000000";
        document.documentElement.style.backgroundColor = "#000000";
        return () => {
            document.body.style.backgroundColor = prevBody;
            document.documentElement.style.backgroundColor = prevHtml;
        };
    }, []);

    // auto-grow the textarea as the user types
    useEffect(() => {
        const el = textareaRef.current;
        if (!el) return;
        el.style.height = "auto";
        el.style.height = Math.min(el.scrollHeight, MAX_TEXTAREA_HEIGHT) + "px";
    }, [text]);

    // close the attach menu when clicking outside of it
    useEffect(() => {
        function handleClick(e) {
            if (
                menuOpen &&
                menuRef.current &&
                !menuRef.current.contains(e.target) &&
                clipRef.current &&
                !clipRef.current.contains(e.target)
            ) {
                setMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, [menuOpen]);

    // revoke object URLs when they're no longer needed
    useEffect(() => {
        return () => {
            if (attachment?.preview) URL.revokeObjectURL(attachment.preview);
        };
    }, [attachment]);

    // keep the latest message in view
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, [messages, isLoading]);

    // FLIP-style slide: the composer stays visually anchored while it moves
    // from the centered "idle" position down to the pinned bottom position
    useLayoutEffect(() => {
        if (!prevRectRef.current || !composerWrapRef.current) return;
        const el = composerWrapRef.current;
        const newRect = el.getBoundingClientRect();
        const deltaY = prevRectRef.current.top - newRect.top;
        prevRectRef.current = null;
        if (Math.abs(deltaY) < 1) return;

        el.style.transition = "none";
        el.style.transform = `translateY(${deltaY}px)`;
        requestAnimationFrame(() => {
            el.style.transition = "transform 480ms cubic-bezier(0.22, 1, 0.36, 1)";
            el.style.transform = "translateY(0px)";
        });
    }, [hasStarted]);

    // ---- opening animation: one quiet, orchestrated reveal on first paint.
    // Header -> mark/greeting -> composer, staggered. Runs once only.
    const introPlayedRef = useRef(false);
    const headerRef = useRef(null);
    const heroRef = useRef(null);

    useLayoutEffect(() => {
        if (introPlayedRef.current) return;
        introPlayedRef.current = true;
        if (prefersReducedMotion()) return;

        const targets = [headerRef.current, heroRef.current, composerWrapRef.current].filter(Boolean);
        if (!targets.length) return;

        const ctx = gsap.context(() => {
            gsap.set(targets, { opacity: 0, y: 14 });
            gsap.to(targets, {
                opacity: 1,
                y: 0,
                duration: 0.6,
                ease: "power3.out",
                stagger: 0.12,
            });
        });
        return () => ctx.revert();
    }, []);

    const formatSize = (bytes) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const handleFile = (file, kind) => {
        if (!file) return;
        if (attachment?.preview) URL.revokeObjectURL(attachment.preview);
        setAttachment({
            name: file.name,
            size: file.size,
            kind,
            type: file.type || (kind === "pdf" ? "application/pdf" : "image/*"),
            preview: kind === "image" ? URL.createObjectURL(file) : null,
            file,
        });
    };

    const removeAttachment = useCallback(() => {
        if (attachment?.preview) URL.revokeObjectURL(attachment.preview);
        setAttachment(null);
    }, [attachment]);

    const canSend = text.trim().length > 0 || !!attachment;

    // ===================== REACT FRONTEND: handleSend =====================
    const handleSend = useCallback(async () => {
        const question = text.trim();
        if (!question && !attachment) return;
        if (isLoading) return;

        if (!hasStarted && composerWrapRef.current) {
            prevRectRef.current = composerWrapRef.current.getBoundingClientRect();
        }

        const outgoingAttachment = attachment
            ? {
                ...attachment,
                previewUrl: attachment.file
                    ? URL.createObjectURL(attachment.file)
                    : attachment.previewUrl,
            }
            : null;

        const isImage = attachment?.kind === "image";

        const userMsg = {
            id: uid(),
            role: "user",
            text: question,
            attachment: outgoingAttachment,
        };

        setMessages((prev) => [...prev, userMsg]);
        setText("");
        removeAttachment();
        setMenuOpen(false);
        setIsLoading(true);

        if (onSend) onSend({ text: question, attachment: outgoingAttachment });

        try {
            let data;

            if (isImage) {
                // ---- image branch: multipart/form-data via axios ----
                const requestBody = new FormData();
                requestBody.append("question", question);
                requestBody.append("title", question.slice(0, 60) || "New Conversation");
                requestBody.append("file", attachment.file, attachment.name);
                requestBody.append("systemprompt", question || "Describe the image.");
                if (activeConversationId) {
                    requestBody.append("conversationId", activeConversationId);
                }

                const token = localStorage.getItem("token");

                const res = await axios.post(`${IGRIS_API_URL}/describe_image`, requestBody, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                data = res.data;
            } else {
                // ---- text branch: JSON via fetch ----
                const res = await fetch(`${IGRIS_API_URL}/askPrompt`, {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                        ...getAuthHeaders(),
                    },
                    body: JSON.stringify({
                        question,
                        title: question.slice(0, 60) || "New Conversation",
                        conversationId: activeConversationId, // <-- the fix: continue same chat
                        source: null,
                    }),
                });
                if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
                data = await res.json();
            }

            if (data?.conversation?._id) {
                setActiveConversationId(data.conversation._id);
            }

            const replyText =
                data?.answer ?? data?.prompt ?? data?.text ?? "Hmm, no reply came back.";
            setMessages((prev) => [
                ...prev,
                { id: uid(), role: "assistant", text: replyText },
            ]);
        } catch (err) {
            console.error("send failed:", err);
            setMessages((prev) => [
                ...prev,
                {
                    id: uid(),
                    role: "assistant",
                    text: "Couldn't reach the server. Please try again.",
                    isError: true,
                },
            ]);
        } finally {
            setIsLoading(false);
            textareaRef.current?.focus();
        }
    }, [
        text,
        attachment,
        onSend,
        hasStarted,
        isLoading,
        removeAttachment,
        activeConversationId,
    ]);

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // ---- sidebar state + GSAP open/close animation (right side, unchanged) ----
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const sidebarRef = useRef(null);
    const backdropRef = useRef(null);

    // GSAP owns the drawer transform so it opens and closes from the right edge.
    useLayoutEffect(() => {
        const sidebar = sidebarRef.current;
        const backdrop = backdropRef.current;
        if (!sidebar || !backdrop) return;

        gsap.killTweensOf([sidebar, backdrop]);

        if (sidebarOpen) {
            gsap.to(sidebar, {
                xPercent: 0,
                duration: 0.45,
                ease: "power3.out",
            });
            gsap.to(backdrop, {
                opacity: 1,
                duration: 0.35,
                ease: "power2.out",
                pointerEvents: "auto",
            });
        } else {
            gsap.to(sidebar, {
                xPercent: 100,
                duration: 0.4,
                ease: "power3.in",
            });
            gsap.to(backdrop, {
                opacity: 0,
                duration: 0.3,
                ease: "power2.in",
                pointerEvents: "none",
            });
        }

        return () => gsap.killTweensOf([sidebar, backdrop]);
    }, [sidebarOpen]);

    // close on Escape
    useEffect(() => {
        const onKey = (e) => e.key === "Escape" && setSidebarOpen(false);
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    return (
        <div className="relative w-full h-full min-h-0 bg-black flex flex-col overflow-hidden">
            <style>{`
                @keyframes dotBounce {
                    0%, 80%, 100% { transform: translateY(0); opacity: .35; }
                    40% { transform: translateY(-4px); opacity: 1; }
                }
                @keyframes waveHand {
                    0%, 100% { transform: rotate(0deg); }
                    25% { transform: rotate(-14deg); }
                    75% { transform: rotate(14deg); }
                }
                @keyframes overlayIn {
                    from { opacity: 0; transform: translateY(4px) scale(0.98); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes menuIn {
                    from { opacity: 0; transform: translateY(6px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @media (prefers-reduced-motion: reduce) {
                    * { animation-duration: 0.001ms !important; transition-duration: 0.001ms !important; }
                }
            `}</style>

            {/* sidebar open/close button — always reachable, top-right */}
            <IconButton
                label="Toggle sidebar"
                onClick={() => setSidebarOpen((o) => !o)}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 z-30 w-11 h-11 bg-[#131316] border border-white/[0.08] hover:bg-white/[0.06]"
            >
                <Menu className="w-[18px] h-[18px]" />
            </IconButton>

            {/* sidebar — history, kept on the right */}
            <Sidebar
                sidebarRef={sidebarRef}
                backdropRef={backdropRef}
                onClose={() => setSidebarOpen(false)}
                chats={IgrisHistory}
                newConversation={() => {
                    setActiveConversationId(null);
                    setMessages([]);
                    setSidebarOpen(false);
                }}
                onSelectChat={(chat) => {
                    openIgrisChat(chat);
                    setSidebarOpen(false);
                }}
            />

            {/* top bar */}
            <header
                ref={headerRef}
                className="relative z-10 shrink-0 flex items-center h-14 sm:h-16 px-4 sm:px-6 pr-14 sm:pr-16 border-b border-white/[0.06]"
            >
                <h1 className="flex items-center gap-2 text-sm sm:text-base font-semibold tracking-tight text-zinc-200 shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-300/70" />
                    Ask Igris
                </h1>
            </header>

            {/* message list */}
            {hasStarted && (
                <div className="flex-1 overflow-y-auto scroll-smooth">
                    <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 pt-6 sm:pt-8 pb-4 flex flex-col gap-4 sm:gap-5">
                        {messages.map((m) => (
                            <MessageBubble key={m.id} message={m} formatSize={formatSize} />
                        ))}
                        <div ref={bottomRef} />
                    </div>
                </div>
            )}

            {/* composer */}
            <div className={`w-full flex ${hasStarted ? "" : "flex-1"} items-center justify-center px-4`}>
                <div
                    ref={composerWrapRef}
                    className="w-full max-w-[min(94vw,34rem)] flex flex-col items-stretch gap-4 pt-2"
                    style={{ paddingBottom: hasStarted ? "max(1rem, env(safe-area-inset-bottom))" : "0.5rem" }}
                >
                    {!hasStarted && (
                        <div ref={heroRef} className="flex flex-col items-center gap-5 mb-1">
                            <IgrisMark className="w-[clamp(5rem,20vw,8rem)] h-[clamp(5rem,20vw,8rem)]" />
                            <h2 className="text-center text-zinc-100 font-medium tracking-tight text-[clamp(1.25rem,3.4vw,1.875rem)] select-none px-2">
                                {greeting}
                            </h2>
                        </div>
                    )}

                    <Composer
                        text={text}
                        setText={setText}
                        attachment={attachment}
                        onRemoveAttachment={removeAttachment}
                        onKeyDown={handleKeyDown}
                        onSend={handleSend}
                        canSend={canSend}
                        isLoading={isLoading}
                        formatSize={formatSize}
                        menuOpen={menuOpen}
                        setMenuOpen={setMenuOpen}
                        menuRef={menuRef}
                        clipRef={clipRef}
                        textareaRef={textareaRef}
                        imageInputRef={imageInputRef}
                        pdfInputRef={pdfInputRef}
                        onPickFile={handleFile}
                    />
                </div>
            </div>

            {/* centered loading overlay */}
            {isLoading && (
                <div className="pointer-events-none fixed inset-0 flex items-center justify-center px-4">
                    <div
                        className="bg-[#131316]/95 border border-white/[0.08] backdrop-blur-sm rounded-2xl px-5 py-3.5 shadow-2xl flex items-center gap-2.5"
                        style={{ animation: "overlayIn 220ms cubic-bezier(0.22, 1, 0.36, 1)" }}
                    >
                        <span className="text-lg" style={{ display: "inline-block", animation: "waveHand 1.1s ease-in-out infinite" }}>
                            🤚
                        </span>
                        <p className="text-zinc-100 text-[15px] font-medium whitespace-nowrap">Ruko zara sabar karo</p>
                        <LoadingDots />
                    </div>
                </div>
            )}
        </div>
    );
}

function LoadingDots() {
    return (
        <span className="flex items-center gap-1 ml-0.5">
            {[0, 1, 2].map((i) => (
                <span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-zinc-400"
                    style={{ animation: `dotBounce 1.1s ease-in-out ${i * 0.15}s infinite` }}
                />
            ))}
        </span>
    );
}

function MessageText({ text }) {
    const parts = text.split(/(\*\*[^*\n]+?\*\*)/g);

    return (
        <>
            {parts.map((part, index) => {
                const isBold = part.startsWith("**") && part.endsWith("**");
                if (isBold) {
                    return <strong key={index}>{part.slice(2, -2)}</strong>;
                }

                return <span key={index}>{part}</span>;
            })}
        </>
    );
}

function MessageBubble({ message, formatSize }) {
    const isUser = message.role === "user";
    const [copied, setCopied] = useState(false);
    const bubbleRef = useRef(null);

    // chat animation — new bubbles animate in once on mount. Sent (user)
    // messages settle in from the bottom-right; received (assistant)
    // messages settle in from slightly lower with a soft pop, so sending
    // and receiving read as distinct little moments.
    useLayoutEffect(() => {
        if (!bubbleRef.current || prefersReducedMotion()) return;
        const ctx = gsap.context(() => {
            gsap.fromTo(
                bubbleRef.current,
                {
                    opacity: 0,
                    y: isUser ? 10 : 16,
                    scale: isUser ? 0.98 : 0.96,
                },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: isUser ? 0.35 : 0.45,
                    ease: "power3.out",
                }
            );
        });
        return () => ctx.revert();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleCopy = async () => {
        if (!message.text) return;

        try {
            await navigator.clipboard.writeText(message.text);
            setCopied(true);
            setTimeout(() => setCopied(false), 1200);
        } catch (error) {
            console.error("Copy failed:", error);
        }
    };

    return (
        <div ref={bubbleRef} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
            <div
                className={`group relative max-w-[88%] sm:max-w-[78%] md:max-w-[70%] rounded-2xl px-4 py-2.5 text-[15px] leading-6 whitespace-pre-wrap break-words ${isUser
                    ? "bg-zinc-100 text-zinc-900 rounded-br-md"
                    : message.isError
                        ? "bg-red-950/40 text-red-300 border border-red-900/40 rounded-bl-md"
                        : "bg-[#131316] text-zinc-100 border border-white/[0.06] rounded-bl-md"
                    }`}
            >
                {message.attachment && (
                    <div
                        className={`mb-2 inline-flex items-center gap-2 rounded-xl pl-1.5 pr-3 py-1.5 max-w-full ${isUser ? "bg-black/10" : "bg-white/5"
                            }`}
                    >
                        <div className="w-7 h-7 rounded-lg overflow-hidden bg-black/10 flex items-center justify-center shrink-0">
                            {message.attachment.kind === "image" ? (
                                <img
                                    src={message.attachment.preview}
                                    alt={message.attachment.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <FileText className="w-3.5 h-3.5 opacity-70" />
                            )}
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs truncate max-w-[180px]">{message.attachment.name}</p>
                            {formatSize && (
                                <p className={`text-xs ${isUser ? "text-zinc-400" : "text-zinc-400"}`}>
                                    {formatSize(message.attachment.size)}
                                </p>
                            )}
                        </div>
                    </div>
                )}
                {message.text && <p><MessageText text={message.text} /></p>}

                {message.text && (
                    <button
                        type="button"
                        onClick={handleCopy}
                        aria-label="Copy message"
                        className={`absolute ${isUser ? "-left-2" : "-right-2"} top-2 rounded-full border border-white/10 bg-[#111112] p-1.5 text-zinc-300 opacity-0 transition-opacity duration-200 group-hover:opacity-100 hover:text-white`}
                    >
                        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                )}
            </div>
        </div>
    );
}