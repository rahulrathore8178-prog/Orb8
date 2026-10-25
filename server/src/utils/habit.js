const User = require('../models/user.model');

const DAY_MS = 86400000;

// Days are UTC so the streak is the same everywhere the server runs.
const dayKey = (time = Date.now()) => new Date(time).toISOString().slice(0, 10);

const DAILY_PROMPTS = [
  'What is something small that made you smile this week?',
  'Share a photo of where you are right now.',
  'What song is on repeat for you lately?',
  'What is one thing you learned recently?',
  'Show us your view today.',
  'What is the best thing you ate this week?',
  'Who is someone you are grateful for, and why?',
  'What are you looking forward to?',
  'Share something you made, big or small.',
  'What is a place you would love to visit?',
  'What is a book, show or game you recommend?',
  'What does your desk or workspace look like?',
  'What is a habit you are proud of?',
  'Share a memory that still makes you laugh.',
];

function getDailyPrompt(time = Date.now()) {
  const dayNumber = Math.floor(time / DAY_MS);
  return { id: dayKey(time), text: DAILY_PROMPTS[dayNumber % DAILY_PROMPTS.length] };
}

// The streak only counts social actions. It must never break the request that triggered it.
async function recordSocialActivity(userId) {
  try {
    const today = dayKey();
    const user = await User.findById(userId).select('streakCount lastActiveDay');
    if (!user || user.lastActiveDay === today) return;

    user.streakCount = user.lastActiveDay === dayKey(Date.now() - DAY_MS) ? (user.streakCount || 0) + 1 : 1;
    user.lastActiveDay = today;
    await user.save();
  } catch (error) {
    console.error('recordSocialActivity failed:', error.message);
  }
}

// A streak that was not continued yesterday or today is over, so we never show a stale number.
function currentStreak(user) {
  if (!user.lastActiveDay) return 0;
  const alive = user.lastActiveDay === dayKey() || user.lastActiveDay === dayKey(Date.now() - DAY_MS);
  return alive ? user.streakCount || 0 : 0;
}

module.exports = { dayKey, getDailyPrompt, recordSocialActivity, currentStreak };
