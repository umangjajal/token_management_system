const express = require("express");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");

const router = express.Router();

/* =========================
   CONSTANTS
========================= */
const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME = 15 * 60 * 1000; // 15 minutes

/* =========================
   JWT HELPER WITH ROLE & PERMISSIONS
========================= */
const buildToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      email: user.email,
      permissions: user.permissions || []
    },
    process.env.JWT_SECRET || "supersecretjwt",
    { expiresIn: "7d" }
  );
};

/* =========================
   VALIDATE ROLE FOR REGISTRATION
========================= */
const validateRole = (role) => {
  return ["customer", "shopkeeper", "admin"].includes(role);
};

/* =========================
   VALIDATE PASSWORD STRENGTH
========================= */
const validatePassword = (password) => {
  if (password.length < 8) {
    return { valid: false, message: "Password must be at least 8 characters" };
  }
  if (!/[A-Z]/.test(password)) {
    return {
      valid: false,
      message: "Password must contain at least one uppercase letter"
    };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: "Password must contain at least one number" };
  }
  return { valid: true };
};

/* =========================
   REGISTER (EMAIL + PASSWORD + ROLE)
   ⚠️  ADMIN ROLE CANNOT SELF-REGISTER
========================= */
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone, role = "customer" } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email, and password are required"
      });
    }

    // ✨ BLOCK ADMIN SELF-REGISTRATION
    if (role === "admin") {
      return res.status(403).json({
        message: "Admin accounts cannot be self-registered",
        code: "ADMIN_SIGNUP_BLOCKED",
        solution: "Contact system administrator to create admin account",
        adminEmail: "admin@tokenmanagement.com"
      });
    }

    if (!["customer", "shopkeeper"].includes(role)) {
      return res.status(400).json({
        message: "Invalid role. Must be: customer or shopkeeper"
      });
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return res.status(400).json(passwordValidation);
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({
        message: "Email already registered",
        code: "EMAIL_EXISTS"
      });
    }

    // Generate email verification token
    const emailToken = crypto.randomBytes(32).toString("hex");

    // Create user with role-based defaults
    const userData = {
      name,
      email,
      password,
      phone,
      role,
      profileCompleted: false,
      isActive: true,
      emailVerified: false,
      phoneVerified: false,
      lastLogin: null,
      loginAttempts: 0
    };

    // Set role-specific default permissions
    if (role === "admin") {
      userData.permissions = [
        "manage_users",
        "manage_shops",
        "view_analytics",
        "verify_shops",
        "manage_products"
      ];
    } else if (role === "shopkeeper") {
      userData.permissions = ["manage_own_shop", "manage_queue", "view_analytics"];
    }

    const user = await User.create(userData);

    // Send verification email
    const verifyLink = `${process.env.FRONTEND_URL}/verify-email/${emailToken}`;
    await sendEmail(
      email,
      "Verify Your Email - Token Management System",
      `<h2>Email Verification</h2>
       <p>Hello ${name},</p>
       <p>Thank you for registering as a <strong>${role}</strong>.</p>
       <p>Click the link below to verify your email:</p>
       <a href="${verifyLink}" style="display:inline-block; padding:10px 20px; background:#007bff; color:white; text-decoration:none; border-radius:5px;">
         Verify Email
       </a>
       <p>Or copy this link: ${verifyLink}</p>
       <p>This link expires in 1 hour.</p>`
    );

    res.status(201).json({
      success: true,
      message: `Registration successful. Please verify your email to activate your ${role} account.`,
      requiresVerification: true,
      role
    });
  } catch (err) {
    console.error("❌ Register error:", err);
    res.status(500).json({
      message: "Registration failed",
      error: err.message
    });
  }
});

