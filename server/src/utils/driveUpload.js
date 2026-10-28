const { google } = require('googleapis');
const { Readable } = require('stream');

const oAuth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
);

oAuth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

const drive = google.drive({ version: 'v3', auth: oAuth2Client });

const FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID;

async function uploadBufferToDrive(buffer, fileName, mimeType = 'image/webp') {
    const fileMetadata = {
        name: fileName,
        ...(FOLDER_ID && { parents: [FOLDER_ID] }),
    };

    const media = {
        mimeType,
        body: Readable.from(buffer)
    };

    const file = await drive.files.create({
        resource: fileMetadata,
        media,
        fields: 'id',
    });

    const fileId = file.data.id;

    await drive.permissions.create({
        fileId,
        requestBody: { role: 'reader', type: 'anyone' },
    });

    const publicUrl = `https://lh3.googleusercontent.com/d/${fileId}`;

    return { fileId, publicUrl };
};

async function deleteFileFromDrive(fileId) {
    if (!fileId) return;

    try {
        await drive.files.delete({ fileId });
    } catch (err) {
        if (err.code === 404) {
            console.warn(`Drive file ${fileId} already deleted or not found`);
        } else {
            throw err;
        }
    }
};

// Forwards Range headers to Drive and answers 206 Partial Content (needed for
// video/audio seeking, and iOS refuses to play media without it).
// `fallbackType` is used when Drive reports a missing/generic content type.
async function streamFileFromDrive(fileId, res, req, fallbackType) {
    const range = req?.headers?.range;
    const requestOptions = { responseType: 'stream' };
    if (range) requestOptions.headers = { Range: range };

    const file = await drive.files.get({ fileId, alt: 'media' }, requestOptions);

    let contentType = String(file.headers['content-type'] || '').split(';')[0].trim();
    const generic = !contentType || contentType === 'application/octet-stream' || contentType === 'text/html';
    if (generic && fallbackType) contentType = fallbackType;
    res.setHeader('Content-Type', contentType || 'application/octet-stream');
    res.setHeader('Accept-Ranges', 'bytes');

    if (file.headers['content-length']) {
        res.setHeader('Content-Length', file.headers['content-length']);
    }

    if (file.status === 206 || (range && file.headers['content-range'])) {
        res.status(206);
        if (file.headers['content-range']) res.setHeader('Content-Range', file.headers['content-range']);
    }

    // stop pulling from Drive if the player disconnects (seeking, closing the sheet)
    req?.on?.('close', () => file.data.destroy());

    file.data.on('error', (err) => {
        console.error('Stream error:', err);
        if (!res.headersSent) res.status(500).json({ message: 'Failed to stream file' });
        else res.end();
    });

    file.data.pipe(res);
}

module.exports = { uploadBufferToDrive, deleteFileFromDrive, streamFileFromDrive };