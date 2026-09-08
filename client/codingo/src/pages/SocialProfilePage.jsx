import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ImageCard, TextCard } from "../components/SocialProfile/SocialImageCard";
import { ArticleCard, QuoteCard } from "../components/SocialProfile/SocialQouteArticleCard";
import { apiUrl } from "../utilites/DashboardHelper";
import { getAuthHeaders } from "../utilites/communityHelper";
import { useParams } from "react-router-dom";
import axios from "axios";
import { FaCamera, FaEdit, FaHeart, FaSave, FaTimes } from "react-icons/fa";
import PostPreview from "../components/SocialProfile/postPreview";

const TABS = ["Your Posts"];

// ---------------------------------------------------------------
// Sample data — swap these out for real API data later.
// ---------------------------------------------------------------

const PROFILE = {
    name: "ALEXANDER COLE",
    title: "Lead Product Designer",
    handle: "@AlexColeDesign",
    bio: "Crafting pixels into experiences. Minimalist advocate. // portfolio: alexcole.design",
    posts: 210,
    followers: "6.8K",
    following: 750,
};

const POSTS_DATA = [
    {
        id: "p1",
        type: "image",
        likes: 522,
        comments: 88,
    },
    {
        id: "p2",
        type: "text",
        title: "UX Case Study: Dark Mode Benefits",
        body: "Crafting pixels into experiences. Minimalist advocate.  // portfolio: alexcole.design...",
    },
    {
        id: "p3",
        type: "quote",
        quote: "Miniminalist design in quote, minimialist design maths.",
        author: "- Minii Design",
    },
    {
        id: "p4",
        type: "article",
        title: "UX Case Study: Dark Mode - External Article",
        body: "The popularitor of designs to thar dark Mode benefram at an internal...",
        author: "alexColeDesign",
    },
];

const SHOWCASE_DATA = [
    {
        id: "s1",
        type: "text",
        title: "Fintech Dashboard Redesign",
        body: "A ground-up redesign of a legacy fintech dashboard, focused on data density without sacrificing clarity...",
    },
    {
        id: "s2",
        type: "image",
        likes: 341,
        comments: 42,
    },
    {
        id: "s3",
        type: "article",
        title: "Design Systems at Scale",
        body: "How we built a token-driven design system used across 12 product teams...",
        author: "alexColeDesign",
    },
    {
        id: "s4",
        type: "quote",
        quote: "Systems age. Principles don't.",
        author: "- A. Cole",
    },
];

const LINKS_DATA = [
    { id: "l1", label: "Portfolio", url: "alexcole.design" },
    { id: "l2", label: "Dribbble", url: "dribbble.com/alexcole" },
    { id: "l3", label: "Behance", url: "behance.net/alexcole" },
    { id: "l4", label: "Twitter / X", url: "x.com/AlexColeDesign" },
];

const DATA_BY_TAB = {
    Posts: POSTS_DATA,
    "Project Showcases": SHOWCASE_DATA,
    Links: LINKS_DATA,
};

// ---------------------------------------------------------------
// Small presentational pieces
// ---------------------------------------------------------------


function LinkRow({ label, url }) {
    return (
        <div className="col-span-1 flex h-16 sm:h-[80px] items-center justify-between rounded-lg sm:rounded-2xl border border-white/10 bg-neutral-900/60 px-3 sm:px-6 gap-2 flex-wrap">
            <span className="text-xs sm:text-base font-semibold text-white truncate">{label}</span>
            <span className="text-xs sm:text-sm text-neutral-400 truncate">{url}</span>
        </div>
    );
}

// ---------------------------------------------------------------
// Main component
// ---------------------------------------------------------------

