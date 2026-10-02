const { spawn } = require('child_process');
const path = require('path');
const AskIgris = require('../models/askIgris.model');
const User = require('../models/user.model');

// PYTHON SCRIPT EXECUTION

const PY_URL = process.env.PY_URL || "http://localhost:8000";

// ---------- 1. Helper: call the Python server over HTTP ----------
const callPython = async (path, { json, form, timeoutMs = 120000 } = {}) => {
    const res = await fetch(`${PY_URL}${path}`, {
        method: "POST",
        // for FormData, do NOT set Content-Type; fetch adds the multipart boundary
        headers: json ? { "Content-Type": "application/json" } : undefined,
        body: json ? JSON.stringify(json) : form,
        signal: AbortSignal.timeout(timeoutMs),
    });

    if (!res.ok) {
        const detail = await res.text();
        const error = new Error(`Python server error ${res.status}: ${detail}`);
        error.statusCode = res.status;
        throw error;
    }
    return res.json();
};

// ---------- 2. Python calls ----------
const askIgris = ({ prompt, history = [] }) =>
    callPython("/askPrompt", {
        json: {
            question: prompt,
            source: null,
            history,
        },
    });

const describeImageIgris = ({ prompt, systemprompt, file }) => {
    const form = new FormData();
    form.append("prompt", prompt || "");
    form.append("systemprompt", systemprompt || "Describe the image.");
    form.append(
        "file",
        new Blob([file.buffer], { type: file.mimetype }),
        file.originalname
    );
    return callPython("/describe_image", { form });
};

// ---------- 3. Save conversation to Mongo (your existing function, unchanged) ----------
const saveIgrisConversation = async ({ userId, prompt, result, title, conversationId }) => {
    const user = await User.findById(userId).select("username").lean();
    if (!user) throw new Error("Authenticated user not found");

    const answer = result?.answer || result?.message || "";
    const historyEntries = [
        { role: "user", content: prompt || "Uploaded file" },
        ...(answer
            ? [{ role: "assistant", content: answer, sources: result?.sources || [] }]
            : []),
    ];

    let conversation = conversationId
        ? await AskIgris.findOne({ _id: conversationId, userId })
        : null;

    if (conversation) {
        conversation.username = user.username;
        conversation.chatHistory.push(...historyEntries);
        conversation.response = answer || conversation.response;
        await conversation.save();
    } else {
        conversation = await AskIgris.create({
            userId,
            username: user.username,
            question: prompt || "Uploaded file",
            title: title || (prompt || "").slice(0, 60) || "New Conversation",
            response: answer,
            chatHistory: historyEntries,
        });
    }

    return { conversation, result };
};

// ---------- 4. Controller: text chat  (POST /askPrompt) ----------
const askPrompt = async (req, res) => {
    try {
        const { question, conversationId, title } = req.body;
        const userId = req.user.id; // however your auth middleware sets it

        if (!question || !question.trim()) {
            return res.status(400).json({ error: "question is required" });
        }

        // load last 10 messages so Python stays stateless
        let history = [];
        if (conversationId) {
            // Find the conversation by ID and user ID
            const convo = await AskIgris.findOne({ _id: conversationId, userId }).lean();
            history = (convo?.chatHistory || [])
                .slice(-10)
                .map(({ role, content }) => ({ role, content }));
        }

        // Node -> Python -> Node
        const result = await askIgris({ prompt: question, history });

        // save to Mongo
        const { conversation } = await saveIgrisConversation({
            userId,
            prompt: question,
            result,
            title,
            conversationId,
        });

        // Node -> Frontend
        res.json({
            answer: result.answer,
            sources: result.sources || [],
            conversation,
        });
    } catch (err) {
        console.error("askPrompt failed:", err);
        res.status(err.statusCode || 500).json({ error: err.message });
    }
};

// ---------- 5. Controller: image chat  (POST /describe_image) ----------
// route needs multer: upload.single("file")  (memoryStorage, since you use file.buffer)
const describeImage = async (req, res) => {
    try {
        const { question, title, systemprompt, conversationId } = req.body;
        const userId = req.user.id;

        if (!req.file) {
            return res.status(400).json({ error: "image file is required" });
        }

        const result = await describeImageIgris({
            prompt: question,
            systemprompt,
            file: req.file,
        });

        const { conversation } = await saveIgrisConversation({
            userId,
            prompt: question || "Uploaded image",
            result,
            title,
            conversationId,
        });

        res.json({
            answer: result.answer,
            sources: result.sources || [],
            conversation,
        });
    } catch (err) {
        console.error("describeImage failed:", err);
        res.status(err.statusCode || 500).json({ error: err.message });
    }
};

const processIgrisConversation = async (req, res) => {
    try {
        const prompt = (req.body.question || req.body.prompt || '').trim();
        if (!prompt && !req.file) {
            return res.status(400).json({ message: 'A question or file is required.' });
        }

        const result = req.file
            ? await rememberIgris({ prompt, file: req.file })
            : await askIgris({ prompt });
        const saved = await saveIgrisConversation({
            userId: req.user.id,
            prompt,
            result,
            title: req.body.title,
            conversationId: req.body.conversationId,
        });

        return res.json({
            message: 'Conversation processed successfully',
            ...result,
            conversation: saved.conversation,
        });
    } catch (error) {
        console.error('Error processing Igris conversation:', error);
        return res.status(error.statusCode || 500).json({
            error: error.statusCode === 503
                ? 'Image OCR is unavailable. Install Tesseract OCR and add it to PATH.'
                : 'Failed to process Igris conversation'
        });
    }
};

// EXPRESS CONTROLLERS

// Get complete history of a user 
const getIgrisHistory = async (req, res) => {
    try {
        const AskIgris = require('../models/askIgris.model');
        const history = await AskIgris.find({ userId: req.params.userId }).sort({ createdAt: -1 });
        res.json(history);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get history of a specific conversation for a user
const getIgrisHistoryById = async (req, res) => {
    try {
        const AskIgris = require('../models/askIgris.model');
        const history = await AskIgris.findOne({ _id: req.params.id, userId: req.params.userId }).sort({ createdAt: -1 });
        console.log('Retrieved history for conversation ID:', req.params.id, 'result:', history);
        res.json(history);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// New conversation with Igris
const newIgrisConversation = async (req, res) => {
    return processIgrisConversation(req, res);
};

module.exports = {
    askIgris,
    askPrompt,
    describeImage,
    saveIgrisConversation,
    getIgrisHistory,
    getIgrisHistoryById,
    newIgrisConversation,
    processIgrisConversation,
};