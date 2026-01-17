const express = require("express");
const Token = require("../models/Token");
const Shop = require("../models/Shop");
const { authMiddleware, requireRole } = require("../middleware/auth");

const router = express.Router();

// Join queue
router.post(
  "/:shopId/join",
  authMiddleware,
  requireRole(["customer"]),
  async (req, res) => {
    try {
      const { shopId } = req.params;
      const { locationSnapshot } = req.body;
      const shop = await Shop.findById(shopId);
      if (!shop || shop.status !== "approved") {
        return res.status(400).json({ message: "Shop not available" });
      }
      const lastToken = await Token.findOne({ shopId }).sort({ tokenNumber: -1 });
      const nextNumber = lastToken ? lastToken.tokenNumber + 1 : 1;
      const token = await Token.create({
        shopId,
        customerId: req.user.id,
        tokenNumber: nextNumber,
        locationSnapshot
      });
      res.status(201).json(token);
    } catch (err) {
      console.error("Join queue error", err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Leave queue (cancel)
router.post(
  "/:shopId/leave",
  authMiddleware,
  requireRole(["customer"]),
  async (req, res) => {
    const { shopId } = req.params;
    await Token.updateMany(
      { shopId, customerId: req.user.id, status: "waiting" },
      { status: "cancelled" }
    );
    res.json({ ok: true });
  }
);

// Shop queue
router.get("/:shopId", async (req, res) => {
  const { shopId } = req.params;
  const tokens = await Token.find({ shopId }).sort({ tokenNumber: 1 });
  res.json(tokens);
});

// Update token status (shopkeeper)
router.put(
  "/:tokenId/status",
  authMiddleware,
  requireRole(["shopkeeper"]),
  async (req, res) => {
    const { tokenId } = req.params;
    const { status } = req.body;
    const token = await Token.findByIdAndUpdate(
      tokenId,
      { status },
      { new: true }
    );
    res.json(token);
  }
);
router.post("/:id/next", authMiddleware, async (req, res) => {
  const current = await Token.findById(req.params.id);

  if (!current) return res.sendStatus(404);

  const distanceKm =
    current.lastLocation &&
    haversine(current.lastLocation, current.shopLocation);

  if (distanceKm > 2) {
    current.status = "snoozed";
    await current.save();
  } else {
    current.status = "served";
    await current.save();
  }

  const next = await Token.findOne({
    shopId: current.shopId,
    status: "waiting"
  }).sort({ priority: -1, tokenNumber: 1 });

  if (next) {
    next.status = "called";
    await next.save();
  }

  router.put(
  "/call-next/:shopId",
  authMiddleware,
  requireRole(["shopkeeper"]),
  async (req, res) => {
    const shop = await Shop.findById(req.params.shopId);
    const activeCount = await Token.countDocuments({
      shopId: shop._id,
      status: "called"
    });

    if (activeCount >= shop.counters) {
      return res.status(400).json({
        message: "All counters are busy"
      });
    }

    const nextToken = await Token.findOneAndUpdate(
      { shopId: shop._id, status: "waiting" },
      { status: "called" },
      { new: true }
    );

    req.io.to(`shop_${shop._id}`).emit("tokenUpdate", nextToken);

    res.json(nextToken);
  }
);

  res.json({ next });
});


module.exports = router;
