// Usage: node scripts/seedTopics.js
// Safe to re-run: upserts by slug and never touches 'candidate' topics.
require('dotenv').config();
const mongoose = require('mongoose');
const Topic = require('../src/models/topic.model');
const seed = require('./topic.seed');

async function main() {
    await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);

    const ops = seed.map((t) => ({
        updateOne: {
            filter: { slug: t.slug },
            update: { $set: { ...t, status: 'active' } },
            upsert: true,
        },
    }));

    const res = await Topic.bulkWrite(ops, { ordered: false });
    console.log(`Topics seeded: ${res.upsertedCount} new, ${res.modifiedCount} updated, ${seed.length} total`);
    await mongoose.disconnect();
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});