import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Compass, MapPin, RefreshCw, Search, Sparkles, UsersRound } from 'lucide-react';
import { apiUrl, getAuthHeaders } from '../utilites/communityHelper';

const DISCOVERY_TABS = [
  { id: 'for-you', label: 'For you' },
  { id: 'people', label: 'People nearby' },
  { id: 'communities', label: 'Communities' },
];

const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

function getLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Location is not available in this browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => resolve({ lat: coords.latitude, lng: coords.longitude }),
      (error) => reject(new Error(error.message || 'Location permission was not granted.')),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 },
    );
  });
}

export default function CosmicDiscoveryPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('for-you');
  const [data, setData] = useState({ interests: [], posts: [], creators: [], topics: [], communities: [] });
  const [nearbyUsers, setNearbyUsers] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [communityQuery, setCommunityQuery] = useState('');
  const [radiusKm, setRadiusKm] = useState(10);
  const [isCosmicDiscoverable, setIsCosmicDiscoverable] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isNearbyLoading, setIsNearbyLoading] = useState(false);
  const [error, setError] = useState('');
  const [locationError, setLocationError] = useState('');

  async function loadRecommendations() {
    setIsLoading(true);
    setError('');
    try {
      const { data: response } = await axios.get(`${apiUrl}/api/cosmic-discovery/recommendations`, {
        withCredentials: true,
        headers: getAuthHeaders(),
      });
      setData({
        interests: response.interests || [],
        posts: response.posts || [],
        creators: response.creators || [],
        topics: response.topics || [],
        communities: response.communities || [],
      });
      setIsCosmicDiscoverable(Boolean(response.isCosmicDiscoverable));
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Cosmic Discovery could not load.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadRecommendations();
  }, []);

  const visiblePosts = useMemo(() => {
    if (!selectedTopic) return data.posts;
    return data.posts.filter((post) =>
      (post.hashtags || []).some((tag) => tag.replace(/^#/, '').toLowerCase() === selectedTopic),
    );
  }, [data.posts, selectedTopic]);

  const visibleCommunities = useMemo(() => {
    const query = communityQuery.trim().toLowerCase();
    if (!query) return data.communities;
    return data.communities.filter((community) =>
      `${community.name} ${community.description}`.toLowerCase().includes(query),
    );
  }, [communityQuery, data.communities]);

  async function searchNearby() {
    setIsNearbyLoading(true);
    setLocationError('');
    try {
      const coordinates = await getLocation();
      const { data: response } = await axios.post(
        `${apiUrl}/api/cosmic-discovery/nearby`,
        { ...coordinates, radiusKm: Number(radiusKm), enabled: true },
        { withCredentials: true, headers: getAuthHeaders() },
      );
      setNearbyUsers(response.nearbyUsers || []);
      setIsCosmicDiscoverable(true);
    } catch (requestError) {
      setLocationError(requestError.response?.data?.message || requestError.message || 'Nearby discovery failed.');
    } finally {
      setIsNearbyLoading(false);
    }
  }

  async function stopNearbyDiscovery() {
    setIsNearbyLoading(true);
    setLocationError('');
    try {
      await axios.post(
        `${apiUrl}/api/cosmic-discovery/nearby`,
        { enabled: false },
        { withCredentials: true, headers: getAuthHeaders() },
      );
      setNearbyUsers([]);
      setIsCosmicDiscoverable(false);
    } catch (requestError) {
      setLocationError(requestError.response?.data?.message || 'Could not turn off nearby discovery.');
    } finally {
      setIsNearbyLoading(false);
    }
  }

  function imageUrl(path) {
    if (!path) return '';
    return path.startsWith('/') ? `${apiUrl}${path}` : path;
  }

  function renderCreator(creator) {
    return (
      <button
        key={creator.id}
        type="button"
        onClick={() => navigate(`/socialprofile/${creator.id}`)}
        className="flex min-w-0 items-center gap-3 border-b border-white/10 py-3 text-left last:border-b-0"
      >
        {creator.profilePic ? (
          <img src={imageUrl(creator.profilePic)} alt="" className="h-11 w-11 shrink-0 rounded-full object-cover" />
        ) : (
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-cyan-300/10 text-sm font-semibold text-cyan-100">
            {creator.username?.charAt(0)?.toUpperCase() || '?'}
          </span>
        )}
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-white">{creator.username}</span>
          {creator.bio && <span className="mt-1 block truncate text-xs text-neutral-400">{creator.bio}</span>}
        </span>
        <span className="text-xs text-cyan-200">View</span>
      </button>
    );
  }

  function renderPost(post) {
    return (
      <article key={post.id} className="border-b border-white/10 py-5 last:border-b-0">
        <div className="mb-3 flex items-center gap-3">
          {post.author.profilePic ? (
            <img src={imageUrl(post.author.profilePic)} alt="" className="h-9 w-9 rounded-full object-cover" />
          ) : (
            <span className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-xs font-semibold text-white">
              {post.author.username?.charAt(0)?.toUpperCase() || '?'}
            </span>
          )}
          <button type="button" onClick={() => navigate(`/socialprofile/${post.author.id}`)} className="text-sm font-semibold text-white hover:text-cyan-200">
            {post.author.username}
          </button>
          <time className="ml-auto text-xs text-neutral-500">{formatDate(post.createdAt)}</time>
        </div>
        <p className="whitespace-pre-wrap text-sm leading-6 text-neutral-200">{post.content}</p>
        {post.image && <img src={imageUrl(post.image)} alt="Post media" className="mt-3 max-h-[28rem] w-full rounded-md object-cover" />}
        {post.video && <video src={imageUrl(post.video)} controls className="mt-3 max-h-[28rem] w-full rounded-md" />}
        {!!post.hashtags?.length && (
          <div className="mt-3 flex flex-wrap gap-2">
            {post.hashtags.map((tag) => (
              <button key={tag} type="button" onClick={() => setSelectedTopic(tag.replace(/^#/, '').toLowerCase())} className="text-xs text-cyan-200 hover:text-white">
                #{tag.replace(/^#/, '')}
              </button>
            ))}
          </div>
        )}
        <div className="mt-3 text-xs text-neutral-500">{post.likesCount} likes · {post.commentsCount} comments</div>
      </article>
    );
  }

  return (
    <main className="min-h-screen bg-[#0b1012] px-4 py-7 text-white sm:px-7 sm:py-10">
      <div className="mx-auto max-w-6xl">
        <header className="border-b border-white/10 pb-6">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center border border-cyan-200/25 text-cyan-100">
              <Compass size={20} />
            </span>
            <div>
              <h1 className="text-2xl font-semibold tracking-normal sm:text-3xl">Cosmic Discovery</h1>
              <p className="mt-1 text-sm text-neutral-400">Find people, ideas, and communities beyond your orbit.</p>
            </div>
          </div>
          <nav aria-label="Discovery views" className="mt-6 flex gap-1 overflow-x-auto border-b border-white/10">
            {DISCOVERY_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                aria-pressed={activeTab === tab.id}
                className={`min-h-10 whitespace-nowrap border-b-2 px-4 text-sm ${activeTab === tab.id ? 'border-cyan-200 text-white' : 'border-transparent text-neutral-400 hover:text-white'}`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </header>

        {error && (
          <div role="alert" className="mt-5 flex items-center justify-between gap-3 border-l-2 border-rose-400 px-4 py-3 text-sm text-rose-200">
            <span>{error}</span>
            <button type="button" onClick={loadRecommendations} className="inline-flex shrink-0 items-center gap-2 text-white"><RefreshCw size={14} /> Retry</button>
          </div>
        )}

        {activeTab === 'for-you' && (
          <div className="grid gap-8 pt-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
            <section aria-labelledby="posts-heading" className="min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 id="posts-heading" className="text-lg font-semibold">Explore posts</h2>
                  <p className="mt-1 text-sm text-neutral-400">
                    {data.interests.length ? `Picked for your interests: ${data.interests.join(', ')}.` : 'Fresh public posts from across Orbit.'}
                  </p>
                </div>
                <button type="button" onClick={loadRecommendations} title="Refresh recommendations" aria-label="Refresh recommendations" className="grid h-9 w-9 shrink-0 place-items-center border border-white/15 text-neutral-300 hover:bg-white/5">
                  <RefreshCw size={15} />
                </button>
              </div>
              <div className="mt-5 flex flex-wrap gap-2" aria-label="Filter by topic">
                <button type="button" onClick={() => setSelectedTopic('')} aria-pressed={!selectedTopic} className={`min-h-8 border px-3 text-xs ${!selectedTopic ? 'border-cyan-200/60 bg-cyan-100/10 text-cyan-100' : 'border-white/10 text-neutral-400 hover:text-white'}`}>
                  All topics
                </button>
                {data.topics.map((topic) => (
                  <button key={topic.name} type="button" onClick={() => setSelectedTopic(topic.name)} aria-pressed={selectedTopic === topic.name} className={`min-h-8 border px-3 text-xs ${selectedTopic === topic.name ? 'border-cyan-200/60 bg-cyan-100/10 text-cyan-100' : 'border-white/10 text-neutral-400 hover:text-white'}`}>
                    #{topic.name}
                  </button>
                ))}
              </div>
              {isLoading ? <p className="py-12 text-sm text-neutral-400">Finding your next orbit...</p> : visiblePosts.length ? visiblePosts.map(renderPost) : <p className="py-12 text-sm text-neutral-400">No posts found for this topic yet.</p>}
            </section>

            <aside className="border-t border-white/10 pt-5 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
              <h2 className="flex items-center gap-2 text-sm font-semibold"><Sparkles size={16} className="text-cyan-200" /> Creators for you</h2>
              <p className="mt-1 text-xs text-neutral-500">People sharing topics from your interests.</p>
              <div className="mt-3">
                {data.creators.slice(0, 8).map(renderCreator)}
                {!isLoading && !data.creators.length && <p className="py-5 text-sm text-neutral-500">More creators will appear as new posts are shared.</p>}
              </div>
            </aside>
          </div>
        )}

        {activeTab === 'people' && (
          <section className="max-w-3xl pt-6">
            <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-5">
              <div>
                <h2 className="flex items-center gap-2 text-lg font-semibold"><MapPin size={18} className="text-cyan-200" /> Nearby creators</h2>
                <p className="mt-1 max-w-xl text-sm text-neutral-400">Location is shared only after you opt in. Your precise coordinates are never shown to other users.</p>
              </div>
              <label className="flex items-center gap-2 text-xs text-neutral-400">
                Radius
                <select value={radiusKm} onChange={(event) => setRadiusKm(Number(event.target.value))} className="h-9 border border-white/15 bg-[#111719] px-2 text-sm text-white">
                  {[5, 10, 25, 50, 100].map((radius) => <option key={radius} value={radius}>{radius} km</option>)}
                </select>
              </label>
            </div>
            <div className="flex flex-wrap items-center gap-3 py-4">
              <button type="button" onClick={isCosmicDiscoverable ? searchNearby : searchNearby} disabled={isNearbyLoading} className="inline-flex min-h-10 items-center gap-2 bg-cyan-100 px-4 text-sm font-semibold text-[#0b1012] hover:bg-white disabled:opacity-50">
                <MapPin size={15} /> {isNearbyLoading ? 'Searching...' : isCosmicDiscoverable ? 'Refresh nearby people' : 'Enable nearby discovery'}
              </button>
              {isCosmicDiscoverable && <button type="button" onClick={stopNearbyDiscovery} disabled={isNearbyLoading} className="min-h-10 border border-white/15 px-4 text-sm text-neutral-300 hover:bg-white/5 disabled:opacity-50">Turn off</button>}
              {locationError && <p role="alert" className="w-full text-sm text-rose-300">{locationError}</p>}
            </div>
            <div className="divide-y divide-white/10 border-y border-white/10">
              {nearbyUsers.map((person) => (
                <button key={person._id} type="button" onClick={() => navigate(`/socialprofile/${person._id}`)} className="flex w-full items-center gap-3 py-4 text-left hover:bg-white/[0.03]">
                  {person.profilePicture ? <img src={imageUrl(person.profilePicture)} alt="" className="h-11 w-11 rounded-full object-cover" /> : <span className="grid h-11 w-11 place-items-center rounded-full bg-white/10 text-sm">{person.username?.charAt(0)?.toUpperCase() || '?'}</span>}
                  <span className="min-w-0 flex-1"><span className="block text-sm font-semibold">{person.username}</span>{person.bio && <span className="mt-1 block truncate text-xs text-neutral-400">{person.bio}</span>}</span>
                  <span className="text-xs text-neutral-500">{person.distanceKm} km</span>
                </button>
              ))}
              {isCosmicDiscoverable && !isNearbyLoading && nearbyUsers.length === 0 && <p className="py-8 text-sm text-neutral-500">No nearby creators found in this radius.</p>}
            </div>
          </section>
        )}

        {activeTab === 'communities' && (
          <section className="max-w-4xl pt-6">
            <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-5">
              <div>
                <h2 className="flex items-center gap-2 text-lg font-semibold"><UsersRound size={18} className="text-cyan-200" /> Open communities</h2>
                <p className="mt-1 text-sm text-neutral-400">Explore public Orbitals and find your niche.</p>
              </div>
              <label className="relative block w-full sm:w-64">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input value={communityQuery} onChange={(event) => setCommunityQuery(event.target.value)} placeholder="Search communities" className="h-9 w-full border border-white/15 bg-transparent pl-9 pr-3 text-sm outline-none placeholder:text-neutral-500 focus:border-cyan-200/50" />
              </label>
            </div>
            <div className="divide-y divide-white/10 border-b border-white/10">
              {visibleCommunities.map((community) => (
                <button key={community._id} type="button" onClick={() => navigate(`/orbital/${community._id}`)} className="flex w-full items-center gap-4 py-4 text-left hover:bg-white/[0.03]">
                  {community.image ? <img src={imageUrl(community.image)} alt="" className="h-14 w-14 shrink-0 object-cover" /> : <span className="grid h-14 w-14 shrink-0 place-items-center bg-cyan-100/10 text-cyan-100"><UsersRound size={20} /></span>}
                  <span className="min-w-0 flex-1"><span className="block font-semibold">{community.name}</span><span className="mt-1 line-clamp-2 block text-sm text-neutral-400">{community.description || 'An open community in Orbit.'}</span></span>
                  <span className="shrink-0 text-xs text-neutral-500">{community.memberCount || 0} members</span>
                </button>
              ))}
              {!isLoading && !visibleCommunities.length && <p className="py-8 text-sm text-neutral-500">No matching open communities found.</p>}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}