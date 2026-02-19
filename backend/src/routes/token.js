const express = require("express");
const Token = require("../models/Token");
const Shop = require("../models/Shop");
const User = require("../models/User");
const { authMiddleware, requireRole } = require("../middleware/auth");
const {
  createSmartToken,
  getTokenWithDetails,
  updateTokenStatus,
  getQueueAnalytics,
  estimateTravelTime
} = require("../services/tokenService");

const router = express.Router();

/* =========================
   JOIN QUEUE WITH SMART BOOKING
   POST /api/tokens/:shopId/join
========================= */
router.post(
  "/:shopId/join",
  authMiddleware,
  requireRole(["customer"]),
  async (req, res) => {
    try {
      const { shopId } = req.params;
      const {
        location, // { lat, lng, speed, accuracy }
        groupSize = 1,
        priority = 0 // 0 = normal, 1 = VIP
      } = req.body;

      // Validate location data
      if (!location || typeof location.lat !== "number" || typeof location.lng !== "number") {
        return res.status(400).json({
          message: "Valid location data required (lat, lng)",
          code: "INVALID_LOCATION"
        });
      }

      // Create smart token with all calculations
      const token = await createSmartToken({
        shopId,
        customerId: req.user.id,
        location,
        priority,
        groupSize
      });

      // Get detailed token info
      const detailedToken = await getTokenWithDetails(token._id);

      res.status(201).json({
        success: true,
        message: "Token created successfully",
        token: detailedToken
      });
    } catch (err) {
      console.error("❌ Join queue error:", err);
      res.status(500).json({
        message: "Failed to create token",
        error: err.message
      });
    }
  }
);

/* =========================
   LEAVE QUEUE (CANCEL TOKEN)
   POST /api/tokens/:shopId/leave
========================= */
router.post(
  "/:shopId/leave",
  authMiddleware,
  requireRole(["customer"]),
  async (req, res) => {
    try {
      const { shopId } = req.params;

      const result = await Token.updateMany(
        {
          shopId,
          customerId: req.user.id,
          status: "waiting"
        },
        { status: "cancelled" }
      );

      res.json({
        success: true,
        message: "Token cancelled",
        modifiedCount: result.modifiedCount
      });
    } catch (err) {
      console.error("❌ Leave queue error:", err);
      res.status(500).json({ message: "Failed to cancel token" });
    }
  }
);

/* =========================
   GET MY TOKENS (Customer)
   GET /api/tokens/my-tokens
========================= */
router.get("/my-tokens", authMiddleware, requireRole(["customer"]), async (req, res) => {
  try {
    const tokens = await Token.find({
      customerId: req.user.id,
      status: { $in: ["waiting", "called"] }
    })
      .populate("shopId", "name coordinates")
      .sort({ createdAt: -1 });

    const tokensWithDetails = tokens.map((token) => ({
      ...token.toObject(),
      timeUntilArrival:
        token.estimatedArrivalTime &&
        Math.max(0, token.estimatedArrivalTime - new Date()),
      timeRemaining:
        token.estimatedWaitTime &&
        Math.round(token.estimatedWaitTime - (new Date() - token.bookingTime) / 60000)
    }));

    res.json(tokensWithDetails);
  } catch (err) {
    console.error("❌ Get my tokens error:", err);
    res.status(500).json({ message: "Failed to fetch tokens" });
  }
});

/* =========================
   GET SHOP QUEUE
   GET /api/tokens/:shopId
========================= */
router.get("/:shopId", async (req, res) => {
  try {
    const { shopId } = req.params;

    const tokens = await Token.find({
      shopId,
      status: { $in: ["waiting", "called"] }
    })
      .sort({ priority: -1, tokenNumber: 1 })
      .select(
        "tokenNumber status priority groupSize estimatedArrivalTime positionInQueue estimatedWaitTime -customerId"
      );

    res.json({
      success: true,
      count: tokens.length,
      queue: tokens
    });
  } catch (err) {
    console.error("❌ Get shop queue error:", err);
    res.status(500).json({ message: "Failed to fetch queue" });
  }
});

