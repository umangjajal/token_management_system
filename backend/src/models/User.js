const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    phone: String,
    password: String,

    role: {
      type: String,
      enum: ["customer", "shopkeeper", "admin"],
      default: "customer"
    },

    emailVerified: { type: Boolean, default: false },
    phoneVerified: { type: Boolean, default: false },

    // Role-based additional fields
    profileCompleted: { type: Boolean, default: false },
    profileData: {
      avatar: String,
      bio: String,
      addressLine1: String,
      addressLine2: String,
      city: String,
      state: String,
      zipCode: String
    },

    // Customer-specific
    preferences: {
      notificationsEnabled: { type: Boolean, default: true },
      preferredShops: [mongoose.Schema.Types.ObjectId]
    },

    // Shopkeeper-specific
    shopId: mongoose.Schema.Types.ObjectId,
    businessDetails: {
      businessName: String,
      businessType: String,
      gstNumber: String,
      businessRegistrationNumber: String,
      openingHours: String,
      closingHours: String,
      counters: { type: Number, default: 1 }
    },

    // Admin-specific
    permissions: [String], // e.g., ["manage_users", "manage_shops", "view_analytics"]
    adminLevel: {
      type: String,
      enum: ["super_admin", "admin", "moderator"],
      default: "admin"
    },

    googleId: String,
    lastLogin: Date,
    isActive: { type: Boolean, default: true },
    loginAttempts: { type: Number, default: 0 },
    lockUntil: Date
  },
  { timestamps: true }
);

// password hash
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// password compare
UserSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

module.exports = mongoose.model("User", UserSchema);
