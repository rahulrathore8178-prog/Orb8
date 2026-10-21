import { useEffect, useRef } from "react";
import gsap from "gsap";

const ChatDisplay = ({ msgs = [], contact, newMsgIds, MessageBubble }) => {
  const ref = useRef(null);

  useEffect(() => {
    gsap.fromTo(ref.current, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "power2.out" });
  }, []);

  return (
    <div
      ref={ref}
      className="relative flex min-h-full flex-col gap-2.5 px-3 sm:px-5 lg:px-7 py-4 sm:py-6"
      style={{ overscrollBehavior: "contain" }}
    >
      <div className="mb-2 text-center">
        <span className="rounded-full border border-[#1e1e2c] bg-black px-3 py-1 text-[11px] text-[#33334a]">
          Today
        </span>
      </div>

      {msgs.map((msg) => (
        <MessageBubble key={msg.id} msg={msg} contact={contact} animate={newMsgIds?.has(msg.id)} />
      ))}
    </div>
  );
};

export default ChatDisplay;