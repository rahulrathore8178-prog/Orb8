// import { useEffect, useRef } from "react";
// import gsap from "gsap";
// import { Avatar } from "./ChatArea";
// import { useDispatch } from "react-redux";
// import { setActiveContact } from "../../redux/slices/chatSlice";

// const ChatHeader = ({ contact }) => {
//   const ref = useRef(null);
//   const dispatch = useDispatch();

//   useEffect(() => {
//     gsap.fromTo(ref.current, { opacity: 0, y: -12 }, { opacity: 1, y: 0, duration: 0.35, ease: "power3.out" });
//   }, []);

//   return (
//     <div
//       ref={ref}
//       className="flex shrink-0 items-center gap-3.5 border-b border-[#1c1c28] bg-[#0b0b10] px-3 sm:px-5 py-3 sm:py-4"
//     >
//       <button
//         className="lg:hidden rounded-md p-1.5 text-[#7d7d9a] hover:text-white"
//         onClick={() => dispatch(setActiveContact(null))}
//         aria-label="Back to contacts"
//       >
//         ←
//       </button>

//       <Avatar contact={contact} size={40} />

//       <div className="min-w-0 flex-1">
//         <div className="truncate text-[15px] sm:text-[16px] font-bold text-[#eeeefc]">{contact.name}</div>
//         <div className={`mt-px text-[12px] ${contact.online ? "text-[#4ade80]" : "text-[#44445a]"}`}>
//           {contact.online ? "Active now" : "Offline"}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ChatHeader;


/**
 * ChatHeader.jsx
 * -----------------------------------------------------------------------
 * The chat pane header: sidebar toggle, recipient avatar/name with the
 * contact-switcher dropdown, inline search, call buttons, and the "more"
 * menu. Markup and classNames are unchanged from the original file —
 * state and handlers are passed down as props from MessagesApp.jsx.
 * -----------------------------------------------------------------------
 */

import React from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  Menu,
  ArrowLeft,
  Search,
  X,
  MoreVertical,
  ChevronDown,
  User,
  Ban,
  Phone,
  Video,
} from "lucide-react";
import { colorForName, initials, relativeLastSeen } from "../../utilites/ChatHelper";
import { apiUrl, getAuthHeaders } from "../../utilites/DashboardHelper";
import { useFeedback } from "../shared/Feedback";
import { fetchContacts, setActiveContact } from "../../redux/slices/chatSlice";
// import { relativeLastSeen } from "./helpers";
// import { colorForName, initials } from "./helpers";
 
export function Avatar({ name, online, size = "md" }) {
  const sizes = {
    xs: "w-8 h-8 text-xs",
    sm: "w-10 h-10 text-xs",
    md: "w-12 h-12 text-sm",
    lg: "w-16 h-16 text-lg",
  };
  const dotSizes = { xs: "w-2 h-2", sm: "w-2.5 h-2.5", md: "w-3 h-3", lg: "w-3.5 h-3.5" };
  return (
    <div className={`relative shrink-0 ${sizes[size]}`}>
      <div
        className={`w-full h-full rounded-full flex items-center justify-center font-bold text-white ${colorForName(
          name
        )}`}
      >
        {initials(name)}
      </div>
      <span
        className={`absolute -right-0.5 -bottom-0.5 rounded-full ring-2 ring-slate-900 ${dotSizes[size]} ${
          online ? "bg-emerald-500" : "bg-slate-500"
        }`}
      />
    </div>
  );
}

