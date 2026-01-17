const mongoose = require("mongoose");

const ShopSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    description: String,
    coordinates: {
      lat: Number,
      lng: Number
    },
    address: String,
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    },
    counters: {
      type: Number,
      default: 1
    },
    openingHours: String,

    // New “proper business” details
    businessRegistrationNumber: String,
    gstNumber: String,
    contactEmail: String,
    contactPhone: String,
    website: String
  },
  { timestamps: true }
);

module.exports = mongoose.model("Shop", ShopSchema);
