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

const userPreferenceSchema = new mongoose.Schema(
  {
    primaryLanguage: { type: String, default: "english" },
    content: {
      education: { type: Number, default: 0 },
      entertainment: { type: Number, default: 0 },
      news: { type: Number, default: 0 },
      sports: { type: Number, default: 0 },
      technology: { type: Number, default: 0 },
    },
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

const profileGridItemSchema = new mongoose.Schema(
  {
    post: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
    gridSize: {
      type: String,
      enum: [
        "1x1", "2x1", "3x1",
        "1x2", "2x2", "3x2",
        "1x3", "2x3", "3x3",
      ],
      default: "1x1",
    },
  },
  { _id: false },
);

const savedPostSchema = new mongoose.Schema(
  {
    post: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
    savedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const savedCollectionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    posts: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
      default: [],
    },
  },
  { timestamps: true },
);

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, minlength: 3 },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: function () { return this.authProvider === 'local'; } },
    needsProfileCompletion: { type: Boolean, default: true },
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
    isPrivate: { type: Boolean, default: true },
    followers: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      default: [],
    },
    following: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      default: [],
    },
    followRequests: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      default: [],
    },
    blockedUsers: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      default: [],
    },
    profileGridLayout: { type: [profileGridItemSchema], default: [] },
    savedPosts: { type: [savedPostSchema], default: [] },
    savedCollections: { type: [savedCollectionSchema], default: [] },
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
    cosmicLocation: {
      type: { type: String, enum: ["Point"] },
      coordinates: { type: [Number] },
    },
    cosmicLocationUpdatedAt: { type: Date },
    isCosmicDiscoverable: { type: Boolean, default: false },
    deviceTokens: {
      type: [String],
      default: [],
    },
    notificationPreferences: {
      pushEnabled: { type: Boolean, default: true },
      social: { type: Boolean, default: true },
      learning: { type: Boolean, default: true },
      product: { type: Boolean, default: true },
    },
    preferences: {
      primaryLanguage: { type: String, default: "english" },
      content: {
        education: { type: Number, default: 0 },
        entertainment: { type: Number, default: 0 },
        news: { type: Number, default: 0 },
        sports: { type: Number, default: 0 },
        technology: { type: Number, default: 0 },
      },
    },
  },
  {
    timestamps: true,
  },
);

// Ensure 2dsphere index for geo queries
userSchema.index({ location: '2dsphere' });
userSchema.index({ cosmicLocation: '2dsphere' });

const userModal = mongoose.model("User", userSchema);
module.exports = userModal;
