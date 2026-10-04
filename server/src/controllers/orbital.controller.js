const Orbital = require("../models/orbital.model.js");
const { VISIBILITY } = require("../models/orbital.model.js");
const OrbitalMember = require("../models/orbitalMember.model.js");
const { ROLE, STATUS } = require("../models/orbitalMember.model.js");
const Post = require("../models/post.model.js");
const { asyncHandler } = require("../utils/asyncHandler.js");

const isDuplicateKey = (err) => err?.code === 11000;

const createOrbital = asyncHandler(async (req, res) => {
    console.log('createOrbital called with body:', req.body);
    const { name, description, visibility = VISIBILITY.OPEN } = req.body || {};

    if (!name?.trim() || name.trim().length < 3) {
        return res.status(400).json({ success: false, message: "Name must be at least 3 characters" });
    }
    if (!Object.values(VISIBILITY).includes(visibility)) {
        return res.status(400).json({ success: false, message: "Visibility must be open or private" });
    }

    let orbital;
    try {
        orbital = await Orbital.create({
            name,
            description,
            visibility,
            creator: req.user._id,
            memberCount: 1,
        });
    } catch (err) {
        if (isDuplicateKey(err)) {
            return res.status(409).json({ success: false, message: "An orbital with this name already exists" });
        }
        throw err;
    }

    try {
        await OrbitalMember.create({
            orbital: orbital._id,
            user: req.user._id,
            role: ROLE.ADMIN,
            status: STATUS.ACTIVE,
        });
    } catch (err) {
        await Orbital.findByIdAndDelete(orbital._id); // roll back, don't leave an admin-less orbital
        throw err;
    }

    res.status(201).json({ success: true, orbital });
});

// Public info + the viewer's relationship to it (drives Join / Requested / Joined later in the UI)
const getOrbital = asyncHandler(async (req, res) => {
    const membership = await OrbitalMember.findOne({
        orbital: req.orbital._id,
        user: req.user._id,
    }).lean();

    res.json({
        success: true,
        orbital: req.orbital,
        viewer: {
            status: membership?.status ?? "none", // "none" | "pending" | "active"
            role: membership?.role ?? null,
        },
    });
});

const getMyOrbitals = asyncHandler(async (req, res) => {
    const memberships = await OrbitalMember.find({
        user: req.user._id,
        status: STATUS.ACTIVE,
    })
        .populate("orbital", "name description visibility memberCount")
        .sort({ createdAt: -1 })
        .lean();

    res.json({
        success: true,
        orbitals: memberships.map((m) => ({ ...m.orbital, role: m.role })),
    });
});

const updateOrbital = asyncHandler(async (req, res) => {
    const { name, description, visibility } = req.body;

    if (visibility && !Object.values(VISIBILITY).includes(visibility)) {
        return res.status(400).json({ success: false, message: "Visibility must be open or private" });
    }

    if (name !== undefined) req.orbital.name = name;
    if (description !== undefined) req.orbital.description = description;
    if (visibility !== undefined) req.orbital.visibility = visibility;

    try {
        await req.orbital.save();
    } catch (err) {
        if (isDuplicateKey(err)) {
            return res.status(409).json({ success: false, message: "An orbital with this name already exists" });
        }
        throw err;
    }

    res.json({ success: true, orbital: req.orbital });
});

const deleteOrbital = asyncHandler(async (req, res) => {
    const orbitalId = req.orbital._id;

    await Promise.all([
        Post.deleteMany({ orbital: orbitalId }),
        OrbitalMember.deleteMany({ orbital: orbitalId }),
    ]);
    await req.orbital.deleteOne();

    res.json({ success: true, message: "Orbital deleted" });
});

module.exports = {
    createOrbital,
    getOrbital,
    getMyOrbitals,
    updateOrbital,
    deleteOrbital,
};