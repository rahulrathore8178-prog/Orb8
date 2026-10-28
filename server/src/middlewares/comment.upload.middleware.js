const multer = require('multer');

/**
 * Upload middleware for comments and replies.
 *
 *  - multipart request  -> accepts ONE file: field "image" or field "voiceNote"
 *  - JSON request       -> passes straight through (text-only and GIF/sticker comments)
 *
 * Files stay in memory; utils/commentMedia.js validates and shrinks them.
 * Self-contained on purpose: it does not touch upload.middleware.js.
 */

const IMAGE_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp']);
const AUDIO_TYPES = new Set([
    'audio/mp4', 'audio/m4a', 'audio/x-m4a', 'audio/aac',
    'audio/mpeg', 'audio/mp3', 'audio/webm', 'audio/ogg', 'audio/wav', 'audio/x-wav',
]);

const MAX_FILE_BYTES = 8 * 1024 * 1024; // raw photos; sharp shrinks them. Voice notes are capped at 2MB in commentMedia.js

const commentMulter = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_FILE_BYTES, files: 1, fields: 12 },
    fileFilter: (req, file, cb) => {
        if (file.fieldname === 'image' && IMAGE_TYPES.has(file.mimetype)) return cb(null, true);
        if (file.fieldname === 'voiceNote' && AUDIO_TYPES.has(file.mimetype)) return cb(null, true);
        return cb(new Error(`Unsupported file for "${file.fieldname}": ${file.mimetype}`));
    },
});

const commentMediaUpload = (req, res, next) =>
    commentMulter.fields([
        { name: 'image', maxCount: 1 },
        { name: 'voiceNote', maxCount: 1 },
    ])(req, res, (error) => {
        if (!error) return next();
        if (error instanceof multer.MulterError) {
            if (error.code === 'LIMIT_FILE_SIZE') return res.status(413).json({ message: 'That file is too large.' });
            return res.status(400).json({ message: `Upload error: ${error.code}` });
        }
        return res.status(400).json({ message: error.message || 'Invalid file.' });
    });

module.exports = { commentMediaUpload };