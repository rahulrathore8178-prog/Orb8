'use strict';

const PersonaProfile = require('../src/models/persona.profile');
const { topInterests } = require('./interest-math');

const DEFAULT_PERSONA = 'default';

async function getProfile(userId, persona) {
    return PersonaProfile.findOne({ user: userId, persona: persona || DEFAULT_PERSONA }).lean();
}

// [{ slug, eff }] strongest first. Used as the AUTHOR PRIOR when a post has little text.
async function getTopInterests(userId, persona, opts) {
    const profile = await getProfile(userId, persona);
    return profile ? topInterests(profile.interests || {}, new Date(), opts) : [];
}

/**
 * Persist only the touched topics (dotted $set), prune the dead ones ($unset).
 * updates = { slug: entry | null }.  upsert creates the profile on first learning event.
 */
async function saveUpdates(userId, persona, updates, eventCount) {
    const $set = {};
    const $unset = {};
    for (const [slug, entry] of Object.entries(updates)) {
        if (entry === null) $unset[`interests.${slug}`] = '';
        else $set[`interests.${slug}`] = entry;
    }
    if (!Object.keys($set).length && !Object.keys($unset).length) return;

    const update = { $inc: { signalCount: eventCount }, $setOnInsert: { blocked: [], aspirations: [] } };
    if (Object.keys($set).length) update.$set = $set;
    if (Object.keys($unset).length) update.$unset = $unset;

    await PersonaProfile.updateOne({ user: userId, persona: persona || DEFAULT_PERSONA }, update, {
        upsert: true,
        setDefaultsOnInsert: false, // defaults would collide with the $inc / dotted $set above
    });
}

module.exports = { DEFAULT_PERSONA, getProfile, getTopInterests, saveUpdates };