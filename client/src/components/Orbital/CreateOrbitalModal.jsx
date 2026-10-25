import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { apiUrl, getAuthHeaders } from "../../utilites/communityHelper";
import axios from "axios";

/* -------------------------------------------------------------------------- */
/*  Replace this with your own VISIBILITY enum import so values match schema.  */
/*  e.g. import { VISIBILITY } from "../constants/visibility";                 */
/* -------------------------------------------------------------------------- */
const VISIBILITY = { OPEN: "open", PRIVATE: "private" };

const NAME_MIN = 3;
const NAME_MAX = 50;
const DESC_MAX = 500;
const IMAGE_MAX_MB = 5;

/* ---------------------------- Neomorph + glass ----------------------------- */
const glass =
    "bg-white/[0.04] backdrop-blur-2xl border border-white/10 shadow-[0_8px_40px_rgba(0,0,0,0.5)]";
const glassInset =
    "bg-black/30 backdrop-blur-md border border-white/[0.08] shadow-[inset_2px_2px_8px_rgba(0,0,0,0.5)]";
const neo =
    "bg-[#17181b] text-zinc-200 shadow-[6px_6px_14px_rgba(0,0,0,0.65),-4px_-4px_12px_rgba(255,255,255,0.045)] " +
    "hover:text-white active:shadow-[inset_4px_4px_10px_rgba(0,0,0,0.7),inset_-3px_-3px_8px_rgba(255,255,255,0.04)] " +
    "transition-[box-shadow,color,opacity] duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 " +
    "disabled:opacity-40 disabled:pointer-events-none";
const neoPressed =
    "bg-[#141518] text-white shadow-[inset_4px_4px_10px_rgba(0,0,0,0.7),inset_-3px_-3px_8px_rgba(255,255,255,0.04)]";

/* --------------------------------- Icons ---------------------------------- */
const Icon = ({ children, className = "w-5 h-5" }) => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
    >
        {children}
    </svg>
);
const CloseIcon = () => (
    <Icon>
        <path d="M6 6l12 12M18 6L6 18" />
    </Icon>
);
const GlobeIcon = () => (
    <Icon>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3c2.8 3 2.8 15 0 18M12 3c-2.8 3-2.8 15 0 18" />
    </Icon>
);
const LockIcon = () => (
    <Icon>
        <rect x="5" y="11" width="14" height="9" rx="2" />
        <path d="M8 11V8a4 4 0 018 0v3" />
    </Icon>
);
const CameraIcon = () => (
    <Icon className="w-6 h-6">
        <path d="M4 8h3l1.5-2h7L17 8h3v11H4z" />
        <circle cx="12" cy="13" r="3.5" />
    </Icon>
);
const SearchIcon = () => (
    <Icon className="w-4 h-4">
        <circle cx="11" cy="11" r="6" />
        <path d="M20 20l-4-4" />
    </Icon>
);
const UsersIcon = () => (
    <Icon className="w-4 h-4">
        <circle cx="9" cy="8" r="3.5" />
        <path d="M2.5 20c.6-3.5 3.2-5.5 6.5-5.5s5.9 2 6.5 5.5M16 4.8a3.5 3.5 0 010 6.4M18 14.8c2 .6 3.2 2.3 3.5 5.2" />
    </Icon>
);

/* --------------------------------- Helpers -------------------------------- */
const initials = (s = "") => s.trim().slice(0, 2).toUpperCase() || "?";

