import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import gsap from 'gsap';
import { FaGlobe, FaLock } from 'react-icons/fa';
import { apiUrl, getAuthHeaders, getStoredUser } from '../utilites/communityHelper';
import FilmPostCard from '../components/CommunityFeed/FilmPostCard';


// axios config goes in the third argument, so cookies and auth headers reach the server
const api = (path, method = 'get', data) =>
    axios({
        url: `${apiUrl}/api/orbital${path}`,
        method,
        data,
        withCredentials: true,
        headers: { ...getAuthHeaders() },
    });

/* ---------- shared surface styles ---------- */
const glass =
    'bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-[20px] shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.06)]';
const glassInner = 'bg-white/[0.03] border border-white/[0.06] rounded-[14px]';
const neo =
    'bg-[#141414] text-[#e8f0fe] rounded-[12px] shadow-[6px_6px_12px_rgba(0,0,0,0.7),-4px_-4px_10px_rgba(255,255,255,0.045)] transition-all duration-150 hover:text-white active:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.75),inset_-3px_-3px_7px_rgba(255,255,255,0.04)] disabled:opacity-50 disabled:pointer-events-none';

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- click-to-edit text (the "magic" field) ---------- */
function InlineEdit({ as: Tag = 'p', value, onSave, editable, multiline = false, minLength = 0, maxLength, placeholder, textClass }) {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(value);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const fieldRef = useRef(null);

    useEffect(() => {
        if (editing) fieldRef.current?.focus();
    }, [editing]);

    const open = () => {
        if (!editable) return;
        setDraft(value);
        setError('');
        setEditing(true);
    };

    const cancel = () => {
        setEditing(false);
        setError('');
    };

    const save = async () => {
        const next = draft.trim();
        if (next.length < minLength) return setError(`Use at least ${minLength} characters`);
        if (next === value) return cancel();
        setSaving(true);
        try {
            await onSave(next);
            setEditing(false);
        } catch (e) {
            setError(e.response?.data?.message || 'Could not save');
        } finally {
            setSaving(false);
        }
    };

    const onKeyDown = (e) => {
        if (e.key === 'Escape') cancel();
        if (e.key === 'Enter' && (!multiline || e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            save();
        }
    };

    if (!editing) {
        return (
            <Tag
                onClick={open}
                title={editable ? 'Click to edit' : undefined}
                className={`${textClass} ${editable ? 'cursor-text hover:text-white/80 transition-colors' : ''}`}
            >
                {value || placeholder}
            </Tag>
        );
    }

    const Field = multiline ? 'textarea' : 'input';
    return (
        <div>
            <Field
                ref={fieldRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={onKeyDown}
                maxLength={maxLength}
                rows={multiline ? 3 : undefined}
                className={`${textClass} w-full bg-transparent outline-none resize-none border-b border-white/20 focus:border-white/50 transition-colors`}
            />
            <div className="flex items-center gap-2 mt-2">
                <button type="button" onClick={save} disabled={saving} className={`${neo} px-4 py-1.5 text-xs font-semibold`}>
                    {saving ? 'Saving...' : 'Save'}
                </button>
                <button type="button" onClick={cancel} className={`${neo} px-4 py-1.5 text-xs text-[#aaaaaa]`}>
                    Cancel
                </button>
                {error && <span className="text-xs text-[#c98a8a]">{error}</span>}
            </div>
        </div>
    );
}

const Empty = ({ text }) => <div className="text-[13px] text-[#777777] text-center py-10">{text}</div>;

const Avatar = ({ user, size = 40 }) =>
    user?.avatar ? (
        <img src={user.avatar} alt="" style={{ width: size, height: size }} className="rounded-full object-cover" />
    ) : (
        <div
            style={{ width: size, height: size }}
            className="rounded-full bg-[#141414] flex items-center justify-center text-[#aaaaaa] font-semibold text-sm shadow-[3px_3px_6px_rgba(0,0,0,0.7),-2px_-2px_5px_rgba(255,255,255,0.04)]"
        >
            {(user?.username || '?')[0].toUpperCase()}
        </div>
    );

function getDisplayImageUrl(imageUrl) {
    if (typeof imageUrl !== 'string' || !imageUrl.trim()) return '';

    const value = imageUrl.trim();
    const driveId = value.match(/[?&]id=([^&]+)/)?.[1]
        || (!value.includes('://') && /^[A-Za-z0-9_-]{20,}$/.test(value) ? value : '');

    return driveId
        ? `${apiUrl}/api/orbital/image/${encodeURIComponent(driveId)}`
        : value;
}

/* ---------- page ---------- */
export default function OrbitalPage({ onMessage = () => { } }) {
    const { orbitalId } = useParams();
    const currentUser = getStoredUser();
    const currentUserId = currentUser?.id || currentUser?._id || '';

    const [orbital, setOrbital] = useState(null);
    console.log('orbital', orbital);
    const orbitalImage = orbital?.image || orbital?.imageUrl || orbital?.avatar || '';
    const imageUrl = orbitalImage.startsWith('/') ? `${apiUrl}${orbitalImage}` : getDisplayImageUrl(orbitalImage);
    const [viewer, setViewer] = useState({ status: 'none', isAdmin: false });
    const isCreator = viewer.role === 'creator';
    const isAdmin = viewer.role === 'admin';
    const canManageOrbital = isCreator || isAdmin;
    const [loadError, setLoadError] = useState('');
    const navigate = useNavigate();

    const [tab, setTab] = useState('posts');
    const [posts, setPosts] = useState([]);
    console.log('posts', posts);
    const [members, setMembers] = useState([]);
    const [requests, setRequests] = useState([]);
    const [tabLoading, setTabLoading] = useState(false);

    const [busy, setBusy] = useState(false);
    const [actionError, setActionError] = useState('');

    const rootRef = useRef(null);
    const contentRef = useRef(null);
    const underlineRef = useRef(null);
    const tabRefs = useRef({});
    const underlineReady = useRef(false);
    const contentMounted = useRef(false);

    const ready = Boolean(orbital);
    const isMember = viewer.status === 'active';
    const isPending = viewer.status === 'pending';
    const isPrivate = orbital?.visibility === 'private';

    const tabs = [
        { key: 'posts', label: 'Posts' },
        { key: 'members', label: 'Members', count: orbital?.memberCount },
        ...(isPrivate && viewer.isAdmin ? [{ key: 'requests', label: 'Requests', count: requests.length }] : []),
    ];

    const deleteOrbital = async () => {
        try {
            const res = await axios.delete(`${apiUrl}/api/orbital/deleteorbital/${orbitalId}`, {
                withCredentials: true,
                headers: getAuthHeaders(),
            });
            console.log('Orbital deleted:', res.data);
            navigate('/community'); // Redirect to orbitals list after deletion
        } catch (error) {
            console.error('Error deleting orbital:', error);
        }
    }

    /* load orbital */
    useEffect(() => {
        let cancelled = false;
        api(`/${orbitalId}`)
            .then(({ data }) => {
                if (cancelled) return;
                const o = data.orbital ?? data;
                const role = data.viewer?.role ?? o.role ?? null;
                setOrbital(o);
                setViewer({
                    status: data.viewer?.status ?? 'none',
                    role,
                    isAdmin: role === 'admin' || role === 'creator',
                });
                console.log('viewer role:', data?.viewer?.role);
            })
            .catch((e) => !cancelled && setLoadError(e.response?.data?.message || 'Could not load this orbital'));
        return () => {
            cancelled = true;
        };
    }, [orbitalId]);

    const fetchOrbital = async () => {
        try {
            const res = await axios.get(`${apiUrl}/api/orbital/${orbitalId}`, {
                withCredentials: true,
                headers: getAuthHeaders(),
            });
            console.log('Orbital data loaded:', res.data?.viewer?.role);
            // setOrbital(res.data.orbital);
        } catch (error) {
            console.error('Error loading orbital:', error);
        }
    }

    useEffect(() => {
        fetchOrbital();
    }, [orbitalId]);

    /* load the active tab (members only; non-members get a 403 from the server anyway) */
    useEffect(() => {
        if (!ready || !isMember) return;
        let cancelled = false;
        setTabLoading(true);
        api(`/${orbitalId}/${tab}`)
            .then(({ data }) => {
                if (cancelled) return;
                if (tab === 'posts') setPosts(data.posts);
                if (tab === 'members') setMembers(data.members);
                if (tab === 'requests') setRequests(data.requests);
            })
            .catch(() => { })
            .finally(() => !cancelled && setTabLoading(false));
        return () => {
            cancelled = true;
        };
    }, [tab, orbitalId, ready, isMember]);

    /* requests are needed for the tab badge as soon as an admin lands on a private orbital */
    useEffect(() => {
        if (ready && isPrivate && viewer.isAdmin) {
            api(`/${orbitalId}/requests`).then(({ data }) => setRequests(data.requests)).catch(() => { });
        }
    }, [ready, isPrivate, viewer.isAdmin, orbitalId]);

    /* motion: one reveal on load */
    useLayoutEffect(() => {
        if (!ready || prefersReducedMotion()) return;
        const ctx = gsap.context(() => {
            gsap.from('[data-reveal]', { opacity: 0, y: 14, duration: 0.5, stagger: 0.08, ease: 'power2.out' });
        }, rootRef);
        return () => ctx.revert();
    }, [ready]);

    /* motion: underline slides to the active tab */
    useLayoutEffect(() => {
        const el = tabRefs.current[tab];
        if (!el || !underlineRef.current) return;
        const instant = !underlineReady.current || prefersReducedMotion();
        gsap.to(underlineRef.current, { x: el.offsetLeft, width: el.offsetWidth, duration: instant ? 0 : 0.35, ease: 'power3.out' });
        underlineReady.current = true;
    }, [tab, ready, tabs.length]);

    /* motion: content fades in when switching tabs */
    useEffect(() => {
        if (!contentMounted.current) {
            contentMounted.current = true;
            return;
        }
        if (!contentRef.current || prefersReducedMotion()) return;
        gsap.fromTo(contentRef.current, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.25, ease: 'power2.out' });
    }, [tab]);

    /* ---------- actions ---------- */
    const run = async (fn) => {
        setBusy(true);
        setActionError('');
        try {
            await fn();
        } catch (e) {
            setActionError(e.response?.data?.message || 'Something went wrong');
        } finally {
            setBusy(false);
        }
    };

    const bumpMembers = (n) => setOrbital((o) => ({ ...o, memberCount: o.memberCount + n }));

    const handleJoin = () =>
        run(async () => {
            const { data } = await api(`/${orbitalId}/join`, 'post');
            setViewer((v) => ({ ...v, status: data.status }));
            if (data.status === 'active') bumpMembers(1);
        });

    const handleCancelRequest = () =>
        run(async () => {
            await api(`/${orbitalId}/join`, 'delete');
            setViewer((v) => ({ ...v, status: 'none' }));
        });

    const handleLeave = () =>
        run(async () => {
            await api(`/${orbitalId}/leave`, 'delete');
            setViewer({ status: 'none', isAdmin: false });
            bumpMembers(-1);
        });

    const handleApprove = (userId) =>
        run(async () => {
            await api(`/${orbitalId}/requests/${userId}/approve`, 'patch');
            setRequests((r) => r.filter((x) => x.user._id !== userId));
            bumpMembers(1);
        });

    const handleReject = (userId) =>
        run(async () => {
            await api(`/${orbitalId}/requests/${userId}`, 'delete');
            setRequests((r) => r.filter((x) => x.user._id !== userId));
        });

    const saveField = (field) => async (value) => {
        await api(`/${orbitalId}`, 'patch', { [field]: value });
        setOrbital((o) => ({ ...o, [field]: value }));
    };

    /* ---------- render ---------- */
    if (loadError) {
        return (
            <div className="min-h-screen bg-black px-4 py-10">
                <div className={`${glass} max-w-3xl mx-auto p-8 text-center text-[#aaaaaa]`}>{loadError}</div>
            </div>
        );
    }
    if (!orbital) {
        return (
            <div className="min-h-screen bg-black px-4 py-10">
                <div className={`${glass} max-w-3xl mx-auto p-8 text-center text-[#777777]`}>Loading orbital...</div>
            </div>
        );
    }

    // const creatorName =
    //     typeof orbital.creator === 'object' && orbital.creator?.username
    //         ? orbital.creator.username
    //         : viewer.isAdmin
    //             ? 'You'
    //             : 'Unknown';

    const renderContent = () => {
        if (!isMember) {
            return (
                <Empty
                    text={
                        isPrivate
                            ? 'This orbital is private. Request to join to see its posts and members.'
                            : 'Join this orbital to see its posts and members.'
                    }
                />
            );
        }
        if (tabLoading) return <Empty text="Loading..." />;

        if (tab === 'posts') {
            if (!posts.length) return <Empty text="No posts yet." />;
            return (
                <div className="flex flex-col gap-3">
                    {posts.map((p) => (
                        <div key={p._id} className={`${glassInner} p-4`}>
                            <div className="flex items-center gap-3 mb-2">
                                <Avatar user={p.author} size={32} />
                                <div>
                                    <div className="text-[13px] font-semibold">{p.author?.username}</div>
                                    <div className="text-xs text-[#aaaaaa]">{new Date(p.createdAt).toLocaleDateString()}</div>
                                </div>
                            </div>
                            <p className="text-[13px] text-[#cccccc] leading-[1.6] whitespace-pre-wrap">{p.content}</p>
                        </div>
                    ))}
                </div>
            );
        }

        if (tab === 'members') {
            if (!members.length) return <Empty text="No members to show." />;
            return (
                <div className="grid gap-3 sm:grid-cols-2">
                    {members.map((m) => (
                        <div key={m._id} className={`${glassInner} p-3 flex items-center gap-3`}>
                            <Avatar user={m.user} />
                            <div className="min-w-0 flex-1">
                                <div className="text-[13px] font-semibold truncate">{m.user?.username}</div>
                                <div className="text-xs text-[#aaaaaa] truncate">{m.user?.fullName}</div>
                            </div>
                            {m.role === 'admin' && <span className="text-xs text-[#aaaaaa] border border-white/10 rounded-full px-2 py-0.5">admin</span>}
                        </div>
                    ))}
                </div>
            );
        }

        if (!requests.length) return <Empty text="No pending requests." />;
        return (
            <div className="flex flex-col gap-3">
                {requests.map((r) => (
                    <div key={r._id} className={`${glassInner} p-3 flex items-center gap-3`}>
                        <Avatar user={r.user} />
                        <div className="min-w-0 flex-1">
                            <div className="text-[13px] font-semibold truncate">{r.user?.username}</div>
                            <div className="text-xs text-[#aaaaaa] truncate">{r.user?.fullName}</div>
                        </div>
                        <button type="button" disabled={busy} onClick={() => handleApprove(r.user._id)} className={`${neo} px-4 py-1.5 text-xs font-semibold`}>
                            Approve
                        </button>
                        <button type="button" disabled={busy} onClick={() => handleReject(r.user._id)} className={`${neo} px-4 py-1.5 text-xs text-[#aaaaaa]`}>
                            Reject
                        </button>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div ref={rootRef} className="min-h-screen bg-black text-[#e8f0fe] px-4 py-8">
            <div className="max-w-3xl mx-auto  flex flex-col gap-6">
                {/* header */}
                <section data-reveal className={`${glass} p-6`}>
                    <div className="flex flex-col sm:flex-row gap-5">
                        <div className="shrink-0">
                            {imageUrl ? (
                                <img
                                    src={imageUrl}
                                    alt={orbital?.name}
                                    className="w-[88px] h-[88px] rounded-full object-cover shadow-[6px_6px_12px_rgba(0,0,0,0.7),-4px_-4px_10px_rgba(255,255,255,0.045)]"
                                />
                            ) : (
                                <div className="w-[88px] h-[88px] rounded-full bg-[#141414] flex items-center justify-center font-['Syne'] font-bold text-[34px] text-[#aaaaaa] shadow-[6px_6px_12px_rgba(0,0,0,0.7),-4px_-4px_10px_rgba(255,255,255,0.045)]">
                                    {orbital.name[0].toUpperCase()}
                                </div>
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            <InlineEdit
                                as="h1"
                                value={orbital.name}
                                onSave={saveField('name')}
                                editable={viewer.isAdmin}
                                minLength={3}
                                maxLength={50}
                                textClass="font-['Syne'] font-bold text-[26px] sm:text-[30px] leading-tight text-[#e8f0fe]"
                            />
                            <InlineEdit
                                value={orbital.description}
                                onSave={saveField('description')}
                                editable={viewer.isAdmin}
                                multiline
                                maxLength={500}
                                placeholder={viewer.isAdmin ? 'Click to add a description' : 'No description yet.'}
                                textClass="text-[13px] text-[#aaaaaa] leading-[1.6] mt-1"
                            />

                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-[12px] text-[#aaaaaa]">
                                <span className="flex items-center gap-[6px] border border-white/10 rounded-full px-2.5 py-0.5">
                                    {isPrivate ? <FaLock className="text-[10px]" /> : <FaGlobe className="text-[10px]" />}
                                    {orbital.visibility}
                                </span>

                                <span>Creator:</span>
                                <span className="flex items-center gap-[4px] border border-white/10 rounded-full px-2.5 py-0.5">
                                    {orbital.creator?.profilePic && <img src={orbital.creator?.profilePic} alt="Profile" className="w-4 h-4 rounded-full" />}
                                    {orbital.creator?.username || 'Unknown'}
                                </span>

                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 mt-6">
                        {/* Only non-members can join */}
                        {!isMember && !isPending && (
                            <button
                                type="button"
                                disabled={busy}
                                onClick={handleJoin}
                                className={`${neo} px-6 py-2 text-[13px] font-semibold`}
                            >
                                {isPrivate ? 'Request to join' : 'Join'}
                            </button>
                        )}

                        {/* Pending users can cancel their request */}
                        {isPending && (
                            <button
                                type="button"
                                disabled={busy}
                                onClick={handleCancelRequest}
                                className={`${neo} px-6 py-2 text-[13px] text-[#aaaaaa]`}
                            >
                                Requested · Cancel
                            </button>
                        )}

                        {/* Only the creator can destroy */}
                        {canManageOrbital && (
                            <button
                                type="button"
                                disabled={busy}
                                onClick={deleteOrbital}
                                className={`${neo} px-6 py-2 text-[13px] text-[#aaaaaa]`}
                            >
                                Destroy Orbital
                            </button>
                        )}

                        {/* Admins and normal members can leave */}
                        {isMember && !isCreator && (
                            <button
                                type="button"
                                disabled={busy}
                                onClick={handleLeave}
                                className={`${neo} px-6 py-2 text-[13px] text-[#aaaaaa]`}
                            >
                                Exit Orbital
                            </button>
                        )}

                        {/* Only members can message */}
                        {isMember && (
                            <button
                                type="button"
                                onClick={() => onMessage(orbital)}
                                className={`${neo} px-6 py-2 text-[13px] font-semibold`}
                            >
                                Message
                            </button>
                        )}
                        {actionError && <span className="text-xs text-[#c98a8a]">{actionError}</span>}
                    </div>
                </section>

                {/* tabs */}
                <nav data-reveal className="relative flex gap-8 px-2 border-b border-white/8">
                    {tabs.map((t) => (
                        <button
                            key={t.key}
                            type="button"
                            ref={(el) => (tabRefs.current[t.key] = el)}
                            onClick={() => setTab(t.key)}
                            className={`font-['DM_Mono'] text-[14px] font-semibold py-3 transition-colors ${tab === t.key ? 'text-white' : 'text-[#777777] hover:text-[#aaaaaa]'}`}
                        >
                            [ {t.label}{t.count !== undefined ? ` ${t.count}` : ''} ]
                        </button>
                    ))}
                    <span ref={underlineRef} className="absolute bottom-0 left-0 h-[2px] bg-white" style={{ width: 0 }} />
                </nav>

                {/* content */}
                {/* <section data-reveal className={`${glass} p-5`}>
                    <div ref={contentRef}>{renderContent()}</div>
                </section> */}
                <div className="flex flex-col overflow-auto gap-3">
                    {posts.map((post) => (
                        <FilmPostCard
                            key={post._id}
                            post={{
                                ...post,
                                id: post._id,
                            }}
                            isOwn={post.author?._id === currentUserId}
                            isActive
                            onLike={() => { }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}