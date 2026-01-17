const express = require("express");
const Product = require("../models/Product");
const { authMiddleware, requireRole } = require("../middleware/auth");

const router = express.Router();

// Admin: list pending products
router.get(
  "/pending",
  authMiddleware,
  requireRole(["admin"]),
  async (req, res) => {
    const products = await Product.find({ verificationStatus: "pending" })
      .populate("shopId")
      .sort({ createdAt: -1 });
    res.json(products);
  }
);

// Admin approve/reject
router.put(
  "/:id/status",
  authMiddleware,
  requireRole(["admin"]),
  async (req, res) => {
    const { status } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        verificationStatus: status,
        isAvailable: status === "approved"
      },
      { new: true }
    );

    res.json(product);
  }
);

module.exports = router;
