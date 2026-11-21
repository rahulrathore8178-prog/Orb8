const Orbital = require('../models/orbital.model');
const { OrbitalMember, STATUS } = require('../models/orbitalMember.model');

const cache = new Map(); // orbitalId -> { ids, exp }
const CACHE_MS = 60 * 1000;

/** Active member ids (strings), or null if the orbital doesn't exist. */
async function getMemberIds(orbitalId) {
    const key = String(orbitalId);
    const hit = cache.get(key);
    if (hit && hit.exp > Date.now()) return hit.ids;

    if (!(await Orbital.exists({ _id: key }))) return null;
    const rows = await OrbitalMember.find({ orbital: key, status: STATUS.ACTIVE }).select('user').lean();
    const ids = rows.map((r) => String(r.user));
    cache.set(key, { ids, exp: Date.now() + CACHE_MS });
    return ids;
}

const invalidateMembers = (orbitalId) => cache.delete(String(orbitalId));

module.exports = { getMemberIds, invalidateMembers };