import { useState, useRef, useEffect, useCallback } from "react";
import { Paperclip, Image as ImageIcon, FileText, X } from "lucide-react";
import axios from "axios";
import { apiUrl, getAuthHeaders } from "../utilites/DashboardHelper";

const MAX_TEXTAREA_HEIGHT = 200;
const API_URL = `${apiUrl}/api/askigris`;

export default function RememberIgris({ onSend } = {}) {
    const [text, setText] = useState("");
    const [attachment, setAttachment] = useState(null); // { name, size, kind: 'image' | 'pdf', preview? }
    const [menuOpen, setMenuOpen] = useState(false);

    const textareaRef = useRef(null);
    const imageInputRef = useRef(null);
    const pdfInputRef = useRef(null);
    const menuRef = useRef(null);
    const clipRef = useRef(null);
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
        if (!canSend) return;

        if (attachment?.file) {
            const formData = new FormData();
            formData.append("question", text.trim());
            formData.append("file", attachment.file, attachment.name);

            try {
                const res = await axios.post(API_URL, formData, {
                    withCredentials: true,
                    headers: getAuthHeaders(),
                });
                console.log("File uploaded:", res.data);
            } catch (error) {
                const message = error.response?.data?.error || error.message || "Upload failed";
                console.error("Upload failed:", message);
                return;
            }
        }

        if (onSend) onSend({ text: text.trim(), attachment });
        setText("");
        removeAttachment();
        console.log("Sent:", { text: text.trim(), attachment });
    }, [canSend, text, attachment, onSend, removeAttachment]);

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend(text.trim());
        }
    };

    return (
        <div className="relative w-full h-screen min-h-screen bg-[#0b0b0d] flex items-center justify-center px-4 overflow-y-auto">
            <div className="w-full max-w-xl flex flex-col items-start gap-3">
                <div className="w-full flex items-center justify-center">
                    <h2 className="text-center text-zinc-200 text-2xl sm:text-3xl font-medium tracking-tight mb-1 select-none">
                        Upload anything you want and we will remember it for you...
                    </h2>
                </div>

                <div className="w-full bg-[#17171a] border border-white/10 rounded-[28px] shadow-2xl px-4 pt-4 pb-3 relative">
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
                                <p className="text-sm text-zinc-200 truncate max-w-[220px]">
                                    {attachment.name}
                                </p>
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
                        placeholder="Upload files..."
                        className="w-full resize-none bg-transparent text-zinc-100 placeholder-zinc-500 text-[15px] leading-6 outline-none max-h-[200px]"
                    />

                    {/* paperclip / attach control */}
                    <div className="flex items-center justify-between mt-2">
                        <div className="relative">
                            <button
                                ref={clipRef}
                                type="button"
                                onClick={() => setMenuOpen((v) => !v)}
                                aria-label="Attach file"
                                aria-expanded={menuOpen}
                                className={`w-9 h-9 flex items-center justify-center rounded-full border transition-colors ${menuOpen
                                    ? "bg-white/10 border-white/20 text-zinc-100"
                                    : "bg-transparent border-white/10 text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
                                    }`}
                            >
                                <Paperclip className="w-4 h-4" />
                            </button>

                            {menuOpen && (
                                <div
                                    ref={menuRef}
                                    className="absolute bottom-12 left-0 w-44 bg-[#1f1f23] border border-white/10 rounded-2xl shadow-2xl overflow-hidden py-1"
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
                    </div>

                    {/* hidden native file inputs, triggered by the menu above */}
                    <input
                        ref={imageInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFile(e.target.files?.[0], "image")}
                    />
                    <input
                        ref={pdfInputRef}
                        type="file"
                        accept="application/pdf"
                        className="hidden"
                        onChange={(e) => handleFile(e.target.files?.[0], "pdf")}
                    />
                </div>

                {/* send button appears right below the input once there's text or a file */}
                {canSend && (
                    <button
                        type="button"
                        onClick={handleSend}
                        className="ml-1 px-5 py-2 rounded-full bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-sm font-medium transition-colors"
                    >
                        Send
                    </button>
                )}
            </div>
        </div>
    );
}