import React, { useEffect, useRef, useState, useLayoutEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { setNearbyUsers } from '../redux/slices/discoverSlice';
import { apiUrl, getAuthHeaders } from '../utilites/communityHelper';
import gsap from 'gsap';
import { RotateCw, Radar, ChevronRight } from "lucide-react";
import { glassRow } from '../utilites/cssUtility';
// import { useNavigate } from "react-router-dom"; // uncomment if you use react-router

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const listener = (e) => setReduced(e.matches);
    mq.addEventListener("change", listener);
    return () => mq.removeEventListener("change", listener);
  }, []);
  return reduced;
}

function Avatar({ username, src, ringDelay, reduceMotion }) {
  const [broken, setBroken] = useState(false);
  const ringRef = useRef(null);

  useEffect(() => {
    if (reduceMotion || !ringRef.current) return;
    const tween = gsap.to(ringRef.current, {
      scale: 1.55,
      opacity: 0,
      duration: 1.8,
      ease: "power1.out",
      repeat: -1,
      delay: ringDelay,
    });
    return () => tween.kill();
  }, [reduceMotion, ringDelay]);

  const initial = username?.[0]?.toUpperCase() ?? "?";

  return (
    <span className="relative shrink-0">
      <span
        ref={ringRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-full bg-[#8c93f0]/40"
        style={reduceMotion ? { opacity: 0 } : undefined}
      />
      {!broken && src ? (
        <img
          src={src}
          alt=""
          onError={() => setBroken(true)}
          className="relative h-12 w-12 rounded-full object-cover ring-1 ring-zinc-800"
        />
      ) : (
        <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-zinc-800 text-sm font-medium text-zinc-400 ring-1 ring-zinc-800">
          {initial}
        </span>
      )}
    </span>
  );
}

const DiscoverPage = () => {
  const nearbyUsers = useSelector((state) => state.discover.nearbyUsers);
  const dispatch = useDispatch();
  // const navigate = useNavigate(); // uncomment if you use react-router

  // This was the bug: isLoading was a function *parameter* (silently bound
  // to React's props object, which is always truthy), not real state — so
  // the skeleton branch never turned off. It's now actual component state.
  const [isLoading, setIsLoading] = useState(true);

  function getUserLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation not supported"));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => reject(error),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  }

  async function updateLocationAndDiscover() {
    setIsLoading(true);
    try {
      const { lat, lng } = await getUserLocation();

      const res = await fetch(`${apiUrl}/api/community/discover/nearby`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ lat, lng }),
      });

      const data = await res.json();
      dispatch(setNearbyUsers((data && data.nearbyUsers) || []));
    } catch (err) {
      console.error("Location error:", err);
      // Without this, a permission-denied / timeout error left nearbyUsers
      // untouched and isLoading stuck true — screen spins forever. Falling
      // back to [] lets the empty state show instead.
      dispatch(setNearbyUsers([]));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    updateLocationAndDiscover();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const users = nearbyUsers ?? [];
  const listRef = useRef(null);
  const reloadIconRef = useRef(null);
  const reduceMotion = usePrefersReducedMotion();

  // Staggered entrance whenever a fresh list finishes loading
  useLayoutEffect(() => {
    if (isLoading || users.length === 0) return;
    const rows = listRef.current?.querySelectorAll("[data-row]");
    if (!rows?.length) return;

    const ctx = gsap.context(() => {
      if (reduceMotion) {
        gsap.set(rows, { opacity: 1, y: 0 });
        return;
      }
      gsap.fromTo(
        rows,
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power3.out", stagger: 0.045 }
      );
    }, listRef);

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, users.length, reduceMotion]);

  const handleReload = () => {
    if (!reduceMotion && reloadIconRef.current) {
      gsap.to(reloadIconRef.current, { rotate: "+=180", duration: 0.5, ease: "power2.inOut" });
    }
    updateLocationAndDiscover();
  };

  const handleUserClick = (user) => {
    // navigate(`/profile/${user._id}`); // preferred if react-router is set up
    window.location.href = `/socialprofile/${user._id}`;
  };
  console.log("Nearby users:", users);

  return (
    <div className="min-h-screen bg-[#0b0b0d] px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto w-full max-w-md sm:max-w-lg">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#8c93f0] opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#8c93f0]" />
            </span>
            <h1 className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500">
              {isLoading ? "Searching nearby" : `${users.length} nearby`}
            </h1>
          </div>

          <button
            onClick={handleReload}
            disabled={isLoading}
            aria-label="Reload nearby users"
            className="rounded-full border border-zinc-800 p-2 text-zinc-400 transition-colors hover:border-zinc-700 hover:text-zinc-200 active:bg-zinc-900 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8c93f0]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0b0d]"
          >
            <RotateCw ref={reloadIconRef} className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
        </div>

        {/* Loading skeleton */}
        {isLoading && (
          <ul className="divide-y divide-zinc-900">
            {Array.from({ length: 6 }).map((_, i) => (
              <li key={i} className="flex items-center gap-3 py-3.5">
                <div className="h-12 w-12 shrink-0 animate-pulse rounded-full bg-zinc-800/80" />
                <div className="h-3 w-28 animate-pulse rounded-full bg-zinc-800/80" />
              </li>
            ))}
          </ul>
        )}

        {/* Empty state */}
        {!isLoading && users.length === 0 && (
          <div className="flex flex-col items-center gap-4 py-20 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-zinc-800 text-zinc-600">
              <Radar className="h-6 w-6" strokeWidth={1.5} />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-zinc-300">No nearby users found</p>
              <p className="text-sm text-zinc-500">Try again from a different location</p>
            </div>
            <button
              onClick={handleReload}
              className="mt-2 rounded-full border border-zinc-800 px-4 py-2 text-xs font-medium text-zinc-300 transition-colors hover:border-zinc-700 hover:bg-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8c93f0]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0b0d]"
            >
              Reload
            </button>
          </div>
        )}

        {/* List */}
        {!isLoading && users.length > 0 && (
          <ul ref={listRef} className="divide-y divide-zinc-900">
            {users.map((u, i) => (
              <li key={u._id} data-row>
                <button
                  onClick={() => handleUserClick(u)}
                  className={`group flex w-full mt-2 items-center gap-3 rounded-2xl p-2.5 pr-3 transition duration-300 hover:border-white/15 hover:from-white/[0.15] sm:gap-4 sm:p-3 ${glassRow}`}
                >
                  <Avatar
                    username={u.username}
                    src={u.profilePicture}
                    ringDelay={(i % 8) * 0.15}
                    reduceMotion={reduceMotion}
                  />
                  <span className="min-w-0 flex-1 truncate text-[15px] font-medium text-zinc-100">
                    {u.username}
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-zinc-600 transition-transform group-hover:translate-x-0.5 group-hover:text-zinc-400" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default DiscoverPage