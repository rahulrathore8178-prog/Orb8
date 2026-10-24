import React, { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ImageCard, TextCard } from "../components/SocialProfile/SocialImageCard";
import { ArticleCard, QuoteCard } from "../components/SocialProfile/SocialQouteArticleCard";
import { apiUrl } from "../utilites/DashboardHelper";
import { getAuthHeaders } from "../utilites/communityHelper";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { FaCamera, FaEdit, FaHeart, FaSave, FaTimes } from "react-icons/fa";
import { FiMessageCircle } from "react-icons/fi";
import PostPreview from "../components/SocialProfile/postPreview";
import InsightsPanel from "../components/SocialProfile/InsightsPanel";
import { raised } from "../utilites/cssUtility";
import { useDispatch, useSelector } from "react-redux";
import { FaSearch, FaUserCircle /* ...your existing icons */ } from "react-icons/fa";
import { fetchFriendRequests, fetchFriends } from "../redux/slices/friendsSlice";
import { Archive, BarChart3, Check, GripVertical, Lock, Maximize2, RotateCcw, ShieldBan, Trash2, X } from "lucide-react";
import { setPosts } from "../redux/slices/feedSlice";
import {
    closestCenter,
    DndContext,
    KeyboardSensor,
    MouseSensor,
    TouchSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import {
    arrayMove,
    rectSortingStrategy,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const GRID_SIZE_CLASSES = {
    '1x1': 'col-span-1 row-span-1',
    '2x1': 'col-span-2 row-span-1',
    '3x1': 'col-span-3 row-span-1',
    '1x2': 'col-span-1 row-span-2',
    '2x2': 'col-span-2 row-span-2',
    '3x2': 'col-span-3 row-span-2',
    '1x3': 'col-span-1 row-span-3',
    '2x3': 'col-span-2 row-span-3',
    '3x3': 'col-span-3 row-span-3',
};


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
};

// ---------------------------------------------------------------
// Main component
// ---------------------------------------------------------------

export default function SocialProfileSection() {
    const [activeTab, setActiveTab] = useState("Posts");
    const { userId } = useParams();
    const navigate = useNavigate();
    const storedUser = getStoredUser();
    const isOwnProfile = !userId || userId === storedUser?.id;
    const [currentUser, setCurrentUser] = useState(isOwnProfile ? storedUser : null);
    const friends = useSelector(state => state.friends.friends);
    const incomingFriendRequests = useSelector(state => state.friends.friendRequests);
    const requestsLoading = useSelector(state => state.friends.isLoading);
    const requestsError = useSelector(state => state.friends.error);
    const friendsCount = currentUser?.friends?.length || 0;
    const pendingFollowRequestCount = currentUser?.followRequests?.length || 0;
    const friendRequestCount = currentUser?.friendRequests?.length ?? incomingFriendRequests.length;
    const [isEditingUsername, setIsEditingUsername] = useState(false);
    const [editedUsername, setEditedUsername] = useState('');
    const [isEditingBio, setIsEditingBio] = useState(false);
    const [bio, setBio] = useState('');
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);
    const [userPosts, setUserPosts] = useState([]);
    const [postsLoading, setPostsLoading] = useState(true);
    const [showPostPreview, setShowPostPreview] = useState(false);
    const [selectedPostIndex, setSelectedPostIndex] = useState(0);
    const [actingOnRequestId, setActingOnRequestId] = useState(null);
    const [incomingFollowRequests, setIncomingFollowRequests] = useState([]);
    const [followRequestsLoading, setFollowRequestsLoading] = useState(false);
    const [followRequestsError, setFollowRequestsError] = useState(null);
    const [actingOnFollowRequestId, setActingOnFollowRequestId] = useState(null);
    const [profileConnections, setProfileConnections] = useState([]);
    const [connectionsLoading, setConnectionsLoading] = useState(false);
    const [connectionsError, setConnectionsError] = useState(null);
    const [friendSearch, setFriendSearch] = useState("");
    const friendsListRef = useRef(null);
    const [profileGridLayout, setProfileGridLayout] = useState([]);
    const gridRef = useRef(null);
    const [gridCellSize, setGridCellSize] = useState(0);
    const [insights, setInsights] = useState(null);
    const [followStatus, setFollowStatus] = useState('none');
    const [canViewPosts, setCanViewPosts] = useState(true);
    const dispatch = useDispatch();
    const sensors = useSensors(
        useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    );
    // const [postId, setPostId] = useState();


    const filteredFriends = useMemo(() => {
        const term = friendSearch.trim().toLowerCase();
        if (!term) return friends;
        return friends.filter((friend) => friend.username?.toLowerCase().includes(term));
    }, [friends, friendSearch]);

    useEffect(() => {
        if (activeTab !== 'Friends' || !friendsListRef.current) return;
        const ctx = gsap.context(() => {
            gsap.fromTo(
                friendsListRef.current.children,
                { opacity: 0, y: 12 },
                { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, ease: "power3.out" }
            );
        }, friendsListRef);
        return () => ctx.revert();
    }, [activeTab, filteredFriends.length]);

    useEffect(() => {
        const grid = gridRef.current;
        if (!grid || activeTab !== 'Posts') return;

        const updateCellSize = () => {
            const columnGap = parseFloat(getComputedStyle(grid).columnGap) || 0;
            setGridCellSize((grid.clientWidth - (columnGap * 2)) / 3);
        };
        const resizeObserver = new ResizeObserver(updateCellSize);
        updateCellSize();
        resizeObserver.observe(grid);
        return () => resizeObserver.disconnect();
    }, [activeTab, postsLoading]);

    const TABS = [
        { label: 'Posts', value: 'Posts', count: userPosts?.length ?? 0 },
        { label: 'Orbiters', value: 'Followers', count: currentUser?.followersCount ?? currentUser?.followers?.length ?? 0 },
        { label: 'Orbits', value: 'Following', count: currentUser?.followingCount ?? currentUser?.following?.length ?? 0 },
        { label: 'Constellations', value: 'Friends', count: friendsCount },
        ...(isOwnProfile ? [
            { label: 'Saved', count: null },
            { label: 'Archived', count: null },
            { label: 'Insights', count: null },
        ] : []),
        ...(isOwnProfile ? [{ label: 'Requests', count: friendRequestCount + pendingFollowRequestCount }] : []),
    ];

    const rootRef = useRef(null);
    const actionsRef = useRef(null);
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
            // console.log('Fetching posts for user ID:', id, 'storedUser ID:', storedUser?.id, 'isUserId:', userId);

            setPostsLoading(true);
            try {
                if (isOwnProfile && activeTab === 'Insights') {
                    const insightResponse = await axios.get(`${apiUrl}/api/community/insights`, {
                        withCredentials: true,
                        headers: getAuthHeaders(),
                    });
                    setInsights(insightResponse.data.insights);
                    return;
                }

                const endpoint = isOwnProfile && activeTab === 'Saved'
                    ? `${apiUrl}/api/community/saved`
                    : `${apiUrl}/api/community/users/${id}/posts?page=1&limit=20${activeTab === 'Archived' ? '&archived=true' : ''}`;
                const res = await axios.get(
                    endpoint,
                    {
                        withCredentials: true,
                        headers: getAuthHeaders()
                    }
                );
                const posts = activeTab === 'Saved'
                    ? (res.data.savedPosts || []).map(item => ({
                        ...item.post,
                        id: item.post.id || item.post._id,
                        isSavedByCurrentUser: true,
                    }))
                    : (res.data.posts || []);
                setUserPosts(posts);
                // console.log('userPosts', res?.data?.id)
                // setPostId(res?.id)
            } catch (err) {
                console.error('Failed to fetch user posts:', err);
                setUserPosts([]);
                setError(err.response?.status === 403 ? 'This profile is private.' : 'Failed to load user posts.');
            } finally {
                setPostsLoading(false);
            }
        };

        fetchUserPosts();
    }, [activeTab, isOwnProfile, userId, storedUser?.id]);


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

    async function fetchUserProfile(signal) {
        try {
            setError(null);
            // console.log("fetch user profile");
            const url = isOwnProfile
                ? `${apiUrl}/api/auth/user/me`
                : `${apiUrl}/api/auth/user/${userId}/public`;

            const response = await axios.get(url, {
                withCredentials: true,
                headers: getAuthHeaders(),
                signal,
            });

            if (response.data?.user) {
                const userData = response.data.user;
                setCurrentUser(userData)
                setError(null);
                setBio(userData.bio || '');
                setEditedUsername(userData.username || '');
                setProfileGridLayout((userData.profileGridLayout || []).map(item => ({
                    post: String(item.post),
                    gridSize: item.gridSize,
                })));
                setFollowStatus(userData.followStatus || 'none');
                setCanViewPosts(userData.canViewPosts !== false);

                if (isOwnProfile) {
                    localStorage.setItem('user', JSON.stringify(userData));
                }
            }
            // console.log('Fetched user profile:', response?.data?.user);
        } catch (err) {
            if (axios.isCancel(err) || err.code === 'ERR_CANCELED') return;
            console.error('Failed to fetch user profile:', err);
            setError('Failed to load profile.');
        }
    };

    useEffect(() => {
        const controller = new AbortController();
        fetchUserProfile(controller.signal);
        return () => controller.abort();
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
            formData.append('profilePic', file);

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

    const updateFollow = async () => {
        const method = followStatus === 'following' || followStatus === 'requested' ? 'delete' : 'post';
        const response = await axios({
            method,
            url: `${apiUrl}/api/social/follow/${userId}`,
            withCredentials: true,
            headers: getAuthHeaders(),
        });
        setFollowStatus(response.data.status);
    };

    const blockProfile = async () => {
        if (!confirm('Block this user? You will no longer see each other.')) return;
        await axios.post(`${apiUrl}/api/social/block/${userId}`, {}, {
            withCredentials: true,
            headers: getAuthHeaders(),
        });
        window.location.href = '/community';
    };

    const updatePrivacy = async () => {
        const response = await axios.patch(`${apiUrl}/api/social/privacy`, {
            isPrivate: !currentUser?.isPrivate,
        }, {
            withCredentials: true,
            headers: getAuthHeaders(),
        });
        setCurrentUser(user => ({ ...user, isPrivate: response.data.isPrivate }));
    };

    const persistGrid = async (layout) => {
        setProfileGridLayout(layout);
        const response = await axios.put(`${apiUrl}/api/social/profile-grid`, { layout }, {
            withCredentials: true,
            headers: getAuthHeaders(),
        });
        if (!Array.isArray(response.data?.layout)) {
            throw new Error('The server did not confirm the saved grid layout.');
        }
        setProfileGridLayout(response.data.layout.map(item => ({
            post: String(item.post),
            gridSize: item.gridSize,
        })));
    };

    const getCompleteGridLayout = () => {
        const postIds = new Set(userPosts.map(post => post.id));
        const savedLayout = profileGridLayout.filter(item => postIds.has(item.post));
        const savedIds = new Set(savedLayout.map(item => item.post));
        return [
            ...savedLayout,
            ...userPosts.filter(post => !savedIds.has(post.id)).map(post => ({ post: post.id, gridSize: '1x1' })),
        ];
    };

    const reorderGrid = ({ active, over }) => {
        if (!isOwnProfile || !over || active.id === over.id) return;
        const layout = getCompleteGridLayout();
        const oldIndex = layout.findIndex(item => item.post === active.id);
        const newIndex = layout.findIndex(item => item.post === over.id);
        if (oldIndex === -1 || newIndex === -1) return;
        persistGrid(arrayMove(layout, oldIndex, newIndex)).catch(() => setError('Failed to save grid order.'));
    };

    const resizeGridItem = (postId, gridSize) => {
        if (!GRID_SIZE_CLASSES[gridSize]) return;
        const layout = getCompleteGridLayout();
        const nextLayout = layout.map(item => item.post === postId ? { ...item, gridSize } : item);
        if (layout.find(item => item.post === postId)?.gridSize === gridSize) return;
        persistGrid(nextLayout).catch((error) => {
            setProfileGridLayout(layout);
            setError(error.response?.data?.message || error.message || 'Failed to save tile size.');
        });
    };

    const handleArchive = async (postId, isArchived) => {
        await axios.patch(`${apiUrl}/api/community/posts/${postId}/archive`, { isArchived }, {
            withCredentials: true,
            headers: getAuthHeaders(),
        });
        setUserPosts(posts => posts.filter(post => post.id !== postId));
    };

    const orderedPosts = useMemo(() => {
        if (activeTab !== 'Posts' || profileGridLayout.length === 0) return userPosts;
        const positions = new Map(profileGridLayout.map((item, index) => [item.post, index]));
        return [...userPosts].sort((left, right) =>
            (positions.get(left.id) ?? Number.MAX_SAFE_INTEGER) - (positions.get(right.id) ?? Number.MAX_SAFE_INTEGER));
    }, [activeTab, profileGridLayout, userPosts]);

    const resolveFriendRequest = async (request, accept) => {
        if (actingOnRequestId) return;
        setActingOnRequestId(request._id);
        setError(null);
        try {
            await axios.post(
                `${apiUrl}/api/social/friend-request/${request._id}/${accept ? 'accept' : 'reject'}`,
                {},
                { withCredentials: true, headers: getAuthHeaders() },
            );
            setCurrentUser(user => user ? {
                ...user,
                friendRequests: (user.friendRequests || []).filter(item => String(item._id) !== String(request._id)),
                friends: accept
                    ? [...(user.friends || []), request.from._id]
                    : user.friends || [],
            } : user);
            dispatch(fetchFriendRequests());
            if (accept) dispatch(fetchFriends());
        } catch (requestError) {
            setError(requestError.response?.data?.message || `Failed to ${accept ? 'accept' : 'reject'} friend request.`);
        } finally {
            setActingOnRequestId(null);
        }
    };

    const resolveFollowRequest = async (requester, accept) => {
        if (actingOnFollowRequestId) return;
        setActingOnFollowRequestId(requester._id);
        setFollowRequestsError(null);
        try {
            await axios.patch(`${apiUrl}/api/social/follow-requests/${requester._id}`, { accept }, {
                withCredentials: true,
                headers: getAuthHeaders(),
            });
            setIncomingFollowRequests(requests => requests.filter(request => String(request._id) !== String(requester._id)));
            setCurrentUser(user => user ? {
                ...user,
                followRequests: (user.followRequests || []).filter(id => String(id) !== String(requester._id)),
                followers: accept ? [...(user.followers || []), requester._id] : user.followers || [],
                followersCount: accept
                    ? (user.followersCount ?? user.followers?.length ?? 0) + 1
                    : (user.followersCount ?? user.followers?.length ?? 0),
            } : user);
        } catch (requestError) {
            setFollowRequestsError(requestError.response?.data?.message || `Failed to ${accept ? 'accept' : 'decline'} follow request.`);
        } finally {
            setActingOnFollowRequestId(null);
        }
    };

    // delete function
    const handleDelete = async (postId) => {
        if (!confirm('Delete this post?')) return;
        try {
            // console.log(postId)
            await axios.delete(`${apiUrl}/api/community/posts/${postId}`, {
                withCredentials: true,
                headers: getAuthHeaders(),
            });
            dispatch(setPosts((prev) => prev.filter((p) => p.id !== postId)));
            showPostModal(false);
        } catch (err) { console.error('Delete error:', err); }
    };

    // Load friends when tab changes to friends
    useEffect(() => {
        if (activeTab === 'Friends') {
            dispatch(fetchFriends());
            // console.log('dispatching fetchFriends', reduxfriends);
        } else if (activeTab === 'Requests') {
            dispatch(fetchFriendRequests());
        }
    }, [activeTab, dispatch]);

    useEffect(() => {
        if (!isOwnProfile || activeTab !== 'Requests') return undefined;
        let active = true;
        setFollowRequestsLoading(true);
        setFollowRequestsError(null);
        axios.get(`${apiUrl}/api/social/follow-requests`, {
            withCredentials: true,
            headers: getAuthHeaders(),
        }).then(response => {
            if (active) setIncomingFollowRequests(response.data.requests || []);
        }).catch(requestError => {
            if (active) setFollowRequestsError(requestError.response?.data?.message || 'Failed to load follow requests.');
        }).finally(() => {
            if (active) setFollowRequestsLoading(false);
        });
        return () => { active = false; };
    }, [activeTab, isOwnProfile]);

    useEffect(() => {
        if (!['Followers', 'Following'].includes(activeTab)) return undefined;
        const profileId = userId || storedUser?.id;
        if (!profileId) return undefined;

        let active = true;
        setConnectionsLoading(true);
        setConnectionsError(null);
        axios.get(`${apiUrl}/api/social/users/${profileId}/${activeTab.toLowerCase()}`, {
            withCredentials: true,
            headers: getAuthHeaders(),
        }).then(response => {
            if (active) setProfileConnections(response.data.users || []);
        }).catch(connectionError => {
            if (!active) return;
            setProfileConnections([]);
            setConnectionsError(connectionError.response?.data?.message || `Failed to load ${activeTab.toLowerCase()}.`);
        }).finally(() => {
            if (active) setConnectionsLoading(false);
        });
        return () => { active = false; };
    }, [activeTab, userId, storedUser?.id]);

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
                );

            if (actionsRef.current) {
                tl.fromTo(
                    actionsRef.current,
                    { opacity: 0, y: 14 },
                    { opacity: 1, y: 0, duration: 0.4 },
                    "-=0.2"
                );
            }

            tl.fromTo(
                tabsRef.current,
                { opacity: 0, y: 12 },
                { opacity: 1, y: 0, duration: 0.4 },
                "-=0.2"
            )
                .fromTo(
                    contentRef.current,
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

        const strip = tabsRef.current;
        const target = strip?.querySelector(`[data-tab="${tab}"]`);
        if (strip && target && strip.scrollWidth > strip.clientWidth) {
            strip.scrollTo({ left: target.offsetLeft - (strip.clientWidth - target.offsetWidth) / 2, behavior: "smooth" });
        }
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

    const showPostModal = (postIndex) => {
        setSelectedPostIndex(postIndex);
        setShowPostPreview(true);
    };

    const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000")
        .replace(/^ws/, "http")
        .replace(/\/$/, "");

    const resolveImg = (p) =>
        !p ? p : /^https?:\/\//.test(p) ? p : `${API_BASE}${p}`;


    return (
        <div
            ref={rootRef}
            className="relative min-h-full w-full bg-black text-white"
        >
            <div className="relative z-10 mx-auto w-full max-w-6xl px-3 pb-12 pt-8 sm:px-6 sm:pb-16 sm:pt-12 md:px-10 md:pb-20">
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
                                    src={resolveImg(currentUser?.profilePic)}
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
                                        <h1 onClick={() => isOwnProfile && setIsEditingUsername(true)} className="text-xl sm:text-2xl md:text-3xl font-bold truncate hover:text-white/80 transition">{currentUser?.username || 'Learner'}</h1>
                                    )}
                                </>
                            )}

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

                                    <p onClick={() => isOwnProfile && setIsEditingBio(true)} className="text-gray-300 text-xs sm:text-sm flex-1">
                                        {currentUser?.bio || (isOwnProfile ? 'No bio yet. Click here to add one.' : 'No bio yet.')}
                                    </p>
                                </div>
                            )}
                            <div className="mt-3 flex flex-wrap gap-4 text-xs text-white/55">
                                <span>{currentUser?.followersCount ?? currentUser?.followers?.length ?? 0} Orbiters</span>
                                <span>{currentUser?.followingCount ?? currentUser?.following?.length ?? 0} Orbits</span>
                            </div>
                            {isOwnProfile && (
                                <button
                                    type="button"
                                    onClick={updatePrivacy}
                                    className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-white/10 px-2.5 py-1.5 text-xs text-white/70 hover:bg-white/5 hover:text-white"
                                >
                                    <Lock size={13} /> {currentUser?.isPrivate ? 'Private profile' : 'Public profile'}
                                </button>
                            )}
                        </div>
                    </div>

                </div>
                {!isOwnProfile && (
                    <div
                        ref={actionsRef}
                        className="mt-6 sm:mt-8 mx-auto flex w-full max-w-xs flex-col items-stretch justify-center gap-2 px-4 sm:max-w-none sm:w-auto sm:flex-row sm:items-center sm:gap-3 sm:px-0"
                    >
                        <button
                            type="button"
                            onClick={updateFollow}
                            className={`flex-1 rounded-lg px-4 py-2 text-xs font-semibold transition-all active:scale-[0.97] sm:min-w-[140px] sm:flex-none sm:py-2.5 sm:text-sm ${followStatus === 'none' ? 'bg-cyan-600 hover:bg-cyan-700' : 'bg-gray-700 hover:bg-gray-600'}`}
                        >
                            {followStatus === 'following' ? 'Following' : followStatus === 'requested' ? 'Requested' : 'Follow'}
                        </button>
                        <button className="flex-1 rounded-lg bg-cyan-600 px-4 py-2 text-xs font-semibold transition-all hover:bg-cyan-700 active:scale-[0.97] sm:min-w-[140px] sm:flex-none sm:py-2.5 sm:text-sm">
                            Send Message
                        </button>
                        <button type="button" onClick={blockProfile} className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-white/55 hover:bg-white/5 hover:text-red-400" aria-label="Block user">
                            <ShieldBan size={17} />
                        </button>
                    </div>
                )}

                {error && (
                    <div className="mt-5 rounded-md border border-red-400/20 bg-red-400/5 px-3 py-2 text-sm text-red-300">
                        {error}
                    </div>
                )}

                {/* ---------------- Tabs ---------------- */}
                <div
                    ref={tabsRef}
                    role="tablist"
                    aria-label="Profile sections"
                    className="-mx-3 mt-8 flex snap-x snap-mandatory items-center gap-2 overflow-x-auto px-3 pb-2 [mask-image:linear-gradient(to_right,transparent,#000_14px,#000_calc(100%-14px),transparent)] [scrollbar-width:none] sm:mx-0 sm:mt-10 sm:justify-center sm:px-0 sm:[mask-image:none] [&::-webkit-scrollbar]:hidden"
                >
                    {TABS.map(({ label, count, value = label }) => {
                        const active = value === activeTab;
                        return (
                            <button
                                key={value}
                                type="button"
                                role="tab"
                                aria-selected={active}
                                data-tab={value}
                                onClick={() => handleTabClick(value)}
                                className={`inline-flex shrink-0 snap-center items-center gap-2 whitespace-nowrap rounded-full border px-3.5 py-2 text-xs transition duration-300 active:scale-95 sm:text-sm ${active
                                    ? `${raised} border-white/15 font-medium text-white`
                                    : 'border-white/[0.07] bg-white/[0.03] text-neutral-400 hover:border-white/15 hover:text-neutral-100'
                                    }`}
                            >
                                {label}
                                {count !== null && count !== undefined && (
                                    <span className={`rounded-full px-1.5 py-px text-[10px] tabular-nums ${active ? 'bg-white/15 text-white' : 'bg-white/[0.06] text-neutral-500'}`}>
                                        {count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
                {!canViewPosts && !isOwnProfile && activeTab === 'Posts' ? (
                    <div className="mt-16 flex flex-col items-center gap-3 text-center text-white/50">
                        <Lock size={24} />
                        <p className="text-sm">Follow this private profile to see its posts.</p>
                    </div>
                ) : activeTab === 'Insights' && isOwnProfile ? (
                    <InsightsPanel insights={insights} loading={postsLoading && !insights} resolveImage={resolveImg} />
                ) : activeTab === 'Followers' || activeTab === 'Following' ? (
                    <div className="mt-5 divide-y divide-white/10 border-y border-white/10">
                        <div className="py-4">
                            <h3 className="text-sm font-semibold text-white">
                                {activeTab === 'Followers' ? 'Orbiters' : 'Orbits'}
                            </h3>
                            <p className="mt-1 text-sm text-neutral-400">
                                {activeTab === 'Followers'
                                    ? 'People who follow your content are orbiting around your digital world.'
                                    : "The people whose worlds you've chosen to keep up with."}
                            </p>
                            <p className="mt-1 text-xs italic text-neutral-500">
                                {activeTab === 'Followers'
                                    ? `Example: “You have ${(currentUser?.followersCount ?? currentUser?.followers?.length ?? 0).toLocaleString()} Orbiters.”`
                                    : `Example: “You're in ${(currentUser?.followingCount ?? currentUser?.following?.length ?? 0).toLocaleString()} Orbits.”`}
                            </p>
                        </div>
                        {connectionsLoading ? (
                            <p className="py-8 text-center text-sm text-neutral-400">Loading {activeTab === 'Followers' ? 'Orbiters' : 'Orbits'}...</p>
                        ) : connectionsError ? (
                            <p role="status" className="py-8 text-center text-sm text-neutral-400">
                                {connectionsError.includes('private')
                                    ? 'This private profile’s connections are visible after your follow request is accepted.'
                                    : connectionsError}
                            </p>
                        ) : profileConnections.length === 0 ? (
                            <p className="py-8 text-center text-sm text-neutral-400">No {activeTab === 'Followers' ? 'Orbiters' : 'Orbits'} yet.</p>
                        ) : profileConnections.map(person => (
                            <button
                                key={person._id}
                                type="button"
                                onClick={() => navigate(`/socialprofile/${person._id}`)}
                                className="flex w-full items-center gap-3 py-3 text-left transition hover:bg-white/[0.03]"
                            >
                                {person.profilePic ? (
                                    <img src={person.profilePic} alt="" className="h-11 w-11 shrink-0 rounded-full border border-white/10 object-cover" />
                                ) : (
                                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/10 bg-white/5 text-sm font-semibold text-neutral-300">
                                        {person.username?.charAt(0)?.toUpperCase() || '?'}
                                    </span>
                                )}
                                <span className="min-w-0 flex-1">
                                    <span className="block truncate text-sm font-semibold text-white">{person.username || 'Orbit member'}</span>
                                    {person.bio && <span className="mt-1 block truncate text-xs text-neutral-500">{person.bio}</span>}
                                </span>
                            </button>
                        ))}
                    </div>
                ) : activeTab === 'Friends' ? (
                    <div>
                        <div className="mt-5 mb-4">
                            <h3 className="text-sm font-semibold text-white">Constellations</h3>
                            <p className="mt-1 text-sm text-neutral-400">Mutual connections who share your corner of the universe.</p>
                        </div>
                        <div className="relative mb-4 sm:mb-6 mt-5 max-w-md mx-auto sm:mx-0">
                            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={13} />
                            <input
                                type="text"
                                value={friendSearch}
                                onChange={(e) => setFriendSearch(e.target.value)}
                                placeholder="Search your constellation..."
                                className="w-full bg-transparent border border-white/10 rounded-full pl-9 pr-4 py-2 sm:py-2.5 text-sm text-white placeholder-gray-500 outline-none transition-colors focus:border-white/25"
                            />
                        </div>

                        {friends.length === 0 ? (
                            <div className="text-center text-gray-400 text-sm sm:text-base">Your constellation is just beginning.</div>
                        ) : (
                            <div ref={friendsListRef} className="flex min-w-0 w-full flex-col divide-y divide-white/5 mx-auto">
                                {filteredFriends.map((friend) => (
                                    <div
                                        key={friend.id}
                                        onClick={() => {
                                            // Navigate to friend's profile page
                                            window.location.href = `/socialprofile/${friend._id}`;
                                        }}
                                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 cursor-pointer transition-transform duration-200 hover:scale-[1.02] active:scale-[0.97]"
                                    >
                                        {friend.profilePic ? (
                                            <img
                                                src={friend.profilePic}
                                                alt={friend.username || 'Friend'}
                                                className="h-11 w-11 sm:h-12 sm:w-12 flex-shrink-0 rounded-full border border-white/10 object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-11 w-11 sm:h-12 sm:w-12 flex-shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5">
                                                <FaUserCircle className="text-gray-500" size={22} />
                                            </div>
                                        )}
                                        <div className="min-w-0 flex-1">
                                            <div className="truncate cursor-pointer text-sm font-semibold text-white sm:text-base">{friend.username}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : activeTab === 'Requests' && isOwnProfile ? (
                    <div className="mt-5 space-y-7">
                        {requestsLoading || followRequestsLoading ? (
                            <p className="py-8 text-center text-sm text-neutral-400">Loading requests...</p>
                        ) : (requestsError || followRequestsError) ? (
                            <p role="alert" className="py-5 text-center text-sm text-rose-300">{requestsError || followRequestsError}</p>
                        ) : incomingFollowRequests.length === 0 && incomingFriendRequests.length === 0 ? (
                            <p className="border-y border-white/10 py-8 text-center text-sm text-neutral-400">No pending requests.</p>
                        ) : (
                            <>
                                {incomingFollowRequests.length > 0 && (
                                    <section>
                                        <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">Follow requests</h3>
                                        <div className="divide-y divide-white/10 border-y border-white/10">
                                            {incomingFollowRequests.map(requester => (
                                                <div key={requester._id} className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center">
                                                    <button type="button" onClick={() => navigate(`/socialprofile/${requester._id}`)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                                                        {requester.profilePic ? (
                                                            <img src={requester.profilePic} alt="" className="h-11 w-11 shrink-0 rounded-full border border-white/10 object-cover" />
                                                        ) : (
                                                            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/10 bg-white/5 text-sm font-semibold text-neutral-300">{requester.username?.charAt(0)?.toUpperCase() || '?'}</span>
                                                        )}
                                                        <span className="min-w-0">
                                                            <span className="block truncate text-sm font-semibold text-white">{requester.username || 'Orbit member'}</span>
                                                            <span className="mt-1 block text-xs text-neutral-500">Requested to follow your private profile</span>
                                                        </span>
                                                    </button>
                                                    <div className="flex gap-2 sm:shrink-0">
                                                        <button type="button" onClick={() => resolveFollowRequest(requester, true)} disabled={Boolean(actingOnFollowRequestId)} className="inline-flex min-h-9 flex-1 items-center justify-center gap-2 bg-cyan-400 px-4 text-sm font-semibold text-black transition hover:bg-cyan-300 disabled:opacity-50 sm:flex-none"><Check size={15} /> Accept</button>
                                                        <button type="button" onClick={() => resolveFollowRequest(requester, false)} disabled={Boolean(actingOnFollowRequestId)} className="inline-flex min-h-9 flex-1 items-center justify-center gap-2 border border-white/15 px-4 text-sm text-neutral-200 transition hover:bg-white/10 disabled:opacity-50 sm:flex-none"><X size={15} /> Decline</button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                )}
                                {incomingFriendRequests.length > 0 && (
                                    <section>
                                        <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">Friend requests</h3>
                                        <div className="divide-y divide-white/10 border-y border-white/10">
                                            {incomingFriendRequests.map(request => {
                                                const sender = request.from || {};
                                                return (
                                                    <div key={request._id} className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center">
                                                        <button type="button" onClick={() => sender._id && navigate(`/socialprofile/${sender._id}`)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                                                            {sender.profilePic ? <img src={sender.profilePic} alt="" className="h-11 w-11 shrink-0 rounded-full border border-white/10 object-cover" /> : <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/10 bg-white/5 text-sm font-semibold text-neutral-300">{sender.username?.charAt(0)?.toUpperCase() || '?'}</span>}
                                                            <span className="truncate text-sm font-semibold text-white">{sender.username || 'Unknown user'}</span>
                                                        </button>
                                                        <div className="flex gap-2 sm:shrink-0">
                                                            <button type="button" onClick={() => resolveFriendRequest(request, true)} disabled={Boolean(actingOnRequestId)} className="inline-flex min-h-9 flex-1 items-center justify-center gap-2 bg-cyan-400 px-4 text-sm font-semibold text-black transition hover:bg-cyan-300 disabled:opacity-50 sm:flex-none"><Check size={15} /> Accept</button>
                                                            <button type="button" onClick={() => resolveFriendRequest(request, false)} disabled={Boolean(actingOnRequestId)} className="inline-flex min-h-9 flex-1 items-center justify-center gap-2 border border-white/15 px-4 text-sm text-neutral-200 transition hover:bg-white/10 disabled:opacity-50 sm:flex-none"><X size={15} /> Decline</button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </section>
                                )}
                            </>
                        )}
                    </div>
                ) : (
                    postsLoading ? (
                        <div className="text-center text-gray-400 text-sm sm:text-base">Loading posts...</div>
                    ) : userPosts.length === 0 ? (
                        <div className="text-center text-gray-400 text-sm sm:text-base">No posts yet.</div>
                    ) : (
                        <div ref={contentRef} className="mt-5 sm:mt-7">
                            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={reorderGrid}>
                                <SortableContext items={orderedPosts.map(post => post.id)} strategy={rectSortingStrategy}>
                                    <div
                                        ref={gridRef}
                                        className="mx-auto grid max-w-4xl grid-flow-dense grid-cols-3 gap-0.5 bg-black"
                                        style={{ gridAutoRows: gridCellSize ? `${gridCellSize}px` : 'auto' }}
                                    >
                                        {orderedPosts.map((post, postIndex) => (
                                            <SortableProfileTile
                                                key={post.id}
                                                post={post}
                                                gridSize={profileGridLayout.find(item => item.post === post.id)?.gridSize || '1x1'}
                                                imageUrl={getDisplayImageUrl(post.image)}
                                                videoUrl={post.video?.startsWith('/') ? `${apiUrl}${post.video}` : post.video}
                                                fallbackText={currentUser?.username?.charAt(0)?.toUpperCase()}
                                                canArrange={isOwnProfile && activeTab === 'Posts'}
                                                isOwnProfile={isOwnProfile}
                                                isArchived={activeTab === 'Archived'}
                                                onOpen={() => showPostModal(postIndex)}
                                                onResize={resizeGridItem}
                                                onArchive={handleArchive}
                                                onDelete={handleDelete}
                                            />
                                        ))}
                                    </div>
                                </SortableContext>
                            </DndContext>
                        </div>
                    )
                )}
                {/* ---------------- Content grid ---------------- */}
                {showPostPreview && (
                    <PostPreview posts={orderedPosts} initialIndex={selectedPostIndex} isOpen={showPostPreview} onClose={() => setShowPostPreview(false)} />
                )}
            </div>
        </div>
    );
}

function SortableProfileTile({
    post,
    gridSize,
    imageUrl,
    videoUrl,
    fallbackText,
    canArrange,
    isOwnProfile,
    isArchived,
    onOpen,
    onResize,
    onArchive,
    onDelete,
}) {
    const [previewSize, setPreviewSize] = useState(null);
    const resizeStateRef = useRef(null);
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: post.id,
        disabled: !canArrange,
    });
    const activeSize = previewSize || gridSize;

    const handleResizeStart = (event) => {
        event.preventDefault();
        event.stopPropagation();
        const grid = event.currentTarget.closest('article')?.parentElement;
        if (!grid) return;

        const [columns, rows] = activeSize.split('x').map(Number);
        const styles = getComputedStyle(grid);
        const columnGap = parseFloat(styles.columnGap) || 0;
        const rowGap = parseFloat(styles.rowGap) || 0;
        const cellSize = (grid.clientWidth - (columnGap * 2)) / 3;
        resizeStateRef.current = {
            pointerId: event.pointerId,
            startX: event.clientX,
            startY: event.clientY,
            startWidth: (columns * cellSize) + ((columns - 1) * columnGap),
            startHeight: (rows * cellSize) + ((rows - 1) * rowGap),
            columnStep: cellSize + columnGap,
            rowStep: cellSize + rowGap,
            currentSize: activeSize,
        };
        event.currentTarget.setPointerCapture(event.pointerId);
    };

    const handleResizeMove = (event) => {
        const resizeState = resizeStateRef.current;
        if (!resizeState || resizeState.pointerId !== event.pointerId) return;
        const columns = Math.max(1, Math.min(3, Math.round(
            (resizeState.startWidth + event.clientX - resizeState.startX) / resizeState.columnStep,
        )));
        const rows = Math.max(1, Math.min(3, Math.round(
            (resizeState.startHeight + event.clientY - resizeState.startY) / resizeState.rowStep,
        )));
        const nextSize = `${columns}x${rows}`;
        if (nextSize !== resizeState.currentSize) {
            resizeState.currentSize = nextSize;
            setPreviewSize(nextSize);
        }
    };

    const handleResizeEnd = (event) => {
        const resizeState = resizeStateRef.current;
        if (!resizeState || resizeState.pointerId !== event.pointerId) return;
        event.stopPropagation();
        onResize(post.id, resizeState.currentSize);
        resizeStateRef.current = null;
        setPreviewSize(null);
    };

    const cancelResize = () => {
        resizeStateRef.current = null;
        setPreviewSize(null);
    };

    return (
        <article
            ref={setNodeRef}
            style={{
                transform: CSS.Transform.toString(transform),
                transition,
                zIndex: isDragging ? 20 : undefined,
            }}
            className={`group relative min-h-0 min-w-0 cursor-pointer overflow-hidden bg-[#202020] ${GRID_SIZE_CLASSES[activeSize]} ${isDragging ? 'opacity-75 shadow-2xl' : ''}`}
            onClick={onOpen}
            onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') onOpen();
            }}
            role="button"
            tabIndex={0}
        >
            {post.image ? (
                <img src={imageUrl} alt="" draggable={false} className="h-full w-full select-none object-cover" />
            ) : post.video ? (
                <video src={videoUrl} muted playsInline preload="metadata" className="h-full w-full object-cover" />
            ) : (
                <div className="flex h-full w-full items-center justify-center p-4 text-center sm:p-8">
                    <p className="line-clamp-6 text-xs font-semibold leading-relaxed text-white sm:text-base">
                        {post.content || fallbackText}
                    </p>
                </div>
            )}
            {(post.image || post.video) && <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/75 via-transparent to-black/10 opacity-75" />}

            {canArrange && (
                <button
                    type="button"
                    className="absolute left-1.5 top-1.5 z-20 flex h-7 w-7 touch-none cursor-grab items-center justify-center bg-black/65 text-white opacity-0 transition-opacity active:cursor-grabbing group-hover:opacity-100 focus-visible:opacity-100"
                    title="Drag to reorder"
                    aria-label="Drag to reorder post"
                    onClick={event => event.stopPropagation()}
                    {...attributes}
                    {...listeners}
                >
                    <GripVertical size={14} />
                </button>
            )}
            {isOwnProfile && (
                <div className="absolute right-1.5 top-1.5 z-10 flex items-center gap-0.5 bg-black/60 p-1 text-white backdrop-blur-sm">
                    <button type="button" onClick={(event) => { event.stopPropagation(); onArchive(post.id, !isArchived); }} className="p-1 hover:text-cyan-300" aria-label={isArchived ? 'Restore post' : 'Archive post'}>
                        {isArchived ? <RotateCcw size={13} /> : <Archive size={13} />}
                    </button>
                    <button type="button" onClick={(event) => { event.stopPropagation(); onDelete(post.id); }} className="p-1 hover:text-red-400" aria-label="Delete post"><Trash2 size={13} /></button>
                </div>
            )}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex items-center justify-center gap-3 px-2 py-2 text-[10px] font-medium text-white sm:gap-4 sm:text-xs">
                <span className="flex items-center gap-1"><FaHeart size={11} />{post.likesCount || 0}</span>
                <span className="flex items-center gap-1"><FiMessageCircle size={11} />{post.commentsCount || 0}</span>
                <span className="flex items-center gap-1"><BarChart3 size={11} />{post.views || 0}</span>
            </div>
            {canArrange && (
                <button
                    type="button"
                    onPointerDown={handleResizeStart}
                    onPointerMove={handleResizeMove}
                    onPointerUp={handleResizeEnd}
                    onPointerCancel={cancelResize}
                    onClick={event => event.stopPropagation()}
                    className="absolute bottom-0 right-0 z-20 flex h-10 w-10 touch-none cursor-nwse-resize items-end justify-end bg-linear-to-tl from-black/80 to-transparent p-2 text-white opacity-100 outline-none transition-colors hover:text-cyan-300 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
                    aria-label="Drag to resize tile"
                    title="Drag to resize"
                >
                    <Maximize2 size={14} />
                </button>
            )}
        </article>
    );
}