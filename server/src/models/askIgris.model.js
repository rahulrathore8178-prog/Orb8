const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    sources: [{ type: String }],
    timestamp: { type: Date, default: Date.now }
})

const askIgrisSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    question: { type: String, required: true },
    title: { type: String, default: 'New Conversation' },
    response: { type: String },
    chatHistory: [chatSchema],
}, {
    timestamps: true
});

module.exports = mongoose.model('AskIgris', askIgrisSchema);