// SAME order on every server and in the app. Order = priority.
const POOL = [
    { id: 's1', url: 'https://orb8-0kmr.onrender.com' },
    { id: 's2', url: 'https://orb8-6bfm.onrender.com' },
    { id: 's3', url: 'https://orb8-oeih.onrender.com' },
    { id: 's4', url: 'https://orb8.onrender.com' },
];

const GB = 1024 ** 3;
const numberFromEnv = (name, fallback) => {
    const value = Number.parseFloat(process.env[name] || '');
    return Number.isFinite(value) && value > 0 ? value : fallback;
};

function hostname(value) {
    if (!value) return '';
    try {
        return new URL(value.includes('://') ? value : `https://${value}`).hostname.toLowerCase();
    } catch {
        return String(value).trim().toLowerCase().split('/')[0].split(':')[0];
    }
}

function resolveServerId() {
    if (process.env.SERVER_ID?.trim()) return process.env.SERVER_ID.trim();

    const candidates = [
        process.env.RENDER_EXTERNAL_HOSTNAME,
        process.env.RENDER_EXTERNAL_URL,
        process.env.PUBLIC_API_URL,
        process.env.BACKEND_URL,
        process.env.RENDER_SERVICE_NAME,
    ].map(hostname).filter(Boolean);

    const match = POOL.find((server) => {
        const poolHost = hostname(server.url);
        return candidates.includes(poolHost) || candidates.some((candidate) => candidate === poolHost.split('.')[0]);
    });
    if (match) return match.id;

    // Local development has one backend and can safely use the primary entry.
    if (process.env.NODE_ENV !== 'production') return 's1';
    return undefined;
}

module.exports = {
    POOL,
    SERVER_ID: resolveServerId(),
    // Move traffic before the provider's 4.5 GB ceiling, then refuse this server.
    SOFT_LIMIT_BYTES: Math.floor(numberFromEnv('SOFT_LIMIT_GB', 4.2) * GB),
    HARD_LIMIT_BYTES: Math.floor(numberFromEnv('HARD_LIMIT_GB', 4.5) * GB),
    DISABLED: new Set((process.env.DISABLED_SERVERS || '').split(',').filter(Boolean)), // manual kill switch
};