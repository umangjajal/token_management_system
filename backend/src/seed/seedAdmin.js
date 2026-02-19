const mongoose = require("mongoose");
const User = require("../models/User");
const dotenv = require("dotenv");

dotenv.config();

/**
 * SEED DEFAULT ADMIN ACCOUNT
 * Run this once to create default admin user
 * 
 * Default Admin Credentials:
 * Email: admin@tokenmanagement.com
 * Password: AdminPass123!
 */

async function seedAdmin() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Database connected");

    // Check if admin already exists
    const existingAdmin = await User.findOne({
      email: "admin@tokenmanagement.com"
    });

    if (existingAdmin) {
      console.log("⚠️  Admin already exists!");
      console.log(`Email: ${existingAdmin.email}`);
      console.log(`Role: ${existingAdmin.role}`);
      console.log(`Active: ${existingAdmin.isActive}`);
      await mongoose.disconnect();
      return;
    }

    // Create default admin
    const adminUser = await User.create({
      name: "System Administrator",
      email: "admin@tokenmanagement.com",
      password: "AdminPass123!", // Will be hashed by pre-save hook
      phone: "+91-0000000000",
      role: "admin",
      adminLevel: "super_admin",
      
      profileCompleted: true,
      emailVerified: true,
      phoneVerified: true,
      isActive: true,
      
      profileData: {
        avatar: null,
        bio: "System Administrator",
        addressLine1: "Admin Office",
        addressLine2: "",
        city: "System",
        state: "Global",
        zipCode: "00000"
      },

      permissions: [
        "manage_users",
        "manage_shops",
        "view_analytics",
        "verify_shops",
        "manage_products",
        "system_settings",
        "view_logs",
        "manage_admins"
      ],

      lastLogin: new Date()
    });

    console.log("✅ Default Admin Created Successfully!");
    console.log("\n📧 Admin Credentials:");
    console.log("================================");
    console.log(`Email:    admin@tokenmanagement.com`);
    console.log(`Password: AdminPass123!`);
    console.log(`Role:     Admin (Super Admin)`);
    console.log("================================");
    console.log("\n🔐 Security Tips:");
    console.log("1. Change password after first login");
    console.log("2. Keep credentials secure");
    console.log("3. Don't share admin account");
    console.log("4. Use separate admin accounts for each admin user");

    await mongoose.disconnect();
    console.log("\n✅ Seed completed");
  } catch (err) {
    console.error("❌ Seed error:", err);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Run seed
seedAdmin();
