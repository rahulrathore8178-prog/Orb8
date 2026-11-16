const express = require("express");
const User = require("../models/user.model");
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

router.post("/user/device-token", protect, async (req, res) => {
  try {
    const { token } = req.body;

    const normalizedToken = typeof token === "string" ? token.trim() : "";
    if (!normalizedToken || normalizedToken.length > 4096) {
      return res.status(400).json({ message: "Invalid push token" });
    }

    await User.updateMany(
      { deviceTokens: normalizedToken, _id: { $ne: req.user.id } },
      { $pull: { deviceTokens: normalizedToken } }
    );
    await User.updateOne(
      { _id: req.user.id },
      { $pull: { deviceTokens: normalizedToken } }
    );
    await User.updateOne(
      { _id: req.user.id },
      { $push: { deviceTokens: { $each: [normalizedToken], $slice: -10 } } }
    );

    return res.json({ success: true });
  } catch (error) {
    console.error("Failed to save Firebase device token:", error);
    return res.status(500).json({ message: "Failed to save device token" });
  }
});

module.exports = router;