const multer = require('multer');

const MAX_IMAGE_UPLOAD_BYTES = 8 * 1024 * 1024;   // mobile photos can be larger before compression
const MAX_VIDEO_UPLOAD_BYTES = 50 * 1024 * 1024;  // keep in sync with frontend MAX_VIDEO_SIZE and controller MAX_VIDEO_BYTES

const allowedImageMimeTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/jpg',
  'image/heic',
  'image/heif'
]);

const allowedVideoMimeTypes = new Set([
  'video/mp4',
  'video/webm',
  'video/quicktime' // .mov
]);

const allowedAudioMimeTypes = new Set([
  'audio/webm',
  'audio/ogg',
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/x-wav',
  'audio/mp4', // some browsers report m4a recordings this way
]);

// --- Profile image upload: unchanged, image-only, 8MB cap ---
const profileImageMulter = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_IMAGE_UPLOAD_BYTES,
    files: 1
  },
  fileFilter: (req, file, cb) => {
    if (!allowedImageMimeTypes.has(file.mimetype)) {
      return cb(new Error(`Unsupported image type: ${file.mimetype}`));
    }
    return cb(null, true);
  }
});

// --- Post media upload: accepts image OR video, sized for the larger of the two ---
const postMediaMulter = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_VIDEO_UPLOAD_BYTES, // multer only allows one cap; per-type enforcement happens below
    files: 1
  },
  fileFilter: (req, file, cb) => {
    console.log('[UPLOAD] incoming file:', {
      fieldname: file.fieldname,
      originalname: file.originalname,
      mimetype: file.mimetype
    });

    const isImage = allowedImageMimeTypes.has(file.mimetype);
    const isVideo = allowedVideoMimeTypes.has(file.mimetype);
    const isAudio = allowedAudioMimeTypes.has(file.mimetype);

    if (!isImage && !isVideo && !isAudio) {
      return cb(new Error(`Unsupported file type: ${file.mimetype}`));
    }
    // stash which kind it was so the size check downstream (post-multer) can
    // enforce the tighter per-type limits — multer's own `limits.fileSize` can't
    // vary per mimetype, so we let the largest-allowed size through here and check below.
    file._detectedKind = isVideo ? 'video' : isAudio ? 'audio' : 'image';
    return cb(null, true);
  }
});
function handleUpload(multerInstance, fieldName) {
  return (req, res, next) => {
    const uploadSingle = multerInstance.single(fieldName);

    uploadSingle(req, res, (error) => {
      console.log('[UPLOAD] body keys:', Object.keys(req.body || {}));
      console.log('[UPLOAD] file attached:', !!req.file);

      if (error) {
        if (error instanceof multer.MulterError) {
          if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(413).json({ message: `File too large. Max upload size is ${MAX_VIDEO_UPLOAD_BYTES / (1024 * 1024)}MB.` });
          }
          return res.status(400).json({ message: `Upload error: ${error.code}` });
        }
        return res.status(400).json({ message: error.message || 'Invalid file.' });
      }

      // Enforce the tighter 8MB cap for images specifically, since multer's
      // own limits.fileSize above is set to the video ceiling.
      if (req.file && req.file._detectedKind === 'image' && req.file.size > MAX_IMAGE_UPLOAD_BYTES) {
        return res.status(413).json({ message: `Image too large. Max upload size is ${MAX_IMAGE_UPLOAD_BYTES / (1024 * 1024)}MB.` });
      }

      return next();
    });
  };
}

const profileImageUpload = handleUpload(profileImageMulter, 'profilePic');
const postMediaUpload = handleUpload(postMediaMulter, 'media');
const orbitalImageUpload = handleUpload(postMediaMulter, 'media');

module.exports = {
  MAX_IMAGE_UPLOAD_BYTES,
  MAX_VIDEO_UPLOAD_BYTES,
  profileImageUpload,
  postMediaUpload,
  orbitalImageUpload
};