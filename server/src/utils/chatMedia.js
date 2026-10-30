const crypto = require('crypto');
const sharp = require('sharp');
const { uploadBufferToDrive, deleteFileFromDrive } = require('./driveUpload');

const MB = 1024 * 1024;
const MEDIA_PATH = '/api/chat/media';

// Raw upload caps per kind (images are shrunk by sharp afterwards).
const LIMITS = { image: 8 * MB, audio: 10 * MB, video: 30 * MB };
const MAX_AUDIO_SECONDS = 300;
const MAX_VIDEO_SECONDS = 120;

// Image output: sharp on a phone, small on the wire. Quality never drops below 68, so it stays crisp.
const IMAGE_STEPS = [
    { px: 1600, quality: 82 },
    { px: 1600, quality: 74 },
    { px: 1280, quality: 72 },
    { px: 1080, quality: 68 },
];
const IMAGE_TARGET_BYTES = 450 * 1024;
const IMAGE_HARD_BYTES = 1.5 * MB;

const MEDIA_KINDS = new Set(['image', 'video', 'audio']);
const FALLBACK_MIME = { image: 'image/webp', video: 'video/mp4', audio: 'audio/mp4' };

const IMAGE_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'image/heif']);
const VIDEO_TYPES = new Set(['video/mp4', 'video/quicktime', 'video/webm', 'video/x-m4v']);
const AUDIO_TYPES = new Set([
    'audio/mp4', 'audio/m4a', 'audio/x-m4a', 'audio/aac', 'audio/mpeg', 'audio/mp3',
    'audio/webm', 'audio/ogg', 'audio/wav', 'audio/x-wav',
]);

const AUDIO_EXT = {
    'audio/mp4': 'm4a', 'audio/m4a': 'm4a', 'audio/x-m4a': 'm4a', 'audio/aac': 'aac',
    'audio/mpeg': 'mp3', 'audio/mp3': 'mp3', 'audio/webm': 'webm', 'audio/ogg': 'ogg',
    'audio/wav': 'wav', 'audio/x-wav': 'wav',
};
const VIDEO_EXT = { 'video/mp4': 'mp4', 'video/quicktime': 'mov', 'video/webm': 'webm', 'video/x-m4v': 'm4v' };

const httpError = (status, message) => Object.assign(new Error(message), { status });
const baseMime = (m = '') => String(m).split(';')[0].trim().toLowerCase();

const kindOfMime = (mime) =>
    IMAGE_TYPES.has(mime) ? 'image' : VIDEO_TYPES.has(mime) ? 'video' : AUDIO_TYPES.has(mime) ? 'audio' : null;

/* ---------- signed media URLs (chat media is private: no public Drive links are ever returned) ---------- */
const SECRET = process.env.MEDIA_SIGNING_SECRET || process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex');
if (!process.env.MEDIA_SIGNING_SECRET && !process.env.JWT_SECRET) {
    console.warn('[chat] set MEDIA_SIGNING_SECRET: using a random secret, media links break on every restart');
}
const sign = (kind, fileId) => crypto.createHmac('sha256', SECRET).update(`${kind}:${fileId}`).digest('hex').slice(0, 32);

function signMediaUrl(kind, fileId) {
    return `${MEDIA_PATH}/${kind}/${fileId}?sig=${sign(kind, fileId)}`;
}

