const express = require("express");
const User = require("../models/User");

const router = express.Router();

router.get("/profile", async (req, res) => {
  const user = await User.findById(req.user.id).select("-passwordHash");
  res.json(user);
});

router.put("/profile", async (req, res) => {
  const updates = req.body;
  delete updates.passwordHash;
  const user = await User.findByIdAndUpdate(
    req.user.id,
    updates,
    { new: true }
  ).select("-passwordHash");
  res.json(user);
});

module.exports = router;
