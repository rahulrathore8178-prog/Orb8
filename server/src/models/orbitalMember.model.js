// models/orbitalMember.model.js
const mongoose = require("mongoose");

const ROLE = Object.freeze({ CREATOR: "creator", ADMIN: "admin", MEMBER: "member" });
const STATUS = Object.freeze({ ACTIVE: "active", PENDING: "pending" });

const orbitalMemberSchema = new mongoose.Schema(
    {
        orbital: { type: mongoose.Schema.Types.ObjectId, ref: "Orbital", required: true },
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        role: { type: String, enum: Object.values(ROLE), default: ROLE.MEMBER },
        status: { type: String, enum: Object.values(STATUS), default: STATUS.ACTIVE },
    },
    { timestamps: true }
);

orbitalMemberSchema.index({ orbital: 1, user: 1 }, { unique: true }); // no duplicate joins
orbitalMemberSchema.index({ orbital: 1, status: 1 });
orbitalMemberSchema.index({ user: 1, status: 1 });

const OrbitalMember = mongoose.model(
    "OrbitalMember",
    orbitalMemberSchema
);

module.exports = {
    OrbitalMember,
    ROLE,
    STATUS,
};