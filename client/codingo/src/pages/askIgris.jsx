import {
    useState,
    useRef,
    useEffect,
    useLayoutEffect,
    useCallback,
} from "react";
import { Paperclip, Image as ImageIcon, FileText, X, ArrowUp, Copy, Check } from "lucide-react";

const MAX_TEXTAREA_HEIGHT = 200;
const API_URL = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/askigris`;

const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

export default function AskIgris({ onSend } = {}) {
    // conversation state
    const [messages, setMessages] = useState([]); // { id, role, text, attachment?, isError? }
    const [text, setText] = useState("");
    const [attachment, setAttachment] = useState(null); // { name, size, kind: 'image' | 'pdf', preview? }
    const [menuOpen, setMenuOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const hasStarted = messages.length > 0;

    const textareaRef = useRef(null);
    const imageInputRef = useRef(null);
    const pdfInputRef = useRef(null);
    const menuRef = useRef(null);
    const clipRef = useRef(null);
    const composerWrapRef = useRef(null);
    const prevRectRef = useRef(null);
    const bottomRef = useRef(null);

    // force a dark background on the page itself, so the theme holds even if
    // this component sits inside a host page/container with a light background
    useEffect(() => {
        const prevBody = document.body.style.backgroundColor;
        const prevHtml = document.documentElement.style.backgroundColor;
        document.body.style.backgroundColor = "#0b0b0d";
        document.documentElement.style.backgroundColor = "#0b0b0d";
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

    const handleSend = useCallback(async () => {
        const question = text.trim();
        if (!question && !attachment) return;
        if (isLoading) return;

        // capture the composer's current position right before the layout
        // shifts (idle -> chat), so the FLIP effect can animate the delta
        if (!hasStarted && composerWrapRef.current) {
            prevRectRef.current = composerWrapRef.current.getBoundingClientRect();
        }

        const outgoingAttachment = attachment;
        const userMsg = { id: uid(), role: "user", text: question, attachment: outgoingAttachment };

        setMessages((prev) => [...prev, userMsg]);
        setText("");
        removeAttachment();
        setMenuOpen(false);
        setIsLoading(true);

        if (onSend) onSend({ text: question, attachment: outgoingAttachment });

        try {
            const requestBody = new FormData();
            requestBody.append("question", question);
            if (outgoingAttachment?.file) {
                requestBody.append("file", outgoingAttachment.file, outgoingAttachment.name);
            }

            const token = localStorage.getItem("token");
            const res = await fetch(API_URL, {
                method: "POST",
                credentials: "include",
                headers: token ? { Authorization: `Bearer ${token}` } : {},
                body: requestBody,
            });
            if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
            const data = await res.json();
            console.log("Received response:", data);
            console.log("response:", res);
            const replyText = data?.answer ?? data?.prompt ?? data?.text ?? "Hmm, no reply came back.";
            setMessages((prev) => [...prev, { id: uid(), role: "assistant", text: replyText }]);
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
    }, [text, attachment, onSend, hasStarted, isLoading, removeAttachment]);

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="fixed inset-0 w-full h-full bg-[#0b0b0d] flex flex-col overflow-hidden">
            <style>{`
                @keyframes bubbleIn {
                    from { opacity: 0; transform: translateY(8px); }
                    to { opacity: 1; transform: translateY(0); }
                }
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
                @media (prefers-reduced-motion: reduce) {
                    * { animation-duration: 0.001ms !important; transition-duration: 0.001ms !important; }
                }
            `}</style>

            {/* message list */}
            {hasStarted && (
                <div className="flex-1 overflow-y-auto scroll-smooth">
                    <div className="max-w-2xl mt-25 mx-auto w-full px-4 sm:px-6 pt-8 pb-4 flex flex-col gap-5">
                        {messages.map((m, i) => (
                            <MessageBubble key={m.id} message={m} delay={i === messages.length - 1 ? 0 : 0} formatSize={formatSize} />
                        ))}
                        <div ref={bottomRef} />
                    </div>
                </div>
            )}

            {/* composer */}
            <div className={`w-full flex ${hasStarted ? "" : "flex-1"} items-center justify-center px-4`}>
                <div
                    ref={composerWrapRef}
                    className="w-full max-w-xl flex flex-col items-stretch gap-3 pt-2"
                    style={{ paddingBottom: hasStarted ? "max(1rem, env(safe-area-inset-bottom))" : "0.5rem" }}
                >
                    {!hasStarted && (
                        <h1 className="text-center text-zinc-200 text-2xl sm:text-3xl font-medium tracking-tight mb-1 select-none">
                            What's on your mind?
                        </h1>
                    )}

                    <div className="w-full bg-[#17171a] border border-white/10 focus-within:border-white/20 rounded-[28px] shadow-2xl px-4 pt-4 pb-3 relative transition-colors duration-200">
                        {/* attached file chip */}
                        {attachment && (
                            <div className="mb-3 inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl pl-2 pr-3 py-2 max-w-full">
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
                                    <p className="text-sm text-zinc-200 truncate max-w-[220px]">{attachment.name}</p>
                                    <p className="text-xs text-zinc-500">{formatSize(attachment.size)}</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={removeAttachment}
                                    aria-label="Remove attachment"
                                    className="ml-1 text-zinc-500 hover:text-zinc-200 transition-colors shrink-0"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        )}

                        {/* text input */}
                        <textarea
                            ref={textareaRef}
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            onKeyDown={handleKeyDown}
                            rows={1}
                            placeholder="Ask something..."
                            disabled={isLoading}
                            className="w-full resize-none bg-transparent text-zinc-100 placeholder-zinc-500 text-[15px] leading-6 outline-none max-h-[200px] disabled:opacity-60"
                        />

                        {/* bottom row: attach + send */}
                        <div className="flex items-center justify-between mt-2">
                            <div className="relative">
                                <button
                                    ref={clipRef}
                                    type="button"
                                    onClick={() => setMenuOpen((o) => !o)}
                                    aria-label="Attach a file"
                                    disabled={isLoading}
                                    className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-200 hover:bg-white/5 transition-colors disabled:opacity-50"
                                >
                                    <Paperclip className="w-[18px] h-[18px]" />
                                </button>

                                {menuOpen && (
                                    <div
                                        ref={menuRef}
                                        className="absolute bottom-11 left-0 w-44 bg-[#1f1f23] border border-white/10 rounded-2xl shadow-2xl overflow-hidden py-1 z-10"
                                        style={{ animation: "bubbleIn 160ms ease" }}
                                    >
                                        <button
                                            type="button"
                                            onClick={() => {
                                                imageInputRef.current?.click();
                                                setMenuOpen(false);
                                            }}
                                            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-zinc-200 hover:bg-white/5 transition-colors"
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
                                            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-zinc-200 hover:bg-white/5 transition-colors"
                                        >
                                            <FileText className="w-4 h-4 text-zinc-400" />
                                            PDF
                                        </button>
                                    </div>
                                )}
                            </div>

                            <button
                                type="button"
                                onClick={handleSend}
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
                                handleFile(e.target.files?.[0], "image");
                                e.target.value = "";
                            }}
                        />
                        <input
                            ref={pdfInputRef}
                            type="file"
                            accept="application/pdf"
                            className="hidden"
                            onChange={(e) => {
                                handleFile(e.target.files?.[0], "pdf");
                                e.target.value = "";
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* centered loading overlay */}
            {isLoading && (
                <div className="pointer-events-none fixed inset-0 flex items-center justify-center px-4">
                    <div
                        className="bg-[#17171a]/95 border border-white/10 backdrop-blur-sm rounded-2xl px-5 py-3.5 shadow-2xl flex items-center gap-2.5"
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
        <div
            className={`flex ${isUser ? "justify-end" : "justify-start"}`}
            style={{ animation: "bubbleIn 320ms cubic-bezier(0.22, 1, 0.36, 1)" }}
        >
            <div
                className={`group relative max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-2.5 text-[15px] leading-6 whitespace-pre-wrap break-words ${isUser
                    ? "bg-zinc-100 text-zinc-900 rounded-br-md"
                    : message.isError
                        ? "bg-red-950/40 text-red-300 border border-red-900/40 rounded-bl-md"
                        : "bg-[#17171a] text-zinc-100 border border-white/5 rounded-bl-md"
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
                                <p className={`text-[11px] ${isUser ? "text-zinc-600" : "text-zinc-500"}`}>
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