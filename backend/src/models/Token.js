const mongoose = require("mongoose");

const TokenSchema = new mongoose.Schema(
  {
    shopId: mongoose.Schema.Types.ObjectId,
    customerId: mongoose.Schema.Types.ObjectId,

    tokenNumber: Number,

    status: {
      type: String,
      enum: ["waiting", "called", "served", "snoozed", "cancelled"],
      default: "waiting"
    },

    priority: { type: Number, default: 0 }, // PRIORITY PASS

    groupSize: { type: Number, default: 1 },

    avgServiceTime: { type: Number, default: 300 },

    lastLocation: {
      lat: Number,
      lng: Number,
      speed: Number,
      timestamp: Date
    },

    shopLocation: {
      lat: Number,
      lng: Number
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Token", TokenSchema);
