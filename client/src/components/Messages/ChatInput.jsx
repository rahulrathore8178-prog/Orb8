// import { useEffect, useRef, useState } from "react";
// import gsap from "gsap";

// const EMOJIS = ["😀","😂","😍","🥺","😎","🤔","😭","😅","🙏","❤️","🔥","✨","👍","👀","💀","🎉","😤","🥳","💯","🫡"];

// function EmojiPicker({ onSelect, pickerRef }) {
//   return (
//     <div
//       ref={pickerRef}
//       className="absolute bottom-[calc(100%+10px)] left-0 z-50 grid min-w-[210px] grid-cols-6 gap-1 rounded-xl border border-[#2a2a3a] bg-[#16161f] p-2 shadow-2xl"
//     >
//       {EMOJIS.map((emoji) => (
//         <button
//           key={emoji}
//           onClick={() => onSelect(emoji)}
//           className="rounded-md p-1 text-xl leading-none hover:bg-[#1e1e2c]"
//         >
//           {emoji}
//         </button>
//       ))}
//     </div>
//   );
// }

// const InputBar = ({ inputText, dispatch, setInputText, sendMessage }) => {
//   const [emojiOpen, setEmojiOpen] = useState(false);
//   const pickerRef = useRef(null);
//   const wrapRef = useRef(null);
//   const sendRef = useRef(null);
//   const inputRef = useRef(null);
//   const barRef = useRef(null);

//   const closeEmoji = () => {
//     if (!pickerRef.current) return setEmojiOpen(false);
//     gsap.to(pickerRef.current, {
//       opacity: 0, scale: 0.82, y: 6, duration: 0.16, ease: "power2.in",
//       onComplete: () => setEmojiOpen(false),
//     });
//   };

//   const handleEmojiSelect = (emoji) => {
//     dispatch(setInputText(inputText + emoji));
//     inputRef.current?.focus();
//   };

//   const handleSend = () => {
//     gsap.fromTo(sendRef.current, { scale: 1 }, { scale: 1.12, duration: 0.1, yoyo: true, repeat: 1 });
//     sendMessage();
//   };

//   useEffect(() => {
//     gsap.fromTo(barRef.current, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.3, ease: "power3.out" });
//   }, []);

//   useEffect(() => {
//     const handler = (e) => {
//       if (wrapRef.current && !wrapRef.current.contains(e.target)) closeEmoji();
//     };
//     if (emojiOpen) document.addEventListener("mousedown", handler);
//     return () => document.removeEventListener("mousedown", handler);
//   }, [emojiOpen]);

//   return (
//     <div ref={barRef} className="shrink-0 border-t border-[#1c1c28] bg-[#0b0b10] px-3 sm:px-5 py-3">
//       <div className="flex items-center gap-2.5">
//         <div ref={wrapRef} className="relative shrink-0">
//           <button
//             onClick={() => (emojiOpen ? closeEmoji() : setEmojiOpen(true))}
//             className={`rounded-lg p-2 ${emojiOpen ? "text-[#6C63FF]" : "text-[#44445a] hover:text-[#9898b8]"}`}
//           >
//             😊
//           </button>
//           {emojiOpen && <EmojiPicker onSelect={handleEmojiSelect} pickerRef={pickerRef} />}
//         </div>

//         <input
//           ref={inputRef}
//           value={inputText}
//           onChange={(e) => dispatch(setInputText(e.target.value))}
//           onKeyDown={(e) => e.key === "Enter" && handleSend()}
//           placeholder="Write a message..."
//           className="h-11 flex-1 rounded-full border border-[#2a2a3a] bg-[#16161f] px-4 text-[14px] text-[#d0d0e0] outline-none focus:border-[#6C63FF55]"
//         />

//         <button
//           ref={sendRef}
//           onClick={handleSend}
//           className="grid h-11 w-11 place-items-center rounded-full bg-[#6C63FF] text-white hover:bg-[#5a52e0]"
//         >
//           ➤
//         </button>
//       </div>
//     </div>
//   );
// };

// export default InputBar;



/**
 * InputBar.jsx
 * -----------------------------------------------------------------------
 * The message composer: emoji picker, attachment clip, voice recording,
 * text input, and send button (plus the hidden file <input>). Markup and
 * classNames are unchanged from the original file — all state/handlers
 * are passed down as props from MessagesApp.jsx.
 * -----------------------------------------------------------------------
 */

import React from "react";
import { Smile, Paperclip, Send, Mic, FileText, X, Trash2 } from "lucide-react";
import { EMOJIS } from "../../utilites/ChatHelper";
import { useSelector } from "react-redux";