function verifyMediaSig(kind, fileId, sig) {
    if (typeof sig !== 'string') return false;
    const a = Buffer.from(sign(kind, fileId));
    const b = Buffer.from(sig);
    return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/* ---------- validation helpers ---------- */
/** Checks the file header, not just the mimetype the client claims. */
function looksLikeAudio(buf) {
    if (!buf || buf.length < 12) return false;
    const a = buf.subarray(0, 4);
    const s = a.toString('latin1');
    return buf.subarray(4, 8).toString('latin1') === 'ftyp'
        || s === 'OggS' || s === 'RIFF' || s.startsWith('ID3')
        || (a[0] === 0x1a && a[1] === 0x45 && a[2] === 0xdf && a[3] === 0xa3)
        || (a[0] === 0xff && (a[1] & 0xe0) === 0xe0);
}

function looksLikeVideo(buf) {
    if (!buf || buf.length < 12) return false;
    const a = buf.subarray(0, 4);
    return buf.subarray(4, 8).toString('latin1') === 'ftyp'                          // mp4 / mov / m4v
        || (a[0] === 0x1a && a[1] === 0x45 && a[2] === 0xdf && a[3] === 0xa3);       // webm
}

const num = (v, max = 10000) => {
    const n = Number(v);
    return Number.isFinite(n) && n > 0 && n < max ? Math.round(n) : undefined;
};
const clampSeconds = (v, max) => Math.min(max, Math.max(1, Math.round(Number(v) || 1)));

/* ---------- processors (each returns { media, fileIds }) ---------- */
async function processImage(userId, file) {
    let out = null;
    try {
        for (const step of IMAGE_STEPS) {
            out = await sharp(file.buffer, { failOn: 'none', limitInputPixels: 100_000_000 })
                .rotate() // honor phone orientation; metadata is stripped
                .resize({ width: step.px, height: step.px, fit: 'inside', withoutEnlargement: true })
                .webp({ quality: step.quality })
                .toBuffer({ resolveWithObject: true });
            if (out.data.length <= IMAGE_TARGET_BYTES) break;
        }
    } catch {
        throw httpError(400, 'That file could not be read as an image');
    }
    if (out.data.length > IMAGE_HARD_BYTES) throw httpError(413, 'That image is too large');

    const { fileId } = await uploadBufferToDrive(out.data, `chat-i-${userId}-${Date.now()}.webp`, 'image/webp');
    console.log(`[chat image] ${file.buffer.length} -> ${out.data.length} bytes`);
    return {
        media: { type: 'image', fileId, mime: 'image/webp', size: out.data.length, width: out.info.width, height: out.info.height },
        fileIds: [fileId],
    };
}

async function processAudio(userId, file, body) {
    if (!looksLikeAudio(file.buffer)) throw httpError(400, 'That file is not a valid audio recording');
    const duration = clampSeconds(body.mediaDuration, MAX_AUDIO_SECONDS);
    const ext = AUDIO_EXT[file.mimetype] || 'm4a';
    const { fileId } = await uploadBufferToDrive(file.buffer, `chat-a-${userId}-${Date.now()}.${ext}`, file.mimetype);
    return { media: { type: 'audio', fileId, mime: file.mimetype, size: file.size, duration }, fileIds: [fileId] };
}

async function processVideo(userId, file, body) {
    if (!looksLikeVideo(file.buffer)) throw httpError(400, 'That file is not a valid video');
    const duration = clampSeconds(body.mediaDuration, MAX_VIDEO_SECONDS);
    if (Number(body.mediaDuration) > MAX_VIDEO_SECONDS) throw httpError(413, `Videos are limited to ${MAX_VIDEO_SECONDS} seconds`);
    const ext = VIDEO_EXT[file.mimetype] || 'mp4';
    const { fileId } = await uploadBufferToDrive(file.buffer, `chat-v-${userId}-${Date.now()}.${ext}`, file.mimetype);
    return {
        media: {
            type: 'video', fileId, mime: file.mimetype, size: file.size, duration,
            width: num(body.mediaWidth), height: num(body.mediaHeight),
        },
        fileIds: [fileId],
    };
}

/** An uploaded file: image, voice note or video. */
async function processChatMedia(userId, file, body = {}) {
    const kind = kindOfMime(file.mimetype);
    if (!kind) throw httpError(400, 'Unsupported file type');
    if (file.size > LIMITS[kind]) throw httpError(413, `${kind[0].toUpperCase()}${kind.slice(1)} is too large (max ${Math.round(LIMITS[kind] / MB)}MB)`);
    if (kind === 'image') return processImage(userId, file);
    if (kind === 'audio') return processAudio(userId, file, body);
    return processVideo(userId, file, body);
}

/** GIPHY only: nobody can attach an arbitrary link to a message. */
function readGifMedia(body) {
    let u;
    try { u = new URL(String(body.gifUrl)); } catch { throw httpError(400, 'Invalid GIF link'); }
    if (u.protocol !== 'https:' || !/^(media\d*|i)\.giphy\.com$/i.test(u.hostname) || u.href.length > 600) {
        throw httpError(400, 'Only GIPHY GIFs and stickers are supported');
    }
    return {
        media: { type: body.gifKind === 'sticker' ? 'sticker' : 'gif', url: u.href, width: num(body.gifWidth, 5000), height: num(body.gifHeight, 5000) },
        fileIds: [],
    };
}

const PREVIEW = { image: '📷 Photo', video: '🎥 Video', audio: '🎤 Voice message', gif: 'GIF', sticker: 'Sticker' };
const previewLabel = (mediaType) => PREVIEW[mediaType] || '';

/** Best effort and never blocks the response. */
function discardFiles(ids = []) {
    ids.filter(Boolean).forEach((id) => deleteFileFromDrive(id).catch(() => { }));
}

module.exports = {
    MEDIA_PATH, MEDIA_KINDS, FALLBACK_MIME, LIMITS,
    IMAGE_TYPES, VIDEO_TYPES, AUDIO_TYPES, baseMime,
    httpError, processChatMedia, readGifMedia, signMediaUrl, verifyMediaSig, previewLabel, discardFiles,
};