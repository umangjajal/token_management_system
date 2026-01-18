const express = require("express");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");
const router = express.Router();

const buildToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET || "supersecretjwt",
    { expiresIn: "30d" }
  );
};

router.post("/register", async (req, res) => {
  const { name, email, password, phone } = req.body;

  const emailToken = crypto.randomBytes(32).toString("hex");

  const user = await User.create({
    name,
    email,
    password,
    phone,
    emailVerifyToken: emailToken,
    emailVerifyExpires: Date.now() + 1000 * 60 * 60 // 1 hour
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
});
router.post("/send-otp", async (req, res) => {
  const { userId } = req.body;

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  const user = await User.findById(userId);
  user.phoneOtp = otp;
  user.phoneOtpExpires = Date.now() + 5 * 60 * 1000; // 5 min
  await user.save();

  const client = require("../utils/twilio");

  await client.messages.create({
    body: `Your TMS verification code is ${otp}`,
    from: process.env.TWILIO_PHONE,
    to: user.phone
  });

  res.json({ message: "OTP sent" });
});

router.post("/verify-otp", async (req, res) => {
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
});

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
        isEmailVerified: true
      });
    }
    else if (!user) {
      user = await User.create({
        name,
        email,
        googleId,
        role: "Shopkeeper",
        isEmailVerified: true
      });
    }
    else if (!user) {
      user = await User.create({
        name,
        email,
        googleId,
        role: "Admin",
        isEmailVerified: true
      });
    }

    const token = user.generateJWT();

    res.json({ token, user });
  } catch (err) {
    console.error("Google auth error:", err);
    res.status(500).json({ message: "Google authentication failed" });
  }
});

const token = jwt.sign(
  { id: user._id, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: "7d" }
);

res.json({ token, user });

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });
    const ok = await user.comparePassword(password);
    if (!ok) return res.status(400).json({ message: "Invalid credentials" });
    const token = buildToken(user);
    res.json({
      token,
      user: { id: user._id, role: user.role, name: user.name, email: user.email }
    });
  } catch (err) {
    console.error("Login error", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