export function ChatHeader({
  isMobile,
  sidebarOpen,
  setSidebarOpen,
  activeContact,
  contacts,
  activeContactId,
  selectContact,
  chatSearchOpen,
  setChatSearchOpen,
  chatSearchQuery,
  setChatSearchQuery,
  switcherOpen,
  setSwitcherOpen,
  switcherWrapRef,
  moreMenuOpen,
  setMoreMenuOpen,
  moreWrapRef,
  setEmojiOpen,
  showToast,
  setContacts,
  onVoiceCall,
  onVideoCall,
}) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { toast, confirm } = useFeedback();

  const blockContact = async () => {
    setMoreMenuOpen(false);
    const approved = await confirm({
      title: `Block ${activeContact.name}?`,
      message: 'You will no longer see each other or be able to message.',
      confirmLabel: 'Block',
      destructive: true,
    });
    if (!approved) return;
    try {
      await axios.post(`${apiUrl}/api/social/block/${activeContactId}`, {}, { withCredentials: true, headers: getAuthHeaders() });
      dispatch(setActiveContact(null));
      dispatch(fetchContacts());
      toast(`${activeContact.name} has been blocked`);
    } catch (error) {
      toast(error.response?.data?.message || 'Could not block this person. Please try again.', 'error');
    }
  };

  return (
    <header className="flex-shrink-0 min-h-[68px] flex items-center gap-1 px-3 md:px-4 bg-black border-b border-slate-800 relative z-20">
      <button
        className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-800 hover:text-slate-100 shrink-0"
        onClick={() => setSidebarOpen((v) => !v)}
        aria-label={isMobile ? "Back to contacts" : "Toggle contact list"}
      >
        {isMobile ? <ArrowLeft className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {!activeContact ? (
        <div className="font-extrabold text-lg pl-1">Messages</div>
      ) : chatSearchOpen ? (
        <>
          <div className="flex items-center gap-2 flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 mx-1">
            <Search className="w-4 h-4 text-slate-500 shrink-0" />
            <input
              autoFocus
              type="text"
              value={chatSearchQuery}
              onChange={(e) => setChatSearchQuery(e.target.value)}
              placeholder={`Search in conversation with ${activeContact.name}`}
              className="bg-transparent border-none outline-none text-sm w-full placeholder:text-slate-500"
            />
          </div>
          <button
            className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-800 hover:text-slate-100 shrink-0"
            onClick={() => {
              setChatSearchOpen(false);
              setChatSearchQuery("");
            }}
            aria-label="Close search"
          >
            <X className="w-5 h-5" />
          </button>
        </>
      ) : (
        <>
          <div ref={switcherWrapRef} className="relative flex-1 min-w-0">
            <button
              onClick={() => {
                setSwitcherOpen((v) => !v);
                setMoreMenuOpen(false);
                setEmojiOpen(false);
              }}
              className="flex items-center gap-2.5 flex-1 min-w-0 py-1.5 pl-1 pr-2 rounded-xl hover:bg-slate-800/70 transition-colors text-left w-full"
            >
              <Avatar name={activeContact.name} online={activeContact.online} size="sm" />
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <span className="font-bold text-[15px] truncate">{activeContact.name}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                </div>
                <div className={`text-xs ${activeContact.online ? "text-emerald-400" : "text-slate-400"}`}>
                  {activeContact.online ? "Online" : relativeLastSeen(activeContact.lastSeen || activeContact.lastTime)}
                </div>
              </div>
            </button>

            {switcherOpen && (
              <div className="popover-anim absolute left-0 top-[calc(100%+8px)] w-72 md:w-80 max-h-96 overflow-y-auto bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-1.5 z-50">
                {contacts.map((c) => {
                  const active = c.id === activeContactId;
                  return (
                    <button
                      key={c.id}
                      onClick={() => selectContact(c.id)}
                      className={`w-full flex items-center gap-2.5 p-2 rounded-lg text-left transition-colors ${
                        active ? "bg-blue-500/15" : "hover:bg-slate-700/70"
                      }`}
                    >
                      <Avatar name={c.name} online={c.online} size="xs" />
                      <div className="min-w-0">
                        <div className="text-sm font-semibold truncate">{c.name}</div>
                        <div className="text-xs text-slate-400 truncate max-w-[190px]">{c.lastMessage}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex items-center gap-0.5 shrink-0">
            <button
              className="w-11 h-11 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-800 hover:text-slate-100"
              onClick={() => setChatSearchOpen(true)}
              aria-label="Search in conversation"
            >
              <Search className="w-[18px] h-[18px]" />
            </button>
            <button
              className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-800 hover:text-slate-100"
              onClick={() => showToast(`Calling ${activeContact.name}…`)}
              aria-label="Voice call"
            >
              <Phone onClick={onVoiceCall}  className="w-[18px] h-[18px]" />
            </button>
            <button
              className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-800 hover:text-slate-100"
              onClick={() => showToast(`Starting video call with ${activeContact.name}…`)}
              aria-label="Video call"
            >
              <Video onClick={onVideoCall} className="w-[18px] h-[18px]" />
            </button>
            <div ref={moreWrapRef} className="relative">
              <button
                className="w-11 h-11 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-800 hover:text-slate-100"
                onClick={() => {
                  setMoreMenuOpen((v) => !v);
                  setSwitcherOpen(false);
                  setEmojiOpen(false);
                }}
                aria-label="More options"
              >
                <MoreVertical className="w-[18px] h-[18px]" />
              </button>
              {moreMenuOpen && (
                <div className="popover-anim absolute right-0 top-[calc(100%+8px)] w-52 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-1.5 z-50">
                  <button
                    className="w-full min-h-11 flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium hover:bg-slate-700/70"
                    onClick={() => {
                      setMoreMenuOpen(false);
                      navigate(`/socialprofile/${activeContactId}`);
                    }}
                  >
                    <User className="w-4 h-4 text-slate-400" /> View profile
                  </button>
                  <div className="h-px bg-slate-700 my-1.5 mx-1" />
                  <button
                    className="w-full min-h-11 flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium text-rose-400 hover:bg-slate-700/70"
                    onClick={blockContact}
                  >
                    <Ban className="w-4 h-4 text-rose-400" /> Block
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </header>
  );
}