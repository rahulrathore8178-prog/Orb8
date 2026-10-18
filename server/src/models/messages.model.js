const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, default: '' },           // message text
  type: { type: String, default: 'chat_message' },  // type of message
  sharedPost: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', default: null },
  timestamp: { type: Date, default: Date.now },           // timestamp
  delivered: { type: Boolean, default: false }       // delivery check
});

messageSchema.index({ senderId: 1, recipientId: 1, timestamp: -1 });

const Message = mongoose.model('Message', messageSchema);
module.exports = Message;
