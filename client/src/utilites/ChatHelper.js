/**
 * helpers.js
 * -----------------------------------------------------------------------
 * Pure, framework-free helpers + seed data shared across the messaging
 * components. Nothing in this file was changed — it's the exact same
 * logic that used to live at the top of the single MessagesApp.jsx file.
 * -----------------------------------------------------------------------
 */

let _idCounter = 0;
export const mid = () => `m${++_idCounter}`;

export function daysAgo(n, h, m) {
  const d = new Date();
  d.setHours(h, m, 0, 0);
  d.setDate(d.getDate() - n);
  return d;
}

export function timeLabel(d) {
  const date = d instanceof Date ? d : new Date(d);
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}
export function dateKey(d) {
  const date = d instanceof Date ? d : new Date(d);
  return date.toDateString();
}
export function dateDividerLabel(d) {
  const date = d instanceof Date ? d : new Date(d);
  const today = new Date();
  if (dateKey(date) === dateKey(today)) return "Today";
  const y = new Date();
  y.setDate(y.getDate() - 1);
  if (dateKey(date) === dateKey(y)) return "Yesterday";
  const opts = { weekday: "long", month: "long", day: "numeric" };
  if (date.getFullYear() !== today.getFullYear()) opts.year = "numeric";
  return date.toLocaleDateString(undefined, opts);
}
export function contactTimeLabel(d) {
  const today = new Date();
  if (dateKey(d) === dateKey(today)) return timeLabel(d);
  const y = new Date();
  y.setDate(y.getDate() - 1);
  if (dateKey(d) === dateKey(y)) return "Yesterday";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
export function relativeLastSeen(d) {
  const mins = Math.round((Date.now() - d.getTime()) / 60000);
  if (mins < 1) return "Last seen just now";
  if (mins < 60) return `Last seen ${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `Last seen ${hrs}h ago`;
  const days = Math.round(hrs / 24);
  return days === 1 ? "Last seen yesterday" : `Last seen ${days}d ago`;
}

export const AVATAR_COLORS = [
  "bg-blue-500",
  "bg-teal-500",
  "bg-purple-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-emerald-500",
  "bg-indigo-500",
];
export function colorForName(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}
export function initials(name) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase();
}

export const EMOJIS = [
  "😀","😁","😂","🤣","😊","😍","😘","😉","😎","🤔","😴","😢","😭","😡","🥳",
  "👍","👎","👏","🙏","💪","🔥","✨","🎉","❤️","💙","💯","✅","🤝","🙌","👀",
  "😅","🤗","😇","🙃","😐","😬","🤯","🥺","😱","🎨",
];

export function buildContacts() {
  const raw = [
    {
      id: "c1",
      name: "Maya Chen",
      online: true,
      lastSeen: null,
      unreadCount: 0,
      messages: [
        { id: mid(), sender: "them", time: daysAgo(3, 10, 15), text: "Hey! Are we still on for the design review Thursday?" },
        { id: mid(), sender: "me", time: daysAgo(3, 10, 42), text: "Yes, 2 PM works for me. I'll send the updated mockups tonight." },
        { id: mid(), sender: "them", time: daysAgo(1, 9, 20), text: "Just saw the mockups, they look great! Quick question about the color palette though." },
        { id: mid(), sender: "me", time: daysAgo(1, 9, 35), text: "Sure, what's up?" },
        { id: mid(), sender: "them", time: daysAgo(1, 9, 41), text: "The accent blue feels a little too saturated on the dark background. Might strain the eyes for long sessions." },
        { id: mid(), sender: "me", time: daysAgo(1, 10, 2), text: "Good catch, I'll tone it down a notch and share a revised version tomorrow." },
        { id: mid(), sender: "them", time: daysAgo(0, 9, 5), text: "Morning! Any update on the palette?" },
        { id: mid(), sender: "me", time: daysAgo(0, 9, 48), text: "Just finished it, sending over now 🎨" },
        { id: mid(), sender: "them", time: daysAgo(0, 10, 10), text: "Looks so much better! Approved from my side ✅" },
        { id: mid(), sender: "me", time: daysAgo(0, 11, 3), text: "Awesome, thank you! I'll get it merged this afternoon.", status: "seen", seenAt: daysAgo(0, 11, 37) },
      ],
    },
    {
      id: "c2",
      name: "Jordan Patel",
      online: false,
      lastSeen: daysAgo(0, 10, 0),
      unreadCount: 3,
      messages: [
        { id: mid(), sender: "them", time: daysAgo(1, 14, 0), text: "Can you review the PR when you get a chance?" },
        { id: mid(), sender: "me", time: daysAgo(1, 16, 20), text: "On it, will finish today." },
        { id: mid(), sender: "them", time: daysAgo(0, 8, 0), text: "Bumping this — also found 2 more edge cases." },
        { id: mid(), sender: "them", time: daysAgo(0, 8, 1), text: "Left comments inline." },
        { id: mid(), sender: "them", time: daysAgo(0, 8, 2), text: "Let me know if anything's unclear!" },
      ],
    },
    {
      id: "c3",
      name: "Sam Rivera",
      online: true,
      lastSeen: null,
      unreadCount: 0,
      messages: [
        { id: mid(), sender: "them", time: daysAgo(0, 7, 30), text: "Lunch later?" },
        { id: mid(), sender: "me", time: daysAgo(0, 7, 45), text: "Definitely, 12:30?", status: "seen", seenAt: daysAgo(0, 7, 46) },
        { id: mid(), sender: "them", time: daysAgo(0, 7, 46), text: "Perfect 👍" },
      ],
    },
    {
      id: "c4",
      name: "Priya Nair",
      online: false,
      lastSeen: daysAgo(1, 19, 0),
      unreadCount: 1,
      messages: [
        { id: mid(), sender: "me", time: daysAgo(2, 12, 0), text: "Sent over the invoice, let me know if it looks right." },
        { id: mid(), sender: "them", time: daysAgo(1, 18, 0), text: "Got it, looks good. Processing payment now." },
        { id: mid(), sender: "them", time: daysAgo(1, 18, 30), text: "Just sent the confirmation to your email." },
      ],
    },
    {
      id: "c5",
      name: "Alex Thompson",
      online: true,
      lastSeen: null,
      unreadCount: 0,
      messages: [
        { id: mid(), sender: "them", time: daysAgo(0, 6, 0), text: "gm ☀️" },
        { id: mid(), sender: "me", time: daysAgo(0, 9, 0), text: "Morning! Ready for the demo?" },
        { id: mid(), sender: "them", time: daysAgo(0, 9, 2), text: "Born ready 😤" },
      ],
    },
    {
      id: "c6",
      name: "Riya Kapoor",
      online: false,
      lastSeen: daysAgo(3, 9, 0),
      unreadCount: 0,
      messages: [
        { id: mid(), sender: "them", time: daysAgo(4, 11, 0), text: "Thanks for the referral, got the callback!" },
        { id: mid(), sender: "me", time: daysAgo(4, 12, 0), text: "That's amazing, congrats!! 🎉", status: "seen", seenAt: daysAgo(4, 12, 20) },
      ],
    },
    {
      id: "c7",
      name: "Chris Owusu",
      online: true,
      lastSeen: null,
      unreadCount: 0,
      messages: [
        { id: mid(), sender: "them", time: daysAgo(0, 7, 0), text: "Deploy went smoothly, all green ✅" },
        { id: mid(), sender: "me", time: daysAgo(0, 7, 10), text: "Nice work, team!", status: "seen", seenAt: daysAgo(0, 7, 25) },
      ],
    },
  ];

  return raw.map((c) => {
    const last = c.messages[c.messages.length - 1];
    return { ...c, lastMessage: last.text, lastTime: last.time };
  });
}

/**
 * hooks.js
 * -----------------------------------------------------------------------
 * Small reusable hooks shared across the messaging components. Logic is
 * unchanged from the original single-file version.
 * -----------------------------------------------------------------------
 */

import { useEffect, useRef, useState } from "react";

/** Tracks whether viewport is below Tailwind's `md` breakpoint (768px). */
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth < 768
  );
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const handler = () => setIsMobile(mq.matches);
    handler();
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return isMobile;
}

/** Loads GSAP from a CDN at runtime (no bundler/npm-install required). */
export function useGsap() {
  const gsapRef = useRef(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (window.gsap) {
      gsapRef.current = window.gsap;
      setReady(true);
      return;
    }
    let existing = document.querySelector('script[data-gsap-cdn]');
    const onLoad = () => {
      gsapRef.current = window.gsap;
      setReady(true);
    };
    if (existing) {
      existing.addEventListener("load", onLoad);
      return () => existing.removeEventListener("load", onLoad);
    }
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js";
    script.async = true;
    script.dataset.gsapCdn = "true";
    script.addEventListener("load", onLoad);
    document.head.appendChild(script);
    return () => script.removeEventListener("load", onLoad);
  }, []);
  return { gsapRef, ready };
}