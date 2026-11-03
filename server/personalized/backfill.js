// Usage (from your backend root):  node scripts/backfill.js
// 1) re-identifies posts that have no topics or are still 'exploring' with the CURRENT taxonomy
// 2) learns aliases from candidate tags (repeating while it finds more), re-identifying affected posts
// Safe to re-run. Adjust the require paths to your folder layout. The running API picks up new aliases
// within ~10 minutes (taxonomy cache) or after a restart.
require('dotenv').config();
const mongoose = require('mongoose');
const PostMeta = require('../src/models/post.meta');
const { reidentifyPosts } = require('./reidentify-service');
const { runTagLearningCycle } = require('../post_details/tag-learner');

async function main() {
    await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);

    const rows = await PostMeta.find({ $or: [{ topics: { $size: 0 } }, { 'label.state': 'exploring' }] }).select('post').lean();
    console.log(`Re-identifying ${rows.length} posts...`);
    console.log(await reidentifyPosts(rows.map((r) => String(r.post))));

    const result = await runTagLearningCycle({ rounds: 3 });
    console.log('Aliases learned:', result.aliased.map((a) => `${a.tag} -> ${a.slug} (${a.n} posts, purity ${a.purity})`));
    console.log('Proposals for you to review:', result.proposed);

    await mongoose.disconnect();
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});