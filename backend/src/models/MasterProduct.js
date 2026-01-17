const mongoose = require("mongoose");

const MasterProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: String, required: true }, // grocery, medical, etc
    description: String,
    whyPurchase: String,
    requiresVerification: {
      type: Boolean,
      default: false // TRUE for medicines, injury items
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("MasterProduct", MasterProductSchema);
