const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    detail: { type: String, default: "", trim: true },
    createdAt: { type: Date, default: Date.now },
    isRead: { type: Boolean, default: false },
  },
  { _id: true },
);

const earnedBadgeSchema = new mongoose.Schema(
  {
    badge: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Badge",
      required: true,
    },
    earnedAt: { type: Date, default: Date.now },
    notified: { type: Boolean, default: false },
  },
  { _id: true },
);

const rewardSchema = new mongoose.Schema(
  {
    month: { type: String, required: true }, // e.g. "2025-07"
    rewardType: { type: String, default: "monthly" },
    claimed: { type: Boolean, default: false },
    claimedAt: { type: Date },
  },
  { _id: true },
);

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, minlength: 3 },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: function () { return this.authProvider === 'local'; } },
    authProvider: { type: String, enum: ['local', 'google'], default: 'local' },
    googleId: { type: String, sparse: true },
    profilePic: { type: String, default: "" },
    totalXp: { type: Number, default: 0, min: 0, index: true },
    level: { type: Number, default: 1, min: 1 },
    league: {
      type: String,
      default: "Bronze 1",
      index: true,
    },
    streakCount: { type: Number, default: 0, min: 0 },
    notifications: { type: [notificationSchema], default: [] },
    badges: { type: [earnedBadgeSchema], default: [] },
    friends: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      default: [],
    },
    friendRequests: {
      type: [
        {
          from: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
          createdAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
    bio: { type: String, default: "", maxlength: 200 },
    posts: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
      default: [],
    },
    rewards: { type: [rewardSchema], default: [] },
    resetToken: { type: String, default: null, index: true },
    resetTokenExpiry: { type: Date, default: null },
    resetOtpAttempts: { type: Number, default: 0 },
      // Geolocation for discover feature (GeoJSON Point)
      location: {
        type: {
          type: String,
          enum: ["Point"],
          default: "Point",
        },
        coordinates: {
          type: [Number], // [lng, lat]
          default: [0, 0],
        },
      },
      locationUpdatedAt: { type: Date },
      isDiscoverable: { type: Boolean, default: false },
      deviceTokens: {
        type: [String],
        default: [],
      },
  },
  {
    timestamps: true,
  },
);

  // Ensure 2dsphere index for geo queries
  userSchema.index({ location: '2dsphere' });

const userModal = mongoose.model("User", userSchema);
module.exports = userModal;
