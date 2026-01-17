const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    shopId: { type: mongoose.Schema.Types.ObjectId, ref: "Shop", required: true },

    masterProductId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MasterProduct",
      default: null
    },

    name: { type: String, required: true },
    price: { type: Number, required: true },
    unit: { type: String, default: "pcs" },
    stock: { type: Number, default: 0 },

    image: {
      type: String, // URL
      default: ""
    },

    description: String,
    whyPurchase: String,

    isAvailable: { type: Boolean, default: true },

    verificationStatus: {
      type: String,
      enum: ["approved", "pending", "rejected"],
      default: "approved"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", ProductSchema);
