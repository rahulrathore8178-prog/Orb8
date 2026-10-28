const sharp = require('sharp');
const { uploadBufferToDrive, deleteFileFromDrive } = require('./driveUpload');

const MAX_COMMENT_CHARS = 500;
const MAX_VOICE_BYTES = 2 * 1024 * 1024;
const MAX_VOICE_SECONDS = 60;
const IMAGE_PX = 1080;                  // longest edge: sharp on a phone, tiny on the wire
const IMAGE_TARGET_BYTES = 220 * 1024;  // typical result: 40-200KB

const AUDIO_EXT = {
    'audio/mp4': 'm4a', 'audio/m4a': 'm4a', 'audio/x-m4a': 'm4a', 'audio/aac': 'aac',
    'audio/mpeg': 'mp3', 'audio/mp3': 'mp3', 'audio/webm': 'webm', 'audio/ogg': 'ogg',
    'audio/wav': 'wav', 'audio/x-wav': 'wav',
};

const httpError = (status, message) => Object.assign(new Error(message), { status });

/** Checks the file header, not just the mimetype the client claims. */
function looksLikeAudio(buf) {
    if (!buf || buf.length < 12) return false;
    const a = buf.subarray(0, 4);
    const s = a.toString('latin1');
    return buf.subarray(4, 8).toString('latin1') === 'ftyp'                    // m4a / mp4
        || s === 'OggS' || s === 'RIFF' || s.startsWith('ID3')
        || (a[0] === 0x1a && a[1] === 0x45 && a[2] === 0xdf && a[3] === 0xa3)    // webm
        || (a[0] === 0xff && (a[1] & 0xe0) === 0xe0);                            // mp3
}

/** -> { fields, fileIds }: `fields` is spread into the comment/reply document. */
async function processCommentImage(userId, buffer) {
    let out = null;
    try {
        for (const quality of [80, 72, 64, 56]) {
            out = await sharp(buffer, { failOn: 'none', limitInputPixels: 100_000_000 })
                .rotate() // honor the phone's orientation; metadata is stripped
                .resize({ width: IMAGE_PX, height: IMAGE_PX, fit: 'inside', withoutEnlargement: true })
                .webp({ quality })
                .toBuffer({ resolveWithObject: true });
            if (out.data.length <= IMAGE_TARGET_BYTES) break;
        }
    } catch {
        throw httpError(400, 'That file could not be read as an image');
    }
    if (out.data.length > 1024 * 1024) throw httpError(413, 'That image is too large');

    const { fileId, publicUrl } = await uploadBufferToDrive(out.data, `c-${userId}-${Date.now()}.webp`, 'image/webp');
    console.log(`[comment image] ${buffer.length} -> ${out.data.length} bytes`);
    return {
        fields: { image: publicUrl, imageFileId: fileId, imageWidth: out.info.width, imageHeight: out.info.height },
        fileIds: [fileId],
    };
}

async function processVoiceNote(userId, file, durationRaw) {
    if (file.size > MAX_VOICE_BYTES) throw httpError(413, 'That voice note is too large');
    if (!looksLikeAudio(file.buffer)) throw httpError(400, 'That file is not a valid audio recording');

    const duration = Math.min(MAX_VOICE_SECONDS, Math.max(1, Math.round(Number(durationRaw) || 1)));
    const ext = AUDIO_EXT[file.mimetype] || 'm4a';
    const { fileId } = await uploadBufferToDrive(file.buffer, `v-${userId}-${Date.now()}.${ext}`, file.mimetype);
    // url stays empty: playback goes through GET /comments/audio/:fileId
    return { fields: { voiceNote: { url: '', fileId, duration } }, fileIds: [fileId] };
}

/** GIPHY only: nobody can attach an arbitrary link to a comment. */
function readGifMedia(body) {
    let u;
    try { u = new URL(String(body.gifUrl)); } catch { throw httpError(400, 'Invalid GIF link'); }
    if (u.protocol !== 'https:' || !/^(media\d*|i)\.giphy\.com$/i.test(u.hostname) || u.href.length > 600) {
        throw httpError(400, 'Only GIPHY GIFs and stickers are supported');
    }
    const num = (v) => { const n = Number(v); return Number.isFinite(n) && n > 0 && n < 5000 ? Math.round(n) : undefined; };
    return {
        fields: { gif: { url: u.href, kind: body.gifKind === 'sticker' ? 'sticker' : 'gif', width: num(body.gifWidth), height: num(body.gifHeight) } },
        fileIds: [],
    };
}

/**
 * Text + at most one of: image, voice note, GIF/sticker.
 * -> { content, fields, fileIds }. Throws httpError on bad input.
 */
async function readCommentInput(req, userId) {
    const content = typeof req.body?.content === 'string' ? req.body.content.trim() : '';
    if (content.length > MAX_COMMENT_CHARS) throw httpError(400, `Comments are limited to ${MAX_COMMENT_CHARS} characters`);

    const image = req.files?.image?.[0];
    const voice = req.files?.voiceNote?.[0];
    const gifUrl = typeof req.body?.gifUrl === 'string' ? req.body.gifUrl.trim() : '';

    const kinds = [image, voice, gifUrl].filter(Boolean).length;
    if (kinds > 1) throw httpError(400, 'Attach only one image, voice note, or GIF');
    if (!content && kinds === 0) throw httpError(400, 'Write something or attach an image, voice note, or GIF');

    let media = { fields: {}, fileIds: [] };
    if (image) media = await processCommentImage(userId, image.buffer);
    else if (voice) media = await processVoiceNote(userId, voice, req.body?.voiceDuration);
    else if (gifUrl) media = readGifMedia(req.body);

    return { content, fields: media.fields, fileIds: media.fileIds };
}

/* ---------- cleaning up Drive ---------- */
const driveIdFromUrl = (u) => (typeof u === 'string' ? u.match(/\/d\/([\w-]+)/)?.[1] : undefined);

/** Drive file ids owned by a comment or reply (including older comments that only stored the URL). */
function fileIdsOf(item) {
    const ids = [];
    if (item?.imageFileId) ids.push(item.imageFileId);
    else if (item?.image) {
        const id = driveIdFromUrl(item.image);
        if (id) ids.push(id);
    }
    if (item?.voiceNote?.fileId) ids.push(item.voiceNote.fileId);
    return ids;
}

/** Best effort and never blocks the response. */
function discardFiles(ids = []) {
    ids.forEach((id) => deleteFileFromDrive(id).catch(() => { }));
}

module.exports = { httpError, readCommentInput, fileIdsOf, discardFiles, MAX_COMMENT_CHARS };