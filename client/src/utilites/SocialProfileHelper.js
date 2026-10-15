export const HOUR = 60 * 60 * 1000;
export const VISIBLE_DURATION = 24 * HOUR; // phase 1: fully visible, no revive option
export const FADE_DURATION = 24 * HOUR; // phase 2: dims once per hour, revivable
export const TOTAL_DURATION = VISIBLE_DURATION + FADE_DURATION; // 48h door-to-door

export function getStoryPhase(cycleStart, now) {
  const elapsed = now - cycleStart;

  if (elapsed >= TOTAL_DURATION) {
    return { phase: "expired", opacity: 0, elapsed };
  }

  if (elapsed < VISIBLE_DURATION) {
    return {
      phase: "active",
      opacity: 1,
      elapsed,
      remaining: VISIBLE_DURATION - elapsed,
    };
  }

  const fadeElapsed = elapsed - VISIBLE_DURATION;
  const hourIndex = Math.min(23, Math.floor(fadeElapsed / HOUR)); // 0..23
  const opacity = Math.max(0, 1 - (hourIndex + 1) / 24); // steps down once/hr

  return {
    phase: "fading",
    opacity,
    elapsed,
    hourIndex,
    hoursLeft: 24 - hourIndex,
    remaining: TOTAL_DURATION - elapsed,
  };
}

// 48 one-hour ticks for the progress rail. Ticks 0-23 = visible phase,
// ticks 24-47 = fade phase (each dimmed to that hour's target opacity).
export function buildHourTicks(elapsed) {
  return Array.from({ length: 48 }, (_, i) => {
    const tickStart = i * HOUR;
    const fill = Math.min(1, Math.max(0, (elapsed - tickStart) / HOUR));
    const inFadePhase = i >= 24;
    const brightness = inFadePhase ? Math.max(0, 1 - (i - 24 + 1) / 24) : 1;
    return { fill, inFadePhase, brightness };
  });
}
 
export function formatDuration(ms) {
  if (ms <= 0) return "0m";
  const totalMin = Math.floor(ms / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}
 
export function formatAge(ms) {
  const totalMin = Math.floor(ms / 60000);
  if (totalMin < 60) return `${Math.max(totalMin, 0)}m ago`;
  const h = Math.floor(totalMin / 60);
  return `${h}h ago`;
}
 

export const capsuleLoop = () => {

}
