const express = require("express");
const User = require("../models/user.model");
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

router.post("/user/device-token", protect, async (req, res) => {
  try {
    const { token } = req.body;

    if (typeof token !== "string" || !token.trim()) {
      return res.status(400).json({ message: "Token is required" });
    }

    await User.findByIdAndUpdate(req.user.id, {
      $addToSet: { deviceTokens: token.trim() },
    });

    return res.json({ success: true });
  } catch (error) {
    console.error("Failed to save Firebase device token:", error);
    return res.status(500).json({ message: "Failed to save device token" });
  }
});

module.exports = router;