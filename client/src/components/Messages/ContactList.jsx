// import { useDispatch, useSelector } from "react-redux";
// import { setActiveContact, setSearchQuery } from "../../redux/slices/chatSlice";
// import { Avatar } from "./ChatArea";

// export const ContactList = () => {
// const dispatch = useDispatch();
// const { searchQuery, contacts } = useSelector((s) => s.chat ?? ' ');
// const { activeContactId } = useSelector((s) => s.chat ?? null);

// const filtered = (contacts || []).filter((c) =>
//   c.name.toLowerCase().includes((searchQuery || "").toLowerCase())
// );

//   return (
// <aside
//   className={`${
//     activeContactId ? "hidden lg:flex" : "flex"
//   } h-full w-full lg:w-[320px] lg:min-w-[320px] lg:max-w-[320px] flex-col bg-[#0f0f13] border-r border-[#1c1c28]`}
// >
//       <div className="shrink-0 border-b border-[#1c1c28] px-4 sm:px-5 py-4">
//         <div className="mb-4 flex items-center justify-between">
//           <h2 className="text-lg font-bold text-[#f0f0f5]">Messages</h2>
//         </div>

//         <div className="relative">
//           <input
//             value={searchQuery}
//             onChange={(e) => dispatch(setSearchQuery(e.target.value))}
//             placeholder="Search"
//             className="w-full rounded-xl border border-[#2a2a3a] bg-[#1a1a24] py-2 pl-9 pr-3 text-sm text-[#d0d0e0] outline-none"
//           />
//           <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#44445a]">⌕</span>
//         </div>
//       </div>

//       <div className="flex-1 overflow-y-auto p-2">
//         {filtered.map((contact) => (
//           <button
//             key={contact.id}
//             onClick={() => dispatch(setActiveContact(contact.id))}
//             className={`mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
//               activeContactId === contact.id ? "bg-[#1e1e2e]" : "hover:bg-[#16161f]"
//             }`}
//           >
//             <Avatar contact={contact} size={42} />
//             <div className="min-w-0 flex-1">
//               <div className="mb-0.5 flex items-center justify-between">
//                 <span className="truncate text-sm font-semibold text-[#e8e8f2]">{contact.name}</span>
//                 <span className="ml-2 shrink-0 text-[11px] text-[#555568]">{contact.time}</span>
//               </div>
//               <div className="flex items-center justify-between">
//                 <span className="truncate text-xs text-[#777790]">{contact.lastMsg}</span>
//                 {contact.unread > 0 && (
//                   <span className="ml-2 rounded-full bg-[#6C63FF] px-2 py-0.5 text-[10px] font-bold text-white">
//                     {contact.unread}
//                   </span>
//                 )}
//               </div>
//             </div>
//           </button>
//         ))}
//       </div>
//     </aside>
//   );
// };





/**
 * Sidebar.jsx
 * -----------------------------------------------------------------------
 * The collapsible / drawer contact list on the left, plus its mobile
 * backdrop. All state (contacts, search query, open/closed, active id)
 * still lives in MessagesApp.jsx and is passed down as props — this file
 * only contains markup that was cut out of the original render tree
 * as-is, with identical classNames and structure.
 * -----------------------------------------------------------------------
 */

import React from "react";
import { Search, X } from "lucide-react";
import { contactTimeLabel } from "../../utilites/ChatHelper";
import { Avatar } from "./ChatHeader";
import { useDispatch, useSelector } from "react-redux";
import { setSearchQuery } from "../../redux/slices/chatSlice";


export function Sidebar({
  isMobile,
  sidebarOpen,
  setSidebarOpen,
  contactQuery,
  selectContact,
}) {
  const dispatch = useDispatch();
  const { searchQuery, contacts } = useSelector((s) => s.chat ?? '');
  const { activeContactId } = useSelector((s) => s.chat ?? null);

  const filtered = (contacts || []).filter((c) =>
    c.name.toLowerCase().includes((searchQuery || "").toLowerCase())
  );
  console.log('filtered', filtered)
  console.log('contacts', contacts)
  return (
    <>
      {/* ================= SIDEBAR ================= */}
      <aside
        className={`fixed md:static inset-0 md:inset-auto z-40 md:z-auto w-full flex-shrink-0 bg-black border-slate-800 flex flex-col overflow-hidden transition-all duration-300 ease-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0
          ${sidebarOpen ? "md:w-80 md:border-r" : "md:w-0 md:border-r-0"}`}
      >
        <div className="flex-shrink-0 flex items-center justify-between px-4 pt-4 pb-3 min-w-[320px] md:min-w-[320px]">
          <div className="flex items-center gap-2 font-extrabold text-xl tracking-tight">
            <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_0_4px_rgba(59,130,246,0.18)]" />
            Messages
          </div>
          <button
            className="md:hidden w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-800 hover:text-slate-100"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close contacts"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-shrink-0 px-4 pb-3 min-w-[320px]">
          <div className="flex items-center gap-2 bg-slate-800/70 border border-slate-700 rounded-xl px-3 py-2 focus-within:border-blue-500 transition-colors">
            <Search className="w-4 h-4 text-slate-500 shrink-0" />
            <input
              type="text"
              value={contactQuery}
              onChange={(e) => setContactQuery(e.target.value)}
              placeholder="Search conversations"
              className="bg-transparent border-none outline-none text-sm w-full placeholder:text-slate-500"
            />
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto contacts-scroll px-2 pb-3 min-w-[320px]">
          {filtered.map((c) => {
            const active = c.id === activeContactId;
            const unread = c.unreadCount > 0;
            return (
              <button
                key={c.id}
                onClick={() => selectContact(c.id)}
                className={`w-full flex items-center gap-3 px-2 py-2.5 rounded-xl text-left transition-colors ${active ? "bg-blue-500/15" : "hover:bg-slate-800/70"
                  }`}
              >
                <Avatar name={c.name} online={c.online} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className={`text-sm truncate ${unread ? "font-semibold text-slate-100" : "font-semibold text-slate-200"}`}>
                      {c.name}
                    </span>
                    {/* <span className="text-xs text-slate-500 shrink-0">
                      {(c.lastTime ?? c.time) ? contactTimeLabel(c.lastTime ?? c.time) : ""}
                    </span> */}
                  </div>
                  <div className="flex items-center justify-between gap-2 mt-0.5">
                    <span className={`text-sm truncate ${unread ? "text-slate-200 font-medium" : "text-slate-400"}`}>
                      {c.lastMsg}
                    </span>
                    {unread && (
                      <span className="shrink-0 min-w-[18px] h-[18px] px-1.5 rounded-full bg-blue-500 text-white text-[11px] font-bold flex items-center justify-center">
                        {c.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      {/* Mobile backdrop */}
      {isMobile && sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30" onClick={() => setSidebarOpen(false)} />
      )}
    </>
  );
}