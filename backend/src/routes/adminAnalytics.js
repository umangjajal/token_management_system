const express = require("express");
const { staffingHeatmap } = require("../engine/analyticsEngine");
const { authMiddleware, requireRole } = require("../middleware/auth");

const router = express.Router();

router.get(
  "/heatmap/:shopId",
  authMiddleware,
  requireRole(["admin"]),
  async (req, res) => {
    const data = await staffingHeatmap(req.params.shopId);
    res.json(data);
  }
);

module.exports = router;
