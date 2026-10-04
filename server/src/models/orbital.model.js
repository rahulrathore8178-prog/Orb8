// models/orbital.model.js
const mongoose = require("mongoose");

const VISIBILITY = Object.freeze({ OPEN: "open", PRIVATE: "private" });

const orbitalSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true, minlength: 3, maxlength: 50 },
        image: { type: String, trim: true },
        description: { type: String, trim: true, maxlength: 500, default: "" },
        visibility: {
            type: String,
            enum: Object.values(VISIBILITY),
            default: VISIBILITY.OPEN,
        },
        creator: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        memberCount: { type: Number, default: 0 },
    },
    { timestamps: true }
);

// Unique names, case-insensitive ("Gamers" and "gamers" collide)
orbitalSchema.index({ name: 1 }, { unique: true, collation: { locale: "en", strength: 2 } });

module.exports = mongoose.model("Orbital", orbitalSchema);
module.exports.VISIBILITY = VISIBILITY;