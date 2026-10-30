const multer = require('multer');
const { IMAGE_TYPES, VIDEO_TYPES, AUDIO_TYPES, LIMITS, baseMime } = require('../utils/chatMedia');

/**
 * Chat attachments: ONE file in the multipart field "media" (image, video or voice note).
 * JSON requests (text, GIF/sticker, shared post) pass straight through.
 * Files stay in memory; utils/chatMedia.js validates, compresses and uploads them.
 */
const chatMulter = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: LIMITS.video, files: 1, fields: 12, fieldSize: 20 * 1024 }, // per-kind caps are enforced in chatMedia.js
    fileFilter: (req, file, cb) => {
        const mime = baseMime(file.mimetype);
        const ok = file.fieldname === 'media' && (IMAGE_TYPES.has(mime) || VIDEO_TYPES.has(mime) || AUDIO_TYPES.has(mime));
        if (!ok) return cb(new Error(`Unsupported file for "${file.fieldname}": ${mime}`));
        file.mimetype = mime; // controllers always see a clean mimetype
        return cb(null, true);
    },
});

const chatMediaUpload = (req, res, next) =>
    chatMulter.single('media')(req, res, (error) => {
        if (!error) return next();
        if (error instanceof multer.MulterError) {
            if (error.code === 'LIMIT_FILE_SIZE') return res.status(413).json({ success: false, message: 'That file is too large.' });
            return res.status(400).json({ success: false, message: `Upload error: ${error.code}` });
        }
        return res.status(400).json({ success: false, message: error.message || 'Invalid file.' });
    });

module.exports = { chatMediaUpload };