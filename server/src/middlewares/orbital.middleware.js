// middleware/orbital.middleware.js
const mongoose = require("mongoose");
const Orbital = require("../models/orbital.model.js");
const { asyncHandler } = require("../utils/asyncHandler.js");
const { OrbitalMember, STATUS, ROLE } = require("../models/orbitalMember.model.js");

// Attaches req.orbital
const loadOrbital = asyncHandler(async (req, res, next) => {
    const { orbitalId } = req.params;
    if (!mongoose.isValidObjectId(orbitalId)) {
        return res.status(400).json({ success: false, message: "Invalid orbital id" });
    }
    const orbital = await Orbital.findById(orbitalId)
        .populate("creator", "username fullName profilePic");
    if (!orbital) {
        return res.status(404).json({ success: false, message: "Orbital not found" });
    }
    req.orbital = orbital;
    next();
});

// Attaches req.membership (active members only)
const requireMember = asyncHandler(async (req, res, next) => {
    const membership = await OrbitalMember.findOne({
        orbital: req.orbital._id,
        user: req.user._id,
        status: STATUS.ACTIVE,
    }).lean();
    if (!membership) {
        return res.status(403).json({ success: false, message: "Join this orbital to access it" });
    }
    req.membership = membership;
    next();
});

const requireRole = (roles, message) => [
    requireMember,
    (req, res, next) =>
        roles.includes(req.membership.role)
            ? next()
            : res.status(403).json({ success: false, message }),
];

// creator + admins (everything except deleting the orbital)
const requireAdmin = requireRole([ROLE.CREATOR, ROLE.ADMIN], "Admin access required");
// creator only (delete orbital, promote/demote admins)
const requireCreator = requireRole([ROLE.CREATOR], "Only the creator can do this");

module.exports = { loadOrbital, requireMember, requireAdmin, requireCreator };