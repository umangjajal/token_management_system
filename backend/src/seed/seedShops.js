require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");
const Shop = require("../models/Shop");
const bcrypt = require("bcrypt");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/token_management", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Database connected");
    return conn;
  } catch (err) {
    console.error("❌ Database connection error:", err.message);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    // Create test shopkeepers
    const shopkeepers = [
      {
        name: "John's Salon",
        email: "john.salon@test.com",
        phone: "9876543210",
        password: "ShopPassword123!",
        role: "shopkeeper"
      },
      {
        name: "Sarah's Clinic",
        email: "sarah.clinic@test.com",
        phone: "9876543211",
        password: "ShopPassword123!",
        role: "shopkeeper"
      },
      {
        name: "Mike's Barber Shop",
        email: "mike.barber@test.com",
        phone: "9876543212",
        password: "ShopPassword123!",
        role: "shopkeeper"
      }
    ];

    console.log("\n📝 Creating test shopkeeper accounts...");
    const createdShopkeepers = [];

    for (const shopkeeperData of shopkeepers) {
      // Check if already exists
      let user = await User.findOne({ email: shopkeeperData.email });
      
      if (!user) {
        const hashedPassword = await bcrypt.hash(shopkeeperData.password, 10);
        user = await User.create({
          name: shopkeeperData.name,
          email: shopkeeperData.email,
          phone: shopkeeperData.phone,
          password: hashedPassword,
          role: shopkeeperData.role,
          isEmailVerified: true,
          isPhoneVerified: true
        });
        console.log(`✅ Created shopkeeper: ${user.email}`);
      } else {
        console.log(`⚠️ Shopkeeper already exists: ${user.email}`);
      }
      createdShopkeepers.push(user);
    }

    // Create test shops
    const shopData = [
      {
        name: "John's Premium Hair Salon",
        category: "Salon",
        description: "Professional hair cutting and styling services",
        address: "123 Main Street, Downtown",
        openingHours: "10:00 AM - 8:00 PM",
        contactEmail: "john.salon@test.com",
        contactPhone: "9876543210",
        status: "pending" // Will be approved by admin
      },
      {
        name: "Sarah's Medical Clinic",
        category: "Clinic",
        description: "General medical services and consultations",
        address: "456 Health Avenue, Midtown",
        openingHours: "9:00 AM - 6:00 PM",
        contactEmail: "sarah.clinic@test.com",
        contactPhone: "9876543211",
        status: "pending"
      },
      {
        name: "Mike's Classic Barber",
        category: "Barber Shop",
        description: "Traditional barbering and grooming services",
        address: "789 Grooming Lane, Uptown",
        openingHours: "11:00 AM - 7:00 PM",
        contactEmail: "mike.barber@test.com",
        contactPhone: "9876543212",
        status: "pending"
      }
    ];

    console.log("\n🏪 Creating test shops...");
    let shopsCreated = 0;

    for (let i = 0; i < shopData.length; i++) {
      const shop = shopData[i];
      const shopkeeper = createdShopkeepers[i];

      // Check if shop already exists for this owner
      const existingShop = await Shop.findOne({
        ownerId: shopkeeper._id,
        name: shop.name
      });

      if (!existingShop) {
        await Shop.create({
          ...shop,
          ownerId: shopkeeper._id
        });
        console.log(`✅ Created shop: ${shop.name} (Owner: ${shopkeeper.email})`);
        shopsCreated++;
      } else {
        console.log(`⚠️ Shop already exists: ${shop.name}`);
      }
    }

    console.log("\n📊 Seed Summary:");
    console.log(`✅ Shopkeepers created/verified: ${createdShopkeepers.length}`);
    console.log(`✅ Shops created: ${shopsCreated}`);
    console.log("\n🔐 Test Credentials:");
    createdShopkeepers.forEach((sk) => {
      console.log(`   • Email: ${sk.email}`);
      console.log(`     Password: ShopPassword123!`);
    });
    console.log("\n📋 How to test:");
    console.log("   1. Login as one of the shopkeepers above");
    console.log("   2. Go to Shopkeeper Dashboard");
    console.log("   3. Select the pending shop to manage products");
    console.log("   4. Login as admin (admin@tokenmanagement.com / AdminPass123!)");
    console.log("   5. Go to Admin Dashboard → Shops tab");
    console.log("   6. Approve the pending shops");
    console.log("   7. Check Shopkeeper Dashboard again - shop should be approved");
    console.log("\n✨ All done!");
  } catch (err) {
    console.error("❌ Error during seeding:", err);
    process.exit(1);
  }
};

const main = async () => {
  await connectDB();
  await seedData();
  process.exit(0);
};

main();