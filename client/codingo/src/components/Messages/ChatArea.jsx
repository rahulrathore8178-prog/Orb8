// import { useEffect, useRef, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { addMessage, setInputText } from "../../redux/slices/chatSlice";
// import { getAuthHeaders } from "../../utilites/communityHelper";
// import axios from "axios";
// import gsap from "gsap";
// import ChatHeader from "./ChatHeader";
// import InputBar from "./ChatInput";
// import ChatDisplay from "./ChatDisplay";

// export function Avatar({ contact, size = 40 }) {
//   return (
//     <div className="relative shrink-0">
//       <div
//         className="flex items-center justify-center rounded-full font-semibold tracking-[0.02em]"
//         style={{
//           width: size,
//           height: size,
//           background: `${contact.color}15`,
//           border: `1.5px solid ${contact.color}55`,
//           fontSize: size * 0.32,
//           color: contact.color,
//         }}
//       >
//         {contact.initials}
//       </div>

//       {contact.online && (
//         <div
//           className="absolute rounded-full bg-[#4ade80] border-2 border-[#0f0f13]"
//           style={{ bottom: 1, right: 1, width: size * 0.26, height: size * 0.26 }}
//         />
//       )}
//     </div>
//   );
// }

// function MessageBubble({ msg, contact, animate }) {
// const ref = useRef(null);
// const isMe = msg.from === "me";

//   useEffect(() => {
//     if (!animate || !ref.current) return;
//     gsap.fromTo(
//       ref.current,
//       { opacity: 0, y: 10, scale: 0.88, transformOrigin: isMe ? "right bottom" : "left bottom" },
//       { opacity: 1, y: 0, scale: 1, duration: 0.32, ease: "back.out(1.6)" }
//     );
//   }, [animate, isMe]);

//   return (
//     <div ref={ref} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
//       {!isMe && (
//         <div className="mr-2 self-end">
//           <Avatar contact={contact} size={28} />
//         </div>
//       )}
//       <div className="max-w-[85%] sm:max-w-[72%]">
//         <div
//           className={`px-3.5 py-2.5 text-[13px] sm:text-[14px] leading-[1.5] break-words ${
//             isMe
//               ? "bg-[#6C63FF] text-[#f0f0ff] rounded-[18px_18px_4px_18px]"
//               : "bg-[#1a1a26] text-[#d8d8ec] rounded-[18px_18px_18px_4px] border border-[#252535]"
//           }`}
//         >
//           {msg.text}
//         </div>
//         <div className={`mt-1 text-[10.5px] text-[#33334a] ${isMe ? "text-right pr-1" : "text-left pl-1"}`}>
//           {msg.time}
//           {isMe && <span className="ml-1 text-[#6C63FF]">✓✓</span>}
//         </div>
//       </div>
//     </div>
//   );
// }

// export const ChatArea = () => {
// const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "ws://localhost:5000";
// const apiUrl = import.meta.env.VITE_API_URL || "";

// const dispatch = useDispatch();
// const wsRef = useRef(null);
// const scrollRef = useRef(null);

// const currentUser = useSelector((s) => s.dashboard.currentUser);
// const { activeContactId, inputText, messages, contacts } = useSelector((s) => s.chat ?? null);

// const msgs = (messages && messages[activeContactId]) || [];
// const contact =
//   (contacts || []).find((c) => c.id === activeContactId) || {
//     name: "No one",
//     initials: "?",
//     color: "#6C63FF",
//     online: false,
//   };

// const prevLen = useRef(msgs.length);
// const [newMsgIds, setNewMsgIds] = useState(() => new Set());

// useEffect(() => {
//   if (!activeContactId || !currentUser?.id) return;

//   const fetchHistory = async () => {
//     try {
//       const res = await axios.get(`${apiUrl}/api/chat/${activeContactId}`, {
//         withCredentials: true,
//         headers: getAuthHeaders(),
//       });

//       if (res.data.success && res.data.messages) {
//         res.data.messages.forEach((msg) => {
//           dispatch(
//             addMessage({
//               contactId: msg.senderId === currentUser.id ? msg.recipientId : msg.senderId,
//               message: {
//                 id: msg._id,
//                 senderId: msg.senderId,
//                 text: msg.content,
//                 time: new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
//                 from: msg.senderId === currentUser.id ? "me" : "them",
//               },
//             })
//           );
//         });
//       }
//     } catch (error) {
//       console.log("failed to fetch msg", error);
//     }
//   };

//   fetchHistory();
// }, [activeContactId, currentUser?.id, dispatch, apiUrl]);

// useEffect(() => {
//   if (!currentUser?.id) return;

//   wsRef.current = new WebSocket(SOCKET_URL);

//   wsRef.current.onopen = () => {
//     if (wsRef.current.readyState === WebSocket.OPEN) {
//       wsRef.current.send(JSON.stringify({ type: "register", userId: currentUser.id }));
//     }
//   };

//   wsRef.current.onmessage = (event) => {
//     try {
//       const data = JSON.parse(event.data);
//       if (data.type === "chat-message") {
//         const { senderId, text, time, id } = data.message;
//         dispatch(addMessage({ contactId: senderId, message: { id, senderId, text, time, from: "them" } }));
//       }
//     } catch (e) {
//       console.error("WS parse error", e);
//     }
//   };

