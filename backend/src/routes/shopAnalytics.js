const express = require("express");
const Token = require("../models/Token");
const { authMiddleware, requireRole } = require("../middleware/auth");

const router = express.Router();

router.get(
  "/best-sellers/:shopId",
  authMiddleware,
  requireRole(["shopkeeper"]),
  async (req, res) => {
    const data = await Token.aggregate([
      { $match: { shopId: req.params.shopId } },
      { $unwind: "$products" },
      {
        $group: {
          _id: "$products.productId",
          sold: { $sum: "$products.quantity" }
        }
      },
      { $sort: { sold: -1 } },
      { $limit: 10 }
    ]);

    res.json(data);
  }
);

module.exports = router;
