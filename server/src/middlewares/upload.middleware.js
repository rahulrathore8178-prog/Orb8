const multer = require('multer');

const MB = 1024 * 1024;
const MAX_IMAGE_UPLOAD_BYTES = 8 * MB; // mobile photos can be larger before compression
const MAX_VIDEO_UPLOAD_BYTES = 50 * MB; // keep in sync with frontend MAX_VIDEO_SIZE
const MAX_AUDIO_UPLOAD_BYTES = 15 * MB;
const MAX_PROFILE_IMAGE_UPLOAD_BYTES = 20 * MB; // raw phone photos; sharp shrinks them afterwards
const MAX_COMMENT_IMAGE_BYTES = 8 * MB;

const allowedImageMimeTypes = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
]);

const allowedVideoMimeTypes = new Set([
  'video/mp4',
  'video/webm',
  'video/quicktime', // .mov
]);

const allowedAudioMimeTypes = new Set([
  'audio/webm',
  'audio/ogg',
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/x-wav',
  'audio/mp4', // m4a recordings
]);

const KIND_LIMITS = {
  image: MAX_IMAGE_UPLOAD_BYTES,
  video: MAX_VIDEO_UPLOAD_BYTES,
  audio: MAX_AUDIO_UPLOAD_BYTES,
};

/** "Audio/WebM; codecs=opus" -> "audio/webm" (parameters would otherwise fail the Set lookups). */
const baseMime = (mime = '') => String(mime).split(';')[0].trim().toLowerCase();

const kindOf = (mime) =>
  allowedImageMimeTypes.has(mime) ? 'image'
    : allowedVideoMimeTypes.has(mime) ? 'video'
      : allowedAudioMimeTypes.has(mime) ? 'audio'
        : null;

const debug = (...args) => {
  if (process.env.UPLOAD_DEBUG) console.log('[UPLOAD]', ...args);
};

// --- Profile image upload: image-only ---
const profileImageMulter = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_PROFILE_IMAGE_UPLOAD_BYTES, files: 1 },
  fileFilter: (req, file, cb) => {
    const mime = baseMime(file.mimetype);
    if (!allowedImageMimeTypes.has(mime)) return cb(new Error(`Unsupported image type: ${mime}`));
    file.mimetype = mime;
    return cb(null, true);
  },
});

// --- Post media upload (feed + orbitals): image, video or audio ---
const postMediaMulter = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_VIDEO_UPLOAD_BYTES, // multer allows one cap; the per-type cap is enforced in handleUpload
    files: 1,
    fields: 20,
    fieldSize: 100 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const mime = baseMime(file.mimetype);
    debug('incoming file:', { field: file.fieldname, name: file.originalname, mime });
    if (!kindOf(mime)) return cb(new Error(`Unsupported file type: ${mime}`));
    file.mimetype = mime; // controllers always see a clean mimetype
    return cb(null, true);
  },
});

/**
 * Wraps multer.single() with friendly JSON errors.
 * Pass `perKindLimits` to enforce a different max size per file kind (post media only).
 */
function handleUpload(multerInstance, fieldName, maxBytes, perKindLimits = null) {
  return (req, res, next) => {
    multerInstance.single(fieldName)(req, res, (error) => {
      if (error) {
        if (error instanceof multer.MulterError) {
          if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(413).json({ message: `File too large. Max upload size is ${Math.round(maxBytes / MB)}MB.` });
          }
          if (error.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({ message: `Unexpected upload field. Send the file as "${fieldName}".` });
          }
          return res.status(400).json({ message: `Upload error: ${error.code}` });
        }
        return res.status(400).json({ message: error.message || 'Invalid file.' });
      }

      if (perKindLimits && req.file) {
        const kind = kindOf(baseMime(req.file.mimetype));
        const limit = kind && perKindLimits[kind];
        if (limit && req.file.size > limit) {
          const label = kind === 'image' ? 'Image' : kind === 'video' ? 'Video' : 'Audio';
          return res.status(413).json({ message: `${label} too large. Max upload size is ${Math.round(limit / MB)}MB.` });
        }
      }
      return next();
    });
  };
}

const profileImageUpload = handleUpload(profileImageMulter, 'profilePic', MAX_PROFILE_IMAGE_UPLOAD_BYTES);
const postMediaUpload = handleUpload(postMediaMulter, 'media', MAX_VIDEO_UPLOAD_BYTES, KIND_LIMITS);
const orbitalMediaUpload = postMediaUpload;
const orbitalImageUpload = postMediaUpload; // legacy name: orbital posts accept video/audio too

// --- Comments: image or voice note ---
const commentMulter = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_COMMENT_IMAGE_BYTES, files: 1, fields: 12 },
  fileFilter: (req, file, cb) => {
    const mime = baseMime(file.mimetype);
    const ok =
      (file.fieldname === 'image' && allowedImageMimeTypes.has(mime)) ||
      (file.fieldname === 'voiceNote' && allowedAudioMimeTypes.has(mime));
    if (!ok) return cb(new Error(`Unsupported file for "${file.fieldname}": ${mime}`));
    file.mimetype = mime;
    return cb(null, true);
  },
});

// Text and GIF comments arrive as plain JSON; multer skips non-multipart requests.
const commentMediaUpload = (req, res, next) =>
  commentMulter.fields([{ name: 'image', maxCount: 1 }, { name: 'voiceNote', maxCount: 1 }])(req, res, (error) => {
    if (!error) return next();
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') return res.status(413).json({ message: 'That file is too large.' });
      return res.status(400).json({ message: `Upload error: ${error.code}` });
    }
    return res.status(400).json({ message: error.message || 'Invalid file.' });
  });

module.exports = {
  MAX_IMAGE_UPLOAD_BYTES,
  MAX_VIDEO_UPLOAD_BYTES,
  MAX_AUDIO_UPLOAD_BYTES,
  MAX_PROFILE_IMAGE_UPLOAD_BYTES,
  profileImageUpload,
  postMediaUpload,
  orbitalMediaUpload,
  orbitalImageUpload,
  commentMediaUpload,
};