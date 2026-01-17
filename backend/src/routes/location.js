const express = require("express");
const User = require("../models/User");

const router = express.Router();

// Single location update
router.post("/update", async (req, res) => {
  const { lat, lng, accuracy, timestamp, source, enabled } = req.body;

  const update = {
    "locationSharing.enabled": enabled !== undefined ? enabled : true,
    "locationSharing.lastSharedAt": new Date(),
    "locationSharing.lastLocation": {
      lat,
      lng,
      accuracy,
      source,
      timestamp: timestamp ? new Date(timestamp) : new Date()
    }
  };

  const user = await User.findByIdAndUpdate(
    req.user.id,
    update,
    { new: true }
  ).select("-passwordHash");
  res.json({ ok: true, user });
});

router.delete("/history", async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user.id,
    {
      locationSharing: {
        enabled: false,
        lastSharedAt: null,
        lastLocation: null
      }
    },
    { new: true }
  ).select("-passwordHash");
  res.json({ ok: true, user });
});

module.exports = router;
