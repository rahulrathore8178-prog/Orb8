require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/user.model'); // adjust to your real model path

(async () => {
    await mongoose.connect(process.env.MONGO_URI); // use the variable name from your .env
    const users = await User.find({ profilePic: /^https?:\/\// });
    let updated = 0;
    for (const u of users) {
        const path = u.profilePic.replace(/^https?:\/\/[^/]+/, '');
        if (path.startsWith('/uploads/')) {
            u.profilePic = path;
            await u.save();
            updated++;
        }
    }
    console.log(`Updated ${updated} of ${users.length} users`);
    process.exit(0);
})();