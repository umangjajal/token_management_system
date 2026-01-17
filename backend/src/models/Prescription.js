const mongoose = require("mongoose");

module.exports = mongoose.model(
  "Prescription",
  new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    productId: mongoose.Schema.Types.ObjectId,
    imageUrl: String,
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    }
  })
);
