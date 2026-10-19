// middleware/orbital.middleware.js
const mongoose = require("mongoose");
const Orbital = require("../models/orbital.model.js");
const { asyncHandler } = require("../utils/asyncHandler.js");
const {
    OrbitalMember,
    STATUS,
    ROLE,
} = require("../models/orbitalMember.model.js");
``


// Attaches req.orbital
const loadOrbital = asyncHandler(async (req, res, next) => {
    const { orbitalId } = req.params;
    console.log('loadOrbital called with orbitalId:', orbitalId);
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
    });
    if (!membership) {
        return res.status(403).json({ success: false, message: "Join this orbital to access it" });
    }
    req.membership = membership;
    next();
});


const requireAdmin = [
    requireMember,
    (req, res, next) => {
        const canManageOrbital = [
            ROLE.CREATOR,
            ROLE.ADMIN,
        ].includes(req.membership.role);

        if (!canManageOrbital) {
            return res.status(403).json({
                success: false,
                message: "Admin access required",
            });
        }

        next();
    },
];

module.exports = {
    loadOrbital,
    requireMember,
    requireAdmin,
};