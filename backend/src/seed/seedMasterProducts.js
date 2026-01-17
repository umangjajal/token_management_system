const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const MasterProduct = require("../models/MasterProduct");

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const categories = {
  grocery: 200,
  medical: 200,
  general: 200,
  electrical: 150,
  restaurant: 150,
  live_items: 100
};

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Mongo connected");

  for (const [category, count] of Object.entries(categories)) {
    for (let i = 1; i <= count; i++) {
      const name = `${category} product ${i}`;

      const exists = await MasterProduct.findOne({ name, category });
      if (exists) continue;

      await MasterProduct.create({
        name,
        category,
        requiresVerification:
          category === "medical" || category === "live_items",
        description: `Standard ${name}`,
        whyPurchase: `Frequently purchased ${category} item`
      });
    }
  }

  console.log("✅ 1000+ master products seeded");
  process.exit(0);
}

seed();