/* ========================================================================== */
/*  CreateOrbitalModal                                                         */
/*                                                                             */
/*  Props                                                                      */
/*   - isOpen: boolean                                                         */
/*   - onClose: () => void                                                     */
/*   - onSubmit: async ({ name, description, visibility, imageFile,            */
/*                        invitees: string[] /* user _ids *\/ }) => void       */
/*       (throw an Error to show a message inside the modal)                   */
/*   - onSearchUsers: async (query) => [{ _id, username, avatar? }]            */
/* ========================================================================== */
export default function CreateOrbitalModal({
    isOpen = true,
    onClose = () => { },
    onSubmit,
    onSearchUsers,
    creatorId,
}) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [visibility, setVisibility] = useState(VISIBILITY.OPEN); // open by default
    const [imageFile, setImageFile] = useState(null);
    // console.log('image file', imageFile);
    const [imagePreview, setImagePreview] = useState("");
    const [invitees, setInvitees] = useState([]);

    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [searching, setSearching] = useState(false);

    const [nameError, setNameError] = useState("");
    const [imageError, setImageError] = useState("");
    const [serverError, setServerError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const rootRef = useRef(null);
    const backdropRef = useRef(null);
    const panelRef = useRef(null);
    const ringsRef = useRef(null);
    const nameInputRef = useRef(null);
    const fileRef = useRef(null);

    /* ------------------------------ Open animation ----------------------------- */
    useEffect(() => {
        if (!isOpen) return;
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const ctx = gsap.context(() => {
            gsap.fromTo(backdropRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3 });
            gsap.fromTo(
                panelRef.current,
                { opacity: 0, y: 28, scale: 0.96 },
                { opacity: 1, y: 0, scale: 1, duration: reduce ? 0 : 0.5, ease: "power3.out" }
            );
            if (!reduce && ringsRef.current) {
                // slow, continuous orbit – the only looping motion
                gsap.to(ringsRef.current.querySelectorAll("[data-ring]"), {
                    rotation: (i) => (i % 2 ? -360 : 360),
                    duration: (i) => 50 + i * 25,
                    ease: "none",
                    repeat: -1,
                    transformOrigin: "50% 50%",
                });
            }
        }, rootRef);

        const t = setTimeout(() => nameInputRef.current?.focus(), 350);
        return () => {
            clearTimeout(t);
            ctx.revert();
        };
    }, [isOpen]);

    /* ----------------------------- Lock page scroll ---------------------------- */
    useEffect(() => {
        if (!isOpen) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = prev;
        };
    }, [isOpen]);

    /* ------------------------------- Close handler ----------------------------- */
    const close = useCallback(() => {
        if (submitting) return;
        gsap.to(panelRef.current, { opacity: 0, y: 16, scale: 0.97, duration: 0.2, ease: "power2.in" });
        gsap.to(backdropRef.current, { opacity: 0, duration: 0.22, onComplete: onClose });
    }, [onClose, submitting]);

    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e) => e.key === "Escape" && close();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [isOpen, close]);

    /* ----------------------------- Image preview URL --------------------------- */
    useEffect(() => {
        if (!imageFile) return setImagePreview("");
        const url = URL.createObjectURL(imageFile);
        setImagePreview(url);
        return () => URL.revokeObjectURL(url);
    }, [imageFile]);

    const handleImage = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) return setImageError("Choose an image file (PNG, JPG, WebP).");
        if (file.size > IMAGE_MAX_MB * 1024 * 1024) return setImageError(`Image must be under ${IMAGE_MAX_MB} MB.`);
        setImageError("");
        setImageFile(file);
        // console.log("Selected image file:", file);
    };

    /* ------------------------------- User search ------------------------------- */
    useEffect(() => {
        const q = query.trim();
        if (!q || !onSearchUsers) {
            setResults([]);
            return;
        }
        let cancelled = false;
        setSearching(true);
        const t = setTimeout(async () => {
            try {
                const users = await onSearchUsers(q);
                if (!cancelled) setResults(users || []);
            } catch {
                if (!cancelled) setResults([]);
            } finally {
                if (!cancelled) setSearching(false);
            }
        }, 300);
        return () => {
            cancelled = true;
            clearTimeout(t);
        };
    }, [query, onSearchUsers]);

    const addInvitee = (u) => {
        if (invitees.some((i) => i._id === u._id)) return;
        setInvitees((prev) => [...prev, u]);
        setQuery("");
        setResults([]);
    };
    const removeInvitee = (id) => setInvitees((prev) => prev.filter((i) => i._id !== id));

    /* --------------------------------- Submit ---------------------------------- */
    const handleSubmit = async (e) => {
        e.preventDefault();
        const trimmed = name.trim();
        if (trimmed.length < NAME_MIN) {
            setNameError(`Give your orbital a name with at least ${NAME_MIN} characters.`);
            nameInputRef.current?.focus();
            gsap.fromTo(
                nameInputRef.current,
                { x: -6 },
                { x: 0, duration: 0.5, ease: "elastic.out(1, 0.3)" }
            );
            return;
        }
        setNameError("");
        setServerError("");
        setSubmitting(true);
        try {
            // await onSubmit?.({
            //     name: trimmed,
            //     description: description.trim(),
            //     visibility,
            //     imageFile,
            //     invitees: invitees.map((i) => i._id),
            //     creatorId, // Pass the creatorId to the onSubmit function
            // });
            // console.log('Orbital created successfully', creatorId);
            // gsap.to(panelRef.current, { opacity: 0, scale: 1.03, duration: 0.25, onComplete: onClose });
            const formData = new FormData();
            formData.append("name", trimmed);
            formData.append("description", description.trim());
            formData.append("visibility", visibility);
            if (imageFile) {
                formData.append("media", imageFile, imageFile.name);
            } console.log('image file', imageFile);
            console.log('formData', formData);

            const response = await axios.post(`${apiUrl}/api/orbital/new`, formData, {
                withCredentials: true,
                headers: { ...getAuthHeaders() }, // don't set Content-Type manually; axios sets the boundary
            });
            console.log('Orbital created successfully', response.data);
            gsap.to(panelRef.current, { opacity: 0, scale: 1.03, duration: 0.25, onComplete: onClose });
        } catch (err) {
            setServerError(err?.message || "Couldn't create the orbital. Try again.");
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    const isPrivate = visibility === VISIBILITY.PRIVATE;

    return (
        <div
            ref={rootRef}
            className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-6"
            role="dialog"
            aria-modal="true"
            aria-labelledby="orbital-modal-title"
        >
            {/* Backdrop */}
            <div
                ref={backdropRef}
                onClick={close}
                className="absolute inset-0 bg-black/75 backdrop-blur-md"
                style={{
                    backgroundImage:
                        "radial-gradient(ellipse at 20% 10%, rgba(255,255,255,0.06), transparent 50%), radial-gradient(ellipse at 90% 90%, rgba(255,255,255,0.04), transparent 45%)",
                }}
            />

            {/* Panel – ~70% of the viewport on large screens */}
            <form
                ref={panelRef}
                onSubmit={handleSubmit}
                noValidate
                className={`relative flex w-full flex-col overflow-y-auto rounded-3xl text-zinc-200
          h-[96vh] sm:h-[88vh] sm:w-[88vw] lg:h-[72vh] lg:min-h-[560px] lg:w-[70vw] lg:max-w-6xl lg:flex-row lg:overflow-hidden
          [scrollbar-width:thin] ${glass}`}
            >
                {/* ------------------------------ Left: preview ----------------------------- */}
                <aside className="relative shrink-0 overflow-hidden border-b border-white/10 bg-gradient-to-b from-white/[0.03] to-transparent p-6 sm:p-8 lg:w-5/12 lg:border-b-0 lg:border-r">
                    {/* Orbit rings */}
                    <div
                        ref={ringsRef}
                        className="pointer-events-none absolute left-1/2 top-[38%] h-0 w-0 lg:top-[42%]"
                        aria-hidden="true"
                    >
                        {[220, 330, 450].map((size, i) => (
                            <div
                                key={size}
                                data-ring
                                className="absolute rounded-full border border-white/[0.07]"
                                style={{ width: size, height: size, left: -size / 2, top: -size / 2 }}
                            >
                                <span
                                    className="absolute rounded-full bg-zinc-300/70 shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                                    style={{ width: 5 + i, height: 5 + i, top: -(2.5 + i / 2), left: "50%" }}
                                />
                            </div>
                        ))}
                    </div>

                    <div className="relative flex h-full flex-col items-center text-center">
                        <div className="flex w-full items-start justify-between lg:block">
                            <div className="text-left">
                                <h2 id="orbital-modal-title" className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
                                    Create an orbital
                                </h2>
                                <p className="mt-1 max-w-[16rem] text-sm text-zinc-400">
                                    A space for people who share your gravity.
                                </p>
                            </div>
                            {/* Close – visible on mobile in left header */}
                            <button
                                type="button"
                                onClick={close}
                                aria-label="Close"
                                className={`grid h-10 w-10 shrink-0 place-items-center rounded-full lg:hidden ${neo}`}
                            >
                                <CloseIcon />
                            </button>
                        </div>

                        {/* Avatar – the "planet" */}
                        <div className="mt-8 flex flex-1 flex-col items-center justify-center lg:mt-0">
                            <button
                                type="button"
                                onClick={() => fileRef.current?.click()}
                                aria-label="Upload orbital picture"
                                className={`group relative grid h-28 w-28 place-items-center overflow-hidden rounded-full sm:h-32 sm:w-32 ${neo}`}
                            >
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Orbital preview" className="h-full w-full object-cover" />
                                ) : name.trim() ? (
                                    <span className="text-3xl font-semibold text-zinc-300">{initials(name)}</span>
                                ) : (
                                    <span className="text-zinc-500">
                                        <CameraIcon />
                                    </span>
                                )}
                                <span className="absolute inset-0 grid place-items-center bg-black/55 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                                    {imagePreview ? "Change" : "Add picture"}
                                </span>
                            </button>
                            <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} className="hidden" />

                            {imagePreview ? (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setImageFile(null);
                                        if (fileRef.current) fileRef.current.value = "";
                                    }}
                                    className="mt-3 text-xs text-zinc-500 underline-offset-4 hover:text-zinc-300 hover:underline"
                                >
                                    Remove picture
                                </button>
                            ) : (
                                <p className="mt-3 text-xs text-zinc-500">Picture is optional</p>
                            )}
                            {imageError && <p className="mt-2 text-xs text-red-300/90">{imageError}</p>}

                            {/* Live preview card */}
                            <div className={`mt-8 w-full max-w-xs rounded-2xl p-4 text-left ${glass}`}>
                                <p className="truncate text-base font-medium text-white">{name.trim() || "Your orbital name"}</p>
                                <p className="mt-1 line-clamp-2 min-h-[2.5rem] text-sm text-zinc-400">
                                    {description.trim() || "Your description will show up here."}
                                </p>
                                <div className="mt-3 flex items-center gap-3 text-xs text-zinc-400">
                                    <span className="inline-flex items-center gap-1.5">
                                        {isPrivate ? <LockIcon /> : <GlobeIcon />}
                                        {isPrivate ? "Private" : "Open"}
                                    </span>
                                    <span className="inline-flex items-center gap-1.5">
                                        <UsersIcon />
                                        {1 + invitees.length === 1 ? "Just you" : `You + ${invitees.length} invited`}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* ------------------------------ Right: form ------------------------------ */}
                <section className="relative flex min-h-0 flex-1 flex-col">
                    {/* Desktop close */}
                    <button
                        type="button"
                        onClick={close}
                        aria-label="Close"
                        className={`absolute right-5 top-5 z-10 hidden h-10 w-10 place-items-center rounded-full lg:grid ${neo}`}
                    >
                        <CloseIcon />
                    </button>

                    <div className="flex-1 space-y-6 p-6 sm:p-8 lg:overflow-y-auto lg:pr-8 lg:pt-8 [scrollbar-width:thin]">
                        {/* Name */}
                        <div>
                            <div className="mb-2 flex items-baseline justify-between">
                                <label htmlFor="orbital-name" className="text-sm font-medium text-zinc-200">
                                    Name
                                </label>
                                <span className="text-xs text-zinc-500 lg:mr-12">
                                    {name.length}/{NAME_MAX}
                                </span>
                            </div>
                            <input
                                id="orbital-name"
                                ref={nameInputRef}
                                value={name}
                                maxLength={NAME_MAX}
                                onChange={(e) => {
                                    setName(e.target.value);
                                    if (nameError) setNameError("");
                                }}
                                placeholder="Night owls, Indie devs, Film club…"
                                aria-invalid={!!nameError}
                                aria-describedby={nameError ? "orbital-name-error" : undefined}
                                className={`w-full rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 outline-none transition-colors focus:border-white/30 ${glassInset} ${nameError ? "!border-red-400/50" : ""
                                    }`}
                            />
                            {nameError && (
                                <p id="orbital-name-error" className="mt-2 text-xs text-red-300/90">
                                    {nameError}
                                </p>
                            )}
                        </div>

                        {/* Description */}
                        <div>
                            <div className="mb-2 flex items-baseline justify-between">
                                <label htmlFor="orbital-desc" className="text-sm font-medium text-zinc-200">
                                    Description <span className="font-normal text-zinc-500">(optional)</span>
                                </label>
                                <span className="text-xs text-zinc-500">
                                    {description.length}/{DESC_MAX}
                                </span>
                            </div>
                            <textarea
                                id="orbital-desc"
                                rows={3}
                                value={description}
                                maxLength={DESC_MAX}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="What is this orbital about and who is it for?"
                                className={`w-full resize-none rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 outline-none transition-colors focus:border-white/30 ${glassInset}`}
                            />
                        </div>

                        {/* Visibility */}
                        <fieldset>
                            <legend className="mb-2 text-sm font-medium text-zinc-200">Who can join</legend>
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2" role="radiogroup">
                                {[
                                    {
                                        value: VISIBILITY.OPEN,
                                        title: "Open to all",
                                        text: "Anyone can find and join.",
                                        icon: <GlobeIcon />,
                                    },
                                    {
                                        value: VISIBILITY.PRIVATE,
                                        title: "Private",
                                        text: "Only invited people can join.",
                                        icon: <LockIcon />,
                                    },
                                ].map((opt) => {
                                    const active = visibility === opt.value;
                                    return (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            role="radio"
                                            aria-checked={active}
                                            onClick={() => setVisibility(opt.value)}
                                            className={`flex items-start gap-3 rounded-2xl p-4 text-left ${active ? neoPressed : neo}`}
                                        >
                                            <span className={`mt-0.5 ${active ? "text-white" : "text-zinc-500"}`}>{opt.icon}</span>
                                            <span className="flex-1">
                                                <span className="block text-sm font-medium">{opt.title}</span>
                                                <span className="mt-0.5 block text-xs text-zinc-500">{opt.text}</span>
                                            </span>
                                            <span
                                                className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full transition-all ${active ? "bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]" : "bg-zinc-700"
                                                    }`}
                                            />
                                        </button>
                                    );
                                })}
                            </div>
                        </fieldset>

                        {/* Invite */}
                        <div>
                            <label htmlFor="orbital-invite" className="mb-2 block text-sm font-medium text-zinc-200">
                                Invite people <span className="font-normal text-zinc-500">(optional)</span>
                            </label>

                            <div className="relative">
                                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
                                    <SearchIcon />
                                </span>
                                <input
                                    id="orbital-invite"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Search by username"
                                    autoComplete="off"
                                    className={`w-full rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder:text-zinc-600 outline-none transition-colors focus:border-white/30 ${glassInset}`}
                                />

                                {(results.length > 0 || searching || (query.trim() && !searching && onSearchUsers)) && (
                                    <ul
                                        className={`absolute left-0 right-0 top-full z-20 mt-2 max-h-48 overflow-y-auto rounded-xl p-1.5 [scrollbar-width:thin] ${glass} !bg-[#101113]/90`}
                                    >
                                        {searching && <li className="px-3 py-2 text-xs text-zinc-500">Searching…</li>}
                                        {!searching && results.length === 0 && (
                                            <li className="px-3 py-2 text-xs text-zinc-500">No one found for “{query.trim()}”.</li>
                                        )}
                                        {results.map((u) => {
                                            const added = invitees.some((i) => i._id === u._id);
                                            return (
                                                <li key={u._id}>
                                                    <button
                                                        type="button"
                                                        disabled={added}
                                                        onClick={() => addInvitee(u)}
                                                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-white/[0.06] disabled:opacity-40"
                                                    >
                                                        <Avatar user={u} />
                                                        <span className="flex-1 truncate">{u.username}</span>
                                                        <span className="text-xs text-zinc-500">{added ? "Added" : "Invite"}</span>
                                                    </button>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                )}
                            </div>

                            {invitees.length > 0 && (
                                <ul className="mt-3 flex flex-wrap gap-2">
                                    {invitees.map((u) => (
                                        <li
                                            key={u._id}
                                            className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] py-1 pl-1 pr-2 text-sm backdrop-blur-md"
                                        >
                                            <Avatar user={u} small />
                                            <span className="max-w-[9rem] truncate">{u.username}</span>
                                            <button
                                                type="button"
                                                onClick={() => removeInvitee(u._id)}
                                                aria-label={`Remove ${u.username}`}
                                                className="text-zinc-500 transition-colors hover:text-white"
                                            >
                                                <Icon className="h-4 w-4">
                                                    <path d="M7 7l10 10M17 7L7 17" />
                                                </Icon>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                            <p className="mt-2 text-xs text-zinc-500">
                                {isPrivate
                                    ? "Private orbitals are invite-only, so invite the people you want in."
                                    : "You can always invite more people after your orbital is live."}
                            </p>
                        </div>

                        {serverError && (
                            <p role="alert" className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                                {serverError}
                            </p>
                        )}
                    </div>

                    {/* Footer actions */}
                    <div className="flex flex-col-reverse gap-3 border-t border-white/10 bg-black/20 p-4 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-end sm:px-8 sm:py-5">
                        <button type="button" onClick={close} className={`rounded-xl px-6 py-3 text-sm ${neo}`}>
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className={`rounded-xl px-7 py-3 text-sm font-medium text-white ${neo}`}
                        >
                            {submitting ? "Creating…" : "Create orbital"}
                        </button>
                    </div>
                </section>
            </form>
        </div>
    );
}

/* ------------------------------ Small avatar ------------------------------ */
function Avatar({ user, small = false }) {
    const size = small ? "h-6 w-6 text-xs" : "h-8 w-8 text-xs";
    return user.avatar ? (
        <img src={user.avatar} alt="" className={`${size} rounded-full object-cover`} />
    ) : (
        <span className={`${size} grid place-items-center rounded-full bg-zinc-700/60 font-medium text-zinc-200`}>
            {initials(user.username)}
        </span>
    );
}