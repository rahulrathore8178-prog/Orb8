import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaCheck, FaTimes } from 'react-icons/fa';
import { fetchContacts, sendChatMessage } from '../../redux/slices/chatSlice';

export default function SharePostModal({ postId, onClose }) {
  const dispatch = useDispatch();
  const contacts = useSelector(state => state.chat.contacts);
  const [sentTo, setSentTo] = useState(new Set());
  const [error, setError] = useState('');

  useEffect(() => {
    dispatch(fetchContacts());
  }, [dispatch]);

  const shareWith = async (contactId) => {
    try {
      await dispatch(sendChatMessage({ contactId, text: '', sharedPostId: postId })).unwrap();
      setSentTo(current => new Set(current).add(contactId));
    } catch (shareError) {
      setError(shareError);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-sm overflow-hidden rounded-lg border border-white/10 bg-[#111318] shadow-2xl"
        onClick={event => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <h2 className="text-sm font-semibold text-white">Share post</h2>
          <button type="button" onClick={onClose} className="p-1 text-white/60 hover:text-white" aria-label="Close">
            <FaTimes size={14} />
          </button>
        </div>
        <div className="max-h-80 overflow-y-auto p-2">
          {contacts.length === 0 && <p className="px-3 py-6 text-center text-sm text-white/45">No contacts available.</p>}
          {contacts.map(contact => {
            const sent = sentTo.has(contact.id);
            return (
              <button
                key={contact.id}
                type="button"
                onClick={() => !sent && shareWith(contact.id)}
                className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left transition-colors hover:bg-white/5"
              >
                {contact.profilePic ? (
                  <img src={contact.profilePic} alt="" className="h-9 w-9 rounded-full object-cover" />
                ) : (
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-xs font-semibold text-white">
                    {contact.initials}
                  </span>
                )}
                <span className="min-w-0 flex-1 truncate text-sm text-white">{contact.name}</span>
                {sent ? <FaCheck className="text-cyan-400" size={14} /> : <span className="text-xs text-cyan-400">Send</span>}
              </button>
            );
          })}
        </div>
        {error && <p className="border-t border-white/10 px-4 py-2 text-xs text-red-400">{error}</p>}
      </div>
    </div>
  );
}