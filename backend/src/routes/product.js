const express = require("express");
const Product = require("../models/Product");
const Shop = require("../models/Shop");
const MasterProduct = require("../models/MasterProduct");
const { authMiddleware, requireRole } = require("../middleware/auth");
const multer = require("multer");
const path = require("path");

const router = express.Router();

/* ============================
   FILE UPLOAD CONFIG
============================ */
const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, "uploads/products"),
  filename: (_, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files allowed"));
    }
    cb(null, true);
  }
});

/* ============================
   HELPERS
============================ */
async function ensureShopOwner(userId, shopId) {
  return Shop.findOne({ _id: shopId, ownerId: userId });
}

/* ============================
   SHOPKEEPER: GET PRODUCTS
============================ */
router.get(
  "/:shopId",
  authMiddleware,
  requireRole(["shopkeeper"]),
  async (req, res) => {
    const shop = await ensureShopOwner(req.user.id, req.params.shopId);
    if (!shop) return res.status(403).json({ message: "Not your shop" });

    const products = await Product.find({ shopId: shop._id }).sort({
      createdAt: -1
    });
    res.json(products);
  }
);

/* ============================
   SHOPKEEPER: ADD PRODUCT
============================ */
router.post(
  "/:shopId",
  authMiddleware,
  requireRole(["shopkeeper"]),
  upload.single("image"),
  async (req, res) => {
    const shop = await ensureShopOwner(req.user.id, req.params.shopId);
    if (!shop) return res.status(403).json({ message: "Not your shop" });

    const {
      name,
      price,
      unit = "pcs",
      stock = 0,
      description,
      whyPurchase,
      masterProductId
    } = req.body;

    if (!name || !price) {
      return res.status(400).json({ message: "Name & price required" });
    }

    let verificationStatus = "approved";
    let isAvailable = true;

    if (masterProductId) {
      const master = await MasterProduct.findById(masterProductId);
      if (master?.requiresVerification) {
        verificationStatus = "pending";
        isAvailable = false;
      }
    }

    const product = await Product.create({
      shopId: shop._id,
      name,
      price,
      unit,
      stock,
      description,
      whyPurchase,
      imageUrl: req.file ? `/uploads/products/${req.file.filename}` : "",
      verificationStatus,
      isAvailable
    });

    // 🔴 realtime broadcast
    req.io?.to(`shop_${shop._id}`).emit("productAdded", product);

    res.status(201).json(product);
  }
);

/* ============================
   UPDATE PRODUCT
============================ */
router.put(
  "/item/:id",
  authMiddleware,
  requireRole(["shopkeeper"]),
  upload.single("image"),
  async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Not found" });

    const shop = await ensureShopOwner(req.user.id, product.shopId);
    if (!shop) return res.status(403).json({ message: "Not your shop" });

    const updates = { ...req.body };
    if (req.file) {
      updates.imageUrl = `/uploads/products/${req.file.filename}`;
    }

    const updated = await Product.findByIdAndUpdate(
      product._id,
      updates,
      { new: true }
    );

    res.json(updated);
  }
);

/* ============================
   DELETE PRODUCT
============================ */
router.delete(
  "/item/:id",
  authMiddleware,
  requireRole(["shopkeeper"]),
  async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Not found" });

    const shop = await ensureShopOwner(req.user.id, product.shopId);
    if (!shop) return res.status(403).json({ message: "Not your shop" });

    await product.deleteOne();
    res.json({ ok: true });
  }
);

/* ============================
   PUBLIC PRODUCTS
============================ */
router.get("/public/:shopId", async (req, res) => {
  const products = await Product.find({
    shopId: req.params.shopId,
    verificationStatus: "approved",
    isAvailable: true,
    stock: { $gt: 0 }
  });
  res.json(products);
});

module.exports = router;
