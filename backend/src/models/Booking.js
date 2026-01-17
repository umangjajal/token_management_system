const mongoose = require("mongoose");

module.exports = mongoose.model(
  "Booking",
  new mongoose.Schema({
    shopId: mongoose.Schema.Types.ObjectId,
    tableId: mongoose.Schema.Types.ObjectId,
    customerId: mongoose.Schema.Types.ObjectId,
    groupSize: Number,
    status: {
      type: String,
      enum: ["booked", "completed", "cancelled"],
      default: "booked"
    }
  })
);