/* =========================
   GET QUEUE ANALYTICS (Shopkeeper)
   GET /api/tokens/:shopId/analytics
========================= */
router.get("/:shopId/analytics", authMiddleware, requireRole(["shopkeeper"]), async (req, res) => {
  try {
    const { shopId } = req.params;

    // Verify shopkeeper owns this shop
    const shop = await Shop.findById(shopId);
    if (shop.ownerId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const analytics = await getQueueAnalytics(shopId);
    res.json(analytics);
  } catch (err) {
    console.error("❌ Queue analytics error:", err);
    res.status(500).json({ message: "Failed to fetch analytics" });
  }
});

/* =========================
   CALL NEXT CUSTOMER (Shopkeeper)
   POST /api/tokens/:shopId/call-next
========================= */
router.post(
  "/:shopId/call-next",
  authMiddleware,
  requireRole(["shopkeeper"]),
  async (req, res) => {
    try {
      const { shopId } = req.params;

      // Verify shopkeeper
      const shop = await Shop.findById(shopId);
      if (shop.ownerId.toString() !== req.user.id.toString()) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      // Check if counters available
      const activeCount = await Token.countDocuments({
        shopId,
        status: "called"
      });

      if (activeCount >= shop.counters) {
        return res.status(400).json({
          message: "All counters are busy",
          activeCount,
          totalCounters: shop.counters
        });
      }

      // Get next token from priority queue
      const nextToken = await Token.findOneAndUpdate(
        {
          shopId,
          status: "waiting"
        },
        {
          status: "called",
          calledNotificationSent: true
        },
        { new: true, sort: { priority: -1, tokenNumber: 1 } }
      );

      if (!nextToken) {
        return res.status(404).json({ message: "No waiting customers" });
      }

      res.json({
        success: true,
        message: "Next customer called",
        token: nextToken
      });
    } catch (err) {
      console.error("❌ Call next error:", err);
      res.status(500).json({ message: "Failed to call next customer" });
    }
  }
);

/* =========================
   UPDATE TOKEN STATUS (Shopkeeper)
   PUT /api/tokens/:tokenId/status
========================= */
router.put("/:tokenId/status", authMiddleware, requireRole(["shopkeeper"]), async (req, res) => {
  try {
    const { tokenId } = req.params;
    const { status } = req.body;

    const validStatuses = ["called", "served", "snoozed", "cancelled", "no-show"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid status",
        validStatuses
      });
    }

    const token = await updateTokenStatus(tokenId, status);
    if (!token) {
      return res.status(404).json({ message: "Token not found" });
    }

    res.json({
      success: true,
      message: "Token status updated",
      token
    });
  } catch (err) {
    console.error("❌ Update token status error:", err);
    res.status(500).json({ message: "Failed to update token status" });
  }
});

/* =========================
   GET TOKEN DETAILS
   GET /api/tokens/:tokenId/details
========================= */
router.get("/:tokenId/details", async (req, res) => {
  try {
    const { tokenId } = req.params;
    const token = await getTokenWithDetails(tokenId);

    if (!token) {
      return res.status(404).json({ message: "Token not found" });
    }

    res.json(token);
  } catch (err) {
    console.error("❌ Get token details error:", err);
    res.status(500).json({ message: "Failed to fetch token details" });
  }
});

/* =========================
   UPDATE LOCATION (Real-time tracking)
   POST /api/tokens/:tokenId/location
========================= */
router.post("/:tokenId/location", authMiddleware, async (req, res) => {
  try {
    const { tokenId } = req.params;
    const { lat, lng, speed, accuracy } = req.body;

    const token = await Token.findById(tokenId);
    if (!token) {
      return res.status(404).json({ message: "Token not found" });
    }

    // Update location
    token.lastLocation = {
      lat,
      lng,
      speed,
      accuracy,
      timestamp: new Date()
    };

    // Recalculate travel time
    const travelInfo = estimateTravelTime(
      { lat, lng, speed },
      token.shopLocation
    );
    token.estimatedTravelTime = travelInfo;

    // Update estimated arrival time
    token.estimatedArrivalTime = new Date(
      Date.now() + travelInfo.seconds * 1000
    );

    await token.save();

    res.json({
      success: true,
      message: "Location updated",
      token
    });
  } catch (err) {
    console.error("❌ Update location error:", err);
    res.status(500).json({ message: "Failed to update location" });
  }
});

module.exports = router;