export function InputBar({
  activeContactId,
  drafts,
  setDrafts,
  pendingAttachments,
  removeAttachment,
  recording,
  setRecording,
  recordSeconds,
  setRecordSeconds,
  emojiOpen,
  setEmojiOpen,
  setSwitcherOpen,
  setMoreMenuOpen,
  emojiWrapRef,
  textareaRef,
  fileInputRef,
  insertEmoji,
  sendMessage,
  stopRecordingSend,
  hasComposerContent,
  handleFileChange,
}) {
  return (
    <>
      <footer className="flex-shrink-0 bg-black border-t border-slate-800 px-3 md:px-4 py-2.5">
        {pendingAttachments.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {pendingAttachments.map((f, i) => (
              <div
                key={i}
                className="flex items-center gap-1.5 bg-black border border-slate-700 rounded-lg pl-2.5 pr-1.5 py-1 text-xs text-slate-300"
              >
                <FileText className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate max-w-[140px]">{f.name}</span>
                <button
                  className="text-slate-500 hover:text-rose-400 rounded-full p-0.5"
                  onClick={() => removeAttachment(i)}
                  aria-label="Remove attachment"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {recording ? (
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2.5 bg-black border border-slate-700 rounded-full pl-4 pr-2.5 py-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 rec-pulse shrink-0" />
              <span className="text-sm font-medium tabular-nums shrink-0">
                {Math.floor(recordSeconds / 60)}:{String(recordSeconds % 60).padStart(2, "0")}
              </span>
              <span className="text-xs text-slate-500 flex-1">Recording voice message…</span>
              <button
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-700 hover:text-rose-400"
                onClick={() => {
                  setRecording(false);
                  setRecordSeconds(0);
                }}
                aria-label="Cancel recording"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <button
              className="w-10 h-10 rounded-full bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center shrink-0 transition-colors"
              onClick={stopRecordingSend}
              aria-label="Send voice message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-end gap-1">
            <div ref={emojiWrapRef} className="relative">
              <button
                className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-800 hover:text-slate-100 shrink-0"
                onClick={() => {
                  setEmojiOpen((v) => !v);
                  setSwitcherOpen(false);
                  setMoreMenuOpen(false);
                }}
                aria-label="Insert emoji"
              >
                <Smile className="w-[19px] h-[19px]" />
              </button>
              {emojiOpen && (
                <div className="popover-anim absolute left-0 bottom-[calc(100%+10px)] w-72 max-h-56 overflow-y-auto bg-black border border-slate-700 rounded-xl shadow-2xl p-2 grid grid-cols-8 gap-0.5 z-50">
                  {EMOJIS.map((e, i) => (
                    <button
                      key={i}
                      onClick={() => insertEmoji(e)}
                      className="text-lg p-1.5 rounded-lg hover:bg-slate-700 leading-none"
                    >
                      {e}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-800 hover:text-slate-100 shrink-0"
              onClick={() => fileInputRef.current?.click()}
              aria-label="Attach file"
            >
              <Paperclip className="w-[19px] h-[19px]" />
            </button>

            <div className="flex-1 flex items-end gap-1.5 bg-black border border-slate-700 focus-within:border-blue-500 rounded-3xl pl-4 pr-1.5 py-1.5 transition-colors">
              <textarea
                ref={textareaRef}
                rows={1}
                value={drafts[activeContactId] || ""}
                onChange={(e) => setDrafts((d) => ({ ...d, [activeContactId]: e.target.value }))}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder={`Message ${activeContactId}`}
                className="flex-1 bg-transparent border-none outline-none resize-none text-[14.5px] leading-snug py-1.5 max-h-[120px] placeholder:text-slate-500"
              />
            </div>

            {hasComposerContent ? (
              <button
                className="w-10 h-10 rounded-full bg-blue-500 hover:bg-blue-600 active:scale-95 text-white flex items-center justify-center shrink-0 transition-all"
                onClick={sendMessage}
                aria-label="Send message"
              >
                <Send className="w-[18px] h-[18px]" />
              </button>
            ) : (
              <button
                className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-800 hover:text-slate-100 shrink-0"
                onClick={() => setRecording(true)}
                aria-label="Record voice message"
              >
                <Mic className="w-[19px] h-[19px]" />
              </button>
            )}
          </div>
        )}
      </footer>

      <input ref={fileInputRef} type="file" multiple hidden onChange={handleFileChange} />
    </>
  );
}