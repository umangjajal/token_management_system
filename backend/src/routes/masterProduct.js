const express = require("express");
const MasterProduct = require("../models/MasterProduct");
const { authMiddleware, requireRole } = require("../middleware/auth");

const router = express.Router();

// Search common products
router.get(
  "/search",
  authMiddleware,
  requireRole(["shopkeeper"]),
  async (req, res) => {
    const { q } = req.query;

    const products = await MasterProduct.find({
      name: { $regex: q, $options: "i" }
    }).limit(20);

    res.json(products);
  }
);

module.exports = router;