/* =========================
   LOGIN (EMAIL + PASSWORD) WITH ROLE VERIFICATION
========================= */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    const user = await User.findOne({ email });

    // Check if user exists
    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
        code: "INVALID_CREDENTIALS"
      });
    }

    // Check if account is locked due to too many login attempts
    if (user.lockUntil && user.lockUntil > new Date()) {
      const remainingTime = Math.ceil(
        (user.lockUntil - new Date()) / 1000 / 60
      );
      return res.status(403).json({
        message: `Account locked due to multiple failed attempts. Try again in ${remainingTime} minutes.`,
        code: "ACCOUNT_LOCKED",
        lockUntil: user.lockUntil
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({
        message: "Account has been disabled",
        code: "ACCOUNT_DISABLED"
      });
    }

    // Verify password
    const passwordMatch = await user.comparePassword(password);
    if (!passwordMatch) {
      // Increment failed login attempts
      user.loginAttempts = (user.loginAttempts || 0) + 1;

      if (user.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
        user.lockUntil = new Date(Date.now() + LOCK_TIME);
        await user.save();
        return res.status(403).json({
          message: "Account locked due to multiple failed login attempts",
          code: "ACCOUNT_LOCKED",
          lockUntil: user.lockUntil
        });
      }

      await user.save();
      return res.status(401).json({
        message: "Invalid email or password",
        code: "INVALID_CREDENTIALS",
        attempts: user.loginAttempts,
        attemptsRemaining: MAX_LOGIN_ATTEMPTS - user.loginAttempts
      });
    }

    // Check email verification (optional, can be enforced)
    if (!user.emailVerified && process.env.REQUIRE_EMAIL_VERIFICATION === "true") {
      return res.status(403).json({
        message: "Please verify your email before logging in",
        code: "EMAIL_NOT_VERIFIED",
        userId: user._id
      });
    }

    // Reset login attempts on successful login
    user.loginAttempts = 0;
    user.lockUntil = null;
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = buildToken(user);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profileCompleted: user.profileCompleted,
        permissions: user.permissions,
        avatar: user.profileData?.avatar
      }
    });
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({
      message: "Login failed",
      error: err.message
    });
  }
});

