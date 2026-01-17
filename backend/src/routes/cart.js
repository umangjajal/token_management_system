const express = require("express");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const { authMiddleware } = require("../middleware/auth");

const router = express.Router();

router.get("/:shopId", authMiddleware, async (req, res) => {
  let cart = await Cart.findOne({
    userId: req.user.id,
    shopId: req.params.shopId
  });

  if (!cart) {
    cart = await Cart.create({
      userId: req.user.id,
      shopId: req.params.shopId,
      items: []
    });
  }

  const detailedItems = await Promise.all(
    cart.items.map(async i => {
      const p = await Product.findById(i.productId);
      return {
        productId: i.productId,
        name: p.name,
        quantity: i.quantity,
        requiresPrescription: p.verificationStatus === "pending"
      };
    })
  );

  res.json({ items: detailedItems });
});

router.post("/update", authMiddleware, async (req, res) => {
  const { shopId, productId, quantity } = req.body;

  let cart = await Cart.findOne({ userId: req.user.id, shopId });
  if (!cart) {
    cart = await Cart.create({
      userId: req.user.id,
      shopId,
      items: []
    });
  }

  const item = cart.items.find(i => i.productId.equals(productId));
  if (item) item.quantity = quantity;
  else cart.items.push({ productId, quantity });

  await cart.save();
  res.json(cart);
});

module.exports = router;