//   return () => wsRef.current?.close();
// }, [SOCKET_URL, currentUser?.id, dispatch]);

// const sendMessage = () => {
//   if (!inputText?.trim() || !activeContactId || !currentUser?.id) return;

//   const message = {
//     id: Date.now(),
//     senderId: currentUser.id,
//     recipientId: activeContactId,
//     text: inputText.trim(),
//     time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
//   };

//   if (wsRef.current?.readyState !== WebSocket.OPEN) return;
//   wsRef.current.send(JSON.stringify({ type: "chat-message", message }));

//   dispatch(addMessage({ contactId: activeContactId, message: { ...message, from: "me" } }));
//   dispatch(setInputText(""));
// };

// useEffect(() => {
//   if (msgs.length > prevLen.current) {
//     const lastId = msgs[msgs.length - 1].id;
//     setNewMsgIds((prev) => new Set(prev).add(lastId));

//     requestAnimationFrame(() => {
//       if (scrollRef.current) {
//         gsap.to(scrollRef.current, {
//           scrollTop: scrollRef.current.scrollHeight,
//           duration: 0.35,
//           ease: "power2.out",
//         });
//       }
//     });

//     setTimeout(() => {
//       setNewMsgIds((prev) => {
//         const next = new Set(prev);
//         next.delete(lastId);
//         return next;
//       });
//     }, 600);
//   }
//   prevLen.current = msgs.length;
// }, [msgs]);

// const ChatDisplay = () => {
//     const ref = useRef(null);

//   // entrance fade-in
//   useEffect(() => {
//     gsap.fromTo(ref.current,
//       { opacity: 0 },
//       { opacity: 1, duration: 0.35, ease: "power2.out", delay: 0.08 }
//     );
//   }, []);
//     return (
//        <div
//       ref={ref}
//       className="flex-1 overflow-y-auto flex flex-col gap-2.5 px-4 sm:px-7 py-4 sm:py-6"
//       style={{ overscrollBehavior: "contain" }}
//     >
//       {/* Date label */}
//       <div className="text-center mb-2">
//         <span className="text-[11px] text-[#33334a] bg-[#14141c] px-3 py-1 rounded-[20px] border border-[#1e1e2c]">
//           Today
//         </span>
//       </div>

//       {msgs.map((msg) => (
//         <MessageBubble
//           key={msg.id}
//           msg={msg}
//           contact={contact}
//           animate={newMsgIds.has(msg.id)}
//         />
//       ))}
//     </div>
//     )
//   }

//   return (
//     <div className={`${activeContactId ? "flex" : "hidden lg:flex"} min-w-0 h-full flex-1 flex-col bg-[#0b0b10]`}>
//       <ChatHeader contact={contact} />

      // <div ref={scrollRef} className="flex-1 overflow-y-auto">
      //   <ChatDisplay
      //     msgs={msgs}
      //     contact={contact}
      //     newMsgIds={newMsgIds}
      //     MessageBubble={MessageBubble}
      //   />
      // </div>

//       <InputBar
//         inputText={inputText}
//         dispatch={dispatch}
//         setInputText={setInputText}
//         sendMessage={sendMessage}
//       />
//     </div>
//   );
// };



import React, { useEffect, useMemo } from "react";
import { User, Mic, FileText, Check, CheckCheck } from "lucide-react";
import { dateDividerLabel, dateKey, timeLabel } from "../../utilites/ChatHelper";
import { addMessage } from "../../redux/slices/chatSlice";
import { useDispatch, useSelector } from "react-redux";
import { getAuthHeaders } from "../../utilites/communityHelper";
import axios from "axios";

function DateDivider({ label }) {
  return (
    <div className="flex items-center justify-center my-4">
      <span className="text-xs font-semibold text-slate-500 bg-slate-900 border border-slate-800 px-3 py-1 rounded-full tracking-wide">
        {label}
      </span>
    </div>
  );
}

function StatusFooter({ msg }) {
  const seen = msg.status === "seen";
  return (
    <div className="flex items-center justify-end gap-1.5 text-xs text-slate-500 mr-1 mb-2 mt-1">
      <span>Sent {timeLabel(msg.time)}</span>
      {seen && (
        <>
          <span className="opacity-50">·</span>
          <span>Seen {timeLabel(msg.seenAt)}</span>
        </>
      )}
      {seen ? <CheckCheck className="w-3.5 h-3.5 text-blue-500" /> : <Check className="w-3.5 h-3.5" />}
    </div>
  );
}

function VoiceBubble({ msg, mine }) {
  const bars = useMemo(
    () => Array.from({ length: 20 }, (_, i) => 6 + Math.round(Math.sin(i * 1.3) * 6 + 6)),
    []
  );
  const mm = Math.floor(msg.duration / 60);
  const ss = String(msg.duration % 60).padStart(2, "0");
  return (
    <div className="flex items-center gap-2 min-w-40">
      <Mic className="w-4 h-4 shrink-0" />
      <div className="flex items-center gap-0.5 h-5 flex-1">
        {bars.map((h, i) => (
          <span
            key={i}
            className={`w-0.5 rounded-full ${mine ? "bg-white/80" : "bg-slate-300/80"}`}
            style={{ height: `${h}px` }}
          />
        ))}
      </div>
      <span className="text-xs opacity-80 shrink-0">
        {mm}:{ss}
      </span>
    </div>
  );
}

