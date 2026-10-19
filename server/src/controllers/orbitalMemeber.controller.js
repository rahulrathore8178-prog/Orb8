const Orbital = require("../models/orbital.model.js");
const {
    OrbitalMember,
    STATUS,
    ROLE,
} = require("../models/orbitalMember.model.js");
const { asyncHandler } = require("../utils/asyncHandler.js");
const { VISIBILITY } = require('../models/orbital.model.js')
// const {ROLE} = require('../models/orbitalMember.model.js')
// const {STATUS} = require('../models/orbitalMember.model.js')

const getJoinRequests = asyncHandler(async (req, res) => {
    const requests = await OrbitalMember.find({ orbital: req.orbital._id, status: STATUS.PENDING })
        .populate("user", "username fullName avatar")
        .sort({ createdAt: 1 })
        .lean();

    res.json({ success: true, requests });
});

const approveJoinRequest = asyncHandler(async (req, res) => {
    const request = await OrbitalMember.findOneAndUpdate(
        { orbital: req.orbital._id, user: req.params.userId, status: STATUS.PENDING },
        { status: STATUS.ACTIVE },
        { new: true }
    );
    if (!request) {
        return res.status(404).json({ success: false, message: "Pending request not found" });
    }

    await Orbital.findByIdAndUpdate(req.orbital._id, { $inc: { memberCount: 1 } });
    res.json({ success: true, message: "Request approved" });
});

const rejectJoinRequest = asyncHandler(async (req, res) => {
    const request = await OrbitalMember.findOneAndDelete({
        orbital: req.orbital._id,
        user: req.params.userId,
        status: STATUS.PENDING,
    });
    if (!request) {
        return res.status(404).json({ success: false, message: "Pending request not found" });
    }
    res.json({ success: true, message: "Request rejected" });
});

// Open orbital  -> joins instantly
// Private orbital -> creates a pending request for the admin
const joinOrbital = asyncHandler(async (req, res) => {
    const { orbital } = req;

    const existing = await OrbitalMember.findOne({ orbital: orbital._id, user: req.user._id });
    if (existing) {
        const message =
            existing.status === STATUS.ACTIVE ? "You are already a member" : "Your request is already pending";
        return res.status(409).json({ success: false, message });
    }

    const isOpen = orbital.visibility === VISIBILITY.OPEN;
    console.log("OrbitalMember =", OrbitalMember);
    console.log(typeof OrbitalMember);
    console.log(Object.keys(OrbitalMember));

    try {
        await OrbitalMember.create({
            orbital: orbital._id,
            user: req.user._id,
            role: ROLE.MEMBER,
            status: isOpen ? STATUS.ACTIVE : STATUS.PENDING,
        });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ success: false, message: "Already joined or requested" });
        }
        throw err;
    }

    if (isOpen) await Orbital.findByIdAndUpdate(orbital._id, { $inc: { memberCount: 1 } });

    res.status(201).json({
        success: true,
        status: isOpen ? STATUS.ACTIVE : STATUS.PENDING,
        message: isOpen ? "Joined orbital" : "Join request sent to admin",
    });
});

const cancelJoinRequest = asyncHandler(async (req, res) => {
    const deleted = await OrbitalMember.findOneAndDelete({
        orbital: req.orbital._id,
        user: req.user._id,
        status: STATUS.PENDING,
    });
    if (!deleted) {
        return res.status(404).json({ success: false, message: "No pending request found" });
    }
    res.json({ success: true, message: "Join request cancelled" });
});

const leaveOrbital = asyncHandler(async (req, res) => {
    if (
        req.membership.role === ROLE.ADMIN ||
        req.membership.role === ROLE.CREATOR
    ) {
        return res.status(400).json({
            success: false,
            message: "Owner/Admin cannot leave the orbital."
        });
    }
    await req.membership.deleteOne();
    await Orbital.findByIdAndUpdate(req.orbital._id, { $inc: { memberCount: -1 } });

    res.json({ success: true, message: "You left the orbital" });
});

const getMembers = asyncHandler(async (req, res) => {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 20, 50);

    const members = await OrbitalMember.find({ orbital: req.orbital._id, status: STATUS.ACTIVE })
        .populate("user", "username fullName avatar")
        .sort({ role: 1, createdAt: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();

    res.json({ success: true, page, members });
});

const removeMember = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (userId === String(req.user._id)) {
        return res.status(400).json({ success: false, message: "You cannot remove yourself" });
    }

    const removed = await OrbitalMember.findOneAndDelete({
        orbital: req.orbital._id,
        user: userId,
        status: STATUS.ACTIVE,
        role: { $ne: ROLE.ADMIN },
    });
    if (!removed) {
        return res.status(404).json({ success: false, message: "Member not found" });
    }

    await Orbital.findByIdAndUpdate(req.orbital._id, { $inc: { memberCount: -1 } });
    res.json({ success: true, message: "Member removed" });
});

module.exports = {
    joinOrbital,
    cancelJoinRequest,
    leaveOrbital,
    getMembers,
    removeMember,
    getJoinRequests,
    approveJoinRequest,
    rejectJoinRequest,
};