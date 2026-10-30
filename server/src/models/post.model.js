const mongoose = require('mongoose');

/* Media fields shared by comments AND replies (factory: each schema gets its own copy). */
const gifSchema = new mongoose.Schema({
  url: { type: String, required: true },
  kind: { type: String, enum: ['gif', 'sticker'], default: 'gif' },
  width: Number,
  height: Number,
}, { _id: false });

const commentMediaFields = () => ({
  image: { type: String, default: '' },
  imageFileId: { type: String, default: '' },
  imageWidth: { type: Number, default: 0 },
  imageHeight: { type: Number, default: 0 },
  voiceNote: {
    url: { type: String, default: '' },
    fileId: { type: String, default: '' },
    duration: { type: Number, default: 0 },
  },
  gif: { type: gifSchema, default: undefined },
});

// LEGACY: comments saved by the old code stored a single `media` object. Read-only now.
const legacyMediaSchema = new mongoose.Schema({
  type: { type: String, enum: ['image', 'gif', 'sticker', 'audio'] },
  url: String,
  width: Number,
  height: Number,
  duration: Number,
}, { _id: false });

const replySchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, default: '', maxlength: 500 },
  ...commentMediaFields(),
  media: { type: legacyMediaSchema, default: undefined },
  replyToUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now },
});

const commentSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, default: '', maxlength: 500 },
  ...commentMediaFields(),
  media: { type: legacyMediaSchema, default: undefined },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  replies: [replySchema],
  createdAt: { type: Date, default: Date.now },
});

const postSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  content: {
    type: String,
    trim: true,
    maxlength: 2000
  },
  image: { type: String, default: '' },
  imageFileId: { type: String, default: '' },
  video: { type: String, default: '' },
  videoFileId: { type: String, default: '' },
  driveFileId: { type: String, default: '' },
  hashtags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  voiceNote: { type: String, default: '' },
  voiceNoteFileId: { type: String, default: '' },
  voiceNoteDuration: { type: Number, default: 0 },
  comments: [commentSchema],
  isActive: {
    type: Boolean,
    default: true
  },
  isArchived: {
    type: Boolean,
    default: false,
    index: true
  },
  views: { type: Number, default: 0 },
  viewedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  postType: {
    type: String,
    enum: ['feed', 'orbital'],
    default: 'feed'
  },
  orbital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Orbital",
    default: null,
    index: true,
  },
  // written by createPost after the AI analysis
  analysis: { type: mongoose.Schema.Types.Mixed },
  status: { type: String },
},
  {
    timestamps: true
  });

// Indexes for performance
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ likes: 1 });
// The comment audio stream route looks a file id up before streaming it.
postSchema.index({ 'comments.voiceNote.fileId': 1 });
postSchema.index({ 'comments.replies.voiceNote.fileId': 1 });

const Post = mongoose.model('Post', postSchema);
const Comment = mongoose.model('Comment', commentSchema);
module.exports = { Post, Comment };