/* =========================
   GOOGLE AUTH WITH ROLE SELECTION
   ⚠️  ADMIN ROLE CANNOT SELF-REGISTER
========================= */
router.post("/google", async (req, res) => {
  try {
    const { email, name, googleId, role = "customer" } = req.body;

    if (!email || !googleId) {
      return res.status(400).json({
        message: "Invalid Google data"
      });
    }

    // ✨ BLOCK ADMIN SELF-REGISTRATION VIA GOOGLE
    if (role === "admin") {
      return res.status(403).json({
        message: "Admin accounts cannot be self-registered via Google",
        code: "ADMIN_SIGNUP_BLOCKED",
        solution: "Contact system administrator to create admin account",
        adminEmail: "admin@tokenmanagement.com"
      });
    }

    if (!["customer", "shopkeeper"].includes(role)) {
      return res.status(400).json({
        message: "Invalid role. Must be: customer or shopkeeper"
      });
    }

    let user = await User.findOne({ email });

    if (!user) {
      // Create new user from Google data with AUTO-PROFILE CREATION
      const userData = {
        name,
        email,
        googleId,
        role,
        profileCompleted: true, // ✨ Profile auto-created with Google data
        emailVerified: true, // Google emails are verified
        phoneVerified: false, // Phone still needs verification
        isActive: true,
        lastLogin: new Date(),
        loginAttempts: 0,

        // ✨ AUTO-FILL PROFILE DATA FROM GOOGLE
        profileData: {
          avatar: null, // Can be fetched from Google profile image if needed
          bio: "Joined via Google",
          addressLine1: "",
          addressLine2: "",
          city: "",
          state: "",
          zipCode: ""
        },

        // ✨ ROLE-SPECIFIC AUTO-INITIALIZATION
        ...(role === "customer" && {
          preferences: {
            notificationsEnabled: true,
            preferredShops: []
          }
        }),

        ...(role === "shopkeeper" && {
          businessDetails: {
            businessName: "",
            businessType: "",
            gstNumber: "",
            businessRegistrationNumber: "",
            openingHours: "",
            closingHours: "",
            counters: 1
          }
        }),

        ...(role === "admin" && {
          adminLevel: "admin"
        })
      };

      // Set role-specific permissions
      if (role === "admin") {
        userData.permissions = [
          "manage_users",
          "manage_shops",
          "view_analytics",
          "verify_shops",
          "manage_products"
        ];
      } else if (role === "shopkeeper") {
        userData.permissions = [
          "manage_own_shop",
          "manage_queue",
          "view_analytics"
        ];
      } else if (role === "customer") {
        userData.permissions = ["view_queue"];
      }

      user = await User.create(userData);

      console.log(`✅ New ${role} account created via Google: ${email}`);
    } else {
      // Update existing user
      user.lastLogin = new Date();
      user.googleId = user.googleId || googleId;
      
      // If profile wasn't completed before, auto-complete it now
      if (!user.profileCompleted) {
        user.profileCompleted = true;
        if (!user.profileData) {
          user.profileData = {
            avatar: null,
            bio: "Joined via Google",
            addressLine1: "",
            addressLine2: "",
            city: "",
            state: "",
            zipCode: ""
          };
        }
      }
      
      await user.save();
      console.log(`✅ Existing user logged in via Google: ${email}`);
    }

    const token = buildToken(user);

    res.json({
      success: true,
      message: `Welcome ${user.name}! Your ${user.role} profile is ready to use.`,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profileCompleted: user.profileCompleted, // ✨ Always true for Google auth
        profileData: user.profileData,
        businessDetails: user.businessDetails,
        preferences: user.preferences,
        permissions: user.permissions,
        avatar: user.profileData?.avatar,
        profileStatus: "READY" // ✨ Indicates profile is pre-created
      }
    });
  } catch (err) {
    console.error("❌ Google auth error:", err);
    res.status(500).json({
      message: "Google authentication failed",
      error: err.message
    });
  }
});

/* =========================
   SEND PHONE OTP
========================= */
router.post("/send-otp", async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({
        message: "Phone number is required"
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // In production, send SMS via Twilio
    // For now, log it
    console.log(`📱 OTP for ${phoneNumber}: ${otp}`);

    res.json({
      success: true,
      message: "OTP sent to your phone number",
      // Remove in production - only for testing
      ...(process.env.NODE_ENV === "development" && { otp })
    });
  } catch (err) {
    console.error("❌ OTP send error:", err);
    res.status(500).json({
      message: "Failed to send OTP"
    });
  }
});

/* =========================
   VERIFY PHONE OTP
========================= */
router.post("/verify-otp", async (req, res) => {
  try {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
      return res.status(400).json({
        message: "User ID and OTP are required"
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    // In production, verify against stored OTP
    // For now, accept any 6-digit code
    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        message: "Invalid OTP format"
      });
    }

    user.phoneVerified = true;
    await user.save();

    res.json({
      success: true,
      message: "Phone verified successfully"
    });
  } catch (err) {
    console.error("❌ OTP verify error:", err);
    res.status(500).json({
      message: "OTP verification failed"
    });
  }
});

/* =========================
   VERIFY EMAIL
========================= */
router.get("/verify-email/:token", async (req, res) => {
  try {
    const { token } = req.params;

    // In production, verify the token hash
    const user = await User.findOne({
      emailVerifyToken: token,
      emailVerifyExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired verification link"
      });
    }

    user.emailVerified = true;
    user.emailVerifyToken = undefined;
    user.emailVerifyExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: "Email verified successfully. You can now log in."
    });
  } catch (err) {
    console.error("❌ Email verify error:", err);
    res.status(500).json({
      message: "Email verification failed"
    });
  }
});

module.exports = router;
