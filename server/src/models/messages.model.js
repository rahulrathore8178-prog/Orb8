const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, default: '' },           // message text
  type: { type: String, default: 'chat_message' },  // type of message
  sharedPost: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', default: null },
  timestamp: { type: Date, default: Date.now },           // timestamp
  delivered: { type: Boolean, default: false },      // delivery check
  // Older messages have no value and default to read, so history never turns into a pile of unread.
  read: { type: Boolean, default: true },
  edited: { type: Boolean, default: false },
  editedAt: { type: Date, default: null }
});

messageSchema.index({ senderId: 1, recipientId: 1, timestamp: -1 });
messageSchema.index({ recipientId: 1, read: 1 });

const Message = mongoose.model('Message', messageSchema);
module.exports = Message;