function MessageBubble({ msg, mine, gsapReady }) {
  return (
    <div
      data-bubble-id={msg.id}
      className={`flex ${mine ? "justify-end" : "justify-start"} my-0.5 ${gsapReady ? "" : "animate-bubble-fallback"
        }`}
    >
      <div
        className={`max-w-[75%] md:max-w-[65%] px-3.5 py-2.5 text-[14.5px] leading-snug flex flex-col gap-1 ${mine
          ? "bg-linear-to-br from-blue-500 to-blue-600 text-white rounded-2xl rounded-br-md"
          : "bg-slate-800 border border-slate-700 text-slate-100 rounded-2xl rounded-bl-md"
          }`}
      >
        {msg.attachments &&
          msg.attachments.map((f, i) => (
            <div
              key={i}
              className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm ${mine ? "bg-white/15" : "bg-white/5"
                }`}
            >
              <FileText className="w-4 h-4 shrink-0" />
              <span className="truncate">{f.name}</span>
            </div>
          ))}
        {msg.type === "voice" ? (
          <VoiceBubble msg={msg} mine={mine} />
        ) : (
          msg.text && <span className="whitespace-pre-wrap wrap-break-word">{msg.text}</span>
        )}
        <span className="self-end text-[10.5px] opacity-65">{timeLabel(msg.time)}</span>
      </div>
    </div>
  );
}

function TypingIndicator({ innerRef }) {
  return (
    <div ref={innerRef} className="flex justify-start my-1.5">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-bl-md px-4 py-3 flex gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 typing-dot" style={{ animationDelay: "0ms" }} />
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 typing-dot" style={{ animationDelay: "150ms" }} />
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 typing-dot" style={{ animationDelay: "300ms" }} />
      </div>
    </div>
  );
}

export function ChatArea({
  searchingWithNoText,
  typingContactId,
  gsapReady,
  messagesRef,
  typingRef,
}) {

  const apiUrl = import.meta.env.VITE_API_URL || "";

  const dispatch = useDispatch();

  const currentUser = useSelector((s) => s.dashboard.currentUser);
  const { activeContactId, messages } = useSelector((s) => s.chat ?? null);
  console.log("activeContactId", activeContactId, "messages", messages);

  const msgs = useMemo(() => (messages && messages[activeContactId]) || [], [messages, activeContactId]);
  
  useEffect(() => {
    if (!activeContactId || !currentUser?.id) return;

    const fetchHistory = async () => {
        try {
          const res = await axios.get(`${apiUrl}/api/chat/${activeContactId}`, {
            withCredentials: true,
            headers: getAuthHeaders(),
          });
  
          if (res.data.success && res.data.messages) {
            res.data.messages.forEach((msg) => {
              const senderId = String(msg.senderId);
              const recipientId = String(msg.recipientId);
              const isMine = senderId === String(currentUser.id);
              dispatch(
                addMessage({
                  contactId: isMine ? recipientId : senderId,
                  message: {
                    id: msg._id,
                    senderId,
                    recipientId,
                    text: msg.content,
                    time: new Date(msg.timestamp),
                    from: isMine ? "me" : "them",
                  },
                })
              );
            });
          }
        } catch (error) {
          console.log("failed to fetch msg", error);
        }
      };

    fetchHistory();
  }, [activeContactId, currentUser?.id, dispatch, apiUrl]);

    return (
      <div ref={messagesRef} className="flex-1 min-h-0 overflow-y-auto overscroll-contain msgs-scroll px-4 md:px-6 py-5">
        {!activeContactId ? (
          <div className="h-full flex flex-col items-center justify-center gap-3 text-center px-8">
            <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-slate-600 mb-1">
              <User className="w-7 h-7" />
            </div>
            <h3 className="font-extrabold text-slate-300 text-base">Select a conversation</h3>
            <p className="text-sm text-slate-500 max-w-xs">Choose a contact from the list to start chatting.</p>
          </div>
        ) : (
          <>
            {msgs.map((m, idx) => {
              const showDivider = idx === 0 || dateKey(m.time) !== dateKey(msgs[idx - 1].time);
              const isLast = idx === msgs.length - 1;
              return (
                <React.Fragment key={m.id}>
                  {showDivider && <DateDivider label={dateDividerLabel(m.time)} />}
                  <MessageBubble msg={m} mine={m.from === "me"} gsapReady={gsapReady} />
                  {isLast && m.from === "me" && !searchingWithNoText && <StatusFooter msg={m} />}
                </React.Fragment>
              );
            })}
            {typingContactId === activeContactId && !searchingWithNoText && <TypingIndicator innerRef={typingRef} />}
          </>
        )}
      </div>
    );
  }