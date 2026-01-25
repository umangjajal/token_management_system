const express = require("express");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
import User from "../models/User.js";
const sendEmail = require("../utils/sendEmail");

const router = express.Router();

/* =========================
   JWT HELPER
========================= */
const buildToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET || "supersecretjwt",
    { expiresIn: "7d" }
  );
};

/* =========================
   REGISTER (EMAIL + PASSWORD)
========================= */
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone, role = "customer" } = req.body;

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const emailToken = crypto.randomBytes(32).toString("hex");

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role,
      emailVerifyToken: emailToken,
      emailVerifyExpires: Date.now() + 60 * 60 * 1000 // 1 hour
    });

    const verifyLink = `${process.env.FRONTEND_URL}/verify-email/${emailToken}`;

    await sendEmail(
      email,
      "Verify your email",
      `<p>Click below to verify your email:</p>
       <a href="${verifyLink}">${verifyLink}</a>`
    );

    res.json({
      message: "Registration successful. Please verify your email."
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Registration failed" });
  }
});

/* =========================
   LOGIN (EMAIL + PASSWORD)
========================= */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const ok = await user.comparePassword(password);
    if (!ok) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = buildToken(user);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* =========================
   GOOGLE AUTH
========================= */
router.post("/google", async (req, res) => {
  try {
    const { email, name, googleId } = req.body;

    if (!email || !googleId) {
      return res.status(400).json({ message: "Invalid Google data" });
    }

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name,
        email,
        googleId,
        role: "customer",
        profileCompleted: false
      });
    }

    const token = buildToken(user);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        role: user.role,
        profileCompleted: user.profileCompleted
      }
    });
  } catch (err) {
    console.error("Google auth error:", err);
    res.status(500).json({ message: "Google authentication failed" });
  }
});

/* =========================
   SEND PHONE OTP
========================= */
router.post("/send-otp", async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.phoneOtp = otp;
    user.phoneOtpExpires = Date.now() + 5 * 60 * 1000;
    await user.save();

    const client = require("../utils/twilio");

    await client.messages.create({
      body: `Your TMS verification code is ${otp}`,
      from: process.env.TWILIO_PHONE,
      to: user.phone
    });

    res.json({ message: "OTP sent" });
  } catch (err) {
    console.error("OTP send error:", err);
    res.status(500).json({ message: "OTP failed" });
  }
});

/* =========================
   VERIFY PHONE OTP
========================= */
router.post("/verify-otp", async (req, res) => {
  try {
    const { userId, otp } = req.body;

    const user = await User.findOne({
      _id: userId,
      phoneOtp: otp,
      phoneOtpExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.phoneVerified = true;
    user.phoneOtp = undefined;
    user.phoneOtpExpires = undefined;

    await user.save();

    res.json({ message: "Phone verified successfully" });
  } catch (err) {
    console.error("OTP verify error:", err);
    res.status(500).json({ message: "OTP verification failed" });
  }
});

module.exports = router;
