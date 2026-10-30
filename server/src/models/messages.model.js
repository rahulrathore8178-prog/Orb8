const mongoose = require('mongoose');

// One attachment per message. GIF/sticker = GIPHY link; image/video/audio = Drive file streamed through the API.
const mediaSchema = new mongoose.Schema({
  type: { type: String, enum: ['image', 'video', 'audio', 'gif', 'sticker'], required: true },
  url: String,        // gif / sticker only (GIPHY link)
  fileId: String,     // image / video / audio (Drive file id)
  mime: String,
  size: Number,
  width: Number,
  height: Number,
  duration: Number,   // seconds, audio / video
}, { _id: false });

const messageSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, default: '' },           // text / caption (empty for media-only messages)
  type: { type: String, default: 'chat_message' },  // 'chat_message' | 'shared_post'
  sharedPost: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', default: null },
  media: { type: mediaSchema, default: undefined }, // photo, video, voice note, GIF or sticker
  timestamp: { type: Date, default: Date.now },
  delivered: { type: Boolean, default: false },
  // Older messages have no value and default to read, so history never turns into a pile of unread.
  read: { type: Boolean, default: true },
  edited: { type: Boolean, default: false },
  editedAt: { type: Date, default: null },
  // "Delete for me": users who hid this message. The other person still sees it.
  deletedFor: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
});

// conversation history (paginated by _id) and the two-way lookup
messageSchema.index({ senderId: 1, recipientId: 1, _id: -1 });
messageSchema.index({ senderId: 1, recipientId: 1, timestamp: -1 });
// unread counts and the conversation list
messageSchema.index({ recipientId: 1, senderId: 1, read: 1 });
messageSchema.index({ recipientId: 1, timestamp: -1 });
messageSchema.index({ senderId: 1, timestamp: -1 });

const Message = mongoose.model('Message', messageSchema);
module.exports = Message;