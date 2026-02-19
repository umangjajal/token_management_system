const express = require("express");
const Shop = require("../models/Shop");
const { authMiddleware, requireRole } = require("../middleware/auth");

const router = express.Router();

/**
 * DIAGNOSTIC:
 * GET /api/shops/diagnostic/count
 * Check total shops in database (no auth required - for debugging)
 */
router.get("/diagnostic/count", async (req, res) => {
  try {
    const totalShops = await Shop.countDocuments();
    const pendingShops = await Shop.countDocuments({ status: "pending" });
    const approvedShops = await Shop.countDocuments({ status: "approved" });
    const rejectedShops = await Shop.countDocuments({ status: "rejected" });

    const allShops = await Shop.find({})
      .populate("ownerId", "name email phone")
      .select("_id name category status ownerId");

    console.log("🔍 DIAGNOSTIC REPORT:");
    console.log(`   Total Shops: ${totalShops}`);
    console.log(`   Pending: ${pendingShops}`);
    console.log(`   Approved: ${approvedShops}`);
    console.log(`   Rejected: ${rejectedShops}`);
    console.log("   Shop Details:", JSON.stringify(allShops, null, 2));

    res.json({
      total: totalShops,
      pending: pendingShops,
      approved: approvedShops,
      rejected: rejectedShops,
      shops: allShops
    });
  } catch (err) {
    console.error("❌ Diagnostic error:", err);
    res.status(500).json({ message: "Diagnostic failed", error: err.message });
  }
});

/**
 * PUBLIC:
 * GET /api/shops
 * List approved shops (customers see only approved)
 */
router.get("/", async (req, res) => {
  try {
    const shops = await Shop.find({ status: "approved" })
      .populate("ownerId", "name email phone")
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(shops);
  } catch (err) {
    console.error("Error fetching approved shops:", err);
    res.status(500).json({ message: "Failed to fetch shops", error: err.message });
  }
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
    try {
      console.log(`\n🔐 [ADMIN REQUEST] User ID: ${req.user.id}, Role: ${req.user.role}`);
      
      const shops = await Shop.find({})
        .populate("ownerId", "name email phone")
        .sort({ createdAt: -1 })
        .limit(200);
      
      console.log(`✅ [ADMIN] Successfully fetched ${shops.length} shops`);
      console.log(`   Details: ${shops.map(s => `${s.name} (${s.status})`).join(", ")}`);
      
      res.json(shops);
    } catch (err) {
      console.error("❌ [ADMIN] Error fetching shops:", err);
      res.status(500).json({ message: "Failed to fetch shops", error: err.message });
    }
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
    try {
      console.log(`[SHOPKEEPER-MINE] Fetching shops for user: ${req.user.id}`);
      const shops = await Shop.find({ ownerId: req.user.id }).sort({
        createdAt: -1
      });
      console.log(`[SHOPKEEPER-MINE] Found ${shops.length} shops for this user`);
      res.json(shops);
    } catch (err) {
      console.error("[SHOPKEEPER-MINE] Error fetching shops:", err);
      res.status(500).json({ message: "Failed to fetch shops", error: err.message });
    }
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

      console.log(`\n🏪 [SHOP-CREATE-START] User: ${req.user.id}, Role: ${req.user.role}`);
      console.log(`   Name: ${name}`);
      console.log(`   Category: ${category}`);
      console.log(`   Address: ${address}`);

      if (!name || !category) {
        console.log(`❌ [SHOP-CREATE] Missing required fields (name or category)`);
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

      console.log(`✅ [SHOP-CREATE-SUCCESS] Shop Created:`);
      console.log(`   ID: ${shop._id}`);
      console.log(`   Status: ${shop.status}`);
      console.log(`   Owner: ${shop.ownerId}`);
      console.log(`   Created At: ${shop.createdAt}`);
      
      // Verify it can be read back
      const verify = await Shop.findById(shop._id);
      console.log(`✓ [SHOP-CREATE-VERIFY] Shop can be read back: ${verify ? "YES" : "NO"}`);

      res.status(201).json(shop);
    } catch (err) {
      console.error("❌ [SHOP-CREATE-ERROR]", err);
      res.status(500).json({ message: "Server error", error: err.message });
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
    try {
      const { status } = req.body;
      console.log(`\n🔄 [SHOP-STATUS-UPDATE] Admin: ${req.user.id}, Shop: ${req.params.id}, New Status: ${status}`);

      if (!["pending", "approved", "rejected"].includes(status)) {
        console.log(`❌ [SHOP-STATUS-UPDATE] Invalid status: ${status}`);
        return res.status(400).json({ message: "Invalid status" });
      }

      const shop = await Shop.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
      );

      if (!shop) {
        console.log(`❌ [SHOP-STATUS-UPDATE] Shop not found: ${req.params.id}`);
        return res.status(404).json({ message: "Shop not found" });
      }

      console.log(`✅ [SHOP-STATUS-UPDATE] Status updated to: ${status}`);
      res.json(shop);
    } catch (err) {
      console.error("❌ [SHOP-STATUS-UPDATE] Error:", err);
      res.status(500).json({ message: "Failed to update status", error: err.message });
    }
  }
);

module.exports = router;
