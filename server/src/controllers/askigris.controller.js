const { spawn } = require('child_process');
const path = require('path');
const AskIgris = require('../models/askIgris.model');
const User = require('../models/user.model');

// PYTHON SCRIPT EXECUTION

const runPython = (data) => {
    return new Promise((resolve, reject) => {
        const scriptPath = path.resolve(__dirname, '../../RAG/server.py');
        const pythonExecutable = process.env.PYTHON_EXECUTABLE || 'python';

        const pythonProcess = spawn(pythonExecutable, [scriptPath], {
            cwd: path.dirname(scriptPath),
            windowsHide: true,
        });

        let output = '';
        let errorOutput = '';

        pythonProcess.stdout.on('data', (data) => {
            output += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            errorOutput += data.toString();
        });

        pythonProcess.on('error', (error) => {
            reject(new Error(`Failed to start Python: ${error.message}`));
        });

        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                const error = new Error(`Python script exited with code ${code}: ${errorOutput}`);
                const statusMatch = errorOutput.match(/HTTPException:\s+(\d+):/);
                error.statusCode = statusMatch ? Number(statusMatch[1]) : 500;
                return reject(error);
            }
            try {
                resolve(JSON.parse(output));
            } catch (error) {
                reject(new Error(`Failed to parse Python output: ${error.message}`));
            }
        });

        pythonProcess.stdin.write(JSON.stringify(data));
        pythonProcess.stdin.end();
    });
};

const askIgris = (data) => runPython({ action: 'ask', ...data });

const rememberIgris = ({ prompt, file }) => runPython({
    action: 'remember',
    prompt,
    file: {
        filename: file.originalname,
        contentType: file.mimetype,
        data: file.buffer.toString('base64'),
    },
});

const saveIgrisConversation = async ({ userId, prompt, result, title, conversationId }) => {
    const user = await User.findById(userId).select('username').lean();
    if (!user) {
        throw new Error('Authenticated user not found');
    }

    const answer = result?.answer || result?.message || '';
    const historyEntries = [
        { role: 'user', content: prompt || 'Uploaded file' },
        ...(answer
            ? [{ role: 'assistant', content: answer, sources: result?.sources || [] }]
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
            question: prompt || 'Uploaded file',
            title: title || prompt.slice(0, 60) || 'New Conversation',
            response: answer,
            chatHistory: historyEntries,
        });
    }

    return { conversation, result };
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
    rememberIgris,
    getIgrisHistory,
    getIgrisHistoryById,
    newIgrisConversation,
    processIgrisConversation,
};