const express = require("express");
const User = require("../models/User");
const { authMiddleware } = require("../middleware/auth");

const router = express.Router();

/* =========================
   GET CURRENT USER PROFILE
   GET /api/user/profile
========================= */
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "-password -emailVerifyToken -emailVerifyExpires -phoneOtp -phoneOtpExpires"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.error("❌ Get profile error:", err);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
});

/* =========================
   UPDATE PROFILE
   PUT /api/user/profile
   (Used after Google login or profile edit)
========================= */
router.put("/profile", authMiddleware, async (req, res) => {
  try {
    const { name, phone } = req.body;

    // Basic validation
    if (!name || !phone) {
      return res.status(400).json({
        message: "Name and phone number are required"
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        name,
        phone,
        profileCompleted: true
      },
      {
        new: true,
        runValidators: true
      }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "Profile updated successfully",
      user: updatedUser
    });
  } catch (err) {
    console.error("❌ Update profile error:", err);
    res.status(500).json({ message: "Profile update failed" });
  }
});

module.exports = router;
