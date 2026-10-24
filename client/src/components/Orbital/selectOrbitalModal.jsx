import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import gsap from 'gsap';
import { FaCheck, FaChevronDown, FaExchangeAlt, FaGlobe, FaLock, FaSearch, FaTimes } from 'react-icons/fa';
import { apiUrl, getAuthHeaders } from '../../utilites/communityHelper';

/* ---------- surfaces ---------- */
const neo =
    'bg-[#141414] text-[#e8f0fe] rounded-[12px] shadow-[6px_6px_12px_rgba(0,0,0,0.7),-4px_-4px_10px_rgba(255,255,255,0.045)] transition-all duration-150 hover:text-white active:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.75),inset_-3px_-3px_7px_rgba(255,255,255,0.04)] disabled:opacity-50 disabled:pointer-events-none';
const neoInset = 'shadow-[inset_3px_3px_6px_rgba(0,0,0,0.8),inset_-2px_-2px_5px_rgba(255,255,255,0.05)]';
const neoRaisedSm = 'shadow-[3px_3px_6px_rgba(0,0,0,0.7),-2px_-2px_5px_rgba(255,255,255,0.05)]';
const panelGlass =
    'bg-black/20 backdrop-blur-xl border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.06)]';

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function useIsDesktop() {
    const query = '(min-width: 640px)';
    const [matches, setMatches] = useState(() => window.matchMedia(query).matches);
    useEffect(() => {
        const mq = window.matchMedia(query);
        const handler = (e) => setMatches(e.matches);
        mq.addEventListener('change', handler);
        return () => mq.removeEventListener('change', handler);
    }, []);
    return matches;
}

/* ---------- small pieces ---------- */
function OrbitalAvatar({ orbital, size = 40 }) {
    const style = { width: size, height: size };
    if (orbital.avatar) {
        return <img src={orbital.avatar} alt="" style={style} className="rounded-full object-cover shrink-0 ring-2 ring-[#141414]" />;
    }
    return (
        <span
            style={{ ...style, fontSize: size * 0.4 }}
            className={`rounded-full bg-[#141414] flex items-center justify-center font-semibold text-[#aaaaaa] shrink-0 ring-2 ring-[#141414] ${neoRaisedSm}`}
        >
            {orbital.name[0].toUpperCase()}
        </span>
    );
}

// neomorphic checkbox: raised when empty, pressed in with a check when selected
const NeoCheckbox = ({ checked }) => (
    <span
        aria-hidden="true"
        className={`shrink-0 w-[22px] h-[22px] rounded-[7px] flex items-center justify-center bg-[#141414] transition-all duration-150 ${checked ? neoInset : neoRaisedSm}`}
    >
        {checked && <FaCheck className="text-[10px] text-[#e8f0fe]" />}
    </span>
);

const IconButton = ({ label, onClick, children, className = '' }) => (
    <button
        type="button"
        onClick={onClick}
        aria-label={label}
        title={label}
        className={`${neo} w-9 h-9 flex items-center justify-center shrink-0 text-[12px] ${className}`}
    >
        {children}
    </button>
);