export default function SocialProfileSection() {
    const [activeTab, setActiveTab] = useState("Your Posts");
    const { userId } = useParams();
    const storedUser = getStoredUser();
    const   isOwnProfile = !userId || userId === storedUser?.id;
    const [currentUser, setCurrentUser] = useState(isOwnProfile ? storedUser : null);
    console.log('currentUser', currentUser)
    const [isEditingUsername, setIsEditingUsername] = useState(false);
    const [editedUsername, setEditedUsername] = useState('');
    const [isEditingBio, setIsEditingBio] = useState(false);
    const [bio, setBio] = useState('');
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);
    const [userPosts, setUserPosts] = useState([]);
    const [postsLoading, setPostsLoading] = useState(true);
    const [showPostPreview, setShowPostPreview] = useState(false);
    const [selectedPostIndex, setSelectedPostIndex] = useState(0);

    const rootRef = useRef(null);
    const headerRef = useRef(null);
    const avatarRef = useRef(null);
    const infoRef = useRef(null);
    const tabsRef = useRef(null);
    const contentRef = useRef(null);
    const firstRender = useRef(true);

    useEffect(() => {
        const fetchUserPosts = async () => {
            const id = userId || storedUser?.id;
            if (!id) return;
            console.log('Fetching posts for user ID:', id, 'storedUser ID:', storedUser?.id, 'isUserId:', userId);

            setPostsLoading(true);
            try {
                const res = await axios.get(
                    `${apiUrl}/api/community/users/${id}/posts?page=1&limit=20`,
                    {
                        withCredentials: true,
                        headers: getAuthHeaders()
                    }
                );
                console.log('res', res);
                setUserPosts(res.data.posts || []);
            } catch (err) {
                console.error('Failed to fetch user posts:', err);
                setError('Failed to load user posts.');
            } finally {
                setPostsLoading(false);
            }
        };

        fetchUserPosts();
    }, [userId, storedUser?.id]);

    // const imageUrl = post.image?.startsWith('/')
    //     ? `${apiUrl}${post.image}`
    //     : post.image;

    const getDisplayImageUrl = (imageUrl) => {
        if (!imageUrl) return '';
        return imageUrl.startsWith('/') ? `${apiUrl}${imageUrl}` : imageUrl;
    };


    function getStoredUser() {
        try {
            const raw = localStorage.getItem('user');
            // console.log('raw', raw)
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    }

    async function fetchUserProfile() {
        try {
            console.log("fetch user profile");
            const url = isOwnProfile
                ? `${apiUrl}/api/auth/user/me`
                : `${apiUrl}/api/auth/user/${userId}/public`;

            const response = await axios.get(url, {
                withCredentials: true,
                headers: getAuthHeaders()
            });
            console.log('ownprofile', isOwnProfile)

            if (response.data?.user) {
                const userData = response.data.user;
                setCurrentUser(userData)
                setBio(userData.bio || '');
                setEditedUsername(userData.username || '');

                if (isOwnProfile) {
                    localStorage.setItem('user', JSON.stringify(userData));
                }
            }
            console.log('Fetched user profile:', response.data);
        } catch (err) {
            console.error('Failed to fetch user profile:', err);
            setError('Failed to load profile.');
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUserProfile();
    }, [userId]);

    const handleAvatarUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 3 * 1024 * 1024) {
            setError('Image must be less than 3MB');
            return;
        }

        setIsUploadingAvatar(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('image', file);

            const response = await axios.patch(
                `${apiUrl}/api/auth/user/profile/image`,
                formData,
                {
                    withCredentials: true,
                    headers: {
                        ...getAuthHeaders(),
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            if (response.data?.user) {
                setCurrentUser(response.data.user);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                window.dispatchEvent(new Event('auth:user-updated'));
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to upload avatar');
        } finally {
            setIsUploadingAvatar(false);
        }
    };

    const handleSaveBio = async () => {
        try {
            const response = await axios.patch(
                `${apiUrl}/api/auth/user/profile`,
                { bio },
                {
                    withCredentials: true,
                    headers: getAuthHeaders()
                }
            );

            if (response.data?.user) {
                setCurrentUser(response.data.user);
                localStorage.setItem('user', JSON.stringify(response.data.user));
            }
            setIsEditingBio(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update bio');
        }
    };

    const handleSaveUsername = async () => {
        const trimmed = editedUsername.trim();
        if (!trimmed || trimmed === currentUser?.username) {
            setIsEditingUsername(false);
            return;
        }

        try {
            setError(null);
            const response = await axios.patch(
                `${apiUrl}/api/auth/user/profile`,
                { username: trimmed },
                {
                    withCredentials: true,
                    headers: getAuthHeaders()
                }
            );

            if (response.data?.user) {
                setCurrentUser(response.data.user);
                setEditedUsername(response.data.user.username);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                window.dispatchEvent(new Event('auth:user-updated'));
            }
            setIsEditingUsername(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update username');
        }
    };

    // Page-open animation
    useEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

            tl.fromTo(
                avatarRef.current,
                { opacity: 0, scale: 0.85 },
                { opacity: 1, scale: 1, duration: 0.7 }
            )
                .fromTo(
                    infoRef.current.children,
                    { opacity: 0, y: 16 },
                    { opacity: 1, y: 0, duration: 0.5, stagger: 0.08 },
                    "-=0.45"
                )
                .fromTo(
                    tabsRef.current,
                    { opacity: 0, y: 12 },
                    { opacity: 1, y: 0, duration: 0.4 },
                    "-=0.2"
                )
                .fromTo(
                    contentRef.current.children,
                    { opacity: 0, y: 24 },
                    { opacity: 1, y: 0, duration: 0.5, stagger: 0.1 },
                    "-=0.15"
                );
        }, rootRef);

        return () => ctx.revert();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Tab-switch animation
    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;
            return;
        }
        if (!contentRef.current) return;

        gsap.fromTo(
            contentRef.current.children,
            { opacity: 0, y: 18 },
            {
                opacity: 1,
                y: 0,
                duration: 0.45,
                stagger: 0.07,
                ease: "power2.out",
            }
        );
    }, [activeTab]);

    const handleTabClick = (tab) => {
        if (tab === activeTab) return;

        const underline = tabsRef.current.querySelector(`[data-tab="${activeTab}"] span.underline-bar`);

        gsap.to(contentRef.current, {
            opacity: 0,
            y: 10,
            duration: 0.18,
            ease: "power2.in",
            onComplete: () => {
                setActiveTab(tab);
                gsap.set(contentRef.current, { opacity: 1, y: 0 });
            },
        });
    };

    const items = DATA_BY_TAB[activeTab];
    const isLinks = activeTab === "Links";

    const showPostModal = (postIndex) => {
        setSelectedPostIndex(postIndex);
        setShowPostPreview(true);
    };


    return (
        <div
            ref={rootRef}
            className="relative min-h-screen w-full overflow-hidden bg-black text-white"
        >
            {/* ---------- Background: dark navy silk texture fading to black ---------- */}
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute inset-x-0 top-0 h-[280px] sm:h-[420px] bg-gradient-to-b from-[#25406b] via-[#16233d] to-transparent" />
                <div className="hidden sm:block absolute -left-20 top-[-100px] h-[500px] w-[700px] rounded-full bg-[#2f5590]/40 blur-[110px]" />
                <div className="hidden sm:block absolute right-[-150px] top-[-60px] h-[450px] w-[600px] rounded-full bg-[#1c3a66]/50 blur-[120px]" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/60 to-black" />
            </div>

            <div className="relative z-10 mx-auto max-w-6xl px-3 sm:px-6 md:px-10 pb-12 sm:pb-16 md:pb-20 pt-8 sm:pt-12 md:pt-16">
                {/* ---------------- Header ---------------- */}
                <div ref={headerRef} className="flex flex-col sm:flex-row items-start justify-between gap-6 sm:gap-8">
                    <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6 md:gap-8 w-full sm:w-auto">
                        <div
                            ref={avatarRef}
                            className="group relative flex h-24 w-24 sm:h-32 sm:w-32 md:h-[190px] md:w-[190px] shrink-0 items-center justify-center overflow-hidden cursor-pointer rounded-full border border-white/10 bg-neutral-200"
                        >
                            {(
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp,image/jpg"
                                    onChange={handleAvatarUpload}
                                    className="hidden"
                                />
                            )}

                            {/* Profile Pic (guarded) */}
                            {currentUser?.profilePic ? (
                                <img
                                    src={currentUser.profilePic}
                                    alt={currentUser?.username || 'Profile'}
                                    className="cursor-pointer w-full h-full object-cover rounded-full transition-opacity duration-200 group-hover:opacity-50"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-neutral-300 text-black text-2xl rounded-full">
                                    {((currentUser?.username && currentUser.username[0]) || 'U').toUpperCase()}
                                    {/* {currentUser?.username} */}
                                </div>
                            )}

                            {/* Overlay Camera Icon */}
                            {isOwnProfile && (
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploadingAvatar}
                                    className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                                >
                                    {isUploadingAvatar ? (
                                        <div className="animate-spin w-6 h-6 rounded-full"></div>
                                    ) : (
                                        <FaCamera className="text-2xl text-white transform transition-transform duration-200 group-hover:scale-110" />
                                    )}
                                </button>
                            )}
                        </div>


                        <div ref={infoRef} className="pt-0 sm:pt-2 flex-1">

                            {/* <h1 className="text-5xl font-extrabold tracking-tight">{currentUser.username}</h1> */}
                            {isOwnProfile && isEditingUsername ? (
                                <div className="flex items-center gap-2 flex-wrap">
                                    <input
                                        type="text"
                                        value={editedUsername}
                                        onChange={(e) => setEditedUsername(e.target.value)}
                                        className="bg-transparent text-white text-xl sm:text-2xl md:text-3xl font-bold outline-0 flex-1 min-w-0"
                                        maxLength={30}
                                        autoFocus
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleSaveUsername();
                                            if (e.key === 'Escape') {
                                                setEditedUsername(currentUser?.username || '');
                                                setIsEditingUsername(false);
                                            }
                                        }}
                                    />
                                    <button type="button" onClick={handleSaveUsername} className="text-cyan-400 hover:text-cyan-300">
                                        <FaSave />
                                    </button>
                                    <button type="button" onClick={() => { setEditedUsername(currentUser?.username || ''); setIsEditingUsername(false); }} className="text-gray-400 hover:text-gray-300">
                                        <FaTimes />
                                    </button>
                                </div>
                            ) : (
                                <>
                                    {(
                                        <h1 onClick={() => setIsEditingUsername(true)} className="text-xl sm:text-2xl md:text-3xl font-bold truncate hover:text-white/80 transition">{currentUser?.username || 'Learner'}</h1>
                                    )}
                                </>
                            )}

                            {/* <p className="mt-2 text-xl text-neutral-300">{currentUser?.username}</p> */}
                            {/* <p className="mt-1 text-xs sm:text-sm text-neutral-500">{PROFILE.handle}</p> */}

                            {isOwnProfile && isEditingBio ? (
                                <div>
                                    <textarea
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                        placeholder="Write something about yourself..."
                                        className="w-full bg-transparent text-white text-xs sm:text-sm rounded-lg outline-none"
                                        rows="3"
                                        maxLength="200"
                                    />
                                    <div className="flex items-center justify-between mt-2 flex-wrap gap-2">
                                        <span className="text-xs text-gray-500">{bio.length}/200</span>
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setBio(currentUser?.bio || '');
                                                    setIsEditingBio(false);
                                                }}
                                                className="px-2 sm:px-3 py-1 bg-gray-600 hover:bg-gray-700 rounded-lg text-xs sm:text-sm font-semibold transition"
                                            >
                                                <FaTimes className="inline mr-1" /> Cancel
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleSaveBio}
                                                className="px-2 sm:px-3 py-1 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-xs sm:text-sm font-semibold transition"
                                            >
                                                <FaSave className="inline mr-1" /> Save
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-start justify-between">

                                    {(
                                        <p onClick={() => setIsEditingBio(true)} className="text-gray-300 text-xs sm:text-sm flex-1">{currentUser?.bio || (isOwnProfile ? 'No bio yet. Click edit to add one.' : 'No bio yet.')}</p>
                                    )}
                                </div>
                            )}

                            <div className="mt-4 sm:mt-5 flex items-center gap-2 sm:gap-3 text-neutral-400 text-xs sm:text-sm flex-wrap">
                                <span>
                                    <span className="font-bold text-white">{userPosts?.length}</span> Posts
                                </span>
                                <span className="text-neutral-600">|</span>
                                <span>
                                    <span className="font-bold text-white">{PROFILE.followers}</span> Followers
                                </span>
                                <span className="text-neutral-600 hidden sm:inline">|</span>
                                <span>
                                    <span className="font-bold text-white">{PROFILE.following}</span> Following
                                </span>
                            </div>
                        </div>
                    </div>

                </div>

                {/* ---------------- Tabs ---------------- */}
                <div
                    ref={tabsRef}
                    className="mt-8 sm:mt-10 flex items-center justify-center gap-6 sm:gap-10 border-b border-white/10 pb-3 sm:pb-4 overflow-x-auto"
                >
                    {TABS.map((tab) => {
                        const active = tab === activeTab;
                        return (
                            <button
                                key={tab}
                                data-tab={tab}
                                onClick={() => handleTabClick(tab)}
                                className={`relative pb-2 text-sm sm:text-lg font-medium transition-colors whitespace-nowrap ${active ? "font-bold text-white" : "text-neutral-500 hover:text-neutral-300"
                                    }`}
                            >
                                [ {tab} ]
                                {active && (
                                    <span className="underline-bar absolute -bottom-[17px] left-0 h-[2px] w-full bg-white" />
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* ---------------- Content grid ---------------- */}
                <div ref={contentRef} className="mt-8 sm:mt-10">
                    {postsLoading ? (
                        <div className="text-center text-gray-400 text-sm sm:text-base">Loading posts...</div>
                    ) : userPosts.length === 0 ? (
                        <div className="text-center text-gray-400 text-sm sm:text-base">No posts yet.</div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 max-w-6xl mx-auto">
                            {userPosts.map((post, postIndex) => {
                                const imageUrl = getDisplayImageUrl(post.image);
                                const videoUrl = post.video?.startsWith('/') ? `${apiUrl}${post.video}` : post.video;

                                return (
                                    <div
                                        key={post.id}
                                        onClick={() => showPostModal(postIndex)}
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={(event) => {
                                            if (event.key === 'Enter' || event.key === ' ') showPostModal(postIndex);
                                        }}
                                        className="rounded-lg sm:rounded-2xl border border-white/10 bg-[#2B2B2B] p-3 sm:p-4 transition-transform duration-300 hover:scale-105 hover:shadow-lg"
                                    >
                                        <div className="mb-3 text-xs sm:text-sm text-gray-400">
                                            {new Date(post.createdAt).toLocaleDateString()}
                                        </div>
                                        <div className="text-white text-sm sm:text-base mb-3 line-clamp-3">{post.content}</div>
                                        {post.image && (
                                            <div className="overflow-hidden rounded-lg sm:rounded-xl aspect-square mb-3">
                                                <img src={imageUrl} alt="" className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                        {post.video && (
                                            <div className="overflow-hidden rounded-lg sm:rounded-xl aspect-square mb-3">
                                                <video src={videoUrl} muted playsInline preload="metadata" className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                        <div className="flex items-center justify-between text-xs sm:text-sm text-gray-400 flex-wrap gap-2">
                                            <div className="flex items-center gap-1">
                                                <span className="flex items-center justify-center"><FaHeart size={12} className="sm:w-4 sm:h-4" /></span>
                                                <span>{post.likesCount} likes</span>
                                            </div>
                                            <span>{post.commentsCount} comments</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        )}
                        {showPostPreview && (
                            <PostPreview posts={userPosts} initialIndex={selectedPostIndex} isOpen={showPostPreview} onClose={() => setShowPostPreview(false)} />
                        )}
                </div>
            </div>
        </div>
    );
}