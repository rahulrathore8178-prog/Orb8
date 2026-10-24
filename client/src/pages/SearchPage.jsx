import { useLayoutEffect, useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import axios from "axios";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import { glassRow, raised } from "../utilites/cssUtility";
import { getAuthHeaders, apiUrl } from "../utilites/communityHelper";
import { setSearchResults, setSearchQuery, setError } from "../redux/slices/friendsSlice";
import { useNavigate } from "react-router-dom";

/* ---------- icons ---------- */
const Icon = ({ children, className = "h-5 w-5" }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
        {children}
    </svg>
);
const ClockIcon = (p) => <Icon {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></Icon>;
const SearchIcon = (p) => <Icon {...p}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></Icon>;
const CloseIcon = (p) => <Icon {...p}><path d="M6 6l12 12M18 6 6 18" /></Icon>;
const CheckIcon = (p) => <Icon {...p}><path d="m5 12.5 4.5 4.5L19 7.5" /></Icon>;
const FillIcon = (p) => <Icon {...p}><path d="M17 17 7 7M7 15V7h8" /></Icon>;
const MessageIcon = (p) => <Icon {...p}><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.4-4.6A8 8 0 1 1 21 12Z" /></Icon>;
const UserPlusIcon = (p) => <Icon {...p}><circle cx="10" cy="8" r="3.6" /><path d="M3.5 20c.6-3.4 3.2-5.4 6.5-5.4M18 9v6M15 12h6" /></Icon>;
const OrbitMark = (p) => <Icon {...p}><circle cx="12" cy="12" r="3" /><ellipse cx="12" cy="12" rx="10" ry="4.5" transform="rotate(-25 12 12)" /></Icon>;

const SEED = ["neon photography walks", "@mira.vale", "#lowlightcity", "late night synth sets", "Lisbon rooftops", "@kairo", "#analogfilm"];

const rowHover = "transition duration-300 hover:border-white/15 hover:from-white/[0.15]";
const focusRing = "focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/40";
const actionBtn = `grid h-10 w-10 shrink-0 place-items-center rounded-full transition duration-200 active:scale-90 ${focusRing}`;

/* Defined once at module level (it was re-created on every render inside the component).
   Ideally move this into friendsSlice.js next to your other thunks. */
const searchUsers = createAsyncThunk("friends/searchUsers", async (query, { rejectWithValue }) => {
    try {
        const response = await axios.get(`${apiUrl}/api/social/search`, {
            params: { q: query },
            withCredentials: true,
            headers: getAuthHeaders(),
        });
        return response.data.users ?? [];
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || "Search failed");
    }
});

/* ---------- avatar (falls back to the first letter if the image fails) ---------- */
function Avatar({ user }) {
    const [failed, setFailed] = useState(false);
    return (
        <span className={`grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-xl p-[3px] sm:h-12 sm:w-12 ${raised}`}>
            {user.profilePic && !failed ? (
                <img src={user.profilePic} alt="" loading="lazy" referrerPolicy="no-referrer" onError={() => setFailed(true)} className="h-full w-full rounded-[9px] object-cover" />
            ) : (
                <span className="grid h-full w-full place-items-center rounded-[9px] bg-black/60 text-sm font-medium uppercase text-neutral-300">{user.username?.[0] ?? "?"}</span>
            )}
        </span>
    );
}

/* ---------- one searched profile ---------- */
function ProfileRow({ user, onSelect, onMessage, onAddFriend, onAccept, onReject }) {
    return (
        <div className={`flex items-center gap-3 rounded-2xl p-2.5 pr-3 sm:gap-4 sm:p-3 ${glassRow} ${rowHover}`}>
            <Avatar user={user} />
            <button onClick={onSelect} className={`min-w-0 flex-1 truncate rounded-md text-left text-[15px] text-neutral-100 ${focusRing}`}>
                {user.username}
            </button>

            {user.isFriend ? (
                <button onClick={() => onMessage(user)} aria-label={`Message ${user.username}`} className={`${actionBtn} text-neutral-100 hover:text-white ${raised}`}>
                    <MessageIcon className="h-[18px] w-[18px]" />
                </button>
            ) : user.hasPendingRequest ? (
                <div className="flex items-center gap-2">
                    <button onClick={() => onAccept(user)} aria-label={`Accept request from ${user.username}`} className={`${actionBtn} text-white ${raised}`}>
                        <CheckIcon className="h-[18px] w-[18px]" />
                    </button>
                    <button onClick={() => onReject(user)} aria-label={`Decline request from ${user.username}`} className={`${actionBtn} border border-white/10 bg-white/[0.04] text-neutral-400 hover:bg-white/10 hover:text-neutral-100`}>
                        <CloseIcon className="h-[18px] w-[18px]" />
                    </button>
                </div>
            ) : (
                <button onClick={() => onAddFriend(user)} aria-label={`Add ${user.username} as a friend`} className={`${actionBtn} text-neutral-100 hover:text-white ${raised}`}>
                    <UserPlusIcon className="h-[18px] w-[18px]" />
                </button>
            )}
        </div>
    );
}

const SkeletonRow = () => (
    <div className={`flex animate-pulse items-center gap-3 rounded-2xl p-2.5 sm:gap-4 sm:p-3 ${glassRow}`}>
        <span className="h-11 w-11 shrink-0 rounded-xl bg-white/[0.07] sm:h-12 sm:w-12" />
        <span className="h-3.5 w-32 rounded-full bg-white/[0.08]" />
        <span className="ml-auto h-10 w-10 rounded-full bg-white/[0.07]" />
    </div>
);

export default function SearchPage() {
    const root = useRef(null);
    const listRef = useRef(null);
    const mounted = useRef(false);
    const swapMounted = useRef(false);
    const dispatch = useDispatch();
    const searchResults = useSelector((state) => state.friends.searchResults) ?? [];
    console.log('searched results', searchResults?.username);
    const searchQuery = useSelector((state) => state.friends.searchQuery) ?? "";
    const [history, setHistory] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const searching = searchQuery.trim().length > 0;

    /* ---- connect these to your own friend / chat actions ---- */
    const handleSelectUser = (user) => { /* e.g. navigate(`/profile/${user._id}`) */ };
    const handleMessage = (user) => { /* e.g. navigate(`/chat/${user._id}`) */ };
    const handleAddFriend = async (userId) => {
        try {
            const response = await axios.post(
                console.log('Sending friend request to userId:', userId?._id),
                `${apiUrl}/api/social/friend-request/${userId?._id}`,
                {},
                { withCredentials: true, headers: getAuthHeaders() }
            );
            // Update search results to show Pending state instead of removing
            const updatedResults = searchResults.map(user =>
                user._id === userId ? { ...user, hasPendingRequest: true } : user
            );
            dispatch(setSearchResults(updatedResults));
            console.log('Friend request sent:', response.data);
        } catch (err) {
            dispatch(setError(err.response?.data?.message || 'Failed to send friend request'));
            setTimeout(() => dispatch(setError(null)), 3000);
            console.error('Error sending friend request:', err);
        }
    };
    const handleAccept = (user) => { /* e.g. dispatch(acceptFriendRequest(user._id)) */ };
    const handleReject = (user) => { /* e.g. dispatch(rejectFriendRequest(user._id)) */ };

    /* debounced user search: cancels stale requests, tracks loading locally */
    useEffect(() => {
        const term = searchQuery.trim();
        if (!term) {
            dispatch(setSearchResults([]));
            setLoading(false);
            return;
        }
        setLoading(true);
        let active = true;
        let request;
        const timer = setTimeout(() => {
            request = dispatch(searchUsers(term));
            request.then((action) => {
                if (!active) return; // superseded or unmounted
                dispatch(setSearchResults(searchUsers.fulfilled.match(action) ? action.payload : []));
                setLoading(false);
            });
        }, 250);
        return () => {
            active = false;
            clearTimeout(timer);
            request?.abort();
        };
    }, [searchQuery, dispatch]);

    /* first page-load sequence */
    useLayoutEffect(() => {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const ctx = gsap.context(() => {
            gsap.to(".orbiter", { rotation: 360, duration: (i) => 28 + i * 14, repeat: -1, ease: "none", transformOrigin: "50% 50%" });
            const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
            tl.from(".ring", { scale: 0.55, opacity: 0, duration: 1.6, stagger: 0.18, ease: "expo.out" })
                .from(".glow", { opacity: 0, duration: 1.4 }, 0)
                .from(".head", { y: -24, opacity: 0, filter: "blur(10px)", duration: 0.9 }, 0.35)
                .from(".hist-title", { opacity: 0, x: -16, duration: 0.6 }, 0.7)
                .from(".hist-item", { y: 28, opacity: 0, scale: 0.97, duration: 0.7, stagger: 0.07 }, 0.8)
                .from(".bar", { y: 110, opacity: 0, duration: 1, ease: "back.out(1.5)" }, 0.9);
        }, root);
        return () => ctx.revert();
    }, []);

    /* history <-> results swap, and fresh results: rows glide in */
    useEffect(() => {
        if (!swapMounted.current) { swapMounted.current = true; return; }
        if (loading || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const rows = listRef.current?.querySelectorAll("[data-row]");
        if (rows?.length) gsap.fromTo(rows, { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.05, ease: "power3.out", overwrite: true, clearProps: "transform,opacity" });
    }, [searching, searchResults, loading]);

    /* a newly saved search drops in at the top of history */
    useEffect(() => {
        if (!mounted.current) { mounted.current = true; return; }
        if (searching) return;
        const first = listRef.current?.firstElementChild;
        if (first) gsap.fromTo(first, { y: -18, opacity: 0, scale: 0.96 }, { y: 0, opacity: 1, scale: 1, duration: 0.5, ease: "power3.out" });
    }, [history[0]]); // eslint-disable-line react-hooks/exhaustive-deps

    const submit = (e) => {
        e.preventDefault();
        const term = searchQuery.trim();
        if (!term) return;
        setHistory((h) => [term, ...h.filter((x) => x.toLowerCase() !== term.toLowerCase())]);
    };
    const remove = (term) => setHistory((h) => h.filter((x) => x !== term));

    return (
        <main ref={root} className="relative flex h-full w-full flex-col overflow-hidden bg-black font-['Sora',system-ui,sans-serif] text-neutral-200 selection:bg-white/20">
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600&display=swap');`}</style>

            {/* orbit backdrop */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 grid place-items-center opacity-30">
                <div className="glow col-start-1 row-start-1 h-full w-full bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,0.07),transparent_55%)]" />
                {[52, 84, 122].map((size, i) => (
                    <div key={size} className="ring relative col-start-1 row-start-1 rounded-full border border-white/[0.11]" style={{ width: `${size}vmin`, height: `${size}vmin` }}>
                        <div className="orbiter absolute inset-0">
                            <span className={`absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-neutral-300 shadow-[0_0_14px_3px_rgba(255,255,255,0.35)] ${i === 1 ? "h-2 w-2" : "h-1.5 w-1.5"}`} />
                        </div>
                    </div>
                ))}
            </div>

            {/* header */}
            <header className="head relative z-10 mx-auto flex w-full max-w-2xl items-center justify-between px-5 pt-[max(1.25rem,env(safe-area-inset-top))] sm:px-8 sm:pt-8">
                <div className="flex items-center gap-3">
                    <span className={`grid h-11 w-11 place-items-center rounded-2xl text-neutral-100 ${raised}`}><OrbitMark /></span>
                    <div className="leading-tight">
                        <p className="text-lg font-semibold tracking-tight text-neutral-100">Orb8</p>
                        <p className="text-xs font-light text-neutral-500">Search</p>
                    </div>
                </div>
            </header>

            {/* history / results */}
            <section className="relative z-10 mx-auto flex min-h-0 w-full max-w-2xl flex-1 flex-col px-5 pt-6 sm:px-8 sm:pt-8" aria-label={searching ? "Search results" : "Search history"}>
                <div className="hist-title mb-3 flex items-center justify-between">
                    <h1 className="text-2xl font-light tracking-tight text-neutral-100 sm:text-3xl">{searching ? "Results" : "Recent searches"}</h1>
                    {!searching && history.length > 0 && (
                        <button onClick={() => setHistory([])} className={`rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs text-neutral-400 backdrop-blur-md transition hover:bg-white/10 hover:text-neutral-100 ${focusRing}`}>
                            Clear all
                        </button>
                    )}
                </div>

                <div className="relative -mx-2 min-h-0 flex-1">
                    <div className="h-full overflow-y-auto px-2 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                        {searching ? (
                            loading && searchResults.length === 0 ? (
                                <div className="flex flex-col gap-3.5" aria-busy="true"><SkeletonRow /><SkeletonRow /><SkeletonRow /><SkeletonRow /></div>
                            ) : searchResults.length === 0 ? (
                                <div className={`mt-6 rounded-3xl px-6 py-10 text-center ${glassRow}`}>
                                    <p className="text-base text-neutral-200">No users found for “{searchQuery.trim()}”</p>
                                    <p className="mt-1.5 text-sm font-light text-neutral-500">Check the spelling or try another username.</p>
                                </div>
                            ) : (
                                <ul ref={listRef} className={`flex flex-col gap-3.5 transition-opacity duration-200 ${loading ? "opacity-60" : "opacity-100"}`}>
                                    {searchResults.map((u) => (
                                        <li key={u._id} data-row>
                                            <ProfileRow user={u} onSelect={() => u._id && navigate(`/socialprofile/${u._id}`)} onMessage={handleMessage} onAddFriend={() => handleAddFriend(u?._id)} onAccept={handleAccept} onReject={handleReject} />
                                        </li>
                                    ))}
                                </ul>
                            )
                        ) : history.length === 0 ? (
                            <div className={`mt-6 rounded-3xl px-6 py-10 text-center ${glassRow}`}>
                                <p className="text-base text-neutral-200">No searches yet</p>
                                <p className="mt-1.5 text-sm font-light text-neutral-500">Search for people on Orbit.</p>
                            </div>
                        ) : (
                            <ul ref={listRef} className="flex flex-col gap-3.5">
                                {history.map((term) => (
                                    <li key={term} data-row className="hist-item">
                                        <div className={`group flex items-center gap-3 rounded-2xl p-2.5 pr-3 sm:gap-4 sm:p-3 ${glassRow} ${rowHover}`}>
                                            <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-neutral-400 sm:h-11 sm:w-11 ${raised}`}><ClockIcon className="h-[18px] w-[18px]" /></span>
                                            <button onClick={() => dispatch(setSearchQuery(term))} className={`min-w-0 flex-1 truncate rounded-md text-left text-[15px] text-neutral-200 ${focusRing}`} title={`Search “${term}”`}>
                                                {term}
                                            </button>
                                            <button onClick={() => dispatch(setSearchQuery(term))} aria-label={`Use ${term} in search`} className="hidden h-9 w-9 place-items-center rounded-full text-neutral-500 transition hover:bg-white/10 hover:text-neutral-100 sm:grid">
                                                <FillIcon className="h-4 w-4" />
                                            </button>
                                            <button onClick={() => remove(term)} aria-label={`Remove ${term} from history`} className={`grid h-9 w-9 place-items-center rounded-full text-neutral-500 transition hover:bg-white/10 hover:text-neutral-100 ${focusRing}`}>
                                                <CloseIcon className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 z-10 h-4 bg-gradient-to-b from-black/80 to-transparent" />
                    <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-4 bg-gradient-to-t from-black/80 to-transparent" />
                </div>
            </section>

            {/* search bar */}
            <div className="relative z-10 mx-auto w-full max-w-2xl px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2 sm:px-8 sm:pb-8">
                <form onSubmit={submit} role="search" className="bar rounded-[30px] border border-white/10 bg-white/[0.045] p-2 backdrop-blur-2xl shadow-[0_24px_70px_rgba(0,0,0,0.95),inset_0_1px_0_rgba(255,255,255,0.09)] transition-[border-color,box-shadow] duration-300 focus-within:border-white/25 focus-within:shadow-[0_24px_70px_rgba(0,0,0,0.95),0_0_38px_rgba(255,255,255,0.07),inset_0_1px_0_rgba(255,255,255,0.12)]">
                    <div className="flex items-center gap-2 rounded-[24px] bg-[#050505] py-1.5 pl-4 pr-1.5 shadow-[inset_5px_5px_12px_rgba(0,0,0,0.95),inset_-3px_-3px_9px_rgba(255,255,255,0.045)] sm:pl-5">
                        <SearchIcon className="h-5 w-5 shrink-0 text-neutral-500" />
                        <input
                            type="search"
                            value={searchQuery}
                            onChange={(e) => dispatch(setSearchQuery(e.target.value))}
                            placeholder="Search anything on orbit"
                            aria-label="Search anything on orbit"
                            enterKeyHint="search"
                            autoComplete="off"
                            className="min-w-0 flex-1 bg-transparent py-2.5 text-[15px] text-neutral-100 placeholder:text-neutral-600 focus:outline-none [&::-webkit-search-cancel-button]:hidden"
                        />
                        <button type="submit" aria-label="Search" className={`grid h-11 w-11 shrink-0 place-items-center rounded-full text-neutral-100 transition duration-200 hover:text-white active:scale-95 active:shadow-[inset_3px_3px_8px_rgba(0,0,0,0.9),inset_-2px_-2px_6px_rgba(255,255,255,0.05)] ${focusRing} sm:h-12 sm:w-12 ${raised}`}>
                            <SearchIcon className="h-5 w-5" />
                        </button>
                    </div>
                </form>
            </div>
        </main>
    );
}