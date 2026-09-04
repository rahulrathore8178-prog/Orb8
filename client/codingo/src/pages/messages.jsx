import React, { useEffect, useMemo, useRef, useState } from "react";
import { mid, useGsap, useIsMobile } from "../utilites/ChatHelper";
import { ChatHeader } from "../components/Messages/ChatHeader";
import { ChatArea } from "../components/Messages/ChatArea";
import { InputBar } from "../components/Messages/ChatInput";
import { Sidebar } from "../components/Messages/ContactList";
import { useDispatch, useSelector } from "react-redux";
import { addMessage, fetchContacts, setActiveContact } from "../redux/slices/chatSlice";

export default function MessagesApp() {
  const isMobile = useIsMobile();
  const { gsapRef, ready: gsapReady } = useGsap();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchContacts());
  }, [dispatch]);

  const { activeContactId, contacts } = useSelector((s) => s.chat ?? null);
  // const [activeContactId, setActiveContactId] = useState(() =>
  //   typeof window !== "undefined" && window.innerWidth < 768 ? null : "c1"
  // );
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [contactQuery, setContactQuery] = useState("");
  const [chatSearchOpen, setChatSearchOpen] = useState(false);
  const [chatSearchQuery, setChatSearchQuery] = useState("");
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [typingContactId, setTypingContactId] = useState(null);
  const [recording, setRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [pendingAttachments, setPendingAttachments] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [toasts, setToasts] = useState([]);

  const messagesRef = useRef(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingRef = useRef(null);
  const switcherWrapRef = useRef(null);
  const moreWrapRef = useRef(null);
  const emojiWrapRef = useRef(null);
  const animatedIds = useRef(new Set());
  const requestScrollBottom = useRef(false);
  const prevActiveId = useRef(activeContactId);

  const activeContact = contacts.find((c) => c.id === activeContactId) || null;
  const currentUser = useSelector((s) => s.dashboard.currentUser);
  const wsRef = useRef(null);

  useEffect(() => {
    if (!currentUser?.id) return;

    const socketUrl = import.meta.env.VITE_SOCKET_URL || "ws://localhost:5000";
    const socket = new WebSocket(socketUrl);
    wsRef.current = socket;

    socket.onopen = () => {
      socket.send(JSON.stringify({ type: "register", userId: currentUser.id }));
    };
    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type !== "chat-message") return;

        const { senderId, text, time, timestamp, id } = data.message || {};
        if (!senderId || !text) return;
        dispatch(addMessage({
          contactId: senderId,
          message: { id, senderId, text, time: new Date(timestamp || time), from: "them" },
        }));
      } catch (error) {
        console.error("Chat WebSocket message error", error);
      }
    };
    socket.onerror = (error) => console.error("Chat WebSocket error", error);
    socket.onclose = () => {
      if (wsRef.current === socket) wsRef.current = null;
    };

    return () => {
      socket.close();
      if (wsRef.current === socket) wsRef.current = null;
    };
  }, [currentUser?.id, dispatch]);

  const sendMessage = () => {
    const inputText = (drafts[activeContactId] || "").trim();
    if (!inputText || !activeContactId || !currentUser?.id) return;

    const message = {
      id: Date.now(),
      senderId: currentUser.id,
      recipientId: activeContactId,
      text: inputText.trim(),
      time: new Date(),
    };
    console.log('inputText:', inputText);

    if (wsRef.current?.readyState !== WebSocket.OPEN) return;
    wsRef.current.send(JSON.stringify({ type: "chat-message", message }));

    dispatch(addMessage({ contactId: activeContactId, message: { ...message, from: "me" } }));
    setDrafts((currentDrafts) => ({ ...currentDrafts, [activeContactId]: "" }));
  };

  /* ---------- toasts ---------- */
  function showToast(text) {
    const id = mid();
    setToasts((t) => [...t, { id, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2500);
  }

  /* ---------- close popovers on outside click ---------- */
  useEffect(() => {
    function handleClick(e) {
      if (switcherWrapRef.current && !switcherWrapRef.current.contains(e.target)) setSwitcherOpen(false);
      if (moreWrapRef.current && !moreWrapRef.current.contains(e.target)) setMoreMenuOpen(false);
      if (emojiWrapRef.current && !emojiWrapRef.current.contains(e.target)) setEmojiOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  /* ---------- recording timer ---------- */
  useEffect(() => {
    if (!recording) return;
    const id = setInterval(() => setRecordSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [recording]);

  /* ---------- textarea auto-resize ---------- */
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 120) + "px";
  }, [drafts, activeContactId]);

  /* ---------- smooth scroll (GSAP, with native fallback) ---------- */
  function smoothScrollToBottom() {
    const el = messagesRef.current;
    if (!el) return;
    const target = el.scrollHeight - el.clientHeight;
    const gsap = gsapRef.current;
    if (gsap) {
      gsap.to(el, { scrollTop: target, duration: 0.45, ease: "power3.out", overwrite: true });
    } else if (el.scrollTo) {
      el.scrollTo({ top: target, behavior: "smooth" });
    } else {
      el.scrollTop = target;
    }
  }

  /* ---------- GSAP pop-in for freshly mounted bubbles ---------- */
  function animateNewBubbles() {
    const gsap = gsapRef.current;
    const container = messagesRef.current;
    if (!gsap || !container) return;
    const nodes = container.querySelectorAll("[data-bubble-id]");
    const fresh = [];
    nodes.forEach((node) => {
      const id = node.getAttribute("data-bubble-id");
      if (!animatedIds.current.has(id)) {
        fresh.push(node);
        animatedIds.current.add(id);
      }
    });
    if (fresh.length) {
      gsap.fromTo(
        fresh,
        { opacity: 0, y: 10, scale: 0.92, transformOrigin: "bottom center" },
        { opacity: 1, y: 0, scale: 1, duration: 0.32, ease: "back.out(1.6)", stagger: 0.035, clearProps: "transform" }
      );
    }
  }

  /* Register non-GSAP ids too, so a later GSAP load doesn't replay old bubbles */
  useEffect(() => {
    if (gsapReady) return;
    const container = messagesRef.current;
    if (!container) return;
    container.querySelectorAll("[data-bubble-id]").forEach((node) => {
      animatedIds.current.add(node.getAttribute("data-bubble-id"));
    });
  });

  /* ---------- scroll + animate whenever message content changes ---------- */
  useEffect(() => {
    const el = messagesRef.current;
    if (!el) return;
    const switched = prevActiveId.current !== activeContactId;
    prevActiveId.current = activeContactId;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 140;

    if (switched) {
      el.scrollTop = el.scrollHeight;
    } else if (requestScrollBottom.current || nearBottom) {
      smoothScrollToBottom();
    }
    requestScrollBottom.current = false;
    animateNewBubbles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contacts, typingContactId, activeContactId, gsapReady]);

  /* ---------- typing indicator entrance ---------- */
  useEffect(() => {
    if (typingContactId && typingContactId === activeContactId && typingRef.current && gsapRef.current) {
      gsapRef.current.fromTo(
        typingRef.current,
        { opacity: 0, y: 8, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 0.28, ease: "back.out(1.6)" }
      );
    }
  }, [typingContactId, activeContactId, gsapReady, gsapRef]);

  /* ============================================================
     ACTIONS
     ============================================================ */
  function selectContact(id) {
    dispatch(setActiveContact(id));
    // setContacts((prev) => prev.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c)));
    setChatSearchOpen(false);
    setChatSearchQuery("");
    setSwitcherOpen(false);
    setMoreMenuOpen(false);
    setEmojiOpen(false);
    setPendingAttachments([]);
    setTypingContactId(null);
    if (isMobile) setSidebarOpen(false);
  }

  function insertEmoji(emoji) {
    if (!activeContactId) return;
    const ta = textareaRef.current;
    const current = drafts[activeContactId] || "";
    const start = ta ? ta.selectionStart : current.length;
    const end = ta ? ta.selectionEnd : current.length;
    const next = current.slice(0, start) + emoji + current.slice(end);
    setDrafts((d) => ({ ...d, [activeContactId]: next }));
    requestAnimationFrame(() => {
      if (!ta) return;
      ta.focus();
      const pos = start + emoji.length;
      ta.setSelectionRange(pos, pos);
    });
  }

  function handleFileChange(e) {
    const files = Array.from(e.target.files || []);
    if (files.length) {
      setPendingAttachments((prev) => [...prev, ...files.map((f) => ({ name: f.name }))]);
    }
    e.target.value = "";
  }

  function removeAttachment(index) {
    setPendingAttachments((prev) => prev.filter((_, i) => i !== index));
  }

  function stopRecordingSend() {
    const targetId = activeContactId;
    if (targetId && recordSeconds > 0) {
      requestScrollBottom.current = true;
    }
    setRecording(false);
    setRecordSeconds(0);
  }

  /* ============================================================
     DERIVED DATA
     ============================================================ */
  const filteredContacts = contacts.filter((c) =>
    c.name.toLowerCase().includes(contactQuery.trim().toLowerCase())
  );

  const visibleMessages = useMemo(() => {
    if (!activeContact) return [];
    const q = chatSearchQuery.trim().toLowerCase();
    if (chatSearchOpen && q) {
      return activeContact.messages.filter((m) => m.text && m.text.toLowerCase().includes(q));
    }
    return activeContact.messages;
  }, [activeContact, chatSearchOpen, chatSearchQuery]);

  const searchingWithNoText = chatSearchOpen && chatSearchQuery.trim().length > 0;
  const hasComposerContent = (drafts[activeContactId] || "").trim().length > 0 || pendingAttachments.length > 0;

  /* ============================================================
     RENDER
     ============================================================ */
  return (
    <div className="h-screen w-full flex bg-slate-950 text-slate-100 overflow-hidden font-sans antialiased">
      <style>{`
        .msgs-scroll::-webkit-scrollbar, .contacts-scroll::-webkit-scrollbar { width: 8px; }
        .msgs-scroll::-webkit-scrollbar-thumb, .contacts-scroll::-webkit-scrollbar-thumb { background: #334155; border-radius: 8px; }
        .msgs-scroll::-webkit-scrollbar-track, .contacts-scroll::-webkit-scrollbar-track { background: transparent; }
        .msgs-scroll, .contacts-scroll { scrollbar-width: thin; scrollbar-color: #334155 transparent; }
        @keyframes typingBounce { 0%, 60%, 100% { transform: translateY(0); opacity: .5; } 30% { transform: translateY(-5px); opacity: 1; } }
        .typing-dot { animation: typingBounce 1.1s infinite ease-in-out; }
        @keyframes popoverIn { from { opacity: 0; transform: translateY(-4px) scale(.97); } to { opacity: 1; transform: none; } }
        .popover-anim { animation: popoverIn .15s ease; }
        @keyframes recPulse { 0%, 100% { opacity: 1; } 50% { opacity: .35; } }
        .rec-pulse { animation: recPulse 1s infinite; }
        @keyframes msgPop { from { opacity: 0; transform: translateY(8px) scale(.94); } to { opacity: 1; transform: none; } }
        .animate-bubble-fallback { animation: msgPop .3s ease-out both; }
      `}</style>

      <Sidebar
        isMobile={isMobile}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        contactQuery={contactQuery}
        setContactQuery={setContactQuery}
        filteredContacts={filteredContacts}
        activeContactId={activeContactId}
        selectContact={selectContact}
      />

      {/* ================= CHAT PANE ================= */}
      <main className="flex-1 min-w-0 flex flex-col bg-slate-950">
        <ChatHeader
          isMobile={isMobile}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          activeContact={activeContact}
          contacts={contacts}
          activeContactId={activeContactId}
          selectContact={selectContact}
          chatSearchOpen={chatSearchOpen}
          setChatSearchOpen={setChatSearchOpen}
          chatSearchQuery={chatSearchQuery}
          setChatSearchQuery={setChatSearchQuery}
          switcherOpen={switcherOpen}
          setSwitcherOpen={setSwitcherOpen}
          switcherWrapRef={switcherWrapRef}
          moreMenuOpen={moreMenuOpen}
          setMoreMenuOpen={setMoreMenuOpen}
          moreWrapRef={moreWrapRef}
          setEmojiOpen={setEmojiOpen}
          showToast={showToast}
          setContacts={() => {}}
        />

        <ChatArea
          activeContact={activeContact}
          visibleMessages={visibleMessages}
          searchingWithNoText={searchingWithNoText}
          chatSearchQuery={chatSearchQuery}
          typingContactId={typingContactId}
          gsapReady={gsapReady}
          messagesRef={messagesRef}
          typingRef={typingRef}
        />

        {activeContactId && (
        <InputBar
          activeContact={activeContact}
          activeContactId={activeContactId}
          drafts={drafts}
          setDrafts={setDrafts}
          pendingAttachments={pendingAttachments}
          removeAttachment={removeAttachment}
          recording={recording}
          setRecording={setRecording}
          recordSeconds={recordSeconds}
          setRecordSeconds={setRecordSeconds}
          emojiOpen={emojiOpen}
          setEmojiOpen={setEmojiOpen}
          setSwitcherOpen={setSwitcherOpen}
          setMoreMenuOpen={setMoreMenuOpen}
          emojiWrapRef={emojiWrapRef}
          textareaRef={textareaRef}
          fileInputRef={fileInputRef}
          insertEmoji={insertEmoji}
          sendMessage={sendMessage}
          stopRecordingSend={stopRecordingSend}
          hasComposerContent={hasComposerContent}
          handleFileChange={handleFileChange}
        />
        )}
      </main>

      {/* ---- Toasts ---- */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-100 flex flex-col items-center gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="bg-slate-800 border border-slate-700 text-slate-100 px-4 py-2.5 rounded-xl text-sm shadow-2xl popover-anim"
          >
            {t.text}
          </div>
        ))}
      </div>
    </div>
  );
}