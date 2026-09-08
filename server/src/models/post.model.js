const mongoose = require('mongoose');

const replySchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {_id: true});

const commentSchema = new mongoose.Schema({
  author: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  content: { 
    type: String, 
    trim: true,
    maxlength: 500
  },
  image: {
    type: String,
    default: '',
  },
  voiceNote: {
    url: {type: String, default: ''},
    duration: {type: Number, default: 0}
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: []
  }],
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  replies: [replySchema]
}, { _id: true });

const postSchema = new mongoose.Schema({
  author: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true
  },
  content: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 2000
  },
  image: { 
    type: String, 
    default: '' 
  },
  video: {
    type: String,
    default: ''
  },
  driveFileId: {
    type: String,
    default: ''
  },
  hashtags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [commentSchema],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for performance
postSchema.index({ createdAt: -1 });
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ likes: 1 });

const Post = mongoose.model('Post', postSchema);
const Comment = mongoose.model('Comment', commentSchema);
module.exports = {Post, Comment};
