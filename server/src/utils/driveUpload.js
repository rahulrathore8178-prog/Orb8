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

// Now accepts the incoming req so it can forward Range headers to Drive and
// respond with 206 Partial Content — required for <video> seeking/scrubbing,
// and some mobile browsers will refuse to play a video at all without it.
async function streamFileFromDrive(fileId, res, req) {
    try {
        const range = req?.headers?.range;
        const requestOptions = { responseType: 'stream' };
        if (range) {
            requestOptions.headers = { Range: range };
        }

        const file = await drive.files.get(
            { fileId, alt: 'media' },
            requestOptions
        );

        const contentType = file.headers['content-type'] || 'application/octet-stream';
        res.setHeader('Content-Type', contentType);
        res.setHeader('Accept-Ranges', 'bytes');

        if (file.headers['content-length']) {
            res.setHeader('Content-Length', file.headers['content-length']);
        }

        if (range && file.headers['content-range']) {
            res.status(206);
            res.setHeader('Content-Range', file.headers['content-range']);
        }

        file.data.pipe(res);

        file.data.on('error', (err) => {
            console.error('Stream error:', err);
            if (!res.headersSent) {
                res.status(500).json({ message: 'Failed to stream file' });
            } else {
                res.end();
            }
        });
    } catch (err) {
        console.error('Stream from Drive error:', err);
        throw err;
    }
}

module.exports = { uploadBufferToDrive, deleteFileFromDrive, streamFileFromDrive };