const Orbital = require("../models/orbital.model.js");
const { VISIBILITY } = require("../models/orbital.model.js");
const {
    OrbitalMember,
    STATUS,
    ROLE,
} = require("../models/orbitalMember.model.js");
const { Post } = require("../models/post.model.js");
const { asyncHandler } = require("../utils/asyncHandler.js");
const { uploadBufferToDrive, streamFileFromDrive } = require("../utils/driveUpload.js");
const sharp = require('sharp');

const isDuplicateKey = (err) => err?.code === 11000;

const streamOrbitalImage = asyncHandler(async (req, res) => {
    const fileId = String(req.params.fileId || '').trim();
    if (!/^[A-Za-z0-9_-]+$/.test(fileId)) {
        return res.status(400).json({ message: 'Invalid orbital image id' });
    }

    await streamFileFromDrive(fileId, res, req);
});

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
    let imageUrl = '';
    if (req.file) {
        let processedImageBuffer;
        try {
            processedImageBuffer = await sharp(req.file.buffer)
                .resize({ width: 800, height: 800, fit: 'inside' })
                .webp({ quality: 85 })
                .toBuffer();
        } catch (err) {
            console.error('[ORBITAL IMAGE] Sharp error:', err);
            return res.status(500).json({ message: 'Image transform failed' });
        }

        const timestamp = Date.now();
        const fileName = `orbital-${req.user.id}-${timestamp}.webp`;
        const uploadedImage = await uploadBufferToDrive(processedImageBuffer, fileName, 'image/webp');
        imageUrl = uploadedImage.publicUrl;
    }
    try {
        orbital = await Orbital.create({
            name,
            description,
            visibility,
            image: imageUrl,
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
            role: ROLE.CREATOR,
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

    const orbital = await Orbital.findById(req.orbital._id)
        .populate("creator", "username fullName profilePic image")
        .lean();

    res.json({
        success: true,
        orbital,
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
        .populate("orbital", "name description visibility memberCount image")
        .sort({ createdAt: -1 })
        .lean();

    res.json({
        success: true,
        orbitals: memberships.map((m) => ({ ...m.orbital, role: m.role })),
    });
});

const getAllOrbitals = asyncHandler(async (req, res) => {
    const orbitals = await Orbital.find({})
        .select("name description visibility memberCount creator image")
        .populate("creator", "username fullName profilePic")
        .sort({ memberCount: -1, createdAt: -1 })
        .limit(10)
        .lean();

    res.json({ success: true, orbitals });
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
    console.log('deleteOrbital called for orbitalId:', req.orbital._id);
    const orbitalId = req.orbital._id;

    await Promise.all([
        Post.deleteMany({ orbital: orbitalId }),
        OrbitalMember.deleteMany({ orbital: orbitalId }),
    ]);
    await req.orbital.deleteOne();

    res.json({ success: true, message: "Orbital deleted" });
});

module.exports = {
    streamOrbitalImage,
    createOrbital,
    getOrbital,
    getMyOrbitals,
    getAllOrbitals,
    updateOrbital,
    deleteOrbital,
};