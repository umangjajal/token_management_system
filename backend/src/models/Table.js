const mongoose = require("mongoose");

const TableSchema = new mongoose.Schema({
  shopId: { type: mongoose.Schema.Types.ObjectId, ref: "Shop" },
  tableNumber: Number,
  seats: Number,
  isActive: { type: Boolean, default: true }
});

module.exports = mongoose.model("Table", TableSchema);
