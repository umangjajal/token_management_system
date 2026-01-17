const express = require("express");
const Shop = require("../models/Shop");
const { authMiddleware, requireRole } = require("../middleware/auth");

const router = express.Router();

/**
 * PUBLIC:
 * GET /api/shops
 * List approved shops (customers see only approved)
 */
router.get("/", async (req, res) => {
  const shops = await Shop.find({ status: "approved" })
    .sort({ createdAt: -1 })
    .limit(50);
  res.json(shops);
});

/**
 * ADMIN:
 * GET /api/shops/all
 * List all shops (pending, approved, rejected)
 */
router.get(
  "/all",
  authMiddleware,
  requireRole(["admin"]),
  async (req, res) => {
    const shops = await Shop.find({})
      .sort({ createdAt: -1 })
      .limit(200);
    res.json(shops);
  }
);

/**
 * SHOPKEEPER:
 * GET /api/shops/mine
 * List shops owned by the logged-in shopkeeper
 */
router.get(
  "/mine",
  authMiddleware,
  requireRole(["shopkeeper"]),
  async (req, res) => {
    const shops = await Shop.find({ ownerId: req.user.id }).sort({
      createdAt: -1
    });
    res.json(shops);
  }
);

/**
 * PUBLIC:
 * GET /api/shops/:id
 * Get single shop details
 */
router.get("/:id", async (req, res) => {
  const shop = await Shop.findById(req.params.id);
  if (!shop) return res.status(404).json({ message: "Shop not found" });
  res.json(shop);
});

/**
 * SHOPKEEPER:
 * POST /api/shops
 * Create a new shop (goes into "pending" status by default)
 */
router.post(
  "/",
  authMiddleware,
  requireRole(["shopkeeper"]),
  async (req, res) => {
    try {
      const {
        name,
        category,
        description,
        coordinates,
        address,
        openingHours,
        businessRegistrationNumber,
        gstNumber,
        contactEmail,
        contactPhone,
        website
      } = req.body;

      if (!name || !category) {
        return res.status(400).json({ message: "Name and category are required" });
      }

      const shop = await Shop.create({
        ownerId: req.user.id,
        name,
        category,
        description,
        coordinates,
        address,
        openingHours,
        status: "pending",
        businessRegistrationNumber,
        gstNumber,
        contactEmail,
        contactPhone,
        website
      });

      res.status(201).json(shop);
    } catch (err) {
      console.error("Create shop error", err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

/**
 * ADMIN:
 * PUT /api/shops/:id/status
 * Approve / reject a shop
 */
router.put(
  "/:id/status",
  authMiddleware,
  requireRole(["admin"]),
  async (req, res) => {
    const { status } = req.body;
    if (!["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    const shop = await Shop.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!shop) {
      return res.status(404).json({ message: "Shop not found" });
    }
    res.json(shop);
  }
);

module.exports = router;
