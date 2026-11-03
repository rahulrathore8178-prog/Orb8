const User = require('../models/user.model');

const DAY_MS = 86400000;

// Days follow the USER's timezone (user.timezone, an IANA name like 'Asia/Kolkata'), falling back to
// STREAK_DEFAULT_TZ and then UTC. With plain UTC an Indian user's "day" would roll over at 5:30 AM.
function safeTz(tz) {
  if (typeof tz !== 'string' || !tz) return null;
  try {
    new Intl.DateTimeFormat('en-CA', { timeZone: tz });
    return tz;
  } catch (err) {
    return null; // not a valid IANA zone
  }
}
const DEFAULT_TZ = safeTz(process.env.STREAK_DEFAULT_TZ) || 'UTC';

const formatters = new Map(); // Intl formatters are slow to build, so build one per zone
function formatterFor(tz) {
  if (!formatters.has(tz)) {
    formatters.set(tz, new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }));
  }
  return formatters.get(tz);
}

// 'YYYY-MM-DD' for the given moment in the given timezone. dayKey() with no args keeps working.
const dayKey = (time = Date.now(), tz) => formatterFor(safeTz(tz) || DEFAULT_TZ).format(new Date(time));

// Calendar arithmetic on the key itself (not "minus 24h"), so daylight-saving days cannot skew it.
const shiftDayKey = (key, days) => new Date(Date.parse(`${key}T00:00:00Z`) + days * DAY_MS).toISOString().slice(0, 10);

// topics = taxonomy slugs the prompt clearly implies. They become a weak prior when identifying posts
// that answer the prompt. Only prompts with ONE obvious topic get one; add more as the taxonomy grows.
const DAILY_PROMPTS = [
  { text: 'What is something small that made you smile this week?' },
  { text: 'Share a photo of where you are right now.' },
  { text: 'What song is on repeat for you lately?', topics: ['music'] },
  { text: 'What is one thing you learned recently?' },
  { text: 'Show us your view today.' },
  { text: 'What is the best thing you ate this week?', topics: ['food'] },
  { text: 'Who is someone you are grateful for, and why?' },
  { text: 'What are you looking forward to?' },
  { text: 'Share something you made, big or small.' },
  { text: 'What is a place you would love to visit?', topics: ['travel'] },
  { text: 'What is a book, show or game you recommend?' },
  { text: 'What does your desk or workspace look like?' },
  { text: 'What is a habit you are proud of?' },
  { text: 'Share a memory that still makes you laugh.' },
];

function promptForKey(key) {
  const dayNumber = Math.floor(Date.parse(`${key}T00:00:00Z`) / DAY_MS);
  return DAILY_PROMPTS[dayNumber % DAILY_PROMPTS.length];
}

function getDailyPrompt(time = Date.now(), tz) {
  const id = dayKey(time, tz);
  return { id, text: promptForKey(id).text };
}

// Topics for a post that answers a daily prompt (the client sends promptId = the prompt's id).
function promptTopics(promptId) {
  if (typeof promptId !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(promptId) || Number.isNaN(Date.parse(promptId))) return [];
  return [...(promptForKey(promptId).topics || [])];
}

// Pure streak rules (easy to test).
//  - already counted today, or lastActiveDay is "ahead" (user travelled east / changed zone): no change,
//    so a timezone change can never wipe a streak
//  - last active yesterday: streak continues, otherwise it restarts at 1
function nextStreak(lastActiveDay, count, today) {
  if (lastActiveDay && lastActiveDay >= today) return { changed: false, streak: count || 0 };
  const continues = lastActiveDay === shiftDayKey(today, -1);
  return { changed: true, streak: continues ? (count || 0) + 1 : 1 };
}

const STREAK_MILESTONES = new Set([3, 7, 14, 30, 60, 100, 200, 365]);

// The streak only counts social actions. It must never break the request that triggered it.
// Returns { changed, streak, milestone } (milestone = the streak length if it just hit one, else null).
async function recordSocialActivity(userId) {
  const none = { changed: false, streak: 0, milestone: null };
  try {
    const user = await User.findById(userId).select('streakCount longestStreak lastActiveDay timezone').lean();
    if (!user) return none;

    const today = dayKey(Date.now(), user.timezone);
    const { changed, streak } = nextStreak(user.lastActiveDay, user.streakCount, today);
    if (!changed) return { ...none, streak };

    // Compare-and-set: applies only if lastActiveDay is still what we read. Two parallel requests
    // cannot both advance the streak, and we skip user.save() (no validation or pre-save hooks).
    const res = await User.updateOne(
      { _id: userId, lastActiveDay: user.lastActiveDay ?? null },
      { $set: { streakCount: streak, lastActiveDay: today }, $max: { longestStreak: streak } }
    );
    if (!(res.modifiedCount ?? res.nModified ?? 0)) return { ...none, streak };

    return { changed: true, streak, milestone: STREAK_MILESTONES.has(streak) ? streak : null };
  } catch (error) {
    console.error('recordSocialActivity failed:', error.message);
    return none;
  }
}

// A streak that was not continued yesterday or today is over, so we never show a stale number.
// Pass a user that includes `timezone` for per-user days.
function currentStreak(user, now = Date.now()) {
  if (!user || !user.lastActiveDay) return 0;
  const today = dayKey(now, user.timezone);
  return user.lastActiveDay >= shiftDayKey(today, -1) ? user.streakCount || 0 : 0;
}

module.exports = { dayKey, shiftDayKey, getDailyPrompt, promptTopics, nextStreak, recordSocialActivity, currentStreak };