/* ---------- picker ---------- */
export default function OrbitalPicker({ value = [], onChange, className = '' }) {
    const [open, setOpen] = useState(false);
    const [multiple, setMultiple] = useState(value.length > 1);
    const [orbitals, setOrbitals] = useState([]);
    const [status, setStatus] = useState('idle'); // idle | loading | ready | error
    const [query, setQuery] = useState('');
    const [pos, setPos] = useState(null);

    const triggerRef = useRef(null);
    const panelRef = useRef(null);
    const isDesktop = useIsDesktop();

    const hasSelection = value.length > 0;
    const visible = open && (!isDesktop || pos);

    /* ----- data ----- */
    const loadOrbitals = async () => {
        setStatus('loading');
        try {
            const { data } = await axios.get(`${apiUrl}/api/orbital/mine`, {
                withCredentials: true,
                headers: { ...getAuthHeaders() },
            });
            setOrbitals(data.orbitals || []);
            setStatus('ready');
        } catch {
            setStatus('error');
        }
    };

    const openPanel = () => {
        setOpen(true);
        if (status === 'idle' || status === 'error') loadOrbitals();
    };

    const closePanel = () => {
        setOpen(false);
        setPos(null);
        setQuery('');
    };

    /* ----- selection ----- */
    const isSelected = (id) => value.some((o) => o._id === id);

    const toggleOrbital = (orbital) => {
        if (!multiple) {
            onChange([orbital]);
            closePanel();
            return;
        }
        onChange(isSelected(orbital._id) ? value.filter((o) => o._id !== orbital._id) : [...value, orbital]);
    };

    const toggleMultiple = () => {
        const next = !multiple;
        setMultiple(next);
        if (!next && value.length > 1) onChange(value.slice(0, 1));
    };

    /* ----- desktop popover position (the panel is portaled, so it is placed by coordinates) ----- */
    const place = useCallback(() => {
        const rect = triggerRef.current?.getBoundingClientRect();
        if (!rect) return;
        const width = Math.min(360, window.innerWidth - 24);
        const left = Math.min(Math.max(12, rect.left), window.innerWidth - width - 12);
        const top = rect.bottom + 8;
        setPos({ top, left, width, maxHeight: Math.max(220, Math.min(460, window.innerHeight - top - 16)) });
    }, []);

    useLayoutEffect(() => {
        if (!open || !isDesktop) return;
        place();
        window.addEventListener('resize', place);
        window.addEventListener('scroll', place, true);
        return () => {
            window.removeEventListener('resize', place);
            window.removeEventListener('scroll', place, true);
        };
    }, [open, isDesktop, place]);

    /* ----- page behaviour while open ----- */
    useEffect(() => {
        if (!open) return;
        const onKey = (e) => e.key === 'Escape' && closePanel();
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [open]);

    useEffect(() => {
        if (!open || isDesktop) return;
        const previous = document.body.style.overflow;
        document.body.style.overflow = 'hidden'; // lock page scroll behind the bottom sheet
        return () => {
            document.body.style.overflow = previous;
        };
    }, [open, isDesktop]);

    /* ----- motion: one short open animation (slide up on phones, soft drop on desktop) ----- */
    useLayoutEffect(() => {
        if (!visible || !panelRef.current || prefersReducedMotion()) return;
        gsap.fromTo(
            panelRef.current,
            isDesktop ? { opacity: 0, y: -8, scale: 0.98 } : { opacity: 0, y: 48 },
            { opacity: 1, y: 0, scale: 1, duration: 0.25, ease: 'power2.out' }
        );
    }, [visible, isDesktop]);

    const filtered = orbitals.filter((o) => o.name.toLowerCase().includes(query.trim().toLowerCase()));

    /* ---------- render ---------- */
    const renderList = () => {
        if (status === 'loading' || status === 'idle') {
            return <p className="text-[13px] text-[#777777] text-center py-8">Loading your orbitals...</p>;
        }
        if (status === 'error') {
            return (
                <div className="text-center py-8">
                    <p className="text-[13px] text-[#c98a8a] mb-3">Could not load your orbitals.</p>
                    <button type="button" onClick={loadOrbitals} className={`${neo} px-4 py-1.5 text-xs font-semibold`}>
                        Try again
                    </button>
                </div>
            );
        }
        if (!orbitals.length) {
            return <p className="text-[13px] text-[#777777] text-center py-8">You haven't joined any orbitals yet.</p>;
        }
        if (!filtered.length) {
            return <p className="text-[13px] text-[#777777] text-center py-8">No orbital matches "{query}".</p>;
        }

        return filtered.map((o) => {
            const selected = isSelected(o._id);
            return (
                <button
                    key={o._id}
                    type="button"
                    role={multiple ? 'checkbox' : undefined}
                    aria-checked={multiple ? selected : undefined}
                    onClick={() => toggleOrbital(o)}
                    className={`flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-[14px] border transition-colors ${selected ? 'bg-white/[0.08] border-white/[0.12]' : 'bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06]'
                        }`}
                >
                    <OrbitalAvatar orbital={o} size={40} />
                    <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] font-semibold text-[#e8f0fe]">{o.name}</span>
                        <span className="flex items-center gap-3 text-xs text-[#aaaaaa]">
                            <span className="flex items-center gap-1">
                                {o.visibility === 'private' ? <FaLock className="text-[9px]" /> : <FaGlobe className="text-[9px]" />}
                                {o.visibility}
                            </span>
                            {o.memberCount !== undefined && <span>{o.memberCount} members</span>}
                        </span>
                    </span>
                    {multiple ? <NeoCheckbox checked={selected} /> : selected && <FaCheck className="text-[11px] text-[#e8f0fe]" />}
                </button>
            );
        });
    };

    const panel = (
        <div className="fixed inset-0 z-[100]">
            <div className="absolute inset-0 bg-black/60 sm:bg-transparent" onClick={closePanel} />

            <div
                ref={panelRef}
                role="dialog"
                aria-label="Choose an orbital to post in"
                style={
                    isDesktop && pos
                        ? {
                            top: pos.top,
                            left: pos.left,
                            width: pos.width,
                            maxHeight: pos.maxHeight,
                        }
                        : undefined
                }
                className={`${panelGlass} absolute flex flex-col overflow-hidden inset-x-0 bottom-0 max-h-[80vh] rounded-t-[24px] sm:inset-x-auto sm:bottom-auto sm:max-h-none sm:rounded-[20px]`}
            >
                <div className="sm:hidden mx-auto mt-2 h-1 w-10 rounded-full bg-white/20" />

                <div className="flex items-center justify-between gap-3 px-4 pt-4 pb-3">
                    <span className="font-['Syne'] font-bold text-[13px] tracking-[0.3px] text-[#e8f0fe]">Post in</span>

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            role="switch"
                            aria-checked={multiple}
                            onClick={toggleMultiple}
                            className="flex items-center gap-2 text-xs text-[#aaaaaa]"
                        >
                            Multiple
                            <span className={`relative w-10 h-[22px] rounded-full bg-[#101010] ${neoInset}`}>
                                <span
                                    className={`absolute top-[3px] left-[3px] w-4 h-4 rounded-full shadow-[2px_2px_4px_rgba(0,0,0,0.7)] transition-all duration-200 ${multiple ? 'translate-x-[18px] bg-[#e8f0fe]' : 'bg-[#3a3a3a]'
                                        }`}
                                />
                            </span>
                        </button>
                        <IconButton label="Close" onClick={closePanel} className="!w-8 !h-8">
                            <FaTimes />
                        </IconButton>
                    </div>
                </div>

                <div className="relative px-4 pb-3">
                    <FaSearch className="absolute left-7 top-1/2 -translate-y-[calc(50%+6px)] text-[11px] text-[#777777] pointer-events-none" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search orbitals"
                        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-[12px] pl-9 pr-3 py-2 text-sm text-[#e8f0fe] placeholder-[#777777] outline-none focus:border-white/30 transition-colors"
                    />
                </div>

                <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain flex flex-col gap-2 px-3 pb-3">{renderList()}</div>

                {multiple && (
                    <div className="flex items-center justify-between gap-3 px-4 pt-3 border-t border-white/[0.08] pb-[max(12px,env(safe-area-inset-bottom))]">
                        <span className="text-xs text-[#aaaaaa]">{value.length} selected</span>
                        <button type="button" onClick={closePanel} className={`${neo} px-5 py-1.5 text-xs font-semibold`}>
                            Done
                        </button>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className={className}>
            <div className="flex items-center gap-2">
                <button
                    ref={triggerRef}
                    type="button"
                    onClick={openPanel}
                    aria-haspopup="dialog"
                    aria-expanded={open}
                    className={`${neo} flex items-center gap-2 px-3 py-2 bg-white/10 text-sm font-medium min-w-0 max-w-[200px] sm:max-w-[260px]`}
                >
                    {hasSelection ? (
                        <>
                            <span className="flex -space-x-2 shrink-0">
                                {value.slice(0, 3).map((o) => (
                                    <OrbitalAvatar key={o._id} orbital={o} size={22} />
                                ))}
                            </span>
                            <span className="truncate">{value.length === 1 ? value[0].name : `${value[0].name} +${value.length - 1}`}</span>
                        </>
                    ) : (
                        <>
                            <span className="truncate">Select an Orbital</span>
                            <FaChevronDown className="text-[10px] text-[#aaaaaa] shrink-0" />
                        </>
                    )}
                </button>

                {hasSelection && (
                    <>
                        <IconButton label="Change orbital" onClick={openPanel}>
                            <FaExchangeAlt />
                        </IconButton>
                        <IconButton label="Remove orbital" onClick={() => onChange([])}>
                            <FaTimes />
                        </IconButton>
                    </>
                )}
            </div>

            {value.length > 1 && (
                <div className="flex flex-wrap gap-2 mt-3">
                    {value.map((o) => (
                        <span
                            key={o._id}
                            className="flex items-center gap-2 pl-1.5 pr-2 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs text-[#e8f0fe] max-w-full"
                        >
                            <OrbitalAvatar orbital={o} size={18} />
                            <span className="truncate">{o.name}</span>
                            <button
                                type="button"
                                onClick={() => onChange(value.filter((x) => x._id !== o._id))}
                                aria-label={`Remove ${o.name}`}
                                className="text-[#777777] hover:text-white transition-colors"
                            >
                                <FaTimes className="text-[10px]" />
                            </button>
                        </span>
                    ))}
                </div>
            )}

            {visible && createPortal(panel, document.body)}
        </div>
    );
}