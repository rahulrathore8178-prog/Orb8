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

module.exports = {
    POOL,
    SERVER_ID: process.env.SERVER_ID,
    // Move traffic before the provider's 4.5 GB ceiling, then refuse this server.
    SOFT_LIMIT_BYTES: Math.floor(numberFromEnv('SOFT_LIMIT_GB', 4.2) * GB),
    HARD_LIMIT_BYTES: Math.floor(numberFromEnv('HARD_LIMIT_GB', 4.5) * GB),
    DISABLED: new Set((process.env.DISABLED_SERVERS || '').split(',').filter(Boolean)), // manual kill switch
};